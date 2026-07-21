import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './lib/db';
import { getAuthSession, unauthorized } from './lib/auth-utils';
import { verifyRecaptcha } from './lib/recaptcha';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getAuthSession(req);
  if (!session?.user?.email) {
    return unauthorized(res);
  }

  try {
    if (req.method === 'GET') {
      const result = await query(
        'SELECT * FROM tickets WHERE "userId" IN (SELECT id FROM users WHERE email = $1) ORDER BY "createdAt" DESC',
        [session.user.email]
      );
      return res.status(200).json({ tickets: result.rows });
    }

    if (req.method === 'POST') {
      const { id, customerName, device, issueType, status, quotedPrice, tax, discount, total, captchaToken } = req.body;

      // Verify reCAPTCHA
      const isValidCaptcha = await verifyRecaptcha(captchaToken, 'SUBMIT_TICKET');
      if (!isValidCaptcha) {
        return res.status(403).json({ error: 'Bot protection check failed. Please try again.' });
      }

      // Upsert user if not exists and get ID
      await query('INSERT INTO users (email, name) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING', [session.user.email, session.user.name]);
      const userRes = await query('SELECT id FROM users WHERE email = $1', [session.user.email]);
      const userId = userRes.rows[0]?.id;

      await query(
        'INSERT INTO tickets (id, "customerName", device, "issueType", status, "quotedPrice", tax, discount, total, "userId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [id, customerName, device, issueType, status, quotedPrice, tax, discount, total, userId]
      );
      return res.status(201).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('[API Tickets Error]:', err);
    return res.status(500).json({ error: err.message });
  }
}
