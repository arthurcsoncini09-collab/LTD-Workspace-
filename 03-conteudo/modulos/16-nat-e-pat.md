<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 16 — NAT e PAT

**Nível:** Avançado · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/nat-e-pat`

> Tradução de endereços: NAT estático, dinâmico, PAT/overload, terminologia inside/outside, port forwarding, CGNAT e limitações.

**Objetivo:** Entender por que o NAT existe, diferenciar seus tipos, ler uma tabela de tradução e configurar NAT/PAT e port forwarding.

O NAT traduz endereços privados em públicos na borda da rede. O PAT (NAT overload) permite que centenas de dispositivos compartilhem um único IP público usando portas diferentes.

## Objetivos de aprendizagem

- Explicar a motivação e o funcionamento do NAT.
- Diferenciar NAT estático, dinâmico, PAT e port forwarding.
- Ler uma tabela de traduções com a terminologia inside/outside.
- Configurar PAT e port forwarding em um roteador.
- Reconhecer as limitações do NAT e o cenário com IPv6.

## Aula 1 — Por que o NAT existe e seus tipos

**Palavras-chave:** NAT, PAT, overload, NAT estático, NAT dinâmico, inside local, inside global

### Introdução

NAT (Network Address Translation) é a tradução do endereço IP (e às vezes da porta) de um pacote ao atravessar um roteador. Ele surgiu para economizar endereços IPv4 públicos, que se tornaram escassos.

### Por que isso importa

Praticamente toda rede doméstica e corporativa usa NAT. Entender a tradução é essencial para publicar serviços, diagnosticar VPNs e jogos online, e configurar firewalls.

### Explicação

O roteador guarda uma tabela de traduções. Na saída, troca o IP:porta privado de origem por IP:porta público e anota a associação. Na volta, consulta a tabela e desfaz a troca para entregar ao host interno correto.

### Conteúdo

#### Tipos de NAT

| Tipo | Mapeamento | Uso típico |
| --- | --- | --- |
| NAT estático | 1 IP privado ↔ 1 IP público fixo | Publicar um servidor interno |
| NAT dinâmico | IPs privados ↔ pool de IPs públicos (1:1 temporário) | Pouco usado hoje |
| PAT / overload | Muitos IPs privados ↔ 1 IP público, diferenciados por porta | Casas e empresas (o mais comum) |
| Port forwarding | IP público:porta → IP privado:porta (estático por porta) | Expor um serviço específico (ex.: câmera, jogo) |

#### Terminologia Cisco

| Termo | Significado | Exemplo |
| --- | --- | --- |
| Inside local | IP do host interno, visto de dentro | 192.168.1.10 |
| Inside global | IP do host interno, visto de fora (após NAT) | 203.0.113.5 |
| Outside global | IP real do destino externo | 93.184.215.14 |
| Outside local | IP do destino externo, visto de dentro | 93.184.215.14 (geralmente igual) |

#### Tabela de tradução PAT

Repare que, quando dois hosts usam a mesma porta de origem, o roteador troca a porta de um deles para manter cada conexão única.

```
Pro  Inside local          Inside global         Outside global
tcp  192.168.1.10:51544    203.0.113.5:51544     93.184.215.14:443
tcp  192.168.1.11:51544    203.0.113.5:1024      93.184.215.14:443
udp  192.168.1.12:60001    203.0.113.5:60001     8.8.8.8:53
```

### Contexto real

Na sua casa, 10 dispositivos com IPs 192.168.0.x acessam a Internet ao mesmo tempo, todos aparecendo para os sites com o mesmo IP público do roteador — isso é PAT.

### Exercício

Qual tipo de NAT permite que muitos hosts compartilhem um único IP público?

<details><summary>Resposta</summary>

O PAT (Port Address Translation), também chamado NAT overload ou NAPT, que diferencia as conexões pela porta de origem.

</details>

### Desafio

Descubra seu IP privado (ipconfig/ip addr) e seu IP público (pesquise "qual meu IP"). Explique por que são diferentes.

## Aula 2 — Configuração, port forwarding e limitações

**Palavras-chave:** ip nat inside, ip nat outside, access-list, port forwarding, CGNAT, NAT traversal, IPv6

### Introdução

Configurar NAT exige definir quais interfaces são internas e externas, quais endereços serão traduzidos e para qual endereço. Também é preciso conhecer os efeitos colaterais do NAT.

### Por que isso importa

Um NAT mal configurado deixa a rede sem Internet ou expõe serviços indevidamente. E o NAT quebra o princípio fim a fim, o que afeta VoIP, jogos, VPNs e conexões P2P.

### Explicação

Conexões iniciadas de dentro para fora funcionam naturalmente com PAT. Conexões iniciadas de fora para dentro não encontram entrada na tabela e são descartadas — a não ser que exista um NAT estático ou port forwarding.

### Conteúdo

#### PAT em um roteador Cisco

```
interface g0/0
 ip address 192.168.1.1 255.255.255.0
 ip nat inside
