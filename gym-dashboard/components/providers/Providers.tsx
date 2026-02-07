'use client';

import { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/AuthStore';
import { useSubscriptionStore } from '@/store/SubscriptionStore';

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
    return (
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
    );
}
