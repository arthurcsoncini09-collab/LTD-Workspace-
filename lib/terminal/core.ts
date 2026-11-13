// Núcleo dos terminais simulados: leitura da linha (aspas, pipes "|" e
// redirecionamento ">" / ">>"), sessão de cada shell e a execução.

import { VFS, linuxTree, windowsTree, WIN_HOME, LINUX_HOME } from './fs';
import { newNetState, type NetState } from './net';

export type ShellId = 'cmd' | 'powershell' | 'bash';

export type Session = {
  shell: ShellId;
  cwd: string;
  home: string;
  fs: VFS;
  net: NetState;
  history: string[];
  env: Record<string, string>;
  /** Último código de saída (bash: $?, PowerShell: $LASTEXITCODE, CMD: %ERRORLEVEL%). */
  status: number;
};

export type Result = {
  out: string;
  error?: boolean;
  /** Explicação didática do comando (mostrada em destaque). */
  note?: string;
  clear?: boolean;
};

export type Ctx = { s: Session; stdin: string | null; raw: string; name: string };
export type Handler = (args: string[], ctx: Ctx) => Result;

export type ShellDef = {
  id: ShellId;
  commands: Record<string, Handler>;
  /** Nome normalizado do comando (CMD e PowerShell ignoram maiúsculas). */
  normalize: (name: string) => string;
  notFound: (name: string) => string;
  prompt: (s: Session) => string;
  /** Expande variáveis na linha antes de executar ($HOME, %USERNAME%, $env:X…). */
  expand?: (line: string, s: Session) => string;
  /** Lista mostrada no painel lateral e no help. */
  catalog: { group: string; items: { cmd: string; desc: string }[] }[];
};

export const ok = (out: string, note?: string): Result => ({ out, note });
export const fail = (out: string): Result => ({ out, error: true });

export function newSession(shell: ShellId, net: NetState = newNetState()): Session {
  const win = shell !== 'bash';
  return {
    shell,
    cwd: win ? WIN_HOME : LINUX_HOME,
    home: win ? WIN_HOME : LINUX_HOME,
    fs: new VFS(win ? windowsTree() : linuxTree(), win ? 'win' : 'linux'),
    net,
    history: [],
    env: win
      ? { USERNAME: 'aluno', COMPUTERNAME: 'PC-ALUNO', USERPROFILE: WIN_HOME, OS: 'Windows_NT', PATH: 'C:\\Windows\\system32;C:\\Windows' }
      : { USER: 'aluno', HOME: LINUX_HOME, SHELL: '/bin/bash', PATH: '/usr/local/bin:/usr/bin:/bin', LANG: 'pt_BR.UTF-8' },
    status: 0,
  };
}

/** Divide a linha em palavras, respeitando aspas simples e duplas. */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let cur = '';
  let quote: string | null = null;
  let has = false;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
    } else if (/\s/.test(ch)) {
      if (cur || has) tokens.push(cur);
      cur = '';
      has = false;
    } else cur += ch;
  }
  if (cur || has) tokens.push(cur);
  return tokens;
}

/** Divide por "|" fora de aspas (e não confunde "||"). */
function splitPipes(line: string): string[] {
  const parts: string[] = [];
  let cur = '';
  let quote: string | null = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
      cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === '|' && line[i + 1] !== '|' && line[i - 1] !== '|') {
      parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim());
}

