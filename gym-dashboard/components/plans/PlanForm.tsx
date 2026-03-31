'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { PlanCreate, PlanUpdate } from '@/types';
import { Plus, X } from 'lucide-react';

interface PlanFormProps {
    initialData?: PlanUpdate & { id?: number };
    onSubmit: (data: PlanCreate | PlanUpdate) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function PlanForm({ initialData, onSubmit, onCancel, isLoading = false }: PlanFormProps) {
    // Parse initial features from array or string
    const parseFeatures = (featuresInput?: string[] | null): string[] => {
        if (!featuresInput) return [''];
        if (Array.isArray(featuresInput)) return featuresInput.length > 0 ? featuresInput : [''];
        return [''];
    };

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        duration_days: initialData?.duration_days?.toString() || '',
        price: initialData?.price?.toString() || '',
        is_active: initialData?.is_active ?? true,
    });

    const [features, setFeatures] = useState<string[]>(
        parseFeatures(initialData?.features)
    );

    const lastInputRef = useRef<HTMLInputElement>(null);
    const [shouldFocus, setShouldFocus] = useState(false);

    useEffect(() => {
        if (shouldFocus && lastInputRef.current) {
            lastInputRef.current.focus();
            setShouldFocus(false);
        }
    }, [features.length, shouldFocus]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Plan name is required';
        }

        if (!formData.duration_days.trim()) {
            newErrors.duration_days = 'Duration is required';
        } else if (!/^\d+$/.test(formData.duration_days)) {
            newErrors.duration_days = 'Duration must be a valid number';
        } else if (parseInt(formData.duration_days) <= 0) {
            newErrors.duration_days = 'Duration must be greater than 0';
        }

        if (!formData.price.trim()) {
            newErrors.price = 'Price is required';
        } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
            newErrors.price = 'Price must be a valid number';
        } else if (parseFloat(formData.price) < 0) {
            newErrors.price = 'Price cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        // Filter out empty features and send as array
        const validFeatures = features.filter(f => f.trim() !== '');

        await onSubmit({
            ...formData,
            duration_days: parseInt(formData.duration_days),
            price: parseFloat(formData.price),
            features: validFeatures.length > 0 ? validFeatures : undefined,
        });
    };

    const addFeature = () => {
        setFeatures([...features, '']);
        setShouldFocus(true);
    };

    const removeFeature = (index: number) => {
        if (features.length > 1) {
            setFeatures(features.filter((_, i) => i !== index));
        }
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                    Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Weight Loss Plan"
                    disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                    placeholder="Brief description of the plan..."
                    disabled={isLoading}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Duration (days) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.duration_days}
                        onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., 30"
                        disabled={isLoading}
                    />
                    {errors.duration_days && <p className="text-red-500 text-sm mt-1">{errors.duration_days}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., 5000"
                        disabled={isLoading}
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
            </div>


            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50 transition-all hover:bg-muted/50">
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-black uppercase tracking-widest text-text-primary">Plan Status</span>
                    <p className="text-[10px] text-text-secondary font-medium">
                        {formData.is_active 
                            ? "Active plans are visible to members" 
                            : "Inactive plans are hidden from the public list"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-colors",
                        formData.is_active ? "text-primary" : "text-text-secondary"
                    )}>
                        {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                        checked={formData.is_active}
                        onChange={(checked: boolean) => setFormData({ ...formData, is_active: checked })}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                    Features (optional)
                </label>
                <div className="space-y-3">
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            className="group flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex-1 relative">
                                <input
                                    ref={index === features.length - 1 ? lastInputRef : null}
                                    type="text"
                                    value={feature}
                                    onChange={(e) => updateFeature(index, e.target.value)}
                                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-border bg-background/50 text-sm font-medium text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-secondary/30"
                                    placeholder={`e.g., Free Diet Plan ${index + 1}`}
                                    disabled={isLoading}
                                />
                                {features.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-text-secondary/40 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-none border-none bg-transparent outline-none"
                                        disabled={isLoading}
                                        title="Remove feature"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addFeature}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border text-text-secondary hover:text-primary hover:border-primary/50 hover:bg-card/80 transition-all w-full justify-center group shadow-soft"
                    >
                        <div className="p-1 bg-muted group-hover:bg-primary/10 rounded-lg transition-colors">
                            <Plus size={14} strokeWidth={3} className="text-text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Add New Feature</span>
                    </button>
                </div>
            </div>

            <div className="flex gap-4 justify-end pt-8 border-t border-border/50 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-text-secondary bg-transparent hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-white shadow-glow hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 min-w-[140px]"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                             <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             <span>Wait...</span>
                        </div>
                    ) : initialData?.id ? 'Update Plan' : 'Create Plan'}
                </button>
            </div>
        </form>
    );
}
