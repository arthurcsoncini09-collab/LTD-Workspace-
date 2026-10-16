<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 8 — Portas de Rede

**Nível:** Intermediário · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/portas-de-rede`

> Portas e sockets, faixas de portas, as portas mais importantes, estados de porta e varredura ética.

**Objetivo:** Entender como portas identificam aplicações, memorizar as portas mais usadas e verificar quais serviços estão expostos em um host.

O IP leva o pacote até o host; a porta leva os dados até a aplicação certa dentro dele. A combinação IP + porta + protocolo forma um socket.

## Objetivos de aprendizagem

- Explicar a função das portas e dos sockets.
- Identificar as faixas de portas definidas pela IANA.
- Associar as principais portas aos seus serviços.
- Verificar portas abertas em um host de forma ética.

## Aula 1 — Portas, sockets e faixas

**Palavras-chave:** porta, socket, well-known, efêmera, quíntupla, IANA

### Introdução

Uma porta é um número de 16 bits (0 a 65535) usado pelo TCP e pelo UDP para identificar processos. Um servidor web "escuta" na porta 443; seu navegador usa uma porta alta aleatória como origem.

### Por que isso importa

Configurar firewalls, port forwarding, diagnosticar serviços e avaliar a superfície de ataque de um servidor exige saber quais portas estão abertas e por quê.

### Explicação

Pense no IP como o endereço de um prédio e na porta como o número do apartamento. Um socket é a combinação IP:porta; uma conexão TCP é identificada pela quíntupla: protocolo, IP de origem, porta de origem, IP de destino, porta de destino.

### Conteúdo

#### Faixas de portas (IANA)

| Faixa | Nome | Uso |
| --- | --- | --- |
| 0 – 1023 | Bem conhecidas (well-known) | Serviços padrão; exigem privilégio de administrador para escutar em Linux |
| 1024 – 49151 | Registradas | Aplicações específicas (MySQL 3306, RDP 3389…) |
| 49152 – 65535 | Dinâmicas / efêmeras | Portas de origem temporárias dos clientes |

#### Socket e quíntupla

```
Cliente 192.168.1.10:51544  ──TCP──>  Servidor 93.184.215.14:443

