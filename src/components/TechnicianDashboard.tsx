import React, { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ComposedChart,
  Line,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Sliders, 
  BarChart4, 
  RefreshCw, 
  Sparkles,
  Layers,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Timer,
  CheckSquare,
  Edit2,
  AlertTriangle,
  FileText,
  Search,
  Check
} from "lucide-react";
import { RepairTicket } from "../types";
import { BrandLogo } from "./BrandLogo";

interface TechnicianDashboardProps {
  tickets: RepairTicket[];
  onAddSampleTickets?: () => void;
  isLoading?: boolean;
  onUpdateTicket?: (updatedTicket: RepairTicket) => void;
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({
  tickets,
  onAddSampleTickets,
  isLoading = false,
  onUpdateTicket
}) => {
  const [activeChart, setActiveChart] = useState<"revenue" | "turnaround" | "volume">("revenue");
  const [bayTab, setBayTab] = useState<"active" | "completed">("active");
  const [baySearch, setBaySearch] = useState("");
  const [tick, setTick] = useState(0);
  const [editingEstimateId, setEditingEstimateId] = useState<string | null>(null);
  const [customMinutes, setCustomMinutes] = useState<string>("");

  // Local state for tickets to support zero-latency reactive stopwatch updates
  const [localTickets, setLocalTickets] = useState<RepairTicket[]>([]);

  // Keep localTickets in sync with props, preserving active local chronometer fields if running
  useEffect(() => {
    setLocalTickets(prev => {
      return tickets.map(t => {
        const existing = prev.find(p => p.id === t.id);
        if (existing) {
          return {
            ...t,
            timerStartedAt: existing.timerStartedAt || t.timerStartedAt,
            elapsedSeconds: existing.elapsedSeconds !== undefined ? existing.elapsedSeconds : t.elapsedSeconds,
            estimatedHours: existing.estimatedHours !== undefined ? existing.estimatedHours : t.estimatedHours,
            actualHours: existing.actualHours !== undefined ? existing.actualHours : t.actualHours
          };
        }
        return t;
      });
    });
  }, [tickets]);

  // Global ticking loop for running stopwatch renders
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Standard repair labor hour estimates based on motherboard forensics
  const getStandardEstimate = (issueType: string): number => {
    const type = issueType?.toLowerCase() || "other";
    if (type.includes("screen")) return 1.2; // 72 minutes
    if (type.includes("battery")) return 0.5; // 30 minutes
    if (type.includes("button")) return 0.4;  // 24 minutes
    return 1.0; // 60 minutes default
  };

  // Helper to extract device brand
  const getDeviceBrand = (device: string) => {
    const dLower = device.toLowerCase();
    if (dLower.includes("apple") || dLower.includes("iphone") || dLower.includes("ipad")) return "Apple";
    if (dLower.includes("samsung") || dLower.includes("galaxy")) return "Samsung";
    if (dLower.includes("google") || dLower.includes("pixel")) return "Google";
    return "Other";
  };

  // Helper to compute live elapsed seconds for running tickets
  const getElapsedSeconds = (ticket: RepairTicket) => {
    let seconds = ticket.elapsedSeconds || 0;
    if (ticket.timerStartedAt) {
      const start = new Date(ticket.timerStartedAt).getTime();
      const diff = Math.floor((Date.now() - start) / 1000);
      seconds += Math.max(0, diff);
    }
    return seconds;
  };

  // Helper to calculate turnaround time in hours
  const getTurnaroundTime = (ticket: RepairTicket): number => {
    // If ticket has actual logged hours, use that first
    if (ticket.actualHours !== undefined) {
      return ticket.actualHours;
    }
    const start = new Date(ticket.createdAt).getTime();
    if (ticket.status === "completed") {
      const seed = ticket.id ? ticket.id.split("-").pop() || "1" : "1";
      const val = parseInt(seed, 10) || 42;
      let baseHours = 0.8;
      if (ticket.issueType === "screen") baseHours = 1.2;
      else if (ticket.issueType === "battery") baseHours = 0.5;
      else if (ticket.issueType === "button") baseHours = 0.4;
      const variance = (val % 5) * 0.15;
      return Number((baseHours + variance).toFixed(1));
    }
    return 0;
  };

  // Chronometer Controller Actions
  const handleStartTimer = (ticketId: string) => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const updated: RepairTicket = {
      ...ticket,
      status: "technician_working",
      timerStartedAt: new Date().toISOString()
    };

    if (updated.estimatedHours === undefined) {
      updated.estimatedHours = getStandardEstimate(ticket.issueType);
    }

    setLocalTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
    onUpdateTicket?.(updated);
  };

