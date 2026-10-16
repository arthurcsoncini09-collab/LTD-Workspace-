<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 14 — Switch

**Nível:** Avançado · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/switch`

> Comutação em camada 2: tabela MAC, flooding, domínios de colisão e broadcast, duplex, STP, port security e configuração básica.

**Objetivo:** Entender como o switch aprende e encaminha quadros, evitar loops com STP e aplicar configurações básicas e de segurança em switches gerenciáveis.

O switch é o coração da LAN: aprende onde está cada MAC, entrega quadros só na porta certa, separa domínios de colisão e, com STP, evita loops que derrubariam a rede.

## Objetivos de aprendizagem

- Explicar aprendizado, encaminhamento, flooding e filtragem.
- Contar domínios de colisão e de broadcast em uma topologia.
- Descrever o funcionamento do STP/RSTP e a eleição da root bridge.
- Configurar um switch Cisco com gerência, portas de acesso e port security.

## Aula 1 — Como o switch encaminha quadros

**Palavras-chave:** switch, tabela MAC, CAM, flooding, forwarding, filtering, domínio de colisão

### Introdução

O switch opera na camada 2 e toma decisões com base no endereço MAC de destino de cada quadro. Para isso, mantém uma tabela MAC (também chamada CAM) que associa MACs a portas.

### Por que isso importa

Entender o aprendizado e o flooding explica o comportamento da LAN, problemas de desempenho, loops e várias técnicas de ataque e defesa.

### Explicação

Quando um quadro chega, o switch (1) aprende: anota o MAC de origem e a porta de entrada; (2) procura o MAC de destino na tabela; (3) se encontrar, encaminha só para aquela porta (forwarding); se não encontrar, ou se for broadcast, envia para todas as portas exceto a de origem (flooding); se o destino estiver na mesma porta de origem, descarta (filtering).

### Conteúdo

#### Aprendizado, encaminhamento e flooding

As entradas dinâmicas expiram após um tempo sem tráfego (300 segundos por padrão em switches Cisco).

```
Tabela MAC (show mac address-table)
Vlan    Mac Address       Type      Ports
----    -----------       --------  -----
  10    000c.29aa.1111    DYNAMIC   Gi0/1
  10    000c.29bb.2222    DYNAMIC   Gi0/2
  10    000c.29cc.3333    DYNAMIC   Gi0/3
```

#### Domínios de colisão e de broadcast

| Equipamento | Domínios de colisão | Domínios de broadcast |
| --- | --- | --- |
| Hub de 8 portas | 1 | 1 |
| Switch de 8 portas (1 VLAN) | 8 (um por porta) | 1 |
| Switch com 3 VLANs | Um por porta | 3 (um por VLAN) |
| Roteador com 2 interfaces | Um por interface | 2 (um por interface) |

#### Modos de comutação e duplex

- Store-and-forward: recebe o quadro inteiro e confere o FCS antes de encaminhar (padrão; descarta quadros corrompidos).
- Cut-through: começa a encaminhar após ler o MAC de destino (menor latência, usado em data centers).
- Full duplex: envia e recebe ao mesmo tempo, sem colisões (padrão em switches).
- Incompatibilidade de duplex (um lado full, outro half) causa lentidão e erros: deixe ambos em auto ou fixe ambos igual.

#### Switch L2 × Switch L3

Um switch L2 encaminha por MAC dentro das VLANs. Um switch L3 (multilayer) também roteia entre VLANs em hardware, usando interfaces virtuais (SVIs). Em redes corporativas, o núcleo costuma ser L3.

### Contexto real

Em um escritório com 48 computadores ligados a um switch, cada PC pode transmitir a 1 Gbps simultaneamente com outro, sem colisões — algo impossível na época dos hubs.

### Exercício

O que o switch faz com um quadro cujo MAC de destino não está na tabela?

<details><summary>Resposta</summary>

Faz flooding: envia o quadro por todas as portas da VLAN, exceto a de entrada. Quando o destino responder, o switch aprenderá seu MAC.

</details>

### Desafio

Desenhe um switch com 4 PCs e mostre como a tabela MAC é preenchida após PC1 enviar para PC3 e PC3 responder.

## Aula 2 — STP, port security e configuração básica

**Palavras-chave:** STP, RSTP, root bridge, BPDU, loop, port security, PortFast, BPDU Guard

### Introdução

Links redundantes entre switches aumentam a disponibilidade, mas criam loops de camada 2. Como o quadro Ethernet não tem TTL, um loop multiplica broadcasts infinitamente. O Spanning Tree Protocol (STP) resolve isso.

### Por que isso importa

Uma tempestade de broadcast pode derrubar uma rede inteira em segundos. E portas de switch abertas são a porta de entrada física de um atacante.

### Explicação

O STP elege uma root bridge (menor Bridge ID: prioridade + MAC). Cada switch escolhe sua porta raiz (melhor caminho até a root). Em cada segmento, uma porta designada encaminha; as demais ficam bloqueadas, formando uma árvore sem loops. Se um link cair, uma porta bloqueada assume.

### Conteúdo

#### Estados e papéis de porta

O STP clássico leva 30 a 50 segundos para convergir; o RSTP converge em poucos segundos e é o recomendado hoje.

| STP (802.1D) | RSTP (802.1w) | Função |
| --- | --- | --- |
| Blocking | Discarding | Não encaminha; ouve BPDUs |
| Listening | Discarding | Participa da eleição |
| Learning | Learning | Aprende MACs, ainda não encaminha |
| Forwarding | Forwarding | Encaminha normalmente |

#### Configuração básica de um switch Cisco

```
enable
configure terminal
hostname SW1
enable secret SenhaForte!
service password-encryption
banner motd # Acesso restrito #
!
interface vlan 99
 ip address 192.168.99.2 255.255.255.0
 no shutdown
