"use client";
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
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/AuthStore';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const pathname = usePathname();
    const logout = useAuthStore((state) => state.logout);
    const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
    const router = useRouter()


    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Members', path: '/members' },
        { icon: ClipboardList, label: 'Plans', path: '/plans' },
        { icon: CreditCard, label: 'Finances', path: '/finances' },
        { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-20 flex w-72 flex-col bg-sidebar border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="flex flex-col h-full p-6 overflow-y-auto">

                {/* Mobile Header */}
                <div className="lg:hidden flex justify-end mb-4">
                    <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary">
                        <X size={24} />
                    </button>
                </div>

                {/* User Profile Header */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="relative">
                        <img
                            src="https://picsum.photos/id/64/60/60"
                            alt="Gym Owner"
                            className="h-12 w-12 rounded-full object-cover border-2 border-sidebar shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-sidebar"></div>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-text-primary leading-tight uppercase">DEMO USER</h2>
                        <span className="text-xs font-medium text-primary">GYM OWNER</span>
                    </div>
                </div>

                {/* Balance Card Widget */}
                <div className="relative mb-10 overflow-hidden rounded-4xl bg-sidebar p-6 shadow-soft border border-border group">
                    <p className="text-sm font-medium text-text-secondary mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-extrabold text-text-primary mb-4">$24,010<span className="text-lg text-text-secondary">.02</span></h3>

                    <div className="h-16 w-full relative opacity-80">
                        <svg viewBox="0 0 200 60" className="w-full h-full drop-shadow-lg" preserveAspectRatio="none">
                            <path d="M0,40 C50,40 50,10 100,25 C150,40 150,10 200,5" fill="none" stroke="currentColor" className="text-primary" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-background py-3 text-sm font-bold text-text-primary hover:bg-border transition-all">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-400 text-white">
                            <Plus size={12} strokeWidth={4} />
                        </div>
                        Generate Report
                    </button>
                </div>

                {/* Navigation */}
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
                                    "flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-200",
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

                {/* Theme & Settings Section */}
                <div className="mt-auto space-y-4 pt-6 border-t border-border">

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
    );
};