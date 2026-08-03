import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;
const ISSUES = [
  { id: "screen", label: "Cracked Screen" },
  { id: "battery", label: "Battery / Power" },
  { id: "port", label: "Charging Port" },
  { id: "other", label: "Diagnostics" },
];
const TIERS = [
  { id: "flagship", label: "Flagship (Pro / Ultra)" },
  { id: "standard", label: "Standard" },
];

export default function QuoteLab({ onBook }) {
  const [issue, setIssue] = useState("screen");
  const [tier, setTier] = useState("flagship");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/api/quote`, { issueType: issue, deviceTier: tier });
      setResult(r.data);
    } catch (e) { /* noop */ }
    setLoading(false);
  };

  const Row = ({ label, data, accent }) => (
    <div data-testid={`quote-row-${label}`} className={`glass p-5 clip-tag border-l-2 ${accent}`}>
      <div className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">{label}</div>
      <div className="text-3xl font-black text-white mt-1">${data.subtotal}</div>
      <div className="font-mono text-[10px] text-slate-500 mt-2">parts ${data.partsCost} · labor ${data.laborCost}</div>
    </div>
  );

  return (
    <section id="quote" data-testid="quote-section" className="relative py-28 px-5 grid-floor">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <div className="font-mono text-xs tracking-[0.3em] text-[color:var(--cyan)] mb-3">// 02 — DIAGNOSTIC QUOTE LAB</div>
          <h2 className="text-4xl md:text-5xl font-black neon-text mb-6">INSTANT ESTIMATE ENGINE</h2>
          <div className="space-y-6">
            <div>
              <div className="font-mono text-xs text-slate-400 mb-3 tracking-widest">SELECT FAULT</div>
              <div className="grid grid-cols-2 gap-3">
                {ISSUES.map((o) => (
                  <button key={o.id} data-testid={`quote-issue-${o.id}`} onClick={() => setIssue(o.id)}
                    className={`py-3 clip-tag font-mono text-xs tracking-widest transition-all ${issue === o.id ? "bg-[color:var(--cyan)] text-void font-bold" : "glass text-slate-300 hover:text-white"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-xs text-slate-400 mb-3 tracking-widest">DEVICE CLASS</div>
              <div className="grid grid-cols-2 gap-3">
                {TIERS.map((o) => (
                  <button key={o.id} data-testid={`quote-tier-${o.id}`} onClick={() => setTier(o.id)}
                    className={`py-3 clip-tag font-mono text-xs tracking-widest transition-all ${tier === o.id ? "bg-[color:var(--magenta)] text-void font-bold" : "glass text-slate-300 hover:text-white"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <button data-testid="quote-run-btn" onClick={run} disabled={loading}
              className="btn-neon w-full py-4 font-display font-bold tracking-widest text-void bg-[color:var(--cyan)] clip-tag flex items-center justify-center gap-2 hover:bg-[color:var(--magenta)]">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              {loading ? "COMPUTING..." : "CALCULATE QUOTE"}
            </button>
          </div>
        </div>
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="res" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                data-testid="quote-result" className="space-y-4">
                <div className="font-mono text-xs text-[color:var(--cyan)] tracking-widest animate-flicker">&gt; ESTIMATE GENERATED</div>
                <Row label="Budget Tier" data={result.budget} accent="border-slate-500" />
                <Row label="Professional Tier" data={result.professional} accent="border-[color:var(--cyan)]" />
                <Row label="Authorized Tier" data={result.authorized} accent="border-[color:var(--magenta)]" />
                <button data-testid="quote-book-btn" onClick={onBook}
                  className="btn-neon w-full py-3 font-mono text-xs tracking-widest border border-cyan-neon/50 text-[color:var(--cyan)] clip-tag hover:bg-cyan-neon/10">
                  DEPLOY THE LAB TO ME →
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty" className="glass p-10 clip-tag text-center h-full grid place-items-center" data-testid="quote-placeholder">
                <div>
                  <Zap className="mx-auto text-[color:var(--cyan)] mb-4 animate-floaty" size={40} />
                  <p className="font-mono text-xs text-slate-400 tracking-widest">SELECT PARAMETERS AND RUN THE ENGINE TO SEE LIVE PRICING</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
