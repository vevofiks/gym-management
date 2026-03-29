"use client";
import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    TrendingUp,
    Plus,
    X,
    Moon,
    Sun,
    ClipboardList,
    LogOut,
    Receipt,
    Apple,
    MessageSquare,
    Download,
    Wallet,
    ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/AuthStore';
import { useSubscriptionStore } from '@/store/SubscriptionStore';
import { useDashboardStore } from '@/store/DashboardStore';
import { OwnerProfileModal } from '@/components/settings/OwnerProfileModal';
import { getDashboardStats } from '@/services/dashboardService';
import { DashboardStats } from '@/types';
import { useEffect } from 'react';
import { ReportGenerationModal } from '@/components/reports/ReportGenerationModal';
import toast from 'react-hot-toast';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const { subscription, hasFeature: checkFeature } = useSubscriptionStore();
    const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
    const router = useRouter()
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const { stats, fetchStats } = useDashboardStore();

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };


    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Members', path: '/members' },
        { icon: Wallet, label: 'Member Insights', path: '/members/insights' },
        { icon: ClipboardList, label: 'Plans', path: '/plans' },
        { icon: Users, label: 'Staff', path: '/settings/staff', role: 'gym_owner' },
        { icon: CreditCard, label: 'Finances', path: '/finances', role: 'gym_owner' },
        { icon: Receipt, label: 'Expenses', path: '/expenses', feature: 'expenses' as const, role: 'gym_owner' },
        { icon: Apple, label: 'Diet Plans', path: '/diet-plans' },
        { icon: TrendingUp, label: 'Analytics', path: '/analytics', feature: 'analytics' as const, role: 'gym_owner' },
        { icon: ShoppingBag, label: 'Store', path: '/store', feature: 'store' as const, role: 'gym_owner' },
        { icon: MessageSquare, label: 'WhatsApp', path: '/settings/whatsapp', feature: 'whatsapp' as const, role: 'gym_owner' },
        { icon: Settings, label: 'Settings', path: '/settings', role: 'gym_owner' },
    ].filter(item => {
        // Filter by feature access
        if (item.feature && !checkFeature(item.feature)) return false;

        // Filter by user role
        if (item.role && user?.role !== item.role) return false;

        return true;
    });

    return (
        <>
            <aside className={cn(
                "fixed inset-y-0 left-0 z-20 flex w-72 flex-col bg-sidebar border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full p-6 overflow-hidden">
                    {/* Fixed Top Section: Profile & Revenue */}
                    <div className="shrink-0">
                        {/* Mobile Header */}
                        <div className="lg:hidden flex justify-end mb-4">
                            <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary">
                                <X size={24} />
                            </button>
                        </div>

                        {/* User Profile Header */}
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="group flex items-center gap-4 mb-10 text-left hover:bg-primary/5 p-2 -m-2 rounded-xl transition-all w-full"
                        >
                            <div className="relative">
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.username}
                                        className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all shadow-md"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all shadow-md overflow-hidden">
                                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-sidebar"></div>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-lg font-bold text-text-primary leading-tight uppercase group-hover:text-primary transition-colors">
                                    {user?.username || 'GUEST USER'}
                                </h2>
                                <span className="text-xs font-medium text-primary tracking-widest uppercase opacity-80">
                                    {user?.role?.replace('_', ' ') || 'GYM OWNER'}
                                </span>
                            </div>
                        </button>

                        {/* Balance Card Widget */}
                        {user?.role === 'gym_owner' && (
                            <div className="relative mb-8 overflow-hidden rounded-xl bg-sidebar p-5 shadow-soft border border-border group">
                                <p className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">Total Revenue</p>
                                <div className="flex items-baseline gap-0.5 mb-3">
                                    <h3 className="text-2xl font-extrabold text-text-primary">
                                        ₹{stats?.total_revenue?.toLocaleString() || '0'}
                                    </h3>
                                    <span className="text-sm font-bold text-text-secondary">
                                        {(stats?.total_revenue || 0) % 1 === 0 ? '.00' : `.${((stats?.total_revenue || 0) % 1).toFixed(2).split('.')[1]}`}
                                    </span>
                                </div>

                                <div className="h-12 w-full relative opacity-60">
                                    <svg viewBox="0 0 200 60" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
                                        <path d="M0,40 C50,40 50,10 100,25 C150,40 150,10 200,5" fill="none" stroke="currentColor" className="text-primary" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                </div>

                                {(subscription?.plan_name.toLowerCase().includes('pro') || subscription?.is_trial) && (
                                    <button
                                        onClick={() => {
                                            if (
                                                (stats?.total_members || 0) === 0 &&
                                                (stats?.total_revenue || 0) === 0 &&
                                                (stats?.total_expenses || 0) === 0
                                            ) {
                                                toast.error('Cannot generate report: No member, revenue, or expense data available.');
                                                return;
                                            }
                                            setIsReportModalOpen(true);
                                        }}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-background py-2.5 text-xs font-bold text-text-primary hover:bg-border hover:shadow-sm active:scale-95 transition-all"
                                    >
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-400 text-white shadow-sm ring-2 ring-green-400/20">
                                            <Download size={12} strokeWidth={3} />
                                        </div>
                                        Generate Report
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Scrollable Navigation Section */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar -mx-6 px-6 py-2">
                        <nav className="flex flex-col gap-2">
                            <div className="px-4 mb-2 text-xs font-bold text-primary uppercase tracking-wider">Menu</div>
                            {menuItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={() => onClose()}
                                        className={cn(
                                            "flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-transparent text-primary font-bold"
                                                : "text-text-secondary hover:bg-background hover:text-text-primary"
                                        )}
                                    >
                                        <item.icon
                                            size={22}
                                            className={cn(isActive ? "text-primary" : "text-text-secondary")}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                        {item.label}
                                        {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-glow"></div>}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Fixed Bottom Section: Theme & Settings */}
                    <div className="shrink-0 mt-4 pt-6 border-t border-border space-y-4 bg-sidebar">
                        {/* Theme Controls */}
                        <div className="flex items-center justify-between px-2">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </button>

                            <div className="flex items-center gap-2">
                                {(['violet', 'blue', 'emerald', 'rose'] as const).map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setColorTheme(c)}
                                        className={cn(
                                            "w-4 h-4 rounded-full transition-all hover:scale-110",
                                            colorTheme === c ? "ring-2 ring-offset-2 ring-offset-sidebar ring-text-primary scale-110" : ""
                                        )}
                                        style={{
                                            backgroundColor: `var(--theme-${c}, ${c === 'violet' ? '#7C3AED' :
                                                c === 'blue' ? '#2563EB' :
                                                    c === 'emerald' ? '#059669' : '#E11D48'
                                                })`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className='flex items-center justify-between px-2'>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
                            >
                                <LogOut /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <OwnerProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            <ReportGenerationModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
            />
        </>
    );
};