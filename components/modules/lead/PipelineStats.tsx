'use client'

import { TrendingUp } from 'lucide-react'
import type { Lead } from '@/types/lead'
import { STAGE_CONFIG, LEAD_FILTER_STAGES } from '@/lib/stages'

interface PipelineStatsProps {
  leads: Lead[]
  total: number // server-side total count (all pages)
}

export function PipelineStats({ leads, total }: PipelineStatsProps) {
  // Compute counts from the current page of leads (best effort for stage breakdown)
  const stageBreakdown = LEAD_FILTER_STAGES.map((stage) => ({
    stage,
    count: leads.filter((l) => l.latestAgreement?.conversion_stage === stage).length,
  })).filter((item) => item.count > 0)

  const interestedCount = leads.filter(
    (l) =>
      l.latestAgreement?.conversion_stage === 'interested' ||
      l.latestAgreement?.conversion_stage === 'interested_but_facing_delay'
  ).length

  const droppedCount = leads.filter(
    (l) => l.latestAgreement?.conversion_stage === 'dropped'
  ).length

  return (
    <div className="space-y-4 pb-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Total Leads
          </p>
          <p className="text-2xl font-bold text-foreground mt-2">{total}</p>
          <p className="text-xs text-muted-foreground mt-1">across all stages</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Interested
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-2">{interestedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">+ facing delay (this page)</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            New Leads
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {leads.filter((l) => l.latestAgreement?.conversion_stage === 'new').length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">awaiting first contact</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Dropped
          </p>
          <p className="text-2xl font-bold text-red-600 mt-2">{droppedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">this page</p>
        </div>
      </div>

      {/* Stage Breakdown */}
      {stageBreakdown.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Stage Breakdown (current page)</h3>
          </div>
          <div className="space-y-3">
            {stageBreakdown.map((item) => {
              const config = STAGE_CONFIG[item.stage]
              const percentage =
                leads.length > 0 ? ((item.count / leads.length) * 100).toFixed(0) : '0'
              return (
                <div key={item.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className="text-sm font-medium text-foreground">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{percentage}%</span>
                      <span className="text-sm font-semibold">{item.count}</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${config.dot} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
