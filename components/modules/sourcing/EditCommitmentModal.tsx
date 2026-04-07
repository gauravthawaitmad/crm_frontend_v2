'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUpdateCommitment } from '@/hooks/useSourcing'
import type { PartnerCommitment, UpdateCommitmentInput } from '@/types/sourcing'

interface EditCommitmentModalProps {
  partnerId: number
  commitment: PartnerCommitment | null
  isOpen: boolean
  onClose: () => void
}

type FormValues = {
  cycle_label: string
  committed_count: string
  delivered_count: string
  start_date: string
  end_date: string
  status: string
  commitment_notes: string
}

export function EditCommitmentModal({ partnerId, commitment, isOpen, onClose }: EditCommitmentModalProps) {
  const mutation = useUpdateCommitment(partnerId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>()

  useEffect(() => {
    if (commitment) {
      reset({
        cycle_label: commitment.cycle_label ?? '',
        committed_count: commitment.committed_count != null ? String(commitment.committed_count) : '',
        delivered_count: String(commitment.delivered_count ?? 0),
        start_date: commitment.start_date?.split('T')[0] ?? '',
        end_date: commitment.end_date?.split('T')[0] ?? '',
        status: commitment.status ?? 'active',
        commitment_notes: commitment.commitment_notes ?? '',
      })
    }
  }, [commitment, reset])

  async function onSubmit(values: FormValues) {
    if (!commitment) return
    const payload: UpdateCommitmentInput = {}
    if (values.cycle_label) payload.cycle_label = values.cycle_label
    if (values.committed_count) payload.committed_count = Number(values.committed_count)
    if (values.delivered_count !== '') payload.delivered_count = Number(values.delivered_count)
    if (values.start_date) payload.start_date = values.start_date
    if (values.end_date) payload.end_date = values.end_date
    if (values.status) payload.status = values.status as UpdateCommitmentInput['status']
    payload.commitment_notes = values.commitment_notes || null

    try {
      await mutation.mutateAsync({ commitmentId: commitment.id, data: payload })
      toast.success('Commitment updated')
      onClose()
    } catch {
      toast.error('Failed to update commitment')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Edit Commitment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Cycle Label <span className="text-red-500">*</span>
            </label>
            <input
              {...register('cycle_label', { required: 'Required' })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. 2025-26 or Q1 2025"
            />
            {errors.cycle_label && <p className="text-xs text-red-500 mt-1">{errors.cycle_label.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Committed <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('committed_count', { required: 'Required', min: { value: 1, message: 'Min 1' } })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {errors.committed_count && <p className="text-xs text-red-500 mt-1">{errors.committed_count.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Delivered</label>
              <input
                type="number"
                {...register('delivered_count')}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Start Date</label>
              <input
                type="date"
                {...register('start_date')}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">End Date</label>
              <input
                type="date"
                {...register('end_date')}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Notes</label>
            <textarea
              rows={2}
              {...register('commitment_notes')}
              className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex gap-2 pt-1 border-t border-border">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
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
