<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 19 — VPN

**Nível:** Avançado · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/vpn`

> Redes privadas virtuais: site-to-site e acesso remoto, tunelamento, IPsec, SSL/TLS VPN, WireGuard, OpenVPN, split tunneling e Zero Trust.

**Objetivo:** Entender como VPNs criam túneis seguros sobre redes públicas, comparar os principais protocolos e escolher a solução adequada para cada cenário.

Uma VPN encapsula e cifra o tráfego, criando um "túnel" privado sobre a Internet. Ela interliga filiais (site-to-site) ou conecta usuários remotos à rede da empresa (acesso remoto).

## Objetivos de aprendizagem

- Explicar tunelamento e os tipos de VPN.
- Comparar IPsec, SSL/TLS VPN, OpenVPN e WireGuard.
- Descrever as fases do IPsec/IKE.
- Configurar uma VPN WireGuard simples.
- Relacionar VPN e Zero Trust.

## Aula 1 — Conceitos e tipos de VPN

**Palavras-chave:** VPN, túnel, site-to-site, acesso remoto, encapsulamento, split tunneling

### Introdução

VPN (Virtual Private Network) é uma conexão lógica, protegida por criptografia, estabelecida sobre uma rede pública ou não confiável — normalmente a Internet.

### Por que isso importa

Contratar links dedicados entre filiais é caro. A VPN permite usar a Internet com segurança para interligar escritórios e para o trabalho remoto.

### Explicação

Tunelamento é colocar um pacote inteiro dentro de outro. O pacote original (com IPs privados) é cifrado e encapsulado em um novo pacote com os IPs públicos dos dois gateways VPN. Quem observa a Internet só vê tráfego cifrado entre esses dois IPs.

### Conteúdo

#### Tipos de VPN

| Tipo | Conecta | Exemplo |
| --- | --- | --- |
| Site-to-site | Rede ↔ rede, entre gateways | Matriz ↔ filial com IPsec |
| Acesso remoto | Usuário ↔ rede | Funcionário em casa com cliente VPN |
| Cliente-a-site via navegador (SSL VPN clientless) | Usuário ↔ aplicações web | Portal web da empresa |
| VPN comercial/de privacidade | Usuário ↔ provedor de VPN | Ocultar o tráfego em Wi-Fi público |

#### Tunelamento

```
Pacote original:     | IP 10.1.1.10 → 10.2.2.20 | TCP | Dados |

No túnel (IPsec ESP modo túnel):
| IP 203.0.113.1 → 198.51.100.1 | ESP | [IP 10.1.1.10 → 10.2.2.20 | TCP | Dados] cifrado | ESP trailer/auth |
```

#### Full tunnel × split tunneling

- Full tunnel: todo o tráfego do usuário passa pela VPN — mais controle e inspeção, mais carga no concentrador.
- Split tunneling: só o tráfego para redes da empresa vai pelo túnel; o resto sai direto para a Internet — menos carga, menos visibilidade.

### Contexto real

Uma empresa com matriz em São Paulo e filial em Recife conecta as duas redes por uma VPN IPsec entre os firewalls. Os funcionários em home office usam um cliente VPN para acessar os sistemas internos.

### Exercício

Qual a diferença entre VPN site-to-site e VPN de acesso remoto?

<details><summary>Resposta</summary>

A site-to-site conecta redes inteiras de forma permanente, entre gateways (roteadores/firewalls), sem software nos computadores. A de acesso remoto conecta um usuário individual à rede, usando um cliente VPN no dispositivo.

</details>

### Desafio

Desenhe o encapsulamento de um pacote 10.1.1.10 → 10.2.2.20 atravessando um túnel IPsec entre 203.0.113.1 e 198.51.100.1. Quais IPs aparecem na Internet?

## Aula 2 — Protocolos: IPsec, SSL/TLS, WireGuard e OpenVPN

**Palavras-chave:** IPsec, IKE, ESP, AH, WireGuard, OpenVPN, SSL VPN, PPTP, Zero Trust

### Introdução

Existem diversos protocolos de VPN, com diferentes equilíbrios entre segurança, desempenho, compatibilidade e facilidade de configuração.

### Por que isso importa

Escolher um protocolo obsoleto (como PPTP) expõe a empresa. Escolher bem garante desempenho e compatibilidade com firewalls e NAT.

### Explicação

O IPsec opera na camada 3 e é composto pelo IKE (negocia chaves, UDP 500/4500), pelo ESP (cifra e autentica os dados) e pelo AH (só autentica, quase não usado). O WireGuard é moderno, com código pequeno e criptografia fixa de última geração. VPNs SSL/TLS usam o mesmo TLS do HTTPS.

### Conteúdo

#### Comparativo de protocolos

| Protocolo | Camada / transporte | Pontos fortes | Atenção |
| --- | --- | --- | --- |
| IPsec (IKEv2) | Camada 3; UDP 500/4500, ESP | Padrão de mercado, site-to-site entre fabricantes | Configuração complexa |
| SSL/TLS VPN | TLS sobre TCP/UDP 443 | Atravessa quase qualquer firewall | Soluções proprietárias variam |
| OpenVPN | TLS; UDP 1194 (padrão) ou TCP | Código aberto, flexível, maduro | Desempenho menor que WireGuard |
| WireGuard | UDP (51820 comum) | Simples, rápido, criptografia moderna | Gestão de chaves manual em ambientes grandes |
| L2TP/IPsec | L2TP dentro de IPsec | Suporte nativo antigo | Legado |
| PPTP | TCP 1723 + GRE | — | Inseguro: não use |

#### Fases do IPsec com IKE

1. IKE fase 1: os gateways se autenticam (chave pré-compartilhada ou certificados) e criam um canal seguro de controle.
2. IKE fase 2: negociam as SAs (associações de segurança) do ESP: algoritmos, chaves e quais redes passam pelo túnel.
3. Tráfego "interessante" (definido pelas redes de origem/destino) é cifrado com ESP.
4. As chaves são renovadas periodicamente (rekey).

#### Configuração WireGuard (servidor)

Gere as chaves com: wg genkey | tee privada | wg pubkey > publica. Suba a interface com wg-quick up wg0.

```
# /etc/wireguard/wg0.conf
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = <chave-privada-do-servidor>

