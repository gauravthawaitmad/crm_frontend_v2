'use client'

import { useCurrentUser } from '@/hooks/useAuth'
import type { DashboardMetrics } from '@/hooks/useDashboard'

interface DashboardHeaderProps {
  metrics?: DashboardMetrics
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const CO_ROLES = ['CO Full Time', 'CO Part Time', 'CHO,CO Part Time', 'co']

export function DashboardHeader({ metrics }: DashboardHeaderProps) {
  const user = useCurrentUser()
  const role = user?.user_role ?? ''
  const name = user?.user_display_name?.split(' ')[0] ?? '…'
  const greeting = getGreeting()

  let subtitle: string

  if (role === 'manager') {
    subtitle = `Team overview — ${metrics?.total_leads ?? 0} active leads`
  } else if (role === 'super_admin' || role === 'admin') {
    subtitle = 'Organization-wide summary'
  } else if (CO_ROLES.includes(role)) {
    subtitle = `Here's your pipeline for today`
  } else {
    subtitle = "Here's an overview of your CRM activity."
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-foreground">
        {greeting},{' '}
        <span className="text-primary">{name}</span>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}
