'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading, error, checkAuth, isAuthenticated } = useAuthStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 p-4">
            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                        <Dumbbell className="text-primary" size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-text-primary mb-2">GymPulse</h1>
                    <p className="text-text-secondary">Sign in to your dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-card border border-border rounded-3xl shadow-2xl p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-text-primary mb-2">
                                Username
                            </label>
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

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                                Password
                            </label>
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

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                                />
                                <span className="text-sm text-text-secondary">Remember me</span>
                            </label>
                            <button
                                type="button"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-glow hover:bg-primary/90 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                            {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    {/* Error Display */}
                    {error && (
                        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-center text-red-600">
                                {error}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-text-secondary mt-6">
                    Don't have an account?{' '}
                    <button className="font-medium text-primary hover:underline">
                        Contact Admin
                    </button>
                </p>
            </div>
        </div>
    );
}
