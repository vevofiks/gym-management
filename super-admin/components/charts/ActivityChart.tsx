"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../ThemeContext';

const data = [
  { name: 'Jun 04', value: 18000 },
  { name: 'Jun 05', value: 19000 },
  { name: 'Jun 06', value: 18500 },
  { name: 'Jun 07', value: 21000 },
  { name: 'Jun 08', value: 18000 },
  { name: 'Jun 09', value: 17500 },
  { name: 'Jun 10', value: 23000 },
  { name: 'Jun 11', value: 23000 },
  { name: 'Jun 12', value: 19000 },
  { name: 'Jun 13', value: 20000 },
  { name: 'Jun 14', value: 20000 },
  { name: 'Jun 15', value: 22000 },
  { name: 'Jun 16', value: 22000 },
];

interface Props {
  color: string;
}

export const ActivityChart: React.FC<Props> = ({ color }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
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
          tickFormatter={(value) => `$${value / 1000}k`}
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
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
