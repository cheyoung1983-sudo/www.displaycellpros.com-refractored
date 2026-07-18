import type { VercelRequest, VercelResponse } from '@vercel/node';
import { queryWithToken } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const result = await queryWithToken('SELECT * FROM movies ORDER BY id ASC');
    return res.status(200).json({ movies: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
