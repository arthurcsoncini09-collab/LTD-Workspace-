// Comandos de rede do Windows (programas .exe), usados pelo CMD e pelo PowerShell.
// As saídas seguem o Windows em português.

import { fail, hasFlag, ok, optValue, pad, positional, type Handler } from './core';
import { CONNECTIONS, HOSTNAME_WIN, LAN, SERVICE, lookup, ping as simPing, portOpen, resolve, traceroute, winMac, isIp } from './net';

export const NOTES = {
  ipconfig:
    'O ipconfig mostra o IP, a máscara e o gateway de cada placa. /all mostra também MAC, DHCP e DNS; /release e /renew devolvem e pedem de novo o IP ao DHCP; /flushdns limpa o cache de DNS.',
  ping: 'O ping envia ICMP Echo Request e mede o tempo até o Echo Reply (RTT). O TTL da resposta ajuda a adivinhar o sistema (64 Linux, 128 Windows, 255 equipamentos de rede).',
  tracert: 'O tracert envia pacotes com TTL 1, 2, 3…; cada roteador que zera o TTL responde ICMP Time Exceeded. "*" é um roteador que não responde — não necessariamente uma falha.',
  nslookup: 'O nslookup pergunta ao servidor DNS o IP de um nome. "Não é resposta autoritativa" quer dizer que veio do cache do resolvedor, não do servidor dono do domínio.',
  arp: 'A tabela ARP liga IPs da rede local a endereços MAC. Só aparecem vizinhos da mesma rede: para a internet, o computador fala sempre com o MAC do gateway.',
  netstat: 'O netstat lista conexões e portas. LISTENING = esperando conexões; ESTABLISHED = conexão ativa; TIME_WAIT = encerrada, aguardando liberação. -o mostra o PID do processo.',
  route: 'A tabela de rotas diz para onde vai cada pacote. A rota 0.0.0.0/0 é a rota padrão: tudo que não é da rede local vai para o gateway.',
  getmac: 'O endereço MAC (físico) identifica a placa de rede na rede local (camada 2).',
  pathping: 'O pathping junta tracert e ping: descobre os saltos e mede a perda de pacotes em cada um.',
  netsh: 'O netsh configura e mostra a rede do Windows: interfaces, Wi-Fi, firewall e proxy.',
  curl: 'O curl faz requisições HTTP. -I mostra só os cabeçalhos da resposta, como o código de status (200, 301, 404…).',
  hostname: 'O hostname é o nome do computador na rede.',
};

const IPV4 = (s: { leased: boolean }) =>
  s.leased
    ? [
        `   Endereço IPv6 de link local . . . . . . . . : ${LAN.ipv6}%12`,
        `   Endereço IPv4. . . . . . . . . . . . . . . : ${LAN.ip}`,
        `   Máscara de Sub-rede . . . . . . . . . . . . : ${LAN.mask}`,
        `   Gateway Padrão. . . . . . . . . . . . . . . : ${LAN.gateway}`,
      ]
    : [
        `   Endereço IPv6 de link local . . . . . . . . : ${LAN.ipv6}%12`,
        '   Endereço IPv4 de configuração automática . : 169.254.73.12',
        '   Máscara de Sub-rede . . . . . . . . . . . . : 255.255.0.0',
        '   Gateway Padrão. . . . . . . . . . . . . . . :',
      ];

