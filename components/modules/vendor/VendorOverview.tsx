'use client'

import { useRef, useState } from 'react'
import { FileText, ExternalLink, UploadCloud, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/shared/StarRating'
import { useUploadContract } from '@/hooks/useVendor'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { VendorDetail } from '@/types/vendor'

const VENDOR_TYPE_LABELS: Record<string, string> = {
  facilitator:   'Facilitator',
  speaker:       'Speaker',
  printer:       'Printer / Materials',
  venue_provider: 'Venue Provider',
  event_service: 'Event Service',
  other:         'Other',
}

interface VendorOverviewProps {
  data: VendorDetail
  onTabChange?: (tab: string) => void
}

export function VendorOverview({ data, onTabChange }: VendorOverviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadContract(data.id)
  const [uploading, setUploading] = useState(false)

  async function handleContractUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadMutation.mutateAsync(file)
      toast.success('Contract uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Compute dimension averages from engagements
  const engagements = data.engagements || []
  const qualityRatings = engagements.filter((e) => e.rating_quality != null).map((e) => e.rating_quality!)
  const timelinessRatings = engagements.filter((e) => e.rating_timeliness != null).map((e) => e.rating_timeliness!)
  const costRatings = engagements.filter((e) => e.rating_cost != null).map((e) => e.rating_cost!)

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
  const avgQuality = avg(qualityRatings)
  const avgTimeliness = avg(timelinessRatings)
  const avgCost = avg(costRatings)

  const lastEngagement = engagements[0]

  return (
    <div className="space-y-4">

      {/* Section 1 — Details */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Details</h3>

        {data.vendor_type && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide w-24 shrink-0">Type</span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-stone-100 text-stone-600">
              {VENDOR_TYPE_LABELS[data.vendor_type] ?? data.vendor_type}
            </span>
          </div>
        )}

        {data.city && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide w-24 shrink-0">Location</span>
            <span className="text-sm text-foreground">{data.city.name}, {data.state?.name}</span>
          </div>
        )}

        {data.services_description && (
          <div>
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide block mb-1">Services</span>
            <p className="text-sm text-foreground leading-relaxed">{data.services_description}</p>
          </div>
        )}
      </div>

      {/* Section 2 — Contract */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Contract</h3>

        {data.contract_services && (
          <div>
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide block mb-1">Services Covered</span>
            <p className="text-sm text-foreground leading-relaxed">{data.contract_services}</p>
          </div>
        )}
        {!data.contract_services && (
          <p className="text-sm text-muted-foreground italic">No contract services recorded.</p>
        )}

        <div className="pt-1">
          {data.contract_document ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(data.contract_document!, '_blank')}
            >
              <ExternalLink className="size-3.5" />
              View Contract
            </Button>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleContractUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="size-3.5" />
                {uploading ? 'Uploading…' : 'Upload Contract'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Section 3 — Performance */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Performance</h3>

        {data.total_engagements === 0 ? (
          <div className="text-center py-4 space-y-2">
            <FileText className="size-8 text-stone-300 mx-auto" />
            <p className="text-sm text-muted-foreground">No engagements yet.</p>
            {onTabChange && (
              <button
                onClick={() => onTabChange('engagements')}
                className="text-sm text-primary hover:underline"
              >
                Log first engagement →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall rating */}
            <div className="flex items-center gap-3">
              <StarRating
                value={data.average_rating}
                readOnly
                size="lg"
                showValue
                count={data.total_engagements}
              />
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              across {data.total_engagements} engagement{data.total_engagements !== 1 ? 's' : ''}
            </p>

            {/* Dimension bars */}
            {(avgQuality !== null || avgTimeliness !== null || avgCost !== null) && (
              <div className="space-y-2">
                {avgQuality !== null && (
                  <DimensionBar label="Quality" value={avgQuality} />
                )}
                {avgTimeliness !== null && (
                  <DimensionBar label="Timeliness" value={avgTimeliness} />
                )}
                {avgCost !== null && (
                  <DimensionBar label="Cost" value={avgCost} />
                )}
              </div>
            )}

            {/* Last used */}
            {lastEngagement && (
              <p className="text-xs text-muted-foreground">
                Last engagement:{' '}
                <span className="font-medium">
                  {new Date(lastEngagement.engagement_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DimensionBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 5) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-orange-100">
        <div
          className="h-1.5 rounded-full bg-orange-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-foreground w-6 text-right">{value.toFixed(1)}</span>
    </div>
  )
}
