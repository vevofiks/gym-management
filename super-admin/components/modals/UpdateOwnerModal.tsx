"use client";
import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Mail, Phone, Shield } from 'lucide-react';
import { tenantService } from '../../services/tenantService';
import { Owner } from '../../types';

interface UpdateOwnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    owner: Owner | null;
}

export const UpdateOwnerModal: React.FC<UpdateOwnerModalProps> = ({ isOpen, onClose, onSuccess, owner }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        role: 'gym_owner',
        is_active: true
    });

    useEffect(() => {
        if (owner) {
            setFormData({
                name: owner.name,
                email: owner.email,
                phone_number: owner.phone_number,
                role: owner.role,
                is_active: owner.is_active
            });
        }
    }, [owner]);

    if (!isOpen || !owner) return null;

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePhone = (phone: string) => {
        return /^\+?[\d\s-]{10,}$/.test(phone);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.phone_number.trim()) {
            newErrors.phone_number = 'Phone number is required';
        } else if (!validatePhone(formData.phone_number)) {
            newErrors.phone_number = 'Invalid phone format';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Check uniqueness
            const uniquenessCheck = await tenantService.validateGymOwnerUniqueness({
                email: formData.email,
                phone_number: formData.phone_number,
                exclude_user_id: owner.id
            });

            if (!uniquenessCheck.is_unique) {
                // Map "phone" from backend to "phone_number" on frontend
                const mappedErrors: Record<string, string> = {};
                if (uniquenessCheck.errors.phone) mappedErrors.phone_number = uniquenessCheck.errors.phone;
                if (uniquenessCheck.errors.email) mappedErrors.email = uniquenessCheck.errors.email;

                setErrors(prev => ({ ...prev, ...mappedErrors }));
                setIsLoading(false);
                return;
            }

            await tenantService.updateGymOwner(owner.id, formData);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to update owner');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-[#151C2C] rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Owner Details</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    required
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.name
                                            ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                        }`}
                                />
                            </div>
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.email
                                            ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                        }`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    required
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.phone_number
                                            ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                        }`}
                                />
                            </div>
                            {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Shield className="h-4 w-4 text-gray-400" />
                                </div>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                >
                                    <option value="gym_owner">Gym Owner</option>
                                    <option value="staff">Staff</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Active</label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                            Update Owner
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
