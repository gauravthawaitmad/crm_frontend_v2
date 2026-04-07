'use client'

import { X } from 'lucide-react'
import type { ConversionStage } from '@/types/lead'
import { STAGE_CONFIG, LEAD_FILTER_STAGES } from '@/lib/stages'

interface FilterChipsProps {
  selectedStage: ConversionStage | undefined
  onStageSelect: (stage: ConversionStage | undefined) => void
}

export function FilterChips({ selectedStage, onStageSelect }: FilterChipsProps) {
  const handleStageToggle = (stage: ConversionStage) => {
    onStageSelect(selectedStage === stage ? undefined : stage)
  }

  return (
    <fieldset className="space-y-2 border-0 p-0">
      <legend className="text-sm font-medium text-foreground">Filter by Stage</legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Stage filter options">
        {LEAD_FILTER_STAGES.map((stage) => {
          const isSelected = selectedStage === stage
          const config = STAGE_CONFIG[stage]
          return (
            <button
              key={stage}
              onClick={() => handleStageToggle(stage)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
                isSelected
                  ? `${config.color} ${config.border}`
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
              }`}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <span className={`w-2 h-2 rounded-full ${config.dot}`} aria-hidden="true" />
              )}
              {config.label}
              {isSelected && <X className="w-3 h-3 ml-0.5" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
