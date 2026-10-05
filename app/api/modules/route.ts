import { NextResponse } from 'next/server';
import { getModules } from '@/lib/netlearn-db';

export async function GET() {
  const modules = getModules();
  return NextResponse.json({ modules });
}
