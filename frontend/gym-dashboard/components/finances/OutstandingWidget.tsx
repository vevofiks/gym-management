'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { OutstandingPayment } from '@/types';
import { AlertCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OutstandingWidgetProps {
    payments: OutstandingPayment[] | undefined;
    isLoading: boolean;
}

export const OutstandingWidget = ({ payments, isLoading }: OutstandingWidgetProps) => {
    if (isLoading) {
        return (
            <Card title="Outstanding Payments" subtitle="Overdue member payments">
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            </Card>
        );
    }

    if (!payments || payments.length === 0) {
        return (
            <Card title="Outstanding Payments" subtitle="Overdue member payments">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-3">
                        <AlertCircle className="text-green-600 dark:text-green-400" size={24} />
                    </div>
                    <p className="text-sm font-medium text-text-primary">All caught up!</p>
                    <p className="text-xs text-text-secondary mt-1">No outstanding payments</p>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Outstanding Payments" subtitle="Overdue member payments">
            <div className="space-y-3">
                {payments.map((payment) => (
                    <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <div className="shrink-0">
                                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <AlertCircle className="text-red-600 dark:text-red-400" size={18} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">
                                    {payment.memberName}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    {payment.daysOverdue} {payment.daysOverdue === 1 ? 'day' : 'days'} overdue
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                    ${payment.amount.toLocaleString()}
                                </p>
                            </div>
                            <button
                                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                                title="Send reminder"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
