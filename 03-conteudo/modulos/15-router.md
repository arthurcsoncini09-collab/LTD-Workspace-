<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 15 — Router

**Nível:** Avançado · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/router`

> Roteamento em camada 3: tabela de rotas, longest prefix match, distância administrativa, rotas estáticas, protocolos dinâmicos e inter-VLAN.

**Objetivo:** Entender como o roteador decide o caminho de cada pacote, configurar rotas estáticas e reconhecer os principais protocolos de roteamento dinâmico.

O roteador interliga redes diferentes. Para cada pacote, ele consulta a tabela de rotas, escolhe a rota mais específica e encaminha ao próximo salto.

## Objetivos de aprendizagem

- Interpretar a tabela de roteamento.
- Aplicar longest prefix match, distância administrativa e métrica.
- Configurar rotas estáticas, padrão e flutuantes.
- Comparar RIP, OSPF, EIGRP e BGP.
- Configurar roteamento entre VLANs.

## Aula 1 — Tabela de roteamento e decisão de encaminhamento

**Palavras-chave:** roteador, tabela de rotas, next hop, longest prefix match, distância administrativa, métrica, gateway

### Introdução

O roteador opera na camada 3. Ao receber um pacote, ele lê o IP de destino, procura a melhor correspondência na tabela de roteamento e encaminha o pacote pela interface correspondente, rumo ao próximo salto (next hop).

### Por que isso importa

Toda comunicação entre redes — da sua casa para a Internet, entre filiais, entre VLANs — depende de roteamento correto. Uma rota faltando ou errada isola redes inteiras.

### Explicação

A tabela tem três origens de rotas: redes diretamente conectadas (as interfaces), rotas estáticas (configuradas manualmente) e rotas dinâmicas (aprendidas via protocolos como OSPF). Quando várias rotas servem para o destino, vence a mais específica (maior prefixo).

### Conteúdo

#### Lendo a tabela de rotas

Entre colchetes: [distância administrativa / métrica].

```
R1# show ip route
Codes: C - connected, L - local, S - static, O - OSPF, * - candidate default

Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.1
C     192.168.10.0/24 is directly connected, GigabitEthernet0/0
L     192.168.10.1/32 is directly connected, GigabitEthernet0/0
O     10.2.0.0/16 [110/20] via 10.0.0.2, 00:12:44, GigabitEthernet0/1
S     172.16.0.0/16 [1/0] via 10.0.0.6
```

#### Ordem de decisão

1. Longest prefix match: a rota com o maior prefixo que contém o destino vence.
2. Para o mesmo prefixo vindo de fontes diferentes, vence a menor distância administrativa (AD).
3. Para o mesmo prefixo e a mesma fonte, vence a menor métrica.
4. Empate na métrica: balanceamento de carga entre os caminhos (ECMP).

#### Distância administrativa (Cisco)

| Origem da rota | AD |
| --- | --- |
| Diretamente conectada | 0 |
| Estática | 1 |
| eBGP | 20 |
| EIGRP (interno) | 90 |
| OSPF | 110 |
| IS-IS | 115 |
| RIP | 120 |
| iBGP | 200 |

### Contexto real

O roteador de casa tem uma tabela simples: a rede local diretamente conectada e uma rota padrão (0.0.0.0/0) apontando para o provedor. Roteadores da Internet têm mais de 900 mil rotas IPv4.

### Exercício

O roteador tem rotas para 10.0.0.0/8 e 10.1.1.0/24. Por qual rota um pacote para 10.1.1.50 será enviado?

<details><summary>Resposta</summary>

Pela rota 10.1.1.0/24, por ser mais específica (longest prefix match: /24 é mais longo que /8).

</details>

### Desafio

Interprete cada linha de uma saída de "show ip route" e identifique a rota padrão, as conectadas e as estáticas.

## Aula 2 — Roteamento estático, dinâmico e inter-VLAN

**Palavras-chave:** rota estática, rota padrão, RIP, OSPF, EIGRP, BGP, router-on-a-stick, SVI

### Introdução

Rotas podem ser configuradas à mão (estáticas) ou aprendidas automaticamente por protocolos de roteamento dinâmico, que trocam informações entre roteadores e se adaptam a falhas.

### Por que isso importa

Redes pequenas funcionam bem com rotas estáticas; redes médias e grandes precisam de protocolos dinâmicos para escalar e se recuperar sozinhas. E VLANs só conversam entre si com roteamento.

### Explicação

Protocolos de vetor de distância (RIP) trocam tabelas com vizinhos e usam contagem de saltos. Protocolos de estado de enlace (OSPF, IS-IS) montam um mapa completo da topologia e calculam o menor caminho com o algoritmo de Dijkstra. O BGP é o protocolo que interliga os sistemas autônomos da Internet.

### Conteúdo

#### Rotas estáticas

```
! rede remota via próximo salto
ip route 172.16.0.0 255.255.0.0 10.0.0.6
! rota padrão (gateway of last resort)
ip route 0.0.0.0 0.0.0.0 203.0.113.1
! rota flutuante de backup (AD 10, só entra se a principal cair)
ip route 0.0.0.0 0.0.0.0 198.51.100.1 10
```

#### Protocolos dinâmicos

| Protocolo | Tipo | Métrica | Uso típico |
| --- | --- | --- | --- |
| RIP v2 | Vetor de distância | Saltos (máx. 15) | Laboratórios, redes muito pequenas |
| OSPF | Estado de enlace | Custo (baseado na banda) | Redes corporativas (padrão aberto) |
| EIGRP | Vetor de distância avançado | Banda e atraso | Redes Cisco |
| IS-IS | Estado de enlace | Custo | Provedores |
| BGP | Vetor de caminho | Atributos (AS-PATH, etc.) | Internet, entre sistemas autônomos |

#### OSPF básico

A máscara do comando network é uma wildcard (inverso da máscara). passive-interface evita enviar mensagens OSPF para a LAN de usuários.

```
router ospf 1
 router-id 1.1.1.1
 network 192.168.10.0 0.0.0.255 area 0
 network 10.0.0.0 0.0.0.3 area 0
 passive-interface g0/0
