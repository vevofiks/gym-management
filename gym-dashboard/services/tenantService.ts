import { api } from '@/store/AuthStore';
import { TenantResponse, TenantUpdate, SubscriptionStatusResponse } from '@/types';

/**
 * Get current user's tenant details
 */
export const getMyTenant = async (): Promise<TenantResponse> => {
    const response = await api.get<TenantResponse>('/tenants/me');
    return response.data;
};

/**
 * Update current user's tenant details
 */
export const updateMyTenant = async (tenantData: TenantUpdate): Promise<TenantResponse> => {
    const response = await api.put<TenantResponse>('/tenants/me', tenantData);
    return response.data;
};

/**
 * Get tenant statistics
 */
export const getMyTenantStats = async () => {
    const response = await api.get('/tenants/me/stats');
    return response.data;
};

/**
 * Get tenant subscription status
 */
export const getSubscriptionStatus = async (): Promise<SubscriptionStatusResponse> => {
    const response = await api.get<SubscriptionStatusResponse>('/tenants/me/subscription');
    return response.data;
};
