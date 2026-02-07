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
    joinDate: string; 
    expiryDate: string;
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
    tenant_id: number;
    plan_name?: string;
    subscription_status?: string;
}

export interface AuthState {
    accessToken: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
}

// Membership Plan Types
export interface MembershipPlan {
    id: number;
    tenant_id: number;
    name: string;
    description: string | null;
    duration_days: number;
    price: number;
    features: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PlanCreate {
    name: string;
    description?: string;
    duration_days: number;
    price: number;
    features?: string[];
}

export interface PlanUpdate {
    name?: string;
    description?: string;
    duration_days?: number;
    price?: number;
    features?: string[];
    is_active?: boolean;
}

export interface PlanStats {
    plan_id: number;
    plan_name: string;
    total_members: number;
    active_members: number;
    total_revenue: number;
}

export interface PlanListResponse {
    plans: MembershipPlan[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface SubscriptionLimits {
    current_usage: {
        member_count: number;
        staff_count: number;
        plan_count: number;
    };
    plan_limits: {
        max_members: number; // -1 means unlimited
        max_staff: number;
        max_plans: number;
    };
    is_trial: boolean;
    plan_name?: string;
}

// Subscription Status Types
export type SubscriptionStatusType = 'trial' | 'active' | 'expired' | 'suspended' | 'cancelled';

export interface PlanLimits {
    max_members: number; // -1 means unlimited
    max_staff: number;
    max_plans: number;
}

export interface CurrentUsage {
    member_count: number;
    staff_count: number;
    plan_count: number;
}

export interface FeatureAccess {
    whatsapp_enabled: boolean;
    analytics_enabled: boolean;
}

export interface PlanDetails {
    id: number;
    name: string;
    price: number;
}

export interface SubscriptionDetails {
    has_subscription: boolean;
    is_active: boolean;
    status: SubscriptionStatusType;
    is_trial: boolean;
    days_remaining: number | null;
    plan_name: string;
    plan?: PlanDetails;
    current_usage: CurrentUsage;
    plan_limits: PlanLimits;
    features: FeatureAccess;
    auto_renew?: boolean;
}

// Member Management Types
export enum MemberStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    INACTIVE = 'inactive',
}

export interface MemberBase {
    first_name: string;
    last_name: string;
    phone_number: string;
    email?: string | null;
}

export interface MemberCreate extends MemberBase {
    joining_date: string; // ISO date
    membership_type?: string; // "Monthly", "3 Months", "6 Months", "1 Year"
    plan_id?: number;
    before_photo_url?: string;
}

export interface MemberUpdate {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string | null;
    membership_type?: string;
    plan_id?: number;
    status?: MemberStatus;
    before_photo_url?: string;
    after_photo_url?: string;
}

export interface MemberResponse extends MemberBase {
    id: number;
    tenant_id: number;
    joining_date: string;
    membership_expiry_date: string;
    membership_type: string;
    plan_id?: number;
    current_plan_start_date?: string;
    total_fees_paid?: number;
    outstanding_dues?: number;
    before_photo_url?: string;
    after_photo_url?: string;
    status: MemberStatus;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MemberListResponse {
    members: MemberResponse[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface MemberRenew {
    membership_type?: string;
    plan_id?: number;
    renewal_date?: string;
}

export interface MemberPaymentRecord {
    id: number;
    payment_date: string;
    amount: number;
    payment_method: string;
    payment_status: string;
    notes?: string;
}

export interface MemberPlanDetail {
    id: number;
    name: string;
    duration_days: number;
    price: number;
    description?: string;
}

export interface MemberProfileResponse {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    email?: string;
    joining_date: string;
    membership_expiry_date: string;
    status: MemberStatus;
    before_photo_url?: string;
    after_photo_url?: string;
    plan?: MemberPlanDetail;
    current_plan_start_date?: string;
    plan_days_remaining?: number;
    total_fees_paid: number;
    outstanding_dues: number;
    recent_payments: MemberPaymentRecord[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

