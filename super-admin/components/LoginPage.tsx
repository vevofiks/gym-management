"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Check, X, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [view, setView] = useState<'login' | 'forgot' | 'verify' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    login,
    forgotPassword,
    verifyOtp,
    resetPassword,
    isLoading,
    error: authError,
    isAuthenticated
  } = useAuthStore();

  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const router = useRouter();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Validation Rules
  const validations = [
    { label: 'At least 8 characters', valid: password.length >= 8 || newPassword.length >= 8 },
  ];

  const isPasswordValid = validations.every((v) => v.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError('');

    if (view === 'login') {
      if (!username || !password) {
        setError('Please fill in all fields');
        return;
      }
      try {
        await login({ username, password });
        router.push('/');
      } catch (err: any) { }
    } else if (view === 'forgot') {
      if (!email) {
        setError('Please enter your email');
        return;
      }
      try {
        await forgotPassword(email);
        setView('verify');
      } catch (err: any) { }
    } else if (view === 'verify') {
      if (!otp || otp.length < 6) {
        setError('Please enter the 6-digit code');
        return;
      }
      try {
        await verifyOtp(email, otp);
        setView('reset');
      } catch (err: any) { }
    } else if (view === 'reset') {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      try {
        await resetPassword(email, otp, newPassword);
        setView('login');
        setError('');
        // Clear sensitive fields
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (err: any) { }
    }
  };

  const renderHeader = (title: string, subtitle: string) => (
    <div className="mb-8 flex flex-col items-center text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => setView('login')}
      >
        <ShieldCheck size={32} />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-[#0B1120]">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-[#151C2C]">

          {view === 'login' && (
            <>
              {renderHeader('Admin Access', 'Sign in to access your dashboard')}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                      placeholder="admin_username"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {(error || authError) && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <X size={16} />
                    <span>{error || authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1" /></>}
                </button>
              </form>
            </>
          )}

          {view === 'forgot' && (
            <>
              {renderHeader('Recover Access', 'Enter your email for security verification')}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {(error || authError) && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <X size={16} />
                    <span>{error || authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Send Verification Code <ArrowRight size={18} className="group-hover:translate-x-1" /></>}
                </button>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full text-center text-xs font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400"
                >
                  Return to login
                </button>
              </form>
            </>
          )}

          {view === 'verify' && (
            <>
              {renderHeader('Verification', 'Enter the 6-digit code sent to your email')}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center block">Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 text-center text-3xl font-bold tracking-[0.5em] text-indigo-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
                    placeholder="000000"
                    required
                  />
                </div>

                {(error || authError) && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <X size={16} />
                    <span>{error || authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify Code'}
                </button>
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="w-full text-center text-xs font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400"
                >
                  Resend code
                </button>
              </form>
            </>
          )}

          {view === 'reset' && (
            <>
              {renderHeader('Security Update', 'Create a new secure password for your account')}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Min 8 characters"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Repeat password"
                    required
                  />
                </div>

                {(error || authError) && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <X size={16} />
                    <span>{error || authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Set New Password'}
                </button>
              </form>
            </>
          )}

        </div>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} FitDash Admin. All rights reserved.
        </p>
      </div>
    </div>
  );
};