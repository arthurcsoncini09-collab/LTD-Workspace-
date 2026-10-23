import { NextResponse } from 'next/server';
import { createSession, hashPassword, isValidEmail, isValidPassword, normalizeEmail, normalizeName } from '@/lib/auth';
import { databaseDisabledResponse, jsonError, readJson, serverError } from '@/lib/api-helpers';
import { query } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const disabled = databaseDisabledResponse();
  if (disabled) return disabled;

  const body = await readJson(request);
  const name = normalizeName(body?.name);
  const email = normalizeEmail(body?.email);
  const password = body?.password;

  if (!name) return jsonError('Informe seu nome.', 400);
  if (!isValidEmail(email)) return jsonError('Informe um e-mail válido.', 400);
  if (!isValidPassword(password)) return jsonError('A senha precisa ter pelo menos 8 caracteres.', 400);

  try {
    const rows = await query<{ id: string }>(
      'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING RETURNING id::text AS id',
      [email, name, await hashPassword(password)],
    );
    if (!rows[0]) return jsonError('Já existe uma conta com este e-mail.', 409);

    await createSession(rows[0].id);
    return NextResponse.json({ user: { id: rows[0].id, name, email } }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
