'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AttendanceChartProps {
    data: any[] | undefined;
    isLoading: boolean;
}

export const AttendanceChart = ({ data, isLoading }: AttendanceChartProps) => {
    if (isLoading) {
        return (
            <Card title="Weekly Attendance" subtitle="Daily check-in patterns">
                <Skeleton className="h-80 w-full" />
            </Card>
        );
    }

    return (
        <Card title="Weekly Attendance" subtitle="Daily check-in patterns">
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                        dataKey="day"
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
                        cursor={{ fill: 'var(--background)' }}
                    />
                    <Bar
                        dataKey="count"
                        fill="var(--primary)"
                        radius={[8, 8, 0, 0]}
                        name="Check-ins"
                    />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};
