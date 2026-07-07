import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { RepairTicket, HighPriorityLead } from "../types";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration: number;
}

interface AppContextType {
  // Toast Management
  toasts: Toast[];
  addToast: (title: string, message: string, type?: Toast["type"], duration?: number) => void;
  removeToast: (id: string) => void;

  // Auth State
  isAuthenticated: boolean;
  authUser: any | null;
  setAuthUser: (user: any | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Diagnostic State
  customerName: string;
  setCustomerName: (name: string) => void;
  deviceBrand: string;
  setDeviceBrand: (brand: string) => void;
  deviceModel: string;
  setDeviceModel: (model: string) => void;
  issueType: "screen" | "battery" | "button";
  setIssueType: (type: "screen" | "battery" | "button") => void;

  // Data
  tickets: RepairTicket[];
  setTickets: (tickets: RepairTicket[]) => void;
  leads: HighPriorityLead[];
  setLeads: (leads: HighPriorityLead[]) => void;

  // UI State
  currentStep: "intake" | "diagnostics" | "quote" | "confirmation";
  setCurrentStep: (step: "intake" | "diagnostics" | "quote" | "confirmation") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Diagnostic State
  const [customerName, setCustomerName] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("Apple");
  const [deviceModel, setDeviceModel] = useState("iPhone 15 Pro");
  const [issueType, setIssueType] = useState<"screen" | "battery" | "button">("screen");

  // Data
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [leads, setLeads] = useState<HighPriorityLead[]>([]);

  // UI State
  const [currentStep, setCurrentStep] = useState<"intake" | "diagnostics" | "quote" | "confirmation">("intake");

  const addToast = useCallback((title: string, message: string, type: Toast["type"] = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: AppContextType = {
    toasts,
    addToast,
    removeToast,
    isAuthenticated,
    authUser,
    setAuthUser: (user) => {
      setAuthUser(user);
      setIsAuthenticated(!!user);
    },
    isLoading,
    setIsLoading,
    customerName,
    setCustomerName,
    deviceBrand,
    setDeviceBrand,
    deviceModel,
    setDeviceModel,
    issueType,
    setIssueType,
    tickets,
    setTickets,
    leads,
    setLeads,
    currentStep,
    setCurrentStep,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

