<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 6 — MAC e ARP

**Nível:** Intermediário · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/mac-e-arp`

> Endereço MAC, quadro Ethernet, o funcionamento do ARP, tabela ARP e ataques de ARP spoofing.

**Objetivo:** Entender o endereçamento de camada 2, como o ARP liga endereços IP a endereços MAC e como proteger a rede contra ARP spoofing.

O IP diz para qual host vai o pacote; o MAC diz para qual placa de rede vai o quadro no enlace local. O ARP faz a ponte entre os dois descobrindo o MAC a partir do IP.

## Objetivos de aprendizagem

- Descrever a estrutura do endereço MAC e do quadro Ethernet.
- Explicar o processo de ARP Request e ARP Reply.
- Interpretar a tabela ARP de um host.
- Reconhecer o ARP spoofing e aplicar contramedidas.

## Aula 1 — Endereço MAC e quadro Ethernet

**Palavras-chave:** MAC, OUI, Ethernet, quadro, FCS, broadcast

### Introdução

O endereço MAC (Media Access Control) identifica uma interface de rede na camada 2. Tem 48 bits, escritos em hexadecimal, como 00:1A:2B:3C:4D:5E ou 001a.2b3c.4d5e (formato Cisco).

### Por que isso importa

Dentro de uma LAN, os quadros são entregues pelo MAC, não pelo IP. Switches, Wi-Fi e filtros de acesso dependem dele.

### Explicação

Os primeiros 24 bits do MAC formam o OUI (Organizationally Unique Identifier), atribuído pelo IEEE ao fabricante. Os 24 bits seguintes são definidos pelo fabricante para cada placa.

### Conteúdo

#### Estrutura do endereço MAC

- Unicast: o bit menos significativo do primeiro byte é 0.
- Multicast: esse bit é 1 (ex.: 01:00:5E:xx:xx:xx para multicast IPv4).
- Broadcast: FF:FF:FF:FF:FF:FF.
- Endereços "localmente administrados" (2º bit do 1º byte = 1) são usados em MACs aleatórios e VMs.

```
  00 : 1A : 2B  |  3C : 4D : 5E
  └── OUI ───┘     └ identificador da placa ┘
   (fabricante)        (definido pelo fabricante)
