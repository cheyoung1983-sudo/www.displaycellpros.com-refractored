import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { LogOut, Truck, RefreshCw, Cpu } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_BACKEND_URL;
const STATUSES = ["pending", "dispatched", "completed", "cancelled"];
const COLORS = { pending: "text-yellow-400", dispatched: "text-[color:var(--cyan)]", completed: "text-lime-neon", cancelled: "text-[color:var(--magenta)]" };

export default function AdminDashboard() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState("bookings");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const fetchAll = async () => {
      const meRes = await axios.get(`${API}/api/auth/me`, { withCredentials: true });
      setMe(meRes.data);
      const [b, p] = await Promise.all([
        axios.get(`${API}/api/admin/bookings`, { withCredentials: true }),
        axios.get(`${API}/api/admin/payments`, { withCredentials: true }),
      ]);
      setBookings(b.data);
      setPayments(p.data);
    };
    try {
      await fetchAll();
    } catch (e) {
      // access token may have expired — try one silent refresh (JWT sessions only)
      try {
        await axios.post(`${API}/api/auth/refresh`, {}, { withCredentials: true });
        await fetchAll();
      } catch (e2) {
        nav("/admin/login");
      }
    }
    setLoading(false);
  }, [nav]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try {
      const r = await axios.patch(`${API}/api/admin/bookings/${id}`, { status }, { withCredentials: true });
      setBookings((bs) => bs.map((b) => (b.id === id ? r.data : b)));
    } catch (e) { /* noop */ }
  };
  const logout = async () => { await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true }); nav("/admin/login"); };

  if (loading) return <div className="min-h-screen bg-void grid place-items-center font-mono text-[color:var(--cyan)] animate-pulse">AUTHENTICATING…</div>;

  const counts = STATUSES.map((s) => ({ s, n: bookings.filter((b) => b.status === s).length }));

  return (
    <div className="min-h-screen bg-void text-slate-100">
      <div className="glass border-b border-cyan-neon/10 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="text-[color:var(--cyan)]" />
          <span className="font-display font-bold tracking-widest neon-text">DISPATCH CONTROL ROOM</span>
        </div>
        <div className="flex items-center gap-4">
          <span data-testid="admin-me" className="font-mono text-xs text-slate-400 hidden sm:block">{me?.email}</span>
          <button data-testid="admin-refresh" onClick={load} className="btn-neon p-2 glass clip-tag"><RefreshCw size={16} className="text-[color:var(--cyan)]" /></button>
          <button data-testid="admin-logout" onClick={logout} className="btn-neon px-4 py-2 font-mono text-xs tracking-widest bg-[color:var(--magenta)] text-void clip-tag flex items-center gap-2"><LogOut size={14} /> EXIT</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {counts.map(({ s, n }) => (
            <div key={s} data-testid={`stat-${s}`} className="glass clip-tag p-5">
              <div className={`text-3xl font-black font-display ${COLORS[s]}`}>{n}</div>
              <div className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mt-1">{s}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <button data-testid="tab-bookings" onClick={() => setTab("bookings")}
            className={`px-5 py-2 clip-tag font-mono text-xs tracking-widest transition-all ${tab === "bookings" ? "bg-[color:var(--cyan)] text-void font-bold" : "glass text-slate-300"}`}>
            DISPATCHES ({bookings.length})
          </button>
          <button data-testid="tab-orders" onClick={() => setTab("orders")}
            className={`px-5 py-2 clip-tag font-mono text-xs tracking-widest transition-all ${tab === "orders" ? "bg-[color:var(--magenta)] text-void font-bold" : "glass text-slate-300"}`}>
            ORDERS ({payments.length})
          </button>
        </div>

        {tab === "orders" ? (
          <div className="space-y-3" data-testid="orders-list">
            <div className="glass clip-tag p-4 hidden md:grid grid-cols-5 gap-4 font-mono text-[10px] tracking-widest text-slate-500">
              <span>PROVIDER</span><span>PRODUCT</span><span>AMOUNT</span><span>STATUS</span><span>DATE</span>
            </div>
            {payments.length === 0 && <div className="glass clip-tag p-8 text-center font-mono text-xs text-slate-500">NO ORDERS YET</div>}
            {payments.map((p, i) => (
              <div key={i} data-testid={`order-row-${i}`} className="glass clip-tag p-4 grid md:grid-cols-5 gap-2 md:gap-4 items-center text-sm">
                <span className={`font-mono text-[10px] tracking-widest uppercase font-bold ${p.provider === "paypal" ? "text-[color:var(--magenta)]" : "text-[color:var(--cyan)]"}`}>{p.provider || "stripe"}</span>
                <span className="text-slate-300">{p.lookup_key}</span>
                <span className="font-black text-white">${(p.amount || 0).toFixed(2)}</span>
                <span className={`font-mono text-[10px] tracking-widest uppercase ${p.payment_status === "paid" ? "text-lime-neon" : p.payment_status === "failed" ? "text-[color:var(--magenta)]" : "text-yellow-400"}`}>{p.payment_status}</span>
                <span className="font-mono text-[10px] text-slate-500">{new Date(p.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
        <>
        <h2 className="font-display font-bold tracking-widest text-white mb-4 flex items-center gap-2"><Truck size={18} className="text-[color:var(--cyan)]" /> INCOMING DISPATCHES</h2>
        <div className="space-y-3">
          {bookings.length === 0 && <div className="glass clip-tag p-8 text-center font-mono text-xs text-slate-500">NO BOOKINGS YET</div>}
          {bookings.map((b) => (
            <motion.div key={b.id} data-testid={`booking-row-${b.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass clip-tag p-5 grid md:grid-cols-4 gap-4 items-center">
              <div>
                <div className="font-bold text-white">{b.name}</div>
                <div className="font-mono text-xs text-slate-400">{b.phone}</div>
                <div className="font-mono text-[10px] text-slate-600 mt-1">{new Date(b.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-sm">
                <div className="text-slate-300">{b.device}</div>
                <div className="font-mono text-[10px] text-[color:var(--cyan)] uppercase">{b.issueType} · {b.deviceTier}</div>
                <div className="text-slate-500 text-xs">{b.address}</div>
              </div>
              <div className="text-sm">
                <div className="font-mono text-[10px] text-slate-500">PRO ESTIMATE</div>
                <div className="text-xl font-black text-white">${b.quote?.professional?.subtotal}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button key={s} data-testid={`set-${s}-${b.id}`} onClick={() => setStatus(b.id, s)}
                    className={`px-2 py-1 clip-tag font-mono text-[9px] tracking-widest border transition-all ${b.status === s ? "bg-[color:var(--cyan)] text-void border-transparent font-bold" : "border-white/10 text-slate-400 hover:text-white"}`}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
