import React from 'react';

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: number;
}

export interface RevenueData {
  name: string;
  value: number;
  color: string;
}

export interface GymTransaction {
  id: string;
  gymName: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
  logo: string;
}

export interface Gym {
  id: string;
  name: string;
  owner: string;
  location: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  status: 'Active' | 'Churned' | 'Trial';
  joinedDate: string;
  members: number;
  logo: string;
}

export type UserRole = 'super_admin' | 'gym_owner' | 'staff';

export interface Owner {
  id: number;
  name: string;
  username: string;
  email: string;
  phone_number: string;
  role: UserRole;
  is_active: boolean;
  tenant_id: number | null;
  avatar_url?: string;
}

export interface UserResponse extends Owner { }

export interface UserListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Ticket {
  id: string;
  subject: string;
  requester: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  date: string;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Tenant Types

export interface TenantResponse {
  id: number;
  name: string;
  is_active: boolean;
  paid_until?: string;
  upi_id?: string;
  address?: string;
  google_map?: string;
  payment_qr_code_url?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  created_at: string;
}

export interface TenantStats {
  tenant_id: number;
  tenant_name: string;
  total_members: number;
  active_members: number;
  expired_members: number;
  is_active: boolean;
  paid_until?: string;
}

export interface TenantListResponse {
  tenants: TenantResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CreateTenantRequest {
  name: string;
  address?: string;
  google_map?: string;
  upi_id?: string;
  whatsapp_access_token?: string;
  whatsapp_phone_id?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

// Authentication Types

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  username: string;
  role: string;
  tenant_id: number | null;
  plan_name?: string;
  subscription_status?: string;
  avatar_url?: string;
}

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}
