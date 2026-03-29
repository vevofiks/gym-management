'use client';

import React, { useState, useEffect } from 'react';
import { User, Activity, Camera, CreditCard, ChevronRight, ChevronLeft, Check, X, Loader2, Upload } from 'lucide-react';
import { MemberCreate, MembershipPlan, MemberResponse, MemberStatus } from '@/types/index';
import { getPlans } from '@/services/planService';
import { createMember } from '@/services/memberService';
import { getMyTenant } from '@/services/tenantService';
import { CameraCapture } from './CameraCapture';
import { PaymentStep } from './PaymentStep';
import { uploadFromCamera } from '@/services/cloudinaryService';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { formatDate, parseInputDate } from '@/lib/utils';
import { format } from 'date-fns';
import { useDashboardStore } from '@/store/DashboardStore';

interface MemberOnboardingWizardProps {
    onComplete: (member: MemberResponse) => void;
    onCancel: () => void;
}

const STEPS = [
    { id: 'basic', title: 'Basic Details', icon: User },
    { id: 'health', title: 'Health info', icon: Activity },
    { id: 'photo', title: 'Photo Capture', icon: Camera },
    { id: 'payment', title: 'Payment', icon: CreditCard },
];

export const MemberOnboardingWizard: React.FC<MemberOnboardingWizardProps> = ({ onComplete, onCancel }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    // Initial value for joining date in DD/MM/YY
    const today = new Date();
    const initialJoiningDateFormatted = format(today, "dd/MM/yy");

    const [joiningDateInput, setJoiningDateInput] = useState(initialJoiningDateFormatted);
    const [dobInput, setDobInput] = useState('');

    // Form States
    const [basicData, setBasicData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        joining_date: new Date().toISOString().split('T')[0],
        plan_id: '',
    });

    const [healthData, setHealthData] = useState({
        weight: '',
        height: '',
        blood_group: '',
        medical_conditions: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        date_of_birth: '',
        gender: '',
        address: '',
    });

    const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    // Validation State
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});

    const handleBlur = async (field: string) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));

        // Uniqueness check for email and phone
        if (field === 'email' || field === 'phone_number') {
            const value = basicData[field as keyof typeof basicData];
            if (!value) return;

            try {
                setIsValidating(prev => ({ ...prev, [field]: true }));
                const checkData: any = {};
                checkData[field] = value;

                const { validateMemberUniqueness } = await import('@/services/memberService');
                const result = await validateMemberUniqueness(checkData);

                if (!result.is_unique) {
                    setValidationErrors(prev => ({
                        ...prev,
                        [field]: result.errors[field] || 'Already exists'
                    }));
                } else {
                    setValidationErrors(prev => {
                        const next = { ...prev };
                        delete next[field];
                        return next;
                    });
                }
            } catch (error) {
                console.error('Validation failed:', error);
            } finally {
                setIsValidating(prev => ({ ...prev, [field]: false }));
            }
        }
    };

    const isInvalid = (field: string, value: any) => {
        if (validationErrors[field]) return true;
        if (!touchedFields[field]) return false;
        if (field === 'first_name' || field === 'last_name') return value.trim().length < 2;
        if (field === 'phone_number') return value.trim().length < 10;
        if (field === 'plan_id') return !value;
        if (field === 'joining_date') return value.length !== 8;
        if (field === 'gender') return !value;
        if (field === 'date_of_birth') return value.length !== 8;
        return false;
    };

    const getFieldClass = (field: string, value: any, baseClass: string = "w-full rounded-xl bg-card border px-4 py-3 text-sm focus:ring-1 outline-none transition-all") => {
        const invalid = isInvalid(field, value);
        const validated = touchedFields[field] && !invalid && !isValidating[field] && value;

        return cn(
            baseClass,
            invalid
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
                : "border-border focus:border-primary focus:ring-primary/20",
            validated && "border-green-500/50"
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [plansRes, tenantRes] = await Promise.all([
                    getPlans(1, 100, true),
                    getMyTenant()
                ]);
                setPlans(plansRes.plans);
                setQrCodeUrl(tenantRes.payment_qr_code_url ?? null);
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
                toast.error('Failed to load plans or tenant settings');
            }
        };
        fetchData();
    }, []);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleDateInputChange = (value: string, setter: (val: string) => void) => {
        // Simple masking: DD/MM/YY
        let cleaned = value.replace(/\D/g, '');
        if (cleaned.length > 6) cleaned = cleaned.slice(0, 6);

        let formatted = '';
        if (cleaned.length > 0) {
            formatted = cleaned.slice(0, 2);
            if (cleaned.length > 2) {
                formatted += '/' + cleaned.slice(2, 4);
                if (cleaned.length > 4) {
                    formatted += '/' + cleaned.slice(4, 6);
                }
            }
        }
        setter(formatted);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoBlob(file);
            setPreviewUrl(URL.createObjectURL(file));
            setPhotoUrl(null); // Reset previously uploaded URL
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async (paymentData: any) => {
        if (Object.keys(validationErrors).length > 0) {
            toast.error('Please fix validation errors first');
            return;
        }

        setIsLoading(true);
        try {
            let finalPhotoUrl = photoUrl;

            // 1. Upload photo if we have a blob but no URL yet
            if (photoBlob && !finalPhotoUrl) {
                finalPhotoUrl = await uploadFromCamera(photoBlob);
            }

            // 2. Prepare member create data
            const parsedJoiningDate = parseInputDate(joiningDateInput);
            const parsedDob = parseInputDate(dobInput);

            if (!parsedJoiningDate) {
                toast.error('Invalid joining date format. Use DD/MM/YY');
                setIsLoading(false);
                return;
            }

            if (!parsedDob) {
                toast.error('Invalid date of birth format. Use DD/MM/YY');
                setIsLoading(false);
                return;
            }

            const memberData: MemberCreate = {
                ...basicData,
                joining_date: parsedJoiningDate,
                plan_id: parseInt(basicData.plan_id),
                ...healthData,
                date_of_birth: parsedDob,
                weight: healthData.weight ? parseFloat(healthData.weight) : undefined,
                height: healthData.height ? parseFloat(healthData.height) : undefined,
                before_photo_url: finalPhotoUrl || undefined,
                // Payment info
                payment_method: paymentData.method,
                payment_amount: paymentData.amount,
                joining_fee: paymentData.joiningFee,
                discount: paymentData.discount,
                transaction_id: paymentData.transactionId,
                payment_screenshot_url: paymentData.screenshotUrl,
                payment_notes: paymentData.notes,
            };

            // 3. Create member
            const response = await createMember(memberData);

            // 4. Refresh global stats
            useDashboardStore.getState().fetchStats();

            toast.success('Member registered successfully!');
            onComplete(response);
        } catch (error: any) {
            console.error('Registration failed:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to register member';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                                    First Name <span className="text-primary">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={basicData.first_name}
                                    onChange={(e) => setBasicData({ ...basicData, first_name: e.target.value })}
                                    onBlur={() => handleBlur('first_name')}
                                    className={getFieldClass('first_name', basicData.first_name)}
                                    placeholder="Enter first name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                                    Last Name <span className="text-primary">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={basicData.last_name}
                                    onChange={(e) => setBasicData({ ...basicData, last_name: e.target.value })}
                                    onBlur={() => handleBlur('last_name')}
                                    className={getFieldClass('last_name', basicData.last_name)}
                                    placeholder="Enter last name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                                    Phone Number <span className="text-primary">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={basicData.phone_number}
                                        onChange={(e) => setBasicData({ ...basicData, phone_number: e.target.value })}
                                        onBlur={() => handleBlur('phone_number')}
                                        className={getFieldClass('phone_number', basicData.phone_number, "w-full rounded-xl bg-card border px-4 py-3 text-sm focus:ring-1 outline-none font-bold transition-all")}
                                        placeholder="+91 98765-43210"
                                    />
                                    {isValidating.phone_number && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 size={16} className="animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                                {touchedFields.phone_number && validationErrors.phone_number && (
                                    <p className="text-[10px] text-red-500 font-bold px-1 mt-1">{validationErrors.phone_number}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Email <span className="text-xs font-medium lowercase opacity-60">(Optional)</span></label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={basicData.email}
                                        onChange={(e) => setBasicData({ ...basicData, email: e.target.value })}
                                        onBlur={() => handleBlur('email')}
                                        className={getFieldClass('email', basicData.email)}
                                        placeholder="Enter email address"
                                    />
                                    {isValidating.email && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 size={16} className="animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                                {touchedFields.email && validationErrors.email && (
                                    <p className="text-[10px] text-red-500 font-bold px-1 mt-1">{validationErrors.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                                    Joining Date <span className="text-primary">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={joiningDateInput}
                                    onChange={(e) => handleDateInputChange(e.target.value, setJoiningDateInput)}
                                    onBlur={() => handleBlur('joining_date')}
                                    placeholder="DD/MM/YY"
                                    className={getFieldClass('joining_date', joiningDateInput, "w-full rounded-xl bg-card border px-4 py-3 text-sm focus:ring-1 outline-none font-bold transition-all")}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                                    Select Plan <span className="text-primary">*</span>
                                </label>
                                <select
                                    value={basicData.plan_id}
                                    onChange={(e) => setBasicData({ ...basicData, plan_id: e.target.value })}
                                    onBlur={() => handleBlur('plan_id')}
                                    className={getFieldClass('plan_id', basicData.plan_id, "w-full rounded-xl bg-card border px-4 py-3 text-sm focus:ring-1 outline-none appearance-none font-bold transition-all")}
                                >
                                    <option value="">Select a plan</option>
                                    {plans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} - ₹{plan.price} ({plan.duration_days} days)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Weight (kg) <span className="text-xs font-medium lowercase opacity-60">(Optional)</span></label>
                                    <input
                                        type="number"
                                        value={healthData.weight}
                                        onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })}
                                        className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="70"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Height (cm) <span className="text-xs font-medium lowercase opacity-60">(Optional)</span></label>
                                    <input
                                        type="number"
                                        value={healthData.height}
                                        onChange={(e) => setHealthData({ ...healthData, height: e.target.value })}
                                        className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="175"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Blood Group <span className="text-xs font-medium lowercase opacity-60">(Optional)</span></label>
                                <select
                                    value={healthData.blood_group}
                                    onChange={(e) => setHealthData({ ...healthData, blood_group: e.target.value })}
                                    className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                >
                                    <option value="">Select blood group</option>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                                    Gender <span className="text-primary">*</span>
                                </label>
                                <div className="flex gap-2">
                                    {['Male', 'Female', 'Other'].map(g => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => {
                                                setHealthData({ ...healthData, gender: g });
                                                handleBlur('gender');
                                            }}
                                            className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${healthData.gender === g
                                                ? 'bg-primary border-primary text-white shadow-glow'
                                                : isInvalid('gender', healthData.gender)
                                                    ? 'bg-red-50 border-red-500 text-red-500'
                                                    : 'bg-card border-border text-text-secondary hover:border-primary/50'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                                    Date of Birth <span className="text-primary">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={dobInput}
                                    onChange={(e) => handleDateInputChange(e.target.value, setDobInput)}
                                    onBlur={() => handleBlur('date_of_birth')}
                                    placeholder="DD/MM/YY"
                                    className={getFieldClass('date_of_birth', dobInput, "w-full rounded-xl bg-card border px-4 py-3 text-sm focus:ring-1 outline-none font-bold transition-all")}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Emergency Contact Name <span className="text-xs font-medium lowercase opacity-60">(Optional)</span></label>
                                <input
                                    type="text"
                                    value={healthData.emergency_contact_name}
                                    onChange={(e) => setHealthData({ ...healthData, emergency_contact_name: e.target.value })}
                                    className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Contact person name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Emergency Contact Phone (Optional)</label>
                                <input
                                    type="tel"
                                    value={healthData.emergency_contact_phone}
                                    onChange={(e) => setHealthData({ ...healthData, emergency_contact_phone: e.target.value })}
                                    className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Emergency contact number"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Medical Conditions (Optional)</label>
                                <textarea
                                    value={healthData.medical_conditions}
                                    onChange={(e) => setHealthData({ ...healthData, medical_conditions: e.target.value })}
                                    className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[100px]"
                                    placeholder="Any injuries or medical conditions..."
                                />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="flex flex-col items-center justify-center gap-6 w-full">
                        <div className="w-56 h-56 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative shadow-inner">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-text-secondary opacity-40">
                                    <Camera size={48} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">No Photo</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                            <button
                                type="button"
                                onClick={() => setIsCameraOpen(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-glow hover:bg-primary/90 transition-all active:scale-95"
                            >
                                <Camera size={16} />
                                {previewUrl ? 'Retake' : 'Camera'}
                            </button>
                            <label className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-card text-text-primary font-black text-xs uppercase tracking-widest rounded-xl border-2 border-border hover:border-primary/50 cursor-pointer transition-all active:scale-95">
                                <Upload size={16} />
                                {previewUrl ? 'Change' : 'Upload'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                />
                            </label>
                        </div>

                        {isCameraOpen && (
                            <CameraCapture
                                onCapture={(blob) => {
                                    setPhotoBlob(blob);
                                    setPreviewUrl(URL.createObjectURL(blob));
                                    setIsCameraOpen(false);
                                }}
                                onCancel={() => setIsCameraOpen(false)}
                            />
                        )}
                    </div>
                );
            case 3:
                const selectedPlan = plans.find(p => p.id === parseInt(basicData.plan_id));
                return (
                    <PaymentStep
                        plan={selectedPlan || null}
                        qrCodeUrl={qrCodeUrl}
                        onComplete={handleComplete}
                    />
                );
            default:
                return null;
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 0:
                return (
                    basicData.first_name.trim().length >= 2 &&
                    basicData.last_name.trim().length >= 2 &&
                    basicData.phone_number.trim().length >= 10 &&
                    !!basicData.plan_id &&
                    joiningDateInput.length === 8 &&
                    !validationErrors.phone_number &&
                    !validationErrors.email &&
                    !isValidating.phone_number &&
                    !isValidating.email
                );
            case 1:
                return !!healthData.gender && dobInput.length === 8;
            case 2:
                return photoBlob !== null;
            case 3:
                return true; // Handled within PaymentStep
            default:
                return false;
        }
    };

    return (
        <div className="bg-background rounded-xl border border-border shadow-2xl flex flex-col max-w-4xl w-full mx-auto max-h-[90vh]">
            {/* Header / Stepper */}
            <div className="bg-card border-b border-border p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-text-primary">Member Onboarding</h2>
                        <p className="text-sm text-text-secondary">Complete the steps below to register a new member</p>
                    </div>
                    <button onClick={onCancel} className="p-2 rounded-full hover:bg-muted transition-colors text-text-secondary">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = idx < currentStep;
                        const isActive = idx === currentStep;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-primary border-primary text-white' :
                                    isActive ? 'bg-background border-primary text-primary scale-110 shadow-glow' :
                                        'bg-background border-border text-text-secondary'
                                    }`}>
                                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                                </div>
                                <span className={`text-[10px] uppercase font-black transition-colors ${isActive ? 'text-primary' : 'text-text-secondary'
                                    }`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-10 flex-1 overflow-y-auto min-h-[400px]">
                {renderStepContent()}
            </div>

            {/* Footer Navigation */}
            <div className="bg-card border-t border-border p-6 flex justify-between items-center">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0 || isLoading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-bold text-text-primary hover:bg-muted transition-all disabled:opacity-0"
                >
                    <ChevronLeft size={18} />
                    Back
                </button>

                {currentStep < STEPS.length - 1 && (
                    <button
                        onClick={handleNext}
                        disabled={!isStepValid() || isLoading}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-sm font-bold text-white shadow-glow hover:bg-primary/90 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        Next Step
                        <ChevronRight size={18} />
                    </button>
                )}

                {isLoading && (
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                    </div>
                )}
            </div>
        </div>
    );
};
