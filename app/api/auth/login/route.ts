import { NextResponse } from 'next/server';
import { createSession, getDummyHash, normalizeEmail, verifyPassword } from '@/lib/auth';
import { databaseDisabledResponse, jsonError, readJson, serverError } from '@/lib/api-helpers';
import { query } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const disabled = databaseDisabledResponse();
  if (disabled) return disabled;

  const body = await readJson(request);
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email || !password) return jsonError('Informe e-mail e senha.', 400);

  try {
    const rows = await query<{ id: string; name: string; email: string; password_hash: string }>(
      'SELECT id::text AS id, name, email, password_hash FROM users WHERE email = $1',
      [email],
    );
    const user = rows[0];
    // Verifica a senha mesmo sem usuário, para a resposta não revelar se o e-mail existe.
    const ok = await verifyPassword(password, user?.password_hash ?? (await getDummyHash()));
    if (!user || !ok) return jsonError('E-mail ou senha incorretos.', 401);

    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return serverError(error);
  }
}
