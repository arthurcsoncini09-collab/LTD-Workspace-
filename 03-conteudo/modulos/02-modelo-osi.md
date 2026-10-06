<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 2 — Modelo OSI

**Nível:** Básico · **Aulas:** 3 · **Questões:** 6 · **No site:** `/aulas/modelo-osi`

> As sete camadas, PDUs, encapsulamento e o uso do OSI para diagnosticar problemas de rede.

**Objetivo:** Entender a função de cada camada do modelo OSI, como os dados são encapsulados e como usar as camadas para fazer troubleshooting.

O modelo OSI organiza a comunicação em sete camadas independentes. Ele é a "língua comum" dos profissionais de redes para descrever onde algo acontece — e onde algo quebrou.

## Objetivos de aprendizagem

- Listar as sete camadas do OSI na ordem e a função de cada uma.
- Associar protocolos, PDUs e dispositivos às camadas corretas.
- Descrever o processo de encapsulamento e desencapsulamento.
- Aplicar o modelo OSI para isolar falhas de rede.

## Aula 1 — As sete camadas do OSI

**Palavras-chave:** OSI, camada, PDU, aplicação, transporte, rede, enlace, física

### Introdução

O modelo OSI (Open Systems Interconnection), publicado pela ISO em 1984, divide a comunicação em sete camadas. Cada camada presta serviços à camada de cima e usa os serviços da camada de baixo.

### Por que isso importa

Dividir o problema em camadas permite que fabricantes diferentes desenvolvam partes independentes (uma placa de rede não precisa saber nada sobre HTTP) e dá um vocabulário comum: "é um problema de camada 2" diz muito em poucas palavras.

### Explicação

Uma analogia: enviar uma encomenda. Você escreve a carta (aplicação), traduz para o idioma do destinatário (apresentação), combina a conversa (sessão), divide em volumes numerados (transporte), coloca o endereço da cidade de destino (rede), entrega à transportadora local (enlace) e o caminhão percorre a estrada (física).

### Conteúdo

#### As camadas em detalhe

| Nº | Camada | Função | PDU | Exemplos |
| --- | --- | --- | --- | --- |
| 7 | Aplicação | Interface com os serviços de rede do usuário | Dados | HTTP, DNS, SMTP, SSH, FTP |
| 6 | Apresentação | Formato, codificação, compressão e criptografia | Dados | TLS/SSL, JPEG, UTF-8, ASCII |
| 5 | Sessão | Abre, mantém e encerra diálogos entre aplicações | Dados | RPC, NetBIOS, sessões SQL |
| 4 | Transporte | Entrega fim a fim, portas, confiabilidade, controle de fluxo | Segmento (TCP) / Datagrama (UDP) | TCP, UDP |
| 3 | Rede | Endereçamento lógico e roteamento entre redes | Pacote | IPv4, IPv6, ICMP, OSPF |
| 2 | Enlace | Acesso ao meio, endereçamento físico, detecção de erros | Quadro (frame) | Ethernet, Wi-Fi (802.11), ARP, PPP |
| 1 | Física | Transmissão de bits como sinais elétricos, luz ou rádio | Bits | Cabos, conectores RJ-45, fibra, hubs |

#### Mnemônico para memorizar

De cima para baixo (7 → 1): "Aplicação, Apresentação, Sessão, Transporte, Rede, Enlace, Física". Uma frase popular em inglês, de baixo para cima, é "Please Do Not Throw Sausage Pizza Away" (Physical, Data link, Network, Transport, Session, Presentation, Application).

#### Dispositivos por camada

- Camada 1: hub, repetidor, cabos, transceptores, modems.
- Camada 2: switch, bridge, access point, placa de rede (NIC).
- Camada 3: roteador, switch L3.
- Camadas 4 a 7: firewalls de nova geração, balanceadores de carga, proxies, WAF.

### Contexto real

Quando você troca o Wi-Fi por um cabo, apenas as camadas 1 e 2 mudam. O navegador, o TCP e o IP continuam funcionando exatamente igual — esse é o poder da independência entre camadas.

### Exercício

Em qual camada o protocolo IP opera? E o TCP?

<details><summary>Resposta</summary>

