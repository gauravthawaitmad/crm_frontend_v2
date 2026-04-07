'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PartnerTypeConfig } from '@/lib/partner-configs/types'

interface PartnerListPageProps {
  config: PartnerTypeConfig
}

export function PartnerListPage({ config }: PartnerListPageProps) {
  const [selectedStage, setSelectedStage] = useState<string | undefined>()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            {/* Icon placeholder — actual icon mapped in Phase D */}
            <div className="h-6 w-6 flex items-center justify-center text-primary font-bold text-sm">
              {config.singularLabel.charAt(0)}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{config.label}</h1>
            <p className="text-muted-foreground mt-1">
              Manage {config.label.toLowerCase()}
            </p>
          </div>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90" disabled>
          <Plus className="h-4 w-4" />
          New {config.singularLabel}
        </Button>
      </div>

      {/* Stage filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedStage(undefined)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
            !selectedStage
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-muted-foreground border-border hover:border-primary/40'
          )}
        >
          All stages
        </button>
        {config.stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStage(stage.id === selectedStage ? undefined : stage.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              selectedStage === stage.id
                ? `${stage.bg} ${stage.text} border-transparent`
                : 'bg-white text-muted-foreground border-border hover:border-primary/40'
            )}
          >
            <span className={cn('size-1.5 rounded-full', stage.dot)} />
            {stage.label}
          </button>
        ))}
      </div>

      {/* Data placeholder */}
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
          <div className="h-8 w-8 flex items-center justify-center text-muted-foreground font-bold text-lg">
            {config.singularLabel.charAt(0)}
          </div>
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          {config.label} list coming in Phase D
        </p>
        <p className="text-xs text-muted-foreground">
          Configure API routes at <code className="bg-muted px-1 py-0.5 rounded">{config.apiRoute}</code> to load {config.label.toLowerCase()} data.
        </p>
        {selectedStage && (
          <p className="text-xs text-muted-foreground mt-2">
            Filter: <span className="font-medium">{config.stages.find((s) => s.id === selectedStage)?.label}</span>
          </p>
        )}
      </div>
    </div>
  )
}