```

#### Quadro Ethernet II

| Campo | Tamanho | Função |
| --- | --- | --- |
| Preâmbulo + SFD | 8 bytes | Sincronização (tratado pelo hardware) |
| MAC de destino | 6 bytes | Para quem vai o quadro |
| MAC de origem | 6 bytes | Quem enviou |
| EtherType | 2 bytes | Protocolo carregado: 0x0800 = IPv4, 0x0806 = ARP, 0x86DD = IPv6 |
| Dados (payload) | 46 – 1500 bytes | Pacote da camada 3 |
| FCS | 4 bytes | CRC para detectar erros |

#### MAC × IP

| Característica | MAC | IP |
| --- | --- | --- |
| Camada | 2 — Enlace | 3 — Rede |
| Tamanho | 48 bits | 32 bits (IPv4) / 128 bits (IPv6) |
| Alcance | Enlace local | Fim a fim, entre redes |
| Atribuição | Gravado pelo fabricante (pode ser alterado) | Configurado manualmente ou via DHCP |
| Analogia | CPF da pessoa | Endereço da casa |

### Contexto real

Ao conectar o notebook no Wi-Fi da empresa, o access point registra o MAC do seu dispositivo. Sistemas operacionais modernos usam MACs aleatórios por rede para preservar privacidade.

### Exercício

Qual é o endereço MAC de broadcast?

<details><summary>Resposta</summary>

FF:FF:FF:FF:FF:FF — todos os 48 bits em 1. Um quadro com esse destino é entregue a todos os hosts do domínio de broadcast.

</details>

### Desafio

Descubra o MAC da sua placa de rede e procure o fabricante pelo OUI (primeiros 3 bytes) em um site de consulta de OUI.

## Aula 2 — Como o ARP funciona

**Palavras-chave:** ARP, request, reply, tabela ARP, cache, gratuitous ARP, spoofing

### Introdução

O ARP (Address Resolution Protocol, RFC 826) descobre qual MAC corresponde a um IP na rede local. Sem ele, o host saberia o IP de destino, mas não conseguiria montar o quadro Ethernet.

### Por que isso importa

Todo pacote IPv4 enviado em uma rede Ethernet ou Wi-Fi depende do ARP. Problemas de ARP causam falhas intermitentes, conflitos de IP e são porta de entrada para ataques man-in-the-middle.

### Explicação

O host pergunta em broadcast: "Quem tem 192.168.1.1? Responda para 192.168.1.10". Somente o dono do IP responde em unicast: "192.168.1.1 está em 00:1a:2b:3c:4d:5e". A resposta é guardada em cache por alguns minutos.

### Conteúdo

#### Processo ARP passo a passo

1. O host verifica se o destino está na mesma sub-rede (usando a máscara).
2. Se estiver, procura o IP do destino na tabela ARP; se não estiver, procura o IP do gateway.
3. Se não houver entrada, envia um ARP Request em broadcast.
4. O dono do IP responde com um ARP Reply em unicast contendo seu MAC.
5. O host grava a associação IP ↔ MAC no cache e envia o quadro.

#### Variações do ARP

- ARP gratuito (gratuitous ARP): o host anuncia o próprio IP/MAC sem ninguém perguntar — usado para detectar conflito de IP e atualizar caches após failover.
- Proxy ARP: o roteador responde ARP em nome de hosts de outra rede.
- RARP: protocolo antigo (MAC → IP), substituído por BOOTP e DHCP.
- No IPv6, o ARP é substituído pelo NDP (Neighbor Discovery Protocol), usando mensagens ICMPv6.

#### ARP spoofing (envenenamento de ARP)

Como o ARP não tem autenticação, um atacante pode enviar respostas ARP falsas dizendo "o gateway sou eu". As vítimas passam a mandar o tráfego para o atacante, que pode espionar ou alterar os dados (man-in-the-middle).

- Defesa: Dynamic ARP Inspection (DAI) nos switches, validando ARP contra a tabela do DHCP snooping.
- Entradas ARP estáticas para equipamentos críticos.
- Segmentação em VLANs e uso de criptografia fim a fim (HTTPS, SSH, VPN).

### Contexto real

Quando um computador da rede quer acessar a Internet, ele faz ARP do gateway (ex.: 192.168.1.1), guarda o MAC na tabela ARP e passa a enviar todos os quadros para fora da rede para esse MAC.

### Exercício

O ARP Request é enviado em broadcast ou unicast? E o ARP Reply?

<details><summary>Resposta</summary>

O Request é broadcast (destino FF:FF:FF:FF:FF:FF), pois o MAC ainda é desconhecido. O Reply é unicast, direto para quem perguntou.

</details>

### Desafio

Se o PC 192.168.1.10/24 quer falar com 8.8.8.8, de qual IP ele pede o MAC via ARP? Justifique.

## Comandos úteis

**Ver e limpar a tabela ARP** (Windows)

```
arp -a
arp -d *          # limpa o cache (requer administrador)
```

**Ver a tabela de vizinhos** (Linux/macOS)

```
ip neigh show     # Linux
arp -a            # macOS
```

**Tabela ARP e tabela MAC no equipamento** (Cisco IOS)

```
show ip arp
show mac address-table
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Achar que o MAC do servidor remoto aparece na sua tabela ARP. | Só aparecem MACs de hosts da mesma rede local, incluindo o gateway. |
| Conflito de IP causando quedas intermitentes. | Verifique o ARP: dois MACs respondendo pelo mesmo IP indicam conflito. |
| Trocar uma placa de rede e o tráfego não voltar imediatamente. | O cache ARP de outros hosts ainda tem o MAC antigo; aguarde a expiração ou limpe o cache. |

## Segurança

- ARP spoofing permite interceptar tráfego na LAN: habilite DHCP snooping + Dynamic ARP Inspection.
- Port security limita quantos MACs podem aprender em cada porta do switch.
- MAC filtering no Wi-Fi não é segurança real: MACs são facilmente falsificados.

## Pontos-chave

- MAC = 48 bits; OUI identifica o fabricante.
- ARP: Request em broadcast, Reply em unicast.
- Para destinos fora da sub-rede, o ARP é feito para o gateway.
- ARP não tem autenticação → vulnerável a spoofing.
- IPv6 usa NDP no lugar do ARP.

## Laboratório: Observando o ARP em ação

**Objetivo:** Ver um ARP Request e um ARP Reply reais.

**Ferramentas:** Wireshark e terminal.

1. Limpe o cache ARP (arp -d * no Windows ou ip neigh flush all no Linux, como administrador).
2. Inicie o Wireshark com o filtro "arp".
3. Faça ping no gateway.
4. Identifique o Request (broadcast) e o Reply (unicast); confira o MAC na tabela com arp -a.

**Resultado esperado:** Um ARP Request para FF:FF:FF:FF:FF:FF seguido de um Reply unicast do gateway.

## Quiz

Gabarito em [../quizzes/06-mac-e-arp.md](../quizzes/06-mac-e-arp.md).

## Leituras recomendadas

- RFC 826 — An Ethernet Address Resolution Protocol
- IEEE 802.3 — Ethernet
- RFC 4861 — Neighbor Discovery for IPv6
