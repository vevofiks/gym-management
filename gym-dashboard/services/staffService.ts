import { api } from '@/store/AuthStore';
import { UserResponse, UserListResponse } from '@/types';

export interface StaffCreate {
    name: string;
    username: string;
    email: string;
    phone_number: string;
    password: string;
    role: 'gym_staff';
}

export interface StaffUpdate {
    name?: string;
    email?: string;
    phone_number?: string;
    is_active?: boolean;
}

/**
 * List all staff members for the current tenant
 */
export const listStaff = async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
}): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>('/gym-owners/', {
        params: {
            ...params,
            role: 'gym_staff'
        }
    });
    return response.data;
};

/**
 * Create a new staff member
 */
export const createStaff = async (staffData: StaffCreate): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/gym-owners/', staffData);
    return response.data;
};

/**
 * Update a staff member's details
 */
export const updateStaff = async (staffId: number, staffData: StaffUpdate): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/gym-owners/${staffId}`, staffData);
    return response.data;
};

/**
 * Delete a staff member (soft delete)
 */
export const deleteStaff = async (staffId: number): Promise<void> => {
    await api.delete(`/gym-owners/${staffId}`);
};

export interface StaffUniquenessCheckRequest {
    username?: string;
    email?: string;
    phone_number?: string;
    exclude_user_id?: number;
}

export interface StaffUniquenessCheckResponse {
    is_unique: boolean;
    errors: Record<string, string>;
}

/**
 * Validate staff uniqueness (username, email, phone)
 */
export const validateStaffUniqueness = async (
    data: StaffUniquenessCheckRequest
): Promise<StaffUniquenessCheckResponse> => {
    const response = await api.post<StaffUniquenessCheckResponse>(
        '/gym-owners/validate-uniqueness',
        data
    );
    return response.data;
};
