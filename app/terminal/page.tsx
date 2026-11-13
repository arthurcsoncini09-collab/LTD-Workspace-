import { TerminalLab } from '@/components/terminal/terminal-lab';

export const metadata = {
  title: 'Terminal: CMD, PowerShell e Bash | NetLearn',
  description: 'Pratique comandos de rede no Prompt de Comando, no PowerShell e no Bash do Linux, com explicação de cada saída.',
};

export default function TerminalPage() {
  return (
    <div className="space-y-6">
      <section className="card-surface rounded-xl p-6 sm:p-8">
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Terminal Lab</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">CMD, PowerShell e Bash</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Três terminais simulados numa rede de verdade: o seu computador ({'192.168.1.37'}), o roteador, um servidor e uma impressora. Teste
          ping, traceroute, DNS, portas e HTTP, mexa em arquivos e use pipes (|) e redirecionamento (&gt;). As ações mudam a rede: libere o IP
          e o ping para de funcionar; faça um ping no servidor e ele aparece na tabela ARP.
        </p>
      </section>
      <TerminalLab />
    </div>
  );
}
