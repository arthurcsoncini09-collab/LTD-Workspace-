<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 9 — DNS

## 1. Qual a função principal do DNS?

- Atribuir IPs aos hosts
- **Traduzir nomes de domínio em endereços IP** ✅
- Criptografar o tráfego web
- Encaminhar pacotes entre redes

**Explicação:** O DNS resolve nomes como example.com em endereços IP.

## 2. Qual registro indica o servidor de e-mail de um domínio?

- A
- CNAME
- **MX** ✅
- PTR

**Explicação:** MX (Mail eXchanger) aponta para os servidores que recebem e-mails do domínio.

## 3. O que o TTL de um registro DNS controla?

- O número de saltos
- **Por quanto tempo a resposta pode ficar em cache** ✅
- A prioridade do registro
- O tamanho máximo da resposta

**Explicação:** O TTL, em segundos, define a validade da resposta nos caches.

## 4. Qual porta e protocolo o DNS usa na maioria das consultas?

- **53/UDP** ✅
- 53/TCP
- 443/TCP
- 67/UDP

**Explicação:** Consultas comuns usam UDP 53; TCP 53 é usado em respostas grandes e transferências de zona.

## 5. Qual registro faz a resolução reversa (IP → nome)?

- **PTR** ✅
- SOA
- NS
- TXT

**Explicação:** Registros PTR ficam na zona in-addr.arpa (IPv4) ou ip6.arpa (IPv6).

## 6. Qual tecnologia assina digitalmente os registros DNS para garantir autenticidade?

- DoH
- **DNSSEC** ✅
- DHCP
- SPF

**Explicação:** DNSSEC garante autenticidade e integridade; DoH/DoT garantem confidencialidade no transporte.
