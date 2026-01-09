'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Transaction } from '@/types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionsTableProps {
    transactions: Transaction[] | undefined;
    isLoading: boolean;
}

export const TransactionsTable = ({ transactions, isLoading }: TransactionsTableProps) => {
    if (isLoading) {
        return (
            <Card title="Recent Transactions" subtitle="Latest payment activity">
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </Card>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'failed':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <Card title="Recent Transactions" subtitle="Latest payment activity">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                            <th className="text-left py-3 px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</th>
                            <th className="text-left py-3 px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">Method</th>
                            <th className="text-left py-3 px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                            <th className="text-right py-3 px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions?.map((txn) => (
                            <tr key={txn.id} className="border-b border-border/50 hover:bg-background transition-colors">
                                <td className="py-4 px-2 text-sm text-text-secondary">{formatDate(txn.date)}</td>
                                <td className="py-4 px-2">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-text-primary">{txn.memberName || txn.description}</span>
                                        <span className="text-xs text-text-secondary">{txn.category}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-2 text-sm text-text-secondary capitalize">{txn.method.replace('_', ' ')}</td>
                                <td className="py-4 px-2">
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        getStatusColor(txn.status)
                                    )}>
                                        {txn.status}
                                    </span>
                                </td>
                                <td className="py-4 px-2 text-right">
                                    <div className={cn(
                                        "flex items-center justify-end gap-1 font-semibold",
                                        txn.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    )}>
                                        {txn.type === 'income' ? (
                                            <ArrowUpRight size={16} />
                                        ) : (
                                            <ArrowDownRight size={16} />
                                        )}
                                        <span>${txn.amount.toLocaleString()}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
