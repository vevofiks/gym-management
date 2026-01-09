"use client";
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LoginPage } from './LoginPage';
import { ThemeProvider, useTheme } from './ThemeContext';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { theme, toggleTheme } = useTheme();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Check for existing session
    useEffect(() => {
        // Check if we are in browser environment
        if (typeof window !== 'undefined') {
            const session = localStorage.getItem('admin_session');
            if (session === 'active') {
                setIsAuthenticated(true);
            }
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
        localStorage.setItem('admin_session', 'active');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('admin_session');
    };

    // Prevent flash of content or handle initial render is handled by ThemeProvider mostly but here we verify auth
    // We can rely on ThemeProvider to render only when mounted

    if (!isAuthenticated) {
        return (
            <div className={theme === 'dark' ? 'dark' : ''}>
                <LoginPage onLogin={handleLogin} />
            </div>
        );
    }

    return (
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
    );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </ThemeProvider>
    );
}
