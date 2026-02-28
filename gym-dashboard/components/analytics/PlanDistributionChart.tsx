'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { PlanDistributionData } from '@/types';

interface Props {
    data: PlanDistributionData[];
    isLoading?: boolean;
}

const COLORS = ['#7C3AED', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export const PlanDistributionChart = ({ data, isLoading }: Props) => {
    const { theme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (isLoading || !isMounted) {
        return (
            <div className="h-[400px] w-full rounded-3xl bg-card border border-border p-6 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="h-[400px] w-full rounded-3xl bg-card border border-border p-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">
                        No plan data available
                    </p>
                </div>
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map(item => ({
        name: item.plan_name,
        value: item.member_count,
        percentage: item.percentage,
    }));

    return (
        <div className="h-full w-full rounded-3xl bg-card p-6 shadow-soft border border-border">
            <div className="mb-4">
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
                    Plan Distribution
                </h3>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">
                    Members by membership plan
                </p>
            </div>

            <div className="w-full flex justify-center">
                <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={90}
                            innerRadius={55}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                if (
                                    percent === undefined ||
                                    percent < 0.05 ||
                                    cx === undefined ||
                                    cy === undefined ||
                                    midAngle === undefined ||
                                    innerRadius === undefined ||
                                    outerRadius === undefined
                                ) return null;

                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                    <text
                                        x={x}
                                        y={y}
                                        fill="white"
                                        textAnchor={x > cx ? 'start' : 'end'}
                                        dominantBaseline="central"
                                        fontSize="12"
                                        fontWeight="bold"
                                    >
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                );
                            }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
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
                            itemStyle={{
                                color: theme === 'dark' ? '#FFFFFF' : '#000000'
                            }}
                            formatter={(value: number | undefined, name: string | undefined, props: any) => {
                                if (value === undefined) return ['', ''];
                                return [
                                    `${value} members (${props.payload.percentage.toFixed(1)}%)`,
                                    props.payload.name
                                ];
                            }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                            iconType="circle"
                            formatter={(value, entry: any) => `${entry.payload.name} (${entry.payload.percentage.toFixed(1)}%)`}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
