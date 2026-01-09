'use client';

import React from 'react';
import { DataTable } from '@/components/members/DataTable';
import { columns } from '@/components/members/columns';
import { useMembers } from '@/hooks/useGymData';
import { Skeleton } from '@/components/ui/Skeleton';
import { UserPlus } from 'lucide-react';

export default function Members() {
    const { data: members, isLoading } = useMembers();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-end">
                <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 transition-colors">
                    <UserPlus size={18} />
                    Add New Member
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-[500px] w-full rounded-4xl" />
                </div>
            ) : (
                <DataTable columns={columns} data={members || []} />
            )}
        </div>
    );
}
