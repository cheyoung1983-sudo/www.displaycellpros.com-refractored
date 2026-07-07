import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import { HardwareScanChart } from "../modules/triage-ai/HardwareScanChart";
import { ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

/**
 * DiagnosticsPage - Core S2C diagnostic workflow
 * Displays hardware telemetry and diagnostic assessment
 */
export default function DiagnosticsPage() {
  const {
    customerName,
    deviceBrand,
    deviceModel,
    issueType,
    setCurrentStep,
    addToast,
    setIsLoading,
  } = useApp();

  const [diagnosticComplete, setDiagnosticComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Simulate diagnostic scan progress
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!diagnosticComplete && scanProgress < 100) {
      timer = setTimeout(() => {
        setScanProgress((prev) => {
          const next = prev + Math.random() * 25;
          if (next >= 100) {
            setDiagnosticComplete(true);
            addToast("Scan Complete", "Hardware forensic analysis finished.", "success");
            return 100;
          }
          return next;
        });
      }, 400);
    }
    return () => clearTimeout(timer);
  }, [scanProgress, diagnosticComplete, addToast]);

  const handleProceedToQuote = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep("quote");
    }, 600);
  };

  const handleBackToIntake = () => {
    setCurrentStep("intake");
  };

  // Determine diagnostic message based on issue type
  const getDiagnosticMessage = () => {
    const messages: Record<string, string> = {
      screen: "Display assembly undergoing forensic telemetry analysis for backlight circuit integrity...",
      battery: "Battery management circuit and thermal profile being evaluated via BatteryManager API...",
      button: "Peripheral port and button flex ribbon cable impedance verification in progress...",
    };
    return messages[issueType] || "Running comprehensive hardware diagnostics...";
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col px-4 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#00BFFF]">
              Symptom-to-Circuit Diagnostic Assessment
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Device: {deviceBrand} {deviceModel} | Issue: {issueType.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Technician: {customerName}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00BFFF] to-[#008080]"
            initial={{ width: 0 }}
            animate={{ width: `${scanProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-gray-400 text-center">{Math.round(scanProgress)}% Complete</p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto w-full flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left: Status & Message */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] border border-[#008080] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                {diagnosticComplete ? (
                  <CheckCircle className="w-6 h-6 text-[#00BFFF]" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-[#00BFFF] border-t-transparent animate-spin" />
                )}
                <h3 className="text-lg font-semibold">
                  {diagnosticComplete ? "DIAGNOSTICS COMPLETE" : "SCANNING..."}
                </h3>
              </div>

              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                {getDiagnosticMessage()}
              </p>

              {/* Key Findings */}
              <div className="space-y-3 mb-6 pb-6 border-b border-[#008080] border-opacity-30">
                <h4 className="text-xs font-bold text-[#008080] uppercase">Key Findings</h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#FFBF00] flex-shrink-0 mt-0.5" />
                    <span>No critical thermal anomalies detected</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00BFFF] flex-shrink-0 mt-0.5" />
                    <span>Power rail continuity nominal</span>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-[#00BFFF] bg-opacity-10 border border-[#00BFFF] border-opacity-30 rounded p-3">
                <p className="text-xs text-[#00BFFF] font-semibold">RECOMMENDATION</p>
                <p className="text-sm text-gray-200 mt-2">
                  Hardware-level repair feasible. Proceed to quote for parts and labor estimate.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Hardware Telemetry Chart */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] border border-[#008080] rounded-lg p-6">
              <h3 className="text-sm font-bold text-[#008080] uppercase mb-4">
                Battery & Voltage Telemetry
              </h3>
              <HardwareScanChart
                deviceBrand={deviceBrand}
                deviceModel={deviceModel}
                issueType={issueType}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Actions */}
      <div className="max-w-6xl mx-auto w-full mt-8 flex gap-4 justify-between">
        <button
          onClick={handleBackToIntake}
          className="px-6 py-3 bg-[#1a1a1a] border border-[#008080] text-white rounded-lg hover:bg-[#2a2a2a] transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Intake
        </button>

        <button
          onClick={handleProceedToQuote}
          disabled={!diagnosticComplete}
          className="px-6 py-3 bg-[#00BFFF] text-[#111111] font-bold rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 ml-auto"
        >
          Proceed to Quote
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

