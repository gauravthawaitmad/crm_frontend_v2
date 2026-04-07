'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Package, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { VENDOR_CONFIG } from '@/lib/partner-configs/vendor.config'
import { useVendorList, useCreateVendor } from '@/hooks/useVendor'
import { useStates, useCities, useCOUsers } from '@/hooks/useReference'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StarRating } from '@/components/shared/StarRating'
import type { VendorPartner, CreateVendorInput } from '@/types/vendor'

function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setD(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return d
}

const VENDOR_TYPE_LABELS: Record<string, string> = {
  facilitator:    'Facilitator',
  speaker:        'Speaker',
  printer:        'Printer',
  venue_provider: 'Venue',
  event_service:  'Event Service',
  other:          'Other',
}

function CreateVendorForm({
  isOpen, onClose, onCreated,
}: { isOpen: boolean; onClose: () => void; onCreated: (id: number) => void }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<CreateVendorInput>()
  const mutation = useCreateVendor()
  const { data: states } = useStates()
  const selectedStateId = watch('state_id')
  const { data: cities } = useCities(selectedStateId ? Number(selectedStateId) : undefined)
  const { data: coUsers } = useCOUsers()

  async function onSubmit(values: CreateVendorInput) {
    try {
      const res = await mutation.mutateAsync({
        ...values,
        state_id: Number(values.state_id),
        city_id: Number(values.city_id),
      })
      toast.success('Vendor added')
      reset()
      onClose()
      onCreated(res.result.id)
    } catch {
      toast.error('Failed to create vendor')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { reset(); onClose() }}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Vendor</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium mb-1">Vendor Name <span className="text-red-500">*</span></label>
            <input
              {...register('name', { required: 'Required' })}
              placeholder="PrintFast, EventPro..."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Type <span className="text-red-500">*</span></label>
            <select
              {...register('vendor_type', { required: 'Required' })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select type…</option>
              <option value="facilitator">Facilitator</option>
              <option value="speaker">Speaker</option>
              <option value="printer">Printer / Materials</option>
              <option value="venue_provider">Venue Provider</option>
              <option value="event_service">Event Service</option>
              <option value="other">Other</option>
            </select>
            {errors.vendor_type && <p className="text-xs text-red-500 mt-1">{errors.vendor_type.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Services They Provide</label>
            <textarea
              {...register('services_description')}
              rows={2}
              placeholder="What does this vendor do?"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { reset(); onClose() }}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding…' : 'Add Vendor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function VendorRow({ vendor, onClick }: { vendor: VendorPartner; onClick: () => void }) {
  const stage = VENDOR_CONFIG.stages.find((s) => s.id === vendor.currentStage)
  const coName = vendor.assigned_co?.user_display_name ?? 'Unassigned'

  return (
    <tr
      onClick={onClick}
      className="border-b border-border hover:bg-stone-50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3">
        <p className="font-semibold text-sm text-foreground">{vendor.name}</p>
        {vendor.city && (
          <p className="text-xs text-muted-foreground mt-0.5">{vendor.city.name}, {vendor.state?.name}</p>
        )}
      </td>
      <td className="px-4 py-3">
        {vendor.vendor_type && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
            {VENDOR_TYPE_LABELS[vendor.vendor_type] ?? vendor.vendor_type}
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
          <span className="text-xs text-muted-foreground">{vendor.currentStage}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <StarRating value={vendor.average_rating} readOnly size="sm" showValue count={vendor.total_engagements} />
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-foreground">{coName}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {new Date(vendor.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </td>
    </tr>
  )
}

export default function VendorsPage() {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedStage, setSelectedStage] = useState<string | undefined>()
  const [selectedType, setSelectedType] = useState<string | undefined>()
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'name'>('recent')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useVendorList({
    page,
    search: debouncedSearch || undefined,
    stage: selectedStage,
    vendor_type: selectedType,
    sort_by: sortBy,
  })

  const vendors = data?.result ?? []
  const pagination = data?.pagination

  function handleExport() {
    const token = localStorage.getItem('auth')
    const a = document.createElement('a')
    a.href = `/api/vendors/export`
    a.download = `vendors-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vendors</h1>
            <p className="text-muted-foreground mt-1">Manage external service providers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="size-4" /> Export CSV
          </Button>
          <Button
            className="bg-primary text-white hover:bg-primary/90 gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" /> New Vendor
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search vendors..."
          className="w-56 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        {/* Stage chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setSelectedStage(undefined); setPage(1) }}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              !selectedStage
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-muted-foreground border-border hover:border-primary/40'
            )}
          >
            All stages
          </button>
          {VENDOR_CONFIG.stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => { setSelectedStage(stage.id === selectedStage ? undefined : stage.id); setPage(1) }}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                selectedStage === stage.id
                  ? `${stage.bg} ${stage.text} border-transparent`
                  : 'bg-white text-muted-foreground border-border hover:border-primary/40'
              )}
            >
              <span className={cn('size-1.5 rounded-full', stage.dot)} />
              {stage.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={selectedType ?? ''}
          onChange={(e) => { setSelectedType(e.target.value || undefined); setPage(1) }}
          className="text-xs border border-border rounded-lg px-2 py-1.5 bg-white focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="facilitator">Facilitator</option>
          <option value="speaker">Speaker</option>
          <option value="printer">Printer</option>
          <option value="venue_provider">Venue Provider</option>
          <option value="event_service">Event Service</option>
          <option value="other">Other</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="text-xs border border-border rounded-lg px-2 py-1.5 bg-white focus:outline-none"
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rated</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Vendor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Rating</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">CO</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Updated</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No vendors found. Add your first vendor above.
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <VendorRow
                  key={vendor.id}
                  vendor={vendor}
                  onClick={() => router.push(`/partnerships/vendors/${vendor.id}`)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {pagination.total} vendors · page {page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      <CreateVendorForm
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => router.push(`/partnerships/vendors/${id}`)}
      />
    </div>
  )
}
