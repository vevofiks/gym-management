import { api } from '@/store/AuthStore';
import {
    FeeCreate,
    FeeResponse,
    FeeListResponse,
    FeeStats,
    FinancialReport,
    PaymentMethod
} from '@/types';

/**
 * Record a new payment for a member
 */
export const recordPayment = async (memberId: number, feeData: FeeCreate): Promise<FeeResponse> => {
    const response = await api.post<FeeResponse>(`/fees/members/${memberId}`, feeData);
    return response.data;
};

/**
 * Get payment history for a specific member
 */
export const getMemberPaymentHistory = async (
    memberId: number,
    page: number = 1,
    pageSize: number = 50,
    startDate?: string,
    endDate?: string
): Promise<FeeListResponse> => {
    const response = await api.get<FeeListResponse>(`/fees/members/${memberId}`, {
        params: {
            page,
            page_size: pageSize,
            start_date: startDate,
            end_date: endDate
        }
    });
    return response.data;
};

/**
 * List all fee payments for the gym with filters
 */
export const listAllFees = async (params: {
    page?: number;
    page_size?: number;
    start_date?: string;
    end_date?: string;
    payment_method?: PaymentMethod;
}): Promise<FeeListResponse> => {
    const response = await api.get<FeeListResponse>('/fees/', { params });
    return response.data;
};

/**
 * Generate financial report for a date range
 */
export const getFinancialReport = async (startDate: string, endDate: string): Promise<FinancialReport> => {
    const response = await api.get<FinancialReport>('/fees/report', {
        params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
};

/**
 * Get overall fee statistics for the gym
 */
export const getFeeStats = async (): Promise<FeeStats> => {
    const response = await api.get<FeeStats>('/fees/stats');
    return response.data;
};

/**
 * Download a PDF receipt for a specific payment
 */
export const downloadPaymentReceipt = async (feeId: number): Promise<void> => {
    const response = await api.get(`/fees/${feeId}/receipt`, {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt_${feeId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

/**
 * Export all payments to CSV
 */
export const exportPaymentsCSV = async (): Promise<void> => {
    const response = await api.get('/fees/export/csv', {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payments_export.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
