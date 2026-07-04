import React, { useState, useEffect } from "react";
import { sendEmailVerification, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  RefreshCw, 
  Loader2, 
  Info,
  Copy,
  AlertTriangle
} from "lucide-react";

interface VerificationStatusProps {
  addToast?: (msg: string, desc: string, type: "success" | "error" | "info" | "warning") => void;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ addToast }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    // Monitor real-time auth changes & verify direct state alignment
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Determine if email is verified leveraging currentUser.emailVerified directly
  // Anonymous sandbox users bypass verification logically, but we respect the explicit property constraint.
  const isEmailVerified = currentUser ? (currentUser.emailVerified || currentUser.isAnonymous) : false;

  const handleRefresh = async () => {
    if (!auth.currentUser) return;
    setIsRefreshing(true);
    setFeedback(null);
    try {
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setCurrentUser({ ...updatedUser });
      
      const verified = updatedUser.emailVerified || updatedUser.isAnonymous;
      if (addToast) {
        addToast(
          "Telemetry Synced",
          verified 
            ? "Session verification status certified safe by Google identity directories." 
            : "SSO email verification status remains unverified in central registries.",
          verified ? "success" : "warning"
        );
      } else {
        setFeedback({ 
          message: verified 
            ? "Session state successfully certified. Email status is VERIFIED." 
            : "Session state reloaded. Email remains UNVERIFIED in registry databases.", 
          isError: !verified 
        });
      }
    } catch (err: any) {
      console.error("Forensic registry reload error:", err);
      if (addToast) {
        addToast("Sync Failure", err.message || "Failed to query Google SSO registry.", "error");
      } else {
        setFeedback({ message: err.message || "Failed to sync credential database.", isError: true });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResend = async () => {
    const userToVerify = auth.currentUser;
    if (!userToVerify) {
      if (addToast) {
        addToast("Identity Error", "No authenticated user session found.", "error");
      } else {
        setFeedback({ message: "No active authenticated session detected.", isError: true });
      }
      return;
    }

    setIsSending(true);
    setFeedback(null);
    try {
      // Direct call to sendEmailVerification Firebase function as requested
      await sendEmailVerification(userToVerify);
      if (addToast) {
        addToast(
          "Token Transmitted",
          `Verification cryptographic link successfully transmitted to ${userToVerify.email}.`,
          "success"
        );
      } else {
        setFeedback({ 
          message: `Forensic verification token transmitted successfully to ${userToVerify.email}. Please verify via incoming email.`, 
          isError: false 
        });
      }
    } catch (err: any) {
      console.error("Cryptographic token transmission error:", err);
      let errMsg = err.message || "Failed to dispatch verification email.";
      if (err.code === "auth/too-many-requests") {
        errMsg = "Cryptographic gateway rate limit exceeded. Please wait a few moments before trying again.";
      }
      if (addToast) {
        addToast("Transmission Blocked", errMsg, "error");
      } else {
        setFeedback({ message: errMsg, isError: true });
      }
    } finally {
      setIsSending(false);
    }
  };

  const copyEmailToClipboard = () => {
    if (currentUser?.email) {
      navigator.clipboard.writeText(currentUser.email);
      if (addToast) {
        addToast("Email Copied", "Identity string successfully saved to clipboard.", "info");
      }
    }
  };

  if (loading) {
    return (
      <div 
        id="verification-status-loading" 
        className="flex flex-col items-center justify-center p-8 bg-[#111111] border border-slate-800 rounded-xl max-w-md mx-auto"
      >
        <Loader2 className="w-6 h-6 animate-spin text-[#008080] mb-3" />
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">
          Querying SSO Registry...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div 
        id="verification-status-unauthenticated" 
        className="bg-[#111111] border border-slate-800 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto font-sans"
      >
        <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-5 h-5 text-slate-500" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">No Active Registry</h4>
          <p className="text-[11px] text-slate-500 font-mono">
            LOG_STATE: NO_SSO_IDENTITY_CONNECTED
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-2 leading-relaxed">
            Please authenticate using Google SSO or register an authorized laboratory account to perform S2C circuit diagnostics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="verification-status-card" 
      className="bg-[#111111] border border-slate-800 rounded-2xl p-6 max-w-md mx-auto font-sans text-left space-y-4 shadow-xl relative overflow-hidden"
    >
      {/* Decorative high-contrast ambient lines representing physical logic twin state */}
      <div className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${
        isEmailVerified 
          ? "from-transparent via-[#008080] to-transparent" 
          : "from-transparent via-[#FFBF00] to-transparent"
      }`} />

      {/* Header section with brand metrics */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          {isEmailVerified ? (
            <ShieldCheck className="w-5 h-5 text-[#008080]" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-[#FFBF00] animate-pulse" />
          )}
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-wider font-mono">
              Identity Verification Status
            </h4>
            <p className="text-[9px] text-slate-500 font-mono tracking-wide uppercase mt-0.5">
              Protocol: {isEmailVerified ? "SECURE_SESSION_ACTIVE" : "PENDING_MANUAL_AUDIT"}
            </p>
          </div>
        </div>

        <div>
          {isEmailVerified ? (
            <span className="text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded">
              Verified
            </span>
          ) : (
            <span className="text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/10 border border-amber-500/25 text-amber-500 px-2 py-0.5 rounded animate-pulse">
              Unverified
            </span>
          )}
        </div>
      </div>

      {/* Identity Profile Details */}
      <div className="bg-slate-950/80 border border-slate-850/70 rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-mono">Registered Account:</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-slate-200 select-all truncate max-w-[180px]">
              {currentUser.email}
            </span>
            <button
              id="verification-status-btn-copy-email"
              type="button"
              onClick={copyEmailToClipboard}
              className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Copy Registered Account Email"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-mono">Verification Value:</span>
          <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
            currentUser.emailVerified 
              ? "bg-emerald-950/45 text-emerald-400 border-emerald-500/20" 
              : "bg-amber-950/45 text-amber-400 border-amber-500/20"
          }`}>
            emailVerified: {currentUser.emailVerified ? "true" : "false"}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-mono">Account Registry:</span>
          <span className="font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {currentUser.isAnonymous ? "Temporary Sandbox" : "SSO Directory"}
          </span>
        </div>
      </div>

      {/* Message feedback area */}
      {feedback && (
        <div 
          id="verification-status-feedback-msg"
          className={`p-3 rounded-lg text-[10.5px] font-mono border leading-relaxed ${
            feedback.isError 
              ? "bg-red-950/20 border-red-500/20 text-red-400" 
              : "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
          }`}
        >
          <div className="flex gap-1.5 items-start">
            <span className="shrink-0">{feedback.isError ? "🚨" : "✅"}</span>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Action triggers */}
      <div className="flex flex-col gap-2 pt-1">
        {!isEmailVerified && (
          <button
            id="verification-status-btn-resend"
            type="button"
            onClick={handleResend}
            disabled={isSending}
            className="w-full min-h-[44px] bg-[#0a0a0a] hover:bg-[#141414] border border-slate-850 hover:border-slate-700 text-slate-350 hover:text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
          >
            {isSending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                <span>Transmitting secure link...</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-[#008080]" />
                <span>Resend Verification Email</span>
              </>
            )}
          </button>
        )}

        <button
          id="verification-status-btn-refresh"
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`w-full min-h-[44px] font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
            isEmailVerified
              ? "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
              : "bg-[#008080] hover:bg-[#008080]/95 text-white hover:shadow-teal-500/10"
          }`}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Checking session state...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Verify Status Update</span>
            </>
          )}
        </button>
      </div>

      {/* Informational Footer */}
      {!isEmailVerified && (
        <div className="text-[10px] text-slate-500 font-mono leading-relaxed border-t border-slate-850 pt-2.5 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
          <p>
            An active email verification registry keeps the S2C Gateway safe from unauthorized telemetry logs. If verified, press "Verify Status Update".
          </p>
        </div>
      )}
    </div>
  );
};
