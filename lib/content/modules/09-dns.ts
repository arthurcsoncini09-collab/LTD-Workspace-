import type { ModuleSeed } from '../types';

export const dns: ModuleSeed = {
  slug: 'dns',
  title: 'Módulo 9 — DNS',
  stage: 'Intermediário',
  description: 'Hierarquia de nomes, resolução recursiva e iterativa, tipos de registro, TTL e cache, DoH/DoT, DNSSEC e ataques.',
  accent: 'from-cyan-500 to-sky-500',
  objective: 'Explicar como nomes de domínio são traduzidos em endereços IP, interpretar registros DNS e diagnosticar falhas de resolução.',
  summary: 'O DNS é a "agenda telefônica" distribuída da Internet. Uma consulta percorre a raiz, o TLD e o servidor autoritativo, e o resultado fica em cache pelo tempo definido no TTL.',
  lessons: [
    {
      slug: 'resolucao-dns',
      title: 'Hierarquia e resolução DNS',
      introduction: 'O DNS (Domain Name System) traduz nomes fáceis de lembrar, como www.example.com, em endereços IP. Ele é um banco de dados hierárquico e distribuído por milhares de servidores no mundo.',
      why_it_matters: 'Quase toda comunicação começa com uma consulta DNS. Se o DNS falha, para o usuário "a Internet caiu", mesmo com a conectividade perfeita.',
      real_world: 'Quando você acessa www.example.com pela primeira vez, seu resolvedor (do provedor, ou públicos como 1.1.1.1 e 8.8.8.8) consulta a raiz, depois os servidores do .com e por fim o servidor autoritativo do example.com.',
      explanation: 'A árvore do DNS começa na raiz (.), passa pelos TLDs (.com, .br, .org) e chega aos domínios (example.com) e subdomínios (www.example.com). Cada nível só sabe "quem cuida" do nível abaixo.',
      exercise: 'Qual a diferença entre um servidor DNS recursivo e um autoritativo?',
      exercise_answer: 'O recursivo (resolvedor) faz todo o trabalho de busca em nome do cliente e guarda cache. O autoritativo detém os registros oficiais de uma zona e responde apenas por ela.',
      challenge: 'Use dig +trace www.example.com e identifique os servidores da raiz, do TLD e o autoritativo na saída.',
      keywords: ['DNS', 'resolvedor', 'raiz', 'TLD', 'autoritativo', 'recursivo', 'iterativo'],
      sections: [
        {
          title: 'Hierarquia de nomes',
          code: '                    . (raiz)\n          ┌─────────┼─────────┐\n        com        br        org        ← TLDs\n         │          │\n     example      com.br                ← domínios\n         │          │\n        www       empresa               ← subdomínios / hosts',
        },
        {
          title: 'Resolução passo a passo',
          steps: [
            'O navegador verifica seu cache; depois o sistema operacional verifica o cache e o arquivo hosts.',
            'O SO pergunta ao resolvedor recursivo configurado (via DHCP ou manualmente).',
            'O resolvedor pergunta a um servidor raiz: "quem cuida de .com?" — recebe uma indicação (referral).',
            'Pergunta ao servidor do TLD .com: "quem cuida de example.com?" — recebe outra indicação.',
            'Pergunta ao servidor autoritativo de example.com: "qual o IP de www?" — recebe a resposta.',
            'O resolvedor devolve a resposta ao cliente e guarda em cache pelo TTL.',
          ],
          content: 'Do cliente para o resolvedor a consulta é recursiva ("me traga a resposta final"); do resolvedor para os demais servidores, é iterativa ("me diga a quem perguntar").',
        },
        {
          title: 'Transporte do DNS',
          items: [
            'UDP porta 53: a maioria das consultas.',
            'TCP porta 53: respostas grandes e transferência de zona (AXFR).',
            'DoT (DNS over TLS): porta 853, criptografado.',
            'DoH (DNS over HTTPS): porta 443, criptografado e indistinguível de tráfego web.',
          ],
        },
      ],
    },
    {
      slug: 'cache-e-recursos-dns',
      title: 'Registros, cache e segurança do DNS',
      introduction: 'Cada zona DNS é composta de registros (resource records), cada um com nome, tipo, TTL e valor. O cache, controlado pelo TTL, torna o DNS rápido e escalável.',
      why_it_matters: 'Configurar um site, um e-mail ou validar um domínio em serviços de nuvem exige criar os registros corretos. E entender o TTL evita surpresas durante migrações.',
      real_world: 'Para ativar o e-mail corporativo de um domínio, você cria registros MX apontando para o provedor de e-mail e registros TXT com SPF, DKIM e DMARC para evitar que suas mensagens caiam no spam.',
      explanation: 'O TTL diz por quantos segundos uma resposta pode ficar em cache. TTL alto = menos consultas e mais rapidez, mas mudanças demoram a propagar. Antes de uma migração, reduza o TTL com antecedência.',
      exercise: 'Qual registro DNS aponta um nome para um endereço IPv6?',
      exercise_answer: 'O registro AAAA (o registro A aponta para IPv4).',
      challenge: 'Consulte os registros MX e TXT de um domínio conhecido com nslookup ou dig e explique o que cada um indica.',
      keywords: ['registro A', 'AAAA', 'CNAME', 'MX', 'TXT', 'TTL', 'cache', 'DNSSEC'],
      sections: [
        {
          title: 'Tipos de registro',
          table: {
            headers: ['Tipo', 'Função', 'Exemplo'],
            rows: [
              ['A', 'Nome → IPv4', 'www  IN A  93.184.215.14'],
              ['AAAA', 'Nome → IPv6', 'www  IN AAAA  2606:2800:21f:cb07:6820:80da:af6b:8b2c'],
              ['CNAME', 'Apelido para outro nome', 'blog  IN CNAME  www.example.com.'],
              ['MX', 'Servidor de e-mail do domínio (com prioridade)', '@  IN MX 10 mail.example.com.'],
              ['NS', 'Servidores autoritativos da zona', '@  IN NS  ns1.example.com.'],
              ['TXT', 'Texto livre: SPF, DKIM, DMARC, verificações', '@  IN TXT "v=spf1 include:_spf.example.com ~all"'],
              ['PTR', 'IP → nome (DNS reverso)', '14.215.184.93.in-addr.arpa  IN PTR  www.example.com.'],
              ['SOA', 'Dados da zona: serial, tempos, e-mail do responsável', 'Um por zona'],
              ['SRV', 'Localização de serviços (host e porta)', '_sip._tcp  IN SRV 10 5 5060 sip.example.com.'],
              ['CAA', 'Quais autoridades podem emitir certificados', '@  IN CAA 0 issue "letsencrypt.org"'],
            ],
          },
        },
        {
          title: 'Arquivo hosts',
          content: 'Antes de consultar o DNS, o sistema consulta o arquivo hosts (C:\\Windows\\System32\\drivers\\etc\\hosts ou /etc/hosts). Ele é útil para testes, mas também é alvo de malwares que redirecionam sites.',
        },
        {
          title: 'Ataques e proteções',
          table: {
            headers: ['Ameaça', 'Descrição', 'Mitigação'],
            rows: [
              ['Cache poisoning', 'Injetar respostas falsas no cache do resolvedor', 'DNSSEC, portas de origem aleatórias'],
              ['Spoofing / sequestro', 'Responder no lugar do servidor legítimo ou alterar o DNS do roteador', 'DoH/DoT, senha forte no roteador'],
              ['Amplificação', 'Usar resolvedores abertos para DDoS', 'Não deixar resolvedores abertos à Internet'],
              ['Tunelamento', 'Exfiltrar dados codificados em consultas DNS', 'Monitorar volume e tamanho das consultas'],
              ['Typosquatting', 'Registrar domínios parecidos (exemp1e.com)', 'Conscientização, filtros de DNS'],
            ],
          },
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Qual a função principal do DNS?',
      options: ['Atribuir IPs aos hosts', 'Traduzir nomes de domínio em endereços IP', 'Criptografar o tráfego web', 'Encaminhar pacotes entre redes'],
      answer: 'Traduzir nomes de domínio em endereços IP',
      explanation: 'O DNS resolve nomes como example.com em endereços IP.',
    },
    {
      question: 'Qual registro indica o servidor de e-mail de um domínio?',
      options: ['A', 'CNAME', 'MX', 'PTR'],
      answer: 'MX',
      explanation: 'MX (Mail eXchanger) aponta para os servidores que recebem e-mails do domínio.',
    },
    {
      question: 'O que o TTL de um registro DNS controla?',
      options: ['O número de saltos', 'Por quanto tempo a resposta pode ficar em cache', 'A prioridade do registro', 'O tamanho máximo da resposta'],
      answer: 'Por quanto tempo a resposta pode ficar em cache',
      explanation: 'O TTL, em segundos, define a validade da resposta nos caches.',
    },
    {
      question: 'Qual porta e protocolo o DNS usa na maioria das consultas?',
      options: ['53/UDP', '53/TCP', '443/TCP', '67/UDP'],
      answer: '53/UDP',
      explanation: 'Consultas comuns usam UDP 53; TCP 53 é usado em respostas grandes e transferências de zona.',
    },
    {
      question: 'Qual registro faz a resolução reversa (IP → nome)?',
      options: ['PTR', 'SOA', 'NS', 'TXT'],
      answer: 'PTR',
      explanation: 'Registros PTR ficam na zona in-addr.arpa (IPv4) ou ip6.arpa (IPv6).',
    },
    {
      question: 'Qual tecnologia assina digitalmente os registros DNS para garantir autenticidade?',
      options: ['DoH', 'DNSSEC', 'DHCP', 'SPF'],
      answer: 'DNSSEC',
      explanation: 'DNSSEC garante autenticidade e integridade; DoH/DoT garantem confidencialidade no transporte.',
    },
  ],
  details: {
    objectives: [
      'Descrever a hierarquia do DNS e o processo de resolução.',
      'Diferenciar consulta recursiva e iterativa, servidor recursivo e autoritativo.',
      'Interpretar e criar os principais tipos de registro.',
      'Diagnosticar problemas de DNS com nslookup e dig.',
      'Reconhecer ataques ao DNS e suas mitigações.',
    ],
    keyPoints: [
      'Hierarquia: raiz → TLD → domínio → subdomínio.',
      'Cliente → resolvedor: recursiva; resolvedor → servidores: iterativa.',
      'A/AAAA, CNAME, MX, NS, TXT, PTR, SOA, SRV.',
      'TTL controla o cache: reduza antes de migrações.',
      'DNSSEC = autenticidade; DoH/DoT = privacidade.',
    ],
    commands: [
      { title: 'Consultas básicas', platform: 'Windows', code: 'nslookup example.com\nnslookup -type=MX example.com\nipconfig /displaydns     # ver cache local\nipconfig /flushdns       # limpar cache local' },
      { title: 'Consultas detalhadas', platform: 'Linux/macOS', code: 'dig example.com\ndig example.com MX +short\ndig @1.1.1.1 example.com AAAA\ndig +trace www.example.com\ndig -x 8.8.8.8           # reverso' },
    ],
    pitfalls: [
      { problem: 'Alterar um registro e ele "não propagar".', solution: 'Os caches respeitam o TTL antigo; reduza o TTL dias antes da mudança.' },
      { problem: 'Criar CNAME no domínio raiz (@).', solution: 'Pela norma, o apex não pode ter CNAME; use A/AAAA ou recursos como ALIAS/flattening do provedor.' },
      { problem: 'Site abre por IP mas não por nome.', solution: 'Teste nslookup; verifique o DNS configurado na placa e o arquivo hosts.' },
    ],
    security: [
      'Use resolvedores confiáveis e, quando possível, DoH/DoT.',
      'Habilite DNSSEC nos seus domínios e ative bloqueio de transferência de zona para IPs não autorizados.',
      'Configure SPF, DKIM e DMARC para evitar falsificação de e-mails do seu domínio.',
      'Proteja o painel do registrador com MFA: sequestrar o DNS é sequestrar o site.',
    ],
    lab: {
      title: 'Explorando o DNS com dig e nslookup',
      goal: 'Ver a hierarquia e os registros reais de um domínio.',
      tools: 'dig (Linux/macOS) ou nslookup (Windows).',
      steps: [
        'Rode dig +trace www.example.com e identifique raiz, TLD e autoritativo.',
        'Consulte os registros A, AAAA, MX, NS e TXT de um domínio conhecido.',
        'Repita uma consulta e observe o TTL diminuindo (resposta vinda do cache).',
        'Compare as respostas de 1.1.1.1 e 8.8.8.8.',
      ],
      expected: 'Entender que a resposta final vem do autoritativo e que o resolvedor reaproveita o cache até o TTL expirar.',
    },
    references: ['RFC 1034 e RFC 1035 — Domain Names', 'RFC 8484 — DNS over HTTPS', 'RFC 7858 — DNS over TLS', 'RFC 4033 — DNSSEC'],
  },
};
