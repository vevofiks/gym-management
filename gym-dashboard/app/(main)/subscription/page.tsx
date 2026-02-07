'use client';

import { useState } from 'react';
import PricingCard from '@/components/subscription/PricingCard';
import { useSubscription } from '@/hooks/useSubscription';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
    const { subscription } = useSubscription();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (planName: string) => {
        setIsLoading(true);
        try {
            // TODO: Implement actual subscription logic
            toast.success(`Subscribing to ${planName}...`);
            // Navigate to payment page or call API
        } catch (error) {
            toast.error('Failed to subscribe. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const starterFeatures = [
        { name: 'Member Management', included: true },
        { name: 'Fee Tracking', included: true },
        { name: 'Payment History', included: true },
        { name: 'Basic Reports', included: true },
        { name: 'Diet Plan Management', included: true },

    ];

    const proFeatures = [
        { name: 'All Starter Features +', included: true, highlighted: true },
        { name: 'Expense Tracking', included: true },
        { name: 'WhatsApp Notifications', included: true },
        { name: 'Diet Plan Management', included: true },
        { name: 'Expense Tracking', included: true },
        { name: 'Advanced Analytics', included: true },
    ];

    const currentPlanName = subscription?.plan_name?.toLowerCase();

    return (
        <div className="max-w-7xl mx-auto mt-10">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-text-primary mb-3">
                    Choose Your Plan
                </h1>
                <p className="text-text-secondary">
                    All plans include a 7-day free trial
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Starter Plan */}
                <PricingCard
                    name="Starter"
                    price={1699}
                    period="month"
                    features={starterFeatures}
                    limits={{
                        members: '100',
                        staff: '2',
                        plans: '5',
                        dietTemplates: '2',
                    }}
                    onSubscribe={() => handleSubscribe('Starter')}
                    isCurrentPlan={currentPlanName === 'starter'}
                />

                {/* Pro Monthly Plan */}
                <PricingCard
                    name="Pro Monthly"
                    price={3699}
                    period="month"
                    badge="popular"
                    features={proFeatures}
                    limits={{
                        members: 'Unlimited',
                        staff: '5',
                        plans: 'Unlimited',
                        dietTemplates: 'Unlimited',
                    }}
                    onSubscribe={() => handleSubscribe('Pro Monthly')}
                    isCurrentPlan={currentPlanName === 'pro'}
                />

                {/* Pro Quarterly Plan */}
                <PricingCard
                    name="Pro Quarterly"
                    price={10499}
                    period="3 months"
                    badge="best-value"
                    features={proFeatures}
                    limits={{
                        members: 'Unlimited',
                        staff: '5',
                        plans: 'Unlimited',
                        dietTemplates: 'Unlimited',
                    }}
                    discount={{
                        originalPrice: 11097,
                        savings: 598,
                    }}
                    onSubscribe={() => handleSubscribe('Pro Quarterly')}
                    isCurrentPlan={false}
                />
            </div>
        </div>
    );
}
