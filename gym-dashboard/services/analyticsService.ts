import { api } from '@/store/AuthStore';
import {
    MemberGrowthResponse,
    MemberStatsResponse,
    ChurnRateResponse,
    PlanDistributionResponse,
    AverageTenureResponse,
} from '@/types';

export const getMemberGrowth = async (
    startDate: string,
    endDate: string
): Promise<MemberGrowthResponse> => {
    const response = await api.get('/analytics/member-growth', {
        params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
};

export const getMemberStats = async (
    startDate: string,
    endDate: string
): Promise<MemberStatsResponse> => {
    const response = await api.get('/analytics/member-stats', {
        params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
};

export const getChurnRate = async (
    startDate: string,
    endDate: string
): Promise<ChurnRateResponse> => {
    const response = await api.get('/analytics/churn-rate', {
        params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
};

export const getPlanDistribution = async (
    startDate: string,
    endDate: string
): Promise<PlanDistributionResponse> => {
    const response = await api.get('/analytics/plan-distribution', {
        params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
};

export const getAverageTenure = async (
    startDate: string,
    endDate: string
): Promise<AverageTenureResponse> => {
    const response = await api.get('/analytics/average-tenure', {
        params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
};
