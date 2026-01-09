"use client";
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Helper to determine page title from path
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'Dashboard';
      case '/members': return 'Member Management';
      case '/finances': return 'Financials';
      case '/analytics': return 'Analytics';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans text-text-primary transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        <div className="px-6 lg:px-10">
          <Header
            title={getPageTitle(pathname)}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
        </div>

        <main className="flex-1 px-6 pb-6 lg:px-10 lg:pb-10 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-0 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};