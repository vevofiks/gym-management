'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Mail,
    Phone,
    Calendar,
    CreditCard,
    Activity,
    Clock,
    Heart,
    MapPin,
    User,
    ArrowUpRight,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import { MemberProfileResponse, MemberStatus } from '@/types/index';
import { getMemberProfile } from '@/services/memberService';
import { cn, formatDate } from '@/lib/utils';
import { RenewMembershipModal } from './RenewMembershipModal';
import { Apple, Utensils, MessageCircle, MoreHorizontal, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMemberDietPlans } from '@/services/dietPlanService';
import { DietPlanAssignmentResponse } from '@/types';
import { AssignDietModal } from '../diet-plans/AssignDietModal';
import { listTemplates } from '@/services/dietPlanService';
import Link from 'next/link';
import { MemberPaymentHistoryModal } from './MemberPaymentHistoryModal';
import { ProgressTracker } from './ProgressTracker';
import { RecordPaymentModal } from './RecordPaymentModal';

interface MemberProfileDetailProps {
    memberId: number;
    onClose?: () => void;
    layoutMode?: 'page' | 'modal';
}

export const MemberProfileDetail: React.FC<MemberProfileDetailProps> = ({
    memberId,
    onClose,
    layoutMode = 'modal'
}) => {
    const isPage = layoutMode === 'page';
    const [profile, setProfile] = useState<MemberProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [dietPlans, setDietPlans] = useState<DietPlanAssignmentResponse[]>([]);
    const [isAssignDietModalOpen, setIsAssignDietModalOpen] = useState(false);
    const [selectedTemplateForAssign, setSelectedTemplateForAssign] = useState<any>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'progress'>('overview');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const [data, dietData] = await Promise.all([
                getMemberProfile(memberId),
                getMemberDietPlans(memberId)
            ]);
            setProfile(data);
            setDietPlans(dietData);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load member profile details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [memberId]);

    if (isLoading) {
        return (
            <div className={cn(
                "bg-card rounded-xl overflow-hidden shadow-soft border border-border flex items-center justify-center p-20",
                !isPage && "w-full max-w-4xl"
            )}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-text-secondary font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className={cn(
                "bg-card rounded-xl overflow-hidden shadow-soft border border-border p-12 text-center",
                !isPage && "w-full max-w-4xl"
            )}>
                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-text-primary mb-2">Error Loading Profile</h3>
                <p className="text-text-secondary mb-6">{error || 'Something went wrong'}</p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary text-white rounded-xl font-bold"
                    >
                        Close
                    </button>
                )}
            </div>
        );
    }

    const getStatusColor = (status: MemberStatus) => {
        switch (status) {
            case MemberStatus.ACTIVE: return 'bg-green-500/10 text-green-500 border-green-500/20';
            case MemberStatus.EXPIRED: return 'bg-red-500/10 text-red-500 border-red-500/20';
            case MemberStatus.INACTIVE: return 'bg-text-secondary/10 text-text-secondary border-text-secondary/20';
            default: return 'bg-text-secondary/10 text-text-secondary border-text-secondary/20';
        }
    };

    const downloadTransformationComparison = async () => {
        if (!profile || !profile.before_photo_url || !profile.after_photo_url) return;

        try {
            setIsDownloading(true);

            const loadImage = (url: string): Promise<HTMLImageElement> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => resolve(img);
                    img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
                    img.src = url;
                });
            };

            const [beforeImg, afterImg] = await Promise.all([
                loadImage(profile.before_photo_url),
                loadImage(profile.after_photo_url)
            ]);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            // Normalize height to 2160px (4K vertical resolution)
            const targetHeight = 2160;
            const beforeWidth = beforeImg.width * (targetHeight / beforeImg.height);
            const afterWidth = afterImg.width * (targetHeight / afterImg.height);

            const scale = targetHeight / 800;
            const gap = 20 * scale;
            const padding = 40 * scale;
            const headerHeight = 80 * scale;
            const footerHeight = 80 * scale;

            canvas.width = beforeWidth + afterWidth + gap + (padding * 2);
            canvas.height = targetHeight + headerHeight + footerHeight;

            // Background
            ctx.fillStyle = '#111827'; // Dark background matching theme
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Images
            ctx.drawImage(beforeImg, padding, headerHeight, beforeWidth, targetHeight);
            ctx.drawImage(afterImg, padding + beforeWidth + gap, headerHeight, afterWidth, targetHeight);

            // Labels
            ctx.fillStyle = '#9ca3af';
            ctx.font = `bold ${Math.round(24 * scale)}px Inter, sans-serif`;
            ctx.fillText('BEFORE', padding, headerHeight - (20 * scale));

            ctx.fillStyle = '#3b82f6';
            ctx.fillText('AFTER', padding + beforeWidth + gap, headerHeight - (20 * scale));

            // Header Title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'black 36px Inter, sans-serif';

            // Footer Branding
            ctx.fillStyle = '#9ca3af';
            ctx.font = `medium ${Math.round(20 * scale)}px Inter, sans-serif`;
            const brandingText = `${profile.first_name} ${profile.last_name} • VEVOFIKS GYM`;
            ctx.fillText(brandingText, padding, canvas.height - (30 * scale));

            // Download
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            link.download = `${profile.first_name}_transformation.jpg`;
            link.href = dataUrl;
            link.click();

            toast.success('Transformation saved!');
        } catch (err) {
            console.error('Download failed:', err);
            toast.error('Failed to generate image. Most likely due to secure image hosting settings.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className={cn(
            "flex flex-col transition-all duration-300",
            isPage ? "w-full space-y-6" : "bg-background w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-border max-h-[90vh]"
        )}>
            {/* Header */}
            <div className={cn(
                "transition-all",
                isPage
                    ? "flex flex-col md:flex-row justify-between items-start gap-6"
                    : "p-6 md:p-8 border-b border-border bg-card flex flex-col md:flex-row justify-between items-start gap-6"
            )}>
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left w-full md:w-auto">
                    <div className="w-20 h-20 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                        {profile.before_photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.before_photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-primary" />
                        )}
                    </div>
                    <div className="flex flex-col items-center sm:items-start">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
                            <h2 className="text-xl md:text-2xl font-black text-text-primary uppercase tracking-tight">
                                {profile.first_name} {profile.last_name}
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(profile.status)}`}>
                                {profile.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-text-secondary font-medium">
                            <span className="flex items-center gap-1"><Phone size={14} /> {profile.phone_number}</span>
                            {profile.email && <span className="flex items-center gap-1"><Mail size={14} /> {profile.email}</span>}
                            <span className="flex items-center gap-1"><Clock size={14} /> Joined {formatDate(profile.joining_date)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-3 w-full md:w-auto">
                    {!isPage && onClose && (
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors text-text-secondary self-end">
                            <X size={20} />
                        </button>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setIsRenewModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-glow hover:bg-primary/90 transition-all active:scale-95 w-full sm:w-auto"
                        >
                            <RefreshCw size={14} />
                            Renew Membership
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className={cn(
                "flex overflow-x-auto no-scrollbar border-b border-border",
                isPage ? "" : "px-6 md:px-8"
            )}>
                <button
                    onClick={() => setActiveTab('overview')}
                    className={cn(
                        "px-6 py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors",
                        activeTab === 'overview'
                            ? "border-primary text-primary"
                            : "border-transparent text-text-secondary hover:text-text-primary"
                    )}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('progress')}
                    className={cn(
                        "px-6 py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors flex items-center gap-2",
                        activeTab === 'progress'
                            ? "border-primary text-primary"
                            : "border-transparent text-text-secondary hover:text-text-primary"
                    )}
                >
                    <Activity size={16} /> Progress
                </button>
            </div>

            {/* Content Area */}
            <div className={cn(
                "space-y-10",
                isPage ? "py-4" : "p-6 md:p-8 flex-1 overflow-y-auto"
            )}>
                {activeTab === 'overview' ? (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><TrendingUp size={20} /></div>
                                    {profile.plan_days_remaining !== undefined && (
                                        <span className={`text-[10px] font-bold uppercase ${profile.plan_days_remaining > 5 ? 'text-green-500' : 'text-red-500'}`}>
                                            {profile.plan_days_remaining} Days Left
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-xs font-bold text-text-secondary uppercase mb-1">Current Plan</h4>
                                <div className="text-xl font-black text-text-primary capitalize">{profile.plan?.name || 'No Plan'}</div>
                                <p className="text-xs text-text-secondary mt-1">
                                    Expires: {formatDate(profile.membership_expiry_date)}
                                </p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-green-500/10 rounded-xl text-green-500"><CreditCard size={20} /></div>
                                </div>
                                <h4 className="text-xs font-bold text-text-secondary uppercase mb-1">Total Paid</h4>
                                <div className="text-xl font-black text-text-primary">₹{profile.total_fees_paid.toLocaleString()}</div>
                                <p className="text-xs text-text-secondary mt-1">Across all renewals</p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500"><AlertCircle size={20} /></div>
                                </div>
                                <h4 className="text-xs font-bold text-text-secondary uppercase mb-1">Outstanding</h4>
                                <div className="flex items-end justify-between">
                                    <div className="text-xl font-black text-orange-500">₹{profile.outstanding_dues.toLocaleString()}</div>
                                    {profile.outstanding_dues > 0 && (
                                        <button
                                            onClick={() => setIsPaymentModalOpen(true)}
                                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline mb-1"
                                        >
                                            Record Payment
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-text-secondary mt-1">Pending payments</p>
                            </div>
                        </div>

                        {/* Main Content Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                            {/* Left Panel: Photos & Details (2/5) */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Photos */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={16} className="text-primary" />
                                        Transformation Photos
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="aspect-3/4 rounded-xl bg-muted border border-border overflow-hidden relative">
                                                {profile.before_photo_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={profile.before_photo_url} alt="Before" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-text-secondary/30 italic text-[10px]">No Photo</div>
                                                )}
                                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[8px] font-black uppercase rounded">Before</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="aspect-3/4 rounded-xl bg-muted border border-border overflow-hidden relative">
                                                {profile.after_photo_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={profile.after_photo_url} alt="After" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-text-secondary/30 italic text-[10px]">No Photo</div>
                                                )}
                                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase rounded">After</div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={downloadTransformationComparison}
                                        disabled={isDownloading || !profile.before_photo_url || !profile.after_photo_url}
                                        className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download size={16} className={isDownloading ? "animate-bounce" : ""} />
                                        {isDownloading ? 'Generating...' : 'Download Comparison'}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('progress')}
                                        className="w-full py-2 text-xs font-bold text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors uppercase tracking-wide"
                                    >
                                        View Full Progress Tracking
                                    </button>
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <h4 className="text-xs font-black text-text-primary uppercase tracking-widest">Personal Details</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm py-1 border-b border-border/50">
                                            <span className="text-text-secondary">Gender</span>
                                            <span className="text-text-primary font-bold">{profile.gender || 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-1 border-b border-border/50">
                                            <span className="text-text-secondary">Date of Birth</span>
                                            <span className="text-text-primary font-bold">{profile.date_of_birth ? formatDate(profile.date_of_birth) : 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-1 border-b border-border/50">
                                            <span className="text-text-secondary">Blood Group</span>
                                            <span className="font-bold text-red-500">{profile.blood_group || 'N/A'}</span>
                                        </div>
                                        {profile.address && (
                                            <div className="flex justify-between text-sm py-1">
                                                <span className="text-text-secondary shrink-0">Address</span>
                                                <span className="text-text-primary font-bold text-right truncate max-w-[150px]">{profile.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Medical Info */}
                                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <Heart size={12} /> Medical & Health
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2 text-center">
                                            <div className="bg-white p-2 rounded-xl">
                                                <div className="text-[10px] text-black uppercase">Weight</div>
                                                <div className="font-bold text-primary">{profile.weight} kg</div>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl">
                                                <div className="text-[10px] text-black uppercase">Height</div>
                                                <div className="font-bold text-primary">{profile.height} cm</div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-text-secondary italic leading-relaxed">
                                            {profile.medical_conditions || 'No medical conditions reported.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Payments & Emergency (3/5) */}
                            <div className="lg:col-span-3 space-y-10">
                                {/* Recent Payments */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                            <ArrowUpRight size={16} className="text-green-500" />
                                            Payment History
                                        </h4>
                                        <button
                                            onClick={() => setIsHistoryModalOpen(true)}
                                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                        >
                                            View Full History
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {profile.recent_payments.length > 0 ? (
                                            profile.recent_payments.map((payment) => (
                                                <div key={payment.id} className="bg-card border border-border p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                                                            <CheckCircle2 size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-text-primary">₹{payment.amount}</div>
                                                            <div className="text-[10px] text-text-secondary uppercase font-bold">{payment.payment_method} • {formatDate(payment.payment_date)}</div>
                                                        </div>
                                                    </div>
                                                    {payment.transaction_id && (
                                                        <div className="text-[10px] text-text-secondary font-mono bg-muted px-2 py-1 rounded">
                                                            ID: {payment.transaction_id}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 bg-muted/30 rounded-xl border-2 border-dashed border-border text-text-secondary italic text-sm">
                                                No recent payment records found.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Diet Plans History */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                            <Apple size={16} className="text-primary" />
                                            Diet Plan History
                                        </h4>
                                        <Link
                                            href="/diet-plans"
                                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                        >
                                            View Templates
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {dietPlans.length > 0 ? (
                                            dietPlans.map((assignment) => (
                                                <div key={assignment.id} className="bg-card border border-border p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                            <Utensils size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-text-primary">
                                                                {assignment.template_name || `Assigned Plan #${assignment.template_id}`}
                                                            </div>
                                                            <div className="text-[10px] text-text-secondary uppercase font-bold">
                                                                {formatDate(assignment.assigned_at)}
                                                                {assignment.sent_via_whatsapp && (
                                                                    <span className="ml-2 text-green-500 flex inline-items items-center gap-1">
                                                                        <MessageCircle size={10} /> WhatsApp Sent
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {assignment.notes && (
                                                            <div className="text-[10px] text-text-secondary italic max-w-[150px] truncate">
                                                                "{assignment.notes}"
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 bg-muted/30 rounded-xl border-2 border-dashed border-border text-text-secondary italic text-sm">
                                                No diet plans assigned yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {profile.emergency_contact_name || profile.emergency_contact_phone ? (
                                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                                        <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Emergency Contact</h4>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-lg font-black text-text-primary">{profile.emergency_contact_name || 'Emergency Contact'}</div>
                                                <div className="text-sm text-text-secondary font-bold flex items-center gap-1">
                                                    <Phone size={14} /> {profile.emergency_contact_phone || 'No phone'}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-white rounded-xl text-primary shadow-soft">
                                                <Phone size={24} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-muted/10 border border-dashed border-border rounded-xl p-6 text-center">
                                        <p className="text-xs text-text-secondary italic">No emergency contact information provided.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <ProgressTracker memberId={memberId} />
                )}
            </div>

            {/* Actions Footer - Only show in modal mode */}
            {layoutMode === 'modal' && onClose && (
                <div className="p-6 bg-card border-t border-border flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl bg-background border border-border font-bold text-sm text-text-primary hover:bg-muted transition-colors"
                    >
                        Close Profile
                    </button>
                </div>
            )}

            {/* Renewal Modal */}
            {profile && (
                <RenewMembershipModal
                    isOpen={isRenewModalOpen}
                    onClose={() => setIsRenewModalOpen(false)}
                    member={profile}
                    onSuccess={() => {
                        fetchProfile();
                    }}
                />
            )}

            {/* Payment History Modal */}
            {profile && (
                <MemberPaymentHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    memberId={memberId}
                    memberName={`${profile.first_name} ${profile.last_name}`}
                />
            )}

            {/* Record Payment Modal */}
            {profile && (
                <RecordPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    member={profile}
                    onSuccess={() => {
                        fetchProfile();
                    }}
                />
            )}
        </div>
    );
};
