import React, { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Cpu, MapPin, ShieldCheck, Radar } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Services from "./components/Services";
import QuoteLab from "./components/QuoteLab";
import Store from "./components/Store";
import Booking from "./components/Booking";
import "./App.css";

const Scene3D = lazy(() => import("./components/Scene3D"));

const STATS = [
  { icon: MapPin, k: "0 min", v: "TRAVEL TIME" },
  { icon: ShieldCheck, k: "100%", v: "DATA IN SIGHT" },
  { icon: Radar, k: "8 CITIES", v: "LIVE COVERAGE" },
];

export default function App() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative min-h-screen bg-void text-slate-100 overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section id="home" data-testid="hero-section" className="relative min-h-screen">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full grid place-items-center font-mono text-xs tracking-widest text-[color:var(--cyan)] animate-pulse">BOOTING 3D LAB...</div>}>
            <Scene3D />
          </Suspense>
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-void/40 via-transparent to-void" />
        <div className="relative z-20 max-w-7xl mx-auto px-5 pt-40 pb-20 pointer-events-none">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 clip-tag glass font-mono text-[10px] tracking-widest text-[color:var(--cyan)] mb-6 pointer-events-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-neon opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--cyan)]" />
              </span>
              MOBILE LAB DEPLOYING IN SPOKANE
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] mb-6">
              <span className="neon-text">WE BRING THE</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--cyan)] to-[color:var(--magenta)]">REPAIR LAB</span><br />
              <span className="neon-text">TO YOUR DRIVEWAY.</span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 max-w-xl">
              Skip the waiting room. Military-grade, Right-to-Repair compliant device restoration performed inside our mobile diagnostic lab — parked outside your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
              <button data-testid="hero-quote-btn" onClick={() => scrollTo("quote")}
                className="btn-neon px-8 py-4 bg-[color:var(--cyan)] text-void font-display font-bold clip-tag flex items-center justify-center gap-2 hover:bg-[color:var(--magenta)]">
                GET INSTANT QUOTE <ChevronRight size={20} />
              </button>
              <button data-testid="hero-services-btn" onClick={() => scrollTo("services")}
                className="btn-neon px-8 py-4 glass text-white font-display font-bold clip-tag flex items-center justify-center gap-2">
                VIEW SERVICES <Cpu size={18} className="text-[color:var(--cyan)]" />
              </button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-cyan-neon/10 glass">
          <div className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-3 gap-4">
            {STATS.map((s, i) => (
              <div key={i} data-testid={`hero-stat-${i}`} className="flex items-center gap-3">
                <s.icon className="text-[color:var(--cyan)] shrink-0" size={22} />
                <div>
                  <div className="text-xl md:text-2xl font-black text-white font-display">{s.k}</div>
                  <div className="font-mono text-[9px] tracking-widest text-slate-500">{s.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Services onBook={() => scrollTo("book")} />
      <QuoteLab onBook={() => scrollTo("book")} />
      <Store />
      <Booking />
      <Footer />
    </div>
  );
}
