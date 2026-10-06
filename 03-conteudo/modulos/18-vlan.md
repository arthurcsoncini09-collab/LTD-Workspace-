<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 18 — VLAN

**Nível:** Avançado · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/vlan`

> Redes locais virtuais: benefícios, portas access e trunk, 802.1Q, VLAN nativa e de gerência, inter-VLAN, VTP e VLAN hopping.

**Objetivo:** Segmentar uma LAN com VLANs, configurar portas access e trunk e permitir a comunicação entre VLANs de forma segura.

VLANs dividem um switch físico em várias redes lógicas isoladas. Cada VLAN é um domínio de broadcast próprio e, para conversar entre si, precisa de roteamento.

## Objetivos de aprendizagem

- Explicar benefícios e funcionamento das VLANs.
- Diferenciar portas access e trunk e descrever a tag 802.1Q.
- Configurar VLANs, portas e trunks em switches Cisco.
- Implementar roteamento entre VLANs.
- Mitigar VLAN hopping e boas práticas de VLAN nativa e gerência.

## Aula 1 — Conceitos de VLAN e 802.1Q

**Palavras-chave:** VLAN, access, trunk, 802.1Q, tag, VLAN nativa, VLAN de gerência

### Introdução

Uma VLAN (Virtual LAN) agrupa portas de um ou mais switches em uma rede lógica, independente da localização física. Dispositivos em VLANs diferentes não se comunicam diretamente na camada 2.

### Por que isso importa

VLANs trazem segurança (isolamento), desempenho (domínios de broadcast menores) e flexibilidade (mudar alguém de departamento é só trocar a VLAN da porta, sem mexer em cabos).

### Explicação

Uma porta access pertence a uma única VLAN e não marca os quadros. Uma porta trunk transporta várias VLANs entre switches (ou até um roteador) e, para saber de qual VLAN é cada quadro, insere uma etiqueta (tag) 802.1Q de 4 bytes com o ID da VLAN.

### Conteúdo

#### Benefícios

- Segurança: isolamento entre grupos; o tráfego entre VLANs passa por roteador/firewall, onde pode ser filtrado.
- Desempenho: broadcasts ficam restritos à VLAN.
- Organização: agrupamento por função, não por localização.
- Custo: menos switches físicos para separar redes.

#### Tag 802.1Q

```
| MAC dst | MAC src | TAG 802.1Q (4 B) | EtherType | Dados | FCS |
                      ├ TPID 0x8100 (16 bits)
                      ├ PCP prioridade (3 bits)
                      ├ DEI (1 bit)
                      └ VLAN ID (12 bits → 1 a 4094)
```

#### Faixas e VLANs especiais

| VLAN | Significado |
| --- | --- |
| 1 | VLAN padrão; todas as portas começam nela (evite usá-la para dados) |
| 2 – 1001 | Faixa normal |
| 1002 – 1005 | Reservadas (legado Token Ring/FDDI) |
| 1006 – 4094 | Faixa estendida |
| Nativa | VLAN cujos quadros trafegam sem tag no trunk (padrão: 1) |
| Gerência | VLAN com o IP de administração dos switches |
| Voz | VLAN para telefones IP, com prioridade (QoS) |

### Contexto real

Em uma empresa, os telefones IP ficam na VLAN de voz, os computadores na VLAN de dados, as câmeras na VLAN de CFTV e os visitantes na VLAN de convidados — tudo nos mesmos switches.

### Exercício

Qual a diferença entre uma porta access e uma porta trunk?

<details><summary>Resposta</summary>

A porta access pertence a uma única VLAN e é usada para dispositivos finais; os quadros não levam tag. A porta trunk transporta várias VLANs, marcando os quadros com tags 802.1Q, e é usada entre switches ou até roteadores.

</details>

### Desafio

Planeje VLANs para uma escola: administração, professores, laboratório de alunos, Wi-Fi de visitantes e câmeras. Defina IDs, nomes e sub-redes.

## Aula 2 — Configuração, inter-VLAN e segurança

**Palavras-chave:** switchport, trunk, allowed vlan, SVI, VTP, VLAN hopping, double tagging

### Introdução

Configurar VLANs envolve criá-las, atribuir as portas de acesso, configurar os trunks e prover roteamento entre elas.

### Por que isso importa

Erros de VLAN estão entre as causas mais comuns de "o PC está conectado, mas sem rede": porta na VLAN errada, VLAN não permitida no trunk, VLAN nativa diferente nos dois lados.

### Explicação

Fluxo típico: criar a VLAN no switch, colocar portas em modo access na VLAN, configurar o uplink como trunk permitindo as VLANs necessárias, e criar no roteador (ou switch L3) uma interface por VLAN, que será o gateway daquela sub-rede.

### Conteúdo

#### Configuração no switch

```
vlan 10
 name VENDAS
