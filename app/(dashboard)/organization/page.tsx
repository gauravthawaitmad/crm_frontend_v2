'use client'

import { useState } from 'react'
import { Building2, Info, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { OrganizationTable } from '@/components/modules/organization/OrganizationTable'
import { MouRenewalForm } from '@/components/modules/organization/MouRenewalForm'
import { ReallocateForm } from '@/components/modules/organization/ReallocateForm'
import { SearchBar } from '@/components/modules/lead/SearchBar'
import { EmptyState } from '@/components/modules/lead/EmptyState'
import { LeadsPagination } from '@/components/modules/lead/LeadsPagination'
import {
  useOrganizations,
  useDeleteOrganization,
} from '@/hooks/useOrganization'
import { useDebounce } from '@/hooks/useDebounce'
import { useAppSelector } from '@/store/hooks'
import type { Organization } from '@/types/organization'
import { toast } from 'sonner'

export default function OrganizationPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  // Modal state
  const [renewOpen, setRenewOpen] = useState(false)
  const [renewTarget, setRenewTarget] = useState<Organization | null>(null)
  const [reallocateOpen, setReallocateOpen] = useState(false)
  const [reallocateTarget, setReallocateTarget] = useState<Organization | null>(null)

  const userRole = useAppSelector((s) => s.auth.user?.user_role)
  const token = useAppSelector((s) => s.auth.token)
  const canDelete = userRole === 'super_admin' || userRole === 'admin'

  function handleExport() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? ''
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    const url = `${apiBase}/api/organizations/export?${params.toString()}`

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
        a.download = `organizations-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(blobUrl)
      })
      .catch(() => toast.error('Export failed'))
  }

  const debouncedSearch = useDebounce(search, 300)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const { data, isLoading, isError } = useOrganizations({
    page,
    search: debouncedSearch || undefined,
  })

  const deleteMutation = useDeleteOrganization()

  const orgs = data?.result ?? []
  const pagination = data?.pagination
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1

  // ── Event handlers ─────────────────────────────────────────────────────────

  function handleRenewMou(org: Organization) {
    setRenewTarget(org)
    setRenewOpen(true)
  }

  function handleReallocate(org: Organization) {
    setReallocateTarget(org)
    setReallocateOpen(true)
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Organization deleted successfully'),
      onError: () => toast.error('Failed to delete organization'),
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Organizations</h1>
            {total > 0 && (
              <p className="text-sm text-muted-foreground">{total} active organization{total !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          className="border-stone-300 text-stone-600 hover:border-orange-400 hover:text-orange-600"
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Info note — no create button for organizations */}
      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
        <Info className="size-4 shrink-0 mt-0.5" />
        Organizations are created automatically when a lead is converted. Use the Leads module to convert a lead.
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load organizations"
          description="An error occurred while fetching organizations. Please try again."
        />
      ) : orgs.length === 0 ? (
        <EmptyState
          title={debouncedSearch ? 'No results found' : 'No organizations yet'}
          description={
            debouncedSearch
              ? `No organizations match "${debouncedSearch}"`
              : 'Organizations will appear here once leads are converted.'
          }
        />
      ) : (
        <>
          <OrganizationTable
            organizations={orgs}
            onRenewMou={handleRenewMou}
            onReallocate={handleReallocate}
            onDelete={handleDelete}
            canDelete={canDelete}
          />
          {totalPages > 1 && (
            <LeadsPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* MOU Renewal Modal */}
      <MouRenewalForm
        org={renewTarget}
        isOpen={renewOpen}
        onClose={() => { setRenewOpen(false); setRenewTarget(null) }}
      />

      {/* Reallocate CO Modal */}
      <ReallocateForm
        org={reallocateTarget}
        isOpen={reallocateOpen}
        onClose={() => { setReallocateOpen(false); setReallocateTarget(null) }}
      />
    </div>
  )
}
