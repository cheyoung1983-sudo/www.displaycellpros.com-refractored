export interface RepairTicket {
  id: string;
  customerName: string;
  companyName?: string;
  device: string;
  issueType: "screen" | "battery" | "button" | "other" | string;
  status: "open" | "parts_assigned" | "technician_working" | "quality_check" | "completed";
  quotedPrice: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  userId?: string;
  internalNotes?: string;
  completedAt?: string;
  // S2C Forensic Chronometer & Labor Telemetry fields
  estimatedHours?: number;   // SLA Target Estimate in hours
  actualHours?: number;      // Logged actual labor in hours
  timerStartedAt?: string;   // Active session start ISO timestamp
  elapsedSeconds?: number;   // Accumulated elapsed duration (seconds)
}

export interface POSLog {
  timestamp: string;
  level: string;
  message: string;
  source: "Square" | "CellSmart" | "WebHook-Receiver";
}

export interface QuoteBreakdown {
  partsCost: number;
  laborCost: number;
  overhead: number;
  subtotal: number;
  partInventoryId?: string;
  partName?: string;
  stockStatus?: string;
  stockLocation?: string;
  itemInStock?: boolean;
  supplyChainPremium?: number;
  laborHours?: number;
  hourlyLaborRate?: number;
}

export interface TaxResponse {
  valid: boolean;
  zipCode: string;
  city: string;
  rate: number;
  message: string;
}

export interface QuoteResponse {
  baseQuote: QuoteBreakdown;
  taxInfo: {
    zipCode: string;
    city: string;
    rate: number;
    calculatedTax: number;
  };
  discountInfo: {
    applied: boolean;
    percentage: number;
    amount: number;
    company: string;
  };
  subtotal: number;
  grandTotal: number;
}

export interface HighPriorityLead {
  id: string;
  customerName: string;
  phone: string;
  deviceModel: string;
  status: "pending" | "in_progress" | "contacted" | "completed" | "cancelled";
  createdAt: string;
  userId: string;
}

export interface S2CFeedback {
  id: string;
  userId: string;
  pathway: "backlight" | "charging" | "short_rail" | string;
  rating: "up" | "down";
  deviceModel: string;
  notes?: string;
  ammeterReading: number;
  batteryTemp: number;
  createdAt: string;
}

/**
 * Triage-AI: Hardened Technician Identity Schema
 * Maps OIDC-compliant basic scopes to the forensic diagnostic ledger.
 */
export interface UserIdentitySession {
  // Verified via openid scope [Source: 659]
  technician_uid: string;
  technician_email: string; // From userinfo.email

  // Identity Proof for DTF [Source: 248]
  auth_metadata: {
    gateway_protocol: "CUSTOM_FORENSIC" | "FIREBASE_UI_STANDARD";
    scope_tier: "NON_SENSITIVE_IDENTITY_ONLY"; // Expedites Google Trust & Safety
    app_check_verified: boolean; // Confirms reCAPTCHA Enterprise protection
  };

  // Session Linkage [Source: 247]
  active_station_id: string; // Binds to physical hardware workstation
  session_timestamp_iso: string;
}

