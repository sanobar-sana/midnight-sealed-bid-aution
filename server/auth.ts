import { createHash, randomBytes } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Db } from 'mongodb';

const COOKIE_NAME = 'midnight_bid_session';
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function issueSessionCookie(req: VercelRequest, res: VercelResponse, token: string) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const secure = process.env.VERCEL === '1' || forwardedProto === 'https';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_LIFETIME_MS / 1000}${secure ? '; Secure' : ''}`);
}

export function clearSessionCookie(req: VercelRequest, res: VercelResponse) {
  const secure = process.env.VERCEL === '1' || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`);
}

export function readSessionToken(req: VercelRequest) {
  const cookie = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return cookie ? decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)) : null;
}

export async function getSession(db: Db, req: VercelRequest) {
  const token = readSessionToken(req);
  if (!token) return null;
  return db.collection('sessions').findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
}

export function isSameOrigin(req: VercelRequest) {
  const origin = req.headers.origin;
  if (!origin || !req.headers.host) return false;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}

export function newSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function sessionExpiry() {
  return new Date(Date.now() + SESSION_LIFETIME_MS);
}