```

#### Roteamento entre VLANs (router-on-a-stick)

Uma única interface física, ligada a uma porta trunk do switch, com uma subinterface por VLAN. Em redes maiores, usa-se um switch L3 com SVIs.

```
interface g0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface g0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
interface g0/0
 no shutdown
```

### Contexto real

Uma empresa com matriz e 20 filiais usa OSPF internamente; na borda, troca rotas com dois provedores usando BGP para ter redundância de Internet.

### Exercício

Escreva o comando Cisco de uma rota padrão apontando para 203.0.113.1.

<details><summary>Resposta</summary>

ip route 0.0.0.0 0.0.0.0 203.0.113.1

</details>

### Desafio

Configure dois roteadores com redes LAN diferentes e faça os PCs se comunicarem usando apenas rotas estáticas.

## Comandos úteis

**Verificação no roteador** (Cisco IOS)

```
show ip route
show ip interface brief
show ip protocols
show ip ospf neighbor
```

**Tabela de rotas do computador** (Windows)

```
route print
route add 10.50.0.0 mask 255.255.0.0 192.168.1.254
```

**Tabela de rotas do computador** (Linux/macOS)

```
ip route                           # Linux
sudo ip route add 10.50.0.0/16 via 192.168.1.254
netstat -rn                        # macOS
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Rota de ida configurada, mas sem rota de volta. | A comunicação é bidirecional: o roteador remoto também precisa saber voltar. |
| Interface com IP configurado, mas sem tráfego. | Interfaces de roteador Cisco vêm em shutdown; use no shutdown. |
| Confundir máscara com wildcard no OSPF. | Wildcard = 255.255.255.255 − máscara (ex.: /24 → 0.0.0.255). |

## Segurança

- Autentique protocolos de roteamento (ex.: OSPF com autenticação SHA) para evitar injeção de rotas.
- Use passive-interface nas interfaces de usuários.
- Filtre na borda rotas e prefixos inválidos (bogons) e implemente RPKI no BGP.
- Restrinja a gerência do roteador a uma rede de administração e use SSH.

## Pontos-chave

- Roteador = camada 3; separa domínios de broadcast.
- Decisão: maior prefixo → menor AD → menor métrica.
- Rota padrão 0.0.0.0/0 = gateway of last resort.
- OSPF é o IGP aberto mais usado; BGP move a Internet.
- Inter-VLAN: router-on-a-stick ou switch L3.

## Laboratório: Roteamento estático e OSPF

**Objetivo:** Conectar três redes com rotas estáticas e depois migrar para OSPF.

**Ferramentas:** Cisco Packet Tracer.

1. Monte R1–R2–R3 em linha, com uma LAN em cada roteador e links /30 entre eles.
2. Configure rotas estáticas até todos os PCs se pingarem.
3. Remova as estáticas e configure OSPF área 0 em todos os roteadores.
4. Derrube um link (adicione um link R1–R3 antes) e observe a reconvergência com show ip route.

**Resultado esperado:** Conectividade total com estáticas e com OSPF, com troca automática de caminho na falha.

## Quiz

Gabarito em [../quizzes/15-router.md](../quizzes/15-router.md).

## Leituras recomendadas

- RFC 2328 — OSPF Version 2
- RFC 4271 — BGP-4
- RFC 2453 — RIP Version 2
- Cisco CCNA ENSA — Enterprise Networking, Security and Automation
