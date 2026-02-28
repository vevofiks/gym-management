'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ExpenseResponse, ExpenseCategory, PaymentMethod } from '@/types';
import { format } from 'date-fns';
import { formatDate } from '@/lib/utils';
import {
    Utensils,
    Home,
    Zap,
    Dumbbell,
    Wrench,
    Users,
    Megaphone,
    Package,
    MoreHorizontal
} from 'lucide-react';

const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
    [ExpenseCategory.RENT]: <Home size={14} />,
    [ExpenseCategory.UTILITIES]: <Zap size={14} />,
    [ExpenseCategory.EQUIPMENT]: <Dumbbell size={14} />,
    [ExpenseCategory.MAINTENANCE]: <Wrench size={14} />,
    [ExpenseCategory.SALARIES]: <Users size={14} />,
    [ExpenseCategory.MARKETING]: <Megaphone size={14} />,
    [ExpenseCategory.SUPPLIES]: <Package size={14} />,
    [ExpenseCategory.MISCELLANEOUS]: <MoreHorizontal size={14} />,
};

export const columns: ColumnDef<ExpenseResponse>[] = [
    {
        accessorKey: 'expense_date',
        header: 'Date',
        cell: ({ row }) => {
            return (
                <div className="font-bold text-text-primary">
                    {formatDate(row.getValue('expense_date'))}
                </div>
            );
        },
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
            const category = row.getValue('category') as ExpenseCategory;
            return (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-muted text-text-secondary">
                        {categoryIcons[category] || <MoreHorizontal size={14} />}
                    </div>
                    <span className="capitalize font-bold text-text-primary">
                        {category}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
            const description = row.getValue('description') as string;
            return (
                <div className="max-w-[200px] truncate text-text-secondary font-medium italic">
                    {description || 'No description'}
                </div>
            );
        },
    },
    {
        accessorKey: 'payment_method',
        header: 'Method',
        cell: ({ row }) => {
            const method = row.getValue('payment_method') as PaymentMethod;
            return (
                <span className="px-2 py-1 rounded-lg bg-muted border border-border text-[10px] font-black uppercase text-text-secondary">
                    {method.replace('_', ' ')}
                </span>
            );
        },
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('amount'));
            return (
                <div className="text-right font-black text-text-primary">
                    ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: '',
        // Actions are handled by DataTable component
    },
];
