<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 3 — TCP/IP

**Nível:** Básico · **Aulas:** 2 · **Questões:** 5 · **No site:** `/aulas/tcp-ip`

> A pilha de protocolos real da Internet: camadas, protocolos de cada nível, comparação com o OSI e a jornada de uma requisição.

**Objetivo:** Entender a pilha TCP/IP usada na Internet, seus protocolos por camada e como ela se relaciona com o modelo OSI.

O TCP/IP é o modelo prático que de fato roda na Internet. Ele agrupa as camadas do OSI em quatro (ou cinco) níveis e define os protocolos que usamos todos os dias.

## Objetivos de aprendizagem

- Descrever as camadas do modelo TCP/IP e suas funções.
- Mapear o modelo TCP/IP para o modelo OSI.
- Posicionar os principais protocolos na camada correta.
- Narrar a sequência de protocolos envolvidos ao acessar um site.

## Aula 1 — As camadas do TCP/IP e a comparação com o OSI

**Palavras-chave:** TCP/IP, pilha de protocolos, camada de Internet, acesso à rede, DoD

### Introdução

O modelo TCP/IP nasceu na ARPANET, antes do OSI, e foi construído a partir de protocolos que já funcionavam. Ele tem quatro camadas: Acesso à Rede, Internet, Transporte e Aplicação.

### Por que isso importa

Toda comunicação na Internet usa TCP/IP. Certificações (CCNA, Network+) e o dia a dia profissional usam os dois modelos lado a lado: o OSI para conversar, o TCP/IP para implementar.

### Explicação

O TCP/IP junta as camadas 5, 6 e 7 do OSI em uma só (Aplicação) e as camadas 1 e 2 em "Acesso à Rede". Muitos livros usam um modelo híbrido de 5 camadas (Física, Enlace, Rede, Transporte, Aplicação), que é o mais didático.

### Conteúdo

#### Mapeamento OSI × TCP/IP

| TCP/IP (4 camadas) | Modelo híbrido (5) | OSI (7) | Protocolos |
| --- | --- | --- | --- |
| Aplicação | Aplicação | 7, 6, 5 | HTTP, HTTPS, DNS, DHCP, SSH, SMTP, FTP, TLS |
| Transporte | Transporte | 4 | TCP, UDP, QUIC |
| Internet | Rede | 3 | IPv4, IPv6, ICMP, IPsec |
| Acesso à Rede | Enlace + Física | 2 e 1 | Ethernet, Wi-Fi, ARP, PPP |

#### OSI vs TCP/IP: diferenças essenciais

- O OSI é um modelo de referência genérico; o TCP/IP é um conjunto de protocolos implementados.
- O TCP/IP surgiu primeiro (anos 1970) e venceu a "guerra dos protocolos" por já estar em uso.
- O OSI separa claramente serviço, interface e protocolo; o TCP/IP é mais pragmático.
- Na prática, falamos "camada 2", "camada 3", "camada 7" usando a numeração do OSI.

#### Documentos que definem a pilha

- RFC 791 — Internet Protocol (IPv4).
- RFC 9293 — Transmission Control Protocol (atualiza o RFC 793).
- RFC 768 — User Datagram Protocol.
- RFC 1122 e 1123 — Requisitos para hosts da Internet.

### Contexto real

Seu sistema operacional implementa a pilha TCP/IP: a placa de rede cuida do acesso à rede, o kernel cuida de IP e TCP/UDP, e o navegador implementa HTTP na camada de aplicação.

### Exercício

Quais camadas do OSI correspondem à camada de Aplicação do TCP/IP?

<details><summary>Resposta</summary>

As camadas 5 (Sessão), 6 (Apresentação) e 7 (Aplicação) do OSI.

</details>

### Desafio

Desenhe os dois modelos lado a lado e posicione: Ethernet, ARP, IP, ICMP, TCP, UDP, DNS, HTTP, TLS.

## Aula 2 — A jornada de uma requisição pela pilha

**Palavras-chave:** encapsulamento, requisição, DNS, ARP, TCP, TLS, HTTP

### Introdução

Quando você digita uma URL e pressiona Enter, dezenas de protocolos entram em ação em sequência. Acompanhar essa jornada é a melhor forma de ver a pilha TCP/IP funcionando.

### Por que isso importa

É uma pergunta clássica de entrevista ("o que acontece quando você digita google.com?") e conecta praticamente todos os módulos deste curso.

### Explicação

