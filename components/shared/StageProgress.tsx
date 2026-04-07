'use client'

import { ArrowRight } from 'lucide-react'
import type { ConversionStage } from '@/types/lead'
import { STAGE_CONFIG } from '@/lib/stages'
import { cn } from '@/lib/utils'

interface StageProgressProps {
  currentStage: ConversionStage
  targetStage: ConversionStage
}

export function StageProgress({ currentStage, targetStage }: StageProgressProps) {
  const currentConfig = STAGE_CONFIG[currentStage]
  const targetConfig = STAGE_CONFIG[targetStage]

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap', currentConfig?.color)}>
        {currentConfig?.label ?? currentStage}
      </span>
      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
      <span
        className={cn(
          'text-xs px-2.5 py-1 rounded-full font-medium border-2 whitespace-nowrap',
          targetConfig?.color,
          targetConfig?.border,
        )}
      >
        {targetConfig?.label ?? targetStage}
      </span>
    </div>
  )
}
