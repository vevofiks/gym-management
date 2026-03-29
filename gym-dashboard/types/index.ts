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
    total_revenue: number;
    total_expenses: number;
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

export enum PaymentMethod {
    CASH = 'cash',
    CARD = 'card',
    UPI = 'upi',
    BANK_TRANSFER = 'bank_transfer',
}

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

export interface TenantResponse {
    id: number;
    name: string;
    slug: string;
    contact_email: string;
    contact_phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    payment_qr_code_url?: string;
    logo_url?: string;
    google_map?: string;
    upi_id?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TenantStats {
    tenant_id: number;
    tenant_name: string;
    total_members: number;
    active_members: number;
    expired_members: number;
    is_active: boolean;
    paid_until: string | null;
    total_revenue: number;
}

export interface TenantUpdate {
    name?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    payment_qr_code_url?: string;
    logo_url?: string;
    google_map?: string;
    upi_id?: string;
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
    avatar_url?: string;
}

export interface AuthState {
    accessToken: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
}

export interface UserResponse {
    id: number;
    name: string;
    username: string;
    email: string;
    phone_number?: string;
    role: string;
    tenant_id?: number;
    is_active: boolean;
    created_at: string;
    avatar_url?: string;
}

export interface UserListResponse {
    users: UserResponse[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface UserUpdate {
    name?: string;
    username?: string;
    email?: string;
    phone_number?: string;
    avatar_url?: string;
}

export interface ChangePassword {
    old_password: string;
    new_password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface VerifyOTPRequest {
    email: string;
    otp: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    new_password: string;
}

// Membership Plan Types
export interface MembershipPlan {
    id: number;
    tenant_id: number;
    name: string;
    description: string | null;
    duration_days: number;
    price: number;
    features: string[] | null;
    is_active: boolean;
    member_count: number;
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
    total_members?: number;
    active_members: number;
    total_revenue: number;
    average_duration?: number;
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

export interface SubscriptionStatusResponse {
    has_subscription: boolean;
    is_active: boolean;
    status: SubscriptionStatusType | null;
    is_trial: boolean;
    days_remaining: number | null;
    plan: {
        id: number;
        name: string;
        price: number;
    } | null;
    current_usage: {
        member_count: number;
        staff_count: number;
        plan_count: number;
    };
    plan_limits: {
        max_members: number;
        max_staff: number;
        max_plans: number;
    };
    features: {
        whatsapp_enabled: boolean;
        analytics_enabled: boolean;
        diet_plans_enabled: boolean;
    };
    auto_renew: boolean;
}

export interface PlanLimits {
    max_members: number; // -1 means unlimited
    max_staff: number;
    max_plans: number;
    max_diet_templates: number;
}

export interface CurrentUsage {
    member_count: number;
    staff_count: number;
    plan_count: number;
    diet_template_count: number;
}

export interface FeatureAccess {
    whatsapp_enabled: boolean;
    analytics_enabled: boolean;
    store_enabled: boolean;
    diet_plans_enabled: boolean;
}

export interface PlanDetails {
    id: number;
    name: string;
    price: number;
}

export interface QueuedSubscription {
    id: number;
    plan_name: string;
    plan_id: number;
    created_at: string;
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
    expires_at?: string;
    auto_renew?: boolean;
    queued_subscriptions?: QueuedSubscription[];
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

    // Health and Personal Information
    weight?: number;
    height?: number;
    blood_group?: string;
    medical_conditions?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;

    // Initial Payment Information
    payment_method?: string;
    payment_amount?: number;
    joining_fee?: number;
    discount?: number;
    transaction_id?: string;
    payment_screenshot_url?: string;
    payment_notes?: string;
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

    // Health and Personal Information
    weight?: number;
    height?: number;
    blood_group?: string;
    medical_conditions?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
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

    // Health and Personal Information
    weight?: number;
    height?: number;
    blood_group?: string;
    medical_conditions?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;

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

export interface MemberUniquenessCheckRequest {
    email?: string;
    phone_number?: string;
    exclude_member_id?: number;
}

export interface MemberUniquenessCheckResponse {
    is_unique: boolean;
    errors: Record<string, string>;
}

export interface MemberRenew {
    membership_type?: string;
    plan_id?: number;
    renewal_date?: string;
    payment_method: string;
    payment_amount: number;
    joining_fee?: number;
    discount?: number;
    transaction_id?: string;
    payment_screenshot_url?: string;
    payment_notes?: string;
}

export interface MemberPaymentRecord {
    id: number;
    payment_date: string;
    amount: number;
    payment_method: string;
    payment_status: string;
    transaction_id?: string;
    payment_screenshot_url?: string;
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

    // Health and Personal Information
    weight?: number;
    height?: number;
    blood_group?: string;
    medical_conditions?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;

    recent_payments: MemberPaymentRecord[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Fee Management Types
export enum PaymentStatus {
    PAID = 'paid',
    PENDING = 'pending',
    REFUNDED = 'refunded',
}

export interface FeeBase {
    amount: number;
    payment_method: string;
    payment_date: string;
    transaction_id?: string;
    payment_screenshot_url?: string;
    notes?: string;
}

export interface FeeCreate extends FeeBase {
    plan_id?: number;
}

export interface FeeResponse extends FeeBase {
    id: number;
    member_id: number;
    tenant_id: number;
    plan_id?: number;
    payment_status: PaymentStatus;
    created_by?: number;
    created_at: string;
}

export interface FeeListResponse {
    fees: FeeResponse[];
    total: number;
    total_amount: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface FeeStats {
    total_collected: number;
    total_pending: number;
    total_refunded: number;
    payment_count: number;
}

export interface FinancialReport {
    start_date: string;
    end_date: string;
    total_revenue: number;
    cash_payments: number;
    upi_payments: number;
    card_payments: number;
    bank_transfer_payments: number;
    payment_count: number;
    member_count: number;
}

// Expense Management Types
export enum ExpenseCategory {
    RENT = 'rent',
    UTILITIES = 'utilities',
    EQUIPMENT = 'equipment',
    MAINTENANCE = 'maintenance',
    SALARIES = 'salaries',
    MARKETING = 'marketing',
    SUPPLIES = 'supplies',
    MISCELLANEOUS = 'miscellaneous',
}

export interface ExpenseBase {
    category: ExpenseCategory;
    amount: number;
    payment_method: PaymentMethod;
    expense_date: string;
    description?: string;
}

export interface ExpenseCreate extends ExpenseBase { }

export interface ExpenseUpdate {
    category?: ExpenseCategory;
    amount?: number;
    payment_method?: PaymentMethod;
    expense_date?: string;
    description?: string;
}

export interface ExpenseResponse extends ExpenseBase {
    id: number;
    tenant_id: number;
    created_by: number;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

export interface ExpenseListResponse {
    expenses: ExpenseResponse[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface CategorySummary {
    category: ExpenseCategory;
    total_amount: number;
    count: number;
}

export interface ExpenseSummary {
    total_expenses: number;
    total_count: number;
    start_date: string;
    end_date: string;
    by_category: CategorySummary[];
    by_payment_method: Record<string, number>;
}

export interface MonthlyExpense {
    year: number;
    month: number;
    total_amount: number;
    expense_count: number;
}

// --- Diet Plan Types ---

export interface MealItem {
    time: string;
    name: string;
    items: string[];
}

export interface DietPlanTemplateCreate {
    name: string;
    category: string;
    description?: string;
    meals: MealItem[];
    instructions?: string;
}

export interface DietPlanTemplateUpdate {
    name?: string;
    category?: string;
    description?: string;
    meals?: MealItem[];
    instructions?: string;
    is_active?: boolean;
}

export interface DietPlanTemplateResponse {
    id: number;
    tenant_id: number;
    created_by: number;
    name: string;
    category: string;
    description: string | null;
    meals: MealItem[];
    instructions: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DietPlanListResponse {
    templates: DietPlanTemplateResponse[];
    total: number;
}

export interface DietPlanAssignmentCreate {
    template_id: number;
    member_id: number;
    notes?: string;
    send_whatsapp: boolean;
}

export interface DietPlanAssignmentResponse {
    id: number;
    tenant_id: number;
    template_id: number;
    template_name?: string;
    member_id: number;
    assigned_by: number;
    assigned_at: string;
    sent_via_whatsapp: boolean;
    whatsapp_sent_at: string | null;
    notes: string | null;
}

// Analytics Types (Real Data)
export interface MemberGrowthData {
    date: string;
    count: number;
    cumulative_count: number;
}

export interface MemberGrowthResponse {
    data: MemberGrowthData[];
    total_new_members: number;
    start_date: string;
    end_date: string;
}

export interface MemberStatsResponse {
    total_members: number;
    active_members: number;
    expired_members: number;
    inactive_members: number;
    active_rate: number;
}

export interface ChurnRateResponse {
    churn_rate: number;
    churned_members: number;
    total_eligible: number;
    period_start: string;
    period_end: string;
}

export interface PlanDistributionData {
    plan_name: string;
    member_count: number;
    percentage: number;
}

export interface PlanDistributionResponse {
    data: PlanDistributionData[];
    total_members: number;
}

export interface AverageTenureResponse {
    average_tenure_days: number;
}

// Dashboard Types
export interface DashboardStats {
    total_members: number;
    total_members_change: number;
    active_members: number;
    active_members_change: number;
    monthly_revenue: number;
    monthly_revenue_change: number;
    new_joiners: number;
    new_joiners_change: number;
    retention_rate: number;
    retention_rate_change: number;
    outstanding_dues: number;
    outstanding_dues_change: number;
    total_revenue: number;
    total_expenses: number;
}

export interface DashboardStatsResponse {
    stats: DashboardStats;
}

export interface RecentActivity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    meta?: any;
}

export interface RecentActivitiesResponse {
    activities: RecentActivity[];
}

export interface UpcomingBirthday {
    id: number;
    name: string;
    date_of_birth: string;
    age: number;
    days_until: number;
}

export interface UpcomingBirthdaysResponse {
    birthdays: UpcomingBirthday[];
}

export interface RevenueChartDataPoint {
    month: string;
    revenue: number;
    expenses: number;
}

export interface RevenueChartResponse {
    data: RevenueChartDataPoint[];
}

export interface ExpiringMember {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    email?: string;
    membership_expiry_date: string;
    days_until_expiry: number;
    plan_name?: string;
    outstanding_dues: number;
}

export interface ExpiringMembersResponse {
    members: ExpiringMember[];
    total_count: number;
}

// WhatsApp Types
export interface WhatsAppStatusResponse {
    success: boolean;
    status: string; // INITIALIZING, AUTHENTICATED, NOT_LOGGED, etc.
    data?: any;
    error?: string;
}

export interface WhatsAppQRCodeResponse {
    success: boolean;
    data?: {
        session: string;
        qrCode?: string;
        [key: string]: any;
    };
    error?: string;
}

export interface WhatsAppMessageResponse {
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
}


export interface WhatsAppSettings {
    id: number;
    tenant_id: number;
    is_enabled: boolean;
    welcome_message_enabled: boolean;
    payment_receipt_enabled: boolean;
    membership_expiry_reminder_enabled: boolean;
    expiry_reminder_days: number;
}

// Store Types
export interface StoreProduct {
    id: number;
    tenant_id: number;
    name: string;
    description: string | null;
    price: number;
    quantity: number;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

export interface StoreProductCreate {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    image_url?: string;
}

export interface StoreSale {
    id: number;
    tenant_id: number;
    product_id: number;
    quantity: number;
    total_amount: number;
    payment_method: string;
    sale_date: string;
    sold_by: number;
    product_name?: string;
}

export interface StoreSaleCreate {
    product_id: number;
    quantity: number;
    payment_method: 'cash' | 'upi' | 'card';
}

export interface StoreStats {
    total_sales_amount: number;
    total_sales_count: number;
    product_count: number;
    low_stock_products: StoreProduct[];
}

