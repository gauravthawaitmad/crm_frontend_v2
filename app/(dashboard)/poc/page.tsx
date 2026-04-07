'use client'

import { useState } from 'react'
import { Contact } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/modules/lead/SearchBar'
import { EmptyState } from '@/components/modules/lead/EmptyState'
import { LeadsPagination } from '@/components/modules/lead/LeadsPagination'
import { useAllPocs } from '@/hooks/usePoc'
import { useDebounce } from '@/hooks/useDebounce'
import type { PocWithPartner } from '@/types/poc'
import Link from 'next/link'

export default function PocPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search, 300)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const { data, isLoading, isError } = useAllPocs({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
  })

  const pocs: PocWithPartner[] = data?.result ?? []
  const pagination = data?.pagination
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <Contact className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Points of Contact</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : `${total} contact${total !== 1 ? 's' : ''} across all partners`}
          </p>
        </div>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={handleSearchChange} />

      {/* Content */}
      {isLoading ? (
        <PocTableSkeleton />
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-medium">Failed to load contacts</p>
          <p className="text-red-500 text-sm mt-1">
            Check that the backend is running and you are authenticated.
          </p>
        </div>
      ) : pocs.length === 0 ? (
        <EmptyState
          title="No contacts found"
          description={
            search
              ? 'Try adjusting your search.'
              : 'Contacts will appear here once POCs are added to leads or organizations.'
          }
        />
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Designation</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Partner</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pocs.map((poc) => (
                  <tr
                    key={poc.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{poc.poc_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {poc.poc_designation || <span className="text-stone-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-foreground">{poc.poc_contact}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {poc.poc_email ? (
                        <a
                          href={`mailto:${poc.poc_email}`}
                          className="hover:text-primary transition-colors"
                        >
                          {poc.poc_email}
                        </a>
                      ) : (
                        <span className="text-stone-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/lead/${poc.partner_id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {poc.partner_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {poc.date_of_first_contact
                        ? new Date(poc.date_of_first_contact).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : <span className="text-stone-400 italic">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <LeadsPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PocTableSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
      <div className="bg-muted/40 px-4 py-3 grid grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="px-4 py-3 border-t border-border grid grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <Skeleton key={j} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  )
}
