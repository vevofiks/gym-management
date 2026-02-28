import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RevenueChartDataPoint } from '@/types/index';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  data?: RevenueChartDataPoint[];
  isLoading: boolean;
}

export const RevenueChart = ({ data, isLoading }: Props) => {
  const { theme } = useTheme();

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full rounded-4xl" />;
  }

  return (
    <div className="h-full w-full rounded-4xl bg-card p-8 shadow-soft border border-border">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-text-primary">Revenue Analytics</h3>
          <p className="text-sm text-text-secondary">Income vs Expenses over time</p>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearlinear id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearlinear>
              <linearlinear id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearlinear>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#F1F5F9'} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme === 'dark' ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme === 'dark' ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 'bold',
                color: theme === 'dark' ? '#fff' : '#000'
              }}
              formatter={(value: number | undefined) => value !== undefined ? `₹${value.toLocaleString()}` : '₹0'}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontFamily: 'Plus Jakarta Sans',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#7C3AED"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#EF4444"
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