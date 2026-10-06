<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 7 — TCP e UDP

**Nível:** Intermediário · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/tcp-udp`

> Os protocolos de transporte: handshake, números de sequência, janela deslizante, controle de congestionamento, UDP e QUIC.

**Objetivo:** Comparar TCP e UDP, entender como o TCP garante entrega confiável e saber escolher o protocolo adequado para cada aplicação.

O TCP é orientado a conexão e confiável: numera, confirma e retransmite. O UDP é simples e rápido: envia e não espera confirmação. A escolha depende do que a aplicação valoriza mais.

## Objetivos de aprendizagem

- Diferenciar TCP e UDP e escolher o adequado para cada aplicação.
- Descrever o three-way handshake e o encerramento de conexões.
- Explicar sequência, ACK, retransmissão e janela deslizante.
- Reconhecer o QUIC como evolução do transporte na web.

## Aula 1 — TCP vs UDP

**Palavras-chave:** TCP, UDP, orientado a conexão, confiabilidade, datagrama, QUIC

### Introdução

A camada de transporte entrega dados entre processos (aplicações), identificados por portas. Os dois protocolos principais são o TCP (Transmission Control Protocol) e o UDP (User Datagram Protocol).

### Por que isso importa

Escolher o protocolo errado prejudica a aplicação: um download com UDP sem tratamento corromperia arquivos; uma chamada de voz com TCP sofreria atrasos por retransmissões que já não servem para nada.

### Explicação

O TCP é como uma carta registrada com aviso de recebimento: há confirmação, ordem e reenvio se algo se perder. O UDP é como gritar uma informação numa sala: é rápido, mas ninguém confirma se ouviu.

### Conteúdo

#### Comparativo

| Característica | TCP | UDP |
| --- | --- | --- |
| Conexão | Orientado a conexão (handshake) | Sem conexão |
| Confiabilidade | Confirmações (ACK) e retransmissão | Sem garantia de entrega |
| Ordem | Entrega em ordem | Pode chegar fora de ordem |
| Controle de fluxo/congestionamento | Sim | Não |
| Cabeçalho | 20 a 60 bytes | 8 bytes |
| Velocidade/latência | Maior overhead | Mínimo overhead |
| Exemplos | HTTP/1.1, HTTP/2, SSH, SMTP, FTP | DNS, DHCP, VoIP, jogos, SNMP, QUIC |

#### Cabeçalho UDP (8 bytes)

```
| Porta de origem (16) | Porta de destino (16) |
| Comprimento (16)     | Checksum (16)         |
```

#### QUIC: o melhor dos dois mundos

O QUIC (RFC 9000), criado pelo Google e padronizado pelo IETF, roda sobre UDP mas implementa confiabilidade, controle de congestionamento e criptografia TLS 1.3 integrada. Ele reduz a latência de conexão e evita o "bloqueio na cabeça da fila" do TCP. É a base do HTTP/3.

### Contexto real

Navegação web, e-mail e SSH usam TCP. DNS, VoIP, jogos online, streaming ao vivo e DHCP usam UDP. O HTTP/3 roda sobre QUIC, que é construído em cima do UDP.

### Exercício

Por que jogos online e chamadas de vídeo preferem UDP?

<details><summary>Resposta</summary>

Porque latência baixa importa mais do que entregar 100% dos dados. Um pacote de voz atrasado é inútil; retransmiti-lo só aumentaria o atraso.

</details>

### Desafio

Classifique como TCP ou UDP: download de arquivo, consulta DNS, transmissão ao vivo, acesso SSH, DHCP, envio de e-mail.

## Aula 2 — Handshake, sequência e confiabilidade do TCP

**Palavras-chave:** three-way handshake, SYN, ACK, FIN, RST, janela, retransmissão

### Introdução

Antes de trocar dados, o TCP estabelece uma conexão com o three-way handshake. Durante a troca, cada byte é numerado e confirmado. No fim, a conexão é encerrada de forma ordenada.

### Por que isso importa

Entender o handshake explica erros como "connection refused" e "timeout", ataques de SYN flood e o que o Wireshark mostra em uma captura.

### Explicação

O cliente envia SYN com um número de sequência inicial (ISN). O servidor responde SYN-ACK com seu próprio ISN e confirma o do cliente (ACK = ISN+1). O cliente envia ACK. A partir daí, ambos sabem de onde começa a contagem de bytes do outro.

### Conteúdo

#### Three-way handshake

```
Cliente                          Servidor
  | ---- SYN  seq=100 -----------> |
  | <--- SYN-ACK seq=300 ack=101 -- |
  | ---- ACK  seq=101 ack=301 ----> |
  |      conexão ESTABLISHED        |
