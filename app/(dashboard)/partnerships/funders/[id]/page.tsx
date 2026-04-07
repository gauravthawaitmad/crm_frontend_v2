'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { FUNDER_CONFIG } from '@/lib/partner-configs/funder.config'
import { useFunderDetail, useUpdateFunderStage } from '@/hooks/useFunder'
import { PocTabContent } from '@/components/modules/poc/PocTabContent'
import { CommentSection } from '@/components/modules/comments/CommentSection'
import { InteractionLog } from '@/components/shared/InteractionLog'
import { StageUpdateModal } from '@/components/shared/StageUpdateModal'
import { FunderOverview } from '@/components/modules/funder/FunderOverview'
import { FunderCommitmentsTab } from '@/components/modules/funder/FunderCommitmentsTab'
import { DeliverablesTab } from '@/components/modules/funder/DeliverablesTab'
import type { FunderDetail, UpdateFunderStageInput } from '@/types/funder'

const TABS = FUNDER_CONFIG.detailTabs

export default function FunderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('overview')
  const [stageModalOpen, setStageModalOpen] = useState(false)

  const { data, isLoading, isError } = useFunderDetail(id)
  const stageMutation = useUpdateFunderStage(id)

  const funder = data?.result as FunderDetail | undefined
  const currentStage = funder?.currentStage ?? ''
  const stageConfig = FUNDER_CONFIG.stages.find((s) => s.id === currentStage)
  const coName = funder?.assigned_co?.user_display_name ?? 'Unassigned'

  async function handleStageUpdate(payload: { stage: string; notes?: string; drop_reason?: string }) {
    try {
      await stageMutation.mutateAsync(payload as UpdateFunderStageInput)
      toast.success('Stage updated')
      setStageModalOpen(false)
    } catch {
      toast.error('Failed to update stage')
    }
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Funder not found.</p>
        <Button variant="outline" onClick={() => router.push('/partnerships/funders')}>Back to list</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <button
        onClick={() => router.push('/partnerships/funders')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Funders
      </button>

      <div className="flex gap-6 items-start">
        {/* ── LEFT COLUMN ── */}
        <div className="w-80 shrink-0 space-y-4">
          {/* Info card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-stone-900 leading-tight">
                  {funder?.name ?? 'Unknown Funder'}
                </h1>

                {stageConfig && (
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                    stageConfig.bg, stageConfig.text
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', stageConfig.dot)} />
                    {stageConfig.label}
                  </span>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-wide text-stone-400">CO</span>
                  <span className="text-foreground">{coName}</span>
                </div>

                {funder?.city && (
                  <div className="text-sm text-muted-foreground">
                    {funder.city.name}, {funder.state?.name}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stage journey */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-3">Stage Journey</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-5 w-full" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {FUNDER_CONFIG.stages
                  .filter((s) => !s.isDropped)
                  .map((stage, idx, arr) => {
                    const isCurrent = stage.id === currentStage
                    const isPast = currentStage
                      ? arr.findIndex((s) => s.id === currentStage) > idx
                      : false
                    return (
                      <div key={stage.id} className="flex items-center gap-2.5">
                        <span className={cn(
                          'size-2.5 rounded-full shrink-0',
                          isCurrent ? 'bg-orange-500' : isPast ? stage.dot : 'bg-stone-200'
                        )} />
                        <span className={cn(
                          'text-xs',
                          isCurrent ? 'font-semibold text-foreground' :
                          isPast ? 'text-muted-foreground' : 'text-stone-300'
                        )}>
                          {stage.label}
                        </span>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isLoading && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-sm">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Quick Actions</h3>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 border-primary text-primary hover:bg-primary/5"
                onClick={() => setStageModalOpen(true)}
              >
                <Pencil className="size-3.5" />
                Update Stage
              </Button>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="border-b border-border mb-5">
            <nav className="flex gap-0 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
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
          {isLoading && activeTab === 'overview' && (
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          )}

          {!isLoading && funder && activeTab === 'overview' && (
            <FunderOverview
              data={funder}
              onTabChange={setActiveTab}
            />
          )}

          {activeTab === 'contacts' && (
            <PocTabContent partnerId={parseInt(id, 10)} />
          )}

          {activeTab === 'interactions' && (
            <InteractionLog partnerId={parseInt(id, 10)} />
          )}

          {activeTab === 'commitments' && funder && (
            <FunderCommitmentsTab
              partnerId={funder.id}
              commitments={funder.commitments ?? []}
            />
          )}

          {activeTab === 'deliverables' && funder && (
            <DeliverablesTab
              partnerId={funder.id}
              commitments={funder.commitments ?? []}
            />
          )}

          {activeTab === 'school-tags' && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {funder?.tagged_schools?.length
                  ? `${funder.tagged_schools.length} linked school(s)`
                  : 'No schools linked yet.'}
              </p>
            </div>
          )}

          {activeTab === 'comments' && (
            <CommentSection partnerId={parseInt(id, 10)} />
          )}
        </div>
      </div>

      {/* Stage Update Modal */}
      <StageUpdateModal
        isOpen={stageModalOpen}
        onClose={() => setStageModalOpen(false)}
        config={FUNDER_CONFIG}
        partner={funder ? { currentStage: funder.currentStage } : {}}
        onSubmitStage={handleStageUpdate}
      />
    </div>
  )
}
