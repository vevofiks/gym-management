"use client";

import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/ui/Hero";
import { Features } from "@/components/ui/Features";
import { Testimonials } from "@/components/ui/Testimonials";
import { Contact } from "@/components/ui/Contact";
import { Footer } from "@/components/ui/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassDashboard from "@/components/ui/GlassDashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <Navbar />
      <Hero />
      <GlassDashboard />
      <Features />
      <Testimonials />
      <section className="py-40 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel p-10 md:p-20 rounded-xl md:rounded-[3rem] border-white/5 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-transparent opacity-50" />
            <h2 className="text-4xl md:text-7xl font-bold mb-6 md:mb-8 italic tracking-tighter leading-none">
              Ready to Defend Your <br />Market Position?
            </h2>
            <p className="text-lg md:text-xl text-white/40 mb-10 md:mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Join the elite network of fitness facilities using FitDash to redefine operational mastery.
            </p>
            <div className="flex justify-center">
              <Link
                href="/register"
                className="inline-block px-8 md:px-12 py-4 md:py-6 rounded-full bg-primary text-black font-black text-lg md:text-xl hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.6)] transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                DEPLOY SYSTEM NOW
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <Contact />
      <Footer />
    </main>
  );
}
