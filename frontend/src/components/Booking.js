import React, { useState } from "react";
import { motion } from "framer-motion";
import { Truck, CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

const FIELDS = [
  { k: "name", label: "CALLSIGN / NAME", type: "text" },
  { k: "phone", label: "CONTACT FREQUENCY / PHONE", type: "tel" },
  { k: "email", label: "EMAIL (OPTIONAL)", type: "email" },
  { k: "device", label: "DEVICE MODEL", type: "text" },
  { k: "address", label: "DEPLOYMENT COORDINATES / ADDRESS", type: "text" },
];

export default function Booking() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", device: "", address: "", notes: "", issueType: "screen", deviceTier: "flagship" });
  const [done, setDone] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.device) return;
    setLoading(true);
    try {
      const r = await axios.post(`${API}/api/bookings`, form);
      setDone(r.data);
    } catch (er) { /* noop */ }
    setLoading(false);
  };

  return (
    <section id="book" data-testid="booking-section" className="relative py-28 px-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="font-mono text-xs tracking-[0.3em] text-[color:var(--cyan)] mb-3">// 04 — DEPLOY THE LAB</div>
          <h2 className="text-4xl md:text-5xl font-black neon-text">REQUEST FIELD DISPATCH</h2>
          <p className="text-slate-400 mt-4">We drive the mobile lab to your driveway. Book a slot below.</p>
        </div>
        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            data-testid="booking-success" className="glass clip-tag p-10 text-center">
            <CheckCircle2 className="mx-auto text-lime-neon mb-4" size={54} />
            <h3 className="text-2xl font-black text-white mb-2 font-display">DISPATCH CONFIRMED</h3>
            <p className="font-mono text-xs text-slate-400 tracking-widest">TICKET ID // {done.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-slate-300 mt-4">Estimated pro-tier restoration: <span className="text-[color:var(--cyan)] font-bold">${done.quote.professional.subtotal}</span></p>
            <p className="text-slate-500 text-sm mt-2">Our technician will contact {done.name} at {done.phone} to lock a time window.</p>
          </motion.div>
        ) : (
          <form onSubmit={submit} data-testid="booking-form" className="glass clip-tag p-8 space-y-5">
            {FIELDS.map((f) => (
              <div key={f.k}>
                <label className="font-mono text-[10px] tracking-widest text-slate-400">{f.label}</label>
                <input data-testid={`booking-${f.k}`} type={f.type} value={form[f.k]}
                  onChange={(e) => set(f.k, e.target.value)}
                  className="w-full mt-1 bg-void/60 border border-cyan-neon/20 focus:border-[color:var(--cyan)] outline-none px-4 py-3 text-white font-body transition-colors clip-tag" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] tracking-widest text-slate-400">FAULT TYPE</label>
                <select data-testid="booking-issueType" value={form.issueType} onChange={(e) => set("issueType", e.target.value)}
                  className="w-full mt-1 bg-void/60 border border-cyan-neon/20 outline-none px-4 py-3 text-white clip-tag">
                  <option value="screen">Cracked Screen</option>
                  <option value="battery">Battery / Power</option>
                  <option value="port">Charging Port</option>
                  <option value="other">Diagnostics</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-widest text-slate-400">DEVICE CLASS</label>
                <select data-testid="booking-deviceTier" value={form.deviceTier} onChange={(e) => set("deviceTier", e.target.value)}
                  className="w-full mt-1 bg-void/60 border border-cyan-neon/20 outline-none px-4 py-3 text-white clip-tag">
                  <option value="flagship">Flagship</option>
                  <option value="standard">Standard</option>
                </select>
              </div>
            </div>
            <button data-testid="booking-submit" type="submit" disabled={loading}
              className="btn-neon w-full py-4 font-display font-bold tracking-widest text-void bg-[color:var(--cyan)] clip-tag flex items-center justify-center gap-2 hover:bg-[color:var(--magenta)]">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Truck size={18} />}
              {loading ? "TRANSMITTING..." : "REQUEST DISPATCH"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