O IP opera na camada 3 (Rede). O TCP opera na camada 4 (Transporte).

</details>

### Desafio

Relacione cada item à sua camada: HTTP, TCP, IP, endereço MAC, cabo de fibra, TLS, switch, roteador.

## Aula 2 — Encapsulamento e desencapsulamento

**Palavras-chave:** encapsulamento, cabeçalho, trailer, PDU, overhead, Wireshark

### Introdução

Quando um dado desce pela pilha no remetente, cada camada adiciona seu próprio cabeçalho (e a camada 2 também um trailer). No destinatário, o processo é inverso: cada camada lê e remove o cabeçalho que lhe pertence.

### Por que isso importa

Entender o encapsulamento explica por que um pacote tem vários endereços (porta, IP, MAC), por que existe overhead e como ferramentas como o Wireshark mostram as camadas separadamente.

### Explicação

É como uma boneca russa (matryoshka): a mensagem HTTP vai dentro de um segmento TCP, que vai dentro de um pacote IP, que vai dentro de um quadro Ethernet. Cada roteador no caminho abre só até a camada 3, lê o IP de destino, e coloca o pacote em um quadro novo para o próximo salto.

### Conteúdo

#### Encapsulamento passo a passo

1. Aplicação gera os dados (ex.: GET /index.html).
2. Transporte adiciona o cabeçalho TCP com portas de origem e destino → segmento.
3. Rede adiciona o cabeçalho IP com IPs de origem e destino → pacote.
4. Enlace adiciona cabeçalho Ethernet (MACs) e trailer FCS para detectar erros → quadro.
5. Física converte o quadro em bits e os transmite pelo meio.

#### Estrutura de um quadro

Com MTU padrão de 1500 bytes, sobram até 1460 bytes de dados por segmento TCP sobre IPv4 sem opções.

```
| Ethernet (14 B) | IP (20 B) | TCP (20 B) | Dados HTTP | FCS (4 B) |
   MAC dst/src       IP src/dst   portas        GET /...      checagem
```

#### Comunicação entre camadas pares

Cada camada "conversa" logicamente com a camada equivalente do outro lado: o TCP do cliente com o TCP do servidor, o HTTP do navegador com o HTTP do servidor. Fisicamente, porém, os dados sempre descem a pilha, atravessam o meio e sobem do outro lado.

### Contexto real

No Wireshark, ao clicar em um pacote HTTP, você vê exatamente as camadas empilhadas: Ethernet II → Internet Protocol → Transmission Control Protocol → Hypertext Transfer Protocol.

### Exercício

Quais endereços mudam a cada salto em uma rede roteada: os IPs ou os MACs?

<details><summary>Resposta</summary>

Os endereços MAC mudam a cada salto (cada enlace tem sua origem e destino de camada 2). Os IPs de origem e destino permanecem os mesmos do início ao fim (exceto quando há NAT).

</details>

### Desafio

Explique por que um switch não precisa abrir o cabeçalho IP para encaminhar um quadro, mas um roteador precisa.

## Aula 3 — Diagnóstico por camada

**Palavras-chave:** troubleshooting, bottom-up, top-down, diagnóstico, ping, nslookup

### Introdução

Em redes, o problema pode ocorrer em qualquer camada. Saber qual camada está afetada resolve boa parte do trabalho de troubleshooting.

### Por que isso importa

Um "a Internet não funciona" pode ser cabo solto, IP errado, gateway fora, DNS quebrado, firewall bloqueando ou o próprio site fora do ar. Testar por camadas evita chutes e economiza tempo.

### Explicação

Existem três abordagens clássicas: de baixo para cima (bottom-up), começando pelo cabo; de cima para baixo (top-down), começando pela aplicação; e dividir para conquistar, começando pela camada 3 com um ping e subindo ou descendo conforme o resultado.

### Conteúdo

#### Sintomas típicos por camada

| Camada | Sintoma | Teste |
| --- | --- | --- |
| 1 — Física | LED da porta apagado, "cabo desconectado" | Verificar cabo, porta, LEDs |
| 2 — Enlace | Sem endereço MAC do gateway na tabela ARP, VLAN errada | arp -a, show mac address-table |
| 3 — Rede | IP 169.254.x.x, gateway não responde | ipconfig, ping no gateway |
| 4 — Transporte | Conexão recusada ou expirando | Test-NetConnection / nc -zv host porta |
| 7 — Aplicação | Erro 404/500, nome não resolve | nslookup, curl -v |