interface g0/1
 ip address 203.0.113.5 255.255.255.252
 ip nat outside
!
access-list 1 permit 192.168.1.0 0.0.0.255
ip nat inside source list 1 interface g0/1 overload
```

#### NAT estático e port forwarding

```
! servidor inteiro com IP público próprio
ip nat inside source static 192.168.1.20 203.0.113.6
! somente a porta 443
ip nat inside source static tcp 192.168.1.20 443 203.0.113.5 443
```

#### Limitações do NAT

- Quebra a comunicação fim a fim: hosts internos não são alcançáveis diretamente.
- Protocolos que carregam IPs dentro dos dados (SIP, FTP ativo) precisam de ALG ou técnicas de travessia (STUN, TURN, ICE).
- IPsec AH não funciona com NAT; IPsec ESP precisa de NAT-T (UDP 4500).
- Dificulta a rastreabilidade: logs precisam registrar IP e porta.
- CGNAT impede port forwarding para o cliente final.
- NAT não é firewall: ele apenas não cria entradas para tráfego não solicitado; use regras de firewall explícitas.

#### NAT e IPv6

Com IPv6 há endereços suficientes para todos os dispositivos, então o NAT deixa de ser necessário. A proteção vem de um firewall stateful que bloqueia conexões de entrada não solicitadas. Para a transição, existem NAT64/DNS64, que permitem a hosts só IPv6 acessar serviços IPv4.

### Contexto real

Muitos provedores usam CGNAT (Carrier-Grade NAT): o cliente recebe um IP 100.64.x.x e compartilha o IP público com outros clientes. Por isso, port forwarding no roteador de casa às vezes "não funciona".

### Exercício

Por que um servidor web interno não é acessível da Internet apenas com PAT configurado?

<details><summary>Resposta</summary>

Porque o PAT só cria traduções para conexões iniciadas de dentro. Uma conexão vinda de fora não tem entrada na tabela; é preciso um NAT estático/port forwarding para a porta 80/443 do servidor.

</details>

### Desafio

Configure, em laboratório, um port forwarding da porta 8080 pública para a porta 80 de um servidor interno e teste de fora.

## Comandos úteis

**Verificar traduções** (Cisco IOS)

```
show ip nat translations
show ip nat statistics
clear ip nat translation *
debug ip nat
```

**NAT/masquerade em um gateway Linux** (Linux/macOS)

```
sudo sysctl -w net.ipv4.ip_forward=1
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
# port forwarding 8080 → 192.168.1.20:80
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 8080 -j DNAT --to-destination 192.168.1.20:80
```

**Descobrir o IP público** (Multiplataforma)

```
curl https://ifconfig.me
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Esquecer ip nat inside/outside nas interfaces. | Sem marcar as interfaces, nenhuma tradução acontece. |
| ACL do NAT não cobre toda a rede interna. | Confira a wildcard: 192.168.1.0 0.0.0.255 cobre a /24 inteira. |
| Port forwarding configurado, mas inacessível. | Verifique se o provedor usa CGNAT (IP WAN 100.64.x.x) e se o firewall permite a porta. |

## Segurança

- Exponha apenas os serviços estritamente necessários via port forwarding e mantenha-os atualizados.
- Desabilite UPnP no roteador se não for necessário: ele permite que dispositivos (ou malwares) abram portas sozinhos.
- Registre logs de NAT (IP e porta) para investigações e obrigações legais.

## Pontos-chave

- NAT traduz IP privado ↔ público na borda.
- PAT = muitos hosts, um IP público, portas diferentes.
- Conexões de fora só entram com NAT estático/port forwarding.
- CGNAT (100.64/10) impede port forwarding para o cliente.
- NAT não é firewall; IPv6 dispensa NAT.

## Laboratório: Rede com saída à Internet via PAT

**Objetivo:** Configurar PAT, publicar um servidor e observar a tabela de traduções.

**Ferramentas:** Cisco Packet Tracer.

1. Monte uma LAN 192.168.1.0/24 com 3 PCs e um servidor web, um roteador de borda e um "servidor da Internet" em 203.0.113.0/30.
2. Configure ip nat inside/outside e o PAT com overload.
3. Acesse o servidor externo pelos PCs e examine show ip nat translations.
4. Crie um NAT estático para a porta 80 do servidor interno e teste de fora.

**Resultado esperado:** Várias traduções compartilhando o IP público e o servidor interno acessível pela porta publicada.

## Quiz

Gabarito em [../quizzes/16-nat-e-pat.md](../quizzes/16-nat-e-pat.md).

## Leituras recomendadas

- RFC 3022 — Traditional NAT
- RFC 6598 — Shared Address Space (CGNAT)
- RFC 6146 — NAT64
- RFC 8445 — ICE
