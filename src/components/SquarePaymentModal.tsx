import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  DollarSign, 
  Lock, 
  ExternalLink, 
  FileText, 
  Radio, 
  Building,
  Zap
} from "lucide-react";

interface SquarePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId?: string;
  customerName?: string;
  customerEmail?: string;
  amount: number;
  itemDescription?: string;
  onPaymentSuccess?: (paymentResult: any) => void;
}

export function SquarePaymentModal({
  isOpen,
  onClose,
  ticketId = "DCP-8041",
  customerName = "Valued Customer",
  customerEmail = "customer@example.com",
  amount = 169.00,
  itemDescription = "iPhone 14 Pro Max Screen Replacement & Mobile Driveway Service",
  onPaymentSuccess,
}: SquarePaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "terminal" | "checkout_link" | "invoice">("card");
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [postalCode, setPostalCode] = useState("99208");
  
  // Terminal State
  const [terminalDeviceId, setTerminalDeviceId] = useState("SQUARE_TERMINAL_MOB_01");
  const [terminalStatus, setTerminalStatus] = useState<"idle" | "pushed" | "completed">("idle");
  
  // Invoice State
  const [invoiceTitle, setInvoiceTitle] = useState("Spokane Fleet Device Repair Service");
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0]);

  // Loading & Result States
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSquareConfig();
    }
  }, [isOpen]);

  const fetchSquareConfig = async () => {
    try {
      const res = await fetch("/api/square/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.warn("Could not fetch Square public config:", err);
    }
  };

  if (!isOpen) return null;

  const handleProcessCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Simulate nonce generation from Web Payments SDK (or server-side authorization)
      const simulatedSourceId = "cnon:card-nonce-ok-" + Math.floor(100000 + Math.random() * 900000);

      const res = await fetch("/api/square/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: simulatedSourceId,
          amount,
          currency: "USD",
          ticketId,
          customerEmail,
          note: `Payment for ${itemDescription}`
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPaymentSuccess(data.payment);
        if (onPaymentSuccess) onPaymentSuccess(data.payment);
      } else {
        setErrorMessage(data.error || data.details || "Payment processing encountered an error.");
      }
    } catch (err: any) {
      setErrorMessage("Network error connecting to Square Payment Gateway.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateCheckoutLink = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/square/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderName: itemDescription,
          amount,
          customerEmail,
          redirectUrl: window.location.href,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
        setPaymentSuccess({
          id: data.orderId || "sq_checkout",
          status: "CHECKOUT_LINK_CREATED",
          checkoutUrl: data.checkoutUrl,
          message: "Hosted Square Payment Link generated successfully."
        });
      } else {
        setErrorMessage(data.error || "Could not generate Square Payment Link.");
      }
    } catch (err) {
      setErrorMessage("Network error generating Square payment link.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePushTerminalCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/square/terminal-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          deviceId: terminalDeviceId,
          ticketId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTerminalStatus("pushed");
        setPaymentSuccess({
          id: data.terminalCheckout.id,
          status: "TERMINAL_PROMPTED",
          message: `Pushed $${amount.toFixed(2)} checkout prompt to mobile device [${terminalDeviceId}].`
        });
      } else {
        setErrorMessage(data.error || "Terminal dispatch failed.");
      }
    } catch (err) {
      setErrorMessage("Failed to reach Square Terminal dispatch API.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateInvoice = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/square/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          amount,
          title: invoiceTitle,
          dueDate,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPaymentSuccess({
          id: data.invoice.id,
          status: "INVOICE_SENT",
          publicUrl: data.invoice.publicUrl,
          message: `Square Invoice sent to ${customerEmail}`
        });
      } else {
        setErrorMessage(data.error || "Failed to generate Square invoice.");
      }
    } catch (err) {
      setErrorMessage("Network error creating Square invoice.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative">
        
        {/* HEADER BAR */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Square Payments Gateway
                <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  {config?.environment || "Sandbox"}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Ticket #{ticketId} • Display & Cell Pros Spokane</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AMOUNT & ITEM SUMMARY */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Amount Due</span>
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              ${amount.toFixed(2)}
            </div>
          </div>
          <div className="text-right max-w-xs">
            <span className="text-xs font-bold text-white block truncate">{itemDescription}</span>
            <span className="text-[11px] text-slate-400 block">{customerName} ({customerEmail})</span>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="p-6">
          
          {/* SUCCESS STATE DISPLAY */}
          {paymentSuccess ? (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-black text-white mb-1">Square Transaction Authorized</h4>
                <p className="text-xs text-emerald-400 font-mono">
                  {paymentSuccess.message || "Payment processed cleanly through Square REST API."}
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl text-left border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="text-blue-400 font-bold">{paymentSuccess.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-400 font-bold">{paymentSuccess.status || "COMPLETED"}</span>
                </div>
                {paymentSuccess.receiptUrl && (
                  <div className="pt-2 border-t border-slate-800">
                    <a
                      href={paymentSuccess.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      View Digital Square Receipt <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
                {paymentSuccess.checkoutUrl && (
                  <div className="pt-2 border-t border-slate-800">
                    <a
                      href={paymentSuccess.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Open Hosted Checkout Link <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Close & Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* PAYMENT METHOD SELECTOR TABS */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === "card"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card / Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("terminal")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === "terminal"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Terminal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("checkout_link")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === "checkout_link"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Pay Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("invoice")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === "invoice"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>B2B Invoice</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/50 border border-red-800/50 rounded-xl text-red-300 text-xs flex items-center gap-2 mb-5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* OPTION 1: CREDIT CARD / DIGITAL WALLET FORM */}
              {paymentMethod === "card" && (
                <form onSubmit={handleProcessCardPayment} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8892"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-3 text-white placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute right-4 top-3.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Exp Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">ZIP Code</label>
                      <input
                        type="text"
                        placeholder="99208"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Authorizing Square Payment...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Pay ${amount.toFixed(2)} Securely</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* OPTION 2: SQUARE TERMINAL FOR MOBILE DRIVEWAY TECHS */}
              {paymentMethod === "terminal" && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Mobile Terminal Device ID</span>
                    <input
                      type="text"
                      value={terminalDeviceId}
                      onChange={(e) => setTerminalDeviceId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Sends an instant contactless tap/chip card prompt to the on-site technician's terminal.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handlePushTerminalCheckout}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                    <span>Push ${amount.toFixed(2)} To Square Terminal</span>
                  </button>
                </div>
              )}

              {/* OPTION 3: HOSTED CHECKOUT LINK */}
              {paymentMethod === "checkout_link" && (
                <div className="space-y-4 text-center py-2">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Generate a secure, hosted Square Payment link that can be emailed or texted directly to the customer for remote checkout.
                  </p>

                  <button
                    type="button"
                    onClick={handleCreateCheckoutLink}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                    <span>Generate Square Hosted Pay Link</span>
                  </button>
                </div>
              )}

              {/* OPTION 4: SQUARE B2B INVOICE */}
              {paymentMethod === "invoice" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Invoice Title</label>
                    <input
                      type="text"
                      value={invoiceTitle}
                      onChange={(e) => setInvoiceTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Payment Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateInvoice}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    <span>Publish Square B2B Invoice</span>
                  </button>
                </div>
              )}
            </>
          )}

        </div>

        {/* FOOTER SECURITY BADGE */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            256-Bit SSL Encrypted Square Connection
          </span>
          <span>Location: Spokane, WA</span>
        </div>

      </div>
    </div>
  );
}
