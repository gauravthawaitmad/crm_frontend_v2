import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  PaginatedLeads,
  Lead,
  LeadDetail,
  CreateLeadInput,
  UpdateLeadStageInput,
} from '@/types/lead'

const LEADS_KEY = ['leads'] as const

// ── Queries ───────────────────────────────────────────────────────────────────

export function useLeads(params: { page: number; search?: string; stage?: string }) {
  return useQuery<PaginatedLeads>({
    queryKey: [...LEADS_KEY, params],
    queryFn: () =>
      api.get('/api/leads', { params }).then((r) => r.data as PaginatedLeads),
    placeholderData: (prev) => prev, // keep previous data while fetching new page
  })
}

/** Fetches all leads (up to 500) for kanban view — no pagination */
export function useAllLeads() {
  return useQuery<PaginatedLeads>({
    queryKey: [...LEADS_KEY, { all: true }],
    queryFn: () =>
      api.get('/api/leads', { params: { page: 1, limit: 500 } }).then((r) => r.data as PaginatedLeads),
    staleTime: 30_000,
  })
}

export function useLeadDetail(id: number | null) {
  return useQuery<{ result: LeadDetail }>({
    queryKey: [...LEADS_KEY, id],
    queryFn: () =>
      api.get(`/api/leads/${id}`).then((r) => r.data as { result: LeadDetail }),
    enabled: id != null,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLeadInput) =>
      api.post('/api/leads', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LEADS_KEY }),
  })
}

export function useUpdateLeadStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLeadStageInput | FormData }) =>
      api.patch(`/api/leads/${id}`, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: LEADS_KEY })
      qc.invalidateQueries({ queryKey: [...LEADS_KEY, id] })
    },
  })
}

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/leads/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LEADS_KEY }),
  })
}
