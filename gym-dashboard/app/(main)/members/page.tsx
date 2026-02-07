'use client';

import React from 'react';
import { DataTable } from '@/components/members/DataTable';
import { columns } from '@/components/members/columns';
import { UserPlus } from 'lucide-react';
import { MOCK_MEMBERS } from '@/lib/mockData';

export default function Members() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-end">
                <button
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 transition-colors"
                >
                    <UserPlus size={18} />
                    Add New Member
                </button>
            </div>

            <DataTable columns={columns} data={MOCK_MEMBERS as any[]} />
        </div>
    );
}
