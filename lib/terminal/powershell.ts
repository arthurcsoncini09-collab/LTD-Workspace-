// Windows PowerShell 5.1, simulado. Os cmdlets não diferenciam maiúsculas,
// têm apelidos (ls, cat, cd…) e também rodam os programas do Windows (ipconfig, ping…).

import { fail, hasFlag, ok, optValue, pad, positionals, type Ctx, type Handler, type Result, type ShellDef } from './core';
import { sizeOf } from './fs';
import { CONNECTIONS, HOSTNAME_WIN, LAN, SERVICE, isIp, lookup, ping as simPing, portOpen, resolve, traceroute, winMac } from './net';
import { arp, curlExe, getmac, hostname, httpRequest, ipconfig, netsh, netstat, nslookup, pathping, ping, route, tracert } from './windows-net';

const p2 = (n: number) => String(n).padStart(2, '0');
const psDate = (iso: string) => {
  const d = new Date(iso);
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}     ${p2(d.getHours())}:${p2(d.getMinutes())}`;
};

function psError(message: string, line: string, category: string, id: string): Result {
  const first = line.split(/\s+/)[0] ?? '';
  return fail(
    [
      message,
      'No linha:1 caractere:1',
      `+ ${line}`,
      `+ ${'~'.repeat(Math.max(first.length, 1))}`,
      `    + CategoryInfo          : ${category}`,
      `    + FullyQualifiedErrorId : ${id}`,
    ].join('\n'),
  );
}

const pathArg = (args: string[], ...names: string[]) => optValue(args, '-Path', '-LiteralPath', ...names) ?? positionals(args, ['-Path', '-LiteralPath', '-Destination', '-NewName', '-ItemType', '-Value', '-Name', '-Filter', '-Encoding', ...names])[0];

function resolvePath(ctx: Ctx, path: string) {
  return ctx.s.fs.parts(path, ctx.s.cwd, ctx.s.home);
}

function notExists(ctx: Ctx, path: string, cmdlet: string) {
  const full = ctx.s.fs.format(resolvePath(ctx, path));
  return psError(
    `${cmdlet} : Não é possível localizar o caminho '${full}' porque ele não existe.`,
    ctx.raw,
    `ObjectNotFound: (${full}:String) [${cmdlet}], ItemNotFoundException`,
    `PathNotFound,Microsoft.PowerShell.Commands.${cmdlet.replace('-', '')}Command`,
  );
}

/** Expande $env:X, $HOME e $PWD dentro do texto. */
function expand(text: string, ctx: Ctx) {
  return text
    .replace(/\$env:([A-Za-z_]+)/g, (m, k: string) => ctx.s.env[k.toUpperCase()] ?? '')
    .replace(/\$HOME\b/gi, ctx.s.home)
    .replace(/\$PWD\b/gi, ctx.s.cwd)
    .replace(/\$LASTEXITCODE\b/gi, String(ctx.s.status));
}

/** Tabela no formato do Format-Table. */
function table(headers: string[], rows: (string | number)[][]) {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
  const line = (cells: (string | number)[]) => cells.map((c, i) => pad(c, widths[i])).join(' ').trimEnd();
  return ['', line(headers), line(headers.map((h) => '-'.repeat(h.length))), ...rows.map(line), ''].join('\n');
}

function list(obj: Record<string, string | number | boolean>) {
  const w = Math.max(...Object.keys(obj).map((k) => k.length));
  return ['', ...Object.entries(obj).map(([k, v]) => `${pad(k, w)} : ${typeof v === 'boolean' ? (v ? 'True' : 'False') : v}`), ''].join('\n');
}

const NOTE = {
  ipaddr: 'Get-NetIPAddress mostra cada endereço como objeto: PrefixLength 24 é a máscara 255.255.255.0 e PrefixOrigin Dhcp indica que o IP veio do servidor DHCP.',
  ipconf: 'Get-NetIPConfiguration (apelido gip) é o "ipconfig" do PowerShell: IP, gateway e DNS de cada interface.',
  testconn: 'Test-Connection é o ping do PowerShell. Como devolve objetos, dá para filtrar: Test-Connection 8.8.8.8 -Count 2 | Select-Object -First 1.',
  tnc: 'Test-NetConnection testa ping e, com -Port, se uma porta TCP aceita conexão. TcpTestSucceeded False indica porta fechada ou firewall bloqueando.',
  dns: 'Resolve-DnsName consulta o DNS e mostra o tipo de registro: A (IPv4), AAAA (IPv6), MX (e-mail), CNAME (apelido).',
  iwr: 'No Windows PowerShell 5.1, "curl" e "wget" são apelidos do Invoke-WebRequest, não o curl de verdade. Para usar o curl real, digite curl.exe.',
};

const commands: Record<string, Handler> = {
  'get-help': () =>
    ok(
      [
        '',
        'TÓPICO',
        '    Comandos disponíveis neste laboratório (use Get-Command para a lista completa)',
        '',
        '    Rede:     Get-NetIPConfiguration  Get-NetIPAddress  Get-NetAdapter  Get-NetRoute',
        '              Get-NetNeighbor  Get-NetTCPConnection  Get-DnsClientServerAddress',
        '              Get-DnsClientCache  Clear-DnsClientCache  Resolve-DnsName',
        '              Test-Connection  Test-NetConnection  Invoke-WebRequest  Get-NetFirewallProfile',
        '              e os programas do Windows: ipconfig ping tracert nslookup arp netstat route netsh curl.exe',
        '    Arquivos: Get-ChildItem (ls)  Set-Location (cd)  Get-Location (pwd)  Get-Content (cat)',
        '              New-Item  Remove-Item  Copy-Item  Move-Item  Rename-Item  Set-Content  Add-Content',
        '    Pipeline: Select-String  Select-Object  Where-Object  Sort-Object  Measure-Object  Format-Table',
        '    Sistema:  Get-Process  Get-Service  Get-Date  Get-History  $PSVersionTable  $env:USERNAME  Clear-Host',
        '',
        'Dica: ↑ e ↓ navegam no histórico; Tab completa comandos e nomes de arquivos.',
      ].join('\n'),
    ),
  'get-command': (args) => {
    const filter = (args[0] ?? '').toLowerCase().replace(/\*/g, '');
    const names = Object.keys(commands).filter((n) => n.includes('-') && n.includes(filter)).sort();
    return ok(table(['CommandType', 'Name', 'Version', 'Source'], names.map((n) => ['Cmdlet', titleCase(n), '1.0.0.0', 'NetLearn'])));
  },
  'clear-host': () => ({ out: '', clear: true }),
  exit: () => ({ out: '', clear: true, note: 'Neste laboratório o exit apenas limpa a tela.' }),
  'get-location': (_a, ctx) => ok(table(['Path'], [[ctx.s.cwd]])),
  'set-location': (args, ctx) => {
    const target = pathArg(args) ?? '~';
    const parts = resolvePath(ctx, target);
    const node = ctx.s.fs.get(parts);
    if (!node || node.type !== 'dir') return notExists(ctx, target, 'Set-Location');
    ctx.s.cwd = ctx.s.fs.format(ctx.s.fs.canonical(parts));
    return ok('');
  },
  'get-childitem': (args, ctx) => {
    const target = pathArg(args) ?? '.';
    const parts = resolvePath(ctx, target);
    const node = ctx.s.fs.get(parts);
    if (!node) return notExists(ctx, target, 'Get-ChildItem');
    const entries = node.type === 'dir' ? Object.entries(node.children) : [[parts[parts.length - 1], node] as const];
    const filter = optValue(args, '-Filter');
    const shown = entries.filter(([n]) => !filter || new RegExp(`^${filter.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`, 'i').test(n));
    if (hasFlag(args, '-Name')) return ok(shown.map(([n]) => n).join('\n'));
    const path = ctx.s.fs.format(ctx.s.fs.canonical(node.type === 'dir' ? parts : parts.slice(0, -1)));
    const lines = [
      '',
      '',
      `    Diretório: ${path}`,
      '',
      '',
      'Mode                 LastWriteTime         Length Name',
      '----                 -------------         ------ ----',
      ...shown.map(([n, c]) => `${c.type === 'dir' ? 'd-----' : '-a----'}        ${psDate(c.modified)}${c.type === 'dir' ? ''.padStart(15) : String(sizeOf(c)).padStart(15)} ${n}`),
      '',
    ];
    return ok(lines.join('\n'));
  },
  'get-content': (args, ctx) => {
    const target = pathArg(args);
    if (!target) return psError('Get-Content : Não é possível associar o argumento ao parâmetro "Path" porque ele é nulo.', ctx.raw, 'InvalidData', 'ParameterArgumentValidationErrorNullNotAllowed');
    const node = ctx.s.fs.get(resolvePath(ctx, target));
    if (!node) return notExists(ctx, target, 'Get-Content');
    if (node.type === 'dir') return psError(`Get-Content : Não é possível localizar o caminho porque ele é uma pasta.`, ctx.raw, 'ReadError', 'GetContentReaderUnauthorizedAccessError');
    let lines = node.content.replace(/\n$/, '').split('\n');
    const head = Number(optValue(args, '-TotalCount', '-Head', '-First'));
    const tail = Number(optValue(args, '-Tail', '-Last'));
    if (head) lines = lines.slice(0, head);
    if (tail) lines = lines.slice(-tail);
    return ok(lines.join('\n'), target.toLowerCase().includes('hosts') ? 'O arquivo hosts é consultado antes do DNS: um nome listado aqui vai direto para o IP escrito ao lado.' : undefined);
  },
  'set-content': (args, ctx) => writeContent(args, ctx, false),
  'add-content': (args, ctx) => writeContent(args, ctx, true),
  'new-item': (args, ctx) => {
    const target = pathArg(args, '-Name');
    if (!target) return fail('New-Item : informe o caminho. Ex.: New-Item teste.txt  ou  New-Item -ItemType Directory pasta');
    const type = (optValue(args, '-ItemType', '-Type') ?? 'File').toLowerCase();
    const parts = resolvePath(ctx, target);
    if (ctx.s.fs.get(parts) && !hasFlag(args, '-Force'))
      return psError(`New-Item : Já existe um item com o nome especificado ${ctx.s.fs.format(parts)}.`, ctx.raw, `ResourceExists: (${ctx.s.fs.format(parts)}:String) [New-Item], IOException`, 'DirectoryExist,Microsoft.PowerShell.Commands.NewItemCommand');
    if (type.startsWith('dir')) ctx.s.fs.mkdir(parts, true);
    else if (!ctx.s.fs.write(parts, optValue(args, '-Value') ?? '')) return notExists(ctx, target, 'New-Item');
    const created = ctx.s.fs.canonical(parts);
    return commands['get-childitem']([ctx.s.fs.format(created.slice(0, -1)), '-Filter', created[created.length - 1]], ctx);
  },
  'remove-item': (args, ctx) => {
    const target = pathArg(args);
    if (!target) return fail('Remove-Item : informe o caminho do item.');
    const parts = resolvePath(ctx, target);
    const node = ctx.s.fs.get(parts);
    if (!node) return notExists(ctx, target, 'Remove-Item');
    if (node.type === 'dir' && Object.keys(node.children).length && !hasFlag(args, '-Recurse', '-r'))
      return fail(`Confirmar\nO item em ${ctx.s.fs.format(parts)} tem filhos e o parâmetro Recurse não foi especificado. Use Remove-Item -Recurse.`);
    ctx.s.fs.remove(parts);
    return ok('');
  },
  'copy-item': (args, ctx) => transfer(args, ctx, false),
  'move-item': (args, ctx) => transfer(args, ctx, true),
  'rename-item': (args, ctx) => {
    const target = pathArg(args, '-NewName');
    const newName = optValue(args, '-NewName') ?? positionals(args, ['-Path', '-NewName'])[1];
    if (!target || !newName) return fail('Rename-Item : informe o item e o novo nome. Ex.: Rename-Item teste.txt novo.txt');
    const parts = resolvePath(ctx, target);
    if (!ctx.s.fs.get(parts)) return notExists(ctx, target, 'Rename-Item');
    ctx.s.fs.transfer(parts, [...parts.slice(0, -1), newName], true);
    return ok('');
  },
  'write-output': (_a, ctx) => ok(expand(ctx.raw.replace(/^\s*\S+\s?/, ''), ctx).replace(/^["']|["']$/g, '')),
  'write-host': (_a, ctx) => ok(expand(ctx.raw.replace(/^\s*\S+\s?/, '').replace(/-ForegroundColor\s+\S+/i, ''), ctx).trim().replace(/^["']|["']$/g, '')),
  'get-date': () => {
    const d = new Date();
    return ok(`\n${d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ${d.toLocaleTimeString('pt-BR')}\n`);
  },
  'get-history': (_a, ctx) => ok(table(['Id', 'CommandLine'], ctx.s.history.slice(0, -1).map((c, i) => [i + 1, c]))),
  whoami: () => ok('pc-aluno\\aluno'),
  hostname,
  'get-process': () =>
    ok(
      table(
        ['Handles', 'NPM(K)', 'PM(K)', 'WS(K)', 'CPU(s)', 'Id', 'SI', 'ProcessName'],
        [
          [3120, 88, 312044, 298112, '142,31', 6120, 1, 'chrome'],
          [1980, 64, 98512, 120004, '35,02', 4412, 1, 'explorer'],
          [612, 30, 61220, 70412, '2,11', 7790, 1, 'powershell'],
          [890, 22, 14880, 21660, '9,47', 1024, 0, 'svchost'],
          [0, 0, 60, 8, '', 0, 0, 'Idle'],
        ],
      ),
      'Get-Process lista os processos. O Id é o PID que aparece no Get-NetTCPConnection (OwningProcess).',
    ),
  'stop-process': (args) => ok(`(simulação) Processo ${optValue(args, '-Id', '-Name') ?? args[0] ?? ''} finalizado.`),
  'get-service': (args) => {
    const rows = [
      ['Running', 'Dhcp', 'Cliente DHCP'],
      ['Running', 'Dnscache', 'Cliente DNS'],
      ['Running', 'LanmanWorkstation', 'Estação de trabalho'],
      ['Running', 'mpssvc', 'Firewall do Windows Defender'],
      ['Stopped', 'RemoteRegistry', 'Registro Remoto'],
      ['Running', 'WlanSvc', 'Configuração Automática de WLAN'],
    ];
    const f = (positionals(args, ['-Name'])[0] ?? optValue(args, '-Name') ?? '').toLowerCase().replace(/\*/g, '');
    return ok(table(['Status', 'Name', 'DisplayName'], rows.filter((r) => r[1].toLowerCase().includes(f))), 'Os serviços Dhcp e Dnscache são os clientes DHCP e DNS do Windows: se pararem, o computador não recebe IP ou não resolve nomes.');
  },
  '$var': (_a, ctx) => {
    const v = ctx.raw.trim();
    if (/^\$PSVersionTable/i.test(v))
      return ok(
        table(['Name', 'Value'], [
          ['PSVersion', '5.1.22621.4391'],
          ['PSEdition', 'Desktop'],
          ['BuildVersion', '10.0.22621.4391'],
          ['CLRVersion', '4.0.30319.42000'],
        ]),
      );
    if (/^\$env:/i.test(v)) {
      const k = v.slice(5).toUpperCase();
      return ctx.s.env[k] !== undefined ? ok(ctx.s.env[k]) : ok('');
    }
    if (/^\$HOME$/i.test(v)) return ok(ctx.s.home);
    if (/^\$PWD$/i.test(v)) return ok(table(['Path'], [[ctx.s.cwd]]));
    if (/^\$LASTEXITCODE$/i.test(v)) return ok(String(ctx.s.status));
    if (/^\$\w+\s*=/.test(v)) return ok('', 'Variáveis próprias não são guardadas neste laboratório; use $env:, $HOME, $PWD ou $PSVersionTable.');
    return ok('');
  },

  // ---------------- Rede (cmdlets) ----------------
  'get-netadapter': () =>
    ok(
      table(['Name', 'InterfaceDescription', 'ifIndex', 'Status', 'MacAddress', 'LinkSpeed'], [
        ['Ethernet', 'Realtek PCIe GbE Family Controller', 12, 'Up', LAN.macWin, '1 Gbps'],
        ['Wi-Fi', 'Intel(R) Wi-Fi 6 AX201 160MHz', 9, 'Disconnected', '58-A0-23-91-4C-D2', '0 bps'],
      ]),
      'Get-NetAdapter lista as placas de rede: Status Up significa cabo conectado e link ativo; LinkSpeed é a velocidade negociada.',
    ),
  'get-netipaddress': (args, ctx) => {
    const ip = ctx.s.net.leased ? LAN.ip : '169.254.73.12';
    const rows: Record<string, string | number>[] = [
      { IPAddress: ip, InterfaceIndex: 12, InterfaceAlias: 'Ethernet', AddressFamily: 'IPv4', Type: 'Unicast', PrefixLength: ctx.s.net.leased ? 24 : 16, PrefixOrigin: ctx.s.net.leased ? 'Dhcp' : 'WellKnown', SuffixOrigin: ctx.s.net.leased ? 'Dhcp' : 'Link', AddressState: 'Preferred' },
      { IPAddress: '127.0.0.1', InterfaceIndex: 1, InterfaceAlias: 'Loopback Pseudo-Interface 1', AddressFamily: 'IPv4', Type: 'Unicast', PrefixLength: 8, PrefixOrigin: 'WellKnown', SuffixOrigin: 'WellKnown', AddressState: 'Preferred' },
    ];
    const fam = optValue(args, '-AddressFamily');
    const shown = fam && fam.toLowerCase() === 'ipv6' ? [] : rows;
    return ok(shown.map((r) => list(r)).join(''), NOTE.ipaddr);
  },
  'get-netipconfiguration': (_a, ctx) =>
    ok(
      list({
        InterfaceAlias: 'Ethernet',
        InterfaceIndex: 12,
        InterfaceDescription: 'Realtek PCIe GbE Family Controller',
        NetProfile_Name: ctx.s.net.leased ? LAN.domain : 'Rede não identificada',
        IPv4Address: ctx.s.net.leased ? LAN.ip : '169.254.73.12',
        IPv6LinkLocalAddress: `${LAN.ipv6}%12`,
        IPv4DefaultGateway: ctx.s.net.leased ? LAN.gateway : '',
        DNSServer: ctx.s.net.leased ? LAN.dns.join('\n                     ') : '',
      }),
      NOTE.ipconf,
    ),
  'get-netroute': () =>
    ok(
      table(['ifIndex', 'DestinationPrefix', 'NextHop', 'RouteMetric', 'ifMetric', 'PolicyStore'], [
        [12, '255.255.255.255/32', '0.0.0.0', 256, 25, 'ActiveStore'],
        [12, `${LAN.broadcast}/32`, '0.0.0.0', 256, 25, 'ActiveStore'],
        [12, `${LAN.ip}/32`, '0.0.0.0', 256, 25, 'ActiveStore'],
        [12, `${LAN.network}/24`, '0.0.0.0', 256, 25, 'ActiveStore'],
        [12, '0.0.0.0/0', LAN.gateway, 0, 25, 'ActiveStore'],
        [1, '127.0.0.0/8', '0.0.0.0', 256, 75, 'ActiveStore'],
      ]),
      'NextHop 0.0.0.0 = a rede está ligada direto na placa. A rota 0.0.0.0/0 com NextHop no gateway é a rota padrão.',
    ),
  'get-netneighbor': (_a, ctx) =>
    ok(
      table(['ifIndex', 'IPAddress', 'LinkLayerAddress', 'State', 'PolicyStore'], [
        ...Object.entries(ctx.s.net.arp).map(([ip, mac]) => [12, ip, winMac(mac), 'Reachable', 'ActiveStore']),
        [12, LAN.broadcast, 'FF-FF-FF-FF-FF-FF', 'Permanent', 'ActiveStore'],
      ]),
      'Get-NetNeighbor é a tabela ARP do PowerShell: o IP de cada vizinho da rede local e o seu MAC.',
    ),
  'get-nettcpconnection': (args) => {
    const st = (optValue(args, '-State') ?? '').toLowerCase();
    const map: Record<string, string> = { LISTENING: 'Listen', ESTABLISHED: 'Established', TIME_WAIT: 'TimeWait' };
    const rows = CONNECTIONS.filter((c) => c.proto === 'TCP')
      .map((c) => [c.local.split(':')[0], c.local.split(':')[1], c.remote.split(':')[0], c.remote.split(':')[1], map[c.state] ?? c.state, '', c.pid])
      .filter((r) => !st || String(r[4]).toLowerCase() === st);
    return ok(table(['LocalAddress', 'LocalPort', 'RemoteAddress', 'RemotePort', 'State', 'AppliedSetting', 'OwningProcess'], rows), 'Get-NetTCPConnection é o netstat do PowerShell. Filtre com -State Established ou -LocalPort 443.');
  },
  'get-dnsclientserveraddress': () =>
    ok(
      table(['InterfaceAlias', 'Interface Index', 'Address Family', 'ServerAddresses'], [
        ['Ethernet', 12, 'IPv4', `{${LAN.dns.join(', ')}}`],
        ['Ethernet', 12, 'IPv6', '{}'],
        ['Wi-Fi', 9, 'IPv4', '{}'],
      ]),
      'Mostra quais servidores DNS cada placa usa. Eles vieram do DHCP junto com o IP.',
    ),
  'get-dnsclientcache': (_a, ctx) => {
    const rows = Object.entries(ctx.s.net.dnsCache).map(([n, ip]) => [n, 'A', 'Success', 'Answer', 245, 4, ip]);
    return ok(rows.length ? table(['Entry', 'RecordType', 'Status', 'Section', 'TimeToLive', 'DataLength', 'Data'], rows) : '', rows.length ? 'Cada linha é uma consulta DNS recente guardada em cache pelo tempo do TTL.' : 'O cache está vazio. Rode Resolve-DnsName google.com e veja de novo.');
  },
  'clear-dnsclientcache': (_a, ctx) => {
    ctx.s.net.dnsCache = {};
    return ok('', 'Cache de DNS limpo (o mesmo que ipconfig /flushdns).');
  },
  'resolve-dnsname': (args, ctx) => {
    const name = optValue(args, '-Name') ?? positionals(args, ['-Type', '-Server', '-Name'])[0];
    if (!name) return fail('Resolve-DnsName : informe o nome. Ex.: Resolve-DnsName google.com');
    const type = (optValue(args, '-Type') ?? 'A_AAAA').toUpperCase();
    if (!ctx.s.net.leased) return psError(`Resolve-DnsName : ${name} : Tempo limite da operação esgotado`, ctx.raw, `OperationTimeout: (${name}:String) [Resolve-DnsName], Win32Exception`, 'ERROR_TIMEOUT,Microsoft.DnsClient.Commands.ResolveDnsName');
    const res = lookup(name, ctx.s.net);
    if (!res) return psError(`Resolve-DnsName : ${name} : Nome DNS não existe`, ctx.raw, `ResourceUnavailable: (${name}:String) [Resolve-DnsName], Win32Exception`, 'DNS_ERROR_RCODE_NAME_ERROR,Microsoft.DnsClient.Commands.ResolveDnsName');
    if (type === 'MX') return ok(table(['Name', 'Type', 'TTL', 'Section', 'NameExchange', 'Preference'], [[res.name, 'MX', 300, 'Answer', `smtp.${res.name}`, 10]]), NOTE.dns);
    const rows: (string | number)[][] = [];
    if (res.ipv6 && type !== 'A') rows.push([res.name, 'AAAA', 300, 'Answer', res.ipv6]);
    if (type !== 'AAAA') rows.push([res.name, 'A', 300, 'Answer', res.ip]);
    return ok(table(['Name', 'Type', 'TTL', 'Section', 'IPAddress'], rows), NOTE.dns);
  },
  'test-connection': (args, ctx) => {
    const target = optValue(args, '-ComputerName', '-TargetName') ?? positionals(args, ['-Count', '-ComputerName', '-TargetName', '-BufferSize'])[0];
    if (!target) return fail('Test-Connection : informe o destino. Ex.: Test-Connection 8.8.8.8 -Count 2');
    const count = Math.min(Number(optValue(args, '-Count')) || 4, 20);
    const res = lookup(target, ctx.s.net);
    const r = res ? simPing(res.ip, count, ctx.s.net) : null;
    if (hasFlag(args, '-Quiet')) return ok(r?.kind === 'reply' ? 'True' : 'False', NOTE.testconn);
    if (!res || !r || r.kind !== 'reply')
      return psError(
        `Test-Connection : Falha na conexão de teste com o computador '${target}': ${!res ? 'O host não existe' : r?.kind === 'nonet' ? 'Erro devido à falta de recursos' : 'Esgotado o tempo limite do pedido'}`,
        ctx.raw,
        `ResourceUnavailable: (${target}:String) [Test-Connection], PingException`,
        'TestConnectionException,Microsoft.PowerShell.Commands.TestConnectionCommand',
      );
    return ok(table(['Source', 'Destination', 'IPV4Address', 'IPV6Address', 'Bytes', 'Time(ms)'], r.times.map((t) => [HOSTNAME_WIN, target, res.ip, '', 32, t])), NOTE.testconn);
  },
  'test-netconnection': (args, ctx) => {
    const target = optValue(args, '-ComputerName') ?? positionals(args, ['-Port', '-ComputerName', '-CommonTCPPort', '-InformationLevel'])[0] ?? 'internetbeacon.msedge.net';
    const res = lookup(target === 'internetbeacon.msedge.net' ? 'www.example.com' : target, ctx.s.net);
    const common: Record<string, number> = { http: 80, rdp: 3389, smb: 445, winrm: 5985 };
    const port = Number(optValue(args, '-Port')) || common[(optValue(args, '-CommonTCPPort') ?? '').toLowerCase()];
    if (!res || !ctx.s.net.leased) return ok(`AVISO: Falha na resolução de nome para ${target}\n${list({ ComputerName: target, RemoteAddress: '', InterfaceAlias: 'Ethernet', SourceAddress: ctx.s.net.leased ? LAN.ip : '169.254.73.12', PingSucceeded: false })}`, NOTE.tnc);
    if (hasFlag(args, '-TraceRoute')) {
      const hops = traceroute(res.ip, ctx.s.net) ?? [];
      return ok(list({ ComputerName: target, RemoteAddress: res.ip, InterfaceAlias: 'Ethernet', SourceAddress: LAN.ip, PingSucceeded: true, 'PingReplyDetails (RTT)': `${hops[hops.length - 1]?.times[0] ?? 0} ms`, TraceRoute: hops.map((h) => h.ip ?? '0.0.0.0').join('\n                         ') }), NOTE.tnc);
    }
    if (port) {
      const open = portOpen(res.ip, port);
      return ok(
        `${open ? '' : `AVISO: TCP connect to (${res.ip} : ${port}) failed\n`}${list({ ComputerName: target, RemoteAddress: res.ip, RemotePort: port, InterfaceAlias: 'Ethernet', SourceAddress: LAN.ip, TcpTestSucceeded: open })}`,
        open ? `A porta ${port} (${SERVICE[port] ?? 'serviço'}) aceitou a conexão TCP: o handshake SYN, SYN-ACK, ACK foi concluído.` : NOTE.tnc,
      );
    }
    const r = simPing(res.ip, 1, ctx.s.net);
    return ok(list({ ComputerName: target, RemoteAddress: res.ip, InterfaceAlias: 'Ethernet', SourceAddress: LAN.ip, PingSucceeded: r.kind === 'reply', 'PingReplyDetails (RTT)': r.kind === 'reply' ? `${r.times[0]} ms` : '0 ms' }), NOTE.tnc);
  },
  'invoke-webrequest': (args, ctx) => {
    const url = optValue(args, '-Uri') ?? positionals(args, ['-Uri', '-Method', '-OutFile', '-UseBasicParsing'])[0];
    if (!url) return fail('Invoke-WebRequest : informe o endereço. Ex.: Invoke-WebRequest https://netlearn-redes.vercel.app');
    const full = /^https?:\/\//i.test(url) ? url : `http://${url}`;
    const r = httpRequest(full, true, ctx.s.net.leased);
    if (r.error) return psError(`Invoke-WebRequest : Não é possível conectar ao servidor remoto`, ctx.raw, 'InvalidOperation: (System.Net.HttpWebRequest:HttpWebRequest) [Invoke-WebRequest], WebException', 'WebCmdletWebResponseException,Microsoft.PowerShell.Commands.InvokeWebRequestCommand');
    const redirected = full.startsWith('http://') && !resolve(full.replace(/^https?:\/\//, '').split('/')[0])?.local;
    const note = ctx.name === 'invoke-webrequest' && /^(curl|wget)$/i.test(ctx.raw.trim().split(/\s+/)[0]) ? NOTE.iwr : 'Invoke-WebRequest faz a requisição HTTP e devolve um objeto: StatusCode 200 = OK. Ele segue redirecionamentos (301) sozinho.';
    return ok(
      list({
        StatusCode: 200,
        StatusDescription: 'OK',
        Content: `<!doctype html><html lang="pt-BR"><head><title>${url}</title>...`,
        RawContent: `HTTP/1.1 200 OK${redirected ? ' (após redirecionar para HTTPS)' : ''}\n                    Content-Type: text/html; charset=utf-8`,
        Headers: '{[Content-Type, text/html; charset=utf-8], [Server, nginx]}',
        RawContentLength: 1256,
      }),
      note,
    );
  },
  'invoke-restmethod': (args, ctx) => {
    const url = optValue(args, '-Uri') ?? positionals(args, ['-Uri', '-Method'])[0] ?? '';
    if (!ctx.s.net.leased) return fail('Invoke-RestMethod : Não é possível conectar ao servidor remoto');
    if (/ipify|ifconfig\.me|ipinfo/i.test(url)) return ok('187.62.112.45', 'Este é o IP público: o endereço do roteador na internet. Todos os aparelhos da casa saem com ele por causa do NAT.');
    return ok(list({ status: 'ok', url, mensagem: 'Resposta JSON simulada' }), 'Invoke-RestMethod é usado com APIs: ele já converte a resposta JSON em objeto.');
  },
  'get-netfirewallprofile': () =>
    ok(
      ['Domain', 'Private', 'Public'].map((n) => list({ Name: n, Enabled: true, DefaultInboundAction: 'Block', DefaultOutboundAction: 'Allow' })).join(''),
      'Os três perfis do firewall do Windows estão ativos: entrada bloqueada por padrão, saída liberada.',
    ),

  // ---------------- Pipeline ----------------
  'select-string': (args, ctx) => {
    const pattern = optValue(args, '-Pattern') ?? positionals(args, ['-Pattern', '-Path'])[0];
    if (!pattern) return fail('Select-String : informe o padrão. Ex.: ipconfig | Select-String IPv4');
    let text = ctx.stdin;
    const file = optValue(args, '-Path') ?? positionals(args, ['-Pattern', '-Path'])[1];
    if (text === null && file) {
      const node = ctx.s.fs.get(resolvePath(ctx, file));
      if (!node || node.type !== 'file') return notExists(ctx, file, 'Select-String');
      text = node.content;
    }
    let re: RegExp;
    try {
      re = new RegExp(pattern, hasFlag(args, '-CaseSensitive') ? '' : 'i');
    } catch {
      re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    return ok((text ?? '').split('\n').filter((l) => re.test(l) !== hasFlag(args, '-NotMatch')).join('\n'));
  },
  'select-object': (args, ctx) => {
    const lines = (ctx.stdin ?? '').split('\n');
    const first = Number(optValue(args, '-First'));
    const last = Number(optValue(args, '-Last'));
    if (first) return ok(takeRows(lines, first, 'first'));
    if (last) return ok(takeRows(lines, last, 'last'));
    return ok(ctx.stdin ?? '');
  },
  'where-object': (_a, ctx) => {
    const m = ctx.raw.match(/-(match|like|eq)\s+["']?([^"'}]+)["']?/i);
    if (!m) return ok(ctx.stdin ?? '', 'Neste laboratório o Where-Object entende filtros simples, como: Get-Service | Where-Object { $_ -match "Running" }.');
    const value = m[2].trim().replace(/\*/g, '');
    const lines = (ctx.stdin ?? '').split('\n');
    const header = lines.findIndex((l) => /^-+/.test(l.trim()));
    const keep = lines.filter((l, i) => (header >= 0 && i <= header) || l.toLowerCase().includes(value.toLowerCase()));
    return ok(keep.join('\n'));
  },
  'sort-object': (args, ctx) => {
    const lines = (ctx.stdin ?? '').split('\n').filter((l) => l.trim());
    const sorted = [...lines].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    return ok((hasFlag(args, '-Descending') ? sorted.reverse() : sorted).join('\n'));
  },
  'measure-object': (args, ctx) => {
    const lines = (ctx.stdin ?? '').split('\n').filter((l) => l.trim());
    return ok(hasFlag(args, '-Line') ? table(['Lines', 'Words', 'Characters', 'Property'], [[lines.length, '', '', '']]) : list({ Count: lines.length, Average: '', Sum: '', Maximum: '', Minimum: '', Property: '' }));
  },
  'format-table': (_a, ctx) => ok(ctx.stdin ?? ''),
  'format-list': (_a, ctx) => ok(ctx.stdin ?? ''),
  'out-string': (_a, ctx) => ok(ctx.stdin ?? ''),
  'out-host': (_a, ctx) => ok(ctx.stdin ?? ''),

  // ---------------- Programas do Windows ----------------
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
  'curl.exe': curlExe,
  mkdir: (args, ctx) => commands['new-item']([...args, '-ItemType', 'Directory'], ctx),
  md: (args, ctx) => commands['new-item']([...args, '-ItemType', 'Directory'], ctx),
  cmd: () => ok('Para usar o Prompt de Comando, clique na aba "CMD" acima do terminal.'),
};

function takeRows(lines: string[], n: number, from: 'first' | 'last') {
  const header = lines.findIndex((l) => /^-{2,}/.test(l.trim()));
  if (header >= 0) {
    const head = lines.slice(0, header + 1);
    const body = lines.slice(header + 1).filter((l) => l.trim());
    return [...head, ...(from === 'first' ? body.slice(0, n) : body.slice(-n)), ''].join('\n');
  }
  const body = lines.filter((l) => l.trim());
  return (from === 'first' ? body.slice(0, n) : body.slice(-n)).join('\n');
}

function writeContent(args: string[], ctx: Ctx, append: boolean): Result {
  const target = pathArg(args, '-Value');
  const value = optValue(args, '-Value') ?? positionals(args, ['-Path', '-Value'])[1] ?? ctx.stdin ?? '';
  if (!target) return fail(`${append ? 'Add' : 'Set'}-Content : informe o caminho. Ex.: Set-Content teste.txt "olá"`);
  if (!ctx.s.fs.write(resolvePath(ctx, target), `${expand(value, ctx)}\n`, append)) return notExists(ctx, target, append ? 'Add-Content' : 'Set-Content');
  return ok('');
}

function transfer(args: string[], ctx: Ctx, move: boolean): Result {
  const from = pathArg(args, '-Destination');
  const to = optValue(args, '-Destination') ?? positionals(args, ['-Path', '-Destination'])[1] ?? '.';
  const cmdlet = move ? 'Move-Item' : 'Copy-Item';
  if (!from) return fail(`${cmdlet} : informe a origem e o destino.`);
  const r = ctx.s.fs.transfer(resolvePath(ctx, from), resolvePath(ctx, to), move);
  if (r === 'nosrc') return notExists(ctx, from, cmdlet);
  if (r === 'nodst') return notExists(ctx, to, cmdlet);
  return ok('');
}

const CANONICAL = [
  'Get-Help', 'Get-Command', 'Clear-Host', 'Get-Location', 'Set-Location', 'Get-ChildItem', 'Get-Content', 'Set-Content', 'Add-Content',
  'New-Item', 'Remove-Item', 'Copy-Item', 'Move-Item', 'Rename-Item', 'Write-Output', 'Write-Host', 'Get-Date', 'Get-History',
  'Get-Process', 'Stop-Process', 'Get-Service', 'Get-NetAdapter', 'Get-NetIPAddress', 'Get-NetIPConfiguration', 'Get-NetRoute',
  'Get-NetNeighbor', 'Get-NetTCPConnection', 'Get-DnsClientServerAddress', 'Get-DnsClientCache', 'Clear-DnsClientCache',
  'Resolve-DnsName', 'Test-Connection', 'Test-NetConnection', 'Invoke-WebRequest', 'Invoke-RestMethod', 'Get-NetFirewallProfile',
  'Select-String', 'Select-Object', 'Where-Object', 'Sort-Object', 'Measure-Object', 'Format-Table', 'Format-List', 'Out-String', 'Out-Host',
];
const PRETTY: Record<string, string> = Object.fromEntries(CANONICAL.map((n) => [n.toLowerCase(), n]));
export const prettyName = (n: string) => PRETTY[n] ?? n;
const titleCase = prettyName;

const ALIASES: Record<string, string> = {
  help: 'get-help',
  man: 'get-help',
  gcm: 'get-command',
  cls: 'clear-host',
  clear: 'clear-host',
  pwd: 'get-location',
  gl: 'get-location',
  cd: 'set-location',
  sl: 'set-location',
  chdir: 'set-location',
  ls: 'get-childitem',
  dir: 'get-childitem',
  gci: 'get-childitem',
  cat: 'get-content',
  type: 'get-content',
  gc: 'get-content',
  sc: 'set-content',
  ac: 'add-content',
  ni: 'new-item',
  rm: 'remove-item',
  del: 'remove-item',
  ri: 'remove-item',
  rmdir: 'remove-item',
  erase: 'remove-item',
  cp: 'copy-item',
  copy: 'copy-item',
  cpi: 'copy-item',
  mv: 'move-item',
  move: 'move-item',
  mi: 'move-item',
  ren: 'rename-item',
  rni: 'rename-item',
  echo: 'write-output',
  write: 'write-output',
  date: 'get-date',
  history: 'get-history',
  h: 'get-history',
  ps: 'get-process',
  gps: 'get-process',
  kill: 'stop-process',
  spps: 'stop-process',
  gsv: 'get-service',
  gip: 'get-netipconfiguration',
  tnc: 'test-netconnection',
  curl: 'invoke-webrequest',
  wget: 'invoke-webrequest',
  iwr: 'invoke-webrequest',
  irm: 'invoke-restmethod',
  sls: 'select-string',
  select: 'select-object',
  where: 'where-object',
  '?': 'where-object',
  sort: 'sort-object',
  measure: 'measure-object',
  ft: 'format-table',
  fl: 'format-list',
  more: 'out-host',
  'ipconfig.exe': 'ipconfig',
  'ping.exe': 'ping',
};

export const POWERSHELL: ShellDef = {
  id: 'powershell',
  commands,
  normalize: (name) => {
    if (name.startsWith('$')) return '$var';
    const n = name.toLowerCase();
    return ALIASES[n] ?? n;
  },
  expand: (line, s) =>
    line
      .replace(/\$env:([A-Za-z_]+)/g, (m, k: string) => (/^\s*\$env:/i.test(line) ? m : (s.env[k.toUpperCase()] ?? '')))
      .replace(/\$HOME\b/g, s.home),
  notFound: (name) =>
    [
      `${name} : O termo '${name}' não é reconhecido como nome de cmdlet, função, arquivo de script ou programa operável. Verifique a grafia do nome ou, se um caminho tiver sido incluído, veja se o caminho está correto e tente novamente.`,
      'No linha:1 caractere:1',
      `+ ${name}`,
      `+ ${'~'.repeat(name.length)}`,
      `    + CategoryInfo          : ObjectNotFound: (${name}:String) [], CommandNotFoundException`,
      '    + FullyQualifiedErrorId : CommandNotFoundException',
    ].join('\n'),
  prompt: (s) => `PS ${s.cwd}>`,
  catalog: [
    {
      group: 'Rede (cmdlets)',
      items: [
        { cmd: 'Get-NetIPConfiguration', desc: 'IP, gateway e DNS' },
        { cmd: 'Get-NetIPAddress -AddressFamily IPv4', desc: 'endereços IPv4' },
        { cmd: 'Get-NetAdapter', desc: 'placas de rede' },
        { cmd: 'Get-NetRoute', desc: 'tabela de rotas' },
        { cmd: 'Get-NetNeighbor', desc: 'tabela ARP' },
        { cmd: 'Get-NetTCPConnection -State Established', desc: 'conexões TCP' },
        { cmd: 'Get-DnsClientServerAddress', desc: 'servidores DNS' },
        { cmd: 'Resolve-DnsName google.com', desc: 'consulta DNS' },
        { cmd: 'Resolve-DnsName gmail.com -Type MX', desc: 'registro MX' },
        { cmd: 'Get-DnsClientCache', desc: 'cache de DNS' },
        { cmd: 'Clear-DnsClientCache', desc: 'limpa o cache' },
        { cmd: 'Test-Connection 8.8.8.8 -Count 2', desc: 'ping' },
        { cmd: 'Test-NetConnection google.com -Port 443', desc: 'testa uma porta' },
        { cmd: 'Test-NetConnection 192.168.1.10 -Port 3389', desc: 'porta fechada' },
        { cmd: 'Test-NetConnection github.com -TraceRoute', desc: 'traceroute' },
        { cmd: 'Invoke-WebRequest https://netlearn-redes.vercel.app', desc: 'requisição HTTP' },
        { cmd: 'Invoke-RestMethod https://api.ipify.org', desc: 'IP público' },
        { cmd: 'Get-NetFirewallProfile', desc: 'firewall' },
      ],
    },
    {
      group: 'Programas do Windows',
      items: [
        { cmd: 'ipconfig /all', desc: 'funciona aqui também' },
        { cmd: 'ping -n 2 google.com', desc: 'ping clássico' },
        { cmd: 'tracert 1.1.1.1', desc: 'caminho' },
        { cmd: 'curl.exe -I https://github.com', desc: 'o curl de verdade' },
        { cmd: 'curl google.com', desc: 'pegadinha: é o Invoke-WebRequest' },
      ],
    },
    {
      group: 'Arquivos e pipeline',
      items: [
        { cmd: 'Get-ChildItem', desc: 'lista a pasta (ls)' },
        { cmd: 'Set-Location Documents', desc: 'entra na pasta (cd)' },
        { cmd: 'Set-Location ..', desc: 'volta uma pasta' },
        { cmd: 'Get-Content Documents\\notas-de-rede.txt', desc: 'lê um arquivo (cat)' },
        { cmd: 'New-Item -ItemType Directory testes', desc: 'cria pasta' },
        { cmd: 'Set-Content teste.txt "ping ok"', desc: 'grava arquivo' },
        { cmd: 'Remove-Item teste.txt', desc: 'apaga' },
        { cmd: 'ipconfig | Select-String IPv4', desc: 'filtra texto' },
        { cmd: 'Get-Service | Where-Object { $_ -match "Running" }', desc: 'filtra objetos' },
        { cmd: 'Get-Process | Select-Object -First 3', desc: 'os 3 primeiros' },
        { cmd: '$PSVersionTable', desc: 'versão do PowerShell' },
        { cmd: '$env:COMPUTERNAME', desc: 'variável de ambiente' },
        { cmd: 'Clear-Host', desc: 'limpa a tela' },
      ],
    },
  ],
};

export { isIp };
