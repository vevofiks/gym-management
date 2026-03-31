import { create } from 'zustand';
import { getDashboardStats } from '@/services/dashboardService';
import { DashboardStats } from '@/types';

interface DashboardState {
    stats: DashboardStats | null;
    isLoading: boolean;
    error: string | null;
    fetchStats: () => Promise<void>;
}

const CACHE_DURATION = 60 * 1000; // 1 minute
let activeFetchPromise: Promise<void> | null = null;
let lastFetched: number | null = null;

export const useDashboardStore = create<DashboardState>((set, get) => ({
    stats: null,
    isLoading: false,
    error: null,
    fetchStats: async (force = false) => {
        const { stats, isLoading } = get();
        const now = Date.now();

        // 1. If already fetching, return the existing promise
        if (activeFetchPromise) {
            return activeFetchPromise;
        }

        // 2. Unless forced, return cached stats if valid
        if (!force && stats && lastFetched && (now - lastFetched) < CACHE_DURATION) {
            return;
        }

        set({ isLoading: true, error: null });

        activeFetchPromise = (async () => {
            try {
                const data = await getDashboardStats();
                lastFetched = Date.now();
                set({ stats: data.stats, isLoading: false, error: null });
            } catch (error: any) {
                set({ 
                    error: error.response?.data?.detail || error.message || 'Failed to fetch stats', 
                    isLoading: false 
                });
            } finally {
                activeFetchPromise = null;
            }
        })();

        return activeFetchPromise;
    },
}));
