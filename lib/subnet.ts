export type SubnetResult = {
  ip: string;
  prefix: number;
  mask: string;
  wildcard: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  totalAddresses: number;
  usableHosts: number;
  magicNumber: number;
  interestingOctet: number;
  ipBinary: string;
  maskBinary: string;
  networkBinary: string;
  isPrivate: boolean;
};

export function parseIpv4(value: string): number | null {
  const parts = value.trim().split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    result = result * 256 + octet;
  }
  return result;
}

export function formatIpv4(value: number) {
  return [24, 16, 8, 0].map((shift) => Math.floor(value / 2 ** shift) % 256).join('.');
}

function toBinary(value: number) {
  return formatIpv4(value)
    .split('.')
    .map((octet) => Number(octet).toString(2).padStart(8, '0'))
    .join('.');
}

function prefixToMask(prefix: number) {
  // Aritmética com números normais (não bitwise) para evitar o estouro de sinal de 32 bits do JS.
  return prefix === 0 ? 0 : 2 ** 32 - 2 ** (32 - prefix);
}

/** Aceita "/26", "26" ou "255.255.255.192". Retorna o prefixo ou null se inválido. */
export function parsePrefix(value: string): number | null {
  const trimmed = value.trim().replace(/^\//, '');
  if (/^\d{1,2}$/.test(trimmed)) {
    const prefix = Number(trimmed);
    return prefix >= 0 && prefix <= 32 ? prefix : null;
  }
  const mask = parseIpv4(trimmed);
  if (mask === null) return null;
  for (let prefix = 0; prefix <= 32; prefix += 1) {
    if (prefixToMask(prefix) === mask) return prefix;
  }
  return null; // máscara não contígua
}

function isPrivate(ip: number) {
  const [a, b] = formatIpv4(ip).split('.').map(Number);
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

export function calculateSubnet(ipText: string, maskText: string): SubnetResult | { error: string } {
  const ip = parseIpv4(ipText);
  if (ip === null) return { error: 'Endereço IP inválido. Use quatro números de 0 a 255 separados por ponto, ex.: 192.168.10.130.' };
  const prefix = parsePrefix(maskText);
  if (prefix === null) return { error: 'Máscara inválida. Use o formato /26, 26 ou 255.255.255.192.' };

  const mask = prefixToMask(prefix);
  const blockSize = 2 ** (32 - prefix);
  const network = Math.floor(ip / blockSize) * blockSize;
  const broadcast = network + blockSize - 1;

  let firstHost = network + 1;
  let lastHost = broadcast - 1;
  let usableHosts = blockSize - 2;
  if (prefix === 32) {
    firstHost = network;
    lastHost = network;
    usableHosts = 1;
  } else if (prefix === 31) {
    // RFC 3021: em links ponto a ponto os dois endereços são utilizáveis.
    firstHost = network;
    lastHost = broadcast;
    usableHosts = 2;
  }

  const interestingOctet = prefix === 32 ? 4 : Math.min(4, Math.floor(prefix / 8) + 1);
  const maskOctet = Number(formatIpv4(mask).split('.')[interestingOctet - 1]);

  return {
    ip: formatIpv4(ip),
    prefix,
    mask: formatIpv4(mask),
    wildcard: formatIpv4(2 ** 32 - 1 - mask),
    network: formatIpv4(network),
    broadcast: formatIpv4(broadcast),
    firstHost: formatIpv4(firstHost),
    lastHost: formatIpv4(lastHost),
    totalAddresses: blockSize,
    usableHosts,
    magicNumber: 256 - maskOctet,
    interestingOctet,
    ipBinary: toBinary(ip),
    maskBinary: toBinary(mask),
    networkBinary: toBinary(network),
    isPrivate: isPrivate(ip),
  };
}
