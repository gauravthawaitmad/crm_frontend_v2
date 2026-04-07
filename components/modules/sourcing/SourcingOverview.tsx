'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { SchoolTagModal } from './SchoolTagModal'
import { SOURCING_CONFIG } from '@/lib/partner-configs/sourcing.config'
import { useRemoveSchoolTag } from '@/hooks/useSourcing'
import type { SourcingPartnerFull } from '@/types/sourcing'

interface SourcingOverviewProps {
  data: SourcingPartnerFull
}

export function SourcingOverview({ data }: SourcingOverviewProps) {
  const [showSchoolTag, setShowSchoolTag] = useState(false)
  const removeTagMutation = useRemoveSchoolTag(data.id)

  const detail = data.sourcingDetail
  const committed = detail?.volunteers_committed ?? 0
  const deployed = detail?.volunteers_deployed ?? 0
  const pct = committed > 0 ? Math.round((deployed / committed) * 100) : 0
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'

  const orgTypeLabel = SOURCING_CONFIG.createFormFields
    .find((f) => f.name === 'org_type')
    ?.options?.find((o) => o.value === (detail?.organization_type ?? detail?.org_type))?.label
    ?? detail?.organization_type?.replace(/_/g, ' ') ?? detail?.org_type ?? '—'

  async function handleRemoveTag(schoolPartnerId: number) {
    try {
      await removeTagMutation.mutateAsync(schoolPartnerId)
      toast.success('School tag removed')
    } catch {
      toast.error('Failed to remove tag')
    }
  }

  return (
    <div className="space-y-6">
      {/* Organization Details */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Organization Details</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {([
            ['Type', orgTypeLabel],
            ['Lead Source', data.lead_source ?? '—'],
            ['Address', data.address_line_1 ?? '—'],
            ['City', data.city?.city_name ?? '—'],
            ['State', data.state?.state_name ?? '—'],
            ['Website', detail?.website ?? '—'],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="space-y-0.5">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Volunteer Numbers */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Volunteer Numbers</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg bg-muted/30 p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{committed}</p>
            <p className="text-xs text-muted-foreground mt-1">Committed</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{deployed}</p>
            <p className="text-xs text-muted-foreground mt-1">Deployed</p>
          </div>
        </div>
        {committed > 0 && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Delivery rate</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', barColor)}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Linked Schools */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Linked Schools</h3>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
            onClick={() => setShowSchoolTag(true)}>
            <Plus className="size-3" /> Tag School
          </Button>
        </div>
        {data.tagged_schools.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No schools tagged yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.tagged_schools.map((school) => (
              <div key={school.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-sm font-medium text-stone-700">
                <span>{school.school_name}</span>
                {school.city && <span className="text-xs text-muted-foreground">({school.city})</span>}
                <button
                  onClick={() => handleRemoveTag(school.school_partner_id)}
                  className="ml-1 p-0.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-600">
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {detail?.notes && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detail.notes}</p>
        </div>
      )}

      <SchoolTagModal
        partnerId={data.id}
        isOpen={showSchoolTag}
        onClose={() => setShowSchoolTag(false)}
      />
    </div>
  )
}
