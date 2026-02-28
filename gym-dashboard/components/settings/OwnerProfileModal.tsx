'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    User,
    Mail,
    Phone,
    Lock,
    Save,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    Camera,
    Trash2,
    Eye,
    EyeOff,
    CreditCard,
    Calendar,
    ArrowUpCircle
} from 'lucide-react';
import { getMe, updateMe, changeMyPassword } from '@/services/userService';
import { UserResponse, UserUpdate, ChangePassword } from '@/types';
import { useAuthStore } from '@/store/AuthStore';
import { useSubscriptionStore } from '@/store/SubscriptionStore';
import { uploadPhoto } from '@/services/cloudinaryService';
import toast from 'react-hot-toast';
import { Clock, Filter } from 'lucide-react';
import PaymentHistoryTable from '@/components/subscription/PaymentHistoryTable';
import { usePaymentHistory } from '@/hooks/useSubscription';

interface OwnerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (user: UserResponse) => void;
}

export const OwnerProfileModal = ({ isOpen, onClose, onUpdate }: OwnerProfileModalProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'subscription'>('profile');
    const updateUser = useAuthStore(state => state.updateUser);
    const { subscription, fetchSubscription, needsUpgrade } = useSubscriptionStore();
    const { payments, isLoading: isHistoryLoading } = usePaymentHistory();
    const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

    const filteredPayments = statusFilter === 'all'
        ? payments
        : payments.filter(p => p.status === statusFilter);

    // Profile form state
    const [profileForm, setProfileForm] = useState<UserUpdate>({});

    // Password form state
    const [passwordForm, setPasswordForm] = useState<ChangePassword>({
        old_password: '',
        new_password: '',
    });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
            fetchSubscription();
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const data = await getMe();
            console.log(`this is gym owner data : `, data)
            setUser(data);
            setProfileForm({
                name: data.name,
                username: data.username,
                email: data.email,
                phone_number: data.phone_number,
                avatar_url: data.avatar_url,
            });
            updateUser({
                avatar_url: data.avatar_url,
                username: data.username,
            });
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadPhoto(file);
            setProfileForm(prev => ({ ...prev, avatar_url: url }));
            toast.success('Photo uploaded!');
        } catch (error) {
            toast.error('Failed to upload photo');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemovePhoto = () => {
        setProfileForm(prev => ({ ...prev, avatar_url: '' }));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updated = await updateMe(profileForm);
            setUser(updated);
            updateUser({
                avatar_url: updated.avatar_url,
                username: updated.username,
            });
            if (onUpdate) onUpdate(updated);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
            onClose();
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsChangingPassword(true);
        try {
            await changeMyPassword(passwordForm);
            setPasswordForm({ old_password: '', new_password: '' });
            toast.success('Password changed successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-sidebar border border-border w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">My Profile</h2>
                        <p className="text-sm text-text-secondary">Manage your account settings and security</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-text-secondary">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-border">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`py-4 px-4 text-sm font-bold transition-all relative ${activeTab === 'profile' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Profile Details
                        {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-glow" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`py-4 px-4 text-sm font-bold transition-all relative ${activeTab === 'security' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Security
                        {activeTab === 'security' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-glow" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('subscription')}
                        className={`py-4 px-4 text-sm font-bold transition-all relative ${activeTab === 'subscription' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Subscription
                        {activeTab === 'subscription' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-glow" />}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : activeTab === 'profile' ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-5">
                            {/* Profile Image Section */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group">
                                    <div className="h-28 w-28 rounded-3xl bg-primary/20 flex items-center justify-center text-primary overflow-hidden border-4 border-sidebar shadow-xl transition-all group-hover:shadow-glow">
                                        {profileForm.avatar_url ? (
                                            <img
                                                src={profileForm.avatar_url}
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User size={48} />
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Loader2 className="animate-spin text-white" size={24} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-105 transition-all"
                                            title="Upload Photo"
                                        >
                                            <Camera size={16} />
                                        </button>
                                        {profileForm.avatar_url && (
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg hover:scale-105 transition-all"
                                                title="Remove Photo"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                    />
                                </div>
                                <h3 className="mt-4 font-bold text-text-primary uppercase tracking-widest text-sm">{user?.role?.replace('_', ' ')}</h3>
                                <p className="text-xs text-text-secondary">Member since {user ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : '-'}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm"
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">Username</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={profileForm.username}
                                            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm"
                                            placeholder="Choose a username"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            type="tel"
                                            value={profileForm.phone_number}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm"
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-glow transition-all disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Update Profile
                            </button>
                        </form>
                    ) : activeTab === 'subscription' ? (
                        <div className="space-y-6">
                            {/* Current Plan Overview */}
                            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text-primary">Current Plan</h3>
                                            <p className="text-xs text-text-secondary">Monthly subscription</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${subscription?.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {subscription && subscription.is_active ? 'Active' : 'Missing'}
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-3xl font-extrabold text-text-primary">
                                        {subscription?.plan_name || 'No Plan'}
                                    </span>
                                    {subscription?.is_trial && (
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase">
                                            Free Trial
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary">
                                    {subscription?.is_trial
                                        ? "You are currently exploring all features during your trial period."
                                        : "Your gym is powered by our " + (subscription?.plan_name || "Basic") + " features."}
                                </p>
                            </div>

                            {/* Expiry / Billing Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-sidebar border border-border">
                                    <div className="flex items-center gap-2 text-text-secondary mb-2">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Expiry Date</span>
                                    </div>
                                    <p className="font-bold text-text-primary">
                                        {subscription?.expires_at
                                            ? new Date(subscription.expires_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-sidebar border border-border">
                                    <div className="flex items-center gap-2 text-text-primary mb-2">
                                        <ArrowUpCircle size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Days Left</span>
                                    </div>
                                    <p className="font-bold text-text-primary">
                                        {subscription && subscription.days_remaining !== null ? `${subscription.days_remaining} Days` : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Queued Subscriptions */}
                            {subscription?.queued_subscriptions && subscription.queued_subscriptions.length > 0 && (
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                    <div className="flex items-center gap-2 text-amber-500 mb-3">
                                        <Clock size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Upcoming Plan</span>
                                    </div>
                                    <div className="space-y-3">
                                        {subscription.queued_subscriptions.map((queue) => (
                                            <div key={queue.id} className="flex justify-between items-center bg-white/50 p-3 rounded-xl">
                                                <div>
                                                    <p className="font-bold text-text-primary">{queue.plan_name}</p>
                                                    <p className="text-[10px] text-text-secondary">Purchased on {new Date(queue.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md uppercase">
                                                    Queued
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-text-secondary mt-3">
                                        This plan will automatically activate when your current subscription expires.
                                    </p>
                                </div>
                            )}



                            {/* Payment History Section */}
                            <div className="pt-6 border-t border-border mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-text-primary text-lg">Transaction History</h3>

                                    {/* Filter Dropdown/Tabs */}
                                    <div className="flex bg-secondary/50 p-1 rounded-xl">
                                        {(['all', 'success', 'pending', 'failed'] as const).map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setStatusFilter(status)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === status
                                                    ? 'bg-background shadow-sm text-text-primary'
                                                    : 'text-text-secondary hover:text-text-primary'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border border-border rounded-2xl overflow-hidden">
                                    <PaymentHistoryTable payments={filteredPayments} isLoading={isHistoryLoading} />
                                </div>
                            </div>

                            {/* Renew/Upgrade CTA */}
                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        onClose();
                                        window.location.href = '/subscription';
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-glow transition-all"
                                >
                                    <ArrowUpCircle size={18} />
                                    {needsUpgrade() ? 'Renew Subscription' : 'Upgrade Plan'}
                                </button>
                                <p className="text-center text-[10px] text-text-secondary mt-3">
                                    Need help with billing? <span className="text-primary hover:underline cursor-pointer">Support</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-5">
                            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary">Keep account secure</h3>
                                    <p className="text-xs text-text-secondary">Regularly update your password for better security.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">Current Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            value={passwordForm.old_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                                            className="w-full pl-12 pr-12 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                                        >
                                            {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">New Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                            className="w-full pl-12 pr-12 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm"
                                            placeholder="Enter new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-glow transition-all disabled:opacity-50"
                            >
                                {isChangingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                                Change Password
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div >
    );
};
