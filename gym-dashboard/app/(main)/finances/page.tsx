'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    RefreshCw,
    Lock,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Zap,
    FileDown
} from 'lucide-react';
import { useSubscriptionStore } from '@/store/SubscriptionStore';
import { getFinancialReport, exportPaymentsCSV } from '@/services/feeService';
import { getExpenseSummary, exportExpensesCSV } from '@/services/expenseService';
import { FinancialReport, ExpenseSummary } from '@/types';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
const RevenueVsExpensesChart = dynamic(() => import('@/components/finances/RevenueVsExpensesChart').then(mod => mod.RevenueVsExpensesChart), { ssr: false });
const CategoryPieChart = dynamic(() => import('@/components/finances/CategoryPieChart').then(mod => mod.CategoryPieChart), { ssr: false });
const PaymentMethodChart = dynamic(() => import('@/components/finances/PaymentMethodChart').then(mod => mod.PaymentMethodChart), { ssr: false });

export default function FinancesPage() {
    const { subscription, hasFeature } = useSubscriptionStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Data
    const [revenueData, setRevenueData] = useState<FinancialReport | null>(null);
    const [expenseData, setExpenseData] = useState<ExpenseSummary | null>(null);
    const [previousRevenueData, setPreviousRevenueData] = useState<FinancialReport | null>(null);
    const [previousExpenseData, setPreviousExpenseData] = useState<ExpenseSummary | null>(null);

    // Filters
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [quickFilter, setQuickFilter] = useState<string>('this_month');

    // Check if user has access to finances (pro feature)
    const hasAccess = hasFeature('analytics');

    const fetchData = async () => {
        if (!hasAccess) return;

        try {
            setIsRefreshing(true);

            // Calculate previous period dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const prevEnd = new Date(start);
            prevEnd.setDate(prevEnd.getDate() - 1);
            const prevStart = new Date(prevEnd);
            prevStart.setDate(prevStart.getDate() - daysDiff);

            const [revenue, expenses, prevRevenue, prevExpenses] = await Promise.all([
                getFinancialReport(startDate, endDate),
                getExpenseSummary(startDate, endDate),
                getFinancialReport(format(prevStart, 'yyyy-MM-dd'), format(prevEnd, 'yyyy-MM-dd')),
                getExpenseSummary(format(prevStart, 'yyyy-MM-dd'), format(prevEnd, 'yyyy-MM-dd'))
            ]);

            setRevenueData(revenue);
            setExpenseData(expenses);
            setPreviousRevenueData(prevRevenue);
            setPreviousExpenseData(prevExpenses);
        } catch (error: any) {
            console.error('Failed to fetch financial data:', error);
            toast.error('Failed to load financial data');
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hasAccess) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [startDate, endDate, hasAccess]);

    const handleQuickFilter = (filter: string) => {
        setQuickFilter(filter);
        const now = new Date();

        switch (filter) {
            case 'this_month':
                setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
                setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
                break;
            case 'last_month':
                const lastMonth = subMonths(now, 1);
                setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
                setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
                break;
            case 'last_3_months':
                setStartDate(format(subMonths(now, 3), 'yyyy-MM-dd'));
                setEndDate(format(now, 'yyyy-MM-dd'));
                break;
            case 'last_6_months':
                setStartDate(format(subMonths(now, 6), 'yyyy-MM-dd'));
                setEndDate(format(now, 'yyyy-MM-dd'));
                break;
        }
    };

    // Calculate metrics
    const totalRevenue = revenueData?.total_revenue || 0;
    const totalExpenses = expenseData?.total_expenses || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

    const prevRevenue = previousRevenueData?.total_revenue || 0;
    const prevExpenses = previousExpenseData?.total_expenses || 0;
    const prevProfit = prevRevenue - prevExpenses;

    const revenueGrowth = prevRevenue > 0 ? (((totalRevenue - prevRevenue) / prevRevenue) * 100) : 0;
    const expenseGrowth = prevExpenses > 0 ? (((totalExpenses - prevExpenses) / prevExpenses) * 100) : 0;
    const profitGrowth = prevProfit > 0 ? (((netProfit - prevProfit) / prevProfit) * 100) : 0;

    // Advanced metrics
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const avgDailyRevenue = totalRevenue / daysDiff;
    const avgDailyExpenses = totalExpenses / daysDiff;
    const avgRevenuePerMember = revenueData?.member_count ? totalRevenue / revenueData.member_count : 0;
    const burnRate = avgDailyExpenses;
    const runwayDays = netProfit > 0 && avgDailyExpenses > 0 ? Math.floor(netProfit / avgDailyExpenses) : 0;

    // Prepare chart data
    const trendData = [
        { period: 'Period 1', revenue: prevRevenue, expenses: prevExpenses },
        { period: 'Period 2', revenue: totalRevenue, expenses: totalExpenses }
    ];

    const categoryData = expenseData?.by_category.map(cat => ({
        category: cat.category,
        amount: cat.total_amount,
        percentage: totalExpenses > 0 ? (cat.total_amount / totalExpenses) * 100 : 0
    })) || [];

    const paymentMethodData = revenueData ? Object.entries(revenueData)
        .filter(([key]) => key.endsWith('_payments'))
        .map(([method, amount]) => ({
            method: method.replace('_payments', '').replace('_', ' ').toUpperCase(),
            amount: Number(amount),
            percentage: totalRevenue > 0 ? (Number(amount) / totalRevenue) * 100 : 0
        }))
        .filter(item => item.amount > 0) : [];

    // Advanced analytics and charts for Pro only
    const isPro = subscription?.plan_name.toLowerCase().includes('pro') || subscription?.is_trial;

    // Upgrade prompt for non-pro users (only if they don't even have basic access, which should be handled by hasAccess)
    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock size={40} className="text-primary" />
                </div>
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">
                        Pro Feature
                    </h2>
                    <p className="text-text-secondary font-medium mb-6">
                        Advanced financial analytics with charts, trends, and comprehensive insights are available for Pro users. Upgrade your plan to unlock this powerful dashboard.
                    </p>
                    <button className="px-8 py-3 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-glow hover:bg-primary/90 transition-all active:scale-95">
                        Upgrade to Pro
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                <div className="flex gap-3">
                    <button
                        onClick={exportPaymentsCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-bold text-text-primary hover:bg-muted transition-all active:scale-95 shadow-soft"
                    >
                        <FileDown size={16} className="text-primary" />
                        Export Payments
                    </button>
                    <button
                        onClick={exportExpensesCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-bold text-text-primary hover:bg-muted transition-all active:scale-95 shadow-soft"
                    >
                        <FileDown size={16} className="text-red-500" />
                        Export Expenses
                    </button>
                    <button
                        onClick={fetchData}
                        disabled={isRefreshing}
                        className="p-3 rounded-xl bg-card border border-border text-text-secondary hover:text-primary transition-all active:scale-95 shadow-soft"
                    >
                        <RefreshCw size={20} className={cn(isRefreshing && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3">
                {[
                    { key: 'this_month', label: 'This Month' },
                    { key: 'last_month', label: 'Last Month' },
                    { key: 'last_3_months', label: 'Last 3 Months' },
                    { key: 'last_6_months', label: 'Last 6 Months' }
                ].map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => handleQuickFilter(filter.key)}
                        className={cn(
                            "px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                            quickFilter === filter.key
                                ? "bg-primary text-white shadow-glow"
                                : "bg-card border border-border text-text-secondary hover:border-primary"
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Date Range Filter */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-soft flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-text-secondary" />
                    <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">Custom Range:</span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">From</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setQuickFilter('custom'); }}
                            className="bg-background px-3 py-1.5 rounded-xl text-xs font-bold border border-border outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">To</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setQuickFilter('custom'); }}
                            className="bg-background px-3 py-1.5 rounded-xl text-xs font-bold border border-border outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>
            </div>

            {isLoading && !isRefreshing ? (
                <div className="w-full h-96 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">Loading Analytics...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Summary Stats with Growth */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
                                    <TrendingUp size={20} />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-black uppercase",
                                    revenueGrowth >= 0 ? "text-green-500" : "text-red-500"
                                )}>
                                    {revenueGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {Math.abs(revenueGrowth).toFixed(1)}%
                                </div>
                            </div>
                            <div className="text-3xl font-black text-text-primary">
                                ₹{totalRevenue.toLocaleString()}
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Revenue</div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                                    <TrendingDown size={20} />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-black uppercase",
                                    expenseGrowth <= 0 ? "text-green-500" : "text-red-500"
                                )}>
                                    {expenseGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {Math.abs(expenseGrowth).toFixed(1)}%
                                </div>
                            </div>
                            <div className="text-3xl font-black text-text-primary">
                                ₹{totalExpenses.toLocaleString()}
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Expenses</div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "p-2 rounded-xl",
                                    netProfit >= 0 ? "bg-primary/10 text-primary" : "bg-orange-500/10 text-orange-500"
                                )}>
                                    <DollarSign size={20} />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-black uppercase",
                                    profitGrowth >= 0 ? "text-green-500" : "text-red-500"
                                )}>
                                    {profitGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {Math.abs(profitGrowth).toFixed(1)}%
                                </div>
                            </div>
                            <div className={cn(
                                "text-3xl font-black",
                                netProfit >= 0 ? "text-primary" : "text-orange-500"
                            )}>
                                ₹{netProfit.toLocaleString()}
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Net Profit</div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                    <Users size={20} />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-text-primary">
                                {revenueData?.member_count || 0}
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Members</div>
                        </div>
                    </div>

                    {/* Revenue vs Expenses Trend Chart */}
                    {isPro ? (
                        <RevenueVsExpensesChart data={trendData} isLoading={isRefreshing} />
                    ) : (
                        <div className="bg-card border border-border p-8 rounded-xl shadow-soft flex flex-col items-center justify-center gap-4 min-h-[300px]">
                            <div className="p-4 bg-primary/10 rounded-full text-primary">
                                <Lock size={24} />
                            </div>
                            <div className="text-center">
                                <h4 className="text-lg font-black text-text-primary uppercase">Revenue Trends</h4>
                                <p className="text-xs text-text-secondary font-medium">Visual trends are available on the Pro plan.</p>
                            </div>
                        </div>
                    )}

                    {/* Category & Payment Method Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {isPro ? (
                            <>
                                <CategoryPieChart data={categoryData} isLoading={isRefreshing} />
                                <PaymentMethodChart data={paymentMethodData} isLoading={isRefreshing} />
                            </>
                        ) : (
                            <>
                                <div className="bg-card border border-border p-8 rounded-xl shadow-soft flex flex-col items-center justify-center gap-4 min-h-[250px]">
                                    <Lock size={20} className="text-text-secondary" />
                                    <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Expense Breakdown Locked</p>
                                </div>
                                <div className="bg-card border border-border p-8 rounded-xl shadow-soft flex flex-col items-center justify-center gap-4 min-h-[250px]">
                                    <Lock size={20} className="text-text-secondary" />
                                    <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Payment Analytics Locked</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Advanced Metrics */}
                    {isPro && (
                        <div className="bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20 p-6 rounded-xl">
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap size={16} />
                                Advanced Metrics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                                    <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Avg Daily Revenue</div>
                                    <div className="text-xl font-black text-text-primary">₹{Math.round(avgDailyRevenue).toLocaleString()}</div>
                                </div>
                                <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                                    <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Avg Daily Expenses</div>
                                    <div className="text-xl font-black text-text-primary">₹{Math.round(avgDailyExpenses).toLocaleString()}</div>
                                </div>
                                <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                                    <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Revenue/Member</div>
                                    <div className="text-xl font-black text-text-primary">₹{Math.round(avgRevenuePerMember).toLocaleString()}</div>
                                </div>
                                <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                                    <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Profit Margin</div>
                                    <div className="text-xl font-black text-text-primary">{profitMargin.toFixed(1)}%</div>
                                </div>
                                <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                                    <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Burn Rate</div>
                                    <div className="text-xl font-black text-text-primary">₹{Math.round(burnRate).toLocaleString()}/day</div>
                                </div>
                                <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                                    <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Runway Days</div>
                                    <div className="text-xl font-black text-text-primary">{runwayDays} days</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {expenseData && expenseData.by_category && expenseData.by_category.length > 0 && (
                            <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
                                <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-red-500 rounded-full" />
                                    Top Expense Categories
                                </h3>
                                <div className="space-y-3">
                                    {expenseData.by_category.slice(0, 5).map((cat, idx) => (
                                        <div key={cat.category} className="flex items-center justify-between p-3 bg-background rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-black">
                                                    #{idx + 1}
                                                </div>
                                                <span className="text-sm font-bold text-text-primary capitalize">{cat.category}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-red-500">₹{cat.total_amount.toLocaleString()}</div>
                                                <div className="text-[10px] font-bold text-text-secondary">{cat.count} transactions</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {paymentMethodData && paymentMethodData.length > 0 && (
                            <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
                                <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-green-500 rounded-full" />
                                    Payment Method Performance
                                </h3>
                                <div className="space-y-3">
                                    {paymentMethodData.slice(0, 5).map((method, idx) => (
                                        <div key={method.method} className="flex items-center justify-between p-3 bg-background rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-xs font-black">
                                                    #{idx + 1}
                                                </div>
                                                <span className="text-sm font-bold text-text-primary">{method.method}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-green-500">₹{method.amount.toLocaleString()}</div>
                                                <div className="text-[10px] font-bold text-text-secondary">{method.percentage.toFixed(1)}%</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
