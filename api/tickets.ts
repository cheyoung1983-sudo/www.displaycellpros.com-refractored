import type { VercelRequest, VercelResponse } from '@vercel/node';
import { queryWithToken } from './lib/db';
import { getAuthSession, unauthorized } from './lib/auth-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getAuthSession(req);
  if (!session?.user?.email) {
    return unauthorized(res);
  }

  if (req.method === 'GET') {
    try {
      // Find the user ID in RDS first, or just use the email for now as a filter
      const result = await queryWithToken('SELECT * FROM tickets WHERE "userId" IN (SELECT id FROM users WHERE email = $1) ORDER BY "createdAt" DESC', [session.user.email]);
      return res.status(200).json({ tickets: result.rows });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { id, customerName, device, issueType, status, quotedPrice, tax, discount, total } = req.body;
    try {
      // Get user ID
      const userRes = await queryWithToken('SELECT id FROM users WHERE email = $1', [session.user.email]);
      const userId = userRes.rows[0]?.id;

      await queryWithToken(
        'INSERT INTO tickets (id, "customerName", device, "issueType", status, "quotedPrice", tax, discount, total, "userId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [id, customerName, device, issueType, status, quotedPrice, tax, discount, total, userId]
      );
      return res.status(201).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
