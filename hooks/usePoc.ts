import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Poc, PocWithPartner, CreatePocInput, UpdatePocInput, AddMeetingInput, Meeting } from '@/types/poc'

// ── Pagination response shape ──────────────────────────────────────────────────

interface PaginatedPocResponse {
  result: PocWithPartner[]
  pagination: { total: number; page: number; totalPages: number; limit: number }
}

// ── Query Keys ────────────────────────────────────────────────────────────────

const pocsByPartnerKey = (partnerId: number) => ['pocs', 'by-partner', partnerId] as const

// ── Queries ───────────────────────────────────────────────────────────────────

export function useAllPocs({
  page = 1,
  limit = 20,
  search,
}: {
  page?: number
  limit?: number
  search?: string
}) {
  return useQuery<PaginatedPocResponse>({
    queryKey: ['pocs', 'all', { page, limit, search }],
    queryFn: () =>
      api
        .get('/api/pocs/all', { params: { page, limit, search: search || undefined } })
        .then((r) => r.data as PaginatedPocResponse),
    staleTime: 30 * 1000,
  })
}

export function usePocsByPartner(partnerId: number | null) {
  return useQuery<{ result: Poc[] }>({
    queryKey: pocsByPartnerKey(partnerId ?? 0),
    queryFn: () =>
      api
        .get('/api/pocs', { params: { partner_id: partnerId } })
        .then((r) => r.data as { result: Poc[] }),
    enabled: partnerId != null && partnerId > 0,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreatePoc(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePocInput) =>
      api.post('/api/pocs', data).then((r) => r.data as { result: Poc }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pocsByPartnerKey(partnerId) })
    },
  })
}

export function useUpdatePoc(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePocInput }) =>
      api.patch(`/api/pocs/${id}`, data).then((r) => r.data as { result: Poc }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pocsByPartnerKey(partnerId) })
    },
  })
}

export function useDeletePoc(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/pocs/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pocsByPartnerKey(partnerId) })
    },
  })
}

export function useAddMeeting(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pocId, data }: { pocId: number; data: AddMeetingInput }) =>
      api
        .post(`/api/pocs/${pocId}/meetings`, data, { params: { partner_id: partnerId } })
        .then((r) => r.data as { result: Meeting }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pocsByPartnerKey(partnerId) })
    },
  })
}
