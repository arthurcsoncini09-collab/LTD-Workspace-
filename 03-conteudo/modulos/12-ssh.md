<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Módulo 12 — SSH

**Nível:** Intermediário · **Aulas:** 2 · **Questões:** 6 · **No site:** `/aulas/ssh`

> Acesso remoto seguro: criptografia no SSH, autenticação por chave, known_hosts, túneis, SCP/SFTP, SSH em equipamentos Cisco e hardening.

**Objetivo:** Acessar e administrar servidores e equipamentos de rede com SSH de forma segura, usando autenticação por chaves e boas práticas de hardening.

O SSH substituiu o Telnet ao oferecer um canal cifrado e autenticado para administração remota, transferência de arquivos e túneis.

## Objetivos de aprendizagem

- Explicar por que o SSH substituiu o Telnet.
- Descrever as fases de uma conexão SSH e o papel do known_hosts.
- Configurar autenticação por chave pública.
- Criar túneis e transferir arquivos com SCP/SFTP.
- Habilitar SSH em equipamentos Cisco e aplicar hardening.

## Aula 1 — Como o SSH funciona

**Palavras-chave:** SSH, Telnet, porta 22, known_hosts, fingerprint, criptografia

### Introdução

O SSH (Secure Shell) cria um canal criptografado entre um cliente e um servidor, normalmente na porta 22/TCP. Por ele é possível executar comandos, transferir arquivos e encaminhar portas.

### Por que isso importa

Praticamente toda administração de servidores Linux, roteadores, switches e serviços em nuvem é feita via SSH. O Telnet transmite até a senha em texto claro.

### Explicação

Na primeira conexão, o servidor apresenta sua chave pública de host (fingerprint). O cliente guarda essa chave em ~/.ssh/known_hosts; se ela mudar no futuro, o cliente alerta sobre um possível ataque man-in-the-middle. Depois, cliente e servidor combinam chaves de sessão e o usuário se autentica.

### Conteúdo

#### SSH × Telnet

| Característica | Telnet | SSH |
| --- | --- | --- |
| Porta padrão | 23/TCP | 22/TCP |
| Criptografia | Nenhuma | Sim (ex.: AES-GCM, ChaCha20-Poly1305) |
| Autenticação do servidor | Não | Chave de host (fingerprint) |
| Autenticação do usuário | Senha em texto claro | Senha cifrada, chave pública, certificados, MFA |
| Transferência de arquivos e túneis | Não | SCP, SFTP, port forwarding |

#### Fases de uma conexão SSH

1. Conexão TCP na porta 22 e troca de versões do protocolo.
2. Negociação de algoritmos e troca de chaves (Diffie-Hellman / Curve25519).
3. Verificação da chave de host do servidor (known_hosts).
4. Autenticação do usuário (chave pública ou senha).
5. Abertura de canais: shell, execução de comando, SFTP ou túnel.

### Contexto real

Um administrador conecta-se a um servidor na nuvem com "ssh ubuntu@203.0.113.10", usando uma chave privada guardada no notebook — sem nunca digitar senha.

### Exercício

Por que o Telnet não deve ser usado em redes de produção?

<details><summary>Resposta</summary>

Porque transmite tudo em texto claro, inclusive usuário e senha. Qualquer um capturando o tráfego consegue ler as credenciais.

</details>

### Desafio

Conecte-se por SSH a uma máquina virtual Linux e explique o aviso que aparece na primeira conexão.

## Aula 2 — Chaves, túneis e hardening

**Palavras-chave:** ssh-keygen, authorized_keys, ed25519, túnel, port forwarding, SCP, SFTP, hardening

### Introdução

A autenticação por chave pública é mais segura e prática que senhas. Além disso, o SSH pode criar túneis que transportam outros protocolos com segurança.

### Por que isso importa

Servidores com SSH aberto à Internet sofrem milhares de tentativas de login por dia. Chaves, desativação de senha e boas configurações reduzem drasticamente o risco.

### Explicação

Você gera um par de chaves: a privada fica com você (protegida por senha); a pública é colocada no servidor em ~/.ssh/authorized_keys. No login, o servidor desafia o cliente, que prova possuir a chave privada sem enviá-la.

### Conteúdo

#### Autenticação por chave

```
ssh-keygen -t ed25519 -C "ana@notebook"     # gera ~/.ssh/id_ed25519 e .pub
ssh-copy-id usuario@192.168.1.50             # instala a chave pública no servidor
ssh usuario@192.168.1.50                     # login sem senha do servidor
```

#### Túneis (port forwarding)

