'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { FUNDER_CONFIG } from '@/lib/partner-configs/funder.config'
import { useFunderList, useCreateFunder } from '@/hooks/useFunder'
import { useStates, useCities, useCOUsers } from '@/hooks/useReference'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { FunderPartner, CreateFunderInput, FunderStage } from '@/types/funder'

function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setD(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return d
}

function CreateFunderForm({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onCreated: (id: number) => void
}) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<CreateFunderInput>()
  const mutation = useCreateFunder()
  const { data: states } = useStates()
  const selectedStateId = watch('state_id')
  const { data: cities } = useCities(selectedStateId ? Number(selectedStateId) : undefined)
  const { data: coUsers } = useCOUsers()

  async function onSubmit(values: CreateFunderInput) {
    try {
      const res = await mutation.mutateAsync({
        ...values,
        state_id: Number(values.state_id),
        city_id: Number(values.city_id),
      })
      toast.success('Funder added')
      reset()
      onClose()
      onCreated(res.result.id)
    } catch {
      toast.error('Failed to create funder')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { reset(); onClose() }}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Funder</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium mb-1">Funder Name <span className="text-red-500">*</span></label>
            <input
              {...register('name', { required: 'Required' })}
              placeholder="Organization or person name"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Funder Type <span className="text-red-500">*</span></label>
            <select
              {...register('funder_type', { required: 'Required' })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select type…</option>
              <option value="corporate">Corporate / Company</option>
              <option value="individual">Individual Donor</option>
              <option value="grant">Grant / Foundation</option>
              <option value="group">Group / Community</option>
            </select>
            {errors.funder_type && <p className="text-xs text-red-500 mt-1">{errors.funder_type.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Assign CO <span className="text-red-500">*</span></label>
            <select
              {...register('co_id', { required: 'Required' })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select CO…</option>
              {(coUsers ?? []).map((u) => (
                <option key={u.user_id} value={u.user_id}>{u.user_display_name}</option>
              ))}
            </select>
            {errors.co_id && <p className="text-xs text-red-500 mt-1">{errors.co_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">State <span className="text-red-500">*</span></label>
              <select
                {...register('state_id', { required: 'Required', valueAsNumber: true })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select…</option>
                {(states ?? []).map((s) => <option key={s.id} value={s.id}>{s.state_name}</option>)}
              </select>
              {errors.state_id && <p className="text-xs text-red-500 mt-1">{errors.state_id.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">City <span className="text-red-500">*</span></label>
              <select
                {...register('city_id', { required: 'Required', valueAsNumber: true })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={!selectedStateId}
              >
                <option value="">Select…</option>
                {(cities ?? []).map((c) => <option key={c.id} value={c.id}>{c.city_name}</option>)}
              </select>
              {errors.city_id && <p className="text-xs text-red-500 mt-1">{errors.city_id.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Website</label>
            <input
              {...register('website')}
              placeholder="https://..."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { reset(); onClose() }}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark text-white" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding…' : 'Add Funder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const FUNDER_TYPE_LABELS: Record<string, string> = {
  corporate: 'Corporate',
  individual: 'Individual',
  grant: 'Grant',
  group: 'Group',
}

function FunderRow({ funder, onClick }: { funder: FunderPartner; onClick: () => void }) {
  const stage = FUNDER_CONFIG.stages.find((s) => s.id === funder.currentStage)
  const coName = funder.assigned_co?.user_display_name ?? 'Unassigned'

  return (
    <tr
      onClick={onClick}
      className="border-b border-border hover:bg-stone-50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3">
        <p className="font-semibold text-sm text-foreground">{funder.name}</p>
        {funder.city && (
          <p className="text-xs text-muted-foreground mt-0.5">{funder.city.name}, {funder.state?.name}</p>
        )}
      </td>
      <td className="px-4 py-3">
        {funder.funder_type && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            {FUNDER_TYPE_LABELS[funder.funder_type] ?? funder.funder_type}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {stage ? (
          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', stage.bg, stage.text)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', stage.dot)} />
            {stage.label}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{funder.currentStage}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {funder.active_commitment ? (
          <div>
            <p className="text-xs font-medium text-foreground truncate max-w-[180px]">
              {funder.active_commitment.amount_description}
            </p>
            {funder.active_commitment.amount != null && (
              <p className="text-xs text-primary font-semibold">
                ₹{Number(funder.active_commitment.amount).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">None</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{coName}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(funder.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
    </tr>
  )
}

export default function FundersPage() {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState<FunderStage | ''>('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 300)
  const { data, isLoading } = useFunderList({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    stage: stage || undefined,
  })

  const funders = data?.result ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1

  function handleCreated(id: number) {
    router.push(`/partnerships/funders/${id}`)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100">
            <DollarSign className="size-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Funders</h1>
            <p className="text-sm text-muted-foreground">
              {pagination ? `${pagination.total} total` : 'Loading…'}
            </p>
          </div>
        </div>
        <Button
          className="bg-primary hover:bg-primary-dark text-white gap-2"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="size-4" />
          Add Funder
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search funders…"
          className="rounded-lg border border-border px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setStage(''); setPage(1) }}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              stage === '' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            All
          </button>
          {FUNDER_CONFIG.stages.map((s) => (
            <button
              key={s.id}
              onClick={() => { setStage(s.id as FunderStage); setPage(1) }}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                stage === s.id ? cn(s.bg, s.text) : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Funder</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Type</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Stage</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Commitment</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">CO</th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Updated</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : funders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {search || stage ? 'No funders match your filters.' : 'No funders yet. Add one to get started.'}
                </td>
              </tr>
            ) : (
              funders.map((f) => (
                <FunderRow
                  key={f.id}
                  funder={f}
                  onClick={() => router.push(`/partnerships/funders/${f.id}`)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <CreateFunderForm
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
