export enum MembershipStatus {
    ACTIVE = 'Active',
    EXPIRED = 'Expired',
    PENDING = 'Pending',
    CANCELLED = 'Cancelled',
}

export interface Member {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    joinDate: string; // ISO String
    expiryDate: string; // ISO String
    status: MembershipStatus;
    plan: 'Basic' | 'Pro' | 'Elite';
    lastCheckIn: string;
}

export interface RevenueData {
    month: string;
    revenue: number;
    expenses: number;
}

export interface DashboardStats {
    totalActiveMembers: number;
    totalActiveChange: number; // Percentage
    monthlyRevenue: number;
    revenueChange: number;
    newJoiners: number;
    newJoinersChange: number;
    retentionRate: number;
}

// Finance Types
export interface Transaction {
    id: string;
    memberId: string;
    memberName: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    method: PaymentMethod;
    date: string; // ISO String
    status: 'completed' | 'pending' | 'failed';
    description: string;
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer';

export interface FinancialSummary {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    outstandingAmount: number;
    revenueChange: number;
    expensesChange: number;
    profitChange: number;
}

export interface OutstandingPayment {
    id: string;
    memberId: string;
    memberName: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
}

// Analytics Types
export interface MemberGrowth {
    month: string;
    members: number;
    newJoiners: number;
    churned: number;
}

export interface AttendanceData {
    day: string;
    count: number;
}

export interface PlanDistribution {
    plan: 'Basic' | 'Pro' | 'Elite';
    count: number;
    percentage: number;
}

export interface PeakHoursData {
    hour: number;
    day: string;
    intensity: number; // 0-100
}

export interface AnalyticsMetrics {
    growthRate: number;
    avgAttendance: number;
    activeRate: number;
    churnRate: number;
}

// Settings Types
export interface GymSettings {
    gymName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    website: string;
    operatingHours: {
        weekday: { open: string; close: string };
        weekend: { open: string; close: string };
    };
}

export interface NotificationPreferences {
    emailNotifications: boolean;
    smsNotifications: boolean;
    membershipExpiry: boolean;
    paymentReminders: boolean;
    newMemberAlerts: boolean;
    attendanceReports: boolean;
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
    role: string;
}

export interface BillingInfo {
    plan: 'Starter' | 'Growth' | 'Enterprise';
    status: 'active' | 'past_due' | 'canceled';
    nextBillingDate: string;
    amount: number;
    paymentMethod: {
        type: 'card' | 'paypal';
        last4: string;
        brand?: string;
    };
    invoices: {
        id: string;
        date: string;
        amount: number;
        status: 'paid' | 'pending';
        pdfUrl: string;
    }[];
}
