"use client";
import React, { useState, useEffect } from 'react';
import { TenantResponse } from '../../types';
import { tenantService } from '../../services/tenantService';
import {
  Search,
  Filter,
  Plus,
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Trash2,
  Edit2,
  MoreVertical,
  Calendar,
  MapPin,
  ShieldOff,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { CreateOwnerModal } from '../modals/CreateOwnerModal';
import { UpdateGymModal } from '../modals/UpdateGymModal';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { toast } from 'react-toastify';

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
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Action/Confirm States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermanent, setIsPermanent] = useState(false);
  const [selectedGym, setSelectedGym] = useState<TenantResponse | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const [tenantsList, systemStats] = await Promise.all([
        tenantService.getTenants(1, 100, searchTerm, false),
        tenantService.getSystemStats()
      ]);
      setTenants(tenantsList.tenants);
      setStats(systemStats);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch gyms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTenants();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleEditClick = (gym: TenantResponse) => {
    setSelectedGym(gym);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (gym: TenantResponse, permanent: boolean = false) => {
    setSelectedGym(gym);
    setIsPermanent(permanent);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedGym) return;
    setIsActionLoading(true);
    try {
      if (isPermanent) {
        await tenantService.permanentDeleteTenant(selectedGym.id);
        toast.success(`${selectedGym.name} has been permanently deleted`);
      } else {
        await tenantService.deleteTenant(selectedGym.id);
        toast.success(`${selectedGym.name} has been moved to trash`);
      }
      fetchTenants();
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${isPermanent ? 'permanently delete' : 'trash'} gym`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleBlock = async (gym: TenantResponse) => {
    try {
      await tenantService.updateTenant(gym.id, { is_active: !gym.is_active } as any);
      toast.success(`${gym.name} has been ${gym.is_active ? 'blocked' : 'unblocked'} successfully`);
      fetchTenants();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to update gym status');
    }
  };

  if (isLoading && tenants.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Gyms" value={stats?.total_tenants || '0'} icon={Building2} color="bg-indigo-500 text-indigo-500" trend="+12% this month" />
        <StatCard label="Total Members" value={stats?.total_members || '0'} icon={Users} color="bg-blue-500 text-blue-500" trend="+5.4% this month" />
        <StatCard label="Total Owners" value={stats?.total_users || '0'} icon={TrendingUp} color="bg-orange-500 text-orange-500" />
        <StatCard label="Churn Rate" value="1.2%" icon={AlertTriangle} color="bg-red-500 text-red-500" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Managed Gyms List</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search gyms by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-sm text-gray-600 outline-none focus:border-indigo-500 dark:border-gray-700 dark:text-gray-300 sm:w-64"
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Plus size={16} /> Add New Gym
            </button>
          </div>
        </div>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg font-bold">Gym Details</th>
                <th className="px-6 py-4 font-bold">Contact & Location</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Paid Until</th>
                <th className="px-6 py-4 text-right rounded-tr-lg font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tenants.map((gym) => (
                <tr key={gym.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {gym.logo_url ? (
                          <img src={gym.logo_url} alt={gym.name} className="h-full w-full object-cover" />
                        ) : (
                          gym.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{gym.name}</div>
                        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                          Joined: {gym.created_at ? new Date(gym.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {(gym.contact_email || gym.contact_phone) && (
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{gym.contact_email || gym.contact_phone}</span>
                        </div>
                      )}
                      {(gym.city || gym.state) && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <MapPin size={12} />
                          <span>{[gym.city, gym.state].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider
                      ${!gym.is_active ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                        gym.paid_until && new Date(gym.paid_until) < new Date() ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${!gym.is_active ? 'bg-red-600' : gym.paid_until && new Date(gym.paid_until) < new Date() ? 'bg-yellow-600' : 'bg-green-600'}`}></span>
                      {!gym.is_active ? 'Blocked' : (gym.paid_until && new Date(gym.paid_until) < new Date() ? 'Expired' : 'Active')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Calendar size={14} className="text-gray-400" />
                      {gym.paid_until ? new Date(gym.paid_until).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Record'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!gym.is_active ? (
                        <button
                          onClick={() => handleToggleBlock(gym)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg transition-all text-xs font-bold border border-amber-200/50 dark:border-amber-800/50"
                        >
                          <ShieldCheck size={14} /> Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleBlock(gym)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                          title="Block Gym"
                        >
                          <ShieldOff size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditClick(gym)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                        title="Edit Gym"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(gym, false)}
                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-all"
                        title="Move to Trash"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(gym, true)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                        title="Delete Permanently"
                      >
                        <ShieldOff size={16} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (Hidden on Desktop) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {tenants.map((gym) => (
            <div key={gym.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {gym.logo_url ? (
                      <img src={gym.logo_url} alt={gym.name} className="h-full w-full object-cover" />
                    ) : (
                      gym.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{gym.name}</h4>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-1
                      ${!gym.is_active ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                        gym.paid_until && new Date(gym.paid_until) < new Date() ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
                      {!gym.is_active ? 'Blocked' : (gym.paid_until && new Date(gym.paid_until) < new Date() ? 'Expired' : 'Active')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Mail size={12} className="shrink-0" />
                  <span className="truncate">{gym.contact_email || gym.contact_phone || 'No contact info'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <MapPin size={12} className="shrink-0" />
                  <span>{[gym.city, gym.state].filter(Boolean).join(', ') || 'No location'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Calendar size={12} className="shrink-0" />
                  <span>Paid: {gym.paid_until ? new Date(gym.paid_until).toLocaleDateString() : 'No record'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleBlock(gym)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                  >
                    {gym.is_active ? <ShieldOff size={18} /> : <ShieldCheck size={18} />}
                  </button>
                  <button
                    onClick={() => handleEditClick(gym)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDeleteClick(gym, false)}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(gym, true)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <ShieldOff size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tenants.length === 0 && (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Building2 size={40} className="mb-4 text-gray-300" />
              <p className="font-medium">No gyms found matching your criteria</p>
              <button onClick={() => setSearchTerm('')} className="mt-2 text-indigo-600 hover:underline text-sm font-medium">Clear search filters</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateOwnerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchTenants();
          toast.success('Gym and Owner successfully created!');
        }}
      />

      <UpdateGymModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedGym(null);
        }}
        onSuccess={fetchTenants}
        gym={selectedGym}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={isPermanent ? "Permanent Deletion" : "Move to Trash"}
        message={isPermanent
          ? `Are you sure you want to PERMANENTLY delete "${selectedGym?.name}"? This will remove all data and cannot be undone.`
          : `Are you sure you want to move "${selectedGym?.name}" to trash? You can restore it later.`}
        confirmText={isPermanent ? "Delete Permanently" : "Move to Trash"}
        isLoading={isActionLoading}
        variant="danger"
      />
    </div >
  );
};