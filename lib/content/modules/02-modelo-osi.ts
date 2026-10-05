import type { ModuleSeed } from '../types';

export const modeloOsi: ModuleSeed = {
  slug: 'modelo-osi',
  title: 'Módulo 2 — Modelo OSI',
  stage: 'Básico',
  description: 'As sete camadas, PDUs, encapsulamento e o uso do OSI para diagnosticar problemas de rede.',
  accent: 'from-sky-500 to-blue-500',
  objective: 'Entender a função de cada camada do modelo OSI, como os dados são encapsulados e como usar as camadas para fazer troubleshooting.',
  summary: 'O modelo OSI organiza a comunicação em sete camadas independentes. Ele é a "língua comum" dos profissionais de redes para descrever onde algo acontece — e onde algo quebrou.',
  lessons: [
    {
      slug: 'camadas-osi',
      title: 'As sete camadas do OSI',
      introduction: 'O modelo OSI (Open Systems Interconnection), publicado pela ISO em 1984, divide a comunicação em sete camadas. Cada camada presta serviços à camada de cima e usa os serviços da camada de baixo.',
      why_it_matters: 'Dividir o problema em camadas permite que fabricantes diferentes desenvolvam partes independentes (uma placa de rede não precisa saber nada sobre HTTP) e dá um vocabulário comum: "é um problema de camada 2" diz muito em poucas palavras.',
      real_world: 'Quando você troca o Wi-Fi por um cabo, apenas as camadas 1 e 2 mudam. O navegador, o TCP e o IP continuam funcionando exatamente igual — esse é o poder da independência entre camadas.',
      explanation: 'Uma analogia: enviar uma encomenda. Você escreve a carta (aplicação), traduz para o idioma do destinatário (apresentação), combina a conversa (sessão), divide em volumes numerados (transporte), coloca o endereço da cidade de destino (rede), entrega à transportadora local (enlace) e o caminhão percorre a estrada (física).',
      exercise: 'Em qual camada o protocolo IP opera? E o TCP?',
      exercise_answer: 'O IP opera na camada 3 (Rede). O TCP opera na camada 4 (Transporte).',
      challenge: 'Relacione cada item à sua camada: HTTP, TCP, IP, endereço MAC, cabo de fibra, TLS, switch, roteador.',
      keywords: ['OSI', 'camada', 'PDU', 'aplicação', 'transporte', 'rede', 'enlace', 'física'],
      sections: [
        {
          title: 'As camadas em detalhe',
          table: {
            headers: ['Nº', 'Camada', 'Função', 'PDU', 'Exemplos'],
            rows: [
              ['7', 'Aplicação', 'Interface com os serviços de rede do usuário', 'Dados', 'HTTP, DNS, SMTP, SSH, FTP'],
              ['6', 'Apresentação', 'Formato, codificação, compressão e criptografia', 'Dados', 'TLS/SSL, JPEG, UTF-8, ASCII'],
              ['5', 'Sessão', 'Abre, mantém e encerra diálogos entre aplicações', 'Dados', 'RPC, NetBIOS, sessões SQL'],
              ['4', 'Transporte', 'Entrega fim a fim, portas, confiabilidade, controle de fluxo', 'Segmento (TCP) / Datagrama (UDP)', 'TCP, UDP'],
              ['3', 'Rede', 'Endereçamento lógico e roteamento entre redes', 'Pacote', 'IPv4, IPv6, ICMP, OSPF'],
              ['2', 'Enlace', 'Acesso ao meio, endereçamento físico, detecção de erros', 'Quadro (frame)', 'Ethernet, Wi-Fi (802.11), ARP, PPP'],
              ['1', 'Física', 'Transmissão de bits como sinais elétricos, luz ou rádio', 'Bits', 'Cabos, conectores RJ-45, fibra, hubs'],
            ],
          },
        },
        {
          title: 'Mnemônico para memorizar',
          content: 'De cima para baixo (7 → 1): "Aplicação, Apresentação, Sessão, Transporte, Rede, Enlace, Física". Uma frase popular em inglês, de baixo para cima, é "Please Do Not Throw Sausage Pizza Away" (Physical, Data link, Network, Transport, Session, Presentation, Application).',
        },
        {
          title: 'Dispositivos por camada',
          items: [
            'Camada 1: hub, repetidor, cabos, transceptores, modems.',
            'Camada 2: switch, bridge, access point, placa de rede (NIC).',
            'Camada 3: roteador, switch L3.',
            'Camadas 4 a 7: firewalls de nova geração, balanceadores de carga, proxies, WAF.',
          ],
        },
      ],
    },
    {
      slug: 'encapsulamento-osi',
      title: 'Encapsulamento e desencapsulamento',
      introduction: 'Quando um dado desce pela pilha no remetente, cada camada adiciona seu próprio cabeçalho (e a camada 2 também um trailer). No destinatário, o processo é inverso: cada camada lê e remove o cabeçalho que lhe pertence.',
      why_it_matters: 'Entender o encapsulamento explica por que um pacote tem vários endereços (porta, IP, MAC), por que existe overhead e como ferramentas como o Wireshark mostram as camadas separadamente.',
      real_world: 'No Wireshark, ao clicar em um pacote HTTP, você vê exatamente as camadas empilhadas: Ethernet II → Internet Protocol → Transmission Control Protocol → Hypertext Transfer Protocol.',
      explanation: 'É como uma boneca russa (matryoshka): a mensagem HTTP vai dentro de um segmento TCP, que vai dentro de um pacote IP, que vai dentro de um quadro Ethernet. Cada roteador no caminho abre só até a camada 3, lê o IP de destino, e coloca o pacote em um quadro novo para o próximo salto.',
      exercise: 'Quais endereços mudam a cada salto em uma rede roteada: os IPs ou os MACs?',
      exercise_answer: 'Os endereços MAC mudam a cada salto (cada enlace tem sua origem e destino de camada 2). Os IPs de origem e destino permanecem os mesmos do início ao fim (exceto quando há NAT).',
      challenge: 'Explique por que um switch não precisa abrir o cabeçalho IP para encaminhar um quadro, mas um roteador precisa.',
      keywords: ['encapsulamento', 'cabeçalho', 'trailer', 'PDU', 'overhead', 'Wireshark'],
      sections: [
        {
          title: 'Encapsulamento passo a passo',
          steps: [
            'Aplicação gera os dados (ex.: GET /index.html).',
            'Transporte adiciona o cabeçalho TCP com portas de origem e destino → segmento.',
            'Rede adiciona o cabeçalho IP com IPs de origem e destino → pacote.',
            'Enlace adiciona cabeçalho Ethernet (MACs) e trailer FCS para detectar erros → quadro.',
            'Física converte o quadro em bits e os transmite pelo meio.',
          ],
        },
        {
          title: 'Estrutura de um quadro',
          code: '| Ethernet (14 B) | IP (20 B) | TCP (20 B) | Dados HTTP | FCS (4 B) |\n   MAC dst/src       IP src/dst   portas        GET /...      checagem',
          content: 'Com MTU padrão de 1500 bytes, sobram até 1460 bytes de dados por segmento TCP sobre IPv4 sem opções.',
        },
        {
          title: 'Comunicação entre camadas pares',
          content: 'Cada camada "conversa" logicamente com a camada equivalente do outro lado: o TCP do cliente com o TCP do servidor, o HTTP do navegador com o HTTP do servidor. Fisicamente, porém, os dados sempre descem a pilha, atravessam o meio e sobem do outro lado.',
        },
      ],
    },
    {
      slug: 'diagnostico-por-camada',
      title: 'Diagnóstico por camada',
      introduction: 'Em redes, o problema pode ocorrer em qualquer camada. Saber qual camada está afetada resolve boa parte do trabalho de troubleshooting.',
      why_it_matters: 'Um "a Internet não funciona" pode ser cabo solto, IP errado, gateway fora, DNS quebrado, firewall bloqueando ou o próprio site fora do ar. Testar por camadas evita chutes e economiza tempo.',
      real_world: 'Quando o site não carrega, um técnico verifica: o link está ativo (1)? Há IP válido (3)? O ping no gateway responde (3)? O DNS resolve o nome (7)? A porta 443 está acessível (4)?',
      explanation: 'Existem três abordagens clássicas: de baixo para cima (bottom-up), começando pelo cabo; de cima para baixo (top-down), começando pela aplicação; e dividir para conquistar, começando pela camada 3 com um ping e subindo ou descendo conforme o resultado.',
      exercise: 'O ping para 8.8.8.8 funciona, mas o navegador não abre "google.com". Qual a camada/serviço mais provável do problema?',
      exercise_answer: 'A conectividade IP (camada 3) está ok. O mais provável é falha na resolução de nomes (DNS, camada 7). Teste com nslookup google.com.',
      challenge: 'Monte um checklist de troubleshooting com um teste para cada camada, da física à aplicação.',
      keywords: ['troubleshooting', 'bottom-up', 'top-down', 'diagnóstico', 'ping', 'nslookup'],
      sections: [
        {
          title: 'Sintomas típicos por camada',
          table: {
            headers: ['Camada', 'Sintoma', 'Teste'],
            rows: [
              ['1 — Física', 'LED da porta apagado, "cabo desconectado"', 'Verificar cabo, porta, LEDs'],
              ['2 — Enlace', 'Sem endereço MAC do gateway na tabela ARP, VLAN errada', 'arp -a, show mac address-table'],
              ['3 — Rede', 'IP 169.254.x.x, gateway não responde', 'ipconfig, ping no gateway'],
              ['4 — Transporte', 'Conexão recusada ou expirando', 'Test-NetConnection / nc -zv host porta'],
              ['7 — Aplicação', 'Erro 404/500, nome não resolve', 'nslookup, curl -v'],
            ],
          },
        },
        {
          title: 'Método dividir para conquistar',
          steps: [
            'Faça ping no gateway padrão. Falhou? Desça: IP, VLAN, cabo.',
            'Funcionou? Faça ping em um IP da Internet (8.8.8.8). Falhou? Problema de roteamento/NAT/firewall.',
            'Funcionou? Teste o DNS (nslookup). Falhou? Problema de resolução de nomes.',
            'Funcionou? Teste a aplicação (navegador, curl). Falhou? Porta bloqueada ou serviço fora do ar.',
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Em qual camada do modelo OSI o protocolo IP opera?',
      options: ['Camada 2', 'Camada 3', 'Camada 4', 'Camada 7'],
      answer: 'Camada 3',
      explanation: 'O IP é o protocolo de endereçamento lógico e roteamento da camada de Rede (3).',
    },
    {
      question: 'Qual é a PDU da camada de Enlace?',
      options: ['Bits', 'Pacote', 'Quadro', 'Segmento'],
      answer: 'Quadro',
      explanation: 'Na camada 2 a unidade de dados é o quadro (frame), com cabeçalho MAC e trailer FCS.',
    },
    {
      question: 'Criptografia e codificação de caracteres são funções associadas a qual camada?',
      options: ['Sessão', 'Apresentação', 'Transporte', 'Rede'],
      answer: 'Apresentação',
      explanation: 'A camada 6 trata formato, codificação, compressão e criptografia dos dados.',
    },
    {
      question: 'Um switch tradicional toma decisões de encaminhamento com base em:',
      options: ['Endereço IP', 'Número de porta TCP', 'Endereço MAC', 'Nome de domínio'],
      answer: 'Endereço MAC',
      explanation: 'O switch é um dispositivo de camada 2 e usa a tabela de endereços MAC.',
    },
    {
      question: 'Durante o encapsulamento, qual camada adiciona um trailer (FCS) além do cabeçalho?',
      options: ['Física', 'Enlace', 'Rede', 'Transporte'],
      answer: 'Enlace',
      explanation: 'A camada de Enlace adiciona o FCS (Frame Check Sequence) ao final do quadro para detectar erros.',
    },
    {
      question: 'O ping no gateway funciona, mas sites não abrem por nome e abrem por IP. Onde está o problema?',
      options: ['Cabo de rede', 'Endereço MAC', 'DNS', 'Placa de rede'],
      answer: 'DNS',
      explanation: 'A conectividade IP está ok; a falha está na resolução de nomes.',
    },
  ],
  details: {
    objectives: [
      'Listar as sete camadas do OSI na ordem e a função de cada uma.',
      'Associar protocolos, PDUs e dispositivos às camadas corretas.',
      'Descrever o processo de encapsulamento e desencapsulamento.',
      'Aplicar o modelo OSI para isolar falhas de rede.',
    ],
    keyPoints: [
      'Camadas: 7 Aplicação, 6 Apresentação, 5 Sessão, 4 Transporte, 3 Rede, 2 Enlace, 1 Física.',
      'PDUs: dados → segmento → pacote → quadro → bits.',
      'Cada camada adiciona seu cabeçalho; a camada 2 também adiciona trailer.',
      'MACs mudam a cada salto; IPs se mantêm fim a fim (sem NAT).',
      'Troubleshooting por camadas evita "chutes" e acelera o diagnóstico.',
    ],
    commands: [
      { title: 'Teste rápido de cada camada', platform: 'Windows', code: 'ipconfig                 # camada 3: tenho IP?\nping 192.168.1.1         # camada 3: alcanço o gateway?\nnslookup example.com     # camada 7: DNS resolve?\nTest-NetConnection example.com -Port 443   # camada 4' },
      { title: 'Teste rápido de cada camada', platform: 'Linux/macOS', code: 'ip link                  # camada 1/2: interface UP?\nip route                 # camada 3: qual é o gateway?\nping -c 4 192.168.1.1\ndig example.com\nnc -zv example.com 443   # camada 4' },
    ],
    pitfalls: [
      { problem: 'Confundir a camada de Sessão com a de Transporte.', solution: 'Transporte entrega segmentos entre processos (portas); Sessão organiza o diálogo entre aplicações.' },
      { problem: 'Achar que o modelo OSI é implementado "ao pé da letra" na Internet.', solution: 'O OSI é um modelo de referência; a Internet usa a pilha TCP/IP, que agrupa camadas.' },
      { problem: 'Começar o diagnóstico reinstalando a aplicação quando o cabo está solto.', solution: 'Use um método sistemático (bottom-up ou dividir para conquistar).' },
    ],
    security: [
      'Existem ataques em todas as camadas: grampo físico (1), ARP spoofing (2), IP spoofing (3), SYN flood (4), injeção SQL (7).',
      'Defesa em profundidade: aplique controles em várias camadas, não apenas um firewall de borda.',
      'TLS (camada 6/7) protege os dados mesmo que camadas inferiores sejam interceptadas.',
    ],
    lab: {
      title: 'Enxergando as camadas no Wireshark',
      goal: 'Observar o encapsulamento real de uma requisição web.',
      tools: 'Wireshark e um navegador.',
      steps: [
        'Inicie a captura na interface ativa.',
        'Acesse http://example.com no navegador.',
        'Aplique o filtro "http" e selecione o pacote GET.',
        'No painel de detalhes, expanda Ethernet II, Internet Protocol, TCP e HTTP. Anote MACs, IPs e portas.',
      ],
      expected: 'Identificar quatro cabeçalhos empilhados e relacionar cada um com sua camada OSI.',
    },
    references: ['ISO/IEC 7498-1 — Modelo de Referência OSI', 'Cisco Networking Academy — CCNA ITN, módulo 3', 'Documentação do Wireshark (wireshark.org/docs)'],
  },
};
