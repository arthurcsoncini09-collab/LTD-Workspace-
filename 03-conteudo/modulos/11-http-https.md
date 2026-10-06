<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 11 — HTTP/HTTPS

**Nível:** Intermediário · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/http-https`

> Requisição e resposta, métodos, códigos de status, cabeçalhos, cookies, versões do HTTP, TLS, certificados e HSTS.

**Objetivo:** Entender como a web funciona no nível do protocolo e como o HTTPS protege a comunicação com TLS e certificados digitais.

O HTTP é um protocolo de requisição e resposta sem estado. O HTTPS é o HTTP dentro de um túnel TLS, que garante confidencialidade, integridade e autenticidade do servidor.

## Objetivos de aprendizagem

- Ler e interpretar requisições e respostas HTTP.
- Usar corretamente métodos e códigos de status.
- Explicar como cookies mantêm sessões em um protocolo sem estado.
- Descrever o handshake TLS e a cadeia de certificados.
- Aplicar boas práticas de HTTPS.

## Aula 1 — O protocolo HTTP

**Palavras-chave:** HTTP, método, GET, POST, status, cabeçalho, cookie, stateless

### Introdução

O HTTP (HyperText Transfer Protocol) é a base da web. O cliente envia uma requisição com um método, um caminho e cabeçalhos; o servidor responde com um código de status, cabeçalhos e, geralmente, um corpo.

### Por que isso importa

Desenvolvedores, analistas de suporte e de segurança leem requisições HTTP o tempo todo — em logs, no DevTools do navegador ou em APIs.

### Explicação

O HTTP é sem estado (stateless): cada requisição é independente. Para "lembrar" quem é o usuário, usam-se cookies ou tokens enviados a cada requisição.

### Conteúdo

#### Anatomia de uma troca HTTP

```
GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0
Accept: text/html

HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 1256
Cache-Control: max-age=3600

<!doctype html> ...
```

#### Métodos

| Método | Uso | Idempotente? |
| --- | --- | --- |
| GET | Obter um recurso | Sim |
| POST | Enviar dados / criar recurso | Não |
| PUT | Substituir um recurso | Sim |
| PATCH | Alterar parte de um recurso | Não necessariamente |
| DELETE | Remover um recurso | Sim |
| HEAD | Igual ao GET, sem o corpo | Sim |
| OPTIONS | Consultar métodos permitidos (usado no CORS) | Sim |

#### Códigos de status

| Classe | Significado | Exemplos |
| --- | --- | --- |
| 1xx | Informativo | 101 Switching Protocols (WebSocket) |
| 2xx | Sucesso | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirecionamento | 301 Moved Permanently, 302 Found, 304 Not Modified |
| 4xx | Erro do cliente | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| 5xx | Erro do servidor | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout |

#### Versões do HTTP

| Versão | Transporte | Novidade |
| --- | --- | --- |
| HTTP/1.1 (1997) | TCP | Conexões persistentes; uma requisição por vez por conexão |
| HTTP/2 (2015) | TCP + TLS | Multiplexação, cabeçalhos comprimidos (HPACK), formato binário |
| HTTP/3 (2022) | QUIC (UDP) | Sem bloqueio na cabeça da fila do TCP, conexão mais rápida |

### Contexto real

Ao enviar um formulário de login, o navegador faz um POST com usuário e senha; o servidor responde 302 (redirecionamento) e um cabeçalho Set-Cookie com o identificador da sessão.

### Exercício

O que significa o código de status 404? E o 500?

<details><summary>Resposta</summary>

404 Not Found: o recurso pedido não existe (erro do cliente). 500 Internal Server Error: falha no servidor ao processar a requisição.

</details>

### Desafio

Abra o DevTools (F12) → aba Rede, recarregue uma página e identifique o método, o status, o tipo de conteúdo e o tempo de cada requisição.

## Aula 2 — HTTPS, TLS e certificados

**Palavras-chave:** HTTPS, TLS, certificado, CA, chave pública, HSTS, man-in-the-middle

### Introdução

O HTTPS é o HTTP transportado dentro de uma sessão TLS (Transport Layer Security). O TLS cifra os dados, detecta adulterações e prova a identidade do servidor por meio de um certificado digital.

### Por que isso importa

Sem HTTPS, qualquer um na mesma rede Wi-Fi ou no caminho pode ler e alterar senhas, cookies e conteúdo. Hoje navegadores marcam sites HTTP como "Não seguro".

### Explicação

O TLS usa criptografia assimétrica (par de chaves pública/privada) para autenticar o servidor e combinar uma chave de sessão, e criptografia simétrica (como AES ou ChaCha20) para cifrar os dados com rapidez.

### Conteúdo

#### Handshake TLS 1.3 simplificado

1. Client Hello: o cliente envia versões e cifras suportadas e sua parte da troca de chaves (Diffie-Hellman).
2. Server Hello: o servidor escolhe a cifra, envia sua parte da troca de chaves e o certificado.
3. O cliente valida o certificado: assinatura de uma CA confiável, validade e nome do domínio.
4. Ambos derivam a mesma chave de sessão simétrica.
5. Os dados HTTP passam a trafegar cifrados. No TLS 1.3, tudo isso leva só 1 RTT.

#### Cadeia de confiança

O navegador confia no site porque confia na CA raiz que, por meio da intermediária, assinou o certificado do site.

```
CA Raiz (pré-instalada no SO/navegador)
   └── CA Intermediária
          └── Certificado do site (www.example.com)
