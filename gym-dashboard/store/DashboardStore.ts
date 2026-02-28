import { create } from 'zustand';
import { getDashboardStats } from '@/services/dashboardService';
import { DashboardStats } from '@/types';

interface DashboardState {
    stats: DashboardStats | null;
    isLoading: boolean;
    error: string | null;
    fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    stats: null,
    isLoading: false,
    error: null,
    fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getDashboardStats();
            set({ stats: data.stats, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch stats', isLoading: false });
        }
    },
}));
