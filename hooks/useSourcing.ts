import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  SourcingPartner, SourcingPartnerFull, PartnerCommitment, TaggedSchool,
  CreateSourcingInput, UpdateSourcingDetailsInput, UpdateSourcingStageInput,
  AddCommitmentInput, UpdateCommitmentInput,
} from '@/types/sourcing'

// ── List ───────────────────────────────────────────────────────────────────────

interface SourcingListParams {
  page?: number
  limit?: number
  search?: string
  stage?: string
}

export function useSourcingList(params: SourcingListParams = {}) {
  const { page = 1, limit = 20, search, stage } = params
  return useQuery({
    queryKey: ['sourcing', page, limit, search, stage],
    queryFn: async () => {
      const qs = new URLSearchParams()
      qs.set('page', String(page))
      qs.set('limit', String(limit))
      if (search) qs.set('search', search)
      if (stage) qs.set('stage', stage)
      const res = await api.get(`/api/sourcing?${qs}`)
      return res.data as {
        result: SourcingPartner[]
        pagination: { total: number; page: number; totalPages: number }
      }
    },
    staleTime: 30_000,
  })
}

// ── Detail ─────────────────────────────────────────────────────────────────────

export function useSourcingDetail(id: number | null) {
  return useQuery({
    queryKey: ['sourcing', id],
    queryFn: async () => {
      const res = await api.get(`/api/sourcing/${id}`)
      return res.data as { result: SourcingPartnerFull }
    },
    enabled: !!id && id > 0,
    staleTime: 30_000,
  })
}

// ── Create ─────────────────────────────────────────────────────────────────────

export function useCreateSourcing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateSourcingInput) => {
      const res = await api.post('/api/sourcing', data)
      return res.data as { result: { id: number; name: string } }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sourcing'] })
    },
  })
}

// ── Update Details ─────────────────────────────────────────────────────────────

export function useUpdateSourcingDetails(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateSourcingDetailsInput) => {
      const res = await api.patch(`/api/sourcing/${id}/details`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sourcing', id] })
      qc.invalidateQueries({ queryKey: ['sourcing'] })
    },
  })
}

// ── Update Stage ───────────────────────────────────────────────────────────────

export function useUpdateSourcingStage(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateSourcingStageInput) => {
      const res = await api.patch(`/api/sourcing/${id}/stage`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sourcing', id] })
      qc.invalidateQueries({ queryKey: ['sourcing'] })
    },
  })
}

// ── Reactivate ─────────────────────────────────────────────────────────────────

export function useReactivateSourcing(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { notes?: string }) => {
      const res = await api.patch(`/api/partners/${id}/reactivate`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sourcing', id] })
      qc.invalidateQueries({ queryKey: ['sourcing'] })
    },
  })
}

// ── Commitments ────────────────────────────────────────────────────────────────

export function useSourcingCommitments(id: number) {
  return useQuery({
    queryKey: ['sourcing-commitments', id],
    queryFn: async () => {
      const res = await api.get(`/api/sourcing/${id}/commitments`)
      return res.data as { result: PartnerCommitment[] }
    },
    enabled: id > 0,
    staleTime: 60_000,
  })
}

export function useAddCommitment(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: AddCommitmentInput) => {
      const res = await api.post(`/api/sourcing/${id}/commitments`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sourcing-commitments', id] })
      qc.invalidateQueries({ queryKey: ['sourcing', id] })
    },
  })
}

export function useUpdateCommitment(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ commitmentId, data }: { commitmentId: number; data: UpdateCommitmentInput }) => {
      const res = await api.patch(`/api/sourcing/${partnerId}/commitments/${commitmentId}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sourcing-commitments', partnerId] })
      qc.invalidateQueries({ queryKey: ['sourcing', partnerId] })
    },
  })
}

// ── School Tags ────────────────────────────────────────────────────────────────

export function useSourcingSchoolTags(id: number) {
  return useQuery({
    queryKey: ['sourcing-schools', id],
    queryFn: async () => {
      const res = await api.get(`/api/sourcing/${id}/schools`)
      return res.data as { result: TaggedSchool[] }
    },
    enabled: id > 0,
    staleTime: 60_000,
  })
}

export function useAvailableSchools(id: number, search: string) {
  return useQuery({
    queryKey: ['sourcing-available-schools', id, search],
    queryFn: async () => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : ''
      const res = await api.get(`/api/sourcing/${id}/schools/available${qs}`)
      return res.data as { result: Array<{ id: number; partner_name: string; city: string; state: string; status: string }> }
    },
    enabled: id > 0,
    staleTime: 10_000,
  })
}

export function useTagSchool(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (schoolPartnerId: number) => {
      const res = await api.post(`/api/sourcing/${id}/schools`, { school_partner_id: schoolPartnerId })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sourcing-schools', id] })
      qc.invalidateQueries({ queryKey: ['sourcing', id] })
    },
  })
}

export function useRemoveSchoolTag(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (schoolPartnerId: number) => {
      const res = await api.delete(`/api/sourcing/${id}/schools/${schoolPartnerId}`)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sourcing-schools', id] })
      qc.invalidateQueries({ queryKey: ['sourcing', id] })
    },
  })
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export function useDeleteSourcing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/api/sourcing/${id}`)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sourcing'] })
    },
  })
}
