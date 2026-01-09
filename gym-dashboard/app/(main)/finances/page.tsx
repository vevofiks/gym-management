'use client';

import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { FinancialChart } from '@/components/finances/FinancialChart';
import { TransactionsTable } from '@/components/finances/TransactionsTable';
import { OutstandingWidget } from '@/components/finances/OutstandingWidget';
import {
    useFinancialSummary,
    useRevenueData,
    useTransactions,
    useOutstandingPayments
} from '@/hooks/useGymData';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function FinancesPage() {
    const { data: summary, isLoading: summaryLoading } = useFinancialSummary();
    const { data: revenue, isLoading: revenueLoading } = useRevenueData();
    const { data: transactions, isLoading: transactionsLoading } = useTransactions();
    const { data: outstanding, isLoading: outstandingLoading } = useOutstandingPayments();

    return (
        <>
            {/* Financial Stats Grid */}
            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(summary?.totalRevenue || 0)}
                    change={summary?.revenueChange || 0}
                    isLoading={summaryLoading}
                    icon={<DollarSign size={24} />}
                    variant="primary"
                />
                <StatsCard
                    title="Total Expenses"
                    value={formatCurrency(summary?.totalExpenses || 0)}
                    change={summary?.expensesChange || 0}
                    isLoading={summaryLoading}
                    icon={<TrendingDown size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Net Profit"
                    value={formatCurrency(summary?.netProfit || 0)}
                    change={summary?.profitChange || 0}
                    isLoading={summaryLoading}
                    icon={<TrendingUp size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Outstanding"
                    value={formatCurrency(summary?.outstandingAmount || 0)}
                    change={0}
                    isLoading={summaryLoading}
                    icon={<AlertCircle size={24} />}
                    variant="default"
                />
            </div>

            {/* Charts & Tables Area */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-8">
                <div className="lg:col-span-2">
                    <FinancialChart data={revenue} isLoading={revenueLoading} />
                </div>
                <div className="lg:col-span-1">
                    <OutstandingWidget payments={outstanding} isLoading={outstandingLoading} />
                </div>
            </div>

            {/* Transactions Table */}
            <div>
                <TransactionsTable transactions={transactions} isLoading={transactionsLoading} />
            </div>
        </>
    );
}
