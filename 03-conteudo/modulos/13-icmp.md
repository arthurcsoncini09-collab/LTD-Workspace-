<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 13 — ICMP

**Nível:** Intermediário · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/icmp`

> Mensagens de controle e erro: tipos e códigos, ping, traceroute, MTU e Path MTU Discovery, ICMPv6 e riscos.

**Objetivo:** Entender as mensagens ICMP e usar ping e traceroute para diagnosticar conectividade, latência e o caminho dos pacotes.

O ICMP é o "sistema de mensagens" da camada de rede: informa erros (destino inalcançável, TTL expirado) e permite testes como o ping.

## Objetivos de aprendizagem

- Descrever a função do ICMP e seus principais tipos.
- Interpretar a saída do ping: RTT, TTL e perda.
- Explicar e usar o traceroute.
- Entender MTU, fragmentação e Path MTU Discovery.
- Filtrar ICMP com critério, sem quebrar a rede.

## Aula 1 — Mensagens ICMP e o ping

**Palavras-chave:** ICMP, ping, echo request, echo reply, tipo, código, RTT

### Introdução

O ICMP (Internet Control Message Protocol, RFC 792) é usado por hosts e roteadores para relatar erros e trocar informações de controle. Ele é transportado dentro do IP (protocolo número 1), mas é considerado parte da camada de rede.

### Por que isso importa

Ping e traceroute — as ferramentas de diagnóstico mais usadas do mundo — são baseadas em ICMP. E bloquear todo o ICMP sem critério quebra funções importantes da rede.

### Explicação

O ICMP não tem portas. Cada mensagem tem um Tipo e um Código. Por exemplo, Tipo 3 (Destination Unreachable) com Código 3 significa "porta inalcançável"; com Código 1, "host inalcançável".

### Conteúdo

#### Tipos ICMP mais importantes

| Tipo | Nome | Uso |
| --- | --- | --- |
| 0 | Echo Reply | Resposta do ping |
| 3 | Destination Unreachable | Rede, host, porta inalcançável; fragmentação necessária (código 4) |
| 5 | Redirect | Roteador indica um caminho melhor |
| 8 | Echo Request | Pedido do ping |
| 11 | Time Exceeded | TTL chegou a zero (base do traceroute) |
| 12 | Parameter Problem | Cabeçalho IP inválido |

#### Lendo a saída do ping

- tempo: RTT, a latência de ida e volta.
- TTL: valor restante na resposta; servidores Linux costumam iniciar com 64 e Windows com 128.
- Perda: pacotes sem resposta — pode ser congestionamento, Wi-Fi ruim ou bloqueio.

```
Disparando 8.8.8.8 com 32 bytes de dados:
Resposta de 8.8.8.8: bytes=32 tempo=14ms TTL=118
Resposta de 8.8.8.8: bytes=32 tempo=13ms TTL=118

