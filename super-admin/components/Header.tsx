import React from 'react';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, toggleSidebar }) => {
  return (
    <header className="sticky top-0 z-10 flex w-full bg-white drop-shadow-sm dark:bg-[#151C2C] dark:drop-shadow-none border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Hamburger Toggle */}
          <button
            onClick={toggleSidebar}
            className="block rounded-sm border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:hidden"
          >
             <Menu className="h-5 w-5 text-gray-600 dark:text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="hidden sm:block">
          <form action="#" method="POST">
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <input
                type="text"
                placeholder="Search gyms, owners, or transactions..."
                className="w-full bg-transparent pl-9 pr-4 text-gray-600 placeholder-gray-500 outline-none focus:border-indigo-600 dark:text-white dark:placeholder-gray-400 xl:w-96"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* Theme Toggle */}
            <li>
              <button
                onClick={toggleTheme}
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-gray-200 bg-gray-100 text-gray-600 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white p-2 transition-all"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </li>

            {/* Notifications */}
            <li>
              <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-gray-200 bg-gray-100 text-gray-600 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white p-2">
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500">
                  <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                </span>
                <Bell className="h-5 w-5" />
              </button>
            </li>
          </ul>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <span className="hidden text-right lg:block">
              <span className="block text-sm font-medium text-black dark:text-white">
                Admin User
              </span>
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                Super Admin
              </span>
            </span>

            <span className="h-10 w-10 overflow-hidden rounded-full border border-gray-300 dark:border-gray-600">
              <img
                src="https://picsum.photos/100/100"
                alt="User"
                className="h-full w-full object-cover"
              />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};