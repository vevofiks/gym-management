'use client';

import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, AlertCircle, Calendar, IndianRupee, QrCode, Info } from 'lucide-react';
import { MemberProfileResponse, FeeCreate, PaymentMethod } from '@/types';
import { recordPayment } from '@/services/feeService';
import { getMyTenant } from '@/services/tenantService';
import { useDashboardStore } from '@/store/DashboardStore';
import toast from 'react-hot-toast';

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: MemberProfileResponse;
    onSuccess: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
    isOpen,
    onClose,
    member,
    onSuccess,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [amount, setAmount] = useState(member.outstanding_dues.toString());
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.UPI);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [transactionId, setTransactionId] = useState('');
    const [notes, setNotes] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        const fetchTenantData = async () => {
            try {
                const tenantData = await getMyTenant();
                setQrCodeUrl(tenantData.payment_qr_code_url || null);
            } catch (err) {
                console.error('Failed to fetch tenant info:', err);
            }
        };
        if (isOpen) {
            fetchTenantData();
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const feeData: FeeCreate = {
                amount: numericAmount,
                payment_method: paymentMethod,
                payment_date: paymentDate,
                transaction_id: transactionId || undefined,
                notes: notes || undefined,
            };

            await recordPayment(member.id, feeData);

            // Refresh global stats
            useDashboardStore.getState().fetchStats();

            toast.success('Payment recorded successfully!');
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Failed to record payment';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Record Payment</h2>
                        <p className="text-xs text-text-secondary font-medium">
                            For <span className="text-primary font-bold">{member.first_name} {member.last_name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
                    {/* Amount Input */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Amount (₹)</label>
                        <div className="relative">
                            <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full rounded-xl bg-primary/5 border-2 border-primary/20 pl-10 pr-4 py-3 text-lg font-black text-primary outline-none focus:border-primary transition-all shadow-sm"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-[10px] text-text-secondary italic">
                            Outstanding: <span className="text-orange-500 font-bold">₹{member.outstanding_dues}</span>
                        </p>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(PaymentMethod).map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-2.5 px-3 rounded-xl border text-[10px] font-black uppercase transition-all ${paymentMethod === method
                                        ? 'bg-primary border-primary text-white shadow-md'
                                        : 'bg-card border-border text-text-secondary hover:border-primary/50'
                                        }`}
                                >
                                    {method.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* QR Code Display */}
                    {paymentMethod === PaymentMethod.UPI && qrCodeUrl && (
                        <div className="bg-white p-4 rounded-xl border-2 border-primary/20 shadow-sm flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest text-center px-4 py-1 bg-primary/10 rounded-full w-full">
                                Scan & Pay via UPI
                            </div>
                            <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
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

                    {/* Date and Transaction ID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Date</label>
                            <input
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-xs font-bold text-text-primary outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Ref Number</label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Optional"
                                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-xs font-bold text-text-primary outline-none focus:border-primary transition-all placeholder:text-[10px]"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl bg-card border border-border px-4 py-2 text-xs font-medium text-text-primary outline-none focus:border-primary transition-all resize-none"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-border flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl bg-muted text-text-primary font-black uppercase text-[10px] tracking-widest hover:bg-border transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`flex-2 py-3 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all ${isSubmitting
                            ? 'bg-muted text-text-secondary cursor-not-allowed'
                            : 'bg-primary text-white shadow-glow hover:bg-primary/90 active:scale-[0.98]'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={14} />
                                Record Payment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
