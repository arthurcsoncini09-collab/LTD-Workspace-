// Sistema de arquivos virtual de cada terminal: uma árvore em memória.
// No Windows (CMD e PowerShell) os nomes não diferenciam maiúsculas; no Linux, sim.

import { HOSTNAME_LINUX, HOSTNAME_WIN, LAN } from './net';

export type FsFile = { type: 'file'; content: string; modified: string };
export type FsDir = { type: 'dir'; children: Record<string, FsNode>; modified: string };
export type FsNode = FsFile | FsDir;

const T = '2026-11-13T09:00:00';
const file = (content: string): FsFile => ({ type: 'file', content, modified: T });
const dir = (children: Record<string, FsNode> = {}): FsDir => ({ type: 'dir', children, modified: T });

const NOTES = `Anotações de redes
- ping testa se um host responde (ICMP)
- tracert/traceroute mostra os saltos até o destino
- nslookup/dig consulta o DNS
- 192.168.1.0/24: 254 endereços utilizáveis
`;

const PLAN = `Plano de endereçamento - rede de casa
Rede:      ${LAN.network}/${LAN.prefix}
Gateway:   ${LAN.gateway}
Servidor:  192.168.1.10
Impressora 192.168.1.50
DHCP:      192.168.1.100 a 192.168.1.199
`;

export function windowsTree(): FsDir {
  return dir({
    Users: dir({
      aluno: dir({
        Desktop: dir({ 'atalhos.txt': file('NetLearn: https://netlearn-redes.vercel.app\n') }),
        Documents: dir({ 'notas-de-rede.txt': file(NOTES), 'plano-de-enderecamento.txt': file(PLAN) }),
        Downloads: dir(),
      }),
    }),
    Windows: dir({
      System32: dir({
        drivers: dir({
          etc: dir({
            hosts: file(`# Arquivo hosts do Windows\n127.0.0.1       localhost\n::1             localhost\n192.168.1.10    servidor\n`),
          }),
        }),
      }),
    }),
  });
}

export function linuxTree(): FsDir {
  return dir({
    home: dir({
      aluno: dir({
        Documentos: dir({ 'notas-de-rede.txt': file(NOTES), 'plano-de-enderecamento.txt': file(PLAN) }),
        Downloads: dir(),
        scripts: dir({
          'teste-rede.sh': file(`#!/bin/bash\n# Testa a conectividade básica\nping -c 2 ${LAN.gateway}\nping -c 2 8.8.8.8\ndig +short google.com\n`),
        }),
      }),
    }),
    etc: dir({
      hostname: file(`${HOSTNAME_LINUX}\n`),
      hosts: file(`127.0.0.1\tlocalhost\n127.0.1.1\t${HOSTNAME_LINUX}\n192.168.1.10\tservidor\n`),
      'resolv.conf': file(`# Gerado pelo systemd-resolved\nnameserver 127.0.0.53\noptions edns0 trust-ad\nsearch ${LAN.domain}\n`),
      'os-release': file('PRETTY_NAME="Ubuntu 24.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\nID=ubuntu\n'),
      services: file('ssh\t\t22/tcp\ndomain\t\t53/tcp\ndomain\t\t53/udp\nhttp\t\t80/tcp\nhttps\t\t443/tcp\n'),
    }),
    tmp: dir(),
    var: dir({ log: dir({ syslog: file(`Nov 13 09:00:01 ${HOSTNAME_LINUX} dhclient[590]: DHCPACK of ${LAN.ip} from ${LAN.dhcpServer}\nNov 13 09:00:02 ${HOSTNAME_LINUX} systemd-resolved[640]: Using DNS server ${LAN.gateway}\n`) }) }),
  });
}

export const WIN_HOME = 'C:\\Users\\aluno';
export const LINUX_HOME = '/home/aluno';
export { HOSTNAME_WIN };

// ---------------------------------------------------------------------------

export type PathStyle = 'win' | 'linux';

export class VFS {
  constructor(public root: FsDir, public style: PathStyle) {}

  private key(dirNode: FsDir, name: string) {
    if (this.style === 'linux') return name in dirNode.children ? name : null;
    const lower = name.toLowerCase();
    return Object.keys(dirNode.children).find((k) => k.toLowerCase() === lower) ?? null;
  }

