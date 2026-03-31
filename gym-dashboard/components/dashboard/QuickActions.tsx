import React from 'react';
import { UserPlus, CreditCard, Settings, PlusCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/AuthStore';
import { Skeleton } from '@/components/ui/skeleton';

interface QuickActionsProps {
    isLoading?: boolean;
}

export const QuickActions = ({ isLoading = false }: QuickActionsProps) => {
    const { user } = useAuthStore();
    const actions = [
        {
            title: 'Add Member',
            icon: <UserPlus size={20} />,
            href: '/members?open=add',
            color: 'bg-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            text: 'text-blue-600',
            roles: ['gym_owner', 'gym_staff']
        },
        {
            title: 'Record Fee',
            icon: <CreditCard size={20} />,
            href: '/members',
            color: 'bg-green-500',
            bg: 'bg-green-50 dark:bg-green-500/10',
            text: 'text-green-600',
            roles: ['gym_owner', 'gym_staff']
        },
        {
            title: 'New Expense',
            icon: <PlusCircle size={20} />,
            href: '/finances',
            color: 'bg-red-500',
            bg: 'bg-red-50 dark:bg-red-500/10',
            text: 'text-red-600',
            roles: ['gym_owner']
        },
        {
            title: 'Report',
            icon: <FileText size={20} />,
            href: '/analytics',
            color: 'bg-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-500/10',
            text: 'text-purple-600',
            roles: ['gym_owner']
        }
    ].filter(action => !action.roles || action.roles.includes(user?.role || ''));

    if (isLoading) {
        return (
            <div className="h-full rounded-xl bg-card p-6 shadow-soft border border-border">
                <div className="h-7 w-32 bg-muted animate-pulse rounded-lg mb-6" />
                
                <div className="grid grid-cols-2 gap-4 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-4 rounded-xl bg-background border border-transparent">
                            <Skeleton className="h-12 w-12 rounded-xl mb-3" />
                            <Skeleton className="h-4 w-20 rounded-lg" />
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border flex justify-center">
                    <Skeleton className="h-4 w-32 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full rounded-xl bg-card p-6 shadow-soft border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-6">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-4 flex-1">
                {actions.map((action) => (
                    <Link
                        key={action.title}
                        href={action.href}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-background border border-transparent hover:border-border hover:shadow-sm transition-all group"
                    >
                        <div className={`h-12 w-12 rounded-xl ${action.bg} ${action.text} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            {action.icon}
                        </div>
                        <span className="text-sm font-bold text-text-primary">{action.title}</span>
                    </Link>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
                <Link href="/settings" className="flex items-center justify-center gap-2 text-sm font-bold text-text-secondary hover:text-primary transition-colors">
                    <Settings size={16} /> Gym Settings
                </Link>
            </div>
        </div>
    );
};
