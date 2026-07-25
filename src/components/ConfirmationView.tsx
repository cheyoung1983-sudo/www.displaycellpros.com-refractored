import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Wrench, 
  Smartphone, 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Star, 
  Building,
  Navigation,
  Share2,
  Download
} from "lucide-react";
import { trackGoogleAdsConversion } from "../lib/gtag";

interface ConfirmationViewProps {
  onBookClick?: () => void;
  onNavigateHome?: () => void;
  pageType?: "schedule" | "confirm";
}

export function ConfirmationView({
  onBookClick,
  onNavigateHome,
  pageType = "confirm"
}: ConfirmationViewProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [confirmationRef] = useState(() => "DCP-APT" + Math.floor(100000 + Math.random() * 900000));

  useEffect(() => {
    trackGoogleAdsConversion(pageType === "schedule" ? "appointment_scheduled" : "signup_completed", {
      transaction_id: confirmationRef,
      value: 120.0,
    });
  }, [pageType, confirmationRef]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(confirmationRef);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 3000);
  };

  const titleText = pageType === "schedule" 
    ? "Appointment Scheduled & Confirmed!" 
    : "Service Confirmation & Booking Received!";

  const subText = pageType === "schedule"
    ? "Your Spokane mobile driveway technician appointment is scheduled. A calendar invitation and SMS reminder have been dispatched."
    : "Thank you for scheduling your repair service with Display & Cell Pros. Your appointment and signup details have been locked into our dispatch calendar.";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-300">
      
      {/* SUCCESS HERO BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 sm:p-10 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Appointment Confirmed • Mobile Tech Dispatched
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            {titleText}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
            {subText}
          </p>

          {/* Reference ID Pill & Quick Actions */}
          <div className="bg-slate-950/90 border border-slate-750 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-slate-400 font-mono font-semibold block mb-1">
                Appointment Confirmation Code
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-emerald-400 font-mono tracking-wider">
                  #{confirmationRef}
                </span>
                <button
                  onClick={handleCopyId}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 font-mono"
                  title="Copy Confirmation Code"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <a
                href="https://app.squareup.com/appointments/business_locations/qrcode/LRDXJ4YQ6W96R"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Square Appointments
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Display+%26+Cell+Pros+Repair+Appointment&details=Mobile+driveway+repair+appointment.+Confirmation+%23${confirmationRef}&location=7302+N+Division+St,+Spokane,+WA+99208`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Add to Google Calendar
              </a>

              <a
                href="tel:5095550199"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Desk
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* APPOINTMENT & LOCATION DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* LEFT COLUMN: SCHEDULE & SERVICE DETAILS (2 COLS) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* APPOINTMENT SPECIFICATIONS CARD */}
          <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-750 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Scheduled Appointment Details</h2>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-mono font-bold">
                Status: Confirmed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Date & Time Slot</span>
                <span className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Today, 2:00 PM - 3:30 PM PST
                </span>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Service Type</span>
                <span className="text-base font-bold text-cyan-400 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  On-Site Mobile Driveway Repair
                </span>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Target Device</span>
                <span className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  iPhone / Galaxy Hardware Diagnostic
                </span>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Assigned Unit</span>
                <span className="text-base font-bold text-amber-400">Mobile Van #3 (Spokane Metro)</span>
              </div>
            </div>

            {/* WHAT TO EXPECT CHECKLIST */}
            <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 space-y-3">
              <h3 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
                What to expect during your appointment:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>SMS alert 15 minutes prior to tech arrival</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>On-site 20-minute screen / battery replacement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Square contactless terminal payment on-site</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100-Day parts and labor performance guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SPOKANE STORE LOCATION & REVIEWS (1 COL) */}
        <div className="space-y-6">
          <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-750 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Spokane Repair Hub</h3>
                <p className="text-[11px] text-slate-400 font-mono">Display & Cell Pros LLC</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Physical Store Address:</strong>
                  <span>7302 N Division St, Spokane, WA 99208</span>
                  <a
                    href="https://maps.google.com/?q=7302+N+Division+St+Spokane+WA+99208"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline block mt-1 font-mono text-[11px]"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Dispatch Line:</strong>
                  <a href="tel:5095550199" className="text-emerald-400 hover:underline font-mono text-sm font-bold">
                    (509) 555-0199
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="tel:5095550199"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                Call Technician Direct
              </a>
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-white font-bold text-xs ml-1">4.9 / 5.0</span>
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "Booking an appointment was seamless. The mobile driveway van arrived right on schedule at my home in North Spokane!"
            </p>
            <span className="text-[11px] text-slate-400 font-mono block">
              — Sarah K., Spokane Resident
            </span>
          </div>
        </div>

      </div>

      {/* FOOTER NAVIGATION BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-white font-bold text-sm">Need to make adjustments to your appointment?</h4>
          <p className="text-slate-400 text-xs">Contact our Spokane repair dispatch desk anytime.</p>
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
              Book Another Service
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
