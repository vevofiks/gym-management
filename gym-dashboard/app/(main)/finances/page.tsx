'use client';

import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { FinancialChart } from '@/components/finances/FinancialChart';
import { TransactionsTable } from '@/components/finances/TransactionsTable';
import { OutstandingWidget } from '@/components/finances/OutstandingWidget';
import { MOCK_FINANCIAL_SUMMARY, MOCK_REVENUE, MOCK_TRANSACTIONS, MOCK_OUTSTANDING } from '@/lib/mockData';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function FinancesPage() {
    return (
        <>
            {/* Financial Stats Grid */}
            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(MOCK_FINANCIAL_SUMMARY.totalRevenue)}
                    change={MOCK_FINANCIAL_SUMMARY.revenueChange}
                    isLoading={false}
                    icon={<DollarSign size={24} />}
                    variant="primary"
                />
                <StatsCard
                    title="Total Expenses"
                    value={formatCurrency(MOCK_FINANCIAL_SUMMARY.totalExpenses)}
                    change={MOCK_FINANCIAL_SUMMARY.expensesChange}
                    isLoading={false}
                    icon={<TrendingDown size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Net Profit"
                    value={formatCurrency(MOCK_FINANCIAL_SUMMARY.netProfit)}
                    change={MOCK_FINANCIAL_SUMMARY.profitChange}
                    isLoading={false}
                    icon={<TrendingUp size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Outstanding"
                    value={formatCurrency(MOCK_FINANCIAL_SUMMARY.outstandingAmount)}
                    change={0}
                    isLoading={false}
                    icon={<AlertCircle size={24} />}
                    variant="default"
                />
            </div>

            {/* Charts & Tables Area */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-8">
                <div className="lg:col-span-2">
                    <FinancialChart data={MOCK_REVENUE} isLoading={false} />
                </div>
                <div className="lg:col-span-1">
                    <OutstandingWidget payments={MOCK_OUTSTANDING} isLoading={false} />
                </div>
            </div>

            {/* Transactions Table */}
            <div>
                <TransactionsTable transactions={MOCK_TRANSACTIONS} isLoading={false} />
            </div>
        </>
    );
}
