"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    Mail,
    Phone,
    Lock,
    Shield,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserResponse } from '@/types';
import { StaffCreate, StaffUpdate, validateStaffUniqueness } from '@/services/staffService';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface StaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    staff?: UserResponse | null;
    isSubmitting: boolean;
}

export const StaffModal = ({
    isOpen,
    onClose,
    onSubmit,
    staff,
    isSubmitting
}: StaffModalProps) => {
    const [formData, setFormData] = useState<any>({
        name: '',
        username: '',
        email: '',
        phone_number: '',
        password: '',
        role: 'gym_staff',
        is_active: true
    });

    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (staff) {
            setFormData({
                name: staff.name,
                username: staff.username,
                email: staff.email,
                phone_number: staff.phone_number,
                password: '', // Don't show password for editing
                role: staff.role,
                is_active: staff.is_active
            });
        } else {
            setFormData({
                name: '',
                username: '',
                email: '',
                phone_number: '',
                password: '',
                role: 'gym_staff',
                is_active: true
            });
        }
        setTouchedFields({});
        setValidationErrors({});
        setIsValidating({});
    }, [staff, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev: any) => ({ ...prev, [name]: val }));

        // Clear error when user changes value
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));

        if (!value) return;

        // Perform uniqueness check for relevant fields
        if (['username', 'email', 'phone_number'].includes(name)) {
            // Check if it's different from the original value when editing
            if (staff && staff[name as keyof UserResponse] === value) {
                return;
            }

            try {
                setIsValidating(prev => ({ ...prev, [name]: true }));
                const checkData: any = {};
                checkData[name === 'phone_number' ? 'phone_number' : name] = value;
                if (staff) checkData.exclude_user_id = staff.id;

                const result = await validateStaffUniqueness(checkData);
                if (!result.is_unique) {
                    setValidationErrors(prev => ({
                        ...prev,
                        [name]: result.errors[name === 'phone_number' ? 'phone' : name] || 'Already exists'
                    }));
                }
            } catch (error) {
                console.error('Validation failed:', error);
            } finally {
                setIsValidating(prev => ({ ...prev, [name]: false }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!staff && !formData.password) {
            toast.error('Password is required for new staff');
            return;
        }

        // Integrity check: don't submit if we have validation errors
        if (Object.keys(validationErrors).length > 0) {
            toast.error('Please fix validation errors first');
            return;
        }

        await onSubmit(formData);
    };

    const getFieldClass = (name: string) => {
        const isInvalid = touchedFields[name] && validationErrors[name];
        const isValidated = touchedFields[name] && !validationErrors[name] && !isValidating[name] && formData[name];

        return cn(
            "w-full bg-background border rounded-xl py-3 pl-11 pr-4 text-sm transition-all outline-none",
            isInvalid ? "border-red-500 ring-1 ring-red-500/20" : "border-border focus:ring-2 focus:ring-primary/20 focus:border-primary",
            isValidated && name !== 'password' ? "border-green-500/50" : ""
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">
                            {staff ? 'Edit Staff Member' : 'Add New Staff'}
                        </h2>
                        <p className="text-sm text-text-secondary">
                            {staff ? 'Update staff account details' : 'Create a new staff account for your gym'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-background rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase px-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={getFieldClass('name')}
                                    placeholder="e.g. Rahul Sharma"
                                />
                            </div>
                        </div>

                        {/* Username - Only for creation */}
                        {!staff && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase px-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors flex items-center justify-center w-5 h-5">
                                        <span className="font-black text-sm leading-none mt-0.5">@</span>
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={getFieldClass('username')}
                                        placeholder="rahul_gym"
                                    />
                                    {isValidating.username && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 size={14} className="animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                                {touchedFields.username && validationErrors.username && (
                                    <p className="text-[10px] text-red-500 font-bold px-1 mt-0.5">{validationErrors.username}</p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase px-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={getFieldClass('email')}
                                        placeholder="rahul@example.com"
                                    />
                                    {isValidating.email && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 size={14} className="animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                                {touchedFields.email && validationErrors.email && (
                                    <p className="text-[10px] text-red-500 font-bold px-1 mt-0.5">{validationErrors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase px-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        required
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={getFieldClass('phone_number')}
                                        placeholder="+91 9876543210"
                                    />
                                    {isValidating.phone_number && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 size={14} className="animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                                {touchedFields.phone_number && validationErrors.phone_number && (
                                    <p className="text-[10px] text-red-500 font-bold px-1 mt-0.5">{validationErrors.phone_number}</p>
                                )}
                            </div>
                        </div>

                        {/* Password */}
                        {!staff && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase px-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required={!staff}
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={getFieldClass('password')}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <p className="text-[10px] text-text-secondary mt-1 px-1 italic">
                                    Must be at least 8 characters with letters and numbers.
                                </p>
                            </div>
                        )}

                        {/* Role selection - for future expansion, currently fixed to gym_staff */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase px-1">Role</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                    <Shield size={18} />
                                </div>
                                <select
                                    disabled
                                    className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-sm appearance-none opacity-70"
                                    value="gym_staff"
                                >
                                    <option value="gym_staff">Gym Staff</option>
                                </select>
                            </div>
                        </div>

                        {/* Active Status */}
                        {staff && (
                            <div className="flex items-center gap-2 px-1 py-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="h-5 w-5 rounded-xl border-border text-primary focus:ring-primary/20 transition-all"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-text-primary select-none">
                                    Active Account
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 bg-background border border-border text-text-primary hover:bg-border transition-all h-12 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || Object.keys(isValidating).some(k => isValidating[k])}
                            className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-soft h-12 rounded-xl font-bold"
                        >
                            {isSubmitting ? (
                                <Loader2 size={18} className="animate-spin mr-2" />
                            ) : null}
                            {staff ? 'Save Changes' : 'Create Staff Account'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