Quíntupla: (TCP, 192.168.1.10, 51544, 93.184.215.14, 443)
```

### Contexto real

Ao abrir duas abas do mesmo site, o navegador cria duas conexões com o mesmo IP e porta de destino (443), mas com portas de origem diferentes — é assim que as respostas voltam para a aba correta.

### Exercício

Quantas portas existem e em que faixas elas se dividem?

<details><summary>Resposta</summary>

65.536 portas (0–65535): bem conhecidas 0–1023, registradas 1024–49151 e dinâmicas/efêmeras 49152–65535.

</details>

### Desafio

Abra três sites diferentes e use netstat/ss para identificar as portas de origem usadas pelo seu navegador.

## Aula 2 — Portas essenciais e estados de porta

**Palavras-chave:** HTTP, HTTPS, SSH, DNS, RDP, SMB, nmap, aberta, filtrada

### Introdução

Algumas portas aparecem o tempo todo em provas, firewalls e logs. Memorizá-las agiliza muito o trabalho de quem administra redes.

### Por que isso importa

Ao ver um alerta "tentativas de conexão na porta 3389", um analista precisa saber na hora que se trata de RDP — e que expô-lo na Internet é um risco sério.

### Explicação

Uma porta pode estar aberta (há um serviço escutando e respondendo), fechada (o host responde com RST/ICMP, mas nada escuta) ou filtrada (um firewall descarta os pacotes e não há resposta).

### Conteúdo

#### Portas que todo profissional deve saber

| Porta | Protocolo | Serviço |
| --- | --- | --- |
| 20, 21 | TCP | FTP (dados, controle) |
| 22 | TCP | SSH / SFTP / SCP |
| 23 | TCP | Telnet (inseguro) |
| 25 | TCP | SMTP (envio entre servidores de e-mail) |
| 53 | UDP/TCP | DNS |
| 67, 68 | UDP | DHCP (servidor, cliente) |
| 69 | UDP | TFTP |
| 80 | TCP | HTTP |
| 110 | TCP | POP3 |
| 123 | UDP | NTP |
| 143 | TCP | IMAP |
| 161, 162 | UDP | SNMP, SNMP traps |
| 389 / 636 | TCP | LDAP / LDAPS |
| 443 | TCP/UDP | HTTPS (UDP para HTTP/3) |
| 445 | TCP | SMB (compartilhamento Windows) |
| 587 | TCP | SMTP submission (envio de clientes) |
| 993 / 995 | TCP | IMAPS / POP3S |
| 1194 | UDP | OpenVPN |
| 3306 | TCP | MySQL |
| 3389 | TCP | RDP (área de trabalho remota) |
| 5432 | TCP | PostgreSQL |
| 51820 | UDP | WireGuard |

#### Estados de porta em uma varredura

| Estado | O que acontece | Interpretação |
| --- | --- | --- |
| Aberta | Responde SYN-ACK (TCP) ou dados (UDP) | Há um serviço escutando |
| Fechada | Responde RST (TCP) ou ICMP port unreachable (UDP) | Host ativo, sem serviço |
| Filtrada | Sem resposta ou ICMP administratively prohibited | Firewall bloqueando |

#### Varredura ética

Ferramentas como o nmap são usadas por administradores para auditar seus próprios sistemas. Varrer redes de terceiros sem autorização pode ser crime (no Brasil, a Lei 12.737/2012 tipifica a invasão de dispositivo informático). Pratique apenas em equipamentos seus ou em laboratórios autorizados.

### Contexto real

Varreduras automatizadas na Internet procuram constantemente portas como 22 (SSH), 23 (Telnet), 445 (SMB) e 3389 (RDP) abertas para tentar invasões.

### Exercício

Quais são as portas de HTTP, HTTPS, SSH e DNS?

<details><summary>Resposta</summary>

HTTP 80/TCP, HTTPS 443/TCP (e UDP para HTTP/3), SSH 22/TCP e DNS 53/UDP e TCP.

</details>

### Desafio

Use nmap no seu próprio computador (localhost) e explique cada porta aberta que aparecer.

## Comandos úteis

**Portas em escuta no seu computador** (Windows)

```
netstat -ano | findstr LISTENING
Get-NetTCPConnection -State Listen
```

**Portas em escuta no seu computador** (Linux/macOS)

```
sudo ss -tulpn          # Linux
sudo lsof -iTCP -sTCP:LISTEN -n -P   # macOS
```

**Auditoria com nmap (apenas em hosts autorizados)** (Multiplataforma)

```
nmap localhost
nmap -sV -p 22,80,443 192.168.1.10
```

-sV tenta identificar a versão do serviço.

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Achar que mudar a porta do serviço o torna seguro. | Trocar a porta reduz ruído de bots, mas não substitui autenticação forte e firewall. |
| Liberar no firewall a porta errada (TCP em vez de UDP). | Confira o protocolo: DNS e WireGuard, por exemplo, usam UDP. |
| Serviço "não funciona" porque escuta só em 127.0.0.1. | Verifique o endereço de bind no ss/netstat: 0.0.0.0 aceita conexões externas. |

## Segurança

- Princípio do menor privilégio: feche todas as portas que não são necessárias.
- Nunca exponha Telnet, SMB, RDP ou bancos de dados diretamente na Internet; use VPN.
- Monitore varreduras com IDS e bloqueie IPs abusivos (fail2ban, listas de bloqueio).

## Pontos-chave

- Porta = 16 bits (0–65535); identifica a aplicação no host.
- Well-known 0–1023; registradas 1024–49151; efêmeras 49152–65535.
- Memorize: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 3389 RDP.
- Aberta, fechada, filtrada: cada estado diz algo diferente.
- Só faça varreduras em ambientes autorizados.

## Laboratório: Inventário de portas do seu computador

**Objetivo:** Descobrir quais serviços estão escutando e decidir se deveriam.

**Ferramentas:** ss/netstat e nmap.

1. Liste as portas em escuta com ss -tulpn (Linux) ou netstat -ano (Windows).
2. Para cada porta, identifique o processo responsável.
3. Rode nmap localhost e compare com a lista anterior.
4. Anote quais serviços você pode desativar com segurança.

**Resultado esperado:** Uma tabela porta → processo → necessidade (sim/não).

## Quiz

Gabarito em [../quizzes/08-portas-de-rede.md](../quizzes/08-portas-de-rede.md).

## Leituras recomendadas

- IANA Service Name and Transport Protocol Port Number Registry
- RFC 6335 — Procedures for Port Number Assignment
- Documentação do Nmap (nmap.org/book)
