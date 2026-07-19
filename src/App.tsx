import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Cpu, 
  Battery, 
  Smartphone, 
  MessageSquare,
  ShoppingCart,
  Briefcase,
  Wrench,
  Send,
  X,
  CheckCircle2,
  ChevronRight,
  Menu,
  Terminal,
  Activity,
  TrendingUp,
  DollarSign,
  Plus,
  RefreshCw,
  User,
  AlertCircle,
  Layers,
  Server,
  Wifi,
  Info,
  FileText,
  Check,
  ArrowRight,
  Database,
  Upload,
  Zap,
  Trash2,
  Globe,
  Settings,
  ChevronDown,
  ChevronUp,
  QrCode,
  Copy,
  Usb,
  Mail,
  Eye,
  EyeOff
} from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { RepairTicket, POSLog, QuoteResponse } from "./types";
import { Toast, ToastContainer, ToastType } from "./components/ToastNotification";
import { HardwareScanChart } from "./components/HardwareScanChart";
import { UsbSimulator } from "./components/UsbSimulator";
import { RdsDiagnosticPanel } from "./components/RdsDiagnosticPanel";
import { jsPDF } from "jspdf";
import { OAuthDocumentationPanel } from "./components/OAuthDocumentationPanel";
import { PrivacyPolicyView } from "./components/PrivacyPolicyView";
import TicketTemplatesPanel from "./components/TicketTemplatesPanel";
import CacheManagement from "./components/CacheManagement";
import QrScannerModal from "./components/QrScannerModal";
import { TicketTemplate } from "./types";
import { useAuth } from "./contexts/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db as firebaseDb } from "./lib/firebase";

// --- DATA MODELS ---

const SERVICES = [
  {
    tier: "Tier 1",
    title: "Core Power & Port Restoration",
    price: "$69 - $97",
    desc: "Fixed-price minor repairs focusing on power delivery.",
    examples: "Batteries, Charging Ports",
    icon: <Battery className="w-8 h-8 text-blue-400" />
  },
  {
    tier: "Tier 2",
    title: "Elite Display Renewal",
    price: "From $139",
    desc: "Fixed-price major repairs for cracked or failing screens.",
    examples: "iPhone 12-15, Galaxy S Series Screens",
    icon: <Smartphone className="w-8 h-8 text-blue-400" />
  },
  {
    tier: "Tier 3",
    title: "Specialized Diagnostics",
    price: "Custom Quote",
    desc: "Motherboard surgery, data recovery, and micro-soldering.",
    examples: "Liquid Damage, Board-Level Shorts, Cameras",
    icon: <Cpu className="w-8 h-8 text-blue-400" />
  }
];

