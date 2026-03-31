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
    gymName?: string;
    ownerName?: string;
}

const PaymentHistoryTable = ({ payments, isLoading, gymName, ownerName }: PaymentHistoryTableProps) => {
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
            // Fallback: Generate a professional print view
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                const date = new Date(payment.payment_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });

                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Invoice #${payment.id}</title>
                            <style>
                                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                                
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                body { 
                                    font-family: 'Inter', system-ui, -apple-system, sans-serif; 
                                    color: #1a1a1a;
                                    line-height: 1.5;
                                    padding: 0;
                                    margin: 0;
                                    background: #fff;
                                }
                                .container { 
                                    width: 100%;
                                    max-width: 800px; 
                                    margin: 0 auto; 
                                    padding: 40px;
                                    position: relative;
                                }
                                
                                .header { 
                                    display: flex; 
                                    justify-content: space-between; 
                                    align-items: center;
                                    margin-bottom: 60px;
                                }
                                .logo-container { display: flex; items-center; gap: 12px; }
                                .logo { height: 32px; width: 32px; object-fit: contain; }
                                .company-name { font-size: 22px; font-weight: 900; color: #000; letter-spacing: -1px; text-transform: uppercase; }
                                
                                .invoice-meta { text-align: right; }
                                .invoice-title { 
                                    font-size: 100px; 
                                    font-weight: 900; 
                                    color: #f3f4f6; 
                                    position: absolute; 
                                    top: 10px; 
                                    right: 40px; 
                                    z-index: -1;
                                    opacity: 0.5;
                                }
                                .meta-item { margin-bottom: 4px; }
                                .meta-label { font-size: 9px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; }
                                .meta-value { font-size: 13px; font-weight: 700; color: #111827; }
                                
                                .billing-grid { 
                                    display: grid; 
                                    grid-template-columns: 1fr 1fr; 
                                    gap: 60px; 
                                    margin-bottom: 60px; 
                                }
                                .billing-section h3 { 
                                    font-size: 9px; 
                                    font-weight: 800; 
                                    color: #9ca3af; 
                                    text-transform: uppercase; 
                                    letter-spacing: 2px;
                                    margin-bottom: 12px;
                                    border-bottom: 2px solid #f9fafb;
                                    padding-bottom: 8px;
                                }
                                
                                .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                                .table th { 
                                    text-align: left; 
                                    padding: 12px 0; 
                                    font-size: 9px; 
                                    font-weight: 800; 
                                    color: #9ca3af; 
                                    text-transform: uppercase; 
                                    letter-spacing: 2px;
                                    border-bottom: 2px solid #111827;
                                }
                                .table td { padding: 24px 0; border-bottom: 1px solid #f9fafb; font-size: 14px; }
                                .item-desc { font-weight: 700; color: #111827; font-size: 15px; }
                                .item-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }
                                
                                .totals { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
                                .total-row { display: flex; gap: 60px; align-items: baseline; }
                                .total-label { font-size: 13px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
                                .total-value { font-size: 28px; font-weight: 900; color: #111827; }
                                
                                .status-stamp {
                                    display: inline-block;
                                    padding: 10px 20px;
                                    border: 4px solid #10b981;
                                    color: #10b981;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    border-radius: 8px;
                                    transform: rotate(-15deg);
                                    opacity: 0.9;
                                    font-size: 28px;
                                    margin-top: 20px;
                                }
                                .status-stamp.failed { border-color: #ef4444; color: #ef4444; }
                                
                                .footer { 
                                    margin-top: 50px; 
                                    border-top: 2px solid #f9fafb; 
                                    padding-top: 30px;
                                    font-size: 11px;
                                    color: #9ca3af;
                                    text-align: center;
                                    letter-spacing: 0.5px;
                                }
                                
                                .no-print { 
                                    position: fixed; 
                                    top: 20px; 
                                    right: 20px; 
                                    z-index: 100; 
                                }
                                .download-btn {
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    padding: 12px 24px;
                                    background: #111827;
                                    color: #fff;
                                    border: none;
                                    border-radius: 12px;
                                    font-weight: 700;
                                    font-size: 14px;
                                    cursor: pointer;
                                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                                    transition: all 0.2s;
                                }
                                .download-btn:hover {
                                    transform: translateY(-2px);
                                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                                    background: #000;
                                }
                                
                                @media print {
                                    body { padding: 0; margin: 0; }
                                    .container { 
                                        max-width: none; 
                                        width: 100%; 
                                        padding: 50px; 
                                    }
                                    .invoice-title { opacity: 0.2; }
                                    .no-print { display: none; }
                                }
                            </style>
                            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
                        </head>
                        <body>
                            <div class="no-print">
                                <button onclick="downloadPDF()" class="download-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    Download PDF
                                </button>
                            </div>
                            
                            <div id="invoice-content" class="container">
                                <div class="header">
                                    <div class="logo-container">
                                        <img src="/favicon.ico" class="logo" alt="Logo" onerror="this.style.display='none';">
                                        <div class="company-name">FitDash</div>
                                    </div>
                                    <div class="invoice-meta">
                                        <div class="meta-item">
                                            <div class="meta-label">Invoice Number</div>
                                            <div class="meta-value">#INV-${payment.id}</div>
                                        </div>
                                        <div class="meta-item">
                                            <div class="meta-label">Date Issued</div>
                                            <div class="meta-value">${date}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="billing-grid">
                                    <div class="billing-section">
                                        <h3>Billed By</h3>
                                        <div class="meta-value" style="font-size: 16px;">FitDash</div>
                                        <div class="item-sub">By Vevofiks Solutions, Software Development & Services<br>Kerala, India</div>
                                    </div>
                                    <div class="billing-section" style="text-align: right;">
                                        <h3>Billed To</h3>
                                        <div class="meta-value" style="font-size: 16px;">${ownerName || 'Gym Owner'}</div>
                                        <div class="item-sub">${gymName || 'Your Gym'}<br>Reference ID: ${payment.plan_id}</div>
                                    </div>
                                </div>
                                
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th style="text-align: right;">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div class="item-desc">${payment.notes || 'Gym Management Subscription'}</div>
                                                <div class="item-sub">Service Period: 30 Days</div>
                                            </td>
                                            <td style="text-align: right; font-weight: 600;">₹${payment.amount.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <div class="totals">
                                    <div class="total-row">
                                        <div class="total-label">Grand Total</div>
                                        <div class="total-value">₹${payment.amount.toLocaleString()}</div>
                                    </div>
                                    <div class="status-stamp ${payment.status === 'success' ? '' : 'failed'}">
                                        ${payment.status === 'success' ? 'PAID' : 'FAILED'}
                                    </div>
                                </div>
                                
                                <div class="footer">
                                    This is a computer-generated document. No signature required.
                                    <br>Support: support@vevofiks.com | website: vevofiks.com
                                </div>
                            </div>
                            <script>
                                function downloadPDF() {
                                    const element = document.getElementById('invoice-content');
                                    const opt = {
                                        margin: 0,
                                        filename: 'Invoice_#INV-${payment.id}.pdf',
                                        image: { type: 'jpeg', quality: 0.98 },
                                        html2canvas: { scale: 2, useCORS: true },
                                        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                                    };
                                    html2pdf().from(element).set(opt).save();
                                }
                            </script>
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
