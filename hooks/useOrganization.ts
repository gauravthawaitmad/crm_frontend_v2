import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  PaginatedOrganizations,
  OrganizationDetail,
  ReallocateInput,
} from '@/types/organization'

const ORGS_KEY = ['organizations'] as const

// ── Queries ───────────────────────────────────────────────────────────────────

export function useOrganizations(params: { page: number; search?: string }) {
  return useQuery<PaginatedOrganizations>({
    queryKey: [...ORGS_KEY, params],
    queryFn: () =>
      api.get('/api/organizations', { params }).then((r) => r.data as PaginatedOrganizations),
    placeholderData: (prev) => prev,
  })
}

export function useOrganizationDetail(id: number | null) {
  return useQuery<{ result: OrganizationDetail }>({
    queryKey: [...ORGS_KEY, id],
    queryFn: () =>
      api
        .get(`/api/organizations/${id}`)
        .then((r) => r.data as { result: OrganizationDetail }),
    enabled: id != null,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useRenewMou() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      api
        .post(`/api/organizations/${id}/renew-mou`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ORGS_KEY })
      qc.invalidateQueries({ queryKey: [...ORGS_KEY, id] })
    },
  })
}

export function useReallocateCo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReallocateInput) =>
      api.post('/api/organizations/reallocate', data).then((r) => r.data),
    onSuccess: (_, { partner_id }) => {
      qc.invalidateQueries({ queryKey: ORGS_KEY })
      qc.invalidateQueries({ queryKey: [...ORGS_KEY, partner_id] })
    },
  })
}

export function useDeleteOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/organizations/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ORGS_KEY }),
  })
}