Pacotes: Enviados = 4, Recebidos = 4, Perdidos = 0 (0% de perda)
```

#### Mensagens de erro comuns

| Mensagem | Provável causa |
| --- | --- |
| Esgotado o tempo limite do pedido / Request timed out | Host desligado, firewall bloqueando ICMP ou perda no caminho |
| Host de destino inacessível | O gateway não consegue entregar (ARP sem resposta na rede de destino) |
| Rede de destino inacessível | Não há rota para a rede |
| Falha geral / Transmit failed | Problema local: placa, IP ou rota |

### Contexto real

Quando você faz ping 8.8.8.8, seu computador envia ICMP Echo Request e o servidor responde com Echo Reply. O tempo de ida e volta (RTT) e o TTL da resposta aparecem na tela.

### Exercício

Quais tipos de mensagem ICMP o ping utiliza?

<details><summary>Resposta</summary>

Tipo 8 (Echo Request), enviado pela origem, e Tipo 0 (Echo Reply), devolvido pelo destino.

</details>

### Desafio

Execute ping para três destinos (gateway, um site nacional e um internacional) e compare RTT e TTL. O que o TTL indica sobre a distância?

## Aula 2 — Traceroute, MTU e ICMPv6

**Palavras-chave:** traceroute, tracert, TTL, Time Exceeded, MTU, PMTUD, ICMPv6

### Introdução

O traceroute descobre o caminho até um destino explorando o campo TTL. Já o Path MTU Discovery usa ICMP para descobrir o maior pacote que passa pelo caminho sem fragmentação.

### Por que isso importa

O traceroute mostra onde a latência aumenta ou onde os pacotes param. Problemas de MTU causam sintomas estranhos, como sites que abrem pela metade ou VPNs que travam.

### Explicação

O traceroute envia pacotes com TTL=1, depois TTL=2, e assim por diante. Cada roteador que zera o TTL devolve um ICMP Time Exceeded, revelando seu IP. Quando o destino responde, o caminho está completo.

### Conteúdo

#### Como o traceroute funciona

O tracert do Windows usa ICMP Echo; o traceroute do Linux usa UDP por padrão (opção -I para ICMP, -T para TCP).

1. Envia um pacote com TTL=1: o 1º roteador descarta e responde Time Exceeded.
2. Envia com TTL=2: o 2º roteador responde.
3. Repete aumentando o TTL, normalmente 3 sondas por salto.
4. Quando o destino é alcançado, ele responde (Echo Reply no Windows; Port Unreachable no traceroute UDP do Linux).

#### MTU e Path MTU Discovery

O MTU da Ethernet é 1500 bytes. Túneis (VPN, PPPoE) reduzem esse valor. Com o PMTUD, o host envia pacotes com o bit DF (Don't Fragment); se algum roteador não puder passar o pacote, responde ICMP Tipo 3 Código 4 ("fragmentação necessária") com o MTU suportado.

```
ping -f -l 1472 8.8.8.8      # Windows: 1472 + 28 de cabeçalhos = 1500
ping -M do -s 1472 8.8.8.8   # Linux
```

#### ICMPv6

- No IPv6, o ICMPv6 é essencial: além de ping e erros, implementa o Neighbor Discovery (substituto do ARP) e o anúncio de roteadores (SLAAC).
- Bloquear todo o ICMPv6 quebra o IPv6. Siga as recomendações do RFC 4890 para filtrar com critério.

### Contexto real

Um usuário reclama que um sistema está lento. O traceroute mostra latência baixa até o provedor e um salto de 180 ms em um enlace internacional — o problema está fora da rede da empresa.

### Exercício

Por que alguns saltos do traceroute aparecem como "* * *"?

<details><summary>Resposta</summary>

Porque aquele roteador não respondeu: pode estar configurado para não enviar ICMP Time Exceeded, limitar a taxa dessas mensagens ou um firewall pode estar bloqueando. Não significa necessariamente que o caminho está quebrado.

</details>

### Desafio

Faça um traceroute para um site em outro continente e identifique em qual salto o tráfego sai do Brasil (observe o aumento da latência e os nomes reversos).

## Comandos úteis

**Ping e traceroute** (Windows)

```
ping -n 10 8.8.8.8
ping -t 192.168.1.1      # contínuo (Ctrl+C para parar)
tracert example.com
pathping example.com     # traceroute + estatísticas de perda
```

**Ping e traceroute** (Linux/macOS)

```
ping -c 10 8.8.8.8
traceroute example.com
traceroute -I example.com   # usa ICMP
mtr example.com             # traceroute contínuo
```

**Ping estendido no equipamento** (Cisco IOS)

```
ping 8.8.8.8 repeat 100 size 1400
traceroute 8.8.8.8
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Concluir que um host está desligado porque não responde ao ping. | Muitos hosts (ex.: Windows com firewall ativo) bloqueiam ICMP; teste também uma porta TCP. |
| Achar que "* * *" no meio do traceroute significa falha. | Se os saltos seguintes respondem, aquele roteador apenas não envia ICMP. |
| Bloquear todo ICMP no firewall. | Permita ao menos tipo 3 (inclusive código 4) e tipo 11; limite a taxa do echo. |

## Segurança

- Ping flood e smurf attack (ICMP para broadcast com IP falsificado) são ataques clássicos: limite a taxa e desabilite directed broadcast.
- O ICMP pode ser usado para reconhecimento (descobrir hosts ativos); avalie bloquear echo vindo da Internet.
- ICMP Redirect pode ser abusado para desviar tráfego; desabilite em hosts e roteadores quando não for necessário.

## Pontos-chave

- ICMP = mensagens de erro e controle da camada 3 (protocolo IP nº 1).
- Ping: Echo Request (8) / Echo Reply (0).
- Traceroute: TTL crescente + Time Exceeded (11).
- MTU Ethernet = 1500; PMTUD depende do ICMP tipo 3 código 4.
- ICMPv6 é indispensável para o IPv6 funcionar.

## Laboratório: Diagnóstico com ping, traceroute e MTU

**Objetivo:** Medir latência, mapear o caminho e descobrir o MTU efetivo.

**Ferramentas:** Terminal (ping, tracert/traceroute) e opcionalmente mtr.

1. Faça ping no gateway, no DNS do provedor e em 8.8.8.8; anote RTT e TTL.
2. Execute tracert/traceroute até um site internacional e identifique o salto de maior aumento de latência.
3. Descubra o maior tamanho de ping sem fragmentação (comece em 1472 e diminua).
4. Calcule o MTU: tamanho encontrado + 28 bytes.

**Resultado esperado:** MTU de 1500 em conexões diretas, ou menor (ex.: 1492) em conexões PPPoE.

## Quiz

Gabarito em [../quizzes/13-icmp.md](../quizzes/13-icmp.md).

## Leituras recomendadas

- RFC 792 — Internet Control Message Protocol
- RFC 1191 — Path MTU Discovery
- RFC 4443 — ICMPv6
- RFC 4890 — Recommendations for Filtering ICMPv6
