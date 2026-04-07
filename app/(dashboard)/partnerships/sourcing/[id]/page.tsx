'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, RefreshCw, Loader2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { SOURCING_CONFIG } from '@/lib/partner-configs/sourcing.config'
import { useSourcingDetail, useUpdateSourcingStage, useReactivateSourcing } from '@/hooks/useSourcing'
import { PocTabContent } from '@/components/modules/poc/PocTabContent'
import { CommentSection } from '@/components/modules/comments/CommentSection'
import { InteractionLog } from '@/components/shared/InteractionLog'
import { StageUpdateModal } from '@/components/shared/StageUpdateModal'
import { SourcingOverview } from '@/components/modules/sourcing/SourcingOverview'
import { CommitmentsTab } from '@/components/modules/sourcing/CommitmentsTab'
import { EditSourcingModal } from '@/components/modules/sourcing/EditSourcingModal'
import type { SourcingPartnerFull, UpdateSourcingStageInput } from '@/types/sourcing'

const TABS = SOURCING_CONFIG.detailTabs

export default function SourcingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const partnerId = parseInt(id, 10)
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('overview')
  const [stageModalOpen, setStageModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const { data, isLoading, isError } = useSourcingDetail(partnerId)
  const stageMutation = useUpdateSourcingStage(partnerId)
  const reactivateMutation = useReactivateSourcing(partnerId)

  const partner = data?.result as SourcingPartnerFull | undefined
  const currentStage = partner?.currentStage ?? ''
  const stageConfig = SOURCING_CONFIG.stages.find((s) => s.id === currentStage)
  const isDropped = stageConfig?.isDropped ?? false

  async function handleStageUpdate(payload: { stage: string; notes?: string; drop_reason?: string }) {
    try {
      await stageMutation.mutateAsync(payload as UpdateSourcingStageInput)
      toast.success('Stage updated')
      setStageModalOpen(false)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update stage'
      toast.error(msg)
      throw e
    }
  }

  async function handleReactivate() {
    try {
      await reactivateMutation.mutateAsync({})
      toast.success('Partner reactivated to Identified')
    } catch {
      toast.error('Failed to reactivate')
    }
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Partner not found or failed to load.</p>
        <Button variant="outline" onClick={() => router.push('/partnerships/sourcing')}>Back to list</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push('/partnerships/sourcing')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" /> Sourcing Partners
      </button>

      <div className="flex gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="w-80 shrink-0 space-y-4">
          {/* Info card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-stone-900 leading-tight">{partner?.partner_name ?? '—'}</h1>
                {stageConfig && (
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', stageConfig.bg, stageConfig.text)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', stageConfig.dot)} />
                    {stageConfig.label}
                  </span>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-wide text-stone-400">CO</span>
                  <span>{partner?.latestCo?.co?.user_display_name ?? 'Unassigned'}</span>
                </div>
                {(partner?.city?.city_name || partner?.state?.state_name) && (
                  <p className="text-sm text-muted-foreground">
                    {[partner?.city?.city_name, partner?.state?.state_name].filter(Boolean).join(', ')}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Stage Journey */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-3">Stage Journey</h3>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-5 w-full" />)}</div>
            ) : (
              <div className="space-y-2">
                {SOURCING_CONFIG.stages.filter((s) => !s.isDropped).map((stage, idx, arr) => {
                  const isCurrent = stage.id === currentStage
                  const currentIdx = arr.findIndex((s) => s.id === currentStage)
                  const isPast = currentIdx >= 0 && idx < currentIdx
                  return (
                    <div key={stage.id} className="flex items-center gap-2.5">
                      <span className={cn('size-2.5 rounded-full shrink-0',
                        isCurrent ? 'bg-orange-500' : isPast ? stage.dot : 'bg-stone-200')} />
                      <span className={cn('text-xs',
                        isCurrent ? 'font-semibold text-foreground' : isPast ? 'text-muted-foreground' : 'text-stone-300')}>
                        {stage.label}
                      </span>
                    </div>
                  )
                })}
                {isDropped && (
                  <div className="flex items-center gap-2.5">
                    <span className="size-2.5 rounded-full shrink-0 bg-red-400" />
                    <span className="text-xs font-semibold text-red-600">Dropped</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h3>

            {/* Edit Details button — always visible when loaded */}
            {partner && (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs justify-start gap-2 border-orange-400 text-orange-600 hover:bg-orange-50"
                onClick={() => setEditModalOpen(true)}
                disabled={isLoading}
              >
                <Settings className="size-3" /> Edit Details
              </Button>
            )}

            {isDropped ? (
              <Button size="sm" variant="outline" className="w-full text-xs justify-start gap-2"
                onClick={handleReactivate} disabled={reactivateMutation.isPending}>
                {reactivateMutation.isPending
                  ? <Loader2 className="size-3 animate-spin" />
                  : <RefreshCw className="size-3" />}
                Reactivate Partner
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="w-full text-xs justify-start gap-2"
                onClick={() => setStageModalOpen(true)} disabled={isLoading}>
                <Pencil className="size-3" /> Update Stage
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="border-b border-border mb-5">
            <nav className="flex gap-0">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn('px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                    activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'overview' && (
            isLoading
              ? <div className="space-y-4">
                  <Skeleton className="h-32 rounded-xl w-full" />
                  <Skeleton className="h-24 rounded-xl w-full" />
                </div>
              : partner
                ? <SourcingOverview data={partner} />
                : null
          )}
          {activeTab === 'contacts' && <PocTabContent partnerId={partnerId} />}
          {activeTab === 'interactions' && <InteractionLog partnerId={partnerId} />}
          {activeTab === 'commitments' && (
            isLoading
              ? <Skeleton className="h-48 rounded-xl w-full" />
              : partner
                ? <CommitmentsTab data={partner} />
                : null
          )}
          {activeTab === 'comments' && <CommentSection partnerId={partnerId} />}
        </div>
      </div>

      {partner && (
        <StageUpdateModal
          config={SOURCING_CONFIG}
          partner={{ ...partner, currentStage }}
          isOpen={stageModalOpen}
          onClose={() => setStageModalOpen(false)}
          onSubmitStage={handleStageUpdate}
        />
      )}

      {partner && (
        <EditSourcingModal
          partner={partner}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  )
}
