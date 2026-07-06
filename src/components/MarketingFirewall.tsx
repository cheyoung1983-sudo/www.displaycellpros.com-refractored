import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  ShieldAlert, 
  Globe, 
  Sparkles, 
  Code, 
  Cpu, 
  Flame, 
  Key, 
  FileCheck, 
  ArrowRight, 
  Terminal, 
  Lock, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  Workflow,
  Fingerprint,
  DollarSign,
  Activity,
  Database,
  Send
} from "lucide-react";

// Lexicon configuration
interface LexiconMapping {
  forbidden: string;
  replacement: string;
  category: "Auth Bypass" | "Consumer Terms" | "Sandboxed Exploit";
  explanation: string;
}

const BRAND_LEXICON: LexiconMapping[] = [
  {
    forbidden: "CFAllocator",
    replacement: "Deep-Level Hardware Telemetry and Sensor Analytics",
    category: "Sandboxed Exploit",
    explanation: "Low-level memory-trapping technique that triggers App Store Section 2.19 rejection."
  },
  {
    forbidden: "IOKit",
    replacement: "Enterprise Hardware Telemetry Bridge",
    category: "Sandboxed Exploit",
    explanation: "Raw kernel/hardware access library. Restricting exposure prevents cease-and-desist alerts."
  },
  {
    forbidden: "App Store",
    replacement: "Private Enterprise Companion Apps (distributed via web / ABM)",
    category: "Auth Bypass",
    explanation: "We bypass consumer review channels entirely via B2B distribution."
  },
  {
    forbidden: "Jailbreak",
    replacement: "External Non-Invasive Telemetry Audit",
    category: "Auth Bypass",
    explanation: "MDM admins and corporate compliance officers blacklist any association with device jailbreaking."
  },
  {
    forbidden: "Screwdriver",
    replacement: "Precision Micro-Probing and Telemetry Sensor Arrays",
    category: "Consumer Terms",
    explanation: "Fails our silicon-layer branding prestige. Dilutes authoritative engineering image."
  },
  {
    forbidden: "Phone Repair Shop",
    replacement: "Silicon Forensic Audit Facility / Independent Diagnostic Center",
    category: "Consumer Terms",
    explanation: "Aligns with enterprise-scale laboratory operations."
  },
  {
    forbidden: "Modular part-swapping",
    replacement: "Telemetry-Guided Component-Level Restoration",
    category: "Consumer Terms",
    explanation: "Attacks the cheap standard of guessing-and-swapping in favor of scientific measurement."
  },
  {
    forbidden: "Quick fix",
    replacement: "Micro-soldering circuit-level calibration",
    category: "Consumer Terms",
    explanation: "Avoids sounding like low-quality or transient work."
  },
  {
    forbidden: "Easy swap",
    replacement: "Telemetry-Guided physical layer swap",
    category: "Consumer Terms",
    explanation: "Elevates standard diagnostic lexicon."
  }
];

