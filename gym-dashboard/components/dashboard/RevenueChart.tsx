import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueData } from '@/types/index';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  data?: RevenueData[];
  isLoading: boolean;
}

export const RevenueChart = ({ data, isLoading }: Props) => {
  const { theme } = useTheme();

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full rounded-4xl" />;
  }

  // Determine colors based on context isn't directly possible with CSS vars in Recharts prop, 
  // but we can assume 'primary' class for stroke/fill usually works if we could pass class,
  // however Recharts needs hex strings.
  // Ideally, we'd read getComputedStyle but for simplicity we will stick to a neutral + CSS variable for the container.

  return (
    <div className="h-full w-full rounded-4xl bg-card p-8 shadow-soft border border-border">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-text-primary">Revenue Analytics</h3>
          <p className="text-sm text-text-secondary">Income vs Expenses over time</p>
        </div>
        <select className="rounded-xl bg-background border-none px-4 py-2 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-primary/20">
          <option>Last 6 Months</option>
          <option>Last Year</option>
        </select>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                {/* We use a specific violet here as reading CSS var in SVG defs is tricky without inline styles */}
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
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
              tickFormatter={(value) => `$${value / 1000}k`}
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
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#7C3AED"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};