'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
    TrendingUp,
    TrendingDown,
    Users,
    UserCheck,
    UserX,
    Calendar,
} from 'lucide-react';
import { getMemberGrowth, getMemberStats, getChurnRate, getPlanDistribution, getAverageTenure } from '@/services/analyticsService';
import { MemberGrowthResponse, MemberStatsResponse, ChurnRateResponse, PlanDistributionResponse, AverageTenureResponse } from '@/types';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { AttendanceChart } from '@/components/analytics/AttendanceChart';
import { StatsCard } from '@/components/dashboard/StatsCard';

const MemberGrowthChart = dynamic(() => import('@/components/analytics/MemberGrowthChart').then(mod => mod.MemberGrowthChart), { ssr: false });
const PlanDistributionChart = dynamic(() => import('@/components/analytics/PlanDistributionChart').then(mod => mod.PlanDistributionChart), { ssr: false });

export default function AnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Data
    const [memberStats, setMemberStats] = useState<MemberStatsResponse | null>(null);
    const [growthData, setGrowthData] = useState<MemberGrowthResponse | null>(null);
    const [churnData, setChurnData] = useState<ChurnRateResponse | null>(null);
    const [planDistribution, setPlanDistribution] = useState<PlanDistributionResponse | null>(null);
    const [avgTenure, setAvgTenure] = useState<AverageTenureResponse | null>(null);

    // Filters
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [quickFilter, setQuickFilter] = useState<string>('this_month');

    const fetchData = async () => {
        try {
            setIsRefreshing(true);

            const [stats, growth, churn, distribution, tenure] = await Promise.all([
                getMemberStats(startDate, endDate),
                getMemberGrowth(startDate, endDate),
                getChurnRate(startDate, endDate),
                getPlanDistribution(startDate, endDate),
                getAverageTenure(startDate, endDate),
            ]);

            setMemberStats(stats);
            setGrowthData(growth);
            setChurnData(churn);
            setPlanDistribution(distribution);
            setAvgTenure(tenure);
        } catch (error: any) {
            console.error('Failed to fetch analytics data:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const handleQuickFilter = (filter: string) => {
        setQuickFilter(filter);
        const now = new Date();

        switch (filter) {
            case 'this_month':
                setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
                setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
                break;
            case 'last_month':
                const lastMonth = subMonths(now, 1);
                setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
                setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
                break;
            case 'last_3_months':
                setStartDate(format(subMonths(now, 3), 'yyyy-MM-dd'));
                setEndDate(format(now, 'yyyy-MM-dd'));
                break;
            case 'last_6_months':
                setStartDate(format(subMonths(now, 6), 'yyyy-MM-dd'));
                setEndDate(format(now, 'yyyy-MM-dd'));
                break;
        }
    };

    // Calculate growth percentage (comparing new members to previous period)
    const newMembersCount = growthData?.total_new_members || 0;
    const totalMembers = memberStats?.total_members || 0;
    const growthRate = totalMembers > 0 ? ((newMembersCount / totalMembers) * 100) : 0;

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Members"
                    value={totalMembers}
                    change={growthRate}
                    isLoading={isLoading}
                    icon={<Users size={20} />}
                />

                <StatsCard
                    title="Active Rate"
                    value={`${memberStats?.active_rate.toFixed(1)}%`}
                    footer={`${memberStats?.active_members} of ${totalMembers} active`}
                    isLoading={isLoading}
                    icon={<UserCheck size={20} />}
                    hideTrend
                />

                <StatsCard
                    title="Churn Rate"
                    value={`${churnData?.churn_rate.toFixed(1)}%`}
                    footer={`${churnData?.churned_members} of ${churnData?.total_eligible} didn't renew`}
                    isLoading={isLoading}
                    icon={<UserX size={20} />}
                    info="Percentage of members who chose not to renew their membership during the selected period. Lower is better."
                    hideTrend
                />

                {/* <StatsCard
                    title="Avg Tenure (Days)"
                    value={Math.round(avgTenure?.average_tenure_days || 0)}
                    isLoading={isLoading}
                    icon={<Clock size={20} />}
                    info="The average duration in days a member stays active with the gym. Higher tenure indicates better loyalty."
                    hideTrend
                /> */}
            </div>

            {/* Quick Filters */}
           

            {/* Date Range Filter */}
            <div className="bg-card border border-border p-2 rounded-2xl shadow-soft flex items-center justify-between gap-3 lg:gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                {/* Quick Filters (Segmented Control style) */}
                <div className="flex p-1 bg-muted/40 rounded-xl w-fit overflow-x-auto no-scrollbar">
                    {[
                        { key: 'this_month', label: 'This Month' },
                        { key: 'last_month', label: 'Last Month' },
                        { key: 'last_3_months', label: 'Last 3 Months' },
                        { key: 'last_6_months', label: 'Last 6 Months' }
                    ].map(filter => (
                        <button
                            key={filter.key}
                            onClick={() => handleQuickFilter(filter.key)}
                            className={cn(
                                "px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all duration-300",
                                quickFilter === filter.key
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-text-secondary hover:text-text-primary"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Vertical Separator (Only on Desktop) */}

                {/* Custom Range Group */}
                <div className="flex items-center gap-4 w-full lg:w-auto bg-muted/5 lg:bg-transparent p-2 lg:p-0 rounded-xl">
                    <div className="flex items-center gap-2 text-primary shrink-0">
                        <Calendar size={18} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Range</span>
                    </div>

                    <div className="flex items-center gap-2 flex-1 justify-between lg:justify-start">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setQuickFilter('custom'); }}
                            className="bg-background/80 hover:bg-background px-4 py-2 rounded-xl text-[11px] font-black border border-border/50 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all w-full sm:w-auto"
                        />
                        <span className="text-text-secondary/30 font-black text-[10px]">TO</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setQuickFilter('custom'); }}
                            className="bg-background/80 hover:bg-background px-4 py-2 rounded-xl text-[11px] font-black border border-border/50 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all w-full sm:w-auto"
                        />
                    </div>
                </div>
            </div>

            {isLoading && !isRefreshing ? (
                <div className="w-full h-96 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">Loading Analytics...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Summary Stats */}
                   

                    {/* Member Growth Chart */}
                    <MemberGrowthChart data={growthData?.data || []} isLoading={isRefreshing} />

                    {/* Plan Distribution & Attendance Charts */}
                    <div className="grid grid-cols-1 gap-6">
                        <PlanDistributionChart data={planDistribution?.data || []} isLoading={isRefreshing} />
                        {/* <AttendanceChart /> */}
                    </div>

                    {/* Member Status Breakdown */}
                    <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
                        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-primary rounded-full" />
                            Member Status Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-text-secondary uppercase">Active</span>
                                    <UserCheck size={16} className="text-green-500" />
                                </div>
                                <div className="text-2xl font-black text-green-500">{memberStats?.active_members}</div>
                                <div className="text-[10px] text-text-secondary mt-1">
                                    {memberStats?.active_rate.toFixed(1)}% of total
                                </div>
                            </div>
                            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-text-secondary uppercase">Expired</span>
                                    <TrendingDown size={16} className="text-orange-500" />
                                </div>
                                <div className="text-2xl font-black text-orange-500">{memberStats?.expired_members}</div>
                                <div className="text-[10px] text-text-secondary mt-1">
                                    {totalMembers > 0 ? ((memberStats?.expired_members || 0) / totalMembers * 100).toFixed(1) : 0}% of total
                                </div>
                            </div>
                            <div className="p-4 bg-gray-500/5 border border-gray-500/20 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-text-secondary uppercase">Inactive</span>
                                    <UserX size={16} className="text-gray-500" />
                                </div>
                                <div className="text-2xl font-black text-gray-500">{memberStats?.inactive_members}</div>
                                <div className="text-[10px] text-text-secondary mt-1">
                                    {totalMembers > 0 ? ((memberStats?.inactive_members || 0) / totalMembers * 100).toFixed(1) : 0}% of total
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
