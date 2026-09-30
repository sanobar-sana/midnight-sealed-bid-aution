import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMongo } from '../../server/mongo';
import { clearSessionCookie, getSession, isSameOrigin } from '../../server/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!['GET', 'DELETE'].includes(req.method ?? '')) return res.status(405).json({ error: 'Method not allowed.' });
  if (req.method === 'DELETE' && !isSameOrigin(req)) return res.status(403).json({ error: 'Cross-origin request rejected.' });
  try {
    const db = await getMongo();
    const session = await getSession(db, req);
    if (req.method === 'DELETE') {
      if (session) await db.collection('sessions').deleteOne({ _id: session._id });
      clearSessionCookie(req, res);
      return res.status(200).json({ authenticated: false });
    }
    const accountSession = session && typeof session.email === 'string' && session.userId ? session : null;
    return res.status(200).json(accountSession ? { authenticated: true, user: { name: accountSession.name ?? '', email: accountSession.email }, walletAddress: accountSession.walletAddress ?? null } : { authenticated: false });
  } catch {
    return res.status(503).json({ error: 'Wallet session service is temporarily unavailable.' });
  }
}