| Tipo | Comando | Uso |
| --- | --- | --- |
| Local | ssh -L 8080:intranet:80 user@bastion | Acessar um serviço interno pela sua porta local |
| Remoto | ssh -R 9000:localhost:3000 user@servidor | Expor um serviço local no servidor remoto |
| Dinâmico | ssh -D 1080 user@servidor | Proxy SOCKS: navegar pela rede do servidor |

#### Transferência de arquivos

```
scp relatorio.pdf usuario@servidor:/tmp/
scp -r usuario@servidor:/var/log/nginx ./logs
sftp usuario@servidor
```

#### SSH em roteadores e switches Cisco

```
hostname R1
ip domain-name empresa.local
crypto key generate rsa modulus 2048
ip ssh version 2
username admin privilege 15 secret SenhaForte!
line vty 0 4
 transport input ssh
 login local
```

#### Hardening do servidor (/etc/ssh/sshd_config)

- PermitRootLogin no — administre com usuário comum + sudo.
- PasswordAuthentication no — apenas chaves.
- AllowUsers ana joao — restrinja quem pode entrar.
- Use fail2ban ou equivalente para bloquear força bruta.
- Restrinja o acesso por firewall a IPs ou VPN de administração.
- Mantenha o OpenSSH atualizado.

### Contexto real

Para acessar um banco de dados que só escuta em localhost no servidor, o desenvolvedor cria um túnel: ssh -L 5432:localhost:5432 usuario@servidor, e conecta seu cliente em localhost:5432.

### Exercício

Qual arquivo do servidor guarda as chaves públicas autorizadas a acessar uma conta?

<details><summary>Resposta</summary>

~/.ssh/authorized_keys, no diretório home do usuário de destino.

</details>

### Desafio

Gere um par de chaves ed25519, instale a chave pública em uma VM e desative o login por senha no servidor.

## Comandos úteis

**Conectar e executar comandos** (Multiplataforma)

```
ssh usuario@192.168.1.50
ssh -p 2222 usuario@servidor          # porta alternativa
ssh usuario@servidor "uptime"         # executa e sai
```

O Windows 10/11 já inclui o cliente OpenSSH.

**Configuração de cliente (~/.ssh/config)** (Linux/macOS)

```
Host web1
  HostName 203.0.113.10
  User ubuntu
  IdentityFile ~/.ssh/id_ed25519
# depois basta: ssh web1
```

**Verificar SSH no equipamento** (Cisco IOS)

```
show ip ssh
show ssh
```

## Erros comuns e troubleshooting

| Problema | Solução |
| --- | --- |
| Permissões abertas demais na chave privada ("UNPROTECTED PRIVATE KEY FILE"). | chmod 600 ~/.ssh/id_ed25519 e chmod 700 ~/.ssh. |
| Desativar a senha antes de testar a chave e ficar trancado para fora. | Teste o login por chave em outra sessão antes de reiniciar o sshd. |
| Ignorar o aviso de mudança de chave de host. | Confirme a fingerprint com o administrador antes de remover a entrada antiga. |

## Segurança

- Proteja a chave privada com passphrase e use ssh-agent.
- Nunca compartilhe chaves privadas entre pessoas; uma chave por pessoa e por dispositivo.
- Exponha o SSH apenas via VPN ou bastion host, quando possível.
- Revise periodicamente o authorized_keys e remova chaves de ex-colaboradores.

## Pontos-chave

- SSH: porta 22/TCP, sessão totalmente cifrada.
- known_hosts protege contra servidores falsos.
- Chave privada fica com você; pública vai para authorized_keys.
- -L local, -R remoto, -D SOCKS.
- Desative root e senha; prefira chaves e restrinja o acesso.

## Laboratório: Acesso seguro a um servidor Linux

**Objetivo:** Configurar SSH com chave e aplicar hardening básico.

**Ferramentas:** Uma VM Linux (VirtualBox, WSL ou nuvem) e um cliente SSH.

1. Instale o servidor: sudo apt install openssh-server.
2. Gere uma chave ed25519 no cliente e copie com ssh-copy-id.
3. No sshd_config, defina PermitRootLogin no e PasswordAuthentication no.
4. Reinicie o serviço (sudo systemctl restart ssh) e teste o login por chave em nova sessão.
5. Crie um túnel local para um serviço web da VM e acesse-o pelo navegador.

**Resultado esperado:** Login sem senha funcionando, login por senha recusado e o túnel exibindo o serviço em localhost.

## Quiz

Gabarito em [../quizzes/12-ssh.md](../quizzes/12-ssh.md).

## Leituras recomendadas

- RFC 4251 — The Secure Shell (SSH) Protocol Architecture
- Manual do OpenSSH (man ssh, man sshd_config)
- Cisco — Configuring Secure Shell
