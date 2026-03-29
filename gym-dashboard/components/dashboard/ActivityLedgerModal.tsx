'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Filter, History, UserPlus, CreditCard, Clock, Package, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { api } from '@/store/AuthStore';

interface AuditLog {
    id: number;
    type: string;
    description: string;
    meta: any;
    created_at: string;
}

interface ActivityLedgerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ActivityLedgerModal: React.FC<ActivityLedgerModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [activities, setActivities] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchActivities = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/audit', {
                params: {
                    page,
                    size: 15,
                    search: search || undefined,
                    type: typeFilter || undefined,
                }
            });
            setActivities(response.data.items);
            setTotalPages(response.data.pages);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchActivities();
        }
    }, [isOpen, page, typeFilter]);

    // Handle search with button click or enter
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchActivities();
    };

    if (!isOpen) return null;

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'member_registration':
                return <UserPlus size={18} className="text-blue-500" />;
            case 'payment':
                return <CreditCard size={18} className="text-green-500" />;
            case 'membership_expired':
                return <Clock size={18} className="text-red-500" />;
            case 'plan_created':
                return <Package size={18} className="text-purple-500" />;
            default:
                return <History size={18} className="text-gray-400" />;
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                            <History className="text-primary" size={24} />
                            Activity Ledger
                        </h2>
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-widest mt-1">
                            Full audit log of your gym operations
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-border bg-muted/10 flex flex-wrap gap-3 items-center shrink-0">
                    <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                        <input
                            type="text"
                            placeholder="Search description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:border-primary transition-all"
                        />
                    </form>

                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-text-secondary" />
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setPage(1);
                            }}
                            className="bg-background border border-border rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none focus:border-primary transition-all"
                        >
                            <option value="">All Types</option>
                            <option value="member_registration">Registrations</option>
                            <option value="payment">Payments</option>
                            <option value="membership_expired">Expirations</option>
                            <option value="plan_created">Plan Changes</option>
                        </select>
                    </div>

                    <div className="text-[10px] font-black text-text-secondary uppercase bg-muted/30 px-3 py-2 rounded-xl border border-border/50">
                        Total: {totalItems}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <p className="text-xs font-black text-text-secondary uppercase">Loading Ledger...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <div key={activity.id} className="group flex items-center justify-between p-4 rounded-xl bg-background/40 border border-transparent hover:border-border hover:bg-background/60 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-muted/50 group-hover:bg-card transition-colors">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary leading-snug">
                                                {activity.description}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">
                                                    {activity.type.replace('_', ' ')}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span className="text-[10px] font-medium text-text-secondary">
                                                    {formatDateTime(activity.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {activity.meta?.amount && (
                                        <div className="text-sm font-black text-green-500">
                                            ₹{activity.meta.amount}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {activities.length === 0 && (
                                <div className="text-center py-20">
                                    <p className="text-sm font-bold text-text-secondary uppercase">No activity records found matching your search</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-border flex items-center justify-between shrink-0 bg-muted/5">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                            className="p-2 border border-border rounded-xl hover:bg-background disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || isLoading}
                            className="p-2 border border-border rounded-xl hover:bg-background disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
