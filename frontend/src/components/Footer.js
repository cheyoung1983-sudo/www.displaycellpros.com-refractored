import React from "react";
import { Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer data-testid="footer" className="relative border-t border-cyan-neon/10 mt-24 py-14 px-5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={20} className="text-[color:var(--cyan)]" />
            <span className="font-display font-bold tracking-widest neon-text">DISPLAY &amp; CELL PROS</span>
          </div>
          <p className="text-slate-400 text-sm max-w-xs">The mobile repair lab that deploys to your driveway. Right-to-Repair compliant device restoration across Washington State.</p>
        </div>
        <div className="font-mono text-xs text-slate-400 space-y-2">
          <div className="text-[color:var(--cyan)] tracking-widest mb-3">// COVERAGE</div>
          <p>Spokane · Seattle · Tacoma</p>
          <p>Bellevue · Everett · Olympia</p>
          <p>Vancouver WA · Redmond</p>
        </div>
        <div className="font-mono text-xs text-slate-400 space-y-2">
          <div className="text-[color:var(--magenta)] tracking-widest mb-3">// UPLINK</div>
          <p>dispatch@displaycellpros.com</p>
          <p>+1 (509) 000-PROS</p>
          <p className="animate-flicker text-[color:var(--cyan)]">STATUS: LAB ONLINE</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/5 text-center font-mono text-[10px] tracking-widest text-slate-600">
        © 2026 DISPLAY &amp; CELL PROS // ALL SYSTEMS NOMINAL
      </div>
    </footer>
  );
}
