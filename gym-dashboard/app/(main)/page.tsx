'use client';

import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ExpiringWidget } from '@/components/dashboard/ExpiringWidget';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { UpcomingBirthdays } from '@/components/dashboard/UpcomingBirthdays';
import {
    Users,
    DollarSign,
    UserPlus,
    TrendingUp,
    Activity,
    AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
    getDashboardStats,
    getRevenueChartData,
    getExpiringMembers,
    getRecentActivities,
    getUpcomingBirthdays,
} from '@/services/dashboardService';
import { useAuthStore } from '@/store/AuthStore';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

export default function Dashboard() {
    const router = useRouter();
    const { user } = useAuthStore();

    // Fetch all dashboard data using React Query for automatic caching and de-duplication
    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: getDashboardStats,
    });

    const { data: revenueDataRes, isLoading: isRevenueLoading } = useQuery({
        queryKey: ['dashboard', 'revenue'],
        queryFn: () => getRevenueChartData(6),
    });

    const { data: expiringData, isLoading: isExpiringLoading } = useQuery({
        queryKey: ['dashboard', 'expiring'],
        queryFn: () => getExpiringMembers(7),
    });

    const { data: activityData, isLoading: isActivityLoading } = useQuery({
        queryKey: ['dashboard', 'activities'],
        queryFn: () => getRecentActivities(10),
    });

    const { data: birthdayData, isLoading: isBirthdaysLoading } = useQuery({
        queryKey: ['dashboard', 'birthdays'],
        queryFn: () => getUpcomingBirthdays(7),
    });

    const isLoading = isStatsLoading || isRevenueLoading || isExpiringLoading || isActivityLoading || isBirthdaysLoading;

    const stats = statsData?.stats || null;
    const revenueData = revenueDataRes?.data || [];
    const expiringMembers = expiringData?.members || [];
    const activities = activityData?.activities || [];
    const birthdays = birthdayData?.birthdays || [];

    return (
        <div className="space-y-8 pb-8">
            {/* Header with Refresh Button */}

            {/* Stats Grid */}
            <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${user?.role === 'gym_owner' ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
                <StatsCard
                    title="Total Members"
                    value={stats?.total_members.toString() || '0'}
                    change={stats?.total_members_change || 0}
                    isLoading={isLoading}
                    icon={<Users size={20} />}
                    variant="default"
                />
                <StatsCard
                    title="Active Now"
                    value={stats?.active_members.toString() || '0'}
                    change={stats?.active_members_change || 0}
                    isLoading={isLoading}
                    icon={<Activity size={20} />}
                    variant="default"
                />
                {user?.role === 'gym_owner' && (
                    <StatsCard
                        title="Monthly Revenue"
                        value={formatCurrency(stats?.monthly_revenue || 0)}
                        change={stats?.monthly_revenue_change || 0}
                        isLoading={isLoading}
                        icon={<DollarSign size={20} />}
                        variant="default"
                    />
                )}
                <StatsCard
                    title="New Joiners"
                    value={stats?.new_joiners.toString() || '0'}
                    change={stats?.new_joiners_change || 0}
                    isLoading={isLoading}
                    icon={<UserPlus size={20} />}
                    variant="default"
                />
                <StatsCard
                    title="Member Loyalty"
                    value={stats?.total_members.toString() === '0' ? '0%' : `${stats?.retention_rate || 0}%`}
                    change={stats?.retention_rate_change || 0}
                    isLoading={isLoading}
                    icon={<TrendingUp size={20} />}
                    variant="primary"
                    info="Percentage of members who renewed their plans this month compared to previous periods. High loyalty confirms member satisfaction."
                />
                {user?.role === 'gym_owner' && (
                    <StatsCard
                        title="Outstanding"
                        value={formatCurrency(stats?.outstanding_dues || 0)}
                        change={stats?.outstanding_dues_change || 0}
                        isLoading={isLoading}
                        icon={<AlertCircle size={20} />}
                        variant="default"
                        onClick={() => router.push('/members/insights?filter=outstanding_dues')}
                    />
                )}
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {user?.role === 'gym_owner' ? (
                    <>
                        <div className="lg:col-span-2">
                            <RevenueChart data={revenueData} isLoading={isLoading} />
                        </div>
                        <div className="lg:col-span-1">
                            <QuickActions isLoading={isLoading} />
                        </div>
                    </>
                ) : (
                    <div className="lg:col-span-3">
                        <QuickActions isLoading={isLoading} />
                    </div>
                )}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <ExpiringWidget members={expiringMembers} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-1">
                    <RecentActivityFeed activities={activities} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <UpcomingBirthdays birthdays={birthdays} isLoading={isLoading} />
                    {/* Add more small widgets here if needed */}
                </div>
            </div>
        </div>
    );
}
