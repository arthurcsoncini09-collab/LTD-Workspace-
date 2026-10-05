import type { ModuleSeed } from '../types';

export const router: ModuleSeed = {
  slug: 'router',
  title: 'Módulo 15 — Router',
  stage: 'Avançado',
  description: 'Roteamento em camada 3: tabela de rotas, longest prefix match, distância administrativa, rotas estáticas, protocolos dinâmicos e inter-VLAN.',
  accent: 'from-indigo-500 to-purple-500',
  objective: 'Entender como o roteador decide o caminho de cada pacote, configurar rotas estáticas e reconhecer os principais protocolos de roteamento dinâmico.',
  summary: 'O roteador interliga redes diferentes. Para cada pacote, ele consulta a tabela de rotas, escolhe a rota mais específica e encaminha ao próximo salto.',
  lessons: [
    {
      slug: 'tabela-de-roteamento',
      title: 'Tabela de roteamento e decisão de encaminhamento',
      introduction: 'O roteador opera na camada 3. Ao receber um pacote, ele lê o IP de destino, procura a melhor correspondência na tabela de roteamento e encaminha o pacote pela interface correspondente, rumo ao próximo salto (next hop).',
      why_it_matters: 'Toda comunicação entre redes — da sua casa para a Internet, entre filiais, entre VLANs — depende de roteamento correto. Uma rota faltando ou errada isola redes inteiras.',
      real_world: 'O roteador de casa tem uma tabela simples: a rede local diretamente conectada e uma rota padrão (0.0.0.0/0) apontando para o provedor. Roteadores da Internet têm mais de 900 mil rotas IPv4.',
      explanation: 'A tabela tem três origens de rotas: redes diretamente conectadas (as interfaces), rotas estáticas (configuradas manualmente) e rotas dinâmicas (aprendidas via protocolos como OSPF). Quando várias rotas servem para o destino, vence a mais específica (maior prefixo).',
      exercise: 'O roteador tem rotas para 10.0.0.0/8 e 10.1.1.0/24. Por qual rota um pacote para 10.1.1.50 será enviado?',
      exercise_answer: 'Pela rota 10.1.1.0/24, por ser mais específica (longest prefix match: /24 é mais longo que /8).',
      challenge: 'Interprete cada linha de uma saída de "show ip route" e identifique a rota padrão, as conectadas e as estáticas.',
      keywords: ['roteador', 'tabela de rotas', 'next hop', 'longest prefix match', 'distância administrativa', 'métrica', 'gateway'],
      sections: [
        {
          title: 'Lendo a tabela de rotas',
          code: 'R1# show ip route\nCodes: C - connected, L - local, S - static, O - OSPF, * - candidate default\n\nGateway of last resort is 203.0.113.1 to network 0.0.0.0\n\nS*    0.0.0.0/0 [1/0] via 203.0.113.1\nC     192.168.10.0/24 is directly connected, GigabitEthernet0/0\nL     192.168.10.1/32 is directly connected, GigabitEthernet0/0\nO     10.2.0.0/16 [110/20] via 10.0.0.2, 00:12:44, GigabitEthernet0/1\nS     172.16.0.0/16 [1/0] via 10.0.0.6',
          content: 'Entre colchetes: [distância administrativa / métrica].',
        },
        {
          title: 'Ordem de decisão',
          steps: [
            'Longest prefix match: a rota com o maior prefixo que contém o destino vence.',
            'Para o mesmo prefixo vindo de fontes diferentes, vence a menor distância administrativa (AD).',
            'Para o mesmo prefixo e a mesma fonte, vence a menor métrica.',
            'Empate na métrica: balanceamento de carga entre os caminhos (ECMP).',
          ],
        },
        {
          title: 'Distância administrativa (Cisco)',
          table: {
            headers: ['Origem da rota', 'AD'],
            rows: [
              ['Diretamente conectada', '0'],
              ['Estática', '1'],
              ['eBGP', '20'],
              ['EIGRP (interno)', '90'],
              ['OSPF', '110'],
              ['IS-IS', '115'],
              ['RIP', '120'],
              ['iBGP', '200'],
            ],
          },
        },
      ],
    },
    {
      slug: 'roteamento-estatico-e-dinamico',
      title: 'Roteamento estático, dinâmico e inter-VLAN',
      introduction: 'Rotas podem ser configuradas à mão (estáticas) ou aprendidas automaticamente por protocolos de roteamento dinâmico, que trocam informações entre roteadores e se adaptam a falhas.',
      why_it_matters: 'Redes pequenas funcionam bem com rotas estáticas; redes médias e grandes precisam de protocolos dinâmicos para escalar e se recuperar sozinhas. E VLANs só conversam entre si com roteamento.',
      real_world: 'Uma empresa com matriz e 20 filiais usa OSPF internamente; na borda, troca rotas com dois provedores usando BGP para ter redundância de Internet.',
      explanation: 'Protocolos de vetor de distância (RIP) trocam tabelas com vizinhos e usam contagem de saltos. Protocolos de estado de enlace (OSPF, IS-IS) montam um mapa completo da topologia e calculam o menor caminho com o algoritmo de Dijkstra. O BGP é o protocolo que interliga os sistemas autônomos da Internet.',
      exercise: 'Escreva o comando Cisco de uma rota padrão apontando para 203.0.113.1.',
      exercise_answer: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1',
      challenge: 'Configure dois roteadores com redes LAN diferentes e faça os PCs se comunicarem usando apenas rotas estáticas.',
      keywords: ['rota estática', 'rota padrão', 'RIP', 'OSPF', 'EIGRP', 'BGP', 'router-on-a-stick', 'SVI'],
      sections: [
        {
          title: 'Rotas estáticas',
          code: '! rede remota via próximo salto\nip route 172.16.0.0 255.255.0.0 10.0.0.6\n! rota padrão (gateway of last resort)\nip route 0.0.0.0 0.0.0.0 203.0.113.1\n! rota flutuante de backup (AD 10, só entra se a principal cair)\nip route 0.0.0.0 0.0.0.0 198.51.100.1 10',
        },
        {
          title: 'Protocolos dinâmicos',
          table: {
            headers: ['Protocolo', 'Tipo', 'Métrica', 'Uso típico'],
            rows: [
              ['RIP v2', 'Vetor de distância', 'Saltos (máx. 15)', 'Laboratórios, redes muito pequenas'],
              ['OSPF', 'Estado de enlace', 'Custo (baseado na banda)', 'Redes corporativas (padrão aberto)'],
              ['EIGRP', 'Vetor de distância avançado', 'Banda e atraso', 'Redes Cisco'],
              ['IS-IS', 'Estado de enlace', 'Custo', 'Provedores'],
              ['BGP', 'Vetor de caminho', 'Atributos (AS-PATH, etc.)', 'Internet, entre sistemas autônomos'],
            ],
          },
        },
        {
          title: 'OSPF básico',
          code: 'router ospf 1\n router-id 1.1.1.1\n network 192.168.10.0 0.0.0.255 area 0\n network 10.0.0.0 0.0.0.3 area 0\n passive-interface g0/0',
          content: 'A máscara do comando network é uma wildcard (inverso da máscara). passive-interface evita enviar mensagens OSPF para a LAN de usuários.',
        },
        {
          title: 'Roteamento entre VLANs (router-on-a-stick)',
          code: 'interface g0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\ninterface g0/0.20\n encapsulation dot1Q 20\n ip address 192.168.20.1 255.255.255.0\ninterface g0/0\n no shutdown',
          content: 'Uma única interface física, ligada a uma porta trunk do switch, com uma subinterface por VLAN. Em redes maiores, usa-se um switch L3 com SVIs.',
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Em qual camada o roteador opera principalmente?',
      options: ['Camada 1', 'Camada 2', 'Camada 3', 'Camada 7'],
      answer: 'Camada 3',
      explanation: 'O roteador encaminha pacotes com base no endereço IP (camada de Rede).',
    },
    {
      question: 'Com rotas para 10.0.0.0/8, 10.1.0.0/16 e 10.1.1.0/24, qual é usada para o destino 10.1.1.9?',
      options: ['10.0.0.0/8', '10.1.0.0/16', '10.1.1.0/24', 'A rota padrão'],
      answer: '10.1.1.0/24',
      explanation: 'Longest prefix match: a rota mais específica vence.',
    },
    {
      question: 'Qual a distância administrativa padrão de uma rota estática?',
      options: ['0', '1', '110', '120'],
      answer: '1',
      explanation: 'Conectada = 0, estática = 1, OSPF = 110, RIP = 120.',
    },
    {
      question: 'Qual comando cria uma rota padrão no Cisco IOS?',
      options: ['ip route default 203.0.113.1', 'ip route 0.0.0.0 0.0.0.0 203.0.113.1', 'ip default-route 203.0.113.1', 'route add 0.0.0.0'],
      answer: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1',
      explanation: 'A rede 0.0.0.0/0 casa com qualquer destino.',
    },
    {
      question: 'Qual protocolo interliga os sistemas autônomos da Internet?',
      options: ['OSPF', 'RIP', 'BGP', 'EIGRP'],
      answer: 'BGP',
      explanation: 'O BGP é o protocolo de roteamento entre domínios da Internet.',
    },
    {
      question: 'OSPF é um protocolo do tipo:',
      options: ['Vetor de distância', 'Estado de enlace', 'Vetor de caminho', 'Estático'],
      answer: 'Estado de enlace',
      explanation: 'O OSPF monta um mapa da topologia e calcula o menor caminho com Dijkstra (SPF).',
    },
  ],
  details: {
    objectives: [
      'Interpretar a tabela de roteamento.',
      'Aplicar longest prefix match, distância administrativa e métrica.',
      'Configurar rotas estáticas, padrão e flutuantes.',
      'Comparar RIP, OSPF, EIGRP e BGP.',
      'Configurar roteamento entre VLANs.',
    ],
    keyPoints: [
      'Roteador = camada 3; separa domínios de broadcast.',
      'Decisão: maior prefixo → menor AD → menor métrica.',
      'Rota padrão 0.0.0.0/0 = gateway of last resort.',
      'OSPF é o IGP aberto mais usado; BGP move a Internet.',
      'Inter-VLAN: router-on-a-stick ou switch L3.',
    ],
    commands: [
      { title: 'Verificação no roteador', platform: 'Cisco IOS', code: 'show ip route\nshow ip interface brief\nshow ip protocols\nshow ip ospf neighbor' },
      { title: 'Tabela de rotas do computador', platform: 'Windows', code: 'route print\nroute add 10.50.0.0 mask 255.255.0.0 192.168.1.254' },
      { title: 'Tabela de rotas do computador', platform: 'Linux/macOS', code: 'ip route                           # Linux\nsudo ip route add 10.50.0.0/16 via 192.168.1.254\nnetstat -rn                        # macOS' },
    ],
    pitfalls: [
      { problem: 'Rota de ida configurada, mas sem rota de volta.', solution: 'A comunicação é bidirecional: o roteador remoto também precisa saber voltar.' },
      { problem: 'Interface com IP configurado, mas sem tráfego.', solution: 'Interfaces de roteador Cisco vêm em shutdown; use no shutdown.' },
      { problem: 'Confundir máscara com wildcard no OSPF.', solution: 'Wildcard = 255.255.255.255 − máscara (ex.: /24 → 0.0.0.255).' },
    ],
    security: [
      'Autentique protocolos de roteamento (ex.: OSPF com autenticação SHA) para evitar injeção de rotas.',
      'Use passive-interface nas interfaces de usuários.',
      'Filtre na borda rotas e prefixos inválidos (bogons) e implemente RPKI no BGP.',
      'Restrinja a gerência do roteador a uma rede de administração e use SSH.',
    ],
    lab: {
      title: 'Roteamento estático e OSPF',
      goal: 'Conectar três redes com rotas estáticas e depois migrar para OSPF.',
      tools: 'Cisco Packet Tracer.',
      steps: [
        'Monte R1–R2–R3 em linha, com uma LAN em cada roteador e links /30 entre eles.',
        'Configure rotas estáticas até todos os PCs se pingarem.',
        'Remova as estáticas e configure OSPF área 0 em todos os roteadores.',
        'Derrube um link (adicione um link R1–R3 antes) e observe a reconvergência com show ip route.',
      ],
      expected: 'Conectividade total com estáticas e com OSPF, com troca automática de caminho na falha.',
    },
    references: ['RFC 2328 — OSPF Version 2', 'RFC 4271 — BGP-4', 'RFC 2453 — RIP Version 2', 'Cisco CCNA ENSA — Enterprise Networking, Security and Automation'],
  },
};
