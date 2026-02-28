import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

import { format, parse, isValid } from "date-fns";

export const formatDate = (dateString: string | Date) => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return 'Invalid';
  return format(date, "dd/MM/yy");
};

export const formatDateTime = (dateString: string | Date) => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return 'Invalid';
  return format(date, "dd/MM/yy, h:mm a");
};

/**
 * Parses a date string in dd/mm/yy format to yyyy-mm-dd
 */
export const parseInputDate = (inputValue: string): string | null => {
  if (!inputValue) return null;

  // Try to parse dd/MM/yy
  try {
    const parsedDate = parse(inputValue, "dd/MM/yy", new Date());
    if (isValid(parsedDate)) {
      return format(parsedDate, "yyyy-MM-dd");
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const getPublicUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  // Robustly remove /api/ or /api from the end of the URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');

  // Strip /api prefix if accidentally included in the path
  const sanitizedPath = path.replace(/^\/?api\//, '/');
  const cleanPath = sanitizedPath.startsWith('/') ? sanitizedPath : `/${sanitizedPath}`;

  return `${baseUrl}${cleanPath}`;
};
