'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb, MonitorCog, Play, TerminalSquare } from 'lucide-react';
import { SHELLS, commandNames, execute, newNetState, newSession, type Session, type ShellId } from '@/lib/terminal';

// Laboratório com três terminais simulados. CMD e PowerShell são o mesmo
// computador Windows (dividem arquivos e rede); o Bash é um computador Ubuntu.

type Line = { kind: 'input' | 'output' | 'error'; text: string; prompt?: string };

const META: Record<ShellId, { label: string; title: string; welcome: string; theme: { bg: string; fg: string; bar: string; error: string } }> = {
  cmd: {
    label: 'CMD',
    title: 'Prompt de Comando',
    welcome: 'Microsoft Windows [versão 10.0.22631.4460]\n(c) Microsoft Corporation. Todos os direitos reservados.\n\nDigite help para ver os comandos deste laboratório.\n',
    theme: { bg: '#0c0c0c', fg: '#cccccc', bar: '#1f1f1f', error: '#cccccc' },
  },
  powershell: {
    label: 'PowerShell',
    title: 'Windows PowerShell',
    welcome: 'Windows PowerShell\nCopyright (C) Microsoft Corporation. Todos os direitos reservados.\n\nDigite Get-Help para ver os comandos deste laboratório.\n',
    theme: { bg: '#012456', fg: '#eeedf0', bar: '#001a3f', error: '#ff8080' },
  },
  bash: {
    label: 'Bash (Linux)',
    title: 'aluno@netlearn: ~',
    welcome: 'Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-48-generic x86_64)\n\nDigite help para ver os comandos deste laboratório.\n',
    theme: { bg: '#300a24', fg: '#ffffff', bar: '#2c2c2c', error: '#ffffff' },
  },
};

const ORDER: ShellId[] = ['cmd', 'powershell', 'bash'];

/** A mesma tarefa nos três terminais. */
const EQUIVALENTS: { task: string; cmd: string; powershell: string; bash: string }[] = [
  { task: 'Ver IP, máscara e gateway', cmd: 'ipconfig', powershell: 'Get-NetIPConfiguration', bash: 'ip a' },
  { task: 'Ver detalhes (MAC, DHCP, DNS)', cmd: 'ipconfig /all', powershell: 'Get-NetAdapter', bash: 'ip link' },
  { task: 'Tabela de rotas', cmd: 'route print', powershell: 'Get-NetRoute', bash: 'ip r' },
  { task: 'Testar conexão (ping)', cmd: 'ping 8.8.8.8', powershell: 'Test-Connection 8.8.8.8', bash: 'ping -c 4 8.8.8.8' },
  { task: 'Caminho até o destino', cmd: 'tracert google.com', powershell: 'Test-NetConnection google.com -TraceRoute', bash: 'traceroute google.com' },
  { task: 'Consultar o DNS', cmd: 'nslookup github.com', powershell: 'Resolve-DnsName github.com', bash: 'dig github.com' },
  { task: 'Tabela ARP (vizinhos)', cmd: 'arp -a', powershell: 'Get-NetNeighbor', bash: 'ip neigh' },
  { task: 'Conexões e portas abertas', cmd: 'netstat -ano', powershell: 'Get-NetTCPConnection', bash: 'ss -tulpn' },
  { task: 'Testar uma porta TCP', cmd: 'curl -I http://192.168.1.10', powershell: 'Test-NetConnection 192.168.1.10 -Port 22', bash: 'nc -zv 192.168.1.10 22' },
  { task: 'Requisição HTTP', cmd: 'curl -I https://github.com', powershell: 'Invoke-WebRequest https://github.com', bash: 'curl -I https://github.com' },
  { task: 'Devolver o IP ao DHCP', cmd: 'ipconfig /release', powershell: 'ipconfig /release', bash: 'sudo dhclient -r' },
  { task: 'Pedir IP ao DHCP', cmd: 'ipconfig /renew', powershell: 'ipconfig /renew', bash: 'sudo dhclient enp3s0' },
  { task: 'Limpar o cache de DNS', cmd: 'ipconfig /flushdns', powershell: 'Clear-DnsClientCache', bash: 'resolvectl flush-caches' },
  { task: 'Listar arquivos', cmd: 'dir', powershell: 'Get-ChildItem', bash: 'ls -la' },
  { task: 'Ler um arquivo', cmd: 'type Documents\\notas-de-rede.txt', powershell: 'Get-Content Documents\\notas-de-rede.txt', bash: 'cat Documentos/notas-de-rede.txt' },
  { task: 'Filtrar a saída', cmd: 'ipconfig | findstr IPv4', powershell: 'ipconfig | Select-String IPv4', bash: 'ip a | grep inet' },
];

