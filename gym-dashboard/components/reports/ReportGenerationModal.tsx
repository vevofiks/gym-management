'use client';

import React, { useState } from 'react';
import {
    X,
    FileText,
    Download,
    Calendar,
    FileSpreadsheet,
    FileCode,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { api } from '@/store/AuthStore';
import toast from 'react-hot-toast';

interface ReportGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ReportType = 'financial' | 'members' | 'dues' | 'all';
type ReportFormat = 'csv' | 'excel' | 'pdf';

export const ReportGenerationModal = ({ isOpen, onClose }: ReportGenerationModalProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportType, setReportType] = useState<ReportType>('financial');
    const [format, setFormat] = useState<ReportFormat>('pdf');
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await api.get('/reports/export', {
                params: {
                    report_type: reportType,
                    format: format,
                    start_date: startDate,
                    end_date: endDate,
                },
                responseType: 'blob', // Important for file downloads
            });

            // Create a link to download the file
            // Create URL from response blob directly
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.style.display = 'none';

            // Extract filename from Content-Disposition header
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `${reportType}_report.${format === 'excel' ? 'xlsx' : (format === 'csv' && reportType === 'all') ? 'zip' : format === 'pdf' ? 'pdf' : format}`;

            if (contentDisposition) {
                // Robust regex for filename extraction from Content-Disposition
                const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
                if (fileNameMatch) {
                    fileName = fileNameMatch[1].replace(/['"]/g, '').trim();
                }
            }

            // Final fallback check for extension
            const expectedExt = format === 'excel' ? 'xlsx' : (format === 'csv' && reportType === 'all') ? 'zip' : format;
            if (!fileName.toLowerCase().endsWith(`.${expectedExt}`)) {
                fileName = fileName.includes('.') ? fileName : `${fileName}.${expectedExt}`;
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
            toast.success('Report generated successfully!');
            onClose();
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const reportTypes: { id: ReportType; label: string; description: string; icon: any }[] = [
        {
            id: 'financial',
            label: 'Financial Report',
            description: 'Revenue, expenses and profit summary',
            icon: FileText
        },
        {
            id: 'members',
            label: 'Member List',
            description: 'Database of all registered members',
            icon: Calendar
        },
        {
            id: 'dues',
            label: 'Outstanding Dues',
            description: 'List of members with pending payments',
            icon: AlertCircle
        },
        {
            id: 'all',
            label: 'All Reports',
            description: 'Mega export containing all datasets',
            icon: Download
        },
    ];

    const formats: { id: ReportFormat; label: string; icon: any }[] = [
        { id: 'pdf', label: 'PDF Document', icon: FileText },
        { id: 'excel', label: 'Excel Sheet', icon: FileSpreadsheet },
        { id: 'csv', label: 'CSV File', icon: FileCode },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-sidebar border border-border w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Download size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">Generate Report</h2>
                            <p className="text-sm text-text-secondary">Export your gym data in various formats</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-text-secondary">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                    {/* Report Type Selection */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">
                            1. Select Report Type
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {reportTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setReportType(type.id)}
                                    className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all group ${reportType === type.id
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-border hover:border-primary/50 hover:bg-background'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl mb-3 transition-colors ${reportType === type.id ? 'bg-primary text-white' : 'bg-background text-text-secondary group-hover:text-primary'
                                        }`}>
                                        <type.icon size={20} />
                                    </div>
                                    <span className="font-bold text-[10px] text-text-primary mb-1">{type.label}</span>
                                    <span className="text-[8px] text-text-secondary leading-tight line-clamp-2">{type.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range Selection (Only for financial or all) */}
                    {(reportType === 'financial' || reportType === 'all') && (
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">
                                2. Date Range
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase ml-1">Start Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase ml-1">End Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Format Selection */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">
                            {(reportType === 'financial' || reportType === 'all') ? '3.' : '2.'} Choose Format
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {formats.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFormat(f.id)}
                                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${format === f.id
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border text-text-secondary hover:border-primary/20 hover:text-text-primary'
                                        }`}
                                >
                                    <f.icon size={18} />
                                    <span className="font-bold text-sm">{f.label.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                        {reportType === 'all' && format === 'csv' && (
                            <p className="text-[10px] text-amber-500 font-medium ml-1">
                                <AlertCircle size={10} className="inline mr-1" />
                                Multiple CSVs will be downloaded as a single ZIP archive.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-background border-t border-border flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-2 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-glow transition-all disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={20} />
                                Generate & Download
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
