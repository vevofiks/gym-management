import { create } from 'zustand';
import { SubscriptionDetails } from '@/types';
import { api } from './AuthStore';

interface SubscriptionStore {
    subscription: SubscriptionDetails | null;
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
    
    // Actions
    fetchSubscription: () => Promise<void>;
    clearSubscription: () => void;
    
    // Helper methods
    canAddMember: () => boolean;
    canAddStaff: () => boolean;
    canCreatePlan: () => boolean;
    hasFeature: (feature: 'whatsapp' | 'analytics') => boolean;
    isTrialActive: () => boolean;
    isSubscriptionActive: () => boolean;
    needsUpgrade: () => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
    subscription: null,
    isLoading: false,
    error: null,
    lastFetched: null,

    fetchSubscription: async () => {
        // Check cache
        const { lastFetched } = get();
        const now = Date.now();
        
        if (lastFetched && (now - lastFetched) < CACHE_DURATION) {
            // Data is fresh, no need to fetch
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await api.get<SubscriptionDetails>('/subscriptions/me/status');
            set({
                subscription: response.data,
                isLoading: false,
                error: null,
                lastFetched: now,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to fetch subscription';
            set({
                subscription: null,
                isLoading: false,
                error: errorMessage,
            });
            console.error('Failed to fetch subscription:', error);
        }
    },

    clearSubscription: () => {
        set({
            subscription: null,
            isLoading: false,
            error: null,
            lastFetched: null,
        });
    },

    canAddMember: () => {
        const { subscription } = get();
        if (!subscription) return false;
        
        const { current_usage, plan_limits } = subscription;
        const maxMembers = plan_limits.max_members;
        
        // -1 means unlimited
        if (maxMembers === -1) return true;
        
        return current_usage.member_count < maxMembers;
    },

    canAddStaff: () => {
        const { subscription } = get();
        if (!subscription) return false;
        
        const { current_usage, plan_limits } = subscription;
        const maxStaff = plan_limits.max_staff;
        
        // -1 means unlimited
        if (maxStaff === -1) return true;
        
        return current_usage.staff_count < maxStaff;
    },

    canCreatePlan: () => {
        const { subscription } = get();
        if (!subscription) return false;
        
        const { current_usage, plan_limits } = subscription;
        const maxPlans = plan_limits.max_plans;
        
        // -1 means unlimited
        if (maxPlans === -1) return true;
        
        return current_usage.plan_count < maxPlans;
    },

    hasFeature: (feature: 'whatsapp' | 'analytics') => {
        const { subscription } = get();
        if (!subscription) return false;
        
        if (feature === 'whatsapp') {
            return subscription.features.whatsapp_enabled;
        }
        
        if (feature === 'analytics') {
            return subscription.features.analytics_enabled;
        }
        
        return false;
    },

    isTrialActive: () => {
        const { subscription } = get();
        return subscription?.is_trial === true && subscription?.is_active === true;
    },

    isSubscriptionActive: () => {
        const { subscription } = get();
        return subscription?.is_active === true;
    },

    needsUpgrade: () => {
        const { subscription } = get();
        if (!subscription) return true;
        
        // If trial or expired, needs upgrade
        if (subscription.is_trial || subscription.status === 'expired') {
            return true;
        }
        
        return false;
    },
}));
