'use client';

import { useState, useEffect } from 'react';
import { MemberCreate, MemberUpdate, MemberStatus, MembershipPlan } from '@/types/index';
import { getPlans } from '@/services/planService';
import { User, Activity, Phone, Camera as CameraIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { CameraCapture } from './CameraCapture';

interface MemberFormProps {
    initialData?: MemberUpdate & { id?: number };
    onSubmit: (data: MemberCreate | MemberUpdate) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function MemberForm({ initialData, onSubmit, onCancel, isLoading = false }: MemberFormProps) {
    const [formData, setFormData] = useState({
        first_name: initialData?.first_name || '',
        last_name: initialData?.last_name || '',
        phone_number: (() => {
            const phone = initialData?.phone_number || '';
            return (phone.startsWith('+91') && phone.length === 13) ? phone.substring(3) : phone;
        })(),
        email: initialData?.email || '',
        joining_date: initialData ? '' : new Date().toISOString().split('T')[0],
        plan_id: initialData?.plan_id?.toString() || '',
        status: initialData?.status || MemberStatus.ACTIVE,
        before_photo_url: initialData?.before_photo_url || '',
        after_photo_url: initialData?.after_photo_url || '',
        // Health and Personal
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        weight: (initialData as any)?.weight?.toString() || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        height: (initialData as any)?.height?.toString() || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        blood_group: (initialData as any)?.blood_group || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        medical_conditions: (initialData as any)?.medical_conditions || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        emergency_contact_name: (initialData as any)?.emergency_contact_name || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        emergency_contact_phone: (() => {
            const phone = (initialData as any)?.emergency_contact_phone || '';
            return (phone.startsWith('+91') && phone.length === 13) ? phone.substring(3) : phone;
        })(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        date_of_birth: (initialData as any)?.date_of_birth || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gender: (initialData as any)?.gender || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        address: (initialData as any)?.address || '',
    });

    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [beforePhotoBlob, setBeforePhotoBlob] = useState<Blob | null>(null);
    const [afterPhotoBlob, setAfterPhotoBlob] = useState<Blob | null>(null);
    const [cameraTarget, setCameraTarget] = useState<'before' | 'after' | null>(null);

    // Fetch plans for dropdown
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await getPlans(1, 100, true);
                setPlans(response.plans);
            } catch (error) {
                console.error('Failed to fetch plans:', error);
            }
        };
        fetchPlans();
    }, []);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        }

        if (!formData.phone_number.trim()) {
            newErrors.phone_number = 'Phone number is required';
        } else if (formData.phone_number.startsWith('+')) {
            if (!/^\+\d{7,15}$/.test(formData.phone_number.replace(/\s/g, ''))) {
                newErrors.phone_number = 'Invalid international format (e.g. +91...)';
            }
        } else if (!/^[0-9]{10}$/.test(formData.phone_number.replace(/\D/g, ''))) {
            newErrors.phone_number = 'Phone number must be 10 digits';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!initialData && !formData.joining_date) {
            newErrors.joining_date = 'Joining date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        let finalBeforePhotoUrl = formData.before_photo_url;
        let finalAfterPhotoUrl = formData.after_photo_url;

        try {
            const { uploadFromCamera } = await import('@/services/cloudinaryService');

            // Upload Before Photo if new
            if (beforePhotoBlob) {
                finalBeforePhotoUrl = await uploadFromCamera(beforePhotoBlob);
            }

            // Upload After Photo if new
            if (afterPhotoBlob) {
                finalAfterPhotoUrl = await uploadFromCamera(afterPhotoBlob);
            }
        } catch (error) {
            console.error('Failed to upload photo(s):', error);
            toast.error('Failed to upload photos, but continuing with other changes');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const submitData: any = {
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            phone_number: formData.phone_number.trim(),
            email: formData.email.trim() || null,
            weight: formData.weight ? parseFloat(formData.weight) : undefined,
            height: formData.height ? parseFloat(formData.height) : undefined,
            blood_group: formData.blood_group || undefined,
            medical_conditions: formData.medical_conditions || undefined,
            emergency_contact_name: formData.emergency_contact_name || undefined,
            emergency_contact_phone: formData.emergency_contact_phone || undefined,
            date_of_birth: formData.date_of_birth || undefined,
            gender: formData.gender || undefined,
            address: formData.address || undefined,
            before_photo_url: finalBeforePhotoUrl || undefined,
            after_photo_url: finalAfterPhotoUrl || undefined,
        };

        if (initialData) {
            // Update mode
            if (formData.plan_id) submitData.plan_id = parseInt(formData.plan_id);
            if (formData.status) submitData.status = formData.status;
        } else {
            // Create mode
            submitData.joining_date = formData.joining_date;
            if (formData.plan_id) submitData.plan_id = parseInt(formData.plan_id);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await onSubmit(submitData as any);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section: Basic Details */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <User size={18} className="text-primary" />
                    <h3 className="font-bold text-text-primary uppercase text-xs tracking-wider">Basic Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="John"
                            disabled={isLoading}
                        />
                        {errors.first_name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.first_name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Doe"
                            disabled={isLoading}
                        />
                        {errors.last_name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.last_name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="9876543210"
                            disabled={isLoading}
                        />
                        {errors.phone_number && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.phone_number}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="john.doe@example.com"
                            disabled={isLoading}
                        />
                        {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.email}</p>}
                    </div>

                    {!initialData && (
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                                Joining Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.joining_date}
                                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                disabled={isLoading}
                            />
                            {errors.joining_date && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.joining_date}</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Membership Plan</label>
                        <select
                            value={formData.plan_id}
                            onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                            className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
                            disabled={isLoading}
                        >
                            <option value="">Select a plan</option>
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name} - ₹{plan.price}
                                </option>
                            ))}
                        </select>
                    </div>

                    {initialData && (
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberStatus })}
                                className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
                                disabled={isLoading}
                            >
                                <option value={MemberStatus.ACTIVE}>Active</option>
                                <option value={MemberStatus.EXPIRED}>Expired</option>
                                <option value={MemberStatus.INACTIVE}>Inactive</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Section: Health & Personal */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Activity size={18} className="text-primary" />
                    <h3 className="font-bold text-text-primary uppercase text-xs tracking-wider">Health & Personal</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Weight (kg)</label>
                        <input
                            type="number"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="70"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Height (cm)</label>
                        <input
                            type="number"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="175"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Blood Group</label>
                        <select
                            value={formData.blood_group}
                            onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                            className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            disabled={isLoading}
                        >
                            <option value="">Select</option>
                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                <option key={bg} value={bg}>{bg}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Gender</label>
                        <div className="flex gap-2">
                            {['Male', 'Female', 'Other'].map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, gender: g })}
                                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${formData.gender === g
                                        ? 'bg-primary border-primary text-white shadow-glow'
                                        : 'bg-background border-border text-text-secondary hover:border-primary/50'
                                        }`}
                                    disabled={isLoading}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Date of Birth</label>
                        <input
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                            className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Address</label>
                    <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[80px]"
                        placeholder="Full street address..."
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Section: Emergency & Medical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                        <Phone size={18} className="text-primary" />
                        <h3 className="font-bold text-text-primary uppercase text-xs tracking-wider">Emergency Contact</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Contact Name</label>
                            <input
                                type="text"
                                value={formData.emergency_contact_name}
                                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Contact person"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Contact Phone</label>
                            <input
                                type="tel"
                                value={formData.emergency_contact_phone}
                                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Phone number"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                        <Activity size={18} className="text-primary" />
                        <h3 className="font-bold text-text-primary uppercase text-xs tracking-wider">Medical Info</h3>
                    </div>
                    <textarea
                        value={formData.medical_conditions}
                        onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                        className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[115px]"
                        placeholder="Any injuries or medical conditions..."
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Section: Transformation Photos */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <CameraIcon size={18} className="text-primary" />
                    <h3 className="font-bold text-text-primary uppercase text-xs tracking-wider">Transformation Photos</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Before Photo */}
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative group shrink-0">
                            {beforePhotoBlob ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={URL.createObjectURL(beforePhotoBlob)} alt="Before Captured" className="w-full h-full object-cover" />
                            ) : formData.before_photo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={formData.before_photo_url} alt="Before" className="w-full h-full object-cover" />
                            ) : (
                                <CameraIcon className="text-text-secondary opacity-50" size={24} />
                            )}
                            <button
                                type="button"
                                onClick={() => setCameraTarget('before')}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="text-white font-bold text-[8px] bg-primary px-2 py-1 rounded uppercase">
                                    Take Before
                                </span>
                            </button>
                        </div>
                        <div className="text-xs text-text-secondary">
                            <p className="font-bold text-text-primary mb-0.5 uppercase tracking-tighter">Before Photo</p>
                            <p className="leading-tight mb-1">Initial state when joining.</p>
                            {beforePhotoBlob && (
                                <button
                                    type="button"
                                    onClick={() => setBeforePhotoBlob(null)}
                                    className="text-primary font-bold hover:underline"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {/* After Photo */}
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative group shrink-0">
                            {afterPhotoBlob ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={URL.createObjectURL(afterPhotoBlob)} alt="After Captured" className="w-full h-full object-cover" />
                            ) : formData.after_photo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={formData.after_photo_url} alt="After" className="w-full h-full object-cover" />
                            ) : (
                                <CameraIcon className="text-text-secondary opacity-50" size={24} />
                            )}
                            <button
                                type="button"
                                onClick={() => setCameraTarget('after')}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="text-white font-bold text-[8px] bg-primary px-2 py-1 rounded uppercase">
                                    Take After
                                </span>
                            </button>
                        </div>
                        <div className="text-xs text-text-secondary">
                            <p className="font-bold text-text-primary mb-0.5 uppercase tracking-tighter">After Photo</p>
                            <p className="leading-tight mb-1">Current state or progress.</p>
                            {afterPhotoBlob && (
                                <button
                                    type="button"
                                    onClick={() => setAfterPhotoBlob(null)}
                                    className="text-primary font-bold hover:underline"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {cameraTarget && (
                    <CameraCapture
                        onCapture={(blob: Blob) => {
                            if (cameraTarget === 'before') setBeforePhotoBlob(blob);
                            else setAfterPhotoBlob(blob);
                            setCameraTarget(null);
                        }}
                        onCancel={() => setCameraTarget(null)}
                    />
                )}
            </div>

            <div className="flex gap-3 justify-end pt-8 border-t border-border">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-text-primary bg-background border border-border hover:bg-muted transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-2.5 rounded-xl font-bold text-sm bg-primary text-white shadow-glow hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving...</span>
                        </div>
                    ) : (
                        initialData?.id ? 'Update Member' : 'Create Member'
                    )}
                </button>
            </div>
        </form>
    );
}
