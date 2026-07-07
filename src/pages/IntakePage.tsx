import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { BrandLogo } from "../components/BrandLogo";
import {
  Smartphone,
  Battery,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

/**
 * IntakePage - Initial diagnostic intake form
 * Collects customer info and device details for triage
 */
export default function IntakePage() {
  const {
    customerName,
    setCustomerName,
    deviceBrand,
    setDeviceBrand,
    deviceModel,
    setDeviceModel,
    issueType,
    setIssueType,
    setCurrentStep,
    addToast,
    setIsLoading,
  } = useApp();

  const [isValidating, setIsValidating] = useState(false);

  const handleStartDiagnostics = async () => {
    if (!customerName.trim()) {
      addToast("Validation Error", "Please enter your name", "warning");
      return;
    }
    if (!deviceModel.trim()) {
      addToast("Validation Error", "Please specify your device model", "warning");
      return;
    }

    setIsValidating(true);
    setIsLoading(true);

    try {
      // Simulate initial diagnostic setup
      await new Promise((resolve) => setTimeout(resolve, 800));
      addToast("Diagnostics Initialized", "Beginning forensic triage protocol...", "success");
      setCurrentStep("diagnostics");
    } catch (err: any) {
      addToast("Error", err.message, "error");
    } finally {
      setIsValidating(false);
      setIsLoading(false);
    }
  };

  const deviceOptions = {
    Apple: ["iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro", "iPad Pro", "iPhone 13"],
    Samsung: ["Galaxy S24 Ultra", "Galaxy S24", "Galaxy Z Fold 6", "Galaxy A54"],
    Google: ["Pixel 8 Pro", "Pixel 8", "Pixel 7 Pro"],
  };

  const issueOptions = [
    {
      value: "screen" as const,
      label: "Screen/Display",
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      value: "battery" as const,
      label: "Battery",
      icon: <Battery className="w-5 h-5" />,
    },
    {
      value: "button" as const,
      label: "Button/Port",
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-md mb-8">
        <BrandLogo />
        <h1 className="text-2xl font-bold text-center mt-6 text-[#00BFFF]">
          Forensic Device Triage
        </h1>
        <p className="text-center text-gray-400 mt-2 text-sm">
          STOP GUESSING. START AUDITING.
        </p>
      </div>

      {/* Main Form */}
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStartDiagnostics();
          }}
          className="space-y-6"
        >
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-semibold text-[#008080] mb-2">
              Technician / Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#008080] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BFFF] transition"
              disabled={isValidating}
            />
          </div>

          {/* Device Brand */}
          <div>
            <label className="block text-sm font-semibold text-[#008080] mb-2">
              Device Manufacturer
            </label>
            <select
              value={deviceBrand}
              onChange={(e) => {
                setDeviceBrand(e.target.value);
                setDeviceModel(deviceOptions[e.target.value as keyof typeof deviceOptions][0]);
              }}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#008080] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00BFFF] transition cursor-pointer"
              disabled={isValidating}
            >
              {Object.keys(deviceOptions).map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Device Model */}
          <div>
            <label className="block text-sm font-semibold text-[#008080] mb-2">
              Device Model
            </label>
            <select
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#008080] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00BFFF] transition cursor-pointer"
              disabled={isValidating}
            >
              {deviceOptions[deviceBrand as keyof typeof deviceOptions].map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Type */}
          <div>
            <label className="block text-sm font-semibold text-[#008080] mb-3">
              Primary Issue Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {issueOptions.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIssueType(value)}
                  disabled={isValidating}
                  className={`flex flex-col items-center gap-2 px-3 py-4 rounded-lg border-2 transition ${
                    issueType === value
                      ? "border-[#00BFFF] bg-[#00BFFF] bg-opacity-10"
                      : "border-[#008080] bg-[#1a1a1a] hover:border-[#00BFFF]"
                  } disabled:opacity-50`}
                >
                  <div className={issueType === value ? "text-[#00BFFF]" : "text-[#008080]"}>
                    {icon}
                  </div>
                  <span className="text-xs font-semibold text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isValidating || !customerName.trim()}
            className="w-full px-6 py-3 bg-[#00BFFF] text-[#111111] font-bold rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Initiate Forensic Scan
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>

      {/* Benefits Summary */}
      <div className="w-full max-w-md mt-12 pt-8 border-t border-[#008080] border-opacity-30">
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="text-[#00BFFF] font-bold text-lg">$0</div>
            <p className="text-gray-400">Diagnostic Fee</p>
          </div>
          <div>
            <div className="text-[#00BFFF] font-bold text-lg">15 min</div>
            <p className="text-gray-400">Avg Triage Time</p>
          </div>
          <div>
            <div className="text-[#00BFFF] font-bold text-lg">100%</div>
            <p className="text-gray-400">Confidential</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-500 text-xs mt-8 max-w-md">
        By proceeding, you authorize Display & Cell Pros to perform hardware telemetry analysis
        per NIST SP 800-88 R1 standards.
      </p>
    </div>
  );
}

// Import motion for animations
import { motion } from "motion/react";

