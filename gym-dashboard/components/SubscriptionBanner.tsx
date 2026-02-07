'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionBanner() {
    const { subscription, isTrial, isActive, daysRemaining } = useSubscription();

    // Only show during trial period
    if (!subscription || !isTrial || !isActive) {
        return null;
    }

    return (
        <div className="sticky top-0 z-40 w-full bg-linear-to-r from-primary/10 via-primary/5 to-primary/5 border-b border-primary/20 px-6 lg:px-10 py-3 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4">
                {/* Trial Message */}
                <div className="flex items-center gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-text-primary">
                        You are currently on a trial with{' '}
                        <span className="font-semibold text-primary">
                            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                        </span>
                        {' '}remaining.
                    </p>
                </div>

                {/* Subscribe Button */}
                <Link href="/subscription">
                    <button className="shrink-0 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                        Subscribe Now
                    </button>
                </Link>
            </div>
        </div>
    );
}
