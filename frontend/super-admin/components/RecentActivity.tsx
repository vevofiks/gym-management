"use client";
import React from 'react';
import { GymTransaction } from '@/types/index';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const transactionData: GymTransaction[] = [
    { id: 'TRX-9821', gymName: 'Iron Paradise Gym', plan: 'Enterprise', amount: 299.00, status: 'Completed', date: 'Just now', logo: 'https://picsum.photos/50/50?1' },
    { id: 'TRX-9822', gymName: 'CrossFit Central', plan: 'Growth', amount: 149.00, status: 'Completed', date: '2 min ago', logo: 'https://picsum.photos/50/50?2' },
    { id: 'TRX-9823', gymName: 'Yoga Flow Studio', plan: 'Starter', amount: 79.00, status: 'Pending', date: '15 min ago', logo: 'https://picsum.photos/50/50?3' },
    { id: 'TRX-9824', gymName: 'Muscle Factory', plan: 'Growth', amount: 149.00, status: 'Failed', date: '1 hour ago', logo: 'https://picsum.photos/50/50?4' },
    { id: 'TRX-9825', gymName: 'Gold Standard Fitness', plan: 'Enterprise', amount: 299.00, status: 'Completed', date: '3 hours ago', logo: 'https://picsum.photos/50/50?5' },
];

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'Completed':
            return <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 size={12} /> Paid</span>;
        case 'Pending':
            return <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock size={12} /> Pending</span>;
        case 'Failed':
            return <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400"><AlertCircle size={12} /> Failed</span>;
        default: return null;
    }
}

export const RecentActivity: React.FC = () => {
    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Payouts & Subscriptions</h4>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View All</button>
            </div>

            {/* Table Header */}
            <div className="hidden grid-cols-5 border-b border-gray-200 pb-2 text-sm font-medium text-gray-500 dark:border-gray-700 sm:grid">
                <div className="col-span-2 pl-2">Gym / Tenant</div>
                <div className="">Plan</div>
                <div className="">Date</div>
                <div className="text-right pr-2">Amount / Status</div>
            </div>

            {/* List Items */}
            <div className="flex flex-col gap-4 pt-4">
                {transactionData.map((trx) => (
                    <div key={trx.id} className="grid grid-cols-1 items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-800 sm:grid-cols-5">
                        <div className="col-span-2 flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                <img src={trx.logo} alt={trx.gymName} className="h-full w-full object-cover" />
                            </div>
                            <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">{trx.gymName}</h5>
                                <p className="text-xs text-gray-500">{trx.id}</p>
                            </div>
                        </div>
                        <div className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
                            <span className={`rounded px-2 py-1 text-xs font-medium ${trx.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                    trx.plan === 'Growth' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                {trx.plan}
                            </span>
                        </div>
                        <div className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
                            {trx.date}
                        </div>
                        <div className="flex flex-col items-end gap-1 sm:text-right">
                            <span className="font-bold text-gray-900 dark:text-white">${trx.amount.toFixed(2)}</span>
                            <StatusBadge status={trx.status} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};