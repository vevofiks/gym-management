'use client';

import { useState, useEffect } from 'react';
import PricingCard from '@/components/subscription/PricingCard';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuthStore } from '@/store/AuthStore';
import { useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/store/AuthStore';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function SubscriptionPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { subscription, refetch } = useSubscription();
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);

    const isInactive = subscription && (!subscription.is_active || subscription.status === 'expired');

    useLayoutEffect(() => {
        if (user?.role === 'gym_staff') {
            router.push('/');
        }
    }, [user, router]);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleSubscribe = async (planName: string) => {
        // Map plan names to IDs
        let planId = 2; // Default to Pro
        if (planName.toLowerCase().includes('starter')) {
            planId = 1;
        } else if (planName.toLowerCase().includes('quarterly')) {
            planId = 3;
        }

        setProcessingPlan(planName);
        try {
            // 1. Initiate Razorpay Payment
            const { data: orderData } = await api.post('/subscriptions/payment/razorpay/initiate', {
                plan_id: planId
            });

            const options = {
                key: orderData.key_id,
                amount: orderData.amount * 100, // Amount is in paisa
                currency: orderData.currency,
                name: "VEVOFIKS GYM",
                description: `Subscription for ${orderData.plan_name}`,
                order_id: orderData.razorpay_order_id,
                handler: async function (response: any) {
                    try {
                        setProcessingPlan(planName);
                        // 2. Verify Razorpay Payment
                        const { data: verifyData } = await api.post('/subscriptions/payment/razorpay/verify', {
                            payment_id: orderData.payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyData.success) {
                            toast.success('Subscription activated successfully!');
                            await refetch();
                            router.push('/');
                        }
                    } catch (err: any) {
                        console.error('Verification failed:', err);
                        toast.error(err.response?.data?.detail || 'Payment verification failed');
                    } finally {
                        setProcessingPlan(null);
                    }
                },
                prefill: {
                    name: orderData.user_name || "",
                    email: orderData.user_email || "",
                    contact: orderData.user_phone || ""
                },
                theme: {
                    color: "#3b82f6"
                },
                modal: {
                    ondismiss: function () {
                        setProcessingPlan(null);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error: any) {
            console.error('Subscription error:', error);
            toast.error(error.response?.data?.detail || 'Failed to initiate payment. Please try again.');
            setProcessingPlan(null);
        }
    };

    const starterFeatures = [
        { name: 'Member Management', included: true },
        { name: 'Fee Tracking', included: true },
        { name: 'Payment History', included: true },
        { name: 'Diet Plan Management', included: true },
        { name: 'Staff Management', included: true },
        { name: 'Basic Reports', included: true },
    ];

    const proFeatures = [
        { name: 'All Starter Features +', included: true, highlighted: true },
        { name: 'WhatsApp Notifications', included: true },
        { name: 'Inventory & Store Management', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Expense Tracking', included: true },
        { name: 'Premium Support', included: true },
    ];

    const currentPlanName = subscription?.plan_name?.toLowerCase();

    return (
        <div className="max-w-7xl mx-auto mt-10 px-4">
            {/* Expiration Warning */}
            {isInactive && (
                <div className="mb-8 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="h-14 w-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                        <AlertCircle size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl font-bold text-text-primary mb-1">Your subscription is over</h2>
                        <p className="text-text-secondary">Please subscribe to a plan to continue accessing the platform features and managing your gym.</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-text-primary mb-3">
                    Choose Your Plan
                </h1>
                <p className="text-text-secondary max-w-2xl mx-auto">
                    All new accounts start with a <strong>7-day free trial</strong>. Trial includes Pro features (unlimited members & diet plans) but excludes WhatsApp notifications.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Starter Plan */}
                <PricingCard
                    name="Starter"
                    price={1499}
                    period="month"
                    features={starterFeatures}
                    limits={{
                        members: '100',
                        staff: '1',
                        plans: '2',
                        dietTemplates: '2',
                    }}
                    onSubscribe={() => handleSubscribe('Starter')}
                    isCurrentPlan={currentPlanName === 'starter'}
                    isLoading={processingPlan === 'Starter'}
                />

                {/* Pro Monthly Plan */}
                <PricingCard
                    name="Pro Monthly"
                    price={3499}
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
                    isLoading={processingPlan === 'Pro Monthly'}
                />

                {/* Pro Quarterly Plan */}
                <PricingCard
                    name="Pro Quarterly"
                    price={10000}
                    period="3 months"
                    badge="best-value"
                    features={[
                        ...proFeatures,
                    ]}
                    limits={{
                        members: 'Unlimited',
                        staff: '5',
                        plans: 'Unlimited',
                        dietTemplates: 'Unlimited',
                    }}
                    discount={{
                        originalPrice: 10499,
                        savings: 499,
                    }}
                    onSubscribe={() => handleSubscribe('Pro Quarterly')}
                    isCurrentPlan={false}
                    isLoading={processingPlan === 'Pro Quarterly'}
                />
            </div>

            {/* Queue Note */}
            <div className="mt-8 mb-4 max-w-2xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border text-xs text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span>Note: If you have an active plan, new subscriptions will be <strong>queued</strong> and activated automatically when your current plan expires.</span>
                </div>
            </div>
        </div>
    );
}
