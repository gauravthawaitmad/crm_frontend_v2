'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUpdateSourcingDetails } from '@/hooks/useSourcing'
import { useStates, useCities } from '@/hooks/useReference'
import type { SourcingPartnerFull, UpdateSourcingDetailsInput } from '@/types/sourcing'

interface EditSourcingModalProps {
  partner: SourcingPartnerFull
  isOpen: boolean
  onClose: () => void
}

interface FormValues {
  name: string
  organization_type: string
  state_id: string
  city_id: string
  volunteers_committed: string
}

export function EditSourcingModal({ partner, isOpen, onClose }: EditSourcingModalProps) {
  const mutation = useUpdateSourcingDetails(partner.id)
  const { data: states = [] } = useStates()

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: partner.partner_name,
      organization_type: partner.sourcingDetail?.organization_type ?? '',
      state_id: partner.state?.id ? String(partner.state.id) : '',
      city_id: partner.city?.id ? String(partner.city.id) : '',
      volunteers_committed: partner.sourcingDetail?.volunteers_committed
        ? String(partner.sourcingDetail.volunteers_committed)
        : '',
    },
  })

  const selectedStateId = watch('state_id')
  const { data: cities = [] } = useCities(selectedStateId ? Number(selectedStateId) : null)

  // Reset city when state changes (skip on initial mount)
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    setValue('city_id', '')
  }, [selectedStateId, setValue])

  // Re-init form when partner changes
  useEffect(() => {
    reset({
      name: partner.partner_name,
      organization_type: partner.sourcingDetail?.organization_type ?? '',
      state_id: partner.state?.id ? String(partner.state.id) : '',
      city_id: partner.city?.id ? String(partner.city.id) : '',
      volunteers_committed: partner.sourcingDetail?.volunteers_committed
        ? String(partner.sourcingDetail.volunteers_committed)
        : '',
    })
    mountedRef.current = false
  }, [partner.id, reset]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: FormValues) {
    const payload: UpdateSourcingDetailsInput = {
      name: values.name,
    }
    if (values.organization_type) payload.organization_type = values.organization_type
    if (values.state_id) payload.state_id = Number(values.state_id)
    if (values.city_id) payload.city_id = Number(values.city_id)
    if (values.volunteers_committed) payload.volunteers_committed = Number(values.volunteers_committed)

    try {
      await mutation.mutateAsync(payload)
      toast.success('Partner details updated')
      onClose()
    } catch {
      toast.error('Failed to update details')
    }
  }

  function handleClose() { onClose() }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Edit Partner Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', { required: 'Required' })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Organization Type</label>
            <select
              {...register('organization_type')}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select type…</option>
              <option value="college">College / University</option>
              <option value="company">Company / Corporate</option>
              <option value="youth_club">Youth Club / NGO</option>
              <option value="community_group">Community Group</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">State</label>
              <select
                {...register('state_id')}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select state…</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>{s.state_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">City</label>
              <select
                {...register('city_id')}
                disabled={!selectedStateId}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              >
                <option value="">Select city…</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.city_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Volunteers Committed</label>
            <input
              type="number"
              min={0}
              {...register('volunteers_committed')}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Target volunteer count"
            />
          </div>

          <div className="flex gap-2 pt-1 border-t border-border">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-white hover:bg-primary/90"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
