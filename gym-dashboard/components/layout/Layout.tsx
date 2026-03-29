"use client";
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { usePathname } from 'next/navigation';
import SubscriptionBanner from '../SubscriptionBanner';
import { useAuthStore } from '@/store/AuthStore';
import { useSubscriptionStore } from '@/store/SubscriptionStore';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return { title: 'Dashboard', subtitle: 'Welcome back! Here\'s what\'s happening with your gym.' };
      case '/members': return { title: 'Member Management', subtitle: 'Manage members, track attendance, and view detailed profiles.' };
      case '/members/insights': return { title: 'Member Insights', subtitle: 'Get insights into your members' };
      case '/plans': return { title: 'Plan Management', subtitle: 'Create and manage membership plans, track payments, and handle renewals.' };
      case '/settings/staff': return { title: 'Staff Management', subtitle: 'Manage your gym staff and their application access' };
      case '/finances': return { title: 'Financials', subtitle: 'Track revenue, expenses, and manage payments.' };
      case '/expenses': return { title: 'Gym Expenses', subtitle: 'Manage and track your operational costs' };
      case '/store': return { title: 'Gym Store', subtitle: 'Manage products, inventory, and track your daily sales.' };
      case '/diet-plans': return { title: 'Diet Plans', subtitle: 'Create and manage personalized nutritional plans for your members.' };
      case '/analytics': return { title: 'Analytics', subtitle: 'Growth, retention & engagement insights' };
      case '/settings/whatsapp': return { title: 'WhatsApp Settings', subtitle: 'Connect your gym\'s WhatsApp for automated notifications' };
      case '/marketing/whatsapp': return { title: 'WhatsApp Broadcast', subtitle: 'Send bulk messages to your members for marketing or announcements.' };
      case '/settings': return { title: 'Settings', subtitle: 'Manage your gym settings' };
      default: return { title: 'Dashboard', subtitle: 'Start managing your gym today!' };
    }
  };

  const { isSubscriptionActive } = useSubscriptionStore();
  const active = isSubscriptionActive();

  return (
    <div className="flex min-h-screen bg-background font-sans text-text-primary transition-colors duration-300">
      {active && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

      <div className={`flex-1 flex flex-col min-w-0 ${active ? 'lg:pl-72' : ''} transition-all duration-300`}>
        {/* Full-width banner - Hidden for staff */}
        {active && user?.role !== 'gym_staff' && <SubscriptionBanner />}

        {active && (
          <div className="px-6 lg:px-10">
            {pathname === "/subscription" ? null : (
              <Header
                title={getPageTitle(pathname).title}
                subtitle={getPageTitle(pathname).subtitle}
                onMenuClick={() => setIsSidebarOpen(true)}
              />
            )}
          </div>
        )}

        <main className={`flex-1 ${active ? 'px-6 pb-6 lg:px-10 lg:pb-10' : ''} overflow-x-hidden`}>
          {children}
        </main>
      </div>

      {active && isSidebarOpen && (
        <div
          className="fixed inset-0 z-0 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};