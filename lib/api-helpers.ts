import { NextResponse } from 'next/server';
import { isDatabaseEnabled } from './postgres';

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Resposta padrão quando o site roda sem banco (progresso só no navegador). */
export function databaseDisabledResponse() {
  return isDatabaseEnabled() ? null : jsonError('Banco de dados não configurado. Defina DATABASE_URL.', 503);
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Registra o erro no servidor sem expor detalhes ao navegador. */
export function serverError(error: unknown) {
  console.error('[netlearn]', error);
  return jsonError('Erro interno. Tente novamente em instantes.', 500);
}
