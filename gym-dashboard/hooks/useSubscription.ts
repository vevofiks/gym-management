import { useEffect } from 'react';
import { useSubscriptionStore } from '@/store/SubscriptionStore';

/**
 * Hook to get subscription data and automatically fetch if not loaded
 */
export function useSubscription() {
    const {
        subscription,
        isLoading,
        error,
        fetchSubscription,
        isSubscriptionActive,
        isTrialActive,
        needsUpgrade,
    } = useSubscriptionStore();

    useEffect(() => {
        if (!subscription && !isLoading && !error) {
            fetchSubscription();
        }
    }, [subscription, isLoading, error, fetchSubscription]);

    return {
        subscription,
        isLoading,
        error,
        isActive: isSubscriptionActive(),
        isTrial: isTrialActive(),
        needsUpgrade: needsUpgrade(),
        daysRemaining: subscription?.days_remaining || 0,
        refetch: fetchSubscription,
    };
}

/**
 * Hook to check if a specific feature is available
 */
export function useFeatureAccess(feature: 'whatsapp' | 'analytics' | 'diet_plans' | 'expenses') {
    const { hasFeature, subscription } = useSubscriptionStore();

    return {
        hasAccess: hasFeature(feature),
        isLoading: !subscription,
    };
}

/**
 * Hook to check if user can add a member
 */
export function useCanAddMember() {
    const { canAddMember, subscription } = useSubscriptionStore();

    const canAdd = canAddMember();
    const current = subscription?.current_usage.member_count || 0;
    const max = subscription?.plan_limits.max_members || 0;

    return {
        canAdd,
        current,
        max,
        isUnlimited: max === -1,
        message: canAdd ? '' : `Member limit reached (${current}/${max}). Upgrade to add more members.`,
    };
}

/**
 * Hook to check if user can add staff
 */
export function useCanAddStaff() {
    const { canAddStaff, subscription } = useSubscriptionStore();

    const canAdd = canAddStaff();
    const current = subscription?.current_usage.staff_count || 0;
    const max = subscription?.plan_limits.max_staff || 0;

    return {
        canAdd,
        current,
        max,
        isUnlimited: max === -1,
        message: canAdd ? '' : `Staff limit reached (${current}/${max}). Upgrade to add more staff.`,
    };
}

/**
 * Hook to check if user can create a membership plan
 */
export function useCanCreatePlan() {
    const { canCreatePlan, subscription } = useSubscriptionStore();

    const canCreate = canCreatePlan();
    const current = subscription?.current_usage.plan_count || 0;
    const max = subscription?.plan_limits.max_plans || 0;

    return {
        canCreate,
        current,
        max,
        isUnlimited: max === -1,
        message: canCreate ? '' : `Plan limit reached (${current}/${max}). Upgrade to create more plans.`,
    };
}
/**
 * Hook to check if user can create a diet template
 */
export function useCanCreateDietTemplate() {
    const { canCreateDietTemplate, subscription } = useSubscriptionStore();

    const canCreate = canCreateDietTemplate();
    const current = subscription?.current_usage.diet_template_count || 0;
    const max = subscription?.plan_limits.max_diet_templates || 0;

    return {
        canCreate,
        current,
        max,
        isUnlimited: max === -1,
        message: canCreate ? '' : `Diet template limit reached (${current}/${max}). Upgrade to create more templates.`,
    };
}
/**
 * Hook to get payment history
 */
import { useState, useCallback } from 'react';
import { api } from '@/store/AuthStore';

export function usePaymentHistory() {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/subscriptions/payment/history');
            setPayments(data.payments);
        } catch (err: any) {
            console.error('Failed to fetch payment history:', err);
            setError(err.response?.data?.detail || 'Failed to load payment history');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        payments,
        isLoading,
        error,
        refetch: fetchHistory
    };
}
