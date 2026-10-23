import { formatIpv4, parseIpv4, parsePrefix } from '../subnet';
import type { Area, Level } from './types';

// Conteúdo do jogo "Carreira em TI": 5 áreas, 3 fases cada.
// As fases ficam numa ordem única (a carreira): cada uma libera a seguinte.

export const AREAS: Area[] = [
  {
    id: 'suporte',
    title: 'Suporte Técnico (Help Desk)',
    role: 'Técnico(a) de Suporte',
    dayToDay:
      'Atende os chamados dos colegas: computador sem internet, impressora que não imprime, site que não abre. É a porta de entrada mais comum para a carreira em TI.',
    topics: ['DHCP', 'DNS', 'Endereçamento IPv4', 'ping e ipconfig'],
  },
  {
    id: 'redes',
    title: 'Administração de Redes',
    role: 'Analista de Redes',
    dayToDay:
      'Planeja e mantém a rede da empresa: divide endereços entre setores, configura switches e VLANs e garante que cada pacote chegue ao destino.',
    topics: ['Subnetting', 'VLAN', 'Switch e roteador', 'Modelo TCP/IP'],
  },
  {
    id: 'seguranca',
    title: 'Segurança da Informação (SOC)',
    role: 'Analista de Segurança',
    dayToDay:
      'Protege servidores e usuários: define regras de firewall, monitora logs atrás de ataques e responde a incidentes antes que virem prejuízo.',
    topics: ['Firewall', 'Portas de rede', 'SSH', 'Análise de logs'],
  },
  {
    id: 'cloud',
    title: 'Cloud e DevOps',
    role: 'Engenheiro(a) de Cloud',
    dayToDay:
      'Coloca aplicações no ar na nuvem: desenha redes virtuais, automatiza deploys e monitora se os serviços estão respondendo.',
    topics: ['Sub-redes públicas e privadas', 'NAT', 'TCP e portas', 'HTTP'],
  },
  {
    id: 'noc',
    title: 'Infraestrutura e Telecom (NOC)',
    role: 'Engenheiro(a) de Redes',
    dayToDay:
      'Cuida dos links entre cidades e com a internet: interliga matriz e filiais por VPN, acompanha a latência e conversa com operadoras quando algo cai.',
    topics: ['ICMP e traceroute', 'VPN', 'Roteamento', 'Modelo OSI'],
  },
];

export const FINAL_ROLE = 'Especialista em Infraestrutura de TI';
export const START_ROLE = 'Estagiário(a) de TI';

// ---------------------------------------------------------------------------
// Ajudantes de validação para as fases de configuração

const ip = (value: string) => parseIpv4(value ?? '');
const sameIp = (value: string, expected: string) => ip(value) !== null && ip(value) === ip(expected);

/** Rede (número) de um IP dado o prefixo. */
const networkOf = (address: number, prefix: number) => {
  const block = 2 ** (32 - prefix);
  return Math.floor(address / block) * block;
};

const isPrivate = (address: number) => {
  const [a, b] = formatIpv4(address).split('.').map(Number);
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
};

// ---------------------------------------------------------------------------