export const ipconfig: Handler = (args, { s }) => {
  const net = s.net;
  if (hasFlag(args, '/release')) {
    net.leased = false;
    return ok(
      ['Configuração de IP do Windows', '', 'Adaptador Ethernet Ethernet:', '', '   Sufixo DNS específico de conexão. . . . . . :', ...IPV4(net)].join('\n'),
      'O /release devolveu o IP ao servidor DHCP. Sem IP válido, o Windows usa um 169.254.x.x (APIPA) e nada fora do computador responde. Use ipconfig /renew.',
    );
  }
  if (hasFlag(args, '/renew')) {
    net.leased = true;
    return ok(
      ['Configuração de IP do Windows', '', 'Adaptador Ethernet Ethernet:', '', `   Sufixo DNS específico de conexão. . . . . . : ${LAN.domain}`, ...IPV4(net)].join('\n'),
      'O /renew fez o processo DORA (Discover, Offer, Request, Ack) com o servidor DHCP e recebeu o IP de volta.',
    );
  }
  if (hasFlag(args, '/flushdns')) {
    net.dnsCache = {};
    return ok('Configuração de IP do Windows\n\nCache do DNS Resolver liberado com êxito.', 'O cache de DNS guarda as últimas consultas. Limpar ajuda quando um site mudou de IP e o computador ainda usa o antigo.');
  }
  if (hasFlag(args, '/displaydns')) {
    const entries = Object.entries(net.dnsCache);
    if (!entries.length) return ok('Configuração de IP do Windows\n\nNão foi possível exibir o Cache do DNS Resolver.', 'O cache está vazio. Faça um ping ou nslookup para um site e rode o comando de novo.');
    return ok(
      [
        'Configuração de IP do Windows',
        '',
        ...entries.flatMap(([name, ip]) => [
          `    ${name}`,
          '    ----------------------------------------',
          `    Nome do Registro . . . . . . : ${name}`,
          '    Tipo de Registro . . . . . . : 1',
          '    Vida Útil  . . . . . . . . . : 245',
          '    Seção  . . . . . . . . . . . : Resposta',
          `    Registro A (Host). . . . . . : ${ip}`,
          '',
        ]),
      ].join('\n'),
      'Cada entrada é uma consulta recente guardada pelo tempo de "Vida Útil" (TTL do registro DNS), em segundos.',
    );
  }
  const all = hasFlag(args, '/all');
  const lines = ['', 'Configuração de IP do Windows', ''];
  if (all)
    lines.push(
      `   Nome do host. . . . . . . . . . . . . . . . : ${HOSTNAME_WIN}`,
      `   Sufixo DNS primário . . . . . . . . . . . . :`,
      '   Tipo de nó. . . . . . . . . . . . . . . . . : híbrido',
      '   Roteamento de IP ativado. . . . . . . . . . : não',
      '',
    );
  lines.push('Adaptador Ethernet Ethernet:', '', `   Sufixo DNS específico de conexão. . . . . . : ${net.leased ? LAN.domain : ''}`);
  if (all)
    lines.push(
      '   Descrição . . . . . . . . . . . . . . . . . : Realtek PCIe GbE Family Controller',
      `   Endereço Físico . . . . . . . . . . . . . . : ${LAN.macWin}`,
      '   DHCP Habilitado . . . . . . . . . . . . . . : Sim',
      '   Configuração Automática Habilitada. . . . . : Sim',
    );
  lines.push(...IPV4(net));
  if (all && net.leased)
    lines.push(
      `   Servidor DHCP . . . . . . . . . . . . . . . : ${LAN.dhcpServer}`,
      '   Concessão Obtida. . . . . . . . . . . . . . : sexta-feira, 13 de novembro de 2026 09:00:01',
      '   Concessão Expira. . . . . . . . . . . . . . : sábado, 14 de novembro de 2026 09:00:01',
      `   Servidores DNS. . . . . . . . . . . . . . . : ${LAN.dns[0]}`,
      `                                                 ${LAN.dns[1]}`,
      '   NetBIOS em Tcpip. . . . . . . . . . . . . . : Habilitado',
    );
  lines.push('', 'Adaptador de Rede sem Fio Wi-Fi:', '', '   Estado da mídia. . . . . . . . . . . . . . : mídia desconectada');
  return ok(lines.join('\n'), NOTES.ipconfig);
};

