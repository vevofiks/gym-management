'use client';

import React, { useEffect, useState } from 'react';
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
    RefreshCw,
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
import {
    DashboardStats,
    RevenueChartDataPoint,
    ExpiringMember,
    RecentActivity,
    UpcomingBirthday,
} from '@/types';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueChartDataPoint[]>([]);
    const [expiringMembers, setExpiringMembers] = useState<ExpiringMember[]>([]);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [birthdays, setBirthdays] = useState<UpcomingBirthday[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setIsRefreshing(true);

            const [statsRes, revenueRes, expiringRes, activityRes, birthdayRes] = await Promise.all([
                getDashboardStats(),
                getRevenueChartData(6),
                getExpiringMembers(7),
                getRecentActivities(10),
                getUpcomingBirthdays(7),
            ]);

            setStats(statsRes.stats);
            setRevenueData(revenueRes.data);
            setExpiringMembers(expiringRes.members);
            setActivities(activityRes.activities);
            setBirthdays(birthdayRes.birthdays);
            console.log(`this is stats : `, statsRes.stats)
        } catch (error: any) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleRefresh = () => {
        fetchDashboardData();
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header with Refresh Button */}
            <div className="flex items-center justify-end">
                <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-background border border-border text-text-primary hover:bg-primary hover:text-white hover:border-primary transition-all font-bold h-11 px-6 rounded-xl"
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                    Refresh
                </Button>
            </div>

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
                            <QuickActions />
                        </div>
                    </>
                ) : (
                    <div className="lg:col-span-3">
                        <QuickActions />
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
