"use client";
import React from 'react';
import { RevenueChart } from './charts/RevenueChart';
import { ActivityChart } from './charts/ActivityChart';
import { SalesBarChart } from './charts/SalesBarChart';
import { RecentActivity } from './RecentActivity';
import { DiscountChart } from './charts/DiscountChart';
import { TrendingUp, TrendingDown, Building2, Users, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">

            {/* --- ROW 1 --- */}

            {/* Widget 1: Platform Revenue (Donut) */}
            <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C] lg:col-span-4">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">$142,500</h3>
                        <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                            <TrendingUp size={16} /> 12.5%
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly Recurring Revenue (MRR)</p>
                    </div>
                </div>
                <div className="h-[200px] w-full flex justify-center">
                    <RevenueChart />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
                            <span>Starter Plan</span>
                        </div>
                        <span className="font-medium dark:text-white">$12.5k</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                            <span>Growth Plan</span>
                        </div>
                        <span className="font-medium dark:text-white">$45.0k</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-orange-400"></span>
                            <span>Enterprise</span>
                        </div>
                        <span className="font-medium dark:text-white">$85.0k</span>
                    </div>
                </div>
            </div>

            {/* Widget 2: New Gym Onboarding (Bar) */}
            <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C] lg:col-span-4">
                <div className="mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">24</h3>
                    <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                        <TrendingUp size={16} /> 5.2%
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">New Gyms this Week</p>
                </div>
                <div className="h-[200px] w-full">
                    <SalesBarChart />
                </div>
            </div>

            {/* Widget 3: Total Platform Revenue (Area) */}
            <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C] lg:col-span-4">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Platform Growth</h4>
                        <p className="text-sm text-gray-500">Revenue across all regions</p>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <div className="flex gap-0.5">
                            <span className="h-1 w-1 rounded-full bg-current"></span>
                            <span className="h-1 w-1 rounded-full bg-current"></span>
                            <span className="h-1 w-1 rounded-full bg-current"></span>
                        </div>
                    </button>
                </div>
                <div className="mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">$1.2M</h3>
                    <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                        <TrendingUp size={16} /> 8.4%
                    </span>
                    <p className="text-xs text-gray-500 mt-1">YTD Revenue</p>
                </div>
                <div className="h-[150px] w-full">
                    <ActivityChart color="#10B981" />
                </div>
            </div>

            {/* --- ROW 2 --- */}

            {/* Stat Card 1: Total Gyms */}
            <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C] md:col-span-6 lg:col-span-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">842</h3>
                        <span className="flex items-center gap-1 text-sm font-medium text-green-500 mt-1">
                            <TrendingUp size={16} /> 12 new
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Active Gyms</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <Building2 size={24} />
                    </div>
                </div>
                <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">158 to Q3 Goal</span>
                        <span className="text-gray-900 dark:text-white font-medium">84%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                        <div className="h-2 rounded-full bg-indigo-500" style={{ width: '84%' }}></div>
                    </div>
                </div>
            </div>

            {/* Stat Card 2: Total End Users Managed */}
            <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C] md:col-span-6 lg:col-span-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">125k</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Members Managed</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <Users size={24} />
                    </div>
                </div>

                <div className="mt-6">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Top Performing Gyms</p>
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                            <img
                                key={i}
                                className="h-10 w-10 rounded-full border-2 border-white dark:border-[#151C2C] object-cover"
                                src={`https://picsum.photos/100/100?random=${i + 10}`}
                                alt={`Gym Logo ${i}`}
                                title="Top Gym"
                            />
                        ))}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-600 dark:border-[#151C2C] dark:bg-gray-700 dark:text-white">
                            +120
                        </div>
                    </div>
                </div>
            </div>

            {/* Promo/Ad Space */}
            <div className="hidden lg:block lg:col-span-4">
                <div className="h-full w-full rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-600 to-violet-700 p-6 shadow-sm text-white flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-2">Deploy New Feature</h3>
                        <p className="text-indigo-100 text-sm">Roll out the new AI Coaching Module to all Enterprise gyms.</p>
                    </div>
                    <button className="mt-4 flex w-fit items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm hover:bg-white/30">
                        Start Deployment <ArrowRight size={16} />
                    </button>
                </div>
            </div>


            {/* --- ROW 3 --- */}

            {/* Recent Transactions List */}
            <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C] lg:col-span-7 xl:col-span-8">
                <RecentActivity />
            </div>

            {/* API Usage / System Load (DiscountChart reused) */}
            <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151C2C] lg:col-span-5 xl:col-span-4">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">API Usage</h4>
                        <p className="text-sm text-gray-500">Requests per second</p>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">...</button>
                </div>
                <div className="mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">425/s</h3>
                    <span className="flex items-center gap-1 text-sm font-medium text-yellow-500">
                        <TrendingUp size={16} /> Peak Load
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Server health is normal</p>
                </div>
                <div className="h-[250px] w-full">
                    <DiscountChart />
                </div>
            </div>

        </div>
    );
};