"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-black text-white relative">
            <Navbar />

            {/* Background Orbs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px]" />
            </div>

            <section className="relative pt-40 pb-20 px-6 z-10">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-white/40 hover:text-primary transition-colors mb-8 group"
                        >
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Return to Command Center
                        </Link>

                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter italic uppercase">
                            Privacy <span className="text-primary italic">Protocols</span>
                        </h1>
                        <p className="text-white/40 text-lg mb-12 max-w-2xl leading-relaxed">
                            Last Updated: February 20, 2026. Your data security is our highest operational priority. Discover how we protect your tactical information.
                        </p>

                        <div className="space-y-12">
                            {/* Section 1 */}
                            <div className="glass-panel p-8 md:p-12 rounded-xl border-white/5 relative overflow-hidden group hover:border-primary/20 transition-colors">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Shield size={120} />
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Eye className="text-primary w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold uppercase tracking-tight">Intelligence Collection</h2>
                                </div>
                                <div className="space-y-4 text-white/50 leading-relaxed font-medium">
                                    <p>
                                        FitDash collects minimal personal information necessary to synchronize your facility operations. This includes Commander Name, Signal Address (Email), and Facility Intelligence (Gym Details).
                                    </p>
                                    <p>
                                        We do not store raw payment information. All transactions are handled via encrypted third-party protocols to ensure maximum signal security.
                                    </p>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="glass-panel p-8 md:p-12 rounded-xl border-white/5 relative overflow-hidden group hover:border-primary/20 transition-colors">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Lock size={120} />
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Shield className="text-primary w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold uppercase tracking-tight">Cloud Guard Security</h2>
                                </div>
                                <div className="space-y-4 text-white/50 leading-relaxed font-medium">
                                    <p>
                                        Your facility data is protected by our Cloud Guard encryption layer. We utilize industry-standard TLS 1.3 for all data in transit and AES-256 for data at rest.
                                    </p>
                                    <p>
                                        Access to member intelligence is restricted to authorized facility commanders only. FitDash internal specialists cannot view sensitive member health profiles.
                                    </p>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className="glass-panel p-8 md:p-12 rounded-xl border-white/5 relative overflow-hidden group hover:border-primary/20 transition-colors">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <FileText size={120} />
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <FileText className="text-primary w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold uppercase tracking-tight">Data Integrity</h2>
                                </div>
                                <div className="space-y-4 text-white/50 leading-relaxed font-medium">
                                    <p>
                                        You retain full ownership of your data. COMMANDERS have the absolute authority to request a full wipe of their facility intelligence platform at any time via the Command Dashboard.
                                    </p>
                                    <p>
                                        We do not sell, trade, or transfer your facility intelligence to any external tactical units without explicit authorization.
                                    </p>
                                </div>
                            </div>

                            <div className="text-center pt-8">
                                <p className="text-white/20 text-sm font-bold tracking-widest uppercase mb-4">Questions Regarding Protocols?</p>
                                <a href="mailto:ops@fitdash.ai" className="text-primary font-bold hover:underline">ops@fitdash.ai</a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
