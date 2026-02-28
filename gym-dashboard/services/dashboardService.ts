import { api } from '@/store/AuthStore';
import {
    DashboardStatsResponse,
    RevenueChartResponse,
    ExpiringMembersResponse,
    RecentActivitiesResponse,
    UpcomingBirthdaysResponse,
} from '@/types';

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const getRevenueChartData = async (
    months: number = 6
): Promise<RevenueChartResponse> => {
    const response = await api.get('/dashboard/revenue-chart', {
        params: { months },
    });
    return response.data;
};

export const getExpiringMembers = async (
    days: number = 7
): Promise<ExpiringMembersResponse> => {
    const response = await api.get('/dashboard/expiring-members', {
        params: { days },
    });
    return response.data;
};

export const getRecentActivities = async (
    limit: number = 10
): Promise<RecentActivitiesResponse> => {
    const response = await api.get('/dashboard/activities', {
        params: { limit },
    });
    return response.data;
};

export const getUpcomingBirthdays = async (
    days: number = 7
): Promise<UpcomingBirthdaysResponse> => {
    const response = await api.get('/dashboard/upcoming-birthdays', {
        params: { days },
    });
    return response.data;
};