vlan 20
 name TI
vlan 99
 name GERENCIA
!
interface range g0/1 - 12
 switchport mode access
 switchport access vlan 10
interface range g0/13 - 22
 switchport mode access
 switchport access vlan 20
!
interface g0/24
 switchport mode trunk
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,99
 switchport nonegotiate
```

#### Inter-VLAN com switch L3 (SVIs)

Cada SVI é o gateway da sua VLAN. Em roteadores, usa-se router-on-a-stick (subinterfaces com encapsulation dot1Q), visto no módulo Router.

```
ip routing
interface vlan 10
 ip address 192.168.10.1 255.255.255.0
interface vlan 20
 ip address 192.168.20.1 255.255.255.0
```

#### VTP

O VTP (VLAN Trunking Protocol, da Cisco) propaga a criação de VLANs entre switches. É prático, mas perigoso: um switch com número de revisão maior pode apagar as VLANs de toda a rede. Muitos administradores preferem o modo transparent ou off.

#### Ataques e mitigação

| Ataque | Como funciona | Mitigação |
| --- | --- | --- |
| Switch spoofing | O atacante negocia um trunk via DTP e passa a ver todas as VLANs | switchport mode access nas portas de usuário; switchport nonegotiate |
| Double tagging | Quadro com duas tags explora a VLAN nativa para saltar de VLAN | VLAN nativa sem uso (ex.: 999) e diferente de qualquer VLAN de usuários |
| Portas esquecidas | Portas ativas na VLAN 1 dão acesso à rede | Desativar portas não usadas e colocá-las em VLAN isolada |

### Contexto real

Um técnico conecta um novo PC e ele não recebe IP. Ao verificar, a porta estava na VLAN 1 em vez da VLAN 10, onde está o relay DHCP.

### Exercício

Dois PCs estão em VLANs diferentes no mesmo switch. Eles conseguem se pingar sem roteador?

<details><summary>Resposta</summary>

Não. Cada VLAN é um domínio de broadcast e uma sub-rede diferente; é necessário roteamento (roteador ou switch L3) para comunicação entre elas.

</details>

### Desafio

Configure duas VLANs em dois switches ligados por trunk e faça os PCs de cada VLAN se comunicarem entre os switches.

## Comandos úteis

**Verificação** (Cisco IOS)

```
show vlan brief
show interfaces trunk
show interfaces g0/1 switchport
show vtp status
```

**Interface com tag VLAN no Linux** (Linux/macOS)

```
sudo ip link add link eth0 name eth0.10 type vlan id 10
sudo ip addr add 192.168.10.50/24 dev eth0.10
sudo ip link set eth0.10 up
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| VLAN existe no switch de acesso, mas não no trunk. | Confira show interfaces trunk → "VLANs allowed and active". |
| VLAN nativa diferente nos dois lados do trunk. | Configure a mesma VLAN nativa nas duas pontas (o CDP alerta "native VLAN mismatch"). |
| Porta atribuída a uma VLAN que não foi criada. | Crie a VLAN; caso contrário a porta fica inativa. |

## Segurança

- Não use a VLAN 1 para dados nem gerência.
- Separe VLAN de gerência e restrinja o acesso a ela com ACLs.
- Rede de visitantes em VLAN própria, com acesso apenas à Internet.
- Combine VLANs com 802.1X para atribuir VLAN de acordo com a identidade do usuário.

## Pontos-chave

- VLAN = domínio de broadcast = sub-rede.
- Access: uma VLAN, sem tag. Trunk: várias VLANs, com tag 802.1Q.
- VLAN ID: 12 bits (1–4094).
- Comunicação entre VLANs exige roteamento.
- VLAN nativa sem uso, portas de usuário em access, DTP desligado.

## Laboratório: Segmentação de uma empresa com VLANs

**Objetivo:** Criar VLANs em dois switches, interligá-los por trunk e rotear entre as VLANs.

**Ferramentas:** Cisco Packet Tracer.

1. Crie as VLANs 10 (Vendas), 20 (TI) e 99 (Gerência) em SW1 e SW2.
2. Distribua dois PCs por VLAN entre os switches.
3. Configure o trunk SW1–SW2 com VLAN nativa 999 e allowed 10,20,99.
4. Configure router-on-a-stick em R1 e o DHCP de cada VLAN.
5. Teste ping dentro da mesma VLAN, entre VLANs e verifique com show vlan brief.

**Resultado esperado:** Comunicação dentro da VLAN entre switches e entre VLANs via roteador.

## Quiz

Gabarito em [../quizzes/18-vlan.md](../quizzes/18-vlan.md).

## Leituras recomendadas

- IEEE 802.1Q — Bridges and Bridged Networks
- Cisco CCNA SRWE — VLANs e Inter-VLAN Routing
