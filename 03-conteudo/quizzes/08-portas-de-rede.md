<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 8 — Portas de Rede

## 1. Qual a porta padrão do HTTPS?

- 80
- **443** ✅
- 8080
- 22

**Explicação:** HTTPS usa a porta 443 (TCP; UDP no caso do HTTP/3).

## 2. O SSH usa por padrão a porta:

- 21
- **22** ✅
- 23
- 25

**Explicação:** SSH escuta na porta 22/TCP. A 23 é o Telnet, que não tem criptografia.

## 3. A faixa de portas bem conhecidas (well-known) é:

- **0 – 1023** ✅
- 1024 – 49151
- 49152 – 65535
- 0 – 65535

**Explicação:** As portas 0–1023 são reservadas para serviços padrão.

## 4. Em uma varredura, uma porta que não responde nada provavelmente está:

- Aberta
- Fechada
- **Filtrada** ✅
- Em TIME_WAIT

**Explicação:** Sem resposta é o comportamento típico de um firewall descartando pacotes.

## 5. Qual porta pertence ao RDP (Remote Desktop Protocol)?

- 3306
- **3389** ✅
- 445
- 5900

**Explicação:** O RDP usa a porta 3389/TCP. Expô-lo diretamente na Internet é um risco grave.

## 6. Um socket é definido por:

- Somente o IP
- Somente a porta
- **Endereço IP + porta (+ protocolo)** ✅
- Endereço MAC + porta

**Explicação:** O socket identifica uma ponta da comunicação: IP, porta e protocolo de transporte.
