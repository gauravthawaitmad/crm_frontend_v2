'use client'

import { useState } from 'react'
import { Globe, AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FunderDetail, FunderCommitment } from '@/types/funder'
import { AddCommitmentModal } from './AddCommitmentModal'

interface FunderOverviewProps {
  data: FunderDetail
  onTabChange?: (tab: string) => void
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const FUNDER_TYPE_LABELS: Record<string, string> = {
  corporate: 'Corporate / Company',
  individual: 'Individual Donor',
  grant: 'Grant / Foundation',
  group: 'Group / Community',
}

const COMMITMENT_TYPE_LABELS: Record<string, string> = {
  one_time: 'One-time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
  program_based: 'Program-based',
}

function DeliverableSummary({
  commitments,
  onViewAll,
}: {
  commitments: FunderCommitment[]
  onViewAll?: () => void
}) {
  const allDeliverables = commitments.flatMap((c) => c.deliverables ?? [])
  if (allDeliverables.length === 0) return null

  const counts = {
    pending: allDeliverables.filter((d) => d.status === 'pending').length,
    overdue: allDeliverables.filter((d) => d.status === 'overdue').length,
    submitted: allDeliverables.filter((d) => d.status === 'submitted').length,
    accepted: allDeliverables.filter((d) => d.status === 'accepted').length,
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Deliverables</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-primary hover:underline"
          >
            View all →
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Pending', count: counts.pending, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Overdue', count: counts.overdue, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Submitted', count: counts.submitted, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Accepted', count: counts.accepted, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={cn('rounded-lg p-2.5 text-center', bg)}>
            <p className={cn('text-xl font-bold', color)}>{count}</p>
            <p className={cn('text-xs font-medium mt-0.5', color)}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FunderOverview({ data, onTabChange }: FunderOverviewProps) {
  const [showAddCommitment, setShowAddCommitment] = useState(false)

  const activeCommitment = data.commitments.find(
    (c) => c.status === 'active' || c.status === 'pending'
  ) ?? data.commitments[0]

  return (
    <div className="space-y-4">

      {/* Section 1 — Funder Details */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Funder Details</h3>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {data.funder_type && (
            <div>
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-0.5">Type</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                {FUNDER_TYPE_LABELS[data.funder_type] ?? data.funder_type}
              </span>
            </div>
          )}

          {data.city && (
            <div>
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-0.5">Location</p>
              <p className="text-foreground">{data.city.name}, {data.state?.name}</p>
            </div>
          )}

          {data.website && (
            <div className="col-span-2">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-0.5">Website</p>
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
              >
                <Globe className="size-3.5" />
                {data.website}
                <ExternalLink className="size-3" />
              </a>
            </div>
          )}
        </div>

        {data.notes && (
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{data.notes}</p>
          </div>
        )}
      </div>

      {/* Section 2 — Active Commitment Summary */}
      {!activeCommitment ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground">No commitment recorded yet</p>
          <Button
            size="sm"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5"
            onClick={() => setShowAddCommitment(true)}
          >
            Add Commitment
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Active Commitment</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {COMMITMENT_TYPE_LABELS[activeCommitment.commitment_type] ?? activeCommitment.commitment_type}
            </span>
          </div>

          {/* Renewal alert */}
          {activeCommitment.renewal_flag && activeCommitment.end_date && (
            <div className="flex items-start gap-2.5 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2.5">
              <AlertTriangle className="size-4 text-orange-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-orange-700">
                  Renewal due in {daysUntil(activeCommitment.end_date)} days
                </p>
                <p className="text-xs text-orange-600 mt-0.5">
                  This commitment ends on {formatDate(activeCommitment.end_date)}
                </p>
              </div>
            </div>
          )}

          <div>
            <p className="text-lg font-bold text-foreground">{activeCommitment.amount_description}</p>
            {activeCommitment.amount != null && (
              <p className="text-2xl font-bold text-primary mt-1">
                ₹{Number(activeCommitment.amount).toLocaleString('en-IN')}
              </p>
            )}
          </div>

          {activeCommitment.program_name && (
            <p className="text-xs text-muted-foreground">
              Program: <span className="font-medium text-foreground">{activeCommitment.program_name}</span>
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(activeCommitment.start_date)}</span>
            <span>→</span>
            <span>{formatDate(activeCommitment.end_date)}</span>
            <span className="ml-auto font-medium">
              {activeCommitment.cycle_label}
            </span>
          </div>

          {/* Installment progress for recurring types */}
          {activeCommitment.total_installments != null && activeCommitment.total_installments > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Installments received</span>
                <span className="font-medium text-foreground">
                  {activeCommitment.received_installments} / {activeCommitment.total_installments}
                </span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${Math.round((activeCommitment.received_installments / activeCommitment.total_installments) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 3 — Deliverables Summary */}
      <DeliverableSummary
        commitments={data.commitments}
        onViewAll={onTabChange ? () => onTabChange('deliverables') : undefined}
      />

      {showAddCommitment && (
        <AddCommitmentModal
          partnerId={data.id}
          onClose={() => setShowAddCommitment(false)}
        />
      )}
    </div>
  )
}
