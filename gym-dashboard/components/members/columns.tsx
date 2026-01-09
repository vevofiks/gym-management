import { ColumnDef } from "@tanstack/react-table";
import { Member, MembershipStatus } from "@/types/index";
import { MoreHorizontal, Edit, Trash2, Mail } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <img
            src={row.original.avatarUrl}
            alt={row.original.name}
            className="h-10 w-10 rounded-full object-cover border border-border"
          />
          <div>
            <div className="font-bold text-text-primary">{row.getValue("name")}</div>
            <div className="text-xs text-text-secondary">{row.original.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const plan = row.getValue("plan") as string;
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-bold",
          plan === 'Elite' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
            plan === 'Pro' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
        )}>
          {plan}
        </span>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as MembershipStatus;
      return (
        <div className={cn(
          "flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
          status === MembershipStatus.ACTIVE ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
            status === MembershipStatus.EXPIRED ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        )}>
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === MembershipStatus.ACTIVE ? "bg-green-500" :
              status === MembershipStatus.EXPIRED ? "bg-red-500" : "bg-slate-400"
          )} />
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expires",
    cell: ({ row }) => {
      return <span className="font-medium text-text-secondary">{formatDate(row.getValue("expiryDate"))}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 lg:opacity-0 transition-opacity lg:group-hover:opacity-100">
          <button className="rounded-lg p-2 text-text-secondary hover:bg-background hover:text-primary">
            <Edit size={16} />
          </button>
          <button className="rounded-lg p-2 text-text-secondary hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
            <Trash2 size={16} />
          </button>
        </div>
      );
    },
  },
];