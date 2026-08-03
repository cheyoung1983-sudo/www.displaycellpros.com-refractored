import React, { useEffect, useRef } from "react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const hash = window.location.hash;
    const sid = new URLSearchParams(hash.replace("#", "")).get("session_id");
    const finish = async () => {
      try {
        await axios.post(`${API}/api/auth/google/session`, { session_id: sid }, { withCredentials: true });
      } catch (e) { /* noop */ }
      window.history.replaceState(null, "", "/admin");
      window.location.href = "/admin";
    };
    if (sid) finish(); else window.location.href = "/admin/login";
  }, []);
  return <div className="min-h-screen bg-void grid place-items-center font-mono text-[color:var(--cyan)] animate-pulse">ESTABLISHING SECURE UPLINK…</div>;
}
