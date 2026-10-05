import { NextResponse } from 'next/server';
import { getModuleSummaries } from '@/lib/netlearn-db';

export async function GET() {
  return NextResponse.json({ modules: getModuleSummaries() });
}
