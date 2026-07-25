import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Plus,
  X,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Wrench,
  DollarSign
} from "lucide-react";

export interface SquareBooking {
  id: string;
  startAt: string;
  endAt?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceName: string;
  deviceModel?: string;
  status: "ACCEPTED" | "PENDING" | "COMPLETED" | "CANCELLED" | string;
  locationName?: string;
  technicianName?: string;
  price?: number;
  note?: string;
}

interface SquareMiniCalendarProps {
  onOpenAppointmentsModal?: () => void;
  compact?: boolean;
}

export function SquareMiniCalendar({ onOpenAppointmentsModal, compact = false }: SquareMiniCalendarProps) {
  const [bookings, setBookings] = useState<SquareBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceInfo, setSourceInfo] = useState<string>("Square API");
  const [isSimulated, setIsSimulated] = useState<boolean>(true);

  // Date selection state
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<SquareBooking | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // New booking form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formService, setFormService] = useState("iPhone 14 Pro Max Screen Replacement");
  const [formDevice, setFormDevice] = useState("iPhone 14 Pro Max");
  const [formTimeOffset, setFormTimeOffset] = useState("tomorrow_morning");
  const [formNote, setFormNote] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState<string | null>(null);

  // Fetch bookings from Square API endpoint
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/square/bookings");
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: Failed to load Square appointments`);
      }
      const data = await res.json();
      if (data.bookings && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
        setSourceInfo(data.source || "Square API");
        setIsSimulated(data.simulated ?? true);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.warn("Error fetching Square bookings:", err);
      setError("Unable to sync Square calendar. Showing local cached bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Calendar math helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Helper to check if two dates are on the same calendar day
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Get bookings for a specific day
  const getBookingsForDay = (dayNumber: number) => {
    const targetDate = new Date(year, month, dayNumber);
    return bookings.filter(b => {
      const bDate = new Date(b.startAt);
      return isSameDay(bDate, targetDate);
    });
  };

  // Bookings for selected date
  const selectedDateBookings = bookings.filter(b => {
    const bDate = new Date(b.startAt);
    return isSameDay(bDate, selectedDate);
  });

  // Filtered list of all bookings based on status
  const filteredBookings = bookings.filter(b => {
    if (statusFilter === "ALL") return true;
    return b.status?.toUpperCase() === statusFilter.toUpperCase();
  });

  // Handle new appointment submission
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBooking(true);
    setBookingSuccessMessage(null);

    // Calculate startAt ISO based on time offset selection
    const now = new Date();
    let targetDate = new Date();
    if (formTimeOffset === "today_afternoon") {
      targetDate.setHours(15, 30, 0, 0);
    } else if (formTimeOffset === "tomorrow_morning") {
      targetDate.setDate(now.getDate() + 1);
      targetDate.setHours(10, 0, 0, 0);
    } else if (formTimeOffset === "tomorrow_afternoon") {
      targetDate.setDate(now.getDate() + 1);
      targetDate.setHours(14, 0, 0, 0);
    } else {
      targetDate.setDate(now.getDate() + 2);
      targetDate.setHours(11, 0, 0, 0);
    }

    try {
      const res = await fetch("/api/square/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formName || "Walk-In Client",
          customerEmail: formEmail || "client@spokanerepair.com",
          customerPhone: formPhone || "(509) 555-0199",
          serviceName: formService,
          deviceModel: formDevice,
          startAt: targetDate.toISOString(),
          note: formNote
        })
      });

      const data = await res.json();
      if (data.booking) {
        setBookings(prev => [data.booking, ...prev]);
        setBookingSuccessMessage("Square Appointment scheduled successfully!");
        setSelectedDate(targetDate);
        setCurrentMonth(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
        setTimeout(() => {
          setShowCreateModal(false);
          setBookingSuccessMessage(null);
          setFormName("");
          setFormEmail("");
          setFormPhone("");
          setFormNote("");
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to create appointment:", err);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const formatTimeRange = (startIso: string, endIso?: string) => {
    const start = new Date(startIso);
    const startTimeStr = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (endIso) {
      const end = new Date(endIso);
      const endTimeStr = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `${startTimeStr} - ${endTimeStr}`;
    }
    return startTimeStr;
  };

  const formatDateLabel = (d: Date) => {
    const today = new Date();
    if (isSameDay(d, today)) return "Today";
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(d, tomorrow)) return "Tomorrow";
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl flex flex-col space-y-5">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-700/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Square Appointments Calendar
              </h3>
              <span className={`px-2 py-0.5 text-[9px] font-extrabold font-mono rounded tracking-wider uppercase border ${
                isSimulated
                  ? "bg-amber-950/60 text-amber-300 border-amber-800/40"
                  : "bg-emerald-950/60 text-emerald-300 border-emerald-800/40"
              }`}>
                {isSimulated ? "Square Sandbox" : "Square Live API"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time technician scheduling calendar synced with Square Bookings engine.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="p-2 bg-slate-900 hover:bg-slate-850 active:bg-slate-950 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            title="Refresh Square API appointments"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-lg shadow border border-blue-500/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Repair</span>
          </button>

          {onOpenAppointmentsModal && (
            <button
              onClick={onOpenAppointmentsModal}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold font-mono rounded-lg border border-slate-600 flex items-center gap-1.5 transition-all"
              title="Launch Square Widget Popup"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden md:inline">Widget</span>
            </button>
          )}
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-amber-950/40 border border-amber-800/50 p-3 rounded-lg text-xs text-amber-300 font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT: CALENDAR GRID & APPOINTMENTS FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: MINI CALENDAR GRID */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-750 rounded-xl p-4 flex flex-col space-y-4 shadow-inner">
          {/* MONTH NAVIGATION */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold font-mono text-white tracking-wider uppercase">
              {monthNames[month]} {year}
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={handleToday}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold rounded border border-slate-700 transition-colors mr-1"
              >
                Today
              </button>
              <button
                onClick={handlePrevMonth}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DAY NAMES HEADER */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-extrabold text-slate-400">
            <span>SU</span>
            <span>MO</span>
            <span>TU</span>
            <span>WE</span>
            <span>TH</span>
            <span>FR</span>
            <span>SA</span>
          </div>

          {/* DAYS GRID */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots before first day of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 rounded bg-slate-950/20" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const isToday = isSameDay(dateObj, new Date());
              const isSelected = isSameDay(dateObj, selectedDate);
              const dayBookings = getBookingsForDay(dayNum);
              const hasBookings = dayBookings.length > 0;

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(dateObj)}
                  className={`h-9 rounded-lg flex flex-col items-center justify-center relative font-mono text-xs transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold ring-2 ring-blue-400 shadow-md scale-105"
                      : isToday
                      ? "bg-blue-950/60 text-blue-300 font-extrabold border border-blue-500/50"
                      : hasBookings
                      ? "bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 border border-slate-700"
                      : "bg-slate-950/50 text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                  }`}
                >
                  <span>{dayNum}</span>

                  {/* Booking indicator dots */}
                  {hasBookings && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayBookings.slice(0, 3).map((b, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected
                              ? "bg-white"
                              : b.status === "PENDING"
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* LEGEND / STATUS SUMMARY */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Accepted ({bookings.filter(b => b.status === "ACCEPTED").length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Pending ({bookings.filter(b => b.status === "PENDING").length})</span>
            </div>
            <div className="text-slate-500 font-bold">
              Total: {bookings.length}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: APPOINTMENTS FEED */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* FEED HEADER & FILTER BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 p-3 rounded-lg border border-slate-750">
            <div>
              <div className="text-[10px] font-mono text-blue-400 uppercase font-extrabold tracking-wider">
                Schedule View
              </div>
              <h4 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                <span>Appointments for {formatDateLabel(selectedDate)}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {selectedDateBookings.length} scheduled
                </span>
              </h4>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
              {["ALL", "ACCEPTED", "PENDING"].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded text-[9.5px] font-mono font-bold transition-colors ${
                    statusFilter === st
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* BOOKINGS LIST FOR SELECTED DATE */}
          <div className="flex-1 space-y-2.5 min-h-[220px] max-h-[380px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                <span className="text-xs font-mono">Fetching Square Bookings...</span>
              </div>
            ) : selectedDateBookings.length === 0 ? (
              <div className="bg-slate-900/60 border border-dashed border-slate-750 rounded-xl p-8 text-center space-y-3">
                <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
                <div>
                  <p className="text-xs font-mono text-slate-300 font-bold">
                    No Square appointments scheduled for {formatDateLabel(selectedDate)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Select a date with a colored indicator or schedule a new walk-in appointment.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-mono font-bold rounded-lg border border-slate-700 inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Schedule for {formatDateLabel(selectedDate)}
                </button>
              </div>
            ) : (
              selectedDateBookings
                .filter(b => statusFilter === "ALL" || b.status?.toUpperCase() === statusFilter)
                .map(b => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-750 hover:border-blue-500/50 rounded-xl p-3.5 transition-all cursor-pointer shadow-md group flex flex-col space-y-2.5"
                  >
                    {/* Top Row: Time & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
                        <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{formatTimeRange(b.startAt, b.endAt)}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-extrabold uppercase tracking-wider border ${
                        b.status === "ACCEPTED"
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                          : "bg-amber-950/80 text-amber-300 border-amber-800/60"
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    {/* Middle Row: Customer & Repair Service */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-b border-slate-800/80 py-2">
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{b.customerName}</span>
                        </h5>
                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{b.serviceName}</span>
                        </p>
                      </div>

                      <div className="text-right sm:shrink-0 font-mono">
                        {b.price && (
                          <div className="text-xs font-extrabold text-emerald-400">
                            ${b.price.toFixed(2)}
                          </div>
                        )}
                        {b.deviceModel && (
                          <span className="text-[9.5px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 inline-block mt-0.5">
                            {b.deviceModel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Location & Technician */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[180px]">{b.locationName || "Spokane Main Lab"}</span>
                      </div>
                      {b.technicianName && (
                        <div className="text-blue-400 font-semibold">
                          Tech: {b.technicianName}
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* ALL UPCOMING QUICK OVERVIEW BAR */}
          <div className="bg-slate-900/80 border border-slate-750 p-3 rounded-lg flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Total Upcoming Registered:</span>
            <span className="text-white font-bold">{filteredBookings.length} appointments</span>
          </div>
        </div>
      </div>

      {/* APPOINTMENT DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-850 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-slate-700/80 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase font-extrabold tracking-wider">
                  Square Booking Details
                </span>
                <h3 className="text-base font-bold text-white font-mono mt-0.5">
                  {selectedBooking.serviceName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-750 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Scheduled Time:</span>
                  <span className="font-bold text-white">
                    {new Date(selectedBooking.startAt).toLocaleString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    selectedBooking.status === "ACCEPTED" ? "bg-emerald-950 text-emerald-300" : "bg-amber-950 text-amber-300"
                  }`}>
                    {selectedBooking.status}
                  </span>
                </div>
                {selectedBooking.price && (
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Estimated Price:</span>
                    <span className="font-bold text-emerald-400">${selectedBooking.price.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-750 space-y-2">
                <div className="flex items-center gap-2 text-slate-200 font-bold">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>{selectedBooking.customerName}</span>
                </div>
                {selectedBooking.customerPhone && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedBooking.customerPhone}</span>
                  </div>
                )}
                {selectedBooking.customerEmail && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedBooking.customerEmail}</span>
                  </div>
                )}
              </div>

              {selectedBooking.note && (
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-750 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Technician Notes</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedBooking.note}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-mono text-xs font-bold rounded-xl transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW APPOINTMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-850 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-slate-700/80 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase font-extrabold tracking-wider">
                  Square Bookings Engine
                </span>
                <h3 className="text-base font-bold text-white font-mono mt-0.5">
                  Schedule Repair Appointment
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccessMessage ? (
              <div className="bg-emerald-950/60 border border-emerald-800 p-4 rounded-xl text-center space-y-2 font-mono">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-xs text-emerald-300 font-bold">{bookingSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateAppointment} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Jane Miller"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      placeholder="(509) 555-0192"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder="client@spokane.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Device Model</label>
                    <input
                      type="text"
                      value={formDevice}
                      onChange={e => setFormDevice(e.target.value)}
                      placeholder="iPhone 14 Pro Max"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Time Slot</label>
                    <select
                      value={formTimeOffset}
                      onChange={e => setFormTimeOffset(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="today_afternoon">Today @ 3:30 PM</option>
                      <option value="tomorrow_morning">Tomorrow @ 10:00 AM</option>
                      <option value="tomorrow_afternoon">Tomorrow @ 2:00 PM</option>
                      <option value="next_day">Day After @ 11:00 AM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Service Requested</label>
                  <input
                    type="text"
                    value={formService}
                    onChange={e => setFormService(e.target.value)}
                    placeholder="Screen Replacement & Glass Protection"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Internal Diagnostic Notes</label>
                  <textarea
                    value={formNote}
                    onChange={e => setFormNote(e.target.value)}
                    rows={2}
                    placeholder="e.g. Glass cracked upper left, touch digitizer responsive."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingBooking ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Confirm Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
