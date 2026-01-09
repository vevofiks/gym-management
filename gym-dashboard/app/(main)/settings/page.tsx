'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { useGymSettings, useNotificationPreferences, useUpdateGymSettings, useUpdateNotificationPreferences } from '@/hooks/useGymData';
import { Skeleton } from '@/components/ui/Skeleton';
import { Building2, Bell, Save, CreditCard, Lock } from 'lucide-react';

export default function SettingsPage() {
    const { data: gymSettings, isLoading: gymLoading } = useGymSettings();
    const { data: notifications, isLoading: notifLoading } = useNotificationPreferences();
    const updateGymSettings = useUpdateGymSettings();
    const updateNotifications = useUpdateNotificationPreferences();

    const [gymForm, setGymForm] = useState(gymSettings);
    const [notifForm, setNotifForm] = useState(notifications);

    React.useEffect(() => {
        if (gymSettings) setGymForm(gymSettings);
    }, [gymSettings]);

    React.useEffect(() => {
        if (notifications) setNotifForm(notifications);
    }, [notifications]);

    const handleGymSave = () => {
        if (gymForm) {
            updateGymSettings.mutate(gymForm);
        }
    };

    const handleNotifSave = () => {
        if (notifForm) {
            updateNotifications.mutate(notifForm);
        }
    };

    if (gymLoading || notifLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Gym Information Section */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="text-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">Gym Information</h2>
                        <p className="text-sm text-text-secondary">Manage your gym's basic details</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Gym Name"
                        value={gymForm?.gymName || ''}
                        onChange={(e) => setGymForm(prev => prev ? { ...prev, gymName: e.target.value } : prev)}
                        placeholder="Enter gym name"
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={gymForm?.email || ''}
                        onChange={(e) => setGymForm(prev => prev ? { ...prev, email: e.target.value } : prev)}
                        placeholder="gym@example.com"
                    />
                    <Input
                        label="Phone"
                        type="tel"
                        value={gymForm?.phone || ''}
                        onChange={(e) => setGymForm(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                        placeholder="+1 (555) 123-4567"
                    />
                    <Input
                        label="Website"
                        type="url"
                        value={gymForm?.website || ''}
                        onChange={(e) => setGymForm(prev => prev ? { ...prev, website: e.target.value } : prev)}
                        placeholder="www.yourgym.com"
                    />
                    <Input
                        label="Address"
                        value={gymForm?.address || ''}
                        onChange={(e) => setGymForm(prev => prev ? { ...prev, address: e.target.value } : prev)}
                        placeholder="123 Fitness Street"
                        className="md:col-span-2"
                    />
                    <Input
                        label="City"
                        value={gymForm?.city || ''}
                        onChange={(e) => setGymForm(prev => prev ? { ...prev, city: e.target.value } : prev)}
                        placeholder="San Francisco"
                    />
                    <Input
                        label="State"
                        value={gymForm?.state || ''}
                        onChange={(e) => setGymForm(prev => prev ? { ...prev, state: e.target.value } : prev)}
                        placeholder="California"
                    />
                    <Input
                        label="Zip Code"
                        value={gymForm?.zipCode || ''}
                        onChange={(e) => setGymForm(prev => prev ? { ...prev, zipCode: e.target.value } : prev)}
                        placeholder="94102"
                    />
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">Operating Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-text-secondary mb-3">Weekdays</p>
                            <div className="flex gap-3">
                                <Input
                                    label="Open"
                                    type="time"
                                    value={gymForm?.operatingHours.weekday.open || ''}
                                    onChange={(e) => setGymForm(prev => prev ? {
                                        ...prev,
                                        operatingHours: {
                                            ...prev.operatingHours,
                                            weekday: { ...prev.operatingHours.weekday, open: e.target.value }
                                        }
                                    } : prev)}
                                />
                                <Input
                                    label="Close"
                                    type="time"
                                    value={gymForm?.operatingHours.weekday.close || ''}
                                    onChange={(e) => setGymForm(prev => prev ? {
                                        ...prev,
                                        operatingHours: {
                                            ...prev.operatingHours,
                                            weekday: { ...prev.operatingHours.weekday, close: e.target.value }
                                        }
                                    } : prev)}
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-secondary mb-3">Weekends</p>
                            <div className="flex gap-3">
                                <Input
                                    label="Open"
                                    type="time"
                                    value={gymForm?.operatingHours.weekend.open || ''}
                                    onChange={(e) => setGymForm(prev => prev ? {
                                        ...prev,
                                        operatingHours: {
                                            ...prev.operatingHours,
                                            weekend: { ...prev.operatingHours.weekend, open: e.target.value }
                                        }
                                    } : prev)}
                                />
                                <Input
                                    label="Close"
                                    type="time"
                                    value={gymForm?.operatingHours.weekend.close || ''}
                                    onChange={(e) => setGymForm(prev => prev ? {
                                        ...prev,
                                        operatingHours: {
                                            ...prev.operatingHours,
                                            weekend: { ...prev.operatingHours.weekend, close: e.target.value }
                                        }
                                    } : prev)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleGymSave}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </Card>

            {/* Notification Preferences Section */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Bell className="text-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">Notification Preferences</h2>
                        <p className="text-sm text-text-secondary">Manage how you receive alerts</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Switch
                        label="Email Notifications"
                        checked={notifForm?.emailNotifications || false}
                        onChange={(checked) => setNotifForm(prev => prev ? { ...prev, emailNotifications: checked } : prev)}
                    />
                    <Switch
                        label="SMS Notifications"
                        checked={notifForm?.smsNotifications || false}
                        onChange={(checked) => setNotifForm(prev => prev ? { ...prev, smsNotifications: checked } : prev)}
                    />
                    <div className="pt-4 border-t border-border">
                        <p className="text-sm font-semibold text-text-primary mb-4">Alert Types</p>
                        <div className="space-y-4">
                            <Switch
                                label="Membership Expiry Alerts"
                                checked={notifForm?.membershipExpiry || false}
                                onChange={(checked) => setNotifForm(prev => prev ? { ...prev, membershipExpiry: checked } : prev)}
                            />
                            <Switch
                                label="Payment Reminders"
                                checked={notifForm?.paymentReminders || false}
                                onChange={(checked) => setNotifForm(prev => prev ? { ...prev, paymentReminders: checked } : prev)}
                            />
                            <Switch
                                label="New Member Alerts"
                                checked={notifForm?.newMemberAlerts || false}
                                onChange={(checked) => setNotifForm(prev => prev ? { ...prev, newMemberAlerts: checked } : prev)}
                            />
                            <Switch
                                label="Attendance Reports"
                                checked={notifForm?.attendanceReports || false}
                                onChange={(checked) => setNotifForm(prev => prev ? { ...prev, attendanceReports: checked } : prev)}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleNotifSave}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        <Save size={18} />
                        Save Preferences
                    </button>
                </div>
            </Card>

            {/* Billing & Subscription Section */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <CreditCard className="text-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">Billing & Subscription</h2>
                        <p className="text-sm text-text-secondary">Manage your plan and payment methods</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-1">Current Plan</p>
                            <h3 className="text-2xl font-bold text-text-primary">Growth Plan</h3>
                            <p className="text-sm text-text-secondary">$299/month • Next billing on Jan 24, 2026</p>
                        </div>
                        <button className="px-4 py-2 bg-text-primary text-background rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                            Upgrade Plan
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Payment Method</h3>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs font-bold text-gray-500">VISA</div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary">Visa ending in 4242</p>
                                    <p className="text-xs text-text-secondary">Expiry 12/28</p>
                                </div>
                            </div>
                            <button className="text-sm font-medium text-primary hover:underline">Edit</button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Billing History</h3>
                        <div className="border border-border rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">Date</th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">Amount</th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
                                        <th className="px-4 py-3 text-right font-medium text-text-secondary">Invoice</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <tr>
                                        <td className="px-4 py-3 text-text-primary">Dec 24, 2025</td>
                                        <td className="px-4 py-3 text-text-primary">$299.00</td>
                                        <td className="px-4 py-3 text-green-600 font-medium">Paid</td>
                                        <td className="px-4 py-3 text-right"><span className="text-primary cursor-pointer hover:underline">Download</span></td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-text-primary">Nov 24, 2025</td>
                                        <td className="px-4 py-3 text-text-primary">$299.00</td>
                                        <td className="px-4 py-3 text-green-600 font-medium">Paid</td>
                                        <td className="px-4 py-3 text-right"><span className="text-primary cursor-pointer hover:underline">Download</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Security Section */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Lock className="text-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">Security</h2>
                        <p className="text-sm text-text-secondary">Update password and security settings</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Current Password"
                            type="password"
                            placeholder="••••••••"
                        />
                        <div className="hidden md:block"></div>
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                            Update Password
                        </button>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-text-primary">Two-Factor Authentication</h3>
                                <p className="text-sm text-text-secondary mt-1">Add an extra layer of security to your account</p>
                            </div>
                            <Switch checked={false} onChange={() => { }} />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
