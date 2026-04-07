'use client'

import { useRouter } from 'next/navigation'
import { Users, Building2, TrendingUp, FileText, AlertTriangle, XCircle, UserMinus, TrendingDown } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'
import type { DashboardMetrics } from '@/hooks/useDashboard'

interface MetricsGridProps {
  metrics?: DashboardMetrics
  isLoading: boolean
}

export function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      {/* Row 1 — Lead Pipeline */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Lead Pipeline
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Active Leads"
            value={metrics?.total_leads ?? 0}
            subtitle="Not yet converted"
            icon={Users}
            color="bg-primary"
            loading={isLoading}
            onClick={() => router.push('/lead')}
          />
          <StatCard
            title="New Leads"
            value={metrics?.new_leads ?? 0}
            subtitle="Stage: New"
            icon={Users}
            color="bg-primary"
            loading={isLoading}
            onClick={() => router.push('/lead?stage=new')}
          />
          <StatCard
            title="Interested"
            value={metrics?.interested ?? 0}
            subtitle="Interested + Facing delay"
            icon={TrendingUp}
            color="bg-warning"
            loading={isLoading}
            onClick={() => router.push('/lead?stage=interested')}
          />
          <StatCard
            title="Dropped This Month"
            value={metrics?.dropped_this_month ?? 0}
            subtitle="This calendar month"
            icon={UserMinus}
            color="bg-danger"
            loading={isLoading}
            onClick={() => router.push('/lead?stage=dropped')}
          />
        </div>
      </div>

      {/* Row 2 — Organizations */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Organizations
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Organizations"
            value={metrics?.total_organizations ?? 0}
            subtitle="Converted partners"
            icon={Building2}
            color="bg-success"
            loading={isLoading}
            onClick={() => router.push('/organization')}
          />
          <StatCard
            title="Converted This Month"
            value={metrics?.converted_this_month ?? 0}
            subtitle="New conversions"
            icon={TrendingUp}
            color="bg-success"
            loading={isLoading}
          />
          <StatCard
            title="Active MOUs"
            value={metrics?.active_mous ?? 0}
            subtitle="Signed agreements"
            icon={FileText}
            color="bg-primary-dark"
            loading={isLoading}
            onClick={() => router.push('/organization')}
          />
        </div>
      </div>

      {/* Row 3 — MOU Health */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          MOU Health
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            title="Expiring in 30 Days"
            value={metrics?.expiring_soon ?? 0}
            subtitle="Renewal needed soon"
            icon={AlertTriangle}
            color="bg-warning"
            urgent={(metrics?.expiring_soon ?? 0) > 0}
            loading={isLoading}
            onClick={() => router.push('/organization')}
          />
          <StatCard
            title="Expired MOUs"
            value={metrics?.expired ?? 0}
            subtitle="Past end date"
            icon={XCircle}
            color="bg-danger"
            urgent={(metrics?.expired ?? 0) > 0}
            loading={isLoading}
            onClick={() => router.push('/organization')}
          />
        </div>
      </div>
    </div>
  )
}
