'use client';

import Link from 'next/link';
import { Home, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F1A] flex items-center justify-center p-6 transition-colors duration-300">
            <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Decorative Element */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
                    <div className="relative bg-white dark:bg-[#151C2C] border border-gray-200 dark:border-gray-800 rounded-3xl p-10 shadow-xl">
                        <h1 className="text-[120px] font-black text-indigo-600 leading-none tracking-tighter opacity-10 select-none">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ShieldAlert className="w-20 h-20 text-indigo-600 dark:text-indigo-400 animate-bounce" />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Lost in the Cloud?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-md mx-auto leading-relaxed">
                        This administrative route doesn't exist. You might have taken a wrong turn in the control panel.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link
                        href="/"
                        className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold tracking-wide text-sm hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto"
                    >
                        <Home size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                        Admin Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-[#151C2C] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-2xl font-bold tracking-wide text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all w-full sm:w-auto shadow-sm"
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                </div>

                {/* Footer Support-like Text */}
                <p className="text-[10px] text-center font-extrabold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] pt-8 opacity-60">
                    Super Admin Console • 
                </p>
            </div>
        </div>
    );
}
