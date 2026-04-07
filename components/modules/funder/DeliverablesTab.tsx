'use client'

import { useState } from 'react'
import {
  Plus, FileText, BarChart2, MapPin, Award, Package,
  CheckCircle2, Clock, AlertCircle, Upload, ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useUpdateDeliverable, useDeleteDeliverable, useUploadDeliverableDoc } from '@/hooks/useFunder'
import { AddDeliverableModal } from './AddDeliverableModal'
import type { FunderCommitment, FunderDeliverable, DeliverableStatus } from '@/types/funder'

interface DeliverablesTabProps {
  partnerId: number
  commitments: FunderCommitment[]
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  impact_report: FileText,
  outcome_data: BarChart2,
  site_visit: MapPin,
  branding: Award,
  other: Package,
}

const TYPE_LABELS: Record<string, string> = {
  impact_report: 'Impact Report',
  outcome_data: 'Outcome Data',
  site_visit: 'Site Visit',
  branding: 'Branding',
  other: 'Other',
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function DeliverableCard({
  deliverable,
  partnerId,
}: {
  deliverable: FunderDeliverable
  partnerId: number
}) {
  const [expanded, setExpanded] = useState(false)
  const [fileRef, setFileRef] = useState<HTMLInputElement | null>(null)
  const updateMutation = useUpdateDeliverable(partnerId)
  const deleteMutation = useDeleteDeliverable(partnerId)
  const uploadMutation = useUploadDeliverableDoc(partnerId)

  const Icon = TYPE_ICONS[deliverable.deliverable_type] ?? Package
  const days = daysUntil(deliverable.due_date)
  const isAccepted = deliverable.status === 'accepted'
  const isOverdue = deliverable.status === 'overdue'
  const isPending = deliverable.status === 'pending'
  const isSubmitted = deliverable.status === 'submitted'

  async function handleMarkSubmitted() {
    try {
      await updateMutation.mutateAsync({
        deliverableId: deliverable.id,
        data: {
          status: 'submitted' as DeliverableStatus,
          delivered_date: new Date().toISOString().slice(0, 10),
        },
      })
      toast.success('Marked as submitted')
    } catch {
      toast.error('Failed to update')
    }
  }

  async function handleMarkAccepted() {
    try {
      await updateMutation.mutateAsync({
        deliverableId: deliverable.id,
        data: { status: 'accepted' as DeliverableStatus },
      })
      toast.success('Marked as accepted')
    } catch {
      toast.error('Failed to update')
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this deliverable?')) return
    try {
      await deleteMutation.mutateAsync(deliverable.id)
      toast.success('Deliverable deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await uploadMutation.mutateAsync({ deliverableId: deliverable.id, file })
      toast.success('Document uploaded')
    } catch {
      toast.error('Failed to upload')
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-4 space-y-2 transition-all',
        isOverdue ? 'border-l-4 border-l-red-400 border-t-border border-r-border border-b-border' :
        isPending ? 'border-border' :
        isSubmitted ? 'border-border' :
        isAccepted ? 'border-border opacity-80' : 'border-border'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className={cn(
          'p-1.5 rounded-lg shrink-0 mt-0.5',
          isOverdue ? 'bg-red-100 text-red-600' :
          isPending ? 'bg-blue-100 text-blue-600' :
          isSubmitted ? 'bg-amber-100 text-amber-600' :
          'bg-green-100 text-green-600'
        )}>
          <Icon className="size-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">
              {TYPE_LABELS[deliverable.deliverable_type] ?? deliverable.deliverable_type}
            </span>
          </div>
          <p className={cn('text-sm text-foreground mt-0.5', isAccepted ? 'line-clamp-1' : '')}>
            {deliverable.description}
          </p>
        </div>

        {/* Toggle for accepted */}
        {isAccepted && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        )}
      </div>

      {/* Due date */}
      {!isAccepted && (
        <div className="flex items-center gap-1.5 text-xs">
          {isOverdue ? (
            <>
              <AlertCircle className="size-3.5 text-red-500" />
              <span className="text-red-600 font-medium">
                Due {formatDate(deliverable.due_date)} ({Math.abs(days)} days overdue)
              </span>
            </>
          ) : isPending || isSubmitted ? (
            <>
              <Clock className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                Due {formatDate(deliverable.due_date)}
                {days <= 7 && days >= 0 && (
                  <span className="text-amber-600 font-medium ml-1">({days} days left)</span>
                )}
              </span>
            </>
          ) : null}
        </div>
      )}

      {/* Accepted expanded state */}
      {isAccepted && expanded && (
        <div className="space-y-1.5 pt-1">
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="size-3.5" />
            Delivered: {formatDate(deliverable.delivered_date)}
          </p>
          {deliverable.document_url && (
            <a
              href={deliverable.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="size-3" /> View document
            </a>
          )}
          {deliverable.notes && (
            <p className="text-xs text-muted-foreground">{deliverable.notes}</p>
          )}
        </div>
      )}

      {/* Submitted state — show document */}
      {isSubmitted && deliverable.document_url && (
        <a
          href={deliverable.document_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="size-3" /> View document
        </a>
      )}

      {/* Actions */}
      {!isAccepted && (
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {(isPending || isOverdue) && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={handleMarkSubmitted}
              disabled={updateMutation.isPending}
            >
              Mark Submitted
            </Button>
          )}
          {isSubmitted && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-green-300 text-green-700 hover:bg-green-50"
              onClick={handleMarkAccepted}
              disabled={updateMutation.isPending}
            >
              Mark Accepted
            </Button>
          )}
          {isSubmitted && (
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                ref={(el) => setFileRef(el)}
              />
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-primary cursor-pointer">
                <Upload className="size-3" />
                Upload Doc
              </span>
            </label>
          )}
          <button
            onClick={handleDelete}
            className="text-xs text-muted-foreground hover:text-red-500 ml-auto"
            disabled={deleteMutation.isPending}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function DeliverableGroup({
  status,
  label,
  color,
  deliverables,
  partnerId,
}: {
  status: string
  label: string
  color: string
  deliverables: FunderDeliverable[]
  partnerId: number
}) {
  if (deliverables.length === 0) return null
  return (
    <div className="space-y-2">
      <h4 className={cn('text-xs font-semibold uppercase tracking-wide', color)}>
        {label} ({deliverables.length})
      </h4>
      {deliverables.map((d) => (
        <DeliverableCard key={d.id} deliverable={d} partnerId={partnerId} />
      ))}
    </div>
  )
}

export function DeliverablesTab({ partnerId, commitments }: DeliverablesTabProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [filterCommitmentId, setFilterCommitmentId] = useState<string>('all')

  const allDeliverables = commitments.flatMap((c) =>
    (c.deliverables ?? []).map((d) => ({ ...d }))
  )

  const filtered = filterCommitmentId === 'all'
    ? allDeliverables
    : allDeliverables.filter((d) => String(d.commitment_id) === filterCommitmentId)

  const overdue = filtered.filter((d) => d.status === 'overdue')
  const pending = filtered.filter((d) => d.status === 'pending')
  const submitted = filtered.filter((d) => d.status === 'submitted')
  const accepted = filtered.filter((d) => d.status === 'accepted')

  const defaultCommitmentId = filterCommitmentId !== 'all'
    ? parseInt(filterCommitmentId)
    : undefined

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <select
          value={filterCommitmentId}
          onChange={(e) => setFilterCommitmentId(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          <option value="all">All commitments</option>
          {commitments.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.cycle_label}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          className="bg-primary hover:bg-primary-dark text-white gap-1 shrink-0"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="size-4" />
          Add Deliverable
        </Button>
      </div>

      {allDeliverables.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No deliverables yet.</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 border-primary text-primary hover:bg-primary/5"
            onClick={() => setShowAdd(true)}
          >
            Add first deliverable
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <DeliverableGroup status="overdue" label="Overdue" color="text-red-600" deliverables={overdue} partnerId={partnerId} />
          <DeliverableGroup status="pending" label="Pending" color="text-blue-600" deliverables={pending} partnerId={partnerId} />
          <DeliverableGroup status="submitted" label="Submitted" color="text-amber-600" deliverables={submitted} partnerId={partnerId} />
          <DeliverableGroup status="accepted" label="Accepted" color="text-green-600" deliverables={accepted} partnerId={partnerId} />
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No deliverables match the selected filter.</p>
          )}
        </div>
      )}

      {showAdd && commitments.length > 0 && (
        <AddDeliverableModal
          partnerId={partnerId}
          commitments={commitments}
          defaultCommitmentId={defaultCommitmentId}
          onClose={() => setShowAdd(false)}
        />
      )}
      {showAdd && commitments.length === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4 text-center space-y-3">
            <p className="text-sm font-medium">Add a commitment first before adding deliverables.</p>
            <Button size="sm" onClick={() => setShowAdd(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  )
}
