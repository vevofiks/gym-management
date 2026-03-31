'use client';

import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    UserPlus,
    Apple,
    Clock,
    ChevronRight,
    Utensils,
    Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DietPlanTemplateResponse,
    DietPlanListResponse
} from '@/types';
import { listTemplates, deleteTemplate } from '@/services/dietPlanService';
import { useSubscriptionStore } from '@/store/SubscriptionStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DietTemplateModal } from '@/components/diet-plans/DietTemplateModal';
import { AssignDietModal } from '@/components/diet-plans/AssignDietModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'weight_gain', label: 'Weight Gain' },
    { value: 'muscle_building', label: 'Muscle Building' },
    { value: 'maintenance', label: 'Maintenance' },
];

import { useCanCreateDietTemplate } from '@/hooks/useSubscription';

export default function DietPlansPage() {
    const { canCreate, message } = useCanCreateDietTemplate();
    const [templates, setTemplates] = useState<DietPlanTemplateResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Modals state
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [selectedTemplate, setSelectedTemplate] = useState<DietPlanTemplateResponse | null>(null);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
            const data: DietPlanListResponse = await listTemplates(params);
            setTemplates(data.templates);
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load diet plans');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [selectedCategory]);

    const handleCreate = () => {
        if (!canCreate) {
            toast.error(message);
            return;
        }
        setSelectedTemplate(null);
        setIsTemplateModalOpen(true);
    };

    const handleEdit = (template: DietPlanTemplateResponse) => {
        setSelectedTemplate(template);
        setIsTemplateModalOpen(true);
    };

    const handleAssign = (template: DietPlanTemplateResponse) => {
        setSelectedTemplate(template);
        setIsAssignModalOpen(true);
    };

    const deleteClick = (template: DietPlanTemplateResponse) => {
        setSelectedTemplate(template);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedTemplate) return;
        try {
            await deleteTemplate(selectedTemplate.id);
            toast.success('Diet plan template deleted successfully');
            fetchTemplates();
        } catch (error) {
            toast.error('Failed to delete diet plan');
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'weight_loss': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'weight_gain': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'muscle_building': return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
            case 'maintenance': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getCategoryLabel = (category: string) => {
        return CATEGORIES.find(c => c.value === category)?.label || category;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-end">
                <Button
                    onClick={handleCreate}
                    className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6 rounded-xl shadow-glow transition-all active:scale-95"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    New Template
                </Button>
            </div>

            {/* Filters section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search templates by name..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-sidebar border-border rounded-xl focus:ring-primary/20 transition-all font-medium"
                    />
                </div>
                <div className="flex gap-2 p-1.5 bg-sidebar rounded-xl border border-border overflow-x-auto no-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                selectedCategory === cat.value
                                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                                    : "text-text-secondary hover:text-text-primary hover:bg-background"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content section */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-xl bg-sidebar/50 animate-pulse border border-border" />
                    ))}
                </div>
            ) : filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className="group relative overflow-hidden rounded-xl bg-sidebar border-border hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 p-6 flex flex-col"
                        >
                            {/* Decorative background element */}
                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    getCategoryStyles(template.category)
                                )}>
                                    {getCategoryLabel(template.category)}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(template);
                                        }}
                                        className="p-2 rounded-xl bg-background text-text-secondary hover:text-primary hover:bg-primary/5 transition-all relative z-20"
                                        aria-label="Edit template"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteClick(template);
                                        }}
                                        className="p-2 rounded-xl bg-background text-text-secondary hover:text-rose-500 hover:bg-rose-500/5 transition-all relative z-20"
                                        aria-label="Delete template"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors leading-tight">
                                {template.name}
                            </h3>

                            <p className="text-sm text-text-secondary line-clamp-2 mb-6 flex-1 italic opacity-80 group-hover:opacity-100 transition-opacity">
                                {template.description || 'No description provided for this diet template.'}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                    <div className="p-2 rounded-xl bg-background border border-border">
                                        <Utensils size={14} className="text-primary" />
                                    </div>
                                    <span>{template.meals.length} Meals</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                    <div className="p-2 rounded-xl bg-background border border-border">
                                        <Clock size={14} className="text-primary" />
                                    </div>
                                    <span>Updated {format(new Date(template.updated_at), 'MMM d')}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => handleAssign(template)}
                                className="w-full h-11 rounded-xl bg-background border border-border text-text-primary hover:bg-primary hover:text-white hover:border-primary transition-all font-bold group/btn"
                            >
                                <UserPlus className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                Assign to Member
                                <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-sidebar/30 rounded-xl border border-dashed border-border mt-10">
                    <div className="p-6 rounded-full bg-primary/5 mb-6">
                        <Apple size={48} className="text-primary/40 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">No diet templates found</h3>
                    <p className="text-text-secondary text-center max-w-sm mb-8">
                        {searchQuery
                            ? `We couldn't find any templates matching "${searchQuery}".`
                            : "Start by creating a nutritional template that you can assign to your members."}
                    </p>
                    <Button onClick={handleCreate} className="bg-primary text-white font-bold h-11 px-8 rounded-xl shadow-glow transition-all">
                        Create Your First Plan
                    </Button>
                </div>
            )}

            {/* Modals placeholders - Implementing these next */}
            {isTemplateModalOpen && (
                <DietTemplateModal
                    isOpen={isTemplateModalOpen}
                    onClose={() => setIsTemplateModalOpen(false)}
                    template={selectedTemplate}
                    onSuccess={fetchTemplates}
                />
            )}

            {isAssignModalOpen && selectedTemplate && (
                <AssignDietModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    template={selectedTemplate}
                />
            )}

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Diet Plan?"
                message={`Are you sure you want to delete "${selectedTemplate?.name}"? This action can be undone by reactivating the template later if needed.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}