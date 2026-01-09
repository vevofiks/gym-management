"use client";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../ThemeContext';

const data = [
  { name: 'M', value: 400 },
  { name: 'T', value: 300 },
  { name: 'W', value: 550 },
  { name: 'T', value: 450 },
  { name: 'F', value: 600 },
  { name: 'S', value: 350 },
  { name: 'S', value: 450 },
];

export const SalesBarChart: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Tooltip
          cursor={{ fill: 'transparent' }}
          contentStyle={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            color: isDark ? '#fff' : '#111',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          itemStyle={{ color: isDark ? '#15896B' : '#0f172a'}}
        />
        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill="#0ea5e9" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};  
