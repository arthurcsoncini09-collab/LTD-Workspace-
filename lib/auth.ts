import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { query } from './postgres';
import type { AccountUser } from './progress-types';

// Login por e-mail e senha, sem serviços externos.
// - Senhas: scrypt com sal aleatório (nunca guardamos a senha em texto).
// - Sessões: token aleatório num cookie httpOnly; no banco fica só o hash SHA-256 do token,
//   então um vazamento da tabela `sessions` não permite entrar na conta de ninguém.

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = 'netlearn_session';
const SESSION_DAYS = 30;
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltB64, hashB64] = stored.split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scryptAsync(password, Buffer.from(saltB64, 'base64'), expected.length);
  return timingSafeEqual(actual, expected);
}

// Usado quando o e-mail não existe, para que a resposta demore o mesmo tempo
// e não revele quais e-mails têm conta.
let dummyHash: Promise<string> | null = null;
export function getDummyHash() {
  dummyHash ??= hashPassword('netlearn-dummy-password');
  return dummyHash;
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await query('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)', [hashToken(token), userId, expiresAt]);
  // Aproveita para limpar sessões vencidas deste usuário.
  await query('DELETE FROM sessions WHERE user_id = $1 AND expires_at < now()', [userId]);

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
  cookies().delete(SESSION_COOKIE);
}

/** Usuário da sessão atual, ou null se não houver sessão válida. */
export async function getCurrentUser(): Promise<AccountUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await query<{ id: string; name: string; email: string }>(
    `SELECT u.id::text AS id, u.name, u.email
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)],
  );
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Validação dos formulários

export const normalizeEmail = (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
export const isValidEmail = (email: string) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPassword = (value: unknown): value is string =>
  typeof value === 'string' && value.length >= 8 && value.length <= 200;
export const normalizeName = (value: unknown) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, 60) : '');
