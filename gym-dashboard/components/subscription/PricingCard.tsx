'use client';

import { Check, Sparkles, TrendingUp } from 'lucide-react';

interface PricingCardProps {
    name: string;
    price: number;
    period: string;
    badge?: 'popular' | 'best-value';
    features: {
        name: string;
        included: boolean;
        highlighted?: boolean;
    }[];
    limits: {
        members: string;
        staff: string;
        plans: string;
        dietTemplates: string;
    };
    onSubscribe: () => void;
    isCurrentPlan?: boolean;
    discount?: {
        originalPrice: number;
        savings: number;
    };
}

export default function PricingCard({
    name,
    price,
    period,
    badge,
    features,
    limits,
    onSubscribe,
    isCurrentPlan = false,
    discount,
}: PricingCardProps) {
    const isPopular = badge === 'popular';
    const isBestValue = badge === 'best-value';

    return (
        <div
            className={`relative rounded-2xl border p-6 transition-all flex flex-col ${isPopular || isBestValue
                ? 'border-primary shadow-glow scale-100'
                : 'border-border hover:border-primary/50'
                }`}
        >
            {/* Badge */}
            {badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div
                        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${isPopular
                            ? 'bg-primary text-white'
                            : 'bg-linear-to-r from-yellow-500 to-orange-500 text-white'
                            }`}
                    >
                        {isPopular ? (
                            <>
                                <Sparkles size={16} />
                                Most Popular
                            </>
                        ) : (
                            <>
                                <TrendingUp size={16} />
                                Best Value
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Plan Name */}
            <h3 className="text-2xl font-bold text-text-primary mb-2">{name}</h3>

            {/* Price */}
            <div className="mb-6">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-text-primary">
                        ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-text-secondary">/{period}</span>
                </div>
            </div>

            {/* Limits */}
            <div className="mb-6 space-y-2 p-4 bg-background rounded-xl">
                <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Members:</span>
                    <span className="font-semibold text-text-primary">{limits.members}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Staff:</span>
                    <span className="font-semibold text-text-primary">{limits.staff}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Plans:</span>
                    <span className="font-semibold text-text-primary">{limits.plans}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Diet Templates:</span>
                    <span className="font-semibold text-text-primary">{limits.dietTemplates}</span>
                </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6 flex-1">
                {features.map((feature, index) => (
                    <li
                        key={index}
                        className={`flex items-start gap-3 ${feature.highlighted
                            ? 'bg-linear-to-r from-primary/10 to-transparent p-2 rounded-lg -mx-2'
                            : ''
                            }`}
                    >
                        <div
                            className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${feature.highlighted
                                ? 'bg-primary text-white'
                                : feature.included
                                    ? 'bg-green-500/10 text-green-600'
                                    : 'bg-gray-500/10 text-gray-400'
                                }`}
                        >
                            {feature.included ? (
                                <Check size={14} strokeWidth={3} />
                            ) : (
                                <span className="text-xs">✕</span>
                            )}
                        </div>
                        <span
                            className={`text-sm ${feature.highlighted
                                ? 'text-primary font-bold'
                                : feature.included
                                    ? 'text-text-primary'
                                    : 'text-text-secondary'
                                }`}
                        >
                            {feature.name}
                        </span>
                    </li>
                ))}
            </ul>

            {/* Subscribe Button */}
            <button
                onClick={onSubscribe}
                disabled={isCurrentPlan}
                className={`w-full py-3 rounded-xl font-semibold transition-all cursor-pointer ${isCurrentPlan
                        ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed'
                        : isPopular || isBestValue
                            ? 'bg-primary text-white hover:bg-primary/90 shadow-lg'
                            : 'bg-white dark:bg-white text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200 border border-border shadow-sm'
                    }`}
            >
                {isCurrentPlan ? 'Current Plan' : 'Subscribe Now'}
            </button>
        </div>
    );
}
