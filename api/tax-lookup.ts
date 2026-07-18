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

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { zipCode } = req.body;
  if (!zipCode) {
    return res.status(400).json({ error: "zipCode is required." });
  }

  const cleanedZip = zipCode.trim();
  const location = WA_TAX_DATA[cleanedZip];

  if (location) {
    res.status(200).json({
      valid: true,
      zipCode: cleanedZip,
      city: location.city,
      rate: location.rate,
      message: `WASHINGTON TAX COMPLIANT: Destined delivery in ${location.city} (${cleanedZip}) is subject to ${location.rate * 100}% local combined sales tax.`,
    });
  } else {
    const isWA = cleanedZip.startsWith("98") || cleanedZip.startsWith("99");
    if (isWA) {
      res.status(200).json({
        valid: true,
        zipCode: cleanedZip,
        city: "Washington State Destination",
        rate: 0.088,
        message: `WASHINGTON TAX COMPLIANT: Estimated Washington Destination Sales Tax base of 8.8% applied for ZIP ${cleanedZip}.`,
      });
    } else {
      res.status(200).json({
        valid: false,
        zipCode: cleanedZip,
        city: "Out of State",
        rate: 0,
        message: "Out of State destination. No Washington destination sales tax collected.",
      });
    }
  }
}
