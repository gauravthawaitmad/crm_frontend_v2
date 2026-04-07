'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useDashboardFollowUps, type FollowUpItem } from '@/hooks/useInteraction'
import { useDashboardDeliverables } from '@/hooks/useFunder'

// ── Entity type label map ─────────────────────────────────────────────────────

const ENTITY_LABELS: Record<string, string> = {
  school: 'School',
  sourcing: 'Sourcing',
  funder: 'Funder',
  vendor: 'Vendor',
}

// ── Section config ────────────────────────────────────────────────────────────

interface SectionConfig {
  key: 'overdue' | 'today' | 'this_week'
  label: string
  dotColor: string
  textColor: string
  bgColor: string
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'overdue',
    label: 'Overdue',
    dotColor: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  {
    key: 'today',
    label: 'Today',
    dotColor: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  {
    key: 'this_week',
    label: 'This Week',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
]

// ── Follow-up item row ────────────────────────────────────────────────────────

function FollowUpRow({
  item,
  dotColor,
  textColor,
}: {
  item: FollowUpItem
  dotColor: string
  textColor: string
}) {
  const router = useRouter()

  return (
    <div
      className="flex items-start gap-2.5 py-2 border-b border-border last:border-0 cursor-pointer hover:bg-stone-50 rounded-lg px-2 -mx-2 transition-colors"
      onClick={() => router.push(item.partner_url)}
    >
      <span className={cn('mt-1.5 size-2 rounded-full shrink-0', dotColor)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-foreground truncate">{item.partner_name}</span>
          {item.entity_type && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-stone-100 text-stone-500 shrink-0">
              {ENTITY_LABELS[item.entity_type] ?? item.entity_type}
            </span>
          )}
        </div>
        <div className={cn('text-xs font-medium', textColor)}>
          {item.follow_up_date}
          {item.assigned_to && (
            <span className="text-muted-foreground font-normal ml-1">→ {item.assigned_to}</span>
          )}
        </div>
        {item.next_steps && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.next_steps}</p>
        )}
      </div>
    </div>
  )
}

// ── Deliverables section ──────────────────────────────────────────────────────

function DeliverableRow({
  item,
  isOverdue,
}: {
  item: { id: number; partner_id: number; funder_name: string; description: string; due_date: string; status: string }
  isOverdue: boolean
}) {
  const router = useRouter()
  return (
    <div
      className="flex items-start gap-2.5 py-2 border-b border-border last:border-0 cursor-pointer hover:bg-stone-50 rounded-lg px-2 -mx-2 transition-colors"
      onClick={() => router.push(`/partnerships/funders/${item.partner_id}#deliverables`)}
    >
      {isOverdue ? (
        <AlertCircle className="size-3.5 text-red-500 shrink-0 mt-0.5" />
      ) : (
        <Clock className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
      )}
      <div className="min-w-0 flex-1">
        <span className="text-sm font-semibold text-foreground truncate block">{item.funder_name}</span>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
        <p className={cn('text-xs font-medium mt-0.5', isOverdue ? 'text-red-600' : 'text-amber-600')}>
          Due {new Date(item.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function FollowUpWidget() {
  const { data, isLoading } = useDashboardFollowUps()
  const { data: deliverableData } = useDashboardDeliverables()
  const summary = data?.result
  const deliverables = deliverableData?.result

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const total = summary?.total ?? 0
  const isEmpty = total === 0

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Follow-ups</h3>
        <span
          className={cn(
            'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-bold',
            total > 0
              ? 'bg-primary text-white'
              : 'bg-stone-100 text-stone-500'
          )}
        >
          {total}
        </span>
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
          <CheckCircle2 className="size-8 text-green-500" />
          <p className="text-sm font-medium text-green-700">All caught up!</p>
          <p className="text-xs text-muted-foreground">No pending follow-ups</p>
        </div>
      ) : (
        <div className="space-y-4">
          {SECTIONS.map((section) => {
            const items = summary?.[section.key] ?? []
            if (items.length === 0) return null

            return (
              <div key={section.key}>
                <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md mb-1', section.bgColor)}>
                  <span className={cn('size-1.5 rounded-full', section.dotColor)} />
                  <span className={cn('text-xs font-semibold', section.textColor)}>
                    {section.label} ({items.length})
                  </span>
                </div>
                {items.map((item) => (
                  <FollowUpRow
                    key={item.interaction_id}
                    item={item}
                    dotColor={section.dotColor}
                    textColor={section.textColor}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* Deliverables section */}
      {deliverables && (deliverables.overdue.length > 0 || deliverables.due_soon.length > 0) && (
        <div className="mt-5 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Deliverables Due</h3>
            <span className={cn(
              'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-bold',
              deliverables.overdue.length > 0 ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-700'
            )}>
              {deliverables.overdue.length + deliverables.due_soon.length}
            </span>
          </div>
          <div className="space-y-1">
            {deliverables.overdue.map((d) => (
              <DeliverableRow key={d.id} item={d} isOverdue />
            ))}
            {deliverables.due_soon.map((d) => (
              <DeliverableRow key={d.id} item={d} isOverdue={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
