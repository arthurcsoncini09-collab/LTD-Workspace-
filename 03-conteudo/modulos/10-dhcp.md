<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 10 — DHCP

**Nível:** Intermediário · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/dhcp`

> Configuração automática de IP: processo DORA, lease e renovação, escopos, reservas, opções, DHCP relay e DHCP snooping.

**Objetivo:** Entender como o DHCP entrega configurações de rede automaticamente, configurar um servidor DHCP e protegê-lo contra servidores falsos.

O DHCP distribui IP, máscara, gateway e DNS aos clientes por meio da troca DORA. Os endereços são "emprestados" por um tempo (lease) e renovados periodicamente.

## Objetivos de aprendizagem

- Descrever as quatro mensagens do processo DORA.
- Explicar lease, T1, T2 e renovação.
- Configurar escopo, exclusões, reservas e opções.
- Configurar DHCP relay e proteger a rede com DHCP snooping.

## Aula 1 — O processo DORA

**Palavras-chave:** DHCP, DORA, Discover, Offer, Request, ACK, broadcast

### Introdução

O DHCP (Dynamic Host Configuration Protocol) configura automaticamente os dispositivos que entram na rede. A negociação tem quatro mensagens: Discover, Offer, Request e Acknowledge — o DORA.

### Por que isso importa

Configurar IP manualmente em centenas de dispositivos é inviável e sujeito a erros. O DHCP centraliza o controle, evita conflitos e facilita mudanças (como trocar o DNS de toda a rede).

### Explicação

O cliente ainda não tem IP, então grita em broadcast: "Há algum servidor DHCP?". O servidor oferece um endereço. O cliente pede formalmente aquele endereço (também em broadcast, para avisar outros servidores que recusou suas ofertas). O servidor confirma.

### Conteúdo

#### DORA passo a passo

| Mensagem | Direção | Origem → Destino (IP) | Conteúdo |
| --- | --- | --- | --- |
| DISCOVER | Cliente → todos | 0.0.0.0 → 255.255.255.255 | "Preciso de um IP" + MAC do cliente |
| OFFER | Servidor → cliente | IP do servidor → IP oferecido ou broadcast | IP proposto, máscara, gateway, DNS, lease |
| REQUEST | Cliente → todos | 0.0.0.0 → 255.255.255.255 | "Aceito a oferta do servidor X" |
| ACK | Servidor → cliente | IP do servidor → cliente | Confirmação final; o cliente pode usar o IP |

#### Portas e outras mensagens

- Servidor escuta em UDP 67; cliente em UDP 68.
- NAK: o servidor recusa o pedido (ex.: o cliente mudou de rede).
- DECLINE: o cliente detecta que o IP já está em uso (via ARP) e recusa.
- RELEASE: o cliente devolve o IP (ipconfig /release).
- INFORM: o cliente já tem IP e pede apenas outras opções.

#### Opções DHCP mais comuns

| Opção | Significado |
| --- | --- |
| 1 | Máscara de sub-rede |
| 3 | Gateway padrão (router) |
| 6 | Servidores DNS |
| 15 | Nome de domínio |
| 42 | Servidores NTP |
| 51 | Tempo de lease |
| 66 / 67 | Servidor TFTP e arquivo de boot (PXE, telefones IP) |

### Contexto real

Ao entrar no Wi-Fi de um café, seu celular recebe em segundos IP, máscara, gateway e DNS do roteador do estabelecimento — tudo via DHCP.

### Exercício

Por que o DHCP Discover é enviado em broadcast?

<details><summary>Resposta</summary>

Porque o cliente ainda não tem IP nem conhece o endereço do servidor DHCP. Ele usa origem 0.0.0.0 e destino 255.255.255.255.

</details>

### Desafio

Explique por que o DHCP Request também é enviado em broadcast, mesmo depois de o cliente já conhecer o servidor.

## Aula 2 — Lease, escopos, reservas e relay

**Palavras-chave:** lease, T1, T2, escopo, pool, reserva, relay, ip helper-address

### Introdução

O IP fornecido pelo DHCP é um empréstimo com prazo: o lease. O administrador define o escopo (faixa de IPs), exclusões, reservas e as opções entregues aos clientes.

### Por que isso importa

Um lease longo demais em uma rede com muitos visitantes esgota o pool; um curto demais gera tráfego excessivo. E sem relay, um único servidor não atende várias VLANs.

### Explicação

O cliente tenta renovar na metade do lease (T1, 50%) diretamente com o servidor. Se não conseguir, tenta com qualquer servidor aos 87,5% (T2). Se o lease expirar, ele perde o IP e recomeça o DORA.

### Conteúdo

#### Conceitos de configuração

- Escopo/pool: faixa de endereços que o servidor pode distribuir.
- Exclusões: endereços dentro da faixa que não devem ser distribuídos (servidores, impressoras, gateway).
- Reserva: um IP fixo entregue sempre ao mesmo MAC — combina controle central com IP previsível.
- Lease: tempo de validade. Redes de visitantes usam leases curtos (1–2 h); redes corporativas, mais longos (8 h a 8 dias).

#### DHCP relay

Broadcasts não atravessam roteadores. Para que clientes de outra rede alcancem o servidor DHCP, a interface do roteador voltada aos clientes é configurada como relay: ela recebe o broadcast e o encaminha em unicast para o servidor, informando de qual rede veio o pedido (campo giaddr).

```
interface g0/1
 ip address 192.168.30.1 255.255.255.0
 ip helper-address 10.0.0.10
