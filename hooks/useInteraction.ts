import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Interaction {
  id: number
  partner_id: number
  interaction_type: string
  interaction_date: string
  duration_mins?: number | null
  poc_id?: number | null
  poc_name?: string | null
  summary: string
  outcome: string
  next_steps?: string | null
  follow_up_date?: string | null
  follow_up_assigned_to?: string | null
  follow_up_done?: boolean
  conducted_by: string
  conducted_by_name?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateInteractionInput {
  interaction_type: string
  interaction_date: string
  duration_mins?: number
  poc_id?: number
  summary: string
  outcome: string
  next_steps?: string
  follow_up_date?: string
  follow_up_assigned_to?: string
}

export interface UpdateInteractionInput extends Partial<CreateInteractionInput> {
  follow_up_done?: boolean
}

export interface FollowUpItem {
  interaction_id: number
  partner_id: number
  partner_name: string
  entity_type: string
  partner_url: string
  follow_up_date: string
  next_steps?: string | null
  bucket: 'overdue' | 'today' | 'this_week'
  assigned_to?: string | null
}

export interface FollowUpSummary {
  overdue: FollowUpItem[]
  today: FollowUpItem[]
  this_week: FollowUpItem[]
  total: number
}

// ── Query Keys ─────────────────────────────────────────────────────────────────

const interactionsKey = (partnerId: number) => ['interactions', partnerId] as const
const FOLLOWUPS_KEY = ['dashboard', 'followups'] as const

// ── Queries ────────────────────────────────────────────────────────────────────

export function useInteractions(partnerId: number) {
  return useQuery<{ result: Interaction[] }>({
    queryKey: interactionsKey(partnerId),
    queryFn: () =>
      api
        .get(`/api/partners/${partnerId}/interactions`)
        .then((r) => r.data as { result: Interaction[] }),
    enabled: partnerId > 0,
    staleTime: 30_000,
  })
}

export function useDashboardFollowUps() {
  return useQuery<{ result: FollowUpSummary }>({
    queryKey: FOLLOWUPS_KEY,
    queryFn: () =>
      api
        .get('/api/dashboard/followups')
        .then((r) => r.data as { result: FollowUpSummary }),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000, // refresh every 5 minutes
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useLogInteraction(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInteractionInput) =>
      api
        .post(`/api/partners/${partnerId}/interactions`, data)
        .then((r) => r.data as { result: Interaction }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: interactionsKey(partnerId) })
      qc.invalidateQueries({ queryKey: FOLLOWUPS_KEY })
    },
  })
}

export function useUpdateInteraction(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInteractionInput }) =>
      api
        .patch(`/api/interactions/${id}`, data)
        .then((r) => r.data as { result: Interaction }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: interactionsKey(partnerId) })
      qc.invalidateQueries({ queryKey: FOLLOWUPS_KEY })
    },
  })
}

export function useMarkFollowUpDone(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (interactionId: number) =>
      api
        .patch(`/api/interactions/${interactionId}/followup-done`, {})
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: interactionsKey(partnerId) })
      qc.invalidateQueries({ queryKey: FOLLOWUPS_KEY })
    },
  })
}

export function useDeleteInteraction(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (interactionId: number) =>
      api.delete(`/api/interactions/${interactionId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: interactionsKey(partnerId) })
      qc.invalidateQueries({ queryKey: FOLLOWUPS_KEY })
    },
  })
}
