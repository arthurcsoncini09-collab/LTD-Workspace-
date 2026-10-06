<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 13 — ICMP

## 1. Quais mensagens ICMP o ping usa?

- Tipo 3 e 11
- **Tipo 8 e 0** ✅
- Tipo 5 e 12
- Tipo 0 e 3

**Explicação:** Echo Request (8) e Echo Reply (0).

## 2. O traceroute descobre os roteadores do caminho usando qual campo do IP?

- Checksum
- **TTL** ✅
- Identification
- Protocol

**Explicação:** Cada roteador que zera o TTL responde com ICMP Time Exceeded, revelando seu endereço.

## 3. O ICMP usa portas como o TCP e o UDP?

- Sim, a porta 7
- Sim, a porta 53
- **Não, usa tipo e código** ✅
- Sim, portas efêmeras

**Explicação:** O ICMP não tem portas; as mensagens são identificadas por tipo e código.

## 4. Uma resposta com TTL=118 a partir de um servidor provavelmente veio de um sistema que iniciou o TTL em:

- 64
- **128** ✅
- 255
- 32

**Explicação:** O valor inicial mais próximo acima de 118 é 128 (típico de Windows); ele passou por 10 roteadores.

## 5. ICMP Tipo 3 Código 4 ("fragmentação necessária") é essencial para:

- O DHCP
- **O Path MTU Discovery** ✅
- O DNS
- O ARP

**Explicação:** Bloquear essa mensagem causa "buracos negros" de MTU.

## 6. No IPv6, qual protocolo substitui o ARP e roda sobre ICMPv6?

- DHCPv6
- **NDP (Neighbor Discovery)** ✅
- RIPng
- IGMP

**Explicação:** O NDP usa mensagens ICMPv6 de solicitação e anúncio de vizinhos.
