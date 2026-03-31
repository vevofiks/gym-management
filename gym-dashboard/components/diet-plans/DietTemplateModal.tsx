'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Apple,
    Clock,
    Plus,
    Trash2,
    Save,
    AlertCircle,
    CheckCircle2,
    Utensils,
    Info,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import {
    DietPlanTemplateCreate,
    DietPlanTemplateUpdate,
    DietPlanTemplateResponse,
    MealItem
} from '@/types';
import { createTemplate, updateTemplate } from '@/services/dietPlanService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DietTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    template?: DietPlanTemplateResponse | null;
}

const CATEGORIES = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'weight_gain', label: 'Weight Gain' },
    { value: 'muscle_building', label: 'Muscle Building' },
    { value: 'maintenance', label: 'Maintenance' },
];

export const DietTemplateModal: React.FC<DietTemplateModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    template,
}) => {
    const isEditing = !!template;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('weight_loss');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [meals, setMeals] = useState<MealItem[]>([
        { time: '08:00 AM', name: 'Breakfast', items: [''] }
    ]);

    useEffect(() => {
        if (template && isOpen) {
            setName(template.name);
            setCategory(template.category);
            setDescription(template.description || '');
            setInstructions(template.instructions || '');
            // Backend might send meals as a string or object depending on JSON field behavior
            // We ensure it's an array of MealItem
            const initialMeals = Array.isArray(template.meals) ? template.meals : [];
            setMeals(initialMeals.length > 0 ? initialMeals : [{ time: '08:00 AM', name: 'Breakfast', items: [''] }]);
        } else if (isOpen) {
            setName('');
            setCategory('weight_loss');
            setDescription('');
            setInstructions('');
            setMeals([{ time: '08:00 AM', name: 'Breakfast', items: [''] }]);
        }
    }, [template, isOpen]);

    if (!isOpen) return null;

    const handleAddMeal = () => {
        setMeals([...meals, { time: '12:00 PM', name: 'New Meal', items: [''] }]);
    };

    const handleRemoveMeal = (index: number) => {
        if (meals.length <= 1) return;
        setMeals(meals.filter((_, i) => i !== index));
    };

    const handleUpdateMeal = (index: number, field: keyof MealItem, value: string) => {
        const newMeals = [...meals];
        if (field === 'items') return; // Handled separately
        newMeals[index] = { ...newMeals[index], [field]: value };
        setMeals(newMeals);
    };

    const handleAddItem = (mealIndex: number) => {
        const newMeals = [...meals];
        newMeals[mealIndex].items.push('');
        setMeals(newMeals);
    };

    const handleRemoveItem = (mealIndex: number, itemIndex: number) => {
        const newMeals = [...meals];
        if (newMeals[mealIndex].items.length <= 1) return;
        newMeals[mealIndex].items = newMeals[mealIndex].items.filter((_, i) => i !== itemIndex);
        setMeals(newMeals);
    };

    const handleUpdateItem = (mealIndex: number, itemIndex: number, value: string) => {
        const newMeals = [...meals];
        newMeals[mealIndex].items[itemIndex] = value;
        setMeals(newMeals);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Filter out empty items
        const cleanedMeals = meals.map(meal => ({
            ...meal,
            items: meal.items.filter(item => item.trim() !== '')
        })).filter(meal => meal.items.length > 0 || meal.name.trim() !== '');

        if (cleanedMeals.length === 0) {
            setError('Please add at least one meal with food items.');
            setIsLoading(false);
            return;
        }

        const templateData = {
            name,
            category,
            description: description.trim() || undefined,
            instructions: instructions.trim() || undefined,
            meals: cleanedMeals,
        };

        try {
            if (isEditing && template) {
                await updateTemplate(template.id, templateData as DietPlanTemplateUpdate);
            } else {
                await createTemplate(templateData as DietPlanTemplateCreate);
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onSuccess();
                onClose();
            }, 1000);
        } catch (err: any) {
            console.error('Failed to save template:', err);
            setError(err.response?.data?.detail || 'Failed to save diet plan. Please check your inputs.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="bg-background w-full max-w-2xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl border border-border flex flex-col relative animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-border bg-card flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Apple size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">
                                {isEditing ? 'Edit Diet Plan' : 'New Diet Plan'}
                            </h2>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                                {isEditing ? 'Update nutritional template' : 'Create a reusable nutrition guide'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-muted transition-colors text-text-secondary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body - Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-500 text-sm font-bold animate-in slide-in-from-top-2">
                            <CheckCircle2 size={18} />
                            Diet plan template saved!
                        </div>
                    )}

                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Info size={16} className="text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Plan Information</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1 space-y-2">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Template Name</label>
                                <Input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Extreme Fat Loss V2"
                                    className="h-12 bg-muted/30 border-border rounded-xl font-bold"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1 space-y-2">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full h-12 bg-muted/30 border border-border rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full bg-muted/30 border border-border rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                placeholder="What is the goal of this plan?"
                            />
                        </div>
                    </div>

                    {/* Meals Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Utensils size={16} className="text-primary" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Meal Schedule</h3>
                            </div>
                            <Button
                                type="button"
                                onClick={handleAddMeal}
                                variant="outline"
                                className="h-8 px-3 rounded-xl border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-all"
                            >
                                <Plus size={14} className="mr-1" /> Add Meal
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {meals.map((meal, mealIdx) => (
                                <div key={mealIdx} className="bg-card/50 border border-border rounded-xl p-6 relative group/meal animate-in slide-in-from-bottom-2">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMeal(mealIdx)}
                                        className="absolute -right-2 -top-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover/meal:opacity-100 transition-all hover:scale-110 active:scale-95"
                                    >
                                        <Trash2 size={12} />
                                    </button>

                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="col-span-1 space-y-2">
                                            <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                <input
                                                    required
                                                    value={meal.time}
                                                    onChange={(e) => handleUpdateMeal(mealIdx, 'time', e.target.value)}
                                                    className="w-full h-10 pl-9 pr-3 bg-background border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-all"
                                                    placeholder="8:00 AM"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Meal Name</label>
                                            <input
                                                required
                                                value={meal.name}
                                                onChange={(e) => handleUpdateMeal(mealIdx, 'name', e.target.value)}
                                                className="w-full h-10 px-4 bg-background border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition-all"
                                                placeholder="e.g. Breakfast"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Food Items</label>
                                        </div>
                                        {meal.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className="flex gap-2">
                                                <div className="flex-1 relative group/item">
                                                    <input
                                                        value={item}
                                                        onChange={(e) => handleUpdateItem(mealIdx, itemIdx, e.target.value)}
                                                        className="w-full h-10 px-4 bg-muted/20 border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-primary transition-all pr-10"
                                                        placeholder="e.g. 100g Grilled Chicken"
                                                    />
                                                    {meal.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(mealIdx, itemIdx)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-rose-500 transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                {itemIdx === meal.items.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddItem(mealIdx)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all active:scale-95"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="space-y-2 pb-6">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">General Instructions (Optional)</label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            rows={3}
                            className="w-full bg-muted/30 border border-border rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            placeholder="e.g. Drink 4L water daily, Avoid sugar, etc."
                        />
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-6 md:p-8 border-t border-border bg-card flex gap-4 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl bg-muted border border-border font-black uppercase text-[10px] tracking-widest text-text-primary hover:bg-border transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-2 flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-glow hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {isEditing ? 'Update Template' : 'Create Template'}
                    </button>
                </div>
            </div>
        </div>
    );
};
