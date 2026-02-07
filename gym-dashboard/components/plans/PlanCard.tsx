'use client';

import { MembershipPlan } from '@/types/plan';
import { Edit2, Trash2, Users } from 'lucide-react';

interface PlanCardProps {
    plan: MembershipPlan;
    onEdit: (plan: MembershipPlan) => void;
    onDelete: (plan: MembershipPlan) => void;
    memberCount?: number;
}

export function PlanCard({ plan, onEdit, onDelete, memberCount = 0 }: PlanCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDuration = (days: number) => {
        if (days === 30) return '1 Month';
        if (days === 90) return '3 Months';
        if (days === 180) return '6 Months';
        if (days === 365) return '1 Year';
        return `${days} Days`;
    };

    return (
        <div className={`relative rounded-2xl border p-6 transition-all ${plan.is_active
                ? 'border-border bg-card hover:border-primary/50'
                : 'border-border bg-card opacity-60'
            }`}>
            {/* Status Badge */}
            {!plan.is_active && (
                <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-500">
                        Inactive
                    </span>
                </div>
            )}

            {/* Plan Name */}
            <h3 className="text-xl font-bold text-text-primary mb-2">
                {plan.name}
            </h3>

            {/* Description */}
            {plan.description && (
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                    {plan.description}
                </p>
            )}

            {/* Price and Duration */}
            <div className="mb-4">
                <div className="text-3xl font-bold text-primary">
                    {formatPrice(plan.price)}
                </div>
                <div className="text-sm text-text-secondary">
                    {formatDuration(plan.duration_days)}
                </div>
            </div>

            {/* Member Count */}
            <div className="flex items-center gap-2 mb-4 text-sm text-text-secondary">
                <Users size={16} />
                <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
            </div>

            {/* Features */}
            {plan.features && (
                <div className="mb-4 pb-4 border-b border-border">
                    <p className="text-xs text-text-secondary line-clamp-3">
                        {plan.features}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(plan)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-text-primary bg-background border border-border hover:border-primary transition-colors"
                >
                    <Edit2 size={16} />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(plan)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>
        </div>
    );
}
