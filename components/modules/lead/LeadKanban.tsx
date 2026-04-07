'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KanbanBoard, type KanbanColumn } from '@/components/shared/KanbanBoard'
import { LeadForm } from '@/components/modules/lead/LeadForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { STAGE_CONFIG, LEAD_FILTER_STAGES, getInitials, getAvatarColor, formatRelativeTime } from '@/lib/stages'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Lead, ConversionStage } from '@/types/lead'

// ── Column border-left colors (stronger than STAGE_CONFIG borders) ─────────────

const COLUMN_BORDER: Record<ConversionStage, string> = {
  new: 'border-l-blue-400',
  first_conversation: 'border-l-purple-400',
  interested: 'border-l-amber-400',
  interested_but_facing_delay: 'border-l-orange-400',
  not_interested: 'border-l-slate-400',
  converted: 'border-l-green-400',
  dropped: 'border-l-red-400',
}

// ── Blocked targets (cannot drag TO these) ────────────────────────────────────

const BLOCKED_TARGETS = new Set<string>(['converted', 'new'])

// ── Lead card ─────────────────────────────────────────────────────────────────

interface LeadCardProps {
  lead: Lead
}

function LeadCard({ lead }: LeadCardProps) {
  const router = useRouter()
  const coName = lead.latestCo?.co?.user_display_name ?? ''
  const city = lead.city?.city_name ?? ''
  const state = lead.state?.state_name ?? ''
  const location = [city, state].filter(Boolean).join(', ')
  const stage = lead.latestAgreement?.conversion_stage
  const stageConfig = stage ? STAGE_CONFIG[stage] : null

  return (
    <div
      onClick={() => router.push(`/lead/${lead.id}`)}
      className={cn(
        'bg-white rounded-lg p-3 shadow-sm border border-stone-100',
        'hover:ring-1 hover:ring-orange-300 transition-all',
        'cursor-pointer select-none'
      )}
    >
      {/* Partner name */}
      <p className="text-sm font-semibold text-stone-900 truncate leading-tight mb-1">
        {lead.partner_name}
      </p>

      {/* Location */}
      {location && (
        <p className="text-xs text-stone-500 truncate mb-2">{location}</p>
      )}

      {/* Lead source badge */}
      {lead.lead_source && (
        <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 mb-2">
          {lead.lead_source}
        </span>
      )}

      {/* Bottom row — CO avatar + name + last updated */}
      <div className="flex items-center gap-1.5 mt-1">
        {coName ? (
          <>
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0',
                getAvatarColor(coName)
              )}
            >
              {getInitials(coName)}
            </div>
            <span className="text-xs text-stone-500 truncate flex-1">{coName}</span>
          </>
        ) : (
          <span className="text-xs text-stone-400 flex-1">Unassigned</span>
        )}
        <span className="text-xs text-stone-400 shrink-0">
          {formatRelativeTime(lead.updatedAt)}
        </span>
      </div>

      {/* Stage badge — shown only in drag overlay (useful visual context) */}
      {stageConfig && (
        <div className={cn('mt-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block', stageConfig.color)}>
          {stageConfig.label}
        </div>
      )}
    </div>
  )
}

// ── LeadKanban ────────────────────────────────────────────────────────────────

interface PendingMove {
  leadId: string
  fromStage: string
  toStage: ConversionStage
  lead: Lead
}

interface LeadKanbanProps {
  leads: Lead[]
  search?: string
}

export function LeadKanban({ leads, search }: LeadKanbanProps) {
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null)

  // Filter by search client-side
  const filtered = search
    ? leads.filter((l) =>
        l.partner_name.toLowerCase().includes(search.toLowerCase())
      )
    : leads

  // Group leads by their current conversion_stage
  const grouped = LEAD_FILTER_STAGES.reduce<Record<string, Lead[]>>((acc, stage) => {
    acc[stage] = filtered.filter(
      (l) => (l.latestAgreement?.conversion_stage ?? 'new') === stage
    )
    return acc
  }, {})

  // Build columns for KanbanBoard
  const columns: KanbanColumn[] = LEAD_FILTER_STAGES.map((stage) => ({
    id: stage,
    label: STAGE_CONFIG[stage].label,
    borderColor: COLUMN_BORDER[stage],
    dotColor: STAGE_CONFIG[stage].dot,
    items: grouped[stage] as unknown as KanbanColumn['items'],
  }))

  function handleCardMove(itemId: string, fromColumnId: string, toColumnId: string) {
    // Block invalid targets
    if (BLOCKED_TARGETS.has(toColumnId)) {
      toast.info('Use the Edit button to convert or reopen leads')
      return
    }

    const lead = leads.find((l) => String(l.id) === itemId)
    if (!lead) return

    setPendingMove({
      leadId: itemId,
      fromStage: fromColumnId,
      toStage: toColumnId as ConversionStage,
      lead,
    })
  }

  function handleFormSuccess() {
    if (pendingMove) {
      toast.success(
        `${pendingMove.lead.partner_name} moved to ${STAGE_CONFIG[pendingMove.toStage].label}`
      )
    }
    setPendingMove(null)
  }

  function handleFormCancel() {
    // Card automatically stays in original column — no DB change = no re-render change
    setPendingMove(null)
  }

  return (
    <>
      <KanbanBoard
        columns={columns}
        renderCard={(item) => <LeadCard lead={item as unknown as Lead} />}
        onCardMove={handleCardMove}
      />

      {/* Stage transition form — required fields must be filled before move commits */}
      <Dialog
        open={pendingMove !== null}
        onOpenChange={(open) => { if (!open) handleFormCancel() }}
      >
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Move to {pendingMove ? STAGE_CONFIG[pendingMove.toStage].label : ''}
              {pendingMove && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  — {pendingMove.lead.partner_name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {pendingMove && (
            <LeadForm
              mode="update"
              lead={pendingMove.lead}
              forcedTargetStage={pendingMove.toStage}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