[Peer]
# notebook da Ana
PublicKey = <chave-publica-do-cliente>
AllowedIPs = 10.8.0.2/32
```

#### VPN e Zero Trust

A VPN tradicional confia em quem está "dentro" da rede. O modelo Zero Trust parte do princípio de "nunca confiar, sempre verificar": cada acesso a cada aplicação é autenticado e autorizado conforme identidade, dispositivo e contexto (ZTNA). Muitas empresas combinam VPN para casos específicos com ZTNA para aplicações.

### Contexto real

Firewalls corporativos fazem site-to-site com IPsec; o acesso remoto costuma usar SSL VPN ou WireGuard, que atravessam NAT facilmente.

### Exercício

Quais portas devem ser liberadas no firewall para uma VPN IPsec com NAT-T?

<details><summary>Resposta</summary>

UDP 500 (IKE) e UDP 4500 (IKE/ESP com NAT-Traversal). Sem NAT-T, também o protocolo IP 50 (ESP).

</details>

### Desafio

Monte um servidor WireGuard em uma VM e conecte seu celular a ele. Verifique o IP público visto pelos sites antes e depois.

## Comandos úteis

**WireGuard** (Linux/macOS)

```
wg genkey | tee privada | wg pubkey > publica
sudo wg-quick up wg0
sudo wg show
```

**Verificar túneis IPsec** (Cisco IOS)

```
show crypto isakmp sa
show crypto ipsec sa
show crypto session
```

**Ver rotas e interfaces da VPN** (Windows)

```
route print
Get-VpnConnection
ipconfig /all
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Redes com o mesmo endereçamento nos dois lados do túnel (ex.: 192.168.0.0/24). | Planeje sub-redes únicas por site ou use NAT no túnel. |
| Túnel sobe, mas o tráfego não passa. | Verifique se as redes "interessantes" (ACL/AllowedIPs) e as rotas estão corretas nos dois lados. |
| Páginas que não carregam pela VPN. | Ajuste o MTU/MSS: o encapsulamento reduz o tamanho útil do pacote. |

## Segurança

- Use IKEv2, WireGuard ou OpenVPN/TLS atualizados; abandone PPTP e L2TP sem IPsec.
- Exija MFA no acesso remoto e mantenha o concentrador VPN sempre atualizado — ele é alvo frequente de ataques.
- VPN comercial não torna ninguém anônimo: ela apenas transfere a confiança do seu provedor para o provedor de VPN.
- Aplique menor privilégio: usuários da VPN não devem ter acesso a toda a rede interna.

## Pontos-chave

- VPN = túnel cifrado sobre rede não confiável.
- Site-to-site (redes) × acesso remoto (usuários).
- IPsec: IKE negocia, ESP cifra; NAT-T usa UDP 4500.
- WireGuard: moderno, simples e rápido.
- PPTP é inseguro; Zero Trust complementa a VPN.

## Laboratório: Sua própria VPN com WireGuard

**Objetivo:** Criar um túnel de acesso remoto e verificar o encapsulamento.

**Ferramentas:** Uma VM Linux (servidor) e um cliente WireGuard (PC ou celular).

1. Instale o WireGuard no servidor e gere as chaves.
2. Configure wg0 com 10.8.0.1/24 e libere UDP 51820 no firewall.
3. Configure o cliente com 10.8.0.2/32 e AllowedIPs da rede desejada.
4. Conecte e teste ping 10.8.0.1; observe no Wireshark que só aparece tráfego UDP cifrado.

**Resultado esperado:** Túnel ativo (wg show exibe handshake recente) e tráfego interno invisível na captura.

## Quiz

Gabarito em [../quizzes/19-vpn.md](../quizzes/19-vpn.md).

## Leituras recomendadas

- RFC 4301 — Security Architecture for IP (IPsec)
- RFC 7296 — IKEv2
- WireGuard — whitepaper (wireguard.com/papers)
- NIST SP 800-207 — Zero Trust Architecture
