'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Cake } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from 'date-fns';
import { UpcomingBirthday } from '@/types';

interface BirthdayCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    birthdays: UpcomingBirthday[];
}

export const BirthdayCalendarModal: React.FC<BirthdayCalendarModalProps> = ({
    isOpen,
    onClose,
    birthdays,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    if (!isOpen) return null;

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "MMMM yyyy";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const getBirthdaysForDay = (day: Date) => {
        return birthdays.filter(b => {
            const bDate = new Date(b.date_of_birth);
            return bDate.getDate() === day.getDate() && bDate.getMonth() === day.getMonth();
        });
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                            <Cake className="text-pink-500" size={24} />
                            Birthday Calendar
                        </h2>
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-widest mt-1">
                            Celebrating our gym community
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-background border border-border rounded-xl p-1 mr-4">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-muted rounded-xl transition-colors">
                                <ChevronLeft size={18} />
                            </button>
                            <span className="px-3 text-xs font-black text-text-primary uppercase min-w-[120px] text-center">
                                {format(currentDate, dateFormat)}
                            </span>
                            <button onClick={nextMonth} className="p-1.5 hover:bg-muted rounded-xl transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-7 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-[10px] font-black text-text-secondary uppercase tracking-widest py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, i) => {
                            const dayBirthdays = getBirthdaysForDay(day);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <div
                                    key={i}
                                    className={`min-h-[80px] p-2 border border-border/30 rounded-xl transition-all relative ${isCurrentMonth ? 'bg-background/20' : 'bg-background/5 opacity-40'
                                        } ${isToday ? 'ring-2 ring-primary/30 ring-inset' : ''} ${dayBirthdays.length > 0 ? 'bg-pink-500/5 border-pink-500/20' : ''}`}
                                >
                                    <span className={`text-[10px] font-bold ${isToday ? 'text-primary' : 'text-text-secondary'}`}>
                                        {format(day, "d")}
                                    </span>

                                    <div className="mt-1 space-y-1">
                                        {dayBirthdays.map((b, idx) => (
                                            <div key={idx} className="bg-pink-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black truncate flex items-center gap-1">
                                                <Cake size={8} />
                                                {b.name.split(' ')[0]}
                                            </div>
                                        ))}
                                    </div>

                                    {isToday && (
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-muted/20">
                    <div className="flex items-center gap-2 text-xs text-text-secondary font-medium italic">
                        <Cake size={14} className="text-pink-500" />
                        Birthdays are highlighted in pink. Don't forget to wish them!
                    </div>
                </div>
            </div>
        </div>
    );
};
