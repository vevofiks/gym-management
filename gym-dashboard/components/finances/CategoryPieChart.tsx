'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

interface CategoryData {
    category: string;
    amount: number;
    percentage: number;
}

interface Props {
    data: CategoryData[];
    isLoading?: boolean;
}

const COLORS = ['#7C3AED', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export const CategoryPieChart = ({ data, isLoading }: Props) => {
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

    return (
        <div className="h-full w-full rounded-xl bg-card p-6 shadow-soft border border-border">
            <div className="mb-4">
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-red-500 rounded-full" />
                    Expense Categories
                </h3>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">
                    Breakdown by category
                </p>
            </div>

            {/* Convert amount from string to number for Recharts */}
            <div className="w-full flex justify-center">
                <PieChart width={500} height={320}>
                    <Pie
                        data={data.map(item => ({ ...item, amount: Number(item.amount) }))}
                        cx={250}
                        cy={140}
                        labelLine={false}
                        outerRadius={90}
                        innerRadius={55}
                        fill="#8884d8"
                        dataKey="amount"
                        paddingAngle={2}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            // Guard against undefined values
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
                        {data.map((entry, index) => (
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
                                `₹${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`,
                                props.payload.category
                            ];
                        }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        iconType="circle"
                        formatter={(value, entry: any) => `${entry.payload.category} (${entry.payload.percentage.toFixed(1)}%)`}
                    />
                </PieChart>
            </div>
        </div>
    );
};
