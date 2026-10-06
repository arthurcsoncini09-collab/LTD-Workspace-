import type { ModuleSeed } from '../types';

export const tcpIp: ModuleSeed = {
  slug: 'tcp-ip',
  title: 'Módulo 3 — TCP/IP',
  stage: 'Básico',
  description: 'A pilha de protocolos real da Internet: camadas, protocolos de cada nível, comparação com o OSI e a jornada de uma requisição.',
  accent: 'from-violet-500 to-blue-500',
  objective: 'Entender a pilha TCP/IP usada na Internet, seus protocolos por camada e como ela se relaciona com o modelo OSI.',
  summary: 'O TCP/IP é o modelo prático que de fato roda na Internet. Ele agrupa as camadas do OSI em quatro (ou cinco) níveis e define os protocolos que usamos todos os dias.',
  lessons: [
    {
      slug: 'comparacao-osi-e-tcpip',
      title: 'As camadas do TCP/IP e a comparação com o OSI',
      introduction: 'O modelo TCP/IP nasceu na ARPANET, antes do OSI, e foi construído a partir de protocolos que já funcionavam. Ele tem quatro camadas: Acesso à Rede, Internet, Transporte e Aplicação.',
      why_it_matters: 'Toda comunicação na Internet usa TCP/IP. Certificações (CCNA, Network+) e o dia a dia profissional usam os dois modelos lado a lado: o OSI para conversar, o TCP/IP para implementar.',
      real_world: 'Seu sistema operacional implementa a pilha TCP/IP: a placa de rede cuida do acesso à rede, o kernel cuida de IP e TCP/UDP, e o navegador implementa HTTP na camada de aplicação.',
      explanation: 'O TCP/IP junta as camadas 5, 6 e 7 do OSI em uma só (Aplicação) e as camadas 1 e 2 em "Acesso à Rede". Muitos livros usam um modelo híbrido de 5 camadas (Física, Enlace, Rede, Transporte, Aplicação), que é o mais didático.',
      exercise: 'Quais camadas do OSI correspondem à camada de Aplicação do TCP/IP?',
      exercise_answer: 'As camadas 5 (Sessão), 6 (Apresentação) e 7 (Aplicação) do OSI.',
      challenge: 'Desenhe os dois modelos lado a lado e posicione: Ethernet, ARP, IP, ICMP, TCP, UDP, DNS, HTTP, TLS.',
      keywords: ['TCP/IP', 'pilha de protocolos', 'camada de Internet', 'acesso à rede', 'DoD'],
      sections: [
        {
          title: 'Mapeamento OSI × TCP/IP',
          table: {
            headers: ['TCP/IP (4 camadas)', 'Modelo híbrido (5)', 'OSI (7)', 'Protocolos'],
            rows: [
              ['Aplicação', 'Aplicação', '7, 6, 5', 'HTTP, HTTPS, DNS, DHCP, SSH, SMTP, FTP, TLS'],
              ['Transporte', 'Transporte', '4', 'TCP, UDP, QUIC'],
              ['Internet', 'Rede', '3', 'IPv4, IPv6, ICMP, IPsec'],
              ['Acesso à Rede', 'Enlace + Física', '2 e 1', 'Ethernet, Wi-Fi, ARP, PPP'],
            ],
          },
        },
        {
          title: 'OSI vs TCP/IP: diferenças essenciais',
          items: [
            'O OSI é um modelo de referência genérico; o TCP/IP é um conjunto de protocolos implementados.',
            'O TCP/IP surgiu primeiro (anos 1970) e venceu a "guerra dos protocolos" por já estar em uso.',
            'O OSI separa claramente serviço, interface e protocolo; o TCP/IP é mais pragmático.',
            'Na prática, falamos "camada 2", "camada 3", "camada 7" usando a numeração do OSI.',
          ],
        },
        {
          title: 'Documentos que definem a pilha',
          items: [
            'RFC 791 — Internet Protocol (IPv4).',
            'RFC 9293 — Transmission Control Protocol (atualiza o RFC 793).',
            'RFC 768 — User Datagram Protocol.',
            'RFC 1122 e 1123 — Requisitos para hosts da Internet.',
          ],
        },
      ],
    },
    {
      slug: 'encapsulamento',
      title: 'A jornada de uma requisição pela pilha',
      introduction: 'Quando você digita uma URL e pressiona Enter, dezenas de protocolos entram em ação em sequência. Acompanhar essa jornada é a melhor forma de ver a pilha TCP/IP funcionando.',
      why_it_matters: 'É uma pergunta clássica de entrevista ("o que acontece quando você digita google.com?") e conecta praticamente todos os módulos deste curso.',
      real_world: 'Abrir https://example.com envolve DHCP (se você acabou de conectar), ARP, DNS, TCP, TLS, HTTP, NAT e roteamento por vários sistemas autônomos.',
      explanation: 'Cada camada resolve um problema: a aplicação define o que pedir; o transporte garante a entrega ao processo certo; a camada de Internet leva o pacote até a rede certa; o acesso à rede leva o quadro até o próximo equipamento.',
      exercise: 'Antes de enviar o primeiro pacote ao servidor, o computador precisa descobrir dois endereços. Quais são e quais protocolos usa?',
      exercise_answer: 'O IP do servidor (via DNS) e o MAC do gateway padrão (via ARP), já que o servidor está em outra rede.',
      challenge: 'Escreva a sequência completa de protocolos envolvidos ao acessar https://example.com logo após ligar o notebook.',
      keywords: ['encapsulamento', 'requisição', 'DNS', 'ARP', 'TCP', 'TLS', 'HTTP'],
      sections: [
        {
          title: 'O que acontece ao acessar https://example.com',
          steps: [
            'DHCP: o computador obtém IP, máscara, gateway e DNS (se ainda não tiver).',
            'DNS: o nome example.com é traduzido para um endereço IP.',
            'ARP: descobre o MAC do gateway, pois o servidor está fora da rede local.',
            'TCP: three-way handshake (SYN, SYN-ACK, ACK) com a porta 443 do servidor.',
            'TLS: negociação de criptografia e validação do certificado.',
            'HTTP: o navegador envia GET / e recebe a resposta 200 OK com o HTML.',
            'Roteamento e NAT: no caminho, o roteador de casa traduz o IP privado e os roteadores da Internet encaminham os pacotes.',
          ],
        },
        {
          title: 'Nomes da unidade de dados',
          table: {
            headers: ['Camada', 'Nome da PDU', 'Endereço usado'],
            rows: [
              ['Aplicação', 'Mensagem / dados', 'Nome (URL)'],
              ['Transporte', 'Segmento (TCP) / Datagrama (UDP)', 'Porta'],
              ['Internet', 'Pacote', 'Endereço IP'],
              ['Acesso à rede', 'Quadro', 'Endereço MAC'],
            ],
          },
        },
        {
          title: 'Princípio fim a fim',
          content: 'No projeto original da Internet, a "inteligência" fica nas pontas (hosts) e o núcleo da rede apenas encaminha pacotes da melhor forma possível (best effort). Por isso o IP não garante entrega — quem garante é o TCP, nas pontas.',
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Quantas camadas tem o modelo TCP/IP clássico?',
      options: ['4', '5', '7', '3'],
      answer: '4',
      explanation: 'Acesso à Rede, Internet, Transporte e Aplicação.',
    },
    {
      question: 'Em qual camada do TCP/IP fica o protocolo IP?',
      options: ['Aplicação', 'Transporte', 'Internet', 'Acesso à Rede'],
      answer: 'Internet',
      explanation: 'A camada de Internet corresponde à camada 3 do OSI e abriga IP e ICMP.',
    },
    {
      question: 'A camada de Aplicação do TCP/IP agrupa quais camadas do OSI?',
      options: ['1 e 2', '3 e 4', '5, 6 e 7', 'Somente a 7'],
      answer: '5, 6 e 7',
      explanation: 'Sessão, Apresentação e Aplicação foram unidas em uma única camada.',
    },
    {
      question: 'Qual protocolo descobre o MAC do gateway antes de um pacote sair da LAN?',
      options: ['DNS', 'ARP', 'DHCP', 'ICMP'],
      answer: 'ARP',
      explanation: 'O ARP resolve um endereço IP (do gateway) em endereço MAC na rede local.',
    },
    {
      question: 'Qual afirmação sobre o IP é correta?',
      options: ['Garante a entrega de todos os pacotes', 'É um serviço de melhor esforço (best effort)', 'Usa portas para identificar aplicações', 'Opera na camada de transporte'],
      answer: 'É um serviço de melhor esforço (best effort)',
      explanation: 'O IP não garante entrega nem ordem; a confiabilidade é responsabilidade do TCP.',
    },
  ],
  details: {
    objectives: [
      'Descrever as camadas do modelo TCP/IP e suas funções.',
      'Mapear o modelo TCP/IP para o modelo OSI.',
      'Posicionar os principais protocolos na camada correta.',
      'Narrar a sequência de protocolos envolvidos ao acessar um site.',
    ],
    keyPoints: [
      'TCP/IP: Acesso à Rede, Internet, Transporte, Aplicação.',
      'É a pilha que realmente roda na Internet; o OSI é referência.',
      'IP é best effort; a confiabilidade vem do TCP.',
      'Acessar um site envolve DHCP, DNS, ARP, TCP, TLS e HTTP.',
    ],
    commands: [
      { title: 'Ver conexões TCP/UDP ativas', platform: 'Windows', code: 'netstat -ano' },
      { title: 'Ver conexões TCP/UDP ativas', platform: 'Linux/macOS', code: 'ss -tunap        # Linux\nnetstat -an      # macOS' },
      { title: 'Ver uma requisição completa', platform: 'Multiplataforma', code: 'curl -v https://example.com', note: 'Mostra a resolução, a conexão TCP, o handshake TLS e os cabeçalhos HTTP.' },
    ],
    pitfalls: [
      { problem: 'Dizer que o TCP/IP tem 7 camadas.', solution: 'São 4 no modelo clássico (5 no híbrido didático). Sete é o OSI.' },
      { problem: 'Achar que "TCP/IP" significa só os protocolos TCP e IP.', solution: 'O nome designa toda a família de protocolos da Internet (UDP, ICMP, DNS, HTTP…).' },
    ],
    security: [
      'Os protocolos originais do TCP/IP não tinham segurança embutida; TLS, IPsec, DNSSEC e SSH foram acrescentados depois.',
      'Spoofing de IP é possível porque o IP não autentica a origem — filtros de entrada (BCP 38) ajudam a mitigar.',
    ],
    lab: {
      title: 'Seguindo uma requisição com curl e Wireshark',
      goal: 'Ver na prática DNS, TCP, TLS e HTTP acontecendo em sequência.',
      tools: 'curl e Wireshark.',
      steps: [
        'Inicie uma captura no Wireshark.',
        'Rode curl -v https://example.com.',
        'Filtre por "dns || tcp.port == 443" e identifique a consulta DNS, o handshake TCP e o Client Hello do TLS.',
        'Compare os tempos de cada etapa na coluna Time.',
      ],
      expected: 'Identificar a ordem DNS → TCP (SYN/SYN-ACK/ACK) → TLS → dados criptografados.',
    },
    references: ['RFC 1122 — Requirements for Internet Hosts', 'RFC 791 — Internet Protocol', 'RFC 9293 — Transmission Control Protocol'],
  },
};
