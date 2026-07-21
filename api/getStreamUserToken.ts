import type { VercelRequest, VercelResponse } from '@vercel/node';
import { StreamChat } from 'stream-chat';
import { getAuthSession, unauthorized } from './lib/auth-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getAuthSession(req);
  if (!session?.user?.email) {
    return unauthorized(res);
  }

  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Stream keys not configured' });
  }

  try {
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    // Use the user's email or a slugified version as the ID
    const userId = session.user.email.replace(/[^a-z0-9]/gi, '_');
    const token = serverClient.createToken(userId);

    return res.status(200).json({
      token,
      userId,
      userName: session.user.name || session.user.email
    });
  } catch (err: any) {
    console.error('Stream Token Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
