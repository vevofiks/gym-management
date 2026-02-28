"use client";
import React, { useState, useEffect } from 'react';
import { TenantResponse, Owner } from '../../types';
import { tenantService } from '../../services/tenantService';
import {
    Trash2,
    RefreshCcw,
    Building2,
    Users,
    Search,
    Loader2,
    AlertTriangle,
    MapPin,
    Calendar,
    ShieldAlert,
    Archive
} from 'lucide-react';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { toast } from 'react-toastify';

export const TrashPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'gyms' | 'owners'>('gyms');
    const [gyms, setGyms] = useState<TenantResponse[]>([]);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Action States
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'restore' | 'permanent'>('restore');
    const [selectedItem, setSelectedItem] = useState<TenantResponse | Owner | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'gyms') {
                const data = await tenantService.getTrashedTenants({ search: searchTerm });
                setGyms(data.tenants);
            } else {
                const data = await tenantService.getTrashedGymOwners({ search: searchTerm });
                setOwners(data.users);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to fetch trashed items');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [activeTab, searchTerm]);

    const handleAction = (item: TenantResponse | Owner, type: 'restore' | 'permanent') => {
        setSelectedItem(item);
        setActionType(type);
        setIsConfirmModalOpen(true);
    };

    const confirmAction = async () => {
        if (!selectedItem) return;
        setIsActionLoading(true);
        try {
            if (activeTab === 'gyms') {
                if (actionType === 'restore') {
                    await tenantService.restoreTenant(selectedItem.id);
                    toast.success(`${(selectedItem as TenantResponse).name} restored successfully`);
                } else {
                    await tenantService.permanentDeleteTenant(selectedItem.id);
                    toast.success(`${(selectedItem as TenantResponse).name} permanently deleted`);
                }
            } else {
                if (actionType === 'restore') {
                    await tenantService.restoreGymOwner(selectedItem.id);
                    toast.success(`${(selectedItem as Owner).name} restored successfully`);
                } else {
                    await tenantService.permanentDeleteGymOwner(selectedItem.id);
                    toast.success(`${(selectedItem as Owner).name} permanently deleted`);
                }
            }
            fetchData();
            setIsConfirmModalOpen(false);
        } catch (err: any) {
            toast.error(err.message || `Failed to ${actionType} item`);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Archive className="text-orange-500" /> Trash Management
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Restore or permanently delete gyms and owner accounts</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white dark:bg-[#151C2C] p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm w-fit">
                <button
                    onClick={() => setActiveTab('gyms')}
                    className={`px-6 py-2 text-sm font-bold transition-all rounded-lg flex items-center gap-2 ${activeTab === 'gyms'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <Building2 size={18} />
                    <span className="sm:block hidden">Trashed Gyms</span>
                    <span className="sm:hidden block">Gyms</span>
                </button>
                <button
                    onClick={() => setActiveTab('owners')}
                    className={`px-6 py-2 text-sm font-bold transition-all rounded-lg flex items-center gap-2 ${activeTab === 'owners'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <Users size={18} />
                    <span className="sm:block hidden">Trashed Owners</span>
                    <span className="sm:hidden block">Owners</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-[#151C2C] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder={`Search trashed ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="mt-4 text-sm text-gray-500">Loading trashed items...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-400 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">{activeTab === 'gyms' ? 'Gym Details' : 'Owner Details'}</th>
                                    <th className="px-6 py-4">{activeTab === 'gyms' ? 'Location' : 'Username'}</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {activeTab === 'gyms' ? (
                                    gyms.length > 0 ? (
                                        gyms.map((gym) => (
                                            <tr key={gym.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{gym.name}</div>
                                                    <div className="text-xs text-gray-500">{gym.contact_email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                                        <MapPin size={12} /> {gym.city}, {gym.state}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => handleAction(gym, 'restore')}
                                                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                                            title="Restore"
                                                        >
                                                            <RefreshCcw size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(gym, 'permanent')}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                            title="Delete Permanently"
                                                        >
                                                            <ShieldAlert size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">No trashed gyms found</td>
                                        </tr>
                                    )
                                ) : (
                                    owners.length > 0 ? (
                                        owners.map((owner) => (
                                            <tr key={owner.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{owner.name}</div>
                                                    <div className="text-xs text-gray-500">{owner.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">@{owner.username}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => handleAction(owner, 'restore')}
                                                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                                            title="Restore Account"
                                                        >
                                                            <RefreshCcw size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(owner, 'permanent')}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                            title="Delete Permanently"
                                                        >
                                                            <ShieldAlert size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">No trashed owners found</td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {activeTab === 'gyms' ? (
                            gyms.map((gym) => (
                                <div key={gym.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#151C2C] shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{gym.name}</h4>
                                            <p className="text-xs text-gray-500">{gym.contact_email}</p>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                            <MapPin size={10} /> {gym.city}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                                        <button
                                            onClick={() => handleAction(gym, 'restore')}
                                            className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                                        >
                                            <RefreshCcw size={14} /> Restore
                                        </button>
                                        <button
                                            onClick={() => handleAction(gym, 'permanent')}
                                            className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                                        >
                                            <ShieldAlert size={14} /> Purge
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            owners.map((owner) => (
                                <div key={owner.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#151C2C] shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{owner.name}</h4>
                                            <p className="text-xs text-gray-500">{owner.email}</p>
                                        </div>
                                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                                            @{owner.username}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                                        <button
                                            onClick={() => handleAction(owner, 'restore')}
                                            className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                                        >
                                            <RefreshCcw size={14} /> Restore
                                        </button>
                                        <button
                                            onClick={() => handleAction(owner, 'permanent')}
                                            className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                                        >
                                            <ShieldAlert size={14} /> Purge
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        {((activeTab === 'gyms' && gyms.length === 0) || (activeTab === 'owners' && owners.length === 0)) && (
                            <div className="py-12 text-center text-gray-500 bg-white dark:bg-[#151C2C] rounded-xl border border-gray-200 dark:border-gray-800">
                                No trashed items found
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmAction}
                title={actionType === 'restore' ? 'Restore Item' : 'Permanent Deletion'}
                message={actionType === 'restore'
                    ? `Are you sure you want to restore "${(selectedItem as any)?.name}"? It will become active again.`
                    : `Warning: This will PERMANENTLY delete "${(selectedItem as any)?.name}". This action cannot be undone.`}
                confirmText={actionType === 'restore' ? 'Restore' : 'Delete Permanently'}
                variant={actionType === 'restore' ? 'info' : 'danger'}
                isLoading={isActionLoading}
            />
        </div>
    );
};
