import { cn } from './cn';

export type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red';

const tones: Record<BadgeTone, string> = {
  neutral: 'border-border bg-muted text-slate-300',
  blue: 'border-blue-500/25 bg-blue-500/10 text-blue-300',
  green: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  red: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
};

export function Badge({ tone = 'neutral', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium', tones[tone], className)} {...props} />;
}
