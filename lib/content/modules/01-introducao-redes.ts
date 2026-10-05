import type { ModuleSeed } from '../types';

export const introducaoRedes: ModuleSeed = {
  slug: 'introducao-redes',
  title: 'Módulo 1 — Introdução às Redes',
  stage: 'Básico',
  description: 'O que é uma rede, tipos (LAN, WAN, WLAN…), topologias, meios de transmissão, dispositivos e métricas de desempenho.',
  accent: 'from-blue-500 to-cyan-400',
  objective: 'Compreender o papel das redes na comunicação digital e a relação entre dispositivos, meios físicos, protocolos e a Internet.',
  summary: 'Redes conectam dispositivos para compartilhar recursos e informações. Entender tipos, topologias, meios e métricas é a base para todo o resto do curso.',
  lessons: [
    {
      slug: 'fundamentos-de-redes',
      title: 'Fundamentos de redes',
      introduction: 'Uma rede de computadores é um conjunto de dispositivos (nós) interligados por um meio de transmissão e que seguem regras comuns — os protocolos — para trocar informações. Ela pode ser doméstica, corporativa ou global, como a própria Internet.',
      why_it_matters: 'Sem redes, computadores não conseguiriam compartilhar arquivos, navegar na web, enviar mensagens, fazer chamadas de vídeo ou acessar serviços em nuvem. Praticamente toda a TI moderna depende delas.',
      real_world: 'Ao abrir um site, o navegador envia uma requisição que passa pelo Wi-Fi, pelo roteador de casa, pela rede do provedor (ISP) e por vários roteadores da Internet até o servidor, que devolve a página pelo caminho inverso — tudo em milissegundos.',
      explanation: 'Pense em uma rede como o sistema de correios: cada casa tem um endereço (IP), as cartas seguem regras de formato (protocolos), as ruas são os cabos e ondas de rádio (meios físicos), e as agências de triagem são os roteadores. A Internet é a "rede das redes": milhões de redes independentes interligadas pelos mesmos protocolos (TCP/IP).',
      exercise: 'Qual é a diferença entre uma rede local (LAN) e a Internet?',
      exercise_answer: 'A LAN é uma rede de alcance limitado (casa, escritório, prédio), administrada por uma única organização. A Internet é a interligação global de milhões de redes independentes, administradas por diferentes organizações, que se comunicam usando TCP/IP.',
      challenge: 'Descreva, com suas palavras, o caminho que uma mensagem de WhatsApp percorre do seu celular até o celular de um amigo em outra cidade. Cite pelo menos quatro equipamentos envolvidos.',
      keywords: ['rede', 'Internet', 'LAN', 'WAN', 'cliente', 'servidor', 'protocolo'],
      sections: [
        {
          title: 'Componentes de uma rede',
          items: [
            'Dispositivos finais (hosts): computadores, celulares, servidores, impressoras, câmeras IP.',
            'Dispositivos intermediários: switches, roteadores, access points, firewalls.',
            'Meios de transmissão: cabo de par trançado, fibra óptica, ondas de rádio (Wi-Fi, 4G/5G).',
            'Protocolos: regras de comunicação, como IP, TCP, HTTP e DNS.',
            'Serviços: aplicações que usam a rede, como web, e-mail e streaming.',
          ],
        },
        {
          title: 'Tipos de rede por abrangência',
          table: {
            headers: ['Tipo', 'Significado', 'Alcance típico', 'Exemplo'],
            rows: [
              ['PAN', 'Personal Area Network', 'Poucos metros', 'Fone Bluetooth ligado ao celular'],
              ['LAN', 'Local Area Network', 'Sala, andar, prédio', 'Rede do escritório'],
              ['WLAN', 'Wireless LAN', 'Dezenas de metros', 'Wi-Fi de casa'],
              ['MAN', 'Metropolitan Area Network', 'Uma cidade', 'Rede que liga campi de uma universidade'],
              ['WAN', 'Wide Area Network', 'Países e continentes', 'Internet, links entre filiais'],
              ['SAN', 'Storage Area Network', 'Data center', 'Rede dedicada a armazenamento'],
            ],
          },
        },
        {
          title: 'Cliente-servidor e P2P',
          content: 'No modelo cliente-servidor, o cliente solicita e o servidor responde — é assim que funcionam a web e o e-mail. No modelo peer-to-peer (P2P), cada nó pode ser cliente e servidor ao mesmo tempo, como no BitTorrent.',
          example: 'Navegador (cliente) pedindo a página a um servidor web; compartilhamento de arquivos via torrent (P2P).',
        },
        {
          title: 'Uma breve história',
          steps: [
            '1969 — ARPANET conecta as primeiras universidades nos EUA usando comutação de pacotes.',
            '1974 — Vint Cerf e Bob Kahn publicam o desenho do TCP/IP.',
            '1983 — A ARPANET adota oficialmente o TCP/IP; nasce a Internet moderna.',
            '1991 — Tim Berners-Lee disponibiliza a World Wide Web (HTTP + HTML).',
            'Hoje — bilhões de dispositivos, IoT, nuvem, 5G e IPv6.',
          ],
        },
      ],
    },
    {
      slug: 'topologias-e-comunicacao',
      title: 'Topologias e comunicação',
      introduction: 'Topologia é a forma como os dispositivos estão organizados e interligados. A topologia física descreve os cabos e equipamentos; a lógica descreve como os dados realmente circulam.',
      why_it_matters: 'A topologia define desempenho, redundância, custo e facilidade de manutenção. Escolher errado pode criar pontos únicos de falha ou encarecer a rede.',
      real_world: 'Uma empresa com vários departamentos geralmente usa estrela (ou estrela estendida): cada computador vai até um switch do andar, e os switches dos andares vão até o núcleo da rede. Backbones de provedores usam malha para ter caminhos alternativos.',
      explanation: 'Na estrela, todos se conectam a um ponto central. Se um cabo cai, só aquele host para; se o switch central cai, todos param. Na malha, há vários caminhos entre os nós, o que aumenta a disponibilidade, mas também o custo e a complexidade.',
      exercise: 'Qual topologia é mais comum em redes corporativas modernas e por quê?',
      exercise_answer: 'A estrela (ou estrela estendida/hierárquica). Ela é fácil de instalar e de diagnosticar, uma falha em um cabo afeta apenas um host e ela cresce adicionando portas ou switches.',
      challenge: 'Compare uma rede em estrela com uma em barramento em termos de resiliência, desempenho e manutenção. Em qual delas um único cabo rompido pode derrubar todos os computadores?',
      keywords: ['topologia', 'estrela', 'barramento', 'anel', 'malha', 'híbrida'],
      sections: [
        {
          title: 'Comparativo de topologias',
          table: {
            headers: ['Topologia', 'Vantagens', 'Desvantagens'],
            rows: [
              ['Barramento', 'Barata, pouco cabo', 'Um rompimento derruba tudo; colisões; obsoleta'],
              ['Anel', 'Tráfego previsível', 'Falha em um nó pode interromper o anel (salvo anel duplo)'],
              ['Estrela', 'Fácil de gerenciar e expandir; falhas isoladas', 'Ponto central é ponto único de falha'],
              ['Malha', 'Alta redundância e disponibilidade', 'Cara e complexa; muitos links'],
              ['Híbrida', 'Combina vantagens conforme a necessidade', 'Projeto e documentação mais complexos'],
            ],
          },
        },
        {
          title: 'Meios de transmissão',
          items: [
            'Par trançado (UTP/STP): Cat5e (1 Gbps), Cat6 (1 Gbps; 10 Gbps até ~55 m), Cat6a (10 Gbps até 100 m). Limite padrão: 100 m por lance.',
            'Fibra óptica multimodo: distâncias de centenas de metros, mais barata, comum dentro de prédios.',
            'Fibra óptica monomodo: dezenas de quilômetros, usada por provedores e entre prédios. Imune a interferência eletromagnética.',
            'Sem fio: Wi-Fi (IEEE 802.11), Bluetooth, redes celulares 4G/5G, enlaces de rádio e satélite.',
          ],
        },
        {
          title: 'Métricas de desempenho',
          table: {
            headers: ['Métrica', 'O que mede', 'Exemplo'],
            rows: [
              ['Largura de banda', 'Capacidade máxima do link', 'Plano de 500 Mbps'],
              ['Throughput', 'Taxa real alcançada', 'Speedtest mostra 430 Mbps'],
              ['Latência', 'Tempo de ida (ou ida e volta, RTT) de um pacote', 'Ping de 12 ms'],
              ['Jitter', 'Variação da latência', 'Chamadas de voz "picotando"'],
              ['Perda de pacotes', '% de pacotes que não chegam', '2% de perda em Wi-Fi ruim'],
            ],
          },
        },
        {
          title: 'Bits, bytes e velocidades',
          content: 'Velocidades de rede são medidas em bits por segundo (bps); tamanhos de arquivo, em bytes (B). 1 byte = 8 bits. Por isso, um link de 100 Mbps transfere no máximo cerca de 12,5 MB/s.',
          example: 'Baixar um arquivo de 1 GB em um link de 100 Mbps leva no mínimo ~80 segundos (8.000 Mb ÷ 100 Mbps).',
        },
      ],
    },
    {
      slug: 'dispositivos-e-padroes',
      title: 'Dispositivos de rede e padrões',
      introduction: 'Cada equipamento de rede tem um papel específico. Conhecer o que cada um faz — e em que camada atua — é essencial para projetar e diagnosticar redes.',
      why_it_matters: 'Confundir hub com switch, ou switch com roteador, leva a projetos ruins e diagnósticos errados. Além disso, padrões abertos garantem que equipamentos de fabricantes diferentes conversem entre si.',
      real_world: 'O "roteador" doméstico é na verdade um equipamento multifunção: roteador + switch de 4 portas + access point Wi-Fi + servidor DHCP + NAT + firewall básico.',
      explanation: 'O hub repete o sinal para todas as portas (camada 1). O switch aprende endereços MAC e entrega o quadro só na porta certa (camada 2). O roteador interliga redes diferentes usando endereços IP (camada 3). O firewall filtra o tráfego segundo regras de segurança.',
      exercise: 'Por que o hub caiu em desuso e foi substituído pelo switch?',
      exercise_answer: 'O hub repete tudo para todas as portas, criando um único domínio de colisão, desperdiçando banda e expondo o tráfego a todos. O switch encaminha cada quadro apenas para a porta de destino, opera em full duplex e elimina colisões.',
      challenge: 'Liste todos os dispositivos de rede da sua casa ou escola e classifique cada um como dispositivo final ou intermediário.',
      keywords: ['hub', 'switch', 'roteador', 'access point', 'modem', 'IEEE', 'IETF', 'RFC'],
      sections: [
        {
          title: 'Principais dispositivos',
          table: {
            headers: ['Dispositivo', 'Camada OSI', 'Função'],
            rows: [
              ['Hub', '1 — Física', 'Repete o sinal para todas as portas'],
              ['Switch', '2 — Enlace', 'Encaminha quadros pelo endereço MAC'],
              ['Access Point', '2 — Enlace', 'Conecta clientes sem fio à rede cabeada'],
              ['Roteador', '3 — Rede', 'Encaminha pacotes entre redes pelo endereço IP'],
              ['Modem/ONT', '1 — Física', 'Converte sinais do provedor (DSL, cabo, fibra)'],
              ['Firewall', '3 a 7', 'Permite ou bloqueia tráfego segundo regras'],
            ],
          },
        },
        {
          title: 'Quem define os padrões',
          items: [
            'IEEE: padrões de enlace e físicos, como Ethernet (802.3) e Wi-Fi (802.11).',
            'IETF: protocolos da Internet, publicados como RFCs (Request for Comments), como o IP (RFC 791).',
            'ISO: criou o modelo de referência OSI.',
            'IANA/ICANN: coordenam endereços IP, números de porta e nomes de domínio.',
          ],
        },
        {
          title: 'Comutação de pacotes',
          content: 'A Internet usa comutação de pacotes: a mensagem é dividida em pequenos pedaços que viajam de forma independente e são remontados no destino. Isso permite que muitos usuários compartilhem os mesmos links com eficiência — ao contrário da antiga telefonia, que reservava um circuito exclusivo por chamada.',
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Qual dispositivo normalmente conecta computadores em uma mesma rede local?',
      options: ['Switch', 'Servidor DNS', 'Modem', 'Firewall'],
      answer: 'Switch',
      explanation: 'O switch encaminha quadros dentro da rede local com base nos endereços MAC.',
    },
    {
      question: 'Qual topologia oferece maior redundância entre caminhos de comunicação?',
      options: ['Barramento', 'Estrela', 'Malha', 'Anel'],
      answer: 'Malha',
      explanation: 'Na malha há múltiplos caminhos entre nós, reduzindo a dependência de um único ponto de falha.',
    },
    {
      question: 'Um link de 200 Mbps transfere, no máximo, aproximadamente quantos megabytes por segundo?',
      options: ['200 MB/s', '25 MB/s', '1.600 MB/s', '20 MB/s'],
      answer: '25 MB/s',
      explanation: '1 byte = 8 bits. 200 Mbps ÷ 8 = 25 MB/s.',
    },
    {
      question: 'Qual é o comprimento máximo padrão de um lance de cabo de par trançado Ethernet?',
      options: ['10 metros', '50 metros', '100 metros', '500 metros'],
      answer: '100 metros',
      explanation: 'Os padrões Ethernet sobre par trançado (como 1000BASE-T) especificam até 100 m por segmento.',
    },
    {
      question: 'A variação no atraso entre pacotes consecutivos é chamada de:',
      options: ['Throughput', 'Jitter', 'Largura de banda', 'Latência'],
      answer: 'Jitter',
      explanation: 'Jitter é a variação da latência; é crítico para voz e vídeo em tempo real.',
    },
    {
      question: 'Qual rede tem a maior abrangência geográfica?',
      options: ['PAN', 'LAN', 'MAN', 'WAN'],
      answer: 'WAN',
      explanation: 'A WAN cobre países e continentes; a Internet é o maior exemplo.',
    },
  ],
  details: {
    objectives: [
      'Definir o que é uma rede de computadores e identificar seus componentes.',
      'Diferenciar PAN, LAN, WLAN, MAN, WAN e SAN.',
      'Comparar topologias físicas e escolher a mais adequada a um cenário.',
      'Distinguir largura de banda, throughput, latência e jitter.',
      'Identificar a função de hub, switch, roteador, access point e firewall.',
    ],
    keyPoints: [
      'Rede = dispositivos + meio de transmissão + protocolos.',
      'A Internet é a interligação de milhões de redes usando TCP/IP.',
      'Estrela é a topologia mais comum em LANs; malha é usada onde redundância é crítica.',
      'Largura de banda é a capacidade; throughput é o que você realmente obtém.',
      '1 byte = 8 bits: divida Mbps por 8 para obter MB/s.',
    ],
    commands: [
      { title: 'Ver as interfaces e o IP da máquina', platform: 'Windows', code: 'ipconfig /all', note: 'Mostra IP, máscara, gateway, DNS e endereço MAC de cada adaptador.' },
      { title: 'Ver as interfaces e o IP da máquina', platform: 'Linux/macOS', code: 'ip addr show        # Linux\nifconfig            # macOS / Linux antigo' },
      { title: 'Medir latência até um servidor', platform: 'Multiplataforma', code: 'ping 8.8.8.8', note: 'O tempo (time=) é o RTT — a latência de ida e volta.' },
    ],
    pitfalls: [
      { problem: 'Achar que um plano de 300 Mbps baixa arquivos a 300 MB/s.', solution: 'Lembre de dividir por 8: o máximo teórico é 37,5 MB/s.' },
      { problem: 'Chamar o equipamento do provedor de "roteador" quando ele só é modem/ONT.', solution: 'Verifique se ele faz roteamento/NAT ou se está em modo bridge.' },
      { problem: 'Passar cabo de rede com mais de 100 m e ter quedas intermitentes.', solution: 'Use um switch intermediário ou fibra óptica para distâncias maiores.' },
    ],
    security: [
      'Toda rede conectada à Internet está exposta: use senhas fortes nos equipamentos e troque as senhas de fábrica.',
      'Redes sem fio devem usar WPA2 ou, de preferência, WPA3 — nunca redes abertas para dados sensíveis.',
      'Mantenha o firmware de roteadores e access points atualizado.',
    ],
    lab: {
      title: 'Mapeando a sua rede',
      goal: 'Descobrir os componentes e as métricas reais da rede que você usa.',
      tools: 'Terminal (cmd/PowerShell ou bash) e um navegador.',
      steps: [
        'Rode ipconfig /all (Windows) ou ip addr (Linux) e anote seu IP, máscara, gateway e endereço MAC.',
        'Faça ping no gateway e em 8.8.8.8; compare as latências.',
        'Faça um teste de velocidade e compare o throughput com o plano contratado.',
        'Desenhe a topologia da sua rede: dispositivos finais, roteador, switch/Wi-Fi e a saída para a Internet.',
      ],
      expected: 'Um diagrama simples da rede com IPs anotados e a observação de que a latência até o gateway é bem menor que até a Internet.',
    },
    references: ['RFC 1122 — Requirements for Internet Hosts', 'IEEE 802.3 (Ethernet) e IEEE 802.11 (Wi-Fi)', 'Kurose & Ross — Redes de Computadores e a Internet, cap. 1'],
  },
};
