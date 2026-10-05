import type { ModuleSeed } from '../types';

export const icmp: ModuleSeed = {
  slug: 'icmp',
  title: 'Módulo 13 — ICMP',
  stage: 'Intermediário',
  description: 'Mensagens de controle e erro: tipos e códigos, ping, traceroute, MTU e Path MTU Discovery, ICMPv6 e riscos.',
  accent: 'from-lime-500 to-green-500',
  objective: 'Entender as mensagens ICMP e usar ping e traceroute para diagnosticar conectividade, latência e o caminho dos pacotes.',
  summary: 'O ICMP é o "sistema de mensagens" da camada de rede: informa erros (destino inalcançável, TTL expirado) e permite testes como o ping.',
  lessons: [
    {
      slug: 'mensagens-icmp',
      title: 'Mensagens ICMP e o ping',
      introduction: 'O ICMP (Internet Control Message Protocol, RFC 792) é usado por hosts e roteadores para relatar erros e trocar informações de controle. Ele é transportado dentro do IP (protocolo número 1), mas é considerado parte da camada de rede.',
      why_it_matters: 'Ping e traceroute — as ferramentas de diagnóstico mais usadas do mundo — são baseadas em ICMP. E bloquear todo o ICMP sem critério quebra funções importantes da rede.',
      real_world: 'Quando você faz ping 8.8.8.8, seu computador envia ICMP Echo Request e o servidor responde com Echo Reply. O tempo de ida e volta (RTT) e o TTL da resposta aparecem na tela.',
      explanation: 'O ICMP não tem portas. Cada mensagem tem um Tipo e um Código. Por exemplo, Tipo 3 (Destination Unreachable) com Código 3 significa "porta inalcançável"; com Código 1, "host inalcançável".',
      exercise: 'Quais tipos de mensagem ICMP o ping utiliza?',
      exercise_answer: 'Tipo 8 (Echo Request), enviado pela origem, e Tipo 0 (Echo Reply), devolvido pelo destino.',
      challenge: 'Execute ping para três destinos (gateway, um site nacional e um internacional) e compare RTT e TTL. O que o TTL indica sobre a distância?',
      keywords: ['ICMP', 'ping', 'echo request', 'echo reply', 'tipo', 'código', 'RTT'],
      sections: [
        {
          title: 'Tipos ICMP mais importantes',
          table: {
            headers: ['Tipo', 'Nome', 'Uso'],
            rows: [
              ['0', 'Echo Reply', 'Resposta do ping'],
              ['3', 'Destination Unreachable', 'Rede, host, porta inalcançável; fragmentação necessária (código 4)'],
              ['5', 'Redirect', 'Roteador indica um caminho melhor'],
              ['8', 'Echo Request', 'Pedido do ping'],
              ['11', 'Time Exceeded', 'TTL chegou a zero (base do traceroute)'],
              ['12', 'Parameter Problem', 'Cabeçalho IP inválido'],
            ],
          },
        },
        {
          title: 'Lendo a saída do ping',
          code: 'Disparando 8.8.8.8 com 32 bytes de dados:\nResposta de 8.8.8.8: bytes=32 tempo=14ms TTL=118\nResposta de 8.8.8.8: bytes=32 tempo=13ms TTL=118\n\nPacotes: Enviados = 4, Recebidos = 4, Perdidos = 0 (0% de perda)',
          items: [
            'tempo: RTT, a latência de ida e volta.',
            'TTL: valor restante na resposta; servidores Linux costumam iniciar com 64 e Windows com 128.',
            'Perda: pacotes sem resposta — pode ser congestionamento, Wi-Fi ruim ou bloqueio.',
          ],
        },
        {
          title: 'Mensagens de erro comuns',
          table: {
            headers: ['Mensagem', 'Provável causa'],
            rows: [
              ['Esgotado o tempo limite do pedido / Request timed out', 'Host desligado, firewall bloqueando ICMP ou perda no caminho'],
              ['Host de destino inacessível', 'O gateway não consegue entregar (ARP sem resposta na rede de destino)'],
              ['Rede de destino inacessível', 'Não há rota para a rede'],
              ['Falha geral / Transmit failed', 'Problema local: placa, IP ou rota'],
            ],
          },
        },
      ],
    },
    {
      slug: 'traceroute-e-mtu',
      title: 'Traceroute, MTU e ICMPv6',
      introduction: 'O traceroute descobre o caminho até um destino explorando o campo TTL. Já o Path MTU Discovery usa ICMP para descobrir o maior pacote que passa pelo caminho sem fragmentação.',
      why_it_matters: 'O traceroute mostra onde a latência aumenta ou onde os pacotes param. Problemas de MTU causam sintomas estranhos, como sites que abrem pela metade ou VPNs que travam.',
      real_world: 'Um usuário reclama que um sistema está lento. O traceroute mostra latência baixa até o provedor e um salto de 180 ms em um enlace internacional — o problema está fora da rede da empresa.',
      explanation: 'O traceroute envia pacotes com TTL=1, depois TTL=2, e assim por diante. Cada roteador que zera o TTL devolve um ICMP Time Exceeded, revelando seu IP. Quando o destino responde, o caminho está completo.',
      exercise: 'Por que alguns saltos do traceroute aparecem como "* * *"?',
      exercise_answer: 'Porque aquele roteador não respondeu: pode estar configurado para não enviar ICMP Time Exceeded, limitar a taxa dessas mensagens ou um firewall pode estar bloqueando. Não significa necessariamente que o caminho está quebrado.',
      challenge: 'Faça um traceroute para um site em outro continente e identifique em qual salto o tráfego sai do Brasil (observe o aumento da latência e os nomes reversos).',
      keywords: ['traceroute', 'tracert', 'TTL', 'Time Exceeded', 'MTU', 'PMTUD', 'ICMPv6'],
      sections: [
        {
          title: 'Como o traceroute funciona',
          steps: [
            'Envia um pacote com TTL=1: o 1º roteador descarta e responde Time Exceeded.',
            'Envia com TTL=2: o 2º roteador responde.',
            'Repete aumentando o TTL, normalmente 3 sondas por salto.',
            'Quando o destino é alcançado, ele responde (Echo Reply no Windows; Port Unreachable no traceroute UDP do Linux).',
          ],
          content: 'O tracert do Windows usa ICMP Echo; o traceroute do Linux usa UDP por padrão (opção -I para ICMP, -T para TCP).',
        },
        {
          title: 'MTU e Path MTU Discovery',
          content: 'O MTU da Ethernet é 1500 bytes. Túneis (VPN, PPPoE) reduzem esse valor. Com o PMTUD, o host envia pacotes com o bit DF (Don\'t Fragment); se algum roteador não puder passar o pacote, responde ICMP Tipo 3 Código 4 ("fragmentação necessária") com o MTU suportado.',
          code: 'ping -f -l 1472 8.8.8.8      # Windows: 1472 + 28 de cabeçalhos = 1500\nping -M do -s 1472 8.8.8.8   # Linux',
        },
        {
          title: 'ICMPv6',
          items: [
            'No IPv6, o ICMPv6 é essencial: além de ping e erros, implementa o Neighbor Discovery (substituto do ARP) e o anúncio de roteadores (SLAAC).',
            'Bloquear todo o ICMPv6 quebra o IPv6. Siga as recomendações do RFC 4890 para filtrar com critério.',
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Quais mensagens ICMP o ping usa?',
      options: ['Tipo 3 e 11', 'Tipo 8 e 0', 'Tipo 5 e 12', 'Tipo 0 e 3'],
      answer: 'Tipo 8 e 0',
      explanation: 'Echo Request (8) e Echo Reply (0).',
    },
    {
      question: 'O traceroute descobre os roteadores do caminho usando qual campo do IP?',
      options: ['Checksum', 'TTL', 'Identification', 'Protocol'],
      answer: 'TTL',
      explanation: 'Cada roteador que zera o TTL responde com ICMP Time Exceeded, revelando seu endereço.',
    },
    {
      question: 'O ICMP usa portas como o TCP e o UDP?',
      options: ['Sim, a porta 7', 'Sim, a porta 53', 'Não, usa tipo e código', 'Sim, portas efêmeras'],
      answer: 'Não, usa tipo e código',
      explanation: 'O ICMP não tem portas; as mensagens são identificadas por tipo e código.',
    },
    {
      question: 'Uma resposta com TTL=118 a partir de um servidor provavelmente veio de um sistema que iniciou o TTL em:',
      options: ['64', '128', '255', '32'],
      answer: '128',
      explanation: 'O valor inicial mais próximo acima de 118 é 128 (típico de Windows); ele passou por 10 roteadores.',
    },
    {
      question: 'ICMP Tipo 3 Código 4 ("fragmentação necessária") é essencial para:',
      options: ['O DHCP', 'O Path MTU Discovery', 'O DNS', 'O ARP'],
      answer: 'O Path MTU Discovery',
      explanation: 'Bloquear essa mensagem causa "buracos negros" de MTU.',
    },
    {
      question: 'No IPv6, qual protocolo substitui o ARP e roda sobre ICMPv6?',
      options: ['DHCPv6', 'NDP (Neighbor Discovery)', 'RIPng', 'IGMP'],
      answer: 'NDP (Neighbor Discovery)',
      explanation: 'O NDP usa mensagens ICMPv6 de solicitação e anúncio de vizinhos.',
    },
  ],
  details: {
    objectives: [
      'Descrever a função do ICMP e seus principais tipos.',
      'Interpretar a saída do ping: RTT, TTL e perda.',
      'Explicar e usar o traceroute.',
      'Entender MTU, fragmentação e Path MTU Discovery.',
      'Filtrar ICMP com critério, sem quebrar a rede.',
    ],
    keyPoints: [
      'ICMP = mensagens de erro e controle da camada 3 (protocolo IP nº 1).',
      'Ping: Echo Request (8) / Echo Reply (0).',
      'Traceroute: TTL crescente + Time Exceeded (11).',
      'MTU Ethernet = 1500; PMTUD depende do ICMP tipo 3 código 4.',
      'ICMPv6 é indispensável para o IPv6 funcionar.',
    ],
    commands: [
      { title: 'Ping e traceroute', platform: 'Windows', code: 'ping -n 10 8.8.8.8\nping -t 192.168.1.1      # contínuo (Ctrl+C para parar)\ntracert example.com\npathping example.com     # traceroute + estatísticas de perda' },
      { title: 'Ping e traceroute', platform: 'Linux/macOS', code: 'ping -c 10 8.8.8.8\ntraceroute example.com\ntraceroute -I example.com   # usa ICMP\nmtr example.com             # traceroute contínuo' },
      { title: 'Ping estendido no equipamento', platform: 'Cisco IOS', code: 'ping 8.8.8.8 repeat 100 size 1400\ntraceroute 8.8.8.8' },
    ],
    pitfalls: [
      { problem: 'Concluir que um host está desligado porque não responde ao ping.', solution: 'Muitos hosts (ex.: Windows com firewall ativo) bloqueiam ICMP; teste também uma porta TCP.' },
      { problem: 'Achar que "* * *" no meio do traceroute significa falha.', solution: 'Se os saltos seguintes respondem, aquele roteador apenas não envia ICMP.' },
      { problem: 'Bloquear todo ICMP no firewall.', solution: 'Permita ao menos tipo 3 (inclusive código 4) e tipo 11; limite a taxa do echo.' },
    ],
    security: [
      'Ping flood e smurf attack (ICMP para broadcast com IP falsificado) são ataques clássicos: limite a taxa e desabilite directed broadcast.',
      'O ICMP pode ser usado para reconhecimento (descobrir hosts ativos); avalie bloquear echo vindo da Internet.',
      'ICMP Redirect pode ser abusado para desviar tráfego; desabilite em hosts e roteadores quando não for necessário.',
    ],
    lab: {
      title: 'Diagnóstico com ping, traceroute e MTU',
      goal: 'Medir latência, mapear o caminho e descobrir o MTU efetivo.',
      tools: 'Terminal (ping, tracert/traceroute) e opcionalmente mtr.',
      steps: [
        'Faça ping no gateway, no DNS do provedor e em 8.8.8.8; anote RTT e TTL.',
        'Execute tracert/traceroute até um site internacional e identifique o salto de maior aumento de latência.',
        'Descubra o maior tamanho de ping sem fragmentação (comece em 1472 e diminua).',
        'Calcule o MTU: tamanho encontrado + 28 bytes.',
      ],
      expected: 'MTU de 1500 em conexões diretas, ou menor (ex.: 1492) em conexões PPPoE.',
    },
    references: ['RFC 792 — Internet Control Message Protocol', 'RFC 1191 — Path MTU Discovery', 'RFC 4443 — ICMPv6', 'RFC 4890 — Recommendations for Filtering ICMPv6'],
  },
};