```

#### Servidor DHCP em um roteador Cisco

```
ip dhcp excluded-address 192.168.20.1 192.168.20.20
!
ip dhcp pool LAN20
 network 192.168.20.0 255.255.255.0
 default-router 192.168.20.1
 dns-server 1.1.1.1 8.8.8.8
 domain-name empresa.local
 lease 0 8
!
show ip dhcp binding
```

### Contexto real

Uma empresa usa um servidor DHCP central para todas as filiais e VLANs; os roteadores de cada rede encaminham as requisições com o comando ip helper-address.

### Exercício

Com lease de 8 horas, quando o cliente tenta renovar pela primeira vez?

<details><summary>Resposta</summary>

Após 4 horas (T1 = 50% do lease). Se falhar, tenta novamente em T2 = 7 horas (87,5%).

</details>

### Desafio

Planeje um escopo DHCP para 192.168.20.0/24 reservando .1 a .20 para equipamentos fixos e criando uma reserva para a impressora.

## Comandos úteis

**Renovar o IP** (Windows)

```
ipconfig /release
ipconfig /renew
ipconfig /all        # ver servidor DHCP e lease
```

**Renovar o IP** (Linux/macOS)

```
sudo dhclient -r && sudo dhclient     # Debian/Ubuntu (dhclient)
nmcli connection up "Nome da conexão"  # NetworkManager
```

**Verificar e proteger** (Cisco IOS)

```
show ip dhcp binding
show ip dhcp pool
!
ip dhcp snooping
ip dhcp snooping vlan 10
interface g0/24
 ip dhcp snooping trust
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Esquecer de excluir o IP do gateway do pool. | Use ip dhcp excluded-address para gateway, servidores e impressoras. |
| Clientes de outra VLAN sem IP. | Configure ip helper-address na interface/subinterface daquela VLAN. |
| Pool esgotado em rede de visitantes. | Reduza o lease e/ou aumente a sub-rede. |

## Segurança

- Rogue DHCP: um servidor falso pode entregar gateway/DNS maliciosos. Use DHCP snooping.
- DHCP starvation: o atacante esgota o pool com MACs falsos. Use port security e limite de taxa de DHCP.
- A base do DHCP snooping também alimenta o Dynamic ARP Inspection e o IP Source Guard.

## Pontos-chave

- DORA: Discover, Offer, Request, Acknowledge.
- UDP 67 (servidor) e 68 (cliente).
- Renovação em 50% (T1) e 87,5% (T2) do lease.
- Relay (ip helper-address) leva o DHCP a outras redes.
- IP 169.254.x.x no cliente = DHCP falhou.

## Laboratório: Servidor DHCP no Packet Tracer

**Objetivo:** Configurar um roteador como servidor DHCP para duas redes, uma delas via relay.

**Ferramentas:** Cisco Packet Tracer.

1. Monte R1 com duas interfaces: 192.168.10.1/24 e 192.168.20.1/24, cada uma com um switch e dois PCs.
2. Crie os pools LAN10 e LAN20 com exclusões dos 10 primeiros IPs.
3. Configure os PCs em DHCP e verifique os IPs recebidos.
4. Mova o serviço para um servidor em uma terceira rede e configure ip helper-address.

**Resultado esperado:** Todos os PCs recebem IP da faixa correta e show ip dhcp binding lista os leases.

## Quiz

Gabarito em [../quizzes/10-dhcp.md](../quizzes/10-dhcp.md).

## Leituras recomendadas

- RFC 2131 — Dynamic Host Configuration Protocol
- RFC 2132 — DHCP Options and BOOTP Vendor Extensions
- RFC 8415 — DHCPv6
