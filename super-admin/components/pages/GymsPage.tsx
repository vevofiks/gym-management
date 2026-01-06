import React from 'react';
import { Gym } from '../../types';
import { MoreHorizontal, Search, Filter, Plus, Users, Building2, TrendingUp, AlertTriangle } from 'lucide-react';

const gymsData: Gym[] = [
  { id: '1', name: 'Iron Paradise Gym', owner: 'Dwayne J.', location: 'Miami, FL', plan: 'Enterprise', status: 'Active', joinedDate: 'Jan 12, 2024', members: 1240, logo: 'https://picsum.photos/50/50?1' },
  { id: '2', name: 'CrossFit Central', owner: 'Sarah C.', location: 'Austin, TX', plan: 'Growth', status: 'Active', joinedDate: 'Feb 04, 2024', members: 850, logo: 'https://picsum.photos/50/50?2' },
  { id: '3', name: 'Yoga Flow Studio', owner: 'Emily R.', location: 'Portland, OR', plan: 'Starter', status: 'Trial', joinedDate: 'Mar 20, 2024', members: 120, logo: 'https://picsum.photos/50/50?3' },
  { id: '4', name: 'Muscle Factory', owner: 'Mike T.', location: 'Detroit, MI', plan: 'Growth', status: 'Churned', joinedDate: 'Dec 10, 2023', members: 0, logo: 'https://picsum.photos/50/50?4' },
  { id: '5', name: 'Gold Standard Fitness', owner: 'Arnold S.', location: 'Venice, CA', plan: 'Enterprise', status: 'Active', joinedDate: 'Nov 01, 2023', members: 3200, logo: 'https://picsum.photos/50/50?5' },
];

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} bg-opacity-10 text-white`}>
         <Icon className="text-current" size={20} />
      </div>
    </div>
    {trend && (
      <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
        <TrendingUp size={14} />
        <span>{trend}</span>
      </div>
    )}
  </div>
);

export const GymsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
         <StatCard label="Total Gyms" value="842" icon={Building2} color="bg-indigo-500 text-indigo-500" trend="+12% this month" />
         <StatCard label="Total Members" value="125k" icon={Users} color="bg-blue-500 text-blue-500" trend="+5.4% this month" />
         <StatCard label="Active Trials" value="45" icon={TrendingUp} color="bg-orange-500 text-orange-500" />
         <StatCard label="Churn Rate" value="1.2%" icon={AlertTriangle} color="bg-red-500 text-red-500" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Managed Gyms List</h2>
          
          <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input 
                      type="text" 
                      placeholder="Search gyms, owners..." 
                      className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-sm text-gray-600 outline-none focus:border-indigo-500 dark:border-gray-700 dark:text-gray-300 sm:w-64"
                  />
              </div>
              <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Filter size={16} /> Filter
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm">
                  <Plus size={16} /> Add Gym
              </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 rounded-l-lg">Gym Name</th>
                <th className="px-6 py-3">Owner</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Members</th>
                <th className="px-6 py-3 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gymsData.map((gym) => (
                <tr key={gym.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                         <img src={gym.logo} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{gym.name}</div>
                          <div className="text-xs text-gray-500">{gym.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {gym.owner.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{gym.owner}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border
                      ${gym.plan === 'Enterprise' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' :
                        gym.plan === 'Growth' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                        'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
                      {gym.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                      ${gym.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        gym.status === 'Trial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                          gym.status === 'Active' ? 'bg-green-600' : 
                          gym.status === 'Trial' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}></span>
                      {gym.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{gym.members.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};