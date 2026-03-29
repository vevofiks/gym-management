'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MemberProfileDetail } from '@/components/members/MemberProfileDetail';
import { ChevronLeft } from 'lucide-react';

export default function MemberProfilePage() {
    const params = useParams();
    const router = useRouter();
    const memberId = parseInt(params.id as string);

    if (isNaN(memberId)) {
        return (
            <div className="p-8 text-center bg-card rounded-xl border border-border shadow-soft">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Invalid Member ID</h2>
                <button
                    onClick={() => router.push('/members')}
                    className="px-6 py-2 bg-primary text-white rounded-xl font-bold"
                >
                    Back to Members
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push('/members')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-text-secondary hover:text-primary font-bold transition-all hover:shadow-soft"
                >
                    <ChevronLeft size={20} />
                    Back to Members List
                </button>
            </div>

            <div className="w-full">
                <MemberProfileDetail
                    memberId={memberId}
                    layoutMode="page"
                />
            </div>
        </div>
    );
}
