'use client'

import { useState } from 'react'
import { Pencil, Trash2, MapPin, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/shared/StarRating'
import { AddEngagementModal } from './AddEngagementModal'
import { EditEngagementModal } from './EditEngagementModal'
import { useDeleteEngagement } from '@/hooks/useVendor'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { VendorEngagement } from '@/types/vendor'

type SortOption = 'recent' | 'highest' | 'lowest'

interface EngagementsTabProps {
  vendorId: string | number
  engagements: VendorEngagement[]
}

function EngagementCard({
  engagement,
  vendorId,
}: {
  engagement: VendorEngagement
  vendorId: string | number
}) {
  const [expanded, setExpanded] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const deleteMutation = useDeleteEngagement(vendorId)

  async function handleDelete() {
    if (!confirm('Delete this engagement? This will recalculate the vendor rating.')) return
    try {
      await deleteMutation.mutateAsync(engagement.id)
      toast.success('Engagement deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const hasDimensions = engagement.rating_quality || engagement.rating_timeliness || engagement.rating_cost
  const notesTooLong = (engagement.notes?.length ?? 0) > 80

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-sm p-4 space-y-2 group">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-foreground truncate flex-1">
            {engagement.engagement_name}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground">
              {new Date(engagement.engagement_date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
            {/* Action buttons (show on hover) */}
            <div className="hidden group-hover:flex items-center gap-1 ml-2">
              <button
                onClick={() => setEditOpen(true)}
                className="p-1 rounded hover:bg-stone-100 text-muted-foreground hover:text-foreground transition-colors"
                title="Edit"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* School tag */}
        {engagement.school_name && (
          <div className="flex items-center gap-1">
            <MapPin className="size-3 text-stone-400" />
            <span className="text-xs text-stone-500">{engagement.school_name}</span>
          </div>
        )}

        {/* Service provided */}
        <p className="text-xs text-muted-foreground line-clamp-2">{engagement.service_provided}</p>

        {/* Rating row */}
        <div className="flex items-center flex-wrap gap-3">
          <StarRating value={engagement.rating_overall} readOnly size="sm" />
          {hasDimensions && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {engagement.rating_quality && <span>Q:{engagement.rating_quality}</span>}
              {engagement.rating_timeliness && <span>T:{engagement.rating_timeliness}</span>}
              {engagement.rating_cost && <span>C:{engagement.rating_cost}</span>}
            </div>
          )}
        </div>

        {/* Notes */}
        {engagement.notes && (
          <div>
            <p className={cn('text-xs text-muted-foreground', !expanded && 'line-clamp-1')}>
              {engagement.notes}
            </p>
            {notesTooLong && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-primary hover:underline mt-0.5 flex items-center gap-0.5"
              >
                {expanded ? <><ChevronUp className="size-3" /> Show less</> : <><ChevronDown className="size-3" /> Show more</>}
              </button>
            )}
          </div>
        )}
      </div>

      <EditEngagementModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        vendorId={vendorId}
        engagement={engagement}
      />
    </>
  )
}

export function EngagementsTab({ vendorId, engagements }: EngagementsTabProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [sort, setSort] = useState<SortOption>('recent')

  const sorted = [...engagements].sort((a, b) => {
    if (sort === 'highest') return b.rating_overall - a.rating_overall
    if (sort === 'lowest') return a.rating_overall - b.rating_overall
    return new Date(b.engagement_date).getTime() - new Date(a.engagement_date).getTime()
  })

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          {engagements.length} engagement{engagements.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-xs border border-border rounded-lg px-2 py-1.5 bg-white focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
          <Button
            size="sm"
            className="bg-primary text-white hover:bg-primary/90"
            onClick={() => setAddOpen(true)}
          >
            + Log Engagement
          </Button>
        </div>
      </div>

      {/* Cards */}
      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-3">
          <Package className="size-10 text-stone-300 mx-auto" />
          <p className="text-sm font-medium text-foreground">No engagements logged yet</p>
          <p className="text-xs text-muted-foreground">Log your first engagement to start tracking performance</p>
          <Button
            size="sm"
            className="bg-primary text-white hover:bg-primary/90 mt-2"
            onClick={() => setAddOpen(true)}
          >
            + Log Engagement
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((e) => (
            <EngagementCard key={e.id} engagement={e} vendorId={vendorId} />
          ))}
        </div>
      )}

      <AddEngagementModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        vendorId={vendorId}
      />
    </div>
  )
}
