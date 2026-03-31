import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  isLoading?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'dark';
  info?: string;
  footer?: string;
  hideTrend?: boolean;
  onClick?: () => void;
}

export const StatsCard = ({ title, value, change = 0, isLoading, icon, variant = 'default', info, footer, hideTrend, onClick }: StatsCardProps) => {
  const isPositive = change >= 0;

  if (isLoading) {
    return (
      <div className={cn(
        "flex flex-col justify-between rounded-xl p-4 bg-card shadow-soft border border-border animate-pulse",
        variant === 'primary' && "bg-primary/20",
        variant === 'dark' && "bg-slate-800"
      )}>
        <div className="flex items-start justify-between">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-start gap-1 rounded-xl p-4 transition-all duration-300 hover:shadow-lg",
        variant === 'default' && "bg-card shadow-soft border border-border",
        variant === 'primary' && "bg-primary text-white shadow-glow border border-primary",
        variant === 'dark' && "bg-slate-900 text-white shadow-xl",
        onClick && "cursor-pointer active:scale-95"
      )}>
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
          variant === 'default' ? "bg-background text-text-primary" : "bg-white/20 text-white backdrop-blur-md"
        )}>
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1">
          <p className={cn(
            "text-xs font-bold uppercase tracking-wider",
            variant === 'default' ? "text-text-secondary" : "text-white/70"
          )}>{title}</p>
          {info && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="outline-none">
                    <Info
                      size={12}
                      className={cn(
                        "opacity-40 hover:opacity-100 transition-opacity",
                        variant === 'default' ? "text-text-secondary" : "text-white"
                      )}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] text-center">
                  <p>{info}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <h3 className={cn(
          "text-2xl font-extrabold tracking-tight",
          variant === 'default' ? "text-text-primary" : "text-white"
        )}>{value}</h3>
      </div>

      {!hideTrend && (
        <div className="mt-2 flex items-center gap-2">
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
      )}

      {footer && (
        <div className={cn(
          "mt-2 text-[10px] font-medium opacity-70",
          variant === 'default' ? "text-text-secondary" : "text-white"
        )}>
          {footer}
        </div>
      )}
    </div>
  );
};