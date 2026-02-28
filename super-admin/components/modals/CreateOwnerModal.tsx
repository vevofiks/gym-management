"use client";
import React, { useState } from 'react';
import { X, Loader2, Building2, User, Lock, Mail, Phone, MapPin } from 'lucide-react';
import { tenantService } from '../../services/tenantService';

interface CreateOwnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateOwnerModal: React.FC<CreateOwnerModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form State
    const [formData, setFormData] = useState({
        // Gym Details
        gymName: '',
        address: '',
        googleMap: '',
        // Owner Details
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        // Extra Gym Details
        contact_email: '',
        contact_phone: '',
        city: '',
        state: '',
        zip_code: '',
    });

    if (!isOpen) return null;

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePhone = (phone: string) => {
        return /^\+?[\d\s-]{10,}$/.test(phone);
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.gymName.trim()) newErrors.gymName = 'Gym name is required';
        if (formData.contact_email && !validateEmail(formData.contact_email)) {
            newErrors.contact_email = 'Invalid email format';
        }
        if (formData.contact_phone && !validatePhone(formData.contact_phone)) {
            newErrors.contact_phone = 'Invalid phone format';
        }
        if (formData.googleMap && !/^https?:\/\/.*/.test(formData.googleMap)) {
            newErrors.googleMap = 'Invalid URL format';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (!/^[a-zA-Z0-9_]{3,}$/.test(formData.username)) {
            newErrors.username = 'Username must be at least 3 characters and contain only letters, numbers, and underscores';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Invalid phone format';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8 || !/[a-zA-Z]/.test(formData.password) || !/\d/.test(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters with letters and numbers';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep2()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Check uniqueness first before proceeding
            const uniquenessCheck = await tenantService.validateGymOwnerUniqueness({
                username: formData.username,
                email: formData.email,
                phone_number: formData.phone
            });

            if (!uniquenessCheck.is_unique) {
                setErrors(prev => ({ ...prev, ...uniquenessCheck.errors }));
                setIsLoading(false);
                return;
            }

            // 1. Create Tenant (automatically initiates 7-day trial in backend)
            const tenant = await tenantService.createTenant({
                name: formData.gymName,
                address: formData.address,
                google_map: formData.googleMap,
                contact_email: formData.contact_email,
                contact_phone: formData.contact_phone,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zip_code
            });

            // 2. Create Gym Owner for this tenant
            await tenantService.createGymOwner(tenant.id, {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                phone_number: formData.phone,
                password: formData.password,
                role: 'gym_owner'
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to create owner');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white dark:bg-[#151C2C] rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Gym & Owner</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Step {step} of 2: {step === 1 ? 'Gymnasium Details' : 'Owner Account Details'}</p>
                    </div>
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

                    {step === 1 ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gymnasium Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Building2 className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            name="gymName"
                                            value={formData.gymName}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Iron Paradise Gym"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.gymName
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                                }`}
                                        />
                                    </div>
                                    {errors.gymName && <p className="text-xs text-red-500 mt-1">{errors.gymName}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Gym location"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.address
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                                }`}
                                        />
                                    </div>
                                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gym Contact Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                name="contact_email"
                                                value={formData.contact_email}
                                                onChange={handleInputChange}
                                                placeholder="gym@example.com"
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.contact_email
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                                    }`}
                                            />
                                        </div>
                                        {errors.contact_email && <p className="text-xs text-red-500 mt-1">{errors.contact_email}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gym Contact Phone</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="contact_phone"
                                                value={formData.contact_phone}
                                                onChange={handleInputChange}
                                                placeholder="+91..."
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.contact_phone
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                                    }`}
                                            />
                                        </div>
                                        {errors.contact_phone && <p className="text-xs text-red-500 mt-1">{errors.contact_phone}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="City"
                                            className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.city
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                                }`}
                                        />
                                        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="State"
                                            className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.state
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                                }`}
                                        />
                                        {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Zip Code</label>
                                        <input
                                            type="text"
                                            name="zip_code"
                                            value={formData.zip_code}
                                            onChange={handleInputChange}
                                            placeholder="Zip"
                                            className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.zip_code
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                                }`}
                                        />
                                        {errors.zip_code && <p className="text-xs text-red-500 mt-1">{errors.zip_code}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Maps URL (Optional)</label>
                                    <input
                                        type="url"
                                        name="googleMap"
                                        value={formData.googleMap}
                                        onChange={handleInputChange}
                                        placeholder="https://maps.google.com/..."
                                        className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.googleMap
                                            ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                            }`}
                                    />
                                    {errors.googleMap && <p className="text-xs text-red-500 mt-1">{errors.googleMap}</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
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
                                            placeholder="John Doe"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.name
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                                }`}
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                    <input
                                        required
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="johndoe_gym"
                                        className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.username
                                            ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                            }`}
                                    />
                                    {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
                                </div>

                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
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
                                            placeholder="john@example.com"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.email
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                                }`}
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                </div>

                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            required
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+91..."
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.phone
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                                }`}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Lock className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            required
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="••••••••"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all ${errors.password
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                                                }`}
                                        />
                                    </div>
                                    {errors.password ? (
                                        <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                                    ) : (
                                        <p className="text-[10px] text-gray-500 mt-1">Min. 8 characters with letters and numbers.</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                    ✨ A 7-day <strong>Pro Trial</strong> pack will be automatically active for this gym upon creation.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => step === 1 ? onClose() : setStep(1)}
                            className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-lg"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>

                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="px-8 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/30 transition-all"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Creating Account...
                                    </>
                                ) : 'Create Gym & Owner'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
