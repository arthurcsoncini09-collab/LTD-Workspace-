<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 6 — MAC e ARP

## 1. Quantos bits tem um endereço MAC?

- 32
- **48** ✅
- 64
- 128

**Explicação:** O MAC tem 48 bits (6 bytes), escritos em 12 dígitos hexadecimais.

## 2. Qual é a função principal do ARP?

- Traduzir nome em IP
- **Descobrir o MAC a partir de um IP** ✅
- Atribuir IPs automaticamente
- Criptografar quadros

**Explicação:** O ARP resolve endereços IPv4 em endereços MAC na rede local.

## 3. Para qual endereço MAC é enviado um ARP Request?

- 00:00:00:00:00:00
- **FF:FF:FF:FF:FF:FF** ✅
- MAC do gateway
- 01:00:5E:00:00:01

**Explicação:** O Request é broadcast porque o MAC do destino ainda é desconhecido.

## 4. Os primeiros 24 bits de um MAC identificam:

- A VLAN
- **O fabricante (OUI)** ✅
- A sub-rede
- A porta do switch

**Explicação:** O OUI é atribuído pelo IEEE a cada fabricante.

## 5. Um PC quer enviar um pacote para um servidor em outra rede. Ele faz ARP para descobrir o MAC de:

- O servidor de destino
- O servidor DNS
- **O gateway padrão** ✅
- Todos os hosts

**Explicação:** Fora da sub-rede, o quadro vai para o gateway; o MAC do servidor remoto nunca é necessário.

## 6. Qual recurso de switch mitiga ataques de ARP spoofing?

- PortFast
- **Dynamic ARP Inspection** ✅
- Trunking
- EtherChannel

**Explicação:** O DAI descarta mensagens ARP cujas associações IP/MAC não batem com a base do DHCP snooping.
