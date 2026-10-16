<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 9 — DNS

**Nível:** Intermediário · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/dns`

> Hierarquia de nomes, resolução recursiva e iterativa, tipos de registro, TTL e cache, DoH/DoT, DNSSEC e ataques.

**Objetivo:** Explicar como nomes de domínio são traduzidos em endereços IP, interpretar registros DNS e diagnosticar falhas de resolução.

O DNS é a "agenda telefônica" distribuída da Internet. Uma consulta percorre a raiz, o TLD e o servidor autoritativo, e o resultado fica em cache pelo tempo definido no TTL.

## Objetivos de aprendizagem

- Descrever a hierarquia do DNS e o processo de resolução.
- Diferenciar consulta recursiva e iterativa, servidor recursivo e autoritativo.
- Interpretar e criar os principais tipos de registro.
- Diagnosticar problemas de DNS com nslookup e dig.
- Reconhecer ataques ao DNS e suas mitigações.

## Aula 1 — Hierarquia e resolução DNS

**Palavras-chave:** DNS, resolvedor, raiz, TLD, autoritativo, recursivo, iterativo

### Introdução

O DNS (Domain Name System) traduz nomes fáceis de lembrar, como www.example.com, em endereços IP. Ele é um banco de dados hierárquico e distribuído por milhares de servidores no mundo.

### Por que isso importa

Quase toda comunicação começa com uma consulta DNS. Se o DNS falha, para o usuário "a Internet caiu", mesmo com a conectividade perfeita.

### Explicação

A árvore do DNS começa na raiz (.), passa pelos TLDs (.com, .br, .org) e chega aos domínios (example.com) e subdomínios (www.example.com). Cada nível só sabe "quem cuida" do nível abaixo.

### Conteúdo

#### Hierarquia de nomes

```
                    . (raiz)
          ┌─────────┼─────────┐
        com        br        org        ← TLDs
         │          │
     example      com.br                ← domínios
         │          │
        www       empresa               ← subdomínios / hosts
