'use client'

import { useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { useComments, useAddComment, useEditComment, useDeleteComment } from '@/hooks/useComments'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials, getAvatarColor, formatRelativeTime } from '@/lib/stages'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Comment } from '@/types/comment'

interface CommentSectionProps {
  partnerId: number
}

export function CommentSection({ partnerId }: CommentSectionProps) {
  const user = useAppSelector((s) => s.auth.user)
  const { data, isLoading } = useComments(partnerId)
  const addMutation = useAddComment(partnerId)
  const editMutation = useEditComment(partnerId)
  const deleteMutation = useDeleteComment(partnerId)

  const [newText, setNewText] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const comments = data?.result ?? []
  const currentUserName = user?.user_display_name ?? ''

  function handleAdd() {
    const text = newText.trim()
    if (!text) return
    addMutation.mutate(text, {
      onSuccess: () => {
        setNewText('')
        setInputFocused(false)
        toast.success('Comment added')
      },
      onError: () => toast.error('Failed to add comment'),
    })
  }

  function handleEditSave(id: number) {
    const text = editText.trim()
    if (!text) return
    editMutation.mutate({ id, comment_text: text }, {
      onSuccess: () => {
        setEditingId(null)
        toast.success('Comment updated')
      },
      onError: () => toast.error('Failed to update comment'),
    })
  }

  function handleDeleteConfirm(id: number) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeletingId(null)
        toast.success('Comment deleted')
      },
      onError: () => toast.error('Failed to delete comment'),
    })
  }

  return (
    <div className="space-y-6">
      {/* ── Add comment box ──────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <div
          className={cn(
            'size-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white',
            getAvatarColor(currentUserName)
          )}
        >
          {getInitials(currentUserName)}
        </div>
        <div className="flex-1 space-y-2">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onFocus={() => setInputFocused(true)}
            placeholder="Add a comment..."
            rows={inputFocused || newText ? 3 : 1}
            className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          {(inputFocused || newText) && (
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newText.trim() || addMutation.isPending}
                className="px-3 py-1.5 rounded-md bg-primary text-white text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {addMutation.isPending ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setNewText(''); setInputFocused(false) }}
                className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Comment list ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          No comments yet. Be the first to add one.
        </p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={user?.user_id ?? ''}
              isEditing={editingId === comment.id}
              isDeleting={deletingId === comment.id}
              editText={editText}
              editPending={editMutation.isPending}
              deletePending={deleteMutation.isPending}
              onEditStart={() => { setEditingId(comment.id); setEditText(comment.comment_text) }}
              onEditChange={setEditText}
              onEditSave={() => handleEditSave(comment.id)}
              onEditCancel={() => setEditingId(null)}
              onDeleteStart={() => setDeletingId(comment.id)}
              onDeleteConfirm={() => handleDeleteConfirm(comment.id)}
              onDeleteCancel={() => setDeletingId(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── CommentCard ────────────────────────────────────────────────────────────────

interface CommentCardProps {
  comment: Comment
  currentUserId: string | number
  isEditing: boolean
  isDeleting: boolean
  editText: string
  editPending: boolean
  deletePending: boolean
  onEditStart: () => void
  onEditChange: (text: string) => void
  onEditSave: () => void
  onEditCancel: () => void
  onDeleteStart: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

function CommentCard({
  comment,
  currentUserId,
  isEditing,
  isDeleting,
  editText,
  editPending,
  deletePending,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDeleteStart,
  onDeleteConfirm,
  onDeleteCancel,
}: CommentCardProps) {
  const isOwner = comment.user_id === Number(currentUserId)
  const authorName = comment.author?.user_display_name ?? 'Unknown'
  const authorRole = comment.author?.user_role ?? ''

  return (
    <div className="group flex gap-3">
      {/* Avatar */}
      <div
        className={cn(
          'size-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold text-white',
          getAvatarColor(authorName)
        )}
      >
        {getInitials(authorName)}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{authorName}</span>
          {authorRole && (
            <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 text-[10px] font-medium">
              {authorRole}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
          {comment.is_edited && (
            <span className="text-xs text-muted-foreground italic">
              {comment.edited_at
                ? `(edited ${formatRelativeTime(comment.edited_at)})`
                : '(edited)'}
            </span>
          )}
        </div>

        {/* Body — edit mode or display */}
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editText}
              onChange={(e) => onEditChange(e.target.value)}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={onEditSave}
                disabled={!editText.trim() || editPending}
                className="px-3 py-1.5 rounded-md bg-primary text-white text-sm font-medium disabled:opacity-50 hover:bg-primary/90"
              >
                {editPending ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={onEditCancel}
                className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-foreground whitespace-pre-wrap break-words">
            {comment.comment_text}
          </p>
        )}

        {/* Inline delete confirm */}
        {isDeleting && !isEditing && (
          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="text-red-600 font-medium text-xs">Delete this comment?</span>
            <button
              onClick={onDeleteConfirm}
              disabled={deletePending}
              className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-50"
            >
              {deletePending ? 'Deleting…' : 'Yes'}
            </button>
            <button
              onClick={onDeleteCancel}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              No
            </button>
          </div>
        )}

        {/* Hover actions — only for comment owner, only when not editing/deleting */}
        {isOwner && !isEditing && !isDeleting && (
          <div className="mt-1 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEditStart}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDeleteStart}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
