'use client';

import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ExpiringWidget } from '@/components/dashboard/ExpiringWidget';
import { useDashboardStats, useRevenueData, useExpiringMembers } from '@/hooks/useGymData';
import { Users, DollarSign, UserPlus, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
    const { data: stats, isLoading: statsLoading } = useDashboardStats();
    const { data: revenue, isLoading: revenueLoading } = useRevenueData();
    const { data: expiring, isLoading: expiringLoading } = useExpiringMembers();

    return (
        <>
            {/* Stats Grid */}
            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Members"
                    value={stats?.totalActiveMembers.toString() || "0"}
                    change={stats?.totalActiveChange || 0}
                    isLoading={statsLoading}
                    icon={<Users size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Monthly Revenue"
                    value={formatCurrency(stats?.monthlyRevenue || 0)}
                    change={stats?.revenueChange || 0}
                    isLoading={statsLoading}
                    icon={<DollarSign size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="New Joiners"
                    value={stats?.newJoiners.toString() || "0"}
                    change={stats?.newJoinersChange || 0}
                    isLoading={statsLoading}
                    icon={<UserPlus size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Retention Rate"
                    value={`${stats?.retentionRate}%`}
                    change={1.2}
                    isLoading={statsLoading}
                    icon={<TrendingUp size={24} />}
                    variant="primary"
                />
            </div>

            {/* Charts & Widgets Area */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RevenueChart data={revenue} isLoading={revenueLoading} />
                </div>
                <div className="lg:col-span-1">
                    <ExpiringWidget members={expiring} isLoading={expiringLoading} />
                </div>
            </div>
        </>
    );
}
