<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 5 — Subnetting

**Nível:** Intermediário · **Aulas:** 2 · **Questões:** 7 · **No site:** `/aulas/subnetting`

> Dividir redes em sub-redes: número mágico, cálculo de rede/broadcast/hosts, VLSM, sumarização e exercícios resolvidos.

**Objetivo:** Calcular sub-redes com rapidez e precisão, projetar um plano de endereçamento com VLSM e sumarizar rotas.

Subnetting é dividir uma rede maior em redes menores emprestando bits de host. Com o método do número mágico, é possível calcular rede, broadcast e faixa de hosts de cabeça.

## Objetivos de aprendizagem

- Calcular rede, broadcast, faixa de hosts e quantidade de hosts para qualquer prefixo.
- Usar o método do número mágico sem converter tudo para binário.
- Projetar um plano de endereçamento com VLSM.
- Sumarizar redes contíguas em uma única rota.

## Aula 1 — Subnetting prático: o método do número mágico

**Palavras-chave:** subnetting, número mágico, bloco, broadcast, hosts, 2^n − 2

### Introdução

Ao "emprestar" bits da parte de host para a parte de rede, criamos mais sub-redes, cada uma com menos hosts. A pergunta-chave é sempre: quantos bits de host sobram?

### Por que isso importa

Sub-redes reduzem o domínio de broadcast, isolam departamentos, facilitam a aplicação de regras de segurança e evitam desperdício de endereços.

### Explicação

Número mágico (tamanho do bloco) = 256 − valor da máscara no octeto "interessante" (o último octeto que não é 255 nem 0). Os endereços de rede são múltiplos desse número. O broadcast é o próximo endereço de rede menos 1.

### Conteúdo

#### Fórmulas essenciais

- Hosts por sub-rede = 2^(bits de host) − 2 (rede e broadcast não são usáveis).
- Número de sub-redes = 2^(bits emprestados).
- Número mágico = 256 − valor da máscara no octeto interessante.
- Exceções: /31 (2 endereços, usado em links ponto a ponto, RFC 3021) e /32 (um único host, ex.: loopback de roteador).

#### Passo a passo: 192.168.1.77/27

1. /27 → máscara 255.255.255.224. Octeto interessante: o 4º.
2. Número mágico: 256 − 224 = 32. Redes: .0, .32, .64, .96, .128…
3. 77 está entre 64 e 95 → rede 192.168.1.64.
4. Broadcast: próxima rede (96) − 1 = 192.168.1.95.
5. Hosts: 192.168.1.65 a 192.168.1.94 (30 hosts).

#### Tabela de referência (último octeto)

| CIDR | Máscara | Bloco | Sub-redes em uma /24 | Hosts |
| --- | --- | --- | --- | --- |
| /24 | 255.255.255.0 | 256 | 1 | 254 |
| /25 | 255.255.255.128 | 128 | 2 | 126 |
| /26 | 255.255.255.192 | 64 | 4 | 62 |
| /27 | 255.255.255.224 | 32 | 8 | 30 |
| /28 | 255.255.255.240 | 16 | 16 | 14 |
| /29 | 255.255.255.248 | 8 | 32 | 6 |
| /30 | 255.255.255.252 | 4 | 64 | 2 |
| /31 | 255.255.255.254 | 2 | 128 | 2 (ponto a ponto) |
| /32 | 255.255.255.255 | 1 | 256 | 1 (host único) |

#### Quando o octeto interessante não é o último

Em 172.16.50.10/20, a máscara é 255.255.240.0. O octeto interessante é o 3º; número mágico = 256 − 240 = 16. Redes no 3º octeto: 0, 16, 32, 48, 64… O 50 cai no bloco 48.

**Exemplo:** Rede 172.16.48.0 · Broadcast 172.16.63.255 · Hosts 172.16.48.1 a 172.16.63.254 (4.094 hosts).

### Contexto real

Uma empresa com a rede 192.168.10.0/24 pode separar Vendas, TI e RH em sub-redes diferentes, cada uma com seu gateway, e aplicar regras de firewall entre elas.

### Exercício

Em uma rede /27, quantos hosts utilizáveis existem por sub-rede?

<details><summary>Resposta</summary>

32 − 27 = 5 bits de host → 2^5 − 2 = 30 hosts utilizáveis.

</details>

### Desafio

Calcule rede, broadcast, primeiro e último host de 192.168.1.77/27 sem calculadora.

## Aula 2 — Dimensionamento, VLSM e sumarização

**Palavras-chave:** VLSM, sumarização, supernetting, plano de endereçamento, desperdício

### Introdução

Nem todo departamento precisa do mesmo tamanho de rede. VLSM (Variable Length Subnet Mask) permite usar máscaras diferentes para cada sub-rede, conforme a necessidade.

### Por que isso importa

Com VLSM, um link entre dois roteadores usa uma /30 (2 hosts) em vez de desperdiçar uma /24 inteira (254 hosts). A sumarização reduz o tamanho das tabelas de roteamento.

### Explicação

Regra de ouro do VLSM: ordene as redes da maior para a menor e aloque nessa ordem, sempre começando em um múltiplo do tamanho do bloco. Para escolher o prefixo, encontre a menor potência de 2 que comporte hosts + 2.

### Conteúdo

#### Exemplo completo de VLSM — 192.168.10.0/24

Sobra a faixa 192.168.10.232 a .255 para crescimento futuro.

