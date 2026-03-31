import { create } from 'zustand';
import { api } from './AuthStore';
import { TenantStats } from '@/types';

interface TenantState {
    stats: TenantStats | null;
    isLoadingStats: boolean;
    error: string | null;
    lastFetchedStats: number | null;

    // Actions
    fetchStats: (force?: boolean) => Promise<void>;
    clearStats: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

let activeStatsFetchPromise: Promise<void> | null = null;

export const useTenantStore = create<TenantState>((set, get) => ({
    stats: null,
    isLoadingStats: false,
    error: null,
    lastFetchedStats: null,

    fetchStats: async (force = false) => {
        // Prevent redundant simultaneous fetches
        if (activeStatsFetchPromise && !force) {
            return activeStatsFetchPromise;
        }

        const { lastFetchedStats, stats } = get();
        const now = Date.now();

        // Use cache if available and not expired (unless forced)
        if (!force && lastFetchedStats && (now - lastFetchedStats) < CACHE_DURATION && stats) {
            return;
        }

        set({ isLoadingStats: true, error: null });

        activeStatsFetchPromise = (async () => {
            try {
                const response = await api.get('/tenants/me/stats');
                set({
                    stats: response.data,
                    isLoadingStats: false,
                    lastFetchedStats: Date.now(),
                    error: null,
                });
            } catch (error: any) {
                const errorMessage = error.response?.data?.detail || 'Failed to fetch tenant stats';
                set({
                    stats: null,
                    isLoadingStats: false,
                    error: errorMessage,
                });
                console.error('Failed to fetch tenant stats:', error);
            } finally {
                activeStatsFetchPromise = null;
            }
        })();

        return activeStatsFetchPromise;
    },

    clearStats: () => {
        set({
            stats: null,
            isLoadingStats: false,
            error: null,
            lastFetchedStats: null,
        });
    },
}));
