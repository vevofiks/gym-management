'use client';

import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ExpiringWidget } from '@/components/dashboard/ExpiringWidget';
import { MOCK_STATS, MOCK_REVENUE, MOCK_EXPIRING_MEMBERS } from '@/lib/mockData';
import { Users, DollarSign, UserPlus, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
    return (
        <>
            {/* Stats Grid */}
            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Members"
                    value={MOCK_STATS.totalActiveMembers.toString()}
                    change={MOCK_STATS.totalActiveChange}
                    isLoading={false}
                    icon={<Users size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Monthly Revenue"
                    value={formatCurrency(MOCK_STATS.monthlyRevenue)}
                    change={MOCK_STATS.revenueChange}
                    isLoading={false}
                    icon={<DollarSign size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="New Joiners"
                    value={MOCK_STATS.newJoiners.toString()}
                    change={MOCK_STATS.newJoinersChange}
                    isLoading={false}
                    icon={<UserPlus size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Retention Rate"
                    value={`${MOCK_STATS.retentionRate}%`}
                    change={1.2}
                    isLoading={false}
                    icon={<TrendingUp size={24} />}
                    variant="primary"
                />
            </div>

            {/* Charts & Widgets Area */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RevenueChart data={MOCK_REVENUE} isLoading={false} />
                </div>
                <div className="lg:col-span-1">
                    <ExpiringWidget members={MOCK_EXPIRING_MEMBERS} isLoading={false} />
                </div>
            </div>
        </>
    );
}
