<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 5 — Subnetting

## 1. Quantos hosts utilizáveis existem em uma sub-rede /28?

- 16
- **14** ✅
- 30
- 6

**Explicação:** 4 bits de host: 2^4 − 2 = 14.

## 2. Qual é o broadcast da rede 192.168.10.64/26?

- **192.168.10.127** ✅
- 192.168.10.128
- 192.168.10.95
- 192.168.10.255

**Explicação:** Bloco de 64: a rede vai de .64 a .127; o último endereço é o broadcast.

## 3. A qual sub-rede pertence o host 10.10.10.200/28?

- **10.10.10.192** ✅
- 10.10.10.200
- 10.10.10.208
- 10.10.10.128

**Explicação:** Número mágico 16: redes .176, .192, .208… O 200 está no bloco .192.

## 4. Qual o menor prefixo que comporta 100 hosts?

- /24
- **/25** ✅
- /26
- /27

**Explicação:** /25 oferece 126 hosts; /26 oferece só 62.

## 5. Qual prefixo é tipicamente usado em links ponto a ponto entre roteadores (mantendo rede e broadcast)?

- /24
- /28
- **/30** ✅
- /16

**Explicação:** A /30 tem exatamente 2 hosts utilizáveis. A /31 também pode ser usada (RFC 3021).

## 6. As redes 10.1.0.0/24 a 10.1.3.0/24 podem ser sumarizadas como:

- 10.1.0.0/16
- **10.1.0.0/22** ✅
- 10.1.0.0/23
- 10.0.0.0/8

**Explicação:** Quatro /24 contíguas começando em múltiplo de 4 resultam em uma /22.

## 7. No VLSM, em que ordem as sub-redes devem ser alocadas?

- Da menor para a maior
- **Da maior para a menor** ✅
- Em ordem alfabética
- Tanto faz

**Explicação:** Alocar as maiores primeiro garante alinhamento dos blocos e evita sobreposição e desperdício.
