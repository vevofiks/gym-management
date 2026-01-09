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

export interface Owner {
  id: string;
  name: string;
  email: string;
  gymCount: number;
  status: 'Active' | 'Suspended';
  avatar: string;
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
