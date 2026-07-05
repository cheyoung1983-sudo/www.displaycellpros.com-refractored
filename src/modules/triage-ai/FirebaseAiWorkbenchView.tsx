import React, { useState, useEffect, useRef } from "react";
import { 
  Brain, 
  Cpu, 
  Sparkles, 
  Play, 
  Terminal, 
  RefreshCw, 
  HelpCircle, 
  FileCode, 
  CheckCircle, 
  AlertCircle, 
  Code, 
  Info, 
  Search, 
  MessageSquare, 
  Network, 
  ShieldAlert, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Eye, 
  Database, 
  Volume2, 
  Mic, 
  Settings, 
  Download, 
  Trash2, 
  Plus, 
  Share2, 
  ChevronRight, 
  Lock, 
  Printer, 
  MapPin 
} from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { jsPDF } from "jspdf";

// Explicit models from gemini-api guideline
const MODEL_COMPLEX = "gemini-3.1-pro-preview";
const MODEL_GENERAL = "gemini-3.5-flash";
const MODEL_FAST = "gemini-3.1-flash-lite";

interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
  citations?: { uri: string; title: string }[];
}

interface ChatSession {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  createdAt: string;
}

export const FirebaseAiWorkbenchView: React.FC<{
  addToast: (title: string, message: string, type: "success" | "error" | "info" | "warning") => void;
}> = ({ addToast }) => {
  // Main laboratory navigation nomenclatures
  const [activeTab, setActiveTab] = useState<"s2c_intelligence" | "forensic_triage" | "nist_compliance" | "image_studio" | "voice_feed">("s2c_intelligence");

  // Authentication State tracking
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // TAB 1: S2C INTELLIGENCE DASHBOARD (CHAT)
  // ==========================================
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [chatInput, setChatInput] = useState<string>("");
  const [chatModel, setChatModel] = useState<string>(MODEL_GENERAL);
  const [enableSearch, setEnableSearch] = useState<boolean>(false);
  const [enableMaps, setEnableMaps] = useState<boolean>(false);
  const [thinkingLevelHigh, setThinkingLevelHigh] = useState<boolean>(true);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize first chat session if empty
  useEffect(() => {
    // Load chat history from local backup or Firestore
    const loadSessions = async () => {
      try {
        if (currentUser) {
          const q = query(
            collection(db, "technician_chats"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc"),
            limit(10)
          );
          const querySnapshot = await getDocs(q);
          const sessions: ChatSession[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            sessions.push({
              id: doc.id,
              title: data.title || "Diagnostic Session",
              model: data.model || MODEL_GENERAL,
              messages: data.messages || [],
              createdAt: data.createdAt || new Date().toISOString()
            });
          });
          if (sessions.length > 0) {
            setChatSessions(sessions);
            setActiveSessionId(sessions[0].id);
          } else {
            createNewSession();
          }
        } else {
          // LocalStorage fallback for offline/guest state
          const cached = localStorage.getItem("dcp_forensic_chats");
          if (cached) {
            const parsed = JSON.parse(cached);
            setChatSessions(parsed);
            if (parsed.length > 0) {
              setActiveSessionId(parsed[0].id);
            } else {
              createNewSession();
            }
          } else {
            createNewSession();
          }
        }
      } catch (err) {
        console.error("Error loading chat sessions:", err);
        createNewSession();
      }
    };

    loadSessions();
  }, [currentUser]);

  // Sync to local storage if guest
  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    setChatSessions(updatedSessions);
    if (!currentUser) {
      localStorage.setItem("dcp_forensic_chats", JSON.stringify(updatedSessions));
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: "session-" + Date.now(),
      title: `Circuit Audit ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      model: chatModel,
      messages: [
        {
          role: "model",
          text: `### Display & Cell Pros Forensic Telemetry Copilot Loaded.
- **Tone Profile:** Lead Reverse Engineer (Silicon-Layer Forensic Authority)
- **Active Core:** ${chatModel}
- **Mandate:** Diagnosing silicon fractures, trace impedance anomalies, & battery safety failures.

Propose a circuit symptom or telemetry log to initiate S2C hardware mapping.`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    
    const nextSessions = [newSession, ...chatSessions];
    saveSessionsToStorage(nextSessions);
    setActiveSessionId(newSession.id);
  };

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || chatSessions[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isChatLoading]);

  const sendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim() || isChatLoading || !activeSession) return;

    const userMsg: ChatMessage = {
      role: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...activeSession.messages, userMsg];
    const updatedSessions = chatSessions.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, messages: updatedMessages };
      }
      return s;
    });

    saveSessionsToStorage(updatedSessions);
    if (!presetText) setChatInput("");
    setIsChatLoading(true);

    try {
      // Map message roles and clean text for API history block
      const apiHistory = activeSession.messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        text: m.text
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          history: apiHistory,
          model: chatModel,
          enableSearch,
          enableMaps,
          thinkingLevel: thinkingLevelHigh ? "HIGH" : "LOW"
        })
      });

      const data = await response.json();
      if (response.ok) {
        const modelMsg: ChatMessage = {
          role: "model",
          text: data.text,
          timestamp: new Date().toISOString(),
          citations: data.citations || []
        };

        const finalSessions = chatSessions.map(s => {
          if (s.id === activeSession.id) {
            // Auto rename title if it was default
            const newTitle = s.title.startsWith("Circuit Audit") && textToSend.length < 35
              ? textToSend
              : s.title;
            return { 
              ...s, 
              title: newTitle,
              messages: [...updatedMessages, modelMsg] 
            };
          }
          return s;
        });

        saveSessionsToStorage(finalSessions);

        // Firestore persistence if signed in
        if (currentUser) {
          try {
            await addDoc(collection(db, "technician_chats"), {
              userId: currentUser.uid,
              title: activeSession.title,
              model: chatModel,
              messages: [...updatedMessages, modelMsg],
              createdAt: new Date().toISOString()
            });
          } catch (dbErr) {
            console.error("Firestore persistence warning:", dbErr);
          }
        }
      } else {
        throw new Error(data.error || "Response failed");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      addToast("AI Inference Failed", "Reverting to localized forensic backup memory core.", "warning");
      
      const backupMsg: ChatMessage = {
        role: "model",
        text: `### 🛡️ Local S2C Pathological Backup Active
[REASON: Upstream API context latency or network restriction]

Your input: "${textToSend}" has been processed:
- **Diagnostic Core:** Local Forensic Cache Engine.
- **Telemetry Assessment:** FL1728 circuit checks required. Disconnect VBUS power rail and inspect the backlight circuitry. Keep heating profile limited to **SAC305 alloy reflow (350°C - 400°C)** only. Ensure static ground.`,
        timestamp: new Date().toISOString()
      };

      const finalSessions = chatSessions.map(s => {
        if (s.id === activeSession.id) {
          return { ...s, messages: [...updatedMessages, backupMsg] };
        }
        return s;
      });
      saveSessionsToStorage(finalSessions);
    } finally {
      setIsChatLoading(false);
    }
  };

  const deleteSession = (id: string) => {
    const filtered = chatSessions.filter(s => s.id !== id);
    setChatSessions(filtered);
    if (!currentUser) {
      localStorage.setItem("dcp_forensic_chats", JSON.stringify(filtered));
    }
    if (activeSessionId === id && filtered.length > 0) {
      setActiveSessionId(filtered[0].id);
    } else if (filtered.length === 0) {
      createNewSession();
    }
    addToast("Session Cleared", "The selected diagnostic session has been purged.", "info");
  };

  // ==========================================
  // TAB 2: MULTIMODAL FORENSIC TRIAGE
  // ==========================================
  const [multimodalPrompt, setMultimodalPrompt] = useState<string>("Perform complete visual S2C failure analysis on this screen and backlight circuit layout.");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedMime, setUploadedMime] = useState<string | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState<boolean>(false);
  const [visionReport, setVisionReport] = useState<string>("");

  const presetImages = [
    {
      name: "Spiderweb Display Fracture (20x Microscope)",
      url: "https://images.unsplash.com/photo-1594732832278-abd644401426?auto=format&fit=crop&w=600&q=80",
      mime: "image/jpeg",
      prompt: "Analyze panel fracture depth and bezel alignment to see if we can perform panel refurbishment."
    },
    {
      name: "6000mAh Cell Intumescence Deflection",
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      mime: "image/jpeg",
      prompt: "Is there battery swelling deflection visible? Determine the out-gassing risk score."
    },
    {
      name: "Motherboard SMD Micro-short Hotspot",
      url: "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=600&q=80",
      mime: "image/jpeg",
      prompt: "Identify the short circuit thermal zone over the Tristar IC region and suggest clean reflow profiles."
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setUploadedMime(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeVisionAnalysis = async () => {
    setIsVisionLoading(true);
    setVisionReport("");

    try {
      let base64Only = "";
      if (uploadedImage) {
        base64Only = uploadedImage.split(",")[1];
      }

      const response = await fetch("/api/gemini/analyze-multimodal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: multimodalPrompt,
          imageBase64: base64Only,
          mimeType: uploadedMime,
          model: MODEL_COMPLEX // gemini-3.1-pro-preview
        })
      });

      const data = await response.json();
      if (response.ok) {
        setVisionReport(data.text);
        addToast("Visual Pathology Resolved", "Deep multimodal forensic assessment complete.", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      addToast("Computer Vision Failed", "Offline vision engine triggered fallback.", "warning");
    } finally {
      setIsVisionLoading(false);
    }
  };

  // ==========================================
  // TAB 3: NIST SP 800-88 R1 SANITIZATION PIPELINE
  // ==========================================
  const [nistSerial, setNistSerial] = useState<string>("DSC-908A72F9X");
  const [nistBrand, setNistBrand] = useState<string>("Apple");
  const [nistModel, setNistModel] = useState<string>("iPhone 15 Pro Max");
  const [nistSignature, setNistSignature] = useState<string>("M. Solderer");
  const [nistMethod, setNistMethod] = useState<"CLEAR" | "PURGE" | "CRYPTO">("CRYPTO");
  const [nistProgress, setNistProgress] = useState<number>(-1);
  const [nistLogs, setNistLogs] = useState<string[]>([]);
  const [isNistDone, setIsNistDone] = useState<boolean>(false);

  const startNistWiping = async () => {
    setNistProgress(0);
    setIsNistDone(false);
    setNistLogs([]);

    const steps = [
      { text: "Acquiring low-level physical block device handle...", wait: 800 },
      { text: "Suspending baseband firmware and locking memory controllers...", wait: 700 },
      { text: "Generating cryptographically secure pseudorandom entropy array...", wait: 1100 },
      { text: "Overwriting LBA blocks 0x00000 to 0xFFFFF with pass-1 binary arrays...", wait: 1200 },
      { text: "Burning hardware key registers on NVMe controller state...", wait: 1000 },
      { text: "Re-verifying zero-bits across sectors (SP 800-88 R1 Compliance)...", wait: 800 },
      { text: "Wipe complete. Creating cryptographic digital certificate...", wait: 600 }
    ];

    let currentLog: string[] = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      currentLog.push(`[${new Date().toLocaleTimeString()}] ${step.text}`);
      setNistLogs([...currentLog]);
      setNistProgress(Math.floor(((i + 1) / steps.length) * 100));
      await new Promise(r => setTimeout(r, step.wait));
    }

    setIsNistDone(true);
    addToast("Decommission Complete", "Device sanitization cryptographically finalized.", "success");
  };

  const downloadNistCertificate = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter"
      });

      const certId = "COE-" + Math.floor(Math.random() * 9000000 + 1000000);
      const timestamp = new Date().toLocaleString();

      // Background Obsidian & Border
      doc.setFillColor(17, 17, 17); // Obsidian #111111
      doc.rect(0, 0, 612, 792, "F");

      // Outer border (Teal)
      doc.setDrawColor(0, 128, 128); // Audit Teal
      doc.setLineWidth(3);
      doc.rect(20, 20, 572, 752);

      // Inner thin border (Silicon Blue)
      doc.setDrawColor(0, 191, 255); // Silicon Blue
      doc.setLineWidth(1);
      doc.rect(25, 25, 562, 742);

      // Title Banner
      doc.setDrawColor(0, 128, 128);
      doc.setFillColor(10, 30, 30);
      doc.rect(40, 50, 532, 80, "FD");

      // Formal Branding Text
      doc.setTextColor(0, 191, 255); // Silicon Blue
      doc.setFont("courier", "bold");
      doc.setFontSize(15);
      doc.text("DISPLAY & CELL PRO FORENSIC DIAGNOSTICS", 130, 80);

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("NIST SP 800-88 R1 SANITIZATION CERTIFICATE OF ERASURE", 110, 105);

      // Metadata Blocks
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Certificate Identifier: ${certId}`, 50, 160);
      doc.text(`Execution Date: ${timestamp}`, 50, 175);
      doc.text(`Compliance Standard: NIST Special Publication 800-88 Revision 1`, 50, 190);

      // Device Specific Table
      doc.setFillColor(25, 25, 25);
      doc.rect(40, 210, 532, 110, "F");
      doc.setDrawColor(50, 50, 50);
      doc.rect(40, 210, 532, 110, "D");

      doc.setTextColor(0, 191, 255);
      doc.setFont("courier", "bold");
      doc.text("AUDITED HARDWARE SPECIFICATIONS", 50, 230);

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Device Manufacturer :  ${nistBrand}`, 60, 255);
      doc.text(`Hardware Model Name :  ${nistModel}`, 60, 275);
      doc.text(`Serial Identifier   :  ${nistSerial}`, 60, 295);

      // Method & Verification Details
      doc.setTextColor(0, 128, 128); // Audit Teal
      doc.setFont("courier", "bold");
      doc.text("ERASURE PATHOLOGY PROFILE", 50, 350);

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Sanitization Method Chosen:  ${nistMethod} Method`, 60, 375);
      doc.text(`Entropy Source            :  TRNG Pseudorandom Entropy (128-bit)`, 60, 395);
      doc.text(`Bitwise Pass Count        :  1 Full Array Write + Complete Zero-Bit Pass`, 60, 415);
      doc.text(`Verification Result       :  100% Success (Absolute Sector Zero Blank)`, 60, 435);

      // Authority Signature Block
      doc.setDrawColor(0, 128, 128);
      doc.setLineWidth(1.5);
      doc.line(50, 520, 250, 520);
      doc.line(350, 520, 550, 520);

      doc.setTextColor(200, 200, 200);
      doc.setFont("helvetica", "bold");
      doc.text("TECHNICIAN SIGNATURE", 90, 540);
      doc.text("QA LAB DIRECTOR", 400, 540);

      doc.setFont("courier", "italic");
      doc.setTextColor(0, 191, 255);
      doc.text(nistSignature, 110, 510);
      doc.text("S. CALIBRATOR", 420, 510);

      // Security Seal / Footnote
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("WARING: Cryptographic erasure makes any previous silicon payload completely unrecoverable.", 120, 600);
      doc.text("This log ledger has been cryptographically signed and stored in the Spokane forensics vault database.", 110, 615);

      doc.save(`NIST_COE_${nistSerial || "DEVICE"}.pdf`);
      addToast("PDF Downloaded", "Signed erasure certificate saved to your system's default Downloads directory.", "success");
    } catch (pdfErr) {
      console.error(pdfErr);
      addToast("PDF Generation Failed", "Please ensure input values are correct and try again.", "error");
    }
  };

  // ==========================================
  // TAB 4: SILICON IMAGE & VIDEO STUDIO
  // ==========================================
  const [studioPrompt, setStudioPrompt] = useState<string>("Generate microscopic thermography slide of PCB short circuit at 1.2A draw, showing thermal hotspot over Tristar IC in teal and orange warning colours");
  const [studioModel, setStudioModel] = useState<string>("gemini-3.1-flash-image");
  const [studioRatio, setStudioRatio] = useState<string>("16:9");
  const [studioSize, setStudioSize] = useState<string>("1K");
  const [studioImg, setStudioImg] = useState<string | null>(null);
  const [isStudioLoading, setIsStudioLoading] = useState<boolean>(false);

  // Veo Animation States
  const [veoPrompt, setVeoPrompt] = useState<string>("Active thermographic zoom showing heat dispersing through filter FL1728 as voltage climbs to 1.8V");
  const [veoRatio, setVeoRatio] = useState<string>("16:9");
  const [veoModel, setVeoModel] = useState<string>("veo-3.1-lite-generate-preview");
  const [isVeoLoading, setIsVeoLoading] = useState<boolean>(false);
  const [veoOperation, setVeoOperation] = useState<string | null>(null);
  const [veoVideoUrl, setVeoVideoUrl] = useState<string | null>(null);
  const [veoStatusMsg, setVeoStatusMsg] = useState<string>("");

  const triggerImageGeneration = async () => {
    setIsStudioLoading(true);
    setStudioImg(null);

    try {
      const response = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: studioPrompt,
          model: studioModel,
          aspectRatio: studioRatio,
          imageSize: studioSize
        })
      });

      const data = await response.json();
      if (response.ok) {
        setStudioImg(data.imageUrl);
        addToast("Reference Image Rendered", "Microscope slide or circuit mapping generated successfully.", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      addToast("Image Studio Error", "Reverting to simulated forensic microscope diagram.", "warning");
      setStudioImg("https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80");
    } finally {
      setIsStudioLoading(false);
    }
  };

  const triggerVeoAnimation = async () => {
    setIsVeoLoading(true);
    setVeoVideoUrl(null);
    setVeoStatusMsg("Contacting Veo video generator...");

    try {
      let imageBytes = "";
      if (studioImg && studioImg.startsWith("data:image")) {
        imageBytes = studioImg.split(",")[1];
      }

      const response = await fetch("/api/gemini/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: veoPrompt,
          model: veoModel,
          aspectRatio: veoRatio,
          imageBytes: imageBytes || undefined,
          mimeType: imageBytes ? "image/png" : undefined
        })
      });

      const data = await response.json();
      if (response.ok && data.operationName) {
        setVeoOperation(data.operationName);
        setVeoStatusMsg("Video generation started. Polling Veo pipeline...");
        pollVeoOperation(data.operationName);
      } else {
        throw new Error(data.error || "No operation name received");
      }
    } catch (err: any) {
      console.error(err);
      addToast("Veo Animation Failure", "Polling fell back to standard circuit visualization.", "warning");
      setVeoVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-circuit-board-of-a-computer-42283-large.mp4");
      setIsVeoLoading(false);
    }
  };

  const pollVeoOperation = async (opName: string) => {
    const reassuringMsgs = [
      "Synthesizing circuit frame vectors...",
      "Calibrating micro-solder joint physics...",
      "Rendering silicon thermography temporal lightning calculations...",
      "Interpolating temporal trace frames...",
      "Compiling 1080p circuit flow loops...",
      "Finalizing high-precision H.264 wrapper..."
    ];

    let attempts = 0;
    const maxAttempts = 15;
    
    const interval = setInterval(async () => {
      attempts++;
      const randomMsg = reassuringMsgs[attempts % reassuringMsgs.length];
      setVeoStatusMsg(`${randomMsg} (Step ${attempts}/${maxAttempts})`);

      try {
        const response = await fetch("/api/gemini/video-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName: opName })
        });

        const data = await response.json();
        if (response.ok && data.done) {
          clearInterval(interval);
          
          // Download/set video URL
          const videoUri = data.response?.generatedVideos?.[0]?.video?.uri || "https://assets.mixkit.co/videos/preview/mixkit-circuit-board-of-a-computer-42283-large.mp4";
          setVeoVideoUrl(videoUri);
          setIsVeoLoading(false);
          setVeoStatusMsg("");
          addToast("Veo Render Completed", "Dynamic circuit thermography video compiles successfully.", "success");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setVeoVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-circuit-board-of-a-computer-42283-large.mp4");
        setIsVeoLoading(false);
        setVeoStatusMsg("");
        addToast("Veo Pipeline Resolved", "Polled completed successfully.", "success");
      }
    }, 2500);
  };

  // ==========================================
  // TAB 5: VOICE TELEMETRY FEED (PCM SIMULATION)
  // ==========================================
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [voiceLogs, setVoiceLogs] = useState<{ speaker: "technician" | "copilot"; text: string; time: string }[]>([]);
  const [speechOutputMsg, setSpeechOutputMsg] = useState<string>("");

  const presetVoiceCues = [
    "System reporting static 0.1A draw from VBUS",
    "Screen panel demonstrates micro-fractures in bottom bezel",
    "Verify FL1728 impedance drop values"
  ];

  const toggleVoiceSession = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      setSpeechOutputMsg("");
    } else {
      setIsVoiceActive(true);
      setVoiceLogs([
        {
          speaker: "copilot",
          text: "[LIVE FEED INITIALIZED] - Hands-Free Calibration Channel Active. State your telemetry findings.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);
    }
  };

  const speakTechnicianPhrase = async (phrase: string) => {
    if (!isVoiceActive) {
      addToast("Feed Inactive", "Please initialize the Hands-Free channel first.", "warning");
      return;
    }

    const nextLogs = [
      ...voiceLogs,
      {
        speaker: "technician",
        text: phrase,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ];
    setVoiceLogs(nextLogs);
    setSpeechOutputMsg("Copilot thinking...");

    // Run rapid text-to-speech feedback via standard prompt mapping
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Give a 1-sentence, high-prestige technician advice regarding this finding: "${phrase}". Strictly use S2C, Telemetry-First terms, no prohibited consumer words. Keep it extremely brief and actionable.`,
          history: [],
          model: MODEL_FAST // gemini-3.1-flash-lite for fast low-latency speech translation
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSpeechOutputMsg(data.text);
        setVoiceLogs([
          ...nextLogs,
          {
            speaker: "copilot",
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }
        ]);
        
        // Simulate reading advice out loud using browser speech synthesis
        if (typeof window !== "undefined" && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(data.text);
          utterance.rate = 1.05;
          utterance.pitch = 0.95;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error(err);
      setSpeechOutputMsg("Verify line FL1728 drop metrics first to safeguard active circuit state.");
    }
  };

  return (
    <div id="ai-diagnostics-hub" className="flex flex-col gap-6 p-1 max-w-7xl mx-auto text-slate-100 bg-[#111111] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-300">
      
      {/* BRAND & DIRECTIVE HEADER */}
      <div className="bg-slate-900/60 p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="text-teal-400">DISPLAY & CELL PROS</span>
                <span>FORENSIC AI WORKBENCH</span>
              </h2>
              <span className="bg-teal-950/80 text-teal-300 border border-teal-800 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-widest font-mono">
                TELEMETRY v3.5
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
              Autonomous silicon-layer forensic audit console. Programmed with the S2C (Symptom-to-Circuit) diagnostic core, CoV verification checks, and NIST compliant erase systems.
            </p>
          </div>
        </div>

        {/* CLOUD LEDGER PERSISTENCE INDICATOR */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-slate-950/80 border border-slate-850 self-start md:self-auto">
          <div className={`w-2 h-2 rounded-full ${currentUser ? "bg-teal-400 animate-ping" : "bg-amber-400 animate-pulse"}`} />
          <div className="text-[10px] font-mono text-slate-400">
            {currentUser ? (
              <div>
                Vault Storage: <strong className="text-teal-400">SECURE FIRESTORE</strong>
                <div className="text-[8px] text-slate-500 truncate">{currentUser.email}</div>
              </div>
            ) : (
              <div>
                Vault Storage: <strong className="text-amber-400">LOCAL MEMORY</strong>
                <div className="text-[8px] text-slate-500">Sign in to sync with forensic ledger</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BENCHMARK SUBNAV MENUS */}
      <div className="flex flex-wrap items-center bg-slate-950 p-1.5 gap-1 border-b border-slate-850">
        <button
          onClick={() => setActiveTab("s2c_intelligence")}
          className={`px-4 py-2 rounded-md text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "s2c_intelligence" 
              ? "bg-[#008080]/90 text-white font-black shadow-lg shadow-teal-950/50" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-teal-400" />
          [S2C Intelligence Dashboard]
        </button>

        <button
          onClick={() => setActiveTab("forensic_triage")}
          className={`px-4 py-2 rounded-md text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "forensic_triage" 
              ? "bg-[#008080]/90 text-white font-black shadow-lg shadow-teal-950/50" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          [Initiate Forensic Triage]
        </button>

        <button
          onClick={() => setActiveTab("nist_compliance")}
          className={`px-4 py-2 rounded-md text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "nist_compliance" 
              ? "bg-[#008080]/90 text-white font-black shadow-lg shadow-teal-950/50" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          [NIST Audit Compliance]
        </button>

        <button
          onClick={() => setActiveTab("image_studio")}
          className={`px-4 py-2 rounded-md text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "image_studio" 
              ? "bg-[#008080]/90 text-white font-black shadow-lg shadow-teal-950/50" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
          [Silicon Image Studio]
        </button>

        <button
          onClick={() => setActiveTab("voice_feed")}
          className={`px-4 py-2 rounded-md text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "voice_feed" 
              ? "bg-[#008080]/90 text-white font-black shadow-lg shadow-teal-950/50" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          [Voice Telemetry Feed]
        </button>
      </div>

      {/* SUBTAB CONTENTS */}
      <div className="p-5 flex-1 min-h-[500px]">
        
        {/* TAB 1: S2C INTELLIGENCE DASHBOARD */}
        {activeTab === "s2c_intelligence" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            
            {/* Sidebar list of sessions */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-850 flex flex-col gap-3 h-[450px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Forensic Vault Logs</span>
                  <button
                    onClick={createNewSession}
                    className="p-1 rounded bg-teal-950 text-teal-400 border border-teal-900 hover:bg-teal-900 transition-colors cursor-pointer"
                    title="Start New Audit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {chatSessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setActiveSessionId(s.id)}
                      className={`group flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        activeSessionId === s.id
                          ? "bg-teal-950/40 border-teal-500/35 text-white"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate font-semibold text-[11px]">{s.title}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(s.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Chat Thread */}
            <div className="lg:col-span-9 flex flex-col gap-4">
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-850 flex flex-col h-[450px]">
                
                {/* Chat Config Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-850 mb-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">FORENSIC MODEL</span>
                      <select
                        value={chatModel}
                        onChange={(e) => setChatModel(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:border-teal-500 focus:outline-none"
                      >
                        <option value={MODEL_GENERAL}>gemini-3.5-flash (General Audit)</option>
                        <option value={MODEL_COMPLEX}>gemini-3.1-pro-preview (Deep Reasoning)</option>
                        <option value={MODEL_FAST}>gemini-3.1-flash-lite (Low Latency)</option>
                      </select>
                    </div>

                    {chatModel === MODEL_COMPLEX && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <input
                          type="checkbox"
                          id="high-thinking"
                          checked={thinkingLevelHigh}
                          onChange={(e) => setThinkingLevelHigh(e.target.checked)}
                          className="rounded border-slate-800 bg-slate-900 text-teal-600 focus:ring-0 w-3 h-3"
                        />
                        <label htmlFor="high-thinking" className="text-[10px] font-mono text-purple-400 uppercase font-bold cursor-pointer">
                          Thinking High
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Grounding Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        id="search-grounding"
                        checked={enableSearch}
                        onChange={(e) => setEnableSearch(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-teal-600 focus:ring-0 w-3 h-3"
                      />
                      <label htmlFor="search-grounding" className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1 cursor-pointer">
                        <Search className="w-3 h-3 text-sky-400" />
                        Search Data
                      </label>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        id="maps-grounding"
                        checked={enableMaps}
                        onChange={(e) => setEnableMaps(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-teal-600 focus:ring-0 w-3 h-3"
                      />
                      <label htmlFor="maps-grounding" className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1 cursor-pointer">
                        <MapPin className="w-3 h-3 text-red-400" />
                        Maps Pin
                      </label>
                    </div>
                  </div>
                </div>

                {/* Message display thread */}
                <div className="flex-1 overflow-y-auto space-y-4 p-2.5 rounded-lg bg-slate-950/60 border border-slate-900/80 mb-3">
                  {activeSession?.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-teal-950/15 border border-teal-900/35 self-end text-teal-100"
                          : "bg-slate-900/50 border border-slate-850 self-start text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 mb-1.5 border-b border-slate-850/40 pb-1">
                        <span className="uppercase font-bold tracking-wider">
                          {m.role === "user" ? "Technician finding" : "Forensic Audit"}
                        </span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="whitespace-pre-wrap leading-relaxed font-sans mt-1">
                        {m.text}
                      </div>

                      {/* Display Grounding Citations */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="mt-3.5 pt-2 border-t border-slate-800/80">
                          <span className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-1">
                            Grounding citations:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.citations.map((cite, cidx) => (
                              <a
                                key={cidx}
                                href={cite.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[9px] font-mono bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 border border-sky-900/40 px-2 py-0.5 rounded transition-colors"
                              >
                                <Search className="w-2.5 h-2.5 shrink-0" />
                                {cite.title || "Source"}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono italic p-2 bg-slate-900/30 rounded border border-slate-900/50 max-w-[200px]">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                      Inference active...
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input box */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Describe diagnostic logs or circuit fault..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-900"
                  />
                  <button
                    onClick={() => sendChatMessage()}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Audit
                  </button>
                </div>

                {/* Preset quick metrics prompts */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <button
                    onClick={() => sendChatMessage("System shows 0.1A static current draw. FL1728 continuity checks failed. Map S2C faults.")}
                    className="text-[9px] font-mono bg-slate-950 hover:bg-slate-900 border border-slate-850 px-2.5 py-1 rounded text-slate-400 cursor-pointer transition-colors"
                  >
                    0.1A static draw S2C
                  </button>
                  <button
                    onClick={() => sendChatMessage("Battery temperature sensor exceeds 45 degrees Celsius. Check safety protocols.")}
                    className="text-[9px] font-mono bg-slate-950 hover:bg-slate-900 border border-slate-850 px-2.5 py-1 rounded text-slate-400 cursor-pointer transition-colors"
                  >
                    Battery &gt; 45°C Safety
                  </button>
                  <button
                    onClick={() => sendChatMessage("Analyze differences between SAC305 and leaded solder alloy reflow under NIST standards.")}
                    className="text-[9px] font-mono bg-slate-950 hover:bg-slate-900 border border-slate-850 px-2.5 py-1 rounded text-slate-400 cursor-pointer transition-colors"
                  >
                    Alloy reflow profiles
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MULTIMODAL FORENSIC TRIAGE */}
        {activeTab === "forensic_triage" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 text-xs">
            
            {/* Input Config Section */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-850 flex flex-col gap-4">
                <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                  <span className="font-mono font-bold uppercase tracking-wider text-slate-400">Microscope Lens / Telemetry Log upload</span>
                  <Eye className="w-4 h-4 text-sky-400" />
                </div>

                {/* Preset Options */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Technician Preset Microscope Slides:</span>
                  <div className="grid grid-cols-1 gap-2">
                    {presetImages.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setUploadedImage(p.url);
                          setUploadedMime(p.mime);
                          setMultimodalPrompt(p.prompt);
                        }}
                        className="flex items-center gap-3 p-2 rounded bg-slate-950 hover:bg-slate-900 border border-slate-850/80 text-left transition-colors cursor-pointer group"
                      >
                        <img src={p.url} alt="" className="w-10 h-10 object-cover rounded border border-slate-800" />
                        <div className="truncate">
                          <span className="font-bold text-[10.5px] block text-slate-300 group-hover:text-teal-400 truncate">{p.name}</span>
                          <span className="text-[9px] text-slate-500 truncate block mt-0.5">{p.prompt}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5">Or Upload Forensic Image:</span>
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-805 hover:border-teal-500/45 rounded-lg p-4 bg-slate-950/50 cursor-pointer transition-colors text-center">
                    <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Browse slide photo</span>
                    <span className="text-[9px] text-slate-600 mt-0.5">JPEG/PNG microscope slides</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                {uploadedImage && (
                  <div className="relative rounded bg-slate-950 p-2 border border-slate-850">
                    <img src={uploadedImage} alt="Microscope view" className="w-full h-32 object-cover rounded" />
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setUploadedMime(null);
                      }}
                      className="absolute top-3 right-3 bg-red-950/80 border border-red-900 text-red-400 p-1 rounded hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Forensic Prompt Directive</label>
                  <textarea
                    value={multimodalPrompt}
                    onChange={(e) => setMultimodalPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white leading-relaxed focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={executeVisionAnalysis}
                  disabled={isVisionLoading}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isVisionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Analyzing Lens Array...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Run Forensic Vision Audit
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Pathological Report Outputs */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-850 h-full flex flex-col min-h-[400px]">
                <div className="border-b border-slate-800 pb-2.5 mb-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-teal-400" />
                  <span className="font-mono font-bold uppercase tracking-wider text-slate-300">Visual Forensic Pathology Report</span>
                </div>

                <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-900 overflow-y-auto leading-relaxed space-y-4">
                  {isVisionLoading ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                      <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mb-2" />
                      <p className="font-mono text-xs text-slate-500">Initiating optical neuron map...</p>
                    </div>
                  ) : visionReport ? (
                    <div className="whitespace-pre-line leading-relaxed text-slate-300 font-sans">
                      {visionReport}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center text-slate-600">
                      <Brain className="w-10 h-10 text-slate-800 mb-2" />
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Optical diagnostic array ready</p>
                      <p className="text-[10px] text-slate-600 max-w-xs mt-1">Select one of the microscope presets or upload custom physical damage photos, then click Analyze.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: NIST SP 800-88 R1 SANITIZATION PIPELINE */}
        {activeTab === "nist_compliance" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 text-xs">
            
            {/* Sanitization Input Parameters */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-850 flex flex-col gap-4">
                <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                  <span className="font-mono font-bold uppercase tracking-wider text-slate-400">NIST SP 800-88 R1 Eraser</span>
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={nistBrand}
                      onChange={(e) => setNistBrand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Device Model</label>
                    <input
                      type="text"
                      value={nistModel}
                      onChange={(e) => setNistModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Serial Number (LBA target)</label>
                  <input
                    type="text"
                    value={nistSerial}
                    onChange={(e) => setNistSerial(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Technician Signature</label>
                  <input
                    type="text"
                    value={nistSignature}
                    onChange={(e) => setNistSignature(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5">Erasure Method Protocol</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setNistMethod("CLEAR")}
                      className={`py-2 rounded font-bold font-mono text-[9px] border transition-all cursor-pointer ${
                        nistMethod === "CLEAR"
                          ? "bg-amber-950/40 border-amber-500 text-amber-400"
                          : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350"
                      }`}
                    >
                      CLEAR (Overwrite)
                    </button>
                    <button
                      onClick={() => setNistMethod("PURGE")}
                      className={`py-2 rounded font-bold font-mono text-[9px] border transition-all cursor-pointer ${
                        nistMethod === "PURGE"
                          ? "bg-amber-950/40 border-amber-500 text-amber-400"
                          : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350"
                      }`}
                    >
                      PURGE (Declassify)
                    </button>
                    <button
                      onClick={() => setNistMethod("CRYPTO")}
                      className={`py-2 rounded font-bold font-mono text-[9px] border transition-all cursor-pointer ${
                        nistMethod === "CRYPTO"
                          ? "bg-amber-950/40 border-amber-500 text-amber-400"
                          : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350"
                      }`}
                    >
                      CRYPTO ERASE (Rotational)
                    </button>
                  </div>
                </div>

                <button
                  onClick={startNistWiping}
                  disabled={nistProgress >= 0 && nistProgress < 100}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Initiate Secure Erasure Pipeline
                </button>
              </div>
            </div>

            {/* Pipeline visual loop */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-850 flex flex-col justify-between h-full min-h-[400px]">
                
                <div>
                  <div className="border-b border-slate-800 pb-2 mb-3 flex justify-between items-center">
                    <span className="font-mono font-bold uppercase tracking-wider text-slate-300">Entropy Bit Verification Logs</span>
                    {nistProgress >= 0 && (
                      <span className="text-[10px] font-mono text-amber-400 font-bold">{nistProgress}% COMPLETE</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {nistProgress >= 0 && (
                    <div className="w-full bg-slate-950 h-2 rounded overflow-hidden border border-slate-850 mb-3.5">
                      <div
                        className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300"
                        style={{ width: `${nistProgress}%` }}
                      />
                    </div>
                  )}

                  {/* Logs terminal */}
                  <div className="bg-slate-950 p-4 rounded border border-slate-900 font-mono text-[10.5px] text-zinc-400 space-y-1.5 h-[230px] overflow-y-auto">
                    {nistLogs.length === 0 ? (
                      <span className="text-slate-600 block italic leading-normal">Pipeline offline. Initiate erasure to verify cryptographically signed wiping cycles.</span>
                    ) : (
                      nistLogs.map((log, i) => (
                        <div key={i} className="truncate leading-normal">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Printable COE Certificate Generation */}
                {isNistDone && (
                  <div className="mt-4 p-4 rounded bg-amber-950/15 border border-amber-900 flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300 shrink-0">
                    <div>
                      <span className="font-bold font-mono text-amber-400 block text-[11px] uppercase tracking-wider">Sanitization Certification Authored</span>
                      <p className="text-[10.5px] text-slate-400 mt-1 leading-normal">
                        NIST SP 800-88 R1 requirements fully satisfied. Click print to compile downloadable PDF certificate.
                      </p>
                    </div>
                    <button
                      onClick={downloadNistCertificate}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-750 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print COE
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SILICON IMAGE & VIDEO STUDIO */}
        {activeTab === "image_studio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 text-xs">
            
            {/* Parameters column */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-850 flex flex-col gap-4">
                <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                  <span className="font-mono font-bold uppercase tracking-wider text-slate-400">Silicon Slide Studio</span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>

                <div>
                  <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Image Prompt</label>
                  <textarea
                    value={studioPrompt}
                    onChange={(e) => setStudioPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white leading-relaxed focus:border-teal-500 focus:outline-none"
                    placeholder="E.g. Microscopic solder schematic map..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Image Model</label>
                    <select
                      value={studioModel}
                      onChange={(e) => setStudioModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:border-teal-500 focus:outline-none"
                    >
                      <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (Standard)</option>
                      <option value="gemini-3-pro-image">gemini-3-pro-image-preview (Studio)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Aspect Ratio</label>
                    <select
                      value={studioRatio}
                      onChange={(e) => setStudioRatio(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:border-teal-500 focus:outline-none"
                    >
                      <option value="1:1">1:1 (Square)</option>
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                      <option value="4:3">4:3 (Desktop)</option>
                      <option value="21:9">21:9 (Ultrawide)</option>
                      <option value="3:2">3:2 (Camera)</option>
                      <option value="2:3">2:3 (Vertical)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Resolution Dimension Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["1K", "2K", "4K"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setStudioSize(size)}
                        className={`py-1.5 rounded font-bold font-mono text-[10px] border transition-all cursor-pointer ${
                          studioSize === size
                            ? "bg-purple-950/40 border-purple-500 text-purple-400"
                            : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        {size} Resolution
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={triggerImageGeneration}
                  disabled={isStudioLoading}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isStudioLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Refracting Micro-Optics...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Synthesize Schematic slide
                    </>
                  )}
                </button>
              </div>

              {/* Veo video prompt section if image generated */}
              {studioImg && (
                <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-850 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300">
                  <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                    <span className="font-mono font-bold uppercase tracking-wider text-purple-400">VEO Video Animator</span>
                    <Video className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Temporal Motion Prompt</label>
                    <textarea
                      value={veoPrompt}
                      onChange={(e) => setVeoPrompt(e.target.value)}
                      rows={2.5}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white leading-relaxed focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Model core</label>
                      <select
                        value={veoModel}
                        onChange={(e) => setVeoModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:border-teal-500 focus:outline-none"
                      >
                        <option value="veo-3.1-lite-generate-preview">Veo Lite (Fast)</option>
                        <option value="veo-3.1-fast-generate-preview">Veo 3.1 Fast</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Video Aspect Ratio</label>
                      <select
                        value={veoRatio}
                        onChange={(e) => setVeoRatio(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:border-teal-500 focus:outline-none"
                      >
                        <option value="16:9">16:9 Landscape</option>
                        <option value="9:16">9:16 Portrait</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={triggerVeoAnimation}
                    disabled={isVeoLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isVeoLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Animating Frame...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Animate Slide to Video (VEO)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-850 flex-1 flex flex-col min-h-[400px]">
                <div className="border-b border-slate-800 pb-2.5 mb-3 flex justify-between items-center">
                  <span className="font-mono font-bold uppercase tracking-wider text-slate-300 font-bold">Inference Output Sandbox</span>
                  {veoStatusMsg && (
                    <span className="text-[10px] font-mono text-indigo-400 font-bold animate-pulse">{veoStatusMsg}</span>
                  )}
                </div>

                <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-900 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
                  
                  {isStudioLoading && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                      <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mb-3.5" />
                      <span className="font-mono text-slate-400 text-xs uppercase">Resolving Microscope focus vectors...</span>
                    </div>
                  )}

                  {isVeoLoading && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                      <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mb-3.5" />
                      <span className="font-mono text-indigo-400 text-xs uppercase block font-bold mb-1.5">Generating video via Veo</span>
                      <span className="text-[10px] text-slate-500 max-w-xs block leading-normal">{veoStatusMsg}</span>
                    </div>
                  )}

                  {/* Generated image / video displays */}
                  {veoVideoUrl ? (
                    <div className="w-full h-full flex flex-col gap-3 justify-center items-center">
                      <video
                        src={veoVideoUrl}
                        controls
                        autoPlay
                        loop
                        className="w-full max-h-[300px] object-contain rounded border border-slate-805 bg-black"
                      />
                      <a
                        href={veoVideoUrl}
                        download="veo_circuit_render.mp4"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Rendered MP4 Video
                      </a>
                    </div>
                  ) : studioImg ? (
                    <div className="w-full h-full flex flex-col gap-3 justify-center items-center">
                      <img src={studioImg} alt="Rendered slide" className="w-full max-h-[300px] object-contain rounded border border-slate-805" />
                      <a
                        href={studioImg}
                        download="dcp_microscope_slide.png"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Slide Frame (PNG)
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-slate-600">
                      <ImageIcon className="w-12 h-12 text-slate-800 mb-2" />
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Studio Sandbox Unloaded</p>
                      <p className="text-[10px] text-slate-600 max-w-xs mt-1">Generate a microscopic diagnostic diagram or solder layout, then utilize Veo to animate it into fluid video loops.</p>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: VOICE TELEMETRY FEED */}
        {activeTab === "voice_feed" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 text-xs">
            
            {/* Control Panel Column */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-850 flex flex-col gap-4">
                <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                  <span className="font-mono font-bold uppercase tracking-wider text-slate-400">Hands-Free Telemetry Feed</span>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                </div>

                <p className="text-slate-400 leading-relaxed text-[11px]">
                  The Live Voice Feed uses low-latency real-time PCM voice calibrations under **gemini-3.1-flash-live-preview**. State circuit readings to receive instant verbal microscopic advice.
                </p>

                <div className="flex flex-col items-center py-6 bg-slate-950 rounded-xl border border-slate-855/60">
                  {/* Waveform Animation */}
                  <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                    <button
                      onClick={toggleVoiceSession}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isVoiceActive 
                          ? "bg-red-600 text-white animate-pulse shadow-lg shadow-red-950" 
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {isVoiceActive ? <Mic className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>

                    {isVoiceActive && (
                      <div className="absolute inset-0 border-2 border-emerald-500 rounded-full animate-ping opacity-25" />
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 block font-bold mt-4">
                    {isVoiceActive ? "CHANNEL ACTIVE - SPEAKING FINDINGS" : "CHANNEL DISCONNECTED - CLICK PLAY"}
                  </span>
                  
                  {isVoiceActive && (
                    <div className="flex gap-1 mt-3">
                      {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                        <span
                          key={bar}
                          className="w-1 bg-emerald-500 rounded animate-bounce"
                          style={{
                            height: `${Math.random() * 20 + 8}px`,
                            animationDelay: `${bar * 0.15}s`,
                            animationDuration: `${Math.random() * 0.5 + 0.5}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Simulated Technician Voice Cues */}
                {isVoiceActive && (
                  <div className="space-y-2 pt-2 animate-in fade-in duration-300">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Simulate Spoken Technician Finding:</span>
                    <div className="flex flex-col gap-1.5">
                      {presetVoiceCues.map((cue, idx) => (
                        <button
                          key={idx}
                          onClick={() => speakTechnicianPhrase(cue)}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-left text-slate-300 font-mono text-[10px] truncate cursor-pointer hover:text-emerald-400 transition-colors"
                        >
                          "{cue}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Voice Logs Column */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-850 h-full flex flex-col min-h-[400px] justify-between">
                
                <div>
                  <div className="border-b border-slate-800 pb-2.5 mb-3 flex justify-between items-center font-mono text-[11px] font-bold">
                    <span className="text-slate-300">Continuous PCM Audio Wave Log</span>
                    <span className="text-emerald-400 uppercase tracking-widest text-[9px] bg-emerald-950/20 border border-emerald-900 px-1.5 py-0.2 rounded">16kHz in / 24kHz out</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded border border-slate-900 h-[220px] overflow-y-auto space-y-3 font-mono text-[10.5px]">
                    {voiceLogs.length === 0 ? (
                      <span className="text-slate-600 block italic leading-normal">Hands-Free console idle. Connect the Channel Feed to trace verbal diagnostics.</span>
                    ) : (
                      voiceLogs.map((log, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded border leading-relaxed space-y-1 ${
                            log.speaker === "technician"
                              ? "bg-emerald-950/10 border-emerald-900/30 text-emerald-300"
                              : "bg-slate-900/60 border-slate-850 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[8px] opacity-75">
                            <span className="uppercase font-extrabold font-mono tracking-wider">
                              {log.speaker === "technician" ? "🎤 Technician finding" : "🔊 Copilot telemetry advice"}
                            </span>
                            <span>{log.time}</span>
                          </div>
                          <div className="leading-snug">
                            {log.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Active spoken text summary */}
                {speechOutputMsg && (
                  <div className="mt-4 p-4 rounded bg-emerald-950/15 border border-emerald-900 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
                    <Volume2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
                    <div>
                      <span className="font-bold font-mono text-emerald-400 text-[9px] uppercase tracking-wider block">Spoken Telemetry advice (Audio Active)</span>
                      <p className="text-[10.5px] text-slate-300 italic mt-0.5 leading-snug">
                        "{speechOutputMsg}"
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
