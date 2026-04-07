'use client'

import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import type { PipelineStage } from '@/hooks/useDashboard'

// Stage display config (mirrors STAGE_CONFIG colours as hex values)
const STAGE_DISPLAY: Record<string, { label: string; fill: string }> = {
  new:                        { label: 'New',              fill: '#6366f1' },
  first_conversation:         { label: 'First Conv.',      fill: '#3b82f6' },
  interested:                 { label: 'Interested',        fill: '#f97316' },
  interested_but_facing_delay:{ label: 'Facing Delay',     fill: '#f59e0b' },
  not_interested:             { label: 'Not Interested',   fill: '#78716c' },
  dropped:                    { label: 'Dropped',          fill: '#ef4444' },
  converted:                  { label: 'Converted',        fill: '#16a34a' },
}

interface PipelineChartProps {
  data?: PipelineStage[]
  isLoading?: boolean
}

export function PipelineChart({ data, isLoading }: PipelineChartProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-52 w-full" />
      </div>
    )
  }

  const chartData = (data ?? [])
    .filter((s) => s.stage !== 'not_interested') // condense chart
    .map((s) => ({
      ...s,
      label: STAGE_DISPLAY[s.stage]?.label ?? s.stage,
      fill: STAGE_DISPLAY[s.stage]?.fill ?? '#94a3b8',
    }))

  const total = chartData.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Lead Pipeline Overview</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{total} total partners tracked</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 40, bottom: 0, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7e5e4" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#78716c' }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={90}
            tick={{ fontSize: 11, fill: '#78716c' }}
          />
          <Tooltip
            cursor={{ fill: '#f5f5f4' }}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e7e5e4',
              fontSize: '12px',
            }}
            formatter={(val: number | string | undefined) => [val ?? 0, 'Partners']}
          />
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={(data: any) => {
              const stage: string | undefined = data?.stage
              if (stage && stage !== 'converted') {
                router.push(`/lead?stage=${stage}`)
              } else if (stage === 'converted') {
                router.push('/organization')
              }
            }}
          >
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              style={{ fontSize: 11, fill: '#78716c', fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
