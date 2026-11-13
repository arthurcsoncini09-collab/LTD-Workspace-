import { NextResponse } from 'next/server';
import { checkUserPassword, clearSessionCookie, getCurrentUser } from '@/lib/auth';
import { databaseDisabledResponse, jsonError, readJson, serverError } from '@/lib/api-helpers';
import { query } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

/** Exclui a conta e todo o progresso salvo nela (as tabelas apagam em cascata). Pede a senha. */
export async function POST(request: Request) {
  const disabled = databaseDisabledResponse();
  if (disabled) return disabled;

  const body = await readJson(request);
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError('Sua sessão expirou. Entre de novo para excluir a conta.', 401);
    if (!(await checkUserPassword(user.id, body?.currentPassword))) return jsonError('A senha está incorreta.', 403);

    await query('DELETE FROM users WHERE id = $1', [user.id]);
    clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
