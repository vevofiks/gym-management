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
        if (!subscription && !isLoading) {
            fetchSubscription();
        }
    }, [subscription, isLoading, fetchSubscription]);

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
export function useFeatureAccess(feature: 'whatsapp' | 'analytics') {
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
