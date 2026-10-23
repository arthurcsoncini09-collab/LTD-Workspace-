import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { databaseDisabledResponse, jsonError, readJson, serverError } from '@/lib/api-helpers';
import { applyProgressAction, getProgress, parseProgressAction } from '@/lib/progress-db';

export const dynamic = 'force-dynamic';

/** Progresso salvo na conta do aluno. */
export async function GET() {
  const disabled = databaseDisabledResponse();
  if (disabled) return disabled;

  try {
    const user = await getCurrentUser();
    if (!user) return jsonError('Faça login para ver o progresso salvo.', 401);
    return NextResponse.json({ progress: await getProgress(user.id) });
  } catch (error) {
    return serverError(error);
  }
}

/** Aplica uma ação (concluir módulo, nota de quiz, visita, reset ou merge) e devolve o progresso atualizado. */
export async function POST(request: Request) {
  const disabled = databaseDisabledResponse();
  if (disabled) return disabled;

  const action = parseProgressAction(await readJson(request));
  if (!action) return jsonError('Ação de progresso inválida.', 400);

  try {
    const user = await getCurrentUser();
    if (!user) return jsonError('Faça login para salvar o progresso.', 401);
    return NextResponse.json({ progress: await applyProgressAction(user.id, action) });
  } catch (error) {
    return serverError(error);
  }
}
