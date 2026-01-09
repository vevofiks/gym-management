'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { FinancialSummary } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FinancialChartProps {
    data: any[] | undefined;
    isLoading: boolean;
}

export const FinancialChart = ({ data, isLoading }: FinancialChartProps) => {
    if (isLoading) {
        return (
            <Card title="Revenue vs Expenses" subtitle="Monthly financial overview">
                <Skeleton className="h-80 w-full" />
            </Card>
        );
    }

    return (
        <Card title="Revenue vs Expenses" subtitle="Monthly financial overview">
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                        dataKey="month"
                        stroke="var(--text-secondary)"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="var(--text-secondary)"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)'
                        }}
                        formatter={(value: any) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--primary)', r: 4 }}
                        name="Revenue"
                    />
                    <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', r: 4 }}
                        name="Expenses"
                    />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};