```

#### Boas práticas de HTTPS

- Redirecionar todo HTTP (80) para HTTPS (443).
- HSTS (Strict-Transport-Security): o navegador passa a usar só HTTPS naquele domínio.
- Usar apenas TLS 1.2 e 1.3; desabilitar SSL, TLS 1.0 e 1.1.
- Renovar certificados automaticamente (ACME/Let's Encrypt).
- Cookies de sessão com as flags Secure, HttpOnly e SameSite.

### Contexto real

O cadeado no navegador indica que o certificado foi emitido por uma autoridade certificadora (CA) confiável para aquele domínio — por exemplo, pela Let's Encrypt, que emite certificados gratuitos.

### Exercício

Quais três garantias o TLS oferece?

<details><summary>Resposta</summary>

Confidencialidade (ninguém lê), integridade (ninguém altera sem ser detectado) e autenticidade do servidor (você fala com quem pensa estar falando).

</details>

### Desafio

Clique no cadeado de um site HTTPS e descubra: quem emitiu o certificado, até quando é válido e para quais domínios ele vale.

## Comandos úteis

**Ver uma requisição completa** (Multiplataforma)

```
curl -v https://example.com
curl -I https://example.com         # só cabeçalhos
curl -X POST -d "user=ana" https://httpbin.org/post
```

**Inspecionar o certificado** (Linux/macOS)

```
openssl s_client -connect example.com:443 -servername example.com </dev/null | openssl x509 -noout -subject -issuer -dates
```

**Requisição pelo PowerShell** (Windows)

```
Invoke-WebRequest https://example.com | Select-Object StatusCode, Headers
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Confundir 401 com 403. | 401 = não autenticado (faça login); 403 = autenticado, mas sem permissão. |
| "Conteúdo misto": página HTTPS carregando scripts por HTTP. | Carregue todos os recursos por HTTPS. |
| Certificado expirado derrubando o site. | Automatize a renovação e monitore a data de validade. |

## Segurança

- Nunca envie senhas ou tokens por HTTP sem TLS, nem na URL (ficam em logs e no histórico).
- Ataques MITM e SSL stripping são mitigados com HTTPS em tudo + HSTS.
- Não ignore alertas de certificado do navegador: podem indicar interceptação.
- Cabeçalhos de segurança: Content-Security-Policy, X-Content-Type-Options, Referrer-Policy.

## Pontos-chave

- HTTP = requisição/resposta, sem estado; HTTP 80, HTTPS 443.
- 2xx sucesso, 3xx redirecionamento, 4xx erro do cliente, 5xx erro do servidor.
- HTTPS = HTTP + TLS: confidencialidade, integridade e autenticidade.
- Certificados são confiáveis por causa da cadeia até uma CA raiz.
- HTTP/2 multiplexa sobre TCP; HTTP/3 usa QUIC.

## Laboratório: Dissecando HTTP e HTTPS

**Objetivo:** Comparar o que é visível em HTTP e em HTTPS.

**Ferramentas:** Wireshark, curl e DevTools do navegador.

1. Capture com o filtro "http" e acesse http://example.com: veja o GET e a resposta em texto claro.
2. Capture com o filtro "tls" e acesse https://example.com: observe o Client Hello (com o nome do site no SNI) e os dados cifrados.
3. No DevTools, aba Rede, veja status, cabeçalhos e o protocolo (h2 ou h3) de cada requisição.
4. Com openssl s_client, liste emissor e validade do certificado.

**Resultado esperado:** Perceber que em HTTPS só metadados (IP, porta, SNI) ficam visíveis; o conteúdo HTTP fica cifrado.

## Quiz

Gabarito em [../quizzes/11-http-https.md](../quizzes/11-http-https.md).

## Leituras recomendadas

- RFC 9110 — HTTP Semantics
- RFC 9113 — HTTP/2
- RFC 9114 — HTTP/3
- RFC 8446 — TLS 1.3
- MDN Web Docs — HTTP
