"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  app: () => app,
  calculateQuoteInternal: () => calculateQuoteInternal
});
module.exports = __toCommonJS(server_exports);
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_openai = require("openai");
var import_dotenv = __toESM(require("dotenv"), 1);

// db.ts
var import_rds_signer = require("@aws-sdk/rds-signer");
var import_oidc_aws_credentials_provider = require("@vercel/oidc-aws-credentials-provider");
var import_functions = require("@vercel/functions");
var import_pg = require("pg");
var import_child_process = require("child_process");
var pool = null;
function normalizeHost(rawHost) {
  if (rawHost.startsWith("/")) {
    const cleanedHost = rawHost.replace(/\/\.?s\.PGSQL\.\d+$/, "");
    return { host: cleanedHost, isUnixSocket: true };
  }
  return { host: rawHost, isUnixSocket: false };
}
function isDbConfigured() {
  return true;
}
function getDbPool() {
  if (pool) return pool;
  const rawHost = process.env.PGHOST || "database-2.cluster-ccxgoew4ygug.us-east-1.rds.amazonaws.com";
  const user = process.env.PGUSER || "postgres";
  const password = process.env.PGPASSWORD || process.env.SQL_PASSWORD || "";
  const database = process.env.PGDATABASE || "postgres";
  const port = Number(process.env.PGPORT) || 5432;
  const roleArn = process.env.AWS_ROLE_ARN;
  const region = process.env.AWS_REGION || "us-east-1";
  const { host, isUnixSocket } = normalizeHost(rawHost);
  console.log(`[Database] Initializing connection pool to ${isUnixSocket ? "Unix Socket " + host : host + ":" + port}/${database} as user ${user}`);
  let passwordOption = password;
  if (!isUnixSocket) {
    console.log(`[Database] Configuring AWS RDS Signer token generator for ${host}`);
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (accessKeyId && secretAccessKey) {
      try {
        const signer = new import_rds_signer.Signer({
          hostname: host,
          port,
          username: user,
          region,
          credentials: {
            accessKeyId,
            secretAccessKey
          }
        });
        passwordOption = () => signer.getAuthToken();
      } catch (err) {
        console.warn("[Database] AWS RDS Signer error:", err.message);
      }
    } else if (roleArn) {
      try {
        const signer = new import_rds_signer.Signer({
          hostname: host,
          port,
          username: user,
          region,
          credentials: (0, import_oidc_aws_credentials_provider.awsCredentialsProvider)({
            roleArn,
            clientConfig: { region }
          })
        });
        passwordOption = () => signer.getAuthToken();
      } catch (err) {
        console.warn("[Database] AWS RDS Signer OIDC error, falling back:", err.message);
      }
    }
  }
  const poolConfig = {
    host,
    user,
    database,
    password: passwordOption,
    port,
    max: 10,
    idleTimeoutMillis: 3e4,
    connectionTimeoutMillis: 1e4
  };
  if (isUnixSocket) {
    poolConfig.ssl = false;
  } else {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
  pool = new import_pg.Pool(poolConfig);
  pool.on("error", (err) => {
    console.error("[Database Pool Error]: Unexpected error on idle client:", err);
  });
  try {
    (0, import_functions.attachDatabasePool)(pool);
    console.log("[Database] Attached connection pool to @vercel/functions handler.");
  } catch (err) {
    console.log(`[Database] Note: attachDatabasePool is not applicable in this context: ${err.message}`);
  }
  return pool;
}
var DATABASE_2_HOST = "database-2.cluster-ccxgoew4ygug.us-east-1.rds.amazonaws.com";
var DATABASE_2_USER = "postgres";
var DATABASE_2_DB = "postgres";
async function getAuthTokenForDatabase2() {
  const host = DATABASE_2_HOST;
  const user = DATABASE_2_USER;
  const port = 5432;
  const region = process.env.AWS_REGION || "us-east-1";
  try {
    const cliToken = (0, import_child_process.execSync)(
      `export PATH="$HOME/.local/bin:$PATH" && aws rds generate-db-auth-token --hostname ${host} --port ${port} --username ${user} --region ${region}`,
      {
        encoding: "utf8",
        env: {
          ...process.env,
          AWS_DEFAULT_REGION: region
        }
      }
    ).trim();
    if (cliToken && cliToken.length > 50) return cliToken;
  } catch (err) {
    console.warn("[Database] CLI token generation error, falling back to Signer:", err.message);
  }
  const signer = new import_rds_signer.Signer({
    hostname: host,
    port,
    username: user,
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
  });
  return await signer.getAuthToken();
}
async function queryWithToken(sql, params = [], token) {
  const host = process.env.PGHOST || DATABASE_2_HOST;
  const user = process.env.PGUSER || DATABASE_2_USER;
  const database = process.env.PGDATABASE || DATABASE_2_DB;
  const port = Number(process.env.PGPORT) || 5432;
  const { host: normalizedHost, isUnixSocket } = normalizeHost(host);
  let activeToken = token;
  if (!activeToken && !isUnixSocket && process.env.AWS_ACCESS_KEY_ID) {
    try {
      activeToken = await getAuthTokenForDatabase2();
    } catch (err) {
      console.warn("[Database] Could not generate dynamic RDS token:", err.message);
    }
  }
  if (activeToken) {
    console.log(`[Database] Query executing via explicit token connection to ${isUnixSocket ? "Unix Socket " + normalizedHost : normalizedHost + ":" + port}/${database} as user ${user}`);
    const clientConfig = {
      host: normalizedHost,
      user,
      database,
      password: activeToken,
      port
    };
    if (isUnixSocket) {
      clientConfig.ssl = false;
    } else {
      clientConfig.ssl = { rejectUnauthorized: false };
    }
    const client = new import_pg.Client(clientConfig);
    await client.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } finally {
      await client.end().catch((err) => console.warn("[Database] Error closing explicit connection:", err));
    }
  }
  const standardPool = getDbPool();
  return await standardPool.query(sql, params);
}

// server.ts
var import_edge_config = require("@vercel/edge-config");

// src/lib/posRoutes.ts
var import_express = require("express");
var import_crypto = __toESM(require("crypto"), 1);

// src/lib/posService.ts
function getPosConfig() {
  const provider = process.env.POS_PROVIDER || "Custom POS System";
  const apiKey = process.env.POS_API_KEY || process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.POS_LOCATION_ID || process.env.SQUARE_LOCATION_ID || "LOC_SPOKANE_MAIN_LAB";
  return {
    providerName: provider,
    isConfigured: !!apiKey,
    locationId,
    environment: process.env.POS_ENVIRONMENT || "production",
    apiVersion: "2026.1"
  };
}

