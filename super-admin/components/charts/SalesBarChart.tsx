import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Tooltip 
             cursor={{fill: 'transparent'}}
             contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
        />
        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill="#0ea5e9" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
