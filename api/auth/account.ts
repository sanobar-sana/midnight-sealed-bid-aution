import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMongo } from '../../server/mongo';
import { hashToken, isSameOrigin, issueSessionCookie, sessionExpiry } from '../../server/auth';

const scrypt = promisify(scryptCallback);

async function passwordHash(password: string, salt: Buffer) {
  return Buffer.from((await scrypt(password, salt, 64)) as Buffer);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!isSameOrigin(req)) return res.status(403).json({ error: 'Cross-origin request rejected.' });
  const mode = req.body?.mode;
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (mode !== 'register' && mode !== 'signin') return res.status(400).json({ error: 'Choose register or sign in.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 10 || password.length > 256) return res.status(400).json({ error: 'Password must be at least 10 characters.' });
  if (mode === 'register' && (name.length < 2 || name.length > 80)) return res.status(400).json({ error: 'Enter your name (2–80 characters).' });

  try {
    const db = await getMongo();
    const users = db.collection('users');
    let user = await users.findOne({ email });
    if (mode === 'register') {
      if (user) return res.status(409).json({ error: 'An account with this email already exists. Sign in instead.' });
      const salt = randomBytes(16);
      const hash = await passwordHash(password, salt);
      const now = new Date();
      const inserted = await users.insertOne({ name, email, passwordSalt: salt.toString('hex'), passwordHash: hash.toString('hex'), createdAt: now, lastSeenAt: now });
      user = { _id: inserted.insertedId, name, email };
    } else {
      if (!user || typeof user.passwordSalt !== 'string' || typeof user.passwordHash !== 'string') {
        return res.status(401).json({ error: 'Email or password is incorrect.' });
      }
      const salt = Buffer.from(user.passwordSalt, 'hex');
      const stored = Buffer.from(user.passwordHash, 'hex');
      const actual = await passwordHash(password, salt);
      if (stored.length !== actual.length || !timingSafeEqual(stored, actual)) return res.status(401).json({ error: 'Email or password is incorrect.' });
      await users.updateOne({ _id: user._id }, { $set: { lastSeenAt: new Date() } });
    }
    const token = randomBytes(32).toString('base64url');
    const now = new Date();
    await db.collection('sessions').insertOne({ tokenHash: hashToken(token), userId: user._id, email, name: user.name ?? name, createdAt: now, expiresAt: sessionExpiry() });
    issueSessionCookie(req, res, token);
    return res.status(200).json({ authenticated: true, user: { name: user.name ?? name, email } });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return res.status(409).json({ error: 'An account with this email already exists. Sign in instead.' });
    return res.status(503).json({ error: 'Account service is temporarily unavailable.' });
  }
}
