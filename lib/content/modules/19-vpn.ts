import type { ModuleSeed } from '../types';

export const vpn: ModuleSeed = {
  slug: 'vpn',
  title: 'Módulo 19 — VPN',
  stage: 'Avançado',
  description: 'Redes privadas virtuais: site-to-site e acesso remoto, tunelamento, IPsec, SSL/TLS VPN, WireGuard, OpenVPN, split tunneling e Zero Trust.',
  accent: 'from-violet-500 to-fuchsia-500',
  objective: 'Entender como VPNs criam túneis seguros sobre redes públicas, comparar os principais protocolos e escolher a solução adequada para cada cenário.',
  summary: 'Uma VPN encapsula e cifra o tráfego, criando um "túnel" privado sobre a Internet. Ela interliga filiais (site-to-site) ou conecta usuários remotos à rede da empresa (acesso remoto).',
  lessons: [
    {
      slug: 'conceitos-de-vpn',
      title: 'Conceitos e tipos de VPN',
      introduction: 'VPN (Virtual Private Network) é uma conexão lógica, protegida por criptografia, estabelecida sobre uma rede pública ou não confiável — normalmente a Internet.',
      why_it_matters: 'Contratar links dedicados entre filiais é caro. A VPN permite usar a Internet com segurança para interligar escritórios e para o trabalho remoto.',
      real_world: 'Uma empresa com matriz em São Paulo e filial em Recife conecta as duas redes por uma VPN IPsec entre os firewalls. Os funcionários em home office usam um cliente VPN para acessar os sistemas internos.',
      explanation: 'Tunelamento é colocar um pacote inteiro dentro de outro. O pacote original (com IPs privados) é cifrado e encapsulado em um novo pacote com os IPs públicos dos dois gateways VPN. Quem observa a Internet só vê tráfego cifrado entre esses dois IPs.',
      exercise: 'Qual a diferença entre VPN site-to-site e VPN de acesso remoto?',
      exercise_answer: 'A site-to-site conecta redes inteiras de forma permanente, entre gateways (roteadores/firewalls), sem software nos computadores. A de acesso remoto conecta um usuário individual à rede, usando um cliente VPN no dispositivo.',
      challenge: 'Desenhe o encapsulamento de um pacote 10.1.1.10 → 10.2.2.20 atravessando um túnel IPsec entre 203.0.113.1 e 198.51.100.1. Quais IPs aparecem na Internet?',
      keywords: ['VPN', 'túnel', 'site-to-site', 'acesso remoto', 'encapsulamento', 'split tunneling'],
      sections: [
        {
          title: 'Tipos de VPN',
          table: {
            headers: ['Tipo', 'Conecta', 'Exemplo'],
            rows: [
              ['Site-to-site', 'Rede ↔ rede, entre gateways', 'Matriz ↔ filial com IPsec'],
              ['Acesso remoto', 'Usuário ↔ rede', 'Funcionário em casa com cliente VPN'],
              ['Cliente-a-site via navegador (SSL VPN clientless)', 'Usuário ↔ aplicações web', 'Portal web da empresa'],
              ['VPN comercial/de privacidade', 'Usuário ↔ provedor de VPN', 'Ocultar o tráfego em Wi-Fi público'],
            ],
          },
        },
        {
          title: 'Tunelamento',
          code: 'Pacote original:     | IP 10.1.1.10 → 10.2.2.20 | TCP | Dados |\n\nNo túnel (IPsec ESP modo túnel):\n| IP 203.0.113.1 → 198.51.100.1 | ESP | [IP 10.1.1.10 → 10.2.2.20 | TCP | Dados] cifrado | ESP trailer/auth |',
        },
        {
          title: 'Full tunnel × split tunneling',
          items: [
            'Full tunnel: todo o tráfego do usuário passa pela VPN — mais controle e inspeção, mais carga no concentrador.',
            'Split tunneling: só o tráfego para redes da empresa vai pelo túnel; o resto sai direto para a Internet — menos carga, menos visibilidade.',
          ],
        },
      ],
    },
    {
      slug: 'protocolos-de-vpn',
      title: 'Protocolos: IPsec, SSL/TLS, WireGuard e OpenVPN',
      introduction: 'Existem diversos protocolos de VPN, com diferentes equilíbrios entre segurança, desempenho, compatibilidade e facilidade de configuração.',
      why_it_matters: 'Escolher um protocolo obsoleto (como PPTP) expõe a empresa. Escolher bem garante desempenho e compatibilidade com firewalls e NAT.',
      real_world: 'Firewalls corporativos fazem site-to-site com IPsec; o acesso remoto costuma usar SSL VPN ou WireGuard, que atravessam NAT facilmente.',
      explanation: 'O IPsec opera na camada 3 e é composto pelo IKE (negocia chaves, UDP 500/4500), pelo ESP (cifra e autentica os dados) e pelo AH (só autentica, quase não usado). O WireGuard é moderno, com código pequeno e criptografia fixa de última geração. VPNs SSL/TLS usam o mesmo TLS do HTTPS.',
      exercise: 'Quais portas devem ser liberadas no firewall para uma VPN IPsec com NAT-T?',
      exercise_answer: 'UDP 500 (IKE) e UDP 4500 (IKE/ESP com NAT-Traversal). Sem NAT-T, também o protocolo IP 50 (ESP).',
      challenge: 'Monte um servidor WireGuard em uma VM e conecte seu celular a ele. Verifique o IP público visto pelos sites antes e depois.',
      keywords: ['IPsec', 'IKE', 'ESP', 'AH', 'WireGuard', 'OpenVPN', 'SSL VPN', 'PPTP', 'Zero Trust'],
      sections: [
        {
          title: 'Comparativo de protocolos',
          table: {
            headers: ['Protocolo', 'Camada / transporte', 'Pontos fortes', 'Atenção'],
            rows: [
              ['IPsec (IKEv2)', 'Camada 3; UDP 500/4500, ESP', 'Padrão de mercado, site-to-site entre fabricantes', 'Configuração complexa'],
              ['SSL/TLS VPN', 'TLS sobre TCP/UDP 443', 'Atravessa quase qualquer firewall', 'Soluções proprietárias variam'],
              ['OpenVPN', 'TLS; UDP 1194 (padrão) ou TCP', 'Código aberto, flexível, maduro', 'Desempenho menor que WireGuard'],
              ['WireGuard', 'UDP (51820 comum)', 'Simples, rápido, criptografia moderna', 'Gestão de chaves manual em ambientes grandes'],
              ['L2TP/IPsec', 'L2TP dentro de IPsec', 'Suporte nativo antigo', 'Legado'],
              ['PPTP', 'TCP 1723 + GRE', '—', 'Inseguro: não use'],
            ],
          },
        },
        {
          title: 'Fases do IPsec com IKE',
          steps: [
            'IKE fase 1: os gateways se autenticam (chave pré-compartilhada ou certificados) e criam um canal seguro de controle.',
            'IKE fase 2: negociam as SAs (associações de segurança) do ESP: algoritmos, chaves e quais redes passam pelo túnel.',
            'Tráfego "interessante" (definido pelas redes de origem/destino) é cifrado com ESP.',
            'As chaves são renovadas periodicamente (rekey).',
          ],
        },
        {
          title: 'Configuração WireGuard (servidor)',
          code: '# /etc/wireguard/wg0.conf\n[Interface]\nAddress = 10.8.0.1/24\nListenPort = 51820\nPrivateKey = <chave-privada-do-servidor>\n\n[Peer]\n# notebook da Ana\nPublicKey = <chave-publica-do-cliente>\nAllowedIPs = 10.8.0.2/32',
          content: 'Gere as chaves com: wg genkey | tee privada | wg pubkey > publica. Suba a interface com wg-quick up wg0.',
        },
        {
          title: 'VPN e Zero Trust',
          content: 'A VPN tradicional confia em quem está "dentro" da rede. O modelo Zero Trust parte do princípio de "nunca confiar, sempre verificar": cada acesso a cada aplicação é autenticado e autorizado conforme identidade, dispositivo e contexto (ZTNA). Muitas empresas combinam VPN para casos específicos com ZTNA para aplicações.',
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Qual o objetivo principal de uma VPN?',
      options: ['Aumentar a velocidade da Internet', 'Criar um túnel seguro sobre uma rede não confiável', 'Atribuir IPs automaticamente', 'Substituir o firewall'],
      answer: 'Criar um túnel seguro sobre uma rede não confiável',
      explanation: 'A VPN cifra e encapsula o tráfego sobre redes públicas como a Internet.',
    },
    {
      question: 'Qual protocolo do IPsec negocia as chaves?',
      options: ['ESP', 'AH', 'IKE', 'GRE'],
      answer: 'IKE',
      explanation: 'O IKE (UDP 500/4500) autentica os pares e negocia as associações de segurança.',
    },
    {
      question: 'Qual componente do IPsec cifra os dados?',
      options: ['AH', 'ESP', 'IKE', 'ISAKMP'],
      answer: 'ESP',
      explanation: 'O ESP oferece confidencialidade e integridade; o AH só autentica, sem cifrar.',
    },
    {
      question: 'Qual protocolo de VPN é considerado inseguro e não deve ser usado?',
      options: ['WireGuard', 'IKEv2', 'OpenVPN', 'PPTP'],
      answer: 'PPTP',
      explanation: 'O PPTP tem falhas criptográficas conhecidas.',
    },
    {
      question: 'No split tunneling:',
      options: ['Todo o tráfego passa pela VPN', 'Só o tráfego para a rede corporativa passa pela VPN', 'A VPN é dividida entre dois servidores', 'O túnel não é cifrado'],
      answer: 'Só o tráfego para a rede corporativa passa pela VPN',
      explanation: 'O restante sai diretamente para a Internet pela conexão local do usuário.',
    },
    {
      question: 'Uma VPN que interliga permanentemente a matriz e uma filial é do tipo:',
      options: ['Acesso remoto', 'Site-to-site', 'Clientless', 'P2P'],
      answer: 'Site-to-site',
      explanation: 'Conecta redes inteiras por meio dos gateways de cada local.',
    },
  ],
  details: {
    objectives: [
      'Explicar tunelamento e os tipos de VPN.',
      'Comparar IPsec, SSL/TLS VPN, OpenVPN e WireGuard.',
      'Descrever as fases do IPsec/IKE.',
      'Configurar uma VPN WireGuard simples.',
      'Relacionar VPN e Zero Trust.',
    ],
    keyPoints: [
      'VPN = túnel cifrado sobre rede não confiável.',
      'Site-to-site (redes) × acesso remoto (usuários).',
      'IPsec: IKE negocia, ESP cifra; NAT-T usa UDP 4500.',
      'WireGuard: moderno, simples e rápido.',
      'PPTP é inseguro; Zero Trust complementa a VPN.',
    ],
    commands: [
      { title: 'WireGuard', platform: 'Linux/macOS', code: 'wg genkey | tee privada | wg pubkey > publica\nsudo wg-quick up wg0\nsudo wg show' },
      { title: 'Verificar túneis IPsec', platform: 'Cisco IOS', code: 'show crypto isakmp sa\nshow crypto ipsec sa\nshow crypto session' },
      { title: 'Ver rotas e interfaces da VPN', platform: 'Windows', code: 'route print\nGet-VpnConnection\nipconfig /all' },
    ],
    pitfalls: [
      { problem: 'Redes com o mesmo endereçamento nos dois lados do túnel (ex.: 192.168.0.0/24).', solution: 'Planeje sub-redes únicas por site ou use NAT no túnel.' },
      { problem: 'Túnel sobe, mas o tráfego não passa.', solution: 'Verifique se as redes "interessantes" (ACL/AllowedIPs) e as rotas estão corretas nos dois lados.' },
      { problem: 'Páginas que não carregam pela VPN.', solution: 'Ajuste o MTU/MSS: o encapsulamento reduz o tamanho útil do pacote.' },
    ],
    security: [
      'Use IKEv2, WireGuard ou OpenVPN/TLS atualizados; abandone PPTP e L2TP sem IPsec.',
      'Exija MFA no acesso remoto e mantenha o concentrador VPN sempre atualizado — ele é alvo frequente de ataques.',
      'VPN comercial não torna ninguém anônimo: ela apenas transfere a confiança do seu provedor para o provedor de VPN.',
      'Aplique menor privilégio: usuários da VPN não devem ter acesso a toda a rede interna.',
    ],
    lab: {
      title: 'Sua própria VPN com WireGuard',
      goal: 'Criar um túnel de acesso remoto e verificar o encapsulamento.',
      tools: 'Uma VM Linux (servidor) e um cliente WireGuard (PC ou celular).',
      steps: [
        'Instale o WireGuard no servidor e gere as chaves.',
        'Configure wg0 com 10.8.0.1/24 e libere UDP 51820 no firewall.',
        'Configure o cliente com 10.8.0.2/32 e AllowedIPs da rede desejada.',
        'Conecte e teste ping 10.8.0.1; observe no Wireshark que só aparece tráfego UDP cifrado.',
      ],
      expected: 'Túnel ativo (wg show exibe handshake recente) e tráfego interno invisível na captura.',
    },
    references: ['RFC 4301 — Security Architecture for IP (IPsec)', 'RFC 7296 — IKEv2', 'WireGuard — whitepaper (wireguard.com/papers)', 'NIST SP 800-207 — Zero Trust Architecture'],
  },
};