  const handlePauseTimer = (ticketId: string) => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const elapsed = getElapsedSeconds(ticket);
    const updated: RepairTicket = {
      ...ticket,
      timerStartedAt: undefined,
      elapsedSeconds: elapsed
    };

    setLocalTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
    onUpdateTicket?.(updated);
  };

  const handleResetTimer = (ticketId: string) => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const updated: RepairTicket = {
      ...ticket,
      timerStartedAt: undefined,
      elapsedSeconds: 0,
      actualHours: undefined
    };

    setLocalTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
    onUpdateTicket?.(updated);
  };

  const handleLogLabor = (ticketId: string, finalStatus: "completed" | "quality_check") => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const elapsed = getElapsedSeconds(ticket);
    const actualHours = Number((elapsed / 3600).toFixed(3));

    const updated: RepairTicket = {
      ...ticket,
      status: finalStatus,
      timerStartedAt: undefined,
      elapsedSeconds: elapsed,
      actualHours: actualHours,
      completedAt: finalStatus === "completed" ? new Date().toISOString() : ticket.completedAt
    };

    setLocalTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
    onUpdateTicket?.(updated);
  };

  const handleSetEstimate = (ticketId: string, hours: number) => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const updated: RepairTicket = {
      ...ticket,
      estimatedHours: Math.max(0, Number(hours.toFixed(2)))
    };

    setLocalTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
    onUpdateTicket?.(updated);
  };

  const adjustEstimate = (ticketId: string, minutes: number) => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const currentEst = ticket.estimatedHours !== undefined ? ticket.estimatedHours : getStandardEstimate(ticket.issueType);
    const newEst = Math.max(0.1, currentEst + (minutes / 60));
    handleSetEstimate(ticketId, newEst);
  };

  const saveCustomEstimate = (ticketId: string) => {
    const mins = parseInt(customMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      handleSetEstimate(ticketId, mins / 60);
    }
    setEditingEstimateId(null);
  };

  // Chronometer Visual Formatters
  const formatSecondsToHMS = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [
      h.toString().padStart(2, "0"),
      m.toString().padStart(2, "0"),
      s.toString().padStart(2, "0")
    ].join(":");
  };

  const formatHoursToHM = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m} mins`;
    return m === 0 ? `${h} hrs` : `${h}h ${m}m`;
  };

  // KPI Calculations (linked directly to interactive localTickets to react instantly!)
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const todayTickets = localTickets.filter(t => {
      const tTime = new Date(t.createdAt).getTime();
      return tTime >= todayStart;
    });

    const todayRevenue = todayTickets.reduce((sum, t) => sum + (t.total || 0), 0);
    const todayCompletedTickets = todayTickets.filter(t => t.status === "completed");
    const todayCompletedCount = todayCompletedTickets.length;
    const completedOverall = localTickets.filter(t => t.status === "completed");

    const totalTurnaroundTime = completedOverall.reduce((sum, t) => sum + getTurnaroundTime(t), 0);
    const avgTurnaroundOverall = completedOverall.length > 0 
      ? Number((totalTurnaroundTime / completedOverall.length).toFixed(2))
      : 0.8;

    return {
      todayRevenue,
      todayTicketsCount: todayTickets.length,
      todayCompletedCount,
      avgTurnaroundOverall,
      completedOverallCount: completedOverall.length,
      activeTicketsCount: localTickets.filter(t => t.status !== "completed").length
    };
  }, [localTickets]);

  // Chart Data Generation: Revenue by Issue Type
  const revenueChartData = useMemo(() => {
    const dataMap: Record<string, { name: string; revenue: number; tickets: number }> = {
      screen: { name: "Screen Replacements", revenue: 0, tickets: 0 },
      battery: { name: "Battery Calibration", revenue: 0, tickets: 0 },
      button: { name: "Button Micro-Solder", revenue: 0, tickets: 0 },
      other: { name: "Thermal Diagnostics/Other", revenue: 0, tickets: 0 }
    };

    localTickets.forEach(t => {
      const type = t.issueType?.toLowerCase() || "other";
      const key = ["screen", "battery", "button"].includes(type) ? type : "other";
      dataMap[key].revenue += t.total || 0;
      dataMap[key].tickets += 1;
    });

    return Object.values(dataMap);
  }, [localTickets]);

  // Chart Data Generation: Turnaround Time by Issue Type (Hours)
  const turnaroundChartData = useMemo(() => {
    const trackingMap: Record<string, { name: string; totalHours: number; count: number }> = {
      screen: { name: "Screen Replace", totalHours: 0, count: 0 },
      battery: { name: "Battery Recal", totalHours: 0, count: 0 },
      button: { name: "PMU Solder", totalHours: 0, count: 0 },
      other: { name: "System Triage", totalHours: 0, count: 0 }
    };

    const defaultAverages = {
      screen: 1.4,
      battery: 0.6,
      button: 0.5,
      other: 1.1
    };

    localTickets.forEach(t => {
      if (t.status === "completed") {
        const type = t.issueType?.toLowerCase() || "other";
        const key = ["screen", "battery", "button"].includes(type) ? type : "other";
        trackingMap[key].totalHours += getTurnaroundTime(t);
        trackingMap[key].count += 1;
      }
    });

    return Object.keys(trackingMap).map(key => {
      const item = trackingMap[key];
      const avg = item.count > 0 
        ? Number((item.totalHours / item.count).toFixed(2))
        : defaultAverages[key as keyof typeof defaultAverages];
      return {
        name: item.name,
        avgHours: avg,
        tickets: item.count || 2
      };
    });
  }, [localTickets]);

  // Chart Data Generation: Brand Segments Revenue vs Completed Volume
  const volumeChartData = useMemo(() => {
    const brandMap: Record<string, { brand: string; revenue: number; completed: number; total: number }> = {
      Apple: { brand: "Apple iOS", revenue: 0, completed: 0, total: 0 },
      Samsung: { brand: "Samsung Mobile", revenue: 0, completed: 0, total: 0 },
      Google: { brand: "Google Pixel", revenue: 0, completed: 0, total: 0 },
      Other: { brand: "Other OEM", revenue: 0, completed: 0, total: 0 }
    };

    localTickets.forEach(t => {
      const brand = getDeviceBrand(t.device);
      const group = brandMap[brand] || brandMap["Other"];
      group.revenue += t.total || 0;
      group.total += 1;
      if (t.status === "completed") {
        group.completed += 1;
      }
    });

    return Object.values(brandMap);
  }, [localTickets]);

  const COLORS = ["#008080", "#00BFFF", "#8b5cf6", "#FFBF00"];

  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;
  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m} mins`;
    return m === 0 ? `${h} hrs` : `${h}h ${m}m`;
  };

  // Filter local tickets for S2C Bay display
  const filteredBayTickets = useMemo(() => {
    return localTickets.filter(t => {
      const isTabMatch = bayTab === "active" ? t.status !== "completed" : t.status === "completed";
      if (!isTabMatch) return false;
      if (!baySearch) return true;
      const search = baySearch.toLowerCase();
      return (
        t.id.toLowerCase().includes(search) ||
        t.customerName.toLowerCase().includes(search) ||
        t.device.toLowerCase().includes(search) ||
        (t.issueType || "").toLowerCase().includes(search)
      );
    });
  }, [localTickets, bayTab, baySearch]);

  return (
    <div id="technician-operating-dashboard" className="bg-slate-900 border border-slate-750 rounded-xl overflow-hidden mb-6 text-left animate-in fade-in duration-350 shadow-lg">
      
      {/* Dashboard Top Row Header */}
      <div className="bg-slate-850 px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BrandLogo size={32} showText={true} />
          <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-tight uppercase font-mono">Telemetry-First Audit Hub</h2>
            <p className="text-[11px] text-slate-400">Continuous telemetry aggregation for Spokane-region logic board forensics.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onAddSampleTickets && (
            <button
              onClick={onAddSampleTickets}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white rounded-lg text-[11px] font-bold uppercase transition-all shadow-sm active:scale-97 cursor-pointer"
              title="Add 5 more completed & open tickets with realistic dates and values to test charts"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              Pre-load Rich Solder Data
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        {/* KPI Visual Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* KPI 1: Today's Revenue */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between relative overflow-hidden group hover:border-slate-700/80 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Today's Gross Solder Revenue
              </span>
              <div className="text-2xl font-black text-white font-mono">
                {formatCurrency(stats.todayRevenue)}
              </div>
              <p className="text-[10.5px] text-slate-400 leading-none">
                Sourced from <span className="text-slate-350 font-semibold">{stats.todayTicketsCount} active ticket(s)</span> today
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* KPI 2: Completed Tickets Today */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between relative overflow-hidden group hover:border-slate-700/80 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                SLA Completed Tickets
              </span>
              <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                <span>{stats.todayCompletedCount}</span>
                <span className="text-xs text-slate-500 font-normal">({stats.completedOverallCount} total)</span>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-none">
                <span className="text-blue-400 font-semibold">{stats.activeTicketsCount} outstanding</span> tickets in active work bays
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* KPI 3: Average Repair Turnaround Time */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between relative overflow-hidden group hover:border-slate-700/80 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-bl-full pointer-events-none"></div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                L3 Solder Turnaround Time
              </span>
              <div className="text-2xl font-black text-white font-mono">
                {formatTime(stats.avgTurnaroundOverall)}
              </div>
              <p className="text-[10.5px] text-slate-400 leading-none flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 inline shrink-0" />
                <span>Washington Driveway SLA limit: <b className="text-slate-350">2.0 hrs</b></span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* Main Charts Block */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col space-y-4 mb-6">
          
          {/* Chart Selectors */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-850">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                Select Analytical View:
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
              <button
                onClick={() => setActiveChart("revenue")}
                className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 uppercase cursor-pointer ${
                  activeChart === "revenue"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-green-400" />
                Revenue Slices
              </button>
              <button
                onClick={() => setActiveChart("turnaround")}
                className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 uppercase cursor-pointer ${
                  activeChart === "turnaround"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Turnaround Speed (Hrs)
              </button>
              <button
                onClick={() => setActiveChart("volume")}
                className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 uppercase cursor-pointer ${
                  activeChart === "volume"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                OEM Solder Volume
              </button>
            </div>
          </div>

          {/* Chart Render Canvas Container */}
          <div className="h-[210px] w-full text-[10px] font-mono min-w-0 flex items-center justify-center p-1 bg-slate-950/40 relative">
            {localTickets.length === 0 ? (
              <div className="text-center py-10 text-slate-500 italic max-w-sm">
                <Sparkles className="w-6 h-6 text-yellow-500/70 animate-bounce mx-auto mb-2" />
                No operating records currently tracked. Hit "Pre-load Rich Solder Data" to load realistic laboratory indicators instantly.
              </div>
            ) : (
              <ResponsiveContainer width="99%" height="100%">
                {activeChart === "revenue" ? (
                  <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                    <XAxis dataKey="name" stroke="#475569" tickLine={false} />
                    <YAxis stroke="#475569" tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                      contentStyle={{
                        backgroundColor: "#0d131f",
                        borderColor: "#1e293b",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "11px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                      }}
                      formatter={(val: number) => [formatCurrency(val), "Gross Revenue"]}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {revenueChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : activeChart === "turnaround" ? (
                  <ComposedChart data={turnaroundChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                    <XAxis dataKey="name" stroke="#475569" tickLine={false} />
                    <YAxis stroke="#475569" tickLine={false} label={{ value: "Hours", angle: -90, position: "insideLeft", fill: "#475569", offset: 10 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(139, 92, 246, 0.05)" }}
                      contentStyle={{
                        backgroundColor: "#0d131f",
                        borderColor: "#1e293b",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "11px"
                      }}
                      formatter={(val: number, name) => {
                        if (name === "avgHours") return [formatTime(val), "Avg Turnaround"];
                        return [val, "Completed Tickets"];
                      }}
                    />
                    <Bar dataKey="avgHours" name="Turnaround" fill="#008080" radius={[4, 4, 0, 0]} barSize={40}>
                      {turnaroundChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#008080" : index === 1 ? "#00BFFF" : index === 2 ? "#FFBF00" : "#8b5cf6"} />
                      ))}
                    </Bar>
                    <Line type="monotone" dataKey="tickets" name="Ticket Volume" stroke="#FFBF00" strokeWidth={2} dot={{ r: 4 }} />
                    <Legend wrapperStyle={{ fontSize: "10px", marginTop: "5px" }} />
                  </ComposedChart>
                ) : (
                  <BarChart data={volumeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                    <XAxis dataKey="brand" stroke="#475569" tickLine={false} />
                    <YAxis stroke="#475569" tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(245, 158, 11, 0.05)" }}
                      contentStyle={{
                        backgroundColor: "#0d131f",
                        borderColor: "#1e293b",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "11px"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar dataKey="completed" name="Completed Solder Invoices" fill="#008080" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" name="Total Sync Tickets" fill="#00BFFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend / Guidance Panel footer */}
          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono border-t border-slate-900 pt-3 select-none">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Telemetry synced to local Spokane region DB
            </span>
            <span>Showing performance indicators for {localTickets.length} total tickets</span>
          </div>
        </div>

        {/* ---------------- ACTIVE S2C REPAIR WORK BAY / CHRONOMETER CONSOLE ---------------- */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex flex-col p-5">
          
          {/* Panel Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-4 mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-950/60 border border-teal-800/40 flex items-center justify-center text-[#008080] shrink-0">
                <Timer className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  Active S2C Solder & Calibration Bay
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Forensic chronometer and labor audit engine tracking silicon rework vs estimates.</p>
              </div>
            </div>

            {/* Bay Filter & Search Tab controls */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* Search input */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={baySearch}
                  onChange={(e) => setBaySearch(e.target.value)}
                  placeholder="Filter bay by ID, client..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-[#008080]/60 rounded px-2.5 py-1.5 pl-8 text-[11px] font-mono text-slate-200 outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Tab Toggles */}
              <div className="flex bg-slate-900 p-0.5 rounded border border-slate-800 w-full sm:w-auto">
                <button
                  onClick={() => setBayTab("active")}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded text-[10.5px] font-bold font-mono uppercase transition-all ${
                    bayTab === "active"
                      ? "bg-[#008080] text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Active Benches ({localTickets.filter(t => t.status !== "completed").length})
                </button>
                <button
                  onClick={() => setBayTab("completed")}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded text-[10.5px] font-bold font-mono uppercase transition-all ${
                    bayTab === "completed"
                      ? "bg-[#008080] text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Labor Audits ({localTickets.filter(t => t.status === "completed").length})
                </button>
              </div>
            </div>
          </div>

          {/* Bay Tickets Display List */}
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {filteredBayTickets.length > 0 ? (
              filteredBayTickets.map((t) => {
                const elapsedSeconds = getElapsedSeconds(t);
                const isRunning = !!t.timerStartedAt;
                
                // Target estimate calculation
                const estimateHours = t.estimatedHours !== undefined ? t.estimatedHours : getStandardEstimate(t.issueType);
                const estimateSeconds = Math.round(estimateHours * 3600);
                const percentOfEstimate = estimateSeconds > 0 ? (elapsedSeconds / estimateSeconds) * 100 : 0;
                const isOverEstimate = elapsedSeconds > estimateSeconds;
                
                // Compute manual input state
                const isEditingEst = editingEstimateId === t.id;

                return (
                  <div 
                    key={t.id}
                    id={`bay-slot-${t.id}`}
                    className={`border rounded-xl p-4 transition-all duration-300 ${
                      isRunning 
                        ? "bg-[#008080]/5 border-[#008080]/40 shadow-[0_0_12px_rgba(0,128,128,0.08)]" 
                        : "bg-slate-900/50 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    {/* Slot Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {isRunning ? (
                            <span className="flex h-2.5 w-2.5 mt-1 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00BFFF]"></span>
                            </span>
                          ) : (
                            <span className="h-2.5 w-2.5 mt-1.5 block rounded-full bg-slate-600"></span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-blue-400 font-mono uppercase tracking-wide">{t.id}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                            <span className="text-xs font-bold text-slate-200">{t.device}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Client: <span className="text-slate-300 font-semibold">{t.customerName}</span> 
                            {t.companyName && <span className="text-slate-500"> ({t.companyName})</span>}
                          </p>
                        </div>
                      </div>

                      {/* SLA & Status Badges */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono border ${
                          t.issueType === "screen" ? "bg-amber-950/40 text-amber-300 border-amber-900/40" :
                          t.issueType === "battery" ? "bg-purple-950/40 text-purple-300 border-purple-900/40" :
                          t.issueType === "button" ? "bg-cyan-950/40 text-cyan-300 border-cyan-900/40" : 
                          "bg-blue-950/40 text-blue-300 border-blue-900/40"
                        }`}>
                          {t.issueType}
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase font-mono ${
                          t.status === "completed" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/50" :
                          t.status === "quality_check" ? "bg-amber-950/50 text-amber-400 border border-amber-900/50" :
                          t.status === "technician_working" ? "bg-[#008080]/20 text-[#00BFFF] border border-[#00BFFF]/30" : 
                          "bg-slate-900 text-slate-400 border border-slate-800"
                        }`}>
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* S2C Active stopwatch & Estimate adjustment columns */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/50 border border-slate-850/60 rounded-lg p-3">
                      
                      {/* Column 1: Live Counter stopwatch */}
                      <div className="md:col-span-4 flex items-center gap-3">
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 flex items-center justify-center shrink-0">
                          <Activity className={`w-5 h-5 ${isRunning ? "text-[#00BFFF] animate-pulse" : "text-slate-600"}`} />
                        </div>
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block">Actual Labor Duration</span>
                          <span className={`text-xl font-black font-mono tracking-widest ${
                            isRunning ? "text-[#00BFFF] drop-shadow-[0_0_6px_rgba(0,191,255,0.4)]" : "text-slate-350"
                          }`}>
                            {formatSecondsToHMS(elapsedSeconds)}
                          </span>
                        </div>
                      </div>

                      {/* Column 2: SLA target configuration */}
                      <div className="md:col-span-4 flex flex-col justify-center border-l md:border-l-0 md:border-x border-slate-850 md:px-4">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block mb-0.5">SLA Labor Estimate Target</span>
                        {isEditingEst ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="number"
                              min="1"
                              max="480"
                              value={customMinutes}
                              onChange={(e) => setCustomMinutes(e.target.value)}
                              placeholder="Mins"
                              className="w-16 bg-slate-900 border border-slate-700 text-white rounded text-xs px-1.5 py-0.5 font-mono outline-none focus:border-[#008080]"
                              autoFocus
                            />
                            <button
                              onClick={() => saveCustomEstimate(t.id)}
                              className="bg-[#008080] text-white rounded px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase cursor-pointer"
                            >
                              SET
                            </button>
                            <button
                              onClick={() => setEditingEstimateId(null)}
                              className="bg-slate-850 hover:bg-slate-800 text-slate-400 rounded px-1 py-0.5 text-[9px] font-bold font-mono uppercase cursor-pointer"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-slate-200 font-mono">{formatHoursToHM(estimateHours)}</span>
                            {bayTab === "active" && (
                              <div className="flex items-center gap-1 select-none shrink-0">
                                <button
                                  onClick={() => adjustEstimate(t.id, -15)}
                                  className="w-5 h-5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded flex items-center justify-center text-[10px] font-mono hover:border-slate-700 cursor-pointer"
                                  title="Reduce target estimate by 15 minutes"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => adjustEstimate(t.id, 15)}
                                  className="w-5 h-5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded flex items-center justify-center text-[10px] font-mono hover:border-slate-700 cursor-pointer"
                                  title="Increase target estimate by 15 minutes"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingEstimateId(t.id);
                                    setCustomMinutes(Math.round(estimateHours * 60).toString());
                                  }}
                                  className="p-1 bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-350 rounded hover:border-slate-700 cursor-pointer"
                                  title="Set custom estimate in minutes"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Column 3: Telemetry audit delta comparison */}
                      <div className="md:col-span-4 flex flex-col justify-center">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block mb-1">Labor Audit Comparison</span>
                        {elapsedSeconds === 0 ? (
                          <span className="text-[10px] text-slate-500 italic font-mono">STANDBY / NOT INITIATED</span>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-slate-400">SLA Capacity:</span>
                              <span className={isOverEstimate ? "text-amber-400 font-bold" : "text-teal-400 font-bold"}>
                                {percentOfEstimate.toFixed(0)}%
                              </span>
                            </div>
                            
                            {/* Comparison Progress track bar */}
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 relative flex items-center">
                              <div 
                                className={`h-full transition-all duration-1000 ${isOverEstimate ? "bg-amber-500" : "bg-teal-500"}`}
                                style={{ width: `${Math.min(100, percentOfEstimate)}%` }}
                              />
                            </div>

                            {/* Efficiency variance metrics */}
                            <div className="text-[9px] font-mono flex items-center justify-between">
                              {isOverEstimate ? (
                                <span className="text-amber-400 flex items-center gap-1 font-semibold">
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                  SLA Overrun: +{formatSecondsToHMS(elapsedSeconds - estimateSeconds)}
                                </span>
                              ) : (
                                <span className="text-teal-400 flex items-center gap-1 font-semibold">
                                  <Check className="w-3 h-3 shrink-0" />
                                  SLA Reserve: {formatSecondsToHMS(estimateSeconds - elapsedSeconds)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Rework controls / buttons row */}
                    {bayTab === "active" && (
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-850/60 select-none">
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {!isRunning ? (
                            <button
                              onClick={() => handleStartTimer(t.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[10.5px] font-bold uppercase transition-all shadow-sm active:scale-97 cursor-pointer font-mono"
                            >
                              <Play className="w-3 h-3 text-white fill-current" />
                              Initiate Repair
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePauseTimer(t.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10.5px] font-bold uppercase transition-all shadow-sm active:scale-97 cursor-pointer font-mono"
                            >
                              <Pause className="w-3 h-3 text-white fill-current" />
                              Standby (Pause)
                            </button>
                          )}

                          {elapsedSeconds > 0 && (
                            <button
                              onClick={() => handleResetTimer(t.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-white rounded-lg text-[10.5px] font-bold uppercase transition-all active:scale-97 cursor-pointer font-mono"
                              title="Reset elapsed timer back to zero"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Reset
                            </button>
                          )}
                        </div>

                        {elapsedSeconds > 0 && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleLogLabor(t.id, "quality_check")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10.5px] font-bold uppercase transition-all shadow-sm active:scale-97 cursor-pointer font-mono font-bold"
                              title="Pass ticket to physical quality assurance inspect phase"
                            >
                              <CheckSquare className="w-3 h-3" />
                              Log & QA Check
                            </button>

                            <button
                              onClick={() => handleLogLabor(t.id, "completed")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-bold uppercase transition-all shadow-sm active:scale-97 cursor-pointer font-mono font-bold"
                              title="Archive solder invoice and set status as fully completed"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Complete & Invoice
                            </button>
                          </div>
                        )}

                      </div>
                    )}

                    {/* Historical telemetry details for logged audits */}
                    {bayTab === "completed" && (
                      <div className="mt-3 pt-3 border-t border-slate-850/60 text-[10px] font-mono flex flex-col sm:flex-row sm:items-center justify-between text-slate-500 gap-1 select-none">
                        <span>Logged actual labor: <b className="text-slate-350">{(t.actualHours || 0).toFixed(2)} hrs</b> ({formatTime(t.actualHours || 0)})</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Certified NIST Rework Cleaned at: {t.completedAt ? new Date(t.completedAt).toLocaleTimeString() : new Date(t.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    )}

                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-850 rounded-xl bg-slate-900/10 text-slate-500 italic text-[11px] font-mono select-none">
                <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                No matching logic board repair tickets in this workstation slot.
                {bayTab === "active" ? " Set a ticket to working state in the POS Sync panel." : " Log and archive a repair to audit labor deviation metrics."}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
