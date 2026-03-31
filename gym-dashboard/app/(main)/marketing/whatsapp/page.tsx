'use client';

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Users,
    Send,
    Search,
    Filter,
    CheckCircle2,
    AlertCircle,
    CheckSquare,
    Square,
    Clock,
    Flame
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getMembers } from '@/services/memberService';
import { sendBroadcast, getWhatsAppStatus } from '@/services/whatsappService';
import { MemberStatus } from '@/types';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function WhatsAppBroadcastPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<MemberStatus | 'ALL'>('ALL');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [membersRes, statusRes] = await Promise.all([
                getMembers(1, 1000), // Get up to 1000 members for broadcasting
                getWhatsAppStatus()
            ]);
            setMembers(membersRes.members);
            setStatus(statusRes);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load members or WhatsApp status');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMembers = members.filter(m => {
        const matchesSearch = `${m.first_name} ${m.last_name} ${m.phone_number}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'ALL' || m.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredMembers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredMembers.map(m => m.id));
        }
    };

    const toggleMemberSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSendBroadcast = async () => {
        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }
        if (selectedIds.length === 0) {
            toast.error('No recipients selected');
            return;
        }
        if (status?.status !== 'CONNECTED') {
            toast.error('WhatsApp is not connected. Please go to settings to connect.');
            return;
        }

        setIsConfirmOpen(true);
    };

    const executeBroadcast = async () => {
        setIsConfirmOpen(false);

        setIsSending(true);
        try {
            const phoneNumbers = members
                .filter(m => selectedIds.includes(m.id))
                .map(m => m.phone_number);

            const result = await sendBroadcast(phoneNumbers, message);

            if (result.success) {
                toast.success(`Broadcast triggered! ${result.success_count} sent, ${result.failed_count} failed.`);
                setMessage('');
                setSelectedIds([]);
            } else {
                toast.error(result.error || 'Failed to send broadcast');
            }
        } catch (error) {
            console.error('Broadcast error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSending(false);
        }
    };

    const getStatusVariant = (s: string) => {
        switch (s) {
            case MemberStatus.ACTIVE: return 'bg-green-500/10 text-green-500 border-green-500/20';
            case MemberStatus.EXPIRED: return 'bg-red-500/10 text-red-500 border-red-500/20';
            case MemberStatus.INACTIVE: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">

                <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm",
                    status?.status === 'CONNECTED'
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                    {status?.status === 'CONNECTED' ? (
                        <CheckCircle2 size={18} />
                    ) : (
                        <AlertCircle size={18} />
                    )}
                    WhatsApp: {status?.status || 'CHECKING...'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Message Composition */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-soft space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-text-primary uppercase tracking-widest">
                                Your Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here... Use a friendly tone!"
                                className="w-full h-48 bg-background border border-border rounded-xl p-4 text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none outline-none font-medium text-sm"
                            />
                            <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase">
                                <span>{message.length} characters</span>
                                <span>Shift + Enter for new line</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Flame size={12} /> Pro Tip
                                </h4>
                                <p className="text-xs text-text-secondary leading-relaxed italic">
                                    Avoid sending very long messages or too many links to prevent being flagged as spam by WhatsApp.
                                </p>
                            </div>

                            <button
                                onClick={handleSendBroadcast}
                                disabled={isSending || selectedIds.length === 0}
                                className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-glow hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Send to {selectedIds.length} Recipients
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Recipient Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden flex flex-col max-h-[700px]">
                        {/* Filters & Search */}
                        <div className="p-6 border-b border-border space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or phone..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-medium outline-none focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                    {['ALL', MemberStatus.ACTIVE, MemberStatus.EXPIRED, MemberStatus.INACTIVE].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setActiveFilter(f as any)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                                activeFilter === f
                                                    ? "bg-primary text-white border-primary shadow-glow"
                                                    : "bg-background text-text-secondary border-border hover:bg-muted"
                                            )}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                    {selectedIds.length} of {filteredMembers.length} members selected
                                </div>
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:underline"
                                >
                                    {selectedIds.length === filteredMembers.length ? 'Deselect All' : 'Select All Filtered'}
                                </button>
                            </div>
                        </div>

                        {/* Member List */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center p-20 gap-4">
                                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Loading members...</p>
                                </div>
                            ) : filteredMembers.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {filteredMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            onClick={() => toggleMemberSelection(member.id)}
                                            className={cn(
                                                "p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group",
                                                selectedIds.includes(member.id) && "bg-primary/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-primary transition-transform group-active:scale-90">
                                                    {selectedIds.includes(member.id) ? (
                                                        <CheckSquare size={24} className="fill-primary text-white" />
                                                    ) : (
                                                        <Square size={24} className="text-border" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-text-secondary font-bold text-xs">
                                                        {member.first_name[0]}{member.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-text-primary capitalize">
                                                            {member.first_name} {member.last_name}
                                                        </div>
                                                        <div className="text-[10px] text-text-secondary font-medium">
                                                            {member.phone_number}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shrink-0",
                                                    getStatusVariant(member.status)
                                                )}>
                                                    {member.status}
                                                </span>
                                                <div className="text-[9px] text-text-secondary font-bold">
                                                    Joined {format(new Date(member.joining_date), 'MMM yyyy')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center space-y-4">
                                    <Users className="mx-auto text-text-secondary/20" size={64} />
                                    <p className="text-text-secondary font-medium italic">No members found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeBroadcast}
                title="Send Broadcast?"
                message={`Are you sure you want to send this message to ${selectedIds.length} members? This action cannot be undone.`}
                confirmText={`Send to ${selectedIds.length} Members`}
                variant="info"
                isLoading={isSending}
            />
        </div>
    );
}