const STORE_PRODUCTS = [
  { id: 1, name: "Casper Tempered Glass", price: 29.99, category: "Protection", img: "https://images.unsplash.com/photo-1606841120025-a130635c0292?auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "AmpSentrix Fast Charger (20W)", price: 34.99, category: "Power", img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "CPO iPhone 13 Pro (128GB)", price: 549.00, category: "Devices", img: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "Heavy Duty Fleet Case", price: 49.99, category: "Protection", img: "https://images.unsplash.com/photo-1541892079639-65107954fa0f?auto=format&fit=crop&w=300&q=80" }
];

// --- MAIN MASTER APP COMPONENT ---

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const path = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
    if (path.includes("privacy")) return "privacy";
    if (path.includes("services")) return "services";
    if (path.includes("b2b") || path.includes("fleet")) return "b2b";
    if (path.includes("store")) return "store";
    if (path.includes("lab")) return "lab";
    return "home";
  });
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // --- DIAGNOSTIC HUB STATES ---
  const [labTab, setLabTab] = useState<"triage" | "pos" | "tax" | "postgres" | "verification" | "firebase" | "settings">("triage");

  const [sdStatus, setSdStatus] = useState({ active: false, message: "Serverless Mode Active" });
  
  // Active Customer & Device Details
  const [customerName, setCustomerName] = useState<string>("Jane Miller");
  const [deviceBrand, setDeviceBrand] = useState<string>("Apple");
  const [deviceModel, setDeviceModel] = useState<string>("iPhone 14 Pro Max");
  const [deviceTier, setDeviceTier] = useState<"flagship" | "midrange" | "budget">("flagship");
  const [issueType, setIssueType] = useState<"screen" | "battery" | "button">("screen");
  const [deviceSerial, setDeviceSerial] = useState<string>("DSC-G6TJX0L3V9X");
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  
  // Device Hardware Scan state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  const [isReportExpanded, setIsReportExpanded] = useState<boolean>(true);
  const [copiedTelemetry, setCopiedTelemetry] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [forceScanTimeout, setForceScanTimeout] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleApplyTemplate = (template: TicketTemplate) => {
    setDeviceBrand(template.brand);
    if (template.brand === "Apple") {
      setDeviceModel("iPhone 14 Pro Max");
      setDeviceTier("flagship");
    } else if (template.brand === "Samsung") {
      setDeviceModel("Galaxy S23 Ultra");
      setDeviceTier("flagship");
    } else {
      setDeviceModel("Google Pixel 8 Pro");
      setDeviceTier("flagship");
    }
    
    if (template.issueType === "screen" || template.issueType === "battery" || template.issueType === "button") {
      setIssueType(template.issueType as "screen" | "battery" | "button");
    } else {
      setIssueType("screen");
    }
    
    if (customerName === "Jane Miller") {
      setCustomerName("Diagnostic Van Client");
    }
    
    addToast("Template Loaded", `Applied parameters for "${template.name}".`, "success");
  };

  // B2B Customer Verification
  const [emailInput, setEmailInput] = useState<string>("marcus@amazon.com");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState<boolean>(false);
  const [isCorporate, setIsCorporate] = useState<boolean>(true);
  const [companyName, setCompanyName] = useState<string>("AMAZON Fleet");
  const [b2bMessage, setB2bMessage] = useState<string>("VERIFICATION SUCCESS: Corporate customer identified! 20% Fast-Track fleet repair discount & zero-deposit check-in is unlocked.");

  // Washington State Destination Sales Tax Config
  const [zipInput, setZipInput] = useState<string>("98101");
  const [taxRate, setTaxRate] = useState<number>(0.1035);
  const [taxCity, setTaxCity] = useState<string>("Seattle");
  const [taxVerifiedMessage, setTaxVerifiedMessage] = useState<string>("WASHINGTON TAX COMPLIANT: Destined delivery in Seattle (98101) is subject to 10.35% local combined sales tax.");
  const [isValidZip, setIsValidZip] = useState<boolean>(true);

  // Live Quote Response
  const [quote, setQuote] = useState<QuoteResponse>({
    baseQuote: { partsCost: 180, laborCost: 170, overhead: 52.5, subtotal: 402.5 },
    taxInfo: { zipCode: "98101", city: "Seattle", rate: 0.1035, calculatedTax: 33.32 },
    discountInfo: { applied: true, percentage: 20, amount: 80.5, company: "AMAZON Fleet" },
    subtotal: 322,
    grandTotal: 355.32
  });
  const [isCalculatingQuote, setIsCalculatingQuote] = useState<boolean>(false);

  // --- VERCEL AUTH & AWS RDS CLOUD STATES ---
  const { user: authUser, loading: isAuthChecking, logout: handleSignOut, login: handleSignIn, sendMagicLink } = useAuth();
  const [firestoreTickets, setFirestoreTickets] = useState<RepairTicket[]>([]);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // --- LOGIN STATES ---
  const [formEmail, setFormEmail] = useState<string>("");
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [linkSent, setLinkSent] = useState<boolean>(false);

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail) return;
    if (!captchaToken) {
      alert("Please complete the bot protection check.");
      return;
    }

    setIsAuthLoading(true);
    try {
      await sendMagicLink(formEmail);
      setLinkSent(true);
      addToast("Magic Link Sent", `Check your inbox at ${formEmail} to sign in securely.`, "success");
    } catch (err: any) {
      addToast("Error", err.message || "Failed to send link", "error");
    } finally {
      setIsAuthLoading(false);
    }
  };

  // --- MULTI-MODAL & ADVANCED DIAGNOSTIC SUB-MODE STATES ---
  const [diagnosticMode, setDiagnosticMode] = useState<"standard" | "thinking" | "vision">("standard");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const [thinkingPrompt, setThinkingPrompt] = useState<string>("Analyze the volume flex ribbon cable. Is impedance of 45 Ohm acceptable for core motherboard signal lines during boot? Detail typical multimeter diagnostic steps.");
  const [deepDiagnosticResult, setDeepDiagnosticResult] = useState<string>("");
  const [isDeepDiagnosing, setIsDeepDiagnosing] = useState<boolean>(false);
  const [groundingSources, setGroundingSources] = useState<Array<{ title: string; url: string }>>([]);

  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Fetch tickets from AWS RDS via Serverless API
  const fetchFirestoreTickets = async () => {
    try {
      setFirestoreError(null);
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setFirestoreTickets(data.tickets || []);
      } else {
        const err = await res.json();
        setFirestoreError(err.error || "Failed to load backups");
      }
    } catch (err: any) {
      console.error("Failed to load tickets:", err);
      setFirestoreError(err.message);
    }
  };

  const handleCreateFirestoreTicket = async () => {
    if (!authUser) {
      alert("Please login to enable secure cloud backups.");
      return;
    }
    if (!captchaToken) {
      alert("Please complete the bot protection check.");
      return;
    }
    const ticketId = "DCP-" + Math.floor(100000 + Math.random() * 900000);
    const newTicket = {
      id: ticketId,
      customerName: customerName || "Jane Miller",
      companyName: isCorporate ? companyName : "",
      device: `${deviceBrand} ${deviceModel}`,
      issueType: issueType,
      status: "open",
      quotedPrice: quote.baseQuote.subtotal,
      tax: quote.taxInfo.calculatedTax,
      discount: quote.discountInfo.amount,
      total: quote.grandTotal,
      captchaToken
    };

    try {
      setFirestoreError(null);
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        setTicketCreationSuccess(true);
        setTimeout(() => setTicketCreationSuccess(false), 3000);
        setCaptchaToken(null);
        recaptchaRef.current?.reset();
        fetchFirestoreTickets();
      } else {
        const err = await res.json();
        setFirestoreError(err.error || "Failed to sync ticket");
      }
    } catch (err: any) {
      console.error("Failed to sync ticket:", err);
      setFirestoreError(err.message);
    }
  };

  const handleDeleteFirestoreTicket = async (ticketId: string) => {
    if (!authUser) return;
    if (!confirm(`Are you sure you want to delete backup ticket ${ticketId}?`)) return;

    try {
      setFirestoreError(null);
      const res = await fetch(`/api/tickets?id=${ticketId}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Backup Deleted", `Ticket ${ticketId} removed.`, "success");
        fetchFirestoreTickets();
      }
    } catch (err: any) {
      setFirestoreError(err.message);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchFirestoreTickets();
    } else {
      setFirestoreTickets([]);
    }
  }, [authUser]);

  // Hardware Diagnostic Chat Console State
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { 
      role: "assistant", 
      text: "Display & Cell Pros Diagnostic Hub activated. Secure Vercel Serverless environment online. How can we help with your hardware today?"
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("Screen touch lag and horizontal pink lines");
  const [isChatSending, setIsChatSending] = useState<boolean>(false);

  // POS Tickets and Live Synchronization Logs
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [posLogs, setPosLogs] = useState<POSLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [ticketCreationSuccess, setTicketCreationSuccess] = useState<boolean>(false);

  // Washington Preset ZIP Clicker
  const WA_ZIP_PRESETS = [
    { zip: "98101", city: "Seattle", rate: "10.35%" },
    { zip: "98004", city: "Bellevue", rate: "10.1%" },
    { zip: "98402", city: "Tacoma", rate: "10.3%" },
    { zip: "98052", city: "Redmond", rate: "10.1%" },
    { zip: "98201", city: "Everett", rate: "9.9%" },
    { zip: "98501", city: "Olympia", rate: "9.5%" }
  ];

  useEffect(() => {
    fetchPOSLogs();
  }, []);

  useEffect(() => {
    fetchDynamicQuote();
  }, [issueType, deviceTier, zipInput, isCorporate, companyName]);

  const fetchPOSLogs = async (retries = 2, delay = 1000) => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch("/api/pos-sync-logs");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        setPosLogs(data.logs || []);
      }
    } catch (err) {
      console.warn("POS sync currently using local simulation.");
    }
    setIsLoadingLogs(false);
  };

  const handleVerifyB2B = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerifyingEmail(true);
    try {
      const res = await fetch("/api/verify-b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput })
      });
      if (res.ok) {
        const data = await res.json();
        setIsCorporate(data.isCorporate);
        setCompanyName(data.isCorporate ? data.companyName : "");
        setB2bMessage(data.message);
      }
    } catch (err) {
      console.warn("B2B lookup failed.");
    }
    setIsVerifyingEmail(false);
  };

  const handleTaxLookup = async (zip: string) => {
    const targetZip = zip.trim();
    if (!targetZip) return;
    try {
      const res = await fetch("/api/tax-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode: targetZip })
      });
      if (res.ok) {
        const data = await res.json();
        setTaxRate(data.rate);
        setTaxCity(data.city);
        setTaxVerifiedMessage(data.message);
        setIsValidZip(data.valid);
      }
    } catch (err) {
      console.warn("Tax lookup failed.");
    }
  };

  useEffect(() => {
    if (zipInput.length === 5) {
      handleTaxLookup(zipInput);
    }
  }, [zipInput]);

  const fetchDynamicQuote = async () => {
    setIsCalculatingQuote(true);
    try {
      const res = await fetch("/api/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueType,
          deviceTier,
          zipCode: zipInput,
          isCorporate,
          companyName: isCorporate ? companyName : undefined,
        })
      });
      if (res.ok) {
        const data = await res.json();
        setQuote(data);
      }
    } catch (err) {
      console.warn("Quote calculation failed.");
    }
    setIsCalculatingQuote(false);
  };

  const handleSendTriageChat = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;

    const userMessage = { role: "user" as const, text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatSending(true);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          deviceDetails: { brand: deviceBrand, model: deviceModel, tier: deviceTier }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", text: data.text }]);
        if (data.detectedSpecs) {
          const specs = data.detectedSpecs;
          if (specs.brand) setDeviceBrand(specs.brand);
          if (specs.model) setDeviceModel(specs.model);
          if (specs.tier) setDeviceTier(specs.tier);
          if (specs.issue) setIssueType(specs.issue);
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "Diagnostic proxy offline." }]);
    }
    setIsChatSending(false);
  };

  const handleRunThinkingDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeepDiagnosing(true);
    try {
      const res = await fetch("/api/complex-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: thinkingPrompt, deviceDetails: { brand: deviceBrand, model: deviceModel } })
      });
      const data = await res.json();
      setDeepDiagnosticResult(data.text);
    } catch (err) {
      setDeepDiagnosticResult("Thinking diagnostic failed.");
    }
    setIsDeepDiagnosing(false);
  };

  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImageBase64(reader.result.split(",")[1]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVisionDiagnostic = async () => {
    setIsDeepDiagnosing(true);
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Data: selectedImageBase64, mimeType: "image/png" })
      });
      const data = await res.json();
      setDeepDiagnosticResult(data.text);
    } catch (err) {
      setDeepDiagnosticResult("Vision diagnostic failed.");
    }
    setIsDeepDiagnosing(false);
  };

  const createOfficialTicket = async () => {
    try {
      const res = await fetch("/api/create-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          device: `${deviceBrand} ${deviceModel}`,
          issueType,
          quotedPrice: quote.baseQuote.subtotal,
          total: quote.grandTotal
        })
      });
      if (res.ok) {
        setTicketCreationSuccess(true);
        setTimeout(() => setTicketCreationSuccess(false), 3000);
        fetchPOSLogs();
      }
    } catch (err) {
      console.error("POS sync failed.");
    }
  };

  const startPhysicalUsbScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStep("Probing USB...");
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setHasScanned(true);
          return 100;
        }
        return p + 20;
      });
    }, 500);
  };

  const handleBookAppointment = () => {
    const summary = quote.bookingSummary || `Repair Quote for ${deviceBrand} ${deviceModel}: $${quote.grandTotal.toFixed(2)}`;
    navigator.clipboard.writeText(summary).then(() => {
      addToast("Quote Copied", "Paste this in your booking notes.", "success");
      setTimeout(() => {
        window.open("https://calendar.app.google/f3Mc2kDhehzCBeBW9", "_blank");
      }, 1000);
    });
  };

  const clearChatLogs = () => setMessages([{ role: "assistant", text: "Logs cleared." }]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between">
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center cursor-pointer" onClick={() => setActiveTab("home")}>
              <Wrench className="h-8 w-8 text-blue-500 mr-3 animate-pulse" />
              <div>
                <span className="font-bold text-xl tracking-tight text-white block leading-none">DISPLAY & CELL PROS</span>
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-widest">Serverless Diagnostic Lab</span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <NavButton active={activeTab === "home"} onClick={() => setActiveTab("home")}>Home</NavButton>
                <NavButton active={activeTab === "services"} onClick={() => setActiveTab("services")}>Services</NavButton>
                <NavButton active={activeTab === "b2b"} onClick={() => setActiveTab("b2b")}>B2B Fleet</NavButton>
                <NavButton active={activeTab === "privacy"} onClick={() => setActiveTab("privacy")}>Privacy</NavButton>
                
                {authUser?.email === "cheyoung1983@gmail.com" && (
                  <button onClick={() => setIsAdminPortalOpen(true)} className="px-3 py-2 text-amber-400 bg-amber-950/20 border border-amber-500/30 rounded uppercase flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4" /> Admin
                  </button>
                )}

                <button onClick={() => setActiveTab("lab")} className={`px-3 py-2 rounded-md text-sm font-bold uppercase transition-all flex items-center gap-1.5 ${activeTab === "lab" ? "text-blue-400 bg-slate-800 border border-blue-500/30" : "text-slate-300 hover:text-white"}`}>
                  <Cpu className="w-4 h-4" /> Lab Portal
                </button>

                <button onClick={() => setIsAiOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2">
                  <MessageSquare size={18} /> Book / Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pb-16">
        {activeTab === "home" && <HomeView onBookClick={() => setIsAiOpen(true)} onLabClick={() => setActiveTab("lab")} />}
        {activeTab === "services" && <ServicesView onBookClick={() => setIsAiOpen(true)} />}
        {activeTab === "b2b" && <B2BView onBookClick={() => setIsAiOpen(true)} />}
        {activeTab === "privacy" && <PrivacyPolicyView />}
        
        {activeTab === "lab" && (
          <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-3">
                <User className="w-10 h-10 p-2 bg-blue-600/10 rounded-full text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {authUser ? `Authed: ${authUser.name || authUser.email}` : "Vercel-Native Sync Registry"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {authUser ? `Backing up to AWS RDS.` : "Login to enable cloud backups."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {authUser ? (
                  <button onClick={handleSignOut} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded">Logout</button>
                ) : linkSent ? (
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase animate-pulse">Email Sent!</p>
                    <button onClick={() => setLinkSent(false)} className="text-[9px] text-slate-500 hover:text-white underline">Change email</button>
                  </div>
                ) : (
                  <form onSubmit={handleMagicLinkSignIn} className="flex gap-2 items-center">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="Email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-white px-3 py-1 rounded text-xs focus:outline-none focus:border-blue-500"
                          required
                        />
                        <button
                          type="submit"
                          disabled={isAuthLoading || !captchaToken}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded disabled:opacity-50 transition-all"
                        >
                          {isAuthLoading ? "..." : "Send Link"}
                        </button>
                      </div>
                      {!captchaToken && (
                        <div className="transform scale-[0.6] origin-right -mt-1">
                          <ReCAPTCHA
                            sitekey="6LcIwSUtAAAAAI6dARfSTSTKXCgzcdhQsH7PJ6Gw"
                            onChange={(token) => setCaptchaToken(token)}
                            theme="dark"
                            size="compact"
                          />
                        </div>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <aside className="col-span-12 lg:col-span-3 space-y-4">
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest">Hardware Probing</span>
                  <button onClick={startPhysicalUsbScan} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded uppercase">🔌 Connect Device</button>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase text-slate-500">Customer</label>
                    <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs" />
                    <select value={deviceBrand} onChange={(e) => setDeviceBrand(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs">
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                    </select>
                  </div>

                  {authUser && !captchaToken && (
                    <div className="pt-2">
                      <ReCAPTCHA
                        sitekey="6LcIwSUtAAAAAI6dARfSTSTKXCgzcdhQsH7PJ6Gw"
                        onChange={(token) => setCaptchaToken(token)}
                        theme="dark"
                        size="compact"
                      />
                    </div>
                  )}

                  {authUser && (
                    <button
                      onClick={handleCreateFirestoreTicket}
                      disabled={!captchaToken || ticketCreationSuccess}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded uppercase disabled:opacity-50"
                    >
                      💾 Back up to AWS RDS
                    </button>
                  )}
                </div>

                <nav className="space-y-1">
                  {["triage", "pos", "tax", "postgres", "verification", "firebase"].map(tab => (
                    <button key={tab} onClick={() => setLabTab(tab as any)} className={`w-full text-left p-2.5 rounded-lg text-xs font-bold uppercase ${labTab === tab ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
                      {tab}
                    </button>
                  ))}
                </nav>
              </aside>

              <div className="col-span-12 lg:col-span-6 space-y-6">
                {labTab === "triage" && (
                  <section className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-[500px]">
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/30">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-lg text-xs max-w-[80%] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSendTriageChat} className="p-4 border-t border-slate-700 bg-slate-800 flex gap-2">
                      <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 text-xs" placeholder="Message assistant..." />
                      <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold">SEND</button>
                    </form>
                  </section>
                )}

                {labTab === "postgres" && <RdsDiagnosticPanel />}
                {labTab === "verification" && <OAuthDocumentationPanel projectId="displaycellpros-com" devUrl="https://ais-dev.run.app" prodUrl="https://displaycellpros.com" />}
                {labTab === "firebase" && <FirebaseLabPanel />}
              </div>

              <aside className="col-span-12 lg:col-span-3 space-y-6">
                <section className="bg-slate-850 border border-slate-800 rounded-xl p-5 shadow-md">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-4">Quote Summary</h3>
                  <div className="space-y-3 text-xs font-mono">
                    <div className="flex justify-between"><span>Subtotal</span><span>${quote.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-blue-400 font-bold"><span>Total</span><span>${quote.grandTotal.toFixed(2)}</span></div>
                  </div>

                  <div className="mt-4">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6LcIwSUtAAAAAI6dARfSTSTKXCgzcdhQsH7PJ6Gw"
                      onChange={(token) => setCaptchaToken(token)}
                      theme="dark"
                      size="compact"
                    />
                  </div>

                  <button
                    onClick={handleBookAppointment}
                    disabled={!captchaToken}
                    className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg uppercase tracking-widest disabled:opacity-50"
                  >
                    📅 Book Now
                  </button>
                </section>
              </aside>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-950 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500">&copy; 2026 Display & Cell Pros. Stateless Vercel Architecture.</p>
        </div>
      </footer>

      {isAiOpen && <AIAssistantWidget onClose={() => setIsAiOpen(false)} onNavigateToLab={() => { setActiveTab("lab"); setIsAiOpen(false); }} deviceBrand={deviceBrand} deviceModel={deviceModel} deviceTier={deviceTier} issueType={issueType} />}
      
      {isAdminPortalOpen && <AdminPortalView email={authUser?.email || ""} onClose={() => setIsAdminPortalOpen(false)} />}
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// --- SUB-VIEWS ---

function HomeView({ onBookClick, onLabClick }: any) {
  return (
    <div className="py-20 text-center">
      <h1 className="text-5xl font-extrabold text-white mb-6">Driveway Device Surgery.</h1>
      <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">Spokane’s premier mobile lab. We fix it where you are.</p>
      <div className="flex justify-center gap-4">
        <button onClick={onBookClick} className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold">Get a Quote</button>
        <button onClick={onLabClick} className="px-8 py-4 bg-slate-800 text-white rounded-lg font-bold">Enter Lab</button>
      </div>
    </div>
  );
}

function ServicesView({ onBookClick }: any) {
  return <div className="py-20 text-center text-white">Services View Content</div>;
}

function B2BView({ onBookClick }: any) {
  return <div className="py-20 text-center text-white">B2B Fleet Content</div>;
}

function AIAssistantWidget({ onClose, onNavigateToLab, deviceBrand }: any) {
  return (
    <div className="fixed bottom-6 right-6 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
      <div className="bg-slate-800 p-4 flex justify-between">
        <span className="text-sm font-bold text-white">D&CP Assistant</span>
        <button onClick={onClose}><X size={16}/></button>
      </div>
      <div className="p-4 h-60 overflow-y-auto text-xs text-slate-300">
        AI Triage active for {deviceBrand}. Use the Lab for full diagnostics.
      </div>
      <div className="p-4 border-t border-slate-800">
        <button onClick={onNavigateToLab} className="w-full py-2 bg-blue-600 text-white rounded text-xs font-bold">Enter Diagnostic Lab</button>
      </div>
    </div>
  );
}

function NavButton({ children, active, onClick }: any) {
  return <button onClick={onClick} className={`px-3 py-2 text-sm font-bold uppercase ${active ? "text-white bg-slate-800 rounded" : "text-slate-400 hover:text-white"}`}>{children}</button>;
}

function AdminPortalView({ email, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 max-w-lg w-full text-center">
        <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">ADMIN PORTAL</h2>
        <p className="text-xs text-slate-400 mb-6 font-mono">Status: {email === 'cheyoung1983@gmail.com' ? 'Verified Tenant' : 'Access Denied'}</p>
        <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded">Close</button>
      </div>
    </div>
  );
}

// --- FIREBASE LAB PANEL COMPONENT ---

function FirebaseLabPanel() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = async () => {
    setLoading(true);
    setError(null);
    try {
      const citiesCol = collection(firebaseDb, "cities");
      const citySnapshot = await getDocs(citiesCol);
      const cityList = citySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCities(cityList);
    } catch (err: any) {
      console.error("Firestore fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4 shadow-md animate-in fade-in">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-orange-400" />
          <div>
            <h2 className="text-sm font-bold text-white uppercase">Firebase Modular SDK Triage</h2>
            <p className="text-xs text-slate-400">Direct Firestore Lite access via Web SDK v12.16.0</p>
          </div>
        </div>
        <button
          onClick={fetchCities}
          disabled={loading}
          className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold uppercase transition-all flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
          Fetch Cities
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded text-xs text-red-400 font-mono">
          [FIRESTORE ERROR]: {error}
        </div>
      )}

      <div className="space-y-3">
        {cities.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono text-[10px] border border-dashed border-slate-700 rounded-lg">
            {loading ? "Synchronizing with Google Cloud..." : "No data retrieved. Ensure Google Cloud permissions and billing are active."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cities.map((city) => (
              <div key={city.id} className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex items-center justify-between group hover:border-orange-500/50 transition-all">
                <div>
                  <p className="text-xs font-bold text-white uppercase">{city.name || city.id}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{city.state || "N/A Region"}</p>
                </div>
                <Globe className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-700 flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase tracking-widest">
        <span>Firebase Status: Online</span>
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Modular Import</span>
      </div>
    </div>
  );
}
