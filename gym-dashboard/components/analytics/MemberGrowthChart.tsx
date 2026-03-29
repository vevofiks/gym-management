'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MemberGrowthData } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props {
    data: MemberGrowthData[];
    isLoading?: boolean;
}

export const MemberGrowthChart = ({ data, isLoading }: Props) => {
    const { theme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (isLoading || !isMounted) {
        return (
            <div className="h-[400px] w-full rounded-xl bg-card border border-border p-6 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map(item => ({
        date: formatDate(item.date),
        'New Members': item.count,
        'Total Members': item.cumulative_count,
    }));

    return (
        <div className="h-full w-full rounded-xl bg-card p-6 shadow-soft border border-border">
            <div className="mb-4">
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-primary rounded-full" />
                    Member Growth
                </h3>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">
                    New registrations over time
                </p>
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme === 'dark' ? '#334155' : '#E2E8F0'}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        stroke={theme === 'dark' ? '#94A3B8' : '#64748B'}
                        style={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <YAxis
                        stroke={theme === 'dark' ? '#94A3B8' : '#64748B'}
                        style={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                            borderRadius: '12px',
                            border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}`,
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                        labelStyle={{
                            color: theme === 'dark' ? '#FFFFFF' : '#000000'
                        }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        iconType="line"
                    />
                    <Line
                        type="monotone"
                        dataKey="New Members"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="Total Members"
                        stroke="#7C3AED"
                        strokeWidth={2}
                        dot={{ fill: '#7C3AED', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
