import React from 'react';
import { Download, FileText, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
    id: number;
    payment_date: string;
    amount: number;
    status: 'success' | 'failed' | 'pending' | 'refunded';
    payment_method: string;
    invoice_url?: string;
    plan_id: number;
    notes?: string;
}

interface PaymentHistoryTableProps {
    payments: Payment[];
    isLoading: boolean;
}

const PaymentHistoryTable = ({ payments, isLoading }: PaymentHistoryTableProps) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-bold uppercase tracking-wider border border-green-500/20">
                        <CheckCircle2 size={12} />
                        Success
                    </div>
                );
            case 'failed':
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-bold uppercase tracking-wider border border-red-500/20">
                        <XCircle size={12} />
                        Failed
                    </div>
                );
            case 'pending':
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
                        <Clock size={12} />
                        Pending
                    </div>
                );
            default:
                return (
                    <div className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                        {status}
                    </div>
                );
        }
    };

    const handleDownloadInvoice = (payment: Payment) => {
        if (payment.invoice_url) {
            window.open(payment.invoice_url, '_blank');
        } else {
            // Fallback: Generate a simple print view
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Invoice #${payment.id}</title>
                            <style>
                                body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; mx-auto; }
                                .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                                h1 { margin: 0; color: #333; }
                                .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                                .label { color: #666; font-size: 0.9em; margin-bottom: 5px; }
                                .value { font-weight: bold; font-size: 1.1em; }
                                .total { border-top: 2px solid #eee; padding-top: 20px; text-align: right; font-size: 1.5em; font-weight: bold; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>Payment Receipt</h1>
                                <p>Transaction ID: #${payment.id}</p>
                            </div>
                            <div class="details">
                                <div>
                                    <div class="label">Date</div>
                                    <div class="value">${new Date(payment.payment_date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div class="label">Payment Method</div>
                                    <div class="value">${payment.payment_method?.toUpperCase() || 'N/A'}</div>
                                </div>
                                <div>
                                    <div class="label">Status</div>
                                    <div class="value">${payment.status.toUpperCase()}</div>
                                </div>
                                <div>
                                    <div class="label">Plan</div>
                                    <div class="value">${payment.notes || 'Subscription'}</div>
                                </div>
                            </div>
                            <div class="total">
                                Total Paid: ₹${payment.amount}
                            </div>
                            <script>window.print();</script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-48 flex items-center justify-center bg-card rounded-xl border border-border">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="w-full py-12 flex flex-col items-center justify-center bg-card rounded-xl border border-border text-center px-4">
                <div className="h-16 w-16 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground mb-4">
                    <FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground">No Payment History</h3>
                <p className="text-muted-foreground text-sm max-w-sm mt-1">
                    You haven't made any payments yet. Your transaction history will appear here once you subscribe to a plan.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <FileText className="text-primary" size={24} />
                    Payment History
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-secondary/30">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Invoice</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-secondary/10 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                    {payment.payment_date ? format(new Date(payment.payment_date), 'MMM dd, yyyy') : '-'}
                                    <div className="text-xs text-muted-foreground">
                                        {payment.payment_date ? format(new Date(payment.payment_date), 'hh:mm a') : ''}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    <div className="font-medium text-foreground">{payment.notes || 'Subscription Payment'}</div>
                                    <div className="text-xs">{payment.payment_method?.toUpperCase() || 'Card'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground">
                                    ₹{payment.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(payment.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDownloadInvoice(payment)}
                                        className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10"
                                    >
                                        <Download size={14} />
                                        Download
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentHistoryTable;
