'use client';

import { useState } from 'react';
import { PlanCreate, PlanUpdate } from '@/types/plan';
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
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., 5000"
                        disabled={isLoading}
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                    Features (optional)
                </label>
                <div className="space-y-2">
                    {features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => updateFeature(index, e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder={`Feature ${index + 1}`}
                                disabled={isLoading}
                            />
                            {features.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeFeature(index)}
                                    className="p-2 rounded-lg text-red-600 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                    disabled={isLoading}
                                >
                                    <X size={20} />
                                </button>
                            )}
                            {index === features.length - 1 && (
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="p-2 rounded-lg text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                                    disabled={isLoading}
                                >
                                    <Plus size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                />
                <label htmlFor="is_active" className="text-sm font-medium text-text-primary">
                    Active to use for registering members
                </label>
            </div>

            <div className="flex gap-3 justify-end pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg font-medium text-text-primary bg-background border border-border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : initialData?.id ? 'Update Plan' : 'Create Plan'}
                </button>
            </div>
        </form>
    );
}
