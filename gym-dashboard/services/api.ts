import { Member, MembershipStatus, DashboardStats, RevenueData } from "@/types/index";

// Mock Data
const MOCK_MEMBERS: Member[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `mem-${i}`,
  name: i % 2 === 0 ? `Alex ${i}` : `Jordan ${i}`,
  email: `member${i}@gym.com`,
  avatarUrl: `https://picsum.photos/seed/${i}/40/40`,
  joinDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  expiryDate: new Date(Date.now() + (Math.random() > 0.8 ? -1 : 1) * 86400000 * 10).toISOString(), // Some expired, some active
  status: Math.random() > 0.8 ? MembershipStatus.EXPIRED : MembershipStatus.ACTIVE,
  plan: i % 3 === 0 ? 'Elite' : i % 2 === 0 ? 'Pro' : 'Basic',
  lastCheckIn: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
}));

const MOCK_STATS: DashboardStats = {
  totalActiveMembers: 842,
  totalActiveChange: 12.5,
  monthlyRevenue: 24010,
  revenueChange: 8.2,
  newJoiners: 45,
  newJoinersChange: -2.4,
  retentionRate: 94,
};

const MOCK_REVENUE: RevenueData[] = [
  { month: 'Jan', revenue: 18000, expenses: 12000 },
  { month: 'Feb', revenue: 21000, expenses: 13000 },
  { month: 'Mar', revenue: 19500, expenses: 12500 },
  { month: 'Apr', revenue: 22000, expenses: 14000 },
  { month: 'May', revenue: 23500, expenses: 13800 },
  { month: 'Jun', revenue: 24010, expenses: 14200 },
];

// Import new types
import type {
  FinancialSummary,
  Transaction,
  OutstandingPayment,
  MemberGrowth,
  AttendanceData,
  PlanDistribution,
  AnalyticsMetrics,
  GymSettings,
  NotificationPreferences,
  UserProfile,
  BillingInfo
} from "@/types/index";

// Mock Financial Data
const MOCK_FINANCIAL_SUMMARY: FinancialSummary = {
  totalRevenue: 145800,
  totalExpenses: 82500,
  netProfit: 63300,
  outstandingAmount: 12400,
  revenueChange: 8.2,
  expensesChange: 3.5,
  profitChange: 12.8,
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'txn-1', memberId: 'mem-1', memberName: 'Alex Johnson', amount: 1200, type: 'income', category: 'Membership Fee', method: 'card', date: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'completed', description: 'Pro Plan - Monthly' },
  { id: 'txn-2', memberId: 'mem-2', memberName: 'Sarah Williams', amount: 800, type: 'income', category: 'Membership Fee', method: 'upi', date: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'completed', description: 'Basic Plan - Monthly' },
  { id: 'txn-3', memberId: '', memberName: 'Equipment Supplier', amount: 5000, type: 'expense', category: 'Equipment', method: 'bank_transfer', date: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'completed', description: 'New dumbbells set' },
  { id: 'txn-4', memberId: 'mem-3', memberName: 'Mike Brown', amount: 2000, type: 'income', category: 'Membership Fee', method: 'cash', date: new Date(Date.now() - 86400000 * 4).toISOString(), status: 'completed', description: 'Elite Plan - Monthly' },
  { id: 'txn-5', memberId: '', memberName: 'Utility Company', amount: 1200, type: 'expense', category: 'Utilities', method: 'bank_transfer', date: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'completed', description: 'Electricity bill' },
  { id: 'txn-6', memberId: 'mem-4', memberName: 'Emma Davis', amount: 1200, type: 'income', category: 'Membership Fee', method: 'card', date: new Date(Date.now() - 86400000 * 6).toISOString(), status: 'pending', description: 'Pro Plan - Monthly' },
];

const MOCK_OUTSTANDING: OutstandingPayment[] = [
  { id: 'out-1', memberId: 'mem-10', memberName: 'John Smith', amount: 1200, dueDate: new Date(Date.now() - 86400000 * 5).toISOString(), daysOverdue: 5 },
  { id: 'out-2', memberId: 'mem-11', memberName: 'Lisa Anderson', amount: 800, dueDate: new Date(Date.now() - 86400000 * 3).toISOString(), daysOverdue: 3 },
  { id: 'out-3', memberId: 'mem-12', memberName: 'Robert Taylor', amount: 2000, dueDate: new Date(Date.now() - 86400000 * 10).toISOString(), daysOverdue: 10 },
  { id: 'out-4', memberId: 'mem-13', memberName: 'Jennifer Wilson', amount: 1200, dueDate: new Date(Date.now() - 86400000 * 2).toISOString(), daysOverdue: 2 },
];

// Mock Analytics Data
const MOCK_MEMBER_GROWTH: MemberGrowth[] = [
  { month: 'Jan', members: 750, newJoiners: 45, churned: 12 },
  { month: 'Feb', members: 783, newJoiners: 48, churned: 15 },
  { month: 'Mar', members: 816, newJoiners: 52, churned: 19 },
  { month: 'Apr', members: 849, newJoiners: 55, churned: 22 },
  { month: 'May', members: 882, newJoiners: 58, churned: 25 },
  { month: 'Jun', members: 915, newJoiners: 61, churned: 28 },
];