ip default-gateway 192.168.99.1
!
interface range g0/1 - 20
 switchport mode access
 spanning-tree portfast
 spanning-tree bpduguard enable
end
copy running-config startup-config
```

#### Port security

- protect: descarta quadros de MACs não permitidos, sem alertar.
- restrict: descarta e gera log/contador.
- shutdown (padrão): coloca a porta em err-disabled.

```
interface g0/5
 switchport mode access
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 switchport port-security violation restrict
```

### Contexto real

Alguém conecta as duas pontas de um mesmo cabo em duas tomadas da sala de reunião. Sem STP, a rede do andar cai; com STP (e BPDU Guard), a porta é bloqueada automaticamente.

### Exercício

Como é escolhida a root bridge no STP?

<details><summary>Resposta</summary>

Pelo menor Bridge ID, formado pela prioridade (padrão 32768) e, em caso de empate, pelo menor endereço MAC.

</details>

### Desafio

Em um triângulo de três switches com prioridades padrão, como garantir que o switch do núcleo seja a root bridge?

## Comandos úteis

**Verificação** (Cisco IOS)

```
show mac address-table
show interfaces status
show interfaces g0/1
show spanning-tree
show port-security interface g0/5
```

**Ajustar a root bridge** (Cisco IOS)

```
spanning-tree mode rapid-pvst
spanning-tree vlan 10 root primary
! ou
spanning-tree vlan 10 priority 4096
```

**Ver a velocidade e o duplex negociados no host** (Linux/macOS)

```
ethtool eth0            # Linux
ifconfig en0 | grep media   # macOS
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Desabilitar o STP "para ganhar desempenho". | Nunca desabilite o STP em redes com redundância; use RSTP. |
| Porta de usuário demorando 30 s para subir. | Habilite PortFast em portas de acesso (nunca em portas para outros switches). |
| Root bridge eleita em um switch antigo de acesso. | Defina manualmente a prioridade do switch de núcleo. |

## Segurança

- MAC flooding enche a tabela CAM e faz o switch agir como hub: use port security.
- Desative portas não usadas e coloque-as em uma VLAN isolada.
- Use SSH para gerência e uma VLAN de gerência separada.
- BPDU Guard e Root Guard evitam que um switch intruso assuma a topologia.

## Pontos-chave

- Switch aprende pelo MAC de origem e encaminha pelo MAC de destino.
- Destino desconhecido ou broadcast → flooding.
- Cada porta de switch é um domínio de colisão; cada VLAN é um domínio de broadcast.
- STP elimina loops; RSTP converge mais rápido.
- PortFast + BPDU Guard em portas de usuário.

## Laboratório: Switches redundantes com STP

**Objetivo:** Observar o STP bloqueando um loop e convergindo após uma falha.

**Ferramentas:** Cisco Packet Tracer.

1. Conecte três switches em triângulo e um PC em cada.
2. Execute show spanning-tree e identifique a root bridge e a porta bloqueada.
3. Ajuste a prioridade para que SW1 seja a root e verifique a nova topologia.
4. Desligue um link ativo e observe a porta bloqueada passar a encaminhar.
5. Configure port security em uma porta e teste conectando outro PC.

**Resultado esperado:** Rede sem loop, com convergência automática após a falha e violação de port security registrada.

## Quiz

Gabarito em [../quizzes/14-switch.md](../quizzes/14-switch.md).

## Leituras recomendadas

- IEEE 802.1D — MAC Bridges / STP
- IEEE 802.1w — Rapid STP
- Cisco CCNA SRWE — Switching, Routing and Wireless Essentials
