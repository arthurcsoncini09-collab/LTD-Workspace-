import type { ModuleSeed } from '../types';

export const switchModule: ModuleSeed = {
  slug: 'switch',
  title: 'Módulo 14 — Switch',
  stage: 'Avançado',
  description: 'Comutação em camada 2: tabela MAC, flooding, domínios de colisão e broadcast, duplex, STP, port security e configuração básica.',
  accent: 'from-sky-400 to-indigo-500',
  objective: 'Entender como o switch aprende e encaminha quadros, evitar loops com STP e aplicar configurações básicas e de segurança em switches gerenciáveis.',
  summary: 'O switch é o coração da LAN: aprende onde está cada MAC, entrega quadros só na porta certa, separa domínios de colisão e, com STP, evita loops que derrubariam a rede.',
  lessons: [
    {
      slug: 'funcionamento-do-switch',
      title: 'Como o switch encaminha quadros',
      introduction: 'O switch opera na camada 2 e toma decisões com base no endereço MAC de destino de cada quadro. Para isso, mantém uma tabela MAC (também chamada CAM) que associa MACs a portas.',
      why_it_matters: 'Entender o aprendizado e o flooding explica o comportamento da LAN, problemas de desempenho, loops e várias técnicas de ataque e defesa.',
      real_world: 'Em um escritório com 48 computadores ligados a um switch, cada PC pode transmitir a 1 Gbps simultaneamente com outro, sem colisões — algo impossível na época dos hubs.',
      explanation: 'Quando um quadro chega, o switch (1) aprende: anota o MAC de origem e a porta de entrada; (2) procura o MAC de destino na tabela; (3) se encontrar, encaminha só para aquela porta (forwarding); se não encontrar, ou se for broadcast, envia para todas as portas exceto a de origem (flooding); se o destino estiver na mesma porta de origem, descarta (filtering).',
      exercise: 'O que o switch faz com um quadro cujo MAC de destino não está na tabela?',
      exercise_answer: 'Faz flooding: envia o quadro por todas as portas da VLAN, exceto a de entrada. Quando o destino responder, o switch aprenderá seu MAC.',
      challenge: 'Desenhe um switch com 4 PCs e mostre como a tabela MAC é preenchida após PC1 enviar para PC3 e PC3 responder.',
      keywords: ['switch', 'tabela MAC', 'CAM', 'flooding', 'forwarding', 'filtering', 'domínio de colisão'],
      sections: [
        {
          title: 'Aprendizado, encaminhamento e flooding',
          code: 'Tabela MAC (show mac address-table)\nVlan    Mac Address       Type      Ports\n----    -----------       --------  -----\n  10    000c.29aa.1111    DYNAMIC   Gi0/1\n  10    000c.29bb.2222    DYNAMIC   Gi0/2\n  10    000c.29cc.3333    DYNAMIC   Gi0/3',
          content: 'As entradas dinâmicas expiram após um tempo sem tráfego (300 segundos por padrão em switches Cisco).',
        },
        {
          title: 'Domínios de colisão e de broadcast',
          table: {
            headers: ['Equipamento', 'Domínios de colisão', 'Domínios de broadcast'],
            rows: [
              ['Hub de 8 portas', '1', '1'],
              ['Switch de 8 portas (1 VLAN)', '8 (um por porta)', '1'],
              ['Switch com 3 VLANs', 'Um por porta', '3 (um por VLAN)'],
              ['Roteador com 2 interfaces', 'Um por interface', '2 (um por interface)'],
            ],
          },
        },
        {
          title: 'Modos de comutação e duplex',
          items: [
            'Store-and-forward: recebe o quadro inteiro e confere o FCS antes de encaminhar (padrão; descarta quadros corrompidos).',
            'Cut-through: começa a encaminhar após ler o MAC de destino (menor latência, usado em data centers).',
            'Full duplex: envia e recebe ao mesmo tempo, sem colisões (padrão em switches).',
            'Incompatibilidade de duplex (um lado full, outro half) causa lentidão e erros: deixe ambos em auto ou fixe ambos igual.',
          ],
        },
        {
          title: 'Switch L2 × Switch L3',
          content: 'Um switch L2 encaminha por MAC dentro das VLANs. Um switch L3 (multilayer) também roteia entre VLANs em hardware, usando interfaces virtuais (SVIs). Em redes corporativas, o núcleo costuma ser L3.',
        },
      ],
    },
    {
      slug: 'stp-e-seguranca-de-portas',
      title: 'STP, port security e configuração básica',
      introduction: 'Links redundantes entre switches aumentam a disponibilidade, mas criam loops de camada 2. Como o quadro Ethernet não tem TTL, um loop multiplica broadcasts infinitamente. O Spanning Tree Protocol (STP) resolve isso.',
      why_it_matters: 'Uma tempestade de broadcast pode derrubar uma rede inteira em segundos. E portas de switch abertas são a porta de entrada física de um atacante.',
      real_world: 'Alguém conecta as duas pontas de um mesmo cabo em duas tomadas da sala de reunião. Sem STP, a rede do andar cai; com STP (e BPDU Guard), a porta é bloqueada automaticamente.',
      explanation: 'O STP elege uma root bridge (menor Bridge ID: prioridade + MAC). Cada switch escolhe sua porta raiz (melhor caminho até a root). Em cada segmento, uma porta designada encaminha; as demais ficam bloqueadas, formando uma árvore sem loops. Se um link cair, uma porta bloqueada assume.',
      exercise: 'Como é escolhida a root bridge no STP?',
      exercise_answer: 'Pelo menor Bridge ID, formado pela prioridade (padrão 32768) e, em caso de empate, pelo menor endereço MAC.',
      challenge: 'Em um triângulo de três switches com prioridades padrão, como garantir que o switch do núcleo seja a root bridge?',
      keywords: ['STP', 'RSTP', 'root bridge', 'BPDU', 'loop', 'port security', 'PortFast', 'BPDU Guard'],
      sections: [
        {
          title: 'Estados e papéis de porta',
          table: {
            headers: ['STP (802.1D)', 'RSTP (802.1w)', 'Função'],
            rows: [
              ['Blocking', 'Discarding', 'Não encaminha; ouve BPDUs'],
              ['Listening', 'Discarding', 'Participa da eleição'],
              ['Learning', 'Learning', 'Aprende MACs, ainda não encaminha'],
              ['Forwarding', 'Forwarding', 'Encaminha normalmente'],
            ],
          },
          content: 'O STP clássico leva 30 a 50 segundos para convergir; o RSTP converge em poucos segundos e é o recomendado hoje.',
        },
        {
          title: 'Configuração básica de um switch Cisco',
          code: 'enable\nconfigure terminal\nhostname SW1\nenable secret SenhaForte!\nservice password-encryption\nbanner motd # Acesso restrito #\n!\ninterface vlan 99\n ip address 192.168.99.2 255.255.255.0\n no shutdown\nip default-gateway 192.168.99.1\n!\ninterface range g0/1 - 20\n switchport mode access\n spanning-tree portfast\n spanning-tree bpduguard enable\nend\ncopy running-config startup-config',
        },
        {
          title: 'Port security',
          code: 'interface g0/5\n switchport mode access\n switchport port-security\n switchport port-security maximum 2\n switchport port-security mac-address sticky\n switchport port-security violation restrict',
          items: [
            'protect: descarta quadros de MACs não permitidos, sem alertar.',
            'restrict: descarta e gera log/contador.',
            'shutdown (padrão): coloca a porta em err-disabled.',
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Com base em que o switch decide para qual porta enviar um quadro?',
      options: ['IP de destino', 'MAC de destino', 'Porta TCP', 'MAC de origem'],
      answer: 'MAC de destino',
      explanation: 'O MAC de origem é usado para aprender; o de destino, para encaminhar.',
    },
    {
      question: 'Quantos domínios de broadcast há em um switch de 24 portas com uma única VLAN?',
      options: ['1', '2', '12', '24'],
      answer: '1',
      explanation: 'Sem VLANs adicionais, todas as portas estão no mesmo domínio de broadcast (mas cada uma é um domínio de colisão).',
    },
    {
      question: 'O que o switch faz com um quadro de broadcast?',
      options: ['Descarta', 'Envia ao roteador', 'Envia por todas as portas da VLAN exceto a de origem', 'Envia somente para a root bridge'],
      answer: 'Envia por todas as portas da VLAN exceto a de origem',
      explanation: 'Broadcasts são sempre inundados (flooding) dentro da VLAN.',
    },
    {
      question: 'Qual a principal função do STP?',
      options: ['Criptografar quadros', 'Evitar loops de camada 2', 'Atribuir IPs', 'Rotear entre VLANs'],
      answer: 'Evitar loops de camada 2',
      explanation: 'O STP bloqueia caminhos redundantes para formar uma topologia sem loops.',
    },
    {
      question: 'Qual switch se torna a root bridge?',
      options: ['O de maior Bridge ID', 'O de menor Bridge ID', 'O primeiro a ser ligado', 'O com mais portas'],
      answer: 'O de menor Bridge ID',
      explanation: 'Menor prioridade vence; em empate, o menor MAC.',
    },
    {
      question: 'Qual recurso coloca uma porta de acesso em err-disabled ao receber um BPDU?',
      options: ['PortFast', 'BPDU Guard', 'Port mirroring', 'Root Guard'],
      answer: 'BPDU Guard',
      explanation: 'O BPDU Guard protege portas de usuários contra a conexão indevida de switches.',
    },
  ],
  details: {
    objectives: [
      'Explicar aprendizado, encaminhamento, flooding e filtragem.',
      'Contar domínios de colisão e de broadcast em uma topologia.',
      'Descrever o funcionamento do STP/RSTP e a eleição da root bridge.',
      'Configurar um switch Cisco com gerência, portas de acesso e port security.',
    ],
    keyPoints: [
      'Switch aprende pelo MAC de origem e encaminha pelo MAC de destino.',
      'Destino desconhecido ou broadcast → flooding.',
      'Cada porta de switch é um domínio de colisão; cada VLAN é um domínio de broadcast.',
      'STP elimina loops; RSTP converge mais rápido.',
      'PortFast + BPDU Guard em portas de usuário.',
    ],
    commands: [
      { title: 'Verificação', platform: 'Cisco IOS', code: 'show mac address-table\nshow interfaces status\nshow interfaces g0/1\nshow spanning-tree\nshow port-security interface g0/5' },
      { title: 'Ajustar a root bridge', platform: 'Cisco IOS', code: 'spanning-tree mode rapid-pvst\nspanning-tree vlan 10 root primary\n! ou\nspanning-tree vlan 10 priority 4096' },
      { title: 'Ver a velocidade e o duplex negociados no host', platform: 'Linux/macOS', code: 'ethtool eth0            # Linux\nifconfig en0 | grep media   # macOS' },
    ],
    pitfalls: [
      { problem: 'Desabilitar o STP "para ganhar desempenho".', solution: 'Nunca desabilite o STP em redes com redundância; use RSTP.' },
      { problem: 'Porta de usuário demorando 30 s para subir.', solution: 'Habilite PortFast em portas de acesso (nunca em portas para outros switches).' },
      { problem: 'Root bridge eleita em um switch antigo de acesso.', solution: 'Defina manualmente a prioridade do switch de núcleo.' },
    ],
    security: [
      'MAC flooding enche a tabela CAM e faz o switch agir como hub: use port security.',
      'Desative portas não usadas e coloque-as em uma VLAN isolada.',
      'Use SSH para gerência e uma VLAN de gerência separada.',
      'BPDU Guard e Root Guard evitam que um switch intruso assuma a topologia.',
    ],
    lab: {
      title: 'Switches redundantes com STP',
      goal: 'Observar o STP bloqueando um loop e convergindo após uma falha.',
      tools: 'Cisco Packet Tracer.',
      steps: [
        'Conecte três switches em triângulo e um PC em cada.',
        'Execute show spanning-tree e identifique a root bridge e a porta bloqueada.',
        'Ajuste a prioridade para que SW1 seja a root e verifique a nova topologia.',
        'Desligue um link ativo e observe a porta bloqueada passar a encaminhar.',
        'Configure port security em uma porta e teste conectando outro PC.',
      ],
      expected: 'Rede sem loop, com convergência automática após a falha e violação de port security registrada.',
    },
    references: ['IEEE 802.1D — MAC Bridges / STP', 'IEEE 802.1w — Rapid STP', 'Cisco CCNA SRWE — Switching, Routing and Wireless Essentials'],
  },
};
