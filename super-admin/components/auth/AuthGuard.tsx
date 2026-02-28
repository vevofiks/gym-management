'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const verify = async () => {
            const isValid = checkAuth();
            if (!isValid) {
                router.push('/login');
            } else {
                setIsVerifying(false);
            }
        };

        verify();
    }, [checkAuth, router]);

    // Show loading state while verifying or if store is loading
    if (isVerifying || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium tracking-tight">Verifying secure session...</p>
                </div>
            </div>
        );
    }

    // Prevent rendering children if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
