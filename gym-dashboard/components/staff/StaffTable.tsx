"use client";

import React from 'react';
import {
    Edit2,
    Trash2,
    Calendar,
    Phone,
    Mail,
    User,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { UserResponse } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

import { EmptyState } from '@/components/ui/empty-state';

interface StaffTableProps {
    staff: UserResponse[];
    onEdit: (staff: UserResponse) => void;
    onDelete: (staff: UserResponse) => void;
    isLoading: boolean;
}

export const StaffTable = ({
    staff,
    onEdit,
    onDelete,
    isLoading
}: StaffTableProps) => {
    if (isLoading) {
        return (
            <div className="w-full bg-card rounded-xl border border-border overflow-hidden min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-text-secondary">Loading staff members...</p>
                </div>
            </div>
        );
    }

    if (staff.length === 0) {
        return (
            <EmptyState
                icon={User}
                title="No staff members found"
                description="You haven't added any staff members yet. Use the 'Add Staff' button to get started."
            />
        );
    }

    return (
        <div className="w-full bg-card rounded-xl border border-border overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-background/50">
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Staff Member</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Contact Info</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Joined Date</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {staff.map((member) => (
                            <tr key={member.id} className="hover:bg-primary/5 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden border-2 border-primary/10 group-hover:border-primary/30 transition-all">
                                            {member.avatar_url ? (
                                                <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" />
                                            ) : (
                                                member.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                                                {member.name}
                                            </span>
                                            <span className="text-xs text-text-secondary font-medium uppercase tracking-tighter opacity-80">
                                                @{member.username}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs text-text-primary font-medium">
                                            <Mail size={14} className="text-text-secondary" />
                                            {member.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                                            <Phone size={14} />
                                            {member.phone_number}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    {member.is_active ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[11px] font-bold uppercase tracking-wider">
                                            <CheckCircle2 size={12} strokeWidth={3} />
                                            Active
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-[11px] font-bold uppercase tracking-wider">
                                            <XCircle size={12} strokeWidth={3} />
                                            Inactive
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                                        <Calendar size={14} />
                                        {format(new Date(member.created_at), 'MMM dd, yyyy')}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(member)}
                                            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                            title="Edit staff"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(member)}
                                            className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete staff"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
