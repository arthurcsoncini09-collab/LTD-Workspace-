// Bash no Linux (Ubuntu 24.04), simulado. Nomes diferenciam maiúsculas,
// opções começam com "-" e caminhos usam "/".

import { fail, hasFlag, ok, optValue, pad, padL, positionals, type Ctx, type Handler, type Result, type ShellDef } from './core';
import { sizeOf, type FsDir, type FsNode } from './fs';
import { HOSTNAME_LINUX, LAN, LINUX_SOCKETS, SERVICE, isIp, lookup, ping as simPing, portOpen, resolve, traceroute } from './net';
import { httpRequest } from './windows-net';

const NOTE = {
  ipa: 'O "ip a" mostra as interfaces: lo é o loopback (127.0.0.1) e enp3s0 a placa de rede. "inet 192.168.1.37/24" é o IP com o prefixo (máscara 255.255.255.0); "link/ether" é o MAC.',
  ipr: 'A linha "default via 192.168.1.1" é a rota padrão: tudo que não é da rede local vai para o gateway.',
  ping: 'No Linux o ping não para sozinho: use -c para escolher quantos pacotes (aqui o padrão é 4). TTL 64 costuma ser Linux, 128 Windows e 255 equipamentos de rede.',
  traceroute: 'O traceroute usa TTL crescente; cada roteador que descarta o pacote responde ICMP Time Exceeded. "* * *" é um salto que não responde.',
  dig: 'O dig mostra a resposta DNS completa: na ANSWER SECTION aparecem o nome, o TTL em segundos, o tipo (A, AAAA, MX) e o valor. +short mostra só o IP.',
  ss: 'O ss lista sockets: -t TCP, -u UDP, -l só os que estão escutando, -n números em vez de nomes, -p o processo. LISTEN = serviço esperando conexões.',
  curl: 'O curl faz requisições HTTP. -I mostra só os cabeçalhos (o código de status: 200 OK, 301 redirecionamento, 404 não encontrado); -L segue redirecionamentos.',
  nc: 'O nc -zv testa se uma porta TCP aceita conexão, sem enviar dados. "succeeded" = porta aberta; "refused" = ninguém escutando.',
  nmap: 'O nmap descobre hosts e portas abertas. Só use em redes que são suas ou com autorização: escanear redes alheias pode ser crime.',
  arp: 'A tabela ARP (ou "ip neigh") liga IPs da rede local a endereços MAC. Só aparecem vizinhos da mesma rede.',
};

function resolvePath(ctx: Ctx, path: string) {
  return ctx.s.fs.parts(path, ctx.s.cwd, ctx.s.home);
}

const noSuch = (cmd: string, path: string) => fail(`${cmd}: não foi possível acessar '${path}': Arquivo ou diretório inexistente`);

