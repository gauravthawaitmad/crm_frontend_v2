import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Notification {
  id: number
  user_id: string
  type: string
  message: string
  partner_id?: number | null
  partner_name?: string | null
  is_read: boolean
  createdAt: string
}

export interface UnreadCountResponse {
  result: { unread_count: number }
}

export interface NotificationsResponse {
  result: Notification[]
}

// ── Query Keys ─────────────────────────────────────────────────────────────────

const UNREAD_KEY = ['notifications', 'unread-count'] as const
const NOTIFICATIONS_KEY = ['notifications', 'list'] as const

// ── Queries ────────────────────────────────────────────────────────────────────

export function useUnreadCount() {
  return useQuery<UnreadCountResponse>({
    queryKey: UNREAD_KEY,
    queryFn: () =>
      api
        .get('/api/notifications/unread-count')
        .then((r) => r.data as UnreadCountResponse),
    refetchInterval: 60_000, // poll every 60 seconds
    staleTime: 30_000,
  })
}

export function useNotifications(enabled: boolean) {
  return useQuery<NotificationsResponse>({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () =>
      api
        .get('/api/notifications')
        .then((r) => r.data as NotificationsResponse),
    enabled,
    staleTime: 30_000,
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(`/api/notifications/${id}/read`, {}).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: UNREAD_KEY })
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api.patch('/api/notifications/read-all', {}).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: UNREAD_KEY })
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
    },
  })
}
