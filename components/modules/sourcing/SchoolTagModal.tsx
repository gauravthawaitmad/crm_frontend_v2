'use client'

import { useState } from 'react'
import { Search, Loader2, Check } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAvailableSchools, useTagSchool, useSourcingSchoolTags } from '@/hooks/useSourcing'
import { STAGE_COLORS } from '@/lib/partner-configs/stage-colors'

interface SchoolTagModalProps {
  partnerId: number
  isOpen: boolean
  onClose: () => void
}

export function SchoolTagModal({ partnerId, isOpen, onClose }: SchoolTagModalProps) {
  const [search, setSearch] = useState('')
  const tagMutation = useTagSchool(partnerId)

  const { data: availableData, isLoading } = useAvailableSchools(partnerId, search)
  const { data: taggedData } = useSourcingSchoolTags(partnerId)

  const available = availableData?.result ?? []
  const taggedIds = new Set((taggedData?.result ?? []).map((s) => s.school_partner_id))

  async function handleTag(schoolId: number, schoolName: string) {
    if (taggedIds.has(schoolId)) return
    try {
      await tagMutation.mutateAsync(schoolId)
      toast.success(`${schoolName} tagged`)
    } catch {
      toast.error('Failed to tag school')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tag a School</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 flex-1 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search converted schools…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && available.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {search ? 'No schools found.' : 'Search for converted schools to tag.'}
            </p>
          )}

          {!isLoading && available.map((school) => {
            const isTagged = taggedIds.has(school.id)
            const sc = STAGE_COLORS[school.status ?? ''] ?? STAGE_COLORS['converted']
            return (
              <button
                key={school.id}
                onClick={() => handleTag(school.id, school.partner_name)}
                disabled={isTagged || tagMutation.isPending}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all',
                  isTagged
                    ? 'border-green-200 bg-green-50 cursor-default'
                    : 'border-border hover:bg-muted/30 hover:border-primary/30'
                )}
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{school.partner_name}</p>
                  {(school.city || school.state) && (
                    <p className="text-xs text-muted-foreground">
                      {[school.city, school.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {sc && (
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', sc.bg, sc.text)}>
                      {school.status}
                    </span>
                  )}
                  {isTagged && <Check className="size-4 text-green-600" />}
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
