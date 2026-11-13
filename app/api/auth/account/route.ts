import { NextResponse } from 'next/server';
import { checkUserPassword, getCurrentUser, isValidEmail, normalizeEmail, normalizeName } from '@/lib/auth';
import { databaseDisabledResponse, jsonError, readJson, serverError } from '@/lib/api-helpers';
import { query } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

/** Altera o nome e/ou o e-mail da conta. Trocar o e-mail exige a senha atual. */
export async function POST(request: Request) {
  const disabled = databaseDisabledResponse();
  if (disabled) return disabled;

  const body = await readJson(request);
  const name = normalizeName(body?.name);
  const email = normalizeEmail(body?.email);
  if (!name) return jsonError('Informe seu nome.', 400);
  if (!isValidEmail(email)) return jsonError('Informe um e-mail válido.', 400);

  try {
    const user = await getCurrentUser();
    if (!user) return jsonError('Sua sessão expirou. Entre de novo para editar a conta.', 401);

    if (email !== user.email) {
      if (!(await checkUserPassword(user.id, body?.currentPassword))) {
        return jsonError('Para trocar o e-mail, confirme com a sua senha atual.', 403);
      }
      const taken = await query('SELECT 1 FROM users WHERE email = $1 AND id <> $2', [email, user.id]);
      if (taken.length) return jsonError('Já existe uma conta com este e-mail.', 409);
    }

    await query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, user.id]);
    return NextResponse.json({ user: { id: user.id, name, email } });
  } catch (error) {
    // Dois pedidos ao mesmo tempo com o mesmo e-mail: a restrição UNIQUE do banco decide.
    if ((error as { code?: string }).code === '23505') return jsonError('Já existe uma conta com este e-mail.', 409);
    return serverError(error);
  }
}
