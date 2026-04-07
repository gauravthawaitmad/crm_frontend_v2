'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Users, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { SOURCING_CONFIG } from '@/lib/partner-configs/sourcing.config'
import { useSourcingList, useCreateSourcing } from '@/hooks/useSourcing'
import { useStates, useCities, useCOUsers } from '@/hooks/useReference'
import { useForm } from 'react-hook-form'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import type { SourcingPartner, CreateSourcingInput } from '@/types/sourcing'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function CreateSourcingForm({
  isOpen, onClose, onCreated,
}: { isOpen: boolean; onClose: () => void; onCreated: (id: number) => void }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<CreateSourcingInput>()
  const mutation = useCreateSourcing()
  const { data: states } = useStates()
  const selectedStateId = watch('state_id')
  const { data: cities } = useCities(selectedStateId ? Number(selectedStateId) : undefined)
  const { data: coUsers } = useCOUsers()

  async function onSubmit(values: CreateSourcingInput) {
    try {
      const res = await mutation.mutateAsync(values)
      toast.success('Sourcing partner added')
      reset()
      onClose()
      onCreated(res.result.id)
    } catch {
      toast.error('Failed to create sourcing partner')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { reset(); onClose() }}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Sourcing Partner</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input {...register('name', { required: 'Required' })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. ABC College" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Organization Type <span className="text-red-500">*</span>
            </label>
            <select {...register('organization_type', { required: 'Required' })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Select type…</option>
              <option value="college">College / University</option>
              <option value="company">Company / Corporate</option>
              <option value="youth_club">Youth Club</option>
              <option value="community_group">Community Group</option>
              <option value="other">Other</option>
            </select>
            {errors.organization_type && <p className="text-xs text-red-500 mt-1">{errors.organization_type.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Assign CO <span className="text-red-500">*</span>
            </label>
            <select {...register('co_id', { required: 'Required' })}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Select CO…</option>
              {(coUsers ?? []).map((u) => (
                <option key={u.user_id} value={u.user_id}>{u.user_display_name}</option>
              ))}
            </select>
            {errors.co_id && <p className="text-xs text-red-500 mt-1">{errors.co_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select {...register('state_id', { required: 'Required', valueAsNumber: true })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select…</option>
                {(states ?? []).map((s) => <option key={s.id} value={s.id}>{s.state_name}</option>)}
              </select>
              {errors.state_id && <p className="text-xs text-red-500 mt-1">{errors.state_id.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <select {...register('city_id', { required: 'Required', valueAsNumber: true })}
                disabled={!selectedStateId}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50">
                <option value="">Select…</option>
                {(cities ?? []).map((c) => <option key={c.id} value={c.id}>{c.city_name}</option>)}
              </select>
              {errors.city_id && <p className="text-xs text-red-500 mt-1">{errors.city_id.message}</p>}
            </div>
          </div>
          <div className="flex gap-2 pt-1 border-t border-border">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
              Add Partner
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function SourcingListPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedStage, setSelectedStage] = useState<string | undefined>()
  const [showCreate, setShowCreate] = useState(false)
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, isError } = useSourcingList({
    page, limit: 20,
    search: debouncedSearch || undefined,
    stage: selectedStage,
  })

  const partners: SourcingPartner[] = data?.result ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{SOURCING_CONFIG.label}</h1>
            <p className="text-muted-foreground mt-1">Manage organizations that provide volunteers</p>
          </div>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New {SOURCING_CONFIG.singularLabel}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input type="text" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search sourcing partners…"
          className="w-64 rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedStage(undefined); setPage(1) }}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              !selectedStage ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/40')}>
            All stages
          </button>
          {SOURCING_CONFIG.stages.map((stage) => (
            <button key={stage.id}
              onClick={() => { setSelectedStage(stage.id === selectedStage ? undefined : stage.id); setPage(1) }}
              className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                selectedStage === stage.id
                  ? `${stage.bg} ${stage.text} border-transparent`
                  : 'bg-white text-muted-foreground border-border hover:border-primary/40')}>
              <span className={cn('size-1.5 rounded-full', stage.dot)} />
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Organization', 'Type', 'Stage', 'CO', 'Location', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                ))}
              </tr>
            ))}
            {isError && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Failed to load.</td></tr>
            )}
            {!isLoading && !isError && partners.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">No sourcing partners yet.</p>
                <Button size="sm" className="mt-4 bg-primary text-white hover:bg-primary/90" onClick={() => setShowCreate(true)}>
                  <Plus className="h-3 w-3" /> Add first partner
                </Button>
              </td></tr>
            )}
            {!isLoading && partners.map((p) => {
              const stage = SOURCING_CONFIG.stages.find((s) => s.id === p.currentStage)
              const orgType = p.sourcingDetail?.organization_type ?? p.sourcingDetail?.org_type
              return (
                <tr key={p.id}
                  onClick={() => router.push(`/partnerships/sourcing/${p.id}`)}
                  className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{p.partner_name}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{orgType?.replace(/_/g, ' ') ?? '—'}</td>
                  <td className="px-4 py-3">
                    {stage
                      ? <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', stage.bg, stage.text)}>
                          <span className={cn('size-1.5 rounded-full', stage.dot)} />{stage.label}
                        </span>
                      : <span className="text-xs text-muted-foreground">{p.currentStage}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.latestCo?.co?.user_display_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[p.city?.city_name, p.state?.state_name].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{pagination.total} partners</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)} className="h-8 w-8 p-0">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs">{page} / {pagination.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)} className="h-8 w-8 p-0">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <CreateSourcingForm
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(id) => router.push(`/partnerships/sourcing/${id}`)}
      />
    </div>
  )
}
