'use client';

import Link from 'next/link';
import { Home, Dumbbell, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 selection:bg-primary selection:text-white">
            <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Decorative Element */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                    <div className="relative bg-card border border-border rounded-4xl p-8 shadow-glow">
                        <h1 className="text-[120px] font-bold text-primary leading-none tracking-tighter opacity-90 select-none">
                            404
                        </h1>
                        {/* <div className="absolute inset-0 flex items-center justify-center">
                            <Dumbbell className="w-20 h-20 text-primary animate-pulse" />
                        </div> */}
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4 relative">
                    <h2 className="text-4xl font-black text-text-primary uppercase tracking-tight">
                        Oops! Wrong workout station?
                    </h2>
                    <p className="text-text-secondary font-bold text-lg max-w-md mx-auto leading-relaxed">
                        The page you're looking for doesn't exist or has been moved to another part of the gym.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link
                        href="/"
                        className="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-glow hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto"
                    >
                        <Home size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                        Back to Dashboard
                    </Link>
                </div>

                {/* Footer Support-like Text */}
                <p className="text-[10px] text-center font-bold text-text-secondary uppercase tracking-[0.2em] pt-8 opacity-40">
                    Gym Management System • 
                </p>
            </div>
        </div>
    );
}
