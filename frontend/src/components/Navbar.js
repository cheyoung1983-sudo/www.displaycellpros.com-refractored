import React, { useState, useEffect } from "react";
import { Cpu, Menu, X } from "lucide-react";

const LINKS = [
  { id: "home", label: "HOME" },
  { id: "services", label: "SERVICES" },
  { id: "quote", label: "QUOTE LAB" },
  { id: "store", label: "STORE" },
  { id: "book", label: "DEPLOY LAB" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };
  return (
    <nav data-testid="main-navbar" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass py-3" : "py-5 bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
        <button data-testid="nav-logo" onClick={() => go("home")} className="flex items-center gap-2 group">
          <div className="w-9 h-9 grid place-items-center border border-cyan-neon/60 clip-tag" style={{ boxShadow: "0 0 14px rgba(0,229,255,0.4)" }}>
            <Cpu size={18} className="text-[color:var(--cyan)]" />
          </div>
          <span className="font-display font-bold tracking-widest text-sm neon-text">D&amp;CP</span>
        </button>
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <button key={l.id} data-testid={`nav-${l.id}`} onClick={() => go(l.id)}
              className="font-mono text-xs tracking-widest text-slate-300 hover:text-[color:var(--cyan)] transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-[color:var(--cyan)] after:transition-all">
              {l.label}
            </button>
          ))}
        </div>
        <button data-testid="nav-cta" onClick={() => go("quote")}
          className="hidden md:block btn-neon font-mono text-xs tracking-widest px-5 py-2 clip-tag text-void bg-[color:var(--cyan)] font-bold hover:bg-[color:var(--magenta)]">
          INSTANT QUOTE
        </button>
        <button data-testid="nav-mobile-toggle" className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden glass mt-3 mx-4 p-5 flex flex-col gap-4 clip-tag">
          {LINKS.map((l) => (
            <button key={l.id} data-testid={`nav-mobile-${l.id}`} onClick={() => go(l.id)} className="font-mono text-sm tracking-widest text-left text-slate-200">{l.label}</button>
          ))}
        </div>
      )}
    </nav>
  );
}
