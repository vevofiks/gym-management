import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { AuthState, AuthUser, LoginRequest, LoginResponse } from '@/types';

interface AuthStore extends AuthState {
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    setToken: (token: string) => void;
    checkAuth: () => boolean;
    updateUser: (userData: Partial<AuthUser>) => void;
    forgotPassword: (email: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/',
});

const decodeToken = (token: string): AuthUser | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload);

        return {
            username: payload.sub,
            role: payload.role,
            tenant_id: payload.tenant_id || null,
            plan_name: payload.plan_name,
            subscription_status: payload.subscription_status,
        };
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials: LoginRequest) => {
                set({ isLoading: true, error: null });

                try {
                    // Create form data for OAuth2PasswordRequestForm
                    const formData = new URLSearchParams();
                    formData.append('username', credentials.username);
                    formData.append('password', credentials.password);

                    const response = await api.post<LoginResponse>(
                        '/auth/login',
                        formData,
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        }
                    );

                    const { access_token } = response.data;
                    const user = decodeToken(access_token);

                    if (!user) {
                        throw new Error('Invalid token received');
                    }

                    // Check if user is super_admin
                    if (user.role !== 'super_admin') {
                        throw new Error('Access denied. Super Admin role required.');
                    }

                    // Set axios default authorization header
                    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

                    set({
                        accessToken: access_token,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail || error.message || 'Login failed. Please check your credentials.';
                    set({
                        accessToken: null,
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage,
                    });
                    throw new Error(errorMessage);
                }
            },

            logout: () => {
                delete api.defaults.headers.common['Authorization'];

                set({
                    accessToken: null,
                    user: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            setToken: (token: string) => {
                const user = decodeToken(token);

                if (user && user.role === 'super_admin') {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    set({
                        accessToken: token,
                        user,
                        isAuthenticated: true,
                    });
                }
            },

            checkAuth: () => {
                const { accessToken } = get();

                if (!accessToken) {
                    return false;
                }

                try {
                    // Decode token to check expiration
                    const base64Url = accessToken.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                        atob(base64)
                            .split('')
                            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    );

                    const payload = JSON.parse(jsonPayload);

                    // Check if token is expired
                    if (payload.exp) {
                        const currentTime = Math.floor(Date.now() / 1000);
                        if (payload.exp < currentTime) {
                            console.warn('Token expired, logging out');
                            get().logout();
                            return false;
                        }
                    }

                    const user = decodeToken(accessToken);
                    if (!user || user.role !== 'super_admin') {
                        get().logout();
                        return false;
                    }

                    // Set axios header if token is valid
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    return true;
                } catch (error) {
                    console.error('Token validation failed:', error);
                    get().logout();
                    return false;
                }
            },

            updateUser: (userData: Partial<AuthUser>) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: { ...currentUser, ...userData }
                    });
                }
            },

            forgotPassword: async (email: string) => {
                set({ isLoading: true, error: null });
                try {
                    await api.post('/auth/forgot-password', { email });
                    set({ isLoading: false });
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail || 'Failed to request password reset';
                    set({ isLoading: false, error: errorMessage });
                    throw new Error(errorMessage);
                }
            },

            verifyOtp: async (email: string, otp: string) => {
                set({ isLoading: true, error: null });
                try {
                    await api.post('/auth/verify-otp', { email, otp });
                    set({ isLoading: false });
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail || 'Invalid or expired OTP';
                    set({ isLoading: false, error: errorMessage });
                    throw new Error(errorMessage);
                }
            },

            resetPassword: async (email: string, otp: string, newPassword: string) => {
                set({ isLoading: true, error: null });
                try {
                    await api.post('/auth/reset-password', {
                        email,
                        otp,
                        new_password: newPassword
                    });
                    set({ isLoading: false });
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail || 'Failed to reset password';
                    set({ isLoading: false, error: errorMessage });
                    throw new Error(errorMessage);
                }
            },
        }),
        {
            name: 'super-admin-auth-storage',
            partialize: (state) => ({
                accessToken: state.accessToken,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export { api };