const MOCK_ATTENDANCE: AttendanceData[] = [
  { day: 'Mon', count: 245 },
  { day: 'Tue', count: 198 },
  { day: 'Wed', count: 267 },
  { day: 'Thu', count: 189 },
  { day: 'Fri', count: 223 },
  { day: 'Sat', count: 312 },
  { day: 'Sun', count: 178 },
];

const MOCK_PLAN_DISTRIBUTION: PlanDistribution[] = [
  { plan: 'Basic', count: 412, percentage: 45 },
  { plan: 'Pro', count: 366, percentage: 40 },
  { plan: 'Elite', count: 137, percentage: 15 },
];

const MOCK_ANALYTICS_METRICS: AnalyticsMetrics = {
  growthRate: 8.5,
  avgAttendance: 230,
  activeRate: 78.5,
  churnRate: 2.8,
};

// Mock Settings Data
const MOCK_GYM_SETTINGS: GymSettings = {
  gymName: 'GymPulse Fitness Center',
  address: '123 Fitness Street',
  city: 'San Francisco',
  state: 'California',
  zipCode: '94102',
  phone: '+1 (555) 123-4567',
  email: 'info@gympulse.com',
  website: 'www.gympulse.com',
  operatingHours: {
    weekday: { open: '06:00', close: '22:00' },
    weekend: { open: '08:00', close: '20:00' },
  },
};

const MOCK_NOTIFICATIONS: NotificationPreferences = {
  emailNotifications: true,
  smsNotifications: false,
  membershipExpiry: true,
  paymentReminders: true,
  newMemberAlerts: true,
  attendanceReports: false,
};

const MOCK_USER_PROFILE: UserProfile = {
  name: 'Afshin T2Y',
  email: 'afshin@gympulse.com',
  phone: '+1 (555) 987-6543',
  avatarUrl: 'https://picsum.photos/id/64/60/60',
  role: 'Gym Owner Pro+',
};

const MOCK_BILLING: BillingInfo = {
  plan: 'Growth',
  status: 'active',
  nextBillingDate: new Date(Date.now() + 86400000 * 15).toISOString(),
  amount: 299,
  paymentMethod: {
    type: 'card',
    last4: '4242',
    brand: 'Visa'
  },
  invoices: [
    { id: 'inv-001', date: new Date(Date.now() - 86400000 * 15).toISOString(), amount: 299, status: 'paid', pdfUrl: '#' },
    { id: 'inv-002', date: new Date(Date.now() - 86400000 * 45).toISOString(), amount: 299, status: 'paid', pdfUrl: '#' },
    { id: 'inv-003', date: new Date(Date.now() - 86400000 * 75).toISOString(), amount: 299, status: 'paid', pdfUrl: '#' },
  ]
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(800);
    return MOCK_STATS;
  },
  getRevenueHistory: async (): Promise<RevenueData[]> => {
    await delay(1000);
    return MOCK_REVENUE;
  },
  getMembers: async (): Promise<Member[]> => {
    await delay(1200);
    return MOCK_MEMBERS;
  },
  getExpiringMembers: async (): Promise<Member[]> => {
    await delay(600);
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    return MOCK_MEMBERS.filter(m => {
      const exp = new Date(m.expiryDate);
      return exp > now && exp <= sevenDaysFromNow;
    }).slice(0, 5);
  },
  sendPaymentLink: async (memberId: string): Promise<boolean> => {
    await delay(1500);
    return true;
  },

  // Finance APIs
  getFinancialSummary: async (): Promise<FinancialSummary> => {
    await delay(800);
    return MOCK_FINANCIAL_SUMMARY;
  },
  getTransactions: async (): Promise<Transaction[]> => {
    await delay(900);
    return MOCK_TRANSACTIONS;
  },
  getOutstandingPayments: async (): Promise<OutstandingPayment[]> => {
    await delay(700);
    return MOCK_OUTSTANDING;
  },

  // Analytics APIs
  getAnalyticsMetrics: async (): Promise<AnalyticsMetrics> => {
    await delay(800);
    return MOCK_ANALYTICS_METRICS;
  },
  getMemberGrowth: async (): Promise<MemberGrowth[]> => {
    await delay(1000);
    return MOCK_MEMBER_GROWTH;
  },
  getAttendanceData: async (): Promise<AttendanceData[]> => {
    await delay(900);
    return MOCK_ATTENDANCE;
  },
  getPlanDistribution: async (): Promise<PlanDistribution[]> => {
    await delay(700);
    return MOCK_PLAN_DISTRIBUTION;
  },

  // Settings APIs
  getGymSettings: async (): Promise<GymSettings> => {
    await delay(600);
    return MOCK_GYM_SETTINGS;
  },
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    await delay(500);
    return MOCK_NOTIFICATIONS;
  },
  getUserProfile: async (): Promise<UserProfile> => {
    await delay(500);
    return MOCK_USER_PROFILE;
  },
  getBillingInfo: async (): Promise<BillingInfo> => {
    await delay(700);
    return MOCK_BILLING;
  },
  updateGymSettings: async (settings: GymSettings): Promise<boolean> => {
    await delay(1000);
    console.log('Settings updated:', settings);
    return true;
  },
  updateNotificationPreferences: async (prefs: NotificationPreferences): Promise<boolean> => {
    await delay(800);
    console.log('Notifications updated:', prefs);
    return true;
  },
  updateUserProfile: async (profile: UserProfile): Promise<boolean> => {
    await delay(900);
    console.log('Profile updated:', profile);
    return true;
  },
};

