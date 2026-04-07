'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAddFunderCommitment } from '@/hooks/useFunder'
import type { CommitmentType, CommitmentStatus } from '@/types/funder'

const schema = z.object({
  cycle_label: z.string().min(1, 'Cycle label is required'),
  commitment_type: z.enum(['one_time', 'monthly', 'quarterly', 'annual', 'program_based']),
  amount_description: z.string().min(1, 'Amount description is required'),
  amount: z.string().optional(),
  amount_per_installment: z.string().optional(),
  installment_frequency: z.string().optional(),
  total_installments: z.string().optional(),
  program_name: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  commitment_notes: z.string().optional(),
  status: z.enum(['pending', 'active', 'completed', 'cancelled']),
})

type FormValues = z.infer<typeof schema>

interface AddCommitmentModalProps {
  partnerId: number
  onClose: () => void
}

const COMMITMENT_TYPE_OPTIONS = [
  { value: 'one_time', label: 'One-time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
  { value: 'program_based', label: 'Program-based' },
]

const FREQ_MAP: Record<string, string> = {
  monthly: 'monthly',
  quarterly: 'quarterly',
  annual: 'annual',
}

export function AddCommitmentModal({ partnerId, onClose }: AddCommitmentModalProps) {
  const { mutateAsync, isPending } = useAddFunderCommitment(partnerId)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      commitment_type: 'one_time',
      status: 'active',
      cycle_label: '',
      amount_description: '',
      start_date: '',
      end_date: '',
    },
  })

  const commitmentType = watch('commitment_type')
  const isRecurring = ['monthly', 'quarterly', 'annual'].includes(commitmentType)
  const isProgramBased = commitmentType === 'program_based'

  // Auto-fill installment frequency when type changes
  useEffect(() => {
    if (FREQ_MAP[commitmentType]) {
      setValue('installment_frequency', FREQ_MAP[commitmentType])
    } else {
      setValue('installment_frequency', '')
    }
  }, [commitmentType, setValue])

  async function onSubmit(values: FormValues) {
    try {
      await mutateAsync({
        cycle_label: values.cycle_label,
        commitment_type: values.commitment_type as CommitmentType,
        amount_description: values.amount_description,
        amount: values.amount ? parseFloat(values.amount) : undefined,
        amount_per_installment: values.amount_per_installment
          ? parseFloat(values.amount_per_installment)
          : undefined,
        installment_frequency: values.installment_frequency || undefined,
        total_installments: values.total_installments
          ? parseInt(values.total_installments)
          : undefined,
        program_name: values.program_name || undefined,
        start_date: values.start_date,
        end_date: values.end_date,
        commitment_notes: values.commitment_notes || undefined,
        status: values.status as CommitmentStatus,
      })
      toast.success('Commitment added')
      onClose()
    } catch {
      toast.error('Failed to add commitment')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold">Add Commitment</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Cycle Label */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Cycle Label <span className="text-red-500">*</span>
            </label>
            <input
              {...register('cycle_label')}
              placeholder="e.g. FY 2025-26"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.cycle_label && <p className="text-xs text-red-500 mt-1">{errors.cycle_label.message}</p>}
          </div>

          {/* Commitment Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Commitment Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('commitment_type')}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {COMMITMENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Amount Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Amount Description <span className="text-red-500">*</span>
            </label>
            <input
              {...register('amount_description')}
              placeholder="e.g. ₹5L for FY 2025-26"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.amount_description && (
              <p className="text-xs text-red-500 mt-1">{errors.amount_description.message}</p>
            )}
          </div>

          {/* Program Name (program_based only) */}
          {isProgramBased && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Program Name</label>
              <input
                {...register('program_name')}
                placeholder="e.g. Digital Literacy Initiative"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {/* Amount */}
          {!isRecurring ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Total Amount (₹)</label>
              <input
                {...register('amount')}
                type="number"
                min="0"
                placeholder="Optional — numeric amount"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Amount / Installment (₹)</label>
                <input
                  {...register('amount_per_installment')}
                  type="number"
                  min="0"
                  placeholder="Optional"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Total Installments</label>
                <input
                  {...register('total_installments')}
                  type="number"
                  min="1"
                  placeholder="e.g. 4"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                {...register('start_date')}
                type="date"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                {...register('end_date')}
                type="date"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              {...register('commitment_notes')}
              rows={2}
              placeholder="Any notes about this commitment..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark text-white" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Commitment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
