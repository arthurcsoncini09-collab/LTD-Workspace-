<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 16 — NAT e PAT

## 1. Qual o principal motivo da criação do NAT?

- Aumentar a velocidade
- **Economizar endereços IPv4 públicos** ✅
- Criptografar o tráfego
- Substituir o DNS

**Explicação:** O NAT permite que redes inteiras usem endereços privados e compartilhem poucos IPs públicos.

## 2. O que diferencia as conexões no PAT?

- O endereço MAC
- **O número da porta** ✅
- A VLAN
- O TTL

**Explicação:** Todas compartilham o IP público; a porta identifica cada conexão.

## 3. No Cisco, o IP do host interno visto da Internet (após a tradução) chama-se:

- Inside local
- **Inside global** ✅
- Outside local
- Outside global

**Explicação:** Inside local é o IP privado; inside global é o IP traduzido, visto de fora.

## 4. Qual palavra-chave ativa o PAT no comando ip nat inside source?

- static
- pool
- **overload** ✅
- dynamic

**Explicação:** overload faz várias traduções compartilharem o mesmo IP público.

## 5. Para publicar um servidor web interno na Internet é necessário:

- Apenas PAT
- **NAT estático ou port forwarding** ✅
- DHCP relay
- Uma VLAN nova

**Explicação:** Conexões iniciadas de fora precisam de uma tradução pré-definida.

## 6. A faixa 100.64.0.0/10 é usada para:

- Multicast
- Loopback
- **CGNAT (endereços compartilhados de provedores)** ✅
- Documentação

**Explicação:** Definida no RFC 6598 para Carrier-Grade NAT.
