'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Calendar as CalendarIcon,
    Search,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    CheckCircle2,
    Filter,
    Download
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { getMemberPaymentHistory, downloadPaymentReceipt } from '@/services/feeService';
import { FeeResponse, FeeListResponse } from '@/types';
import toast from 'react-hot-toast';

interface MemberPaymentHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberId: number;
    memberName: string;
}

export const MemberPaymentHistoryModal: React.FC<MemberPaymentHistoryModalProps> = ({
    isOpen,
    onClose,
    memberId,
    memberName
}) => {
    const [history, setHistory] = useState<FeeListResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const pageSize = 10;

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            const data = await getMemberPaymentHistory(
                memberId,
                page,
                pageSize,
                startDate || undefined,
                endDate || undefined
            );
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch payment history:', error);
            toast.error('Failed to load payment history');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, page, startDate, endDate]);

    if (!isOpen) return null;

    const totalAmount = history?.total_amount || 0;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Payment History</h2>
                        <p className="text-xs font-bold text-text-secondary uppercase">Full record for {memberName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted transition-colors text-text-secondary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Filters & Summary */}
                <div className="p-6 border-b border-border bg-card/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2">
                            <CalendarIcon size={16} className="text-text-secondary" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                className="bg-transparent text-xs font-bold text-text-primary focus:outline-none"
                            />
                            <span className="text-text-secondary text-xs px-1">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                className="bg-transparent text-xs font-bold text-text-primary focus:outline-none"
                            />
                        </div>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
                                className="text-xs font-bold text-primary hover:underline"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-text-secondary uppercase">Total Collected</p>
                            <p className="text-lg font-black text-green-500">₹{totalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm font-bold text-text-secondary animate-pulse uppercase">Fetching Records...</p>
                        </div>
                    ) : history && history.fees.length > 0 ? (
                        <div className="rounded-xl border border-border overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 font-black text-text-secondary uppercase text-[10px] tracking-wider">Date</th>
                                        <th className="px-6 py-4 font-black text-text-secondary uppercase text-[10px] tracking-wider">Amount</th>
                                        <th className="px-6 py-4 font-black text-text-secondary uppercase text-[10px] tracking-wider">Method</th>
                                        <th className="px-6 py-4 font-black text-text-secondary uppercase text-[10px] tracking-wider">Transaction ID</th>
                                        <th className="px-6 py-4 font-black text-text-secondary uppercase text-[10px] tracking-wider">Notes</th>
                                        <th className="px-6 py-4 font-black text-text-secondary uppercase text-[10px] tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {history.fees.map((payment: FeeResponse) => (
                                        <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 text-text-primary font-bold">
                                                {formatDate(payment.payment_date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-green-500">₹{payment.amount}</span>
                                            </td>
                                            <td className="px-6 py-4 lg:py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-primary/5 text-primary border border-primary/10 rounded-xl text-[10px] font-black uppercase">
                                                        {payment.payment_method}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-mono text-text-secondary bg-muted/50 px-2 py-1 rounded">
                                                    {payment.transaction_id || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 italic text-text-secondary text-xs truncate max-w-[150px]">
                                                {payment.notes || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => downloadPaymentReceipt(payment.id)}
                                                    className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all group"
                                                    title="Download PDF Receipt"
                                                >
                                                    <Download size={14} className="transition-transform group-hover:scale-110" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-xl border-2 border-dashed border-border">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-text-secondary">
                                <CreditCard size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-text-primary mb-1 uppercase tracking-tight">No Payments Found</h3>
                            <p className="text-sm text-text-secondary font-medium">No payment records match your current filters.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                {history && history.total_pages > 1 && (
                    <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
                        <p className="text-xs font-bold text-text-secondary uppercase">
                            Showing {history.fees.length} of {history.total} records
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                                className="p-2 rounded-xl border border-border bg-card text-text-primary disabled:opacity-50 hover:bg-muted transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="px-4 py-2 bg-card border border-border rounded-xl text-xs font-black text-text-primary">
                                {page} / {history.total_pages}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(history.total_pages, p + 1))}
                                disabled={page === history.total_pages || isLoading}
                                className="p-2 rounded-xl border border-border bg-card text-text-primary disabled:opacity-50 hover:bg-muted transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
