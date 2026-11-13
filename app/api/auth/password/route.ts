import { NextResponse } from 'next/server';
import { checkUserPassword, destroyOtherSessions, getCurrentUser, hashPassword, isValidPassword } from '@/lib/auth';
import { databaseDisabledResponse, jsonError, readJson, serverError } from '@/lib/api-helpers';
import { query } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

/** Troca a senha. Pede a senha atual e encerra as sessões abertas em outros aparelhos. */
export async function POST(request: Request) {
  const disabled = databaseDisabledResponse();
  if (disabled) return disabled;

  const body = await readJson(request);
  const newPassword = body?.newPassword;
  if (!isValidPassword(newPassword)) return jsonError('A nova senha precisa ter pelo menos 8 caracteres.', 400);

  try {
    const user = await getCurrentUser();
    if (!user) return jsonError('Sua sessão expirou. Entre de novo para trocar a senha.', 401);
    if (!(await checkUserPassword(user.id, body?.currentPassword))) return jsonError('A senha atual está incorreta.', 403);
    if (body?.currentPassword === newPassword) return jsonError('A nova senha precisa ser diferente da atual.', 400);

    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [await hashPassword(newPassword), user.id]);
    await destroyOtherSessions(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
