import type { ModuleSeed } from '../types';

export const httpHttps: ModuleSeed = {
  slug: 'http-https',
  title: 'Módulo 11 — HTTP/HTTPS',
  stage: 'Intermediário',
  description: 'Requisição e resposta, métodos, códigos de status, cabeçalhos, cookies, versões do HTTP, TLS, certificados e HSTS.',
  accent: 'from-rose-500 to-orange-400',
  objective: 'Entender como a web funciona no nível do protocolo e como o HTTPS protege a comunicação com TLS e certificados digitais.',
  summary: 'O HTTP é um protocolo de requisição e resposta sem estado. O HTTPS é o HTTP dentro de um túnel TLS, que garante confidencialidade, integridade e autenticidade do servidor.',
  lessons: [
    {
      slug: 'protocolo-http',
      title: 'O protocolo HTTP',
      introduction: 'O HTTP (HyperText Transfer Protocol) é a base da web. O cliente envia uma requisição com um método, um caminho e cabeçalhos; o servidor responde com um código de status, cabeçalhos e, geralmente, um corpo.',
      why_it_matters: 'Desenvolvedores, analistas de suporte e de segurança leem requisições HTTP o tempo todo — em logs, no DevTools do navegador ou em APIs.',
      real_world: 'Ao enviar um formulário de login, o navegador faz um POST com usuário e senha; o servidor responde 302 (redirecionamento) e um cabeçalho Set-Cookie com o identificador da sessão.',
      explanation: 'O HTTP é sem estado (stateless): cada requisição é independente. Para "lembrar" quem é o usuário, usam-se cookies ou tokens enviados a cada requisição.',
      exercise: 'O que significa o código de status 404? E o 500?',
      exercise_answer: '404 Not Found: o recurso pedido não existe (erro do cliente). 500 Internal Server Error: falha no servidor ao processar a requisição.',
      challenge: 'Abra o DevTools (F12) → aba Rede, recarregue uma página e identifique o método, o status, o tipo de conteúdo e o tempo de cada requisição.',
      keywords: ['HTTP', 'método', 'GET', 'POST', 'status', 'cabeçalho', 'cookie', 'stateless'],
      sections: [
        {
          title: 'Anatomia de uma troca HTTP',
          code: 'GET /index.html HTTP/1.1\nHost: www.example.com\nUser-Agent: Mozilla/5.0\nAccept: text/html\n\nHTTP/1.1 200 OK\nContent-Type: text/html; charset=UTF-8\nContent-Length: 1256\nCache-Control: max-age=3600\n\n<!doctype html> ...',
        },
        {
          title: 'Métodos',
          table: {
            headers: ['Método', 'Uso', 'Idempotente?'],
            rows: [
              ['GET', 'Obter um recurso', 'Sim'],
              ['POST', 'Enviar dados / criar recurso', 'Não'],
              ['PUT', 'Substituir um recurso', 'Sim'],
              ['PATCH', 'Alterar parte de um recurso', 'Não necessariamente'],
              ['DELETE', 'Remover um recurso', 'Sim'],
              ['HEAD', 'Igual ao GET, sem o corpo', 'Sim'],
              ['OPTIONS', 'Consultar métodos permitidos (usado no CORS)', 'Sim'],
            ],
          },
        },
        {
          title: 'Códigos de status',
          table: {
            headers: ['Classe', 'Significado', 'Exemplos'],
            rows: [
              ['1xx', 'Informativo', '101 Switching Protocols (WebSocket)'],
              ['2xx', 'Sucesso', '200 OK, 201 Created, 204 No Content'],
              ['3xx', 'Redirecionamento', '301 Moved Permanently, 302 Found, 304 Not Modified'],
              ['4xx', 'Erro do cliente', '400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests'],
              ['5xx', 'Erro do servidor', '500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout'],
            ],
          },
        },
        {
          title: 'Versões do HTTP',
          table: {
            headers: ['Versão', 'Transporte', 'Novidade'],
            rows: [
              ['HTTP/1.1 (1997)', 'TCP', 'Conexões persistentes; uma requisição por vez por conexão'],
              ['HTTP/2 (2015)', 'TCP + TLS', 'Multiplexação, cabeçalhos comprimidos (HPACK), formato binário'],
              ['HTTP/3 (2022)', 'QUIC (UDP)', 'Sem bloqueio na cabeça da fila do TCP, conexão mais rápida'],
            ],
          },
        },
      ],
    },
    {
      slug: 'https-e-tls',
      title: 'HTTPS, TLS e certificados',
      introduction: 'O HTTPS é o HTTP transportado dentro de uma sessão TLS (Transport Layer Security). O TLS cifra os dados, detecta adulterações e prova a identidade do servidor por meio de um certificado digital.',
      why_it_matters: 'Sem HTTPS, qualquer um na mesma rede Wi-Fi ou no caminho pode ler e alterar senhas, cookies e conteúdo. Hoje navegadores marcam sites HTTP como "Não seguro".',
      real_world: 'O cadeado no navegador indica que o certificado foi emitido por uma autoridade certificadora (CA) confiável para aquele domínio — por exemplo, pela Let\'s Encrypt, que emite certificados gratuitos.',
      explanation: 'O TLS usa criptografia assimétrica (par de chaves pública/privada) para autenticar o servidor e combinar uma chave de sessão, e criptografia simétrica (como AES ou ChaCha20) para cifrar os dados com rapidez.',
      exercise: 'Quais três garantias o TLS oferece?',
      exercise_answer: 'Confidencialidade (ninguém lê), integridade (ninguém altera sem ser detectado) e autenticidade do servidor (você fala com quem pensa estar falando).',
      challenge: 'Clique no cadeado de um site HTTPS e descubra: quem emitiu o certificado, até quando é válido e para quais domínios ele vale.',
      keywords: ['HTTPS', 'TLS', 'certificado', 'CA', 'chave pública', 'HSTS', 'man-in-the-middle'],
      sections: [
        {
          title: 'Handshake TLS 1.3 simplificado',
          steps: [
            'Client Hello: o cliente envia versões e cifras suportadas e sua parte da troca de chaves (Diffie-Hellman).',
            'Server Hello: o servidor escolhe a cifra, envia sua parte da troca de chaves e o certificado.',
            'O cliente valida o certificado: assinatura de uma CA confiável, validade e nome do domínio.',
            'Ambos derivam a mesma chave de sessão simétrica.',
            'Os dados HTTP passam a trafegar cifrados. No TLS 1.3, tudo isso leva só 1 RTT.',
          ],
        },
        {
          title: 'Cadeia de confiança',
          code: 'CA Raiz (pré-instalada no SO/navegador)\n   └── CA Intermediária\n          └── Certificado do site (www.example.com)',
          content: 'O navegador confia no site porque confia na CA raiz que, por meio da intermediária, assinou o certificado do site.',
        },
        {
          title: 'Boas práticas de HTTPS',
          items: [
            'Redirecionar todo HTTP (80) para HTTPS (443).',
            'HSTS (Strict-Transport-Security): o navegador passa a usar só HTTPS naquele domínio.',
            'Usar apenas TLS 1.2 e 1.3; desabilitar SSL, TLS 1.0 e 1.1.',
            'Renovar certificados automaticamente (ACME/Let\'s Encrypt).',
            'Cookies de sessão com as flags Secure, HttpOnly e SameSite.',
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Qual método HTTP é usado normalmente para enviar dados de um formulário de login?',
      options: ['GET', 'POST', 'DELETE', 'HEAD'],
      answer: 'POST',
      explanation: 'POST envia dados no corpo da requisição; GET colocaria a senha na URL.',
    },
    {
      question: 'O código 301 indica:',
      options: ['Sucesso', 'Redirecionamento permanente', 'Recurso não encontrado', 'Erro interno do servidor'],
      answer: 'Redirecionamento permanente',
      explanation: '301 Moved Permanently informa que o recurso mudou de endereço definitivamente.',
    },
    {
      question: 'Um erro 503 indica que:',
      options: ['O usuário não está autenticado', 'O servidor está temporariamente indisponível', 'A página não existe', 'O pedido foi aceito'],
      answer: 'O servidor está temporariamente indisponível',
      explanation: '503 Service Unavailable aparece em sobrecarga ou manutenção.',
    },
    {
      question: 'O que garante que você está falando com o servidor legítimo em uma conexão HTTPS?',
      options: ['O endereço IP', 'O certificado digital assinado por uma CA confiável', 'A porta 443', 'O cookie de sessão'],
      answer: 'O certificado digital assinado por uma CA confiável',
      explanation: 'O certificado vincula a chave pública ao domínio e é validado pela cadeia de confiança.',
    },
    {
      question: 'O cabeçalho HSTS serve para:',
      options: ['Comprimir respostas', 'Forçar o navegador a usar apenas HTTPS no domínio', 'Definir o tempo de cache', 'Autenticar o usuário'],
      answer: 'Forçar o navegador a usar apenas HTTPS no domínio',
      explanation: 'Strict-Transport-Security evita ataques de rebaixamento para HTTP.',
    },
    {
      question: 'Qual versão do HTTP roda sobre QUIC?',
      options: ['HTTP/1.0', 'HTTP/1.1', 'HTTP/2', 'HTTP/3'],
      answer: 'HTTP/3',
      explanation: 'O HTTP/3 usa QUIC, que roda sobre UDP.',
    },
  ],
  details: {
    objectives: [
      'Ler e interpretar requisições e respostas HTTP.',
      'Usar corretamente métodos e códigos de status.',
      'Explicar como cookies mantêm sessões em um protocolo sem estado.',
      'Descrever o handshake TLS e a cadeia de certificados.',
      'Aplicar boas práticas de HTTPS.',
    ],
    keyPoints: [
      'HTTP = requisição/resposta, sem estado; HTTP 80, HTTPS 443.',
      '2xx sucesso, 3xx redirecionamento, 4xx erro do cliente, 5xx erro do servidor.',
      'HTTPS = HTTP + TLS: confidencialidade, integridade e autenticidade.',
      'Certificados são confiáveis por causa da cadeia até uma CA raiz.',
      'HTTP/2 multiplexa sobre TCP; HTTP/3 usa QUIC.',
    ],
    commands: [
      { title: 'Ver uma requisição completa', platform: 'Multiplataforma', code: 'curl -v https://example.com\ncurl -I https://example.com         # só cabeçalhos\ncurl -X POST -d "user=ana" https://httpbin.org/post' },
      { title: 'Inspecionar o certificado', platform: 'Linux/macOS', code: 'openssl s_client -connect example.com:443 -servername example.com </dev/null | openssl x509 -noout -subject -issuer -dates' },
      { title: 'Requisição pelo PowerShell', platform: 'Windows', code: 'Invoke-WebRequest https://example.com | Select-Object StatusCode, Headers' },
    ],
    pitfalls: [
      { problem: 'Confundir 401 com 403.', solution: '401 = não autenticado (faça login); 403 = autenticado, mas sem permissão.' },
      { problem: '"Conteúdo misto": página HTTPS carregando scripts por HTTP.', solution: 'Carregue todos os recursos por HTTPS.' },
      { problem: 'Certificado expirado derrubando o site.', solution: 'Automatize a renovação e monitore a data de validade.' },
    ],
    security: [
      'Nunca envie senhas ou tokens por HTTP sem TLS, nem na URL (ficam em logs e no histórico).',
      'Ataques MITM e SSL stripping são mitigados com HTTPS em tudo + HSTS.',
      'Não ignore alertas de certificado do navegador: podem indicar interceptação.',
      'Cabeçalhos de segurança: Content-Security-Policy, X-Content-Type-Options, Referrer-Policy.',
    ],
    lab: {
      title: 'Dissecando HTTP e HTTPS',
      goal: 'Comparar o que é visível em HTTP e em HTTPS.',
      tools: 'Wireshark, curl e DevTools do navegador.',
      steps: [
        'Capture com o filtro "http" e acesse http://example.com: veja o GET e a resposta em texto claro.',
        'Capture com o filtro "tls" e acesse https://example.com: observe o Client Hello (com o nome do site no SNI) e os dados cifrados.',
        'No DevTools, aba Rede, veja status, cabeçalhos e o protocolo (h2 ou h3) de cada requisição.',
        'Com openssl s_client, liste emissor e validade do certificado.',
      ],
      expected: 'Perceber que em HTTPS só metadados (IP, porta, SNI) ficam visíveis; o conteúdo HTTP fica cifrado.',
    },
    references: ['RFC 9110 — HTTP Semantics', 'RFC 9113 — HTTP/2', 'RFC 9114 — HTTP/3', 'RFC 8446 — TLS 1.3', 'MDN Web Docs — HTTP'],
  },
};
