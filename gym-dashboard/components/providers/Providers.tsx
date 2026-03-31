'use client';

import { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/AuthStore';
import { useSubscriptionStore } from '@/store/SubscriptionStore';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

function AuthInitializer() {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        // Initialize auth state on app mount
        checkAuth();
    }, [checkAuth]);

    return null;
}

function SubscriptionInitializer() {
    const fetchSubscription = useSubscriptionStore((state) => state.fetchSubscription);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        // Fetch subscription data after authentication
        if (isAuthenticated) {
            fetchSubscription();
        }
    }, [isAuthenticated, fetchSubscription]);

    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutes
                gcTime: 10 * 60 * 1000, // 10 minutes
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthInitializer />
                <SubscriptionInitializer />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'var(--color-sidebar)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-border)',
                        },
                        success: {
                            iconTheme: {
                                primary: 'var(--color-primary)',
                                secondary: 'white',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: 'white',
                            },
                        },
                    }}
                />
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    );
}
