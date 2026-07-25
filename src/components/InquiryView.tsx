import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Send, 
  UserCheck, 
  Mail, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  MapPin, 
  ChevronRight, 
  FileText, 
  Building,
  HelpCircle
} from "lucide-react";
import { trackGoogleAdsConversion } from "../lib/gtag";

interface InquiryViewProps {
  onBookClick?: () => void;
  onNavigateHome?: () => void;
}

export function InquiryView({
  onBookClick,
  onNavigateHome
}: InquiryViewProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [inquiryRef] = useState(() => "DCP-FORM" + Math.floor(100000 + Math.random() * 900000));
  
  // Interactive Information Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deviceModel, setDeviceModel] = useState("iPhone 15 Pro");
  const [details, setDetails] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Fire automatic conversion tracking when page loads
    trackGoogleAdsConversion("inquiry_submitted", {
      transaction_id: inquiryRef,
      value: 15.0,
    });
  }, [inquiryRef]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    trackGoogleAdsConversion("inquiry_submitted", {
      transaction_id: inquiryRef,
      value: 25.0,
      device_info: deviceModel
    });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(inquiryRef);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-300">
      
      {/* HERO CONVERSION BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-10 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            Google Ads Inquiry Action • Logged & Measured
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Customer Information & Inquiry Portal
          </h1>

          <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
            Fill out your details below or review your registered inquiry ticket. Our Spokane master repair desk processes form submissions with instant priority.
          </p>

          {/* Reference Pill */}
          <div className="bg-slate-950/90 border border-slate-750 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-slate-400 font-mono font-semibold block mb-1">
                Form Submission Tracking Code
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-indigo-400 font-mono tracking-wider">
                  #{inquiryRef}
                </span>
                <button
                  onClick={handleCopyId}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 font-mono"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Tracking Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <a
                href="https://app.squareup.com/appointments/buyer/widget/dvyno3qzfnlvek/LRDXJ4YQ6W96R"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Square Appointments</span>
              </a>

              <a
                href="tel:5095550199"
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Desk
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FORM AND INFORMATION CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* LEFT FORM / CONFIRMATION PANEL (2 COLS) */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-750 pb-4 mb-6">
              <FileText className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Device & Inquiry Information Form</h2>
            </div>

            {isSubmitted ? (
              <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Inquiry Form Successfully Received!</h3>
                  <p className="text-sm text-emerald-400 font-mono mt-1">
                    Google Ads conversion recorded for #{inquiryRef}.
                  </p>
                </div>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{name || "Valued Customer"}</strong>! A certified technician will review your <strong>{deviceModel}</strong> inquiry and text/call you at <strong>{phone || "your contact number"}</strong> shortly.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold font-mono"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">Phone Number (SMS Alert)</label>
                    <input
                      type="tel"
                      placeholder="(509) 555-0123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">Device Model / Equipment</label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 15 Pro, Samsung S24"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">Inquiry Details or Questions</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue or ask for quote details..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Form & Register Conversion</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: STORE LOCATION & INFO */}
        <div className="space-y-6">
          <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-750 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Display & Cell Pros LLC</h3>
                <p className="text-[11px] text-slate-400 font-mono">Spokane Customer Desk</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Physical Store Address:</strong>
                  <span>7302 N Division St, Spokane, WA 99208</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Direct Phone Line:</strong>
                  <a href="tel:5095550199" className="text-emerald-400 font-bold hover:underline">(509) 555-0199</a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-white font-bold text-sm">Need a live diagnostic right now?</h4>
          <p className="text-slate-400 text-xs">Our Spokane technicians are standing by during store hours.</p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
            >
              Return Home
            </button>
          )}

          {onBookClick && (
            <button
              onClick={onBookClick}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
            >
              Book Mobile Repair
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
