import React, { useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { 
  ShieldCheck, 
  UserPlus, 
  RefreshCw, 
  Terminal, 
  Lock, 
  Mail, 
  Check, 
  AlertCircle, 
  Info,
  Code,
  Server
} from "lucide-react";

interface BackendAuthPanelProps {
  authUser: FirebaseUser | null;
}

export function BackendAuthPanel({ authUser }: BackendAuthPanelProps) {
  // Programmatic User creation states
  const [progEmail, setProgEmail] = useState("");
  const [progPassword, setProgPassword] = useState("");
  const [progName, setProgName] = useState("");
  const [progLoading, setProgLoading] = useState(false);
  const [progResponse, setProgResponse] = useState<any | null>(null);
  const [progError, setProgError] = useState<string | null>(null);

  // Touched states for inputs to display error messages during/after editing
  const [progEmailTouched, setProgEmailTouched] = useState(false);
  const [progPasswordTouched, setProgPasswordTouched] = useState(false);

  // Email format validation helper
  const isEmailValid = (email: string) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Determine real-time validation error messages
  const emailInputError = progEmailTouched && progEmail.length > 0 && !isEmailValid(progEmail)
    ? "Invalid email format"
    : null;

  const passwordInputError = progPasswordTouched && progPassword.length > 0 && progPassword.length < 6
    ? "Password too short (min 6 characters)"
    : null;

  // Map server-side auth failures to the respective field if matched
  const getEmailErrorMessage = () => {
    if (emailInputError) return emailInputError;
    if (progError) {
      const errLower = progError.toLowerCase();
      if (errLower.includes("email") || errLower.includes("auth/invalid-email") || errLower.includes("auth/email-already-in-use")) {
        if (errLower.includes("already-in-use") || errLower.includes("already in use")) {
          return "Email address is already in use by another account";
        }
        return "Invalid email format";
      }
    }
    return null;
  };

  const getPasswordErrorMessage = () => {
    if (passwordInputError) return passwordInputError;
    if (progError) {
      const errLower = progError.toLowerCase();
      if (errLower.includes("password") || errLower.includes("auth/weak-password") || errLower.includes("too short")) {
        return "Password is too short (min 6 characters)";
      }
    }
    return null;
  };

  // ID Token verification states
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResponse, setVerifyResponse] = useState<any | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Tab state inside this panel: Demo vs Snippets
  const [activeSubTab, setActiveSubTab] = useState<"demo" | "snippets">("demo");

  // Handle Programmatic User Creation on Backend
  const handleProgrammaticCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgEmailTouched(true);
    setProgPasswordTouched(true);

    if (!progEmail || !progPassword || !isEmailValid(progEmail) || progPassword.length < 6) return;

    setProgLoading(true);
    setProgError(null);
    setProgResponse(null);

    try {
      const res = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: progEmail,
          password: progPassword,
          displayName: progName || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user on backend.");
      }

      setProgResponse(data);
      // Clear form inputs on success
      setProgEmail("");
      setProgPassword("");
      setProgName("");
      setProgEmailTouched(false);
      setProgPasswordTouched(false);
    } catch (err: any) {
      setProgError(err.message || String(err));
    } finally {
      setProgLoading(false);
    }
  };

  // Handle Session Token Verification on Backend
  const handleVerifySessionToken = async () => {
    if (!authUser) return;

    setVerifyLoading(true);
    setVerifyError(null);
    setVerifyResponse(null);

    try {
      // 1. Get the raw JWT ID token from the client-side Firebase Auth instance
      const idToken = await authUser.getIdToken(true); // force refresh to get latest state

      // 2. Post it to our backend endpoint to verify
      const res = await fetch("/api/auth/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify session token.");
      }

      setVerifyResponse(data);
    } catch (err: any) {
      setVerifyError(err.message || String(err));
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div id="backend-auth-panel" className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col flex-1 shadow-md overflow-hidden animate-in fade-in duration-200">
      
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-700/80 flex justify-between items-center bg-slate-850/45">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wider uppercase font-mono">
              Firebase Backend Admin & Auth Integrator
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">Verify access tokens and programmatically register users via the Node.js Admin SDK</p>
          </div>
        </div>
        <div className="flex rounded-md bg-slate-900 p-0.5 border border-slate-800 font-mono">
          <button
            onClick={() => setActiveSubTab("demo")}
            className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-sm transition-all ${
              activeSubTab === "demo" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Live Demo
          </button>
          <button
            onClick={() => setActiveSubTab("snippets")}
            className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-sm transition-all ${
              activeSubTab === "snippets" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Code Guides
          </button>
        </div>
      </div>

      {activeSubTab === "demo" ? (
        <div className="p-5 space-y-6">
          
          {/* SECURE SESSION HANDSHAKE INTEGRATION TESTING */}
          <div className="bg-slate-900/60 border border-slate-750 rounded-xl p-4.5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  1. Real-time Backend Token Verification (Session Accessibility)
                </h3>
              </div>
              <span className="text-[9px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-700">
                POST /api/auth/verify-token
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              To guarantee that a user has valid access to protected website features, the React frontend extracts their Firebase ID Token (JWT) and passes it via safe header/body channels to the Node.js backend. The backend uses the <b>Firebase Admin SDK</b> to verify the token's validity, expiration, and signature.
            </p>

            {authUser ? (
              <div className="space-y-3 pt-1">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-850 font-mono text-[10.5px] text-slate-350 space-y-1">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5 mb-1.5">
                    <span className="font-bold text-slate-400 uppercase text-[9px]">Active Session Telemetry</span>
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1 text-[9px] uppercase tracking-wider animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>
                      Token Ready
                    </span>
                  </div>
                  <div><span className="text-slate-500">USER ID:</span> {authUser.uid}</div>
                  <div><span className="text-slate-500">EMAIL:</span> {authUser.email}</div>
                  <div><span className="text-slate-500">CLIENT AUTH STATUS:</span> <span className="text-emerald-400 font-bold">Authenticated</span></div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVerifySessionToken}
                    disabled={verifyLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-98 disabled:opacity-50"
                  >
                    {verifyLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Verifying on Backend...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Verify ID Token against Express Server
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/50 p-4.5 rounded-lg border border-dashed border-slate-750 text-center space-y-2">
                <Lock className="w-6 h-6 text-slate-500 mx-auto" />
                <p className="text-[11px] text-slate-400 font-mono">
                  No active authenticated user. Register or Sign In using the "Durable Cloud Sync" sidebar form to unlock live session verification checks.
                </p>
              </div>
            )}

            {/* Verification Response display */}
            {(verifyResponse || verifyError) && (
              <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  <span>Express Backend JSON Output</span>
                </div>
                {verifyResponse && (
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-[180px] leading-relaxed">
                    {JSON.stringify(verifyResponse, null, 2)}
                  </pre>
                )}
                {verifyError && (
                  <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-lg text-xs text-red-300 font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Error response from server: {verifyError}</span>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* PROGRAMMATIC BACKEND USER REGISTRATION TESTING */}
          <div className="bg-slate-900/60 border border-slate-750 rounded-xl p-4.5 space-y-4 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  2. Programmatic Admin User Creation (Admin SDK Endpoint)
                </h3>
              </div>
              <span className="text-[9px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-700">
                POST /api/auth/create-user
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              To trigger automated user registrations after sales, B2B transactions, or manual admin invites, write code programmatically in the backend using <b>firebase-admin</b> instead of client triggers. Use this sandbox form to execute a programmatic register instruction.
            </p>

            <form onSubmit={handleProgrammaticCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="progName" className="block text-[9px] text-slate-500 uppercase font-bold mb-1 font-mono">Full Name (Display)</label>
                <input
                  id="progName"
                  type="text"
                  value={progName}
                  onChange={(e) => setProgName(e.target.value)}
                  placeholder="John Spokane"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-[1px] focus:outline-blue-500 font-mono"
                />
              </div>

              <div>
                <label htmlFor="progEmail" className="block text-[9px] text-slate-500 uppercase font-bold mb-1 font-mono">Email Address *</label>
                <input
                  id="progEmail"
                  type="email"
                  value={progEmail}
                  onChange={(e) => setProgEmail(e.target.value)}
                  onBlur={() => setProgEmailTouched(true)}
                  placeholder="admin-invite@displaycellpros.com"
                  className={`w-full bg-slate-950 border rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-[1px] font-mono transition-colors ${
                    getEmailErrorMessage() 
                      ? "border-red-500/80 focus:outline-red-500" 
                      : "border-slate-800 focus:outline-blue-500"
                  }`}
                  required
                />
                {getEmailErrorMessage() && (
                  <span className="text-[10px] text-red-400 mt-1 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {getEmailErrorMessage()}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="progPassword" className="block text-[9px] text-slate-500 uppercase font-bold mb-1 font-mono">Temp Password *</label>
                <div className="relative">
                  <input
                    id="progPassword"
                    type="text"
                    value={progPassword}
                    onChange={(e) => setProgPassword(e.target.value)}
                    onBlur={() => setProgPasswordTouched(true)}
                    placeholder="Min 6 chars"
                    className={`w-full bg-slate-950 border rounded pl-2.5 pr-12 py-1.5 text-xs text-slate-200 focus:outline-[1px] font-mono transition-colors ${
                      getPasswordErrorMessage() 
                        ? "border-red-500/80 focus:outline-red-500" 
                        : "border-slate-800 focus:outline-blue-500"
                    }`}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProgPassword(Math.random().toString(36).slice(-8) + "X!");
                      setProgPasswordTouched(true);
                    }}
                    className="absolute right-2 top-1.5 text-[8.5px] font-bold text-blue-400 hover:text-blue-300 font-mono uppercase"
                  >
                    Gen
                  </button>
                </div>
                {getPasswordErrorMessage() && (
                  <span className="text-[10px] text-red-400 mt-1 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {getPasswordErrorMessage()}
                  </span>
                )}
              </div>

              <div className="md:col-span-3 pt-1">
                <button
                  type="submit"
                  disabled={progLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  {progLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Creating programmatically on Express...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-white" />
                      Programmatic Invite & Create User
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Creation Response display */}
            {(progResponse || progError) && (
              <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  <span>Express Backend User Creation Response</span>
                </div>
                {progResponse && (
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-[180px] leading-relaxed">
                    {JSON.stringify(progResponse, null, 2)}
                  </pre>
                )}
                {progError && (
                  <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-lg text-xs text-red-300 font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Error response from server: {progError}</span>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="p-5 space-y-5 font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[600px]">
          
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-750 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[11px] border-b border-slate-800 pb-2">
              <Code className="w-4 h-4" />
              <span>1. Correct SDK Selection & Usage Guides</span>
            </div>
            <p className="text-[11px] text-slate-400">
              When working in a full-stack Node.js environment, <b>never</b> import client-side packages like <code className="text-amber-400">firebase/auth</code> or <code className="text-amber-400">createUserWithEmailAndPassword</code>. These are designed strictly for web browser clients. Instead, you MUST use the <b>Firebase Admin SDK</b> (<code className="text-emerald-400">firebase-admin</code>) inside Node, as it utilizes service account policies and runs securely on backend containers.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase text-[10.5px]">
              <Server className="w-3.5 h-3.5" />
              <span>Backend Configuration (Express Server Code)</span>
            </div>
            <pre className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 font-mono text-[9px] text-blue-300 overflow-x-auto leading-relaxed select-all">
{`// server.ts - Programmatic Admin SDK Config
import admin from "firebase-admin";

// Initialize using Application Default Credentials (ADC)
admin.initializeApp({
  projectId: "displaycellpros-com"
});

// Programmatic User Creator Endpoint
app.post("/api/auth/create-user", async (req, res) => {
  const { email, password, displayName } = req.body;
  
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || email.split("@")[0],
    });
    
    res.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});`}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase text-[10.5px]">
              <Mail className="w-3.5 h-3.5" />
              <span>Frontend Session Handshake (React Client Code)</span>
            </div>
            <pre className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 font-mono text-[9px] text-blue-300 overflow-x-auto leading-relaxed select-all">
{`// src/App.tsx - Secure User Token Pipeline
import { auth } from "./lib/firebase";

async function verifyBackendAccessibility() {
  const user = auth.currentUser;
  if (!user) return;

  // 1. Fetch short-lived JWT token from Firebase Client SDK
  const idToken = await user.getIdToken(true);

  // 2. Transmit to backend for token verification
  const response = await fetch("/api/auth/verify-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ idToken })
  });

  const verificationResult = await response.json();
  console.log("Backend response secure validation result:", verificationResult);
}`}
            </pre>
          </div>

        </div>
      )}

      {/* Footer Info strip */}
      <div className="bg-slate-900 px-5 py-3 border-t border-slate-700/80 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <span>Fully supports secure on-premise Spokane WA developer handshakes using validated JWT schemas.</span>
      </div>

    </div>
  );
}
