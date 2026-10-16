import type { ModuleSeed } from '../types';

export const natPat: ModuleSeed = {
  slug: 'nat-e-pat',
  title: 'Módulo 16 — NAT e PAT',
  stage: 'Avançado',
  description: 'Tradução de endereços: NAT estático, dinâmico, PAT/overload, terminologia inside/outside, port forwarding, CGNAT e limitações.',
  accent: 'from-pink-500 to-rose-500',
  objective: 'Entender por que o NAT existe, diferenciar seus tipos, ler uma tabela de tradução e configurar NAT/PAT e port forwarding.',
  summary: 'O NAT traduz endereços privados em públicos na borda da rede. O PAT (NAT overload) permite que centenas de dispositivos compartilhem um único IP público usando portas diferentes.',
  lessons: [
    {
      slug: 'tipos-de-nat',
      title: 'Por que o NAT existe e seus tipos',
      introduction: 'NAT (Network Address Translation) é a tradução do endereço IP (e às vezes da porta) de um pacote ao atravessar um roteador. Ele surgiu para economizar endereços IPv4 públicos, que se tornaram escassos.',
      why_it_matters: 'Praticamente toda rede doméstica e corporativa usa NAT. Entender a tradução é essencial para publicar serviços, diagnosticar VPNs e jogos online, e configurar firewalls.',
      real_world: 'Na sua casa, 10 dispositivos com IPs 192.168.0.x acessam a Internet ao mesmo tempo, todos aparecendo para os sites com o mesmo IP público do roteador — isso é PAT.',
      explanation: 'O roteador guarda uma tabela de traduções. Na saída, troca o IP:porta privado de origem por IP:porta público e anota a associação. Na volta, consulta a tabela e desfaz a troca para entregar ao host interno correto.',
      exercise: 'Qual tipo de NAT permite que muitos hosts compartilhem um único IP público?',
      exercise_answer: 'O PAT (Port Address Translation), também chamado NAT overload ou NAPT, que diferencia as conexões pela porta de origem.',
      challenge: 'Descubra seu IP privado (ipconfig/ip addr) e seu IP público (pesquise "qual meu IP"). Explique por que são diferentes.',
      keywords: ['NAT', 'PAT', 'overload', 'NAT estático', 'NAT dinâmico', 'inside local', 'inside global'],
      sections: [
        {
          title: 'Tipos de NAT',
          table: {
            headers: ['Tipo', 'Mapeamento', 'Uso típico'],
            rows: [
              ['NAT estático', '1 IP privado ↔ 1 IP público fixo', 'Publicar um servidor interno'],
              ['NAT dinâmico', 'IPs privados ↔ pool de IPs públicos (1:1 temporário)', 'Pouco usado hoje'],
              ['PAT / overload', 'Muitos IPs privados ↔ 1 IP público, diferenciados por porta', 'Casas e empresas (o mais comum)'],
              ['Port forwarding', 'IP público:porta → IP privado:porta (estático por porta)', 'Expor um serviço específico (ex.: câmera, jogo)'],
            ],
          },
        },
        {
          title: 'Terminologia Cisco',
          table: {
            headers: ['Termo', 'Significado', 'Exemplo'],
            rows: [
              ['Inside local', 'IP do host interno, visto de dentro', '192.168.1.10'],
              ['Inside global', 'IP do host interno, visto de fora (após NAT)', '203.0.113.5'],
              ['Outside global', 'IP real do destino externo', '93.184.215.14'],
              ['Outside local', 'IP do destino externo, visto de dentro', '93.184.215.14 (geralmente igual)'],
            ],
          },
        },
        {
          title: 'Tabela de tradução PAT',
          code: 'Pro  Inside local          Inside global         Outside global\ntcp  192.168.1.10:51544    203.0.113.5:51544     93.184.215.14:443\ntcp  192.168.1.11:51544    203.0.113.5:1024      93.184.215.14:443\nudp  192.168.1.12:60001    203.0.113.5:60001     8.8.8.8:53',
          content: 'Repare que, quando dois hosts usam a mesma porta de origem, o roteador troca a porta de um deles para manter cada conexão única.',
        },
      ],
    },
    {
      slug: 'configuracao-e-limites-do-nat',
      title: 'Configuração, port forwarding e limitações',
      introduction: 'Configurar NAT exige definir quais interfaces são internas e externas, quais endereços serão traduzidos e para qual endereço. Também é preciso conhecer os efeitos colaterais do NAT.',
      why_it_matters: 'Um NAT mal configurado deixa a rede sem Internet ou expõe serviços indevidamente. E o NAT quebra o princípio fim a fim, o que afeta VoIP, jogos, VPNs e conexões P2P.',
      real_world: 'Muitos provedores usam CGNAT (Carrier-Grade NAT): o cliente recebe um IP 100.64.x.x e compartilha o IP público com outros clientes. Por isso, port forwarding no roteador de casa às vezes "não funciona".',
      explanation: 'Conexões iniciadas de dentro para fora funcionam naturalmente com PAT. Conexões iniciadas de fora para dentro não encontram entrada na tabela e são descartadas — a não ser que exista um NAT estático ou port forwarding.',
      exercise: 'Por que um servidor web interno não é acessível da Internet apenas com PAT configurado?',
      exercise_answer: 'Porque o PAT só cria traduções para conexões iniciadas de dentro. Uma conexão vinda de fora não tem entrada na tabela; é preciso um NAT estático/port forwarding para a porta 80/443 do servidor.',
      challenge: 'Configure, em laboratório, um port forwarding da porta 8080 pública para a porta 80 de um servidor interno e teste de fora.',
      keywords: ['ip nat inside', 'ip nat outside', 'access-list', 'port forwarding', 'CGNAT', 'NAT traversal', 'IPv6'],
      sections: [
        {
          title: 'PAT em um roteador Cisco',
          code: 'interface g0/0\n ip address 192.168.1.1 255.255.255.0\n ip nat inside\ninterface g0/1\n ip address 203.0.113.5 255.255.255.252\n ip nat outside\n!\naccess-list 1 permit 192.168.1.0 0.0.0.255\nip nat inside source list 1 interface g0/1 overload',
        },
        {
          title: 'NAT estático e port forwarding',
          code: '! servidor inteiro com IP público próprio\nip nat inside source static 192.168.1.20 203.0.113.6\n! somente a porta 443\nip nat inside source static tcp 192.168.1.20 443 203.0.113.5 443',
        },
        {
          title: 'Limitações do NAT',
          items: [
            'Quebra a comunicação fim a fim: hosts internos não são alcançáveis diretamente.',
            'Protocolos que carregam IPs dentro dos dados (SIP, FTP ativo) precisam de ALG ou técnicas de travessia (STUN, TURN, ICE).',
            'IPsec AH não funciona com NAT; IPsec ESP precisa de NAT-T (UDP 4500).',
            'Dificulta a rastreabilidade: logs precisam registrar IP e porta.',
            'CGNAT impede port forwarding para o cliente final.',
            'NAT não é firewall: ele apenas não cria entradas para tráfego não solicitado; use regras de firewall explícitas.',
          ],
        },
        {
          title: 'NAT e IPv6',
          content: 'Com IPv6 há endereços suficientes para todos os dispositivos, então o NAT deixa de ser necessário. A proteção vem de um firewall stateful que bloqueia conexões de entrada não solicitadas. Para a transição, existem NAT64/DNS64, que permitem a hosts só IPv6 acessar serviços IPv4.',
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Qual o principal motivo da criação do NAT?',
      options: ['Aumentar a velocidade', 'Economizar endereços IPv4 públicos', 'Criptografar o tráfego', 'Substituir o DNS'],
      answer: 'Economizar endereços IPv4 públicos',
      explanation: 'O NAT permite que redes inteiras usem endereços privados e compartilhem poucos IPs públicos.',
    },
    {
      question: 'O que diferencia as conexões no PAT?',
      options: ['O endereço MAC', 'O número da porta', 'A VLAN', 'O TTL'],
      answer: 'O número da porta',
      explanation: 'Todas compartilham o IP público; a porta identifica cada conexão.',
    },
    {
      question: 'No Cisco, o IP do host interno visto da Internet (após a tradução) chama-se:',
      options: ['Inside local', 'Inside global', 'Outside local', 'Outside global'],
      answer: 'Inside global',
      explanation: 'Inside local é o IP privado; inside global é o IP traduzido, visto de fora.',
    },
    {
      question: 'Qual palavra-chave ativa o PAT no comando ip nat inside source?',
      options: ['static', 'pool', 'overload', 'dynamic'],
      answer: 'overload',
      explanation: 'overload faz várias traduções compartilharem o mesmo IP público.',
    },
    {
      question: 'Para publicar um servidor web interno na Internet é necessário:',
      options: ['Apenas PAT', 'NAT estático ou port forwarding', 'DHCP relay', 'Uma VLAN nova'],
      answer: 'NAT estático ou port forwarding',
      explanation: 'Conexões iniciadas de fora precisam de uma tradução pré-definida.',
    },
    {
      question: 'A faixa 100.64.0.0/10 é usada para:',
      options: ['Multicast', 'Loopback', 'CGNAT (endereços compartilhados de provedores)', 'Documentação'],
      answer: 'CGNAT (endereços compartilhados de provedores)',
      explanation: 'Definida no RFC 6598 para Carrier-Grade NAT.',
    },
  ],
  details: {
    objectives: [
      'Explicar a motivação e o funcionamento do NAT.',
      'Diferenciar NAT estático, dinâmico, PAT e port forwarding.',
      'Ler uma tabela de traduções com a terminologia inside/outside.',
      'Configurar PAT e port forwarding em um roteador.',
      'Reconhecer as limitações do NAT e o cenário com IPv6.',
    ],
    keyPoints: [
      'NAT traduz IP privado ↔ público na borda.',
      'PAT = muitos hosts, um IP público, portas diferentes.',
      'Conexões de fora só entram com NAT estático/port forwarding.',
      'CGNAT (100.64/10) impede port forwarding para o cliente.',
      'NAT não é firewall; IPv6 dispensa NAT.',
    ],
    commands: [
      { title: 'Verificar traduções', platform: 'Cisco IOS', code: 'show ip nat translations\nshow ip nat statistics\nclear ip nat translation *\ndebug ip nat' },
      { title: 'NAT/masquerade em um gateway Linux', platform: 'Linux/macOS', code: 'sudo sysctl -w net.ipv4.ip_forward=1\nsudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE\n# port forwarding 8080 → 192.168.1.20:80\nsudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 8080 -j DNAT --to-destination 192.168.1.20:80' },
      { title: 'Descobrir o IP público', platform: 'Multiplataforma', code: 'curl https://ifconfig.me' },
    ],
    pitfalls: [
      { problem: 'Esquecer ip nat inside/outside nas interfaces.', solution: 'Sem marcar as interfaces, nenhuma tradução acontece.' },
      { problem: 'ACL do NAT não cobre toda a rede interna.', solution: 'Confira a wildcard: 192.168.1.0 0.0.0.255 cobre a /24 inteira.' },
      { problem: 'Port forwarding configurado, mas inacessível.', solution: 'Verifique se o provedor usa CGNAT (IP WAN 100.64.x.x) e se o firewall permite a porta.' },
    ],
    security: [
      'Exponha apenas os serviços estritamente necessários via port forwarding e mantenha-os atualizados.',
      'Desabilite UPnP no roteador se não for necessário: ele permite que dispositivos (ou malwares) abram portas sozinhos.',
      'Registre logs de NAT (IP e porta) para investigações e obrigações legais.',
    ],
    lab: {
      title: 'Rede com saída à Internet via PAT',
      goal: 'Configurar PAT, publicar um servidor e observar a tabela de traduções.',
      tools: 'Cisco Packet Tracer.',
      steps: [
        'Monte uma LAN 192.168.1.0/24 com 3 PCs e um servidor web, um roteador de borda e um "servidor da Internet" em 203.0.113.0/30.',
        'Configure ip nat inside/outside e o PAT com overload.',
        'Acesse o servidor externo pelos PCs e examine show ip nat translations.',
        'Crie um NAT estático para a porta 80 do servidor interno e teste de fora.',
      ],
      expected: 'Várias traduções compartilhando o IP público e o servidor interno acessível pela porta publicada.',
    },
    references: ['RFC 3022 — Traditional NAT', 'RFC 6598 — Shared Address Space (CGNAT)', 'RFC 6146 — NAT64', 'RFC 8445 — ICE'],
  },
};
