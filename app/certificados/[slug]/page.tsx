import { notFound } from 'next/navigation';
import { CertificateView } from '@/components/certificates/certificate-views';
import { TRAIL_SLUG } from '@/lib/certificates';
import { shortTitle } from '@/lib/certificates';
import { getModuleBySlug, getModuleSummaries } from '@/lib/netlearn-db';

type Props = { params: { slug: string } };

const summaries = () =>
  getModuleSummaries().map(({ slug, title, order_index, lessonCount, questionCount }) => ({ slug, title: shortTitle(title), order_index, lessonCount, questionCount }));

export function generateStaticParams() {
  return [...getModuleSummaries().map(({ slug }) => ({ slug })), { slug: TRAIL_SLUG }];
}

export function generateMetadata({ params }: Props) {
  if (params.slug === TRAIL_SLUG) return { title: 'Certificado da trilha completa | NetLearn' };
  const mod = getModuleBySlug(params.slug);
  return { title: mod ? `Certificado: ${mod.title} | NetLearn` : 'Certificado | NetLearn' };
}

export default function CertificadoPage({ params }: Props) {
  if (params.slug === TRAIL_SLUG) return <CertificateView kind="trail" modules={summaries()} />;
  const summary = summaries().find((m) => m.slug === params.slug);
  const mod = getModuleBySlug(params.slug);
  if (!summary || !mod) notFound();
  return <CertificateView kind="module" module={summary} lessons={mod.lessons.map((l) => l.title)} />;
}
