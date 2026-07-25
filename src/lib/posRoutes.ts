import { Router, Request, Response } from "express";
import crypto from "crypto";
import { getPosConfig, isPosConfigured } from "./posService";

export const posRouter = Router();

/**
 * GET /api/pos/config
 * Returns POS Integration Configuration and Gateway status.
 */
posRouter.get("/config", (req: Request, res: Response) => {
  res.json(getPosConfig());
});

/**
 * POST /api/pos/create-payment
 * Process direct POS credit card / digital wallet / contactless transaction.
 */
posRouter.post("/create-payment", async (req: Request, res: Response) => {
  const { sourceId, amount, currency = "USD", ticketId, customerEmail, note } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Missing required amount field." });
  }

  const numericAmount = parseFloat(amount);
  const amountInCents = Math.round(numericAmount * 100);

  console.log(`[POS Payment] Processing payment request for $${numericAmount} (Ticket: ${ticketId || 'N/A'})`);

  const simulatedPayment = {
    id: "pos_tx_" + crypto.randomUUID().slice(0, 12),
    status: "COMPLETED",
    provider: getPosConfig().providerName,
    amountMoney: { amount: amountInCents.toString(), currency },
    sourceType: sourceId?.startsWith("cnon:") ? "CARD" : "CONTACTLESS_TERMINAL",
    cardDetails: {
      card: {
        cardBrand: "VISA",
        last4: "4242",
        expMonth: 12,
        expYear: 2028,
      },
    },
    createdAt: new Date().toISOString(),
    receiptUrl: `/api/pos/receipt/${crypto.randomUUID().slice(0, 8)}`,
    note: note || `Display & Cell Pros POS Settlement (Ticket: ${ticketId || 'POS-800'})`,
  };

  return res.json({
    success: true,
    simulated: true,
    message: "POS Transaction settled successfully via POS Gateway.",
    payment: simulatedPayment,
  });
});

/**
 * POST /api/pos/create-checkout
 * Generates POS Hosted Checkout Link for SMS/Email sharing.
 */
