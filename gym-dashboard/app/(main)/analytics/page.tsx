'use client';

import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { GrowthChart } from '@/components/analytics/GrowthChart';
import { AttendanceChart } from '@/components/analytics/AttendanceChart';
import { PlanDistribution } from '@/components/analytics/PlanDistribution';
import { MOCK_ANALYTICS_METRICS, MOCK_MEMBER_GROWTH, MOCK_ATTENDANCE, MOCK_PLAN_DISTRIBUTION } from '@/lib/mockData';
import { TrendingUp, Users, Activity, UserCheck } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <>
            {/* Analytics Metrics Grid */}
            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Growth Rate"
                    value={`${MOCK_ANALYTICS_METRICS.growthRate}%`}
                    change={MOCK_ANALYTICS_METRICS.growthRate}
                    isLoading={false}
                    icon={<TrendingUp size={24} />}
                    variant="primary"
                />
                <StatsCard
                    title="Avg Attendance"
                    value={MOCK_ANALYTICS_METRICS.avgAttendance.toString()}
                    change={5.2}
                    isLoading={false}
                    icon={<Activity size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Active Rate"
                    value={`${MOCK_ANALYTICS_METRICS.activeRate}%`}
                    change={2.8}
                    isLoading={false}
                    icon={<UserCheck size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Churn Rate"
                    value={`${MOCK_ANALYTICS_METRICS.churnRate}%`}
                    change={-1.2}
                    isLoading={false}
                    icon={<Users size={24} />}
                    variant="default"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                <GrowthChart data={MOCK_MEMBER_GROWTH} isLoading={false} />
                <AttendanceChart data={MOCK_ATTENDANCE} isLoading={false} />
            </div>

            {/* Plan Distribution */}
            <div className="grid grid-cols-1 gap-8">
                <PlanDistribution data={MOCK_PLAN_DISTRIBUTION} isLoading={false} />
            </div>
        </>
    );
}
