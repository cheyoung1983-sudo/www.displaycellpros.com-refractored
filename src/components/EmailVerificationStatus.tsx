import React, { useState, useEffect } from "react";
import { onAuthStateChanged, sendEmailVerification, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { AlertTriangle, Mail, Loader2, RefreshCw } from "lucide-react";

interface EmailVerificationStatusProps {
  addToast?: (title: string, description: string, type: "success" | "error" | "info" | "warning") => void;
}

export const EmailVerificationStatus: React.FC<EmailVerificationStatusProps> = ({ addToast }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user) {
      if (addToast) {
        addToast("Registry Error", "No active forensic laboratory session detected.", "error");
      }
      return;
    }

    setIsSending(true);
    try {
      await sendEmailVerification(user);
      if (addToast) {
        addToast(
          "Token Dispatched",
          `A secure verification token has been successfully transmitted to ${user.email}.`,
          "success"
        );
      }
    } catch (err: any) {
      console.error("Verification email dispatch failed:", err);
      let errMsg = err.message || "Failed to transmit cryptographic verification link.";
      if (err.code === "auth/too-many-requests") {
        errMsg = "Cryptographic gateway rate limit exceeded. Please wait a few moments before requesting again.";
      }
      if (addToast) {
        addToast("Registry Lockout", errMsg, "error");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleManualSync = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setIsRefreshing(true);
    try {
      await user.reload();
      setCurrentUser({ ...auth.currentUser } as User);
      if (addToast) {
        if (auth.currentUser?.emailVerified) {
          addToast("Telemetry Certified", "Your email address is now verified and certified secure.", "success");
        } else {
          addToast("Registry Sync Completed", "SSO verification state remains unverified in central directories.", "warning");
        }
      }
    } catch (err: any) {
      console.error("Forensic manual sync failed:", err);
      if (addToast) {
        addToast("Registry Sync Failure", err.message || "Failed to query Google SSO directory.", "error");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // If no user is logged in, or the user's email is already verified, suppress the warning banner
  if (!currentUser || currentUser.emailVerified || currentUser.isAnonymous) {
    return null;
  }

  return (
    <div 
      id="email-verification-warning-banner"
      className="bg-[#111111] border border-[#FFBF00]/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-4xl mx-auto shadow-lg relative overflow-hidden"
    >
      {/* Aesthetic Left Border Accent representing circuit fault */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFBF00]" />

      <div className="flex items-start gap-3.5 pl-2">
        <div className="p-2 rounded-lg bg-[#FFBF00]/10 border border-[#FFBF00]/25 text-[#FFBF00] shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
            Unverified Session State Detected
          </h4>
          <p className="text-[11px] text-slate-400 font-mono leading-relaxed max-w-2xl">
            LOG_STATE: <span className="text-[#FFBF00]">PENDING_IDENTITY_AUDIT</span>. Your email address (<span className="text-white select-all">{currentUser.email}</span>) is unverified in our secure registries. Some advanced circuit forensic tools require verified sessions to protect server-side telemetry.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto pl-12 sm:pl-0 shrink-0">
        <button
          id="email-verification-btn-sync"
          type="button"
          onClick={handleManualSync}
          disabled={isRefreshing}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
          title="Verify and Sync Credentials"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#00BFFF]" : ""}`} />
        </button>

        <button
          id="email-verification-btn-resend"
          type="button"
          onClick={handleResend}
          disabled={isSending}
          className="min-h-[40px] px-4 bg-amber-950/40 hover:bg-amber-950/70 border border-[#FFBF00]/30 text-[#FFBF00] hover:text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
        >
          {isSending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Transmitting...</span>
            </>
          ) : (
            <>
              <Mail className="w-3.5 h-3.5" />
              <span>Resend Verification</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
