import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: 'OPTIMAL' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  benchmark?: string;
  icon: LucideIcon;
  trend?: string;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  status = 'OPTIMAL',
  benchmark,
  icon: Icon,
  subtitle,
}) => {
  const badgeStyles = {
    OPTIMAL: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300',
    WARNING: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300',
    CRITICAL: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300',
    UNKNOWN: 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  return (
    <div className="bg-white dark:bg-darkCard rounded-2xl p-5 border border-gray-100 dark:border-darkBorder shadow-soft dark:shadow-dark-card hover:shadow-card transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-secondaryText dark:text-darkTextSecondary truncate">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-warmBg dark:bg-darkSurface flex items-center justify-center text-forest dark:text-limeAccent">
          <Icon className="w-5 h-5 text-agri dark:text-limeAccent" />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold tracking-tight text-darkText dark:text-darkTextPrimary">{value}</span>
        {unit && <span className="text-sm font-semibold text-secondaryText dark:text-darkTextSecondary">{unit}</span>}
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 dark:border-darkBorder">
        {benchmark ? (
          <span className="text-[11px] text-secondaryText dark:text-darkTextSecondary">
            Optimal: <strong className="text-darkText dark:text-darkTextPrimary">{benchmark}</strong>
          </span>
        ) : (
          <span className="text-[11px] text-secondaryText dark:text-darkTextSecondary">{subtitle || 'Field Indicator'}</span>
        )}

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeStyles[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
};
