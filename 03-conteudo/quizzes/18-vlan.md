<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 18 — VLAN

## 1. Cada VLAN corresponde a um:

- Domínio de colisão
- **Domínio de broadcast** ✅
- Sistema autônomo
- Protocolo de roteamento

**Explicação:** Broadcasts de uma VLAN não alcançam outras VLANs.

## 2. Qual padrão IEEE define a marcação (tag) de VLANs em trunks?

- 802.3
- 802.11
- **802.1Q** ✅
- 802.1X

**Explicação:** O 802.1Q insere uma tag de 4 bytes com o VLAN ID de 12 bits.

## 3. Quantos bits tem o campo VLAN ID?

- 8
- 10
- **12** ✅
- 16

**Explicação:** 12 bits → até 4096 valores (1 a 4094 utilizáveis).

## 4. O que trafega sem tag em um trunk 802.1Q?

- A VLAN de voz
- **A VLAN nativa** ✅
- Todas as VLANs
- A VLAN de gerência

**Explicação:** Por isso ela deve ser uma VLAN sem uso, para mitigar double tagging.

## 5. PCs em VLANs diferentes precisam de que para se comunicar?

- Um hub
- **Roteamento (roteador ou switch L3)** ✅
- Um access point
- Nada, já se comunicam

**Explicação:** VLANs diferentes são redes IP diferentes.

## 6. Qual comando impede a negociação automática de trunk (DTP)?

- **switchport nonegotiate** ✅
- no vlan 1
- spanning-tree portfast
- vtp mode server

**Explicação:** Evita que um dispositivo malicioso negocie um trunk.
