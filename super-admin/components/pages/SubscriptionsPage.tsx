"use client";
import React from 'react';
import {
   DollarSign,
   CreditCard,
   TrendingUp,
   ArrowUpRight,
   ArrowDownRight,
   Download,
   MoreVertical,
   CheckCircle2,
   Clock,
   XCircle
} from 'lucide-react';
import {
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer
} from 'recharts';

// Mock Data for Charts
const revenueData = [
   { month: 'Jan', revenue: 45000 },
   { month: 'Feb', revenue: 52000 },
   { month: 'Mar', revenue: 49000 },
   { month: 'Apr', revenue: 63000 },
   { month: 'May', revenue: 58000 },
   { month: 'Jun', revenue: 71000 },
   { month: 'Jul', revenue: 69000 },
   { month: 'Aug', revenue: 84000 },
];

// Mock Data for Transactions
const transactions = [
   { id: 'INV-001', gym: 'Iron Paradise', plan: 'Enterprise', amount: 299, status: 'Paid', date: 'Oct 24, 2024' },
   { id: 'INV-002', gym: 'FitZone', plan: 'Growth', amount: 149, status: 'Paid', date: 'Oct 23, 2024' },
   { id: 'INV-003', gym: 'Yoga Studio', plan: 'Starter', amount: 49, status: 'Pending', date: 'Oct 23, 2024' },
   { id: 'INV-004', gym: 'CrossFit A1', plan: 'Growth', amount: 149, status: 'Failed', date: 'Oct 22, 2024' },
   { id: 'INV-005', gym: 'Muscle Beach', plan: 'Enterprise', amount: 299, status: 'Paid', date: 'Oct 21, 2024' },
   { id: 'INV-006', gym: 'Gold Gym', plan: 'Starter', amount: 49, status: 'Paid', date: 'Oct 20, 2024' },
];

export const SubscriptionsPage: React.FC = () => {
   return (
      <div className="space-y-6 animate-in fade-in duration-500">

         {/* Header */}
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Overview</h2>
               <p className="text-sm text-gray-500 dark:text-gray-400">Manage subscriptions, billing, and revenue.</p>
            </div>
            <div className="flex gap-2">
               <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Download size={16} /> Export Report
               </button>
               <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  Payout Settings
               </button>
            </div>
         </div>

         {/* KPI Cards */}
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Revenue */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                     <DollarSign size={18} />
                  </div>
               </div>
               <div className="mt-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">$84,200</h3>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600 mt-1">
                     <ArrowUpRight size={14} /> <span>12.5% from last month</span>
                  </div>
               </div>
            </div>

            {/* Card 2: Active Subscriptions */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscriptions</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                     <CreditCard size={18} />
                  </div>
               </div>
               <div className="mt-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">642</h3>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600 mt-1">
                     <ArrowUpRight size={14} /> <span>+24 new gyms</span>
                  </div>
               </div>
            </div>

            {/* Card 3: MRR */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">MRR</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                     <TrendingUp size={18} />
                  </div>
               </div>
               <div className="mt-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">$14.2k</h3>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600 mt-1">
                     <ArrowUpRight size={14} /> <span>4.2% growth</span>
                  </div>
               </div>
            </div>

            {/* Card 4: Churn Rate */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Churn Rate</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                     <ArrowDownRight size={18} />
                  </div>
               </div>
               <div className="mt-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">2.4%</h3>
                  <div className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1">
                     <ArrowUpRight size={14} /> <span>0.2% increase</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Charts Section */}
         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Revenue Chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C] lg:col-span-2">
               <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Revenue Growth</h3>
               <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                        <Tooltip
                           contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f3f4f6' }}
                           itemStyle={{ color: '#818cf8' }}
                           formatter={(value: any) => [`$${value?.toLocaleString()}`, 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Plan Management / Mini List */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
               <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Plans</h3>
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Edit Plans</button>
               </div>
               <div className="space-y-4">
                  {[
                     { name: 'Starter', price: '$49', users: 156, color: 'bg-indigo-500' },
                     { name: 'Growth', price: '$149', users: 420, color: 'bg-purple-500' },
                     { name: 'Enterprise', price: '$299+', users: 85, color: 'bg-orange-500' },
                  ].map((plan) => (
                     <div key={plan.name} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                           <div className={`h-3 w-3 rounded-full ${plan.color}`}></div>
                           <div>
                              <p className="font-medium text-gray-900 dark:text-white">{plan.name}</p>
                              <p className="text-xs text-gray-500">{plan.users} active gyms</p>
                           </div>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{plan.price}</span>
                     </div>
                  ))}
               </div>
               <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Conversion Rate</span>
                     <span className="text-sm font-bold text-gray-900 dark:text-white">4.8%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                     <div className="h-full bg-green-500 w-[65%] rounded-full"></div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">65% of trials convert to paid.</p>
               </div>
            </div>
         </div>

         {/* Recent Transactions Table */}
         <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 flex justify-between items-center">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
               <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View All Invoices</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                     <tr>
                        <th className="px-6 py-3">Invoice ID</th>
                        <th className="px-6 py-3">Gym</th>
                        <th className="px-6 py-3">Plan</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                     {transactions.map((trx) => (
                        <tr key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                           <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{trx.id}</td>
                           <td className="px-6 py-4">{trx.gym}</td>
                           <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border
                             ${trx.plan === 'Enterprise' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' :
                                    trx.plan === 'Growth' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                       'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
                                 {trx.plan}
                              </span>
                           </td>
                           <td className="px-6 py-4">{trx.date}</td>
                           <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">${trx.amount.toFixed(2)}</td>
                           <td className="px-6 py-4">
                              {trx.status === 'Paid' && (
                                 <span className="flex w-fit items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    <CheckCircle2 size={12} /> Paid
                                 </span>
                              )}
                              {trx.status === 'Pending' && (
                                 <span className="flex w-fit items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    <Clock size={12} /> Pending
                                 </span>
                              )}
                              {trx.status === 'Failed' && (
                                 <span className="flex w-fit items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    <XCircle size={12} /> Failed
                                 </span>
                              )}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
                                 <MoreVertical size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};