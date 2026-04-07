import type { ConversionStage } from '@/types/lead'

export const STAGE_CONFIG: Record<
  ConversionStage,
  { label: string; color: string; dot: string; border: string }
> = {
  new: {
    label: 'New',
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  first_conversation: {
    label: 'First Conversation',
    color: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-500',
    border: 'border-purple-200',
  },
  interested: {
    label: 'Interested',
    color: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  interested_but_facing_delay: {
    label: 'Facing Delay',
    color: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
    border: 'border-orange-200',
  },
  not_interested: {
    label: 'Not Interested',
    color: 'bg-slate-100 text-slate-600',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
  },
  converted: {
    label: 'Converted',
    color: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
    border: 'border-green-200',
  },
  dropped: {
    label: 'Dropped',
    color: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    border: 'border-red-200',
  },
} as const

/** Stages shown in the lead filter chips (excludes 'converted' — those are Organizations) */
export const LEAD_FILTER_STAGES: ConversionStage[] = [
  'new',
  'first_conversation',
  'interested',
  'interested_but_facing_delay',
  'not_interested',
  'dropped',
]

export const LEAD_SOURCES = [
  'Reference',
  'Cold Call',
  'Social Media',
  'Event',
  'Partner',
  'Other',
]

/** Returns initials from a display name (max 2 chars) */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Deterministic avatar color based on name */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-green-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]
  const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1 || 0)
  return colors[hash % colors.length]
}

/** Format a date string as relative time (e.g. "3d ago") */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

/** Format a date for display */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}
