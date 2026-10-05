import { formatIpv4, parseIpv4, parsePrefix } from './subnet';

export type NodeId = 'pc1' | 'pc2' | 'switch' | 'router' | 'server';

export type SimStep = { at: NodeId; message: string };

export type SimResult = { ok: boolean; steps: SimStep[]; summary: string };

export type PcConfig = { ip: string; mask: string; gateway: string };

export const TOPOLOGY = {
  lanNetwork: '192.168.1.0/24',
  routerLan: '192.168.1.1',
  routerWan: '10.0.0.1',
  pc2: '192.168.1.20',
  server: '10.0.0.10',
};

const LAN_BASE = parseIpv4('192.168.1.0')!;
const LAN_SIZE = 256;

function inBlock(ip: number, base: number, size: number) {
  return ip >= base && ip < base + size;
}

function blockOf(ip: number, prefix: number) {
  const size = 2 ** (32 - prefix);
  return { base: Math.floor(ip / size) * size, size };
}

/** Simula um ping a partir do PC1, aplicando as mesmas regras de decisão de um host real. */
export function simulatePing(config: PcConfig, target: 'pc2' | 'server'): SimResult {
  const fail = (steps: SimStep[], summary: string): SimResult => ({ ok: false, steps, summary });

  const ip = parseIpv4(config.ip);
  const prefix = parsePrefix(config.mask);
  const gateway = config.gateway.trim() ? parseIpv4(config.gateway) : null;

  if (ip === null) return fail([{ at: 'pc1', message: 'IP inválido no PC1.' }], 'Corrija o endereço IP do PC1 (ex.: 192.168.1.10).');
  if (prefix === null || prefix === 0 || prefix > 30) {
    return fail([{ at: 'pc1', message: 'Máscara inválida no PC1.' }], 'Use uma máscara entre /1 e /30, ex.: 255.255.255.0 ou /24.');
  }

  const own = blockOf(ip, prefix);
  if (ip === own.base || ip === own.base + own.size - 1) {
    return fail(
      [{ at: 'pc1', message: `${formatIpv4(ip)} é o endereço de rede ou de broadcast da sub-rede.` }],
      'Hosts não podem usar o endereço de rede nem o de broadcast.',
    );
  }

  const routerLan = parseIpv4(TOPOLOGY.routerLan)!;
  const pc2 = parseIpv4(TOPOLOGY.pc2)!;
  if (ip === routerLan || ip === pc2) {
    return fail(
      [
        { at: 'pc1', message: 'ARP gratuito: o PC1 anuncia seu IP.' },
        { at: ip === pc2 ? 'pc2' : 'router', message: `Outro dispositivo já usa ${formatIpv4(ip)}!` },
      ],
      'Conflito de IP: escolha um endereço livre, como 192.168.1.10.',
    );
  }

  const targetIp = parseIpv4(target === 'pc2' ? TOPOLOGY.pc2 : TOPOLOGY.server)!;
  const targetName = target === 'pc2' ? 'PC2' : 'Servidor';
  const pc1OnLan = inBlock(ip, LAN_BASE, LAN_SIZE);
  const steps: SimStep[] = [];

  if (inBlock(targetIp, own.base, own.size)) {
    // Destino na mesma sub-rede (segundo a máscara do PC1): entrega direta via ARP.
    steps.push({ at: 'pc1', message: `${targetName} está na minha sub-rede → ARP direto: "Quem tem ${formatIpv4(targetIp)}?"` });
    steps.push({ at: 'switch', message: 'Switch faz flooding do ARP Request (broadcast) em todas as portas.' });
    if (target === 'server' || !pc1OnLan) {
      return fail(
        [...steps, { at: 'switch', message: 'Ninguém na LAN responde ao ARP.' }],
        `O ${targetName} não está nesta LAN. Com essa máscara o PC1 acha que o destino é local e nem consulta o gateway — revise a máscara.`,
      );
    }
    steps.push({ at: 'pc2', message: 'PC2 responde com seu MAC (ARP Reply unicast).' });
    steps.push({ at: 'switch', message: 'Switch aprende os MACs e encaminha o ICMP Echo Request só para a porta do PC2.' });
    steps.push({ at: 'pc2', message: 'PC2 recebe o Echo Request e envia o Echo Reply.' });
    steps.push({ at: 'pc1', message: 'Resposta recebida: tempo<1ms TTL=128.' });
    return { ok: true, steps, summary: 'Ping bem-sucedido dentro da LAN, sem passar pelo roteador.' };
  }

  // Destino fora da sub-rede: precisa do gateway.
  steps.push({ at: 'pc1', message: `${targetName} está fora da minha sub-rede → envio ao gateway.` });
  if (gateway === null) {
    return fail(steps, 'Gateway padrão não configurado (ou inválido): o PC1 não sabe para onde mandar pacotes de outras redes.');
  }
  if (!inBlock(gateway, own.base, own.size)) {
    return fail(steps, `O gateway ${formatIpv4(gateway)} não está na mesma sub-rede do PC1. O gateway precisa ser alcançável diretamente.`);
  }
  steps.push({ at: 'pc1', message: `ARP Request: "Quem tem ${formatIpv4(gateway)}?"` });
  steps.push({ at: 'switch', message: 'Switch faz flooding do ARP Request.' });
  if (gateway !== routerLan || !pc1OnLan) {
    return fail(
      [...steps, { at: 'switch', message: 'Nenhuma resposta ao ARP.' }],
      gateway !== routerLan
        ? `Nenhum equipamento usa ${formatIpv4(gateway)}. O gateway desta rede é ${TOPOLOGY.routerLan}.`
        : `O IP do PC1 não pertence à rede ${TOPOLOGY.lanNetwork} da interface do roteador, então ele ignora o PC1.`,
    );
  }
  steps.push({ at: 'router', message: 'Roteador responde com o MAC da interface G0/0 (ARP Reply).' });
  if (target === 'pc2') {
    // Só chega aqui se a máscara do PC1 for "menor" que /24 e o PC2 parecer remoto.
    steps.push({ at: 'router', message: 'Roteador encaminha de volta para a mesma LAN (e pode enviar ICMP Redirect).' });
    steps.push({ at: 'pc2', message: 'PC2 recebe e responde.' });
    steps.push({ at: 'pc1', message: 'Resposta recebida.' });
    return { ok: true, steps, summary: 'Funcionou, mas por um caminho ineficiente: com a máscara correta (/24) o PC2 seria alcançado diretamente.' };
  }
  steps.push({ at: 'switch', message: 'Switch encaminha o quadro com o ICMP para a porta do roteador.' });
  steps.push({ at: 'router', message: `Roteador consulta a tabela: 10.0.0.0/24 diretamente conectada (G0/1). TTL 128 → 127.` });
  steps.push({ at: 'server', message: 'Servidor recebe o Echo Request e responde com Echo Reply.' });
  steps.push({ at: 'router', message: 'Roteador encaminha a resposta de volta para 192.168.1.0/24.' });
  steps.push({ at: 'pc1', message: 'Resposta recebida: tempo=2ms TTL=63.' });
  return { ok: true, steps, summary: 'Ping bem-sucedido através do roteador (o TTL caiu 1 a cada salto de camada 3).' };
}
