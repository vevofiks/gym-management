import React, { useState } from 'react';
import { Ticket } from '../../types';
import { MessageSquare, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react';

const ticketsData: Ticket[] = [
  { id: 'T-1001', subject: 'Payment Gateway Issue', requester: 'Iron Paradise Gym', priority: 'High', status: 'Open', date: '2024-06-15' },
  { id: 'T-1002', subject: 'Feature Request: Dark Mode', requester: 'CrossFit Central', priority: 'Low', status: 'In Progress', date: '2024-06-14' },
  { id: 'T-1003', subject: 'Login Errors for Staff', requester: 'Yoga Flow', priority: 'Medium', status: 'Resolved', date: '2024-06-10' },
  { id: 'T-1004', subject: 'Billing Discrepancy', requester: 'Muscle Factory', priority: 'High', status: 'Open', date: '2024-06-16' },
  { id: 'T-1005', subject: 'API Limit Reached', requester: 'Gold Standard', priority: 'High', status: 'Open', date: '2024-06-17' },
];

export const SupportPage: React.FC = () => {
  const [filter, setFilter] = useState('All');

  const filteredTickets = filter === 'All' 
    ? ticketsData 
    : ticketsData.filter(t => t.status === filter);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h2>
            <p className="text-sm text-gray-500">Manage inquiries from your gym partners.</p>
          </div>
          <div className="flex gap-2">
             <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-all">Create Ticket</button>
          </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between bg-gray-50/50 dark:bg-gray-900/20">
         <div className="flex gap-1 bg-gray-100 p-1 rounded-lg dark:bg-gray-800">
            {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        filter === status 
                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-white' 
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    {status}
                </button>
            ))}
         </div>
         <div className="relative">
             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Search tickets..." className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-64" />
         </div>
      </div>

      <div className="p-6 space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="group flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
                <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full 
                    ${ticket.priority === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 
                      ticket.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                    <AlertCircle size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">{ticket.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{ticket.id}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                        <span className="text-sm text-gray-500">by <span className="font-medium text-gray-700 dark:text-gray-300">{ticket.requester}</span></span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center justify-between gap-6 pl-14 md:pl-0 md:justify-end">
                <div className="flex flex-col items-end">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium 
                        ${ticket.status === 'Open' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                        {ticket.status}
                    </span>
                    <span className="mt-1 text-xs text-gray-400">{ticket.date}</span>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                    <MessageSquare size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};