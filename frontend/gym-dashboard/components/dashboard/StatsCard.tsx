import React from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  isLoading?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'dark';
}

export const StatsCard = ({ title, value, change, isLoading, icon, variant = 'default' }: StatsCardProps) => {
  const isPositive = change >= 0;

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full rounded-4xl" />;
  }

  return (
    <div className={cn(
      "group relative flex flex-col justify-between rounded-4xl p-6 transition-all duration-300 hover:shadow-lg",
      variant === 'default' && "bg-card shadow-soft border border-border",
      variant === 'primary' && "bg-primary text-white shadow-glow border border-primary",
      variant === 'dark' && "bg-slate-900 text-white shadow-xl"
    )}>
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
          variant === 'default' ? "bg-background text-text-primary" : "bg-white/20 text-white backdrop-blur-md"
        )}>
          {icon}
        </div>
        <button className={cn(
          "rounded-full p-2 hover:bg-black/5",
          variant === 'default' ? "text-text-secondary" : "text-white/60"
        )}>
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="mt-6">
        <p className={cn(
          "text-sm font-semibold mb-1",
          variant === 'default' ? "text-text-secondary" : "text-white/70"
        )}>{title}</p>
        <h3 className={cn(
          "text-3xl font-extrabold tracking-tight",
          variant === 'default' ? "text-text-primary" : "text-white"
        )}>{value}</h3>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
          isPositive
            ? (variant === 'default' ? "bg-green-100 text-green-700" : "bg-white/20 text-white")
            : (variant === 'default' ? "bg-red-100 text-red-700" : "bg-white/20 text-white")
        )}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change)}%
        </div>
        <span className={cn(
          "text-xs font-medium",
          variant === 'default' ? "text-text-secondary" : "text-white/50"
        )}>vs last month</span>
      </div>
    </div>
  );
};