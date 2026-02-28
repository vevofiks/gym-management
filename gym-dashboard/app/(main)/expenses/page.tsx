'use client';

import { useState, useEffect } from 'react';
import {
    Receipt,
    Plus,
    TrendingUp,
    Calendar,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    RefreshCw
} from 'lucide-react';
import {
    ExpenseResponse,
    ExpenseCategory,
    ExpenseSummary,
    PaymentMethod
} from '@/types';
import { getExpenses, deleteExpense, getExpenseSummary } from '@/services/expenseService';
import { DataTable } from '@/components/members/DataTable';
import { columns } from '@/components/expenses/columns';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [summary, setSummary] = useState<ExpenseSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseResponse | undefined>(undefined);
    const [deletingExpense, setDeletingExpense] = useState<ExpenseResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | undefined>(undefined);

    const fetchData = async () => {
        try {
            setIsRefreshing(true);
            const [expenseData, summaryData] = await Promise.all([
                getExpenses({
                    page: 1,
                    page_size: 100,
                    start_date: startDate,
                    end_date: endDate,
                    category: categoryFilter
                }),
                getExpenseSummary(startDate, endDate)
            ]);

            setExpenses(expenseData.expenses);
            setSummary(summaryData);
        } catch (error: any) {
            console.error('Failed to fetch expenses:', error);
            toast.error('Failed to load expense data');
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate, categoryFilter]);

    const handleDelete = async () => {
        if (!deletingExpense) return;

        try {
            setIsSubmitting(true);
            await deleteExpense(deletingExpense.id);
            toast.success('Expense deleted successfully');
            setDeletingExpense(null);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to delete expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (expense: ExpenseResponse) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingExpense(undefined);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-end gap-4">
                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        disabled={isRefreshing}
                        className="p-3 rounded-xl bg-card border border-border text-text-secondary hover:text-primary transition-all active:scale-95 shadow-soft"
                    >
                        <RefreshCw size={20} className={cn(isRefreshing && "animate-spin")} />
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-glow hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Add New Expense
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-6 rounded-3xl shadow-soft">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary"><DollarSign size={20} /></div>
                    </div>
                    <div className="text-3xl font-black text-text-primary">
                        ₹{summary?.total_expenses.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Expenses</div>
                </div>

                <div className="bg-card border border-border p-6 rounded-3xl shadow-soft">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><Receipt size={20} /></div>
                    </div>
                    <div className="text-3xl font-black text-text-primary">{summary?.total_count || 0}</div>
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Transaction Count</div>
                </div>

                {summary?.by_category && summary.by_category.length > 0 && (<div className="bg-card border border-border p-6 rounded-3xl shadow-soft">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500"><TrendingUp size={20} /></div>
                    </div>
                    <div className="text-xl font-black text-text-primary capitalize truncate">
                        {summary?.by_category[0]?.category || 'N/A'}
                    </div>
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Top Category</div>
                </div>)}

                <div className="bg-card border border-border p-6 rounded-3xl shadow-soft">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-500/10 rounded-xl text-green-500"><Calendar size={20} /></div>
                    </div>
                    <div className="text-xl font-black text-text-primary">
                        {format(new Date(startDate), 'MMM')} - {format(new Date(endDate), 'MMM')}
                    </div>
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active View</div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-card border border-border p-4 rounded-3xl shadow-soft flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                    <Filter size={18} className="text-text-secondary" />
                    <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">Filters:</span>
                </div>

                <div className="flex items-center gap-4 flex-1 flex-wrap">
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">From</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-muted px-3 py-1.5 rounded-lg text-xs font-bold border border-border outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">To</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-muted px-3 py-1.5 rounded-lg text-xs font-bold border border-border outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Category</label>
                        <select
                            value={categoryFilter || ''}
                            onChange={(e) => setCategoryFilter(e.target.value ? e.target.value as ExpenseCategory : undefined)}
                            className="bg-muted px-3 py-1.5 rounded-lg text-xs font-bold border border-border outline-none focus:border-primary transition-colors appearance-none capitalize cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {Object.values(ExpenseCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {isLoading && !isRefreshing ? (
                <div className="w-full h-96 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">Loading Expenses...</p>
                    </div>
                </div>
            ) : (
                <DataTable
                    title="Transaction History"
                    columns={columns}
                    data={expenses}
                    onEdit={handleEdit}
                    onDelete={(row) => setDeletingExpense(row as ExpenseResponse)}
                />
            )}

            {/* Modals */}
            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                expense={editingExpense}
            />

            <ConfirmDialog
                isOpen={!!deletingExpense}
                onClose={() => setDeletingExpense(null)}
                onConfirm={handleDelete}
                title="Delete Expense"
                message="Are you sure you want to delete this expense record? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={isSubmitting}
            />
        </div>
    );
}
