import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: "UP",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    platform: "Vercel Serverless"
  });
}
