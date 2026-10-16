<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 17 — Firewall

**Nível:** Avançado · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/firewall`

> Tipos de firewall, regras e ordem de avaliação, deny implícito, ACLs Cisco, DMZ, iptables/nftables, IDS/IPS e menor privilégio.

**Objetivo:** Projetar e escrever regras de firewall eficazes, entender os diferentes tipos de firewall e posicioná-los corretamente na rede.

Um firewall decide, com base em regras, qual tráfego pode passar. A política recomendada é negar tudo por padrão e liberar apenas o necessário.

## Objetivos de aprendizagem

- Diferenciar filtro de pacotes, stateful, proxy, NGFW e WAF.
- Projetar zonas de segurança com DMZ.
- Escrever ACLs padrão e estendidas na ordem correta.
- Configurar um firewall stateful em Linux.
- Aplicar o princípio do menor privilégio.

## Aula 1 — O que é um firewall e seus tipos

**Palavras-chave:** firewall, stateful, filtro de pacotes, NGFW, WAF, DMZ, zona

### Introdução

Firewall é um sistema (hardware, software ou serviço em nuvem) que controla o tráfego entre zonas de confiança diferentes, aplicando uma política de segurança definida em regras.

### Por que isso importa

É uma das principais barreiras contra acessos não autorizados. Um firewall mal configurado pode ser tão perigoso quanto não ter firewall — ou derrubar serviços legítimos.

### Explicação

Firewalls evoluíram: filtros de pacotes olham apenas cabeçalhos; firewalls stateful acompanham o estado das conexões e permitem automaticamente as respostas; NGFWs identificam aplicações e usuários e inspecionam conteúdo; WAFs protegem especificamente aplicações web.

### Conteúdo

#### Tipos de firewall

| Tipo | Camadas | Como decide | Exemplo |
| --- | --- | --- | --- |
| Filtro de pacotes (stateless) | 3 e 4 | IP, porta e protocolo de cada pacote isolado | ACLs em roteadores |
| Stateful | 3 e 4 | Regras + tabela de estado das conexões | iptables/nftables, Windows Firewall |
| Proxy / gateway de aplicação | 7 | Intermedia a conexão e analisa o protocolo | Squid, proxies corporativos |
| NGFW | 3 a 7 | Aplicação, usuário, reputação, IPS e inspeção TLS | Palo Alto, Fortinet, pfSense+ |
| WAF | 7 (HTTP) | Bloqueia ataques web: SQLi, XSS | ModSecurity, Cloudflare WAF |

#### Zonas e DMZ

A DMZ (zona desmilitarizada) isola os servidores expostos. Se um deles for comprometido, o atacante ainda não está na rede interna.

```
Internet ──[Firewall]──┬── DMZ (servidores públicos: web, e-mail)
                       └── LAN interna (usuários, servidores internos)

Internet → DMZ: só portas publicadas (443)
Internet → LAN: negado
LAN → Internet: permitido (com controle)
DMZ → LAN: negado (exceto o estritamente necessário)
```

#### IDS × IPS

- IDS (Intrusion Detection System): analisa o tráfego e alerta sobre ataques, sem bloquear (ex.: Snort, Suricata em modo passivo).
- IPS (Intrusion Prevention System): fica no caminho do tráfego e bloqueia ataques em tempo real.
- NGFWs normalmente incluem IPS integrado.

### Contexto real

Uma empresa coloca um firewall de nova geração (NGFW) na borda com a Internet, liberando apenas HTTPS para o servidor web na DMZ e bloqueando acesso direto à rede interna. Cada servidor também tem um firewall local.

### Exercício

Qual a vantagem de um firewall stateful em relação a um filtro de pacotes simples?

<details><summary>Resposta</summary>

O stateful mantém uma tabela de conexões: as respostas de conexões iniciadas de dentro são permitidas automaticamente, sem precisar abrir regras de entrada amplas, e pacotes fora de contexto são descartados.

</details>

### Desafio

Desenhe a rede de uma pequena empresa com Internet, DMZ (servidor web) e LAN, e indique onde ficam os firewalls e quais fluxos são permitidos.

## Aula 2 — Regras, ACLs e boas práticas

**Palavras-chave:** ACL, regra, deny implícito, ordem, wildcard, iptables, nftables, menor privilégio

### Introdução

Regras de firewall são avaliadas em ordem, de cima para baixo; a primeira que corresponder ao pacote decide a ação. Se nenhuma corresponder, aplica-se a política padrão — idealmente, negar.

### Por que isso importa

A ordem das regras muda completamente o resultado. Uma regra ampla no topo pode anular todas as regras específicas abaixo dela.

### Explicação

Escreva regras do mais específico para o mais geral, documente o motivo de cada uma e revise periodicamente. Nos roteadores Cisco, toda ACL termina com um "deny any" implícito invisível.

### Conteúdo

#### ACLs Cisco: padrão × estendida

| Tipo | Numeração | Filtra por | Onde aplicar |
| --- | --- | --- | --- |
| Padrão | 1–99, 1300–1999 | Somente IP de origem | Perto do destino |
| Estendida | 100–199, 2000–2699 | Origem, destino, protocolo e portas | Perto da origem |

#### Exemplo de ACL estendida nomeada

A última linha "permit ip any any" é necessária aqui para não bloquear o restante do tráfego, já que existe o deny implícito.

```
ip access-list extended LAN-PARA-SERVIDOR
 permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.10 eq 443
 permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.10 eq 22
 deny   ip any host 10.0.0.10 log
 permit ip any any
