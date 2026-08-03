import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

export default function PaymentResult({ ok }) {
  const nav = useNavigate();
  const [status, setStatus] = useState(ok ? "checking" : "cancel");

  useEffect(() => {
    if (!ok) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("provider") === "paypal") { setStatus("paid"); return; }
    const sid = params.get("session_id");
    if (!sid) { setStatus("error"); return; }
    let tries = 0;
    const poll = async () => {
      try {
        const r = await axios.get(`${API}/api/payments/status/${sid}`);
        if (r.data.payment_status === "paid") { setStatus("paid"); return; }
      } catch (e) { /* noop */ }
      if (++tries < 8) setTimeout(poll, 2000); else setStatus("timeout");
    };
    poll();
  }, [ok]);

  const cfg = {
    checking: { icon: <Loader2 className="animate-spin text-[color:var(--cyan)]" size={54} />, t: "CONFIRMING PAYMENT…", d: "Verifying your transaction with Stripe." },
    paid: { icon: <CheckCircle2 className="text-lime-neon" size={54} />, t: "PAYMENT CONFIRMED", d: "Your order is locked in. A confirmation is on the way." },
    timeout: { icon: <Loader2 className="text-yellow-400" size={54} />, t: "STILL PROCESSING", d: "Payment is taking a moment. Check your email for confirmation." },
    error: { icon: <XCircle className="text-[color:var(--magenta)]" size={54} />, t: "SESSION NOT FOUND", d: "We couldn't find that checkout session." },
    cancel: { icon: <XCircle className="text-[color:var(--magenta)]" size={54} />, t: "CHECKOUT CANCELLED", d: "No charge was made. Your cart is still waiting." },
  }[status];

  return (
    <div className="min-h-screen bg-void grid place-items-center px-5 grid-floor">
      <div data-testid="payment-result" data-status={status} className="glass clip-tag p-10 text-center max-w-md">
        <div className="mx-auto mb-4 w-fit">{cfg.icon}</div>
        <h1 className="text-2xl font-black text-white font-display mb-2">{cfg.t}</h1>
        <p className="text-slate-400 mb-8">{cfg.d}</p>
        <button data-testid="payment-home-btn" onClick={() => nav("/")}
          className="btn-neon px-8 py-3 font-display font-bold tracking-widest text-void bg-[color:var(--cyan)] clip-tag hover:bg-[color:var(--magenta)]">
          BACK TO BASE
        </button>
      </div>
    </div>
  );
}
