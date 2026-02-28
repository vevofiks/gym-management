import { api } from '@/store/AuthStore';
import {
    TenantResponse,
    TenantListResponse,
    TenantStats,
    CreateTenantRequest,
    UserResponse,
    UserListResponse,
} from '@/types';

export const tenantService = {
    /**
     * List all tenants with pagination and filtering
     */
    getTenants: async (
        page: number = 1,
        pageSize: number = 50,
        search?: string,
        activeOnly: boolean = true
    ): Promise<TenantListResponse> => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', pageSize.toString());
        params.append('active_only', activeOnly.toString());
        if (search) params.append('search', search);

        const response = await api.get<TenantListResponse>(`/admin/tenants?${params.toString()}`);
        return response.data;
    },

    /**
     * Get tenant by ID
     */
    getTenantById: async (id: number): Promise<TenantResponse> => {
        const response = await api.get<TenantResponse>(`/admin/tenants/${id}`);
        return response.data;
    },

    /**
     * Create a new tenant
     */
    createTenant: async (data: CreateTenantRequest): Promise<TenantResponse> => {
        const response = await api.post<TenantResponse>('/admin/tenants', data);
        return response.data;
    },

    /**
     * Update tenant details
     */
    updateTenant: async (id: number, data: Partial<CreateTenantRequest>): Promise<TenantResponse> => {
        const response = await api.put<TenantResponse>(`/admin/tenants/${id}`, data);
        return response.data;
    },

    /**
     * Delete (soft) a tenant
     */
    deleteTenant: async (id: number): Promise<void> => {
        await api.delete(`/admin/tenants/${id}`);
    },

    /**
     * Get stats for a specific tenant
     */
    getTenantStats: async (id: number): Promise<TenantStats> => {
        const response = await api.get<TenantStats>(`/admin/tenants/${id}/stats`);
        return response.data;
    },

    /**
     * Get system-wide stats
     */
    getSystemStats: async (): Promise<any> => {
        const response = await api.get('/admin/stats/overview');
        return response.data;
    },

    /**
     * List all gym owners/staff across all tenants
     */
    getGymOwners: async (
        page: number = 1,
        pageSize: number = 50,
        search?: string,
        role?: string
    ): Promise<UserListResponse> => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', pageSize.toString());
        if (search) params.append('search', search);
        if (role) params.append('role', role);

        const response = await api.get<UserListResponse>(`/admin/gym-owners?${params.toString()}`);
        return response.data;
    },

    /**
     * Create a new gym owner assigned to a tenant
     */
    createGymOwner: async (tenantId: number, data: any): Promise<UserResponse> => {
        const response = await api.post<UserResponse>(`/admin/gym-owners?tenant_id=${tenantId}`, data);
        return response.data;
    },

    /**
     * Update gym owner details
     */
    updateGymOwner: async (userId: number, data: any): Promise<UserResponse> => {
        const response = await api.put<UserResponse>(`/admin/gym-owners/${userId}`, data);
        return response.data;
    },

    /**
     * Delete gym owner (soft delete)
     */
    deleteGymOwner: async (userId: number): Promise<void> => {
        await api.delete(`/admin/gym-owners/${userId}`);
    },

    /**
     * Validate uniqueness of gym owner username, email, and phone
     */
    validateGymOwnerUniqueness: async (data: { username?: string, email?: string, phone_number?: string, exclude_user_id?: number }): Promise<{ is_unique: boolean; errors: Record<string, string> }> => {
        const response = await api.post<{ is_unique: boolean; errors: Record<string, string> }>('/admin/validate-uniqueness', data);
        return response.data;
    },

    /**
     * Trash Management
     */
    getTrashedTenants: async (params?: { skip?: number; limit?: number; search?: string }): Promise<TenantListResponse> => {
        const response = await api.get<TenantListResponse>('/admin/trash/tenants', { params });
        return response.data;
    },

    restoreTenant: async (tenantId: number): Promise<TenantResponse> => {
        const response = await api.post<TenantResponse>(`/admin/tenants/${tenantId}/restore`);
        return response.data;
    },

    permanentDeleteTenant: async (tenantId: number): Promise<void> => {
        await api.delete(`/admin/tenants/${tenantId}/permanent`);
    },

    getTrashedGymOwners: async (params?: { skip?: number; limit?: number; search?: string }): Promise<UserListResponse> => {
        const response = await api.get<UserListResponse>('/admin/trash/gym-owners', { params });
        return response.data;
    },

    restoreGymOwner: async (userId: number): Promise<UserResponse> => {
        const response = await api.post<UserResponse>(`/admin/gym-owners/${userId}/restore`);
        return response.data;
    },

    permanentDeleteGymOwner: async (userId: number): Promise<void> => {
        await api.delete(`/admin/gym-owners/${userId}/permanent`);
    }
};
