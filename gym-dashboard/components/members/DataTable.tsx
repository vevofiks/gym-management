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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
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
    <div className="w-full rounded-4xl bg-card p-6 shadow-soft border border-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-bold text-text-primary">All Members</h3>
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

      <div className="rounded-xl overflow-hidden border border-border">
        <table className="w-full text-left text-sm">
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
                <td colSpan={columns.length} className="h-24 text-center text-text-secondary font-medium">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 py-4">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary disabled:opacity-50 hover:bg-background"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-bold text-text-secondary">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary disabled:opacity-50 hover:bg-background"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}