import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | undefined | null) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === undefined || num === null || isNaN(num as number)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num as number);
}

export function formatDate(dateString: string | Date | null | undefined) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string | Date | null | undefined) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Parses a date string in DD/MM/YY format into YYYY-MM-DD
 */
export function parseInputDate(dateStr: string): string | null {
  if (!dateStr || !dateStr.includes('/')) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  const day = parts[0];
  const month = parts[1];
  let year = parts[2];

  // Handle YY to YYYY
  if (year.length === 2) {
    year = '20' + year;
  }

  // Basic validation
  if (day.length > 2 || month.length > 2 || (year.length !== 4)) return null;

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Formats a Date object or ISO string to DD-MM-YYYY
 */
export function formatDateToDMY(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`;
}

/**
 * Parses a DD-MM-YYYY string into a Date object
 */
export function parseDMYToDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || !dateStr.includes('-')) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  return new Date(year, month, day);
}

/**
 * Normalizes a URL to be used in an img src tag.
 * If it's a full URL or data URI, it returns it as is.
 */
export function getPublicUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  
  // Handled relative paths (if any)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (url.startsWith('/')) return `${baseUrl.replace(/\/$/, '')}${url}`;
  
  return url;
}