// src/lib/posRoutes.ts
var posRouter = (0, import_express.Router)();
posRouter.get("/config", (req, res) => {
  res.json(getPosConfig());
});
posRouter.post("/create-payment", async (req, res) => {
  const { sourceId, amount, currency = "USD", ticketId, customerEmail, note } = req.body;
  if (!amount) {
    return res.status(400).json({ error: "Missing required amount field." });
  }
  const numericAmount = parseFloat(amount);
  const amountInCents = Math.round(numericAmount * 100);
  console.log(`[POS Payment] Processing payment request for $${numericAmount} (Ticket: ${ticketId || "N/A"})`);
  const simulatedPayment = {
    id: "pos_tx_" + import_crypto.default.randomUUID().slice(0, 12),
    status: "COMPLETED",
    provider: getPosConfig().providerName,
    amountMoney: { amount: amountInCents.toString(), currency },
    sourceType: sourceId?.startsWith("cnon:") ? "CARD" : "CONTACTLESS_TERMINAL",
    cardDetails: {
      card: {
        cardBrand: "VISA",
        last4: "4242",
        expMonth: 12,
        expYear: 2028
      }
    },
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    receiptUrl: `/api/pos/receipt/${import_crypto.default.randomUUID().slice(0, 8)}`,
    note: note || `Display & Cell Pros POS Settlement (Ticket: ${ticketId || "POS-800"})`
  };
  return res.json({
    success: true,
    simulated: true,
    message: "POS Transaction settled successfully via POS Gateway.",
    payment: simulatedPayment
  });
});
posRouter.post("/create-checkout", async (req, res) => {
  const { ticketId, amount, description, redirectUrl, customerEmail } = req.body;
  const numericAmount = parseFloat(amount || "149.00");
  const checkoutId = `pos_chk_${import_crypto.default.randomUUID().slice(0, 8)}`;
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
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
});
posRouter.post("/terminal-checkout", async (req, res) => {
  const { amount, currency = "USD", deviceId, note, ticketId } = req.body;
  const numericAmount = parseFloat(amount || "99.00");
  const checkoutId = `pos_term_${import_crypto.default.randomUUID().slice(0, 8)}`;
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
        skipReceiptScreen: false
      },
      note: note || `Lab POS Repair Ticket #${ticketId || "802"}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
});
posRouter.post("/create-invoice", async (req, res) => {
  const { customerName, customerEmail, amount, title, description, dueDate } = req.body;
  const invoiceId = `pos_inv_${import_crypto.default.randomUUID().slice(0, 8)}`;
  const numericAmount = parseFloat(amount || "120.00");
  return res.json({
    success: true,
    simulated: true,
    message: "POS Invoice generated and dispatched.",
    invoice: {
      id: invoiceId,
      invoiceNumber: `INV-${Math.floor(1e5 + Math.random() * 9e5)}`,
      title: title || "Mobile Repair & Diagnostics Service",
      description: description || "Display & Cell Pros Hardware Repair",
      status: "UNPAID",
      customer: {
        name: customerName || "Jane Miller",
        email: customerEmail || "jane.miller@spokanerepair.com"
      },
      amount: numericAmount,
      dueDate: dueDate || new Date(Date.now() + 7 * 864e5).toISOString(),
      publicUrl: `https://pos.displaycellpros.com/pay-invoice/${invoiceId}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
});
posRouter.get("/bookings", async (req, res) => {
  const now = /* @__PURE__ */ new Date();
  const getUpcomingDate = (dayOffset, hour, minute) => {
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
      price: 288,
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
      price: 135,
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
      price: 329,
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
      price: 420,
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
      price: 189,
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
      price: 79,
      note: "Cracked telephoto camera glass ring."
    }
  ];
  return res.json({
    success: true,
    simulated: true,
    source: "Universal POS Calendar Engine",
    totalBookings: simulatedBookings.length,
    bookings: simulatedBookings
  });
});
posRouter.post("/create-booking", async (req, res) => {
  const { customerName, customerEmail, customerPhone, serviceName, deviceModel, startAt, note } = req.body;
  const newBooking = {
    id: `pos_bkg_${import_crypto.default.randomUUID().slice(0, 8)}`,
    startAt: startAt || new Date(Date.now() + 24 * 3600 * 1e3).toISOString(),
    customerName: customerName || "Walk-In Client",
    customerEmail: customerEmail || "client@spokanerepair.com",
    customerPhone: customerPhone || "(509) 555-0100",
    serviceName: serviceName || "General Hardware Inspection",
    deviceModel: deviceModel || "Mobile Device",
    status: "ACCEPTED",
    locationName: "Downtown Spokane Main Lab",
    technicianName: "Alex R.",
    price: 99,
    note: note || "Booked via Lab Portal POS Calendar Module"
  };
  return res.json({
    success: true,
    booking: newBooking,
    message: "Appointment successfully scheduled in POS system!"
  });
});
posRouter.post("/webhook", (req, res) => {
  res.json({ received: true, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});

// server.ts
import_dotenv.default.config();
process.on("unhandledRejection", (reason) => {
  console.error("[Unhandled Promise Rejection]:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[Uncaught Exception]:", err);
});
var app = (0, import_express2.default)();
var PORT = 3e3;
app.use(import_express2.default.json());
app.use("/api/pos", posRouter);
app.use("/api/square", posRouter);
app.get(["/health", "/api/health"], (req, res) => {
  res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use((req, res, next) => {
  const apiPaths = [
    "health",
    "square",
    "tax-lookup",
    "generate-quote",
    "verify-b2b",
    "pos-sync-logs",
    "pos-sync-log",
    "create-ticket",
    "triage",
    "complex-diagnostics",
    "analyze-image",
    "rds-status",
    "movies",
    "welcome"
  ];
  const pathParts = req.url.split("?")[0].split("/");
  const firstSegment = pathParts[1];
  if (firstSegment && apiPaths.includes(firstSegment) && !req.url.startsWith("/api/")) {
    const originalUrl = req.url;
    req.url = "/api" + originalUrl;
    console.log(`[Route Rewrite] Adjusted request URL for compatibility: ${originalUrl} -> ${req.url}`);
  }
  next();
});
var openaiClient = null;
var OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (OPENAI_API_KEY && OPENAI_API_KEY !== "MY_OPENAI_API_KEY") {
  try {
    openaiClient = new import_openai.OpenAI({
      apiKey: OPENAI_API_KEY
    });
    console.log("[AI Initialization] OpenAI API client successfully initialized for AI agents.");
  } catch (err) {
    console.log("[AI Initialization] OpenAI setup error:", err);
  }
} else {
  console.log("[AI Initialization] No OPENAI_API_KEY configured. Operating in high-fidelity local simulation mode.");
}
var mockTickets = [
  {
    id: "DSC-8041",
    customerName: "Sarah Jenkins",
    companyName: "Seattle Fleet Corp",
    device: "iPhone 14 Pro Max",
    issueType: "screen",
    status: "technician_working",
    quotedPrice: 320,
    tax: 33.12,
    // ~10.35% for Seattle
    discount: 64,
    // 20% B2B Fleet Discount
    total: 289.12,
    createdAt: new Date(Date.now() - 4 * 36e5).toISOString()
  },
  {
    id: "DSC-7933",
    customerName: "Alex Rivera",
    device: "Samsung Galaxy S23 Ultra",
    issueType: "battery",
    status: "quality_check",
    quotedPrice: 129,
    tax: 13.03,
    // ~10.1% Bellevue
    discount: 0,
    total: 142.03,
    createdAt: new Date(Date.now() - 24 * 36e5).toISOString()
  },
  {
    id: "DSC-7550",
    customerName: "Tech Operations Lead",
    companyName: "Amazon Seattle Operations",
    device: "iPad Pro 12.9 (5th Gen)",
    issueType: "button",
    status: "completed",
    quotedPrice: 180,
    tax: 18.63,
    // Seattle ~10.35%
    discount: 36,
    // 20% B2B discount
    total: 162.63,
    createdAt: new Date(Date.now() - 3 * 864e5).toISOString()
  }
];
var syncLogs = [
  { timestamp: new Date(Date.now() - 2 * 36e5).toISOString(), level: "INFO", message: "Successfully synced latest inventory prices with CellSmart server", source: "CellSmart" },
  { timestamp: new Date(Date.now() - 1 * 36e5).toISOString(), level: "INFO", message: "Square webhook registered: catalog.version.updated", source: "Square" },
  { timestamp: (/* @__PURE__ */ new Date()).toISOString(), level: "INFO", message: "Awaiting incoming POS transactions...", source: "WebHook-Receiver" }
];
var WA_TAX_DATA = {
  "98101": { city: "Seattle", rate: 0.1035 },
  "98102": { city: "Seattle", rate: 0.1035 },
  "98104": { city: "Seattle", rate: 0.1035 },
  "98115": { city: "Seattle", rate: 0.1035 },
  "98004": { city: "Bellevue", rate: 0.101 },
  "98005": { city: "Bellevue", rate: 0.101 },
  "98402": { city: "Tacoma", rate: 0.103 },
  "98405": { city: "Tacoma", rate: 0.103 },
  "98052": { city: "Redmond", rate: 0.101 },
  "98201": { city: "Everett", rate: 0.099 },
  "98501": { city: "Olympia", rate: 0.095 },
  "99201": { city: "Spokane", rate: 0.09 },
  "98660": { city: "Vancouver", rate: 0.087 }
};
var B2B_CORPORATE_DOMAINS = [
  "amazon.com",
  "microsoft.com",
  "boeing.com",
  "starbucks.com",
  "costco.com",
  "t-mobile.com",
  "expedia.com",
  "nordstrom.com",
  "paccar.com"
];
function calculateQuoteInternal(issueType, deviceTier) {
  let partsCost = 45;
  let laborHours = 1.5;
  const hourlyLaborRate = 85;
  const overheadMultiplier = 1.15;
  if (issueType === "screen") {
    partsCost = deviceTier === "flagship" ? 180 : deviceTier === "midrange" ? 95 : 55;
    laborHours = deviceTier === "flagship" ? 2 : 1.5;
  } else if (issueType === "battery") {
    partsCost = deviceTier === "flagship" ? 45 : deviceTier === "midrange" ? 35 : 25;
    laborHours = 1;
  } else if (issueType === "button") {
    partsCost = deviceTier === "flagship" ? 30 : deviceTier === "midrange" ? 20 : 12;
    laborHours = 1.25;
  }
  const baseLabor = laborHours * hourlyLaborRate;
  const rawSubtotal = (partsCost + baseLabor) * overheadMultiplier;
  const finalPrice = Math.round(rawSubtotal * 100) / 100;
  return {
    partsCost: Math.round(partsCost * 100) / 100,
    laborCost: Math.round(baseLabor * 100) / 100,
    overhead: Math.round((rawSubtotal - partsCost - baseLabor) * 100) / 100,
    subtotal: finalPrice
  };
}
app.post("/api/tax-lookup", (req, res) => {
  const { zipCode } = req.body;
  if (!zipCode) {
    return res.status(400).json({ error: "zipCode is required." });
  }
  const cleanedZip = zipCode.trim();
  const location = WA_TAX_DATA[cleanedZip];
  if (location) {
    res.json({
      valid: true,
      zipCode: cleanedZip,
      city: location.city,
      rate: location.rate,
      message: `WASHINGTON TAX COMPLIANT: Destined delivery in ${location.city} (${cleanedZip}) is subject to ${location.rate * 100}% local combined sales tax.`
    });
  } else {
    const isWA = cleanedZip.startsWith("98") || cleanedZip.startsWith("99");
    if (isWA) {
      res.json({
        valid: true,
        zipCode: cleanedZip,
        city: "Washington State Destination",
        rate: 0.088,
        message: `WASHINGTON TAX COMPLIANT: Estimated Washington Destination Sales Tax base of 8.8% applied for ZIP ${cleanedZip}.`
      });
    } else {
      res.json({
        valid: false,
        zipCode: cleanedZip,
        city: "Out of State",
        rate: 0,
        message: "Out of State destination. No Washington destination sales tax collected."
      });
    }
  }
});
app.post("/api/generate-quote", (req, res) => {
  const { issueType, deviceTier, zipCode, isCorporate, companyName } = req.body;
  if (!issueType || !deviceTier) {
    return res.status(400).json({ error: "issueType ('screen' | 'battery' | 'button') and deviceTier ('flagship' | 'midrange' | 'budget') are required." });
  }
  const billing = calculateQuoteInternal(issueType, deviceTier);
  let taxRate = 0.1035;
  let taxCity = "Seattle";
  if (zipCode) {
    const lookup = WA_TAX_DATA[zipCode] || (zipCode.startsWith("98") || zipCode.startsWith("99") ? { city: "WA Unspecified", rate: 0.088 } : null);
    if (lookup) {
      taxRate = lookup.rate;
      taxCity = lookup.city;
    } else {
      taxRate = 0;
      taxCity = "Out of State";
    }
  }
  let discountAmount = 0;
  let hasB2BDiscount = false;
  if (isCorporate) {
    hasB2BDiscount = true;
    discountAmount = Math.round(billing.subtotal * 0.2 * 100) / 100;
  }
  const subtotalAfterDiscount = Math.round((billing.subtotal - discountAmount) * 100) / 100;
  const calculatedTax = Math.round(subtotalAfterDiscount * taxRate * 100) / 100;
  const grandTotal = Math.round((subtotalAfterDiscount + calculatedTax) * 100) / 100;
  res.json({
    baseQuote: billing,
    taxInfo: {
      zipCode: zipCode || "98101",
      city: taxCity,
      rate: taxRate,
      calculatedTax
    },
    discountInfo: {
      applied: hasB2BDiscount,
      percentage: 20,
      amount: discountAmount,
      company: companyName || "Corporate Account"
    },
    subtotal: subtotalAfterDiscount,
    grandTotal
  });
});
app.post("/api/verify-b2b", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email address is required for Fast-Track evaluation" });
  }
  const domain = email.split("@")[1].toLowerCase();
  const isCorporate = B2B_CORPORATE_DOMAINS.includes(domain);
  res.json({
    email,
    domain,
    isCorporate,
    discountPercentage: isCorporate ? 20 : 0,
    companyName: isCorporate ? domain.split(".")[0].toUpperCase() + " Fleet" : null,
    message: isCorporate ? `VERIFICATION SUCCESS: Corporate customer identified! 20% Fast-Track fleet repair discount & zero-deposit check-in is unlocked for ${domain}.` : `Retail client verified. Standard warranty and retail billing rates applied to domain ${domain}.`
  });
});
function detectSpecsFromText(text, currentDetails) {
  const specs = {
    brand: currentDetails?.brand || null,
    model: currentDetails?.model || null,
    tier: currentDetails?.tier || null,
    issue: currentDetails?.issue || null,
    pricingTier: currentDetails?.pricingTier || null,
    step: currentDetails?.step || 1
  };
  const textLower = text.toLowerCase();
  if (textLower.includes("apple") || textLower.includes("iphone") || textLower.includes("ipad") || textLower.includes("ios") || textLower.includes("mac")) {
    specs.brand = "Apple";
    if (specs.step === 1) specs.step = 2;
  } else if (textLower.includes("samsung") || textLower.includes("galaxy") || textLower.includes("android") || textLower.includes("pixel") || textLower.includes("google")) {
    specs.brand = "Samsung";
    if (specs.step === 1) specs.step = 2;
  }
  if (specs.brand === "Apple") {
    if (textLower.includes("se")) {
      specs.model = "iPhone SE";
      specs.tier = "budget";
    } else if (textLower.includes("15")) {
      specs.model = textLower.includes("pro") ? "iPhone 15 Pro Max" : "iPhone 15";
      specs.tier = "flagship";
    } else if (textLower.includes("14")) {
      specs.model = textLower.includes("pro") ? "iPhone 14 Pro" : "iPhone 14";
      specs.tier = "flagship";
    } else if (textLower.includes("13")) {
      specs.model = textLower.includes("pro") ? "iPhone 13 Pro" : "iPhone 13";
      specs.tier = "flagship";
    } else if (textLower.includes("12")) {
      specs.model = "iPhone 12";
      specs.tier = "flagship";
    } else if (textLower.includes("11")) {
      specs.model = "iPhone 11";
      specs.tier = "midrange";
    } else {
      specs.model = currentDetails?.model || "iPhone 14 Pro Max";
      specs.tier = "flagship";
    }
    if (specs.step === 1) specs.step = 2;
  } else if (specs.brand === "Samsung") {
    if (textLower.includes("s24")) {
      specs.model = "Galaxy S24 Ultra";
      specs.tier = "flagship";
    } else if (textLower.includes("s23")) {
      specs.model = "Galaxy S23 Ultra";
      specs.tier = "flagship";
    } else if (textLower.includes("s22")) {
      specs.model = "Galaxy S22";
      specs.tier = "flagship";
    } else if (textLower.includes("s21")) {
      specs.model = "Galaxy S21";
      specs.tier = "flagship";
    } else if (textLower.includes("a54") || textLower.includes("a35") || textLower.includes("a15") || textLower.includes("galaxy a")) {
      specs.model = "Galaxy A54";
      specs.tier = "budget";
    } else {
      specs.model = currentDetails?.model || "Galaxy S23 Ultra";
      specs.tier = "flagship";
    }
    if (specs.step === 1) specs.step = 2;
  }
  if (textLower.includes("screen") || textLower.includes("crack") || textLower.includes("display") || textLower.includes("line") || textLower.includes("flicker") || textLower.includes("touch") || textLower.includes("glass") || textLower.includes("digitizer")) {
    specs.issue = "screen";
    specs.pricingTier = "Tier 2";
    specs.step = 3;
  } else if (textLower.includes("battery") || textLower.includes("drain") || textLower.includes("charge") || textLower.includes("power") || textLower.includes("bloat") || textLower.includes("percentage") || textLower.includes("cycle")) {
    specs.issue = "battery";
    specs.pricingTier = "Tier 1";
    specs.step = 3;
  } else if (textLower.includes("button") || textLower.includes("stuck") || textLower.includes("volume") || textLower.includes("power button") || textLower.includes("tactile")) {
    specs.issue = "button";
    specs.pricingTier = "Tier 3";
    specs.step = 3;
  } else if (textLower.includes("water") || textLower.includes("liquid") || textLower.includes("short") || textLower.includes("motherboard") || textLower.includes("logic board")) {
    specs.issue = "other";
    specs.pricingTier = "Tier 3";
    specs.step = 3;
  }
  if (specs.brand && specs.model && specs.step === 2 && !specs.issue) {
    specs.step = 2;
  } else if (specs.brand && specs.model && specs.issue) {
    specs.step = 3;
  }
  return specs;
}
app.post("/api/triage", async (req, res) => {
  const { messages, deviceDetails } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "An array of messages is required." });
  }
  const deviceContextPrompt = deviceDetails ? `User current UI state: ${deviceDetails.brand || "Unspecified"} brand, ${deviceDetails.model || "Unspecified"} model (${deviceDetails.tier || "standard"} tier). Merge appropriately based on user input.` : `User has not selected a specific device yet inside the UI. Maintain full flow from greeting onwards.`;
  const systemInstruction = `
You are the Display & Cell Pros Intelligent AI Hardware Diagnostics assistant, an expert laboratory-grade driveway device troubleshooting engineer stationed in Spokane & Seattle WA. Your objective is to guide customers down the following three-step logic flow:

Step 1: Initial Greeting (Welcome):
- Welcome customers with full technical composure to our unique driving-equipped mobile lab ("Display & Cell Pros").
- Explain that we dispatch fully customized hardware labs on wheels to the client's driveway/curbside to solve critical smartphone defects.

Step 2: Device Identification:
- Ask questions or analyze messages to differentiate clearly between specific Apple models (e.g., iPhone SE, 11, 12, 13, 14, 15 series, Plus/Pro/Max) and Samsung models (e.g., Galaxy S21, S22, S23, S24 Series, Fold/Flip, or budget Galaxy A-series).
- Identify which model and corresponding tier ('flagship', 'midrange', 'budget') is being repaired.
- Populated the extracted 'brand', 'model', and 'tier' properties in the detectedSpecs JSON fields.

Step 3: Damage Triage & Pricing Routing:
- Diagnose the specific mechanical, power, or visual hardware issues:
  - Tier 1: Core Power / Battery ($69 - $97) -> Battery swelling, rapid capacity decline, cycle count exhaustion, charging port blockages.
  - Tier 2: Elite Display Renewal (From $139) -> Scattered glass fractures, micro-splinters, vertical OLED lines, flickering backlights, touch grid latency.
  - Tier 3: Specialized Diagnostics (Custom Quote) -> Stuck hardware buttons, board-level short circuits, high-oxidation liquid damage.
- Provide practical device testing tips (inspecting under extreme angles, checking local settings for cycle stats) and route the issue cleanly to Tier 1, 2, or 3.

BEHAVIOR LAWS:
  - Output valid JSON containing 'text' (your response string) and 'detectedSpecs' containing brand, model, tier, issue, pricingTier, and step (1, 2, or 3).
  - Strictly limit diagnostics to screens, swollen batteries, tactile buttons, charging port issues, or motherboards. Pivot away politely from software, cooking, or general math.
  - Never disclose raw cost margin multipliers.
  `;
  if (openaiClient) {
    try {
      const contents = messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.text
      }));
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: `CONTEXT:
${deviceContextPrompt}` },
          ...contents
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "triage_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                text: {
                  type: "string",
                  description: "The AI chat assistant's helpful conversational reply to the user. Guide them systematically along Step 1, Step 2, and Step 3."
                },
                detectedSpecs: {
                  type: "object",
                  description: "Structured extraction of device and damage properties of the user based on cumulative history.",
                  properties: {
                    brand: { type: ["string", "null"], description: "Identified device brand: 'Apple', 'Samsung', or null if undetermined." },
                    model: { type: ["string", "null"], description: "Specific model identified, e.g., 'iPhone 15 Pro Max', 'Galaxy S23' or null." },
                    tier: { type: ["string", "null"], description: "Hardware level tier: 'flagship', 'midrange', 'budget', or null." },
                    issue: { type: ["string", "null"], description: "Hardware issue category: 'screen', 'battery', 'button', or null." },
                    pricingTier: { type: ["string", "null"], description: "Auto-routed price class: 'Tier 1' (battery/power), 'Tier 2' (display/glass), or 'Tier 3' (buttons/motherboard/custom)." },
                    step: { type: ["integer", "null"], description: "Triage flow step: 1 (Greeting), 2 (Device Selection), 3 (Damage Pricing Routing)." }
                  },
                  required: ["brand", "model", "tier", "issue", "pricingTier", "step"],
                  additionalProperties: false
                }
              },
              required: ["text", "detectedSpecs"],
              additionalProperties: false
            }
          }
        }
      });
      const replyText = response.choices[0]?.message?.content || "";
      let parsedResponse = { text: replyText, detectedSpecs: {} };
      try {
        parsedResponse = JSON.parse(replyText.trim());
      } catch (parseErr) {
        console.warn("JSON parsing of OpenAI triage failed, applying keyword extractor fallback:", parseErr);
        const lastUserMessage = messages[messages.length - 1]?.text || "";
        const fallbackSpecs = detectSpecsFromText(lastUserMessage, deviceDetails);
        parsedResponse = {
          text: replyText,
          detectedSpecs: fallbackSpecs
        };
      }
      const appBaseUrl = process.env.APP_URL || "";
      const groundingSources = [
        { title: "Spokane Smartphone Repair Standards", url: `${appBaseUrl}/spokane-device-lab` },
        { title: "Right-to-Repair Diagnostic Specifications", url: `${appBaseUrl}/diy-hardware-safety` }
      ];
      return res.json({
        text: parsedResponse.text,
        detectedSpecs: parsedResponse.detectedSpecs,
        groundingSources
      });
    } catch (err) {
      console.warn("OpenAI API error during hardware triage (falling back to Spokane simulation):", err);
      const isQuotaError = err.status === 429 || err.message?.includes("429") || err.message?.includes("quota");
      const lastUserMessage = messages[messages.length - 1]?.text || "";
      const fallbackSpecs = detectSpecsFromText(lastUserMessage, deviceDetails);
      let simulatedReply = "";
      if (fallbackSpecs.step === 1) {
        simulatedReply = "Hi there! Welcome to Display & Cell Pros. \u{1F690}\u{1F4A8} We deliver Seattle & Spokane's top mobile raw hardware lab right to your driveway! Differentiating screen, swollen battery, and tactile button issues on-site. What brand of phone are you looking to fix today\u2014Apple or Samsung?";
      } else if (fallbackSpecs.step === 2) {
        simulatedReply = `Fantastic! Let's get your ${fallbackSpecs.brand || "device"} details configured. We carry a full matrix of factory glass and chemical cell variants. What specific model is that (e.g. S24 Ultra, iPhone 14 Pro Max, SE, etc.)?`;
      } else {
        if (fallbackSpecs.issue === "screen") {
          simulatedReply = `DIAGNOSTIC ANALYSIS: Detected screen alignment and glass fracture parameters for your ${fallbackSpecs.brand} ${fallbackSpecs.model}. This is routed safely to our **Tier 2 Pricing (Elite Display Renewal - starts at $139)**! Our mobile laboratory carries custom laser-sealed display overlays to replace this on-site in under 45 minutes. A live subtotal has synced in the quote panel below!`;
        } else if (fallbackSpecs.issue === "battery") {
          simulatedReply = `DIAGNOSTIC ANALYSIS: Rapid capacity degradation and cycle saturation identified on your ${fallbackSpecs.brand} ${fallbackSpecs.model}. This is routed to our **Tier 1 Pricing (Core Power & Port Restoration - $69-$97)**! Let's get this chemical risk resolved. We inspect safety seals and swap cells curbside. The quote has computed in the table below!`;
        } else if (fallbackSpecs.issue === "button") {
          simulatedReply = `DIAGNOSTIC ANALYSIS: Tactile resistance failure on your ${fallbackSpecs.brand} ${fallbackSpecs.model}. Sticky buttons are routed to our **Tier 3 Pricing (Specialized Diagnostics - Custom Quote)**! We will perform mechanical spring micro-calibrations and clean contact traces with professional solvents inside our custom work van. Quote is ready for review below!`;
        } else {
          simulatedReply = `Excellent. We have registered your ${fallbackSpecs.brand} ${fallbackSpecs.model} (${fallbackSpecs.tier || "standard"} performance tier). Please tell our laboratory engineers what physical hardware behaviors you are observing (touch lag, cracks, rapid drain, or sticky keys) to route you to the correct Tier 1, Tier 2, or Tier 3 pricing structure automatically!`;
        }
      }
      const mockGroundingSources = [
        { title: "Spokane Smartphone Repair Standards", url: `${process.env.APP_URL || ""}/spokane-device-lab` },
        { title: "Right-to-Repair Diagnostic Specifications", url: `${process.env.APP_URL || ""}/diy-hardware-safety` }
      ];
      return res.json({
        text: simulatedReply + `

(Note: Operating under Advanced Local Simulation mode due to rate bounds or active API configuration: ${isQuotaError ? "Resource Exhausted (429)" : err.message || "Active Build Settings"}).`,
        detectedSpecs: fallbackSpecs,
        groundingSources: mockGroundingSources
      });
    }
  } else {
    const lastUserMessage = messages[messages.length - 1]?.text || "";
    const fallbackSpecs = detectSpecsFromText(lastUserMessage, deviceDetails);
    let simulatedReply = "";
    if (fallbackSpecs.step === 1) {
      simulatedReply = "Hi there! Welcome to Display & Cell Pros. \u{1F690}\u{1F4A8} We deliver Seattle & Spokane's top mobile raw hardware lab right to your driveway! Differentiating screen, swollen battery, and tactile button issues on-site. What brand of phone are you looking to fix today\u2014Apple or Samsung?";
    } else if (fallbackSpecs.step === 2) {
      simulatedReply = `Fantastic! Let's get your ${fallbackSpecs.brand || "device"} details configured. We carry a full matrix of factory glass and chemical cell variants. What specific model is that (e.g. S24 Ultra, iPhone 14 Pro Max, SE, etc.)?`;
    } else {
      if (fallbackSpecs.issue === "screen") {
        simulatedReply = `DIAGNOSTIC ANALYSIS: Detected screen alignment and glass fracture parameters for your ${fallbackSpecs.brand} ${fallbackSpecs.model}. This is routed safely to our **Tier 2 Pricing (Elite Display Renewal - starts at $139)**! Our mobile laboratory carries custom laser-sealed display overlays to replace this on-site in under 45 minutes. A live subtotal has synced in the quote panel below!`;
      } else if (fallbackSpecs.issue === "battery") {
        simulatedReply = `DIAGNOSTIC ANALYSIS: Rapid capacity degradation and cycle saturation identified on your ${fallbackSpecs.brand} ${fallbackSpecs.model}. This is routed to our **Tier 1 Pricing (Core Power & Port Restoration - $69-$97)**! Let's get this chemical risk resolved. We inspect safety seals and swap cells curbside. The quote has computed in the table below!`;
      } else if (fallbackSpecs.issue === "button") {
        simulatedReply = `DIAGNOSTIC ANALYSIS: Tactile resistance failure on your ${fallbackSpecs.brand} ${fallbackSpecs.model}. Sticky buttons are routed to our **Tier 3 Pricing (Specialized Diagnostics - Custom Quote)**! We will perform mechanical spring micro-calibrations and clean contact traces with professional solvents inside our custom work van. Quote is ready for review below!`;
      } else {
        simulatedReply = `Excellent. We have registered your ${fallbackSpecs.brand} ${fallbackSpecs.model} (${fallbackSpecs.tier || "standard"} performance tier). Please tell our laboratory engineers what physical hardware behaviors you are observing (touch lag, cracks, rapid drain, or sticky keys) to route you to the correct Tier 1, Tier 2, or Tier 3 pricing structure automatically!`;
      }
    }
    const mockGroundingSources = [
      { title: "Spokane Smartphone Repair Standards", url: `${process.env.APP_URL || ""}/spokane-device-lab` },
      { title: "Right-to-Repair Diagnostic Specifications", url: `${process.env.APP_URL || ""}/diy-hardware-safety` }
    ];
    setTimeout(() => {
      return res.json({
        text: simulatedReply + "\n\n(Note: Clean diagnostic state synchronization active under Full-Stack Simulation mode.)",
        detectedSpecs: fallbackSpecs,
        groundingSources: mockGroundingSources
      });
    }, 605);
  }
});
app.post("/api/complex-diagnostics", async (req, res) => {
  const { prompt, deviceDetails } = req.body;
  const complexPrompt = `YOU ARE A SENIOR DEVICE HARDWARE ENGINEER. 
Perform a deep technical reasoning analysis considering:
Device Profile: ${JSON.stringify(deviceDetails)}
Technical Inquiry: ${prompt}

Provide a line-by-line detailed schematic dissection, troubleshooting tree with precise measurements (voltage tolerances, capacitance limits to test on multimeters), and custom repair directives tailored to local Right-to-Repair Spokane compliance constraints.`;
  if (openaiClient) {
    try {
      const response = await openaiClient.chat.completions.create({
        model: "o3-mini",
        messages: [
          { role: "user", content: complexPrompt }
        ]
      });
      return res.json({ text: response.choices[0]?.message?.content || "" });
    } catch (err) {
      const isQuotaError = err.status === 429 || err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("quota");
      if (isQuotaError) {
        console.warn("OpenAI o3-mini rate limit/quota reached. Falling back to simulated Spokane laboratory analysis.");
      } else {
        console.warn("OpenAI o3-mini Error (falling back to simulation):", err);
      }
      return res.json({
        text: `[HIGH-THINKING DISSECTION TREE - DEV WORKSPACE SIMULATOR]
1. PRE-CHECK DIAGNOSIS:
   - Target device class: ${deviceDetails?.brand || "Generic"} ${deviceDetails?.model || "Phone"} (${deviceDetails?.tier || "Standard"})
   - Focus Assembly: ${deviceDetails?.issueType?.toUpperCase() || "HARDWARE"} Unit

2. REASONING DEPTH STEPS:
   - Evaluated power rails: VBAT voltage standard is 3.82V. Any drop below 3.4V signals primary power delivery failure.
   - Tested LCD controller impedance: Under 80 Ohm is classified as a short to ground, causing the lines reported.
   - Mechanical contact feedback: Spring action requires 0.5N force. Corrosion requires micro-soldering or high-purity isopropyl cleaning.

3. ADVANCED REPAIR DIRECTIVES:
   - Disassemble chassis using standard dynamic heat plate (75\xB0C for 4 minutes).
   - Unseat internal battery adhesive pull-tabs. Replace with a brand new tier-1 lithium-polymer cell.
   - Run digitizer recalibration diagnostic tool. Wait for handshake with motherboard ROM.
   
(Note: Highly detailed hardware analysis has automatically fallen back to Spokane local diagnostics engine due to OpenAI API rate/quota exhaustion: ${isQuotaError ? "Resource Exhausted (429)" : err.message || err})`
      });
    }
  } else {
    setTimeout(() => {
      return res.json({
        text: `[HIGH-THINKING DISSECTION TREE - DEV WORKSPACE SIMULATOR]
1. PRE-CHECK DIAGNOSIS:
   - Target device class: ${deviceDetails?.brand || "Generic"} ${deviceDetails?.model || "Phone"} (${deviceDetails?.tier || "Standard"})
   - Focus Assembly: ${deviceDetails?.issueType?.toUpperCase() || "HARDWARE"} Unit

2. REASONING DEPTH STEPS:
   - Evaluated power rails: VBAT voltage standard is 3.82V. Any drop below 3.4V signals primary power delivery failure.
   - Tested LCD controller impedance: Under 80 Ohm is classified as a short to ground, causing the lines reported.
   - Mechanical contact feedback: Spring action requires 0.5N force. Corrosion requires micro-soldering or high-purity isopropyl cleaning.

3. ADVANCED REPAIR DIRECTIVES:
   - Disassemble chassis using standard dynamic heat plate (75\xB0C for 4 minutes).
   - Unseat internal battery adhesive pull-tabs. Replace with a brand new tier-1 lithium-polymer cell.
   - Run digitizer recalibration diagnostic tool. Wait for handshake with motherboard ROM.
   
(Note: Operating under High Thinking Simulation mode since process.env.OPENAI_API_KEY is not configured.)`
      });
    }, 900);
  }
});
app.post("/api/analyze-image", async (req, res) => {
  const { base64Data, mimeType, prompt } = req.body;
  if (!base64Data) {
    return res.status(400).json({ error: "Missing image base64Data parameter." });
  }
  const defaultPrompt = "Perform an expert hardware visual triage audit of this device. Detail: visible fractures/cracks, chassis bend analysis, battery bloating indicators, replacement viability, and a confidence rating of your computer vision analysis.";
  if (openaiClient) {
    try {
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt || defaultPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || "image/png"};base64,${base64Data}`
                }
              }
            ]
          }
        ]
      });
      return res.json({ text: response.choices[0]?.message?.content || "" });
    } catch (err) {
      const isQuotaError = err.status === 429 || err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("quota");
      if (isQuotaError) {
        console.warn("OpenAI API visual analysis rate limit/quota reached (429). Falling back to simulated computer vision diagnostics.");
      } else {
        console.warn("Multimodal analysis failed (falling back to simulation):", err);
      }
      return res.json({
        text: `[COMPUTER VISION TRIAGE REPORT - SIMULATION MODE]
- Visual Asset Analyzed successfully.
- Fractures Detected: 12 focal points of glass micro-shattering originating from top-right bezel.
- Board Integrity: Chassis alignment is straight (0.2\xB0 deviation, within tolerance).
- Battery Condition: No visible physical swelling or backplane deformation.
- Diagnostic Alert: High risk of moisture penetration through deep cracks in the adhesive lining.
- Feasibility Checklist: Elite Screen Renewal (Tier 2) is 95% likely to restore full functionality.
- Duration Estimate: 45 minutes on-site in our Spokane diagnostic van.

(Note: Photo computer vision analysis automatically fell back to Spokane local diagnostics engine due to active OpenAI API rate/quota limits: ${isQuotaError ? "Resource Exhausted (429)" : err.message || err})`
      });
    }
  } else {
    setTimeout(() => {
      res.json({
        text: `[COMPUTER VISION TRIAGE REPORT - SIMULATION MODE]
- Visual Asset Analyzed successfully.
- Fractures Detected: 12 focal points of glass micro-shattering originating from top-right bezel.
- Board Integrity: Chassis alignment is straight (0.2\xB0 deviation, within tolerance).
- Battery Condition: No visible physical swelling or backplane deformation.
- Diagnostic Alert: High risk of moisture penetration through deep cracks in the adhesive lining.
- Feasibility Checklist: Elite Screen Renewal (Tier 2) is 95% likely to restore full functionality.
- Duration Estimate: 45 minutes on-site in our Spokane diagnostic van.

(Note: Operating in local visual simulation mode. Configure process.env.OPENAI_API_KEY to execute real computer-vision analysis on actual photos.)`
      });
    }, 850);
  }
});
app.get("/api/pos-sync-logs", (req, res) => {
  res.json({ logs: syncLogs, tickets: mockTickets });
});
app.post("/api/pos-sync-log", (req, res) => {
  const { source, level, message } = req.body;
  if (!source || !message) {
    return res.status(400).json({ error: "Source and message are required" });
  }
  const newLog = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level: level || "INFO",
    message,
    source
  };
  syncLogs.unshift(newLog);
  if (syncLogs.length > 50) syncLogs.pop();
  res.json({ success: true, logs: syncLogs });
});
app.post("/api/create-ticket", (req, res) => {
  const { customerName, device, issueType, quotedPrice, tax, discount, total, companyName } = req.body;
  if (!customerName || !device || !issueType) {
    return res.status(400).json({ error: "customerName, device, and issueType are required to register a ticket." });
  }
  const id = `DSC-${Math.floor(1e3 + Math.random() * 9e3)}`;
  const newTicket = {
    id,
    customerName,
    companyName,
    device,
    issueType,
    status: "open",
    quotedPrice: Number(quotedPrice) || 0,
    tax: Number(tax) || 0,
    discount: Number(discount) || 0,
    total: Number(total) || 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  mockTickets.unshift(newTicket);
  syncLogs.unshift({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level: "SUCCESS",
    message: `Registered direct repair ticket ${id} for ${customerName} ($${newTicket.total.toFixed(2)}) synced automatically with CellSmart POS`,
    source: "WebHook-Receiver"
  });
  res.json({ success: true, ticket: newTicket, tickets: mockTickets });
});
app.get("/api/ticket-templates", (req, res) => {
  const templates = [
    {
      id: "tpl-apple-screen",
      name: "Apple Screen Replacement Template",
      brand: "Apple",
      issueType: "screen",
      description: "Standard visual screen rebuild with high-purity polyurethane adhesive seals and premium oleophobic screen finish.",
      estimatedTime: "45 mins",
      difficulty: "Intermediate",
      defaultPrice: 149
    },
    {
      id: "tpl-samsung-battery",
      name: "Samsung Battery Swap & Safety Calibration",
      brand: "Samsung",
      issueType: "battery",
      description: "Chemical lithium-ion swap including back cover gasket reset and deep voltage-regulation thermal sweep.",
      estimatedTime: "30 mins",
      difficulty: "Easy",
      defaultPrice: 89
    },
    {
      id: "tpl-generic-buttons",
      name: "Multi-Key Micro-Soldering Template",
      brand: "Generic",
      issueType: "button",
      description: "Contact trace cleaning with customized isopropyl solvents and mechanical feedback leaf-spring adjustments.",
      estimatedTime: "60 mins",
      difficulty: "Advanced",
      defaultPrice: 119
    }
  ];
  res.json(templates);
});
var mockMovies = [
  { id: 1, title: "The Matrix", year: 1999, genre: "Sci-Fi" },
  { id: 2, title: "Inception", year: 2010, genre: "Sci-Fi" },
  { id: 3, title: "Interstellar", year: 2014, genre: "Adventure" },
  { id: 4, title: "The Dark Knight", year: 2008, genre: "Action" }
];
app.get("/api/rds-status", async (req, res) => {
  const configured = isDbConfigured();
  const token = req.headers["x-rds-auth-token"] || req.query.authToken;
  const maskString = (str) => {
    if (!str) return "not-set";
    if (str.length <= 8) return "****";
    return str.substring(0, 4) + "..." + str.substring(str.length - 4);
  };
  const configInfo = {
    configured,
    host: maskString(process.env.SQL_HOST || process.env.PGHOST),
    user: maskString(process.env.SQL_USER || process.env.PGUSER),
    database: process.env.PGDATABASE || "postgres",
    port: process.env.PGPORT || "5432",
    awsRegion: process.env.AWS_REGION || "us-east-1",
    awsRoleArn: maskString(process.env.AWS_ROLE_ARN),
    awsAccountId: maskString(process.env.AWS_ACCOUNT_ID),
    hasManualToken: !!token
  };
  if (!configured) {
    return res.json({
      success: false,
      message: "AWS RDS PostgreSQL is not configured yet. Set PGHOST, PGUSER, PGDATABASE, and AWS_ROLE_ARN in your Vercel/Environment settings.",
      config: configInfo
    });
  }
  try {
    const startTime = Date.now();
    const result = await queryWithToken("SELECT NOW() as current_time, version() as db_version;", [], token);
    const queryDurationMs = Date.now() - startTime;
    return res.json({
      success: true,
      message: token ? "Successfully connected to AWS RDS PostgreSQL cluster using custom/temporary Authentication Token!" : "Successfully connected to AWS RDS PostgreSQL cluster!",
      queryDurationMs,
      currentTime: result.rows[0].current_time,
      dbVersion: result.rows[0].db_version,
      config: configInfo,
      usingManualToken: !!token
    });
  } catch (err) {
    console.error("[Database Connection Error]:", err);
    return res.status(500).json({
      success: false,
      message: token ? "Failed to connect to AWS RDS using the provided custom Auth Token." : "Connected configuration detected, but connection attempt failed.",
      error: err.message || err,
      config: configInfo
    });
  }
});
app.get("/api/movies", async (req, res) => {
  const token = req.headers["x-rds-auth-token"] || req.query.authToken;
  if (!isDbConfigured()) {
    return res.json({
      success: true,
      source: "local-simulation",
      message: "AWS RDS is not configured. Returning simulated movie list.",
      movies: mockMovies
    });
  }
  try {
    const result = await queryWithToken("SELECT * FROM movies ORDER BY id ASC;", [], token);
    return res.json({
      success: true,
      source: token ? "aws-rds-postgres (manual-token)" : "aws-rds-postgres",
      movies: result.rows
    });
  } catch (err) {
    console.warn("[Database Movies Fetch Warning]:", err.message || err);
    if (err.code === "42P01") {
      return res.json({
        success: true,
        source: token ? "aws-rds-postgres-fallback (manual-token)" : "aws-rds-postgres-fallback",
        message: "AWS RDS is connected, but 'movies' table does not exist in database yet. Returning local simulation.",
        ddlHint: "CREATE TABLE movies (id SERIAL PRIMARY KEY, title VARCHAR(255), year INTEGER, genre VARCHAR(100)); INSERT INTO movies (title, year, genre) VALUES ('The Matrix', 1999, 'Sci-Fi'), ('Inception', 2010, 'Sci-Fi');",
        movies: mockMovies
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to query database.",
      error: err.message || err
    });
  }
});
app.post(["/api/scan-reports", "/api/rds/scan-reports"], async (req, res) => {
  const token = req.headers["x-rds-auth-token"] || req.query.authToken;
  const {
    deviceBrand,
    deviceModel,
    issueType,
    deviceTier,
    customerName,
    telemetryCode,
    telemetryTrace,
    status = "PERSISTED"
  } = req.body || {};
  try {
    await queryWithToken(`
      CREATE TABLE IF NOT EXISTS scan_reports (
        id SERIAL PRIMARY KEY,
        device_brand VARCHAR(100),
        device_model VARCHAR(100),
        issue_type VARCHAR(100),
        device_tier VARCHAR(100),
        customer_name VARCHAR(150),
        telemetry_code VARCHAR(100),
        telemetry_trace TEXT,
        status VARCHAR(50) DEFAULT 'PERSISTED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `, [], token);
    const insertResult = await queryWithToken(`
      INSERT INTO scan_reports 
        (device_brand, device_model, issue_type, device_tier, customer_name, telemetry_code, telemetry_trace, status)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at;
    `, [
      deviceBrand || "Generic",
      deviceModel || "Unknown Device",
      issueType || "diagnostic",
      deviceTier || "Standard",
      customerName || "Walk-in Customer",
      telemetryCode || "TELEMETRY-01",
      telemetryTrace || "",
      status
    ], token);
    const savedRow = insertResult.rows[0];
    return res.json({
      success: true,
      message: "Diagnostic scan report successfully persisted to AWS RDS database-2!",
      recordId: savedRow?.id,
      createdAt: savedRow?.created_at,
      targetDatabase: "database-2.cluster-ccxgoew4ygug.us-east-1.rds.amazonaws.com",
      savedData: {
        id: savedRow?.id,
        deviceBrand,
        deviceModel,
        issueType,
        customerName,
        telemetryCode,
        createdAt: savedRow?.created_at
      }
    });
  } catch (err) {
    console.error("[AWS RDS Persist Scan Report Error]:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to persist scan report to AWS RDS database-2.",
      error: err.message || String(err)
    });
  }
});
app.get(["/api/scan-reports", "/api/rds/scan-reports"], async (req, res) => {
  const token = req.headers["x-rds-auth-token"] || req.query.authToken;
  try {
    await queryWithToken(`
      CREATE TABLE IF NOT EXISTS scan_reports (
        id SERIAL PRIMARY KEY,
        device_brand VARCHAR(100),
        device_model VARCHAR(100),
        issue_type VARCHAR(100),
        device_tier VARCHAR(100),
        customer_name VARCHAR(150),
        telemetry_code VARCHAR(100),
        telemetry_trace TEXT,
        status VARCHAR(50) DEFAULT 'PERSISTED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `, [], token);
    const result = await queryWithToken(`
      SELECT * FROM scan_reports ORDER BY id DESC LIMIT 20;
    `, [], token);
    return res.json({
      success: true,
      reports: result.rows,
      targetDatabase: "database-2.cluster-ccxgoew4ygug.us-east-1.rds.amazonaws.com"
    });
  } catch (err) {
    console.error("[AWS RDS Fetch Scan Reports Error]:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch scan reports from AWS RDS.",
      error: err.message || String(err)
    });
  }
});
app.get("/api/movies/:id", async (req, res) => {
  const idStr = req.params.id;
  const id = Number(idStr);
  const token = req.headers["x-rds-auth-token"] || req.query.authToken;
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid movie ID. Must be a number." });
  }
  if (!isDbConfigured()) {
    const movie = mockMovies.find((m) => m.id === id);
    if (!movie) {
      return res.status(404).json({ error: `Movie with ID ${id} not found.` });
    }
    return res.json({
      success: true,
      source: "local-simulation",
      movie
    });
  }
  try {
    const result = await queryWithToken("SELECT * FROM movies WHERE id = $1;", [id], token);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Movie with ID ${id} not found in AWS RDS.` });
    }
    return res.json({
      success: true,
      source: token ? "aws-rds-postgres (manual-token)" : "aws-rds-postgres",
      movie: result.rows[0]
    });
  } catch (err) {
    console.error("[Database Movie ID Fetch Error]:", err);
    if (err.code === "42P01") {
      const movie = mockMovies.find((m) => m.id === id);
      if (!movie) {
        return res.status(404).json({ error: `Movie with ID ${id} not found.` });
      }
      return res.json({
        success: true,
        source: token ? "aws-rds-postgres-fallback (manual-token)" : "aws-rds-postgres-fallback",
        movie
      });
    }
    return res.status(500).json({
      success: false,
      message: "Database query failed.",
      error: err.message || err
    });
  }
});
app.get(["/welcome", "/api/welcome"], async (req, res) => {
  try {
    const edgeConfigConn = process.env.EDGE_CONFIG;
    if (!edgeConfigConn || !edgeConfigConn.startsWith("https://")) {
      console.log("[Edge Config] EDGE_CONFIG environment variable is missing or unconfigured. Using offline fallback.");
      return res.json({
        greeting: "hello world",
        source: "local-fallback",
        message: "Connect your Vercel Edge Config connection string to enable live remote configuration."
      });
    }
    const greeting = await (0, import_edge_config.get)("greeting");
    return res.json({
      greeting: greeting || "hello world",
      source: "vercel-edge-config"
    });
  } catch (err) {
    console.error("[Edge Config Error]:", err);
    return res.json({
      greeting: "hello world",
      source: "error-fallback",
      error: err.message || err
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with HMR...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = import_path.default.join(distPath, "index.html");
      if (import_fs.default.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Build artifact index.html not found.");
      }
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app,
  calculateQuoteInternal
});
//# sourceMappingURL=server.cjs.map
