import React from 'react';
import { RecentActivity } from '@/types';
import { Skeleton } from '../ui/Skeleton';
import { History, UserPlus, CreditCard, Clock, Package } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { ActivityLedgerModal } from './ActivityLedgerModal';
import { useState } from 'react';

interface Props {
    activities?: RecentActivity[];
    isLoading: boolean;
}

export const RecentActivityFeed = ({ activities, isLoading }: Props) => {
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-4xl" />;
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'member_registration':
                return <UserPlus size={18} className="text-blue-500" />;
            case 'payment':
                return <CreditCard size={18} className="text-green-500" />;
            case 'membership_expired':
                return <Clock size={18} className="text-red-500" />;
            case 'plan_created':
                return <Package size={18} className="text-purple-500" />;
            default:
                return <History size={18} className="text-gray-500" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'member_registration':
                return 'bg-blue-50 dark:bg-blue-500/10';
            case 'payment':
                return 'bg-green-50 dark:bg-green-500/10';
            case 'membership_expired':
                return 'bg-red-50 dark:bg-red-500/10';
            case 'plan_created':
                return 'bg-purple-50 dark:bg-purple-500/10';
            default:
                return 'bg-gray-50 dark:bg-gray-500/10';
        }
    };

    return (
        <div className="flex flex-col rounded-4xl bg-card p-6 shadow-soft border border-border h-full">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                        <History size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">Recent Activity</h3>
                        <p className="text-xs font-medium text-text-secondary">Latest updates from your gym</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsLedgerOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
                >
                    See All
                </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                {activities?.map((activity, index) => (
                    <div key={activity.id} className="relative flex gap-4">
                        {/* Timeline line */}
                        {index !== activities.length - 1 && (
                            <div className="absolute left-[19px] top-10 h-10 w-0.5 bg-border" />
                        )}

                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                        </div>

                        <div className="pt-1">
                            <p className="text-sm font-bold text-text-primary leading-snug">
                                {activity.description}
                            </p>
                            <p className="text-xs font-medium text-text-secondary mt-1">
                                {formatDateTime(activity.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}

                {(!activities || activities.length === 0) && (
                    <div className="flex h-full items-center justify-center text-text-secondary py-12">
                        <div className="text-center">
                            <p className="font-semibold">No recent activity found.</p>
                            <p className="text-xs mt-1">Activities will appear here as they happen.</p>
                        </div>
                    </div>
                )}
            </div>

            <ActivityLedgerModal
                isOpen={isLedgerOpen}
                onClose={() => setIsLedgerOpen(false)}
            />
        </div>
    );
};
