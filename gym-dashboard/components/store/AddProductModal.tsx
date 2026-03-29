'use client';

import { useState, useEffect } from 'react';
import { X, Package, DollarSign, Image as ImageIcon, Plus, Save, RefreshCw } from 'lucide-react';
import { StoreProduct, StoreProductCreate } from '@/types';
import { createProduct, updateProduct, uploadImage } from '@/services/storeService';
import toast from 'react-hot-toast';
import { cn, getPublicUrl } from '@/lib/utils';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productToEdit?: StoreProduct | null;
}

export function AddProductModal({ isOpen, onClose, onSuccess, productToEdit }: AddProductModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<StoreProductCreate>({
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        image_url: ''
    });

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                description: productToEdit.description || '',
                price: productToEdit.price,
                quantity: productToEdit.quantity,
                image_url: productToEdit.image_url || ''
            });
            setImagePreview(productToEdit.image_url || null);
        } else {
            setFormData({
                name: '',
                description: '',
                price: 0,
                quantity: 0,
                image_url: ''
            });
            setImagePreview(null);
        }
        setSelectedFile(null);
    }, [productToEdit, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.price <= 0) {
            toast.error('Price must be greater than 0');
            return;
        }

        try {
            setIsLoading(true);
            let finalImageUrl = formData.image_url;

            // Handle image upload if a new file is selected
            if (selectedFile) {
                setIsUploading(true);
                try {
                    const uploadResult = await uploadImage(selectedFile);
                    finalImageUrl = uploadResult.url;
                } catch (error) {
                    toast.error('Failed to upload image');
                    setIsLoading(false);
                    setIsUploading(false);
                    return;
                }
                setIsUploading(false);
            }

            const submissionData = { ...formData, image_url: finalImageUrl };

            if (productToEdit) {
                await updateProduct(productToEdit.id, submissionData);
                toast.success('Product updated successfully');
            } else {
                await createProduct(submissionData);
                toast.success('Product added successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save product:', error);
            toast.error('Failed to save product');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
                    <h2 className="text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                        <Package className="text-primary" />
                        {productToEdit ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-text-secondary transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        {/* Image Upload Section */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Product Image</label>
                            <div className="relative flex flex-col items-center gap-4 p-4 border-2 border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-all group">
                                {imagePreview ? (
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/5">
                                        <img
                                            src={getPublicUrl(imagePreview) || ''}
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setSelectedFile(null);
                                                setFormData({ ...formData, image_url: '' });
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-4">
                                        <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                                            <ImageIcon size={24} />
                                        </div>
                                        <p className="text-xs font-bold text-text-primary">Click to upload image</p>
                                        <p className="text-[10px] text-text-secondary mt-1">JPG, PNG or WebP (Max 5MB)</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Product Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Whey Protein, Gym Track Suit"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium outline-none focus:border-primary transition-all shadow-inner-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Description</label>
                            <textarea
                                placeholder="Details about the product..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium outline-none focus:border-primary transition-all shadow-inner-sm min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Price (₹)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <DollarSign size={16} className="text-text-secondary" />
                                    </div>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-black outline-none focus:border-primary transition-all shadow-inner-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Initial Quantity</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Package size={16} className="text-text-secondary" />
                                    </div>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0"
                                        value={formData.quantity || ''}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-black outline-none focus:border-primary transition-all shadow-inner-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-border rounded-xl text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isLoading}
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-glow hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95"
                        >
                            {isLoading ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : (
                                productToEdit ? <Save size={18} /> : <Plus size={18} />
                            )}
                            {productToEdit ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
