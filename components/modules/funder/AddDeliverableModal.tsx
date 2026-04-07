'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAddDeliverable } from '@/hooks/useFunder'
import type { FunderCommitment, DeliverableType } from '@/types/funder'

const schema = z.object({
  commitment_id: z.string().min(1, 'Commitment is required'),
  deliverable_type: z.enum(['impact_report', 'outcome_data', 'site_visit', 'branding', 'other']),
  description: z.string().min(1, 'Description is required'),
  due_date: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AddDeliverableModalProps {
  partnerId: number
  commitments: FunderCommitment[]
  defaultCommitmentId?: number
  onClose: () => void
}

const DELIVERABLE_TYPE_OPTIONS = [
  { value: 'impact_report', label: 'Impact Report' },
  { value: 'outcome_data', label: 'Outcome Data' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'branding', label: 'Branding' },
  { value: 'other', label: 'Other' },
]

export function AddDeliverableModal({
  partnerId,
  commitments,
  defaultCommitmentId,
  onClose,
}: AddDeliverableModalProps) {
  const { mutateAsync, isPending } = useAddDeliverable(partnerId)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      commitment_id: defaultCommitmentId ? String(defaultCommitmentId) : (commitments[0]?.id ? String(commitments[0].id) : ''),
      deliverable_type: 'impact_report',
      description: '',
      due_date: '',
      notes: '',
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await mutateAsync({
        commitment_id: parseInt(values.commitment_id),
        deliverable_type: values.deliverable_type as DeliverableType,
        description: values.description,
        due_date: values.due_date,
        notes: values.notes || undefined,
      })
      toast.success('Deliverable added')
      onClose()
    } catch {
      toast.error('Failed to add deliverable')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold">Add Deliverable</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Commitment */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Linked Commitment <span className="text-red-500">*</span>
            </label>
            <select {...register('commitment_id')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
              {commitments.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.cycle_label} ({c.status})
                </option>
              ))}
            </select>
            {errors.commitment_id && <p className="text-xs text-red-500 mt-1">{errors.commitment_id.message}</p>}
          </div>

          {/* Deliverable Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select {...register('deliverable_type')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
              {DELIVERABLE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Quarterly impact report for Q1 2025 showing attendance data, learning outcomes..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              {...register('due_date')}
              type="date"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.due_date && <p className="text-xs text-red-500 mt-1">{errors.due_date.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark text-white" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Deliverable'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
