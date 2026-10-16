<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 20 — Desafio Final

**Nível:** Projeto · **Aulas:** 2 · **Questões:** 20 · **No site:** `/aulas/desafio-final`

> Projeto integrador: rede completa de uma empresa com matriz e filial — VLSM, VLANs, inter-VLAN, DHCP, DNS, NAT, firewall, VPN e SSH — mais a prova final.

**Objetivo:** Aplicar todos os conceitos do curso para projetar, configurar, testar e documentar a rede de uma empresa real.

Você é o analista de redes da NetLearn Ltda. Sua missão é entregar a rede da matriz e da filial funcionando, segura e documentada — e depois provar seu conhecimento na prova final de 20 questões.

## Objetivos de aprendizagem

- Projetar um plano de endereçamento completo com VLSM.
- Implementar VLANs, trunks e roteamento inter-VLAN.
- Configurar DHCP, DNS, NAT/PAT e publicação de serviço.
- Aplicar ACLs de acordo com uma política de segurança.
- Interligar matriz e filial com VPN IPsec e gerenciar tudo por SSH.
- Testar, documentar e justificar as decisões de projeto.

## Aula 1 — Enunciado e requisitos

**Palavras-chave:** projeto, VLSM, VLAN, inter-VLAN, DHCP, DNS, NAT, ACL, VPN, SSH

### Introdução

A NetLearn Ltda. está inaugurando sua matriz e uma filial. A matriz tem os setores Vendas, TI e RH, uma sala de servidores e Wi-Fi para visitantes. A filial tem uma equipe comercial. Você recebeu o bloco 10.10.0.0/23 para a matriz e 10.10.2.0/27 para a filial.

### Por que isso importa

Projetos reais exigem combinar tudo: endereçamento, switching, roteamento, serviços e segurança. É exatamente o tipo de tarefa cobrado em entrevistas técnicas e certificações.

### Explicação

Trabalhe em etapas, testando cada uma antes de seguir: (1) endereçamento, (2) VLANs e trunks, (3) roteamento inter-VLAN, (4) DHCP e DNS, (5) NAT e acesso à Internet, (6) firewall/ACLs, (7) VPN com a filial, (8) gerência via SSH, (9) testes e documentação.

### Conteúdo

#### Topologia

```
                     Internet (ISP)
            203.0.113.1/30        198.51.100.1/30
                 │                       │
   203.0.113.2  R1-MATRIZ ══ VPN IPsec ══ R2-FILIAL  198.51.100.2
                 │ trunk (subinterfaces)      │
               SW-CORE ─── SW-ACESSO        SW-FILIAL
          (VLANs 10,20,30,40,50,99)         (LAN 10.10.2.0/27)
     Vendas · TI · RH · Visitantes · Servidores
```

#### Requisitos

1. R1 — Endereçamento com VLSM a partir de 10.10.0.0/23, sem sobreposição, para: Vendas 100 hosts, Visitantes 100, TI 50, RH 20, Servidores 10 e Gerência 10.
2. R2 — Uma VLAN por setor (10 Vendas, 20 TI, 30 RH, 40 Visitantes, 50 Servidores, 99 Gerência), VLAN nativa 999 sem uso e portas não utilizadas desativadas.
3. R3 — Roteamento entre VLANs no R1 (router-on-a-stick) ou no SW-CORE (SVIs).
4. R4 — DHCP para Vendas, TI, RH, Visitantes e Filial, excluindo gateways e IPs fixos.
5. R5 — Servidor DNS interno (10.10.1.98) resolvendo intranet.netlearn.local para o servidor web 10.10.1.99.
6. R6 — Acesso à Internet para todas as VLANs via PAT na interface WAN do R1.
7. R7 — Servidor web publicado na Internet via NAT estático na porta 443.
8. R8 — ACLs: Visitantes só acessam a Internet (nada interno); somente TI acessa a VLAN de Gerência; RH não é acessível por Vendas.
9. R9 — VPN site-to-site IPsec entre R1 e R2 para as redes da matriz e 10.10.2.0/27.
10. R10 — Gerência de todos os equipamentos apenas por SSH v2, com usuário local, a partir da VLAN de TI.

#### Rubrica de avaliação (100 pontos)

| Critério | Pontos | Como verificar |
| --- | --- | --- |
| Plano de endereçamento correto (VLSM, sem sobreposição) | 15 | Tabela entregue |
| VLANs, trunks e segurança de portas | 10 | show vlan brief, show interfaces trunk |
| Roteamento inter-VLAN | 10 | ping entre VLANs permitidas |
| DHCP funcionando em todas as redes de usuários | 10 | PCs recebem IP correto |
| DNS interno | 5 | nslookup intranet.netlearn.local |
| PAT e NAT estático | 10 | show ip nat translations |
| ACLs conforme requisito R8 | 15 | Testes positivos e negativos |
| VPN site-to-site | 15 | ping matriz ↔ filial; show crypto ipsec sa |
| Gerência por SSH | 5 | Telnet recusado, SSH aceito |
| Documentação (diagrama, tabela, evidências) | 5 | Relatório |

