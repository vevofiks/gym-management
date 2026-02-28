'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    UserCircle,
    Search,
    Send,
    MessageCircle,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight,
    Apple
} from 'lucide-react';
import {
    DietPlanTemplateResponse,
    MemberResponse,
    DietPlanAssignmentCreate
} from '@/types';
import { getMembers } from '@/services/memberService';
import { assignToMember } from '@/services/dietPlanService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/AuthStore';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface AssignDietModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: DietPlanTemplateResponse;
}

export const AssignDietModal: React.FC<AssignDietModalProps> = ({
    isOpen,
    onClose,
    template,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState<MemberResponse[]>([]);
    const [selectedMember, setSelectedMember] = useState<MemberResponse | null>(null);
    const [notes, setNotes] = useState('');
    const [sendWhatsApp, setSendWhatsApp] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const planName = user?.plan_name?.toLowerCase() || '';
    const isPro = ['pro', 'trial'].includes(planName);
    const isStarter = planName === 'starter' || planName === 'basic';

    // Auto-enable WhatsApp for pro/trial users, disable for starter
    useEffect(() => {
        setSendWhatsApp(isPro);
    }, [isPro]);

    // Search members as user types
    useEffect(() => {
        if (!isOpen) return;

        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length < 2 && searchTerm.length > 0) return;

            setIsSearching(true);
            try {
                const response = await getMembers(1, 5, searchTerm);
                setMembers(response.members);
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, isOpen]);

    if (!isOpen) return null;

    const handleAssign = async () => {
        if (!selectedMember) return;

        setIsLoading(true);
        setError(null);

        const assignmentData: DietPlanAssignmentCreate = {
            template_id: template.id,
            member_id: selectedMember.id,
            notes: notes.trim() || undefined,
            send_whatsapp: sendWhatsApp,
        };

        try {
            await assignToMember(assignmentData);
            setSuccess(true);
            toast.success(`Diet plan assigned to ${selectedMember.first_name}`);

            setTimeout(() => {
                onClose();
                setSuccess(false);
                setSelectedMember(null);
                setNotes('');
            }, 1500);
        } catch (err: any) {
            console.error('Boarding failed:', err);
            setError(err.response?.data?.detail || 'Failed to assign diet plan.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyPlan = () => {
        const mealText = template.meals.map(meal =>
            `⏰ ${meal.time} - ${meal.name}\n${meal.items.map(i => `  • ${i}`).join('\n')}`
        ).join('\n\n');

        const fullText = `🥗 *${template.name}*\n\nYour personalized diet plan is ready:\n\n${mealText}\n\n${template.instructions ? `📝 Instructions:\n${template.instructions}\n\n` : ''}${notes ? `📝 Custom Notes:\n${notes}\n\n` : ''}Stay healthy! 💪`;

        navigator.clipboard.writeText(fullText);
        toast.success("Diet plan copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="bg-background w-full max-w-md rounded-4xl overflow-hidden shadow-2xl border border-border flex flex-col relative animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-border bg-card flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Apple size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-text-primary uppercase tracking-tight">Assign Diet Plan</h2>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{template.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-muted transition-colors text-text-secondary"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {success ? (
                        <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary">Plan Assigned!</h3>
                            <p className="text-sm text-text-secondary max-w-[250px]">
                                {template.name} has been successfully assigned to {selectedMember?.first_name}.
                                {sendWhatsApp && " A WhatsApp message is being sent."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            {/* Member Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Search Member</label>
                                {!selectedMember ? (
                                    <div className="relative group">
                                        <Search className={cn(
                                            "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                                            isSearching ? "text-primary animate-pulse" : "text-text-secondary"
                                        )} />
                                        <Input
                                            autoFocus
                                            placeholder="Member name or phone..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-11 h-11 bg-muted/30 border-border rounded-xl font-bold"
                                        />

                                        {/* Dropdown Results */}
                                        {searchTerm.length >= 2 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-sidebar border border-border rounded-2xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-top-2">
                                                {isSearching ? (
                                                    <div className="p-4 flex items-center justify-center gap-2 text-xs text-text-secondary uppercase font-black">
                                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                        Searching...
                                                    </div>
                                                ) : members.length > 0 ? (
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {members.map(member => (
                                                            <button
                                                                key={member.id}
                                                                onClick={() => setSelectedMember(member)}
                                                                className="w-full p-4 flex items-center gap-3 hover:bg-primary/5 transition-all text-left group/item border-b border-border/50 last:border-0"
                                                            >
                                                                <div className="h-10 w-10 rounded-full bg-muted/50 border border-border flex items-center justify-center text-text-primary font-bold overflow-hidden">
                                                                    {member.before_photo_url ? (
                                                                        <img src={member.before_photo_url} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        member.first_name.charAt(0)
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-bold text-text-primary group-hover/item:text-primary transition-colors">
                                                                        {member.first_name} {member.last_name}
                                                                    </div>
                                                                    <div className="text-[10px] text-text-secondary font-medium tracking-wider">
                                                                        {member.phone_number}
                                                                    </div>
                                                                </div>
                                                                <ChevronRight size={16} className="text-text-secondary opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 text-xs text-text-secondary font-bold text-center">
                                                        No members found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl group relative animate-in zoom-in-95">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl overflow-hidden">
                                            {selectedMember.before_photo_url ? (
                                                <img src={selectedMember.before_photo_url} className="h-full w-full object-cover" />
                                            ) : (
                                                selectedMember.first_name.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-black text-text-primary leading-tight">
                                                {selectedMember.first_name} {selectedMember.last_name}
                                            </div>
                                            <div className="text-xs font-bold text-primary tracking-widest uppercase opacity-80">
                                                {selectedMember.status} Member
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedMember(null)}
                                            className="p-2 text-text-secondary hover:text-rose-500 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Additional Notes */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Custom Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    className="w-full bg-muted/30 border border-border rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    placeholder="Add any specific instructions for this member..."
                                />
                            </div>

                            <div className="flex gap-3 mt-2">
                                {isStarter ? (
                                    <Button
                                        type="button"
                                        onClick={handleCopyPlan}
                                        className="w-full h-12 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-glow hover:bg-primary/90 transition-all active:scale-95"
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Plan & Close
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCopyPlan}
                                            className="flex-1 h-12 rounded-2xl border-border font-black text-[10px] uppercase tracking-widest gap-2"
                                        >
                                            <Copy size={16} />
                                            Copy
                                        </Button>
                                        <Button
                                            disabled={!selectedMember || isLoading}
                                            onClick={handleAssign}
                                            className="flex-[1.5] h-12 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-glow hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    {selectedMember
                                                        ? `Send to ${selectedMember.first_name}`
                                                        : "Select Member"
                                                    }
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
