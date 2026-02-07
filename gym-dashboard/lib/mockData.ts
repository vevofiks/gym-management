import { MembershipStatus, MemberStatus } from '@/types/index';

// Static mock data for UI demonstration only
// No backend integration

export const MOCK_STATS = {
  totalActiveMembers: 842,
  totalActiveChange: 12.5,
  monthlyRevenue: 24010,
  revenueChange: 8.2,
  newJoiners: 45,
  newJoinersChange: -2.4,
  retentionRate: 94,
};

export const MOCK_REVENUE = [
  { month: 'Jan', revenue: 18000, expenses: 12000 },
  { month: 'Feb', revenue: 21000, expenses: 13000 },
  { month: 'Mar', revenue: 19500, expenses: 12500 },
  { month: 'Apr', revenue: 22000, expenses: 14000 },
  { month: 'May', revenue: 23500, expenses: 13800 },
  { month: 'Jun', revenue: 24010, expenses: 14200 },
];

export const MOCK_EXPIRING_MEMBERS = [
  {
    id: 'mem-1',
    name: 'Alex Johnson',
    email: 'alex@gym.com',
    avatarUrl: 'https://picsum.photos/seed/1/40/40',
    joinDate: new Date(Date.now() - 86400000 * 90).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    plan: 'Pro' as const,
    status: MembershipStatus.ACTIVE,
    lastCheckIn: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mem-2',
    name: 'Sarah Williams',
    email: 'sarah@gym.com',
    avatarUrl: 'https://picsum.photos/seed/2/40/40',
    joinDate: new Date(Date.now() - 86400000 * 120).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    plan: 'Basic' as const,
    status: MembershipStatus.ACTIVE,
    lastCheckIn: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'mem-3',
    name: 'Mike Brown',
    email: 'mike@gym.com',
    avatarUrl: 'https://picsum.photos/seed/3/40/40',
    joinDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    plan: 'Elite' as const,
    status: MembershipStatus.ACTIVE,
    lastCheckIn: new Date(Date.now()).toISOString(),
  },
];

export const MOCK_MEMBERS = Array.from({ length: 50 }).map((_, i) => ({
  id: i,
  tenant_id: 1,
  first_name: i % 2 === 0 ? 'Alex' : 'Jordan',
  last_name: `Member${i}`,
  phone_number: `+1-555-${String(i).padStart(4, '0')}`,
  email: `member${i}@gym.com`,
  joining_date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  membership_expiry_date: new Date(Date.now() + (Math.random() > 0.8 ? -1 : 1) * 86400000 * 30).toISOString(),
  membership_type: i % 3 === 0 ? '1 Year' : i % 2 === 0 ? '6 Months' : '3 Months',
  plan_id: i % 3 + 1,
  current_plan_start_date: new Date(Date.now() - 86400000 * 30).toISOString(),
  total_fees_paid: Math.floor(Math.random() * 5000) + 1000,
  outstanding_dues: Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0,
  before_photo_url: i % 4 === 0 ? `https://picsum.photos/seed/${i}/40/40` : undefined,
  after_photo_url: undefined,
  status: Math.random() > 0.8 ? MemberStatus.EXPIRED : MemberStatus.ACTIVE,
  is_active: Math.random() > 0.8 ? false : true,
  created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  updated_at: new Date().toISOString(),
}));

export const MOCK_FINANCIAL_SUMMARY = {
  totalRevenue: 145800,
  totalExpenses: 82500,
  netProfit: 63300,
  outstandingAmount: 12400,
  revenueChange: 8.2,
  expensesChange: 3.5,
  profitChange: 12.8,
};

export const MOCK_TRANSACTIONS = [
  { id: 'txn-1', memberId: 'mem-1', memberName: 'Alex Johnson', amount: 1200, type: 'income' as const, category: 'Membership Fee', method: 'card' as const, date: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'completed' as const, description: 'Pro Plan - Monthly' },
  { id: 'txn-2', memberId: 'mem-2', memberName: 'Sarah Williams', amount: 800, type: 'income' as const, category: 'Membership Fee', method: 'upi' as const, date: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'completed' as const, description: 'Basic Plan - Monthly' },
  { id: 'txn-3', memberId: '', memberName: 'Equipment Supplier', amount: 5000, type: 'expense' as const, category: 'Equipment', method: 'bank_transfer' as const, date: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'completed' as const, description: 'New dumbbells set' },
];

export const MOCK_OUTSTANDING = [
  { id: 'out-1', memberId: 'mem-10', memberName: 'John Smith', amount: 1200, dueDate: new Date(Date.now() - 86400000 * 5).toISOString(), daysOverdue: 5 },
  { id: 'out-2', memberId: 'mem-11', memberName: 'Lisa Anderson', amount: 800, dueDate: new Date(Date.now() - 86400000 * 3).toISOString(), daysOverdue: 3 },
];

export const MOCK_MEMBER_GROWTH = [
  { month: 'Jan', members: 750, newJoiners: 45, churned: 12 },
  { month: 'Feb', members: 783, newJoiners: 48, churned: 15 },
  { month: 'Mar', members: 816, newJoiners: 52, churned: 19 },
  { month: 'Apr', members: 849, newJoiners: 55, churned: 22 },
  { month: 'May', members: 882, newJoiners: 58, churned: 25 },
  { month: 'Jun', members: 915, newJoiners: 61, churned: 28 },
];

export const MOCK_ATTENDANCE = [
  { day: 'Mon', count: 245 },
  { day: 'Tue', count: 198 },
  { day: 'Wed', count: 267 },
  { day: 'Thu', count: 189 },
  { day: 'Fri', count: 223 },
  { day: 'Sat', count: 312 },
  { day: 'Sun', count: 178 },
];

export const MOCK_PLAN_DISTRIBUTION = [
  { plan: 'Basic', count: 412, percentage: 45 },
  { plan: 'Pro', count: 366, percentage: 40 },
  { plan: 'Elite', count: 137, percentage: 15 },
];

export const MOCK_ANALYTICS_METRICS = {
  growthRate: 8.5,
  avgAttendance: 230,
  activeRate: 78.5,
  churnRate: 2.8,
};

export const MOCK_GYM_SETTINGS = {
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

export const MOCK_NOTIFICATIONS = {
  emailNotifications: true,
  smsNotifications: false,
  membershipExpiry: true,
  paymentReminders: true,
  newMemberAlerts: true,
  attendanceReports: false,
};

export const MOCK_USER_PROFILE = {
  name: 'Demo User',
  email: 'demo@gympulse.com',
  phone: '+1 (555) 987-6543',
  avatarUrl: 'https://picsum.photos/id/64/60/60',
  role: 'Gym Owner',
};