export const ping: Handler = (args, { s }) => {
  const host = positional(args, ['-n', '-l', '-i', '-w'], 'win');
  if (!host) return fail('Uso: ping [-t] [-a] [-n contagem] [-l tamanho] [-i TTL] [-w tempo limite] nome_do_destino');
  const count = Math.min(Math.max(Number(optValue(args, '-n')) || 4, 1), 20);
  const size = Number(optValue(args, '-l')) || 32;
  const res = lookup(host, s.net);
  if (!res) return fail(`A solicitação ping não pôde encontrar o host ${host}. Verifique o nome e tente novamente.`);
  if (!s.net.leased && !res.ip.startsWith('127.') && !isIp(host)) return fail(`A solicitação ping não pôde encontrar o host ${host}. Verifique o nome e tente novamente.`);
  const r = simPing(res.ip, count, s.net);
  const label = isIp(host) ? res.ip : `${host} [${res.ip}]`;
  const head = `\nDisparando ${label} com ${size} bytes de dados:`;
  let body: string[];
  let received = 0;
  if (r.kind === 'reply') {
    body = r.times.map((t) => `Resposta de ${res.ip}: bytes=${size} ${t === 0 ? 'tempo<1ms' : `tempo=${t}ms`} TTL=${r.ttl}`);
    received = count;
  } else if (r.kind === 'nonet') body = Array(count).fill('PING: falha na transmissão. Falha geral.');
  else if (r.kind === 'unreachable') {
    body = Array(count).fill(`Resposta de ${r.from}: Host de destino inacessível.`);
    received = count;
  } else body = Array(count).fill('Esgotado o tempo limite do pedido.');
  const lost = r.kind === 'reply' || r.kind === 'unreachable' ? 0 : count;
  const stats = [
    '',
    `Estatísticas do Ping para ${res.ip}:`,
    `    Pacotes: Enviados = ${count}, Recebidos = ${received}, Perdidos = ${lost} (${Math.round((lost / count) * 100)}% de`,
    '             perda),',
  ];
  if (r.kind === 'reply') {
    const min = Math.min(...r.times);
    const max = Math.max(...r.times);
    const avg = Math.round(r.times.reduce((a, b) => a + b, 0) / r.times.length);
    stats.push('Aproximar um número redondo de vezes em milissegundos:', `    Mínimo = ${min}ms, Máximo = ${max}ms, Média = ${avg}ms`);
  }
  let note = NOTES.ping;
  if (r.kind === 'nonet') note = 'Falha geral: o computador está sem IP válido (você rodou ipconfig /release?). Rode ipconfig /renew.';
  if (r.kind === 'unreachable') note = 'Ninguém na rede local tem esse IP: o ARP perguntou e ninguém respondeu, então o próprio computador avisou "Host de destino inacessível".';
  if (r.kind === 'timeout') note = 'Esgotado o tempo: o pacote saiu, mas nenhuma resposta voltou. Pode ser host desligado, rota inexistente ou firewall bloqueando ICMP.';
  return { out: [head, ...body, ...stats].join('\n'), error: r.kind !== 'reply', note };
};

export const tracert: Handler = (args, { s }) => {
  const host = positional(args, ['-h', '-w'], 'win');
  if (!host) return fail('Uso: tracert [-d] [-h saltos_máximos] [-w tempo_limite] nome_do_destino');
  const res = lookup(host, s.net);
  if (!res) return fail(`Não foi possível resolver o nome do sistema de destino ${host}.`);
  const hops = traceroute(res.ip, s.net);
  if (!hops) return fail('Falha na transmissão. Falha geral.');
  const noNames = hasFlag(args, '-d');
  const t = (v: number | null) => (v === null ? '    *   ' : v === 0 ? '   <1 ms' : `${String(v).padStart(4)} ms`);
  const lines = [
    '',
    `Rastreando a rota para ${isIp(host) ? res.ip : `${host} [${res.ip}]`}`,
    'com no máximo 30 saltos:',
    '',
    ...hops.map((h) =>
      `${String(h.n).padStart(3)} ${h.times.map(t).join(' ')}  ${h.ip ? (h.name && !noNames ? `${h.name} [${h.ip}]` : h.ip) : 'Esgotado o tempo limite do pedido.'}`,
    ),
    '',
    'Rastreamento concluído.',
  ];
  return ok(lines.join('\n'), NOTES.tracert);
};

export const pathping: Handler = (args, { s }) => {
  const host = positional(args, [], 'win');
  if (!host) return fail('Uso: pathping [-n] [-h saltos_máximos] nome_do_destino');
  const res = lookup(host, s.net);
  if (!res) return fail(`Não foi possível resolver o nome do sistema de destino ${host}.`);
  const hops = traceroute(res.ip, s.net);
  if (!hops) return fail('Falha na transmissão. Falha geral.');
  const lines = [
    `Rastreando a rota para ${host} [${res.ip}]`,
    'com no máximo 30 saltos:',
    `  0  ${HOSTNAME_WIN} [${LAN.ip}]`,
    ...hops.map((h) => `${String(h.n).padStart(3)}  ${h.ip ? (h.name ? `${h.name} [${h.ip}]` : h.ip) : '*'}`),
    '',
    'Calculando estatísticas por 25 segundos...',
    '            Origem para Aqui   Este Nó/Vínculo',
    'Salto  RTT  Perdido/Enviado = Pct  Perdido/Enviado = Pct  Endereço',
    ...hops.map((h) =>
      h.ip ? `${String(h.n).padStart(3)}  ${String(h.times[0]).padStart(4)}ms     0/ 100 =  0%     0/ 100 =  0%  ${h.ip}` : `${String(h.n).padStart(3)}    ---   100/ 100 =100%   100/ 100 =100%  *`,
    ),
    '',
    'Rastreamento concluído.',
  ];
  return ok(lines.join('\n'), NOTES.pathping);
};

