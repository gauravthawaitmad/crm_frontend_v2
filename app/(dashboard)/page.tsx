'use client';

import { AlertCircle } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useDashboard';
import { DashboardHeader } from '@/components/modules/dashboard/DashboardHeader';
import { MetricsGrid } from '@/components/modules/dashboard/MetricsGrid';
import { PipelineChart } from '@/components/modules/dashboard/PipelineChart';
import { RecentActivity } from '@/components/modules/dashboard/RecentActivity';
import { FollowUpWidget } from '@/components/modules/dashboard/FollowUpWidget';

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboardMetrics();
  const metrics = data?.result;

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle className="size-4 shrink-0" />
        Could not load dashboard — try refreshing the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader metrics={metrics} />

      <MetricsGrid metrics={metrics} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2">
          <PipelineChart data={metrics?.pipeline_by_stage} isLoading={isLoading} />
        </div>
        <div className="space-y-6">
          <FollowUpWidget />
          <RecentActivity items={metrics?.recent_activity} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
