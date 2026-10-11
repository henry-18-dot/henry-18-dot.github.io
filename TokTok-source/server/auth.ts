import { createHash, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ApiError, type Env } from './types.ts';

export function tokenHash(value: string): string { return createHash('sha256').update(value).digest('hex'); }
export function isProduction(env: Env): boolean { return Boolean(env.VERCEL) || env.NODE_ENV === 'production'; }
export function configuredAuth(env: Env): boolean {
  return isProduction(env) ? /^[a-f0-9]{64}$/i.test(env.TOKEN_HASH || '') : Boolean(env.TOKEN_HASH || (env.LOCAL_ACCESS_CODE && env.LOCAL_ACCESS_CODE.length >= 24));
}
export function authenticate(authorization: string | undefined, env: Env): void {
  if (!configuredAuth(env)) throw new ApiError(503, '请先配置个人访问码');
  const match = authorization?.match(/^Bearer ([^\s]{24,256})$/);
  const expected = env.TOKEN_HASH || tokenHash(env.LOCAL_ACCESS_CODE || '');
  const supplied = tokenHash(match?.[1] || '');
  if (!/^[a-f0-9]{64}$/i.test(expected) || !timingSafeEqual(Buffer.from(supplied, 'hex'), Buffer.from(expected, 'hex'))) {
    throw new ApiError(401, '访问码不正确，请在设置中填写个人访问码');
  }
}
export function allowedOrigin(origin: string): boolean {
  if (origin === 'https://henry-18-dot.github.io') return true;
  try { const u = new URL(origin); return u.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(u.hostname) && u.origin === origin; } catch { return false; }
}
export function cors(req: IncomingMessage, res: ServerResponse): void {
  const origin = req.headers.origin;
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (origin) {
    if (!allowedOrigin(origin)) throw new ApiError(403, '此来源不能访问 AI 接口');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '600');
  }
}
