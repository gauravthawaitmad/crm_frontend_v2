'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Activity } from 'lucide-react'
import type { RecentActivityItem } from '@/hooks/useDashboard'
import { STAGE_CONFIG, formatRelativeTime } from '@/lib/stages'

interface RecentActivityProps {
  items?: RecentActivityItem[]
  isLoading?: boolean
}

export function RecentActivity({ items, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <Skeleton className="h-5 w-36 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      </div>

      {!items || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 text-center">
          <Activity className="size-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-1 overflow-y-auto max-h-72 pr-1">
          {items.map((item, idx) => {
            const stageConfig = STAGE_CONFIG[item.conversion_stage as keyof typeof STAGE_CONFIG]
            return (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/40 transition-colors"
              >
                {/* Stage dot */}
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${stageConfig?.dot ?? 'bg-muted-foreground'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.partner_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${stageConfig?.color ?? 'bg-muted text-muted-foreground'}`}
                    >
                      {stageConfig?.label ?? item.conversion_stage}
                    </span>
                    {item.changed_by && item.changed_by !== 'Unknown' && (
                      <span className="text-xs text-muted-foreground truncate">
                        by {item.changed_by}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-1">
                  {formatRelativeTime(item.changed_at)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
