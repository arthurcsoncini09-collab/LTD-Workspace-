<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 19 — VPN

## 1. Qual o objetivo principal de uma VPN?

- Aumentar a velocidade da Internet
- **Criar um túnel seguro sobre uma rede não confiável** ✅
- Atribuir IPs automaticamente
- Substituir o firewall

**Explicação:** A VPN cifra e encapsula o tráfego sobre redes públicas como a Internet.

## 2. Qual protocolo do IPsec negocia as chaves?

- ESP
- AH
- **IKE** ✅
- GRE

**Explicação:** O IKE (UDP 500/4500) autentica os pares e negocia as associações de segurança.

## 3. Qual componente do IPsec cifra os dados?

- AH
- **ESP** ✅
- IKE
- ISAKMP

**Explicação:** O ESP oferece confidencialidade e integridade; o AH só autentica, sem cifrar.

## 4. Qual protocolo de VPN é considerado inseguro e não deve ser usado?

- WireGuard
- IKEv2
- OpenVPN
- **PPTP** ✅

**Explicação:** O PPTP tem falhas criptográficas conhecidas.

## 5. No split tunneling:

- Todo o tráfego passa pela VPN
- **Só o tráfego para a rede corporativa passa pela VPN** ✅
- A VPN é dividida entre dois servidores
- O túnel não é cifrado

**Explicação:** O restante sai diretamente para a Internet pela conexão local do usuário.

## 6. Uma VPN que interliga permanentemente a matriz e uma filial é do tipo:

- Acesso remoto
- **Site-to-site** ✅
- Clientless
- P2P

**Explicação:** Conecta redes inteiras por meio dos gateways de cada local.