| Rede | Hosts necessários | Prefixo | Endereço de rede | Faixa de hosts | Broadcast |
| --- | --- | --- | --- | --- | --- |
| Vendas | 100 | /25 | 192.168.10.0 | .1 – .126 | .127 |
| TI | 50 | /26 | 192.168.10.128 | .129 – .190 | .191 |
| RH | 20 | /27 | 192.168.10.192 | .193 – .222 | .223 |
| Link R1–R2 | 2 | /30 | 192.168.10.224 | .225 – .226 | .227 |
| Link R1–R3 | 2 | /30 | 192.168.10.228 | .229 – .230 | .231 |

#### Sumarização de rotas

Várias redes contíguas podem ser anunciadas como uma só. Escreva-as em binário e conte os bits iniciais em comum.

```
192.168.0.0/24  → 192.168.000000|00.0
192.168.1.0/24  → 192.168.000000|01.0
192.168.2.0/24  → 192.168.000000|10.0
192.168.3.0/24  → 192.168.000000|11.0
Bits em comum: 16 + 6 = 22  →  rota sumarizada 192.168.0.0/22
```

#### 10 exercícios resolvidos

| # | Pergunta | Resposta |
| --- | --- | --- |
| 1 | 192.168.1.77/27 — rede e broadcast? | 192.168.1.64 e 192.168.1.95 |
| 2 | 10.10.10.200/28 — faixa de hosts? | 10.10.10.193 a 10.10.10.206 |
| 3 | 172.16.50.10/20 — rede e broadcast? | 172.16.48.0 e 172.16.63.255 |
| 4 | 192.168.5.130/25 — rede e broadcast? | 192.168.5.128 e 192.168.5.255 |
| 5 | 10.0.0.5/30 — hosts válidos? | 10.0.0.5 e 10.0.0.6 |
| 6 | 192.168.100.33/29 — rede e broadcast? | 192.168.100.32 e 192.168.100.39 |
| 7 | Quantas /26 cabem em uma /24? | 4 |
| 8 | Menor prefixo para 50 hosts? | /26 (62 hosts) |
| 9 | Menor prefixo para 500 hosts? | /23 (510 hosts) |
| 10 | 172.31.200.100/22 — rede e broadcast? | 172.31.200.0 e 172.31.203.255 |

### Contexto real

Um provedor recebe um bloco /22 e precisa dividi-lo entre clientes de tamanhos diferentes; o roteador de borda anuncia apenas o /22 sumarizado para a Internet.

### Exercício

Qual o menor prefixo que comporta 50 hosts? E 500 hosts?

<details><summary>Resposta</summary>

50 hosts → /26 (62 hosts). 500 hosts → /23 (510 hosts).

</details>

### Desafio

Divida 10.0.0.0/24 para: LAN A com 120 hosts, LAN B com 60, LAN C com 25 e dois links ponto a ponto.

## Comandos úteis

**Calculadora de sub-rede no terminal** (Linux/macOS)

```
ipcalc 192.168.1.77/27
# ou
sipcalc 192.168.1.77/27
```

Instale com apt install ipcalc (Debian/Ubuntu) ou brew install ipcalc.

**Configurar uma sub-rede /27 em uma interface** (Cisco IOS)

```
interface g0/1
 ip address 192.168.1.65 255.255.255.224
 no shutdown
```

**Calcular com PowerShell** (Windows)

```
[ipaddress]$ip = "192.168.1.77"
[ipaddress]$mask = "255.255.255.224"
[ipaddress]($ip.Address -band $mask.Address)   # endereço de rede
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Esquecer de subtrair 2 no cálculo de hosts. | Rede e broadcast nunca são atribuídos a hosts (exceto /31 e /32). |
| Começar uma sub-rede fora de um múltiplo do bloco (ex.: /26 em .100). | Redes /26 só começam em .0, .64, .128 ou .192. |
| Sobrepor sub-redes no VLSM. | Aloque da maior para a menor e marque cada faixa usada em uma tabela. |

## Segurança

- Separe redes por função (usuários, servidores, gerência, convidados) e controle o tráfego entre elas com ACLs.
- Sub-redes menores limitam o alcance de ataques de broadcast e varreduras.
- Documente o plano de endereçamento: IPs desconhecidos aparecem mais rápido em auditorias.

## Pontos-chave

- Hosts = 2^h − 2; sub-redes = 2^b.
- Número mágico = 256 − máscara no octeto interessante.
- Broadcast = próxima rede − 1.
- VLSM: aloque da maior para a menor rede.
- Sumarização = bits iniciais em comum.

## Laboratório: Projeto de endereçamento com VLSM

**Objetivo:** Criar e validar um plano de endereçamento real.

**Ferramentas:** Subnetting Lab do NetLearn e Cisco Packet Tracer (opcional).

1. A partir de 172.16.0.0/22, planeje: Produção 300 hosts, Escritório 120, Wi-Fi visitantes 60, Servidores 12 e 2 links /30.
2. Monte uma tabela com rede, prefixo, faixa de hosts e broadcast.
3. Confira cada sub-rede no Subnetting Lab.
4. Opcional: configure as interfaces de um roteador no Packet Tracer e teste com ping.

**Resultado esperado:** Produção 172.16.0.0/23, Escritório 172.16.2.0/25, Visitantes 172.16.2.128/26, Servidores 172.16.2.192/28, links 172.16.2.208/30 e 172.16.2.212/30.

## Quiz

Gabarito em [../quizzes/05-subnetting.md](../quizzes/05-subnetting.md).

## Leituras recomendadas

- RFC 950 — Internet Standard Subnetting Procedure
- RFC 1878 — Variable Length Subnet Table
- RFC 3021 — Using 31-Bit Prefixes on Point-to-Point Links