  /** Converte um caminho (absoluto ou relativo a cwd) em partes normalizadas. */
  parts(path: string, cwd: string, home: string): string[] {
    let p = path.trim().replace(/^["']|["']$/g, '');
    if (this.style === 'win') {
      p = p.replace(/\//g, '\\');
      if (p === '~' || p.startsWith('~\\')) p = home + p.slice(1);
      const abs = /^[a-zA-Z]:/.test(p) ? p.slice(2) : p.startsWith('\\') ? p : `${cwd.slice(2)}\\${p}`;
      return normalize(abs.split('\\'));
    }
    if (p === '~' || p.startsWith('~/')) p = home + p.slice(1);
    const abs = p.startsWith('/') ? p : `${cwd}/${p}`;
    return normalize(abs.split('/'));
  }

  format(parts: string[]) {
    return this.style === 'win' ? `C:\\${parts.join('\\')}` : `/${parts.join('/')}`;
  }

  /** Caminho com a grafia real dos nomes (no Windows, "documents" vira "Documents"). */
  canonical(parts: string[]): string[] {
    const out: string[] = [];
    let node: FsNode = this.root;
    for (const part of parts) {
      if (node.type !== 'dir') break;
      const k = this.key(node, part);
      if (!k) return parts;
      out.push(k);
      node = node.children[k];
    }
    return out;
  }

  get(parts: string[]): FsNode | null {
    let node: FsNode = this.root;
    for (const part of parts) {
      if (node.type !== 'dir') return null;
      const k = this.key(node, part);
      if (!k) return null;
      node = node.children[k];
    }
    return node;
  }

  parent(parts: string[]): { dir: FsDir; name: string } | null {
    const p = this.get(parts.slice(0, -1));
    return p && p.type === 'dir' && parts.length ? { dir: p, name: parts[parts.length - 1] } : null;
  }

  write(parts: string[], content: string, append = false): boolean {
    const target = this.parent(parts);
    if (!target) return false;
    const k = this.key(target.dir, target.name) ?? target.name;
    const existing = target.dir.children[k];
    if (existing?.type === 'dir') return false;
    target.dir.children[k] = file(append && existing ? existing.content + content : content);
    target.dir.children[k].modified = new Date().toISOString();
    return true;
  }

  mkdir(parts: string[], recursive = false): 'ok' | 'exists' | 'noparent' {
    if (this.get(parts)) return 'exists';
    if (recursive) {
      for (let i = 1; i <= parts.length; i += 1) if (!this.get(parts.slice(0, i))) this.mkdir(parts.slice(0, i));
      return 'ok';
    }
    const target = this.parent(parts);
    if (!target) return 'noparent';
    target.dir.children[target.name] = dir();
    target.dir.children[target.name].modified = new Date().toISOString();
    return 'ok';
  }

  remove(parts: string[]): boolean {
    const target = this.parent(parts);
    if (!target) return false;
    const k = this.key(target.dir, target.name);
    if (!k) return false;
    delete target.dir.children[k];
    return true;
  }

  /** Copia ou move src para dst (se dst for pasta, mantém o nome). */
  transfer(src: string[], dst: string[], move: boolean): 'ok' | 'nosrc' | 'nodst' {
    const node = this.get(src);
    if (!node) return 'nosrc';
    let target = dst;
    const dstNode = this.get(dst);
    if (dstNode?.type === 'dir') target = [...dst, src[src.length - 1]];
    const parent = this.parent(target);
    if (!parent) return 'nodst';
    parent.dir.children[this.key(parent.dir, parent.name) ?? parent.name] = structuredCloneNode(node);
    if (move) this.remove(src);
    return 'ok';
  }

  /** Nomes que começam com o prefixo (para o autocompletar com Tab). */
  complete(partial: string, cwd: string, home: string): string[] {
    const sep = this.style === 'win' ? '\\' : '/';
    const cut = Math.max(partial.lastIndexOf('/'), partial.lastIndexOf('\\'));
    const base = cut >= 0 ? partial.slice(0, cut + 1) : '';
    const prefix = cut >= 0 ? partial.slice(cut + 1) : partial;
    const dirParts = base ? this.parts(base, cwd, home) : this.parts('.', cwd, home);
    const node = this.get(dirParts);
    if (!node || node.type !== 'dir') return [];
    const match = (n: string) => (this.style === 'win' ? n.toLowerCase().startsWith(prefix.toLowerCase()) : n.startsWith(prefix));
    return Object.entries(node.children)
      .filter(([n]) => match(n))
      .map(([n, child]) => base + n + (child.type === 'dir' ? sep : ''));
  }
}

function normalize(segments: string[]) {
  const out: string[] = [];
  for (const s of segments) {
    if (!s || s === '.') continue;
    if (s === '..') out.pop();
    else out.push(s);
  }
  return out;
}

function structuredCloneNode(node: FsNode): FsNode {
  return JSON.parse(JSON.stringify(node));
}

export function sizeOf(node: FsNode): number {
  return node.type === 'file' ? new TextEncoder().encode(node.content).length : 4096;
}
