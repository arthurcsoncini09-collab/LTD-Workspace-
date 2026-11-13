import { CertificatesHub } from '@/components/certificates/certificate-views';
import { shortTitle } from '@/lib/certificates';
import { getModuleSummaries } from '@/lib/netlearn-db';

export const metadata = {
  title: 'Certificados | NetLearn',
  description: 'Certificados de conclusão de cada módulo da trilha Fundamentos de Redes, para imprimir ou salvar em PDF.',
};

export default function CertificadosPage() {
  const modules = getModuleSummaries().map(({ slug, title, order_index, lessonCount, questionCount }) => ({ slug, title: shortTitle(title), order_index, lessonCount, questionCount }));
  return <CertificatesHub modules={modules} />;
}
