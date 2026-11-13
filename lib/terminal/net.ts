// Rede virtual compartilhada pelos três terminais (CMD, PowerShell e Bash).
// Tudo é simulado, mas coerente: os mesmos IPs, rotas e portas aparecem em
// qualquer comando, e algumas ações mudam o estado (liberar o IP, limpar o
// cache de DNS, a tabela ARP que se enche quando você fala com a rede local).

export const LAN = {
  ip: '192.168.1.37',
  mask: '255.255.255.0',
  prefix: 24,
  network: '192.168.1.0',
  broadcast: '192.168.1.255',
  gateway: '192.168.1.1',
  dhcpServer: '192.168.1.1',
  dns: ['192.168.1.1', '8.8.8.8'],
  macWin: '3C-52-82-1A-7F-09',
  macLinux: '3c:52:82:1a:7f:09',
  gatewayMacWin: '00-1A-2B-3C-4D-5E',
  ipv6: 'fe80::3e52:82ff:fe1a:7f09',
  domain: 'netlearn.lan',
  ssid: 'NetLearn-Lab',
};

export const HOSTNAME_WIN = 'PC-ALUNO';
export const HOSTNAME_LINUX = 'netlearn';
export const USER = 'aluno';

type Host = { ip: string; ports: number[]; desc: string; mac?: string; ttl?: number };

/** Máquinas da rede local. */
const LOCAL_HOSTS: Record<string, Host> = {
  '192.168.1.1': { ip: '192.168.1.1', ports: [53, 80, 443], desc: 'roteador', mac: '00:1a:2b:3c:4d:5e', ttl: 64 },
  '192.168.1.10': { ip: '192.168.1.10', ports: [22, 80, 445], desc: 'servidor de arquivos', mac: '52:54:00:9e:21:0a', ttl: 64 },
  '192.168.1.37': { ip: '192.168.1.37', ports: [135, 445], desc: 'este computador', mac: '3c:52:82:1a:7f:09', ttl: 128 },
  '192.168.1.50': { ip: '192.168.1.50', ports: [80, 631, 9100], desc: 'impressora', mac: 'a4:5d:36:12:c8:77', ttl: 255 },
};

/** Nomes conhecidos (DNS). Outros domínios válidos ganham um IP fictício fixo. */
const DNS: Record<string, { ip: string; ipv6?: string; ports: number[] }> = {
  localhost: { ip: '127.0.0.1', ports: [] },
  'router.netlearn.lan': { ip: '192.168.1.1', ports: [53, 80, 443] },
  'servidor.netlearn.lan': { ip: '192.168.1.10', ports: [22, 80, 445] },
  'impressora.netlearn.lan': { ip: '192.168.1.50', ports: [80, 631, 9100] },
  'google.com': { ip: '142.250.79.46', ipv6: '2800:3f0:4001:82f::200e', ports: [80, 443] },
  'www.google.com': { ip: '142.250.79.36', ipv6: '2800:3f0:4001:820::2004', ports: [80, 443] },
  'dns.google': { ip: '8.8.8.8', ports: [53, 443] },
  'one.one.one.one': { ip: '1.1.1.1', ports: [53, 443] },
  'cloudflare.com': { ip: '104.16.132.229', ports: [80, 443] },
  'github.com': { ip: '20.201.28.151', ports: [22, 80, 443] },
  'netlearn-redes.vercel.app': { ip: '76.76.21.21', ports: [80, 443] },
  'example.com': { ip: '93.184.215.14', ports: [80, 443] },
  'www.example.com': { ip: '93.184.215.14', ports: [80, 443] },
};

const PUBLIC_TLDS = ['com', 'br', 'org', 'net', 'io', 'dev', 'app', 'gov', 'edu', 'info', 'me', 'tv', 'co', 'ai'];

export const isIp = (v: string) => /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(v) && v.split('.').every((n) => Number(n) <= 255);

