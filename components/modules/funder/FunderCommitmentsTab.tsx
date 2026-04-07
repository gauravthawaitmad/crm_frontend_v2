'use client'

import { useState } from 'react'
import { Plus, Pencil, CalendarDays, FileUp, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useUpdateFunderCommitment, useUploadDeliverableDoc } from '@/hooks/useFunder'
import { AddCommitmentModal } from './AddCommitmentModal'
import { EditCommitmentModal } from './EditCommitmentModal'
import type { FunderCommitment } from '@/types/funder'

interface FunderCommitmentsTabProps {
  partnerId: number
  commitments: FunderCommitment[]
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-stone-100 text-stone-500',
  pending: 'bg-amber-100 text-amber-700',
}

const TYPE_LABELS: Record<string, string> = {
  one_time: 'One-time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
  program_based: 'Program-based',
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CommitmentCard({
  commitment,
  partnerId,
  onEdit,
}: {
  commitment: FunderCommitment
  partnerId: number
  onEdit: () => void
}) {
  const updateMutation = useUpdateFunderCommitment(partnerId)
  const isRecurring = ['monthly', 'quarterly', 'annual'].includes(commitment.commitment_type)
  const overdueDeliverables = (commitment.deliverables ?? []).filter((d) => d.status === 'overdue').length
  const totalDeliverables = (commitment.deliverables ?? []).length

  async function handleMarkInstallment() {
    const newCount = (commitment.received_installments ?? 0) + 1
    try {
      await updateMutation.mutateAsync({
        commitmentId: commitment.id,
        data: { received_installments: newCount },
      })
      toast.success('Installment marked received')
    } catch {
      toast.error('Failed to update installment count')
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-foreground">{commitment.cycle_label}</p>
          {commitment.program_name && (
            <p className="text-xs text-muted-foreground mt-0.5">Program: {commitment.program_name}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {TYPE_LABELS[commitment.commitment_type] ?? commitment.commitment_type}
          </span>
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', STATUS_STYLES[commitment.status] ?? 'bg-stone-100 text-stone-600')}>
            {commitment.status}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div>
        <p className="text-base font-semibold text-foreground">{commitment.amount_description}</p>
        {commitment.amount != null && (
          <p className="text-xl font-bold text-primary mt-0.5">
            ₹{Number(commitment.amount).toLocaleString('en-IN')}
          </p>
        )}
      </div>

      {/* Date range */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="size-3.5" />
        <span>{formatDate(commitment.start_date)} → {formatDate(commitment.end_date)}</span>
      </div>

      {/* Installment progress */}
      {isRecurring && commitment.total_installments != null && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Installments received</span>
            <span className="font-medium text-foreground">
              {commitment.received_installments ?? 0} / {commitment.total_installments}
            </span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width: `${Math.min(100, Math.round(((commitment.received_installments ?? 0) / commitment.total_installments) * 100))}%`,
              }}
            />
          </div>
          {(commitment.received_installments ?? 0) < (commitment.total_installments ?? 0) && commitment.status === 'active' && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 border-primary text-primary hover:bg-primary/5"
              onClick={handleMarkInstallment}
              disabled={updateMutation.isPending}
            >
              Mark installment received
            </Button>
          )}
        </div>
      )}

      {/* Proposal */}
      <div className="flex items-center gap-2">
        {commitment.proposal_document ? (
          <a
            href={commitment.proposal_document}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="size-3" />
            View Proposal
          </a>
        ) : (
          <span className="text-xs text-muted-foreground italic">No proposal uploaded</span>
        )}
      </div>

      {/* Deliverables link */}
      {totalDeliverables > 0 && (
        <p className="text-xs text-muted-foreground">
          {totalDeliverables} deliverable{totalDeliverables !== 1 ? 's' : ''}
          {overdueDeliverables > 0 && (
            <span className="text-red-600 font-medium"> ({overdueDeliverables} overdue)</span>
          )}
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={onEdit}
        >
          <Pencil className="size-3" />
          Edit
        </Button>
      </div>
    </div>
  )
}

export function FunderCommitmentsTab({ partnerId, commitments }: FunderCommitmentsTabProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingCommitment, setEditingCommitment] = useState<FunderCommitment | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          className="bg-primary hover:bg-primary-dark text-white gap-1"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="size-4" />
          Add Commitment
        </Button>
      </div>

      {commitments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No commitments recorded yet.</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 border-primary text-primary hover:bg-primary/5"
            onClick={() => setShowAdd(true)}
          >
            Add first commitment
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {commitments.map((c) => (
            <CommitmentCard
              key={c.id}
              commitment={c}
              partnerId={partnerId}
              onEdit={() => setEditingCommitment(c)}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddCommitmentModal
          partnerId={partnerId}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editingCommitment && (
        <EditCommitmentModal
          partnerId={partnerId}
          commitment={editingCommitment}
          onClose={() => setEditingCommitment(null)}
        />
      )}
    </div>
  )
}
