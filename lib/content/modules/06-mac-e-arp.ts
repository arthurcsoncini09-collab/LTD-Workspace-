import type { ModuleSeed } from '../types';

export const macEArp: ModuleSeed = {
  slug: 'mac-e-arp',
  title: 'Módulo 6 — MAC e ARP',
  stage: 'Intermediário',
  description: 'Endereço MAC, quadro Ethernet, o funcionamento do ARP, tabela ARP e ataques de ARP spoofing.',
  accent: 'from-emerald-500 to-teal-400',
  objective: 'Entender o endereçamento de camada 2, como o ARP liga endereços IP a endereços MAC e como proteger a rede contra ARP spoofing.',
  summary: 'O IP diz para qual host vai o pacote; o MAC diz para qual placa de rede vai o quadro no enlace local. O ARP faz a ponte entre os dois descobrindo o MAC a partir do IP.',
  lessons: [
    {
      slug: 'camadas-de-enlace',
      title: 'Endereço MAC e quadro Ethernet',
      introduction: 'O endereço MAC (Media Access Control) identifica uma interface de rede na camada 2. Tem 48 bits, escritos em hexadecimal, como 00:1A:2B:3C:4D:5E ou 001a.2b3c.4d5e (formato Cisco).',
      why_it_matters: 'Dentro de uma LAN, os quadros são entregues pelo MAC, não pelo IP. Switches, Wi-Fi e filtros de acesso dependem dele.',
      real_world: 'Ao conectar o notebook no Wi-Fi da empresa, o access point registra o MAC do seu dispositivo. Sistemas operacionais modernos usam MACs aleatórios por rede para preservar privacidade.',
      explanation: 'Os primeiros 24 bits do MAC formam o OUI (Organizationally Unique Identifier), atribuído pelo IEEE ao fabricante. Os 24 bits seguintes são definidos pelo fabricante para cada placa.',
      exercise: 'Qual é o endereço MAC de broadcast?',
      exercise_answer: 'FF:FF:FF:FF:FF:FF — todos os 48 bits em 1. Um quadro com esse destino é entregue a todos os hosts do domínio de broadcast.',
      challenge: 'Descubra o MAC da sua placa de rede e procure o fabricante pelo OUI (primeiros 3 bytes) em um site de consulta de OUI.',
      keywords: ['MAC', 'OUI', 'Ethernet', 'quadro', 'FCS', 'broadcast'],
      sections: [
        {
          title: 'Estrutura do endereço MAC',
          code: '  00 : 1A : 2B  |  3C : 4D : 5E\n  └── OUI ───┘     └ identificador da placa ┘\n   (fabricante)        (definido pelo fabricante)',
          items: [
            'Unicast: o bit menos significativo do primeiro byte é 0.',
            'Multicast: esse bit é 1 (ex.: 01:00:5E:xx:xx:xx para multicast IPv4).',
            'Broadcast: FF:FF:FF:FF:FF:FF.',
            'Endereços "localmente administrados" (2º bit do 1º byte = 1) são usados em MACs aleatórios e VMs.',
          ],
        },
        {
          title: 'Quadro Ethernet II',
          table: {
            headers: ['Campo', 'Tamanho', 'Função'],
            rows: [
              ['Preâmbulo + SFD', '8 bytes', 'Sincronização (tratado pelo hardware)'],
              ['MAC de destino', '6 bytes', 'Para quem vai o quadro'],
              ['MAC de origem', '6 bytes', 'Quem enviou'],
              ['EtherType', '2 bytes', 'Protocolo carregado: 0x0800 = IPv4, 0x0806 = ARP, 0x86DD = IPv6'],
              ['Dados (payload)', '46 – 1500 bytes', 'Pacote da camada 3'],
              ['FCS', '4 bytes', 'CRC para detectar erros'],
            ],
          },
        },
        {
          title: 'MAC × IP',
          table: {
            headers: ['Característica', 'MAC', 'IP'],
            rows: [
              ['Camada', '2 — Enlace', '3 — Rede'],
              ['Tamanho', '48 bits', '32 bits (IPv4) / 128 bits (IPv6)'],
              ['Alcance', 'Enlace local', 'Fim a fim, entre redes'],
              ['Atribuição', 'Gravado pelo fabricante (pode ser alterado)', 'Configurado manualmente ou via DHCP'],
              ['Analogia', 'CPF da pessoa', 'Endereço da casa'],
            ],
          },
        },
      ],
    },
    {
      slug: 'arp-e-mac',
      title: 'Como o ARP funciona',
      introduction: 'O ARP (Address Resolution Protocol, RFC 826) descobre qual MAC corresponde a um IP na rede local. Sem ele, o host saberia o IP de destino, mas não conseguiria montar o quadro Ethernet.',
      why_it_matters: 'Todo pacote IPv4 enviado em uma rede Ethernet ou Wi-Fi depende do ARP. Problemas de ARP causam falhas intermitentes, conflitos de IP e são porta de entrada para ataques man-in-the-middle.',
      real_world: 'Quando um computador da rede quer acessar a Internet, ele faz ARP do gateway (ex.: 192.168.1.1), guarda o MAC na tabela ARP e passa a enviar todos os quadros para fora da rede para esse MAC.',
      explanation: 'O host pergunta em broadcast: "Quem tem 192.168.1.1? Responda para 192.168.1.10". Somente o dono do IP responde em unicast: "192.168.1.1 está em 00:1a:2b:3c:4d:5e". A resposta é guardada em cache por alguns minutos.',
      exercise: 'O ARP Request é enviado em broadcast ou unicast? E o ARP Reply?',
      exercise_answer: 'O Request é broadcast (destino FF:FF:FF:FF:FF:FF), pois o MAC ainda é desconhecido. O Reply é unicast, direto para quem perguntou.',
      challenge: 'Se o PC 192.168.1.10/24 quer falar com 8.8.8.8, de qual IP ele pede o MAC via ARP? Justifique.',
      keywords: ['ARP', 'request', 'reply', 'tabela ARP', 'cache', 'gratuitous ARP', 'spoofing'],
      sections: [
        {
          title: 'Processo ARP passo a passo',
          steps: [
            'O host verifica se o destino está na mesma sub-rede (usando a máscara).',
            'Se estiver, procura o IP do destino na tabela ARP; se não estiver, procura o IP do gateway.',
            'Se não houver entrada, envia um ARP Request em broadcast.',
            'O dono do IP responde com um ARP Reply em unicast contendo seu MAC.',
            'O host grava a associação IP ↔ MAC no cache e envia o quadro.',
          ],
        },
        {
          title: 'Variações do ARP',
          items: [
            'ARP gratuito (gratuitous ARP): o host anuncia o próprio IP/MAC sem ninguém perguntar — usado para detectar conflito de IP e atualizar caches após failover.',
            'Proxy ARP: o roteador responde ARP em nome de hosts de outra rede.',
            'RARP: protocolo antigo (MAC → IP), substituído por BOOTP e DHCP.',
            'No IPv6, o ARP é substituído pelo NDP (Neighbor Discovery Protocol), usando mensagens ICMPv6.',
          ],
        },
        {
          title: 'ARP spoofing (envenenamento de ARP)',
          content: 'Como o ARP não tem autenticação, um atacante pode enviar respostas ARP falsas dizendo "o gateway sou eu". As vítimas passam a mandar o tráfego para o atacante, que pode espionar ou alterar os dados (man-in-the-middle).',
          items: [
            'Defesa: Dynamic ARP Inspection (DAI) nos switches, validando ARP contra a tabela do DHCP snooping.',
            'Entradas ARP estáticas para equipamentos críticos.',
            'Segmentação em VLANs e uso de criptografia fim a fim (HTTPS, SSH, VPN).',
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Quantos bits tem um endereço MAC?',
      options: ['32', '48', '64', '128'],
      answer: '48',
      explanation: 'O MAC tem 48 bits (6 bytes), escritos em 12 dígitos hexadecimais.',
    },
    {
      question: 'Qual é a função principal do ARP?',
      options: ['Traduzir nome em IP', 'Descobrir o MAC a partir de um IP', 'Atribuir IPs automaticamente', 'Criptografar quadros'],
      answer: 'Descobrir o MAC a partir de um IP',
      explanation: 'O ARP resolve endereços IPv4 em endereços MAC na rede local.',
    },
    {
      question: 'Para qual endereço MAC é enviado um ARP Request?',
      options: ['00:00:00:00:00:00', 'FF:FF:FF:FF:FF:FF', 'MAC do gateway', '01:00:5E:00:00:01'],
      answer: 'FF:FF:FF:FF:FF:FF',
      explanation: 'O Request é broadcast porque o MAC do destino ainda é desconhecido.',
    },
    {
      question: 'Os primeiros 24 bits de um MAC identificam:',
      options: ['A VLAN', 'O fabricante (OUI)', 'A sub-rede', 'A porta do switch'],
      answer: 'O fabricante (OUI)',
      explanation: 'O OUI é atribuído pelo IEEE a cada fabricante.',
    },
    {
      question: 'Um PC quer enviar um pacote para um servidor em outra rede. Ele faz ARP para descobrir o MAC de:',
      options: ['O servidor de destino', 'O servidor DNS', 'O gateway padrão', 'Todos os hosts'],
      answer: 'O gateway padrão',
      explanation: 'Fora da sub-rede, o quadro vai para o gateway; o MAC do servidor remoto nunca é necessário.',
    },
    {
      question: 'Qual recurso de switch mitiga ataques de ARP spoofing?',
      options: ['PortFast', 'Dynamic ARP Inspection', 'Trunking', 'EtherChannel'],
      answer: 'Dynamic ARP Inspection',
      explanation: 'O DAI descarta mensagens ARP cujas associações IP/MAC não batem com a base do DHCP snooping.',
    },
  ],
  details: {
    objectives: [
      'Descrever a estrutura do endereço MAC e do quadro Ethernet.',
      'Explicar o processo de ARP Request e ARP Reply.',
      'Interpretar a tabela ARP de um host.',
      'Reconhecer o ARP spoofing e aplicar contramedidas.',
    ],
    keyPoints: [
      'MAC = 48 bits; OUI identifica o fabricante.',
      'ARP: Request em broadcast, Reply em unicast.',
      'Para destinos fora da sub-rede, o ARP é feito para o gateway.',
      'ARP não tem autenticação → vulnerável a spoofing.',
      'IPv6 usa NDP no lugar do ARP.',
    ],
    commands: [
      { title: 'Ver e limpar a tabela ARP', platform: 'Windows', code: 'arp -a\narp -d *          # limpa o cache (requer administrador)' },
      { title: 'Ver a tabela de vizinhos', platform: 'Linux/macOS', code: 'ip neigh show     # Linux\narp -a            # macOS' },
      { title: 'Tabela ARP e tabela MAC no equipamento', platform: 'Cisco IOS', code: 'show ip arp\nshow mac address-table' },
    ],
    pitfalls: [
      { problem: 'Achar que o MAC do servidor remoto aparece na sua tabela ARP.', solution: 'Só aparecem MACs de hosts da mesma rede local, incluindo o gateway.' },
      { problem: 'Conflito de IP causando quedas intermitentes.', solution: 'Verifique o ARP: dois MACs respondendo pelo mesmo IP indicam conflito.' },
      { problem: 'Trocar uma placa de rede e o tráfego não voltar imediatamente.', solution: 'O cache ARP de outros hosts ainda tem o MAC antigo; aguarde a expiração ou limpe o cache.' },
    ],
    security: [
      'ARP spoofing permite interceptar tráfego na LAN: habilite DHCP snooping + Dynamic ARP Inspection.',
      'Port security limita quantos MACs podem aprender em cada porta do switch.',
      'MAC filtering no Wi-Fi não é segurança real: MACs são facilmente falsificados.',
    ],
    lab: {
      title: 'Observando o ARP em ação',
      goal: 'Ver um ARP Request e um ARP Reply reais.',
      tools: 'Wireshark e terminal.',
      steps: [
        'Limpe o cache ARP (arp -d * no Windows ou ip neigh flush all no Linux, como administrador).',
        'Inicie o Wireshark com o filtro "arp".',
        'Faça ping no gateway.',
        'Identifique o Request (broadcast) e o Reply (unicast); confira o MAC na tabela com arp -a.',
      ],
      expected: 'Um ARP Request para FF:FF:FF:FF:FF:FF seguido de um Reply unicast do gateway.',
    },
    references: ['RFC 826 — An Ethernet Address Resolution Protocol', 'IEEE 802.3 — Ethernet', 'RFC 4861 — Neighbor Discovery for IPv6'],
  },
};
