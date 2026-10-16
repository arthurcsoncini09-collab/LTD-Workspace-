<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 15 — Router

## 1. Em qual camada o roteador opera principalmente?

- Camada 1
- Camada 2
- **Camada 3** ✅
- Camada 7

**Explicação:** O roteador encaminha pacotes com base no endereço IP (camada de Rede).

## 2. Com rotas para 10.0.0.0/8, 10.1.0.0/16 e 10.1.1.0/24, qual é usada para o destino 10.1.1.9?

- 10.0.0.0/8
- 10.1.0.0/16
- **10.1.1.0/24** ✅
- A rota padrão

**Explicação:** Longest prefix match: a rota mais específica vence.

## 3. Qual a distância administrativa padrão de uma rota estática?

- 0
- **1** ✅
- 110
- 120

**Explicação:** Conectada = 0, estática = 1, OSPF = 110, RIP = 120.

## 4. Qual comando cria uma rota padrão no Cisco IOS?

- ip route default 203.0.113.1
- **ip route 0.0.0.0 0.0.0.0 203.0.113.1** ✅
- ip default-route 203.0.113.1
- route add 0.0.0.0

**Explicação:** A rede 0.0.0.0/0 casa com qualquer destino.

## 5. Qual protocolo interliga os sistemas autônomos da Internet?

- OSPF
- RIP
- **BGP** ✅
- EIGRP

**Explicação:** O BGP é o protocolo de roteamento entre domínios da Internet.

## 6. OSPF é um protocolo do tipo:

- Vetor de distância
- **Estado de enlace** ✅
- Vetor de caminho
- Estático

**Explicação:** O OSPF monta um mapa da topologia e calcula o menor caminho com Dijkstra (SPF).
