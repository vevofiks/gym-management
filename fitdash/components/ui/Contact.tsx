"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function Contact() {
    return (
        <section id="contact" className="py-32 bg-black relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    {/* Left Column: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="md:pl-20">
                            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter italic whitespace-nowrap">Get In <span className="text-primary">Touch</span></h2>
                            <p className="text-white/40 text-lg mb-12 max-w-md leading-relaxed">
                                Have questions about deployment? Our elite specialists are ready to help you synchronize your facility with the future.
                            </p>
                        </div>

                        <div className="flex flex-col gap-8 md:pl-20">
                            {[
                                { icon: Mail, label: "Email", value: "ops@fitdash.ai" },
                                { icon: Phone, label: "Direct", value: "+1 (555) 000-INSIGHT" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                                    className="flex items-center gap-6 group"
                                >
                                    <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center border-white/5 group-hover:border-primary/50 transition-all duration-500 shadow-xl group-hover:shadow-primary/20">
                                        <item.icon className="w-6 h-6 text-white/40 group-hover:text-primary group-hover:scale-110 transition-all duration-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">{item.label}</p>
                                        <p className="text-lg font-bold text-white/90 group-hover:text-white transition-colors">{item.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="glass-panel p-10 md:p-12 rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                        <form className="relative z-10 space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-2">Commander Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Wick"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-hidden focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-2">Signal Address</label>
                                    <input
                                        type="email"
                                        placeholder="john@fitdash.ai"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-hidden focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-2">Intelligence Briefing</label>
                                <textarea
                                    rows={4}
                                    placeholder="Brief us on your facility operational goals..."
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-hidden focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/10 resize-none"
                                />
                            </div>

                            <button className="w-full py-5 rounded-2xl bg-primary text-black font-black text-base flex items-center justify-center gap-3 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98]">
                                INITIALIZE CONTACT
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
