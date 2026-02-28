'use client';

import { useTheme } from '@/context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PaymentMethodData {
    method: string;
    amount: number;
    percentage: number;
}

interface Props {
    data: PaymentMethodData[];
    isLoading?: boolean;
}

const COLORS = ['#7C3AED', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

export const PaymentMethodChart = ({ data, isLoading }: Props) => {
    const { theme } = useTheme();

    if (isLoading) {
        return (
            <div className="h-[400px] w-full rounded-3xl bg-card border border-border p-6 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-3xl bg-card p-6 shadow-soft border border-border">
            <div className="mb-4">
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-green-500 rounded-full" />
                    Payment Methods
                </h3>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">
                    Revenue by payment type
                </p>
            </div>

            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke={theme === 'dark' ? '#334155' : '#E2E8F0'}
                        />
                        <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme === 'dark' ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: 600 }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                            type="category"
                            dataKey="method"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme === 'dark' ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: 600 }}
                            width={80}
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
                            itemStyle={{
                                color: theme === 'dark' ? '#FFFFFF' : '#000000'
                            }}
                            formatter={(value: number | undefined, name: string | undefined, props: any) => {
                                if (value === undefined) return ['N/A', 'Amount'];
                                return [
                                    `₹${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`,
                                    'Amount'
                                ];
                            }}
                            cursor={{ fill: theme === 'dark' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)' }}
                        />
                        <Bar
                            dataKey="amount"
                            radius={[0, 8, 8, 0]}
                            maxBarSize={40}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
