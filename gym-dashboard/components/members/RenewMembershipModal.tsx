'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, CheckCircle2, AlertCircle, Info, QrCode, Upload } from 'lucide-react';
import { MembershipPlan, MemberRenew, MemberResponse, MemberProfileResponse } from '@/types';
import { getPlans } from '@/services/planService';
import { renewMembership } from '@/services/memberService';
import { uploadPaymentScreenshot } from '@/services/cloudinaryService';
import { getMyTenant } from '@/services/tenantService';
import { useDashboardStore } from '@/store/DashboardStore';
import toast from 'react-hot-toast';

interface RenewMembershipModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: MemberResponse | MemberProfileResponse;
    onSuccess: () => void;
}

export const RenewMembershipModal: React.FC<RenewMembershipModalProps> = ({
    isOpen,
    onClose,
    member,
    onSuccess,
}) => {
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    // Form state
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [joiningFee, setJoiningFee] = useState('0');
    const [discount, setDiscount] = useState('0');
    const [amountPaid, setAmountPaid] = useState<number | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [notes, setNotes] = useState('');
    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [plansData, tenantData] = await Promise.all([
                getPlans(1, 100, true),
                getMyTenant(),
            ]);
            setPlans(plansData.plans);
            setQrCodeUrl(tenantData.payment_qr_code_url || null);

            const currentPlanId = ('plan_id' in member && member.plan_id) || ('plan' in member ? (member as any).plan?.id : undefined);

            if (currentPlanId) {
                const currentPlan = plansData.plans.find((p: MembershipPlan) => p.id === currentPlanId);
                if (currentPlan) setSelectedPlan(currentPlan);
            }
        } catch (err) {
            toast.error('Failed to load renewal data');
        } finally {
            setIsLoading(false);
        }
    };

    const planPrice = Number(selectedPlan?.price || 0);
    const numericJoiningFee = Number(joiningFee) || 0;
    const numericDiscount = Number(discount) || 0;
    const totalFee = planPrice + numericJoiningFee - numericDiscount;
    const finalAmountPaid = amountPaid !== null ? amountPaid : totalFee;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        try {
            const url = await uploadPaymentScreenshot(file);
            setScreenshotUrl(url);
            toast.success('Screenshot uploaded');
        } catch (err) {
            setError('Failed to upload screenshot');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRenew = async () => {
        if (!selectedPlan) {
            toast.error('Please select a plan');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const renewalData: MemberRenew = {
                plan_id: selectedPlan.id,
                payment_method: paymentMethod,
                payment_amount: finalAmountPaid,
                joining_fee: numericJoiningFee,
                discount: numericDiscount,
                transaction_id: transactionId || undefined,
                payment_screenshot_url: screenshotUrl || undefined,
                payment_notes: notes || undefined,
            };

            await renewMembership(member.id, renewalData);

            // Refresh global stats
            useDashboardStore.getState().fetchStats();

            toast.success('Membership renewed successfully!');
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Failed to renew membership';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">Renew Membership</h2>
                        <p className="text-sm text-text-secondary font-medium">
                            Extending membership for <span className="text-primary font-bold">{member.first_name} {member.last_name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-text-secondary font-bold uppercase text-xs tracking-widest">Loading Plans...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Plan Selection */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full" />
                                    1. Select Plan
                                </h3>

                                <div className="grid grid-cols-1 gap-3">
                                    {plans.map((plan) => {
                                        const isCurrentPlan = ('plan_id' in member)
                                            ? member.plan_id === plan.id
                                            : ('plan' in member ? (member as any).plan?.id === plan.id : false);
                                        const isSelected = selectedPlan?.id === plan.id;

                                        return (
                                            <button
                                                key={plan.id}
                                                onClick={() => setSelectedPlan(plan)}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all relative group ${isSelected
                                                    ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                                                    : 'border-border bg-card hover:border-primary/30'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex flex-col">
                                                        <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                                                            {plan.name}
                                                        </h4>
                                                        {isCurrentPlan && (
                                                            <span className="text-[8px] font-black text-primary uppercase bg-primary/10 w-fit px-2 py-0.5 rounded mt-1">
                                                                Current Plan
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-lg font-black text-primary">₹{Number(plan.price)}</div>
                                                </div>
                                                <p className="text-xs text-text-secondary font-medium line-clamp-1">{plan.description || 'No description'}</p>

                                                {isSelected && (
                                                    <CheckCircle2 size={18} className="absolute -top-2 -right-2 text-primary bg-card rounded-full" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedPlan && (
                                    <div className="space-y-4 mt-6">
                                        <div className="bg-primary/5 rounded-2xl border border-primary/10 p-5">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-xs font-black text-primary uppercase tracking-wider">Plan Summary</span>
                                                <span className="px-2 py-0.5 bg-primary text-[10px] font-black text-white rounded-full">
                                                    +{selectedPlan.duration_days} DAYS
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm font-bold text-text-secondary">
                                                    <span>Base Price</span>
                                                    <span>₹{planPrice}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-bold text-text-secondary">
                                                    <span>Joining Fee</span>
                                                    <span className="text-text-primary">+₹{numericJoiningFee}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-bold text-text-secondary">
                                                    <span>Discount</span>
                                                    <span className="text-red-500">-₹{numericDiscount}</span>
                                                </div>
                                                <div className="pt-2 border-t border-primary/10 flex justify-between items-end">
                                                    <span className="text-sm font-black text-text-primary uppercase">Total Payable</span>
                                                    <span className="text-2xl font-black text-primary">₹{totalFee}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* QR Code inside Selection Column (as requested) */}
                                        {paymentMethod === 'upi' && qrCodeUrl && (
                                            <div className="bg-white p-4 rounded-2xl border-2 border-primary/20 shadow-sm flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="text-[10px] font-black text-primary uppercase tracking-widest text-center px-4 py-1 bg-primary/10 rounded-full w-full">
                                                    Scan & Pay via UPI
                                                </div>
                                                <div className="p-3 bg-muted/30 rounded-2xl border border-border/50">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={qrCodeUrl}
                                                        alt="Payment QR"
                                                        className="w-48 h-48 object-contain rounded-xl shadow-inner bg-white"
                                                    />
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <p className="text-[9px] font-bold text-text-secondary uppercase text-center">
                                                        Click QR to view full screen
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => window.open(qrCodeUrl, '_blank')}
                                                        className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:underline uppercase"
                                                    >
                                                        <QrCode size={14} />
                                                        Enlarge QR Code
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Payment Details */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full" />
                                    2. Payment Details
                                </h3>

                                <div className="space-y-4">
                                    {/* Fee Inputs */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Joining Fee</label>
                                            <input
                                                type="number"
                                                value={joiningFee}
                                                onChange={(e) => setJoiningFee(e.target.value)}
                                                className="w-full rounded-xl bg-card border border-border px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Discount</label>
                                            <input
                                                type="number"
                                                value={discount}
                                                onChange={(e) => setDiscount(e.target.value)}
                                                className="w-full rounded-xl bg-card border border-border px-4 py-2.5 text-sm font-bold text-red-500 outline-none focus:border-red-500 transition-all"
                                            />
                                        </div> */}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Amount Paid (₹)</label>
                                        <input
                                            type="number"
                                            value={amountPaid === null ? totalFee : amountPaid}
                                            onChange={(e) => setAmountPaid(Number(e.target.value))}
                                            className="w-full rounded-xl bg-primary/5 border-2 border-primary/20 px-4 py-3 text-lg font-black text-primary outline-none focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Method</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {['upi', 'cash', 'card', 'bank_transfer'].map((method) => (
                                                <button
                                                    key={method}
                                                    type="button"
                                                    onClick={() => setPaymentMethod(method)}
                                                    className={`py-2 px-1 rounded-xl border text-[9px] font-black uppercase transition-all ${paymentMethod === method
                                                        ? 'bg-primary border-primary text-white shadow-md'
                                                        : 'bg-card border-border text-text-secondary hover:border-primary/50'
                                                        }`}
                                                >
                                                    {method.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Transaction Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Transaction ID</label>
                                            <input
                                                type="text"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                placeholder="Ref Number"
                                                className="w-full rounded-xl bg-card border border-border px-4 py-2.5 text-sm font-bold text-text-primary outline-none focus:border-primary transition-all placeholder:text-[10px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Screenshot</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="renew-screenshot"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                />
                                                <label
                                                    htmlFor="renew-screenshot"
                                                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${screenshotUrl ? 'border-green-500/50 bg-green-500/5 text-green-600' : 'border-border bg-card hover:border-primary/50 text-text-secondary'
                                                        }`}
                                                >
                                                    {isUploading ? <Upload size={16} className="animate-spin" /> : screenshotUrl ? <CheckCircle2 size={16} /> : <Upload size={16} />}
                                                    <span className="text-[10px] font-black uppercase">{screenshotUrl ? 'Uploaded' : 'Upload'}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Notes */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Notes (Optional)</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={2}
                                            className="w-full rounded-xl bg-card border border-border px-4 py-2 text-sm font-medium text-text-primary outline-none focus:border-primary transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wide">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="p-6 border-t border-border flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 px-6 rounded-2xl bg-muted text-text-primary font-black uppercase text-xs tracking-widest hover:bg-border transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRenew}
                        disabled={isSubmitting || !selectedPlan}
                        className={`flex-2 py-4 px-6 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${isSubmitting || !selectedPlan
                            ? 'bg-muted text-text-secondary cursor-not-allowed'
                            : 'bg-primary text-white shadow-glow hover:bg-primary/90 active:scale-[0.98]'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                Confirm Renewal
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
