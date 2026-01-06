import React, { useState } from 'react';
import { Save, User, Shield, Bell, CreditCard, Lock, Globe } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe size={18} /> },
    { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
       {/* Page Header */}
       <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Global Settings</h2>
       </div>
       
       <div className="flex flex-col md:flex-row">
         {/* Sidebar Tabs */}
         <div className="w-full border-b border-gray-200 md:w-64 md:border-b-0 md:border-r dark:border-gray-800">
            <nav className="flex space-x-2 overflow-x-auto p-4 md:flex-col md:space-x-0 md:space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors 
                    ${activeTab === tab.id 
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
         </div>

         {/* Content Area */}
         <div className="flex-1 p-6">
           
           {activeTab === 'general' && (
             <form className="space-y-6 animate-in fade-in duration-300">
               <div>
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Platform Information</h3>
                 <p className="mb-4 text-sm text-gray-500">Configure general platform details visible to tenants.</p>
                 <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Platform Name</label>
                        <input type="text" defaultValue="AdminPulse" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Support Email</label>
                        <input type="email" defaultValue="support@adminpulse.com" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Timezone</label>
                        <select className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                           <option>(GMT-05:00) Eastern Time</option>
                           <option>(GMT+00:00) UTC</option>
                           <option>(GMT+01:00) London</option>
                        </select>
                    </div>
                 </div>
               </div>
               
               <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                     <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Maintenance Mode</h4>
                        <p className="text-sm text-gray-500">Temporarily disable access for all non-admin users.</p>
                     </div>
                     <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-700 dark:bg-gray-800"></div>
                     </label>
                  </div>
               </div>
             </form>
           )}

           {activeTab === 'profile' && (
             <form className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-6">
                   <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-gray-100 dark:border-gray-800">
                      <img src="https://picsum.photos/200/200" alt="Profile" className="h-full w-full object-cover" />
                   </div>
                   <div>
                      <button type="button" className="mb-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">Change Photo</button>
                      <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                   </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                        <input type="text" defaultValue="Admin" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                        <input type="text" defaultValue="User" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" defaultValue="admin@fitpulse.com" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                    </div>
                </div>
             </form>
           )}

           {activeTab === 'security' && (
             <div className="space-y-6 animate-in fade-in duration-300">
               <div>
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h3>
                 <div className="mt-4 grid gap-4 md:max-w-md">
                   <input type="password" placeholder="Current Password" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                   <input type="password" placeholder="New Password" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                   <button className="w-fit rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400">Update Password</button>
                 </div>
               </div>
               
               <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                             <Shield size={20} />
                          </div>
                          <div>
                              <p className="font-medium text-gray-900 dark:text-white">Authenticator App</p>
                              <p className="text-sm text-gray-500">Secure your account with TOTP.</p>
                          </div>
                      </div>
                      <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">Setup</button>
                  </div>
               </div>
             </div>
           )}
           
           {/* Common Save Button for all tabs */}
           <div className="mt-8 flex justify-end border-t border-gray-200 pt-6 dark:border-gray-800">
              <button type="button" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md">
                <Save size={18} /> Save Changes
              </button>
           </div>
         </div>
       </div>
    </div>
  );
};