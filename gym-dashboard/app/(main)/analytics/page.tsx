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
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
} from 'lucide-react';
import { getMemberGrowth, getMemberStats, getChurnRate, getPlanDistribution, getAverageTenure } from '@/services/analyticsService';
import { MemberGrowthResponse, MemberStatsResponse, ChurnRateResponse, PlanDistributionResponse, AverageTenureResponse } from '@/types';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { AttendanceChart } from '@/components/analytics/AttendanceChart';

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
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        disabled={isRefreshing}
                        className="p-3 rounded-xl bg-card border border-border text-text-secondary hover:text-primary transition-all active:scale-95 shadow-soft"
                    >
                        <RefreshCw size={20} className={cn(isRefreshing && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3">
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
                            "px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                            quickFilter === filter.key
                                ? "bg-primary text-white shadow-glow"
                                : "bg-card border border-border text-text-secondary hover:border-primary"
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Date Range Filter */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-soft flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-text-secondary" />
                    <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">Custom Range:</span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">From</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setQuickFilter('custom'); }}
                            className="bg-background px-3 py-1.5 rounded-xl text-xs font-bold border border-border outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">To</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setQuickFilter('custom'); }}
                            className="bg-background px-3 py-1.5 rounded-xl text-xs font-bold border border-border outline-none focus:border-primary transition-colors"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <Users size={20} />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-black uppercase",
                                    growthRate >= 0 ? "text-green-500" : "text-red-500"
                                )}>
                                    {growthRate >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {Math.abs(growthRate).toFixed(1)}%
                                </div>
                            </div>
                            <div className="text-3xl font-black text-text-primary">
                                {totalMembers}
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Members</div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
                                    <UserCheck size={20} />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-green-500">
                                {memberStats?.active_rate.toFixed(1)}%
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Rate</div>
                            <div className="text-[10px] text-text-secondary mt-1">
                                {memberStats?.active_members} of {totalMembers} active
                            </div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                                    <UserX size={20} />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-red-500">
                                {churnData?.churn_rate.toFixed(1)}%
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Churn Rate</div>
                            <div className="text-[10px] text-text-secondary mt-1">
                                {churnData?.churned_members} of {churnData?.total_eligible} didn't renew
                            </div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                    <Clock size={20} />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-text-primary">
                                {Math.round(avgTenure?.average_tenure_days || 0)}
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Avg Tenure (Days)</div>
                        </div>
                    </div>

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
