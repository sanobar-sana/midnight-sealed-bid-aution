import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMongo } from '../server/mongo';
import { getSession, isSameOrigin } from '../server/auth';

const transactionKinds = new Set(['createAuction', 'submitBid', 'closeAuction', 'revealBid', 'closeReveal', 'determineWinner', 'finalizeAuction']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!isSameOrigin(req)) return res.status(403).json({ error: 'Cross-origin request rejected.' });
  const txId = typeof req.body?.txId === 'string' ? req.body.txId.replace(/^0x/, '').toLowerCase() : '';
  const kind = req.body?.kind;
  const auctionId = typeof req.body?.auctionId === 'string' ? req.body.auctionId.toLowerCase() : null;
  if (!/^[0-9a-f]{64}$/.test(txId) || typeof kind !== 'string' || !transactionKinds.has(kind) || (auctionId !== null && !/^[0-9a-f]{64}$/.test(auctionId))) {
    return res.status(400).json({ error: 'Malformed transaction record.' });
  }
  try {
    const db = await getMongo();
    const session = await getSession(db, req);
    if (!session) return res.status(401).json({ error: 'Wallet authentication required.' });
    const confirmedAt = new Date();
    await db.collection('transactions').updateOne(
      { txId },
      { $setOnInsert: { txId, kind, auctionId, walletAddress: session.walletAddress ?? null, accountEmail: session.email ?? null, confirmedAt, source: 'wallet-reported-finalized' } },
      { upsert: true },
    );
    return res.status(201).json({ saved: true, authoritative: false });
  } catch {
    return res.status(503).json({ error: 'Transaction history is temporarily unavailable.' });
  }
}