function lsDate(iso: string) {
  const d = new Date(iso);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function text(ctx: Ctx, files: string[], cmd: string): { content: string } | Result {
  if (!files.length) return { content: ctx.stdin ?? '' };
  let content = '';
  for (const f of files) {
    const node = ctx.s.fs.get(resolvePath(ctx, f));
    if (!node) return fail(`${cmd}: ${f}: Arquivo ou diretório inexistente`);
    if (node.type === 'dir') return fail(`${cmd}: ${f}: É um diretório`);
    content += node.content;
  }
  return { content };
}

const isResult = (v: { content: string } | Result): v is Result => 'out' in v;

const IP_ADDR = (leased: boolean) =>
  [
    '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000',
    '    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00',
    '    inet 127.0.0.1/8 scope host lo',
    '       valid_lft forever preferred_lft forever',
    '2: enp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000',
    `    link/ether ${LAN.macLinux} brd ff:ff:ff:ff:ff:ff`,
    ...(leased ? [`    inet ${LAN.ip}/${LAN.prefix} brd ${LAN.broadcast} scope global dynamic noprefixroute enp3s0`, '       valid_lft 86123sec preferred_lft 86123sec'] : []),
    `    inet6 ${LAN.ipv6}/64 scope link`,
    '       valid_lft forever preferred_lft forever',
    '3: wlp2s0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000',
    '    link/ether 58:a0:23:91:4c:d2 brd ff:ff:ff:ff:ff:ff',
  ].join('\n');

const commands: Record<string, Handler> = {
  help: () =>
    ok(
      [
        'GNU bash, versão 5.2.21(1)-release (x86_64-pc-linux-gnu) — comandos deste laboratório:',
        '',
        'Rede:     ip a | ip r | ip link | ip neigh | ifconfig | ping -c | traceroute | tracepath',
        '          dig | nslookup | host | ss -tulpn | netstat | arp -n | route -n | curl | wget',
        '          nc -zv | nmap | dhclient | nmcli | resolvectl | ufw status | ssh',
        'Arquivos: ls | cd | pwd | cat | touch | mkdir | rm | rmdir | cp | mv | find | tree | chmod',
        'Texto:    echo | grep | head | tail | wc | sort | uniq | less  (use com | , > e >>)',
        'Sistema:  whoami | id | hostname | uname -a | date | uptime | df -h | free -h | ps aux',
        '          history | env | export | which | man | sudo | clear',
        '',
        'Dica: ↑ e ↓ navegam no histórico; Tab completa comandos e nomes de arquivos.',
      ].join('\n'),
    ),
  clear: () => ({ out: '', clear: true }),
  exit: () => ({ out: '', clear: true, note: 'Neste laboratório o exit apenas limpa a tela.' }),
  pwd: (_a, ctx) => ok(ctx.s.cwd),
  cd: (args, ctx) => {
    const target = args[0] ?? '~';
    if (target === '-') return ok(ctx.s.cwd);
    const parts = resolvePath(ctx, target);
    const node = ctx.s.fs.get(parts);
    if (!node) return fail(`bash: cd: ${target}: Arquivo ou diretório inexistente`);
    if (node.type !== 'dir') return fail(`bash: cd: ${target}: Não é um diretório`);
    ctx.s.cwd = ctx.s.fs.format(parts);
    return ok('');
  },
  ls: (args, ctx) => {
    const flags = args.filter((a) => a.startsWith('-')).join('');
    const long = flags.includes('l');
    const all = flags.includes('a');
    const human = flags.includes('h');
    const targets = positionals(args);
    const target = targets[0] ?? '.';
    const parts = resolvePath(ctx, target);
    const node = ctx.s.fs.get(parts);
    if (!node) return noSuch('ls', target);
    const entries: [string, FsNode][] = node.type === 'dir' ? Object.entries(node.children).sort(([a], [b]) => a.localeCompare(b)) : [[target, node]];
    const shown = [...(all && node.type === 'dir' ? ([['.', node], ['..', node]] as [string, FsNode][]) : []), ...entries.filter(([n]) => all || !n.startsWith('.'))];
    if (!long) return ok(shown.map(([n, c]) => (c.type === 'dir' ? `${n}/` : n)).join('  '));
    const size = (n: FsNode) => {
      const b = sizeOf(n);
      return human && b >= 1024 ? `${(b / 1024).toFixed(1).replace('.', ',')}K` : String(b);
    };
    const total = Math.ceil(entries.reduce((s, [, c]) => s + sizeOf(c), 0) / 1024) * 4;
    const isScript = (n: string) => n.endsWith('.sh');
    return ok(
      [
        `total ${total}`,
        ...shown.map(([n, c]) => `${c.type === 'dir' ? 'drwxr-xr-x' : isScript(n) ? '-rwxr-xr-x' : '-rw-r--r--'} ${c.type === 'dir' ? 2 : 1} aluno aluno ${padL(size(c), 5)} ${lsDate(c.modified)} ${n}`),
      ].join('\n'),
    );
  },
  cat: (args, ctx) => {
    const r = text(ctx, positionals(args), 'cat');
    if (isResult(r)) return r;
    const path = args.join(' ');
    const note = path.includes('resolv.conf')
      ? 'O /etc/resolv.conf diz qual servidor DNS o sistema usa. 127.0.0.53 é o systemd-resolved, que repassa as consultas ao DNS recebido do DHCP.'
      : path.includes('hosts')
        ? 'O /etc/hosts é consultado antes do DNS: um nome listado aqui vai direto para o IP ao lado.'
        : undefined;
    return ok(r.content.replace(/\n$/, ''), note);
  },
  echo: (args) => {
    const noNewline = args[0] === '-n';
    const words = args.filter((a, i) => !(i === 0 && (a === '-n' || a === '-e')));
    return ok(words.join(' ').replace(/\\n/g, args[0] === '-e' ? '\n' : '\\n') + (noNewline ? '' : ''));
  },
  touch: (args, ctx) => {
    const files = positionals(args);
    if (!files.length) return fail('touch: falta o operando arquivo');
    for (const f of files) {
      const parts = resolvePath(ctx, f);
      const node = ctx.s.fs.get(parts);
      if (node) node.modified = new Date().toISOString();
      else if (!ctx.s.fs.write(parts, '')) return fail(`touch: não foi possível tocar '${f}': Arquivo ou diretório inexistente`);
    }
    return ok('');
  },
  mkdir: (args, ctx) => {
    const dirs = positionals(args);
    if (!dirs.length) return fail('mkdir: falta o operando');
    for (const d of dirs) {
      const r = ctx.s.fs.mkdir(resolvePath(ctx, d), hasFlag(args, '-p'));
      if (r === 'exists' && !hasFlag(args, '-p')) return fail(`mkdir: não foi possível criar o diretório "${d}": Arquivo existe`);
      if (r === 'noparent') return fail(`mkdir: não foi possível criar o diretório "${d}": Arquivo ou diretório inexistente`);
    }
    return ok('');
  },
  rm: (args, ctx) => {
    const flags = args.filter((a) => a.startsWith('-')).join('');
    const targets = positionals(args);
    if (!targets.length) return fail('rm: falta o operando');
    for (const t of targets) {
      const parts = resolvePath(ctx, t);
      if (parts.length <= 1 && flags.includes('r')) return fail(`rm: é perigoso operar recursivamente em '${t}'\nrm: use --no-preserve-root para ignorar essa proteção`);
      const node = ctx.s.fs.get(parts);
      if (!node) {
        if (flags.includes('f')) continue;
        return fail(`rm: não foi possível remover '${t}': Arquivo ou diretório inexistente`);
      }
      if (node.type === 'dir' && !flags.includes('r')) return fail(`rm: não foi possível remover '${t}': É um diretório`);
      ctx.s.fs.remove(parts);
    }
    return ok('');
  },
  rmdir: (args, ctx) => {
    const t = positionals(args)[0];
    if (!t) return fail('rmdir: falta o operando');
    const parts = resolvePath(ctx, t);
    const node = ctx.s.fs.get(parts);
    if (!node) return fail(`rmdir: falhou em remover '${t}': Arquivo ou diretório inexistente`);
    if (node.type !== 'dir') return fail(`rmdir: falhou em remover '${t}': Não é um diretório`);
    if (Object.keys(node.children).length) return fail(`rmdir: falhou em remover '${t}': Diretório não vazio`);
    ctx.s.fs.remove(parts);
    return ok('');
  },
  cp: (args, ctx) => copyMove(args, ctx, false),
  mv: (args, ctx) => copyMove(args, ctx, true),
  find: (args, ctx) => {
    const start = positionals(args, ['-name', '-type', '-iname'])[0] ?? '.';
    const pattern = optValue(args, '-name', '-iname');
    const type = optValue(args, '-type');
    const parts = resolvePath(ctx, start);
    const node = ctx.s.fs.get(parts);
    if (!node) return fail(`find: '${start}': Arquivo ou diretório inexistente`);
    const re = pattern ? new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.')}$`, hasFlag(args, '-iname') ? 'i' : '') : null;
    const out: string[] = [];
    const walk = (n: FsNode, path: string, name: string) => {
      if ((!re || re.test(name)) && (!type || (type === 'd') === (n.type === 'dir'))) out.push(path);
      if (n.type === 'dir') for (const [k, c] of Object.entries(n.children)) walk(c, `${path}/${k}`, k);
    };
    walk(node, start.replace(/\/$/, ''), start.split('/').pop() ?? start);
    return ok(out.join('\n'));
  },
  tree: (args, ctx) => {
    const start = positionals(args)[0] ?? '.';
    const node = ctx.s.fs.get(resolvePath(ctx, start));
    if (!node || node.type !== 'dir') return fail(`${start} [error opening dir]`);
    const lines = [start];
    let dirs = 0;
    let files = 0;
    const walk = (d: FsDir, prefix: string) => {
      const entries = Object.entries(d.children).sort(([a], [b]) => a.localeCompare(b));
      entries.forEach(([name, c], i) => {
        const last = i === entries.length - 1;
        lines.push(`${prefix}${last ? '└── ' : '├── '}${name}`);
        if (c.type === 'dir') {
          dirs += 1;
          walk(c, prefix + (last ? '    ' : '│   '));
        } else files += 1;
      });
    };
    walk(node, '');
    lines.push('', `${dirs} directories, ${files} files`);
    return ok(lines.join('\n'));
  },
  chmod: (args, ctx) => {
    const [mode, file] = positionals(args);
    if (!mode || !file) return fail('chmod: falta o operando');
    if (!ctx.s.fs.get(resolvePath(ctx, file))) return fail(`chmod: não foi possível acessar '${file}': Arquivo ou diretório inexistente`);
    return ok('', `Permissões de ${file} alteradas para ${mode} (simulação). r = ler, w = escrever, x = executar; para dono, grupo e outros.`);
  },

  // ---------------- Texto ----------------
  grep: (args, ctx) => {
    const flags = args.filter((a) => a.startsWith('-') && !/^-[A-Z]\d*$/.test(a)).join('');
    const [pattern, ...files] = positionals(args, ['-e', '-m']);
    if (!pattern) return fail('Uso: grep [OPÇÃO]... PADRÕES [ARQUIVO]...\nTente "grep --help" para mais informações.');
    const r = text(ctx, files, 'grep');
    if (isResult(r)) return r;
    let re: RegExp;
    try {
      re = new RegExp(pattern, flags.includes('i') ? 'i' : '');
    } catch {
      re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags.includes('i') ? 'i' : '');
    }
    const lines = r.content.replace(/\n$/, '').split('\n');
    const matches = lines.map((l, i) => [l, i + 1] as const).filter(([l]) => re.test(l) !== flags.includes('v'));
    if (flags.includes('c')) return ok(String(matches.length));
    if (!matches.length) return { out: '', error: true };
    return ok(matches.map(([l, n]) => (flags.includes('n') ? `${n}:${l}` : l)).join('\n'));
  },
  head: (args, ctx) => {
    const n = Number(optValue(args, '-n')) || Number((args.find((a) => /^-\d+$/.test(a)) ?? '').slice(1)) || 10;
    const r = text(ctx, positionals(args, ['-n']).filter((a) => !/^\d+$/.test(a)), 'head');
    if (isResult(r)) return r;
    return ok(r.content.replace(/\n$/, '').split('\n').slice(0, n).join('\n'));
  },
  tail: (args, ctx) => {
    const n = Number(optValue(args, '-n')) || Number((args.find((a) => /^-\d+$/.test(a)) ?? '').slice(1)) || 10;
    const r = text(ctx, positionals(args, ['-n']).filter((a) => !/^\d+$/.test(a)), 'tail');
    if (isResult(r)) return r;
    return ok(r.content.replace(/\n$/, '').split('\n').slice(-n).join('\n'));
  },
  wc: (args, ctx) => {
    const files = positionals(args);
    const r = text(ctx, files, 'wc');
    if (isResult(r)) return r;
    const c = r.content.endsWith('\n') || !r.content ? r.content : `${r.content}\n`;
    const lines = c ? c.split('\n').length - 1 : 0;
    const words = c.split(/\s+/).filter(Boolean).length;
    const bytes = new TextEncoder().encode(c).length;
    const name = files[0] ? ` ${files[0]}` : '';
    if (hasFlag(args, '-l')) return ok(`${lines}${name}`);
    if (hasFlag(args, '-w')) return ok(`${words}${name}`);
    if (hasFlag(args, '-c')) return ok(`${bytes}${name}`);
    return ok(`${padL(lines, 3)} ${padL(words, 3)} ${padL(bytes, 4)}${name}`);
  },
  sort: (args, ctx) => {
    const r = text(ctx, positionals(args), 'sort');
    if (isResult(r)) return r;
    const lines = r.content.replace(/\n$/, '').split('\n');
    const sorted = hasFlag(args, '-n') ? lines.sort((a, b) => parseFloat(a) - parseFloat(b)) : lines.sort((a, b) => a.localeCompare(b, 'pt-BR'));
    return ok((hasFlag(args, '-r') ? sorted.reverse() : sorted).join('\n'));
  },
  uniq: (args, ctx) => {
    const r = text(ctx, positionals(args), 'uniq');
    if (isResult(r)) return r;
    const lines = r.content.replace(/\n$/, '').split('\n');
    const out: [string, number][] = [];
    for (const l of lines) {
      if (out.length && out[out.length - 1][0] === l) out[out.length - 1][1] += 1;
      else out.push([l, 1]);
    }
    return ok(out.map(([l, n]) => (hasFlag(args, '-c') ? `${padL(n, 7)} ${l}` : l)).join('\n'));
  },
  less: (args, ctx) => commands.cat(args, ctx),

  // ---------------- Sistema ----------------
  true: () => ok(''),
  false: () => ({ out: '', error: true }),
  whoami: () => ok('aluno'),
  id: () => ok('uid=1000(aluno) gid=1000(aluno) grupos=1000(aluno),4(adm),27(sudo)'),
  hostname: (args, ctx) => ok(hasFlag(args, '-I') ? (ctx.s.net.leased ? `${LAN.ip} ` : '') : hasFlag(args, '-f') ? `${HOSTNAME_LINUX}.${LAN.domain}` : HOSTNAME_LINUX, hasFlag(args, '-I') ? 'O hostname -I mostra rapidinho os IPs da máquina, sem o loopback.' : undefined),
  uname: (args) =>
    ok(hasFlag(args, '-a') ? `Linux ${HOSTNAME_LINUX} 6.8.0-48-generic #48-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux` : hasFlag(args, '-r') ? '6.8.0-48-generic' : 'Linux'),
  date: () => ok(new Date().toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Sao_Paulo' }) + ' -03'),
  uptime: () => ok(' 21:00:00 up  3:12,  1 user,  load average: 0,18, 0,22, 0,19'),
  df: () =>
    ok(['Sist. Arq.      Tam. Usado Disp. Uso% Montado em', 'tmpfs           1,6G  2,1M  1,6G   1% /run', '/dev/nvme0n1p2  234G   41G  181G  19% /', '/dev/nvme0n1p1  1,1G  6,1M  1,1G   1% /boot/efi'].join('\n')),
  free: () => ok(['               total        usada        livre    compart.  buff/cache   disponível', 'Mem.:           15Gi        3,1Gi        9,2Gi        412Mi        3,4Gi         12Gi', 'Swap:          4,0Gi           0B        4,0Gi'].join('\n')),
  ps: () =>
    ok(
      [
        'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
        'root           1  0.0  0.0  23344 13824 ?        Ss   17:48   0:02 /sbin/init splash',
        'root         590  0.0  0.0   9064  4224 ?        Ss   17:48   0:00 /sbin/dhclient -4 enp3s0',
        'systemd+     640  0.0  0.0  21456 12800 ?        Ss   17:48   0:01 /usr/lib/systemd/systemd-resolved',
        'root         812  0.0  0.0  12020  7936 ?        Ss   17:48   0:00 sshd: /usr/sbin/sshd -D',
        'aluno       2210  4.2  3.8 11923k 612340 ?       Sl   17:52   8:01 /usr/lib/firefox/firefox',
        'aluno       3301  0.0  0.0  11264  5248 pts/0    Ss   20:58   0:00 bash',
      ].join('\n'),
      'O ps aux lista os processos com usuário, PID e comando. Veja o dhclient (pede IP ao DHCP), o systemd-resolved (DNS) e o sshd (servidor SSH).',
    ),
  kill: (args) => (positionals(args)[0] ? ok('', `Sinal enviado ao processo ${positionals(args)[0]} (simulação).`) : fail('kill: uso: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... ou kill -l [sigspec]')),
  history: (_a, ctx) => ok(ctx.s.history.map((c, i) => `${padL(i + 1, 5)}  ${c}`).join('\n')),
  env: (_a, ctx) => ok(Object.entries(ctx.s.env).map(([k, v]) => `${k}=${v}`).join('\n')),
  printenv: (args, ctx) => (args[0] ? (ctx.s.env[args[0]] !== undefined ? ok(ctx.s.env[args[0]]) : { out: '', error: true }) : commands.env(args, ctx)),
  export: (args, ctx) => {
    for (const a of args) {
      const [k, ...v] = a.split('=');
      if (k && v.length) ctx.s.env[k] = v.join('=');
    }
    return ok('');
  },
  which: (args) => {
    const name = args[0];
    if (!name) return { out: '', error: true };
    return commands[name] ? ok(`/usr/bin/${name}`) : { out: '', error: true };
  },
  man: (args) => {
    const name = args[0];
    if (!name) return fail('Qual página de manual você deseja?\nPor exemplo, tente "man man".');
    const desc: Record<string, string> = {
      ping: 'ping - envia ICMP ECHO_REQUEST para hosts da rede\n\nSINOPSE\n  ping [-c contagem] [-i intervalo] [-s tamanho] [-t ttl] destino',
      ip: 'ip - mostra / manipula roteamento, dispositivos e túneis\n\nSINOPSE\n  ip [ OPÇÕES ] OBJETO { COMANDO | help }\n  OBJETO := { link | address | route | neigh }',
      dig: 'dig - utilitário de consulta DNS\n\nSINOPSE\n  dig [@servidor] [nome] [tipo] [+short]',
      ss: 'ss - outro utilitário para investigar sockets\n\nOPÇÕES\n  -t TCP  -u UDP  -l escutando  -n numérico  -p processos  -a todos',
      curl: 'curl - transfere dados de ou para um servidor\n\nOPÇÕES\n  -I só cabeçalhos  -L segue redirecionamentos  -o arquivo de saída',
      traceroute: 'traceroute - mostra a rota dos pacotes até o host\n\nSINOPSE\n  traceroute [-n] [-m saltos_max] host',
      grep: 'grep - mostra linhas que combinam com padrões\n\nOPÇÕES\n  -i ignora maiúsculas  -v inverte  -c conta  -n número da linha',
    };
    return desc[name] ? ok(`${name.toUpperCase()}(8)\n\nNOME\n  ${desc[name]}\n\n(manual resumido do laboratório; pressione nada, ele já terminou)`) : commands[name] ? ok(`${name}: veja "help" para o uso neste laboratório.`) : fail(`Nenhuma entrada de manual para ${name}`);
  },

  // ---------------- Rede ----------------
  ip: (args, ctx) => {
    const obj = (args.find((a) => !a.startsWith('-')) ?? '').toLowerCase();
    const brief = hasFlag(args, '-br', '-brief');
    if (['a', 'addr', 'address'].includes(obj) || (obj === '' && args.length === 0 && false)) {
      if (brief) return ok(`lo               UNKNOWN        127.0.0.1/8 ::1/128\nenp3s0           UP             ${ctx.s.net.leased ? `${LAN.ip}/24 ` : ''}${LAN.ipv6}/64\nwlp2s0           DOWN`, NOTE.ipa);
      return ok(IP_ADDR(ctx.s.net.leased), NOTE.ipa);
    }
    if (['r', 'route', 'ro'].includes(obj))
      return ok(
        ctx.s.net.leased ? [`default via ${LAN.gateway} dev enp3s0 proto dhcp src ${LAN.ip} metric 100`, `${LAN.network}/${LAN.prefix} dev enp3s0 proto kernel scope link src ${LAN.ip} metric 100`].join('\n') : '',
        ctx.s.net.leased ? NOTE.ipr : 'Sem IP do DHCP, também não há rota padrão. Rode sudo dhclient enp3s0.',
      );
    if (['l', 'link'].includes(obj))
      return ok(
        [
          '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000',
          '    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00',
          '2: enp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000',
          `    link/ether ${LAN.macLinux} brd ff:ff:ff:ff:ff:ff`,
          '3: wlp2s0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN mode DORMANT group default qlen 1000',
          '    link/ether 58:a0:23:91:4c:d2 brd ff:ff:ff:ff:ff:ff',
        ].join('\n'),
        'O "ip link" mostra a camada 2: estado da placa (UP/DOWN), MTU e endereço MAC (link/ether).',
      );
    if (['n', 'neigh', 'neighbor', 'neighbour'].includes(obj))
      return ok(Object.entries(ctx.s.net.arp).map(([ip, mac]) => `${ip} dev enp3s0 lladdr ${mac} REACHABLE`).join('\n'), NOTE.arp);
    return fail('Uso: ip [ OPÇÕES ] OBJETO { COMANDO | help }\nonde  OBJETO := { address | link | route | neigh }\n      OPÇÕES := { -br[ief] | -4 | -6 }\nExemplos: ip a   ip r   ip link   ip neigh');
  },
  ifconfig: (_a, ctx) =>
    ok(
      [
        'enp3s0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500',
        ...(ctx.s.net.leased ? [`        inet ${LAN.ip}  netmask ${LAN.mask}  broadcast ${LAN.broadcast}`] : []),
        `        inet6 ${LAN.ipv6}  prefixlen 64  scopeid 0x20<link>`,
        `        ether ${LAN.macLinux}  txqueuelen 1000  (Ethernet)`,
        '        RX packets 152338  bytes 184206133 (184.2 MB)',
        '        TX packets 98114  bytes 22401977 (22.4 MB)',
        '',
        'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536',
        '        inet 127.0.0.1  netmask 255.0.0.0',
        '        loop  txqueuelen 1000  (Loopback Local)',
      ].join('\n'),
      'O ifconfig é o comando antigo (pacote net-tools); nas distribuições atuais o recomendado é o "ip a". Os dois mostram IP, máscara e MAC.',
    ),
  ping: (args, ctx) => {
    const host = positionals(args, ['-c', '-i', '-s', '-t', '-W', '-w'])[0];
    if (!host) return fail('ping: usage error: Endereço de destino necessário');
    const count = Math.min(Math.max(Number(optValue(args, '-c')) || 4, 1), 20);
    const size = Number(optValue(args, '-s')) || 56;
    const res = lookup(host, ctx.s.net);
    if (!res || (!ctx.s.net.leased && !isIp(host) && !res.ip.startsWith('127.'))) return fail(`ping: ${host}: ${ctx.s.net.leased ? 'Nome ou serviço desconhecido' : 'Falha temporária na resolução de nome'}`);
    const r = simPing(res.ip, count, ctx.s.net);
    if (r.kind === 'nonet') return fail('ping: connect: A rede está fora de alcance');
    const label = isIp(host) ? res.ip : `${res.name} (${res.ip})`;
    const lines = [`PING ${label} ${size}(${size + 28}) bytes of data.`];
    let received = 0;
    const shown = r.kind === 'reply' ? r.times.map((t, i) => (t === 0 ? 0.045 : t + (((i * 37 + 13) % 90) + 5) / 100)) : [];
    if (r.kind === 'reply') {
      shown.forEach((t, i) => lines.push(`${size + 8} bytes from ${label}: icmp_seq=${i + 1} ttl=${r.ttl === 128 ? 64 : r.ttl} time=${t < 1 ? t.toFixed(3) : t.toFixed(1)} ms`));
      received = count;
    } else if (r.kind === 'unreachable') {
      for (let i = 0; i < count; i += 1) lines.push(`From ${r.from} icmp_seq=${i + 1} Destination Host Unreachable`);
    }
    lines.push('', `--- ${isIp(host) ? res.ip : res.name} ping statistics ---`);
    const loss = Math.round(((count - received) / count) * 100);
    lines.push(`${count} packets transmitted, ${received} received, ${r.kind === 'unreachable' ? `+${count} errors, ` : ''}${loss}% packet loss, time ${count * 1001 - 1000}ms`);
    if (r.kind === 'reply') {
      const min = Math.min(...shown);
      const max = Math.max(...shown);
      const avg = shown.reduce((a, b) => a + b, 0) / shown.length;
      const mdev = Math.sqrt(shown.reduce((a, b) => a + (b - avg) ** 2, 0) / shown.length);
      lines.push(`rtt min/avg/max/mdev = ${min.toFixed(3)}/${avg.toFixed(3)}/${max.toFixed(3)}/${mdev.toFixed(3)} ms`);
    }
    const note =
      r.kind === 'unreachable'
        ? 'Destination Host Unreachable: o ARP perguntou "quem tem esse IP?" na rede local e ninguém respondeu.'
        : r.kind === 'timeout'
          ? '100% de perda: o pacote saiu, mas nenhuma resposta voltou (host desligado, sem rota ou firewall bloqueando ICMP).'
          : NOTE.ping;
    return { out: lines.join('\n'), error: r.kind !== 'reply', note };
  },
  traceroute: (args, ctx) => {
    const host = positionals(args, ['-m', '-q', '-w'])[0];
    if (!host) return fail('Usage: traceroute [ -46dFITnreAUDV ] [ -f first_ttl ] [ -m max_ttl ] host');
    const res = lookup(host, ctx.s.net);
    if (!res) return fail(`${host}: Nome ou serviço desconhecido\nCannot handle "host" cmdline arg \`${host}' on position 1 (argc 1)`);
    const hops = traceroute(res.ip, ctx.s.net);
    if (!hops) return fail('connect: A rede está fora de alcance');
    const n = hasFlag(args, '-n');
    const t = (v: number | null) => (v === null ? '*' : `${v === 0 ? '0.051' : `${v}.${v % 10}21`} ms`);
    return ok(
      [
        `traceroute to ${res.name} (${res.ip}), 30 hops max, 60 byte packets`,
        ...hops.map((h) => (h.ip ? `${padL(h.n, 2)}  ${n || !h.name ? h.ip : `${h.name} (${h.ip})`}  ${h.times.map(t).join('  ')}` : `${padL(h.n, 2)}  * * *`)),
      ].join('\n'),
      NOTE.traceroute,
    );
  },
  tracepath: (args, ctx) => {
    const host = positionals(args)[0];
    if (!host) return fail('Usage: tracepath [-4] [-6] [-n] [-b] [-l <len>] [-p port] <destination>');
    const res = lookup(host, ctx.s.net);
    const hops = res ? traceroute(res.ip, ctx.s.net) : null;
    if (!res || !hops) return fail(`tracepath: ${host}: Nome ou serviço desconhecido`);
    return ok(
      [
        ' 1?: [LOCALHOST]                      pmtu 1500',
        ...hops.map((h) => (h.ip ? ` ${h.n}:  ${pad(h.ip, 33)}${padL(`${h.times[0]}.${h.n}12ms`, 10)}` : ` ${h.n}:  no reply`)),
        `     Resume: pmtu 1500 hops ${hops.length} back ${hops.length}`,
      ].join('\n'),
      'O tracepath faz o mesmo que o traceroute e ainda descobre o MTU do caminho (pmtu), sem precisar de sudo.',
    );
  },
  dig: (args, ctx) => {
    const server = args.find((a) => a.startsWith('@'))?.slice(1) ?? '127.0.0.53';
    const short = hasFlag(args, '+short');
    const reverse = optValue(args, '-x');
    const plain = args.filter((a) => !a.startsWith('@') && !a.startsWith('+') && !a.startsWith('-') && a !== reverse);
    const types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'ANY'];
    const type = (plain.find((a) => types.includes(a.toUpperCase())) ?? 'A').toUpperCase();
    const name = reverse ?? plain.find((a) => !types.includes(a.toUpperCase())) ?? '.';
    if (!ctx.s.net.leased) return fail(`;; communications error to ${server}#53: timed out\n;; no servers could be reached`);
    const res = reverse ? resolve(reverse) : lookup(name, ctx.s.net);
    const qname = reverse ? `${reverse.split('.').reverse().join('.')}.in-addr.arpa.` : `${name.replace(/\.$/, '')}.`;
    const answers: string[] = [];
    if (res && !(reverse && res.name === reverse)) {
      if (reverse) answers.push(`${qname}\t300\tIN\tPTR\t${res.name}.`);
      else if (type === 'MX') answers.push(`${qname}\t300\tIN\tMX\t10 smtp.${res.name}.`);
      else if (type === 'NS') answers.push(`${qname}\t21600\tIN\tNS\tns1.${res.name}.`, `${qname}\t21600\tIN\tNS\tns2.${res.name}.`);
      else if (type === 'AAAA') {
        if (res.ipv6) answers.push(`${qname}\t300\tIN\tAAAA\t${res.ipv6}`);
      }
      else if (type === 'TXT') answers.push(`${qname}\t300\tIN\tTXT\t"v=spf1 include:_spf.${res.name} ~all"`);
      else answers.push(`${qname}\t300\tIN\tA\t${res.ip}`);
    }
    if (short) return ok(answers.map((a) => a.split('\t').pop()).join('\n'), NOTE.dig);
    const status = res ? 'NOERROR' : 'NXDOMAIN';
    return ok(
      [
        '',
        `; <<>> DiG 9.18.28-0ubuntu0.24.04.1-Ubuntu <<>> ${args.join(' ')}`,
        ';; global options: +cmd',
        ';; Got answer:',
        `;; ->>HEADER<<- opcode: QUERY, status: ${status}, id: 41877`,
        `;; flags: qr rd ra; QUERY: 1, ANSWER: ${answers.length}, AUTHORITY: 0, ADDITIONAL: 1`,
        '',
        ';; QUESTION SECTION:',
        `;${qname}\t\tIN\t${reverse ? 'PTR' : type}`,
        ...(answers.length ? ['', ';; ANSWER SECTION:', ...answers] : []),
        '',
        `;; Query time: ${res?.local ? 1 : 18} msec`,
        `;; SERVER: ${server}#53(${server}) (UDP)`,
        `;; WHEN: ${new Date().toUTCString()}`,
        ';; MSG SIZE  rcvd: 55',
      ].join('\n'),
      status === 'NXDOMAIN' ? 'status: NXDOMAIN quer dizer que o nome não existe no DNS.' : NOTE.dig,
    );
  },
  nslookup: (args, ctx) => {
    const name = positionals(args)[0];
    if (!name) return fail('nslookup: use "nslookup nome [servidor]"');
    if (!ctx.s.net.leased) return fail(';; communications error to 127.0.0.53#53: timed out\n;; no servers could be reached');
    const res = lookup(name, ctx.s.net);
    const head = ['Server:\t\t127.0.0.53', 'Address:\t127.0.0.53#53', ''];
    if (!res) return fail([...head, `** server can't find ${name}: NXDOMAIN`].join('\n'));
    return ok([...head, 'Non-authoritative answer:', `Name:\t${res.name}`, `Address: ${res.ip}`, ...(res.ipv6 ? [`Name:\t${res.name}`, `Address: ${res.ipv6}`] : [])].join('\n'), 'O nslookup também existe no Linux. 127.0.0.53 é o resolvedor local (systemd-resolved), que repassa a pergunta ao DNS da rede.');
  },
  host: (args, ctx) => {
    const name = positionals(args)[0];
    if (!name) return fail('Usage: host [-aCdilrTvVw] [-c class] [-t type] hostname [server]');
    const res = lookup(name, ctx.s.net);
    if (!ctx.s.net.leased) return fail(';; connection timed out; no servers could be reached');
    if (!res) return fail(`Host ${name} not found: 3(NXDOMAIN)`);
    if (isIp(name)) return res.name === name ? fail(`Host ${name.split('.').reverse().join('.')}.in-addr.arpa. not found: 3(NXDOMAIN)`) : ok(`${name.split('.').reverse().join('.')}.in-addr.arpa domain name pointer ${res.name}.`);
    return ok([`${res.name} has address ${res.ip}`, ...(res.ipv6 ? [`${res.name} has IPv6 address ${res.ipv6}`] : []), ...(res.local ? [] : [`${res.name} mail is handled by 10 smtp.${res.name}.`])].join('\n'), 'O host é a consulta DNS mais curta: mostra os endereços IPv4, IPv6 e o servidor de e-mail (MX).');
  },
  ss: (args) => {
    const f = args.filter((a) => a.startsWith('-')).join('');
    const listen = f.includes('l');
    const tcp = f.includes('t');
    const udp = f.includes('u');
    const procs = f.includes('p');
    const rows = LINUX_SOCKETS.filter((r) => (!tcp && !udp) || (tcp && r.netid === 'tcp') || (udp && r.netid === 'udp')).filter((r) => (listen ? r.state === 'LISTEN' || r.state === 'UNCONN' : f.includes('a') || r.state === 'ESTAB'));
    return ok(
      [
        `Netid State   Recv-Q Send-Q Local Address:Port      Peer Address:Port${procs ? ' Process' : ''}`,
        ...rows.map((r) => `${pad(r.netid, 6)}${pad(r.state, 8)}0      ${pad(r.state === 'LISTEN' ? 4096 : 0, 7)}${pad(r.local, 24)}${pad(r.peer, 19)}${procs ? `users:(("${r.proc}",pid=${r.pid},fd=3))` : ''}`.trimEnd()),
      ].join('\n'),
      NOTE.ss,
    );
  },
  netstat: (args, ctx) => {
    const f = args.join('');
    if (f.includes('r')) return commands.route(['-n'], ctx);
    if (f.includes('i'))
      return ok(['Kernel Interface table', 'Iface      MTU    RX-OK RX-ERR RX-DRP RX-OVR    TX-OK TX-ERR TX-DRP TX-OVR Flg', 'enp3s0    1500   152338      0      0 0         98114      0      0      0 BMRU', 'lo       65536     4120      0      0 0          4120      0      0      0 LRU'].join('\n'));
    const listen = f.includes('l');
    const rows = LINUX_SOCKETS.filter((r) => (listen ? r.state !== 'ESTAB' : f.includes('a') || r.state === 'ESTAB'));
    return ok(
      [
        'Conexões Internet Ativas' + (listen ? ' (servidores)' : ''),
        `Proto Recv-Q Send-Q Endereço Local          Endereço Remoto         Estado${f.includes('p') ? '       PID/Program name' : ''}`,
        ...rows.map((r) => `${pad(r.netid, 6)}     0      0 ${pad(r.local.replace('%lo', ''), 24)}${pad(r.peer, 24)}${pad(r.state === 'ESTAB' ? 'ESTABELECIDA' : r.state === 'LISTEN' ? 'OUÇA' : '', 13)}${f.includes('p') ? `${r.pid}/${r.proc}` : ''}`.trimEnd()),
      ].join('\n'),
      'O netstat é o comando antigo (net-tools); o ss é o substituto moderno e aceita as mesmas opções (-tulpn).',
    );
  },
  arp: (args, ctx) =>
    ok(
      [
        'Endereço                TipoHW  EndereçoHW          Flags  Mascara  Iface',
        ...Object.entries(ctx.s.net.arp).map(([ip, mac]) => `${pad(hasFlag(args, '-n') ? ip : ip === LAN.gateway ? '_gateway' : ip, 24)}ether   ${pad(mac, 20)}C               enp3s0`),
      ].join('\n'),
      NOTE.arp,
    ),
  route: (_a, ctx) =>
    ok(
      [
        'Tabela de Roteamento IP do Kernel',
        'Destino         Roteador        MáscaraGen.     Opções Métrica Ref   Uso Iface',
        ...(ctx.s.net.leased ? [`0.0.0.0         ${pad(LAN.gateway, 16)}0.0.0.0         UG    100    0        0 enp3s0`, `${pad(LAN.network, 16)}0.0.0.0         ${pad(LAN.mask, 16)}U     100    0        0 enp3s0`] : []),
      ].join('\n'),
      'Opção UG = rota Up via Gateway (a rota padrão); U = rede ligada direto na placa.',
    ),
  curl: (args, ctx) => {
    const url = positionals(args, ['-o', '-H', '-X', '-d', '-A', '-w'])[0];
    if (!url) return fail("curl: try 'curl --help' or 'curl --manual' for more information");
    if (/ifconfig\.me|ipinfo\.io\/ip|api\.ipify\.org/i.test(url)) return ctx.s.net.leased ? ok('187.62.112.45', 'Este é o IP público: o endereço do roteador na internet. Todos os aparelhos da casa saem com ele por causa do NAT.') : fail(`curl: (6) Could not resolve host: ${url}`);
    let target = url;
    if (hasFlag(args, '-L') && /^http:\/\//i.test(url) && !resolve(url.replace(/^http:\/\//i, '').split(/[/:]/)[0])?.local) target = url.replace(/^http:/i, 'https:');
    const r = httpRequest(target, hasFlag(args, '-I', '--head'), ctx.s.net.leased);
    const out = optValue(args, '-o');
    if (out && !r.error) {
      ctx.s.fs.write(resolvePath(ctx, out), `${r.out}\n`);
      return ok(`  % Total    % Received % Xferd  Average Speed   Time\n100  ${r.out.length}  100  ${r.out.length}    0     0   9512      0 --:--:--`, `O -o salvou a resposta no arquivo ${out}. Veja com cat ${out}.`);
    }
    return r.error ? r : { ...r, note: r.note ?? NOTE.curl };
  },
  wget: (args, ctx) => {
    const url = positionals(args, ['-O'])[0];
    if (!url) return fail('wget: URL faltando\nUso: wget [OPÇÃO]... [URL]...');
    const r = httpRequest(/^https?:/i.test(url) ? url.replace(/^http:/i, 'https:') : `https://${url}`, false, ctx.s.net.leased);
    const host = url.replace(/^https?:\/\//i, '').split('/')[0];
    if (r.error) return fail(`--2026-11-13 21:00:00--  ${url}\nResolvendo ${host} (${host})... falhou: Nome ou serviço desconhecido.\nwget: não foi possível resolver endereço de máquina "${host}"`);
    const file = optValue(args, '-O') ?? 'index.html';
    ctx.s.fs.write(resolvePath(ctx, file), `${r.out}\n`);
    const ip = resolve(host)?.ip;
    return ok(
      [
        `--2026-11-13 21:00:00--  ${url}`,
        `Resolvendo ${host} (${host})... ${ip}`,
        `Conectando-se a ${host} (${host})|${ip}|:443... conectado.`,
        'A requisição HTTP foi enviada, aguardando resposta... 200 OK',
        `Tamanho: ${r.out.length} [text/html]`,
        `Salvando em: "${file}"`,
        '',
        `${file}            100%[===================>]     ${r.out.length}  --.-KB/s    em 0s`,
      ].join('\n'),
      `O wget baixa o arquivo e salva na pasta atual (${file}). Repare nas etapas: DNS, conexão TCP na porta 443 e a resposta HTTP 200.`,
    );
  },
  nc: (args, ctx) => {
    const [host, portText] = positionals(args, ['-w']);
    const port = Number(portText);
    if (!host || !port) return fail('uso: nc [-46CDdFhklNnrStUuvZz] [-I length] [-i interval] ... [destination] [port]\nEx.: nc -zv 192.168.1.10 22');
    const res = lookup(host, ctx.s.net);
    if (!res || !ctx.s.net.leased) return fail(`nc: getaddrinfo for host "${host}" port ${port}: Name or service not known`);
    const open = portOpen(res.ip, port);
    const svc = SERVICE[port] ?? '*';
    return {
      out: open ? `Connection to ${host} (${res.ip}) ${port} port [tcp/${svc}] succeeded!` : `nc: connect to ${host} (${res.ip}) port ${port} (tcp) failed: Connection refused`,
      error: !open,
      note: NOTE.nc,
    };
  },
  telnet: (args, ctx) => {
    const [host, portText] = positionals(args);
    const port = Number(portText) || 23;
    if (!host) return fail('telnet> (use: telnet host porta)');
    const res = lookup(host, ctx.s.net);
    if (!res) return fail(`telnet: could not resolve ${host}/${port}: Name or service not known`);
    return portOpen(res.ip, port)
      ? ok(`Trying ${res.ip}...\nConnected to ${host}.\nEscape character is '^]'.\nConnection closed by foreign host.`, 'O telnet abre uma conexão TCP crua: serve para testar portas. Nunca use para login remoto, porque tudo trafega sem criptografia (use SSH).')
      : fail(`Trying ${res.ip}...\ntelnet: Unable to connect to remote host: Connection refused`);
  },
  ssh: (args, ctx) => {
    const target = positionals(args, ['-p', '-i', '-l'])[0];
    if (!target) return fail('usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-p port] destination [command]');
    const host = target.includes('@') ? target.split('@')[1] : target;
    const port = Number(optValue(args, '-p')) || 22;
    const res = lookup(host, ctx.s.net);
    if (!res) return fail(`ssh: Could not resolve hostname ${host}: Name or service not known`);
    if (!portOpen(res.ip, port)) return fail(`ssh: connect to host ${host} port ${port}: Connection refused`);
    return ok(
      `The authenticity of host '${host} (${res.ip})' can't be established.\nED25519 key fingerprint is SHA256:Qm9h3sF8yJx2pT7rV1kLw0cNdE4uZbA6gH5iO9jK2mY.\nAre you sure you want to continue connecting (yes/no/[fingerprint])? no\nHost key verification failed.`,
      'O SSH abre um terminal remoto criptografado na porta 22. Na primeira conexão ele mostra a impressão digital da chave do servidor: confira antes de aceitar. (Neste laboratório a conexão para aqui.)',
    );
  },
  nmap: (args, ctx) => {
    const target = positionals(args, ['-p'])[0];
    if (!target) return fail('Nmap 7.94SVN ( https://nmap.org )\nUsage: nmap [Scan Type(s)] [Options] {target specification}\nEx.: nmap 192.168.1.10   nmap -sn 192.168.1.0/24   nmap -p 22,80 servidor');
    if (!ctx.s.net.leased) return fail('Nmap: sem rede (rode sudo dhclient enp3s0)');
    const head = [`Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-11-13 21:00 -03`];
    if (target.includes('/') || hasFlag(args, '-sn')) {
      if (!target.startsWith('192.168.1.')) return ok([...head, 'Nmap done: 256 IP addresses (0 hosts up) scanned in 10.20 seconds'].join('\n'), NOTE.nmap);
      const hosts: [string, string][] = [
        ['192.168.1.1', 'router.netlearn.lan'],
        ['192.168.1.10', 'servidor.netlearn.lan'],
        ['192.168.1.37', HOSTNAME_LINUX],
        ['192.168.1.50', 'impressora.netlearn.lan'],
      ];
      // A varredura fala com cada host, então a tabela ARP aprende os MACs deles.
      for (const ip of ['192.168.1.10', '192.168.1.50']) simPing(ip, 1, ctx.s.net);
      return ok([...head, ...hosts.flatMap(([ip, name]) => [`Nmap scan report for ${name} (${ip})`, 'Host is up (0.0012s latency).']), 'Nmap done: 256 IP addresses (4 hosts up) scanned in 2.41 seconds'].join('\n'), `${NOTE.nmap} O -sn só descobre quais hosts estão ligados, sem testar portas.`);
    }
    const res = lookup(target, ctx.s.net);
    if (!res) return fail(`Failed to resolve "${target}".\nWARNING: No targets were specified, so 0 hosts scanned.`);
    const ports = (optValue(args, '-p') ?? '').split(',').map(Number).filter(Boolean);
    const list = ports.length ? ports : [21, 22, 23, 25, 53, 80, 443, 445, 3306, 3389, 8080, 631, 9100];
    const rows = list.filter((p) => ports.length || portOpen(res.ip, p)).map((p) => `${pad(`${p}/tcp`, 9)}${pad(portOpen(res.ip, p) ? 'open' : 'closed', 7)}${SERVICE[p] ?? 'unknown'}`);
    return ok(
      [...head, `Nmap scan report for ${res.name === res.ip ? res.ip : `${res.name} (${res.ip})`}`, 'Host is up (0.0011s latency).', ports.length ? '' : `Not shown: ${list.length - rows.length} closed tcp ports (conn-refused)`, 'PORT     STATE  SERVICE', ...rows, '', 'Nmap done: 1 IP address (1 host up) scanned in 0.12 seconds'].filter((l, i) => l || i > 2).join('\n'),
      NOTE.nmap,
    );
  },
  dhclient: (args, ctx) => {
    if (hasFlag(args, '-r')) {
      ctx.s.net.leased = false;
      return ok('', 'O dhclient -r devolveu o IP ao servidor DHCP. Veja com ip a (sumiu o "inet 192.168.1.37") e tente um ping. Depois rode sudo dhclient enp3s0.');
    }
    ctx.s.net.leased = true;
    return ok(
      [
        'DHCPDISCOVER on enp3s0 to 255.255.255.255 port 67 interval 3',
        `DHCPOFFER of ${LAN.ip} from ${LAN.dhcpServer}`,
        'DHCPREQUEST for 192.168.1.37 on enp3s0 to 255.255.255.255 port 67',
        `DHCPACK of ${LAN.ip} from ${LAN.dhcpServer}`,
        `bound to ${LAN.ip} -- renewal in 41880 seconds.`,
      ].join('\n'),
      'Esse é o processo DORA do DHCP: Discover, Offer, Request e Ack. O cliente usa broadcast (255.255.255.255) porque ainda não tem IP.',
    );
  },
  nmcli: (args, ctx) => {
    const line = args.join(' ');
    if (line.startsWith('dev wifi') || line.startsWith('device wifi'))
      return ok(['IN-USE  BSSID              SSID           MODE   CHAN  RATE        SIGNAL  BARS  SECURITY', `        A4:5D:36:00:11:22  ${pad(LAN.ssid, 15)}Infra  6     130 Mbit/s  82      ▂▄▆█  WPA2`, '        F0:9F:C2:33:44:55  Vizinho_5G     Infra  36    540 Mbit/s  41      ▂▄__  WPA3'].join('\n'), 'Lista as redes Wi-Fi ao alcance com o sinal e a segurança. WPA2 e WPA3 são seguras; evite redes abertas.');
    return ok(
      ['DEVICE  TYPE      STATE                  CONNECTION', `enp3s0  ethernet  ${ctx.s.net.leased ? 'conectado              Conexão cabeada 1' : 'conectando (obtendo configuração IP)  Conexão cabeada 1'}`, 'wlp2s0  wifi      desconectado           --', 'lo      loopback  não gerenciável        --'].join('\n'),
      'O nmcli conversa com o NetworkManager: mostra cada placa e se ela está conectada.',
    );
  },
  resolvectl: (args, ctx) =>
    args[0] === 'flush-caches'
      ? ((ctx.s.net.dnsCache = {}), ok('', 'Cache de DNS do systemd-resolved limpo (o equivalente ao ipconfig /flushdns do Windows).'))
      : ok(
      ['Global', '         Protocols: -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported', '  resolv.conf mode: stub', '', 'Link 2 (enp3s0)', '    Current Scopes: DNS', `Current DNS Server: ${LAN.dns[0]}`, `       DNS Servers: ${LAN.dns.join(' ')}`, `        DNS Domain: ${LAN.domain}`].join('\n'),
      'O resolvectl mostra para quais servidores DNS o systemd-resolved encaminha as consultas (os que vieram do DHCP).',
    ),
  ufw: (args) =>
    ok(args[0] === 'status' ? 'Status: ativo\n\nPara                       Ação        De\n----                       ----        --\n22/tcp                     ALLOW       192.168.1.0/24\n22/tcp (v6)                DENY        Anywhere (v6)' : 'Uso: ufw COMANDO\n  status | enable | disable | allow PORTA | deny PORTA', 'O ufw é o firewall simplificado do Ubuntu. Aqui o SSH (22/tcp) só é aceito vindo da rede local.'),
  iptables: () =>
    ok(['Chain INPUT (policy DROP)', 'target     prot opt source               destination', 'ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED', 'ACCEPT     tcp  --  192.168.1.0/24       anywhere             tcp dpt:ssh', '', 'Chain FORWARD (policy DROP)', '', 'Chain OUTPUT (policy ACCEPT)'].join('\n'), 'policy DROP na INPUT: tudo que chega é descartado, a não ser respostas de conexões que o computador abriu (ESTABLISHED) e SSH da rede local.'),
  systemctl: (args) =>
    ok(
      `● ${args[1] ?? 'NetworkManager'}.service - ${args[1] === 'ssh' ? 'OpenBSD Secure Shell server' : 'Network Manager'}\n     Loaded: loaded (/usr/lib/systemd/system/${args[1] ?? 'NetworkManager'}.service; enabled; preset: enabled)\n     Active: active (running) since Fri 2026-11-13 17:48:02 -03; 3h 12min ago`,
      'O systemctl status mostra se um serviço está rodando (active) e se inicia junto com o sistema (enabled).',
    ),
  apt: () => fail('E: Este laboratório não tem internet de verdade para instalar pacotes. Os comandos de rede já estão instalados.'),
};

function copyMove(args: string[], ctx: Ctx, move: boolean): Result {
  const [from, to] = positionals(args);
  const name = move ? 'mv' : 'cp';
  if (!from || !to) return fail(`${name}: falta o operando arquivo de destino após '${from ?? ''}'`);
  const node = ctx.s.fs.get(resolvePath(ctx, from));
  if (!node) return fail(`${name}: não foi possível obter estado de '${from}': Arquivo ou diretório inexistente`);
  if (!move && node.type === 'dir' && !hasFlag(args, '-r', '-R', '-a')) return fail(`cp: -r não especificado; omitindo diretório '${from}'`);
  const r = ctx.s.fs.transfer(resolvePath(ctx, from), resolvePath(ctx, to), move);
  if (r === 'nodst') return fail(`${name}: não foi possível criar '${to}': Arquivo ou diretório inexistente`);
  return ok('');
}

export const BASH: ShellDef = {
  id: 'bash',
  commands,
  normalize: (name) => (name === 'more' ? 'less' : name === 'ip6' ? 'ip' : name),
  notFound: (name) => `${name}: comando não encontrado`,
  prompt: (s) => `aluno@${HOSTNAME_LINUX}:${s.cwd === s.home ? '~' : s.cwd.startsWith(`${s.home}/`) ? `~${s.cwd.slice(s.home.length)}` : s.cwd}$`,
  expand: (line, s) =>
    line
      .replace(/\$\?/g, String(s.status))
      .replace(/\$\{?([A-Z_][A-Z0-9_]*)\}?/g, (m, k: string) => (k === 'PWD' ? s.cwd : (s.env[k] ?? '')))
      .replace(/(^|\s)~(?=\/|\s|$)/g, `$1${s.home}`),
  catalog: [
    {
      group: 'Rede',
      items: [
        { cmd: 'ip a', desc: 'IPs e MAC das placas' },
        { cmd: 'ip r', desc: 'rotas (gateway padrão)' },
        { cmd: 'ip neigh', desc: 'tabela ARP' },
        { cmd: 'ifconfig', desc: 'o jeito antigo' },
        { cmd: 'hostname -I', desc: 'só os IPs' },
        { cmd: 'ping -c 4 8.8.8.8', desc: 'testa a conexão' },
        { cmd: 'ping -c 2 google.com', desc: 'ping com nome' },
        { cmd: 'traceroute google.com', desc: 'caminho até o destino' },
        { cmd: 'tracepath github.com', desc: 'caminho + MTU' },
        { cmd: 'dig google.com', desc: 'consulta DNS completa' },
        { cmd: 'dig +short github.com', desc: 'só o IP' },
        { cmd: 'dig @1.1.1.1 gmail.com MX', desc: 'registro MX' },
        { cmd: 'host netlearn-redes.vercel.app', desc: 'DNS resumido' },
        { cmd: 'cat /etc/resolv.conf', desc: 'qual DNS o sistema usa' },
        { cmd: 'ss -tulpn', desc: 'portas abertas' },
        { cmd: 'nc -zv 192.168.1.10 22', desc: 'testa uma porta' },
        { cmd: 'nmap -sn 192.168.1.0/24', desc: 'quem está na rede' },
        { cmd: 'nmap servidor', desc: 'portas de um host' },
        { cmd: 'curl -I https://netlearn-redes.vercel.app', desc: 'cabeçalhos HTTP' },
        { cmd: 'curl ifconfig.me', desc: 'seu IP público' },
        { cmd: 'sudo dhclient -r', desc: 'devolve o IP' },
        { cmd: 'sudo dhclient enp3s0', desc: 'pede IP (DORA)' },
        { cmd: 'nmcli device status', desc: 'NetworkManager' },
        { cmd: 'sudo ufw status', desc: 'firewall' },
        { cmd: 'ssh aluno@servidor', desc: 'acesso remoto' },
      ],
    },
    {
      group: 'Arquivos',
      items: [
        { cmd: 'ls -la', desc: 'lista com detalhes' },
        { cmd: 'cd Documentos', desc: 'entra na pasta' },
        { cmd: 'cd ..', desc: 'volta uma pasta' },
        { cmd: 'pwd', desc: 'pasta atual' },
        { cmd: 'cat Documentos/notas-de-rede.txt', desc: 'mostra um arquivo' },
        { cmd: 'cat /etc/hosts', desc: 'arquivo hosts' },
        { cmd: 'mkdir -p testes/rede', desc: 'cria pastas' },
        { cmd: 'echo "ping ok" > teste.txt', desc: 'grava em arquivo' },
        { cmd: 'cp teste.txt copia.txt', desc: 'copia' },
        { cmd: 'rm teste.txt', desc: 'apaga' },
        { cmd: 'find / -name "*.conf"', desc: 'procura arquivos' },
        { cmd: 'tree', desc: 'árvore de pastas' },
      ],
    },
    {
      group: 'Sistema e texto',
      items: [
        { cmd: 'whoami', desc: 'usuário atual' },
        { cmd: 'uname -a', desc: 'kernel e sistema' },
        { cmd: 'ps aux', desc: 'processos' },
        { cmd: 'ip a | grep inet', desc: 'filtra com grep' },
        { cmd: 'ss -tan | wc -l', desc: 'conta linhas' },
        { cmd: 'history', desc: 'histórico' },
        { cmd: 'echo $HOME', desc: 'variável' },
        { cmd: 'ping -c 1 8.8.8.8 && echo "internet ok"', desc: 'só se der certo' },
        { cmd: 'clear', desc: 'limpa a tela' },
      ],
    },
  ],
};

export { padL };