function hash(text: string) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Nome curto da rede local → FQDN ("servidor" → servidor.netlearn.lan). */
function expand(name: string) {
  const n = name.toLowerCase().replace(/\.$/, '');
  if (DNS[n]) return n;
  if (!n.includes('.') && DNS[`${n}.${LAN.domain}`]) return `${n}.${LAN.domain}`;
  return n;
}

export type Resolution = { name: string; ip: string; ipv6?: string; ports: number[]; local: boolean };

/** Resolve um nome (ou devolve o próprio IP). null = o nome não existe (NXDOMAIN). */
export function resolve(target: string): Resolution | null {
  const t = target.trim();
  if (!t) return null;
  if (isIp(t)) {
    const local = LOCAL_HOSTS[t];
    const known = Object.entries(DNS).find(([, v]) => v.ip === t);
    return { name: known?.[0] ?? t, ip: t, ports: local?.ports ?? known?.[1].ports ?? [80, 443], local: inLan(t) || t.startsWith('127.') };
  }
  const name = expand(t);
  const entry = DNS[name];
  if (entry) return { name, ...entry, local: inLan(entry.ip) || entry.ip.startsWith('127.') };
  const tld = name.split('.').pop() ?? '';
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(name) || !PUBLIC_TLDS.includes(tld)) return null;
  const h = hash(name);
  return { name, ip: `203.0.113.${(h % 250) + 3}`, ports: [80, 443], local: false };
}

export function inLan(ip: string) {
  return ip.startsWith('192.168.1.');
}

export type PingResult =
  | { kind: 'reply'; ip: string; times: number[]; ttl: number }
  | { kind: 'timeout'; ip: string }
  | { kind: 'unreachable'; ip: string; from: string }
  | { kind: 'nonet' };

/** Simula o resultado de pings para um IP. */
export function ping(ip: string, count: number, state: NetState): PingResult {
  if (ip.startsWith('127.')) return { kind: 'reply', ip, times: Array(count).fill(0), ttl: 128 };
  if (!state.leased) return { kind: 'nonet' };
  const h = hash(ip);
  if (inLan(ip)) {
    const host = LOCAL_HOSTS[ip];
    if (!host) return { kind: 'unreachable', ip, from: LAN.ip };
    learnArp(state, ip);
    return { kind: 'reply', ip, times: Array.from({ length: count }, (_, i) => (i + h) % 3 === 0 ? 2 : 1), ttl: host.ttl ?? 64 };
  }
  // Redes privadas de fora (10.x, 172.16-31.x): sem rota além do gateway.
  if (/^10\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip) || /^192\.168\./.test(ip)) return { kind: 'timeout', ip };
  learnArp(state, LAN.gateway);
  const base = 9 + (h % 30);
  return { kind: 'reply', ip, times: Array.from({ length: count }, (_, i) => base + ((h >> (i * 3)) % 5)), ttl: 128 - 6 - (h % 8) };
}

export type Hop = { n: number; ip: string | null; name?: string; times: (number | null)[] };

/** Saltos até o destino (o roteador de casa, o provedor, o backbone…). */
export function traceroute(ip: string, state: NetState): Hop[] | null {
  if (!state.leased && !ip.startsWith('127.')) return null;
  if (ip.startsWith('127.') || ip === LAN.ip) return [{ n: 1, ip, name: 'localhost', times: [0, 0, 0] }];
  if (inLan(ip)) return [{ n: 1, ip, times: [1, 1, 1] }];
  const h = hash(ip);
  const path: Omit<Hop, 'n' | 'times'>[] = [
    { ip: LAN.gateway, name: 'router.netlearn.lan' },
    { ip: '100.64.0.1' },
    { ip: '187.62.112.1', name: 'gw-sp.provedor.net.br' },
    { ip: null },
    { ip: '200.160.0.' + ((h % 200) + 10), name: 'ix-sp.br' },
  ];
  if (h % 3 === 0) path.push({ ip: '72.14.' + (h % 250) + '.' + ((h >> 8) % 250) });
  const hops = path.map((p, i) => {
    const t = i === 0 ? 1 : 4 + i * 2 + (h % 4);
    return { n: i + 1, ...p, times: p.ip ? [t, t + 1, t] : [null, null, null] };
  });
  const final = ping(ip, 3, state);
  hops.push({ n: hops.length + 1, ip, times: final.kind === 'reply' ? final.times : [null, null, null] });
  return hops;
}

