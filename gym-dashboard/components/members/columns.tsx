import { ColumnDef } from "@tanstack/react-table";
import { MemberResponse, MemberStatus } from "@/types/index";
import { Edit, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<MemberResponse>[] = [
  {
    accessorKey: "first_name",
    header: "Member",
    cell: ({ row }) => {
      const fullName = `${row.original.first_name} ${row.original.last_name}`;
      const initials = `${row.original.first_name[0]}${row.original.last_name[0]}`.toUpperCase();

      return (
        <div className="flex items-center gap-3">
          {row.original.before_photo_url ? (
            <img
              src={row.original.before_photo_url}
              alt={fullName}
              className="h-10 w-10 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{initials}</span>
            </div>
          )}
          <div>
            <div className="font-bold text-text-primary">{fullName}</div>
            <div className="text-xs text-text-secondary">{row.original.phone_number}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-text-secondary">
          {row.original.email || 'N/A'}
        </span>
      );
    },
  },
  {
    accessorKey: "membership_type",
    header: "Plan",
    cell: ({ row }) => {
      const membershipType = row.original.membership_type;
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        )}>
          {membershipType}
        </span>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className={cn(
          "flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
          status === MemberStatus.ACTIVE ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
            status === MemberStatus.EXPIRED ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        )}>
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === MemberStatus.ACTIVE ? "bg-green-500" :
              status === MemberStatus.EXPIRED ? "bg-red-500" : "bg-slate-400"
          )} />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      );
    },
  },
  {
    accessorKey: "membership_expiry_date",
    header: "Expires",
    cell: ({ row }) => {
      const expiryDate = new Date(row.original.membership_expiry_date);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      const isExpired = daysUntilExpiry < 0;

      return (
        <div>
          <div className={cn(
            "font-medium",
            isExpired ? "text-red-600 dark:text-red-400" :
              isExpiringSoon ? "text-orange-600 dark:text-orange-400" :
                "text-text-secondary"
          )}>
            {expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          {isExpiringSoon && !isExpired && (
            <div className="text-xs text-orange-600 dark:text-orange-400">
              {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} left
            </div>
          )}
          {isExpired && (
            <div className="text-xs text-red-600 dark:text-red-400">
              Expired
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 lg:opacity-0 transition-opacity lg:group-hover:opacity-100">
          <button
            className="rounded-lg p-2 text-text-secondary hover:bg-background hover:text-primary"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            className="rounded-lg p-2 text-text-secondary hover:bg-background hover:text-primary"
            title="Edit Member"
          >
            <Edit size={16} />
          </button>
          <button
            className="rounded-lg p-2 text-text-secondary hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            title="Delete Member"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    },
  },
];