#### Método dividir para conquistar

1. Faça ping no gateway padrão. Falhou? Desça: IP, VLAN, cabo.
2. Funcionou? Faça ping em um IP da Internet (8.8.8.8). Falhou? Problema de roteamento/NAT/firewall.
3. Funcionou? Teste o DNS (nslookup). Falhou? Problema de resolução de nomes.
4. Funcionou? Teste a aplicação (navegador, curl). Falhou? Porta bloqueada ou serviço fora do ar.

### Contexto real

Quando o site não carrega, um técnico verifica: o link está ativo (1)? Há IP válido (3)? O ping no gateway responde (3)? O DNS resolve o nome (7)? A porta 443 está acessível (4)?

### Exercício

O ping para 8.8.8.8 funciona, mas o navegador não abre "google.com". Qual a camada/serviço mais provável do problema?

<details><summary>Resposta</summary>

A conectividade IP (camada 3) está ok. O mais provável é falha na resolução de nomes (DNS, camada 7). Teste com nslookup google.com.

</details>

### Desafio

Monte um checklist de troubleshooting com um teste para cada camada, da física à aplicação.

## Comandos úteis

**Teste rápido de cada camada** (Windows)

```
ipconfig                 # camada 3: tenho IP?
ping 192.168.1.1         # camada 3: alcanço o gateway?
nslookup example.com     # camada 7: DNS resolve?
Test-NetConnection example.com -Port 443   # camada 4
```

**Teste rápido de cada camada** (Linux/macOS)

```
ip link                  # camada 1/2: interface UP?
ip route                 # camada 3: qual é o gateway?
ping -c 4 192.168.1.1
dig example.com
nc -zv example.com 443   # camada 4
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Confundir a camada de Sessão com a de Transporte. | Transporte entrega segmentos entre processos (portas); Sessão organiza o diálogo entre aplicações. |
| Achar que o modelo OSI é implementado "ao pé da letra" na Internet. | O OSI é um modelo de referência; a Internet usa a pilha TCP/IP, que agrupa camadas. |
| Começar o diagnóstico reinstalando a aplicação quando o cabo está solto. | Use um método sistemático (bottom-up ou dividir para conquistar). |

## Segurança

- Existem ataques em todas as camadas: grampo físico (1), ARP spoofing (2), IP spoofing (3), SYN flood (4), injeção SQL (7).
- Defesa em profundidade: aplique controles em várias camadas, não apenas um firewall de borda.
- TLS (camada 6/7) protege os dados mesmo que camadas inferiores sejam interceptadas.

## Pontos-chave

- Camadas: 7 Aplicação, 6 Apresentação, 5 Sessão, 4 Transporte, 3 Rede, 2 Enlace, 1 Física.
- PDUs: dados → segmento → pacote → quadro → bits.
- Cada camada adiciona seu cabeçalho; a camada 2 também adiciona trailer.
- MACs mudam a cada salto; IPs se mantêm fim a fim (sem NAT).
- Troubleshooting por camadas evita "chutes" e acelera o diagnóstico.

## Laboratório: Enxergando as camadas no Wireshark

**Objetivo:** Observar o encapsulamento real de uma requisição web.

**Ferramentas:** Wireshark e um navegador.

1. Inicie a captura na interface ativa.
2. Acesse http://example.com no navegador.
3. Aplique o filtro "http" e selecione o pacote GET.
4. No painel de detalhes, expanda Ethernet II, Internet Protocol, TCP e HTTP. Anote MACs, IPs e portas.

**Resultado esperado:** Identificar quatro cabeçalhos empilhados e relacionar cada um com sua camada OSI.

## Quiz

Gabarito em [../quizzes/02-modelo-osi.md](../quizzes/02-modelo-osi.md).

## Leituras recomendadas

- ISO/IEC 7498-1 — Modelo de Referência OSI
- Cisco Networking Academy — CCNA ITN, módulo 3
- Documentação do Wireshark (wireshark.org/docs)
