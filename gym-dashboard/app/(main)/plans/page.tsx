'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { PlanCard } from '@/components/plans/PlanCard';
import { PlanForm } from '@/components/plans/PlanForm';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MembershipPlan, PlanCreate, PlanUpdate } from '@/types';
import { getPlans, createPlan, updatePlan, deletePlan } from '@/services/planService';
import { useAuthStore } from '@/store/AuthStore';
import toast from 'react-hot-toast';

import { useCanCreatePlan } from '@/hooks/useSubscription';
import { Switch } from '@/components/ui/switch';

export default function MembershipPlanPage() {
    const { user } = useAuthStore();
    const { canCreate, message } = useCanCreatePlan();
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<MembershipPlan | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch plans
    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const response = await getPlans(1, 50, !showInactive);
            setPlans(response.plans);
        } catch (error: any) {
            const errorMsg = typeof error.response?.data?.detail === 'string'
                ? error.response.data.detail
                : Array.isArray(error.response?.data?.detail)
                    ? error.response.data.detail.map((e: any) => e.msg).join(', ')
                    : 'Failed to fetch plans';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [showInactive]);

    // Handle create
    const handleCreate = async (data: PlanCreate | PlanUpdate) => {
        try {
            setIsSubmitting(true);
            await createPlan(data as PlanCreate);
            toast.success('Plan created successfully!');
            setShowForm(false);
            fetchPlans();
        } catch (error: any) {
            const errorMsg = typeof error.response?.data?.detail === 'string'
                ? error.response.data.detail
                : Array.isArray(error.response?.data?.detail)
                    ? error.response.data.detail.map((e: any) => e.msg).join(', ')
                    : 'Failed to create plan';
            toast.error(errorMsg);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle update
    const handleUpdate = async (data: PlanCreate | PlanUpdate) => {
        if (!editingPlan) return;

        try {
            setIsSubmitting(true);
            await updatePlan(editingPlan.id, data as PlanUpdate);
            toast.success('Plan updated successfully!');
            setEditingPlan(null);
            fetchPlans();
        } catch (error: any) {
            const errorMsg = typeof error.response?.data?.detail === 'string'
                ? error.response.data.detail
                : Array.isArray(error.response?.data?.detail)
                    ? error.response.data.detail.map((e: any) => e.msg).join(', ')
                    : 'Failed to update plan';
            toast.error(errorMsg);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deletingPlan) return;

        try {
            setIsSubmitting(true);
            await deletePlan(deletingPlan.id);
            toast.success('Plan deleted successfully!');
            setDeletingPlan(null);
            fetchPlans();
        } catch (error: any) {
            const errorMsg = typeof error.response?.data?.detail === 'string'
                ? error.response.data.detail
                : Array.isArray(error.response?.data?.detail)
                    ? error.response.data.detail.map((e: any) => e.msg).join(', ')
                    : 'Failed to delete plan';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateClick = () => {
        if (!canCreate) {
            toast.error(message);
            return;
        }
        setShowForm(true);
    };

    // Filter plans by search
    const filteredPlans = plans.filter((plan) =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            {user?.role === 'gym_owner' && (
                <div className="flex items-center justify-end mb-8">
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={20} />
                        Create Plan
                    </button>
                </div>
            )}

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search plans..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                     <div className="flex items-center gap-3 px-4 py-2 bg-background border border-border rounded-xl w-full md:w-auto shrink-0 shadow-sm">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-colors",
                        showInactive ? "text-primary" : "text-text-secondary"
                    )}>
                        {showInactive ? 'Showing Inactive' : 'Show Inactive'}
                    </span>
                    <Switch
                        checked={showInactive} 
                        onChange={setShowInactive} 
                    />
                </div>
            </div>

            {/* Plans Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-xl bg-card border border-border animate-pulse" />
                    ))}
                </div>
            ) : filteredPlans.length === 0 ? (
                <EmptyState
                    icon={searchQuery ? Search : Package}
                    title={searchQuery ? "No matches found" : "No plans created yet"}
                    description={searchQuery
                        ? `We couldn't find any plans matching "${searchQuery}". Try a different search term.`
                        : "Start by creating your first membership plan to manage your gym members effectively."
                    }
                    action={searchQuery ? (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="px-6 py-2 rounded-xl bg-primary text-white font-bold shadow-soft hover:bg-primary/90 transition-all active:scale-95"
                        >
                            Clear Search
                        </button>
                    ) : (
                        <button
                            onClick={handleCreateClick}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white font-bold shadow-soft hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            Create Your First Plan
                        </button>
                    )}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            onEdit={setEditingPlan}
                            onDelete={setDeletingPlan}
                        />
                    ))}
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {(showForm || editingPlan) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => {
                            setShowForm(false);
                            setEditingPlan(null);
                        }}
                    />
                    <div className="relative bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-text-primary mb-6">
                            {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                        </h2>
                        <PlanForm
                            initialData={editingPlan ? {
                                id: editingPlan.id,
                                name: editingPlan.name,
                                description: editingPlan.description ?? undefined,
                                duration_days: editingPlan.duration_days,
                                price: editingPlan.price,
                                features: editingPlan.features ?? undefined,
                                is_active: editingPlan.is_active,
                            } : undefined}
                            onSubmit={editingPlan ? handleUpdate : handleCreate}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingPlan(null);
                            }}
                            isLoading={isSubmitting}
                        />
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deletingPlan}
                onClose={() => setDeletingPlan(null)}
                onConfirm={handleDelete}
                title="Delete Plan"
                message={`Are you sure you want to delete "${deletingPlan?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={isSubmitting}
            />
        </div>
    );
}