/** Separa "comando > arquivo" / ">> arquivo" no fim do trecho. */
function splitRedirect(segment: string): { cmd: string; file?: string; append?: boolean } {
  const m = segment.match(/^(.*?)\s*(>>?)\s*("[^"]+"|'[^']+'|\S+)\s*$/);
  if (!m || /^\s*$/.test(m[1])) return { cmd: segment };
  // "2>&1" ou números antes de ">" (2>) não são tratados como arquivo de saída.
  if (/\d$/.test(m[1]) && /\s\d$/.test(` ${m[1]}`)) return { cmd: segment };
  return { cmd: m[1], file: m[3].replace(/^["']|["']$/g, ''), append: m[2] === '>>' };
}

export function execute(def: ShellDef, s: Session, line: string): Result {
  const trimmed = line.trim();
  if (!trimmed) return ok('');
  s.history.push(trimmed);

  // bash: "cmd1 && cmd2" e "cmd1 ; cmd2"; CMD: "&"; PowerShell: ";"
  const chain = splitChain(trimmed, s.shell);
  if (chain.length > 1) {
    const outs: string[] = [];
    let last: Result = ok('');
    for (const { text, onlyIfOk } of chain) {
      if (onlyIfOk && last.error) break;
      last = runPipeline(def, s, text);
      if (last.clear) outs.length = 0;
      else if (last.out) outs.push(last.out);
    }
    return { out: outs.join('\n'), error: last.error, note: last.note };
  }
  return runPipeline(def, s, trimmed);
}

function splitChain(line: string, shell: ShellId): { text: string; onlyIfOk: boolean }[] {
  const out: { text: string; onlyIfOk: boolean }[] = [];
  let cur = '';
  let quote: string | null = null;
  let onlyIfOk = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
      cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === '&' && line[i + 1] === '&') {
      out.push({ text: cur.trim(), onlyIfOk });
      cur = '';
      onlyIfOk = true;
      i += 1;
      continue;
    }
    const sep = shell === 'cmd' ? ch === '&' : ch === ';';
    if (sep) {
      out.push({ text: cur.trim(), onlyIfOk });
      cur = '';
      onlyIfOk = false;
      continue;
    }
    cur += ch;
  }
  out.push({ text: cur.trim(), onlyIfOk });
  return out.filter((c) => c.text);
}

function runPipeline(def: ShellDef, s: Session, line: string): Result {
  const segments = splitPipes(line);
  let stdin: string | null = null;
  let result: Result = ok('');
  let note: string | undefined;
  for (let i = 0; i < segments.length; i += 1) {
    const segment = def.expand ? def.expand(segments[i], s) : segments[i];
    const { cmd, file, append } = splitRedirect(segment);
    const tokens = tokenize(cmd);
    if (!tokens.length) return fail(syntaxError(s.shell));
    let [rawName, ...args] = tokens;
    // sudo comando → roda o comando (o aluno é administrador neste laboratório)
    if (s.shell === 'bash' && rawName === 'sudo' && args.length) [rawName, ...args] = args;
    const name = def.normalize(rawName);
    const handler = def.commands[name];
    if (!handler) {
      s.status = s.shell === 'bash' ? 127 : 1;
      return { out: def.notFound(rawName), error: true };
    }
    result = handler(args, { s, stdin, raw: cmd, name });
    note = note ?? result.note;
    s.status = result.error ? 1 : 0;
    if (result.clear) return result;
    if (file) {
      const parts = s.fs.parts(file, s.cwd, s.home);
      if (!s.fs.write(parts, result.out ? `${result.out}\n` : '', append)) return fail(redirectError(s.shell, file));
      result = { out: '', error: result.error };
    }
    if (result.error && i < segments.length - 1) break;
    stdin = result.out;
  }
  return { ...result, note: result.note ?? note };
}

function syntaxError(shell: ShellId) {
  if (shell === 'bash') return "bash: erro de sintaxe próximo do token inesperado `|'";
  if (shell === 'powershell') return 'Um elemento de pipeline vazio não é permitido.';
  return 'Erro de sintaxe no comando.';
}

function redirectError(shell: ShellId, file: string) {
  if (shell === 'bash') return `bash: ${file}: Arquivo ou diretório inexistente`;
  if (shell === 'powershell') return `Out-File : Não foi possível localizar uma parte do caminho '${file}'.`;
  return 'O sistema não pode encontrar o caminho especificado.';
}

// ---------------------------------------------------------------------------
// Ajudantes para opções

/** Valor depois de uma opção: optValue(['-n','3'], '-n') → '3'. */
export function optValue(args: string[], ...names: string[]) {
  const lower = names.map((n) => n.toLowerCase());
  const i = args.findIndex((a) => lower.includes(a.toLowerCase()));
  return i >= 0 ? args[i + 1] : undefined;
}

export function hasFlag(args: string[], ...names: string[]) {
  const lower = names.map((n) => n.toLowerCase());
  return args.some((a) => lower.includes(a.toLowerCase()));
}

/** Argumentos que não são opções (nem valores de opções listadas em valueOpts). */
export function positionals(args: string[], valueOpts: string[] = [], style: 'unix' | 'win' = 'unix') {
  const lower = valueOpts.map((v) => v.toLowerCase());
  const out: string[] = [];
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (lower.includes(a.toLowerCase())) {
      i += 1;
      continue;
    }
    const isOpt = a.length > 1 && (a.startsWith('-') || (style === 'win' && a.startsWith('/') && !a.slice(1).includes('/')));
    if (!isOpt) out.push(a);
  }
  return out;
}

export function positional(args: string[], valueOpts: string[] = [], style: 'unix' | 'win' = 'unix') {
  return positionals(args, valueOpts, style)[0];
}

export const pad = (v: string | number, n: number) => String(v).padEnd(n);
export const padL = (v: string | number, n: number) => String(v).padStart(n);

export const NOW = () => new Date();