export function portOpen(ip: string, port: number) {
  const res = resolve(ip);
  return Boolean(res?.ports.includes(port));
}

export const SERVICE: Record<number, string> = {
  20: 'ftp-data',
  21: 'ftp',
  22: 'ssh',
  23: 'telnet',
  25: 'smtp',
  53: 'domain',
  67: 'dhcp',
  80: 'http',
  110: 'pop3',
  135: 'msrpc',
  143: 'imap',
  443: 'https',
  445: 'microsoft-ds',
  631: 'ipp',
  3306: 'mysql',
  3389: 'ms-wbt-server',
  5432: 'postgresql',
  8080: 'http-proxy',
  9100: 'jetdirect',
};

// ---------------------------------------------------------------------------
// Estado que muda conforme o aluno usa os comandos

export type NetState = {
  /** Tem IP do DHCP? (ipconfig /release e dhclient -r tiram) */
  leased: boolean;
  /** Cache do resolvedor: nome → IP */
  dnsCache: Record<string, string>;
  /** Tabela ARP: IP → MAC */
  arp: Record<string, string>;
};

export function newNetState(): NetState {
  return { leased: true, dnsCache: {}, arp: { [LAN.gateway]: LOCAL_HOSTS[LAN.gateway].mac! } };
}

export function learnArp(state: NetState, ip: string) {
  const mac = LOCAL_HOSTS[ip]?.mac;
  if (mac && ip !== LAN.ip) state.arp[ip] = mac;
}

/** Resolve pelo DNS e guarda no cache (como o Windows e o systemd-resolved fazem). */
export function lookup(target: string, state: NetState) {
  const res = resolve(target);
  if (res && !isIp(target) && state.leased) state.dnsCache[res.name] = res.ip;
  return res;
}

export const winMac = (mac: string) => mac.toUpperCase().replace(/:/g, '-');

/** Conexões abertas mostradas por netstat, ss e Get-NetTCPConnection. */
export const CONNECTIONS = [
  { proto: 'TCP', local: '0.0.0.0:135', remote: '0.0.0.0:0', state: 'LISTENING', pid: 1024, proc: 'svchost' },
  { proto: 'TCP', local: '0.0.0.0:445', remote: '0.0.0.0:0', state: 'LISTENING', pid: 4, proc: 'System' },
  { proto: 'TCP', local: `${LAN.ip}:52814`, remote: '142.250.79.36:443', state: 'ESTABLISHED', pid: 6120, proc: 'chrome' },
  { proto: 'TCP', local: `${LAN.ip}:52820`, remote: '76.76.21.21:443', state: 'ESTABLISHED', pid: 6120, proc: 'chrome' },
  { proto: 'TCP', local: `${LAN.ip}:52790`, remote: '20.201.28.151:443', state: 'TIME_WAIT', pid: 0, proc: 'Idle' },
  { proto: 'UDP', local: '0.0.0.0:5353', remote: '*:*', state: '', pid: 2210, proc: 'svchost' },
];

export const LINUX_SOCKETS = [
  { netid: 'tcp', state: 'LISTEN', local: '0.0.0.0:22', peer: '0.0.0.0:*', proc: 'sshd', pid: 812 },
  { netid: 'tcp', state: 'LISTEN', local: '127.0.0.53%lo:53', peer: '0.0.0.0:*', proc: 'systemd-resolve', pid: 640 },
  { netid: 'tcp', state: 'ESTAB', local: `${LAN.ip}:48210`, peer: '142.250.79.36:443', proc: 'firefox', pid: 2210 },
  { netid: 'tcp', state: 'ESTAB', local: `${LAN.ip}:48222`, peer: '76.76.21.21:443', proc: 'firefox', pid: 2210 },
  { netid: 'udp', state: 'UNCONN', local: '0.0.0.0:68', peer: '0.0.0.0:*', proc: 'dhclient', pid: 590 },
];