!
interface g0/0
 ip access-group LAN-PARA-SERVIDOR in
```

#### Firewall stateful no Linux (nftables)

```
table inet filtro {
  chain entrada {
    type filter hook input priority 0; policy drop;
    ct state established,related accept
    iif lo accept
    tcp dport { 22, 443 } accept
    icmp type echo-request limit rate 5/second accept
  }
}
```

#### Boas práticas

- Política padrão: negar tudo; liberar explicitamente o necessário (menor privilégio).
- Filtrar também o tráfego de saída (egress), não apenas o de entrada.
- Regras específicas no topo; documentar dono, motivo e data de cada regra.
- Registrar (log) bloqueios relevantes e revisar as regras periodicamente.
- Evitar regras "any any"; usar objetos e grupos nomeados.
- Testar mudanças fora do horário de pico e manter backup da configuração.

### Contexto real

Um administrador coloca "permitir qualquer → qualquer" para testar e esquece a regra lá. Meses depois, um serviço de banco de dados fica exposto à Internet.

### Exercício

Uma ACL tem: 1) deny any any; 2) permit tcp any host 10.0.0.10 eq 443. O tráfego HTTPS para 10.0.0.10 passa?

<details><summary>Resposta</summary>

Não. A regra 1 corresponde a todo o tráfego primeiro e o bloqueia; a regra 2 nunca é avaliada.

</details>

### Desafio

Escreva uma ACL estendida que permita apenas que a rede 192.168.10.0/24 acesse o servidor 10.0.0.10 via HTTPS e SSH, bloqueando o restante.

## Comandos úteis

**Verificar ACLs** (Cisco IOS)

```
show access-lists
show ip interface g0/0 | include access list
```

**Firewall no Linux** (Linux/macOS)

```
sudo nft list ruleset
sudo ufw status verbose            # Ubuntu
sudo ufw allow 443/tcp
sudo iptables -L -n -v              # legado
```

**Firewall do Windows** (Windows)

```
Get-NetFirewallProfile | Select Name, Enabled
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Regra genérica acima das específicas. | Ordene do mais específico para o mais geral. |
| Bloquear-se fora do equipamento remoto ao aplicar política drop. | Libere o SSH de administração antes e use "reload in 5" (Cisco) ou um agendamento de rollback. |
| Esquecer o tráfego de retorno em ACLs stateless. | Use a palavra-chave established ou um firewall stateful. |

## Segurança

- Firewall é uma camada, não a solução completa: combine com atualizações, MFA, segmentação e monitoramento.
- Restrinja a saída: malwares precisam se comunicar com servidores de comando e controle.
- Proteja a gerência do próprio firewall (rede dedicada, MFA, logs centralizados).

## Pontos-chave

- Regras avaliadas de cima para baixo; a primeira correspondência vence.
- Deny implícito no final; política padrão = negar.
- Stateful permite respostas automaticamente.
- DMZ isola servidores públicos.
- ACL estendida perto da origem; padrão perto do destino.

## Laboratório: Política de firewall para uma pequena empresa

**Objetivo:** Implementar e testar uma política com LAN, DMZ e Internet.

**Ferramentas:** Cisco Packet Tracer (ACLs) ou uma VM Linux (nftables/ufw).

1. Monte LAN 192.168.10.0/24, DMZ 172.16.0.0/24 com servidor web e um host "Internet".
2. Permita Internet → DMZ apenas na porta 443 (ou 80 no Packet Tracer).
3. Permita LAN → DMZ e LAN → Internet; negue Internet → LAN e DMZ → LAN.
4. Teste cada fluxo com ping e navegador e verifique os contadores com show access-lists.

**Resultado esperado:** Somente os fluxos permitidos funcionam e os contadores de deny aumentam nas tentativas bloqueadas.

## Quiz

Gabarito em [../quizzes/17-firewall.md](../quizzes/17-firewall.md).

## Leituras recomendadas

- NIST SP 800-41 Rev. 1 — Guidelines on Firewalls and Firewall Policy
- Documentação do nftables (wiki.nftables.org)
- CIS Benchmarks
