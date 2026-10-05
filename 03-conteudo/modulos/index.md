# Módulos

O conteúdo de cada módulo fica em `lib/content/modules/` (um arquivo por módulo) e é carregado
automaticamente no banco SQLite. Ao alterar qualquer conteúdo, incremente `CONTENT_VERSION` em
`lib/content/index.ts` para que o banco seja recriado.

Cada módulo contém: objetivos de aprendizagem, aulas (introdução, por que importa, explicação,
seções com tabelas/código, contexto real, exercício com resposta e desafio), comandos úteis
(Windows, Linux e Cisco IOS), erros comuns, segurança, pontos-chave, laboratório prático,
quiz e leituras recomendadas.

| # | Módulo | Nível | Arquivo |
|---|--------|-------|---------|
| 1 | Introdução às Redes | Básico | `01-introducao-redes.ts` |
| 2 | Modelo OSI | Básico | `02-modelo-osi.ts` |
| 3 | TCP/IP | Básico | `03-tcp-ip.ts` |
| 4 | IPv4 | Básico | `04-ipv4.ts` |
| 5 | Subnetting | Intermediário | `05-subnetting.ts` |
| 6 | MAC e ARP | Intermediário | `06-mac-e-arp.ts` |
| 7 | TCP e UDP | Intermediário | `07-tcp-udp.ts` |
| 8 | Portas de Rede | Intermediário | `08-portas-de-rede.ts` |
| 9 | DNS | Intermediário | `09-dns.ts` |
| 10 | DHCP | Intermediário | `10-dhcp.ts` |
| 11 | HTTP/HTTPS | Intermediário | `11-http-https.ts` |
| 12 | SSH | Intermediário | `12-ssh.ts` |
| 13 | ICMP | Intermediário | `13-icmp.ts` |
| 14 | Switch | Avançado | `14-switch.ts` |
| 15 | Router | Avançado | `15-router.ts` |
| 16 | NAT e PAT | Avançado | `16-nat-pat.ts` |
| 17 | Firewall | Avançado | `17-firewall.ts` |
| 18 | VLAN | Avançado | `18-vlan.ts` |
| 19 | VPN | Avançado | `19-vpn.ts` |
| 20 | Desafio Final | Projeto | `20-desafio-final.ts` |
