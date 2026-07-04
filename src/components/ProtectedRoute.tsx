import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ShieldAlert, Loader2, RefreshCw, Mail } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isVerified, sendVerification, reloadUser, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] bg-[#111111] rounded-2xl border border-slate-850">
        <Loader2 className="w-8 h-8 animate-spin text-[#008080] mb-4" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">Initializing Security Gateway...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-[#111111] border border-slate-800 rounded-2xl p-8 text-center space-y-6 animate-in fade-in">
        <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white uppercase font-mono tracking-wider">Access Restricted</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please authenticate using Google SSO or register an authorized laboratory account to access telemetry logs and circuit audits.
          </p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    const handleRefresh = async () => {
      setIsRefreshing(true);
      setFeedback(null);
      try {
        await reloadUser();
      } catch (err: any) {
        setFeedback({ message: err.message || "Failed to sync credentials.", isError: true });
      } finally {
        setIsRefreshing(false);
      }
    };

    const handleResend = async () => {
      setIsSending(true);
      setFeedback(null);
      try {
        await sendVerification();
        setFeedback({ message: `Verification token successfully transmitted to ${user.email}.`, isError: false });
      } catch (err: any) {
        setFeedback({ message: err.message || "Error transmitting validation token.", isError: true });
      } finally {
        setIsSending(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto my-12 bg-[#111111] border-2 border-[#FFBF00]/25 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="h-16 w-16 rounded-full bg-amber-950/50 border border-[#FFBF00]/30 flex items-center justify-center shadow-inner relative">
          <ShieldAlert className="w-9 h-9 text-[#FFBF00] animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-[#111111]"></span>
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-wider text-white uppercase font-mono">
            Security Audit Required
          </h2>
          <p className="text-[10px] text-[#008080] font-mono tracking-widest uppercase">
            Email Verification Pending — S2C Gateway Blocked
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-left space-y-3 max-w-lg w-full">
          <div className="flex items-start gap-2 text-slate-350 text-xs leading-relaxed">
            <span className="text-[#FFBF00] shrink-0 font-bold font-mono">⚠️</span>
            <p>
              To safeguard client diagnostic records, active webhook channels, and NIST SP 800-88 R1 sanitization logs, the Spokane laboratory interface mandates complete email validation.
            </p>
          </div>
          <div className="border-t border-slate-800/40 my-2"></div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider shrink-0">
              Pending Registry:
            </div>
            <div className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-md text-slate-200 font-mono truncate select-all">
              {user.email}
            </div>
          </div>
        </div>

        {feedback && (
          <div className={`p-3 rounded-lg text-xs font-mono max-w-lg w-full border ${
            feedback.isError 
              ? "bg-red-950/30 border-red-500/20 text-red-400" 
              : "bg-emerald-950/30 border-emerald-500/20 text-emerald-400"
          }`}>
            {feedback.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-6 py-3 bg-[#008080] hover:bg-[#008080]/95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-teal-500/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Validating Registry...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-white" />
                <span>I Have Verified My Email</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isSending}
            className="px-6 py-3 bg-[#0a0a0a] hover:bg-[#141414] border border-slate-800 hover:border-slate-700 text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span>Transmitting secure link...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-[#008080]" />
                <span>Re-send Verification Email</span>
              </>
            )}
          </button>
        </div>

        <div className="text-[10px] text-slate-500 font-mono space-y-1">
          <p>Check your email inbox and spam folder for instructions.</p>
          <button
            type="button"
            onClick={logout}
            className="text-red-400 hover:text-red-300 uppercase tracking-widest font-bold underline cursor-pointer mt-2 bg-transparent border-none"
          >
            Sign Out and Try Another Account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
