'use client';

import { MembershipPlan } from '@/types';
import { Edit2, Trash2, Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanCardProps {
    plan: MembershipPlan;
    onEdit: (plan: MembershipPlan) => void;
    onDelete: (plan: MembershipPlan) => void;
}

export function PlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDuration = (days: number) => {
        if (days === 30) return 'Monthly';
        if (days === 90) return 'Quarterly';
        if (days === 180) return 'Half-yearly';
        if (days === 365) return 'Yearly';
        return `${days} Days`;
    };

    return (
        <div className={cn(
            "relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all duration-200",
            "hover:border-primary/50 hover:shadow-md",
            !plan.is_active && "opacity-60 grayscale-[0.5]"
        )}>
            {/* Header: Name and Status */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-text-primary truncate leading-tight">
                        {plan.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                            plan.is_active ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-500"
                        )}>
                            {plan.is_active ? "Active" : "Inactive"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                            <Users size={10} />
                            {plan.member_count}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-black text-primary leading-none">
                        {formatPrice(plan.price)}
                    </div>
                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                        {formatDuration(plan.duration_days)}
                    </div>
                </div>
            </div>

            {/* Description */}
            {plan.description && (
                <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed h-8">
                    {plan.description}
                </p>
            )}

            {/* Features: Compact Grid */}
            <div className="flex-1 mb-5">
                <div className="grid grid-cols-1 gap-x-3 gap-y-1.5">
                    {plan.features && plan.features.length > 0 ? (
                        plan.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-text-primary/70">
                                <Check size={12} className="text-primary shrink-0" />
                                <span className="text-[11px] font-medium truncate">{feature}</span>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center gap-1.5 text-text-secondary/50 italic">
                            <Check size={12} className="shrink-0" />
                            <span className="text-[11px]">Standard access</span>
                        </div>
                    )}
                    {plan.features && plan.features.length > 4 && (
                        <div className="text-[10px] font-bold text-primary/60 pl-4.5 mt-0.5">
                            + {plan.features.length - 4} more features
                        </div>
                    )}
                </div>
            </div>

            {/* Actions: Slim Footer */}
            <div className="flex gap-2 pt-3 border-t border-border/50">
                <button
                    onClick={() => onEdit(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-text-primary bg-background border border-border hover:border-primary hover:text-primary transition-all active:scale-95"
                >
                    <Edit2 size={12} />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-95"
                >
                    <Trash2 size={12} />
                    Delete
                </button>
            </div>
        </div>
    );
}
