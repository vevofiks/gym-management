'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/members/DataTable';
import { columns } from '@/components/members/columns';
import { MemberOnboardingWizard } from '@/components/members/MemberOnboardingWizard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
    Users,
    UserCheck,
    AlertCircle,
    TrendingUp,
    Plus,
    RefreshCw,
    X,
    FileDown
} from 'lucide-react';
import { MemberResponse, MemberStatus } from '@/types/index';
import { getMembers, deleteMember, updateMember, exportMembersCSV } from '@/services/memberService';
import { cn, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { MemberForm } from '@/components/members/MemberForm';

import { useCanAddMember } from '@/hooks/useSubscription';

import { getMyTenantStats } from '@/services/tenantService';
import { TenantStats } from '@/types/index';

export default function Members() {
    const { canAdd, message } = useCanAddMember();
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get('search') || '';

    const [members, setMembers] = useState<MemberResponse[]>([]);
    const [stats, setStats] = useState<TenantStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [deletingMember, setDeletingMember] = useState<MemberResponse | null>(null);
    const [editingMember, setEditingMember] = useState<MemberResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch members
    const fetchData = async () => {
        try {
            setIsRefreshing(true);
            const response = await getMembers(1, 100, search);
            setMembers(response.members);
        } catch (error: any) {
            const errorMsg = typeof error.response?.data?.detail === 'string'
                ? error.response.data.detail
                : 'Failed to fetch members';
            toast.error(errorMsg);
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };

    // Fetch global stats
    const fetchStats = async () => {
        try {
            const data = await getMyTenantStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search]);

    useEffect(() => {
        fetchStats();
    }, []);

    // Handle delete
    const handleDelete = async () => {
        if (!deletingMember) return;

        try {
            setIsSubmitting(true);
            await deleteMember(deletingMember.id);
            toast.success('Member deleted successfully!');
            setDeletingMember(null);
            fetchData();
        } catch (error: any) {
            const errorMsg = typeof error.response?.data?.detail === 'string'
                ? error.response.data.detail
                : 'Failed to delete member';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle update
    const handleUpdate = async (memberData: any) => {
        if (!editingMember) return;

        try {
            setIsSubmitting(true);
            await updateMember(editingMember.id, memberData);
            toast.success('Member updated successfully!');
            setEditingMember(null);
            fetchData();
        } catch (error: any) {
            const errorMsg = typeof error.response?.data?.detail === 'string'
                ? error.response.data.detail
                : 'Failed to update member';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddClick = () => {
        if (!canAdd) {
            toast.error(message);
            return;
        }
        setIsWizardOpen(true);
    };

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* ... Header section section ... */}
            <div className="flex items-center justify-end">
                <div className="flex gap-3">
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-glow hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Member
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-4 rounded-xl shadow-soft">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary"><Users size={18} /></div>
                        <span className="text-[10px] font-bold text-green-500 uppercase">+12%</span>
                    </div>
                    <div className="text-2xl font-black text-text-primary">{stats?.total_members ?? members.length}</div>
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Members</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl shadow-soft">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><UserCheck size={18} /></div>
                        <span className="text-[10px] font-bold text-blue-500 uppercase">88%</span>
                    </div>
                    <div className="text-2xl font-black text-text-primary">
                        {stats?.active_members ?? members.filter(m => m.status === MemberStatus.ACTIVE).length}
                    </div>
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Now</div>
                </div>
                <div
                    onClick={() => router.push('/members/insights?filter=expiring_soon')}
                    className="bg-card border border-border p-4 rounded-xl shadow-soft cursor-pointer hover:shadow-lg transition-all active:scale-95 group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500 group-hover:scale-110 transition-transform"><AlertCircle size={18} /></div>
                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Action Required</span>
                    </div>
                    <div className="text-2xl font-black text-text-primary">
                        {stats?.expired_members ?? members.filter(m => m.status === MemberStatus.EXPIRED).length}
                    </div>
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">Expiring Soon</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl shadow-soft">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-500/10 rounded-xl text-green-500"><TrendingUp size={18} /></div>
                        <span className="text-[10px] font-bold text-green-500 uppercase">Live</span>
                    </div>
                    <div className="text-2xl font-black text-text-primary">
                        {formatCurrency(stats?.total_revenue || 0)}
                    </div>
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Revenue</div>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full rounded-xl bg-card p-6 shadow-soft border border-border">
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-text-secondary font-bold animate-pulse">Loading members...</div>
                    </div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={members}
                    onView={(member) => router.push(`/members/${(member as MemberResponse).id}`)}
                    onEdit={(member) => setEditingMember(member as MemberResponse)}
                    onDelete={(member) => setDeletingMember(member as MemberResponse)}
                />
            )}

            {/* Modals */}
            {isWizardOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsWizardOpen(false)} />
                    <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <MemberOnboardingWizard
                            onComplete={(newMember) => {
                                setIsWizardOpen(false);
                                setMembers([newMember, ...members]);
                                router.push(`/members/${newMember.id}`);
                            }}
                            onCancel={() => setIsWizardOpen(false)}
                        />
                    </div>
                </div>
            )}

            {editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditingMember(null)} />
                    <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Edit Member Profile</h2>
                                <p className="text-xs font-bold text-text-secondary uppercase">Modify details for {editingMember.first_name} {editingMember.last_name}</p>
                            </div>
                            <button
                                onClick={() => setEditingMember(null)}
                                className="p-2 rounded-full hover:bg-muted transition-colors text-text-secondary"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                            <MemberForm
                                initialData={editingMember}
                                onSubmit={handleUpdate}
                                onCancel={() => setEditingMember(null)}
                                isLoading={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deletingMember}
                onClose={() => setDeletingMember(null)}
                onConfirm={handleDelete}
                title="Delete Member"
                message={`Are you sure you want to delete "${deletingMember?.first_name} ${deletingMember?.last_name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={isSubmitting}
            />
        </div>
    );
}