function createSessions(): Record<ShellId, Session> {
  const windowsNet = newNetState();
  const cmd = newSession('cmd', windowsNet);
  const powershell = newSession('powershell', windowsNet);
  powershell.fs = cmd.fs; // mesmo computador: mesmos arquivos
  return { cmd, powershell, bash: newSession('bash') };
}

function commonPrefix(values: string[], caseInsensitive: boolean) {
  if (!values.length) return '';
  let prefix = values[0];
  for (const v of values.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < v.length && (caseInsensitive ? prefix[i].toLowerCase() === v[i].toLowerCase() : prefix[i] === v[i])) i += 1;
    prefix = prefix.slice(0, i);
  }
  return prefix;
}

function BashPrompt({ prompt }: { prompt: string }) {
  const m = prompt.match(/^([^:]+):(.*)\$$/);
  if (!m) return <span>{prompt}</span>;
  return (
    <>
      <span className="font-bold" style={{ color: '#8ae234' }}>
        {m[1]}
      </span>
      <span>:</span>
      <span className="font-bold" style={{ color: '#729fcf' }}>
        {m[2]}
      </span>
      <span>$</span>
    </>
  );
}

export function TerminalLab() {
  const sessions = useRef<Record<ShellId, Session>>();
  if (!sessions.current) sessions.current = createSessions();
  const [active, setActive] = useState<ShellId>('cmd');
  const [lines, setLines] = useState<Record<ShellId, Line[]>>(() => ({
    cmd: [{ kind: 'output', text: META.cmd.welcome }],
    powershell: [{ kind: 'output', text: META.powershell.welcome }],
    bash: [{ kind: 'output', text: META.bash.welcome }],
  }));
  const [inputs, setInputs] = useState<Record<ShellId, string>>({ cmd: '', powershell: '', bash: '' });
  const [notes, setNotes] = useState<Record<ShellId, { cmd: string; text: string } | null>>({ cmd: null, powershell: null, bash: null });
  const [, force] = useState(0);
  const historyPos = useRef<Record<ShellId, number | null>>({ cmd: null, powershell: null, bash: null });
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  const s = sessions.current[active];
  const def = SHELLS[active];
  const meta = META[active];
  const prompt = def.prompt(s);
  const input = inputs[active];

  useEffect(() => {
    screenRef.current?.scrollTo({ top: screenRef.current.scrollHeight });
  }, [lines, active]);

  const setInput = (value: string) => setInputs((prev) => ({ ...prev, [active]: value }));

  const run = (command: string, shell: ShellId = active) => {
    const session = sessions.current![shell];
    const p = SHELLS[shell].prompt(session);
    const result = execute(SHELLS[shell], session, command);
    historyPos.current[shell] = null;
    setLines((prev) => {
      if (result.clear) return { ...prev, [shell]: [] };
      const next: Line[] = [...prev[shell], { kind: 'input', text: command, prompt: p }];
      if (result.out) next.push({ kind: result.error ? 'error' : 'output', text: result.out });
      // O CMD deixa uma linha em branco entre a saída e o próximo prompt.
      if (shell === 'cmd' && result.out) next.push({ kind: 'output', text: '\u00a0' });
      // Mantém a tela leve: as últimas 400 linhas bastam.
      return { ...prev, [shell]: next.slice(-400) };
    });
    if (result.note) setNotes((prev) => ({ ...prev, [shell]: { cmd: command, text: result.note! } }));
    setInputs((prev) => ({ ...prev, [shell]: '' }));
    force((n) => n + 1);
  };

  const runFromList = (command: string, shell: ShellId = active) => {
    setActive(shell);
    run(command, shell);
    inputRef.current?.focus({ preventScroll: true });
  };

  const complete = () => {
    const caseInsensitive = active !== 'bash';
    const match = input.match(/^(.*?)(\S*)$/);
    if (!match) return;
    const [, before, last] = match;
    const firstWord = !before.trim();
    let options: string[];
    if (firstWord) {
      const names = commandNames(active);
      options = names.filter((n) => (caseInsensitive ? n.toLowerCase().startsWith(last.toLowerCase()) : n.startsWith(last)));
      if (!options.length) options = s.fs.complete(last, s.cwd, s.home);
    } else options = s.fs.complete(last, s.cwd, s.home);
    if (!options.length) return;
    if (options.length === 1) {
      const value = options[0];
      setInput(`${before}${value}${/[\\/]$/.test(value) ? '' : ' '}`);
      return;
    }
    const prefix = commonPrefix(options, caseInsensitive);
    if (prefix.length > last.length) setInput(`${before}${prefix}`);
    else
      setLines((prev) => ({
        ...prev,
        [active]: [...prev[active], { kind: 'input', text: input, prompt }, { kind: 'output', text: options.join('    ') }],
      }));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const history = s.history;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) run(input);
      else setLines((prev) => ({ ...prev, [active]: [...prev[active], { kind: 'input', text: '', prompt }] }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const pos = historyPos.current[active];
      const i = pos === null ? history.length - 1 : Math.max(0, pos - 1);
      historyPos.current[active] = i;
      setInput(history[i]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const pos = historyPos.current[active];
      if (pos === null) return;
      const i = pos + 1;
      historyPos.current[active] = i >= history.length ? null : i;
      setInput(i >= history.length ? '' : history[i]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines((prev) => ({ ...prev, [active]: [] }));
    } else if (e.key.toLowerCase() === 'c' && e.ctrlKey && !window.getSelection()?.toString()) {
      e.preventDefault();
      setLines((prev) => ({ ...prev, [active]: [...prev[active], { kind: 'input', text: `${input}^C`, prompt }] }));
      setInput('');
    }
  };

  const note = notes[active];
  const catalog = useMemo(() => def.catalog, [def]);

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Escolha o terminal" className="flex gap-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 p-1.5">
        {ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active === id}
            onClick={() => {
              setActive(id);
              setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
            }}
            className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              active === id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            {id === 'bash' ? <TerminalSquare className="h-4 w-4" /> : <MonitorCog className="h-4 w-4" />}
            {META[id].label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          {/* Janela do terminal */}
          <div className="overflow-hidden rounded-xl border border-slate-700 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 px-3 py-2 text-xs" style={{ background: meta.theme.bar, color: '#d4d4d8' }}>
              {active === 'bash' ? (
                <span className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </span>
              ) : (
                <MonitorCog className="h-3.5 w-3.5" />
              )}
              <span className="flex-1 truncate text-center">{active === 'bash' ? prompt.replace(/\$$/, '') : meta.title}</span>
              {active !== 'bash' ? <span className="tracking-[0.3em] text-slate-400">—  ▢  ✕</span> : <span className="w-12" />}
            </div>
            <div
              ref={screenRef}
              onClick={() => {
                if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
              }}
              className="soft-scrollbar h-[440px] cursor-text overflow-y-auto p-4 font-mono text-[13px] leading-[1.45] sm:h-[480px]"
              style={{ background: meta.theme.bg, color: meta.theme.fg }}
              role="log"
              aria-live="polite"
              aria-label={`Saída do ${meta.label}`}
            >
              {lines[active].map((line, i) =>
                line.kind === 'input' ? (
                  <div key={i} className="whitespace-pre-wrap break-words">
                    {active === 'bash' ? <BashPrompt prompt={line.prompt ?? ''} /> : line.prompt}
                    {active === 'cmd' ? '' : ' '}
                    {line.text}
                  </div>
                ) : (
                  <div key={i} className="whitespace-pre-wrap break-words" style={line.kind === 'error' ? { color: meta.theme.error } : undefined}>
                    {line.text}
                  </div>
                ),
              )}
              <div className="flex items-baseline">
                <span className="shrink-0 whitespace-pre">
                  {active === 'bash' ? <BashPrompt prompt={prompt} /> : prompt}
                  {active === 'cmd' ? '' : ' '}
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  aria-label={`Comando do ${meta.label}`}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  className="terminal-input min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[13px] shadow-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none"
                  style={{ color: meta.theme.fg, caretColor: meta.theme.fg, boxShadow: 'none', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              <kbd className="rounded border border-slate-700 px-1.5 py-0.5">Enter</kbd> executa ·{' '}
              <kbd className="rounded border border-slate-700 px-1.5 py-0.5">↑</kbd> <kbd className="rounded border border-slate-700 px-1.5 py-0.5">↓</kbd> histórico ·{' '}
              <kbd className="rounded border border-slate-700 px-1.5 py-0.5">Tab</kbd> completa · <kbd className="rounded border border-slate-700 px-1.5 py-0.5">Ctrl+L</kbd> limpa
            </span>
            <button
              type="button"
              onClick={() => input.trim() && run(input)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 md:hidden"
            >
              <Play className="h-3.5 w-3.5" />
              Executar
            </button>
          </div>

          {/* Explicação do último comando */}
          <div className="rounded-xl border border-amber-300/30 bg-amber-300/[0.06] p-4" aria-live="polite">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
              <Lightbulb className="h-4 w-4" />
              {note ? (
                <span>
                  O que aconteceu em <code className="rounded bg-slate-950/60 px-1.5 py-0.5 font-mono text-xs text-amber-50">{note.cmd}</code>
                </span>
              ) : (
                'Explicação'
              )}
            </div>
            <p className="mt-2 text-sm text-slate-200">
              {note ? note.text : 'Rode um comando de rede (ou clique em um da lista) e a explicação do que ele mostrou aparece aqui.'}
            </p>
          </div>
        </div>

        {/* Lista de comandos */}
        <aside className="card-surface h-fit rounded-xl p-4 xl:sticky xl:top-24">
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Comandos do {meta.label}</div>
          <p className="mt-1 text-xs text-slate-400">Clique para executar. Você também pode digitar qualquer variação.</p>
          <div className="soft-scrollbar mt-3 max-h-[560px] space-y-4 overflow-y-auto pr-1">
            {catalog.map((group) => (
              <div key={group.group}>
                <div className="mb-1.5 text-xs font-semibold text-slate-300">{group.group}</div>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.cmd}>
                      <button
                        type="button"
                        onClick={() => runFromList(item.cmd)}
                        className="group w-full rounded-lg border border-transparent px-2 py-1.5 text-left hover:border-slate-700 hover:bg-slate-900"
                      >
                        <code className="block break-all font-mono text-xs text-cyan-200 group-hover:text-white">{item.cmd}</code>
                        <span className="text-[11px] text-slate-500">{item.desc}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Equivalências */}
      <section className="card-surface rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white">O mesmo comando nos três terminais</h2>
        <p className="mt-1 text-sm text-slate-400">Clique em um comando para abrir o terminal certo e executá-lo.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-400">
              <tr className="border-b border-slate-800">
                <th className="py-2 pr-4 font-medium">Tarefa</th>
                {ORDER.map((id) => (
                  <th key={id} className="py-2 pr-4 font-medium">
                    {META[id].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EQUIVALENTS.map((row) => (
                <tr key={row.task} className="border-b border-slate-800/70 align-top">
                  <td className="py-2 pr-4 text-slate-300">{row.task}</td>
                  {ORDER.map((id) => (
                    <td key={id} className="py-2 pr-4">
                      <button
                        type="button"
                        onClick={() => {
                          runFromList(row[id], id);
                          screenRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="rounded px-1.5 py-0.5 text-left font-mono text-xs text-cyan-200 hover:bg-slate-900 hover:text-white"
                      >
                        {row[id]}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
