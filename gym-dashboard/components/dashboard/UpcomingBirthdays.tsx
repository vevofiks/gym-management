import React, { useState } from 'react';
import { UpcomingBirthday } from '@/types';
import { Skeleton } from '../ui/Skeleton';
import { Cake, ChevronRight } from 'lucide-react';
import { BirthdayCalendarModal } from './BirthdayCalendarModal';

interface Props {
    birthdays?: UpcomingBirthday[];
    isLoading: boolean;
}

export const UpcomingBirthdays = ({ birthdays, isLoading }: Props) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    if (isLoading) {
        return <Skeleton className="h-[250px] w-full rounded-4xl" />;
    }

    const hasBirthdays = birthdays && birthdays.length > 0;

    return (
        <div className="flex flex-col rounded-4xl bg-card p-6 shadow-soft border border-border h-full">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600">
                        <Cake size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">Upcoming Birthdays</h3>
                        <p className="text-xs font-medium text-text-secondary">Community moments</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {birthdays?.map((birthday) => (
                    <div key={birthday.id} className="flex items-center justify-between rounded-2xl bg-background/50 p-4 border border-transparent hover:border-border transition-all">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600 font-bold text-xs">
                                {birthday.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text-primary leading-none">
                                    {birthday.name}
                                </p>
                                <p className="text-xs font-medium text-text-secondary mt-1.5">
                                    Turning {birthday.age + 1} • {birthday.days_until === 0 ? "Today!" : `In ${birthday.days_until} days`}
                                </p>
                            </div>
                        </div>
                        <div className="text-pink-500">
                            <Cake size={16} />
                        </div>
                    </div>
                ))}

                {!hasBirthdays && (
                    <div className="flex h-full items-center justify-center text-text-secondary py-8">
                        <div className="text-center">
                            <p className="text-sm font-semibold">No birthdays this week.</p>
                        </div>
                    </div>
                )}
            </div>

            {hasBirthdays && (
                <>
                    <button
                        onClick={() => setIsCalendarOpen(true)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-bold text-text-secondary hover:bg-background transition-all"
                    >
                        View Calendar <ChevronRight size={14} />
                    </button>

                    <BirthdayCalendarModal
                        isOpen={isCalendarOpen}
                        onClose={() => setIsCalendarOpen(false)}
                        birthdays={birthdays || []}
                    />
                </>
            )}
        </div>
    );
};
