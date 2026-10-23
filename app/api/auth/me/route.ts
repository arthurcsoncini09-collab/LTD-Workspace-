import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { serverError } from '@/lib/api-helpers';
import { isDatabaseEnabled } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isDatabaseEnabled()) return NextResponse.json({ databaseEnabled: false, user: null });

  try {
    return NextResponse.json({ databaseEnabled: true, user: await getCurrentUser() });
  } catch (error) {
    return serverError(error);
  }
}
