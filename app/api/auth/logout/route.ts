import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';
import { databaseDisabledResponse, serverError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function POST() {
  const disabled = databaseDisabledResponse();
  if (disabled) return disabled;

  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
