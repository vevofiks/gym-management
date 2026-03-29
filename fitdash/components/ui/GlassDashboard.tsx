"use client";
import { motion } from 'framer-motion'
import React from 'react'
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FloatingCard = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
            duration: 1,
            delay,
            ease: [0.16, 1, 0.3, 1],
            scale: { type: "spring", stiffness: 100, damping: 20 }
        }}
        className={cn("glass-card p-4 rounded-2xl shadow-2xl relative z-20", className)}
    >
        {children}
    </motion.div>
);

const GlassDashboard = () => {
    return (
        <section className="py-20 md:py-32 overflow-hidden relative">
            <div className="container mx-auto px-6 relative">
                <div className="relative max-w-6xl mx-auto h-[450px] md:h-[500px]">
                    {/* Center Main Piece */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 glass-panel rounded-xl border-white/5 shadow-2xl overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-black text-[6rem] sm:text-[8rem] md:text-[12rem] whitespace-nowrap pointer-events-none select-none">
                            FITDASH V1
                        </div>

                        {/* Fake UI Elements inside the big "Glass" */}
                        <div className="p-6 md:p-12 h-full flex flex-col justify-between relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <div className="w-24 md:w-32 h-2 md:h-3 bg-white/10 rounded-full" />
                                    <div className="w-40 md:w-48 h-8 md:h-10 bg-white/5 rounded-xl border border-white/5 flex items-center px-4">
                                        <span className="text-primary text-[10px] md:text-sm font-bold tracking-wider uppercase">RETENTION: 94.2%</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white/10" />
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white/10" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-20 md:h-32 bg-white/5 rounded-2xl border border-white/5" />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Floating Accent Cards (Reference Style) */}
                    <FloatingCard className="absolute top-[-5%] left-[0%] md:left-[5%] w-48 md:w-64 -rotate-6 hidden sm:block" delay={0.5}>
                        <div className="flex items-center gap-3 mb-2 md:mb-4">
                            <div className="p-1.5 md:p-2 bg-primary/20 rounded-lg text-primary"><ChevronRight size={14} /></div>
                            <span className="text-[10px] md:text-sm font-bold opacity-80 uppercase tracking-widest">Active Members</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold">1,280</div>
                        <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "75%" }}
                                transition={{ duration: 2, delay: 1 }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </FloatingCard>

                    <FloatingCard className="absolute top-[15%] right-[0%] md:right-[-5%] w-56 md:w-72 rotate-[4deg] z-30" delay={0.7}>
                        <div className="text-[10px] md:text-sm font-medium opacity-50 mb-1 md:mb-2">Monthly Revenue</div>
                        <div className="flex items-end gap-2 mb-2 md:mb-4">
                            <span className="text-2xl md:text-4xl font-bold">$12,480</span>
                            <span className="text-primary text-[10px] md:text-sm font-bold mb-1">↑ 12%</span>
                        </div>
                        <div className="flex gap-1 items-end h-12 md:h-16">
                            {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} className="flex-1 bg-white/10 rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </FloatingCard>

                    <FloatingCard className="absolute bottom-[-5%] left-[5%] md:left-[15%] w-44 md:w-56 rotate-2 z-30" delay={0.9}>
                        <div className="flex gap-2 mb-2">
                            <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-primary" />
                            <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-white/20" />
                        </div>
                        <div className="text-[8px] md:text-[10px] font-bold opacity-40 uppercase tracking-tighter">Outstanding Dues</div>
                        <div className="mt-1 text-[10px] md:text-sm font-mono text-primary">$2,150 ATTENTION</div>
                    </FloatingCard>
                </div>
            </div>
        </section>
    )
}

export default GlassDashboard