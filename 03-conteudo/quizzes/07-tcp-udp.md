<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 7 — TCP e UDP

## 1. Qual protocolo é orientado a conexão?

- UDP
- **TCP** ✅
- IP
- ICMP

**Explicação:** O TCP estabelece uma conexão com o three-way handshake antes de enviar dados.

## 2. Qual é a sequência correta do three-way handshake?

- SYN, ACK, FIN
- **SYN, SYN-ACK, ACK** ✅
- ACK, SYN, SYN-ACK
- SYN, FIN, ACK

**Explicação:** Cliente envia SYN, servidor responde SYN-ACK e cliente confirma com ACK.

## 3. Qual o tamanho do cabeçalho UDP?

- **8 bytes** ✅
- 20 bytes
- 32 bytes
- 60 bytes

**Explicação:** O cabeçalho UDP tem apenas 4 campos de 16 bits: portas, comprimento e checksum.

## 4. Qual aplicação tipicamente usa UDP?

- SSH
- Transferência de arquivos por FTP
- **Consulta DNS** ✅
- Envio de e-mail por SMTP

**Explicação:** Consultas DNS usam UDP na porta 53 (TCP é usado para respostas grandes e transferências de zona).

## 5. O mecanismo em que o receptor informa quantos bytes ainda pode receber chama-se:

- Checksum
- **Janela deslizante** ✅
- TTL
- Fragmentação

**Explicação:** O campo Window do TCP implementa o controle de fluxo.

## 6. O HTTP/3 utiliza qual protocolo de transporte?

- TCP
- SCTP
- **QUIC sobre UDP** ✅
- ICMP

**Explicação:** O HTTP/3 roda sobre QUIC, que é implementado em cima do UDP.
