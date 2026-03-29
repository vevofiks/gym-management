"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    RefreshCw,
    Shield,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StaffTable } from '@/components/staff/StaffTable';
import { StaffModal } from '@/components/staff/StaffModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UserResponse } from '@/types';
import { listStaff, createStaff, updateStaff, deleteStaff } from '@/services/staffService';
import { useSubscriptionStore } from '@/store/SubscriptionStore';
import toast from 'react-hot-toast';

export default function StaffManagementPage() {
    const { subscription } = useSubscriptionStore();
    const [staffList, setStaffList] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modal & Dialog states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingStaff, setEditingStaff] = useState<UserResponse | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<UserResponse | null>(null);

    const maxStaff = subscription?.plan_limits.max_staff || 0;
    const currentStaffCount = subscription?.current_usage.staff_count || 0;
    const isLimitReached = maxStaff !== -1 && currentStaffCount >= maxStaff;

    const fetchStaff = async () => {
        try {
            setIsRefreshing(true);
            const response = await listStaff();
            setStaffList(response.users);
        } catch (error: any) {
            toast.error('Failed to fetch staff members');
            console.error(error);
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleAddStaff = () => {
        if (isLimitReached) {
            toast.error(`Staff limit reached (${maxStaff}). Please upgrade your plan.`);
            return;
        }
        setEditingStaff(null);
        setIsModalOpen(true);
    };

    const handleEditStaff = (staff: UserResponse) => {
        setEditingStaff(staff);
        setIsModalOpen(true);
    };

    const handleSubmit = async (formData: any) => {
        try {
            setIsSubmitting(true);
            if (editingStaff) {
                await updateStaff(editingStaff.id, formData);
                toast.success('Staff member updated successfully');
            } else {
                await createStaff(formData);
                toast.success('Staff member created successfully');
                // Refresh subscription usage locally if possible or fetch again
                // For now we'll just refresh staff list
            }
            setIsModalOpen(false);
            fetchStaff();
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || 'An error occurred';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingStaff) return;
        try {
            setIsSubmitting(true);
            await deleteStaff(deletingStaff.id);
            toast.success('Staff member deleted successfully');
            setDeletingStaff(null);
            fetchStaff();
        } catch (error: any) {
            toast.error('Failed to delete staff member');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleAddStaff}
                        className="bg-primary text-white hover:bg-primary/90 shadow-soft h-12 px-6 rounded-xl font-bold flex items-center gap-2"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Add Staff Member
                    </Button>
                </div>
            </div>

            {/* Plan Limit Info Banner */}
            {maxStaff !== -1 && (
                <div className={cn(
                    "flex items-center justify-between p-4 rounded-xl border animate-in slide-in-from-top-2 duration-300",
                    isLimitReached
                        ? "bg-red-500/5 border-red-500/20 text-red-600"
                        : "bg-primary/5 border-primary/20 text-primary"
                )}>
                    <div className="flex items-center gap-3">
                        {isLimitReached ? <AlertCircle size={20} /> : <Shield size={20} />}
                        <div className="flex flex-col">
                            <span className="text-sm font-bold uppercase tracking-wider">
                                {isLimitReached ? 'Plan Limit Reached' : 'Staff Availability'}
                            </span>
                            <span className="text-xs opacity-80 font-medium">
                                {maxStaff - currentStaffCount} staff slots remaining in your {subscription?.plan_name} plan
                            </span>
                        </div>
                    </div>
                    <div className="text-xl font-black">
                        {currentStaffCount} / {maxStaff}
                    </div>
                </div>
            )}

            {/* Table Section */}
            <StaffTable
                staff={staffList}
                isLoading={isLoading}
                onEdit={handleEditStaff}
                onDelete={setDeletingStaff}
            />

            {/* Modal & Dialogs */}
            <StaffModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                staff={editingStaff}
                isSubmitting={isSubmitting}
            />

            <ConfirmDialog
                isOpen={!!deletingStaff}
                onClose={() => setDeletingStaff(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Staff Member"
                message={`Are you sure you want to delete ${deletingStaff?.name}? This action will revoke their access to the portal.`}
                confirmText="Delete Staff"
                variant="danger"
                isLoading={isSubmitting}
            />
        </div>
    );
}

// Helper for conditional classNames if cn is not available or needing a quick fix
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
