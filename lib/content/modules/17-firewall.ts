import type { ModuleSeed } from '../types';

export const firewall: ModuleSeed = {
  slug: 'firewall',
  title: 'Módulo 17 — Firewall',
  stage: 'Avançado',
  description: 'Tipos de firewall, regras e ordem de avaliação, deny implícito, ACLs Cisco, DMZ, iptables/nftables, IDS/IPS e menor privilégio.',
  accent: 'from-red-500 to-orange-500',
  objective: 'Projetar e escrever regras de firewall eficazes, entender os diferentes tipos de firewall e posicioná-los corretamente na rede.',
  summary: 'Um firewall decide, com base em regras, qual tráfego pode passar. A política recomendada é negar tudo por padrão e liberar apenas o necessário.',
  lessons: [
    {
      slug: 'tipos-de-firewall',
      title: 'O que é um firewall e seus tipos',
      introduction: 'Firewall é um sistema (hardware, software ou serviço em nuvem) que controla o tráfego entre zonas de confiança diferentes, aplicando uma política de segurança definida em regras.',
      why_it_matters: 'É uma das principais barreiras contra acessos não autorizados. Um firewall mal configurado pode ser tão perigoso quanto não ter firewall — ou derrubar serviços legítimos.',
      real_world: 'Uma empresa coloca um firewall de nova geração (NGFW) na borda com a Internet, liberando apenas HTTPS para o servidor web na DMZ e bloqueando acesso direto à rede interna. Cada servidor também tem um firewall local.',
      explanation: 'Firewalls evoluíram: filtros de pacotes olham apenas cabeçalhos; firewalls stateful acompanham o estado das conexões e permitem automaticamente as respostas; NGFWs identificam aplicações e usuários e inspecionam conteúdo; WAFs protegem especificamente aplicações web.',
      exercise: 'Qual a vantagem de um firewall stateful em relação a um filtro de pacotes simples?',
      exercise_answer: 'O stateful mantém uma tabela de conexões: as respostas de conexões iniciadas de dentro são permitidas automaticamente, sem precisar abrir regras de entrada amplas, e pacotes fora de contexto são descartados.',
      challenge: 'Desenhe a rede de uma pequena empresa com Internet, DMZ (servidor web) e LAN, e indique onde ficam os firewalls e quais fluxos são permitidos.',
      keywords: ['firewall', 'stateful', 'filtro de pacotes', 'NGFW', 'WAF', 'DMZ', 'zona'],
      sections: [
        {
          title: 'Tipos de firewall',
          table: {
            headers: ['Tipo', 'Camadas', 'Como decide', 'Exemplo'],
            rows: [
              ['Filtro de pacotes (stateless)', '3 e 4', 'IP, porta e protocolo de cada pacote isolado', 'ACLs em roteadores'],
              ['Stateful', '3 e 4', 'Regras + tabela de estado das conexões', 'iptables/nftables, Windows Firewall'],
              ['Proxy / gateway de aplicação', '7', 'Intermedia a conexão e analisa o protocolo', 'Squid, proxies corporativos'],
              ['NGFW', '3 a 7', 'Aplicação, usuário, reputação, IPS e inspeção TLS', 'Palo Alto, Fortinet, pfSense+'],
              ['WAF', '7 (HTTP)', 'Bloqueia ataques web: SQLi, XSS', 'ModSecurity, Cloudflare WAF'],
            ],
          },
        },
        {
          title: 'Zonas e DMZ',
          code: 'Internet ──[Firewall]──┬── DMZ (servidores públicos: web, e-mail)\n                       └── LAN interna (usuários, servidores internos)\n\nInternet → DMZ: só portas publicadas (443)\nInternet → LAN: negado\nLAN → Internet: permitido (com controle)\nDMZ → LAN: negado (exceto o estritamente necessário)',
          content: 'A DMZ (zona desmilitarizada) isola os servidores expostos. Se um deles for comprometido, o atacante ainda não está na rede interna.',
        },
        {
          title: 'IDS × IPS',
          items: [
            'IDS (Intrusion Detection System): analisa o tráfego e alerta sobre ataques, sem bloquear (ex.: Snort, Suricata em modo passivo).',
            'IPS (Intrusion Prevention System): fica no caminho do tráfego e bloqueia ataques em tempo real.',
            'NGFWs normalmente incluem IPS integrado.',
          ],
        },
      ],
    },
    {
      slug: 'regras-e-acls',
      title: 'Regras, ACLs e boas práticas',
      introduction: 'Regras de firewall são avaliadas em ordem, de cima para baixo; a primeira que corresponder ao pacote decide a ação. Se nenhuma corresponder, aplica-se a política padrão — idealmente, negar.',
      why_it_matters: 'A ordem das regras muda completamente o resultado. Uma regra ampla no topo pode anular todas as regras específicas abaixo dela.',
      real_world: 'Um administrador coloca "permitir qualquer → qualquer" para testar e esquece a regra lá. Meses depois, um serviço de banco de dados fica exposto à Internet.',
      explanation: 'Escreva regras do mais específico para o mais geral, documente o motivo de cada uma e revise periodicamente. Nos roteadores Cisco, toda ACL termina com um "deny any" implícito invisível.',
      exercise: 'Uma ACL tem: 1) deny any any; 2) permit tcp any host 10.0.0.10 eq 443. O tráfego HTTPS para 10.0.0.10 passa?',
      exercise_answer: 'Não. A regra 1 corresponde a todo o tráfego primeiro e o bloqueia; a regra 2 nunca é avaliada.',
      challenge: 'Escreva uma ACL estendida que permita apenas que a rede 192.168.10.0/24 acesse o servidor 10.0.0.10 via HTTPS e SSH, bloqueando o restante.',
      keywords: ['ACL', 'regra', 'deny implícito', 'ordem', 'wildcard', 'iptables', 'nftables', 'menor privilégio'],
      sections: [
        {
          title: 'ACLs Cisco: padrão × estendida',
          table: {
            headers: ['Tipo', 'Numeração', 'Filtra por', 'Onde aplicar'],
            rows: [
              ['Padrão', '1–99, 1300–1999', 'Somente IP de origem', 'Perto do destino'],
              ['Estendida', '100–199, 2000–2699', 'Origem, destino, protocolo e portas', 'Perto da origem'],
            ],
          },
        },
        {
          title: 'Exemplo de ACL estendida nomeada',
          code: 'ip access-list extended LAN-PARA-SERVIDOR\n permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.10 eq 443\n permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.10 eq 22\n deny   ip any host 10.0.0.10 log\n permit ip any any\n!\ninterface g0/0\n ip access-group LAN-PARA-SERVIDOR in',
          content: 'A última linha "permit ip any any" é necessária aqui para não bloquear o restante do tráfego, já que existe o deny implícito.',
        },
        {
          title: 'Firewall stateful no Linux (nftables)',
          code: 'table inet filtro {\n  chain entrada {\n    type filter hook input priority 0; policy drop;\n    ct state established,related accept\n    iif lo accept\n    tcp dport { 22, 443 } accept\n    icmp type echo-request limit rate 5/second accept\n  }\n}',
        },
        {
          title: 'Boas práticas',
          items: [
            'Política padrão: negar tudo; liberar explicitamente o necessário (menor privilégio).',
            'Filtrar também o tráfego de saída (egress), não apenas o de entrada.',
            'Regras específicas no topo; documentar dono, motivo e data de cada regra.',
            'Registrar (log) bloqueios relevantes e revisar as regras periodicamente.',
            'Evitar regras "any any"; usar objetos e grupos nomeados.',
            'Testar mudanças fora do horário de pico e manter backup da configuração.',
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Em que ordem as regras de um firewall/ACL são avaliadas?',
      options: ['Da mais restritiva para a mais permissiva automaticamente', 'De cima para baixo; a primeira que corresponder vence', 'Todas são avaliadas e vence a última', 'Aleatoriamente'],
      answer: 'De cima para baixo; a primeira que corresponder vence',
      explanation: 'Por isso a ordem das regras é tão importante.',
    },
    {
      question: 'O que acontece com um pacote que não corresponde a nenhuma linha de uma ACL Cisco?',
      options: ['É permitido', 'É negado pelo deny implícito', 'É enviado ao administrador', 'É fragmentado'],
      answer: 'É negado pelo deny implícito',
      explanation: 'Toda ACL termina com um deny any implícito.',
    },
    {
      question: 'Qual tipo de firewall acompanha o estado das conexões?',
      options: ['Stateless', 'Stateful', 'Hub', 'Bridge'],
      answer: 'Stateful',
      explanation: 'O stateful mantém uma tabela de conexões e permite as respostas automaticamente.',
    },
    {
      question: 'A DMZ é usada para:',
      options: ['Guardar backups', 'Isolar servidores acessíveis da Internet', 'Conectar impressoras', 'Hospedar o DHCP'],
      answer: 'Isolar servidores acessíveis da Internet',
      explanation: 'Se um servidor da DMZ for comprometido, a LAN interna continua protegida.',
    },
    {
      question: 'Qual a diferença entre IDS e IPS?',
      options: ['IDS bloqueia, IPS só alerta', 'IDS só alerta, IPS bloqueia em tempo real', 'São a mesma coisa', 'IPS só funciona com UDP'],
      answer: 'IDS só alerta, IPS bloqueia em tempo real',
      explanation: 'O IPS fica no caminho do tráfego (inline) e pode descartar pacotes maliciosos.',
    },
    {
      question: 'Uma ACL estendida deve ser aplicada preferencialmente:',
      options: ['Perto do destino', 'Perto da origem', 'Em qualquer interface', 'Só na interface de gerência'],
      answer: 'Perto da origem',
      explanation: 'Assim o tráfego indesejado é descartado antes de consumir banda na rede.',
    },
  ],
  details: {
    objectives: [
      'Diferenciar filtro de pacotes, stateful, proxy, NGFW e WAF.',
      'Projetar zonas de segurança com DMZ.',
      'Escrever ACLs padrão e estendidas na ordem correta.',
      'Configurar um firewall stateful em Linux.',
      'Aplicar o princípio do menor privilégio.',
    ],
    keyPoints: [
      'Regras avaliadas de cima para baixo; a primeira correspondência vence.',
      'Deny implícito no final; política padrão = negar.',
      'Stateful permite respostas automaticamente.',
      'DMZ isola servidores públicos.',
      'ACL estendida perto da origem; padrão perto do destino.',
    ],
    commands: [
      { title: 'Verificar ACLs', platform: 'Cisco IOS', code: 'show access-lists\nshow ip interface g0/0 | include access list' },
      { title: 'Firewall no Linux', platform: 'Linux/macOS', code: 'sudo nft list ruleset\nsudo ufw status verbose            # Ubuntu\nsudo ufw allow 443/tcp\nsudo iptables -L -n -v              # legado' },
      { title: 'Firewall do Windows', platform: 'Windows', code: 'Get-NetFirewallProfile | Select Name, Enabled\nNew-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow' },
    ],
    pitfalls: [
      { problem: 'Regra genérica acima das específicas.', solution: 'Ordene do mais específico para o mais geral.' },
      { problem: 'Bloquear-se fora do equipamento remoto ao aplicar política drop.', solution: 'Libere o SSH de administração antes e use "reload in 5" (Cisco) ou um agendamento de rollback.' },
      { problem: 'Esquecer o tráfego de retorno em ACLs stateless.', solution: 'Use a palavra-chave established ou um firewall stateful.' },
    ],
    security: [
      'Firewall é uma camada, não a solução completa: combine com atualizações, MFA, segmentação e monitoramento.',
      'Restrinja a saída: malwares precisam se comunicar com servidores de comando e controle.',
      'Proteja a gerência do próprio firewall (rede dedicada, MFA, logs centralizados).',
    ],
    lab: {
      title: 'Política de firewall para uma pequena empresa',
      goal: 'Implementar e testar uma política com LAN, DMZ e Internet.',
      tools: 'Cisco Packet Tracer (ACLs) ou uma VM Linux (nftables/ufw).',
      steps: [
        'Monte LAN 192.168.10.0/24, DMZ 172.16.0.0/24 com servidor web e um host "Internet".',
        'Permita Internet → DMZ apenas na porta 443 (ou 80 no Packet Tracer).',
        'Permita LAN → DMZ e LAN → Internet; negue Internet → LAN e DMZ → LAN.',
        'Teste cada fluxo com ping e navegador e verifique os contadores com show access-lists.',
      ],
      expected: 'Somente os fluxos permitidos funcionam e os contadores de deny aumentam nas tentativas bloqueadas.',
    },
    references: ['NIST SP 800-41 Rev. 1 — Guidelines on Firewalls and Firewall Policy', 'Documentação do nftables (wiki.nftables.org)', 'CIS Benchmarks'],
  },
};
