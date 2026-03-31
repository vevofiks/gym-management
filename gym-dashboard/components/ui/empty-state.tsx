import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
    iconClassName?: string;
}

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    className,
    iconClassName
}: EmptyStateProps) => {
    return (
        <div className={cn(
            "w-full bg-card rounded-xl border border-border overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500",
            className
        )}>
            <div className={cn(
                "h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 shadow-soft transition-transform hover:scale-110 duration-300",
                iconClassName
            )}>
                <Icon size={38} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-2">
                {title}
            </h3>
            <p className="text-sm font-medium text-text-secondary max-w-sm leading-relaxed mb-8">
                {description}
            </p>
            {action && (
                <div className="animate-in slide-in-from-bottom-2 duration-700 delay-200 fill-mode-both">
                    {action}
                </div>
            )}
        </div>
    );
};
