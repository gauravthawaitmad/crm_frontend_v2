'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  ChevronDown, ChevronUp, Loader2, CheckCircle2, Trash2, Pencil,
  Phone, Users, MapPin, Video, Mail, MessageCircle, FileText, Plus,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/stages'
import { useCurrentUser } from '@/hooks/useAuth'
import { usePocsByPartner } from '@/hooks/usePoc'
import {
  useInteractions,
  useLogInteraction,
  useUpdateInteraction,
  useDeleteInteraction,
  useMarkFollowUpDone,
  type Interaction,
  type CreateInteractionInput,
  type UpdateInteractionInput,
} from '@/hooks/useInteraction'

// ── Constants ──────────────────────────────────────────────────────────────────

const INTERACTION_TYPES = [
  'Call', 'In-Person Meeting', 'Site Visit',
  'Online Meeting', 'Email', 'WhatsApp', 'Internal',
] as const

const OUTCOME_TYPES = [
  'Positive', 'Neutral', 'Needs Follow-up', 'No Response',
] as const

const TYPE_COLORS: Record<string, string> = {
  'Call': 'bg-blue-100 text-blue-700',
  'In-Person Meeting': 'bg-orange-100 text-orange-700',
  'Site Visit': 'bg-teal-100 text-teal-700',
  'Online Meeting': 'bg-violet-100 text-violet-700',
  'Email': 'bg-slate-100 text-slate-600',
  'WhatsApp': 'bg-green-100 text-green-700',
  'Internal': 'bg-stone-100 text-stone-600',
}

const OUTCOME_COLORS: Record<string, string> = {
  'Positive': 'bg-green-100 text-green-700',
  'Neutral': 'bg-stone-100 text-stone-600',
  'Needs Follow-up': 'bg-amber-100 text-amber-700',
  'No Response': 'bg-red-100 text-red-700',
}

function TypeIcon({ type }: { type: string }) {
  const cls = 'size-3.5 shrink-0'
  switch (type) {
    case 'Call': return <Phone className={cls} />
    case 'In-Person Meeting': return <Users className={cls} />
    case 'Site Visit': return <MapPin className={cls} />
    case 'Online Meeting': return <Video className={cls} />
    case 'Email': return <Mail className={cls} />
    case 'WhatsApp': return <MessageCircle className={cls} />
    default: return <FileText className={cls} />
  }
}

// ── Shared form values type ────────────────────────────────────────────────────

interface InteractionFormValues {
  interaction_type: string
  interaction_date: string
  duration_mins: string
  poc_id: string
  summary: string
  outcome: string
  next_steps: string
  follow_up_date: string
  follow_up_assigned_to: string
}

// ── Log Interaction Form ───────────────────────────────────────────────────────