export const nslookup: Handler = (args, { s }) => {
  const [name, server] = args.filter((a) => !a.startsWith('-'));
  const srv = server ?? LAN.dns[0];
  const srvName = srv === '8.8.8.8' ? 'dns.google' : srv === '1.1.1.1' ? 'one.one.one.one' : srv === LAN.dns[0] ? 'router.netlearn.lan' : 'UnKnown';
  const head = [`Servidor:  ${srvName}`, `Address:  ${srv}`, ''];
  if (!name) return ok([...head, '> (modo interativo não disponível; use: nslookup nome [servidor])'].join('\n'), NOTES.nslookup);
  if (!s.net.leased) return fail(['DNS request timed out.', '    timeout was 2 seconds.', `*** Tempo limite de solicitação para ${srv} esgotado`].join('\n'));
  if (isIp(name)) {
    const res = resolve(name);
    if (!res || res.name === name) return fail([...head, `*** ${srvName} não encontrou ${name}: Non-existent domain`].join('\n'));
    return ok([...head, `Nome:    ${res.name}`, `Address:  ${name}`].join('\n'), 'Com um IP, o nslookup faz a consulta reversa (registro PTR): descobre o nome a partir do endereço.');
  }
  const res = lookup(name, s.net);
  if (!res) return fail([...head, `*** ${srvName} não encontrou ${name}: Non-existent domain`].join('\n'));
  const local = res.local;
  return ok(
    [...head, ...(local ? [] : ['Não é resposta autoritativa:']), `Nome:    ${res.name}`, `Address${res.ipv6 ? 'es' : ''}:  ${res.ipv6 ? `${res.ipv6}\n          ${res.ip}` : res.ip}`].join('\n'),
    NOTES.nslookup,
  );
};

export const arp: Handler = (args, { s }) => {
  if (hasFlag(args, '-d')) {
    s.net.arp = {};
    return ok('', 'A tabela ARP foi apagada. Ela se refaz sozinha: faça um ping para 192.168.1.10 e rode arp -a de novo.');
  }
  if (!hasFlag(args, '-a', '-g')) return fail('Exibe e modifica as tabelas de conversão de endereços IP em físicos\nusadas pelo protocolo de resolução de endereço (ARP).\n\nARP -a [end_inet] [-N end_if]\nARP -d end_inet [end_if]');
  const rows = Object.entries(s.net.arp).map(([ip, mac]) => `  ${pad(ip, 22)}${pad(winMac(mac).toLowerCase(), 22)}dinâmico`);
  return ok(
    [
      '',
      `Interface: ${s.net.leased ? LAN.ip : '169.254.73.12'} --- 0xc`,
      '  Endereço IP           Endereço físico       Tipo',
      ...rows,
      `  ${pad(LAN.broadcast, 22)}${pad('ff-ff-ff-ff-ff-ff', 22)}estático`,
      `  ${pad('224.0.0.22', 22)}${pad('01-00-5e-00-00-16', 22)}estático`,
    ].join('\n'),
    NOTES.arp,
  );
};