export const LEVELS: Level[] = [
  // ======================= SUPORTE =======================
  {
    id: 'sem-internet-rh',
    area: 'suporte',
    kind: 'diagnose',
    title: 'Sem internet no RH',
    ticket: {
      from: 'Maria — Recursos Humanos',
      priority: 'Média',
      message: 'Bom dia! Liguei o computador hoje e nada abre: nem o sistema de ponto, nem a internet. Ontem estava tudo normal.',
    },
    context: [
      { label: 'Rede do escritório', value: '192.168.1.0/24' },
      { label: 'Gateway', value: '192.168.1.1' },
      { label: 'Endereços', value: 'Entregues por DHCP' },
    ],
    prompt: 'C:\\Users\\maria.rh>',
    minCommands: 2,
    commands: [
      {
        cmd: 'ipconfig',
        output: `Adaptador Ethernet Ethernet:

   Sufixo DNS específico de conexão. . . . :
   Endereço IPv4 de link local . . . . . . : 169.254.73.12
   Máscara de Sub-rede . . . . . . . . . . : 255.255.0.0
   Gateway Padrão. . . . . . . . . . . . . :`,
      },
      {
        cmd: 'ping 192.168.1.1',
        output: `Disparando 192.168.1.1 com 32 bytes de dados:
PING: falha na transmissão. Falha geral.
PING: falha na transmissão. Falha geral.
PING: falha na transmissão. Falha geral.
PING: falha na transmissão. Falha geral.

Estatísticas do Ping para 192.168.1.1:
    Pacotes: Enviados = 4, Recebidos = 0, Perdidos = 4 (100% de perda)`,
      },
      {
        cmd: 'ping 127.0.0.1',
        output: `Disparando 127.0.0.1 com 32 bytes de dados:
Resposta de 127.0.0.1: bytes=32 tempo<1ms TTL=128
Resposta de 127.0.0.1: bytes=32 tempo<1ms TTL=128
Resposta de 127.0.0.1: bytes=32 tempo<1ms TTL=128
Resposta de 127.0.0.1: bytes=32 tempo<1ms TTL=128`,
      },
      {
        cmd: 'ipconfig /renew',
        output: `Ocorreu um erro ao renovar a interface Ethernet:
Não foi possível contatar o servidor DHCP. Tempo limite da solicitação esgotado.`,
      },
    ],
    question: 'Qual é a causa mais provável do problema?',
    options: [
      {
        text: 'O computador não recebeu um endereço do servidor DHCP.',
        correct: true,
        feedback: 'Isso! O endereço 169.254.x.x (APIPA) é o que o Windows usa quando nenhum servidor DHCP responde.',
      },
      {
        text: 'O sistema de ponto está fora do ar.',
        feedback: 'Se fosse só o sistema, o resto da internet abriria. Aqui nem o gateway responde.',
      },
      {
        text: 'A placa de rede queimou.',
        feedback: 'O ping em 127.0.0.1 responde e o Windows conseguiu gerar um endereço: a pilha TCP/IP e a placa estão funcionando.',
      },
      {
        text: 'O servidor DNS está errado.',
        feedback: 'DNS só entra em jogo depois que o computador tem um IP válido e alcança o gateway. Aqui nem isso acontece.',
      },
    ],
    hint: 'Repare no endereço IPv4 que o ipconfig mostra. Ele pertence à rede 192.168.1.0/24 do escritório?',
    debrief:
      'Endereços 169.254.0.0/16 (APIPA) aparecem quando o cliente envia o DHCP Discover e ninguém responde. Próximos passos de um técnico: ver se outros PCs do setor têm o mesmo problema, se o serviço DHCP está ativo e se o escopo de endereços não esgotou.',
    module: { slug: 'dhcp', title: 'DHCP' },
  },
  {
    id: 'site-nao-abre',
    area: 'suporte',
    kind: 'diagnose',
    title: 'O site não abre… mas a internet funciona?',
    ticket: {
      from: 'João — Vendas',
      priority: 'Alta',
      message: 'Nenhum site abre no meu notebook, aparece "Não foi possível encontrar o endereço". Mas o WhatsApp no computador continua funcionando!',
    },
    context: [
      { label: 'Gateway', value: '192.168.1.1' },
      { label: 'DNS interno da empresa', value: '192.168.1.10' },
    ],
    prompt: 'C:\\Users\\joao.vendas>',
    minCommands: 3,
    commands: [
      {
        cmd: 'ping 8.8.8.8',
        output: `Disparando 8.8.8.8 com 32 bytes de dados:
Resposta de 8.8.8.8: bytes=32 tempo=14ms TTL=117
Resposta de 8.8.8.8: bytes=32 tempo=13ms TTL=117
Resposta de 8.8.8.8: bytes=32 tempo=13ms TTL=117
Resposta de 8.8.8.8: bytes=32 tempo=15ms TTL=117`,
      },
      {
        cmd: 'ping www.google.com',
        output: `A solicitação ping não pôde encontrar o host www.google.com.
Verifique o nome e tente novamente.`,
      },
      {
        cmd: 'nslookup www.google.com',
        output: `Servidor:  UnKnown
Address:  192.168.1.250

DNS request timed out.
    timeout was 2 seconds.
*** Tempo limite de solicitação para UnKnown esgotado`,
      },
      {
        cmd: 'ipconfig /all',
        output: `Adaptador de Rede sem Fio Wi-Fi:

   DHCP Habilitado. . . . . . . . . . . . : Não
   Endereço IPv4. . . . . . . . . . . . . : 192.168.1.57
   Máscara de Sub-rede. . . . . . . . . . : 255.255.255.0
   Gateway Padrão. . . . . . . . . . . . . : 192.168.1.1
   Servidores DNS. . . . . . . . . . . . . : 192.168.1.250`,
      },
      {
        cmd: 'nslookup www.google.com 192.168.1.10',
        output: `Servidor:  dns01.empresa.local
Address:  192.168.1.10

Não é resposta autoritativa:
Nome:    www.google.com
Addresses:  142.250.79.36`,
      },
    ],
    question: 'O que está causando o problema?',
    options: [
      {
        text: 'O notebook está configurado com um servidor DNS errado (192.168.1.250).',
        correct: true,
        feedback: 'Exato! A conectividade por IP funciona, só a tradução de nomes falha — e o servidor configurado não responde.',
      },
      {
        text: 'O link de internet da empresa caiu.',
        feedback: 'O ping para 8.8.8.8, um IP na internet, responde normalmente. O link está no ar.',
      },
      {
        text: 'O gateway padrão está errado.',
        feedback: 'Com o gateway errado, nem o ping para 8.8.8.8 funcionaria.',
      },
      {
        text: 'Um firewall está bloqueando o Google.',
        feedback: 'O nslookup no DNS correto (192.168.1.10) resolve o nome sem problemas. Não há bloqueio.',
      },
    ],
    hint: 'Compare: ping por IP funciona, ping por nome não. Qual serviço transforma nomes em IPs? Para qual servidor o notebook está perguntando?',
    debrief:
      'Quando o acesso por IP funciona e por nome não, o problema é DNS. Alguém configurou o DNS manualmente com 192.168.1.250. A correção é voltar a obter o DNS por DHCP (ou usar 192.168.1.10) e rodar ipconfig /flushdns.',
    module: { slug: 'dns', title: 'DNS' },
  },
  {
    id: 'ip-impressora',
    area: 'suporte',
    kind: 'config',
    title: 'Configure a nova impressora',
    ticket: {
      from: 'Carla — Administrativo',
      priority: 'Baixa',
      message: 'Chegou a impressora nova do financeiro! Ela precisa de um IP fixo para todo mundo conseguir imprimir. Pode configurar?',
    },
    context: [
      { label: 'Rede', value: '192.168.10.0/24' },
      { label: 'Gateway', value: '192.168.10.1' },
      { label: 'DNS', value: '192.168.10.10' },
      { label: 'Faixa do DHCP', value: '192.168.10.100 a 192.168.10.200' },
      { label: 'IPs fixos em uso', value: '.1 (roteador), .10 (DNS), .20 (arquivos), .21 (impressora do térreo)' },
    ],
    instruction: 'Preencha a configuração de rede da impressora. O IP fixo não pode conflitar com nenhum equipamento nem com os endereços que o DHCP entrega.',
    fields: [
      { id: 'ip', label: 'Endereço IP', placeholder: '192.168.10.x' },
      { id: 'mask', label: 'Máscara de sub-rede', placeholder: '255.255.255.0' },
      { id: 'gateway', label: 'Gateway padrão', placeholder: '192.168.10.?' },
      { id: 'dns', label: 'Servidor DNS', placeholder: '192.168.10.?' },
    ],
    validate: (v) => {
      const errors: string[] = [];
      const addr = ip(v.ip);
      const base = ip('192.168.10.0')!;
      if (addr === null) errors.push('O endereço IP não é válido (use quatro números de 0 a 255).');
      else if (networkOf(addr, 24) !== base) errors.push('O IP precisa estar na rede 192.168.10.0/24, senão a impressora fica isolada.');
      else {
        const last = addr - base;
        if (last === 0) errors.push('192.168.10.0 é o endereço da rede, não pode ser usado por um equipamento.');
        else if (last === 255) errors.push('192.168.10.255 é o broadcast da rede, não pode ser usado por um equipamento.');
        else if ([1, 10, 20, 21].includes(last)) errors.push(`O IP .${last} já está em uso: daria conflito de endereço.`);
        else if (last >= 100 && last <= 200) errors.push(`O IP .${last} está dentro da faixa do DHCP: um dia ele seria entregue a outro computador e daria conflito.`);
      }
      if (parsePrefix(v.mask ?? '') !== 24) errors.push('A máscara de uma rede /24 é 255.255.255.0.');
      if (!sameIp(v.gateway, '192.168.10.1')) errors.push('O gateway deve ser o roteador da rede (192.168.10.1).');
      if (!sameIp(v.dns, '192.168.10.10')) errors.push('O DNS deve ser o servidor DNS da empresa (192.168.10.10).');
      return errors;
    },
    solution: { ip: '192.168.10.30', mask: '255.255.255.0', gateway: '192.168.10.1', dns: '192.168.10.10' },
    hint: 'Escolha um número livre fora de 100–200 e diferente de 1, 10, 20 e 21. Gateway e DNS estão na documentação ao lado.',
    debrief:
      'Equipamentos que outros acessam (impressoras, servidores) recebem IP fixo fora da faixa do DHCP ou uma reserva no próprio DHCP. Assim o endereço nunca muda e nunca conflita. Anotar o IP na documentação evita dor de cabeça no futuro.',
    module: { slug: 'subrede-e-mascara', title: 'Sub-rede e máscara' },
  },

  // ======================= REDES =======================
  {
    id: 'subnetting-filial',
    area: 'redes',
    kind: 'config',
    title: 'Divida a rede da nova filial',
    ticket: {
      from: 'Ricardo — Gerente de Infraestrutura',
      priority: 'Média',
      message: 'A filial de Joinville recebeu o bloco 192.168.50.0/24. Quero uma sub-rede separada por setor, todas do mesmo tamanho, cada uma com espaço para até 50 computadores.',
    },
    context: [
      { label: 'Bloco disponível', value: '192.168.50.0/24' },
      { label: 'Setores (nesta ordem)', value: '1º Vendas · 2º Financeiro · 3º RH · 4º TI' },
      { label: 'Hosts por setor', value: 'até 50' },
    ],
    instruction: 'Calcule o plano de endereçamento. Use sub-redes do mesmo tamanho, na ordem dos setores, começando em 192.168.50.0.',
    fields: [
      { id: 'prefix', label: 'Máscara de cada sub-rede (ex.: /27)', placeholder: '/?' },
      { id: 'rhNetwork', label: 'Endereço de rede do RH (3º setor)', placeholder: '192.168.50.?' },
      { id: 'rhBroadcast', label: 'Broadcast do RH', placeholder: '192.168.50.?' },
      { id: 'tiFirst', label: 'Primeiro IP utilizável do TI (4º setor)', placeholder: '192.168.50.?' },
    ],
    validate: (v) => {
      const errors: string[] = [];
      const prefix = parsePrefix(v.prefix ?? '');
      if (prefix === null) errors.push('Máscara inválida. Use o formato /26 ou 255.255.255.192.');
      else if (prefix <= 25) errors.push(`Com /${prefix} cabem poucas sub-redes no /24: não sobra uma para cada um dos 4 setores.`);
      else if (prefix >= 27) errors.push(`Uma /${prefix} tem só ${2 ** (32 - prefix) - 2} hosts utilizáveis: não cabem 50 computadores.`);
      if (!sameIp(v.rhNetwork, '192.168.50.128')) errors.push('O endereço de rede do RH está errado. Dica: cada sub-rede /26 tem 64 endereços; conte 0, 64, 128…');
      if (!sameIp(v.rhBroadcast, '192.168.50.191')) errors.push('O broadcast do RH está errado. Ele é o último endereço antes da próxima sub-rede.');
      if (!sameIp(v.tiFirst, '192.168.50.193')) errors.push('O primeiro IP do TI está errado. Ele é o endereço de rede do TI + 1.');
      return errors;
    },
    solution: { prefix: '/26', rhNetwork: '192.168.50.128', rhBroadcast: '192.168.50.191', tiFirst: '192.168.50.193' },
    hint: '50 hosts precisam de 6 bits de host (2⁶ − 2 = 62). Isso dá 32 − 6 = /26, com blocos de 64 endereços: .0, .64, .128, .192.',
    debrief:
      'Plano final: Vendas 192.168.50.0/26, Financeiro .64/26, RH .128/26 (broadcast .191) e TI .192/26 (hosts .193 a .254). Separar setores em sub-redes reduz broadcast e permite regras de acesso diferentes para cada um.',
    module: { slug: 'subnetting', title: 'Subnetting' },
  },
  {
    id: 'vlans-switch',
    area: 'redes',
    kind: 'classify',
    title: 'Organize as VLANs do switch',
    ticket: {
      from: 'Paula — Coordenadora de TI',
      priority: 'Média',
      message: 'Auditoria pediu que visitantes nunca enxerguem os sistemas do financeiro. Criamos três VLANs no switch novo; agora falta colocar cada equipamento na certa.',
    },
    instruction: 'Clique em um equipamento e depois na VLAN onde ele deve ficar. Quando todos estiverem posicionados, clique em Verificar.',
    buckets: [
      { id: 'v10', label: 'VLAN 10 — Financeiro', description: 'Sistemas e dados financeiros' },
      { id: 'v20', label: 'VLAN 20 — TI', description: 'Administração e monitoramento' },
      { id: 'v30', label: 'VLAN 30 — Convidados', description: 'Só internet, isolada do resto' },
    ],
    items: [
      { id: 'pc-contab', label: 'PC da contabilidade', bucket: 'v10', why: 'Acessa dados financeiros: fica junto dos sistemas do setor.' },
      { id: 'srv-folha', label: 'Servidor da folha de pagamento', bucket: 'v10', why: 'Guarda dados sensíveis do financeiro: só a VLAN 10 (e a TI, via regras no roteador) deve alcançá-lo.' },
      { id: 'imp-fin', label: 'Impressora do financeiro', bucket: 'v10', why: 'Imprime documentos do setor: fica na VLAN dos usuários que a usam.' },
      { id: 'nb-suporte', label: 'Notebook do analista de suporte', bucket: 'v20', why: 'Equipamento de administração: na VLAN de TI, com acesso controlado às demais.' },
      { id: 'srv-monit', label: 'Servidor de monitoramento', bucket: 'v20', why: 'Monitora toda a rede: é infraestrutura de TI.' },
      { id: 'ap-visit', label: 'Access point da rede de visitantes', bucket: 'v30', why: 'Tudo que conecta nele é desconhecido: precisa ficar isolado.' },
      { id: 'nb-cliente', label: 'Notebook de um cliente em reunião', bucket: 'v30', why: 'Dispositivo de fora da empresa: só deve ter acesso à internet.' },
    ],
    hint: 'Pergunte para cada equipamento: quem precisa acessá-lo? Algo que vem de fora da empresa nunca deve dividir rede com dados sensíveis.',
    debrief:
      'Cada VLAN é um domínio de broadcast separado: equipamentos de VLANs diferentes só se falam passando pelo roteador ou firewall, onde ficam as regras. Assim a rede de visitantes navega na internet sem enxergar o servidor da folha.',
    module: { slug: 'vlan', title: 'VLAN' },
  },
  {
    id: 'caminho-do-acesso',
    area: 'redes',
    kind: 'sequence',
    title: 'O caminho de um acesso a um site',
    ticket: {
      from: 'Equipe de treinamento',
      priority: 'Baixa',
      message: 'Vamos treinar o estagiário novo. Monte a ordem do que acontece na rede quando um PC recém-ligado abre https://intranet.empresa.com.br pela primeira vez.',
    },
    instruction: 'Use as setas para colocar as etapas na ordem em que acontecem e clique em Verificar.',
    steps: [
      { id: 'dhcp', text: 'O PC recebe IP, máscara, gateway e DNS do servidor DHCP (Discover, Offer, Request, Ack).' },
      { id: 'arp', text: 'O ARP descobre o endereço MAC do equipamento a quem enviar o primeiro pacote (gateway ou DNS local).' },
      { id: 'dns', text: 'Uma consulta DNS traduz intranet.empresa.com.br para um endereço IP.' },
      { id: 'tcp', text: 'O handshake TCP (SYN, SYN-ACK, ACK) abre a conexão com o servidor na porta 443.' },
      { id: 'tls', text: 'O handshake TLS confere o certificado e combina as chaves de criptografia.' },
      { id: 'http', text: 'O navegador envia um HTTP GET e recebe a página com o status 200 OK.' },
    ],
    hint: 'Sem IP nada acontece. Antes de mandar qualquer pacote na rede local é preciso saber o MAC do destino. Sem saber o IP do site, não dá para abrir conexão.',
    debrief:
      'Cada etapa depende da anterior: endereço (DHCP) → entrega local (ARP) → nome para IP (DNS) → conexão confiável (TCP) → segurança (TLS) → aplicação (HTTP). Quando algo falha, saber essa ordem mostra onde investigar.',
    module: { slug: 'tcp-ip', title: 'Modelo TCP/IP' },
  },

  // ======================= SEGURANÇA =======================
  {
    id: 'firewall-servidor-web',
    area: 'seguranca',
    kind: 'firewall',
    title: 'Proteja o servidor web',
    ticket: {
      from: 'Lucas — Desenvolvimento',
      priority: 'Alta',
      message: 'O site novo vai ao ar amanhã no srv-web01 (Linux). Monta as regras de firewall dele? Hoje está tudo liberado.',
    },
    instruction: 'Decida para cada regra se o tráfego deve ser Permitido ou Bloqueado. As regras são avaliadas de cima para baixo e a primeira que combina vale.',
    requirements: [
      'Qualquer pessoa na internet deve acessar o site por HTTPS.',
      'Quem digitar http:// deve chegar ao servidor para ser redirecionado ao HTTPS.',
      'Só a rede de administração (10.0.99.0/24) pode acessar o servidor por SSH.',
      'O banco MySQL roda no próprio servidor e só a aplicação local o usa.',
      'Nada de serviços desnecessários ou sem criptografia expostos.',
    ],
    rules: [
      { id: 'r1', protocol: 'TCP', port: '443', source: 'Qualquer', service: 'HTTPS', correct: 'allow', why: 'É o próprio site: precisa estar aberto para todos.' },
      { id: 'r2', protocol: 'TCP', port: '80', source: 'Qualquer', service: 'HTTP', correct: 'allow', why: 'Fica aberto só para o servidor responder com um redirecionamento 301 para o HTTPS.' },
      { id: 'r3', protocol: 'TCP', port: '22', source: '10.0.99.0/24', service: 'SSH', correct: 'allow', why: 'Administração vinda da rede autorizada.' },
      { id: 'r4', protocol: 'TCP', port: '22', source: 'Qualquer', service: 'SSH', correct: 'deny', why: 'SSH exposto na internet recebe tentativas de força bruta o dia todo. Como a regra r3 vem antes, a rede de administração continua entrando.' },
      { id: 'r5', protocol: 'TCP', port: '23', source: 'Qualquer', service: 'Telnet', correct: 'deny', why: 'Telnet envia usuário e senha em texto puro. Use SSH.' },
      { id: 'r6', protocol: 'TCP', port: '3306', source: 'Qualquer', service: 'MySQL', correct: 'deny', why: 'O banco só é usado localmente (127.0.0.1). Expor a porta 3306 é um convite a ataques.' },
      { id: 'r7', protocol: 'TCP', port: '3389', source: 'Qualquer', service: 'RDP', correct: 'deny', why: 'Área de trabalho remota do Windows: o servidor é Linux e não usa. Porta aberta sem uso é risco sem benefício.' },
    ],
    hint: 'Libere apenas o que um requisito pede. Para o SSH, pense na ordem: a regra mais específica (rede de administração) vem antes da geral.',
    debrief:
      'O princípio do menor privilégio: abrir somente o necessário, para quem precisa. Ao final da lista, um firewall bem configurado ainda tem uma regra padrão "bloquear todo o resto".',
    module: { slug: 'firewall', title: 'Firewall' },
  },
  {
    id: 'forca-bruta-ssh',
    area: 'seguranca',
    kind: 'logs',
    title: 'Ataque de força bruta?',
    ticket: {
      from: 'Alerta automático do SIEM',
      priority: 'Crítica',
      message: 'Muitas falhas de autenticação SSH em srv-web01 entre 02:30 e 02:45. Analista de plantão: verificar se houve invasão.',
    },
    instruction: 'Clique nas linhas que fazem parte do ataque para marcá-las. Deixe de fora o que é atividade normal e envie o relatório.',
    file: '/var/log/auth.log — srv-web01',
    lines: [
      { id: 'l1', text: 'Oct 23 02:14:01 srv-web01 sshd[2101]: Accepted publickey for deploy from 10.0.99.15 port 51022 ssh2', suspicious: false, why: 'Login por chave, de dentro da rede de administração. Rotina do deploy automático.' },
      { id: 'l2', text: 'Oct 23 02:31:12 srv-web01 sshd[2188]: Failed password for root from 185.220.101.47 port 40112 ssh2', suspicious: true, why: 'Tentativa de senha no usuário root vinda de um IP externo.' },
      { id: 'l3', text: 'Oct 23 02:31:14 srv-web01 sshd[2190]: Failed password for root from 185.220.101.47 port 40118 ssh2', suspicious: true, why: 'Mesmo IP, dois segundos depois: padrão de ataque automatizado.' },
      { id: 'l4', text: 'Oct 23 02:31:15 srv-web01 sshd[2193]: Failed password for invalid user admin from 185.220.101.47 port 40121 ssh2', suspicious: true, why: 'Testando nomes de usuário comuns que nem existem: força bruta.' },
      { id: 'l5', text: 'Oct 23 02:31:17 srv-web01 sshd[2195]: Failed password for invalid user test from 185.220.101.47 port 40127 ssh2', suspicious: true, why: 'Continua a lista de usuários comuns.' },
      { id: 'l6', text: 'Oct 23 02:35:40 srv-web01 sshd[2240]: Failed password for ana from 10.0.99.23 port 50211 ssh2', suspicious: false, why: 'Uma única falha, de dentro da rede de administração, seguida de sucesso: alguém errou a senha.' },
      { id: 'l7', text: 'Oct 23 02:35:52 srv-web01 sshd[2241]: Accepted password for ana from 10.0.99.23 port 50215 ssh2', suspicious: false, why: 'A analista Ana entrando normalmente após errar a senha uma vez.' },
      { id: 'l8', text: 'Oct 23 02:40:03 srv-web01 sshd[2302]: Accepted password for backup from 185.220.101.47 port 41877 ssh2', suspicious: true, why: 'O pior sinal: o mesmo IP do ataque CONSEGUIU entrar com a conta backup. Houve invasão.' },
      { id: 'l9', text: 'Oct 23 02:40:09 srv-web01 sudo: backup : TTY=pts/1 ; PWD=/home/backup ; USER=root ; COMMAND=/bin/bash', suspicious: true, why: 'Logo após entrar, o invasor virou root. Escalada de privilégio.' },
      { id: 'l10', text: 'Oct 23 03:00:01 srv-web01 CRON[3301]: pam_unix(cron:session): session opened for user root by (uid=0)', suspicious: false, why: 'Tarefa agendada do próprio sistema, todo dia no mesmo horário.' },
    ],
    hint: 'Siga o IP 185.220.101.47 do começo ao fim. E não esqueça o que ele fez depois de entrar.',
    debrief:
      'Houve invasão: força bruta, acesso pela conta backup (senha fraca) e escalada para root. Resposta: isolar o servidor, bloquear o IP, desativar login por senha no SSH (só chaves), trocar credenciais e investigar o que foi alterado.',
    module: { slug: 'ssh', title: 'SSH' },
  },
  {
    id: 'porta-suspeita',
    area: 'seguranca',
    kind: 'diagnose',
    title: 'Processo estranho na estação 07',
    ticket: {
      from: 'Antivírus corporativo',
      priority: 'Alta',
      message: 'Comportamento suspeito na estacao-07 (usuária Ana, Marketing): processo desconhecido criado em /tmp. Investigar.',
    },
    prompt: 'soc@estacao-07:~$',
    minCommands: 3,
    commands: [
      {
        cmd: 'ss -tulpn',
        output: `Netid State  Local Address:Port  Process
tcp   LISTEN 0.0.0.0:22          users:(("sshd",pid=812))
tcp   LISTEN 127.0.0.1:631       users:(("cupsd",pid=640))
tcp   LISTEN 0.0.0.0:4444        users:(("update-helper",pid=4821))`,
      },
      {
        cmd: 'ss -tnp state established',
        output: `Local Address:Port      Peer Address:Port     Process
192.168.20.37:51544     203.0.113.66:443      users:(("update-helper",pid=4821))
192.168.20.37:40210     142.250.79.36:443     users:(("firefox",pid=2210))`,
      },
      {
        cmd: 'ps -p 4821 -o user,lstart,cmd',
        output: `USER  STARTED                   CMD
ana   Fri Oct 23 09:12:44 2026  /tmp/.cache/update-helper -l 4444 -c 203.0.113.66:443`,
      },
      {
        cmd: 'ls -la /tmp/.cache/',
        output: `-rwxr-xr-x 1 ana ana 1843200 Oct 23 09:12 update-helper
-rw-r--r-- 1 ana ana    1204 Oct 23 09:12 notas_fiscais.pdf.desktop`,
      },
    ],
    question: 'Qual é a melhor ação imediata?',
    options: [
      {
        text: 'Isolar a estação da rede (quarentena), preservar as evidências e abrir um incidente.',
        correct: true,
        feedback: 'Correto! Cortar a comunicação com o atacante sem apagar nada permite investigar o que foi feito.',
      },
      {
        text: 'Apagar o arquivo e reiniciar o computador.',
        feedback: 'Isso destrói as evidências (memória, arquivos) e não garante que o invasor não deixou outra porta.',
      },
      {
        text: 'Ignorar: a conexão é na porta 443, que é HTTPS normal.',
        feedback: 'Atacantes usam a 443 justamente para se esconder no meio do tráfego HTTPS. O processo em /tmp com nome falso é o alerta.',
      },
      {
        text: 'Bloquear só a porta 4444 no firewall e seguir o dia.',
        feedback: 'A conexão de controle sai pela 443 e continuaria ativa. E o malware segue na máquina.',
      },
    ],
    hint: 'Um "update-helper" rodando de uma pasta oculta em /tmp, escutando a porta 4444 e conectado a um IP desconhecido… e um arquivo .pdf.desktop. Primeiro conter, depois investigar.',
    debrief:
      'Um anexo falso (.pdf.desktop) instalou um acesso remoto (reverse shell) que fala com o atacante pela porta 443. A ordem certa em resposta a incidentes é: conter, preservar evidências, investigar, erradicar e recuperar.',
    module: { slug: 'portas-de-rede', title: 'Portas de rede' },
  },

  // ======================= CLOUD =======================
  {
    id: 'subredes-nuvem',
    area: 'cloud',
    kind: 'classify',
    title: 'Monte a rede da aplicação na nuvem',
    ticket: {
      from: 'Fernanda — Tech Lead',
      priority: 'Média',
      message: 'Vamos subir a loja virtual na nuvem. A VPC tem uma sub-rede pública e uma privada. Em qual vai cada componente?',
    },
    instruction: 'Coloque cada componente na sub-rede certa. Regra de ouro: só fica na pública o que precisa receber conexões da internet.',
    buckets: [
      { id: 'pub', label: 'Sub-rede pública', description: 'Tem rota direta para a internet' },
      { id: 'priv', label: 'Sub-rede privada', description: 'Inalcançável a partir da internet' },
    ],
    items: [
      { id: 'lb', label: 'Balanceador de carga (load balancer)', bucket: 'pub', why: 'É a porta de entrada dos clientes: recebe o HTTPS da internet e repassa para os servidores privados.' },
      { id: 'nat', label: 'NAT gateway', bucket: 'pub', why: 'Precisa de IP público para traduzir as conexões de saída das máquinas privadas (atualizações, APIs externas).' },
      { id: 'bastion', label: 'Bastion host (acesso SSH de administração)', bucket: 'pub', why: 'Ponto único e vigiado para os administradores entrarem e saltarem para as máquinas privadas.' },
      { id: 'app', label: 'Servidores da aplicação', bucket: 'priv', why: 'Só o balanceador fala com eles: ninguém da internet precisa alcançá-los diretamente.' },
      { id: 'db', label: 'Banco de dados PostgreSQL', bucket: 'priv', why: 'Dados dos clientes: o recurso mais protegido, só a aplicação acessa.' },
      { id: 'cache', label: 'Cache Redis', bucket: 'priv', why: 'Usado só pela aplicação. Redis exposto na internet é uma causa clássica de vazamentos.' },
    ],
    hint: 'Algum cliente da loja precisa se conectar direto no banco de dados? E quem as máquinas privadas usam para sair para a internet?',
    debrief:
      'Esse desenho em duas camadas é o padrão na nuvem: a internet só alcança o balanceador; aplicação, banco e cache ficam escondidos. As máquinas privadas saem para a internet pelo NAT gateway, mas ninguém de fora inicia conexão com elas.',
    module: { slug: 'nat-e-pat', title: 'NAT e PAT' },
  },
  {
    id: 'deploy-fora-do-ar',
    area: 'cloud',
    kind: 'diagnose',
    title: 'Deploy feito, site fora do ar',
    ticket: {
      from: 'Monitoramento do balanceador',
      priority: 'Crítica',
      message: 'Após o deploy das 14h, o health check marca o servidor app-02 como "unhealthy". O balanceador testa http://10.0.2.15:8080/health.',
    },
    prompt: 'deploy@app-02:~$',
    minCommands: 3,
    commands: [
      { cmd: 'systemctl status loja-api', output: `● loja-api.service - API da loja virtual
     Active: active (running) since Fri 2026-10-23 14:02:11 -03; 9min ago
   Main PID: 1290 (node)` },
      { cmd: 'curl http://localhost:8080/health', output: `{"status":"ok","version":"2.4.0"}` },
      { cmd: 'curl http://10.0.2.15:8080/health', output: `curl: (7) Failed to connect to 10.0.2.15 port 8080 after 0 ms: Connection refused` },
      { cmd: 'ss -tlnp | grep 8080', output: `LISTEN 0  511  127.0.0.1:8080  0.0.0.0:*  users:(("node",pid=1290,fd=21))` },
    ],
    question: 'Por que o balanceador não consegue falar com a aplicação?',
    options: [
      {
        text: 'A aplicação está escutando só em 127.0.0.1; precisa escutar em 0.0.0.0 (ou no IP 10.0.2.15).',
        correct: true,
        feedback: 'Isso! O socket está preso à interface de loopback: só o próprio servidor consegue conectar.',
      },
      {
        text: 'A aplicação travou depois do deploy.',
        feedback: 'O serviço está "active (running)" e responde ao curl em localhost. Ela está viva.',
      },
      {
        text: 'O firewall está bloqueando a porta 8080.',
        feedback: '"Connection refused" significa que ninguém está escutando naquele IP e porta. Bloqueio de firewall geralmente dá timeout.',
      },
      {
        text: 'O DNS do balanceador está errado.',
        feedback: 'O health check usa o IP 10.0.2.15 direto, sem DNS. E o curl para esse IP falha até de dentro do próprio servidor.',
      },
    ],
    hint: 'Compare o curl para localhost com o curl para 10.0.2.15. Depois veja em qual endereço o processo node está escutando.',
    debrief:
      'Um socket TCP é IP + porta. Escutar em 127.0.0.1:8080 aceita só conexões locais; 0.0.0.0:8080 aceita em todas as interfaces. A nova versão mudou o padrão para localhost. A correção é configurar HOST=0.0.0.0 e reiniciar o serviço.',
    module: { slug: 'tcp-udp', title: 'TCP e UDP' },
  },
  {
    id: 'alertas-http',
    area: 'cloud',
    kind: 'classify',
    title: 'Triagem dos alertas HTTP',
    ticket: {
      from: 'Plantão de DevOps',
      priority: 'Alta',
      message: 'O painel de monitoramento disparou vários eventos. Separe cada um pela família do código HTTP que ele gera, para sabermos quem acionar.',
    },
    instruction: 'Os códigos estão escondidos: leia a situação e coloque cada evento na família de status HTTP que ele gera.',
    buckets: [
      { id: 's2', label: '2xx — Sucesso', description: 'Tudo certo' },
      { id: 's3', label: '3xx — Redirecionamento', description: 'O recurso está em outro lugar' },
      { id: 's4', label: '4xx — Erro do cliente', description: 'Problema na requisição' },
      { id: 's5', label: '5xx — Erro do servidor', description: 'Acionar o plantão' },
    ],
    items: [
      { id: 'health', label: 'O health check pediu /health e recebeu a resposta normalmente', bucket: 's2', why: '200 OK.' },
      { id: 'cadastro', label: 'Um cliente novo foi cadastrado pela API', bucket: 's2', why: '201 Created: um recurso novo foi criado.' },
      { id: 'https', label: 'Alguém digitou http:// e foi levado para https://', bucket: 's3', why: '301 Moved Permanently: o endereço definitivo é o HTTPS.' },
      { id: 'rota', label: 'Um link antigo aponta para uma página que não existe mais', bucket: 's4', why: '404 Not Found: o cliente pediu algo inexistente.' },
      { id: 'token', label: 'O app mobile chamou a API sem enviar o token de login', bucket: 's4', why: '401 Unauthorized: falta autenticação na requisição.' },
      { id: 'excecao', label: 'Uma exceção não tratada no código derrubou a requisição', bucket: 's5', why: '500 Internal Server Error: a falha é do servidor.' },
      { id: 'semapp', label: 'Todas as instâncias saíram do balanceador e ninguém pode responder', bucket: 's5', why: '503 Service Unavailable (ou 502): o serviço está indisponível.' },
    ],
    hint: 'Pergunte: a requisição deu certo? O recurso mudou de endereço? Quem errou foi quem pediu ou quem deveria responder?',
    debrief:
      'Monitorar a taxa de 5xx é uma das métricas mais importantes em produção: erros do servidor são responsabilidade do time e acionam o plantão. Muitos 4xx podem indicar um link quebrado ou um app desatualizado.',
    module: { slug: 'http-https', title: 'HTTP e HTTPS' },
  },

  // ======================= NOC =======================
  {
    id: 'filial-lenta',
    area: 'noc',
    kind: 'diagnose',
    title: 'A filial está lenta',
    ticket: {
      from: 'Filial Blumenau',
      priority: 'Alta',
      message: 'O ERP está muito lento desde as 10h, às vezes nem carrega. O ERP fica na matriz (10.20.0.10).',
    },
    prompt: 'C:\\noc-blumenau>',
    minCommands: 2,
    commands: [
      {
        cmd: 'ping 192.168.30.1',
        output: `Resposta de 192.168.30.1: bytes=32 tempo<1ms TTL=255
Resposta de 192.168.30.1: bytes=32 tempo<1ms TTL=255
Resposta de 192.168.30.1: bytes=32 tempo<1ms TTL=255
Resposta de 192.168.30.1: bytes=32 tempo<1ms TTL=255`,
      },
      {
        cmd: 'ping 10.20.0.10',
        output: `Resposta de 10.20.0.10: bytes=32 tempo=287ms TTL=59
Esgotado o tempo limite do pedido.
Resposta de 10.20.0.10: bytes=32 tempo=214ms TTL=59
Resposta de 10.20.0.10: bytes=32 tempo=331ms TTL=59

Pacotes: Enviados = 4, Recebidos = 3, Perdidos = 1 (25% de perda)`,
      },
      {
        cmd: 'tracert 10.20.0.10',
        output: `Rastreando a rota para 10.20.0.10 com no máximo 30 saltos

  1    <1 ms    <1 ms    <1 ms  192.168.30.1   [roteador da filial]
  2     3 ms     3 ms     2 ms  100.64.12.1    [operadora - borda]
  3     4 ms     5 ms     4 ms  100.64.0.9     [operadora]
  4   241 ms   198 ms      *    100.64.0.33    [operadora]
  5   236 ms   212 ms   250 ms  10.20.0.1      [roteador da matriz]
  6   244 ms   219 ms   262 ms  10.20.0.10     [servidor ERP]

Rastreamento concluído.`,
      },
    ],
    question: 'Onde está o problema e o que fazer?',
    options: [
      {
        text: 'No link da operadora a partir do salto 4: abrir chamado com a operadora enviando o traceroute.',
        correct: true,
        feedback: 'Exato! A latência salta de 4 ms para mais de 200 ms no salto 4 e continua alta até o destino.',
      },
      {
        text: 'O servidor ERP está sobrecarregado.',
        feedback: 'A lentidão aparece antes de chegar na matriz (salto 4). O servidor só herda o atraso do caminho.',
      },
      {
        text: 'O cabo de rede da filial está com defeito.',
        feedback: 'O gateway da filial responde em menos de 1 ms, sem perda. A rede local está ótima.',
      },
      {
        text: 'O DNS da filial está lento.',
        feedback: 'Todos os testes usam IP direto, sem DNS, e mesmo assim estão lentos.',
      },
    ],
    hint: 'No traceroute, procure o primeiro salto em que o tempo dispara — e se ele continua alto daí em diante.',
    debrief:
      'O traceroute mostra a latência salto a salto (usando o TTL e mensagens ICMP Time Exceeded). Se o tempo sobe num salto e permanece alto até o destino, o gargalo está ali. Evidência em mãos agiliza muito o chamado com a operadora.',
    module: { slug: 'icmp', title: 'ICMP' },
  },
  {
    id: 'vpn-filial',
    area: 'noc',
    kind: 'config',
    title: 'Conecte a filial por VPN',
    ticket: {
      from: 'Ricardo — Gerente de Infraestrutura',
      priority: 'Média',
      message: 'O roteador da filial Itajaí veio de fábrica com a LAN 10.10.5.0/24, mas a matriz já usa 10.10.0.0/16. A VPN não sobe assim. Pode readequar e configurar o túnel?',
    },
    context: [
      { label: 'LAN da matriz', value: '10.10.0.0/16' },
      { label: 'LAN atual da filial', value: '10.10.5.0/24 (conflitante)' },
      { label: 'Padrão da empresa', value: 'Filiais usam uma /24 privada, gateway no primeiro IP' },
    ],
    instruction: 'Escolha uma nova rede /24 para a filial e configure o túnel do lado da filial.',
    fields: [
      { id: 'lan', label: 'Nova rede da filial (endereço de rede)', placeholder: 'ex.: 10.x.x.0', prefix: '/24' },
      { id: 'gateway', label: 'Gateway da LAN da filial', placeholder: 'primeiro IP da rede' },
      { id: 'remoteNet', label: 'Rede remota no túnel (endereço de rede da matriz)', placeholder: '10.?.?.?' },
      { id: 'remotePrefix', label: 'Máscara da rede remota', placeholder: '/?' },
    ],
    validate: (v) => {
      const errors: string[] = [];
      const lan = ip(v.lan);
      const matriz = ip('10.10.0.0')!;
      if (lan === null) errors.push('A nova rede da filial não é um endereço válido.');
      else {
        if (networkOf(lan, 24) !== lan) errors.push(`${v.lan} não é um endereço de rede /24: ele deve terminar em .0.`);
        if (!isPrivate(lan)) errors.push('Use uma faixa privada (10.0.0.0/8, 172.16.0.0/12 ou 192.168.0.0/16).');
        if (networkOf(lan, 16) === matriz) errors.push('Essa rede está dentro de 10.10.0.0/16, a mesma da matriz: o conflito continua.');
        if (!sameIp(v.gateway, formatIpv4(networkOf(lan, 24) + 1))) errors.push(`O gateway deve ser o primeiro IP utilizável da rede (${formatIpv4(networkOf(lan, 24) + 1)}).`);
      }
      if (!sameIp(v.remoteNet, '10.10.0.0')) errors.push('A rede remota é a LAN da matriz, que o túnel deve alcançar.');
      if (parsePrefix(v.remotePrefix ?? '') !== 16) errors.push('A máscara da rede da matriz é /16 (255.255.0.0).');
      return errors;
    },
    solution: { lan: '10.30.5.0', gateway: '10.30.5.1', remoteNet: '10.10.0.0', remotePrefix: '/16' },
    hint: 'Qualquer rede que comece com 10.10. está dentro da matriz. Tente, por exemplo, 10.30.5.0. A rede remota é a da matriz, com a máscara dela.',
    debrief:
      'Uma VPN site-a-site roteia tráfego entre duas LANs: se elas se sobrepõem, o roteador não sabe se 10.10.5.20 está "aqui" ou "do outro lado". Por isso um plano de endereçamento único para matriz e filiais é essencial antes de interligá-las.',
    module: { slug: 'vpn', title: 'VPN' },
  },
  {
    id: 'incidente-final',
    area: 'noc',
    kind: 'sequence',
    title: 'Desafio final: método de diagnóstico',
    ticket: {
      from: 'Diretoria de TI',
      priority: 'Crítica',
      message: 'Para a sua promoção a especialista: documente o método que a equipe deve seguir quando "a rede não funciona", do mais básico ao mais complexo.',
    },
    instruction: 'Ordene as verificações de baixo para cima no modelo OSI: do físico até a aplicação.',
    steps: [
      { id: 'l1', text: 'Conferir cabo, LED do link e se a interface está "up" (camada física).' },
      { id: 'l2', text: 'Verificar se o switch aprendeu o MAC e se a porta está na VLAN certa (enlace).' },
      { id: 'l3a', text: 'Conferir IP, máscara e gateway, e pingar o gateway (rede local).' },
      { id: 'l3b', text: 'Pingar um IP externo e rodar um traceroute (roteamento).' },
      { id: 'dns', text: 'Testar a resolução de nomes com nslookup (DNS).' },
      { id: 'app', text: 'Testar a porta e a aplicação: curl, conexão na porta do serviço e logs (transporte e aplicação).' },
    ],
    hint: 'Não adianta testar o DNS se o cabo está desconectado. Comece pelo que não depende de nada.',
    debrief:
      'Diagnosticar de baixo para cima evita perder tempo: cada camada só funciona se as de baixo funcionam. Você usou esse método em todas as fases do jogo — parabéns pela promoção!',
    module: { slug: 'modelo-osi', title: 'Modelo OSI' },
  },
];

export function levelIndex(id: string) {
  return LEVELS.findIndex((level) => level.id === id);
}

/** Embaralha de forma determinística (mesmo resultado no servidor e no navegador). */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let state = 0;
  for (const char of seed) state = (state * 31 + char.charCodeAt(0)) >>> 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  // Garante que a ordem inicial nunca seja a resposta correta.
  if (result.every((item, index) => item === items[index]) && result.length > 1) result.push(result.shift()!);
  return result;
}
