import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Key, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Bot,
  Settings
} from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updateProfile,
  signInWithPopup,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence
} from "firebase/auth";
import { auth, db, googleProvider } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseUIAuth } from "./FirebaseUIAuth";

const GoogleSSOMaintenanceBanner: React.FC = () => (
  <div className="bg-amber-950/25 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5 animate-pulse mb-3">
    <AlertTriangle className="w-4 h-4 text-[#FFBF00] shrink-0 mt-0.5" />
    <div className="text-left">
      <h4 className="text-[10.5px] font-bold text-[#FFBF00] uppercase tracking-wide font-mono">SSO System Update</h4>
      <p className="text-[10px] text-amber-200/80 leading-relaxed font-mono">
        Google SSO gateway is undergoing scheduled schema optimization. Authentication requests may experience temporary latency. If blocked, utilize a standard corporate email & password profile.
      </p>
    </div>
  </div>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  addToast: (title: string, message: string, type: "success" | "error" | "info" | "warning") => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  addToast
}) => {
  const [tab, setTab] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [isSandboxed, setIsSandboxed] = useState(false);
  const [persistenceMode, setPersistenceMode] = useState<"local" | "session" | "none">("local");
  const [useFirebaseUI, setUseFirebaseUI] = useState(false);

  useEffect(() => {
    // Detect if running within an iframe (e.g., AI Studio preview sandbox)
    try {
      if (window.self !== window.top) {
        setIsSandboxed(true);
      }
    } catch (e) {
      setIsSandboxed(true);
    }
  }, []);

  const handleGoogleClick = async () => {
    setIsLoading(true);
    setStatusText("Configuring security persistence...");
    try {
      const modeMap = {
        local: browserLocalPersistence,
        session: browserSessionPersistence,
        none: inMemoryPersistence
      };
      await setPersistence(auth, modeMap[persistenceMode]);
      await onGoogleSignIn();
    } catch (err: any) {
      console.error("Persistence/SSO error:", err);
      addToast("Authentication Error", err.message || "Failed to configure secure credentials gateway.", "error");
    } finally {
      setIsLoading(false);
      setStatusText("");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("Missing Fields", "Please enter your email and password.", "warning");
      return;
    }

    setIsLoading(true);
    setStatusText("Configuring session persistence...");
    try {
      const modeMap = {
        local: browserLocalPersistence,
        session: browserSessionPersistence,
        none: inMemoryPersistence
      };
      await setPersistence(auth, modeMap[persistenceMode]);

      setStatusText("Verifying credentials...");
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      addToast(
        "Welcome Back",
        `Authenticated as ${userCredential.user.displayName || userCredential.user.email}`,
        "success"
      );
      onClose();
    } catch (error: any) {
      console.error("Auth Signin Error:", error);
      let errMsg = "Unable to complete login. Please verify your credentials.";
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        errMsg = "Incorrect email or password. Please verify your Spokane Lab credentials.";
      } else if (error.code === "auth/too-many-requests") {
        errMsg = "Too many failed attempts. This session has been temporarily throttled for security.";
      } else if (error.message?.includes("API_KEY_HTTP_REFERRER_BLOCKED")) {
        errMsg = "Forensic Gateway Blocked: The API key is restricted and does not allow this local origin. Update the Google Cloud Console referrer allowlist.";
      }
      addToast("Authentication Failed", errMsg, "error");
    } finally {
      setIsLoading(false);
      setStatusText("");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      addToast("Missing Fields", "Please fill out all required fields to create a profile.", "warning");
      return;
    }

    if (password.length < 6) {
      addToast("Weak Password", "Security protocol requires a password of at least 6 characters.", "warning");
      return;
    }

    setIsLoading(true);
    setStatusText("Configuring session persistence...");
    try {
      const modeMap = {
        local: browserLocalPersistence,
        session: browserSessionPersistence,
        none: inMemoryPersistence
      };
      await setPersistence(auth, modeMap[persistenceMode]);

      setStatusText("Provisioning Spokane Lab Client Record...");
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      setStatusText("Configuring security profile...");
      await updateProfile(userCredential.user, { displayName: name.trim() });

      setStatusText("Transmitting email verification...");
      try {
        await sendEmailVerification(userCredential.user);
      } catch (err) {
        console.warn("Could not send immediate email verification during signup:", err);
      }

      setStatusText("Syncing Firestore user mapping...");
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email.trim().toLowerCase(),
        displayName: name.trim(),
        role: "customer",
        isAdmin: false,
        createdAt: new Date().toISOString()
      });

      addToast(
        "Account Registered",
        `Forensic node initialized. We have transmitted a verification link to your email address. Welcome, ${name}!`,
        "success"
      );
      onClose();
    } catch (error: any) {
      console.error("Auth Signup Error:", error);
      let errMsg = "Registration failed. Please review your details.";
      if (error.code === "auth/email-already-in-use") {
        errMsg = "An account is already linked to this email address.";
      } else if (error.code === "auth/invalid-email") {
        errMsg = "The email address layout is structurally invalid.";
      } else if (error.message?.includes("API_KEY_HTTP_REFERRER_BLOCKED")) {
        errMsg = "Forensic Node Blocked: API key restriction prevents registration from this origin. Verify Google Cloud Console security policies.";
      }
      addToast("Registration Rejected", errMsg, "error");
    } finally {
      setIsLoading(false);
      setStatusText("");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast("Email Required", "Please specify your registered email address.", "warning");
      return;
    }

    setIsLoading(true);
    setStatusText("Transmitting password reset directive...");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      addToast(
        "Recovery Dispatched",
        "A password recovery link has been transmitted to your email address.",
        "success"
      );
      setTab("signin");
    } catch (error: any) {
      console.error("Forgot Password Error:", error);
      let errMsg = "Could not process password recovery. Please check the email address.";
      if (error.code === "auth/user-not-found") {
        errMsg = "No Spokane Lab record is linked to this email address.";
      }
      addToast("Recovery Failed", errMsg, "error");
    } finally {
      setIsLoading(false);
      setStatusText("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-[#111111] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-teal-950/60 flex items-center justify-center border border-teal-500/30 shadow-inner">
              <Bot className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Spokane Lab Auth</h3>
              <p className="text-[10px] text-teal-400 font-mono tracking-wider uppercase">Forensic Identity Gateway</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Close Auth Screen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Gateway Protocol</h4>
            <button
              onClick={() => setUseFirebaseUI(!useFirebaseUI)}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-teal-500 hover:text-teal-400 transition-colors"
            >
              <Settings className="w-3 h-3" />
              {useFirebaseUI ? "SWITCH_TO_FORENSIC_UI" : "SWITCH_TO_STANDARD_UI"}
            </button>
          </div>

          {useFirebaseUI ? (
            <FirebaseUIAuth
              onSignInSuccess={() => {
                onClose();
                return false; // Let custom logic handle post-auth
              }}
            />
          ) : (
            <>
              {/* Iframe warning flag */}
          {isSandboxed && (
            <div className="bg-amber-950/40 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">Sandbox Iframe Detected</h4>
                <p className="text-[10.5px] text-amber-200/80 leading-relaxed">
                  Third-party cookies or popup blockers in this preview window may block Google SSO login. 
                  We highly recommend creating a secure <strong>Email & Password</strong> account below to preserve your lab diagnostics.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Tab bar */}
          {tab !== "forgot" && (
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-850">
              <button
                type="button"
                onClick={() => setTab("signin")}
                className={`py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  tab === "signin" 
                    ? "bg-teal-900/30 text-teal-400 border border-teal-500/20" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab("signup")}
                className={`py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  tab === "signup" 
                    ? "bg-teal-900/30 text-teal-400 border border-teal-500/20" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Tab Views */}
          {tab === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5 text-center pb-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Password Restoration</h4>
                <p className="text-[10.5px] text-slate-400">Specify your registered email. A recovery link will be sent to restore access.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    disabled={isLoading}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-teal-500/10 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Dispatched Recovery Node...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Send Reset Directive</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTab("signin")}
                className="w-full text-center text-[10.5px] text-slate-500 hover:text-teal-400 underline font-mono transition-colors"
              >
                Return to Sign In Gateway
              </button>
            </form>
          ) : tab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    disabled={isLoading}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Access PIN / Password</label>
                  <button
                    type="button"
                    onClick={() => setTab("forgot")}
                    className="text-[10px] text-teal-400 hover:text-teal-300 hover:underline font-mono"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Credential Lifetime Policy Selector */}
              <div className="bg-slate-950 border border-slate-850/60 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                  <span className="text-slate-400">Credential Lifetime Policy</span>
                  <span className="text-[#00BFFF] font-bold">
                    {persistenceMode === "local" ? "LOCAL_PERSISTENT" : persistenceMode === "session" ? "EPHEMERAL_SESSION" : "VOLATILE_MEMORY"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPersistenceMode("local")}
                    className={`p-2 rounded-lg text-[10px] font-mono border transition-all text-center flex flex-col justify-between min-h-[58px] cursor-pointer ${
                      persistenceMode === "local"
                        ? "bg-teal-950/20 border-teal-500/40 text-teal-300"
                        : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    <span className="font-extrabold uppercase tracking-wider block">Persistent</span>
                    <span className="text-[7.5px] text-slate-500 leading-tight block mt-1 select-none">
                      Retain across restarts
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersistenceMode("session")}
                    className={`p-2 rounded-lg text-[10px] font-mono border transition-all text-center flex flex-col justify-between min-h-[58px] cursor-pointer ${
                      persistenceMode === "session"
                        ? "bg-teal-950/20 border-teal-500/40 text-teal-300"
                        : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    <span className="font-extrabold uppercase tracking-wider block">Session</span>
                    <span className="text-[7.5px] text-slate-500 leading-tight block mt-1 select-none">
                      Clear on window close
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersistenceMode("none")}
                    className={`p-2 rounded-lg text-[10px] font-mono border transition-all text-center flex flex-col justify-between min-h-[58px] cursor-pointer ${
                      persistenceMode === "none"
                        ? "bg-teal-950/20 border-teal-500/40 text-teal-300"
                        : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    <span className="font-extrabold uppercase tracking-wider block">Volatile</span>
                    <span className="text-[7.5px] text-slate-500 leading-tight block mt-1 select-none">
                      Clear on tab reload
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-teal-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{statusText || "Verifying..."}</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative my-4 flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800/80"></div>
                <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-mono uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-slate-800/80"></div>
              </div>

              <GoogleSSOMaintenanceBanner />

              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-[#0a0a0a] hover:bg-[#141414] border border-slate-800 hover:border-slate-750 text-slate-300 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-black/20"
              >
                <svg className="h-4 w-4 shrink-0 text-blue-400" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Full Display Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Miller"
                    required
                    disabled={isLoading}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Corporate Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    disabled={isLoading}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Create Access Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Credential Lifetime Policy Selector */}
              <div className="bg-slate-950 border border-slate-850/60 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                  <span className="text-slate-400">Credential Lifetime Policy</span>
                  <span className="text-[#00BFFF] font-bold">
                    {persistenceMode === "local" ? "LOCAL_PERSISTENT" : persistenceMode === "session" ? "EPHEMERAL_SESSION" : "VOLATILE_MEMORY"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPersistenceMode("local")}
                    className={`p-2 rounded-lg text-[10px] font-mono border transition-all text-center flex flex-col justify-between min-h-[58px] cursor-pointer ${
                      persistenceMode === "local"
                        ? "bg-teal-950/20 border-teal-500/40 text-teal-300"
                        : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    <span className="font-extrabold uppercase tracking-wider block">Persistent</span>
                    <span className="text-[7.5px] text-slate-500 leading-tight block mt-1 select-none">
                      Retain across restarts
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersistenceMode("session")}
                    className={`p-2 rounded-lg text-[10px] font-mono border transition-all text-center flex flex-col justify-between min-h-[58px] cursor-pointer ${
                      persistenceMode === "session"
                        ? "bg-teal-950/20 border-teal-500/40 text-teal-300"
                        : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    <span className="font-extrabold uppercase tracking-wider block">Session</span>
                    <span className="text-[7.5px] text-slate-500 leading-tight block mt-1 select-none">
                      Clear on window close
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersistenceMode("none")}
                    className={`p-2 rounded-lg text-[10px] font-mono border transition-all text-center flex flex-col justify-between min-h-[58px] cursor-pointer ${
                      persistenceMode === "none"
                        ? "bg-teal-950/20 border-teal-500/40 text-teal-300"
                        : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    <span className="font-extrabold uppercase tracking-wider block">Volatile</span>
                    <span className="text-[7.5px] text-slate-500 leading-tight block mt-1 select-none">
                      Clear on tab reload
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-teal-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{statusText || "Provisioning..."}</span>
                  </>
                ) : (
                  <>
                    <span>Register Corporate Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative my-4 flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800/80"></div>
                <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-mono uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-slate-800/80"></div>
              </div>

              <GoogleSSOMaintenanceBanner />

              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-[#0a0a0a] hover:bg-[#141414] border border-slate-800 hover:border-slate-750 text-slate-300 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-black/20"
              >
                <svg className="h-4 w-4 shrink-0 text-blue-400" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>
            </form>
          )}
          </>
          )}

        </div>
      </motion.div>
    </div>
  );
};
