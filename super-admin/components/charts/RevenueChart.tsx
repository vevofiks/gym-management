import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Starter Plan', value: 12500, color: '#6366f1' }, // Indigo
  { name: 'Growth Plan', value: 45000, color: '#a855f7' },   // Purple
  { name: 'Enterprise', value: 85000, color: '#fb923c' },     // Orange
];

export const RevenueChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};