posRouter.post("/create-checkout", async (req: Request, res: Response) => {
  const { ticketId, amount, description, redirectUrl, customerEmail } = req.body;

  const numericAmount = parseFloat(amount || "149.00");
  const checkoutId = `pos_chk_${crypto.randomUUID().slice(0, 8)}`;
  const simulatedCheckoutUrl = `https://pos.displaycellpros.com/checkout/${checkoutId}`;

  return res.json({
    success: true,
    simulated: true,
    checkoutId,
    checkoutUrl: simulatedCheckoutUrl,
    message: "POS checkout payment link generated successfully.",
    paymentLink: {
      id: checkoutId,
      url: simulatedCheckoutUrl,
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * POST /api/pos/terminal-checkout
 * Dispatches payment prompt to on-site POS countertop hardware terminal.
 */
posRouter.post("/terminal-checkout", async (req: Request, res: Response) => {
  const { amount, currency = "USD", deviceId, note, ticketId } = req.body;

  const numericAmount = parseFloat(amount || "99.00");
  const checkoutId = `pos_term_${crypto.randomUUID().slice(0, 8)}`;

  return res.json({
    success: true,
    simulated: true,
    message: "POS Hardware Terminal prompt dispatched successfully.",
    checkout: {
      id: checkoutId,
      status: "PENDING_USER_TAP",
      amountMoney: { amount: Math.round(numericAmount * 100), currency },
      deviceOptions: {
        deviceId: deviceId || "POS_COUNTER_TERMINAL_01",
        skipReceiptScreen: false,
      },
      note: note || `Lab POS Repair Ticket #${ticketId || '802'}`,
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * POST /api/pos/create-invoice
 * Creates digital POS invoice sent to customer email.
 */
posRouter.post("/create-invoice", async (req: Request, res: Response) => {
  const { customerName, customerEmail, amount, title, description, dueDate } = req.body;

  const invoiceId = `pos_inv_${crypto.randomUUID().slice(0, 8)}`;
  const numericAmount = parseFloat(amount || "120.00");

  return res.json({
    success: true,
    simulated: true,
    message: "POS Invoice generated and dispatched.",
    invoice: {
      id: invoiceId,
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      title: title || "Mobile Repair & Diagnostics Service",
      description: description || "Display & Cell Pros Hardware Repair",
      status: "UNPAID",
      customer: {
        name: customerName || "Jane Miller",
        email: customerEmail || "jane.miller@spokanerepair.com",
      },
      amount: numericAmount,
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      publicUrl: `https://pos.displaycellpros.com/pay-invoice/${invoiceId}`,
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * GET /api/pos/bookings
 * Fetches upcoming scheduled appointments for POS Calendar.
 */
posRouter.get("/bookings", async (req: Request, res: Response) => {
  const now = new Date();
  
  const getUpcomingDate = (dayOffset: number, hour: number, minute: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  const simulatedBookings = [
    {
      id: "pos_bkg_001",
      startAt: getUpcomingDate(0, 10, 0),
      endAt: getUpcomingDate(0, 10, 45),
      customerName: "Jane Miller",
      customerPhone: "(509) 555-0192",
      customerEmail: "jane.miller@spokanedev.com",
      serviceName: "iPhone 14 Pro Max Screen Replacement",
      deviceModel: "iPhone 14 Pro Max",
      status: "ACCEPTED",
      locationName: "Spokane Valley Mobile Unit #1",
      technicianName: "Alex R. (Senior Tech)",
      price: 288.00,
      note: "Customer reported vertical green lines after drop. Professional Soft OLED tier selected."
    },
    {
      id: "pos_bkg_002",
      startAt: getUpcomingDate(0, 14, 30),
      endAt: getUpcomingDate(0, 15, 15),
      customerName: "Marcus Vance",
      customerPhone: "(206) 555-8821",
      customerEmail: "m.vance@seattlefleet.com",
      serviceName: "iPad Air 5th Gen Port & Battery Audit",
      deviceModel: "iPad Air 5th Gen",
      status: "ACCEPTED",
      locationName: "Downtown Spokane Main Lab",
      technicianName: "Chris M. (Fleet Specialist)",
      price: 135.00,
      note: "B2B Fleet account. Corporate discount applied."
    },
    {
      id: "pos_bkg_003",
      startAt: getUpcomingDate(1, 9, 15),
      endAt: getUpcomingDate(1, 10, 0),
      customerName: "David Kowalski",
      customerPhone: "(509) 555-3304",
      customerEmail: "dkowalski@inlandnw.org",
      serviceName: "Samsung S23 Ultra Curved Glass Rebuild",
      deviceModel: "Samsung Galaxy S23 Ultra",
      status: "ACCEPTED",
      locationName: "Spokane Valley Mobile Unit #1",
      technicianName: "Alex R.",
      price: 329.00,
      note: "LOC frame assembly swap requested."
    },
    {
      id: "pos_bkg_004",
      startAt: getUpcomingDate(1, 13, 0),
      endAt: getUpcomingDate(1, 14, 0),
      customerName: "Spokane Tech Logistics",
      customerPhone: "(509) 555-7710",
      customerEmail: "dispatch@spokanetech.com",
      serviceName: "3x Fleet Surface Pro 8 Battery Diagnostics",
      deviceModel: "Microsoft Surface Pro 8",
      status: "PENDING",
      locationName: "On-Site Driveway Van #2",
      technicianName: "Taylor S.",
      price: 420.00,
      note: "Driveway van service requested at logistics warehouse."
    },
    {
      id: "pos_bkg_005",
      startAt: getUpcomingDate(2, 11, 30),
      endAt: getUpcomingDate(2, 12, 30),
      customerName: "Sarah Connor",
      customerPhone: "(509) 555-9011",
      customerEmail: "sarah.c@resistance.org",
      serviceName: "MacBook Air M2 Liquid Decontamination",
      deviceModel: "MacBook Air M2 (2022)",
      status: "ACCEPTED",
      locationName: "Downtown Spokane Main Lab",
      technicianName: "Chris M.",
      price: 189.00,
      note: "Coffee spill over trackpad 2 hours ago. Battery disconnected."
    },
    {
      id: "pos_bkg_006",
      startAt: getUpcomingDate(3, 15, 0),
      endAt: getUpcomingDate(3, 15, 30),
      customerName: "Robert Chen",
      customerPhone: "(509) 555-4412",
      customerEmail: "rchen@ewu.edu",
      serviceName: "Google Pixel 8 Pro Rear Lens Glass",
      deviceModel: "Google Pixel 8 Pro",
      status: "ACCEPTED",
      locationName: "Spokane Valley Mobile Unit #1",
      technicianName: "Alex R.",
      price: 79.00,
      note: "Cracked telephoto camera glass ring."
    }
  ];

  return res.json({
    success: true,
    simulated: true,
    source: "Universal POS Calendar Engine",
    totalBookings: simulatedBookings.length,
    bookings: simulatedBookings,
  });
});

/**
 * POST /api/pos/create-booking
 * Schedules new repair appointment into POS schedule.
 */
posRouter.post("/create-booking", async (req: Request, res: Response) => {
  const { customerName, customerEmail, customerPhone, serviceName, deviceModel, startAt, note } = req.body;
  
  const newBooking = {
    id: `pos_bkg_${crypto.randomUUID().slice(0, 8)}`,
    startAt: startAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    customerName: customerName || "Walk-In Client",
    customerEmail: customerEmail || "client@spokanerepair.com",
    customerPhone: customerPhone || "(509) 555-0100",
    serviceName: serviceName || "General Hardware Inspection",
    deviceModel: deviceModel || "Mobile Device",
    status: "ACCEPTED",
    locationName: "Downtown Spokane Main Lab",
    technicianName: "Alex R.",
    price: 99.00,
    note: note || "Booked via Lab Portal POS Calendar Module"
  };

  return res.json({
    success: true,
    booking: newBooking,
    message: "Appointment successfully scheduled in POS system!"
  });
});

/**
 * POST /api/pos/webhook
 * POS webhook receiver for event callbacks.
 */
posRouter.post("/webhook", (req: Request, res: Response) => {
  res.json({ received: true, timestamp: new Date().toISOString() });
});
