'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Dumbbell, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('owner@gympulse.com');
    const [password, setPassword] = useState('password');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            login();
            router.push('/');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary rounded-full blur-[100px]" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white mb-4 shadow-glow">
                        <Dumbbell size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-text-primary">GymPulse</h1>
                    <p className="text-text-secondary mt-2">Sign in to manage your empire</p>
                </div>

                <div className="bg-card rounded-4xl p-8 shadow-soft border border-border backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl bg-background border border-border px-4 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="you@company.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl bg-background border border-border px-4 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-text-secondary">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                Remember me
                            </label>
                            <a href="#" className="font-bold text-primary hover:text-primary/80">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-glow hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-text-secondary mt-8">
                    Don't have an account? <a href="#" className="font-bold text-primary">Contact Sales</a>
                </p>
            </div>
        </div>
    );
}
