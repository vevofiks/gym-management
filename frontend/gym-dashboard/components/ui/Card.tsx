import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
}

export const Card = ({ children, className, title, subtitle }: CardProps) => {
    return (
        <div className={cn(
            "rounded-3xl bg-card border border-border p-6 shadow-soft",
            className
        )}>
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && <h3 className="text-lg font-bold text-text-primary">{title}</h3>}
                    {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    );
};
