'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/members/DataTable';
import { columns } from '@/components/members/columns';
import {
    Clock,
    AlertCircle,
    Wallet,
    ChevronLeft,
    RefreshCw,
    Search
} from 'lucide-react';
import { MemberResponse } from '@/types/index';
import { getMembers } from '@/services/memberService';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type ReportTab = 'expiring_soon' | 'expired' | 'outstanding_dues';

function InsightsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get initial tab from URL or default to expiring_soon
    const filterParam = searchParams.get('filter') as ReportTab;
    const initialTab: ReportTab = (filterParam && ['expiring_soon', 'expired', 'outstanding_dues'].includes(filterParam))
        ? filterParam
        : 'expiring_soon';

    const [activeTab, setActiveTab] = useState<ReportTab>(initialTab);
    const [members, setMembers] = useState<MemberResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async (tab: ReportTab, search?: string) => {
        try {
            setIsRefreshing(true);
            const response = await getMembers(1, 100, search, undefined, tab);
            setMembers(response.members);
        } catch (error: any) {
            toast.error('Failed to fetch report data');
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData(activeTab, searchTerm);
    };

    const tabs = [
        {
            id: 'expiring_soon' as ReportTab,
            label: 'Expiring Soon',
            icon: Clock,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10'
        },
        {
            id: 'expired' as ReportTab,
            label: 'Expired',
            icon: AlertCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10'
        },
        {
            id: 'outstanding_dues' as ReportTab,
            label: 'Outstanding Payments',
            icon: Wallet,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10'
        },
    ];

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               

               
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex flex-col gap-4 p-6 rounded-3xl border transition-all duration-300 text-left",
                                isActive
                                    ? "bg-card border-primary shadow-glow scale-[1.02] z-10"
                                    : "bg-card/50 border-border hover:border-primary/50 hover:bg-card"
                            )}
                        >
                            <div className={cn("p-2 rounded-xl w-fit", tab.bgColor, tab.color)}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <div className={cn("text-lg font-black uppercase tracking-tight", isActive ? "text-text-primary" : "text-text-secondary")}>
                                    {tab.label}
                                </div>
                                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                                    {isActive ? "Currently Viewing" : "Click to view report"}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Table Section */}
            <div className="bg-card rounded-4xl border border-border shadow-soft overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10">
                    <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                        {tabs.find(t => t.id === activeTab)?.label} List ({members.length})
                    </h2>
                     <div className="flex items-center gap-3">
                    <form onSubmit={handleSearch} className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search in report..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full md:w-64 font-medium"
                        />
                    </form>
                    <button
                        onClick={() => fetchData(activeTab, searchTerm)}
                        disabled={isRefreshing}
                        className="p-2.5 rounded-xl bg-card border border-border text-text-secondary hover:text-primary transition-all hover:shadow-soft disabled:opacity-50"
                    >
                        <RefreshCw size={20} className={cn(isRefreshing && "animate-spin")} />
                    </button>
                </div>
                </div>

                {isLoading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-4">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="text-xs font-black text-text-secondary uppercase tracking-widest animate-pulse">Loading Report...</div>
                    </div>
                ) : members.length === 0 ? (
                    <div className="h-96 flex flex-col items-center justify-center text-center p-8">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <Clock size={40} className="text-text-secondary opacity-20" />
                        </div>
                        <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">No Results Found</h3>
                        <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mt-2">Everything looks clear in this category!</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={members}
                        onView={(member) => router.push(`/members/${(member as MemberResponse).id}`)}
                    />
                )}
            </div>
        </div>
    );
}

export default function InsightsPage() {
    return (
        <Suspense fallback={<div>Loading Insights...</div>}>
            <InsightsContent />
        </Suspense>
    );
}
