# Prompt — Auditoria, Correção e Enriquecimento do Site de Redes

> Como usar: abra o Claude Code **na pasta do projeto do site** (na máquina onde `http://localhost:3001` roda) e cole o prompt abaixo inteiro. Ele foi escrito para funcionar em qualquer stack (React/Next, Vue, HTML puro, etc.).

---

## PROMPT

Você é um engenheiro front-end sênior e também instrutor de redes de computadores (nível CCNA/Network+). Este projeto é uma plataforma de ensino de redes que roda em `http://localhost:3001`, organizada em módulos. Sua missão tem **duas fases**. Execute-as na ordem e não pule etapas.

### FASE 1 — Auditoria e correção de funcionalidades

1. **Entenda o projeto**: leia `package.json`, a estrutura de pastas, as rotas e onde o conteúdo dos módulos é definido (componentes, JSON, Markdown, banco de dados…). Descubra o comando para rodar o projeto e suba o servidor de desenvolvimento.
2. **Teste o site como um aluno**, de preferência com Playwright (navegador headless), e anote cada problema com: onde ocorre, passos para reproduzir, comportamento esperado e comportamento atual. Verifique pelo menos:
   - Navegação: todos os links do menu/sidebar abrem o módulo certo; botões "Anterior/Próximo"; rotas diretas (F5 numa página interna não pode dar 404); página 404 amigável.
   - Progresso: marcar módulo/aula como concluído, barra de progresso, persistência após recarregar (localStorage/API), desbloqueio de módulos em sequência (se existir).
   - Quizzes/exercícios: correção das respostas certas e erradas, pontuação, feedback, botão de refazer, nenhuma pergunta com gabarito errado.
   - Busca, filtros, tema claro/escuro, login/cadastro (se existirem).
   - Console do navegador sem erros nem warnings de React (keys, hooks, hydration); nenhuma requisição de rede falhando (4xx/5xx).
   - Responsividade em 375px, 768px e 1280px, sem rolagem horizontal; menu mobile funcionando.
   - Acessibilidade básica: `alt` em imagens, contraste, foco visível, navegação por teclado, `label` em inputs.
   - Desempenho: imagens sem otimização, bundles grandes, re-renderizações desnecessárias, dados carregados repetidas vezes.
3. **Corrija** cada problema na causa raiz, com mudanças mínimas e no estilo do código existente. Não reescreva o projeto e não troque de framework.
4. **Valide**: rode lint, typecheck, testes e build (os que existirem) e repita os testes do passo 2. Tudo precisa passar.
5. Entregue uma **tabela-resumo**: problema → causa → correção → arquivo(s).

### FASE 2 — Enriquecimento do conteúdo dos módulos

Amplie o conteúdo de cada módulo **mantendo o formato de dados e os componentes que o site já usa** (se o conteúdo está em JSON, continue em JSON; se em MDX, continue em MDX). Se faltar um componente necessário (ex.: tabela, bloco de código, callout, quiz), crie-o reutilizável e no mesmo padrão visual.

**Todo módulo deve ter esta estrutura padrão:**

1. **Objetivos de aprendizagem** (3–5 itens, começando com verbos: "Explicar…", "Configurar…", "Diferenciar…").
2. **Introdução**: por que o assunto importa, com uma analogia do dia a dia.
3. **Conceitos fundamentais**: explicação em seções curtas, com termos-chave em destaque.
4. **Diagrama ou ilustração** (SVG inline ou componente) do mecanismo principal.
5. **Tabela de referência rápida** (cabeçalhos, campos, portas, comparações).
6. **Exemplo prático / passo a passo** com valores reais.
7. **Comandos úteis** em blocos de código, com saída de exemplo: Windows (`cmd`/PowerShell), Linux e Cisco IOS quando fizer sentido.
8. **Erros comuns e troubleshooting**.
9. **Segurança**: riscos e boas práticas ligados ao tema.
10. **Resumo** em tópicos ("Pontos-chave").
11. **Quiz** com 5–8 questões (múltipla escolha e verdadeiro/falso), cada uma com explicação da resposta.
12. **Laboratório/desafio prático** (Packet Tracer, GNS3, Wireshark ou terminal), com objetivo, passos e resultado esperado.
13. **Glossário** do módulo e **leituras recomendadas** (RFCs e documentação oficial).

