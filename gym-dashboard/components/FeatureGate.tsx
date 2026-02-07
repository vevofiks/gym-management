'use client';

import { ReactNode } from 'react';
import { useFeatureAccess } from '@/hooks/useSubscription';
import { AlertCircle, Lock } from 'lucide-react';

interface FeatureGateProps {
    feature: 'whatsapp' | 'analytics';
    children: ReactNode;
    fallback?: ReactNode;
    showUpgradePrompt?: boolean;
}

export default function FeatureGate({
    feature,
    children,
    fallback,
    showUpgradePrompt = true
}: FeatureGateProps) {
    const { hasAccess, isLoading } = useFeatureAccess(feature);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!hasAccess) {
        if (fallback) {
            return <>{fallback}</>;
        }

        if (showUpgradePrompt) {
            return (
                <div className="bg-card border border-border rounded-xl p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <Lock className="text-primary" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {feature === 'whatsapp' ? 'WhatsApp Integration' : 'Advanced Analytics'}
                    </h3>
                    <p className="text-text-secondary mb-4">
                        This feature is available on paid plans. Upgrade to unlock.
                    </p>
                    <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        Upgrade Plan
                    </button>
                </div>
            );
        }

        return null;
    }

    return <>{children}</>;
}

interface LimitGateProps {
    limitType: 'member' | 'staff' | 'plan';
    canProceed: boolean;
    message?: string;
    children: ReactNode;
    onUpgrade?: () => void;
}

export function LimitGate({
    limitType,
    canProceed,
    message,
    children,
    onUpgrade
}: LimitGateProps) {
    if (!canProceed) {
        const limitLabels = {
            member: 'Member',
            staff: 'Staff',
            plan: 'Membership Plan',
        };

        return (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                    <h4 className="font-semibold text-text-primary mb-1">
                        {limitLabels[limitType]} Limit Reached
                    </h4>
                    <p className="text-sm text-text-secondary mb-3">
                        {message || `You've reached your ${limitLabels[limitType].toLowerCase()} limit.`}
                    </p>
                    <button
                        onClick={onUpgrade}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        Upgrade Plan
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
