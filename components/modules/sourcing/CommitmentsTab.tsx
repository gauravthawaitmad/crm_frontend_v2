'use client'

import { useState } from 'react'
import { Plus, Pencil, CalendarDays, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AddCommitmentModal } from './AddCommitmentModal'
import { EditCommitmentModal } from './EditCommitmentModal'
import type { SourcingPartnerFull, PartnerCommitment } from '@/types/sourcing'

interface CommitmentsTabProps {
  data: SourcingPartnerFull
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-stone-100 text-stone-500',
  pending: 'bg-amber-100 text-amber-700',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CommitmentRow({
  commitment,
  onEdit,
}: {
  commitment: PartnerCommitment
  onEdit: (c: PartnerCommitment) => void
}) {
  const committed = commitment.committed_count ?? 0
  const delivered = commitment.delivered_count ?? 0
  const pct = committed > 0 ? Math.round((delivered / committed) * 100) : 0
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-foreground">{commitment.cycle_label ?? 'Unnamed Cycle'}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {(commitment.start_date || commitment.end_date) && (
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3" />
                {formatDate(commitment.start_date)} – {formatDate(commitment.end_date)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', STATUS_STYLES[commitment.status] ?? 'bg-stone-100 text-stone-600')}>
            {commitment.status}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(commitment)}
            title="Edit commitment"
          >
            <Pencil className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-muted/30 p-3">
          <p className="text-2xl font-bold text-foreground">{committed}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Committed</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3">
          <p className="text-2xl font-bold text-foreground">{delivered}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Delivered</p>
        </div>
      </div>

      {committed > 0 && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1"><TrendingUp className="size-3" /> Delivery rate</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', barColor)}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {commitment.commitment_notes && (
        <p className="text-xs text-muted-foreground border-t border-border pt-2">{commitment.commitment_notes}</p>
      )}
    </div>
  )
}

export function CommitmentsTab({ data }: CommitmentsTabProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editCommitment, setEditCommitment] = useState<PartnerCommitment | null>(null)

  const commitments = data.commitments ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {commitments.length} Commitment{commitments.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="size-3" /> Add Commitment
        </Button>
      </div>

      {commitments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 bg-muted rounded-full mb-3">
            <TrendingUp className="size-5 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm text-foreground">No commitments recorded yet</p>
          <p className="text-xs text-muted-foreground mt-1">Track volunteer cycles and delivery rates here.</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setAddOpen(true)}>
            <Plus className="size-3 mr-1" /> Add first commitment
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {commitments.map((c) => (
            <CommitmentRow key={c.id} commitment={c} onEdit={setEditCommitment} />
          ))}
        </div>
      )}

      <AddCommitmentModal
        partnerId={data.id}
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <EditCommitmentModal
        partnerId={data.id}
        commitment={editCommitment}
        isOpen={!!editCommitment}
        onClose={() => setEditCommitment(null)}
      />
    </div>
  )
}
