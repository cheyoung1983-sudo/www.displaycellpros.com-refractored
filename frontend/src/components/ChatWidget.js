import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Sparkles } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I'm ARC — your AI repair concierge. Describe what's wrong with your device and I'll recommend the right repair tier." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });
      if (!res.ok) {
        const msg = res.status === 429 ? "You're sending messages too fast — give me a few seconds." : "Signal lost — please try again.";
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: msg }; return c; });
        setBusy(false);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value);
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + chunk };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: "Signal lost — please try again." }; return c; });
    }
    setBusy(false);
  };

  return (
    <>
      <button data-testid="chat-toggle" onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[60] w-16 h-16 grid place-items-center clip-tag bg-[color:var(--cyan)] text-void shadow-neon hover:bg-[color:var(--magenta)] btn-neon">
        {open ? <X size={26} /> : <Bot size={28} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div data-testid="chat-panel" initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-28 right-6 z-[60] w-[92vw] max-w-sm h-[65vh] glass clip-tag flex flex-col overflow-hidden">
            <div className="p-4 border-b border-cyan-neon/20 flex items-center gap-2">
              <Sparkles size={16} className="text-[color:var(--cyan)]" />
              <span className="font-display font-bold tracking-widest text-sm neon-text">ARC CONCIERGE</span>
              <span className="ml-auto font-mono text-[9px] text-[color:var(--cyan)] animate-flicker">ONLINE</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} data-testid={`chat-msg-${m.role}`} className={`max-w-[85%] p-3 clip-tag text-sm whitespace-pre-wrap ${m.role === "user" ? "ml-auto bg-[color:var(--cyan)] text-void" : "bg-void/60 border border-cyan-neon/20 text-slate-200"}`}>
                  {m.content || <span className="animate-pulse">…</span>}
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t border-cyan-neon/20 flex gap-2">
              <input data-testid="chat-input" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Describe the issue…"
                className="flex-1 bg-void/60 border border-cyan-neon/20 focus:border-[color:var(--cyan)] outline-none px-3 py-2 text-white text-sm clip-tag" />
              <button data-testid="chat-send" onClick={send} disabled={busy}
                className="btn-neon px-4 grid place-items-center bg-[color:var(--cyan)] text-void clip-tag hover:bg-[color:var(--magenta)]">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