function LogInteractionForm({
  partnerId,
  defaultPocId,
  onClose,
}: {
  partnerId: number
  defaultPocId?: number
  onClose: () => void
}) {
  const logMutation = useLogInteraction(partnerId)
  const { data: pocsData } = usePocsByPartner(partnerId)
  const pocs = pocsData?.result ?? []

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<InteractionFormValues>({
    defaultValues: {
      interaction_type: '',
      interaction_date: new Date().toISOString().split('T')[0],
      duration_mins: '',
      poc_id: defaultPocId ? String(defaultPocId) : '',
      summary: '',
      outcome: '',
      next_steps: '',
      follow_up_date: '',
      follow_up_assigned_to: '',
    },
  })

  const outcome = watch('outcome')
  const showFollowUp = outcome === 'Needs Follow-up'

  async function onSubmit(values: InteractionFormValues) {
    const payload: CreateInteractionInput = {
      interaction_type: values.interaction_type,
      interaction_date: values.interaction_date,
      summary: values.summary,
      outcome: values.outcome,
    }
    if (values.duration_mins) payload.duration_mins = Number(values.duration_mins)
    if (values.poc_id) payload.poc_id = Number(values.poc_id)
    if (values.next_steps) payload.next_steps = values.next_steps
    if (showFollowUp && values.follow_up_date) payload.follow_up_date = values.follow_up_date
    if (showFollowUp && values.follow_up_assigned_to) payload.follow_up_assigned_to = values.follow_up_assigned_to

    try {
      await logMutation.mutateAsync(payload)
      toast.success('Interaction logged')
      reset()
      onClose()
    } catch {
      toast.error('Failed to log interaction')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-stone-50 rounded-xl border border-border">
      <div className="grid grid-cols-2 gap-4">
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
            <option value="">Select type…</option>
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
            className={cn(
              'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
              errors.interaction_date && 'border-red-400'
            )}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Duration (mins)</label>
          <input
            type="number" min="1" placeholder="e.g. 30"
            {...register('duration_mins')}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">POC (optional)</label>
          <select
            {...register('poc_id')}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">No specific POC</option>
            {pocs.map((p) => <option key={p.id} value={p.id}>{p.poc_name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">
          Summary <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="What happened during this interaction?"
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

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Next Steps</label>
        <textarea
          rows={2}
          placeholder="What are the next actions?"
          {...register('next_steps')}
          className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {showFollowUp && (
        <div className="grid grid-cols-2 gap-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div>
            <label className="block text-xs font-medium text-amber-800 mb-1">Follow-up Date</label>
            <input
              type="date"
              {...register('follow_up_date')}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-amber-800 mb-1">Assigned To</label>
            <input
              type="text"
              placeholder="Name or user ID"
              {...register('follow_up_assigned_to')}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="submit" className="bg-primary text-white hover:bg-primary/90" disabled={logMutation.isPending}>
          {logMutation.isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
          Log Interaction
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

// ── Edit Interaction Form ──────────────────────────────────────────────────────

function EditInteractionForm({
  interaction,
  partnerId,
  onClose,
}: {
  interaction: Interaction
  partnerId: number
  onClose: () => void
}) {
  const updateMutation = useUpdateInteraction(partnerId)
  const { data: pocsData } = usePocsByPartner(partnerId)
  const pocs = pocsData?.result ?? []

  const { register, handleSubmit, watch, formState: { errors } } = useForm<InteractionFormValues>({
    defaultValues: {
      interaction_type: interaction.interaction_type,
      interaction_date: interaction.interaction_date?.split('T')[0] ?? '',
      duration_mins: interaction.duration_mins ? String(interaction.duration_mins) : '',
      poc_id: interaction.poc_id ? String(interaction.poc_id) : '',
      summary: interaction.summary,
      outcome: interaction.outcome,
      next_steps: interaction.next_steps ?? '',
      follow_up_date: interaction.follow_up_date ?? '',
      follow_up_assigned_to: interaction.follow_up_assigned_to ?? '',
    },
  })

  const outcome = watch('outcome')
  const showFollowUp = outcome === 'Needs Follow-up'

  async function onSubmit(values: InteractionFormValues) {
    const payload: UpdateInteractionInput = {
      interaction_type: values.interaction_type,
      interaction_date: values.interaction_date,
      summary: values.summary,
      outcome: values.outcome,
    }
    if (values.duration_mins) payload.duration_mins = Number(values.duration_mins)
    if (values.poc_id) payload.poc_id = Number(values.poc_id)
    payload.next_steps = values.next_steps || undefined
    if (showFollowUp && values.follow_up_date) payload.follow_up_date = values.follow_up_date
    if (showFollowUp && values.follow_up_assigned_to) payload.follow_up_assigned_to = values.follow_up_assigned_to

    try {
      await updateMutation.mutateAsync({ id: interaction.id, data: payload })
      toast.success('Interaction updated')
      onClose()
    } catch {
      toast.error('Failed to update interaction')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-3 border-t border-border">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Type</label>
          <select
            {...register('interaction_type', { required: true })}
            className={cn(
              'w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
              errors.interaction_type && 'border-red-400'
            )}
          >
            {INTERACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Date</label>
          <input
            type="date"
            {...register('interaction_date', { required: true })}
            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Duration (mins)</label>
          <input
            type="number" min="1"
            {...register('duration_mins')}
            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">POC</label>
          <select
            {...register('poc_id')}
            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">No specific POC</option>
            {pocs.map((p) => <option key={p.id} value={p.id}>{p.poc_name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Summary</label>
        <textarea
          rows={2}
          {...register('summary', { required: true })}
          className={cn(
            'w-full resize-none rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
            errors.summary && 'border-red-400'
          )}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Outcome</label>
        <div className="flex gap-2 flex-wrap">
          {OUTCOME_TYPES.map((o) => {
            const field = register('outcome', { required: true })
            return (
              <label
                key={o}
                className={cn(
                  'flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-lg border text-xs font-medium transition-all select-none',
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

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Next Steps</label>
        <textarea
          rows={1}
          {...register('next_steps')}
          className="w-full resize-none rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {showFollowUp && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div>
            <label className="block text-xs font-medium text-amber-800 mb-1">Follow-up Date</label>
            <input
              type="date"
              {...register('follow_up_date')}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-amber-800 mb-1">Assigned To</label>
            <input
              type="text"
              {...register('follow_up_assigned_to')}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="bg-primary text-white hover:bg-primary/90" disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="size-3 mr-1 animate-spin" />}
          Save
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

// ── Interaction Card ───────────────────────────────────────────────────────────

function InteractionCard({
  interaction,
  currentUserId,
  partnerId,
  isExpanded,
  onToggle,
}: {
  interaction: Interaction
  currentUserId: string
  partnerId: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const deleteMutation = useDeleteInteraction(partnerId)
  const markDoneMutation = useMarkFollowUpDone(partnerId)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const isOwner = interaction.conducted_by === currentUserId
  const hasFollowUp = !!interaction.follow_up_date && !interaction.follow_up_done
  const followUpDate = interaction.follow_up_date ? new Date(interaction.follow_up_date) : null
  const isOverdue = followUpDate ? followUpDate < new Date() : false

  const summaryTruncated = interaction.summary.length > 100
    ? interaction.summary.slice(0, 100) + '…'
    : interaction.summary

  function handleDelete() {
    deleteMutation.mutate(interaction.id, {
      onSuccess: () => { toast.success('Interaction deleted'); setConfirmDelete(false) },
      onError: () => toast.error('Failed to delete interaction'),
    })
  }

  function handleMarkDone() {
    markDoneMutation.mutate(interaction.id, {
      onSuccess: () => toast.success('Follow-up marked as done'),
      onError: () => toast.error('Failed to mark follow-up done'),
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start justify-between gap-2 hover:bg-muted/20 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', TYPE_COLORS[interaction.interaction_type] ?? 'bg-stone-100 text-stone-600')}>
              <TypeIcon type={interaction.interaction_type} />
              {interaction.interaction_type}
            </span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', OUTCOME_COLORS[interaction.outcome] ?? 'bg-stone-100 text-stone-600')}>
              {interaction.outcome}
            </span>
            {interaction.duration_mins && (
              <span className="text-xs text-muted-foreground">{interaction.duration_mins}m</span>
            )}
          </div>
          <p className="text-sm text-foreground leading-snug">
            {isExpanded ? interaction.summary : summaryTruncated}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(interaction.interaction_date)}
            {interaction.poc_name && <span> · with <span className="font-medium text-foreground">{interaction.poc_name}</span></span>}
          </p>
        </div>
        <div className="shrink-0 mt-0.5">
          {isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded body */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border bg-card">
          {/* Conducted by */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3">
            <span>By <span className="font-medium text-foreground">{interaction.conducted_by_name ?? interaction.conducted_by}</span></span>
          </div>

          {/* Next steps */}
          {interaction.next_steps && !isEditing && (
            <div className="text-sm">
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wide block mb-0.5">Next Steps</span>
              <p className="text-foreground">{interaction.next_steps}</p>
            </div>
          )}

          {/* Follow-up pill */}
          {interaction.follow_up_date && !isEditing && (
            <div className={cn(
              'flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs',
              interaction.follow_up_done
                ? 'bg-green-50 text-green-700'
                : isOverdue
                  ? 'bg-red-50 text-red-700'
                  : 'bg-amber-50 text-amber-700'
            )}>
              <div className="flex items-center gap-1.5">
                {interaction.follow_up_done && <CheckCircle2 className="size-3.5" />}
                <span>
                  {interaction.follow_up_done
                    ? 'Follow-up completed'
                    : isOverdue
                      ? `Follow-up overdue — ${interaction.follow_up_date}`
                      : `Follow-up on ${interaction.follow_up_date}`
                  }
                  {interaction.follow_up_assigned_to && (
                    <span className="ml-1 opacity-75">→ {interaction.follow_up_assigned_to}</span>
                  )}
                </span>
              </div>
              {!interaction.follow_up_done && hasFollowUp && (
                <button
                  onClick={handleMarkDone}
                  disabled={markDoneMutation.isPending}
                  className="text-xs font-medium underline hover:no-underline disabled:opacity-50"
                >
                  {markDoneMutation.isPending ? 'Marking…' : 'Mark done'}
                </button>
              )}
            </div>
          )}

          {/* Owner actions */}
          {isOwner && !isEditing && !confirmDelete && (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm" variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="size-3" /> Edit
              </Button>
              <Button
                size="sm" variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-red-500 gap-1"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-3" /> Delete
              </Button>
            </div>
          )}

          {/* Inline edit form */}
          {isEditing && (
            <EditInteractionForm
              interaction={interaction}
              partnerId={partnerId}
              onClose={() => setIsEditing(false)}
            />
          )}

          {/* Delete confirm */}
          {confirmDelete && (
            <div className="flex items-center gap-3 text-xs border-t border-border pt-2">
              <span className="text-red-600 font-medium">Delete this interaction?</span>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-red-600 font-semibold hover:underline disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface InteractionLogProps {
  partnerId: number
  readOnly?: boolean
  defaultPocId?: number
}

export function InteractionLog({ partnerId, readOnly = false, defaultPocId }: InteractionLogProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const { data, isLoading } = useInteractions(partnerId)
  const currentUser = useCurrentUser()
  const interactions = data?.result ?? []

  function toggleExpanded(id: number) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-4">
      {/* FIX 5: prominent orange outlined button */}
      {!readOnly && !formOpen && (
        <Button
          variant="outline"
          className="border-orange-400 text-orange-600 hover:bg-orange-50 w-full justify-center gap-2"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="size-4" />
          Log Interaction
        </Button>
      )}

      {formOpen && (
        <LogInteractionForm
          partnerId={partnerId}
          defaultPocId={defaultPocId}
          onClose={() => setFormOpen(false)}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : interactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 bg-muted rounded-full mb-3">
            <Pencil className="size-5 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm text-foreground">No interactions logged yet</p>
          {!readOnly && (
            <p className="text-xs text-muted-foreground mt-1">Click &quot;Log Interaction&quot; above to record the first one.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {interactions.map((interaction) => (
            <InteractionCard
              key={interaction.id}
              interaction={interaction}
              currentUserId={currentUser?.user_id ?? ''}
              partnerId={partnerId}
              isExpanded={expandedId === interaction.id}
              onToggle={() => toggleExpanded(interaction.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
