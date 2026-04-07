'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, LayoutList, Columns, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SearchBar } from '@/components/modules/lead/SearchBar'
import { FilterChips } from '@/components/modules/lead/FilterChips'
import { LeadTable } from '@/components/modules/lead/LeadTable'
import { PipelineStats } from '@/components/modules/lead/PipelineStats'
import { EmptyState } from '@/components/modules/lead/EmptyState'
import { LeadsPagination } from '@/components/modules/lead/LeadsPagination'
import { LeadForm } from '@/components/modules/lead/LeadForm'
import { LeadKanban } from '@/components/modules/lead/LeadKanban'
import { useLeads, useAllLeads, useDeleteLead } from '@/hooks/useLead'
import { useDebounce } from '@/hooks/useDebounce'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Lead, LeadDetail, ConversionStage } from '@/types/lead'

const VIEW_KEY = 'lead_view_preference'

export default function LeadPage() {
  const [view, setView] = useState<'table' | 'kanban'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(VIEW_KEY) as 'table' | 'kanban') || 'table'
    }
    return 'table'
  })

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState<ConversionStage | undefined>()

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'update'>('create')
  const [formLead, setFormLead] = useState<Lead | LeadDetail | undefined>()

  const debouncedSearch = useDebounce(search, 300)
  const token = useAppSelector((s) => s.auth.token)

  const handleSearchChange = (val: string) => { setSearch(val); setPage(1) }
  const handleStageChange = (s: ConversionStage | undefined) => { setStage(s); setPage(1) }

  function switchView(v: 'table' | 'kanban') {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  // Table mode: paginated query
  const tableQuery = useLeads({
    page,
    search: debouncedSearch || undefined,
    stage: view === 'table' ? stage : undefined,
  })

  // Kanban mode: all leads (limit 500)
  const kanbanQuery = useAllLeads()

  const isKanban = view === 'kanban'
  const { data, isLoading, isError } = isKanban ? kanbanQuery : tableQuery

  const deleteMutation = useDeleteLead()

  const leads = data?.result ?? []
  const pagination = data?.pagination
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Lead deleted successfully'),
      onError: () => toast.error('Failed to delete lead'),
    })
  }

  const handleOpenCreate = () => {
    setFormMode('create')
    setFormLead(undefined)
    setFormOpen(true)
  }

  const handleOpenEdit = (lead: Lead | LeadDetail) => {
    setFormMode('update')
    setFormLead(lead)
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    setFormOpen(false)
    setFormLead(undefined)
  }

  // ── CSV Export ──────────────────────────────────────────────────────────────

  function handleExport() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? ''
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (stage) params.set('stage', stage)
    const url = `${apiBase}/api/leads/export?${params.toString()}`

    toast.info('Preparing export…', { duration: 2000 })

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Export failed')
        return res.blob()
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(blobUrl)
      })
      .catch(() => toast.error('Export failed'))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lead Pipeline</h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? 'Loading…' : `Managing ${total} lead${total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Export button */}
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-stone-300 text-stone-600 hover:border-orange-400 hover:text-orange-600"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden border border-stone-200">
            <button
              onClick={() => switchView('table')}
              title="Table view"
              className={cn(
                'p-2 transition-colors',
                view === 'table'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => switchView('kanban')}
              title="Kanban view"
              className={cn(
                'p-2 transition-colors border-l border-stone-200',
                view === 'kanban'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              )}
            >
              <Columns className="h-4 w-4" />
            </button>
          </div>
          <Button className="bg-primary text-white hover:bg-primary/90" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Pipeline Stats — table mode only */}
      {!isKanban && !isLoading && leads.length > 0 && (
        <PipelineStats leads={leads} total={total} />
      )}

      {/* Search + Filter chips (filter hidden in kanban — columns are the filter) */}
      <div className="space-y-3">
        <SearchBar value={search} onChange={handleSearchChange} />
        {!isKanban && (
          <FilterChips selectedStage={stage} onStageSelect={handleStageChange} />
        )}
      </div>

      {/* ── Kanban view ───────────────────────────────────────────────────────── */}
      {isKanban ? (
        isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 rounded-xl shrink-0" style={{ width: 280 }} />
            ))}
          </div>
        ) : (
          <LeadKanban leads={leads as Lead[]} search={debouncedSearch || undefined} />
        )
      ) : (
        /* ── Table view ──────────────────────────────────────────────────────── */
        isLoading ? (
          <LeadTableSkeleton />
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600 font-medium">Failed to load leads</p>
            <p className="text-red-500 text-sm mt-1">Check that the backend is running and you are authenticated.</p>
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description={search || stage ? 'Try adjusting your search or stage filter.' : 'Start adding leads to your pipeline.'}
          />
        ) : (
          <>
            <LeadTable leads={leads as Lead[]} onEdit={handleOpenEdit} onDelete={handleDelete} />
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <LeadsPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )
      )}

      {/* Create / Update Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'New Lead' : `Update — ${formLead?.partner_name ?? ''}`}
            </DialogTitle>
          </DialogHeader>
          <LeadForm
            mode={formMode}
            lead={formLead}
            onSuccess={handleFormSuccess}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LeadTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-3"><Skeleton className="h-5 w-full" /></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-3 border-t border-border flex gap-4">
            {[1, 2, 3, 4, 5, 6].map((j) => <Skeleton key={j} className="h-5 flex-1" />)}
          </div>
        ))}
      </div>
    </div>
  )
}
