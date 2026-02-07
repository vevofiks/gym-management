import { api } from '@/store/AuthStore';
import { MembershipPlan, PlanCreate, PlanUpdate, PlanListResponse, PlanStats } from '@/types/plan';

/**
 * Get all membership plans for the current tenant
 */
export const getPlans = async (
    page: number = 1,
    pageSize: number = 50,
    activeOnly: boolean = true
): Promise<PlanListResponse> => {
    const response = await api.get<PlanListResponse>('/plans/', {
        params: { page, page_size: pageSize, active_only: activeOnly },
    });
    return response.data;
};

/**
 * Get a single membership plan by ID
 */
export const getPlanById = async (planId: number): Promise<MembershipPlan> => {
    const response = await api.get<MembershipPlan>(`/plans/${planId}`);
    return response.data;
};

/**
 * Create a new membership plan
 */
export const createPlan = async (planData: PlanCreate): Promise<MembershipPlan> => {
    const response = await api.post<MembershipPlan>('/plans/', planData);
    return response.data;
};

/**
 * Update an existing membership plan
 */
export const updatePlan = async (
    planId: number,
    planData: PlanUpdate
): Promise<MembershipPlan> => {
    const response = await api.put<MembershipPlan>(`/plans/${planId}`, planData);
    return response.data;
};

/**
 * Delete a membership plan
 */
export const deletePlan = async (planId: number): Promise<void> => {
    await api.delete(`/plans/${planId}`);
};

/**
 * Get statistics for a membership plan
 */
export const getPlanStats = async (planId: number): Promise<PlanStats> => {
    const response = await api.get<PlanStats>(`/plans/${planId}/stats`);
    return response.data;
};
