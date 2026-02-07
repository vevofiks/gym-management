'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { PlanCard } from '@/components/plans/PlanCard';
import { PlanForm } from '@/components/plans/PlanForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { MembershipPlan, PlanCreate, PlanUpdate } from '@/types/plan';
import { getPlans, createPlan, updatePlan, deletePlan } from '@/services/planService';
import toast from 'react-hot-toast';

export default function MembershipPlanPage() {
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

    // Filter plans by search
    const filteredPlans = plans.filter((plan) =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Membership Plans</h1>
                    <p className="text-text-secondary mt-1">
                        Manage your gym membership plans
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                    <Plus size={20} />
                    Create Plan
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search plans..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-text-primary">Show Inactive</span>
                </label>
            </div>

            {/* Plans Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-2xl bg-card border border-border animate-pulse" />
                    ))}
                </div>
            ) : filteredPlans.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-text-secondary text-lg">
                        {searchQuery ? 'No plans found matching your search.' : 'No plans yet. Create your first plan!'}
                    </p>
                </div>
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
                    <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
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