### Contexto real

Este cenário reproduz, em escala reduzida, a rede de uma pequena empresa: segmentação por setor, serviços centralizados, publicação de um site e interligação de filial via Internet.

### Exercício

Antes de configurar qualquer equipamento, qual é o primeiro artefato que você deve produzir?

<details><summary>Resposta</summary>

O plano de endereçamento (tabela de VLANs, sub-redes, gateways e IPs fixos) junto com o diagrama da topologia. Todas as configurações dependem dele.

</details>

### Desafio

Entregue a rede completa funcionando no Packet Tracer (ou GNS3/EVE-NG) atendendo a todos os requisitos e acompanhada da documentação.

## Aula 2 — Verificação, dicas e solução de referência

**Palavras-chave:** checklist, testes, troubleshooting, documentação, solução

### Introdução

Um projeto só está pronto quando foi testado. Use o checklist abaixo para validar cada requisito, consulte as dicas apenas se travar e compare seu resultado com a solução de referência no final.

### Por que isso importa

Testes negativos (o que deve ser bloqueado continua bloqueado) são tão importantes quanto os positivos: uma ACL que "funciona" porque libera tudo é uma falha de segurança.

### Explicação

Teste de baixo para cima: interfaces e VLANs, depois IP e gateway, roteamento, serviços (DHCP/DNS), NAT, ACLs e por fim a VPN. Quando algo falhar, volte uma camada.

### Conteúdo

#### Checklist de verificação

- PCs de cada VLAN recebem IP da sub-rede correta (ipconfig).
- Ping do PC de Vendas para o gateway da VLAN 10.
- Ping de TI para Vendas e RH (permitido).
- Ping de Vendas para RH (deve falhar).
- Ping de Visitantes para 10.10.1.99 (deve falhar) e para o "servidor da Internet" (deve funcionar).
- nslookup intranet.netlearn.local retorna 10.10.1.99.
- Navegador de um PC interno abre https://intranet.netlearn.local.
- Host da Internet acessa 203.0.113.2:443 (NAT estático).
- show ip nat translations exibe várias traduções PAT.
- Ping de um PC da filial para um PC de TI na matriz (via VPN).
- show crypto ipsec sa com contadores encaps/decaps aumentando.
- SSH para o SW-CORE a partir de TI funciona; a partir de Vendas falha; Telnet sempre falha.

#### Dica 1 — Plano de endereçamento (conteúdo oculto no site)

Ordene da maior para a menor rede: Vendas (/25), Visitantes (/25), TI (/26), RH (/27), Servidores (/28), Gerência (/28). Comece em 10.10.0.0 e aloque cada bloco no próximo múltiplo do seu tamanho.

#### Dica 2 — ACLs (conteúdo oculto no site)

Aplique ACLs estendidas na ENTRADA da interface da VLAN de origem. Para Visitantes: deny ip 10.10.0.128 0.0.0.127 10.10.0.0 0.0.255.255 seguido de permit ip any any. Lembre do deny implícito no final. Como o DNS interno ficará inacessível para Visitantes, entregue um DNS público (ex.: 8.8.8.8) no pool DHCP dessa VLAN.

#### Dica 3 — VPN e NAT (conteúdo oculto no site)

O tráfego matriz → filial não pode ser traduzido pelo PAT, senão não casa com a ACL "interessante" da VPN. Na ACL do NAT, negue primeiro o tráfego 10.10.0.0/23 → 10.10.2.0/27 e só então permita o restante.

#### Solução de referência — endereçamento (conteúdo oculto no site)

| VLAN / Rede | Sub-rede | Gateway | Faixa DHCP / IPs fixos | Broadcast |
| --- | --- | --- | --- | --- |
| 10 Vendas | 10.10.0.0/25 | 10.10.0.1 | .11 – .126 | 10.10.0.127 |
| 40 Visitantes | 10.10.0.128/25 | 10.10.0.129 | .139 – .254 | 10.10.0.255 |
| 20 TI | 10.10.1.0/26 | 10.10.1.1 | .11 – .62 | 10.10.1.63 |
| 30 RH | 10.10.1.64/27 | 10.10.1.65 | .75 – .94 | 10.10.1.95 |
| 50 Servidores | 10.10.1.96/28 | 10.10.1.97 | DNS .98, Web .99 (fixos) | 10.10.1.111 |
| 99 Gerência | 10.10.1.112/28 | 10.10.1.113 | SW-CORE .114, SW-ACESSO .115 | 10.10.1.127 |
| Filial | 10.10.2.0/27 | 10.10.2.1 | .11 – .30 | 10.10.2.31 |
| WAN Matriz | 203.0.113.0/30 | 203.0.113.1 (ISP) | R1 = .2 | 203.0.113.3 |
| WAN Filial | 198.51.100.0/30 | 198.51.100.1 (ISP) | R2 = .2 | 198.51.100.3 |

