'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { PocTabContent } from '@/components/modules/poc/PocTabContent'
import { CommentSection } from '@/components/modules/comments/CommentSection'
import { InteractionLog } from '@/components/shared/InteractionLog'
import type { PartnerTypeConfig } from '@/lib/partner-configs/types'

interface PartnerDetailPageProps {
  config: PartnerTypeConfig
  partnerId: string
  partner?: Record<string, unknown>
  loading?: boolean
  renderOverview?: (data: Record<string, unknown>) => React.ReactNode
  renderCommitments?: (data: Record<string, unknown>) => React.ReactNode
  renderDeliverables?: (data: Record<string, unknown>) => React.ReactNode
  renderEngagements?: (data: Record<string, unknown>) => React.ReactNode
  renderSchoolTags?: (data: Record<string, unknown>) => React.ReactNode
}

export function PartnerDetailPage({
  config,
  partnerId,
  partner,
  loading = false,
  renderOverview,
  renderCommitments,
  renderDeliverables,
  renderEngagements,
  renderSchoolTags,
}: PartnerDetailPageProps) {
  const [activeTab, setActiveTab] = useState(config.detailTabs[0]?.id ?? 'overview')
  const numericId = parseInt(partnerId, 10)

  // Derive display info from partner data
  const partnerName = typeof partner?.partner_name === 'string' ? partner.partner_name : undefined
  const currentStage = typeof partner?.currentStage === 'string' ? partner.currentStage : undefined
  const stageConfig = currentStage
    ? config.stages.find((s) => s.id === currentStage)
    : undefined

  // CO info
  const latestCo = partner?.latestCo as { co?: { user_display_name?: string; user_role?: string } } | undefined
  const coName = latestCo?.co?.user_display_name ?? null

  return (
    <div className="flex gap-6 items-start">

      {/* ── LEFT COLUMN ──────────────────────────────────────────────────────── */}
      <div className="w-80 shrink-0 space-y-4">

        {/* Card 1 — Partner Info */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-stone-900 leading-tight">
                {partnerName ?? 'Unknown Partner'}
              </h1>

              {stageConfig && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                    stageConfig.bg,
                    stageConfig.text
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', stageConfig.dot)} />
                  {stageConfig.label}
                </span>
              )}

              {/* Assigned CO */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wide text-stone-400">CO</span>
                <span className="text-foreground">{coName ?? 'Unassigned'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Card 2 — Stage Journey placeholder */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Stage Journey</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {config.stages
                .filter((s) => !s.isDropped)
                .map((stage, idx, arr) => {
                  const isCurrent = stage.id === currentStage
                  const isPast = currentStage
                    ? arr.findIndex((s) => s.id === currentStage) > idx
                    : false

                  return (
                    <div key={stage.id} className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'size-2.5 rounded-full shrink-0',
                          isCurrent
                            ? 'bg-orange-500'
                            : isPast
                              ? stage.dot
                              : 'bg-stone-200'
                        )}
                      />
                      <span
                        className={cn(
                          'text-xs',
                          isCurrent
                            ? 'font-semibold text-foreground'
                            : isPast
                              ? 'text-muted-foreground'
                              : 'text-stone-300'
                        )}
                      >
                        {stage.label}
                      </span>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Tab bar */}
        <div className="border-b border-border mb-5">
          <nav className="flex gap-0">
            {config.detailTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-xl w-full" />
              <Skeleton className="h-24 rounded-xl w-full" />
            </div>
          ) : partner && renderOverview ? (
            renderOverview(partner)
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Overview content coming in Phase D</p>
            </div>
          )
        )}

        {activeTab === 'contacts' && numericId > 0 && (
          <PocTabContent partnerId={numericId} />
        )}

        {activeTab === 'interactions' && numericId > 0 && (
          <InteractionLog partnerId={numericId} />
        )}

        {activeTab === 'comments' && numericId > 0 && (
          <CommentSection partnerId={numericId} />
        )}

        {activeTab === 'commitments' && (
          partner && renderCommitments ? (
            renderCommitments(partner)
          ) : (
            <div className="p-4 text-muted-foreground text-sm">No commitments component provided.</div>
          )
        )}

        {activeTab === 'deliverables' && (
          partner && renderDeliverables ? (
            renderDeliverables(partner)
          ) : (
            <div className="p-4 text-muted-foreground text-sm">No deliverables component provided.</div>
          )
        )}

        {activeTab === 'engagements' && (
          partner && renderEngagements ? (
            renderEngagements(partner)
          ) : (
            <div className="p-4 text-muted-foreground text-sm">No engagements component provided.</div>
          )
        )}

        {activeTab === 'school-tags' && (
          partner && renderSchoolTags ? (
            renderSchoolTags(partner)
          ) : (
            <div className="p-4 text-muted-foreground text-sm">School tags coming soon.</div>
          )
        )}

        {!['overview', 'contacts', 'interactions', 'comments', 'commitments', 'deliverables', 'engagements', 'school-tags'].includes(activeTab) && (
          <div className="p-4 text-muted-foreground text-sm">
            Coming soon.
          </div>
        )}
      </div>
    </div>
  )
}
