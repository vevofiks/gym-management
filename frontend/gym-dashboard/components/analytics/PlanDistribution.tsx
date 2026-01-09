'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PlanDistributionProps {
    data: any[] | undefined;
    isLoading: boolean;
}

const COLORS = {
    Basic: '#3b82f6',
    Pro: '#8b5cf6',
    Elite: '#f59e0b',
};

export const PlanDistribution = ({ data, isLoading }: PlanDistributionProps) => {
    if (isLoading) {
        return (
            <Card title="Plan Distribution" subtitle="Membership plan breakdown">
                <Skeleton className="h-80 w-full" />
            </Card>
        );
    }

    return (
        <Card title="Plan Distribution" subtitle="Membership plan breakdown">
            <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }: any) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                    >
                        {data?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.plan as keyof typeof COLORS]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};