export const netstat: Handler = (args) => {
  const flags = args.join('').toLowerCase();
  if (flags.includes('r')) return route(['print'], undefined as never);
  if (flags.includes('e'))
    return ok(
      ['Estatísticas de interface', '', '                           Recebidos            Enviados', '', 'Bytes                     184206133            22401977', 'Pacotes unicast              152338              98114', 'Descartados                       0                  0', 'Erros                             0                  0'].join(
        '\n',
      ),
      'O -e mostra os bytes e pacotes que passaram pela placa. Erros e descartes acima de zero indicam problema de cabo, Wi-Fi ou placa.',
    );
  const all = flags.includes('a');
  const pid = flags.includes('o');
  const conns = CONNECTIONS.filter((c) => all || c.state === 'ESTABLISHED' || c.state === 'TIME_WAIT');
  const lines = [
    '',
    'Conexões ativas',
    '',
    `  Proto  Endereço local         Endereço externo       Estado${pid ? '           PID' : ''}`,
    ...conns.map((c) => `  ${pad(c.proto, 7)}${pad(c.local, 23)}${pad(c.remote, 23)}${pad(c.state, 17)}${pid ? c.pid : ''}`.trimEnd()),
  ];
  return ok(lines.join('\n'), NOTES.netstat);
};

export const route: Handler = (args) => {
  const sub = (args[0] ?? '').toLowerCase();
  if (sub === 'add' || sub === 'delete' || sub === 'change')
    return ok(' OK!', `A rota foi ${sub === 'add' ? 'adicionada' : sub === 'delete' ? 'removida' : 'alterada'} (simulação). Rotas manuais servem para alcançar outras redes por um roteador que não é o padrão.`);
  if (sub !== 'print') return fail('Manipula tabelas de roteamento de rede.\n\nROUTE [-f] [-p] [-4|-6] comando [destino] [MASK máscara] [gateway] [METRIC métrica]\n\n  comando: PRINT | ADD | DELETE | CHANGE');
  return ok(
    [
      '===========================================================================',
      'Lista de interfaces',
      ` 12...${LAN.macWin.toLowerCase().replace(/-/g, ' ')} ......Realtek PCIe GbE Family Controller`,
      '  1...........................Software Loopback Interface 1',
      '===========================================================================',
      '',
      'Tabela de rotas IPv4',
      '===========================================================================',
      'Rotas ativas:',
      'Endereço de rede        Máscara     Ender. gateway    Interface  Custo',
      `          0.0.0.0          0.0.0.0      ${LAN.gateway}     ${LAN.ip}     25`,
      '        127.0.0.0        255.0.0.0         No vínculo         127.0.0.1    331',
      `      ${LAN.network}    255.255.255.0         No vínculo      ${LAN.ip}    281`,
      `     ${LAN.ip}  255.255.255.255         No vínculo      ${LAN.ip}    281`,
      `    ${LAN.broadcast}  255.255.255.255         No vínculo      ${LAN.ip}    281`,
      '===========================================================================',
      'Rotas persistentes:',
      '  Nenhuma',
    ].join('\n'),
    NOTES.route,
  );
};

export const getmac: Handler = () =>
  ok(
    [
      '',
      'Endereço físico     Nome do transporte',
      '=================== ==========================================================',
      `${LAN.macWin}   \\Device\\Tcpip_{7A1C9E52-3B41-4F0B-9E21-0A6D2C51B8F3}`,
      '58-A0-23-91-4C-D2   Mídia desconectada',
    ].join('\n'),
    NOTES.getmac,
  );

export const hostname: Handler = () => ok(HOSTNAME_WIN, NOTES.hostname);

