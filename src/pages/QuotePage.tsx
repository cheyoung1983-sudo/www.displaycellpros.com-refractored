import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { motion } from "motion/react";

/**
 * QuotePage - Dynamic repair quote generation
 * Displays parts cost, labor, tax, and discounts
 */
export default function QuotePage() {
  const { customerName, deviceBrand, deviceModel, issueType, setCurrentStep, addToast } =
    useApp();

  const [zipCode, setZipCode] = useState("98101");
  const [isCalculating, setIsCalculating] = useState(false);

  // Tax and pricing logic
  const getTaxRate = (zip: string): number => {
    const zipRates: Record<string, number> = {
      "98101": 0.1035, // Seattle
      "98004": 0.101,  // Bellevue
      "98402": 0.103,  // Tacoma
      "98052": 0.101,  // Redmond
      "98201": 0.099,  // Everett
      "98501": 0.095,  // Olympia
    };
    return zipRates[zip] || 0.1035;
  };

  // Pricing varies by issue type
  const getBasePricing = () => {
    const pricing: Record<string, { parts: number; labor: number }> = {
      screen: { parts: 180, labor: 170 },
      battery: { parts: 95, labor: 45 },
      button: { parts: 120, labor: 85 },
    };
    return pricing[issueType] || pricing.screen;
  };

  const basePricing = getBasePricing();
  const subtotal = basePricing.parts + basePricing.labor;
  const tax = subtotal * getTaxRate(zipCode);
  const discount = 0; // No corporate discount in this flow
  const total = subtotal - discount + tax;

  const handleProceedToConfirmation = () => {
    setIsCalculating(true);
    addToast("Quote Generated", "Repair estimate locked in. Proceeding to confirmation...", "success");
    setTimeout(() => {
      setIsCalculating(false);
      setCurrentStep("confirmation");
    }, 600);
  };

  const issueDescriptions: Record<string, string> = {
    screen: "Display assembly replacement with edge-to-edge glass",
    battery: "OEM battery pack swap with cycle calibration",
    button: "Port/button flex ribbon repair and soldering",
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col px-4 py-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        <h1 className="text-2xl font-bold text-[#00BFFF] mb-2">Repair Quote</h1>
        <p className="text-gray-400 text-sm">
          {deviceBrand} {deviceModel} | Service: {issueDescriptions[issueType]}
        </p>
      </div>

      {/* Main Quote Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto w-full flex-1"
      >
        <div className="bg-[#1a1a1a] border border-[#008080] rounded-lg overflow-hidden">
          {/* Quote Header */}
          <div className="bg-gradient-to-r from-[#008080] to-[#00BFFF] bg-opacity-20 p-6 border-b border-[#008080]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase">Service Quote ID</p>
                <p className="text-lg font-bold text-[#00BFFF]">
                  QT-{Math.floor(100000 + Math.random() * 900000)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase">Technician</p>
                <p className="text-sm font-semibold text-white">{customerName}</p>
              </div>
            </div>
          </div>

          {/* Quote Details */}
          <div className="p-8 space-y-6">
            {/* Service Description */}
            <div className="pb-6 border-b border-[#008080] border-opacity-30">
              <h3 className="text-xs font-bold text-[#008080] uppercase mb-3">Repair Service</h3>
              <p className="text-white font-semibold">{issueDescriptions[issueType]}</p>
              <p className="text-sm text-gray-400 mt-2">
                Includes parts, labor, and 90-day warranty on workmanship.
              </p>
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#008080] uppercase">Cost Breakdown</h3>

              <div className="space-y-3 bg-[#0a0a0a] p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Parts & Materials</span>
                  <span className="font-semibold text-white">${basePricing.parts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Labor (1-2 hours)</span>
                  <span className="font-semibold text-white">${basePricing.labor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-[#008080] border-opacity-30 pt-3">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="font-semibold text-[#00BFFF]">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Tax Calculator */}
              <div className="bg-[#0a0a0a] p-4 rounded-lg space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#008080] mb-2">
                    Washington Tax Zone
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
                    placeholder="98101"
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#008080] rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">
                    Sales Tax ({(getTaxRate(zipCode) * 100).toFixed(2)}%)
                  </span>
                  <span className="font-semibold text-white">${tax.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-[#008080] to-[#00BFFF] bg-opacity-10 border border-[#00BFFF] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Estimated Total</p>
                  <p className="text-3xl font-bold text-[#00BFFF]">${total.toFixed(2)}</p>
                </div>
                <Zap className="w-8 h-8 text-[#00BFFF]" />
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Quote valid for 7 days. No hidden fees. All work covered by warranty.
              </p>
            </div>

            {/* Terms Acceptance */}
            <label className="flex items-start gap-3 p-4 bg-[#0a0a0a] rounded-lg cursor-pointer hover:bg-[#1a1a1a] transition">
              <input
                type="checkbox"
                defaultChecked
                className="mt-1 w-4 h-4 accent-[#00BFFF] cursor-pointer"
              />
              <span className="text-xs text-gray-300">
                I accept the repair estimate and authorize Display & Cell Pros to proceed with the
                service.
              </span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Footer Actions */}
      <div className="max-w-2xl mx-auto w-full mt-8 flex gap-4 justify-between">
        <button
          onClick={() => setCurrentStep("diagnostics")}
          className="px-6 py-3 bg-[#1a1a1a] border border-[#008080] text-white rounded-lg hover:bg-[#2a2a2a] transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Diagnostics
        </button>

        <button
          onClick={handleProceedToConfirmation}
          disabled={isCalculating}
          className="px-6 py-3 bg-[#00BFFF] text-[#111111] font-bold rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 ml-auto"
        >
          Confirm & Proceed
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

