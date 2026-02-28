'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { checkAuth, isAuthenticated, updateUser } = useAuthStore();

    useEffect(() => {
        const isAuth = checkAuth();

        if (!isAuth) {
            router.push('/login');
        } else {
            // Fetch latest user data to keep store in sync (e.g. avatar_url)
            import('@/services/userService').then(({ getMe }) => {
                getMe().then(data => {
                    updateUser({
                        avatar_url: data.avatar_url,
                        username: data.username,
                    });
                }).catch(err => console.error('Failed to sync profile', err));
            });
        }
    }, [checkAuth, router, updateUser]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
