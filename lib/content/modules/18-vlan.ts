import type { ModuleSeed } from '../types';

export const vlan: ModuleSeed = {
  slug: 'vlan',
  title: 'Módulo 18 — VLAN',
  stage: 'Avançado',
  description: 'Redes locais virtuais: benefícios, portas access e trunk, 802.1Q, VLAN nativa e de gerência, inter-VLAN, VTP e VLAN hopping.',
  accent: 'from-green-500 to-cyan-500',
  objective: 'Segmentar uma LAN com VLANs, configurar portas access e trunk e permitir a comunicação entre VLANs de forma segura.',
  summary: 'VLANs dividem um switch físico em várias redes lógicas isoladas. Cada VLAN é um domínio de broadcast próprio e, para conversar entre si, precisa de roteamento.',
  lessons: [
    {
      slug: 'conceitos-de-vlan',
      title: 'Conceitos de VLAN e 802.1Q',
      introduction: 'Uma VLAN (Virtual LAN) agrupa portas de um ou mais switches em uma rede lógica, independente da localização física. Dispositivos em VLANs diferentes não se comunicam diretamente na camada 2.',
      why_it_matters: 'VLANs trazem segurança (isolamento), desempenho (domínios de broadcast menores) e flexibilidade (mudar alguém de departamento é só trocar a VLAN da porta, sem mexer em cabos).',
      real_world: 'Em uma empresa, os telefones IP ficam na VLAN de voz, os computadores na VLAN de dados, as câmeras na VLAN de CFTV e os visitantes na VLAN de convidados — tudo nos mesmos switches.',
      explanation: 'Uma porta access pertence a uma única VLAN e não marca os quadros. Uma porta trunk transporta várias VLANs entre switches (ou até um roteador) e, para saber de qual VLAN é cada quadro, insere uma etiqueta (tag) 802.1Q de 4 bytes com o ID da VLAN.',
      exercise: 'Qual a diferença entre uma porta access e uma porta trunk?',
      exercise_answer: 'A porta access pertence a uma única VLAN e é usada para dispositivos finais; os quadros não levam tag. A porta trunk transporta várias VLANs, marcando os quadros com tags 802.1Q, e é usada entre switches ou até roteadores.',
      challenge: 'Planeje VLANs para uma escola: administração, professores, laboratório de alunos, Wi-Fi de visitantes e câmeras. Defina IDs, nomes e sub-redes.',
      keywords: ['VLAN', 'access', 'trunk', '802.1Q', 'tag', 'VLAN nativa', 'VLAN de gerência'],
      sections: [
        {
          title: 'Benefícios',
          items: [
            'Segurança: isolamento entre grupos; o tráfego entre VLANs passa por roteador/firewall, onde pode ser filtrado.',
            'Desempenho: broadcasts ficam restritos à VLAN.',
            'Organização: agrupamento por função, não por localização.',
            'Custo: menos switches físicos para separar redes.',
          ],
        },
        {
          title: 'Tag 802.1Q',
          code: '| MAC dst | MAC src | TAG 802.1Q (4 B) | EtherType | Dados | FCS |\n                      ├ TPID 0x8100 (16 bits)\n                      ├ PCP prioridade (3 bits)\n                      ├ DEI (1 bit)\n                      └ VLAN ID (12 bits → 1 a 4094)',
        },
        {
          title: 'Faixas e VLANs especiais',
          table: {
            headers: ['VLAN', 'Significado'],
            rows: [
              ['1', 'VLAN padrão; todas as portas começam nela (evite usá-la para dados)'],
              ['2 – 1001', 'Faixa normal'],
              ['1002 – 1005', 'Reservadas (legado Token Ring/FDDI)'],
              ['1006 – 4094', 'Faixa estendida'],
              ['Nativa', 'VLAN cujos quadros trafegam sem tag no trunk (padrão: 1)'],
              ['Gerência', 'VLAN com o IP de administração dos switches'],
              ['Voz', 'VLAN para telefones IP, com prioridade (QoS)'],
            ],
          },
        },
      ],
    },
    {
      slug: 'configuracao-de-vlan',
      title: 'Configuração, inter-VLAN e segurança',
      introduction: 'Configurar VLANs envolve criá-las, atribuir as portas de acesso, configurar os trunks e prover roteamento entre elas.',
      why_it_matters: 'Erros de VLAN estão entre as causas mais comuns de "o PC está conectado, mas sem rede": porta na VLAN errada, VLAN não permitida no trunk, VLAN nativa diferente nos dois lados.',
      real_world: 'Um técnico conecta um novo PC e ele não recebe IP. Ao verificar, a porta estava na VLAN 1 em vez da VLAN 10, onde está o relay DHCP.',
      explanation: 'Fluxo típico: criar a VLAN no switch, colocar portas em modo access na VLAN, configurar o uplink como trunk permitindo as VLANs necessárias, e criar no roteador (ou switch L3) uma interface por VLAN, que será o gateway daquela sub-rede.',
      exercise: 'Dois PCs estão em VLANs diferentes no mesmo switch. Eles conseguem se pingar sem roteador?',
      exercise_answer: 'Não. Cada VLAN é um domínio de broadcast e uma sub-rede diferente; é necessário roteamento (roteador ou switch L3) para comunicação entre elas.',
      challenge: 'Configure duas VLANs em dois switches ligados por trunk e faça os PCs de cada VLAN se comunicarem entre os switches.',
      keywords: ['switchport', 'trunk', 'allowed vlan', 'SVI', 'VTP', 'VLAN hopping', 'double tagging'],
      sections: [
        {
          title: 'Configuração no switch',
          code: 'vlan 10\n name VENDAS\nvlan 20\n name TI\nvlan 99\n name GERENCIA\n!\ninterface range g0/1 - 12\n switchport mode access\n switchport access vlan 10\ninterface range g0/13 - 22\n switchport mode access\n switchport access vlan 20\n!\ninterface g0/24\n switchport mode trunk\n switchport trunk native vlan 999\n switchport trunk allowed vlan 10,20,99\n switchport nonegotiate',
        },
        {
          title: 'Inter-VLAN com switch L3 (SVIs)',
          code: 'ip routing\ninterface vlan 10\n ip address 192.168.10.1 255.255.255.0\ninterface vlan 20\n ip address 192.168.20.1 255.255.255.0',
          content: 'Cada SVI é o gateway da sua VLAN. Em roteadores, usa-se router-on-a-stick (subinterfaces com encapsulation dot1Q), visto no módulo Router.',
        },
        {
          title: 'VTP',
          content: 'O VTP (VLAN Trunking Protocol, da Cisco) propaga a criação de VLANs entre switches. É prático, mas perigoso: um switch com número de revisão maior pode apagar as VLANs de toda a rede. Muitos administradores preferem o modo transparent ou off.',
        },
        {
          title: 'Ataques e mitigação',
          table: {
            headers: ['Ataque', 'Como funciona', 'Mitigação'],
            rows: [
              ['Switch spoofing', 'O atacante negocia um trunk via DTP e passa a ver todas as VLANs', 'switchport mode access nas portas de usuário; switchport nonegotiate'],
              ['Double tagging', 'Quadro com duas tags explora a VLAN nativa para saltar de VLAN', 'VLAN nativa sem uso (ex.: 999) e diferente de qualquer VLAN de usuários'],
              ['Portas esquecidas', 'Portas ativas na VLAN 1 dão acesso à rede', 'Desativar portas não usadas e colocá-las em VLAN isolada'],
            ],
          },
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Cada VLAN corresponde a um:',
      options: ['Domínio de colisão', 'Domínio de broadcast', 'Sistema autônomo', 'Protocolo de roteamento'],
      answer: 'Domínio de broadcast',
      explanation: 'Broadcasts de uma VLAN não alcançam outras VLANs.',
    },
    {
      question: 'Qual padrão IEEE define a marcação (tag) de VLANs em trunks?',
      options: ['802.3', '802.11', '802.1Q', '802.1X'],
      answer: '802.1Q',
      explanation: 'O 802.1Q insere uma tag de 4 bytes com o VLAN ID de 12 bits.',
    },
    {
      question: 'Quantos bits tem o campo VLAN ID?',
      options: ['8', '10', '12', '16'],
      answer: '12',
      explanation: '12 bits → até 4096 valores (1 a 4094 utilizáveis).',
    },
    {
      question: 'O que trafega sem tag em um trunk 802.1Q?',
      options: ['A VLAN de voz', 'A VLAN nativa', 'Todas as VLANs', 'A VLAN de gerência'],
      answer: 'A VLAN nativa',
      explanation: 'Por isso ela deve ser uma VLAN sem uso, para mitigar double tagging.',
    },
    {
      question: 'PCs em VLANs diferentes precisam de que para se comunicar?',
      options: ['Um hub', 'Roteamento (roteador ou switch L3)', 'Um access point', 'Nada, já se comunicam'],
      answer: 'Roteamento (roteador ou switch L3)',
      explanation: 'VLANs diferentes são redes IP diferentes.',
    },
    {
      question: 'Qual comando impede a negociação automática de trunk (DTP)?',
      options: ['switchport nonegotiate', 'no vlan 1', 'spanning-tree portfast', 'vtp mode server'],
      answer: 'switchport nonegotiate',
      explanation: 'Evita que um dispositivo malicioso negocie um trunk.',
    },
  ],
  details: {
    objectives: [
      'Explicar benefícios e funcionamento das VLANs.',
      'Diferenciar portas access e trunk e descrever a tag 802.1Q.',
      'Configurar VLANs, portas e trunks em switches Cisco.',
      'Implementar roteamento entre VLANs.',
      'Mitigar VLAN hopping e boas práticas de VLAN nativa e gerência.',
    ],
    keyPoints: [
      'VLAN = domínio de broadcast = sub-rede.',
      'Access: uma VLAN, sem tag. Trunk: várias VLANs, com tag 802.1Q.',
      'VLAN ID: 12 bits (1–4094).',
      'Comunicação entre VLANs exige roteamento.',
      'VLAN nativa sem uso, portas de usuário em access, DTP desligado.',
    ],
    commands: [
      { title: 'Verificação', platform: 'Cisco IOS', code: 'show vlan brief\nshow interfaces trunk\nshow interfaces g0/1 switchport\nshow vtp status' },
      { title: 'Interface com tag VLAN no Linux', platform: 'Linux/macOS', code: 'sudo ip link add link eth0 name eth0.10 type vlan id 10\nsudo ip addr add 192.168.10.50/24 dev eth0.10\nsudo ip link set eth0.10 up' },
    ],
    pitfalls: [
      { problem: 'VLAN existe no switch de acesso, mas não no trunk.', solution: 'Confira show interfaces trunk → "VLANs allowed and active".' },
      { problem: 'VLAN nativa diferente nos dois lados do trunk.', solution: 'Configure a mesma VLAN nativa nas duas pontas (o CDP alerta "native VLAN mismatch").' },
      { problem: 'Porta atribuída a uma VLAN que não foi criada.', solution: 'Crie a VLAN; caso contrário a porta fica inativa.' },
    ],
    security: [
      'Não use a VLAN 1 para dados nem gerência.',
      'Separe VLAN de gerência e restrinja o acesso a ela com ACLs.',
      'Rede de visitantes em VLAN própria, com acesso apenas à Internet.',
      'Combine VLANs com 802.1X para atribuir VLAN de acordo com a identidade do usuário.',
    ],
    lab: {
      title: 'Segmentação de uma empresa com VLANs',
      goal: 'Criar VLANs em dois switches, interligá-los por trunk e rotear entre as VLANs.',
      tools: 'Cisco Packet Tracer.',
      steps: [
        'Crie as VLANs 10 (Vendas), 20 (TI) e 99 (Gerência) em SW1 e SW2.',
        'Distribua dois PCs por VLAN entre os switches.',
        'Configure o trunk SW1–SW2 com VLAN nativa 999 e allowed 10,20,99.',
        'Configure router-on-a-stick em R1 e o DHCP de cada VLAN.',
        'Teste ping dentro da mesma VLAN, entre VLANs e verifique com show vlan brief.',
      ],
      expected: 'Comunicação dentro da VLAN entre switches e entre VLANs via roteador.',
    },
    references: ['IEEE 802.1Q — Bridges and Bridged Networks', 'Cisco CCNA SRWE — VLANs e Inter-VLAN Routing'],
  },
};
