import { NextResponse } from 'next/server';
import { getModuleBySlug } from '@/lib/netlearn-db';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const module = getModuleBySlug(params.slug);

  if (!module) {
    return NextResponse.json({ error: 'Módulo não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ module });
}
