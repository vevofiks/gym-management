import { api } from '@/store/AuthStore';
import {
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseListResponse,
    ExpenseSummary,
    MonthlyExpense,
    CategorySummary,
    ExpenseCategory,
    PaymentMethod
} from '@/types';

/**
 * Create a new expense record
 */
export const createExpense = async (expenseData: ExpenseCreate): Promise<ExpenseResponse> => {
    const response = await api.post<ExpenseResponse>('/expenses/', expenseData);
    return response.data;
};

/**
 * Get all expenses with filters and pagination
 */
export const getExpenses = async (params: {
    page?: number;
    page_size?: number;
    category?: ExpenseCategory;
    start_date?: string;
    end_date?: string;
    payment_method?: PaymentMethod;
}): Promise<ExpenseListResponse> => {
    const response = await api.get<ExpenseListResponse>('/expenses/', { params });
    return response.data;
};

/**
 * Get a single expense by ID
 */
export const getExpenseById = async (expenseId: number): Promise<ExpenseResponse> => {
    const response = await api.get<ExpenseResponse>(`/expenses/${expenseId}`);
    return response.data;
};

/**
 * Update an existing expense
 */
export const updateExpense = async (
    expenseId: number,
    expenseData: ExpenseUpdate
): Promise<ExpenseResponse> => {
    const response = await api.put<ExpenseResponse>(`/expenses/${expenseId}`, expenseData);
    return response.data;
};

/**
 * Delete an expense (soft delete)
 */
export const deleteExpense = async (expenseId: number): Promise<void> => {
    await api.delete(`/expenses/${expenseId}`);
};

/**
 * Get expense summary for a date range
 */
export const getExpenseSummary = async (
    startDate: string,
    endDate: string
): Promise<ExpenseSummary> => {
    const response = await api.get<ExpenseSummary>('/expenses/summary', {
        params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
};

/**
 * Get monthly expense report for a year and optional month
 */
export const getMonthlyReport = async (
    year: number,
    month?: number
): Promise<MonthlyExpense[]> => {
    const response = await api.get<MonthlyExpense[]>('/expenses/monthly', {
        params: { year, month }
    });
    return response.data;
};

/**
 * Get expense breakdown by category
 */
export const getCategoryBreakdown = async (
    startDate?: string,
    endDate?: string
): Promise<CategorySummary[]> => {
    const response = await api.get<CategorySummary[]>('/expenses/by-category', {
        params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
};

/**
 * Export all expenses to CSV
 */
export const exportExpensesCSV = async (): Promise<void> => {
    const response = await api.get('/expenses/export/csv', {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses_export.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};