```

#### Resolução passo a passo

Do cliente para o resolvedor a consulta é recursiva ("me traga a resposta final"); do resolvedor para os demais servidores, é iterativa ("me diga a quem perguntar").

1. O navegador verifica seu cache; depois o sistema operacional verifica o cache e o arquivo hosts.
2. O SO pergunta ao resolvedor recursivo configurado (via DHCP ou manualmente).
3. O resolvedor pergunta a um servidor raiz: "quem cuida de .com?" — recebe uma indicação (referral).
4. Pergunta ao servidor do TLD .com: "quem cuida de example.com?" — recebe outra indicação.
5. Pergunta ao servidor autoritativo de example.com: "qual o IP de www?" — recebe a resposta.
6. O resolvedor devolve a resposta ao cliente e guarda em cache pelo TTL.

#### Transporte do DNS

- UDP porta 53: a maioria das consultas.
- TCP porta 53: respostas grandes e transferência de zona (AXFR).
- DoT (DNS over TLS): porta 853, criptografado.
- DoH (DNS over HTTPS): porta 443, criptografado e indistinguível de tráfego web.

### Contexto real

Quando você acessa www.example.com pela primeira vez, seu resolvedor (do provedor, ou públicos como 1.1.1.1 e 8.8.8.8) consulta a raiz, depois os servidores do .com e por fim o servidor autoritativo do example.com.

### Exercício

Qual a diferença entre um servidor DNS recursivo e um autoritativo?

<details><summary>Resposta</summary>

O recursivo (resolvedor) faz todo o trabalho de busca em nome do cliente e guarda cache. O autoritativo detém os registros oficiais de uma zona e responde apenas por ela.

</details>

### Desafio

Use dig +trace www.example.com e identifique os servidores da raiz, do TLD e o autoritativo na saída.

## Aula 2 — Registros, cache e segurança do DNS

**Palavras-chave:** registro A, AAAA, CNAME, MX, TXT, TTL, cache, DNSSEC

### Introdução

Cada zona DNS é composta de registros (resource records), cada um com nome, tipo, TTL e valor. O cache, controlado pelo TTL, torna o DNS rápido e escalável.

### Por que isso importa

Configurar um site, um e-mail ou validar um domínio em serviços de nuvem exige criar os registros corretos. E entender o TTL evita surpresas durante migrações.

### Explicação

O TTL diz por quantos segundos uma resposta pode ficar em cache. TTL alto = menos consultas e mais rapidez, mas mudanças demoram a propagar. Antes de uma migração, reduza o TTL com antecedência.

### Conteúdo

#### Tipos de registro

| Tipo | Função | Exemplo |
| --- | --- | --- |
| A | Nome → IPv4 | www  IN A  93.184.215.14 |
| AAAA | Nome → IPv6 | www  IN AAAA  2606:2800:21f:cb07:6820:80da:af6b:8b2c |
| CNAME | Apelido para outro nome | blog  IN CNAME  www.example.com. |
| MX | Servidor de e-mail do domínio (com prioridade) | @  IN MX 10 mail.example.com. |
| NS | Servidores autoritativos da zona | @  IN NS  ns1.example.com. |
| TXT | Texto livre: SPF, DKIM, DMARC, verificações | @  IN TXT "v=spf1 include:_spf.example.com ~all" |
| PTR | IP → nome (DNS reverso) | 14.215.184.93.in-addr.arpa  IN PTR  www.example.com. |
| SOA | Dados da zona: serial, tempos, e-mail do responsável | Um por zona |
| SRV | Localização de serviços (host e porta) | _sip._tcp  IN SRV 10 5 5060 sip.example.com. |
| CAA | Quais autoridades podem emitir certificados | @  IN CAA 0 issue "letsencrypt.org" |

#### Arquivo hosts

Antes de consultar o DNS, o sistema consulta o arquivo hosts (C:\Windows\System32\drivers\etc\hosts ou /etc/hosts). Ele é útil para testes, mas também é alvo de malwares que redirecionam sites.

#### Ataques e proteções

| Ameaça | Descrição | Mitigação |
| --- | --- | --- |
| Cache poisoning | Injetar respostas falsas no cache do resolvedor | DNSSEC, portas de origem aleatórias |
| Spoofing / sequestro | Responder no lugar do servidor legítimo ou alterar o DNS do roteador | DoH/DoT, senha forte no roteador |
| Amplificação | Usar resolvedores abertos para DDoS | Não deixar resolvedores abertos à Internet |
| Tunelamento | Exfiltrar dados codificados em consultas DNS | Monitorar volume e tamanho das consultas |
| Typosquatting | Registrar domínios parecidos (exemp1e.com) | Conscientização, filtros de DNS |

### Contexto real

Para ativar o e-mail corporativo de um domínio, você cria registros MX apontando para o provedor de e-mail e registros TXT com SPF, DKIM e DMARC para evitar que suas mensagens caiam no spam.

### Exercício

Qual registro DNS aponta um nome para um endereço IPv6?

<details><summary>Resposta</summary>

O registro AAAA (o registro A aponta para IPv4).

</details>

### Desafio

Consulte os registros MX e TXT de um domínio conhecido com nslookup ou dig e explique o que cada um indica.

## Comandos úteis

**Consultas básicas** (Windows)

```
nslookup example.com
nslookup -type=MX example.com
ipconfig /displaydns     # ver cache local
ipconfig /flushdns       # limpar cache local
```

**Consultas detalhadas** (Linux/macOS)

```
dig example.com
dig example.com MX +short
dig @1.1.1.1 example.com AAAA
dig +trace www.example.com
dig -x 8.8.8.8           # reverso
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Alterar um registro e ele "não propagar". | Os caches respeitam o TTL antigo; reduza o TTL dias antes da mudança. |
| Criar CNAME no domínio raiz (@). | Pela norma, o apex não pode ter CNAME; use A/AAAA ou recursos como ALIAS/flattening do provedor. |
| Site abre por IP mas não por nome. | Teste nslookup; verifique o DNS configurado na placa e o arquivo hosts. |

## Segurança

- Use resolvedores confiáveis e, quando possível, DoH/DoT.
- Habilite DNSSEC nos seus domínios e ative bloqueio de transferência de zona para IPs não autorizados.
- Configure SPF, DKIM e DMARC para evitar falsificação de e-mails do seu domínio.
- Proteja o painel do registrador com MFA: sequestrar o DNS é sequestrar o site.

## Pontos-chave

- Hierarquia: raiz → TLD → domínio → subdomínio.
- Cliente → resolvedor: recursiva; resolvedor → servidores: iterativa.
- A/AAAA, CNAME, MX, NS, TXT, PTR, SOA, SRV.
- TTL controla o cache: reduza antes de migrações.
- DNSSEC = autenticidade; DoH/DoT = privacidade.

## Laboratório: Explorando o DNS com dig e nslookup

**Objetivo:** Ver a hierarquia e os registros reais de um domínio.

**Ferramentas:** dig (Linux/macOS) ou nslookup (Windows).

1. Rode dig +trace www.example.com e identifique raiz, TLD e autoritativo.
2. Consulte os registros A, AAAA, MX, NS e TXT de um domínio conhecido.
3. Repita uma consulta e observe o TTL diminuindo (resposta vinda do cache).
4. Compare as respostas de 1.1.1.1 e 8.8.8.8.

**Resultado esperado:** Entender que a resposta final vem do autoritativo e que o resolvedor reaproveita o cache até o TTL expirar.

## Quiz

Gabarito em [../quizzes/09-dns.md](../quizzes/09-dns.md).

## Leituras recomendadas

- RFC 1034 e RFC 1035 — Domain Names
- RFC 8484 — DNS over HTTPS
- RFC 7858 — DNS over TLS
- RFC 4033 — DNSSEC
