'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Info, AlertCircle, Calendar, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/stages'
import {
  useUnreadCount,
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
} from '@/hooks/useNotification'

// ── Notification icon by type ─────────────────────────────────────────────────

function NotifIcon({ type }: { type: string }) {
  const cls = 'size-4 shrink-0'
  if (type === 'follow_up') return <Calendar className={cls} />
  if (type === 'stage_change') return <Info className={cls} />
  if (type === 'comment') return <MessageSquare className={cls} />
  if (type === 'alert') return <AlertCircle className={cls} />
  return <Bell className={cls} />
}

// ── Single notification row ────────────────────────────────────────────────────

function NotifRow({
  notif,
  onRead,
}: {
  notif: Notification
  onRead: (id: number, partnerId?: number | null) => void
}) {
  return (
    <button
      className={cn(
        'w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-stone-100',
        notif.is_read
          ? 'bg-stone-50'
          : 'bg-white border-l-2 border-l-orange-400'
      )}
      onClick={() => onRead(notif.id, notif.partner_id)}
    >
      <div className={cn('mt-0.5 text-muted-foreground', !notif.is_read && 'text-orange-500')}>
        <NotifIcon type={notif.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-xs leading-relaxed', notif.is_read ? 'text-muted-foreground' : 'font-medium text-foreground')}>
          {notif.message}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelativeTime(notif.createdAt)}</p>
      </div>
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { data: countData } = useUnreadCount()
  const unreadCount = countData?.result?.unread_count ?? 0

  const { data: notifsData } = useNotifications(isOpen)
  const notifications = (notifsData?.result ?? []).slice(0, 10)

  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside)
    }
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [isOpen])

  function handleRead(id: number, partnerId?: number | null) {
    markRead.mutate(id)
    setIsOpen(false)
    if (partnerId) {
      // Navigate to partner detail — URL will be resolved by the module's routing
      // For now navigate to a generic route; Phase D+ will handle deep links
      router.push(`/lead/${partnerId}`)
    }
  }

  function handleMarkAll() {
    markAllRead.mutate()
  }

  const displayCount = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white leading-none">
            {displayCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-border bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="size-8 mx-auto text-muted-foreground mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <NotifRow
                  key={notif.id}
                  notif={notif}
                  onRead={handleRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
