import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Lock, RefreshCw, Loader2, Key, Database, Cpu } from "lucide-react";

interface AuthLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function AuthLoadingOverlay({ isLoading, message }: AuthLoadingOverlayProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  const loadingStatuses = [
    "Establishing secure Handshake with Firebase Auth...",
    "Validating client-side JSON Web Token (JWT) integrity...",
    "Contacting Google Identity Service SSO backend...",
    "Checking Spokane WA server session credentials...",
    "Syncing secure Firestore backup repositories...",
    "Registering cryptographic session signatures..."
  ];

  // Rotate loading sub-messages to simulate live background processing steps
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % loadingStatuses.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          id="auth-loading-global-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md p-6 select-none"
        >
          {/* Neon Radial Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12)_0%,transparent_65%)] pointer-events-none" />

          {/* Core Spinner Container */}
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative bg-slate-900 border border-slate-800/90 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-blue-500/10 text-center space-y-6 border-t-2 border-t-blue-500"
          >
            {/* Spinning Gears / Glowing Halo */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              {/* Spinning Outer Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-full"
              />
              
              {/* Spinning Innermost Accent Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                className="absolute inset-1.5 border border-dashed border-emerald-500/40 rounded-full"
              />

              {/* Pulsing Core Icon Shield */}
              <div className="absolute inset-3 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center shadow-inner">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <Lock className="w-6 h-6 text-blue-400" />
                </motion.div>
              </div>
            </div>

            {/* Headers */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SECURE USER SIGN-IN HANDSHAKE</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans px-2">
                Your credentials are encrypted using secure end-to-end token handshakes. Please do not refresh the page.
              </p>
            </div>

            {/* Dynamic Status Ticker */}
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-left font-mono text-[10.5px] leading-relaxed shadow-inner">
              <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase font-bold border-b border-slate-850 pb-1.5 mb-1.5">
                <span>Auth Pipeline telemetry</span>
                <span className="text-blue-400 animate-pulse flex items-center gap-1 text-[8.5px]">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  PROCESSING
                </span>
              </div>
              <div className="text-slate-300 min-h-[32px] flex items-start gap-1.5 transition-all">
                <span className="text-emerald-400 font-extrabold animate-pulse shrink-0">&gt;</span>
                <span className="animate-in fade-in duration-300 key={statusIndex}">
                  {message || loadingStatuses[statusIndex]}
                </span>
              </div>
            </div>

            {/* Progress Micro-indicator */}
            <div className="space-y-1">
              <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-850/60">
                <motion.div
                  initial={{ width: "10%" }}
                  animate={{ width: ["15%", "45%", "75%", "99%", "15%"] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full"
                />
              </div>
              <p className="text-[9px] text-slate-500 font-mono text-right">Spokane Dev Handshake Protocol v1.19</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AuthSkeletonCard() {
  return (
    <div className="bg-slate-900/65 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-400 space-y-4 animate-pulse select-none">
      {/* Skeleton Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-800" />
          <div className="h-3 w-32 bg-slate-800 rounded" />
        </div>
        <div className="h-2 w-16 bg-slate-800 rounded font-mono" />
      </div>

      {/* Skeleton Text Paragraph */}
      <div className="space-y-2 py-1">
        <div className="h-2.5 w-full bg-slate-800 rounded" />
        <div className="h-2.5 w-11/12 bg-slate-800 rounded" />
        <div className="h-2.5 w-4/5 bg-slate-800 rounded" />
      </div>

      {/* Skeleton Input Fields */}
      <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-slate-850/80">
        <div className="space-y-1.5">
          <div className="h-2 w-16 bg-slate-800 rounded" />
          <div className="h-8 w-full bg-slate-900 rounded border border-slate-800/55" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-16 bg-slate-800 rounded" />
          <div className="h-8 w-full bg-slate-900 rounded border border-slate-800/55" />
        </div>
        <div className="h-8 w-full bg-slate-800 rounded mt-2" />
      </div>

      {/* Skeleton Buttons */}
      <div className="flex justify-between items-center text-center">
        <div className="h-3 w-40 bg-slate-800 rounded mx-auto" />
      </div>

      {/* Google SSO Button Skeleton */}
      <div className="h-8 w-full bg-slate-850 rounded-lg mt-3" />
    </div>
  );
}

export function ProfileSkeletonCard() {
  return (
    <div className="bg-slate-900/65 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-400 space-y-4 animate-pulse select-none">
      {/* Header bar representation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-800" />
          <div className="h-3 w-28 bg-slate-800 rounded" />
        </div>
        <div className="h-4 w-20 bg-emerald-950/40 border border-emerald-900/50 rounded" />
      </div>

      {/* Avatar and Profile Text row */}
      <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-850/80">
        <div className="w-9 h-9 rounded-full bg-slate-800" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 bg-slate-800 rounded" />
          <div className="h-2.5 w-36 bg-slate-800 rounded" />
        </div>
      </div>

      {/* Text Info rows */}
      <div className="space-y-1.5 font-mono text-[10.5px]">
        <div className="h-2.5 w-1/2 bg-slate-800 rounded" />
        <div className="h-2.5 w-2/3 bg-slate-800 rounded" />
      </div>

      {/* Sign Out Button Skeleton */}
      <div className="h-8 w-full bg-slate-800 rounded-lg mt-2" />
    </div>
  );
}
