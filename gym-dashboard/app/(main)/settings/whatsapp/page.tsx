'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import {
    getWhatsAppStatus,
    getWhatsAppQR,
    logoutWhatsApp,
    resetWhatsAppSession,
    sendTestWhatsAppMessage,
    getWhatsAppSettings,
    updateWhatsAppSettings
} from '@/services/whatsappService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageSquare,
    RefreshCw,
    LogOut,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Send,
    QrCode,
    RotateCcw,
    Check,
    CheckCircle,
    Bell,
    Settings2
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';
import { WhatsAppStatusResponse, WhatsAppSettings } from '@/types';

export default function WhatsAppSettingsPage() {
    const router = useRouter();
    const [status, setStatus] = useState<string>('unknown');
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [testPhone, setTestPhone] = useState('');
    const [isFetchingQR, setIsFetchingQR] = useState(false);
    const [automationSettings, setAutomationSettings] = useState<WhatsAppSettings | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        variant: 'danger' | 'warning' | 'info';
        onConfirm: () => Promise<void>;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        variant: 'danger',
        onConfirm: async () => { },
    });

    const fetchStatus = useCallback(async () => {
        try {
            const res = await getWhatsAppStatus();
            if (res.success) {
                const newStatus = res.status;
                setStatus(newStatus);

                const isConnected = newStatus === 'AUTHENTICATED' || newStatus === 'CONNECTED';
                const isDead = ['NOT_LOGGED', 'not_initialized', 'unknown', 'DISCONNECTED', 'CLOSED'].includes(newStatus);
                const isQRMode = newStatus === 'QRCODE';

                if (isConnected) {
                    setQrCode(null);
                } else if (isQRMode) {
                    // Important: Only use QR data from status if the status is actually QRCODE
                    const qrFromStatus = res.data?.qrcode || res.data?.qrCode || res.data?.base64;
                    if (qrFromStatus) {
                        setQrCode(qrFromStatus);
                    }
                } else if (isDead) {
                    // If connection is dead, clear stale QR and trigger a fresh session start/QR fetch
                    setQrCode(null);
                    if (!isFetchingQR) {
                        fetchQR();
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch WhatsApp status:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isFetchingQR]);

    const fetchQR = async () => {
        if (isFetchingQR) return;
        setIsFetchingQR(true);
        try {
            const res = await getWhatsAppQR();
            if (res.success && res.data?.qrCode) {
                setQrCode(res.data.qrCode);
            }
        } catch (error) {
            console.error('Failed to fetch QR code:', error);
        } finally {
            setIsFetchingQR(false);
        }
    };

    const handleReset = async () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Reset WhatsApp Session?',
            message: 'This will force-close the current session and restart it. Use this if QR code is not scanning. Are you sure you want to proceed?',
            confirmText: 'Reset Session',
            variant: 'warning',
            onConfirm: performReset,
        });
    };

    const performReset = async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));

        setIsActionLoading(true);
        try {
            const res = await resetWhatsAppSession();
            if (res.success) {
                toast.success('Session reset! Generating new QR code...');
                setQrCode(null);
                setStatus('not_initialized');
                // Wait a few seconds before fetching status to allow server to cleanup
                setTimeout(() => fetchStatus(), 3000);
            } else {
                toast.error(res.error || 'Failed to reset session');
            }
        } catch (error) {
            toast.error('Failed to reset session');
        } finally {
            setIsActionLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Poll status every 5 seconds (10s if in QRCODE mode to avoid conflicts)
        const interval = setInterval(() => {
            if (status !== 'AUTHENTICATED') {
                fetchStatus();
            }
        }, status === 'QRCODE' ? 10000 : 5000);
        return () => clearInterval(interval);
    }, [fetchStatus, status]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await getWhatsAppSettings();
                setAutomationSettings(res);
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const handleToggleSetting = async (field: keyof WhatsAppSettings, value: boolean) => {
        if (!automationSettings) return;

        const updatedSettings = { ...automationSettings, [field]: value };
        setAutomationSettings(updatedSettings);

        try {
            await updateWhatsAppSettings({ [field]: value });
            toast.success('Setting updated');
        } catch (error) {
            toast.error('Failed to update setting');
            // Revert on error
            setAutomationSettings(automationSettings);
        }
    };

    const handleLogout = async () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Disconnect WhatsApp?',
            message: 'Are you sure you want to disconnect? Automated messages will stop sending until you reconnect.',
            confirmText: 'Disconnect',
            variant: 'danger',
            onConfirm: performLogout,
        });
    };

    const performLogout = async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));

        setIsActionLoading(true);
        try {
            const res = await logoutWhatsApp();
            if (res.success) {
                toast.success('Disconnected successfully');
                setStatus('NOT_LOGGED');
                fetchQR();
            } else {
                toast.error(res.error || 'Failed to disconnect');
            }
        } catch (error) {
            toast.error('Failed to disconnect');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSendTest = async () => {
        if (!testPhone) {
            toast.error('Please enter a phone number');
            return;
        }

        setIsActionLoading(true);
        try {
            const res = await sendTestWhatsAppMessage(testPhone);
            if (res.success) {
                toast.success('Test message sent!');
                setTestPhone('');
            } else {
                toast.error(res.error || 'Failed to send test message');
            }
        } catch (error) {
            toast.error('Failed to send test message');
        } finally {
            setIsActionLoading(false);
        }
    };

    const getStatusDisplay = () => {
        switch (status) {
            case 'AUTHENTICATED':
            case 'CONNECTED':
                return {
                    icon: <CheckCircle className="text-green-500" size={24} />,
                    text: 'Connected',
                    subtext: 'Your WhatsApp is active and ready to send messages.',
                    color: 'border-green-500/20 bg-green-500/5'
                };
            case 'INITIALIZING':
                return {
                    icon: <RefreshCw className="text-blue-500 animate-spin" size={24} />,
                    text: 'Initializing',
                    subtext: 'Starting WhatsApp session, please wait...',
                    color: 'border-blue-500/20 bg-blue-500/5'
                };
            case 'NOT_LOGGED':
            case 'not_initialized':
            case 'DISCONNECTED':
            case 'CLOSED':
            case 'QRCODE':
            case 'unknown':
                return {
                    icon: <QrCode className="text-yellow-500" size={24} />,
                    text: 'Not Connected',
                    subtext: 'Scan the QR code below with your WhatsApp app to connect.',
                    color: 'border-yellow-500/20 bg-yellow-500/5'
                };
            default:
                return {
                    icon: <AlertCircle className="text-gray-500" size={24} />,
                    text: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
                    subtext: 'Connection state: ' + status,
                    color: 'border-gray-500/20 bg-gray-500/5'
                };
        }
    };

    const statusDisplay = getStatusDisplay();
    const isConnected = status === 'AUTHENTICATED' || status === 'CONNECTED';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const newLocal = 'bg-linear-to-br from-green-500/5 via-background to-background border-green-500/20 shadow-xl shadow-green-500/5';
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-8">
            <Card className={`overflow-hidden transition-all duration-500 border relative ${isConnected ? newLocal : 'bg-background border-border hover:shadow-lg'}`}>
                {/* Background Blobs */}
                {isConnected && (
                    <>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                    </>
                )}

                <div className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Status & Icon */}
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full md:w-auto">
                        <div className={`relative p-5 rounded-full transition-all duration-500 shrink-0 ${isConnected ? 'bg-linear-to-br from-green-100 to-green-50 text-green-600 shadow-lg shadow-green-500/20 ring-4 ring-green-500/10 dark:from-green-900/20 dark:to-green-900/10 dark:text-green-400' : 'bg-secondary/50 text-muted-foreground'}`}>
                            {statusDisplay.icon}
                            {isConnected && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background"></span>
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <h3 className="text-2xl font-black text-foreground tracking-tight">
                                    {isConnected ? 'WhatsApp Active' : statusDisplay.text}
                                </h3>
                                {isConnected && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm dark:text-green-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                        System Online
                                    </div>
                                )}
                            </div>
                            <p className="text-muted-foreground font-medium text-lg leading-snug max-w-lg">
                                {isConnected
                                    ? 'Your device is synchronized. Automated messages and campaigns are active.'
                                    : statusDisplay.subtext}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    {isConnected && (
                        <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 justify-center md:justify-end">
                            <button
                                onClick={handleLogout}
                                disabled={isActionLoading}
                                className="group flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                            >
                                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                                <span>Disconnect</span>
                            </button>

                            <button
                                onClick={() => router.push('/marketing/whatsapp')}
                                className="group flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-primary to-primary/90 text-white rounded-xl font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
                            >
                                <MessageSquare size={20} className="group-hover:-rotate-12 transition-transform duration-300" />
                                <span>Broadcast</span>
                            </button>
                        </div>
                    )}
                </div>
            </Card>

            <Card className="p-8 space-y-6 border-2 border-primary/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <Settings2 className="text-primary" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">Automation Control</h3>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="space-y-0.5">
                            <p className="font-bold text-text-primary">Global WhatsApp Status</p>
                            <p className="text-xs text-text-secondary">Master switch for all automated messages</p>
                        </div>
                        <Switch
                            checked={automationSettings?.is_enabled ?? true}
                            onChange={(val) => handleToggleSetting('is_enabled', val)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                                    <MessageSquare size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-text-primary">Welcome Messages</p>
                                    <p className="text-[11px] text-text-secondary font-medium">Send greeting to new members</p>
                                </div>
                            </div>
                            <Switch
                                checked={automationSettings?.welcome_message_enabled ?? true}
                                onChange={(val) => handleToggleSetting('welcome_message_enabled', val)}
                                disabled={!automationSettings?.is_enabled}
                            />
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                                    <CheckCircle size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-text-primary">Payment Receipts</p>
                                    <p className="text-[11px] text-text-secondary font-medium">Send receipts after fee collection</p>
                                </div>
                            </div>
                            <Switch
                                checked={automationSettings?.payment_receipt_enabled ?? true}
                                onChange={(val) => handleToggleSetting('payment_receipt_enabled', val)}
                                disabled={!automationSettings?.is_enabled}
                            />
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                                    <Bell size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-text-primary">Expiry Reminders</p>
                                    <p className="text-[11px] text-text-secondary font-medium">Notify members before membership ends</p>
                                </div>
                            </div>
                            <Switch
                                checked={automationSettings?.membership_expiry_reminder_enabled ?? true}
                                onChange={(val) => handleToggleSetting('membership_expiry_reminder_enabled', val)}
                                disabled={!automationSettings?.is_enabled}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {!isConnected && (
                <Card className="p-8 lg:p-12">
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                        {/* Left Side: QR Code */}
                        <div className="flex flex-col items-center space-y-8 min-w-fit">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-linear-to-r from-primary to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative p-6 bg-background rounded-xl border border-border shadow-soft">
                                    {qrCode ? (
                                        <img
                                            src={qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`}
                                            alt="WhatsApp QR Code"
                                            className="w-64 h-64 object-contain"
                                        />
                                    ) : (
                                        <div className="w-64 h-64 flex flex-col items-center justify-center gap-4 text-text-secondary animate-pulse">
                                            <QrCode size={48} className="opacity-20" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Generating QR Code...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsLoading(true);
                                    fetchStatus();
                                }}
                                className="flex items-center gap-2 text-sm font-bold text-primary hover:underline transition-all"
                            >
                                <RefreshCw size={16} />
                                Refresh QR Code
                            </button>
                        </div>

                        {/* Right Side: Instructions */}
                        <div className="flex-1 space-y-10 py-4">
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-text-primary tracking-tight">Connect your WhatsApp</h4>
                                <p className="text-text-secondary font-medium">Link your business account to start sending automated messages.</p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { step: 1, text: "Open WhatsApp on your phone", icon: <MessageSquare size={16} /> },
                                    { step: 2, text: "Tap Menu (⋮) or Settings (⚙️) and select Linked Devices", icon: <RefreshCw size={16} /> },
                                    { step: 3, text: "Tap on Link a Device", icon: <CheckCircle2 size={16} /> },
                                    { step: 4, text: "Point your phone to this screen to capture the code", icon: <QrCode size={16} /> }
                                ].map((item) => (
                                    <div key={item.step} className="flex items-start gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <span className="font-bold text-lg">{item.step}</span>
                                        </div>
                                        <div className="pt-1.5">
                                            <p className="font-bold text-text-primary group-hover:text-primary transition-colors">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {isConnected && (
                <>
                    <Card className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <CheckCircle2 className="text-primary" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary">Active Features</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-text-secondary font-medium">
                                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle2 size={14} className="text-green-500" />
                                </div>
                                Welcome messages for new members
                            </li>
                            <li className="flex items-center gap-3 text-text-secondary font-medium">
                                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle2 size={14} className="text-green-500" />
                                </div>
                                Automated fee receipts
                            </li>
                            <li className="flex items-center gap-3 text-text-secondary font-medium">
                                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle2 size={14} className="text-green-500" />
                                </div>
                                Expiry reminders (3 days before)
                            </li>
                        </ul>
                    </Card>

                    <Card className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <Send className="text-primary" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary">Test Connection</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-text-secondary">
                                Send a test message to verify your connection is working correctly.
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Phone number with country code"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleSendTest}
                                    isLoading={isActionLoading}
                                    disabled={!testPhone}
                                    className="shrink-0"
                                >
                                    <Send size={18} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </>
            )}

            {isConnected && (
                <div className="pt-4">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        disabled={isActionLoading}
                        className="w-full text-text-secondary hover:text-red-500 hover:bg-red-500/5 group"
                    >
                        <RotateCcw size={16} className="mr-2 group-hover:-rotate-45 transition-transform" />
                        Reset Session
                    </Button>
                </div>
            )}


            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                variant={confirmDialog.variant}
                isLoading={isActionLoading}
            />
        </div>
    );
}