#### Solução de referência — trechos de configuração do R1 (conteúdo oculto no site)

```
interface g0/0.10
 encapsulation dot1Q 10
 ip address 10.10.0.1 255.255.255.128
 ip nat inside
interface g0/0.40
 encapsulation dot1Q 40
 ip address 10.10.0.129 255.255.255.128
 ip nat inside
 ip access-group VISITANTES in
!
ip dhcp excluded-address 10.10.0.1 10.10.0.10
ip dhcp pool VENDAS
 network 10.10.0.0 255.255.255.128
 default-router 10.10.0.1
 dns-server 10.10.1.98
!
ip access-list extended VISITANTES
 deny   ip 10.10.0.128 0.0.0.127 10.10.0.0 0.0.255.255
 permit ip any any
!
ip access-list extended NAT
 deny   ip 10.10.0.0 0.0.1.255 10.10.2.0 0.0.0.31
 permit ip 10.10.0.0 0.0.1.255 any
ip nat inside source list NAT interface g0/1 overload
ip nat inside source static tcp 10.10.1.99 443 203.0.113.2 443
!
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
crypto isakmp key ChaveForte! address 198.51.100.2
crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac
ip access-list extended VPN-FILIAL
 permit ip 10.10.0.0 0.0.1.255 10.10.2.0 0.0.0.31
crypto map VPN 10 ipsec-isakmp
 set peer 198.51.100.2
 set transform-set TS
 match address VPN-FILIAL
interface g0/1
 ip address 203.0.113.2 255.255.255.252
 ip nat outside
 crypto map VPN
ip route 0.0.0.0 0.0.0.0 203.0.113.1
```

### Contexto real

Em projetos reais, essa etapa vira o "relatório de aceite": a lista de testes executados, com evidências, que o cliente assina antes de a rede entrar em produção.

### Exercício

Um PC da VLAN de Visitantes consegue pingar o servidor 10.10.1.99. Qual requisito está sendo violado e onde você corrigiria?

<details><summary>Resposta</summary>

O R8: visitantes não podem acessar nada interno. Corrija com uma ACL estendida aplicada na entrada da subinterface/SVI da VLAN 40, negando destinos 10.10.0.0/16 (redes internas) e permitindo o restante.

</details>

### Desafio

Escreva o relatório de aceite com pelo menos 15 testes (positivos e negativos), o comando usado e o resultado obtido.

## Comandos úteis

**Comandos de verificação mais usados** (Cisco IOS)

```
show ip interface brief
show vlan brief
show interfaces trunk
show ip route
show ip dhcp binding
show ip nat translations
show access-lists
show crypto ipsec sa
show ip ssh
```

**Testes a partir dos PCs** (Windows)

```
ipconfig /all
ping 10.10.0.1
nslookup intranet.netlearn.local
tracert 10.10.2.11
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Configurar tudo de uma vez e não saber onde está o erro. | Valide cada etapa antes de avançar. |
| VPN não sobe porque o tráfego está sendo traduzido pelo PAT. | Exclua o tráfego matriz↔filial da ACL do NAT. |
| Esquecer o "permit ip any any" no final de ACLs de bloqueio pontual. | Lembre do deny implícito. |

## Segurança

- Revise o projeto com a mentalidade de um atacante: o que um visitante consegue alcançar?
- Senhas fortes e únicas, SSH apenas, VLAN de gerência isolada.
- Mantenha backup das configurações finais.

## Pontos-chave

- Planeje antes de configurar: diagrama + tabela de endereçamento.
- Configure e teste em etapas, de baixo para cima.
- Faça testes positivos e negativos.
- Documente tudo: é parte da entrega.

## Laboratório: Entrega do projeto NetLearn Ltda.

**Objetivo:** Montar, testar e documentar a rede completa.

**Ferramentas:** Cisco Packet Tracer (recomendado), GNS3 ou EVE-NG.

1. Desenhe a topologia e preencha a tabela de endereçamento.
2. Implemente os requisitos R1 a R10 em ordem, testando cada um.
3. Execute o checklist de verificação e registre as evidências.
4. Faça a prova final abaixo e revise os módulos das questões que errar.

**Resultado esperado:** Rede funcional atendendo aos 10 requisitos, relatório de aceite e nota igual ou superior a 70% na prova final.

## Prova final

Gabarito em [../quizzes/20-desafio-final.md](../quizzes/20-desafio-final.md).

## Leituras recomendadas

- Todos os módulos anteriores do NetLearn
- Cisco Packet Tracer — netacad.com
- Cisco CCNA 200-301 — tópicos do exame
