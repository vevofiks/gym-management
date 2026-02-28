'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSubscriptionStore } from '@/store/SubscriptionStore';
import toast from 'react-hot-toast';

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { subscription, isLoading, isSubscriptionActive, fetchSubscription } = useSubscriptionStore();

    useEffect(() => {
        // Only fetch if not already loaded
        if (!subscription && !isLoading) {
            fetchSubscription();
        }
    }, [subscription, isLoading, fetchSubscription]);

    useEffect(() => {
        // Skip check if still loading or if already on the subscription page
        if (isLoading || !subscription) {
            return;
        }

        const active = isSubscriptionActive();


        // If subscription or trial is inactive, redirect to subscription page
        if (!active && pathname !== '/subscription') {
            console.warn('Subscription or trial inactive. Redirecting to subscription page...');
            router.push('/subscription');
            return;
        }

        // Feature-based route protection
        if (active) {
            const isTrial = subscription.is_trial;
            const planName = subscription.plan_name.toLowerCase();

            // WhatsApp protection (only for Pro, NOT for Trial)
            if (pathname.startsWith('/settings/whatsapp')) {
                const hasWhatsApp = subscription.features.whatsapp_enabled && !isTrial;
                if (!hasWhatsApp) {
                    toast.error('WhatsApp notifications are available in the Pro plan.');
                    router.push('/');
                }
            }

            // Analytics protection
            if (pathname.startsWith('/analytics')) {
                const hasAnalytics = subscription.features.analytics_enabled || isTrial;
                if (!hasAnalytics) {
                    toast.error('Advanced Analytics are available in the Pro plan.');
                    router.push('/');
                }
            }

            // Expense protection
            if (pathname.startsWith('/expenses')) {
                const hasExpenses = planName === 'pro' || isTrial;
                if (!hasExpenses) {
                    toast.error('Expense tracking is available in the Pro plan.');
                    router.push('/');
                }
            }
        }
    }, [subscription, isLoading, isSubscriptionActive, pathname, router]);

    // While loading initial subscription data, show a simple loader
    if (isLoading && !subscription && pathname !== '/subscription') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Verifying subscription status...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