Cada camada resolve um problema: a aplicação define o que pedir; o transporte garante a entrega ao processo certo; a camada de Internet leva o pacote até a rede certa; o acesso à rede leva o quadro até o próximo equipamento.

### Conteúdo

#### O que acontece ao acessar https://example.com

1. DHCP: o computador obtém IP, máscara, gateway e DNS (se ainda não tiver).
2. DNS: o nome example.com é traduzido para um endereço IP.
3. ARP: descobre o MAC do gateway, pois o servidor está fora da rede local.
4. TCP: three-way handshake (SYN, SYN-ACK, ACK) com a porta 443 do servidor.
5. TLS: negociação de criptografia e validação do certificado.
6. HTTP: o navegador envia GET / e recebe a resposta 200 OK com o HTML.
7. Roteamento e NAT: no caminho, o roteador de casa traduz o IP privado e os roteadores da Internet encaminham os pacotes.

#### Nomes da unidade de dados

| Camada | Nome da PDU | Endereço usado |
| --- | --- | --- |
| Aplicação | Mensagem / dados | Nome (URL) |
| Transporte | Segmento (TCP) / Datagrama (UDP) | Porta |
| Internet | Pacote | Endereço IP |
| Acesso à rede | Quadro | Endereço MAC |

#### Princípio fim a fim

No projeto original da Internet, a "inteligência" fica nas pontas (hosts) e o núcleo da rede apenas encaminha pacotes da melhor forma possível (best effort). Por isso o IP não garante entrega — quem garante é o TCP, nas pontas.

### Contexto real

Abrir https://example.com envolve DHCP (se você acabou de conectar), ARP, DNS, TCP, TLS, HTTP, NAT e roteamento por vários sistemas autônomos.

### Exercício

Antes de enviar o primeiro pacote ao servidor, o computador precisa descobrir dois endereços. Quais são e quais protocolos usa?

<details><summary>Resposta</summary>

O IP do servidor (via DNS) e o MAC do gateway padrão (via ARP), já que o servidor está em outra rede.

</details>

### Desafio

Escreva a sequência completa de protocolos envolvidos ao acessar https://example.com logo após ligar o notebook.

## Comandos úteis

**Ver conexões TCP/UDP ativas** (Windows)

```
netstat -ano
```

**Ver conexões TCP/UDP ativas** (Linux/macOS)

```
ss -tunap        # Linux
netstat -an      # macOS
```

**Ver uma requisição completa** (Multiplataforma)

```
curl -v https://example.com
```

Mostra a resolução, a conexão TCP, o handshake TLS e os cabeçalhos HTTP.

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Dizer que o TCP/IP tem 7 camadas. | São 4 no modelo clássico (5 no híbrido didático). Sete é o OSI. |
| Achar que "TCP/IP" significa só os protocolos TCP e IP. | O nome designa toda a família de protocolos da Internet (UDP, ICMP, DNS, HTTP…). |

## Segurança

- Os protocolos originais do TCP/IP não tinham segurança embutida; TLS, IPsec, DNSSEC e SSH foram acrescentados depois.
- Spoofing de IP é possível porque o IP não autentica a origem — filtros de entrada (BCP 38) ajudam a mitigar.

## Pontos-chave

- TCP/IP: Acesso à Rede, Internet, Transporte, Aplicação.
- É a pilha que realmente roda na Internet; o OSI é referência.
- IP é best effort; a confiabilidade vem do TCP.
- Acessar um site envolve DHCP, DNS, ARP, TCP, TLS e HTTP.

## Laboratório: Seguindo uma requisição com curl e Wireshark

**Objetivo:** Ver na prática DNS, TCP, TLS e HTTP acontecendo em sequência.

**Ferramentas:** curl e Wireshark.

1. Inicie uma captura no Wireshark.
2. Rode curl -v https://example.com.
3. Filtre por "dns || tcp.port == 443" e identifique a consulta DNS, o handshake TCP e o Client Hello do TLS.
4. Compare os tempos de cada etapa na coluna Time.

**Resultado esperado:** Identificar a ordem DNS → TCP (SYN/SYN-ACK/ACK) → TLS → dados criptografados.

## Quiz

Gabarito em [../quizzes/03-tcp-ip.md](../quizzes/03-tcp-ip.md).

## Leituras recomendadas

- RFC 1122 — Requirements for Internet Hosts
- RFC 791 — Internet Protocol
- RFC 9293 — Transmission Control Protocol