```

#### Encerramento (four-way)

Um RST (reset) encerra a conexão abruptamente — por exemplo, quando não há serviço escutando na porta.

1. Lado A envia FIN: "terminei de enviar".
2. Lado B confirma com ACK.
3. Lado B envia seu FIN quando também terminar.
4. Lado A confirma com ACK e aguarda em TIME_WAIT antes de liberar a porta.

#### Mecanismos de confiabilidade e desempenho

- Números de sequência e ACK: cada byte é numerado; o ACK indica o próximo byte esperado.
- Retransmissão: se o ACK não chegar dentro do tempo (RTO) ou chegarem 3 ACKs duplicados, o segmento é reenviado.
- Janela deslizante (controle de fluxo): o receptor anuncia quantos bytes ainda consegue receber.
- Controle de congestionamento: slow start, congestion avoidance e algoritmos como CUBIC e BBR ajustam a taxa à capacidade da rede.
- MSS: tamanho máximo de dados por segmento, negociado no handshake (tipicamente 1460 bytes).

#### Flags TCP

| Flag | Significado |
| --- | --- |
| SYN | Iniciar conexão / sincronizar números de sequência |
| ACK | Campo de confirmação é válido |
| FIN | Encerrar a conexão de forma ordenada |
| RST | Reiniciar/abortar a conexão |
| PSH | Entregar os dados imediatamente à aplicação |
| URG | Dados urgentes (raramente usado) |

### Contexto real

Ao abrir um site, a primeira coisa que o navegador faz após o DNS é o handshake TCP com a porta 443. Em uma rede com alta latência, só esse handshake já adiciona um RTT inteiro de atraso.

### Exercício

Quais são as três mensagens do three-way handshake, na ordem?

<details><summary>Resposta</summary>

SYN (cliente → servidor), SYN-ACK (servidor → cliente) e ACK (cliente → servidor).

</details>

### Desafio

Um servidor recebe milhares de SYN de IPs falsos e nunca recebe o ACK final. Que ataque é esse e como mitigá-lo?

## Comandos úteis

**Ver estados das conexões TCP** (Linux/macOS)

```
ss -tan state established
ss -tan | awk '{print $1}' | sort | uniq -c   # contagem por estado
```

**Ver conexões e processos** (Windows)

```
netstat -ano | findstr ESTABLISHED
Get-NetTCPConnection -State Established
```

**Testar uma porta TCP e uma UDP** (Linux/macOS)

```
nc -zv example.com 443       # TCP
nc -zvu 8.8.8.8 53           # UDP (resultado menos confiável)
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Achar que UDP é "pior" que TCP. | São ferramentas para necessidades diferentes; UDP é ideal para tempo real. |
| Interpretar "connection refused" como problema de rede. | Refused (RST) significa que o host respondeu, mas nada escuta naquela porta. Timeout é que costuma indicar firewall ou rota. |
| Confundir número de sequência com número do pacote. | O TCP numera bytes, não segmentos. |

## Segurança

- SYN flood esgota a fila de conexões semiabertas: mitigue com SYN cookies, rate limiting e proteção anti-DDoS.
- Ataques de amplificação UDP (DNS, NTP, Memcached) usam IP de origem falsificado; feche serviços UDP abertos desnecessariamente.
- Port scanning com SYN (nmap -sS) é comum: monitore com IDS.

## Pontos-chave

- TCP: confiável, ordenado, com conexão. UDP: rápido, simples, sem garantias.
- Handshake: SYN → SYN-ACK → ACK.
- ACK indica o próximo byte esperado.
- Controle de fluxo (janela) ≠ controle de congestionamento.
- HTTP/3 = QUIC sobre UDP.

## Laboratório: Capturando um handshake TCP

**Objetivo:** Ver SYN, SYN-ACK, ACK e o encerramento FIN no Wireshark.

**Ferramentas:** Wireshark e navegador ou curl.

1. Inicie a captura e aplique o filtro "tcp.port == 80".
2. Execute curl http://example.com.
3. Identifique as três mensagens do handshake e anote seq e ack de cada uma.
4. Localize o encerramento com FIN e observe os ACKs correspondentes.
5. Compare com uma consulta DNS (filtro "udp.port == 53"): não há handshake.

**Resultado esperado:** Handshake com números relativos seq=0/ack=1 e uma consulta DNS UDP de um único pacote de ida e um de volta.

## Quiz

Gabarito em [../quizzes/07-tcp-udp.md](../quizzes/07-tcp-udp.md).

## Leituras recomendadas

- RFC 9293 — Transmission Control Protocol
- RFC 768 — User Datagram Protocol
- RFC 9000 — QUIC
- RFC 5681 — TCP Congestion Control
