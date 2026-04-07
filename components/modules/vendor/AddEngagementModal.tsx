'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/shared/StarRating'
import { useAddEngagement, useAvailableSchools } from '@/hooks/useVendor'
import { toast } from 'sonner'
import type { AddEngagementInput } from '@/types/vendor'

const schema = z.object({
  engagement_name: z.string().min(1, 'Required'),
  engagement_date: z.string().min(1, 'Required'),
  service_provided: z.string().min(1, 'Required'),
  rating_overall: z.number().min(1, 'Overall rating is required').max(5),
  rating_quality: z.number().min(1).max(5).nullable().optional(),
  rating_timeliness: z.number().min(1).max(5).nullable().optional(),
  rating_cost: z.number().min(1).max(5).nullable().optional(),
  school_partner_id: z.number().nullable().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AddEngagementModalProps {
  isOpen: boolean
  onClose: () => void
  vendorId: string | number
}

export function AddEngagementModal({ isOpen, onClose, vendorId }: AddEngagementModalProps) {
  const [showDetailRatings, setShowDetailRatings] = useState(false)
  const [schoolSearch, setSchoolSearch] = useState('')
  const { data: schools } = useAvailableSchools(schoolSearch)

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      engagement_date: new Date().toISOString().slice(0, 10),
      rating_overall: 0,
    },
  })

  const mutation = useAddEngagement(vendorId)

  async function onSubmit(values: FormValues) {
    try {
      await mutation.mutateAsync(values as AddEngagementInput)
      toast.success('Engagement logged')
      reset()
      setShowDetailRatings(false)
      onClose()
    } catch {
      toast.error('Failed to log engagement')
    }
  }

  function handleClose() {
    reset()
    setShowDetailRatings(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Engagement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Event name */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Event / Program Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('engagement_name')}
              placeholder="Annual Day 2025, Workshop Series, Print Order #12..."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.engagement_name && <p className="text-xs text-red-500 mt-1">{errors.engagement_name.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Date of Engagement <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('engagement_date')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.engagement_date && <p className="text-xs text-red-500 mt-1">{errors.engagement_date.message}</p>}
          </div>

          {/* Service provided */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Service Provided <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('service_provided')}
              rows={2}
              placeholder="Printed 200 booklets and 5 banners for the event"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            {errors.service_provided && <p className="text-xs text-red-500 mt-1">{errors.service_provided.message}</p>}
          </div>

          {/* Linked school */}
          <div>
            <label className="block text-xs font-medium mb-1">Linked School (optional)</label>
            <input
              type="text"
              placeholder="Search school name..."
              value={schoolSearch}
              onChange={(e) => setSchoolSearch(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-1"
            />
            {schools && schools.length > 0 && schoolSearch.length >= 2 && (
              <Controller
                name="school_partner_id"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">None</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.partner_name}{s.city_name ? ` — ${s.city_name}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              />
            )}
          </div>

          {/* Overall rating */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">How did they perform?</p>
            <label className="block text-xs font-medium mb-1.5">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <Controller
              name="rating_overall"
              control={control}
              render={({ field }) => (
                <StarRating
                  value={field.value}
                  onChange={field.onChange}
                  size="lg"
                  readOnly={false}
                />
              )}
            />
            {errors.rating_overall && (
              <p className="text-xs text-red-500 mt-1">{errors.rating_overall.message}</p>
            )}
          </div>

          {/* Detailed ratings collapsible */}
          <button
            type="button"
            onClick={() => setShowDetailRatings((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {showDetailRatings ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            Add detailed ratings (optional)
          </button>

          {showDetailRatings && (
            <div className="space-y-3 pl-3 border-l-2 border-border">
              <p className="text-xs text-muted-foreground">Rate 1–5 for each dimension</p>
              {[
                { name: 'rating_quality' as const, label: 'Quality' },
                { name: 'rating_timeliness' as const, label: 'Timeliness' },
                { name: 'rating_cost' as const, label: 'Cost Effectiveness' },
              ].map(({ name, label }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
                  <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                      <StarRating
                        value={field.value ?? 0}
                        onChange={field.onChange}
                        size="md"
                        readOnly={false}
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium mb-1">Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Any feedback about this vendor's work..."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90" disabled={mutation.isPending}>
              {mutation.isPending ? 'Logging…' : '+ Log Engagement'}
            </Button>
            <button type="button" onClick={handleClose} className="text-sm text-muted-foreground hover:text-foreground px-3">
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
