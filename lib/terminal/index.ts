import { BASH } from './bash';
import { CMD } from './cmd';
import type { ShellDef, ShellId } from './core';
import { POWERSHELL, prettyName } from './powershell';

export { execute, newSession, type Result, type Session, type ShellId } from './core';
export { newNetState } from './net';

export const SHELLS: Record<ShellId, ShellDef> = { cmd: CMD, powershell: POWERSHELL, bash: BASH };

/** Nomes de comandos para o autocompletar (com a grafia "bonita" no PowerShell). */
export function commandNames(id: ShellId): string[] {
  const names = Object.keys(SHELLS[id].commands).filter((n) => n !== '$var');
  return id === 'powershell' ? names.map(prettyName) : names;
}
