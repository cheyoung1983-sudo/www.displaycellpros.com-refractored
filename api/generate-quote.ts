import type { VercelRequest, VercelResponse } from '@vercel/node';

const WA_TAX_DATA: Record<string, { city: string; rate: number }> = {
  "98101": { city: "Seattle", rate: 0.1035 },
  "98004": { city: "Bellevue", rate: 0.101 },
  "98402": { city: "Tacoma", rate: 0.103 },
  "98052": { city: "Redmond", rate: 0.101 },
  "98201": { city: "Everett", rate: 0.099 },
  "98501": { city: "Olympia", rate: 0.095 },
  "99201": { city: "Spokane", rate: 0.090 },
  "98660": { city: "Vancouver", rate: 0.087 },
};

function calculateQuoteInternal(issueType: string, deviceTier: string) {
  let partsCost = 45;
  let laborHours = 1.5;
  const hourlyLaborRate = 85;
  const overheadMultiplier = 1.15;

  if (issueType === "screen") {
    partsCost = deviceTier === "flagship" ? 180 : deviceTier === "midrange" ? 95 : 55;
    laborHours = deviceTier === "flagship" ? 2.0 : 1.5;
  } else if (issueType === "battery") {
    partsCost = deviceTier === "flagship" ? 45 : deviceTier === "midrange" ? 35 : 25;
    laborHours = 1.0;
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
    subtotal: finalPrice,
  };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { issueType, deviceTier, zipCode, isCorporate, companyName } = req.body;

  if (!issueType || !deviceTier) {
    return res.status(400).json({ error: "issueType and deviceTier are required." });
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
  if (isCorporate) {
    discountAmount = Math.round((billing.subtotal * 0.2) * 100) / 100;
  }

  const subtotalAfterDiscount = Math.round((billing.subtotal - discountAmount) * 100) / 100;
  const calculatedTax = Math.round((subtotalAfterDiscount * taxRate) * 100) / 100;
  const grandTotal = Math.round((subtotalAfterDiscount + calculatedTax) * 100) / 100;

  const bookingSummary = `REPAIR QUOTE: ${deviceTier.toUpperCase()} ${issueType.toUpperCase()} - Total: $${grandTotal.toFixed(2)} (Ref: ${companyName || 'Retail'}-${Math.random().toString(36).substring(7).toUpperCase()})`;

  res.status(200).json({
    baseQuote: billing,
    taxInfo: {
      zipCode: zipCode || "98101",
      city: taxCity,
      rate: taxRate,
      calculatedTax,
    },
    discountInfo: {
      applied: !!isCorporate,
      percentage: 20,
      amount: discountAmount,
      company: companyName || "Corporate Account",
    },
    subtotal: subtotalAfterDiscount,
    grandTotal,
    bookingSummary
  });
}
