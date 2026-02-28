import { api } from '@/store/AuthStore';
import { UserResponse, UserUpdate, ChangePassword } from '@/types';

/**
 * Get current gym owner/staff profile details
 */
export const getMe = async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/gym-owners/me');
    return response.data;
};

/**
 * Update current user's profile information
 */
export const updateMe = async (userData: UserUpdate): Promise<UserResponse> => {
    const response = await api.put<UserResponse>('/gym-owners/me', userData);
    return response.data;
};

/**
 * Change current user's password
 */
export const changeMyPassword = async (passwordData: ChangePassword) => {
    const response = await api.put('/gym-owners/me/password', passwordData);
    return response.data;
};
