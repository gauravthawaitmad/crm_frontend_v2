'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/shared/StarRating'
import { useUpdateEngagement } from '@/hooks/useVendor'
import { toast } from 'sonner'
import type { VendorEngagement, UpdateEngagementInput } from '@/types/vendor'

const schema = z.object({
  engagement_name: z.string().min(1, 'Required'),
  engagement_date: z.string().min(1, 'Required'),
  service_provided: z.string().min(1, 'Required'),
  rating_overall: z.number().min(1).max(5),
  rating_quality: z.number().min(1).max(5).nullable().optional(),
  rating_timeliness: z.number().min(1).max(5).nullable().optional(),
  rating_cost: z.number().min(1).max(5).nullable().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface EditEngagementModalProps {
  isOpen: boolean
  onClose: () => void
  vendorId: string | number
  engagement: VendorEngagement
}

export function EditEngagementModal({ isOpen, onClose, vendorId, engagement }: EditEngagementModalProps) {
  const [showDetailRatings, setShowDetailRatings] = useState(false)

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (isOpen && engagement) {
      reset({
        engagement_name: engagement.engagement_name,
        engagement_date: engagement.engagement_date?.slice(0, 10),
        service_provided: engagement.service_provided,
        rating_overall: engagement.rating_overall,
        rating_quality: engagement.rating_quality ?? null,
        rating_timeliness: engagement.rating_timeliness ?? null,
        rating_cost: engagement.rating_cost ?? null,
        notes: engagement.notes ?? '',
      })
      setShowDetailRatings(
        !!(engagement.rating_quality || engagement.rating_timeliness || engagement.rating_cost)
      )
    }
  }, [isOpen, engagement, reset])

  const mutation = useUpdateEngagement(vendorId)

  async function onSubmit(values: FormValues) {
    try {
      await mutation.mutateAsync({ engagementId: engagement.id, data: values as UpdateEngagementInput })
      toast.success('Updated')
      onClose()
    } catch {
      toast.error('Failed to update engagement')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Engagement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-medium mb-1">Event / Program Name <span className="text-red-500">*</span></label>
            <input
              {...register('engagement_name')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.engagement_name && <p className="text-xs text-red-500 mt-1">{errors.engagement_name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              {...register('engagement_date')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Service Provided <span className="text-red-500">*</span></label>
            <textarea
              {...register('service_provided')}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Overall Rating <span className="text-red-500">*</span></label>
            <Controller
              name="rating_overall"
              control={control}
              render={({ field }) => (
                <StarRating value={field.value} onChange={field.onChange} size="lg" readOnly={false} />
              )}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowDetailRatings((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {showDetailRatings ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            Detailed ratings
          </button>

          {showDetailRatings && (
            <div className="space-y-3 pl-3 border-l-2 border-border">
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
                      <StarRating value={field.value ?? 0} onChange={field.onChange} size="md" readOnly={false} />
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
            <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground px-3">
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
