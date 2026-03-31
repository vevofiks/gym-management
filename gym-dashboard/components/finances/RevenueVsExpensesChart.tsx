'use client';

import { useTheme } from '@/context/ThemeContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
    period: string;
    revenue: number;
    expenses: number;
}

interface Props {
    data: DataPoint[];
    isLoading?: boolean;
}

export const RevenueVsExpensesChart = ({ data, isLoading }: Props) => {
    const { theme } = useTheme();

    if (isLoading) {
        return (
            <div className="h-[400px] w-full rounded-xl bg-card border border-border p-6 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-xl bg-card p-6 shadow-soft border border-border">
            <div className="mb-6">
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-primary rounded-full" />
                    Revenue vs Expenses Trend
                </h3>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">
                    Financial performance over time
                </p>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={theme === 'dark' ? '#334155' : '#E2E8F0'}
                        />
                        <XAxis
                            dataKey="period"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme === 'dark' ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme === 'dark' ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: 600 }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                                borderRadius: '16px',
                                border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}`,
                                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }}
                            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                            labelStyle={{ color: theme === 'dark' ? '#F8FAFC' : '#1E293B', fontWeight: 'bold', marginBottom: '8px' }}
                            itemStyle={{ color: theme === 'dark' ? '#F8FAFC' : '#1E293B' }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            iconType="circle"
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            name="Revenue"
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#ef4444"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorExpenses)"
                            name="Expenses"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
