import React from 'react';
import { Owner } from '../../types';
import { Mail, Shield, Ban } from 'lucide-react';

const ownersData: Owner[] = [
  { id: '1', name: 'Thomas Anree', email: 'thomas@ironparadise.com', gymCount: 1, status: 'Active', avatar: 'https://picsum.photos/50/50?10' },
  { id: '2', name: 'Sarah Connor', email: 'sarah@crossfit.com', gymCount: 3, status: 'Active', avatar: 'https://picsum.photos/50/50?11' },
  { id: '3', name: 'James Cameron', email: 'james@gymworld.com', gymCount: 1, status: 'Suspended', avatar: 'https://picsum.photos/50/50?12' },
  { id: '4', name: 'Ellen Ripley', email: 'ellen@nostromo.fit', gymCount: 2, status: 'Active', avatar: 'https://picsum.photos/50/50?13' },
  { id: '5', name: 'John Wick', email: 'john@babayaga.gym', gymCount: 1, status: 'Active', avatar: 'https://picsum.photos/50/50?14' },
];

export const OwnersPage: React.FC = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Gym Owners</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ownersData.map((owner) => (
          <div key={owner.id} className="flex flex-col items-center rounded-lg border border-gray-100 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="relative mb-4">
                <img src={owner.avatar} alt={owner.name} className="h-20 w-20 rounded-full object-cover" />
                <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${owner.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{owner.name}</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{owner.email}</p>
            
            <div className="mb-6 flex w-full justify-center gap-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                <div className="text-center">
                    <span className="block text-lg font-bold text-gray-900 dark:text-white">{owner.gymCount}</span>
                    <span className="text-xs text-gray-500">Gyms</span>
                </div>
                 <div className="text-center">
                    <span className="block text-lg font-bold text-gray-900 dark:text-white">
                        {owner.status === 'Active' ? '98%' : '0%'}
                    </span>
                    <span className="text-xs text-gray-500">Uptime</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50">
                    <Mail size={18} />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600">
                    <Shield size={18} />
                </button>
                 <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50">
                    <Ban size={18} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
