import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Comment } from '@/types/comment'

function commentKey(partnerId: number) {
  return ['comments', partnerId] as const
}

export function useComments(partnerId: number) {
  return useQuery<{ result: Comment[] }>({
    queryKey: commentKey(partnerId),
    queryFn: () =>
      api.get(`/api/partners/${partnerId}/comments`).then((r) => r.data as { result: Comment[] }),
    staleTime: 60_000,
    enabled: partnerId > 0,
  })
}

export function useAddComment(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (comment_text: string) =>
      api.post(`/api/partners/${partnerId}/comments`, { comment_text }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentKey(partnerId) }),
  })
}

export function useEditComment(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, comment_text }: { id: number; comment_text: string }) =>
      api.patch(`/api/comments/${id}`, { comment_text }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentKey(partnerId) }),
  })
}

export function useDeleteComment(partnerId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/comments/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentKey(partnerId) }),
  })
}
