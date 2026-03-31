'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { checkAuth, isAuthenticated, updateUser, accessToken } = useAuthStore();

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

    // Only show the restricted loader if we have NO authentication at all (including persisted tokens)
    if (!isAuthenticated && !accessToken) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-sm font-medium text-text-secondary uppercase tracking-widest animate-pulse">
                    Loading...
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
