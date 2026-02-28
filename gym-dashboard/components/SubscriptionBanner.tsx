'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SubscriptionBanner() {
    const { subscription, isTrial, isActive, refetch } = useSubscription();
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);


    useEffect(() => {
        if (!isActive || !subscription?.expires_at) {
            setTimeLeft(null);
            return;
        }

        const calculateTimeLeft = () => {
            const expiryStr = subscription.expires_at as string;
            const expiryDate = new Date(expiryStr);
            const now = new Date();
            const difference = expiryDate.getTime() - now.getTime();

            if (difference <= 0) return null;

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        // Initial update
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const nextTime = calculateTimeLeft();
            if (!nextTime) {
                setTimeLeft(null);
                clearInterval(timer);
            } else {
                setTimeLeft(nextTime);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [subscription?.expires_at, isActive]);

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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <p className="text-sm text-text-primary">
                            You are currently on a trial.
                        </p>
                        {timeLeft && (
                            <div className="flex items-center gap-1.5 text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                <Clock className="w-3 h-3" />
                                <span>
                                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                                </span>
                            </div>
                        )}
                    </div>
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
