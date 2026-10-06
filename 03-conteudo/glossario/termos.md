<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Glossário

58 termos, também disponíveis com busca em `/glossario`.

| Termo | Definição | Nome técnico | Exemplo | Relacionado |
| --- | --- | --- | --- | --- |
| ACL | Lista de regras que permite ou nega tráfego com base em endereços, protocolos e portas. | Access Control List | permit tcp any host 10.0.0.10 eq 443 | firewall, roteador, segurança |
| APIPA | Endereço 169.254.x.x que o sistema se atribui quando não consegue falar com o servidor DHCP. | Automatic Private IP Addressing (link-local) | 169.254.33.7 | DHCP, IPv4, troubleshooting |
| ARP | Protocolo que descobre o endereço MAC associado a um IP da rede local. | Address Resolution Protocol (RFC 826) | Quem tem 192.168.1.1? Responda para 192.168.1.10 | MAC, camada 2, ARP spoofing |
| BGP | Protocolo de roteamento que interliga os sistemas autônomos que formam a Internet. | Border Gateway Protocol (RFC 4271) | Provedor anunciando seus prefixos para outros provedores | roteamento, sistema autônomo, Internet |
| Broadcast | Envio de uma mensagem para todos os dispositivos de uma rede. | Difusão (IPv4: último endereço da sub-rede; MAC FF:FF:FF:FF:FF:FF) | 192.168.1.255 em uma /24 | domínio de broadcast, ARP, DHCP |
| CGNAT | NAT feito pelo provedor, em que vários clientes compartilham o mesmo IP público. | Carrier-Grade NAT (faixa 100.64.0.0/10) | IP WAN do roteador 100.72.10.5 | NAT, IPv4, port forwarding |
| CIDR | Notação que indica quantos bits do endereço pertencem à rede. | Classless Inter-Domain Routing | 192.168.1.0/24 | máscara, subnetting, prefixo |
| DHCP | Serviço que entrega automaticamente IP, máscara, gateway e DNS aos dispositivos. | Dynamic Host Configuration Protocol (UDP 67/68) | Celular recebe IP ao entrar no Wi-Fi | DORA, lease, relay |
| DMZ | Zona isolada da rede onde ficam os servidores acessíveis pela Internet. | Demilitarized Zone | Servidor web da empresa | firewall, segmentação, NAT |
| DNS | Sistema que converte nomes de domínio em endereços IP. | Domain Name System (porta 53) | example.com → 93.184.215.14 | registro A, MX, resolvedor |
| DNSSEC | Extensão que assina digitalmente registros DNS para garantir sua autenticidade. | DNS Security Extensions | Registros RRSIG e DNSKEY | DNS, cache poisoning, segurança |
| DoH | Consultas DNS cifradas dentro de HTTPS. | DNS over HTTPS (RFC 8484) | Navegador consultando https://cloudflare-dns.com/dns-query | DNS, privacidade, DoT |
| Domínio de broadcast | Conjunto de dispositivos que recebem os broadcasts uns dos outros. | Broadcast domain | Cada VLAN é um domínio de broadcast | VLAN, roteador, switch |
| Domínio de colisão | Segmento em que transmissões simultâneas podem colidir. | Collision domain | Cada porta de switch é um domínio de colisão | hub, switch, half duplex |
| Encapsulamento | Processo em que cada camada adiciona seu cabeçalho aos dados antes de enviá-los. | Encapsulation | HTTP dentro de TCP dentro de IP dentro de Ethernet | OSI, PDU, cabeçalho |
| Ethernet | Tecnologia padrão de redes locais cabeadas. | IEEE 802.3 | Cabo Cat6 a 1 Gbps | quadro, MAC, switch |
| Firewall | Sistema que permite ou bloqueia tráfego com base em regras de segurança. | Filtro de tráfego (stateless, stateful, NGFW) | Liberar apenas a porta 443 para o servidor web | ACL, DMZ, IPS |
| Full duplex | Modo em que o dispositivo envia e recebe dados ao mesmo tempo. | Full duplex | Porta de switch a 1 Gbps full duplex | half duplex, switch, colisão |
| Gateway | Ponto que conecta a rede local a outras redes; normalmente o roteador. | Default gateway | 192.168.1.1 | roteador, rota padrão, ARP |
| HTTP | Protocolo de requisição e resposta usado na web. | HyperText Transfer Protocol (porta 80) | GET /index.html → 200 OK | HTTPS, métodos, códigos de status |
| HTTPS | HTTP protegido por criptografia TLS. | HTTP over TLS (porta 443) | Cadeado no navegador | TLS, certificado, HSTS |
| Hub | Equipamento antigo que repete o sinal para todas as portas. | Repetidor multiporta (camada 1) | Substituído pelos switches | switch, colisão, camada física |
| ICMP | Protocolo de mensagens de erro e controle da camada de rede. | Internet Control Message Protocol | ping (Echo Request/Reply) | ping, traceroute, TTL |
| IDS/IPS | Sistemas que detectam (IDS) ou bloqueiam (IPS) ataques no tráfego. | Intrusion Detection / Prevention System | Suricata, Snort | firewall, segurança, NGFW |
| IP | Identificador lógico de um dispositivo em uma rede IP. | Internet Protocol | 192.168.10.130 | IPv4, IPv6, roteamento |
| IPsec | Conjunto de protocolos que autentica e cifra pacotes IP; base de muitas VPNs. | IP Security (IKE, ESP, AH) | VPN entre matriz e filial | VPN, criptografia, IKE |
| IPv6 | Versão do IP com endereços de 128 bits, criada para substituir o IPv4. | Internet Protocol version 6 | 2001:db8:acad:1::10 | IPv4, NDP, SLAAC |
| LAN | Rede local, de alcance limitado (casa, escritório, prédio). | Local Area Network | Rede do escritório | WAN, switch, Ethernet |
| Latência | Tempo que um pacote leva para chegar ao destino (ou ir e voltar). | Latency / RTT | ping com tempo=14 ms | jitter, throughput, ping |
| Lease | Tempo de validade do endereço concedido pelo DHCP. | DHCP lease | Lease de 8 horas | DHCP, renovação, pool |
| MAC | Endereço físico de 48 bits que identifica uma interface de rede. | Media Access Control address | 00:1A:2B:3C:4D:5E | ARP, switch, OUI |
| Máscara de sub-rede | Valor que separa a parte de rede da parte de host em um endereço IP. | Subnet mask | 255.255.255.0 (/24) | CIDR, subnetting, IPv4 |
| MTU | Maior tamanho de pacote que um enlace transmite sem fragmentar. | Maximum Transmission Unit | 1500 bytes na Ethernet | fragmentação, ICMP, VPN |
| NAT | Tradução de endereços IP privados em públicos (e vice-versa) na borda da rede. | Network Address Translation | 192.168.1.10 → 203.0.113.5 | PAT, CGNAT, port forwarding |
| OSI | Modelo de referência que divide a comunicação em sete camadas. | Open Systems Interconnection (ISO 7498) | Camada 3 = Rede | TCP/IP, encapsulamento, PDU |
| OSPF | Protocolo de roteamento dinâmico de estado de enlace, muito usado em empresas. | Open Shortest Path First | router ospf 1 | roteamento, Dijkstra, área 0 |
| PAT | Tipo de NAT em que vários hosts compartilham um IP público, diferenciados por porta. | Port Address Translation / NAT overload | Toda a casa saindo pelo mesmo IP público | NAT, portas, roteador |
| PDU | Unidade de dados de cada camada: dados, segmento, pacote, quadro, bits. | Protocol Data Unit | Na camada 2, a PDU é o quadro | OSI, encapsulamento |
| Port forwarding | Regra que encaminha uma porta do IP público para um host interno. | Static PAT / DNAT | 203.0.113.5:8080 → 192.168.1.20:80 | NAT, firewall, servidor |
| Porta | Número de 16 bits que identifica uma aplicação dentro de um host. | Port (TCP/UDP) | 443 = HTTPS | socket, TCP, UDP |
| Rota padrão | Rota usada quando nenhuma outra corresponde ao destino. | Default route 0.0.0.0/0 | ip route 0.0.0.0 0.0.0.0 203.0.113.1 | gateway, roteamento |
| Roteador | Dispositivo que encaminha pacotes entre redes diferentes. | Router (camada 3) | Conecta a rede de casa à Internet | gateway, tabela de rotas, NAT |
| Socket | Combinação de IP, porta e protocolo que identifica uma ponta da comunicação. | Socket | 192.168.1.10:51544 | porta, TCP, conexão |
| SSH | Protocolo de acesso remoto seguro e cifrado. | Secure Shell (porta 22) | ssh admin@192.168.1.1 | Telnet, chaves, SFTP |
| STP | Protocolo que evita loops de camada 2 bloqueando caminhos redundantes. | Spanning Tree Protocol (IEEE 802.1D/802.1w) | Eleição da root bridge | switch, loop, RSTP |
| Subnetting | Divisão de uma rede em sub-redes menores. | Sub-redes / VLSM | 192.168.1.0/24 dividida em quatro /26 | máscara, CIDR, VLSM |
| Switch | Dispositivo que conecta equipamentos da mesma rede local e encaminha quadros pelo MAC. | Comutador Ethernet (camada 2) | Conecta os PCs de um escritório | MAC, VLAN, STP |
| TCP | Protocolo de transporte confiável e orientado a conexão. | Transmission Control Protocol | HTTPS, SSH | UDP, handshake, portas |
| Three-way handshake | Troca SYN, SYN-ACK, ACK que estabelece uma conexão TCP. | TCP 3-way handshake | Início de toda conexão HTTPS | TCP, SYN flood |
| Throughput | Taxa real de transferência obtida em um link. | Vazão efetiva | Plano de 500 Mbps entregando 430 Mbps | largura de banda, latência |
| TLS | Protocolo que cifra e autentica comunicações, usado no HTTPS. | Transport Layer Security | TLS 1.3 | HTTPS, certificado, criptografia |
| TTL | Contador de saltos no cabeçalho IP; evita que pacotes circulem para sempre. No DNS, é o tempo de cache. | Time To Live | TTL=64 | traceroute, ICMP, DNS |
| UDP | Protocolo de transporte leve, rápido e sem confirmação de entrega. | User Datagram Protocol | DNS, VoIP, jogos | TCP, QUIC, portas |
| VLAN | Rede lógica separada dentro da mesma infraestrutura de switches. | Virtual Local Area Network (IEEE 802.1Q) | VLAN 10 para Vendas | switch, trunk, inter-VLAN |
| VLSM | Uso de máscaras de tamanhos diferentes para sub-redes de tamanhos diferentes. | Variable Length Subnet Mask | /25 para Vendas e /30 para links | subnetting, CIDR |
| VPN | Túnel cifrado que conecta redes ou usuários através da Internet. | Virtual Private Network | Home office acessando a rede da empresa | IPsec, WireGuard, túnel |
| WAN | Rede de grande alcance que liga redes locais geograficamente separadas. | Wide Area Network | Internet, link entre filiais | LAN, Internet, ISP |
| Wi-Fi | Tecnologia de rede local sem fio. | IEEE 802.11 (WLAN) | Wi-Fi 6 (802.11ax) | access point, WPA3, WLAN |
