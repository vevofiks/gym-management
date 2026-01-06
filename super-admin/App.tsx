import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';
import { GymsPage } from './components/pages/GymsPage';
import { SubscriptionsPage } from './components/pages/SubscriptionsPage';
import { OwnersPage } from './components/pages/OwnersPage';
import { SupportPage } from './components/pages/SupportPage';
import { SettingsPage } from './components/pages/SettingsPage';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('overview');

  // Initialize theme based on preference or system
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check for existing session
  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (session === 'active') {
        setIsAuthenticated(true);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
    setCurrentView('overview'); // Reset view
  };

  const renderContent = () => {
    switch (currentView) {
      case 'overview': return <Dashboard />;
      case 'metrics': return <Dashboard />; 
      case 'status': return <Dashboard />;  
      case 'gyms': return <GymsPage />;
      case 'subscriptions': return <SubscriptionsPage />;
      case 'owners': return <OwnersPage />;
      case 'support': return <SupportPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  // Render Login Page if not authenticated
  if (!isAuthenticated) {
    return (
        <div className={theme === 'dark' ? 'dark' : ''}>
             <LoginPage onLogin={handleLogin} />
        </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-[#0B1120]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentView={currentView}
        onNavigate={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          toggleSidebar={toggleSidebar} 
        />
        
        <main className="w-full grow p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}