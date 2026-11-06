import Image from 'next/image';
import Link from 'next/link';
import { cn } from './ui/cn';

// Logo do NetLearn: o símbolo (capelo + globo + livro) e o nome em texto,
// com "Net" claro e "Learn" no azul da marca para ficar legível no tema escuro.

export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return <Image src="/brand/netlearn-emblem.png" alt="" width={size} height={size} priority className={cn('shrink-0 select-none', className)} />;
}

export function BrandLogo({ size = 32, tagline = false, className }: { size?: number; tagline?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="NetLearn — página inicial" className={cn('flex items-center gap-2.5', className)}>
      <BrandMark size={size} />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-bold tracking-tight">
          <span className="text-white">Net</span>
          <span className="text-[#2b8ae6]">Learn</span>
        </span>
        {tagline ? <span className="mt-1 text-[10px] font-medium tracking-wide text-slate-500">Learn Networking Fundamentals</span> : null}
      </span>
    </Link>
  );
}
