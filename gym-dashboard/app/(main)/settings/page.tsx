'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { MOCK_GYM_SETTINGS, MOCK_NOTIFICATIONS } from '@/lib/mockData';
import { Building2, Bell, Save, CreditCard, Lock } from 'lucide-react';

export default function SettingsPage() {
    const [gymForm, setGymForm] = useState(MOCK_GYM_SETTINGS);
    const [notifForm, setNotifForm] = useState(MOCK_NOTIFICATIONS);

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
                        value={gymForm.gymName}
                        onChange={(e) => setGymForm(prev => ({ ...prev, gymName: e.target.value }))}
                        placeholder="Enter gym name"
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={gymForm.email}
                        onChange={(e) => setGymForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="gym@example.com"
                    />
                    <Input
                        label="Phone"
                        type="tel"
                        value={gymForm.phone}
                        onChange={(e) => setGymForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                    />
                    <Input
                        label="Website"
                        type="url"
                        value={gymForm.website}
                        onChange={(e) => setGymForm(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="www.yourgym.com"
                    />
                    <Input
                        label="Address"
                        value={gymForm.address}
                        onChange={(e) => setGymForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Fitness Street"
                        className="md:col-span-2"
                    />
                    <Input
                        label="City"
                        value={gymForm.city}
                        onChange={(e) => setGymForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="San Francisco"
                    />
                    <Input
                        label="State"
                        value={gymForm.state}
                        onChange={(e) => setGymForm(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="California"
                    />
                    <Input
                        label="Zip Code"
                        value={gymForm.zipCode}
                        onChange={(e) => setGymForm(prev => ({ ...prev, zipCode: e.target.value }))}
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
                                    value={gymForm.operatingHours.weekday.open}
                                    onChange={(e) => setGymForm(prev => ({
                                        ...prev,
                                        operatingHours: {
                                            ...prev.operatingHours,
                                            weekday: { ...prev.operatingHours.weekday, open: e.target.value }
                                        }
                                    }))}
                                />
                                <Input
                                    label="Close"
                                    type="time"
                                    value={gymForm.operatingHours.weekday.close}
                                    onChange={(e) => setGymForm(prev => ({
                                        ...prev,
                                        operatingHours: {
                                            ...prev.operatingHours,
                                            weekday: { ...prev.operatingHours.weekday, close: e.target.value }
                                        }
                                    }))}
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-secondary mb-3">Weekends</p>
                            <div className="flex gap-3">
                                <Input
                                    label="Open"
                                    type="time"
                                    value={gymForm.operatingHours.weekend.open}
                                    onChange={(e) => setGymForm(prev => ({
                                        ...prev,
                                        operatingHours: {
                                            ...prev.operatingHours,
                                            weekend: { ...prev.operatingHours.weekend, open: e.target.value }
                                        }
                                    }))}
                                />
                                <Input
                                    label="Close"
                                    type="time"
                                    value={gymForm.operatingHours.weekend.close}
                                    onChange={(e) => setGymForm(prev => ({
                                        ...prev,
                                        operatingHours: {
                                            ...prev.operatingHours,
                                            weekend: { ...prev.operatingHours.weekend, close: e.target.value }
                                        }
                                    }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
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
                        checked={notifForm.emailNotifications}
                        onChange={(checked) => setNotifForm(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                    <Switch
                        label="SMS Notifications"
                        checked={notifForm.smsNotifications}
                        onChange={(checked) => setNotifForm(prev => ({ ...prev, smsNotifications: checked }))}
                    />
                    <div className="pt-4 border-t border-border">
                        <p className="text-sm font-semibold text-text-primary mb-4">Alert Types</p>
                        <div className="space-y-4">
                            <Switch
                                label="Membership Expiry Alerts"
                                checked={notifForm.membershipExpiry}
                                onChange={(checked) => setNotifForm(prev => ({ ...prev, membershipExpiry: checked }))}
                            />
                            <Switch
                                label="Payment Reminders"
                                checked={notifForm.paymentReminders}
                                onChange={(checked) => setNotifForm(prev => ({ ...prev, paymentReminders: checked }))}
                            />
                            <Switch
                                label="New Member Alerts"
                                checked={notifForm.newMemberAlerts}
                                onChange={(checked) => setNotifForm(prev => ({ ...prev, newMemberAlerts: checked }))}
                            />
                            <Switch
                                label="Attendance Reports"
                                checked={notifForm.attendanceReports}
                                onChange={(checked) => setNotifForm(prev => ({ ...prev, attendanceReports: checked }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        <Save size={18} />
                        Save Preferences
                    </button>
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
