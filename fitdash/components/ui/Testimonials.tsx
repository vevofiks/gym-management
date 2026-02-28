"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Alex Morgan",
        role: "Proprietor @ Forge Gym",
        content: "The Outstanding Dues automated alerts reduced our churn by 30% in just two months. A total game changer.",
    },
    {
        name: "Sarah Chen",
        role: "Operations Director",
        content: "Managing Diet Plans and Member Analytics has never been this streamlined. My team actually enjoys the workflow.",
    },
    {
        name: "Marcus Johnson",
        role: "Lead Performance Coach",
        content: "The WhatsApp Sync kept our members engaged without manual effort. It feels like we've jumped 10 years into the future.",
    },
];

export function Testimonials() {
    return (
        <section id="testimonials" className="py-32 bg-black relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-[200px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Mastery Approved</h2>
                    <p className="text-white/40 max-w-2xl mx-auto">
                        FitDash is becoming the standard for gyms that prioritize both aesthetics and raw performance.
                    </p>
                </motion.div>

                <div className="relative overflow-hidden w-full flex">
                    <motion.div
                        style={{ willChange: "transform" }}
                        animate={{
                            x: ["0%", "-50%"],
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="flex gap-6 md:gap-8 whitespace-nowrap min-w-max transform-gpu"
                    >
                        {[...testimonials, ...testimonials].map((t, i) => (
                            <div
                                key={i}
                                className="glass-card p-6 md:p-10 relative group w-[300px] md:w-[400px] shrink-0"
                            >
                                <Quote className="absolute top-4 left-4 w-8 h-8 md:w-12 md:h-12 text-white/5 -z-10" />
                                <div className="flex gap-1 mb-6 text-primary">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                                </div>
                                <p className="text-base md:text-lg text-white/70 italic mb-8 leading-relaxed whitespace-normal min-h-[100px]">"{t.content}"</p>
                                <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                                    <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-primary font-bold">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white/90">{t.name}</h4>
                                        <p className="text-xs text-white/30 font-semibold tracking-widest uppercase">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
