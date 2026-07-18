import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDbConfigured, queryWithToken } from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const configured = isDbConfigured();
  if (!configured) {
    return res.status(200).json({ success: false, message: "Database not configured" });
  }

  try {
    const result = await queryWithToken("SELECT NOW() as time, version();");
    res.status(200).json({
      success: true,
      time: result.rows[0].time,
      version: result.rows[0].version
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
