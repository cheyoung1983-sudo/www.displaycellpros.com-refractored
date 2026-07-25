import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  MapPin, 
  ChevronRight, 
  Send,
  Building,
  UserCheck
} from "lucide-react";
import { trackGoogleAdsConversion } from "../lib/gtag";

interface ContactReceivedViewProps {
  onBookClick?: () => void;
  onNavigateHome?: () => void;
}

export function ContactReceivedView({
  onBookClick,
  onNavigateHome
}: ContactReceivedViewProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [inquiryRef] = useState(() => "DCP-INQ" + Math.floor(100000 + Math.random() * 900000));

  useEffect(() => {
    trackGoogleAdsConversion("contact_requested", {
      transaction_id: inquiryRef,
      value: 10.0,
    });
  }, [inquiryRef]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(inquiryRef);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-300">
      
      {/* SUCCESS HERO BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-10 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            Contact Received • Dispatch Ticket Dispatched
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Thank You! Your Contact Request Has Been Received.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
            We have logged your inquiry into our Spokane master repair queue. One of our certified technicians will reach out to you via SMS or phone shortly.
          </p>

          {/* Reference ID Pill & Quick Actions */}
          <div className="bg-slate-950/90 border border-slate-750 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-slate-400 font-mono font-semibold block mb-1">
                Contact Inquiry Ticket ID
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-cyan-400 font-mono tracking-wider">
                  #{inquiryRef}
                </span>
                <button
                  onClick={handleCopyId}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 font-mono"
                  title="Copy Reference Ticket"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <a
                href="tel:5095550199"
                className="flex-1 sm:flex-none px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call (509) 555-0199
              </a>

              {onBookClick && (
                <button
                  onClick={onBookClick}
                  className="flex-1 sm:flex-none px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Instant AI Assistant
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCH GUARANTEE & STORE LOCATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* LEFT COLUMN: WHAT HAPPENS NEXT (2 COLS) */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-750 pb-4 mb-6">
              <Clock className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">What Happens Next?</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Queue Review (Under 15 Minutes)</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Our Spokane repair team reviews your device brand, model, and reported issue to check part availability in our 7302 N Division St inventory.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Direct SMS / Phone Estimate</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You'll receive a detailed price quote and time estimate. We offer both in-shop repair and on-site mobile driveway technician service.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Same-Day Repair Dispatch</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Once approved, our mobile driveway van arrives at your location or you can stop by our Spokane store location with zero wait time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
            <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold text-sm">100-Day Warranty Protection</h4>
              <p className="text-xs text-slate-400">
                All Display & Cell Pros hardware repairs carry our 100-day parts and labor guarantee.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: STORE HOURS & LOCATION (1 COL) */}
        <div className="space-y-6">
          <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-750 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Display & Cell Pros LLC</h3>
                <p className="text-[11px] text-slate-400 font-mono">Spokane Master Repair Hub</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Location Address:</strong>
                  <span>7302 N Division St, Spokane, WA 99208</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Operating Hours:</strong>
                  <span>Monday - Saturday: 8:00 AM - 7:00 PM</span>
                  <span className="block text-slate-500 text-[11px]">Sunday: Emergency Mobile Van Available</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="tel:5095550199"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                Call (509) 555-0199
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER NAVIGATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-white font-bold text-sm">Need immediate assistance?</h4>
          <p className="text-slate-400 text-xs">Our Spokane hotline is active during business hours.</p>
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
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
