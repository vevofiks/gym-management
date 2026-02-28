"use client";

import { motion } from "framer-motion";
import {
    Users,
    CreditCard,
    BarChart3,
    Calendar,
    Settings,
    ShieldCheck,
    TrendingUp,
    MessageSquare,
    Apple,
    ArrowUpRight,
    PieChart,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "Holistic Analytics",
        description: "Professional data visualization of member activity and retention metrics.",
        icon: Activity,
        size: "col-span-1 md:col-span-2 row-span-2",
        delay: 0.1,
        accent: "bg-primary/20",
        viz: (
            <div className="mt-8 relative h-48 w-full glass-panel rounded-2xl overflow-hidden p-6 border-white/5">
                <div className="flex justify-between items-end h-full gap-2">
                    {[40, 70, 45, 90, 65, 85, 50, 95, 60, 80].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            transition={{ duration: 1, delay: i * 0.05 }}
                            className="flex-1 bg-linear-to-t from-primary/40 to-primary rounded-t-lg"
                        />
                    ))}
                </div>
                <div className="absolute top-4 left-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest text-white">Engagement Rate</span>
                </div>
            </div>
        )
    },
    {
        title: "Financial Ecosystem",
        description: "Monitor entire cash flow, from subscription fees to operational expenses.",
        icon: PieChart,
        size: "col-span-1",
        delay: 0.2,
        accent: "bg-blue-500/20",
        viz: (
            <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 glass-panel rounded-xl border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-16 h-1.5 bg-white/10 rounded-full" />
                    </div>
                    <div className="text-[10px] font-mono opacity-40">$42.0k REV</div>
                </div>
                <div className="flex items-center justify-between p-3 glass-panel rounded-xl border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-24 h-1.5 bg-white/10 rounded-full" />
                    </div>
                    <div className="text-[10px] font-mono opacity-40">$12.5k EXP</div>
                </div>
            </div>
        )
    },
    {
        title: "Growth Dashboard",
        description: "Dynamic reporting on revenue growth and member acquisition trends.",
        icon: TrendingUp,
        size: "col-span-1",
        delay: 0.3,
        accent: "bg-purple-500/20",
        viz: (
            <div className="mt-6 p-4 glass-panel rounded-xl border-white/5 relative overflow-hidden">
                <div className="text-2xl font-bold">+24.8%</div>
                <div className="text-[10px] opacity-40 mt-1 uppercase tracking-tighter font-bold">YoY Growth</div>
                <ArrowUpRight className="absolute top-2 right-2 text-primary w-4 h-4" />
                <div className="mt-4 w-full h-1 bg-white/5 rounded-full">
                    <div className="w-3/4 h-full bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
                </div>
            </div>
        )
    },
    {
        title: "Diet Engineering",
        description: "Personalized diet plan assignment and nutritional profiling for members.",
        icon: Apple,
        size: "col-span-1",
        delay: 0.4,
        accent: "bg-green-500/20",
        viz: (
            <div className="mt-6 grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="aspect-square glass-panel rounded-lg border-white/5 opacity-50 flex items-center justify-center">
                        <div className="w-1/2 h-1/2 bg-white/10 rounded-full" />
                    </div>
                ))}
            </div>
        )
    },
    {
        title: "WhatsApp Sync",
        description: "Automated alerts, payment reminders, and marketing via WhatsApp API.",
        icon: MessageSquare,
        size: "col-span-1",
        delay: 0.5,
        accent: "bg-cyan-500/20",
        viz: (
            <div className="mt-6 relative h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <MessageSquare className="w-6 h-6 text-primary shadow-[0_0_10px_var(--primary)]" />
                </div>
            </div>
        )
    }
];

export function Features() {
    return (
        <section id="features" className="py-32 bg-black relative">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Meet Premium Insights</h2>
                    <p className="text-white/40 max-w-2xl mx-auto text-lg leading-relaxed">
                        Every screen is a masterclass in management design, tailored to accelerate your facility's operational efficiency.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto md:auto-rows-[220px]">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: feature.delay, duration: 0.8 }}
                            className={cn(
                                "glass-card p-8 group relative overflow-hidden flex flex-col justify-between",
                                feature.size
                            )}
                        >
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors", feature.accent)}>
                                        <feature.icon className="w-5 h-5 text-white/80 group-hover:text-primary transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white/90">{feature.title}</h3>
                                </div>
                                <p className="text-sm text-white/40 leading-relaxed font-medium">
                                    {feature.description}
                                </p>

                                {/* Visual Graphic Area */}
                                <div className="flex-1 mt-auto">
                                    {feature.viz}
                                </div>
                            </div>

                            {/* Decorative Corner */}
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-4 right-4 w-4 h-px bg-primary/40 rotate-45" />
                                <div className="absolute bottom-4 right-4 w-px h-4 bg-primary/40 rotate-45" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
