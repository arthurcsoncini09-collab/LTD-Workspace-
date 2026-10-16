<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 20 — Desafio Final

## 1. Em qual camada do OSI atua o roteador?

- Camada 1
- Camada 2
- **Camada 3** ✅
- Camada 4

**Explicação:** O roteador encaminha pacotes pelo endereço IP.

## 2. Qual a PDU da camada de Transporte quando se usa TCP?

- Quadro
- Pacote
- **Segmento** ✅
- Bit

**Explicação:** TCP → segmento; UDP → datagrama.

## 3. Quantas camadas tem o modelo TCP/IP clássico?

- **4** ✅
- 5
- 6
- 7

**Explicação:** Acesso à Rede, Internet, Transporte e Aplicação.

## 4. Qual destes é um endereço IPv4 privado?

- 11.0.0.1
- 172.15.0.1
- **192.168.50.4** ✅
- 100.200.1.1

**Explicação:** 192.168.0.0/16 é privado (RFC 1918).

## 5. Qual o broadcast da rede 10.10.1.64/27?

- **10.10.1.95** ✅
- 10.10.1.127
- 10.10.1.79
- 10.10.1.63

**Explicação:** Bloco de 32: .64 a .95.

## 6. Qual prefixo comporta 100 hosts com o menor desperdício?

- /24
- **/25** ✅
- /26
- /27

**Explicação:** /25 = 126 hosts; /26 = 62.

## 7. O ARP Reply é enviado em:

- Broadcast
- **Unicast** ✅
- Multicast
- Anycast

**Explicação:** O Request é broadcast; o Reply vai direto a quem perguntou.

## 8. Qual protocolo de transporte é usado por VoIP e jogos online?

- TCP
- **UDP** ✅
- ICMP
- ARP

**Explicação:** Baixa latência importa mais que retransmissão.

## 9. Qual a porta padrão do DNS?

- 25
- **53** ✅
- 67
- 123

**Explicação:** DNS usa a porta 53, principalmente em UDP.

## 10. Qual registro DNS aponta para o servidor de e-mail?

- A
- **MX** ✅
- PTR
- CNAME

**Explicação:** Mail eXchanger.

## 11. Qual a ordem correta do processo DHCP?

- Request, Offer, Discover, ACK
- **Discover, Offer, Request, ACK** ✅
- Offer, Discover, ACK, Request
- Discover, Request, Offer, ACK

**Explicação:** DORA.

## 12. Um erro HTTP 404 significa:

- Erro interno do servidor
- **Recurso não encontrado** ✅
- Acesso proibido
- Redirecionamento

**Explicação:** 4xx = erro do cliente; 404 = Not Found.

## 13. Na autenticação SSH por chave, o que vai para o servidor?

- A chave privada
- **A chave pública** ✅
- A senha
- O known_hosts

**Explicação:** Ela fica em ~/.ssh/authorized_keys.

## 14. O traceroute funciona manipulando qual campo?

- **TTL** ✅
- Checksum
- Porta
- MAC

**Explicação:** Cada roteador que zera o TTL responde com ICMP Time Exceeded.

## 15. O que o switch faz com um quadro cujo destino não está na tabela MAC?

- Descarta
- **Flooding** ✅
- Envia ao roteador
- Devolve à origem

**Explicação:** Envia por todas as portas da VLAN, exceto a de origem.

## 16. Qual rota o roteador escolhe quando várias correspondem ao destino?

- A mais antiga
- **A de maior prefixo** ✅
- A de maior métrica
- A primeira configurada

**Explicação:** Longest prefix match.

## 17. Qual palavra-chave ativa o PAT no Cisco IOS?

- static
- **overload** ✅
- pool
- masquerade

**Explicação:** ip nat inside source list 1 interface g0/1 overload.

## 18. O que acontece com o tráfego que não corresponde a nenhuma regra de uma ACL Cisco?

- É permitido
- **É negado** ✅
- É registrado e permitido
- É roteado para a DMZ

**Explicação:** Deny implícito no final de toda ACL.

## 19. Qual padrão define o trunk de VLANs?

- **802.1Q** ✅
- 802.11ac
- 802.3af
- 802.1X

**Explicação:** Tag de 4 bytes com VLAN ID de 12 bits.

## 20. Qual componente do IPsec cifra os dados do túnel?

- AH
- IKE
- **ESP** ✅
- GRE

**Explicação:** O ESP oferece confidencialidade; o IKE negocia as chaves.
