import { getModuleSummaries } from '@/lib/netlearn-db';
import { DashboardView } from '@/components/progress-views';

export default function DashboardPage() {
  return <DashboardView modules={getModuleSummaries()} />;
}
