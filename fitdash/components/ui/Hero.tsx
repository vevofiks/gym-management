"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";



export function Hero() {
    return (
        <section className="relative min-h-dvh flex items-center justify-center overflow-hidden pt-20 md:pt-32 pb-10 md:pb-20">
            {/* Background Orbs */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{
                        x: [0, 40, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px]"
                />
                <motion.div
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-[100%] blur-[160px] opacity-50" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center">
                    {/* Badge */}
                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel bg-white/5 border-white/10 text-xs font-semibold tracking-wider text-primary uppercase mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Management System 2.0
                    </motion.div> */}

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="text-4xl sm:text-6xl md:text-8xl font-sans font-bold tracking-normal mb-8 leading-[0.95] max-w-5xl uppercase px-4"
                    >
                        One-Stop for <br className="hidden sm:block" />
                        <span className="bg-clip-text text-transparent bg-linear-to-b from-white to-white/40">Fitness Mastery</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        Master the art of facility management. Innovative technology meets fitness expertise to streamline your business journey.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
                    >
                        <Link
                            href="/register"
                            className="px-8 py-4 rounded-full bg-primary text-black font-bold text-lg hover:shadow-[0_0_50px_-10px_rgba(6,182,212,0.5)] transition-all hover:scale-105 active:scale-95"
                        >
                            Start Free Trial
                        </Link>
                        <button className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-primary transition-colors">
                                <Play size={20} className="fill-white/80 group-hover:fill-primary text-transparent transition-colors ml-1" />
                            </div>
                            <span className="font-semibold">Watch Demo</span>
                        </button>
                    </motion.div>
                </div>

                {/* Floating Glass Cards Grid */}

            </div>
        </section>
    );
}
