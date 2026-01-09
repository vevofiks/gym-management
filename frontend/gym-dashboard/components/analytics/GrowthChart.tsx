'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GrowthChartProps {
    data: any[] | undefined;
    isLoading: boolean;
}

export const GrowthChart = ({ data, isLoading }: GrowthChartProps) => {
    if (isLoading) {
        return (
            <Card title="Member Growth" subtitle="Monthly member acquisition trends">
                <Skeleton className="h-80 w-full" />
            </Card>
        );
    }

    return (
        <Card title="Member Growth" subtitle="Monthly member acquisition trends">
            <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                        dataKey="month"
                        stroke="var(--text-secondary)"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="var(--text-secondary)"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="members"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorMembers)"
                        name="Total Members"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};
