import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-black py-20 border-t border-white/5 relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-3 shrink-0 group">
                            <div className="relative w-30 h-10 transition-transform group-hover:scale-110">
                                <img
                                    src="/logo.png"
                                    alt="FitDash Logo"
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <p className="text-white/40 text-sm leading-relaxed max-w-xs mt-6">
                            Where advanced management technology meets fitness excellence to empower your business journey.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Ecosystem</h4>
                        <ul className="space-y-4 text-sm text-white/60">
                            <li><Link href="#features" className="hover:text-primary transition-colors">Insights</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">API Defense</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Network</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-white/60">
                            <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Community</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border-white/5">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4">Stay Synchronized</h4>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:border-primary outline-none transition-colors" />
                            <button className="p-2 bg-primary rounded-lg text-black hover:scale-105 transition-transform"><ArrowUpRight size={18} /></button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5">
                    <div className="flex gap-8 mb-6 md:mb-0">
                        <Link href="/privacy-policy" className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">Security</Link>
                    </div>

                    <div className="flex gap-6">
                        <Link href="#" className="text-white/20 hover:text-primary transition-colors"><Twitter size={20} /></Link>
                        <Link href="#" className="text-white/20 hover:text-primary transition-colors"><Instagram size={20} /></Link>
                        <Link href="#" className="text-white/20 hover:text-primary transition-colors"><Linkedin size={20} /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const ArrowUpRight = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17L17 7" /></svg>
);
