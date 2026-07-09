import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import { CheckCircle, Download, Share2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

/**
 * ConfirmationPage - Final confirmation and next steps
 * Shows ticket confirmation and options for sharing/printing
 */
export default function ConfirmationPage() {
  const { customerName, deviceBrand, deviceModel, issueType, setCurrentStep, addToast } =
    useApp();

  const [ticketId] = useState(`DCP-${Math.floor(100000 + Math.random() * 900000)}`);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadQuote = () => {
    addToast("Download Starting", "Quote PDF generated and ready for download...", "success");
    // In production, generate and download actual PDF
  };

  const handleShareTicket = () => {
    const shareText = `Display & Cell Pros Repair - Ticket ${ticketId}\n${deviceBrand} ${deviceModel}\nIssue: ${issueType}`;
    if (navigator.share) {
      navigator.share({
        title: "Your Repair Ticket",
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      addToast("Copied", "Ticket details copied to clipboard", "success");
    }
  };

  const handleStartNew = () => {
    setCurrentStep("intake");
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Success Background */}
      {showConfetti && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#00BFFF]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
              }}
              animate={{
                y: window.innerHeight + 20,
                opacity: [1, 0],
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center z-10"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="inline-block">
            <CheckCircle className="w-16 h-16 text-[#00BFFF]" />
          </div>
        </motion.div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-[#00BFFF] mb-2">
          Triage Complete
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Your diagnostic assessment has been registered.
        </p>

        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#1a1a1a] border border-[#008080] rounded-lg p-8 mb-8"
        >
          <p className="text-xs text-gray-500 uppercase mb-2">Service Ticket</p>
          <p className="text-2xl font-mono font-bold text-[#00BFFF] mb-6">{ticketId}</p>

          {/* Ticket Details */}
          <div className="space-y-4 text-left mb-6 pb-6 border-b border-[#008080] border-opacity-30">
            <div>
              <p className="text-xs text-gray-500">TECHNICIAN</p>
              <p className="text-white font-semibold">{customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">DEVICE</p>
              <p className="text-white font-semibold">
                {deviceBrand} {deviceModel}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">SERVICE CATEGORY</p>
              <p className="text-white font-semibold capitalize">{issueType} Repair</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-[#00BFFF] bg-opacity-10 rounded p-3 text-left">
            <p className="text-xs font-bold text-[#008080] uppercase mb-2">What's Next?</p>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>✓ Your quote is ready to review</li>
              <li>✓ We'll contact you within 24 hours</li>
              <li>✓ Service can begin immediately upon approval</li>
            </ul>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3 mb-6"
        >
          <button
            onClick={handleDownloadQuote}
            className="w-full px-6 py-3 bg-[#00BFFF] text-[#111111] font-bold rounded-lg hover:bg-opacity-90 transition flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Quote PDF
          </button>

          <button
            onClick={handleShareTicket}
            className="w-full px-6 py-3 bg-[#1a1a1a] border border-[#008080] text-white rounded-lg hover:bg-[#2a2a2a] transition flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share Ticket
          </button>
        </motion.div>

        {/* Back to Intake Link */}
        <button
          onClick={handleStartNew}
          className="px-6 py-2 text-[#00BFFF] hover:text-[#00BFFF] hover:underline transition flex items-center justify-center gap-2 mx-auto text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Start New Triage
        </button>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="max-w-md w-full mt-12 pt-8 border-t border-[#008080] border-opacity-30"
      >
        <div className="text-center text-xs text-gray-500 space-y-2">
          <p>
            Your data is secured per NIST SP 800-88 R1 forensic protocols. Please retain your
            ticket ID for reference.
          </p>
          <p className="text-gray-600">
            Questions? Contact support@displaycellpros.com
          </p>
        </div>
      </motion.div>
    </div>
  );
}

