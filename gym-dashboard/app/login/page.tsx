'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const {
        login,
        isLoading,
        error,
        checkAuth,
        isAuthenticated,
        forgotPassword,
        verifyOtp,
        resetPassword
    } = useAuthStore();

    const [view, setView] = useState<'login' | 'forgot' | 'verify' | 'reset'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (checkAuth() || isAuthenticated) {
            router.push('/');
        }
    }, [checkAuth, isAuthenticated, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ username, password });
            toast.success('Login successful!');
            router.push('/');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await forgotPassword(email);
            toast.success('OTP sent to your email!');
            setView('verify');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await verifyOtp(email, otp);
            toast.success('OTP verified!');
            setView('reset');
        } catch (error: any) {
            toast.error(error.message || 'Invalid OTP');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await resetPassword(email, otp, newPassword);
            toast.success('Password reset successful! Please login.');
            setView('login');
            // Clear fields
            setPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setOtp('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to reset password');
        }
    };

    const renderHeader = (title: string, subtitle: string) => (
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4 cursor-pointer" onClick={() => setView('login')}>
                <Dumbbell className="text-primary" size={32} />
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary mb-2">FitDash</h1>
            <p className="text-text-secondary">{subtitle}</p>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 p-4">
            <div className="w-full max-w-md">
                {view === 'login' && (
                    <>
                        {renderHeader('FitDash', 'Sign in to your dashboard')}
                        <div className="bg-card border border-border rounded-xl shadow-2xl p-8">
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-semibold text-text-primary mb-2">Username</label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50" />
                                        <span className="text-sm text-text-secondary">Remember me</span>
                                    </label>
                                    <button type="button" onClick={() => setView('forgot')} className="text-sm font-medium text-primary hover:underline">Forgot password?</button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-glow hover:bg-primary/90 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                    {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                            {error && (
                                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-center text-red-600 font-medium">{error}</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {view === 'forgot' && (
                    <>
                        {renderHeader('Recover Password', 'Enter your email to receive an OTP')}
                        <div className="bg-card border border-border rounded-xl shadow-2xl p-8">
                            <form onSubmit={handleForgotPassword} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-glow hover:bg-primary/90 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Sending...' : 'Send OTP'}
                                    {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                                <button type="button" onClick={() => setView('login')} className="w-full text-center text-sm font-medium text-text-secondary hover:text-primary transition-colors italic">
                                    Back to Login
                                </button>
                            </form>
                            {error && <p className="mt-4 text-xs text-center text-red-600 font-medium">{error}</p>}
                        </div>
                    </>
                )}

                {view === 'verify' && (
                    <>
                        {renderHeader('Verify OTP', 'Enter the 6-digit code sent to your email')}
                        <div className="bg-card border border-border rounded-xl shadow-2xl p-8">
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-semibold text-text-primary mb-2">OTP Code</label>
                                    <input
                                        id="otp"
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="XXXXXX"
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary text-center text-2xl font-bold tracking-[0.5em] placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-glow hover:bg-primary/90 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Code'}
                                </button>
                                <button type="button" onClick={() => setView('forgot')} className="w-full text-center text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                                    Resend OTP
                                </button>
                            </form>
                            {error && <p className="mt-4 text-xs text-center text-red-600 font-medium">{error}</p>}
                        </div>
                    </>
                )}

                {view === 'reset' && (
                    <>
                        {renderHeader('Set New Password', 'Create a strong password for your account')}
                        <div className="bg-card border border-border rounded-xl shadow-2xl p-8">
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div>
                                    <label htmlFor="new-password" className="block text-sm font-semibold text-text-primary mb-2">New Password</label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 8 characters"
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-semibold text-text-primary mb-2">Confirm New Password</label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat your password"
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-glow hover:bg-primary/90 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Resetting...' : 'Update Password'}
                                </button>
                            </form>
                            {error && <p className="mt-4 text-xs text-center text-red-600 font-medium">{error}</p>}
                        </div>
                    </>
                )}

                {/* Footer Link */}
                <p className="text-center text-sm text-text-secondary mt-6">
                    Don't have an account?{' '}
                    <button className="font-medium text-primary hover:underline">Contact Admin</button>
                </p>
            </div>
        </div>
    );
}
