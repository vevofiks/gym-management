import React from 'react';
import { Member } from '@/types/index';
import { Skeleton } from '../ui/Skeleton';
import { Clock, Send, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Props {
  members?: Member[];
  isLoading: boolean;
}

export const ExpiringWidget = ({ members, isLoading }: Props) => {
  const handleSendPaymentLink = (memberId: string) => {
    // TODO: Implement payment link functionality when backend endpoint is ready
    console.log('Send payment link to member:', memberId);
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-4xl" />;
  }

  return (
    <div className="flex h-full flex-col rounded-4xl bg-card p-6 shadow-soft border border-border">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Expiring Soon</h3>
            <p className="text-xs font-medium text-text-secondary">Action needed: 5 members</p>
          </div>
        </div>
        <button className="text-sm font-bold text-primary hover:text-primary/80">See All</button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-2xl bg-background p-4 transition-colors hover:bg-background/80 border border-transparent hover:border-border">
            <div className="flex items-center gap-3">
              <img src={member.avatarUrl} alt={member.name} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-bold text-text-primary">{member.name}</p>
                <p className="text-xs font-medium text-red-500">Exp: {formatDate(member.expiryDate)}</p>
              </div>
            </div>

            <button
              onClick={() => handleSendPaymentLink(member.id)}
              className="group flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm border border-border hover:bg-primary hover:text-white transition-all"
              title="Send Payment Link"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </div>
        ))}

        {(!members || members.length === 0) && (
          <div className="flex h-full items-center justify-center text-text-secondary">
            <p>No memberships expiring soon.</p>
          </div>
        )}
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-700 py-3 text-sm font-bold text-white hover:opacity-90 transition-all">
        View All Expirations <ChevronRight size={16} />
      </button>
    </div>
  );
};