export const netsh: Handler = (args) => {
  const line = args.join(' ').toLowerCase();
  if (line.startsWith('interface ip show config') || line.startsWith('int ip show config'))
    return ok(
      [
        '',
        'Configuração para a interface "Ethernet"',
        '    DHCP habilitado:                         Sim',
        `    Endereço IP:                             ${LAN.ip}`,
        `    Prefixo da sub-rede:                     ${LAN.network}/${LAN.prefix} (máscara ${LAN.mask})`,
        `    Gateway padrão:                          ${LAN.gateway}`,
        '    Métrica de gateway:                      0',
        `    Servidores DNS configurados com DHCP:    ${LAN.dns[0]}`,
        `                                             ${LAN.dns[1]}`,
      ].join('\n'),
      NOTES.netsh,
    );
  if (line.startsWith('wlan show interfaces'))
    return ok(['', 'Há 1 interface no sistema:', '', '    Nome                   : Wi-Fi', '    Estado                 : desconectado', '    Status do rádio        : Hardware ligado', '                             Software ligado'].join('\n'), 'A placa Wi-Fi está ligada, mas sem rede: este computador está no cabo (Ethernet).');
  if (line.startsWith('wlan show networks'))
    return ok(['', 'Interface name : Wi-Fi', 'Há 2 redes visíveis no momento.', '', `SSID 1 : ${LAN.ssid}`, '    Tipo de rede            : Infraestrutura', '    Autenticação            : WPA2-Personal', '    Criptografia            : CCMP', '', 'SSID 2 : Vizinho_5G', '    Tipo de rede            : Infraestrutura', '    Autenticação            : WPA3-Personal', '    Criptografia            : CCMP'].join('\n'), 'Lista as redes Wi-Fi ao alcance. WPA2/WPA3 com CCMP (AES) são as opções seguras; evite redes abertas ou WEP.');
  if (line.startsWith('advfirewall show') || line.startsWith('firewall show'))
    return ok(['', 'Configurações de Perfil de Domínio:', '----------------------------------------------------------------------', 'Estado                                LIGADO', 'Política de Firewall                  BlockInbound,AllowOutbound', '', 'Configurações de Perfil Privado:', 'Estado                                LIGADO', '', 'Configurações de Perfil Público:', 'Estado                                LIGADO', 'Ok.'].join('\n'), 'BlockInbound,AllowOutbound: bloqueia conexões que chegam e libera as que saem, o padrão seguro do Windows.');
  if (line.startsWith('winhttp show proxy')) return ok('\nConfigurações de proxy WinHTTP atuais:\n\n    Acesso direto (sem servidor proxy).', 'Sem proxy: o computador acessa a internet direto pelo gateway.');
  return ok(
    ['Os seguintes comandos estão disponíveis (neste laboratório):', '', 'netsh interface ip show config', 'netsh wlan show interfaces', 'netsh wlan show networks', 'netsh advfirewall show allprofiles', 'netsh winhttp show proxy'].join('\n'),
    NOTES.netsh,
  );
};

/** curl.exe (vem no Windows 10 e 11). */
export const curlExe: Handler = (args, { s }) => {
  const url = positional(args, ['-o', '-H', '-X', '-d'], 'unix');
  if (!url) return fail('curl: try \'curl --help\' for more information');
  return httpRequest(url, hasFlag(args, '-I', '--head'), s.net.leased);
};

export function httpRequest(url: string, headOnly: boolean, online: boolean) {
  const m = url.match(/^(?:(https?):\/\/)?([^/:]+)(?::(\d+))?(\/.*)?$/i);
  if (!m) return fail(`curl: (3) URL using bad/illegal format or missing URL`);
  const scheme = (m[1] ?? 'http').toLowerCase();
  const host = m[2];
  const path = m[4] ?? '/';
  const res = resolve(host);
  if (!online || !res) return fail(`curl: (6) Could not resolve host: ${host}`);
  const port = Number(m[3]) || (scheme === 'https' ? 443 : 80);
  if (!portOpen(res.ip, port)) return fail(`curl: (7) Failed to connect to ${host} port ${port} after 21 ms: Couldn't connect to server`);
  const redirect = scheme === 'http' && res.ports.includes(443) && !res.local;
  const status = redirect ? 'HTTP/1.1 301 Moved Permanently' : path.includes('nao-existe') ? 'HTTP/2 404' : scheme === 'https' ? 'HTTP/2 200' : 'HTTP/1.1 200 OK';
  const headers = [
    status,
    'server: nginx',
    'date: Fri, 13 Nov 2026 21:00:00 GMT',
    'content-type: text/html; charset=utf-8',
    ...(redirect ? [`location: https://${host}${path}`] : []),
    'cache-control: max-age=600',
  ];
  if (headOnly) return ok(headers.join('\n'), NOTES.curl);
  const body = redirect
    ? `<html><head><title>301 Moved Permanently</title></head><body><h1>301 Moved Permanently</h1></body></html>`
    : path.includes('nao-existe')
      ? '<html><body><h1>404 Not Found</h1></body></html>'
      : `<!doctype html>\n<html lang="pt-BR">\n<head><title>${host}</title></head>\n<body>\n  <h1>Página de ${host}</h1>\n</body>\n</html>`;
  return ok(body, redirect ? 'Resposta 301: o site pede para usar HTTPS. Repita com https:// (ou curl -L para seguir o redirecionamento).' : NOTES.curl);
}

/** Lista de portas comuns, usada por quem quer descobrir o nome de um serviço. */
export function serviceName(port: number) {
  return SERVICE[port] ?? 'desconhecido';
}
