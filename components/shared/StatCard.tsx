import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  color?: string;   // Tailwind bg color class, e.g. 'bg-primary'
  urgent?: boolean; // red left-border highlight
  onClick?: () => void;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'bg-primary',
  urgent = false,
  onClick,
  loading = false,
}: StatCardProps) {
  const isPositiveTrend = trend && trend.value >= 0;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-card p-5 shadow-sm text-left w-full',
        urgent && 'border-l-4 border-l-danger',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className={cn('mt-1 text-3xl font-bold', urgent ? 'text-danger' : 'text-foreground')}>
              {value}
            </p>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
          {!loading && trend && (
            <div
              className={cn(
                'mt-2 flex items-center gap-1 text-xs font-medium',
                isPositiveTrend ? 'text-success' : 'text-danger'
              )}
            >
              {isPositiveTrend ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              <span>
                {isPositiveTrend ? '+' : ''}
                {trend.value}%{trend.label ? ` ${trend.label}` : ''}
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full text-white',
              color
            )}
          >
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </Tag>
  );
}
