'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Users, Loader2, Zap } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Poc } from '@/types/poc'
import { usePocsByPartner, useDeletePoc } from '@/hooks/usePoc'
import {
  useInteractions, useLogInteraction,
  type CreateInteractionInput,
} from '@/hooks/useInteraction'
import { PocCard } from './PocCard'
import { PocForm } from './PocForm'
import { AddMeetingForm } from './AddMeetingForm'
import { useAppSelector } from '@/store/hooks'

// ── Quick log interaction dialog ───────────────────────────────────────────────

const INTERACTION_TYPES = [
  'Call', 'In-Person Meeting', 'Site Visit',
  'Online Meeting', 'Email', 'WhatsApp', 'Internal',
] as const

const OUTCOME_TYPES = ['Positive', 'Neutral', 'Needs Follow-up', 'No Response'] as const

interface LogFormValues {
  interaction_type: string
  interaction_date: string
  summary: string
  outcome: string
}

function LogPocInteractionDialog({
  poc,
  partnerId,
  isOpen,
  onClose,
}: {
  poc: Poc | null
  partnerId: number
  isOpen: boolean
  onClose: () => void
}) {
  const logMutation = useLogInteraction(partnerId)
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<LogFormValues>({
    defaultValues: {
      interaction_type: '',
      interaction_date: new Date().toISOString().split('T')[0],
      summary: '',
      outcome: '',
    },
  })

  async function onSubmit(values: LogFormValues) {
    if (!poc) return
    const payload: CreateInteractionInput = {
      interaction_type: values.interaction_type,
      interaction_date: values.interaction_date,
      summary: values.summary,
      outcome: values.outcome,
      poc_id: poc.id,
    }
    try {
      await logMutation.mutateAsync(payload)
      toast.success('Interaction logged')
      reset()
      onClose()
    } catch {
      toast.error('Failed to log interaction')
    }
  }

  function handleClose() { reset(); onClose() }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="size-4 text-orange-500" />
            Log Interaction with {poc?.poc_name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('interaction_type', { required: true })}
                className={cn(
                  'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
                  errors.interaction_type && 'border-red-400'
                )}
              >
                <option value="">Select…</option>
                {INTERACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('interaction_date', { required: true })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="What happened?"
              {...register('summary', { required: true })}
              className={cn(
                'w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
                errors.summary && 'border-red-400'
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Outcome <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {OUTCOME_TYPES.map((o) => {
                const field = register('outcome', { required: true })
                return (
                  <label
                    key={o}
                    className={cn(
                      'flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition-all select-none',
                      watch('outcome') === o
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50 text-foreground'
                    )}
                  >
                    <input type="radio" className="sr-only" value={o} {...field} />
                    {o}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-1 border-t border-border">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-white hover:bg-primary/90"
              disabled={logMutation.isPending}
            >
              {logMutation.isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
              Log Interaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface PocTabContentProps {
  partnerId: number
}

export function PocTabContent({ partnerId }: PocTabContentProps) {
  const [pocFormOpen, setPocFormOpen] = useState(false)
  const [editingPoc, setEditingPoc] = useState<Poc | null>(null)
  const [meetingFormOpen, setMeetingFormOpen] = useState(false)
  const [selectedPocForMeeting, setSelectedPocForMeeting] = useState<Poc | null>(null)
  const [logInteractionPoc, setLogInteractionPoc] = useState<Poc | null>(null)

  const userRole = useAppSelector((s) => s.auth.user?.user_role)
  const canCreate =
    userRole === 'super_admin' ||
    userRole === 'admin' ||
    userRole === 'manager' ||
    userRole === 'CO Full Time' ||
    userRole === 'CO Part Time' ||
    userRole === 'CHO,CO Part Time'

  const { data: pocData, isLoading: pocsLoading } = usePocsByPartner(partnerId)
  const { data: interactionData } = useInteractions(partnerId)
  const deletePoc = useDeletePoc(partnerId)

  const pocs = pocData?.result ?? []
  const interactions = interactionData?.result ?? []

  function handleAddMeeting(poc: Poc) {
    setSelectedPocForMeeting(poc)
    setMeetingFormOpen(true)
  }

  function handleEdit(poc: Poc) {
    setEditingPoc(poc)
    setPocFormOpen(true)
  }

  function handleDelete(poc: Poc) {
    if (!window.confirm(`Delete POC "${poc.poc_name}"? This cannot be undone.`)) return
    deletePoc.mutate(poc.id, {
      onSuccess: () => toast.success('POC deleted'),
      onError: () => toast.error('Failed to delete POC'),
    })
  }

  function handlePocFormClose() { setPocFormOpen(false); setEditingPoc(null) }
  function handleMeetingFormClose() { setMeetingFormOpen(false); setSelectedPocForMeeting(null) }

  if (pocsLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {pocs.length} POC{pocs.length !== 1 ? 's' : ''}
        </p>
        {canCreate && (
          <Button
            size="sm" variant="outline"
            className="h-7 px-2 text-xs border-primary text-primary hover:bg-primary/5"
            onClick={() => { setEditingPoc(null); setPocFormOpen(true) }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add POC
          </Button>
        )}
      </div>

      {pocs.length > 0 ? (
        <div className="space-y-3">
          {pocs.map((poc) => (
            <PocCard
              key={poc.id}
              poc={poc}
              interactions={interactions.filter((ix) => ix.poc_id === poc.id)}
              onAddMeeting={canCreate ? handleAddMeeting : undefined}
              onEdit={canCreate ? handleEdit : undefined}
              onDelete={handleDelete}
              onLogInteraction={canCreate ? (p) => setLogInteractionPoc(p) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 bg-muted rounded-full mb-3">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground text-sm">No POCs added yet</p>
          {canCreate && (
            <Button
              size="sm" variant="outline"
              className="mt-3 border-primary text-primary hover:bg-primary/5"
              onClick={() => setPocFormOpen(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add first POC
            </Button>
          )}
        </div>
      )}

      <PocForm poc={editingPoc} partnerId={partnerId} isOpen={pocFormOpen} onClose={handlePocFormClose} />
      <AddMeetingForm poc={selectedPocForMeeting} partnerId={partnerId} isOpen={meetingFormOpen} onClose={handleMeetingFormClose} />
      <LogPocInteractionDialog
        poc={logInteractionPoc}
        partnerId={partnerId}
        isOpen={!!logInteractionPoc}
        onClose={() => setLogInteractionPoc(null)}
      />
    </>
  )
}
