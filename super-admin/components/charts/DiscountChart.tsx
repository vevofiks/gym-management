"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../ThemeContext';

const data = [
  { name: 'Jun 04', value: 345 },
  { name: 'Jun 05', value: 340 },
  { name: 'Jun 06', value: 335 },
  { name: 'Jun 07', value: 340 },
  { name: 'Jun 08', value: 342 },
  { name: 'Jun 09', value: 341 },
  { name: 'Jun 10', value: 350 },
  { name: 'Jun 11', value: 350 },
  { name: 'Jun 12', value: 340 },
  { name: 'Jun 13', value: 342 },
  { name: 'Jun 14', value: 342 },
  { name: 'Jun 15', value: 345 },
  { name: 'Jun 16', value: 345 },
];

export const DiscountChart: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorDiscount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={isDark ? "#374151" : "#e5e7eb"} strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          interval={2}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          domain={['dataMin - 10', 'dataMax + 10']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            color: isDark ? '#fff' : '#0f172a',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#0ea5e9"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorDiscount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