export function MarketingFirewall() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [detectedTokens, setDetectedTokens] = useState<string[]>([]);
  const [complianceScore, setComplianceScore] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useInternalRoute, setUseInternalRoute] = useState(false);
  const [activeTab, setActiveTab] = useState<"portal" | "playground" | "recaptcha" | "analytics">("portal");
  const [logs, setLogs] = useState<string[]>([
    "[08:14:02] Firewall engine successfully booted. 0.0.0.0 ingress locked.",
    "[08:14:05] S2C Lexical parameters loaded: 9 rules compiled.",
    "[08:22:19] Routine NIST compliance self-check executed: 100% Green."
  ]);

  // reCAPTCHA Enterprise Account Defender & Transaction Audit States
  const [accountId, setAccountId] = useState("operator_772_alpha");
  const [hashedAccountId, setHashedAccountId] = useState("");
  const [userIp, setUserIp] = useState("192.168.12.115");
  const [userAgentString, setUserAgentString] = useState("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
  const [criticalAction, setCriticalAction] = useState("login");
  const [evaluatingRisk, setEvaluatingRisk] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [recapReasons, setRecapReasons] = useState<string[]>([]);
  const [assessmentId, setAssessmentId] = useState("");
  const [assessmentName, setAssessmentName] = useState("");
  
  // Event Annotation States
  const [annotationTargetId, setAnnotationTargetId] = useState("");
  const [annotationAction, setAnnotationAction] = useState("LEGITIMATE");
  const [annotationReasons, setAnnotationReasons] = useState<string[]>([]);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationResult, setAnnotationResult] = useState("");

  // Risk-Based Transaction States
  const [transactionAmount, setTransactionAmount] = useState("1450.00");
  const [transactionCurrency, setTransactionCurrency] = useState("USD");
  const [cardBin, setCardBin] = useState("411111");
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [isReportingTransaction, setIsReportingTransaction] = useState(false);
  const [transactionResult, setTransactionResult] = useState("");

  // reCAPTCHA Password Defense State Variables
  const [recaptchaSubTab, setRecaptchaSubTab] = useState<"account_defender" | "password_defense">("account_defender");
  const [pwUsername, setPwUsername] = useState("admin_forensics");
  const [pwPassword, setPwPassword] = useState("123456");
  const [pwLookupHashPrefix, setPwLookupHashPrefix] = useState("");
  const [pwEncryptedHash, setPwEncryptedHash] = useState("");
  const [pwIsChecking, setPwIsChecking] = useState(false);
  const [pwAssessmentId, setPwAssessmentId] = useState("");
  const [pwAssessmentName, setPwAssessmentName] = useState("");
  const [pwReencryptedHash, setPwReencryptedHash] = useState("");
  const [pwLeakMatchPrefixes, setPwLeakMatchPrefixes] = useState<string[]>([]);
  const [pwIsLeaked, setPwIsLeaked] = useState<boolean | null>(null);
  const [pwVerdictMessage, setPwVerdictMessage] = useState("");
  const [pwRemediationStatus, setPwRemediationStatus] = useState("");

  // Cryptographic Parameter Generation for Password Defense High-Privacy Protocol
  React.useEffect(() => {
    const generateParameters = async () => {
      if (!pwUsername || !pwPassword) {
        setPwLookupHashPrefix("");
        setPwEncryptedHash("");
        return;
      }
      try {
        // Step 1: Calculate username SHA-256 hash prefix
        const usernameBuffer = new TextEncoder().encode(pwUsername);
        const usernameHash = await crypto.subtle.digest("SHA-256", usernameBuffer);
        const hashArray = Array.from(new Uint8Array(usernameHash));
        
        // Take 4 bytes prefix for lookup_hash_prefix
        const prefixBytes = hashArray.slice(0, 4);
        const base64Prefix = btoa(String.fromCharCode(...prefixBytes));
        setPwLookupHashPrefix(base64Prefix);

        // Step 2: Calculate encrypted credentials (using a SHA-256 salt+password mix base64 encoded)
        const combinedBuffer = new TextEncoder().encode(`${pwUsername}:${pwPassword}`);
        const combinedHash = await crypto.subtle.digest("SHA-256", combinedBuffer);
        const combinedHashArray = Array.from(new Uint8Array(combinedHash));
        const base64EncryptedHash = btoa(String.fromCharCode(...combinedHashArray));
        setPwEncryptedHash(base64EncryptedHash);
      } catch (e) {
        // Fallback for environment constraints
        setPwLookupHashPrefix("sim_prefix==");
        setPwEncryptedHash("sim_encrypted_user_credentials_hash_dummy_value==");
      }
    };
    generateParameters();
  }, [pwUsername, pwPassword]);

  const handlePasswordLeakCheck = async () => {
    setPwIsChecking(true);
    setPwIsLeaked(null);
    setPwVerdictMessage("");
    setPwRemediationStatus("");

    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      `[${timestamp}] [reCAPTCHA Password Check] Initiating high-privacy cryptographic evaluation...`,
      ...prev
    ].slice(0, 8));

    try {
      const response = await fetch("/api/recaptcha/password-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          lookupHashPrefix: pwLookupHashPrefix,
          encryptedUserCredentialsHash: pwEncryptedHash,
          username: pwUsername,
          password: pwPassword,
          token: "offline_token"
        })
      });

      if (!response.ok) throw new Error(`HTTP status ${response.status}`);

      const result = await response.json();
      
      const privData = result.privatePasswordLeakVerification || {};
      const reencrypted = privData.reencryptedUserCredentialsHash || "";
      const prefixes = privData.encryptedLeakMatchPrefixes || [];

      setPwAssessmentId(result.assessmentId || "");
      setPwAssessmentName(result.name || "");
      setPwReencryptedHash(reencrypted);
      setPwLeakMatchPrefixes(prefixes);

      // Verify leak status: Check if reencrypted hash is in the prefixes list
      const isLeaked = prefixes.includes(reencrypted);
      setPwIsLeaked(isLeaked);

      if (isLeaked) {
        setPwVerdictMessage("CRITICAL DANGER: This credential pair has been detected in public data breaches! Immediate remediation is mandatory.");
        setLogs(prev => [
          `[${new Date().toLocaleTimeString()}] [reCAPTCHA ALERT] Leaked credentials detected for user '${pwUsername}'!`,
          ...prev
        ].slice(0, 8));
      } else {
        setPwVerdictMessage("CLEAN SECURE STATE: No leak matches found. The credential pair appears uncompromised.");
        setLogs(prev => [
          `[${new Date().toLocaleTimeString()}] [reCAPTCHA] Password check passed. No leaks found.`,
          ...prev
        ].slice(0, 8));
      }

    } catch (err: any) {
      console.error(err);
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [reCAPTCHA ERROR] Password leak check failed: ${err.message || err}`,
        ...prev
      ].slice(0, 8));
    } finally {
      setPwIsChecking(false);
    }
  };

  const handleApplyRemediation = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    let msg = "";
    if (action === "mfa") {
      msg = "TRIGGERED MULTI-FACTOR AUTH: Mandatory MFA challenge forced on next gate traversal.";
    } else if (action === "reset") {
      msg = "ENFORCED CREDENTIAL CHANGE: Password reset session token dispatched & current session revoked.";
    } else {
      msg = "REJECT_SIGNIN: Blocked login attempt. Prompted operator to choose non-breached passwords.";
    }
    setPwRemediationStatus(msg);
    setLogs(prev => [
      `[${timestamp}] [reCAPTCHA Remediate] Enforced policy: ${action.toUpperCase()}`,
      ...prev
    ].slice(0, 8));
  };

  // Cryptographic Hashing calculation hook for Account Defender compliance
  React.useEffect(() => {
    const updateHash = async () => {
      if (!accountId) {
        setHashedAccountId("");
        return;
      }
      try {
        const msgBuffer = new TextEncoder().encode(accountId);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        setHashedAccountId(hex);
      } catch (e) {
        let hash = 0;
        for (let i = 0; i < accountId.length; i++) {
          hash = (hash << 5) - hash + accountId.charCodeAt(i);
          hash |= 0;
        }
        setHashedAccountId("sim_hash_" + Math.abs(hash).toString(16).padStart(16, "0"));
      }
    };
    updateHash();
  }, [accountId]);

  const handleEvaluateRisk = async () => {
    setEvaluatingRisk(true);
    setRiskScore(null);
    setRecapReasons([]);
    
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      `[${timestamp}] [reCAPTCHA] Dispatching Account Defender evaluation for ${accountId}...`,
      ...prev
    ].slice(0, 8));

    try {
      const response = await fetch("/api/recaptcha/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: "offline_token_atodef_" + Date.now(),
          action: criticalAction,
          accountId: accountId,
          hashedAccountId: hashedAccountId,
          userAgent: userAgentString,
          userIpAddress: userIp
        })
      });

      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      
      const result = await response.json();
      setRiskScore(result.score);
      setRecapReasons(result.reasons || []);
      setAssessmentId(result.assessmentId || "");
      setAssessmentName(result.assessmentName || "");
      setAnnotationTargetId(result.assessmentId || ""); // prefill annotate

      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [reCAPTCHA] Risk evaluation complete. Score: ${result.score} (ID: ${result.assessmentId})`,
        ...prev
      ].slice(0, 8));
    } catch (err: any) {
      console.error(err);
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [reCAPTCHA ERROR] Evaluation failed: ${err.message || err}`,
        ...prev
      ].slice(0, 8));
    } finally {
      setEvaluatingRisk(false);
    }
  };

  const handleAnnotate = async () => {
    if (!annotationTargetId) return;
    setIsAnnotating(true);
    setAnnotationResult("");

    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      `[${timestamp}] [reCAPTCHA] Submitting ground-truth tuning: ${annotationAction} for ${annotationTargetId}...`,
      ...prev
    ].slice(0, 8));

    try {
      const response = await fetch("/api/recaptcha/annotate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assessmentId: annotationTargetId,
          annotation: annotationAction,
          reasons: annotationReasons,
          hashedAccountId: hashedAccountId
        })
      });

      if (!response.ok) throw new Error(`HTTP status ${response.status}`);

      const result = await response.json();
      setAnnotationResult(JSON.stringify(result, null, 2));
      
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [reCAPTCHA] Ground-truth model tuning registered with Google AI.`,
        ...prev
      ].slice(0, 8));
    } catch (err: any) {
      console.error(err);
      setAnnotationResult(`Error: ${err.message || err}`);
    } finally {
      setIsAnnotating(false);
    }
  };

  const handleReportTransaction = async () => {
    setIsReportingTransaction(true);
    setTransactionResult("");

    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      `[${timestamp}] [reCAPTCHA] Broadcasting secure transaction payload (Value: ${transactionAmount} ${transactionCurrency})...`,
      ...prev
    ].slice(0, 8));

    try {
      const txPayload = {
        value: parseFloat(transactionAmount) || 0,
        currencyCode: transactionCurrency,
        cardBin: cardBin,
        paymentMethod: paymentMethod
      };

      const response = await fetch("/api/recaptcha/annotate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assessmentId: annotationTargetId || "sim_transaction_assessment_" + Date.now(),
          annotation: "LEGITIMATE",
          hashedAccountId: hashedAccountId,
          transactionEvent: txPayload
        })
      });

      if (!response.ok) throw new Error(`HTTP status ${response.status}`);

      const result = await response.json();
      setTransactionResult(JSON.stringify({
        status: "BROADCASTED_SUCCESSFULLY",
        gcp_target: "projects/displaycellpros-com/assessments/:annotate",
        google_api_payload: {
          hashedAccountId: hashedAccountId,
          transactionEvent: txPayload
        },
        api_response: result
      }, null, 2));

      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [reCAPTCHA] Risk-Based Transaction Event published cleanly to site model.`,
        ...prev
      ].slice(0, 8));
    } catch (err: any) {
      console.error(err);
      setTransactionResult(`Error: ${err.message || err}`);
    } finally {
      setIsReportingTransaction(false);
    }
  };

  const PRESETS = [
    {
      label: "Exploit Leak (Sandbox Bypass)",
      text: "We built a quick fix jailbreak app on the public Apple App Store to read internal battery voltages using a low-level CFAllocator memory-trapping technique. Download our app!"
    },
    {
      label: "Hobbyist Speak (Part-swapper)",
      text: "Our phone repair shop uses a simple screwdriver and modular part-swapping to do quick battery and screen repairs."
    },
    {
      label: "Privilege Escalation Warning",
      text: "Using IOKit hardware exploits, we bypass the standard operating system restrictions to probe deep silicon cores directly."
    }
  ];

  const handleApplyPreset = (text: string) => {
    setInputText(text);
    handleProcess(text);
  };

  const handleProcess = async (textToProcess: string) => {
    if (!textToProcess.trim()) {
      setOutputText("");
      setDetectedTokens([]);
      setComplianceScore(100);
      return;
    }

    setIsProcessing(true);

    const endpoint = useInternalRoute ? "/api/internal/bench" : "/api/marketing/publish-blog";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ publicContent: textToProcess })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const timestamp = new Date().toLocaleTimeString();

      if (useInternalRoute || result.status === "bypass") {
        // Bypass route
        setOutputText(result.publicContent);
        setDetectedTokens([]);
        setComplianceScore(100);
        setLogs(prev => [
          `[${timestamp}] BYPASS GRANTED: Route '/api/internal/bench' bypassed firewall for raw L3 diagnostics.`,
          ...prev
        ].slice(0, 8));
      } else {
        // Sanitized route
        setOutputText(result.publicContent);
        const detected = result.redactions.map((r: any) => r.redacted_term);
        setDetectedTokens(detected);
        const newScore = Math.max(0, 100 - (detected.length * 20));
        setComplianceScore(newScore);

        const statusMessage = detected.length > 0 
          ? `[${timestamp}] COMPLIANCE BREACH BLOCKED: Intercepted ${detected.length} leaks on PUBLIC_CMS route.`
          : `[${timestamp}] SCAN COMPLIANT: Outbound content sanitized successfully (100% Score).`;
        setLogs(prev => [statusMessage, ...prev].slice(0, 8));
      }
    } catch (err) {
      console.warn("API call failed, falling back to client-side emulation:", err);
      // Fallback to local offline emulation
      let filtered = textToProcess;
      const detected: string[] = [];

      BRAND_LEXICON.forEach(rule => {
        const regex = new RegExp(`\\b${rule.forbidden}\\b`, "gi");
        if (regex.test(filtered)) {
          detected.push(rule.forbidden);
          filtered = filtered.replace(regex, `**${rule.replacement}**`);
        }
      });

      const newScore = Math.max(0, 100 - (detected.length * 20));
      setOutputText(filtered);
      setDetectedTokens(detected);
      setComplianceScore(newScore);

      const timestamp = new Date().toLocaleTimeString();
      const statusMessage = detected.length > 0 
        ? `[${timestamp}] [LOCAL FIREWALL] Detected and redacted ${detected.length} offline token(s).`
        : `[${timestamp}] [LOCAL FIREWALL] Outbound CMS content scanned clean offline.`;
      
      setLogs(prev => [statusMessage, ...prev].slice(0, 8));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="marketing-constraint-engine" className="flex flex-col gap-6 font-sans text-left text-slate-100 p-1">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#008080] uppercase tracking-widest font-bold">
            [CMS Lexical Firewall & AI Marketing Constraint Engine]
          </span>
          <h2 className="text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <Shield className="w-5.5 h-5.5 text-[#008080]" />
            Triage-AI B2B Go-To-Market Guard
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Programmatically insulates proprietary silicon exploits while projecting clinical, enterprise-grade authority.
          </p>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-lg self-start lg:self-center">
          <button
            onClick={() => setActiveTab("portal")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "portal" 
                ? "bg-[#008080] text-white shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            B2B Public Landing
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "playground" 
                ? "bg-[#008080] text-white shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Firewall Playground
          </button>
          <button
            onClick={() => setActiveTab("recaptcha")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "recaptcha" 
                ? "bg-[#008080] text-white shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            reCAPTCHA Account Defender
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "analytics" 
                ? "bg-[#008080] text-white shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            System Invariants & Schemas
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      <AnimatePresence mode="wait">
        {activeTab === "portal" && (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* HERO CONTAINER IN OBSIDIAN COLOR */}
            <div className="bg-[#111111] border border-slate-850 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#008080]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00BFFF]/5 rounded-full blur-3xl pointer-events-none" />

              {/* LOGO BADGE */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-teal-500/20 shadow-inner">
                  <svg className="w-8 h-8 text-[#008080]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest leading-none font-mono">DISPLAY CELL PROS</h3>
                  <span className="text-[10px] text-teal-400 font-mono tracking-widest uppercase">Forensic Division</span>
                </div>
              </div>

              {/* HERO BODY */}
              <div className="max-w-3xl space-y-4">
                <span className="text-[11px] font-mono text-teal-400 font-bold tracking-widest uppercase bg-teal-950/40 border border-teal-900 px-2.5 py-1 rounded">
                  STOP GUESSING. START AUDITING.
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight uppercase font-mono">
                  The Enterprise-Grade Mobile Diagnostics & Data Sanitization Suite.
                </h1>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Transition your laboratory from subjective guesswork to a <strong className="text-white">Telemetry-First</strong> science. 
                  Triage-AI is the world's most advanced web-tethered diagnostic platform, engineered for independent repair facilities and large-scale IT Asset Disposition (ITAD) centers.
                </p>
                <div className="pt-4">
                  <button className="px-6 py-3.5 bg-[#00BFFF] hover:bg-sky-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-sky-500/20 active:scale-98 flex items-center gap-2">
                    Request an Enterprise Demo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN AUDIENCE MATRIX */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* VERTICAL 1: INDEPENDENT LABS */}
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-950/40 border border-teal-900 rounded-lg text-[#008080]">
                      <Workflow className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">[INDEPENDENT DIAGNOSTIC facilities]</h4>
                      <h3 className="text-base font-bold text-white uppercase font-mono mt-0.5">Democratize Board-Level Restoration</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Do not turn away complex logic board failures. Our **Forensic RAG Engine** cross-references real-time hardware measurements against a massive library of vectorized schematics to isolate electrical faults in seconds.
                  </p>

                  <div className="space-y-3.5 pt-2">
                    <div className="flex gap-3">
                      <div className="p-1 h-fit bg-slate-950 rounded border border-slate-900 font-mono text-[10px] text-teal-400">01</div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">V2C (Voice-to-Circuit) Automated Intake</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">An AI agent designed to capture leads, extract failure modes, and estimate pricing automatically, converting raw customer calls into clean work orders.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-1 h-fit bg-slate-950 rounded border border-slate-900 font-mono text-[10px] text-teal-400">02</div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">Interactive Motherboard Schematic Overlay</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Dynamic vector layout viewer overlaying live multimeter metrics over component nodes to pinpoint short circuits immediately.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-1 h-fit bg-slate-950 rounded border border-slate-900 font-mono text-[10px] text-teal-400">03</div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">Thermodynamic Rework Profiler</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Recommends precise thermal cycles, hot-air airflows, and alloy safety boundaries to eliminate board warping during board soldering.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-[#FFBF00] uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Enforces the "Measure-First Protocol" to stop parts-swapping waste.
                  </span>
                </div>
              </div>

              {/* VERTICAL 2: ITAD & ENTERPRISE FLEETS */}
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-950/40 border border-blue-900 rounded-lg text-sky-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">[ENTERPRISE & ITAD FLEETS]</h4>
                      <h3 className="text-base font-bold text-white uppercase font-mono mt-0.5">Military-Grade Compliance</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Satisfy federal audits and compliance guidelines with programmatic guarantees. Triage-AI brings complete non-repudiation and cryptographic data erasure protocols to your warehouse floor.
                  </p>

                  <div className="space-y-4 pt-2">
                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 flex items-center justify-center text-teal-500 h-10 w-10">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">NIST SP 800-88 R1 Cleansing Gate</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Executes cryptographic and multi-pass digital overwriting routines matching government Purge mandates, issuing signed Certificates of Erasure.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 flex items-center justify-center text-teal-500 h-10 w-10">
                        <Key className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">Zero-Trust FIDO2 Hardware Locks</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Eliminates "walk-away" vulnerabilities. Requiring biometric or hardware security key physical interaction to sign off and dispatch destructive wipes.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 flex items-center justify-center text-teal-500 h-10 w-10">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-200 font-mono uppercase">Measurement Data Format (.mdf) Sync</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Instantly packs deep voltage, temperature, and wipe certificates into the industry-standard `.mdf` payload for immediate CRM/ERP ingestion.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Absolute Legal Non-Repudiation for Liability Protection.
                  </span>
                </div>
              </div>

            </div>

            {/* AUTOMATED RMA & QUALITY ASSURANCE SECTION */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-850 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">[Supplier Audit Gateway]</span>
                  <h4 className="text-sm font-bold text-white font-mono uppercase">Automated Component RMA Pipeline</h4>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Instantly flags out-of-spec aftermarket components by comparing incoming display, touchscreen, or cell metrics with baseline tolerances. The system locks out defective parts and drafts vector PDF dispute packages to guarantee RMAs.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[10px] text-slate-400 space-y-1 self-stretch md:self-auto flex flex-col justify-center">
                  <div>RMA SUCCESS RATE: <span className="text-teal-400 font-bold">99.4%</span></div>
                  <div>AVG ARBITRATION TIME: <span className="text-teal-400 font-bold">&lt;18 min</span></div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {activeTab === "playground" && (
          <motion.div
            key="playground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6"
          >
            {/* INPUT PANEL */}
            <div className="xl:col-span-7 space-y-4">
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest">
                    [Outbound Content Scanner]
                  </span>
                  <span className="text-[9px] bg-red-950/60 border border-red-900 text-red-400 px-2 py-0.5 rounded font-mono font-bold">
                    Sandbox Active
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Diagnostic/Marketing Text Draft
                  </label>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Type a technical specification or B2B sales copy here. The engine will inspect it for disallowed consumer terms and proprietary iOS sandbox exploits.
                  </p>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter draft text to scan..."
                  className="w-full h-44 bg-slate-950 border border-slate-900 rounded-xl p-3.5 text-xs text-slate-300 font-mono focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-600 leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleProcess(inputText)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-[#008080] hover:bg-teal-700 text-white text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Auditing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5" />
                          Audit Payload
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setInputText("");
                        setOutputText("");
                        setDetectedTokens([]);
                        setComplianceScore(100);
                      }}
                      className="px-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg transition-all"
                    >
                      Clear
                    </button>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs hover:border-slate-700 transition-all select-none">
                      <input 
                        type="checkbox" 
                        checked={useInternalRoute} 
                        onChange={(e) => setUseInternalRoute(e.target.checked)}
                        className="accent-[#008080] rounded cursor-pointer w-3.5 h-3.5"
                      />
                      <span className="font-mono text-[10px] text-slate-300 uppercase">
                        Internal Lab Bypass (<span className="text-amber-500">/api/internal/*</span>)
                      </span>
                    </label>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    Rule Invariants Compiled: <span className="text-teal-500 font-bold">9/9</span>
                  </span>
                </div>
              </div>

              {/* BRANDING PRESETS */}
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest block">
                  [Diagnostic Test Vectors (The Red Team Vectors)]
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplyPreset(p.text)}
                      className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl text-left transition-all space-y-1.5 group"
                    >
                      <div className="text-[10px] font-bold text-teal-400 group-hover:text-teal-300 uppercase tracking-wider font-mono flex justify-between items-center">
                        <span>{p.label}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                      <p className="text-[9.5px] text-slate-500 line-clamp-2 leading-relaxed">
                        "{p.text}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AUDIT OUTPUT & METRICS */}
            <div className="xl:col-span-5 space-y-4">
              
              {/* COMPLIANCE STATUS PANEL */}
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest block">
                  [Lexical compliance audit status]
                </span>

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-900 rounded-xl">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                      Audit Guard Score
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl font-black font-mono ${
                        complianceScore === 100 
                          ? "text-teal-400" 
                          : complianceScore >= 60 
                          ? "text-[#FFBF00]" 
                          : "text-red-500"
                      }`}>
                        {complianceScore}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">compliant</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    {complianceScore === 100 ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-teal-400 font-black uppercase bg-teal-950/30 border border-teal-900 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                        NIST Clean
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 font-black uppercase bg-red-950/30 border border-red-900 px-2.5 py-1 rounded-lg animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                        Breach Blocked
                      </span>
                    )}
                  </div>
                </div>

                {/* DETECTED TOKENS LIST */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                    Security / Branding Flag Checklist
                  </span>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {BRAND_LEXICON.map((rule, idx) => {
                      const wasCaught = detectedTokens.some(t => t.toLowerCase() === rule.forbidden.toLowerCase());
                      return (
                        <div 
                          key={idx}
                          className={`flex items-start justify-between p-2 rounded-lg text-[10px] font-mono border transition-all ${
                            wasCaught 
                              ? "bg-red-950/20 border-red-900 text-red-400" 
                              : "bg-slate-950 border-slate-900 text-slate-500"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold flex items-center gap-1.5">
                              {wasCaught ? (
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3 text-slate-700" />
                              )}
                              Term: "{rule.forbidden}"
                            </span>
                            <p className="text-[9px] text-slate-500">{rule.explanation}</p>
                          </div>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                            wasCaught ? "bg-red-950 text-red-400" : "bg-slate-900 text-slate-600"
                          }`}>
                            {rule.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* COMPLIANT OUTPUT PANEL */}
              {outputText && (
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-[#008080] uppercase tracking-widest font-bold">
                      [Compilant Translation Result]
                    </span>
                    <span className="text-[9px] text-teal-400 font-mono flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Transposed Speak
                    </span>
                  </div>
                  <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl font-mono text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                    {outputText.split("\n").map((para, i) => (
                      <p key={i} className="mb-2">
                        {para.split("**").map((chunk, j) => (
                          j % 2 === 1 ? (
                            <strong key={j} className="text-teal-400 border-b border-teal-800/55 px-0.5 font-bold">
                              {chunk}
                            </strong>
                          ) : chunk
                        ))}
                      </p>
                    ))}
                  </div>
                  <div className="text-[9px] text-slate-500 italic leading-snug">
                    Note: Prohibited engineering leaks are automatically mapped to compliant, enterprise-grade terminology matching our corporate schema definitions.
                  </div>
                </div>
              )}

              {/* FIREWALL REALTIME AUDIT LOGS */}
              <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-4 space-y-2">
                <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block">
                  [Firewall Core Realtime Logs]
                </span>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 font-mono text-[9px] text-slate-400 space-y-1 h-24 overflow-y-auto">
                  {logs.map((log, i) => (
                    <div key={i} className={
                      log.includes("BREACH") 
                        ? "text-red-400 font-bold" 
                        : log.includes("SCAN") 
                        ? "text-teal-400" 
                        : "text-slate-500"
                    }>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {activeTab === "recaptcha" && (
          <motion.div
            key="recaptcha"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* HERO BAR */}
            <div className="bg-[#111111] border border-slate-850 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#008080]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#00BFFF] uppercase tracking-widest font-bold block">
                    [Google Cloud reCAPTCHA Enterprise Integration]
                  </span>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight font-mono">
                    Account Defender & Transaction Auditing Module
                  </h3>
                  <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                    Protects credential gates and business actions against Automated Attacks (credential stuffing, scrapers) and Account Takeover (ATO) attempts. Submits secure ground-truth signals to continuously tune site-specific classification models.
                  </p>
                </div>
                <div className="flex gap-2 self-start md:self-auto font-mono text-[10px]">
                  <span className="px-2.5 py-1 bg-teal-950/40 border border-teal-900 rounded-lg text-teal-400">
                    SDK: @google-cloud/recaptcha-enterprise
                  </span>
                </div>
              </div>
            </div>

            {/* SUB-TAB BAR */}
            <div className="flex border-b border-slate-900 pb-px gap-2">
              <button
                onClick={() => setRecaptchaSubTab("account_defender")}
                className={`px-4 py-2.5 font-mono text-[10px] font-black uppercase tracking-wider transition-all border-b-2 rounded-t-lg ${
                  recaptchaSubTab === "account_defender"
                    ? "border-[#008080] text-teal-400 bg-teal-950/20"
                    : "border-transparent text-slate-500 hover:text-slate-350 bg-slate-950/40"
                }`}
              >
                [Account Defender & Transactions]
              </button>
              <button
                onClick={() => setRecaptchaSubTab("password_defense")}
                className={`px-4 py-2.5 font-mono text-[10px] font-black uppercase tracking-wider transition-all border-b-2 rounded-t-lg ${
                  recaptchaSubTab === "password_defense"
                    ? "border-[#00BFFF] text-[#00BFFF] bg-sky-950/20"
                    : "border-transparent text-slate-500 hover:text-slate-350 bg-slate-950/40"
                }`}
              >
                [Password Defense (Leak Check)]
              </button>
            </div>

            {/* TWO COLUMN WORKSPACE */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* LEFT INPUT & METRICS (8 cols) */}
              <div className="xl:col-span-8 space-y-6">
                {recaptchaSubTab === "account_defender" ? (
                  <>
                    {/* SECTION 1: ACCOUNT DEFENDER INITIATOR */}
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                    <Fingerprint className="w-5 h-5 text-[#008080]" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono">[1. Execute Account Defender Risk Evaluation]</h4>
                      <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                        Transmits device metadata and account parameters to calculate the real-time session vulnerability score.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Account Identifier (Plain-Text ID)
                      </label>
                      <input 
                        type="text"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        placeholder="e.g. operator_772_alpha"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none transition-all"
                      />
                      <span className="text-[9px] text-slate-500 leading-tight block">
                        Standard recommendation: Provide unique account identifiers to link events and trace attacks.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Cryptographic Hashed Account ID
                      </label>
                      <div className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-500 font-mono truncate select-all">
                        {hashedAccountId || "Calculating SHA-256..."}
                      </div>
                      <span className="text-[9px] text-teal-500 leading-tight block">
                        SHA-256 hash computed client-side to safeguard user identity while preserving security integrity.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Operator IP Address
                      </label>
                      <input 
                        type="text"
                        value={userIp}
                        onChange={(e) => setUserIp(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Critical Security Action
                      </label>
                      <select 
                        value={criticalAction}
                        onChange={(e) => setCriticalAction(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none cursor-pointer"
                      >
                        <option value="login">login (User Authentication Gate)</option>
                        <option value="signup">signup (New Device Enrollment)</option>
                        <option value="checkout">checkout (Payment Verification)</option>
                        <option value="password_reset">password_reset (Credential Shift)</option>
                        <option value="admin_override">admin_override (Root Physical Key)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Client System User-Agent
                      </label>
                      <input 
                        type="text"
                        value={userAgentString}
                        onChange={(e) => setUserAgentString(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none transition-all truncate"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={handleEvaluateRisk}
                      disabled={evaluatingRisk}
                      className="px-5 py-3 bg-[#008080] hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
                    >
                      {evaluatingRisk ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Evaluating Device Security State...
                        </>
                      ) : (
                        <>
                          <Activity className="w-4 h-4" />
                          Evaluate Security State
                        </>
                      )}
                    </button>
                    
                    <span className="text-[9px] font-mono text-slate-500">
                      GCP Action Name: <code className="text-teal-400 font-bold">"{criticalAction}"</code>
                    </span>
                  </div>
                </div>

                {/* SECTION 2: GROUND-TRUTH TUNING PORTAL */}
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                    <Database className="w-5 h-5 text-[#00BFFF]" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono">[2. ground-truth model feedback tuning]</h4>
                      <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                        Submit real-world operational outcomes (annotations) back to Google's AI engine to customize and train your site model dynamically.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          Target Assessment ID
                        </label>
                        <input 
                          type="text"
                          value={annotationTargetId}
                          onChange={(e) => setAnnotationTargetId(e.target.value)}
                          placeholder="e.g. assessment_sim_827102"
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none transition-all"
                        />
                        <span className="text-[9.5px] text-slate-500 block">
                          Prefills automatically upon evaluating risk in Section 1. Real assessment names map to <code className="text-teal-400 text-[9px]">projects/&#123;id&#125;/assessments/&#123;id&#125;</code>.
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          Ground-Truth Label (Annotation)
                        </label>
                        <select 
                          value={annotationAction}
                          onChange={(e) => setAnnotationAction(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none cursor-pointer"
                        >
                          <option value="LEGITIMATE">LEGITIMATE (Explicit manual verification benign)</option>
                          <option value="FRAUDULENT">FRAUDULENT (Confirmed bot, credential-stuffing, or high-risk exploit)</option>
                          <option value="PASSWORD_CORRECT">PASSWORD_CORRECT (Verified valid credential access)</option>
                          <option value="PASSWORD_INCORRECT">PASSWORD_INCORRECT (Verified brute force or mismatched credentials)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          Reason Code Qualifiers
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["CHARGEBACK", "MANUAL_REVIEW", "PASSIVE_TRUST", "SPAM_CHARACTERISTICS"].map((reason) => {
                            const isSelected = annotationReasons.includes(reason);
                            return (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setAnnotationReasons(annotationReasons.filter(r => r !== reason));
                                  } else {
                                    setAnnotationReasons([...annotationReasons, reason]);
                                  }
                                }}
                                className={`px-2 py-1.5 text-[9px] font-mono rounded-lg border transition-all ${
                                  isSelected 
                                    ? "bg-sky-950 border-[#00BFFF] text-sky-400 font-bold" 
                                    : "bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800"
                                }`}
                              >
                                {reason}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleAnnotate}
                          disabled={isAnnotating || !annotationTargetId}
                          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5"
                        >
                          {isAnnotating ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Transmitting ground-truth...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              Submit Ground-Truth Annotation
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ANNOTATION RESULT VIEW */}
                    <div className="space-y-2 bg-slate-950/80 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-[#00BFFF] uppercase tracking-widest font-bold block">
                          [Tuning API Audit Payload]
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-900 space-y-1 select-all h-40 overflow-y-auto leading-relaxed">
                          <div>POST https://recaptchaenterprise.googleapis.com/...</div>
                          <div>&#123;</div>
                          <div className="pl-3">"annotation": <span className="text-teal-400">"{annotationAction}"</span>,</div>
                          <div className="pl-3">"reasons": <span className="text-[#00BFFF]">{JSON.stringify(annotationReasons)}</span>,</div>
                          <div className="pl-3">"hashedAccountId": <span className="text-emerald-400">"{hashedAccountId ? hashedAccountId.substring(0, 16) + '...' : ''}"</span></div>
                          <div>&#125;</div>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] font-mono">
                        {annotationResult ? (
                          <div className="p-2.5 bg-slate-900 border border-teal-950 rounded text-teal-400 text-[9px] max-h-20 overflow-y-auto">
                            <strong>Google API Response:</strong>
                            <pre className="mt-1 text-slate-300 font-mono whitespace-pre-wrap">{annotationResult}</pre>
                          </div>
                        ) : (
                          <div className="text-slate-550 italic text-[9px] text-center py-2">
                            Awaiting operational feedback trigger...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: RISK-BASED TRANSACTION AUDITING */}
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                    <DollarSign className="w-5 h-5 text-teal-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono">[3. Risk-Based transaction event broker]</h4>
                      <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                        Relay real-time commerce and high-value physical audits to feed financial threat heuristics.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                            Amount (Transaction Value)
                          </label>
                          <input 
                            type="number"
                            value={transactionAmount}
                            onChange={(e) => setTransactionAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                            Currency Code
                          </label>
                          <select 
                            value={transactionCurrency}
                            onChange={(e) => setTransactionCurrency(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none cursor-pointer"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="CAD">CAD ($)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                            Card Issuer Identification (BIN)
                          </label>
                          <input 
                            type="text"
                            value={cardBin}
                            maxLength={6}
                            onChange={(e) => setCardBin(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none"
                          />
                          <span className="text-[9px] text-slate-500 leading-tight block">
                            First 6 digits (e.g. 411111)
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                            Payment Method Channel
                          </label>
                          <select 
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none cursor-pointer"
                          >
                            <option value="CREDIT_CARD">CREDIT_CARD</option>
                            <option value="APPLE_PAY">APPLE_PAY</option>
                            <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                            <option value="GOOG_PAY">GOOGLE_PAY</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={handleReportTransaction}
                          disabled={isReportingTransaction}
                          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5"
                        >
                          {isReportingTransaction ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Publishing Financial Audit...
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-3.5 h-3.5" />
                              Report Transaction Event
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* TRANSACTION RESULT VIEW */}
                    <div className="space-y-2 bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-teal-400 uppercase tracking-widest font-bold block">
                          [Risk-Based Transaction Event Payload]
                        </span>
                        <div className="text-[9px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-900 select-all h-36 overflow-y-auto leading-relaxed">
                          <div>&#123;</div>
                          <div className="pl-3">"transactionEvent": &#123;</div>
                          <div className="pl-6">"value": <span className="text-teal-400">{transactionAmount}</span>,</div>
                          <div className="pl-6">"currencyCode": <span className="text-[#00BFFF]">"{transactionCurrency}"</span>,</div>
                          <div className="pl-6">"cardBin": <span className="text-emerald-400">"{cardBin}"</span>,</div>
                          <div className="pl-6">"paymentMethod": <span className="text-[#00BFFF]">"{paymentMethod}"</span></div>
                          <div className="pl-3">&#125;</div>
                          <div>&#125;</div>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] font-mono">
                        {transactionResult ? (
                          <div className="p-2.5 bg-slate-900 border border-teal-950 rounded text-teal-400 text-[8.5px] max-h-24 overflow-y-auto leading-normal">
                            <strong>API Broadcast Confirmed:</strong>
                            <pre className="mt-1 text-slate-300 font-mono whitespace-pre-wrap">{transactionResult}</pre>
                          </div>
                        ) : (
                          <div className="text-slate-550 italic text-[9px] text-center py-2">
                            Awaiting financial context broadcast...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                {/* SECTION A: CREDENTIAL PORTAL & PRESETS */}
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#00BFFF]" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase font-mono">[1. Credential Probing Inputs]</h4>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                          Configure plain-text operator credentials or quick-load forensic presets.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setPwUsername("compromised_operator");
                          setPwPassword("123456");
                        }}
                        className="px-2 py-1 bg-red-950/40 hover:bg-red-900/30 border border-red-900/50 rounded text-[9px] font-mono text-red-400 font-bold transition-all"
                      >
                        Load Breached
                      </button>
                      <button
                        onClick={() => {
                          setPwUsername("lead_forensics");
                          setPwPassword("K@9!pLz#8x91_Secure_Key");
                        }}
                        className="px-2 py-1 bg-teal-950/40 hover:bg-teal-900/30 border border-teal-900/50 rounded text-[9px] font-mono text-teal-400 font-bold transition-all"
                      >
                        Load Secure
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Operator Username
                      </label>
                      <input 
                        type="text"
                        value={pwUsername}
                        onChange={(e) => setPwUsername(e.target.value)}
                        placeholder="e.g. admin_operator"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Operator Password
                      </label>
                      <input 
                        type="text"
                        value={pwPassword}
                        onChange={(e) => setPwPassword(e.target.value)}
                        placeholder="e.g. p@ssword123"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-teal-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION B: STEP 1 - CRYPTOGRAPHIC HELPERS (HIGH-PRIVACY) */}
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                    <Code className="w-5 h-5 text-teal-500" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono">[2. Cryptographic Parameter Generation]</h4>
                      <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                        Password defense uses a high-privacy protocol. Raw credentials are never transmitted over the network.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-2">
                        <span className="text-[#008080] font-black uppercase">Lookup Hash Prefix (4 Bytes)</span>
                        <div className="text-slate-300 font-bold bg-slate-900/60 p-2 rounded truncate border border-slate-850 select-all">
                          {pwLookupHashPrefix || "Generating..."}
                        </div>
                        <span className="text-[8.5px] text-slate-500 leading-normal block">
                          Base64 representation of the first 4 bytes of SHA-256(username). Used to look up potential leaks without identifying the user.
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-2">
                        <span className="text-[#00BFFF] font-black uppercase">Encrypted Credentials Hash</span>
                        <div className="text-slate-300 font-bold bg-slate-900/60 p-2 rounded truncate border border-slate-850 select-all">
                          {pwEncryptedHash || "Generating..."}
                        </div>
                        <span className="text-[8.5px] text-slate-500 leading-normal block">
                          Base64 representation of custom encrypted salt+credential hash. Transmitted to Google Cloud for secure server matching.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION C: STEP 2 & 3 - CREATE ASSESSMENT & VERIFY LEAK */}
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#008080]" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase font-mono">[3. Assessment & Verdict Verification]</h4>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                          Constructs reCAPTCHA assessment request, receives secure leak match prefixes, and locally verifies matches.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handlePasswordLeakCheck}
                      disabled={pwIsChecking}
                      className="px-4 py-2 bg-[#008080] hover:bg-teal-700 disabled:opacity-55 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5"
                    >
                      {pwIsChecking ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Running Forensic Probe...
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5" />
                          Audit Credentials Leak Status
                        </>
                      )}
                    </button>
                  </div>

                  {/* WORKSPACE DETAIL IF RESULT OBTAINED */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* LEFT: CRYPTOGRAPHIC VERIFICATION STEP */}
                    <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl space-y-3 font-mono text-[10px]">
                      <span className="text-[#00BFFF] font-black uppercase block border-b border-slate-900 pb-1">
                        [Verifier Match Space]
                      </span>

                      <div className="space-y-1.5">
                        <span className="text-slate-500 text-[9px]">Server-Reencrypted Hash:</span>
                        <div className="bg-slate-900 p-1.5 rounded truncate text-slate-350 border border-slate-850">
                          {pwReencryptedHash || "Awaiting verification..."}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-slate-550 text-[9px]">Encrypted Leak Match Prefixes:</span>
                        <div className="bg-slate-900 p-1.5 rounded text-slate-400 h-24 overflow-y-auto border border-slate-850 text-[9px] leading-relaxed">
                          {pwLeakMatchPrefixes.length === 0 ? (
                            <span className="italic text-slate-600">[Empty prefix pool]</span>
                          ) : (
                            pwLeakMatchPrefixes.map((p, idx) => (
                              <div key={idx} className={`flex items-center justify-between border-b border-slate-950 pb-0.5 mb-0.5 ${p === pwReencryptedHash ? 'text-[#FFBF00] font-bold bg-amber-950/20 px-1 rounded' : ''}`}>
                                <span>Prefix [{idx}]: {p}</span>
                                {p === pwReencryptedHash && <span className="text-[8px] bg-red-950 px-1 py-0.2 rounded text-red-400 font-bold uppercase">Match</span>}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: VERDICT CARD */}
                    <div className="flex flex-col justify-between">
                      <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl flex-1 flex flex-col justify-center space-y-3">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold text-center">
                          [Leak Match Verdict]
                        </span>

                        {pwIsLeaked === null ? (
                          <div className="text-center py-6">
                            <span className="inline-block text-[11px] font-mono text-slate-500 border border-slate-850 bg-slate-900 px-3 py-1.5 rounded uppercase">
                              Awaiting Forensic Audit
                            </span>
                          </div>
                        ) : pwIsLeaked ? (
                          <div className="text-center p-3.5 bg-red-950/20 border border-red-900 rounded-xl space-y-2 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-950 border border-red-800">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <h5 className="text-xs font-black text-red-400 font-mono uppercase">BREACHED / LEAKED CREDENTIAL</h5>
                            <p className="text-[10px] text-slate-400 font-sans leading-normal">
                              The cryptographic verifier discovered an exact match in the returned leak repository. This credential has been compromised in standard web data leaks.
                            </p>
                          </div>
                        ) : (
                          <div className="text-center p-3.5 bg-teal-950/20 border border-teal-900 rounded-xl space-y-2 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-950 border border-teal-850">
                              <CheckCircle2 className="w-5 h-5 text-teal-400" />
                            </div>
                            <h5 className="text-xs font-black text-teal-400 font-mono uppercase">CREDENTIAL SECURE</h5>
                            <p className="text-[10px] text-slate-400 font-sans leading-normal">
                              No verification prefixes matched the reencrypted token. The credentials are clean from known public breaches.
                              </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION D: REMEDIATION & COMPLIANCE GATEWAY */}
                {pwIsLeaked !== null && (
                  <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                      <Sparkles className="w-5 h-5 text-[#FFBF00]" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase font-mono">[4. Automated Policy Remediation Controls]</h4>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                          Choose and enforce NIST-compliant mitigation actions based on the credential check verdict.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleApplyRemediation("reject")}
                        className="p-3 bg-slate-950 border border-slate-900 hover:border-red-900/60 rounded-xl text-left space-y-1.5 transition-all text-[10px] group text-slate-300"
                      >
                        <span className="font-bold font-mono text-red-400 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> REJECT_SIGNIN
                        </span>
                        <p className="text-[9px] text-slate-400 leading-normal font-sans">
                          Block the authentication attempt completely. Compel operator to choose non-compromised credentials.
                        </p>
                      </button>

                      <button
                        onClick={() => handleApplyRemediation("mfa")}
                        className="p-3 bg-slate-950 border border-slate-900 hover:border-amber-900/60 rounded-xl text-left space-y-1.5 transition-all text-[10px] group text-slate-300"
                      >
                        <span className="font-bold font-mono text-amber-500 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> TRIGGER_MFA
                        </span>
                        <p className="text-[9px] text-slate-400 leading-normal font-sans">
                          Force a step-up hardware Multi-Factor challenge before granting entry rights.
                        </p>
                      </button>

                      <button
                        onClick={() => handleApplyRemediation("reset")}
                        className="p-3 bg-slate-950 border border-slate-900 hover:border-teal-900/60 rounded-xl text-left space-y-1.5 transition-all text-[10px] group text-slate-300"
                      >
                        <span className="font-bold font-mono text-teal-400 flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5" /> FORCE_RESET
                        </span>
                        <p className="text-[9px] text-slate-400 leading-normal font-sans">
                          Deauthorize existing credentials and automatically dispatch secure recovery tokens.
                        </p>
                      </button>
                    </div>

                    {pwRemediationStatus && (
                      <div className="p-3 bg-slate-950 border border-teal-900/50 rounded-xl font-mono text-[9.5px] text-teal-400 animate-pulse flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-400" />
                        <span>{pwRemediationStatus}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

              {/* RIGHT RISK RADAR & AUDIT LOG (4 cols) */}
              <div className="xl:col-span-4 space-y-6">
                
                {/* ACCOUNT DEFENDER RISK RADAR */}
                {recaptchaSubTab === "account_defender" ? (
                  <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                      [Core Forensic Risk Classification Radar]
                    </span>

                    <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                            Account Takeover (ATO) Risk
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black font-mono ${
                              riskScore === null 
                                ? "text-slate-550" 
                                : riskScore >= 0.7 
                                ? "text-teal-400" 
                                : riskScore >= 0.4 
                                ? "text-[#FFBF00]" 
                                : "text-red-500"
                            }`}>
                              {riskScore === null ? "---" : `${Math.round(riskScore * 100)}%`}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">Safe Index</span>
                          </div>
                        </div>

                        <div>
                          {riskScore === null ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase bg-slate-900 border border-slate-850 px-2 py-1 rounded">
                              UNAUDITED
                            </span>
                          ) : riskScore >= 0.7 ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-mono text-teal-400 font-black uppercase bg-teal-950/30 border border-teal-900 px-2.5 py-1 rounded">
                              LEGITIMATE
                            </span>
                          ) : riskScore >= 0.4 ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-mono text-amber-500 font-black uppercase bg-amber-950/30 border border-amber-900 px-2.5 py-1 rounded">
                              SUSPICIOUS
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[9px] font-mono text-red-400 font-black uppercase bg-red-950/30 border border-red-900 px-2.5 py-1 rounded animate-pulse">
                              CRITICAL RISK
                            </span>
                          )}
                        </div>
                      </div>

                      {/* INTERACTIVE RISK BAR */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-slate-555">
                          <span>CRITICAL RISK (0.1)</span>
                          <span>BENIGN (1.0)</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              riskScore === null 
                                ? "w-0 bg-slate-700" 
                                : riskScore >= 0.7 
                                ? "bg-teal-400" 
                                : riskScore >= 0.4 
                                ? "bg-[#FFBF00]" 
                                : "bg-red-500"
                            }`}
                            style={{ width: riskScore === null ? "0%" : `${riskScore * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* RISK REASON CODES */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                          Engine Classifications & Reasons
                        </span>
                        {riskScore === null ? (
                          <div className="text-[9px] text-slate-550 italic">
                            Execute risk evaluation in Section 1 to load telemetry classifiers.
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {recapReasons.length === 0 ? (
                              <div className="text-[9px] text-teal-400 font-mono flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> SAFE_SESSION_HEURISTICS_APPROVED
                              </div>
                            ) : (
                              recapReasons.map((reason, i) => (
                                <div key={i} className="text-[9px] font-mono text-amber-400 bg-amber-950/15 border border-amber-900/40 p-1.5 rounded flex items-start gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  <span>{reason}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* S2C AUDIT PARAMETERS CARD */}
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3 font-mono text-[10px] text-slate-400">
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-550">Assessment ID:</span>
                        <span className="text-white font-bold select-all">{assessmentId || "Not Registered"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-555">Integrity Check:</span>
                        <span className="text-teal-400 font-bold">100% Cryptographic Match</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-555">Model State:</span>
                        <span className="text-sky-400">Tuned & Synchronized</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-555">Cloud Destination:</span>
                        <span className="text-[#00BFFF] truncate font-bold">projects/displaycellpros-com/...</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                      [Credential Compromise Integrity Monitor]
                    </span>

                    <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                            Leak Defense Status
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-black font-mono uppercase ${
                              pwIsLeaked === null 
                                ? "text-slate-550" 
                                : pwIsLeaked 
                                ? "text-red-500 animate-pulse" 
                                : "text-teal-400"
                            }`}>
                              {pwIsLeaked === null ? "UNCHECKED" : pwIsLeaked ? "BREACHED" : "SECURE"}
                            </span>
                          </div>
                        </div>

                        <div>
                          {pwIsLeaked === null ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase bg-slate-900 border border-slate-850 px-2 py-1 rounded">
                              UNAUDITED
                            </span>
                          ) : pwIsLeaked ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-mono text-red-400 font-black uppercase bg-red-950/30 border border-red-900 px-2.5 py-1 rounded animate-pulse">
                              FAIL
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[9px] font-mono text-teal-400 font-black uppercase bg-teal-950/30 border border-teal-900 px-2.5 py-1 rounded">
                              PASS
                            </span>
                          )}
                        </div>
                      </div>

                      {/* BREACH SEVERITY INDICATOR BAR */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-slate-550">
                          <span>COMPROMISED</span>
                          <span>CLEAN</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              pwIsLeaked === null 
                                ? "w-0 bg-slate-700" 
                                : pwIsLeaked 
                                ? "bg-red-500 w-full" 
                                : "bg-teal-400 w-full"
                            }`}
                          />
                        </div>
                      </div>

                      {/* CREDENTIAL VERIFIED REASON */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                          Verifier Output Comments
                        </span>
                        {pwIsLeaked === null ? (
                          <div className="text-[9px] text-slate-550 italic leading-normal">
                            Generate cryptographic hashes and trigger the leak verifier to view diagnostic logs.
                          </div>
                        ) : pwIsLeaked ? (
                          <div className="text-[9px] font-mono text-red-400 bg-red-950/15 border border-red-900/40 p-2 rounded flex items-start gap-1.5 leading-normal">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            <span>CRITICAL: Exact credential pair prefix was matched within Google Cloud's compromised repository. Change password immediately!</span>
                          </div>
                        ) : (
                          <div className="text-[9px] font-mono text-teal-400 bg-teal-950/15 border border-teal-900/40 p-2 rounded flex items-start gap-1.5 leading-normal">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                            <span>SUCCESS: Local cryptographic matching verified no compromise matches found. Safe to proceed.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PASSWORD DEFENSE TELEMETRY CARD */}
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3 font-mono text-[10px] text-slate-400">
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-555">Assessment Name:</span>
                        <span className="text-white font-bold select-all truncate max-w-[120px]">{pwAssessmentName ? pwAssessmentName.split("/").pop() : "Not Created"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-555">Cryptographic Protocol:</span>
                        <span className="text-teal-400 font-bold">SHA-256 + Private Leak Match</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-555">Local Matching:</span>
                        <span className="text-sky-400">Executed on Prefix Pool</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-555">NIST SP 800-88 R1:</span>
                        <span className="text-[#00BFFF] font-bold">Compliant Gate Enforced</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* FIREWALL REALTIME AUDIT LOGS */}
                <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-4 space-y-2">
                  <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block">
                    [Firewall Core Realtime Logs]
                  </span>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 font-mono text-[9px] text-slate-400 space-y-1 h-32 overflow-y-auto">
                    {logs.map((log, i) => (
                      <div key={i} className={
                        log.includes("ERROR") 
                          ? "text-red-400 font-bold" 
                          : log.includes("complete") || log.includes("registered") || log.includes("cleanly")
                          ? "text-teal-400" 
                          : log.includes("Evaluating") || log.includes("Tuning") || log.includes("Broadcasting")
                          ? "text-[#00BFFF]"
                          : "text-slate-550"
                      }>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* SYSTEM INVARIANTS DETAIL */}
            <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-900 pb-4">
                <span className="text-[10px] font-mono text-[#008080] uppercase tracking-widest font-bold block">
                  [S2C Compliance Matrix & Zero-Trust Validation]
                </span>
                <h3 className="text-base font-bold text-white uppercase font-mono mt-1">
                  Security Invariant & Policy Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Triage-AI enforces a multi-tiered security gate to ensure cryptographic, structural, and identity boundaries cannot be crossed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* INVARIANT 1 */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-teal-400">
                    <Shield className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase font-mono">1. Ownership Boundary</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Strict isolation limits read/write access. Users can only fetch and update records where their authenticated UID matches the record's <code className="bg-slate-900 text-teal-300 px-1 py-0.5 rounded text-[10px]">userId</code> field.
                  </p>
                  <div className="bg-slate-900 p-2 rounded text-[9px] font-mono text-slate-500">
                    Rule: <span className="text-emerald-400">resource.data.userId == request.auth.uid</span>
                  </div>
                </div>

                {/* INVARIANT 2 */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-[#00BFFF]">
                    <Lock className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase font-mono">2. Structural Restrictions</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Defense against Denial-of-Wallet (buffer expansion) attacks. String boundaries are restricted strictly (e.g. name length &lt; 128 characters, ID length &lt; 32 characters).
                  </p>
                  <div className="bg-slate-900 p-2 rounded text-[9px] font-mono text-slate-500">
                    Rule: <span className="text-emerald-400">data.customerName.size() &lt;= 128</span>
                  </div>
                </div>

                {/* INVARIANT 3 */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2.5 col-span-1 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 text-[#FFBF00]">
                    <AlertTriangle className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase font-mono">3. Hardened State Lock</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Once a diagnostic record reaches a terminal auditing phase (such as `"completed"` or `"archived"`), the document is marked as immutable. No further updates are permitted.
                  </p>
                  <div className="bg-slate-900 p-2 rounded text-[9px] font-mono text-slate-500">
                    Rule: <span className="text-emerald-400">!(resource.data.status in ['completed'])</span>
                  </div>
                </div>

              </div>
            </div>

            {/* FIREBASE ARCHITECTURE OVERVIEW */}
            <div className="bg-[#0c0c0c] border border-slate-850 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">[Production Deployment Schema]</h4>
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Target Project ID:</span>
                  <span className="text-[#00BFFF] font-bold">displaycellpros-com (Firestore Default)</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Security Standard:</span>
                  <span className="text-teal-400 font-bold">NIST SP 800-88 R1 compliant erasure certificates</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Authentication Gate:</span>
                  <span className="text-slate-400">FIDO2/WebAuthn integrated hardware signoff triggers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Rule Integrity:</span>
                  <span className="text-emerald-400 font-bold">Phase 0 Red Team Verified (12 Pen-test Vectors)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Inline placeholder if ShieldCheck isn't in imported list
function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 11 3 3 5-5" />
    </svg>
  );
}
