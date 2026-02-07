"use client";
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { usePathname } from 'next/navigation';
import SubscriptionBanner from '../SubscriptionBanner';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return { title: 'Dashboard', subtitle: 'Start managing your gym today!' };
      case '/members': return { title: 'Member Management', subtitle: 'Manage your members' };
      case '/finances': return { title: 'Financials', subtitle: 'Manage your finances' };
      case '/analytics': return { title: 'Analytics', subtitle: 'Analyze your gym' };
      default: return { title: 'Dashboard', subtitle: 'Start managing your gym today!' };
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans text-text-primary transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Full-width banner */}
        <SubscriptionBanner />

        <div className="px-6 lg:px-10">
          {pathname === "/subscription" ? null : (
            <Header
              title={getPageTitle(pathname).title}
              subtitle={getPageTitle(pathname).subtitle}
              onMenuClick={() => setIsSidebarOpen(true)}
            />
          )}
        </div>

        <main className="flex-1 px-6 pb-6 lg:px-10 lg:pb-10 overflow-x-hidden">
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-0 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};