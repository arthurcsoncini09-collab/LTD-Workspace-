<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 14 — Switch

## 1. Com base em que o switch decide para qual porta enviar um quadro?

- IP de destino
- **MAC de destino** ✅
- Porta TCP
- MAC de origem

**Explicação:** O MAC de origem é usado para aprender; o de destino, para encaminhar.

## 2. Quantos domínios de broadcast há em um switch de 24 portas com uma única VLAN?

- **1** ✅
- 2
- 12
- 24

**Explicação:** Sem VLANs adicionais, todas as portas estão no mesmo domínio de broadcast (mas cada uma é um domínio de colisão).

## 3. O que o switch faz com um quadro de broadcast?

- Descarta
- Envia ao roteador
- **Envia por todas as portas da VLAN exceto a de origem** ✅
- Envia somente para a root bridge

**Explicação:** Broadcasts são sempre inundados (flooding) dentro da VLAN.

## 4. Qual a principal função do STP?

- Criptografar quadros
- **Evitar loops de camada 2** ✅
- Atribuir IPs
- Rotear entre VLANs

**Explicação:** O STP bloqueia caminhos redundantes para formar uma topologia sem loops.

## 5. Qual switch se torna a root bridge?

- O de maior Bridge ID
- **O de menor Bridge ID** ✅
- O primeiro a ser ligado
- O com mais portas

**Explicação:** Menor prioridade vence; em empate, o menor MAC.

## 6. Qual recurso coloca uma porta de acesso em err-disabled ao receber um BPDU?

- PortFast
- **BPDU Guard** ✅
- Port mirroring
- Root Guard

**Explicação:** O BPDU Guard protege portas de usuários contra a conexão indevida de switches.
