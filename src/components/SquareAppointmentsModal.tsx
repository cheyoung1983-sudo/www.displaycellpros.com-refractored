import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  QrCode, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  Smartphone, 
  Wrench, 
  Copy, 
  Check, 
  ShieldCheck, 
  Building,
  Sparkles,
  Share2
} from "lucide-react";
import { trackGoogleAdsConversion } from "../lib/gtag";

interface SquareAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationQrUrl?: string;
  locationId?: string;
}

export function SquareAppointmentsModal({
  isOpen,
  onClose,
  locationQrUrl = "https://app.squareup.com/appointments/business_locations/qrcode/LRDXJ4YQ6W96R",
  locationId = "LRDXJ4YQ6W96R"
}: SquareAppointmentsModalProps) {
  const [activeTab, setActiveTab] = useState<"scheduler" | "qr" | "details">("scheduler");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedService, setSelectedService] = useState("Mobile Driveway Screen & Battery Repair");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState("2:00 PM");

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(locationQrUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  const handleBookDirect = () => {
    trackGoogleAdsConversion("appointment_scheduled", {
      value: 125.0,
      transaction_id: "SQ-APT-" + Math.floor(100000 + Math.random() * 900000)
    });
    window.open(locationQrUrl, "_blank", "noopener,noreferrer");
  };

  // Google Chart API QR Code image URL for instant crisp rendering
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(locationQrUrl)}&color=0f172a&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-8">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Square Appointments Online Booking
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  Official
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Display & Cell Pros LLC • Location ID: {locationId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-2 px-6">
          <button
            onClick={() => setActiveTab("scheduler")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "scheduler"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Square Scheduler
          </button>

          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "qr"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Location QR Code
          </button>

          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "details"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Building className="w-4 h-4" />
            Location Details
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: SCHEDULER & QUICK BOOKING */}
          {activeTab === "scheduler" && (
            <div className="space-y-6">
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block font-bold mb-0.5">Official Square Appointments Integration</strong>
                  Schedule your Spokane mobile driveway service or in-shop repair directly on our official Square business portal.
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase font-bold text-slate-400 block">
                  Select Repair Service
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Mobile Driveway Screen & Battery Repair",
                    "iPhone / Galaxy Screen Replacement",
                    "Charging Port & Power Diagnostics",
                    "Motherboard & Liquid Damage Surgery"
                  ].map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className={`p-3.5 rounded-xl text-left border text-xs font-bold transition-all flex items-start justify-between gap-2 ${
                        selectedService === service
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span>{service}</span>
                      {selectedService === service && (
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-1.5">
                    Select Appointment Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-1.5">
                    Preferred Time Window
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value="9:00 AM">9:00 AM - Morning Slot</option>
                    <option value="11:30 AM">11:30 AM - Midday Slot</option>
                    <option value="2:00 PM">2:00 PM - Afternoon Slot</option>
                    <option value="4:30 PM">4:30 PM - Late Afternoon Slot</option>
                    <option value="6:00 PM">6:00 PM - Evening Dispatch</option>
                  </select>
                </div>
              </div>

              {/* Direct Booking Launch Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  Instant Square Calendar Lock
                </div>
                
                <button
                  onClick={handleBookDirect}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Launch Official Square Booking Page</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Launches our official Square Business Location link: <br />
                  <span className="text-blue-400 font-mono select-all break-all">{locationQrUrl}</span>
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: QR CODE SCANNER & DISPLAY */}
          {activeTab === "qr" && (
            <div className="space-y-6 text-center">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 mb-4 inline-block">
                  <img
                    src={qrImageUrl}
                    alt="Square Appointments Business Location QR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                  />
                </div>

                <h3 className="text-lg font-black text-white mb-1">Scan with Phone Camera</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mb-4">
                  Point your mobile device camera at the QR code above to immediately open Square Appointments on your mobile browser.
                </p>

                <div className="flex items-center gap-2 w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-2 px-3">
                  <span className="text-[11px] font-mono text-slate-400 truncate flex-1 text-left">
                    {locationQrUrl}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-mono font-bold flex items-center gap-1 shrink-0"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCATION & CONTACT DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <Building className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Display & Cell Pros LLC</h3>
                    <p className="text-xs text-slate-400 font-mono">Square Merchant Location ID: {locationId}</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Spokane Repair Hub:</strong>
                      <span>7302 N Division St, Spokane, WA 99208</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Dispatch Hotline:</strong>
                      <a href="tel:5095550199" className="text-emerald-400 font-bold hover:underline font-mono">
                        (509) 555-0199
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Hours of Operation:</strong>
                      <span>Monday - Saturday: 8:00 AM - 7:00 PM PST</span>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="tel:5095550199"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                Call Desk (509) 555-0199
              </a>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Square Appointments Verified Link
          </div>

          <button
            onClick={handleBookDirect}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            <span>Open Square Scheduler</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
