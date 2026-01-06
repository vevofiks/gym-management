import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  BarChart3, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  LogOut,
  Activity,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentView: string;
  onNavigate: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setIsOpen, 
  currentView, 
  onNavigate,
  isCollapsed,
  setIsCollapsed,
  onLogout
}) => {
  
  const handleNav = (view: string) => {
    onNavigate(view);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const linkClass = (view: string) => `
    group relative flex items-center gap-2.5 rounded-lg py-3 font-medium duration-300 ease-in-out cursor-pointer
    ${currentView === view 
      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'}
    ${isCollapsed ? 'justify-center px-2' : 'px-4'}
  `;

  return (
    <aside
      className={`absolute left-0 top-0 z-30 flex h-screen flex-col overflow-y-hidden bg-white duration-300 ease-linear dark:bg-[#151C2C] lg:static lg:translate-x-0 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
      w-72 border-r border-gray-200 dark:border-gray-800 shadow-xl lg:shadow-none`}
    >
      {/* Mobile Close Button - Absolutely Positioned */}
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 z-50 block rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden"
      >
        <X size={24} />
      </button>

      {/* Header / Logo */}
      <div className={`flex items-center justify-between gap-2 px-6 py-6 lg:py-8 ${isCollapsed ? 'lg:justify-center lg:px-4' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <ShieldCheck size={24} />
          </div>
          <span className={`text-2xl font-bold text-gray-800 dark:text-white ${isCollapsed ? 'lg:hidden' : 'block'}`}>
            AdminPulse
          </span>
        </div>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear h-full">
        {/* Menu Group */}
        <nav className={`mt-5 py-4 px-4 lg:mt-9 lg:px-6 ${isCollapsed ? 'lg:px-2' : ''}`}>
          <div>
            <h3 className={`mb-4 ml-4 text-sm font-semibold text-gray-500 dark:text-gray-400 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              PLATFORM
            </h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <div onClick={() => handleNav('overview')} className={linkClass('overview')} title={isCollapsed ? "Overview" : ""}>
                  <LayoutDashboard size={20} className="shrink-0" />
                  <span className={isCollapsed ? 'lg:hidden' : 'block'}>Overview</span>
                </div>
              </li>
              <li>
                <div onClick={() => handleNav('gyms')} className={linkClass('gyms')} title={isCollapsed ? "Manage Gyms" : ""}>
                  <Building2 size={20} className="shrink-0" />
                  <span className={isCollapsed ? 'lg:hidden' : 'block'}>Manage Gyms</span>
                </div>
              </li>
              <li>
                <div onClick={() => handleNav('subscriptions')} className={linkClass('subscriptions')} title={isCollapsed ? "Subscriptions" : ""}>
                  <CreditCard size={20} className="shrink-0" />
                  <span className={isCollapsed ? 'lg:hidden' : 'block'}>Subscriptions</span>
                  {!isCollapsed && (
                    <span className="ml-auto rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                        12
                    </span>
                  )}
                  {isCollapsed && (
                     <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 lg:block hidden"></span>
                  )}
                </div>
              </li>
              <li>
                <div onClick={() => handleNav('owners')} className={linkClass('owners')} title={isCollapsed ? "Gym Owners" : ""}>
                  <Users size={20} className="shrink-0" />
                  <span className={isCollapsed ? 'lg:hidden' : 'block'}>Gym Owners</span>
                </div>
              </li>
              <li>
                <div onClick={() => handleNav('metrics')} className={linkClass('metrics')} title={isCollapsed ? "Metrics" : ""}>
                  <BarChart3 size={20} className="shrink-0" />
                  <span className={isCollapsed ? 'lg:hidden' : 'block'}>Metrics</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Others Group */}
          <div>
            <h3 className={`mb-4 ml-4 text-sm font-semibold text-gray-500 dark:text-gray-400 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              ADMIN
            </h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <div onClick={() => handleNav('support')} className={linkClass('support')} title={isCollapsed ? "Support Tickets" : ""}>
                  <MessageSquare size={20} className="shrink-0" />
                  <span className={isCollapsed ? 'lg:hidden' : 'block'}>Support Tickets</span>
                </div>
              </li>
              <li>
                <div onClick={() => handleNav('status')} className={linkClass('status')} title={isCollapsed ? "System Status" : ""}>
                  <Activity size={20} className="shrink-0" />
                  <span className={isCollapsed ? 'lg:hidden' : 'block'}>System Status</span>
                </div>
              </li>
              <li>
                <div onClick={() => handleNav('settings')} className={linkClass('settings')} title={isCollapsed ? "Global Settings" : ""}>
                  <Settings size={20} className="shrink-0" />
                  <span className={isCollapsed ? 'lg:hidden' : 'block'}>Global Settings</span>
                </div>
              </li>
            </ul>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className={`mt-auto px-6 pb-6 ${isCollapsed ? 'lg:px-2' : ''}`}>
           <button 
             onClick={onLogout}
             className={`flex w-full items-center gap-2.5 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center lg:px-2' : ''}`}
             title="Log Out"
           >
             <LogOut size={18} className="shrink-0" />
             <span className={isCollapsed ? 'lg:hidden' : 'block'}>Log Out</span>
           </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden border-t border-gray-200 p-4 dark:border-gray-800 lg:flex lg:justify-end">
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 ${isCollapsed ? 'w-full' : ''}`}
            >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
        </div>
      </div>
    </aside>
  );
};