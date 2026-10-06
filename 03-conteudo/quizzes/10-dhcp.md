<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 10 — DHCP

## 1. Qual etapa do DORA corresponde à confirmação final do endereço?

- DISCOVER
- OFFER
- REQUEST
- **ACK** ✅

**Explicação:** O ACK confirma ao cliente que a configuração foi atribuída e ele pode usá-la.

## 2. Qual é a finalidade do lease DHCP?

- Bloquear o acesso à Internet
- **Definir a validade do endereço fornecido** ✅
- Trocar a porta do switch
- Criptografar o tráfego

**Explicação:** O lease define por quanto tempo o cliente pode usar o IP antes de renovar.

## 3. Quais portas UDP o DHCP usa?

- 53 e 54
- **67 e 68** ✅
- 80 e 443
- 161 e 162

**Explicação:** Servidor na 67, cliente na 68.

## 4. Qual comando Cisco encaminha pedidos DHCP para um servidor em outra rede?

- ip dhcp pool
- **ip helper-address** ✅
- ip route
- dhcp relay enable

**Explicação:** O ip helper-address transforma o broadcast DHCP em unicast para o servidor.

## 5. Uma reserva DHCP associa um IP fixo a:

- Um nome DNS
- **Um endereço MAC** ✅
- Uma porta TCP
- Uma VLAN

**Explicação:** O servidor sempre entrega o mesmo IP ao dispositivo com aquele MAC.

## 6. Qual recurso de switch bloqueia servidores DHCP não autorizados?

- **DHCP snooping** ✅
- Port mirroring
- STP
- LACP

**Explicação:** Com DHCP snooping, só portas marcadas como confiáveis podem enviar respostas de servidor DHCP.
