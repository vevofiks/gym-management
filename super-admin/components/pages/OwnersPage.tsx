"use client";
import React, { useState, useEffect } from 'react';
import { Owner } from '../../types';
import { Mail, Shield, Ban, Plus, Loader2, Search, Filter, Trash2, ExternalLink, ShieldAlert } from 'lucide-react';
import { tenantService } from '../../services/tenantService';
import { CreateOwnerModal } from '../modals/CreateOwnerModal';
import { UpdateOwnerModal } from '../modals/UpdateOwnerModal';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { toast } from 'react-toastify';

export const OwnersPage: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermanent, setIsPermanent] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchOwners = async () => {
    setIsLoading(true);
    try {
      const data = await tenantService.getGymOwners(1, 100, searchTerm);
      setOwners(data.users);
      setError(null);
    } catch (err: any) {
      setError('Failed to load owners');
      toast.error('Error fetching gym owners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOwners();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleEditOwner = (owner: Owner) => {
    setSelectedOwner(owner);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (owner: Owner, permanent: boolean = false) => {
    setSelectedOwner(owner);
    setIsPermanent(permanent);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOwner) return;
    setIsActionLoading(true);
    try {
      if (isPermanent) {
        await tenantService.permanentDeleteGymOwner(selectedOwner.id);
        toast.success(`Account for ${selectedOwner.name} has been PERMANENTLY deleted`);
      } else {
        await tenantService.deleteGymOwner(selectedOwner.id);
        toast.success(`Account for ${selectedOwner.name} has been moved to trash`);
      }
      fetchOwners();
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${isPermanent ? 'permanently delete' : 'trash'} owner account`);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gym Owners</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage owner accounts and platform access</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20 font-medium active:scale-95 sm:w-auto w-full"
        >
          <Plus size={20} />
          Add New Owner
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-[#151C2C] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium sm:w-auto w-full">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {isLoading && owners.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-gray-500">Loading platform owners...</p>
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#151C2C]">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-gray-900 dark:text-white font-medium">{error}</p>
          <button onClick={fetchOwners} className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Try again</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {owners.length > 0 ? (
            owners.map((owner) => (
              <div key={owner.id} className="group relative flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-[#151C2C]">
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditOwner(owner)}
                    className="p-2 text-gray-400 hover:text-indigo-500 transition-colors bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
                    title="Edit Owner"
                  >
                    <Shield size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(owner, false)}
                    className="p-2 text-orange-400 hover:text-orange-500 transition-colors bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
                    title="Move to Trash"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(owner, true)}
                    className="p-2 text-red-400 hover:text-red-500 transition-colors bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
                    title="Delete Permanently"
                  >
                    <ShieldAlert size={16} />
                  </button>
                </div>

                <div className="relative mb-4">
                  <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-800 ring-4 ring-indigo-50 dark:ring-indigo-900/10">
                    {owner.avatar_url ? (
                      <img src={owner.avatar_url} alt={owner.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {owner.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-white dark:border-[#151C2C] ${owner.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{owner.name}</h3>
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">@{owner.username}</p>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400 line-clamp-1 flex items-center gap-1 justify-center">
                  <Mail size={12} /> {owner.email}
                </p>

                <div className="mb-6 flex w-full justify-center gap-4 border-t border-gray-50 dark:border-gray-800 pt-4">
                  <div className="text-center">
                    <span className="block text-sm font-bold text-gray-900 dark:text-white">{owner.tenant_id ? 'Yes' : 'No'}</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Linked Gym</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold text-indigo-600 dark:text-indigo-400 capitalize">{owner.role.replace('_', ' ')}</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Role</span>
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-auto">
                  <button
                    onClick={() => handleEditOwner(owner)}
                    className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-xs font-bold transition-colors border border-gray-100 dark:border-gray-700"
                  >
                    Edit Details
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors">
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 font-medium">No owners found with the current criteria</p>
              <button onClick={() => setSearchTerm('')} className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Clear search</button>
            </div>
          )}
        </div>
      )}

      <CreateOwnerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchOwners();
          toast.success('Owner successfully created!');
        }}
      />

      <UpdateOwnerModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedOwner(null);
        }}
        onSuccess={() => {
          fetchOwners();
          toast.success('Owner details updated successfully');
        }}
        owner={selectedOwner}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedOwner(null);
        }}
        onConfirm={confirmDelete}
        title={isPermanent ? "Permanent Deletion" : "Move to Trash"}
        message={isPermanent
          ? `Are you sure you want to PERMANENTLY delete the account for "${selectedOwner?.name}"? This action cannot be undone.`
          : `Are you sure you want to move the account for "${selectedOwner?.name}" to trash? You can restore it later.`}
        confirmText={isPermanent ? "Delete Permanently" : "Move to Trash"}
        isLoading={isActionLoading}
        variant="danger"
      />
    </div>
  );
};
