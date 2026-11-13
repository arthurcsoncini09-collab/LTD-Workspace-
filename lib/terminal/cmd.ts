// Prompt de Comando do Windows (cmd.exe), simulado.

import { fail, hasFlag, ok, pad, padL, positionals, type Ctx, type Handler, type Result, type ShellDef } from './core';
import { sizeOf, type FsDir } from './fs';
import { HOSTNAME_WIN, LAN } from './net';
import { arp, curlExe, getmac, hostname, ipconfig, netsh, netstat, nslookup, pathping, ping, route, tracert } from './windows-net';

const NOT_FOUND = 'O sistema não pode encontrar o caminho especificado.';
const FILE_NOT_FOUND = 'O sistema não pode encontrar o arquivo especificado.';

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}  ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const thousands = (n: number) => n.toLocaleString('pt-BR');

function resolvePath(ctx: Ctx, path: string) {
  return ctx.s.fs.parts(path, ctx.s.cwd, ctx.s.home);
}

/** Filtros de texto usados depois de "|". */
function filterLines(ctx: Ctx, match: (line: string) => boolean, count: boolean): Result {
  const lines = (ctx.stdin ?? '').split('\n');
  const found = lines.filter(match);
  return ok(count ? String(found.length) : found.join('\n'));
}

const commands: Record<string, Handler> = {
  help: () =>
    ok(
      [
        'Para obter mais informações sobre um comando específico, digite HELP nome_do_comando',
        '',
        'Rede:     IPCONFIG  PING  TRACERT  PATHPING  NSLOOKUP  ARP  NETSTAT  ROUTE  GETMAC  NETSH  CURL  HOSTNAME',
        'Arquivos: DIR  CD  TYPE  MD  RD  DEL  COPY  MOVE  REN  TREE',
        'Texto:    ECHO  FIND  FINDSTR  SORT  MORE  (use com | , > e >>)',
        'Sistema:  VER  SYSTEMINFO  TASKLIST  TASKKILL  WHOAMI  SET  DATE  TIME  CLS  EXIT',
        '',
        'Dica: ↑ e ↓ navegam no histórico; Tab completa nomes de arquivos e pastas.',
      ].join('\n'),
    ),
  cls: () => ({ out: '', clear: true }),
  exit: () => ({ out: '', clear: true, note: 'Neste laboratório o exit apenas limpa a tela.' }),
  ver: () => ok('\nMicrosoft Windows [versão 10.0.22631.4460]'),
  echo: (args, ctx) => {
    if (!args.length) return ok('ECHO está ativado.');
    const text = ctx.raw.replace(/^\s*echo\.?\s?/i, '');
    return ok(expandVars(text, ctx));
  },
  whoami: (args) => ok(hasFlag(args, '/all') ? `\nINFORMAÇÕES DE USUÁRIO\n----------------------\nNome de usuário   SID\n================= =============================================\npc-aluno\\aluno    S-1-5-21-3623811015-3361044348-30300820-1013` : 'pc-aluno\\aluno'),
  hostname,
  date: (args) => ok(hasFlag(args, '/t') ? new Date().toLocaleDateString('pt-BR') : `A data atual é: ${new Date().toLocaleDateString('pt-BR')}\nDigite a nova data: (dd-mm-aa) (alterar a data não é permitido neste laboratório)`),
  time: (args) => ok(hasFlag(args, '/t') ? new Date().toLocaleTimeString('pt-BR').slice(0, 5) : `A hora atual é: ${new Date().toLocaleTimeString('pt-BR')},00`),
  set: (args, ctx) => {
    if (args.length && args[0].includes('=')) {
      const [k, ...v] = args.join(' ').split('=');
      ctx.s.env[k.toUpperCase()] = v.join('=');
      return ok('');
    }
    const prefix = (args[0] ?? '').toUpperCase();
    const rows = Object.entries(ctx.s.env).filter(([k]) => k.startsWith(prefix));
    return rows.length ? ok(rows.map(([k, v]) => `${k}=${v}`).join('\n')) : fail(`Variável de ambiente ${args[0]} não definida`);
  },
  path: (_a, ctx) => ok(`PATH=${ctx.s.env.PATH}`),
  systeminfo: () =>
    ok(
      [
        '',
        `Nome do host:                              ${HOSTNAME_WIN}`,
        'Nome do sistema operacional:               Microsoft Windows 11 Pro',
        'Versão do sistema operacional:             10.0.22631 N/A compilação 22631',
        'Fabricante do sistema:                     NetLearn Lab',
        'Tipo de sistema:                           x64-based PC',
        'Memória física total:                      16.244 MB',
        'Domínio:                                   WORKGROUP',
        'Placa(s) de Rede:                          1 NIC(s) instalado(s).',
        '                                           [01]: Realtek PCIe GbE Family Controller',
        '                                                 Nome da conexão: Ethernet',
        '                                                 DHCP ativado:    Sim',
        `                                                 Servidor DHCP:   ${LAN.dhcpServer}`,
        '                                                 Endereço(s) IP',
        `                                                 [01]: ${LAN.ip}`,
      ].join('\n'),
      'O systeminfo resume o computador: sistema, memória e, no fim, as placas de rede com o IP e o servidor DHCP.',
    ),
  tasklist: () =>
    ok(
      [
        '',
        'Nome da imagem                 Identific Nome da sessão  Sessão#  Uso de memória',
        '========================= ======== ================ =========== ============',
        'System Idle Process              0 Services                   0          8 K',
        'System                           4 Services                   0      1.232 K',
        'svchost.exe                   1024 Services                   0     14.880 K',
        'explorer.exe                  4412 Console                    1     98.512 K',
        'chrome.exe                    6120 Console                    1    312.044 K',
        'cmd.exe                       7788 Console                    1      4.100 K',
      ].join('\n'),
      'O tasklist mostra os processos e o PID de cada um. Junte com netstat -ano para descobrir qual programa abriu uma conexão.',
    ),
  taskkill: (args) => {
    const pid = args[args.findIndex((a) => a.toLowerCase() === '/pid') + 1];
    const im = args[args.findIndex((a) => a.toLowerCase() === '/im') + 1];
    if (!pid && !im) return fail('ERRO: sintaxe inválida. Use TASKKILL /PID número ou TASKKILL /IM nome.exe');
    return ok(`ÊXITO: o processo ${im ? `"${im}"` : `com PID ${pid}`} foi finalizado (simulação).`);
  },

  // ---------------- Arquivos ----------------
  cd: (args, ctx) => {
    const target = args.join(' ').replace(/^\/d\s+/i, '') || (ctx.raw.trim().match(/^cd(\.\.|\\)$/i)?.[1] ?? '');
    if (!target) return ok(ctx.s.cwd);
    const parts = resolvePath(ctx, target);
    const node = ctx.s.fs.get(parts);
    if (!node || node.type !== 'dir') return fail(node ? 'O nome do diretório é inválido.' : NOT_FOUND);
    ctx.s.cwd = ctx.s.fs.format(ctx.s.fs.canonical(parts));
    return ok('');
  },
  dir: (args, ctx) => {
    const target = positionals(args, [], 'win')[0] ?? '.';
    const parts = resolvePath(ctx, target);
    const node = ctx.s.fs.get(parts);
    if (!node) return fail('Arquivo não encontrado');
    const path = ctx.s.fs.format(ctx.s.fs.canonical(parts));
    const entries: [string, typeof node][] = node.type === 'dir' ? Object.entries(node.children) : [[parts[parts.length - 1], node]];
    const bare = hasFlag(args, '/b');
    if (bare) return ok(entries.map(([n]) => n).join('\n'));
    const files = entries.filter(([, n]) => n.type === 'file');
    const dirs = entries.filter(([, n]) => n.type === 'dir');
    const bytes = files.reduce((sum, [, n]) => sum + sizeOf(n), 0);
    const lines = [
      ' O volume na unidade C não tem nome.',
      ' O Número de Série do Volume é 1A2B-3C4D',
      '',
      ` Pasta de ${node.type === 'dir' ? path : path.split('\\').slice(0, -1).join('\\')}`,
      '',
      ...(node.type === 'dir' && parts.length ? [`${fmtDate((node as FsDir).modified)}    <DIR>          .`, `${fmtDate((node as FsDir).modified)}    <DIR>          ..`] : []),
      ...entries.map(([n, child]) => `${fmtDate(child.modified)}    ${child.type === 'dir' ? '<DIR>         ' : padL(thousands(sizeOf(child)), 14)} ${n}`),
      `${padL(files.length, 16)} arquivo(s)${padL(thousands(bytes), 15)} bytes`,
      `${padL(dirs.length + (parts.length ? 2 : 0), 16)} pasta(s)   102.441.205.760 bytes disponíveis`,
    ];
    return ok(lines.join('\n'));
  },
  type: (args, ctx) => {
    if (!args.length) return fail('A sintaxe do comando está incorreta.');
    const outs: string[] = [];
    for (const a of args) {
      const node = ctx.s.fs.get(resolvePath(ctx, a));
      if (!node) return fail(FILE_NOT_FOUND);
      if (node.type === 'dir') return fail('Acesso negado.');
      outs.push(node.content.replace(/\n$/, ''));
    }
    return ok(outs.join('\n'), args.some((a) => a.toLowerCase().includes('hosts')) ? 'O arquivo hosts é consultado antes do DNS: um nome listado aqui vai direto para o IP escrito ao lado.' : undefined);
  },
  md: (args, ctx) => {
    if (!args.length) return fail('A sintaxe do comando está incorreta.');
    for (const a of args) {
      const r = ctx.s.fs.mkdir(resolvePath(ctx, a), true);
      if (r === 'exists') return fail(`Já existe uma subpasta ou um arquivo ${a}.`);
    }
    return ok('');
  },
  rd: (args, ctx) => {
    const target = positionals(args, [], 'win')[0];
    if (!target) return fail('A sintaxe do comando está incorreta.');
    const parts = resolvePath(ctx, target);
    const node = ctx.s.fs.get(parts);
    if (!node) return fail(FILE_NOT_FOUND);
    if (node.type !== 'dir') return fail('O nome do diretório é inválido.');
    if (Object.keys(node.children).length && !hasFlag(args, '/s')) return fail('A pasta não está vazia.');
    ctx.s.fs.remove(parts);
    return ok('');
  },
  del: (args, ctx) => {
    const targets = positionals(args, [], 'win');
    if (!targets.length) return fail('A sintaxe do comando está incorreta.');
    for (const t of targets) {
      const parts = resolvePath(ctx, t);
      const node = ctx.s.fs.get(parts);
      if (!node) return fail(`Não foi possível encontrar ${ctx.s.fs.format(parts)}`);
      if (node.type === 'dir') return fail(`${ctx.s.fs.format(parts)}\\*, Tem certeza (S/N)? (use RD /S para apagar pastas)`);
      ctx.s.fs.remove(parts);
    }
    return ok('');
  },
  copy: (args, ctx) => transfer(args, ctx, false),
  move: (args, ctx) => transfer(args, ctx, true),
  ren: (args, ctx) => {
    const [from, to] = positionals(args, [], 'win');
    if (!from || !to) return fail('A sintaxe do comando está incorreta.');
    const parts = resolvePath(ctx, from);
    if (!ctx.s.fs.get(parts)) return fail(FILE_NOT_FOUND);
    ctx.s.fs.transfer(parts, [...parts.slice(0, -1), to], true);
    return ok('');
  },
  tree: (args, ctx) => {
    const parts = resolvePath(ctx, positionals(args, [], 'win')[0] ?? '.');
    const node = ctx.s.fs.get(parts);
    if (!node || node.type !== 'dir') return fail('Caminho inválido - ' + (args[0] ?? ''));
    const showFiles = hasFlag(args, '/f');
    const lines = ['Listagem de caminhos de pasta', 'O número de série do volume é 1A2B-3C4D', ctx.s.fs.format(ctx.s.fs.canonical(parts))];
    const walk = (d: FsDir, prefix: string) => {
      const files = showFiles ? Object.entries(d.children).filter(([, n]) => n.type === 'file') : [];
      const dirs = Object.entries(d.children).filter(([, n]) => n.type === 'dir');
      for (const [name] of files) lines.push(`${prefix}${dirs.length ? '│   ' : '    '}${name}`);
      if (files.length) lines.push(`${prefix}${dirs.length ? '│' : ''}`);
      dirs.forEach(([name, child], i) => {
        const last = i === dirs.length - 1;
        lines.push(`${prefix}${last ? '└───' : '├───'}${name}`);
        walk(child as FsDir, prefix + (last ? '    ' : '│   '));
      });
    };
    walk(node, '');
    return ok(lines.join('\n'));
  },

  // ---------------- Filtros ----------------
  find: (args, ctx) => {
    const text = args.find((a) => !a.startsWith('/')) ?? '';
    const ci = hasFlag(args, '/i');
    const invert = hasFlag(args, '/v');
    if (ctx.stdin === null) {
      const file = args.filter((a) => !a.startsWith('/'))[1];
      if (!file) return fail('FIND: Formato de parâmetro incorreto');
      const node = ctx.s.fs.get(resolvePath(ctx, file));
      if (!node || node.type !== 'file') return fail(`Arquivo não encontrado - ${file}`);
      ctx = { ...ctx, stdin: node.content };
    }
    const has = (l: string) => (ci ? l.toLowerCase().includes(text.toLowerCase()) : l.includes(text));
    return filterLines(ctx, (l) => (invert ? !has(l) : has(l)), hasFlag(args, '/c'));
  },
  findstr: (args, ctx) => {
    const ci = hasFlag(args, '/i');
    const [pattern, file] = args.filter((a) => !a.startsWith('/'));
    if (!pattern) return fail('FINDSTR: Argumento ausente após /');
    if (ctx.stdin === null) {
      const node = file ? ctx.s.fs.get(resolvePath(ctx, file)) : null;
      if (!node || node.type !== 'file') return fail(`FINDSTR: Não é possível abrir ${file ?? ''}`);
      ctx = { ...ctx, stdin: node.content };
    }
    const words = pattern.split(' ');
    return filterLines(ctx, (l) => words.some((w) => (ci ? l.toLowerCase().includes(w.toLowerCase()) : l.includes(w))), false);
  },
  sort: (_a, ctx) => ok((ctx.stdin ?? '').split('\n').filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR')).join('\n')),
  more: (_a, ctx) => ok(ctx.stdin ?? ''),

  // ---------------- Rede ----------------
  ipconfig,
  ping,
  tracert,
  pathping,
  nslookup,
  arp,
  netstat,
  route,
  getmac,
  netsh,
  curl: curlExe,
  telnet: () =>
    fail(
      "'telnet' não é reconhecido como um comando interno\nou externo, um programa operável ou um arquivo em lotes.",
    ),
  powershell: () => ok('Para usar o PowerShell, clique na aba "PowerShell" acima do terminal.'),
};

function transfer(args: string[], ctx: Ctx, move: boolean): Result {
  const [from, to] = positionals(args, [], 'win');
  if (!from) return fail('A sintaxe do comando está incorreta.');
  const r = ctx.s.fs.transfer(resolvePath(ctx, from), resolvePath(ctx, to ?? '.'), move);
  if (r === 'nosrc') return fail(FILE_NOT_FOUND);
  if (r === 'nodst') return fail(NOT_FOUND);
  return ok(move ? '        1 arquivo(s) movido(s).' : '        1 arquivo(s) copiado(s).');
}

function expandVars(text: string, ctx: Ctx) {
  return text.replace(/%([A-Z_]+)%/gi, (m, k: string) => {
    const key = k.toUpperCase();
    if (key === 'CD') return ctx.s.cwd;
    if (key === 'ERRORLEVEL') return String(ctx.s.status);
    if (key === 'DATE') return new Date().toLocaleDateString('pt-BR');
    if (key === 'TIME') return new Date().toLocaleTimeString('pt-BR');
    return ctx.s.env[key] ?? m;
  });
}

const ALIASES: Record<string, string> = {
  chdir: 'cd',
  mkdir: 'md',
  rmdir: 'rd',
  erase: 'del',
  rename: 'ren',
  'ipconfig.exe': 'ipconfig',
  'ping.exe': 'ping',
  'curl.exe': 'curl',
  'cd..': 'cd',
};

export const CMD: ShellDef = {
  id: 'cmd',
  commands,
  normalize: (name) => {
    const n = name.toLowerCase();
    return ALIASES[n] ?? n;
  },
  notFound: (name) => `'${name}' não é reconhecido como um comando interno\nou externo, um programa operável ou um arquivo em lotes.`,
  prompt: (s) => `${s.cwd}>`,
  expand: (line, s) =>
    line.replace(/%([A-Z_]+)%/gi, (m, k: string) => {
      const key = k.toUpperCase();
      if (key === 'CD') return s.cwd;
      if (key === 'ERRORLEVEL') return String(s.status);
      return s.env[key] ?? m;
    }),
  catalog: [
    {
      group: 'Rede',
      items: [
        { cmd: 'ipconfig', desc: 'IP, máscara e gateway' },
        { cmd: 'ipconfig /all', desc: 'MAC, DHCP e DNS' },
        { cmd: 'ipconfig /release', desc: 'devolve o IP ao DHCP' },
        { cmd: 'ipconfig /renew', desc: 'pede um IP novo' },
        { cmd: 'ipconfig /displaydns', desc: 'cache de DNS' },
        { cmd: 'ipconfig /flushdns', desc: 'limpa o cache de DNS' },
        { cmd: 'ping 8.8.8.8', desc: 'testa a conexão' },
        { cmd: 'ping -n 2 google.com', desc: 'ping com nome' },
        { cmd: 'ping 192.168.1.99', desc: 'host que não existe' },
        { cmd: 'tracert google.com', desc: 'caminho até o destino' },
        { cmd: 'pathping github.com', desc: 'caminho + perda' },
        { cmd: 'nslookup google.com', desc: 'consulta DNS' },
        { cmd: 'nslookup github.com 1.1.1.1', desc: 'DNS em outro servidor' },
        { cmd: 'arp -a', desc: 'tabela ARP' },
        { cmd: 'netstat -ano', desc: 'conexões e PIDs' },
        { cmd: 'route print', desc: 'tabela de rotas' },
        { cmd: 'getmac', desc: 'endereço MAC' },
        { cmd: 'netsh interface ip show config', desc: 'configuração IP' },
        { cmd: 'netsh wlan show networks', desc: 'redes Wi-Fi' },
        { cmd: 'curl -I https://netlearn-redes.vercel.app', desc: 'cabeçalhos HTTP' },
      ],
    },
    {
      group: 'Arquivos',
      items: [
        { cmd: 'dir', desc: 'lista a pasta' },
        { cmd: 'cd Documents', desc: 'entra na pasta' },
        { cmd: 'cd ..', desc: 'volta uma pasta' },
        { cmd: 'type Documents\\notas-de-rede.txt', desc: 'mostra um arquivo' },
        { cmd: 'type C:\\Windows\\System32\\drivers\\etc\\hosts', desc: 'arquivo hosts' },
        { cmd: 'md testes', desc: 'cria pasta' },
        { cmd: 'echo ping ok > teste.txt', desc: 'grava em arquivo' },
        { cmd: 'copy teste.txt copia.txt', desc: 'copia' },
        { cmd: 'del teste.txt', desc: 'apaga' },
        { cmd: 'tree /f', desc: 'árvore de pastas' },
      ],
    },
    {
      group: 'Sistema e texto',
      items: [
        { cmd: 'hostname', desc: 'nome do computador' },
        { cmd: 'whoami', desc: 'usuário atual' },
        { cmd: 'systeminfo', desc: 'resumo do sistema' },
        { cmd: 'tasklist', desc: 'processos' },
        { cmd: 'netstat -ano | find "ESTABLISHED"', desc: 'filtra com find' },
        { cmd: 'ipconfig /all | findstr DNS', desc: 'filtra com findstr' },
        { cmd: 'echo %USERNAME%', desc: 'variável de ambiente' },
        { cmd: 'ver', desc: 'versão do Windows' },
        { cmd: 'cls', desc: 'limpa a tela' },
      ],
    },
  ],
};

export { pad };
