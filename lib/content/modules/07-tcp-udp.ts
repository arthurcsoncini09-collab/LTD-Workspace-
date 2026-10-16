import type { ModuleSeed } from '../types';

export const tcpUdp: ModuleSeed = {
  slug: 'tcp-udp',
  title: 'Módulo 7 — TCP e UDP',
  stage: 'Intermediário',
  description: 'Os protocolos de transporte: handshake, números de sequência, janela deslizante, controle de congestionamento, UDP e QUIC.',
  accent: 'from-orange-500 to-amber-400',
  objective: 'Comparar TCP e UDP, entender como o TCP garante entrega confiável e saber escolher o protocolo adequado para cada aplicação.',
  summary: 'O TCP é orientado a conexão e confiável: numera, confirma e retransmite. O UDP é simples e rápido: envia e não espera confirmação. A escolha depende do que a aplicação valoriza mais.',
  lessons: [
    {
      slug: 'tcp-vs-udp',
      title: 'TCP vs UDP',
      introduction: 'A camada de transporte entrega dados entre processos (aplicações), identificados por portas. Os dois protocolos principais são o TCP (Transmission Control Protocol) e o UDP (User Datagram Protocol).',
      why_it_matters: 'Escolher o protocolo errado prejudica a aplicação: um download com UDP sem tratamento corromperia arquivos; uma chamada de voz com TCP sofreria atrasos por retransmissões que já não servem para nada.',
      real_world: 'Navegação web, e-mail e SSH usam TCP. DNS, VoIP, jogos online, streaming ao vivo e DHCP usam UDP. O HTTP/3 roda sobre QUIC, que é construído em cima do UDP.',
      explanation: 'O TCP é como uma carta registrada com aviso de recebimento: há confirmação, ordem e reenvio se algo se perder. O UDP é como gritar uma informação numa sala: é rápido, mas ninguém confirma se ouviu.',
      exercise: 'Por que jogos online e chamadas de vídeo preferem UDP?',
      exercise_answer: 'Porque latência baixa importa mais do que entregar 100% dos dados. Um pacote de voz atrasado é inútil; retransmiti-lo só aumentaria o atraso.',
      challenge: 'Classifique como TCP ou UDP: download de arquivo, consulta DNS, transmissão ao vivo, acesso SSH, DHCP, envio de e-mail.',
      keywords: ['TCP', 'UDP', 'orientado a conexão', 'confiabilidade', 'datagrama', 'QUIC'],
      sections: [
        {
          title: 'Comparativo',
          table: {
            headers: ['Característica', 'TCP', 'UDP'],
            rows: [
              ['Conexão', 'Orientado a conexão (handshake)', 'Sem conexão'],
              ['Confiabilidade', 'Confirmações (ACK) e retransmissão', 'Sem garantia de entrega'],
              ['Ordem', 'Entrega em ordem', 'Pode chegar fora de ordem'],
              ['Controle de fluxo/congestionamento', 'Sim', 'Não'],
              ['Cabeçalho', '20 a 60 bytes', '8 bytes'],
              ['Velocidade/latência', 'Maior overhead', 'Mínimo overhead'],
              ['Exemplos', 'HTTP/1.1, HTTP/2, SSH, SMTP, FTP', 'DNS, DHCP, VoIP, jogos, SNMP, QUIC'],
            ],
          },
        },
        {
          title: 'Cabeçalho UDP (8 bytes)',
          code: '| Porta de origem (16) | Porta de destino (16) |\n| Comprimento (16)     | Checksum (16)         |',
        },
        {
          title: 'QUIC: o melhor dos dois mundos',
          content: 'O QUIC (RFC 9000), criado pelo Google e padronizado pelo IETF, roda sobre UDP mas implementa confiabilidade, controle de congestionamento e criptografia TLS 1.3 integrada. Ele reduz a latência de conexão e evita o "bloqueio na cabeça da fila" do TCP. É a base do HTTP/3.',
        },
      ],
    },
    {
      slug: 'handshake-e-confiabilidade',
      title: 'Handshake, sequência e confiabilidade do TCP',
      introduction: 'Antes de trocar dados, o TCP estabelece uma conexão com o three-way handshake. Durante a troca, cada byte é numerado e confirmado. No fim, a conexão é encerrada de forma ordenada.',
      why_it_matters: 'Entender o handshake explica erros como "connection refused" e "timeout", ataques de SYN flood e o que o Wireshark mostra em uma captura.',
      real_world: 'Ao abrir um site, a primeira coisa que o navegador faz após o DNS é o handshake TCP com a porta 443. Em uma rede com alta latência, só esse handshake já adiciona um RTT inteiro de atraso.',
      explanation: 'O cliente envia SYN com um número de sequência inicial (ISN). O servidor responde SYN-ACK com seu próprio ISN e confirma o do cliente (ACK = ISN+1). O cliente envia ACK. A partir daí, ambos sabem de onde começa a contagem de bytes do outro.',
      exercise: 'Quais são as três mensagens do three-way handshake, na ordem?',
      exercise_answer: 'SYN (cliente → servidor), SYN-ACK (servidor → cliente) e ACK (cliente → servidor).',
      challenge: 'Um servidor recebe milhares de SYN de IPs falsos e nunca recebe o ACK final. Que ataque é esse e como mitigá-lo?',
      keywords: ['three-way handshake', 'SYN', 'ACK', 'FIN', 'RST', 'janela', 'retransmissão'],
      sections: [
        {
          title: 'Three-way handshake',
          code: 'Cliente                          Servidor\n  | ---- SYN  seq=100 -----------> |\n  | <--- SYN-ACK seq=300 ack=101 -- |\n  | ---- ACK  seq=101 ack=301 ----> |\n  |      conexão ESTABLISHED        |',
        },
        {
          title: 'Encerramento (four-way)',
          steps: [
            'Lado A envia FIN: "terminei de enviar".',
            'Lado B confirma com ACK.',
            'Lado B envia seu FIN quando também terminar.',
            'Lado A confirma com ACK e aguarda em TIME_WAIT antes de liberar a porta.',
          ],
          content: 'Um RST (reset) encerra a conexão abruptamente — por exemplo, quando não há serviço escutando na porta.',
        },
        {
          title: 'Mecanismos de confiabilidade e desempenho',
          items: [
            'Números de sequência e ACK: cada byte é numerado; o ACK indica o próximo byte esperado.',
            'Retransmissão: se o ACK não chegar dentro do tempo (RTO) ou chegarem 3 ACKs duplicados, o segmento é reenviado.',
            'Janela deslizante (controle de fluxo): o receptor anuncia quantos bytes ainda consegue receber.',
            'Controle de congestionamento: slow start, congestion avoidance e algoritmos como CUBIC e BBR ajustam a taxa à capacidade da rede.',
            'MSS: tamanho máximo de dados por segmento, negociado no handshake (tipicamente 1460 bytes).',
          ],
        },
        {
          title: 'Flags TCP',
          table: {
            headers: ['Flag', 'Significado'],
            rows: [
              ['SYN', 'Iniciar conexão / sincronizar números de sequência'],
              ['ACK', 'Campo de confirmação é válido'],
              ['FIN', 'Encerrar a conexão de forma ordenada'],
              ['RST', 'Reiniciar/abortar a conexão'],
              ['PSH', 'Entregar os dados imediatamente à aplicação'],
              ['URG', 'Dados urgentes (raramente usado)'],
            ],
          },
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Qual protocolo é orientado a conexão?',
      options: ['UDP', 'TCP', 'IP', 'ICMP'],
      answer: 'TCP',
      explanation: 'O TCP estabelece uma conexão com o three-way handshake antes de enviar dados.',
    },
    {
      question: 'Qual é a sequência correta do three-way handshake?',
      options: ['SYN, ACK, FIN', 'SYN, SYN-ACK, ACK', 'ACK, SYN, SYN-ACK', 'SYN, FIN, ACK'],
      answer: 'SYN, SYN-ACK, ACK',
      explanation: 'Cliente envia SYN, servidor responde SYN-ACK e cliente confirma com ACK.',
    },
    {
      question: 'Qual o tamanho do cabeçalho UDP?',
      options: ['8 bytes', '20 bytes', '32 bytes', '60 bytes'],
      answer: '8 bytes',
      explanation: 'O cabeçalho UDP tem apenas 4 campos de 16 bits: portas, comprimento e checksum.',
    },
    {
      question: 'Qual aplicação tipicamente usa UDP?',
      options: ['SSH', 'Transferência de arquivos por FTP', 'Consulta DNS', 'Envio de e-mail por SMTP'],
      answer: 'Consulta DNS',
      explanation: 'Consultas DNS usam UDP na porta 53 (TCP é usado para respostas grandes e transferências de zona).',
    },
    {
      question: 'O mecanismo em que o receptor informa quantos bytes ainda pode receber chama-se:',
      options: ['Checksum', 'Janela deslizante', 'TTL', 'Fragmentação'],
      answer: 'Janela deslizante',
      explanation: 'O campo Window do TCP implementa o controle de fluxo.',
    },
    {
      question: 'O HTTP/3 utiliza qual protocolo de transporte?',
      options: ['TCP', 'SCTP', 'QUIC sobre UDP', 'ICMP'],
      answer: 'QUIC sobre UDP',
      explanation: 'O HTTP/3 roda sobre QUIC, que é implementado em cima do UDP.',
    },
  ],
  details: {
    objectives: [
      'Diferenciar TCP e UDP e escolher o adequado para cada aplicação.',
      'Descrever o three-way handshake e o encerramento de conexões.',
      'Explicar sequência, ACK, retransmissão e janela deslizante.',
      'Reconhecer o QUIC como evolução do transporte na web.',
    ],
    keyPoints: [
      'TCP: confiável, ordenado, com conexão. UDP: rápido, simples, sem garantias.',
      'Handshake: SYN → SYN-ACK → ACK.',
      'ACK indica o próximo byte esperado.',
      'Controle de fluxo (janela) ≠ controle de congestionamento.',
      'HTTP/3 = QUIC sobre UDP.',
    ],
    commands: [
      { title: 'Ver estados das conexões TCP', platform: 'Linux/macOS', code: 'ss -tan state established\nss -tan | awk \'{print $1}\' | sort | uniq -c   # contagem por estado' },
      { title: 'Ver conexões e processos', platform: 'Windows', code: 'netstat -ano | findstr ESTABLISHED\nGet-NetTCPConnection -State Established' },
      { title: 'Testar uma porta TCP e uma UDP', platform: 'Linux/macOS', code: 'nc -zv example.com 443       # TCP\nnc -zvu 8.8.8.8 53           # UDP (resultado menos confiável)' },
    ],
    pitfalls: [
      { problem: 'Achar que UDP é "pior" que TCP.', solution: 'São ferramentas para necessidades diferentes; UDP é ideal para tempo real.' },
      { problem: 'Interpretar "connection refused" como problema de rede.', solution: 'Refused (RST) significa que o host respondeu, mas nada escuta naquela porta. Timeout é que costuma indicar firewall ou rota.' },
      { problem: 'Confundir número de sequência com número do pacote.', solution: 'O TCP numera bytes, não segmentos.' },
    ],
    security: [
      'SYN flood esgota a fila de conexões semiabertas: mitigue com SYN cookies, rate limiting e proteção anti-DDoS.',
      'Ataques de amplificação UDP (DNS, NTP, Memcached) usam IP de origem falsificado; feche serviços UDP abertos desnecessariamente.',
      'Port scanning com SYN (nmap -sS) é comum: monitore com IDS.',
    ],
    lab: {
      title: 'Capturando um handshake TCP',
      goal: 'Ver SYN, SYN-ACK, ACK e o encerramento FIN no Wireshark.',
      tools: 'Wireshark e navegador ou curl.',
      steps: [
        'Inicie a captura e aplique o filtro "tcp.port == 80".',
        'Execute curl http://example.com.',
        'Identifique as três mensagens do handshake e anote seq e ack de cada uma.',
        'Localize o encerramento com FIN e observe os ACKs correspondentes.',
        'Compare com uma consulta DNS (filtro "udp.port == 53"): não há handshake.',
      ],
      expected: 'Handshake com números relativos seq=0/ack=1 e uma consulta DNS UDP de um único pacote de ida e um de volta.',
    },
    references: ['RFC 9293 — Transmission Control Protocol', 'RFC 768 — User Datagram Protocol', 'RFC 9000 — QUIC', 'RFC 5681 — TCP Congestion Control'],
  },
};
