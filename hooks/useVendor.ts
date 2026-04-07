import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  VendorPartner,
  VendorDetail,
  VendorEngagement,
  CreateVendorInput,
  UpdateVendorDetailsInput,
  UpdateVendorStageInput,
  AddEngagementInput,
  UpdateEngagementInput,
  VendorListParams,
} from '@/types/vendor'

// ── List ───────────────────────────────────────────────────────────────────────

export function useVendorList(params: VendorListParams = {}) {
  const { page = 1, limit = 20, search, stage, vendor_type, sort_by } = params
  return useQuery({
    queryKey: ['vendors', 'list', page, limit, search, stage, vendor_type, sort_by],
    queryFn: async () => {
      const qs = new URLSearchParams()
      qs.set('page', String(page))
      qs.set('limit', String(limit))
      if (search) qs.set('search', search)
      if (stage) qs.set('stage', stage)
      if (vendor_type) qs.set('vendor_type', vendor_type)
      if (sort_by) qs.set('sort_by', sort_by)
      const res = await api.get(`/api/vendors?${qs}`)
      return res.data as {
        result: VendorPartner[]
        pagination: { total: number; page: number; totalPages: number }
      }
    },
    staleTime: 30_000,
  })
}

// ── Detail ─────────────────────────────────────────────────────────────────────

export function useVendorDetail(id: string | number | null) {
  return useQuery({
    queryKey: ['vendors', 'detail', String(id)],
    queryFn: async () => {
      const res = await api.get(`/api/vendors/${id}`)
      return res.data as { result: VendorDetail }
    },
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ── Create ─────────────────────────────────────────────────────────────────────

export function useCreateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateVendorInput) => {
      const res = await api.post('/api/vendors', data)
      return res.data as { result: { id: number } }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors', 'list'] })
    },
  })
}

// ── Update Details ─────────────────────────────────────────────────────────────

export function useUpdateVendorDetails(id: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateVendorDetailsInput) => {
      const res = await api.patch(`/api/vendors/${id}/details`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors', 'detail', String(id)] })
      qc.invalidateQueries({ queryKey: ['vendors', 'list'] })
    },
  })
}

// ── Stage Update ───────────────────────────────────────────────────────────────

export function useUpdateVendorStage(id: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateVendorStageInput) => {
      const res = await api.patch(`/api/vendors/${id}/stage`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors', 'detail', String(id)] })
      qc.invalidateQueries({ queryKey: ['vendors', 'list'] })
    },
  })
}

// ── Upload Contract ────────────────────────────────────────────────────────────

export function useUploadContract(vendorId: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('contract', file)
      const res = await api.post(`/api/vendors/${vendorId}/contract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors', 'detail', String(vendorId)] })
    },
  })
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export function useDeleteVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/api/vendors/${id}`)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors', 'list'] })
    },
  })
}

// ── Engagements ────────────────────────────────────────────────────────────────

export function useAddEngagement(vendorId: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: AddEngagementInput) => {
      const res = await api.post(`/api/vendors/${vendorId}/engagements`, data)
      return res.data as { result: VendorEngagement }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors', 'detail', String(vendorId)] })
      qc.invalidateQueries({ queryKey: ['vendors', 'list'] })
    },
  })
}

export function useUpdateEngagement(vendorId: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ engagementId, data }: { engagementId: number; data: UpdateEngagementInput }) => {
      const res = await api.patch(`/api/vendors/engagements/${engagementId}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors', 'detail', String(vendorId)] })
      qc.invalidateQueries({ queryKey: ['vendors', 'list'] })
    },
  })
}

export function useDeleteEngagement(vendorId: string | number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (engagementId: number) => {
      const res = await api.delete(`/api/vendors/engagements/${engagementId}?vendor_id=${vendorId}`)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors', 'detail', String(vendorId)] })
      qc.invalidateQueries({ queryKey: ['vendors', 'list'] })
    },
  })
}

// ── Reference: available schools ───────────────────────────────────────────────

export function useAvailableSchools(search: string) {
  return useQuery({
    queryKey: ['reference', 'schools', search],
    queryFn: async () => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : ''
      const res = await api.get(`/api/reference/schools${qs}`)
      return res.data.result as Array<{ id: number; partner_name: string; city_name?: string }>
    },
    staleTime: 60_000,
    enabled: search.length >= 2,
  })
}
