'use client';

import { Calendar } from 'lucide-react';

interface AttendanceChartProps {
    data?: any[];
    isLoading?: boolean;
}

export const AttendanceChart = ({ data, isLoading }: AttendanceChartProps) => {
    return (
        <div className="h-[400px] w-full rounded-xl bg-card border border-border p-6 flex flex-col items-center justify-center shadow-soft">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar size={40} className="text-primary" />
            </div>
            <div className="text-center max-w-md">
                <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-2">
                    Attendance Tracking
                </h3>
                <p className="text-text-secondary font-bold uppercase tracking-wider text-xs mb-4">
                    Coming Soon
                </p>
                <p className="text-text-secondary text-sm">
                    Attendance tracking and analytics will be available in a future update. Track daily check-ins, peak hours, and member engagement patterns.
                </p>
            </div>
        </div>
    );
};
