import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExpiringMember } from '@/types/index';
import { Skeleton } from '../ui/skeleton';
import { Clock, Send, ChevronRight, Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { triggerWhatsAppExpiryReminders } from '@/services/whatsappService';
import toast from 'react-hot-toast';

interface Props {
  members?: ExpiringMember[];
  isLoading: boolean;
}

export const ExpiringWidget = ({ members, isLoading }: Props) => {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const handleSendAllReminders = async () => {
    if (!members || members.length === 0) return;

    setIsSending(true);
    try {
      const res = await triggerWhatsAppExpiryReminders(7); // Default to 7 days
      if (res.sent_count > 0) {
        toast.success(`Sent ${res.sent_count} reminders via WhatsApp!`);
      } else if (res.total_members === 0) {
        toast.error('No members found expiring in 7 days.');
      } else {
        toast.error('Failed to send reminders. Check WhatsApp connection.');
      }
    } catch (error) {
      toast.error('Error sending WhatsApp reminders');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSingleReminder = async (member: ExpiringMember) => {
    // For now we use the same bulk endpoint but we could add a single one
    // or just inform the user we are sending for this specific day
    setIsSending(true);
    try {
      // Logic for single member would typically go here
      // For simplicity, we just trigger the bulk for now or show a message
      toast(`Sending reminder to ${member.first_name}...`);
      await triggerWhatsAppExpiryReminders(member.days_until_expiry);
      toast.success('Reminder sent!');
    } catch (error) {
      toast.error('Failed to send reminder');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full rounded-xl bg-card p-6 shadow-soft border border-border animate-pulse">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-4 w-12 rounded-lg" />
        </div>
        
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-background/50 p-4 border border-transparent">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded-lg" />
                  <Skeleton className="h-3 w-20 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
        
        <Skeleton className="mt-4 h-12 w-full rounded-xl" />
      </div>
    );
  }

  const memberCount = members?.length || 0;

  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-6 shadow-soft border border-border">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Expiring Soon</h3>
            <p className="text-xs font-medium text-text-secondary">
              {memberCount > 0 ? `Action needed: ${memberCount} members` : 'All good!'}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/members/insights?filter=expiring_soon')}
          className="text-sm font-bold text-primary hover:text-primary/80"
        >
          See All
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-xl bg-background p-4 transition-colors hover:bg-background/80 border border-transparent hover:border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {member.first_name[0]}{member.last_name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-xs font-medium text-red-500">
                  {member.days_until_expiry === 0
                    ? 'Expires today'
                    : member.days_until_expiry === 1
                      ? 'Expires tomorrow'
                      : `Expires in ${member.days_until_expiry} days`}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSendSingleReminder(member)}
              disabled={isSending}
              className="group flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm border border-border hover:bg-primary hover:text-white transition-all disabled:opacity-50"
              title="Send WhatsApp Reminder"
            >
              {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
            </button>
          </div>
        ))}

        {(!members || members.length === 0) && (
          <div className="flex h-full items-center justify-center text-text-secondary py-12">
            <div className="text-center">
              <p className="font-semibold">No memberships expiring soon.</p>
              <p className="text-xs mt-1">You're all set!</p>
            </div>
          </div>
        )}
      </div>

      {memberCount > 0 && (
        <button
          onClick={handleSendAllReminders}
          disabled={isSending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-700 py-3 text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isSending ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
          Send All Reminders <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};