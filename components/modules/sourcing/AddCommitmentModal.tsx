'use client'

import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAddCommitment } from '@/hooks/useSourcing'
import type { AddCommitmentInput } from '@/types/sourcing'

interface AddCommitmentModalProps {
  partnerId: number
  isOpen: boolean
  onClose: () => void
}

export function AddCommitmentModal({ partnerId, isOpen, onClose }: AddCommitmentModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddCommitmentInput>()
  const mutation = useAddCommitment(partnerId)

  async function onSubmit(values: AddCommitmentInput) {
    try {
      await mutation.mutateAsync(values)
      toast.success('Commitment added')
      reset()
      onClose()
    } catch {
      toast.error('Failed to add commitment')
    }
  }

  function handleClose() { reset(); onClose() }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Add Commitment Cycle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Cycle Label <span className="text-red-500">*</span>
            </label>
            <input {...register('cycle_label', { required: 'Required' })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. 2025-26 or Q1 2025" />
            {errors.cycle_label && <p className="text-xs text-red-500 mt-1">{errors.cycle_label.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Committed <span className="text-red-500">*</span>
              </label>
              <input type="number"
                {...register('committed_count', { required: 'Required', valueAsNumber: true, min: { value: 1, message: 'Min 1' } })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Target volunteers" />
              {errors.committed_count && <p className="text-xs text-red-500 mt-1">{errors.committed_count.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Delivered</label>
              <input type="number"
                {...register('delivered_count', { valueAsNumber: true })}
                defaultValue={0}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input type="date" {...register('start_date', { required: 'Required' })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input type="date" {...register('end_date', { required: 'Required' })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Status</label>
            <select {...register('status')}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Notes</label>
            <textarea rows={2} {...register('commitment_notes')}
              className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Any notes about this cycle…" />
          </div>

          <div className="flex gap-2 pt-1 border-t border-border">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
              Add Commitment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
