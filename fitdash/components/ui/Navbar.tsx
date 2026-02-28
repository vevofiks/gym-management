"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-6 left-0 right-0 z-50 px-6 ">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                    "max-w-fit mx-auto transition-all duration-500 ease-out px-8 py-3 rounded-full border shadow-2xl overflow-hidden",
                    isScrolled
                        ? "glass-panel bg-black/40 border-white/10 backdrop-blur-3xl"
                        : "bg-transparent border-transparent"
                )}
            >
                <div className="flex items-center gap-12">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 shrink-0 group">
                        <div className="relative w-24 h-8 md:w-30 md:h-10 transition-transform group-hover:scale-110">
                            <img
                                src="/logo.png"
                                alt="FitDash Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-white/60 hover:text-white transition-colors relative group py-2"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-0 w-full h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/register"
                            className="px-5 py-2 rounded-full glass-panel bg-white/5 border-white/10 hover:bg-white/10 text-white text-sm font-semibold transition-all hover:scale-105"
                        >
                            Join Now
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-white/80"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="absolute top-20 left-0 right-0 glass-panel bg-black/90 backdrop-blur-3xl rounded-3xl p-6 md:hidden flex flex-col gap-4 border border-white/10 shadow-2xl z-50"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-base font-bold text-white/50 hover:text-primary transition-colors py-3 px-4 rounded-xl hover:bg-white/5"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/register"
                            className="w-full py-4 text-center rounded-xl bg-primary text-black font-black uppercase text-sm tracking-widest mt-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Start Free Trial
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
