"use client";
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ThemeProvider, useTheme } from './ThemeContext';
import { useAuthStore } from '@/store/AuthStore';
import AuthGuard from './auth/AuthGuard';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { theme, toggleTheme } = useTheme();
    const { isAuthenticated, logout } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev: boolean) => !prev);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <AuthGuard>
            <div className={`flex h-screen overflow-hidden bg-gray-100 dark:bg-[#0B1120] ${theme === 'dark' ? 'dark' : ''}`}>
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <Sidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    isCollapsed={isSidebarCollapsed}
                    setIsCollapsed={setIsSidebarCollapsed}
                    onLogout={handleLogout}
                />

                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <Header
                        theme={theme}
                        toggleTheme={toggleTheme}
                        toggleSidebar={toggleSidebar}
                    />

                    <main className="w-full grow p-6 text-gray-900 dark:text-white">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </ThemeProvider>
    );
}
