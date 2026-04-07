'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUpdateFunderCommitment } from '@/hooks/useFunder'
import type { FunderCommitment } from '@/types/funder'

interface EditCommitmentModalProps {
  partnerId: number
  commitment: FunderCommitment
  onClose: () => void
}

export function EditCommitmentModal({ partnerId, commitment, onClose }: EditCommitmentModalProps) {
  const { mutateAsync, isPending } = useUpdateFunderCommitment(partnerId)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      cycle_label: commitment.cycle_label ?? '',
      amount_description: commitment.amount_description ?? '',
      amount: commitment.amount != null ? String(commitment.amount) : '',
      amount_per_installment: commitment.amount_per_installment != null
        ? String(commitment.amount_per_installment)
        : '',
      total_installments: commitment.total_installments != null
        ? String(commitment.total_installments)
        : '',
      received_installments: commitment.received_installments != null
        ? String(commitment.received_installments)
        : '0',
      program_name: commitment.program_name ?? '',
      start_date: commitment.start_date?.slice(0, 10) ?? '',
      end_date: commitment.end_date?.slice(0, 10) ?? '',
      commitment_notes: commitment.commitment_notes ?? '',
      status: commitment.status,
    },
  })

  useEffect(() => { reset() }, [commitment.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: Record<string, string>) {
    try {
      const payload: Record<string, unknown> = {
        cycle_label: values.cycle_label || undefined,
        amount_description: values.amount_description || undefined,
        program_name: values.program_name || undefined,
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined,
        commitment_notes: values.commitment_notes || undefined,
        status: values.status || undefined,
      }
      if (values.amount) payload.amount = parseFloat(values.amount)
      if (values.amount_per_installment) payload.amount_per_installment = parseFloat(values.amount_per_installment)
      if (values.total_installments) payload.total_installments = parseInt(values.total_installments)
      if (values.received_installments) payload.received_installments = parseInt(values.received_installments)

      await mutateAsync({ commitmentId: commitment.id, data: payload })
      toast.success('Commitment updated')
      onClose()
    } catch {
      toast.error('Failed to update commitment')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold">Edit Commitment</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cycle Label</label>
            <input {...register('cycle_label')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount Description</label>
            <input {...register('amount_description')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          {commitment.program_name != null && (
            <div>
              <label className="block text-sm font-medium mb-1">Program Name</label>
              <input {...register('program_name')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Total Amount (₹)</label>
              <input {...register('amount')} type="number" min="0" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Received Installments</label>
              <input {...register('received_installments')} type="number" min="0" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input {...register('start_date')} type="date" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input {...register('end_date')} type="date" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select {...register('status')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea {...register('commitment_notes')} rows={2} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark text-white" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
