import type { ModuleSeed } from '../types';

export const dhcp: ModuleSeed = {
  slug: 'dhcp',
  title: 'Módulo 10 — DHCP',
  stage: 'Intermediário',
  description: 'Configuração automática de IP: processo DORA, lease e renovação, escopos, reservas, opções, DHCP relay e DHCP snooping.',
  accent: 'from-teal-500 to-emerald-400',
  objective: 'Entender como o DHCP entrega configurações de rede automaticamente, configurar um servidor DHCP e protegê-lo contra servidores falsos.',
  summary: 'O DHCP distribui IP, máscara, gateway e DNS aos clientes por meio da troca DORA. Os endereços são "emprestados" por um tempo (lease) e renovados periodicamente.',
  lessons: [
    {
      slug: 'dora',
      title: 'O processo DORA',
      introduction: 'O DHCP (Dynamic Host Configuration Protocol) configura automaticamente os dispositivos que entram na rede. A negociação tem quatro mensagens: Discover, Offer, Request e Acknowledge — o DORA.',
      why_it_matters: 'Configurar IP manualmente em centenas de dispositivos é inviável e sujeito a erros. O DHCP centraliza o controle, evita conflitos e facilita mudanças (como trocar o DNS de toda a rede).',
      real_world: 'Ao entrar no Wi-Fi de um café, seu celular recebe em segundos IP, máscara, gateway e DNS do roteador do estabelecimento — tudo via DHCP.',
      explanation: 'O cliente ainda não tem IP, então grita em broadcast: "Há algum servidor DHCP?". O servidor oferece um endereço. O cliente pede formalmente aquele endereço (também em broadcast, para avisar outros servidores que recusou suas ofertas). O servidor confirma.',
      exercise: 'Por que o DHCP Discover é enviado em broadcast?',
      exercise_answer: 'Porque o cliente ainda não tem IP nem conhece o endereço do servidor DHCP. Ele usa origem 0.0.0.0 e destino 255.255.255.255.',
      challenge: 'Explique por que o DHCP Request também é enviado em broadcast, mesmo depois de o cliente já conhecer o servidor.',
      keywords: ['DHCP', 'DORA', 'Discover', 'Offer', 'Request', 'ACK', 'broadcast'],
      sections: [
        {
          title: 'DORA passo a passo',
          table: {
            headers: ['Mensagem', 'Direção', 'Origem → Destino (IP)', 'Conteúdo'],
            rows: [
              ['DISCOVER', 'Cliente → todos', '0.0.0.0 → 255.255.255.255', '"Preciso de um IP" + MAC do cliente'],
              ['OFFER', 'Servidor → cliente', 'IP do servidor → IP oferecido ou broadcast', 'IP proposto, máscara, gateway, DNS, lease'],
              ['REQUEST', 'Cliente → todos', '0.0.0.0 → 255.255.255.255', '"Aceito a oferta do servidor X"'],
              ['ACK', 'Servidor → cliente', 'IP do servidor → cliente', 'Confirmação final; o cliente pode usar o IP'],
            ],
          },
        },
        {
          title: 'Portas e outras mensagens',
          items: [
            'Servidor escuta em UDP 67; cliente em UDP 68.',
            'NAK: o servidor recusa o pedido (ex.: o cliente mudou de rede).',
            'DECLINE: o cliente detecta que o IP já está em uso (via ARP) e recusa.',
            'RELEASE: o cliente devolve o IP (ipconfig /release).',
            'INFORM: o cliente já tem IP e pede apenas outras opções.',
          ],
        },
        {
          title: 'Opções DHCP mais comuns',
          table: {
            headers: ['Opção', 'Significado'],
            rows: [
              ['1', 'Máscara de sub-rede'],
              ['3', 'Gateway padrão (router)'],
              ['6', 'Servidores DNS'],
              ['15', 'Nome de domínio'],
              ['42', 'Servidores NTP'],
              ['51', 'Tempo de lease'],
              ['66 / 67', 'Servidor TFTP e arquivo de boot (PXE, telefones IP)'],
            ],
          },
        },
      ],
    },
    {
      slug: 'alocacao-e-renovacao',
      title: 'Lease, escopos, reservas e relay',
      introduction: 'O IP fornecido pelo DHCP é um empréstimo com prazo: o lease. O administrador define o escopo (faixa de IPs), exclusões, reservas e as opções entregues aos clientes.',
      why_it_matters: 'Um lease longo demais em uma rede com muitos visitantes esgota o pool; um curto demais gera tráfego excessivo. E sem relay, um único servidor não atende várias VLANs.',
      real_world: 'Uma empresa usa um servidor DHCP central para todas as filiais e VLANs; os roteadores de cada rede encaminham as requisições com o comando ip helper-address.',
      explanation: 'O cliente tenta renovar na metade do lease (T1, 50%) diretamente com o servidor. Se não conseguir, tenta com qualquer servidor aos 87,5% (T2). Se o lease expirar, ele perde o IP e recomeça o DORA.',
      exercise: 'Com lease de 8 horas, quando o cliente tenta renovar pela primeira vez?',
      exercise_answer: 'Após 4 horas (T1 = 50% do lease). Se falhar, tenta novamente em T2 = 7 horas (87,5%).',
      challenge: 'Planeje um escopo DHCP para 192.168.20.0/24 reservando .1 a .20 para equipamentos fixos e criando uma reserva para a impressora.',
      keywords: ['lease', 'T1', 'T2', 'escopo', 'pool', 'reserva', 'relay', 'ip helper-address'],
      sections: [
        {
          title: 'Conceitos de configuração',
          items: [
            'Escopo/pool: faixa de endereços que o servidor pode distribuir.',
            'Exclusões: endereços dentro da faixa que não devem ser distribuídos (servidores, impressoras, gateway).',
            'Reserva: um IP fixo entregue sempre ao mesmo MAC — combina controle central com IP previsível.',
            'Lease: tempo de validade. Redes de visitantes usam leases curtos (1–2 h); redes corporativas, mais longos (8 h a 8 dias).',
          ],
        },
        {
          title: 'DHCP relay',
          content: 'Broadcasts não atravessam roteadores. Para que clientes de outra rede alcancem o servidor DHCP, a interface do roteador voltada aos clientes é configurada como relay: ela recebe o broadcast e o encaminha em unicast para o servidor, informando de qual rede veio o pedido (campo giaddr).',
          code: 'interface g0/1\n ip address 192.168.30.1 255.255.255.0\n ip helper-address 10.0.0.10',
        },
        {
          title: 'Servidor DHCP em um roteador Cisco',
          code: 'ip dhcp excluded-address 192.168.20.1 192.168.20.20\n!\nip dhcp pool LAN20\n network 192.168.20.0 255.255.255.0\n default-router 192.168.20.1\n dns-server 1.1.1.1 8.8.8.8\n domain-name empresa.local\n lease 0 8\n!\nshow ip dhcp binding',
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Qual etapa do DORA corresponde à confirmação final do endereço?',
      options: ['DISCOVER', 'OFFER', 'REQUEST', 'ACK'],
      answer: 'ACK',
      explanation: 'O ACK confirma ao cliente que a configuração foi atribuída e ele pode usá-la.',
    },
    {
      question: 'Qual é a finalidade do lease DHCP?',
      options: ['Bloquear o acesso à Internet', 'Definir a validade do endereço fornecido', 'Trocar a porta do switch', 'Criptografar o tráfego'],
      answer: 'Definir a validade do endereço fornecido',
      explanation: 'O lease define por quanto tempo o cliente pode usar o IP antes de renovar.',
    },
    {
      question: 'Quais portas UDP o DHCP usa?',
      options: ['53 e 54', '67 e 68', '80 e 443', '161 e 162'],
      answer: '67 e 68',
      explanation: 'Servidor na 67, cliente na 68.',
    },
    {
      question: 'Qual comando Cisco encaminha pedidos DHCP para um servidor em outra rede?',
      options: ['ip dhcp pool', 'ip helper-address', 'ip route', 'dhcp relay enable'],
      answer: 'ip helper-address',
      explanation: 'O ip helper-address transforma o broadcast DHCP em unicast para o servidor.',
    },
    {
      question: 'Uma reserva DHCP associa um IP fixo a:',
      options: ['Um nome DNS', 'Um endereço MAC', 'Uma porta TCP', 'Uma VLAN'],
      answer: 'Um endereço MAC',
      explanation: 'O servidor sempre entrega o mesmo IP ao dispositivo com aquele MAC.',
    },
    {
      question: 'Qual recurso de switch bloqueia servidores DHCP não autorizados?',
      options: ['DHCP snooping', 'Port mirroring', 'STP', 'LACP'],
      answer: 'DHCP snooping',
      explanation: 'Com DHCP snooping, só portas marcadas como confiáveis podem enviar respostas de servidor DHCP.',
    },
  ],
  details: {
    objectives: [
      'Descrever as quatro mensagens do processo DORA.',
      'Explicar lease, T1, T2 e renovação.',
      'Configurar escopo, exclusões, reservas e opções.',
      'Configurar DHCP relay e proteger a rede com DHCP snooping.',
    ],
    keyPoints: [
      'DORA: Discover, Offer, Request, Acknowledge.',
      'UDP 67 (servidor) e 68 (cliente).',
      'Renovação em 50% (T1) e 87,5% (T2) do lease.',
      'Relay (ip helper-address) leva o DHCP a outras redes.',
      'IP 169.254.x.x no cliente = DHCP falhou.',
    ],
    commands: [
      { title: 'Renovar o IP', platform: 'Windows', code: 'ipconfig /release\nipconfig /renew\nipconfig /all        # ver servidor DHCP e lease' },
      { title: 'Renovar o IP', platform: 'Linux/macOS', code: 'sudo dhclient -r && sudo dhclient     # Debian/Ubuntu (dhclient)\nnmcli connection up "Nome da conexão"  # NetworkManager' },
      { title: 'Verificar e proteger', platform: 'Cisco IOS', code: 'show ip dhcp binding\nshow ip dhcp pool\n!\nip dhcp snooping\nip dhcp snooping vlan 10\ninterface g0/24\n ip dhcp snooping trust' },
    ],
    pitfalls: [
      { problem: 'Esquecer de excluir o IP do gateway do pool.', solution: 'Use ip dhcp excluded-address para gateway, servidores e impressoras.' },
      { problem: 'Clientes de outra VLAN sem IP.', solution: 'Configure ip helper-address na interface/subinterface daquela VLAN.' },
      { problem: 'Pool esgotado em rede de visitantes.', solution: 'Reduza o lease e/ou aumente a sub-rede.' },
    ],
    security: [
      'Rogue DHCP: um servidor falso pode entregar gateway/DNS maliciosos. Use DHCP snooping.',
      'DHCP starvation: o atacante esgota o pool com MACs falsos. Use port security e limite de taxa de DHCP.',
      'A base do DHCP snooping também alimenta o Dynamic ARP Inspection e o IP Source Guard.',
    ],
    lab: {
      title: 'Servidor DHCP no Packet Tracer',
      goal: 'Configurar um roteador como servidor DHCP para duas redes, uma delas via relay.',
      tools: 'Cisco Packet Tracer.',
      steps: [
        'Monte R1 com duas interfaces: 192.168.10.1/24 e 192.168.20.1/24, cada uma com um switch e dois PCs.',
        'Crie os pools LAN10 e LAN20 com exclusões dos 10 primeiros IPs.',
        'Configure os PCs em DHCP e verifique os IPs recebidos.',
        'Mova o serviço para um servidor em uma terceira rede e configure ip helper-address.',
      ],
      expected: 'Todos os PCs recebem IP da faixa correta e show ip dhcp binding lista os leases.',
    },
    references: ['RFC 2131 — Dynamic Host Configuration Protocol', 'RFC 2132 — DHCP Options and BOOTP Vendor Extensions', 'RFC 8415 — DHCPv6'],
  },
};
