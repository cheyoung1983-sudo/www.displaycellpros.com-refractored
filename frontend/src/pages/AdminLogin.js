import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Loader2, Cpu } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_BACKEND_URL;

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      await axios.post(`${API}/api/auth/login`, { email, password }, { withCredentials: true });
      nav("/admin");
    } catch (er) {
      setErr(typeof er.response?.data?.detail === "string" ? er.response.data.detail : "Login failed");
    }
    setLoading(false);
  };

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/admin";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-void grid place-items-center px-5 grid-floor">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        data-testid="admin-login-card" className="glass clip-tag p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <Cpu className="text-[color:var(--cyan)]" />
          <span className="font-display font-bold tracking-widest neon-text">CONTROL ROOM ACCESS</span>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] tracking-widest text-slate-400">STAFF EMAIL</label>
            <input data-testid="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-void/60 border border-cyan-neon/20 focus:border-[color:var(--cyan)] outline-none px-4 py-3 text-white clip-tag" />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-widest text-slate-400">PASSWORD</label>
            <input data-testid="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 bg-void/60 border border-cyan-neon/20 focus:border-[color:var(--cyan)] outline-none px-4 py-3 text-white clip-tag" />
          </div>
          {err && <div data-testid="admin-error" className="font-mono text-xs text-[color:var(--magenta)]">{err}</div>}
          <button data-testid="admin-login-btn" type="submit" disabled={loading}
            className="btn-neon w-full py-3 font-display font-bold tracking-widest text-void bg-[color:var(--cyan)] clip-tag flex items-center justify-center gap-2 hover:bg-[color:var(--magenta)]">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />} SIGN IN
          </button>
        </form>
        <div className="my-5 flex items-center gap-3 text-slate-600 font-mono text-[10px]"><div className="flex-1 h-px bg-white/10" />OR<div className="flex-1 h-px bg-white/10" /></div>
        <button data-testid="admin-google-btn" onClick={googleLogin}
          className="btn-neon w-full py-3 font-mono text-xs tracking-widest border border-cyan-neon/40 text-white clip-tag hover:bg-cyan-neon/10">
          CONTINUE WITH GOOGLE
        </button>
      </motion.div>
    </div>
  );
}
