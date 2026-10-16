<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 12 — SSH

## 1. Qual a porta padrão do SSH?

- 21
- **22** ✅
- 23
- 443

**Explicação:** O SSH escuta por padrão na porta 22/TCP.

## 2. Qual a principal vantagem do SSH sobre o Telnet?

- É mais rápido
- **Criptografa toda a sessão** ✅
- Usa UDP
- Não precisa de senha

**Explicação:** Telnet envia tudo em texto claro; SSH cifra a comunicação inteira.

## 3. Na autenticação por chave, o que é copiado para o servidor?

- A chave privada
- **A chave pública** ✅
- As duas chaves
- O arquivo known_hosts

**Explicação:** A chave privada nunca sai do cliente; a pública vai para authorized_keys.

## 4. O aviso "REMOTE HOST IDENTIFICATION HAS CHANGED" pode indicar:

- Senha expirada
- **Possível ataque man-in-the-middle ou servidor reinstalado** ✅
- Porta bloqueada
- Falta de espaço em disco

**Explicação:** A chave de host mudou em relação à registrada em known_hosts. Confirme por outro canal antes de aceitar.

## 5. Qual opção do ssh cria um túnel local?

- -R
- **-L** ✅
- -D
- -p

**Explicação:** -L faz local forwarding; -R remoto; -D cria proxy SOCKS dinâmico; -p define a porta.

## 6. Em um roteador Cisco, qual comando restringe as linhas VTY a aceitar apenas SSH?

- login local
- **transport input ssh** ✅
- ip ssh version 2
- crypto key generate rsa

**Explicação:** transport input ssh impede conexões Telnet nas linhas virtuais.
