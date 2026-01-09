'use client';

import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { GrowthChart } from '@/components/analytics/GrowthChart';
import { AttendanceChart } from '@/components/analytics/AttendanceChart';
import { PlanDistribution } from '@/components/analytics/PlanDistribution';
import {
    useAnalyticsMetrics,
    useMemberGrowth,
    useAttendanceData,
    usePlanDistribution
} from '@/hooks/useGymData';
import { TrendingUp, Users, Activity, UserCheck } from 'lucide-react';

export default function AnalyticsPage() {
    const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics();
    const { data: growth, isLoading: growthLoading } = useMemberGrowth();
    const { data: attendance, isLoading: attendanceLoading } = useAttendanceData();
    const { data: planDist, isLoading: planLoading } = usePlanDistribution();

    return (
        <>
            {/* Analytics Metrics Grid */}
            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Growth Rate"
                    value={`${metrics?.growthRate || 0}%`}
                    change={metrics?.growthRate || 0}
                    isLoading={metricsLoading}
                    icon={<TrendingUp size={24} />}
                    variant="primary"
                />
                <StatsCard
                    title="Avg Attendance"
                    value={metrics?.avgAttendance.toString() || "0"}
                    change={5.2}
                    isLoading={metricsLoading}
                    icon={<Activity size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Active Rate"
                    value={`${metrics?.activeRate || 0}%`}
                    change={2.8}
                    isLoading={metricsLoading}
                    icon={<UserCheck size={24} />}
                    variant="default"
                />
                <StatsCard
                    title="Churn Rate"
                    value={`${metrics?.churnRate || 0}%`}
                    change={-1.2}
                    isLoading={metricsLoading}
                    icon={<Users size={24} />}
                    variant="default"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                <GrowthChart data={growth} isLoading={growthLoading} />
                <AttendanceChart data={attendance} isLoading={attendanceLoading} />
            </div>

            {/* Plan Distribution */}
            <div className="grid grid-cols-1 gap-8">
                <PlanDistribution data={planDist} isLoading={planLoading} />
            </div>
        </>
    );
}
