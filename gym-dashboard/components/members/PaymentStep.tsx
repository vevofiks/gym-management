import React, { useState } from 'react';
import { QrCode, Upload, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { MembershipPlan } from '@/types';
import { uploadPaymentScreenshot } from '@/services/cloudinaryService';

interface PaymentStepProps {
    plan: MembershipPlan | null;
    qrCodeUrl: string | null;
    onComplete: (paymentData: {
        method: string;
        amount: number;
        joiningFee: number;
        discount: number;
        transactionId?: string;
        screenshotUrl?: string;
        notes?: string;
    }) => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({ plan, qrCodeUrl, onComplete }) => {
    const [paymentMethod, setPaymentMethod] = useState<string>('upi');
    const [joiningFee, setJoiningFee] = useState<string>('0');
    const [discount, setDiscount] = useState<string>('0');
    const [amountPaid, setAmountPaid] = useState<number | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [notes, setNotes] = useState('');
    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const planPrice = Number(plan?.price || 0);
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
        } catch (err) {
            setError('Failed to upload screenshot. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = () => {
        if (!plan) return;

        // Numeric validation
        if (isNaN(Number(joiningFee)) || isNaN(Number(discount))) {
            setError('Membership fee and discount must be valid numbers');
            return;
        }

        onComplete({
            method: paymentMethod,
            amount: finalAmountPaid,
            joiningFee: Number(joiningFee),
            discount: Number(discount),
            transactionId: transactionId || undefined,
            screenshotUrl: screenshotUrl || undefined,
            notes: notes || undefined,
        });
    };

    if (!plan) return <div className="p-8 text-center">No plan selected</div>;

    return (
        <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-10">
            {/* Fee Management Section */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-soft">
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight mb-6 flex items-center gap-2">
                    <div className="w-2 h-6 bg-primary rounded-full" />
                    Fee Management
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase">Plan Price</label>
                            <div className="w-full rounded-xl bg-muted border border-border px-4 py-3 text-sm font-bold text-text-primary">
                                ₹{planPrice}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase">Membership Fee</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">₹</span>
                                <input
                                    type="text"
                                    value={joiningFee}
                                    onChange={(e) => setJoiningFee(e.target.value)}
                                    className="w-full rounded-xl bg-background border border-border pl-8 pr-4 py-3 text-sm font-bold text-text-primary focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary uppercase">Discount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 font-bold">-₹</span>
                                <input
                                    type="text"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-3 text-sm font-bold text-red-500 focus:border-red-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 rounded-xl p-6 flex flex-col justify-between border border-primary/10">
                        <div>
                            <div className="text-xs font-bold text-primary uppercase mb-1">Total Fee</div>
                            <div className="text-3xl font-black text-text-primary">₹{totalFee}</div>
                            <div className="text-[10px] text-text-secondary font-medium mt-1">
                                {planPrice} (Plan) + {numericJoiningFee} (Fees) - {numericDiscount} (Disc.)
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-primary/10">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Initial Amount Paid</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                                <input
                                    type="number"
                                    value={amountPaid === null ? totalFee : amountPaid}
                                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                                    className="w-full rounded-xl bg-white border-2 border-primary/20 pl-8 pr-4 py-3 text-lg font-black text-primary focus:border-primary outline-none transition-all shadow-sm"
                                />
                            </div>
                            {finalAmountPaid < totalFee && (
                                <div className="text-[10px] text-orange-600 font-bold mt-2 uppercase tracking-wide">
                                    Outstanding: ₹{totalFee - finalAmountPaid}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Confirm Payment Selection */}
                <div className="flex flex-col gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['upi', 'cash', 'card', 'bank_transfer'].map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${paymentMethod === method
                                        ? 'bg-primary border-primary text-white translate-y-[-2px]'
                                        : 'bg-card border-border text-text-secondary hover:border-primary/50'
                                        }`}
                                >
                                    {method === 'upi' ? 'UPI' : method === 'cash' ? 'Cash' : method === 'card' ? 'Card' : 'Bank Transfer'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Transaction ID</label>
                        <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Enter 12-digit UPI reference"
                            className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm text-text-primary font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:font-medium placeholder:text-text-secondary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Payment Proof</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="screenshot-upload"
                            />
                            <label
                                htmlFor="screenshot-upload"
                                className={`flex flex-col items-center justify-center w-full min-h-[100px] border-2 border-dashed rounded-xl cursor-pointer transition-all ${screenshotUrl
                                    ? 'border-green-500/50 bg-green-500/5'
                                    : 'border-border bg-card hover:border-primary/50'
                                    }`}
                            >
                                {isUploading ? (
                                    <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] animate-pulse">
                                        <Upload size={18} className="animate-bounce" />
                                        Uploading...
                                    </div>
                                ) : screenshotUrl ? (
                                    <div className="flex flex-col items-center gap-1 text-green-500 font-black uppercase text-[10px]">
                                        <CheckCircle2 size={24} />
                                        Screenshot Uploaded
                                        <span className="text-[8px] text-text-secondary font-bold">Click to change</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-text-secondary font-black uppercase text-[10px]">
                                        <Upload size={20} />
                                        <span>Upload screenshot</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                {/* QR Code Section */}
                {paymentMethod === 'upi' && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <h4 className="font-bold text-text-primary flex items-center gap-2 uppercase tracking-tighter">
                            <QrCode size={18} className="text-primary" />
                            Scan to Pay
                        </h4>
                        <div className="bg-white p-4 rounded-xl border-2 border-primary/10 shadow-lg">
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48 object-contain" />
                            ) : (
                                <div className="w-48 h-48 flex items-center justify-center bg-muted rounded-xl text-text-secondary text-center p-4">
                                    QR Code not available. Please ask the owner for details.
                                </div>
                            )}
                        </div>
                        <div className="text-[10px] text-text-secondary flex items-center gap-1 font-bold uppercase">
                            <Info size={14} />
                            Any UPI app supported (GPay, PhonePe, etc.)
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <button
                onClick={handleSubmit}
                className="w-full rounded-xl bg-primary py-5 text-sm font-black text-white uppercase tracking-widest shadow-glow hover:bg-primary/90 transition-all active:scale-[0.98] mt-4"
            >
                Confirm Payment & Register Member
            </button>
        </div>
    );
};

const X = ({ size, className }: { size: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
