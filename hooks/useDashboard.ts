import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface PipelineStage {
  stage: string
  count: number
}

export interface RecentActivityItem {
  partner_id: number
  partner_name: string
  conversion_stage: string
  changed_at: string
  changed_by: string
}

export interface DashboardMetrics {
  total_leads: number
  new_leads: number
  interested: number
  dropped_this_month: number
  total_organizations: number
  converted_this_month: number
  active_mous: number
  expiring_soon: number
  expired: number
  pipeline_by_stage: PipelineStage[]
  recent_activity: RecentActivityItem[]
}

export function useDashboardMetrics() {
  return useQuery<{ result: DashboardMetrics }>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () =>
      api.get('/api/dashboard/metrics').then((r) => r.data as { result: DashboardMetrics }),
    staleTime: 5 * 60 * 1000, // 5 minutes — don't refetch on every focus
  })
}
