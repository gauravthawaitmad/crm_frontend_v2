/**
 * mou-utils.ts
 *
 * Helpers for MOU expiry status display.
 */

export interface MouStatus {
  label: string
  color: string         // Tailwind class for badge/text color
  bgColor: string       // Tailwind class for background
  borderColor: string   // Tailwind class for border
  urgent: boolean       // true if action needed soon
}

/**
 * Compute MOU expiry status from end date string.
 * Thresholds: >60 days = active, 30–60 = expiring soon, <30 = urgent, past = expired.
 */
export function getMouStatus(mouEndDate: string | null | undefined): MouStatus {
  if (!mouEndDate) {
    return { label: 'No MOU', color: 'text-muted-foreground', bgColor: 'bg-muted', borderColor: 'border-border', urgent: false }
  }

  const days = getDaysUntilExpiry(mouEndDate)

  if (days < 0) {
    return { label: 'Expired', color: 'text-danger', bgColor: 'bg-red-50', borderColor: 'border-red-200', urgent: true }
  }
  if (days < 30) {
    return { label: 'Expiring Soon', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', urgent: true }
  }
  if (days < 60) {
    return { label: 'Expiring Soon', color: 'text-warning', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', urgent: false }
  }
  return { label: 'Active', color: 'text-success', bgColor: 'bg-green-50', borderColor: 'border-green-200', urgent: false }
}

/**
 * Returns number of days until MOU end date.
 * Negative = already expired.
 */
export function getDaysUntilExpiry(mouEndDate: string | null | undefined): number {
  if (!mouEndDate) return Infinity
  const end = new Date(mouEndDate)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}