**Conteúdo mínimo obrigatório por módulo:**

1. **Introdução às Redes**: o que é uma rede; histórico (ARPANET → Internet); tipos (PAN, LAN, MAN, WAN, WLAN, SAN); topologias (barramento, anel, estrela, malha, híbrida) com vantagens e desvantagens; modelos cliente-servidor e P2P; meios de transmissão (par trançado Cat5e/6/6a, fibra mono/multimodo, wireless); dispositivos (hub, switch, roteador, AP, modem, firewall); largura de banda, throughput, latência, jitter; unidades bit/byte, Mbps vs MB/s; padrões e órgãos (IEEE, IETF, RFCs).
2. **Modelo OSI**: as 7 camadas com função, PDU (dados, segmento, pacote, quadro, bits), protocolos e dispositivos de cada uma; encapsulamento e desencapsulamento passo a passo; mnemônico para memorizar; comparação com o TCP/IP; uso do OSI para troubleshooting (de baixo para cima e de cima para baixo).
3. **TCP/IP**: as 4 camadas (e o modelo de 5), mapeamento com o OSI, principais protocolos por camada, história e RFCs, caminho completo de uma requisição web pela pilha.
4. **IPv4**: estrutura de 32 bits, notação decimal pontuada, conversão binário↔decimal com exercícios; classes A–E (histórico); endereços privados (RFC 1918), loopback, APIPA (169.254/16), broadcast, rede, multicast; máscara e prefixo CIDR; unicast/broadcast/multicast; cabeçalho IPv4 (TTL, protocolo, fragmentação, checksum); esgotamento do IPv4 e introdução ao IPv6.
5. **Subnetting**: por que dividir redes; cálculo de rede, broadcast, primeiro/último host e nº de hosts (2ⁿ−2); método do "número mágico"; tabela de /8 a /30 (e /31, /32); VLSM com exemplo completo; sumarização de rotas; pelo menos 10 exercícios resolvidos com gabarito; erros clássicos.
6. **MAC e ARP**: formato do endereço MAC (48 bits, OUI); unicast/broadcast/multicast na camada 2; quadro Ethernet; funcionamento do ARP (request em broadcast, reply em unicast), tabela ARP, ARP gratuito, Proxy ARP; comandos `arp -a`, `ip neigh`; ARP spoofing/poisoning e defesas (DAI, ARP estático).
7. **TCP e UDP**: diferenças em tabela; cabeçalhos; three-way handshake e four-way teardown com diagrama; números de sequência e ACK; janela deslizante, controle de fluxo e de congestionamento; retransmissão; quando usar cada um (streaming, DNS, jogos, VoIP, web); QUIC como evolução.
8. **Portas de Rede**: o que é porta e socket; faixas (well-known 0–1023, registradas, dinâmicas); tabela das principais portas (20/21, 22, 23, 25, 53, 67/68, 80, 110, 143, 443, 445, 3306, 3389…) com protocolo TCP/UDP; `netstat`, `ss`, `nmap` (uso ético); estados das portas (aberta, fechada, filtrada); riscos de portas expostas.
9. **DNS**: hierarquia (raiz, TLD, autoritativo); resolução recursiva vs iterativa, passo a passo; tipos de registro (A, AAAA, CNAME, MX, NS, TXT, PTR, SOA, SRV); TTL e cache; arquivo hosts; `nslookup`, `dig`; DNS sobre HTTPS/TLS; DNSSEC; ataques (cache poisoning, DNS spoofing, tunneling).
10. **DHCP**: processo DORA com diagrama; lease e renovação (T1/T2); escopos, exclusões e reservas; opções (gateway, DNS, máscara); DHCP relay (`ip helper-address`); `ipconfig /release` e `/renew`, `dhclient`; configuração de pool no Cisco IOS; ataques (rogue DHCP, starvation) e DHCP snooping.
11. **HTTP/HTTPS**: modelo requisição/resposta; métodos (GET, POST, PUT, PATCH, DELETE…); códigos de status (1xx–5xx, com os principais); cabeçalhos importantes; cookies e sessões; HTTP/1.1 vs HTTP/2 vs HTTP/3; TLS: handshake, certificados, CAs, chave pública/privada; HSTS; `curl -v` e DevTools; ataques MITM.
12. **SSH**: o que é e por que substitui o Telnet; criptografia simétrica e assimétrica no SSH; autenticação por senha e por chave (`ssh-keygen`, `ssh-copy-id`); `known_hosts` e fingerprint; port forwarding (local, remoto, dinâmico); SCP/SFTP; configurar SSH em switch/roteador Cisco; hardening (desabilitar root e senha, fail2ban, trocar a porta).
13. **ICMP**: função; tipos e códigos principais (echo, destination unreachable, time exceeded, redirect); `ping` e `traceroute`/`tracert` explicados (uso do TTL); MTU e Path MTU Discovery; ICMPv6; riscos (ping flood, smurf) e quando bloquear ou permitir.
14. **Switch**: funcionamento na camada 2; tabela MAC/CAM e aprendizado; flooding, forwarding, filtering; domínios de colisão e de broadcast; modos de comutação (store-and-forward, cut-through); full/half duplex; STP (por que existe, eleição da root bridge, estados das portas, RSTP); port security; switch L2 vs L3; comandos IOS básicos (`show mac address-table`, `show interfaces`).
15. **Router**: função na camada 3; tabela de roteamento (rotas conectadas, estáticas, padrão); processo de decisão (longest prefix match, distância administrativa, métrica); roteamento estático vs dinâmico; noções de RIP, OSPF, EIGRP e BGP; gateway padrão; inter-VLAN routing (router-on-a-stick); comandos IOS (`show ip route`, `ip route`).
16. **NAT e PAT**: por que existe; NAT estático, dinâmico e PAT (overload) com tabelas de tradução de exemplo; endereços inside/outside local/global; port forwarding; configuração no Cisco IOS; limitações (quebra do fim a fim, CGNAT); NAT e IPv6.
17. **Firewall**: conceito; tipos (filtro de pacotes, stateful, proxy/aplicação, NGFW, WAF); ACLs padrão e estendidas com exemplos IOS; regras e ordem de avaliação; deny implícito; DMZ; iptables/nftables e Windows Firewall; IDS vs IPS; princípio do menor privilégio.
18. **VLAN**: conceito e benefícios; portas access vs trunk; 802.1Q (tag); VLAN nativa e VLAN de gerenciamento; inter-VLAN routing; VTP; configuração passo a passo no IOS; ataques (VLAN hopping, double tagging) e mitigação.
19. **VPN**: conceito; site-to-site vs acesso remoto; protocolos (IPsec com IKE, AH/ESP e modos túnel/transporte; SSL/TLS VPN; WireGuard; OpenVPN; L2TP; PPTP como obsoleto); tunelamento e encapsulamento com diagrama; split tunneling; VPN corporativa vs comercial; Zero Trust.
20. **Desafio Final**: projeto integrador com cenário realista (ex.: rede de uma empresa com 3 departamentos e uma filial): topologia, plano de endereçamento com VLSM, VLANs, inter-VLAN routing, DHCP, DNS, NAT/PAT, ACLs de firewall, VPN site-to-site e SSH para gerência. Inclua: enunciado, requisitos numerados, critérios de avaliação/rubrica, checklist de verificação (testes de `ping`, `traceroute`, `nslookup`), dicas progressivas (ocultas por padrão) e solução de referência separada. Inclua também uma prova final com 20 questões abrangendo todos os módulos.

**Regras de qualidade do conteúdo:**
- Escreva em português do Brasil, com linguagem clara e didática; mantenha termos técnicos consagrados em inglês e explique-os na primeira ocorrência.
- Tecnicamente correto: confira números de portas, RFCs, cálculos e comandos. Todo exercício precisa de gabarito verificado.
- Progressão coerente: cada módulo pode citar os anteriores ("como vimos em Subnetting…") com link interno.
- Use exemplos com IPs de documentação/privados (`192.168.x.x`, `10.x.x.x`, `203.0.113.0/24`) e domínios `example.com`.
- Não remova conteúdo existente correto; amplie e reorganize.
- Mantenha o site leve: carregue o conteúdo de cada módulo sob demanda (lazy loading) se ele crescer muito.

### Entrega final
- Rode lint, build e testes, e confirme que todas as páginas de módulo abrem sem erro no console.
- Faça commits separados: um para as correções (Fase 1) e um por grupo de módulos (Fase 2).
- Apresente um resumo com: problemas corrigidos, componentes criados e o que foi adicionado a cada módulo.
