'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { PartnerTypeConfig, StageDefinition } from '@/lib/partner-configs/types'

interface StageUpdateModalProps {
  config: PartnerTypeConfig
  partner: Record<string, unknown>
  isOpen: boolean
  onClose: () => void
  forcedTargetStage?: string
  onSubmitStage?: (payload: { stage: string; notes?: string; drop_reason?: string }) => Promise<void>
}

interface StageFormValues {
  notes: string
  drop_reason: string
}

export function StageUpdateModal({
  config,
  partner,
  isOpen,
  onClose,
  forcedTargetStage,
  onSubmitStage,
}: StageUpdateModalProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(
    forcedTargetStage ?? null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm<StageFormValues>({
    defaultValues: { notes: '', drop_reason: '' },
  })

  const partnerName = typeof partner?.partner_name === 'string' ? partner.partner_name : 'this partner'
  const currentStage = typeof partner?.currentStage === 'string' ? partner.currentStage : ''

  // Determine valid next stages from current stage
  // For now, show all stages that aren't the current one and aren't the initial stage (going backward)
  const currentStageIdx = config.stages.findIndex((s) => s.id === currentStage)
  const validNextStages: StageDefinition[] = currentStage
    ? config.stages.filter((s, idx) => {
        if (s.id === currentStage) return false
        // Always allow dropping
        if (s.isDropped) return true
        // Allow pausing from any non-terminal stage
        if (s.id === 'paused') return !config.stages.find((cs) => cs.id === currentStage)?.isTerminal
        // Allow moving forward
        return idx > currentStageIdx
      })
    : config.stages

  const targetStageConfig = selectedStage
    ? config.stages.find((s) => s.id === selectedStage)
    : null

  const isDropped = targetStageConfig?.isDropped ?? false
  const isPaused = selectedStage === 'paused'

  function handleClose() {
    setSelectedStage(forcedTargetStage ?? null)
    reset()
    onClose()
  }

  async function onSubmit(values: StageFormValues) {
    if (!selectedStage) return
    if (!onSubmitStage) {
      toast.info('Stage update not wired')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmitStage({
        stage: selectedStage,
        notes: values.notes || undefined,
        drop_reason: values.drop_reason || undefined,
      })
      handleClose()
    } catch {
      toast.error('Failed to update stage')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Stage — {partnerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Stage selector (skip if forced) */}
          {!forcedTargetStage && !selectedStage && (
            <div className="space-y-3">
              {/* Current stage indicator */}
              {currentStage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  {(() => {
                    const cs = config.stages.find((s) => s.id === currentStage)
                    return cs ? (
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', cs.bg, cs.text)}>
                        {cs.label}
                      </span>
                    ) : null
                  })()}
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Select next stage</span>
                </div>
              )}

              {/* Stage options */}
              {validNextStages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No further stage transitions available.
                </p>
              ) : (
                <div className="grid gap-2">
                  {validNextStages.map((stage) => (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setSelectedStage(stage.id)}
                      className={cn(
                        'flex items-center justify-between w-full p-3 rounded-lg border text-left transition-all',
                        'hover:shadow-sm hover:bg-muted/30 border-border'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', stage.dot)} />
                        <div>
                          <span className="text-sm font-medium text-foreground">{stage.label}</span>
                          <p className="text-xs text-muted-foreground">{stage.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stage form (when stage selected) */}
          {selectedStage && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Selected stage indicator */}
              {targetStageConfig && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  {!forcedTargetStage && (
                    <button
                      type="button"
                      onClick={() => setSelectedStage(null)}
                      className="text-xs text-muted-foreground hover:text-foreground mr-1"
                    >
                      ← Back
                    </button>
                  )}
                  <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', targetStageConfig.bg, targetStageConfig.text)}>
                    {targetStageConfig.label}
                  </span>
                </div>
              )}

              {/* Drop reason (dropped stage only) */}
              {isDropped && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Drop Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('drop_reason', { required: isDropped })}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    <option value="">Select reason…</option>
                    {config.dropReasons.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Notes {(isDropped || isPaused) ? <span className="text-muted-foreground">(optional)</span> : <span className="text-muted-foreground">(optional)</span>}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    isDropped
                      ? 'Why is this partner being dropped?'
                      : isPaused
                        ? 'Why is this partnership being paused?'
                        : 'Any additional notes…'
                  }
                  {...register('notes')}
                  className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-1 border-t border-border">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-white hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}
                  Move to {targetStageConfig?.label ?? selectedStage}
                </Button>
              </div>
            </form>
          )}

          {/* Cancel when no stage selected and no forced stage */}
          {!selectedStage && !forcedTargetStage && (
            <Button variant="outline" className="w-full" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
