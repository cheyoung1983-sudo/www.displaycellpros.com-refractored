import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Battery, Smartphone, Cpu, ArrowUpRight } from "lucide-react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;
const ICONS = { battery: Battery, smartphone: Smartphone, cpu: Cpu };

export default function Services({ onBook }) {
  const [services, setServices] = useState([]);
  useEffect(() => {
    axios.get(`${API}/api/services`).then((r) => setServices(r.data)).catch(() => {});
  }, []);
  return (
    <section id="services" data-testid="services-section" className="relative py-28 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="font-mono text-xs tracking-[0.3em] text-[color:var(--magenta)] mb-3">// 01 — SERVICE ARCHITECTURE</div>
          <h2 className="text-4xl md:text-5xl font-black neon-text">TRANSPARENT REPAIR TIERS</h2>
          <p className="text-slate-400 mt-4 max-w-2xl">Formula-based pricing. Wholesale parts + mobile labor overhead. No waiting rooms, no hidden fees.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = ICONS[s.icon] || Cpu;
            return (
              <motion.div key={i} data-testid={`service-card-${i}`}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass cursor-scan p-8 clip-tag relative group hover:shadow-neon transition-shadow">
                <div className="w-14 h-14 grid place-items-center border border-cyan-neon/40 mb-6 clip-tag">
                  <Icon className="text-[color:var(--cyan)]" />
                </div>
                <div className="font-mono text-[10px] tracking-[0.3em] text-[color:var(--cyan)] mb-2">{s.tier}</div>
                <h3 className="text-2xl font-bold text-white mb-3 font-display">{s.title}</h3>
                <p className="text-slate-400 text-sm mb-6 min-h-[48px]">{s.desc}</p>
                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="text-3xl font-black text-white">{s.price}</div>
                  <div className="text-xs text-slate-500 mt-2 font-mono">{s.examples}</div>
                </div>
                <button data-testid={`service-book-${i}`} onClick={onBook}
                  className="btn-neon w-full py-3 font-mono text-xs tracking-widest text-void bg-[color:var(--cyan)] font-bold clip-tag flex items-center justify-center gap-2 group-hover:bg-[color:var(--magenta)]">
                  RUN TRIAGE <ArrowUpRight size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
