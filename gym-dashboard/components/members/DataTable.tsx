'use client';
import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  onView?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title = "All Items",
  onView,
  onEdit,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Enhance columns with action handlers
  const enhancedColumns = columns.map((col) => {
    if (col.id === 'actions') {
      return {
        ...col,
        cell: ({ row }: any) => {
          const { Edit, Trash2, Eye } = require('lucide-react');
          return (
            <div className="flex items-center gap-2 lg:opacity-0 transition-opacity lg:group-hover:opacity-100">
              {onView && (
                <button
                  onClick={() => onView(row.original)}
                  className="rounded-xl p-2 text-text-secondary hover:bg-background hover:text-primary"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-xl p-2 text-text-secondary hover:bg-background hover:text-primary"
                  title="Edit Member"
                >
                  <Edit size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(row.original)}
                  className="rounded-xl p-2 text-text-secondary hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  title="Delete Member"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      };
    }
    return col;
  });

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full rounded-xl bg-card p-6 shadow-soft border border-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-bold text-text-primary">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search name, email..."
              className="h-10 w-full md:w-64 rounded-xl bg-background pl-10 pr-4 text-sm font-medium text-text-primary outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-text-secondary hover:bg-border transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-x-auto border border-border">
        <table className="w-full text-left text-sm min-w-[800px] md:min-w-full">
          <thead className="bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4 font-bold text-text-secondary">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-background/50 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  <EmptyState
                    icon={Search}
                    title="No results found"
                    description={globalFilter ? `We couldn't find any matches for "${globalFilter}"` : "There are no items to display in this list."}
                    className="min-h-[300px] border-none bg-transparent"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 py-4">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-text-secondary disabled:opacity-50 hover:bg-background"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-bold text-text-secondary">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-text-secondary disabled:opacity-50 hover:bg-background"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}