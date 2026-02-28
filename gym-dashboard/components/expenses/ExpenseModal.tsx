'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Receipt,
    IndianRupee,
    Calendar,
    FileText,
    CreditCard,
    Save,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import {
    ExpenseCategory,
    PaymentMethod,
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse
} from '@/types';
import { createExpense, updateExpense } from '@/services/expenseService';
import { useDashboardStore } from '@/store/DashboardStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expense?: ExpenseResponse; // If provided, we are editing
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    expense,
}) => {
    const isEditing = !!expense;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form State
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.MISCELLANEOUS);
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [expenseDate, setExpenseDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [description, setDescription] = useState<string>('');

    useEffect(() => {
        if (expense) {
            setCategory(expense.category);
            setAmount(expense.amount.toString());
            setPaymentMethod(expense.payment_method);
            setExpenseDate(expense.expense_date);
            setDescription(expense.description || '');
        } else {
            // Reset for new expense
            setCategory(ExpenseCategory.MISCELLANEOUS);
            setAmount('');
            setPaymentMethod(PaymentMethod.CASH);
            setExpenseDate(format(new Date(), 'yyyy-MM-dd'));
            setDescription('');
        }
    }, [expense, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const expenseData = {
            category,
            amount: parseFloat(amount),
            payment_method: paymentMethod,
            expense_date: expenseDate,
            description: description.trim() || undefined,
        };

        try {
            if (isEditing && expense) {
                await updateExpense(expense.id, expenseData as ExpenseUpdate);
            } else {
                await createExpense(expenseData as ExpenseCreate);
            }

            // Refresh global stats
            useDashboardStore.getState().fetchStats();

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Failed to save expense:', err);
            setError(err.response?.data?.detail || 'Failed to save expense. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = Object.values(ExpenseCategory);
    const paymentMethods = Object.values(PaymentMethod);

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="bg-background w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col relative animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-border bg-card flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">
                                {isEditing ? 'Edit Expense' : 'Record Expense'}
                            </h2>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">
                                {isEditing ? 'Update transaction details' : 'Log a new gym cost'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted transition-colors text-text-secondary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500 text-sm font-bold">
                            <CheckCircle2 size={18} />
                            Expense saved successfully!
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        {/* Amount */}
                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black text-text-primary uppercase tracking-widest ml-1">Amount</label>
                            <div className="relative group">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-muted/50 border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black text-text-primary uppercase tracking-widest ml-1">Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    required
                                    type="date"
                                    value={expenseDate}
                                    max={format(new Date(), 'yyyy-MM-dd')}
                                    onChange={(e) => setExpenseDate(e.target.value)}
                                    className="w-full bg-muted/50 border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black text-text-primary uppercase tracking-widest ml-1">Category</label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                                    className="w-full bg-muted/50 border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer capitalize"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black text-text-primary uppercase tracking-widest ml-1">Payment Method</label>
                            <div className="relative group">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                    className="w-full bg-muted/50 border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer capitalize"
                                >
                                    {paymentMethods.map((pm: any) => (
                                        <option key={pm} value={pm}>{pm.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-text-primary uppercase tracking-widest ml-1">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full bg-muted/50 border border-border rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                placeholder="What was this for?"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-2xl bg-muted border border-border font-black uppercase text-[10px] tracking-widest text-text-primary hover:bg-border transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-2 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-glow hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {isEditing ? 'Update Expense' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
