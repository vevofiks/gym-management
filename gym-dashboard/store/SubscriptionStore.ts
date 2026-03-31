import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SubscriptionDetails } from '@/types';
import { api } from './AuthStore';

interface SubscriptionStore {
    subscription: SubscriptionDetails | null;
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
    payments: any[];
    isHistoryLoading: boolean;
    historyError: string | null;
    lastHistoryFetched: number | null;

    // Actions
    fetchSubscription: (force?: boolean) => Promise<void>;
    fetchPaymentHistory: (force?: boolean) => Promise<void>;
    clearSubscription: () => void;

    // Helper methods
    canAddMember: () => boolean;
    canAddStaff: () => boolean;
    canCreatePlan: () => boolean;
    canCreateDietTemplate: () => boolean;
    hasFeature: (feature: 'whatsapp' | 'analytics' | 'diet_plans' | 'expenses' | 'store') => boolean;
    isTrialActive: () => boolean;
    isSubscriptionActive: () => boolean;

    needsUpgrade: () => boolean;
    getQueuedSubscriptions: () => any[];
}

const CACHE_DURATION = 5 * 60 * 1000;
const HISTORY_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

let activeFetchPromise: Promise<void> | null = null;
let activeHistoryFetchPromise: Promise<void> | null = null;

export const useSubscriptionStore = create<SubscriptionStore>()(
    persist(
        (set, get) => ({
            subscription: null,
            isLoading: false,
            error: null,
            lastFetched: null,
            payments: [],
            isHistoryLoading: false,
            historyError: null,
            lastHistoryFetched: null,

            fetchSubscription: async (force = false) => {
                // 1. Check if already fetching to prevent redundant simultaneous calls
                if (activeFetchPromise && !force) {
                    return activeFetchPromise;
                }

                // 2. Check cache (unless forced)
                const { lastFetched, subscription } = get();
                const now = Date.now();

                if (!force && lastFetched && (now - lastFetched) < CACHE_DURATION && subscription) {
                    return;
                }

                // 3. Start new fetch
                set({ isLoading: true, error: null });

                activeFetchPromise = (async () => {
                    try {
                        const response = await api.get<SubscriptionDetails>('/subscriptions/me/status');
                        set({
                            subscription: response.data,
                            isLoading: false,
                            error: null,
                            lastFetched: Date.now(),
                        });
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.detail || 'Failed to fetch subscription';
                        set({
                            subscription: null,
                            isLoading: false,
                            error: errorMessage,
                        });
                        console.error('Failed to fetch subscription:', error);
                    } finally {
                        activeFetchPromise = null;
                    }
                })();

                return activeFetchPromise;
            },

            fetchPaymentHistory: async (force = false) => {
                const { payments, lastHistoryFetched } = get();
                const now = Date.now();

                if (activeHistoryFetchPromise && !force) {
                    return activeHistoryFetchPromise;
                }

                if (!force && lastHistoryFetched && (now - lastHistoryFetched) < HISTORY_CACHE_DURATION) {
                    return;
                }

                set({ isHistoryLoading: true, historyError: null });

                activeHistoryFetchPromise = (async () => {
                    try {
                        const response = await api.get<{ payments: any[] }>('/subscriptions/payment/history');
                        set({
                            payments: response.data.payments,
                            isHistoryLoading: false,
                            historyError: null,
                            lastHistoryFetched: Date.now(),
                        });
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.detail || 'Failed to fetch payment history';
                        set({
                            isHistoryLoading: false,
                            historyError: errorMessage,
                        });
                        console.error('Failed to fetch payment history:', error);
                    } finally {
                        activeHistoryFetchPromise = null;
                    }
                })();

                return activeHistoryFetchPromise;
            },

            clearSubscription: () => {
                set({
                    subscription: null,
                    isLoading: false,
                    error: null,
                    lastFetched: null,
                    payments: [],
                    isHistoryLoading: false,
                    historyError: null,
                    lastHistoryFetched: null,
                });
            },

            canAddMember: () => {
                const { subscription } = get();
                if (!subscription) return false;

                // Trial includes unlimited members
                if (get().isTrialActive()) return true;

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
                let maxStaff = plan_limits.max_staff;

                // Trial includes Pro features (5 staff)
                if (get().isTrialActive()) {
                    maxStaff = 5;
                } else if (subscription.plan_name.toLowerCase().includes('starter') || subscription.plan_name.toLowerCase().includes('basic')) {
                    // Force Starter/Basic to 1 staff as requested
                    maxStaff = 1;
                }

                // -1 means unlimited
                if (maxStaff === -1) return true;

                return current_usage.staff_count < maxStaff;
            },

            canCreatePlan: () => {
                const { subscription } = get();
                if (!subscription) return false;

                // Trial includes unlimited plans
                if (get().isTrialActive()) return true;

                const { current_usage, plan_limits } = subscription;
                let maxPlans = plan_limits.max_plans;

                if (subscription.plan_name.toLowerCase().includes('starter') || subscription.plan_name.toLowerCase().includes('basic')) {
                    // Force Starter/Basic to 2 plans as requested
                    maxPlans = 2;
                }

                // -1 means unlimited
                if (maxPlans === -1) return true;

                return current_usage.plan_count < maxPlans;
            },

            canCreateDietTemplate: () => {
                const { subscription } = get();
                if (!subscription) return false;

                // Trial includes unlimited diet templates
                if (get().isTrialActive()) return true;

                const { current_usage, plan_limits } = subscription;
                let maxTemplates = plan_limits.max_diet_templates;

                if (subscription.plan_name.toLowerCase().includes('starter') || subscription.plan_name.toLowerCase().includes('basic')) {
                    // Force Starter/Basic to 2 diet templates as requested
                    maxTemplates = 2;
                }

                // -1 means unlimited
                if (maxTemplates === -1) return true;

                return current_usage.diet_template_count < maxTemplates;
            },

            hasFeature: (feature: 'whatsapp' | 'analytics' | 'diet_plans' | 'expenses' | 'store') => {
                const { subscription } = get();
                if (!subscription) return false;

                const planName = subscription.plan_name.toLowerCase();
                const isTrial = subscription.is_trial;

                if (feature === 'whatsapp') {
                    // WhatsApp only for Pro, specifically excluded for Trial
                    return subscription.features.whatsapp_enabled && !isTrial;
                }

                if (feature === 'analytics') {
                    // Analytics for Pro, Starter/Basic, and Trial
                    return (
                        subscription.features.analytics_enabled ||
                        isTrial ||
                        planName.includes('starter') ||
                        planName.includes('basic')
                    );
                }

                if (feature === 'diet_plans') {
                    return subscription.features.diet_plans_enabled || isTrial;
                }

                if (feature === 'expenses') {
                    // Expenses for Pro (and Trial as it includes Pro features)
                    return planName.includes('pro') || isTrial;
                }

                if (feature === 'store') {
                    // Store available for Pro and Trial
                    return (
                        subscription.features.store_enabled ||
                        isTrial ||
                        planName.includes('pro') ||
                        planName.includes('trial')
                    );
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
                // NOTE: Even if trial is active, they might want to upgrade to get WhatsApp
                if (subscription.status === 'expired') {
                    return true;
                }

                return false;
            },

            getQueuedSubscriptions: () => {
                const { subscription } = get();
                return subscription?.queued_subscriptions || [];
            },
        }),
        {
            name: 'subscription-storage',
            partialize: (state) => ({
                subscription: state.subscription,
                lastFetched: state.lastFetched,
                payments: state.payments,
                lastHistoryFetched: state.lastHistoryFetched,
            }),
        }
    )
);