import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  FunderPartner,
  FunderDetail,
  FunderCommitment,
  FunderDeliverable,
  CreateFunderInput,
  UpdateFunderDetailsInput,
  UpdateFunderStageInput,
  AddCommitmentInput,
  UpdateCommitmentInput,
  AddDeliverableInput,
  UpdateDeliverableInput,
  FunderListParams,
} from '@/types/funder'

const DASHBOARD_DELIVERABLES_KEY = ['dashboard', 'deliverables'] as const

// ── List ───────────────────────────────────────────────────────────────────────

export function useFunderList(params: FunderListParams = {}) {
  const { page = 1, limit = 20, search, stage } = params
  return useQuery({
    queryKey: ['funders', 'list', page, limit, search, stage],
    queryFn: async () => {
      const qs = new URLSearchParams()
      qs.set('page', String(page))
      qs.set('limit', String(limit))
      if (search) qs.set('search', search)
      if (stage) qs.set('stage', stage)
      const res = await api.get(`/api/funders?${qs}`)
      return res.data as {
        result: FunderPartner[]
        pagination: { total: number; page: number; totalPages: number }
      }
    },
    staleTime: 30_000,
  })
}

// ── Detail ─────────────────────────────────────────────────────────────────────

export function useFunderDetail(id: string | number | null) {
  return useQuery({
    queryKey: ['funders', 'detail', String(id)],
    queryFn: async () => {
      const res = await api.get(`/api/funders/${id}`)
      return res.data as { result: FunderDetail }
    },
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ── Create ─────────────────────────────────────────────────────────────────────

export function useCreateFunder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateFunderInput) => {
      const res = await api.post('/api/funders', data)
      return res.data as { result: { id: number } }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funders', 'list'] })
    },
  })
}

// ── Update Details ─────────────────────────────────────────────────────────────

export function useUpdateFunderDetails(id: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateFunderDetailsInput) => {
      const res = await api.patch(`/api/funders/${id}/details`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funders', 'detail', String(id)] })
      qc.invalidateQueries({ queryKey: ['funders', 'list'] })
    },
  })
}

// ── Stage Update ───────────────────────────────────────────────────────────────

export function useUpdateFunderStage(id: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateFunderStageInput) => {
      const res = await api.patch(`/api/funders/${id}/stage`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funders', 'detail', String(id)] })
      qc.invalidateQueries({ queryKey: ['funders', 'list'] })
    },
  })
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export function useDeleteFunder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/api/funders/${id}`)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funders', 'list'] })
    },
  })
}

// ── Commitments ────────────────────────────────────────────────────────────────

export function useAddFunderCommitment(partnerId: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: AddCommitmentInput) => {
      const res = await api.post(`/api/funders/${partnerId}/commitments`, data)
      return res.data as { result: FunderCommitment }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funders', 'detail', String(partnerId)] })
    },
  })
}

export function useUpdateFunderCommitment(partnerId: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ commitmentId, data }: { commitmentId: number; data: UpdateCommitmentInput }) => {
      const res = await api.patch(`/api/funders/${partnerId}/commitments/${commitmentId}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funders', 'detail', String(partnerId)] })
    },
  })
}

// ── Deliverables ───────────────────────────────────────────────────────────────

export function useAddDeliverable(partnerId: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: AddDeliverableInput) => {
      const res = await api.post(`/api/funders/${partnerId}/deliverables`, data)
      return res.data as { result: FunderDeliverable }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funders', 'detail', String(partnerId)] })
      qc.invalidateQueries({ queryKey: DASHBOARD_DELIVERABLES_KEY })
    },
  })
}

export function useUpdateDeliverable(partnerId: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ deliverableId, data }: { deliverableId: number; data: UpdateDeliverableInput }) => {
      const res = await api.patch(`/api/funders/deliverables/${deliverableId}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funders', 'detail', String(partnerId)] })
      qc.invalidateQueries({ queryKey: DASHBOARD_DELIVERABLES_KEY })
    },
  })
}

export function useDeleteDeliverable(partnerId: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (deliverableId: number) => {
      const res = await api.delete(`/api/funders/deliverables/${deliverableId}`)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funders', 'detail', String(partnerId)] })
    },
  })
}

export function useUploadDeliverableDoc(partnerId: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ deliverableId, file }: { deliverableId: number; file: File }) => {
      const formData = new FormData()
      formData.append('document', file)
      const res = await api.post(`/api/funders/deliverables/${deliverableId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funders', 'detail', String(partnerId)] })
    },
  })
}

// ── Dashboard deliverables ─────────────────────────────────────────────────────

export function useDashboardDeliverables() {
  return useQuery({
    queryKey: DASHBOARD_DELIVERABLES_KEY,
    queryFn: async () => {
      const res = await api.get('/api/dashboard/deliverables')
      return res.data as {
        result: {
          overdue: Array<{ id: number; partner_id: number; funder_name: string; description: string; due_date: string; status: string }>
          due_soon: Array<{ id: number; partner_id: number; funder_name: string; description: string; due_date: string; status: string }>
        }
      }
    },
    staleTime: 60_000,
  })
}
