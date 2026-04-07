'use client'

import { ArrowRight } from 'lucide-react'
import type { ConversionStage } from '@/types/lead'
import { STAGE_CONFIG } from '@/lib/stages'
import { cn } from '@/lib/utils'

interface NextStageSelectorProps {
  currentStage: ConversionStage
  availableStages: ConversionStage[]
  onSelect: (stage: ConversionStage) => void
}

export function NextStageSelector({
  currentStage,
  availableStages,
  onSelect,
}: NextStageSelectorProps) {
  const current = STAGE_CONFIG[currentStage]

  return (
    <div className="space-y-4">
      {/* Current stage label */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
        <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', current?.color)}>
          {current?.label ?? currentStage}
        </span>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Select next stage</span>
      </div>

      {availableStages.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No further stage transitions available for this lead.
        </p>
      ) : (
        <div className="grid gap-2">
          {availableStages.map((stage) => {
            const config = STAGE_CONFIG[stage]
            return (
              <button
                key={stage}
                type="button"
                onClick={() => onSelect(stage)}
                className={cn(
                  'flex items-center justify-between w-full p-3 rounded-lg border text-left transition-all',
                  'hover:shadow-sm hover:bg-muted/30',
                  config?.border ?? 'border-border',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', config?.dot)} />
                  <span className="text-sm font-medium text-foreground">
                    {config?.label ?? stage}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
