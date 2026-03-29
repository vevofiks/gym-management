'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getMyTenant, updateMyTenant } from '@/services/tenantService';
import { uploadQRCode, uploadLogo } from '@/services/cloudinaryService';
import { Building2, Bell, Save, CreditCard, QrCode, Upload, Trash2, Loader2, Image as ImageIcon, MessageSquare, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubscriptionStore } from '@/store/SubscriptionStore';
import { useAuthStore } from '@/store/AuthStore';
import Link from 'next/link';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const { hasFeature } = useSubscriptionStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Form states
    const [gymForm, setGymForm] = useState({
        name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        payment_qr_code_url: '',
        logo_url: '',
        google_map: '',
        upi_id: '',
    });
    const [isEditingGym, setIsEditingGym] = useState(false);
    const [originalGymForm, setOriginalGymForm] = useState(gymForm);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const data = await getMyTenant();
                const initialForm = {
                    name: data.name || '',
                    contact_email: data.contact_email || '',
                    contact_phone: data.contact_phone || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    zip_code: data.zip_code || '',
                    payment_qr_code_url: data.payment_qr_code_url || '',
                    logo_url: data.logo_url || '',
                    google_map: data.google_map || '',
                    upi_id: data.upi_id || '',
                };
                setGymForm(initialForm);
                setOriginalGymForm(initialForm);
            } catch (error) {
                console.error('Failed to fetch tenant settings:', error);
                toast.error('Failed to load settings');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTenant();
    }, []);

    const handleSaveGymInfo = async () => {
        setIsSaving(true);
        try {
            await updateMyTenant(gymForm);
            setOriginalGymForm(gymForm);
            setIsEditingGym(false);
            toast.success('Gym settings updated!');
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setGymForm(originalGymForm);
        setIsEditingGym(false);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            const url = await uploadLogo(file);
            const updatedForm = { ...gymForm, logo_url: url };
            setGymForm(updatedForm);
            await updateMyTenant(updatedForm);
            setOriginalGymForm(updatedForm);
            toast.success('Gym logo updated!');
        } catch (error) {
            console.error('Failed to upload logo:', error);
            toast.error('Failed to upload logo');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveLogo = async () => {
        setIsSaving(true);
        try {
            const updatedForm = { ...gymForm, logo_url: '' };
            setGymForm(updatedForm);
            await updateMyTenant(updatedForm);
            setOriginalGymForm(updatedForm);
            toast.success('Gym logo removed');
        } catch (error) {
            toast.error('Failed to remove logo');
        } finally {
            setIsSaving(false);
        }
    };

    const handleQRCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadQRCode(file);
            const updatedForm = { ...gymForm, payment_qr_code_url: url };
            setGymForm(updatedForm);
            await updateMyTenant(updatedForm);
            setOriginalGymForm(updatedForm);
            toast.success('QR Code updated!');
        } catch (error) {
            console.error('Failed to upload QR code:', error);
            toast.error('Failed to upload QR code');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveQRCode = async () => {
        try {
            const updatedForm = { ...gymForm, payment_qr_code_url: '' };
            setGymForm(updatedForm);
            await updateMyTenant(updatedForm);
            setOriginalGymForm(updatedForm);
            toast.success('QR Code removed');
        } catch (error) {
            toast.error('Failed to remove QR code');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (user?.role === 'gym_staff') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                    <Building2 size={48} />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">Access Restricted</h2>
                    <p className="text-text-secondary font-bold">Only gym owners can access settings details.</p>
                </div>
            </div>
        );
    }

    const infoFields = [
        { label: 'Gym Name', value: gymForm.name, key: 'name', type: 'text' },
        { label: 'Email', value: gymForm.contact_email, key: 'contact_email', type: 'email' },
        { label: 'Phone', value: gymForm.contact_phone, key: 'contact_phone', type: 'tel' },
        { label: 'Address', value: gymForm.address, key: 'address', type: 'text' },
        { label: 'City', value: gymForm.city, key: 'city', type: 'text' },
        { label: 'State', value: gymForm.state, key: 'state', type: 'text' },
        { label: 'Zip Code', value: gymForm.zip_code, key: 'zip_code', type: 'text' },
        { label: 'Google Maps URL', value: gymForm.google_map, key: 'google_map', type: 'url' },
        { label: 'UPI ID', value: gymForm.upi_id, key: 'upi_id', type: 'text' },
    ];

    return (
        <div className="space-y-8">
            {/* Gym Information Section */}
            <Card>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Building2 className="text-primary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">Gym Information</h2>
                            <p className="text-sm text-text-secondary">Manage your gym&apos;s basic details</p>
                        </div>
                    </div>
                    {!isEditingGym && user?.role === 'gym_owner' && (
                        <button
                            onClick={() => setIsEditingGym(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-all"
                        >
                            Edit Information
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    {/* Logo Upload */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Gym Logo</label>
                        <div className="relative group w-32 h-32 rounded-xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden">
                            {gymForm.logo_url ? (
                                <>
                                    <img
                                        src={gymForm.logo_url}
                                        alt="Gym Logo"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={handleRemoveLogo}
                                            className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                            title="Remove Logo"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <label className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 cursor-pointer transition-colors" title="Change Logo">
                                            <Upload size={16} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <label className="flex flex-col items-center gap-2 cursor-pointer p-4 text-center">
                                    {isSaving ? (
                                        <Loader2 className="animate-spin text-primary" size={24} />
                                    ) : (
                                        <>
                                            <ImageIcon className="text-text-secondary opacity-50" size={24} />
                                            <span className="text-[10px] text-text-secondary font-medium">Upload Logo</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isSaving} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {infoFields.map((field) => (
                            <div key={field.key} className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{field.label}</label>
                                {isEditingGym ? (
                                    <Input
                                        value={field.value}
                                        type={field.type}
                                        onChange={(e) => setGymForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                        className="h-11"
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <div className="h-11 flex items-center px-4 rounded-xl bg-background/50 border border-transparent text-sm font-bold text-text-primary">
                                        {field.value || <span className="text-text-secondary/50 font-normal italic">Not set</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {isEditingGym && (
                    <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-border/50">
                        <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:bg-muted transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveGymInfo}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:shadow-glow transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                )}
            </Card>

            {/* Payment & QR Code Section */}
            {user?.role === 'gym_owner' && (
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <CreditCard className="text-primary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">Payment Information</h2>
                            <p className="text-sm text-text-secondary">Configure your payment collection methods</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-text-secondary uppercase">Payment QR Code</label>
                            <div className="relative group w-48 h-48 rounded-xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden">
                                {gymForm.payment_qr_code_url ? (
                                    <>
                                        <img
                                            src={gymForm.payment_qr_code_url}
                                            alt="Payment QR"
                                            className="w-full h-full object-contain p-2"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={handleRemoveQRCode}
                                                className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                                title="Remove QR Code"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <label className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 cursor-pointer transition-colors" title="Change QR Code">
                                                <Upload size={16} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleQRCodeUpload} />
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <label className="flex flex-col items-center gap-2 cursor-pointer p-4 text-center">
                                        {isUploading ? (
                                            <Loader2 className="animate-spin text-primary" size={32} />
                                        ) : (
                                            <>
                                                <QrCode className="text-text-secondary opacity-50" size={32} />
                                                <span className="text-xs text-text-secondary font-medium">Click to upload QR Code</span>
                                            </>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleQRCodeUpload} disabled={isUploading} />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-text-secondary max-w-xs">
                                This QR code will be displayed to new members during onboarding for easy payment collection.
                            </p>
                        </div>

                        <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                            <h4 className="font-bold text-text-primary flex items-center gap-2 mb-2">
                                <Bell size={16} className="text-primary" />
                                Auto-Sync
                            </h4>
                            <p className="text-sm text-text-secondary mb-4">
                                Changes to your payment information are automatically synced and will be visible to all staff members and during member onboarding.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* WhatsApp Integration Section */}
            {user?.role === 'gym_owner' && hasFeature('whatsapp') && (
                <Card className="border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <MessageSquare className="text-primary" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">WhatsApp Automation</h2>
                                <p className="text-sm text-text-secondary">Connected business account settings</p>
                            </div>
                        </div>
                        <Link
                            href="/settings/whatsapp"
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:shadow-glow transition-all"
                        >
                            Detailed Settings
                            <ExternalLink size={16} />
                        </Link>
                    </div>

                    <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-between">
                        <div>
                            <p className="font-bold text-text-primary">WhatsApp Service</p>
                            <p className="text-xs text-text-secondary">Manage message triggers and connection</p>
                        </div>
                        <Link href="/settings/whatsapp" className="text-primary font-bold text-sm hover:underline">
                            Configure
                        </Link>
                    </div>
                </Card>
            )}
        </div>
    );
}
