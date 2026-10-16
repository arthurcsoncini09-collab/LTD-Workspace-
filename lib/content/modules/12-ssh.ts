import type { ModuleSeed } from '../types';

export const ssh: ModuleSeed = {
  slug: 'ssh',
  title: 'Módulo 12 — SSH',
  stage: 'Intermediário',
  description: 'Acesso remoto seguro: criptografia no SSH, autenticação por chave, known_hosts, túneis, SCP/SFTP, SSH em equipamentos Cisco e hardening.',
  accent: 'from-slate-400 to-zinc-500',
  objective: 'Acessar e administrar servidores e equipamentos de rede com SSH de forma segura, usando autenticação por chaves e boas práticas de hardening.',
  summary: 'O SSH substituiu o Telnet ao oferecer um canal cifrado e autenticado para administração remota, transferência de arquivos e túneis.',
  lessons: [
    {
      slug: 'fundamentos-ssh',
      title: 'Como o SSH funciona',
      introduction: 'O SSH (Secure Shell) cria um canal criptografado entre um cliente e um servidor, normalmente na porta 22/TCP. Por ele é possível executar comandos, transferir arquivos e encaminhar portas.',
      why_it_matters: 'Praticamente toda administração de servidores Linux, roteadores, switches e serviços em nuvem é feita via SSH. O Telnet transmite até a senha em texto claro.',
      real_world: 'Um administrador conecta-se a um servidor na nuvem com "ssh ubuntu@203.0.113.10", usando uma chave privada guardada no notebook — sem nunca digitar senha.',
      explanation: 'Na primeira conexão, o servidor apresenta sua chave pública de host (fingerprint). O cliente guarda essa chave em ~/.ssh/known_hosts; se ela mudar no futuro, o cliente alerta sobre um possível ataque man-in-the-middle. Depois, cliente e servidor combinam chaves de sessão e o usuário se autentica.',
      exercise: 'Por que o Telnet não deve ser usado em redes de produção?',
      exercise_answer: 'Porque transmite tudo em texto claro, inclusive usuário e senha. Qualquer um capturando o tráfego consegue ler as credenciais.',
      challenge: 'Conecte-se por SSH a uma máquina virtual Linux e explique o aviso que aparece na primeira conexão.',
      keywords: ['SSH', 'Telnet', 'porta 22', 'known_hosts', 'fingerprint', 'criptografia'],
      sections: [
        {
          title: 'SSH × Telnet',
          table: {
            headers: ['Característica', 'Telnet', 'SSH'],
            rows: [
              ['Porta padrão', '23/TCP', '22/TCP'],
              ['Criptografia', 'Nenhuma', 'Sim (ex.: AES-GCM, ChaCha20-Poly1305)'],
              ['Autenticação do servidor', 'Não', 'Chave de host (fingerprint)'],
              ['Autenticação do usuário', 'Senha em texto claro', 'Senha cifrada, chave pública, certificados, MFA'],
              ['Transferência de arquivos e túneis', 'Não', 'SCP, SFTP, port forwarding'],
            ],
          },
        },
        {
          title: 'Fases de uma conexão SSH',
          steps: [
            'Conexão TCP na porta 22 e troca de versões do protocolo.',
            'Negociação de algoritmos e troca de chaves (Diffie-Hellman / Curve25519).',
            'Verificação da chave de host do servidor (known_hosts).',
            'Autenticação do usuário (chave pública ou senha).',
            'Abertura de canais: shell, execução de comando, SFTP ou túnel.',
          ],
        },
      ],
    },
    {
      slug: 'chaves-tuneis-e-hardening',
      title: 'Chaves, túneis e hardening',
      introduction: 'A autenticação por chave pública é mais segura e prática que senhas. Além disso, o SSH pode criar túneis que transportam outros protocolos com segurança.',
      why_it_matters: 'Servidores com SSH aberto à Internet sofrem milhares de tentativas de login por dia. Chaves, desativação de senha e boas configurações reduzem drasticamente o risco.',
      real_world: 'Para acessar um banco de dados que só escuta em localhost no servidor, o desenvolvedor cria um túnel: ssh -L 5432:localhost:5432 usuario@servidor, e conecta seu cliente em localhost:5432.',
      explanation: 'Você gera um par de chaves: a privada fica com você (protegida por senha); a pública é colocada no servidor em ~/.ssh/authorized_keys. No login, o servidor desafia o cliente, que prova possuir a chave privada sem enviá-la.',
      exercise: 'Qual arquivo do servidor guarda as chaves públicas autorizadas a acessar uma conta?',
      exercise_answer: '~/.ssh/authorized_keys, no diretório home do usuário de destino.',
      challenge: 'Gere um par de chaves ed25519, instale a chave pública em uma VM e desative o login por senha no servidor.',
      keywords: ['ssh-keygen', 'authorized_keys', 'ed25519', 'túnel', 'port forwarding', 'SCP', 'SFTP', 'hardening'],
      sections: [
        {
          title: 'Autenticação por chave',
          code: 'ssh-keygen -t ed25519 -C "ana@notebook"     # gera ~/.ssh/id_ed25519 e .pub\nssh-copy-id usuario@192.168.1.50             # instala a chave pública no servidor\nssh usuario@192.168.1.50                     # login sem senha do servidor',
        },
        {
          title: 'Túneis (port forwarding)',
          table: {
            headers: ['Tipo', 'Comando', 'Uso'],
            rows: [
              ['Local', 'ssh -L 8080:intranet:80 user@bastion', 'Acessar um serviço interno pela sua porta local'],
              ['Remoto', 'ssh -R 9000:localhost:3000 user@servidor', 'Expor um serviço local no servidor remoto'],
              ['Dinâmico', 'ssh -D 1080 user@servidor', 'Proxy SOCKS: navegar pela rede do servidor'],
            ],
          },
        },
        {
          title: 'Transferência de arquivos',
          code: 'scp relatorio.pdf usuario@servidor:/tmp/\nscp -r usuario@servidor:/var/log/nginx ./logs\nsftp usuario@servidor',
        },
        {
          title: 'SSH em roteadores e switches Cisco',
          code: 'hostname R1\nip domain-name empresa.local\ncrypto key generate rsa modulus 2048\nip ssh version 2\nusername admin privilege 15 secret SenhaForte!\nline vty 0 4\n transport input ssh\n login local',
        },
        {
          title: 'Hardening do servidor (/etc/ssh/sshd_config)',
          items: [
            'PermitRootLogin no — administre com usuário comum + sudo.',
            'PasswordAuthentication no — apenas chaves.',
            'AllowUsers ana joao — restrinja quem pode entrar.',
            'Use fail2ban ou equivalente para bloquear força bruta.',
            'Restrinja o acesso por firewall a IPs ou VPN de administração.',
            'Mantenha o OpenSSH atualizado.',
          ],
        },
      ],
    },
  ],
  quizQuestions: [
    {
      question: 'Qual a porta padrão do SSH?',
      options: ['21', '22', '23', '443'],
      answer: '22',
      explanation: 'O SSH escuta por padrão na porta 22/TCP.',
    },
    {
      question: 'Qual a principal vantagem do SSH sobre o Telnet?',
      options: ['É mais rápido', 'Criptografa toda a sessão', 'Usa UDP', 'Não precisa de senha'],
      answer: 'Criptografa toda a sessão',
      explanation: 'Telnet envia tudo em texto claro; SSH cifra a comunicação inteira.',
    },
    {
      question: 'Na autenticação por chave, o que é copiado para o servidor?',
      options: ['A chave privada', 'A chave pública', 'As duas chaves', 'O arquivo known_hosts'],
      answer: 'A chave pública',
      explanation: 'A chave privada nunca sai do cliente; a pública vai para authorized_keys.',
    },
    {
      question: 'O aviso "REMOTE HOST IDENTIFICATION HAS CHANGED" pode indicar:',
      options: ['Senha expirada', 'Possível ataque man-in-the-middle ou servidor reinstalado', 'Porta bloqueada', 'Falta de espaço em disco'],
      answer: 'Possível ataque man-in-the-middle ou servidor reinstalado',
      explanation: 'A chave de host mudou em relação à registrada em known_hosts. Confirme por outro canal antes de aceitar.',
    },
    {
      question: 'Qual opção do ssh cria um túnel local?',
      options: ['-R', '-L', '-D', '-p'],
      answer: '-L',
      explanation: '-L faz local forwarding; -R remoto; -D cria proxy SOCKS dinâmico; -p define a porta.',
    },
    {
      question: 'Em um roteador Cisco, qual comando restringe as linhas VTY a aceitar apenas SSH?',
      options: ['login local', 'transport input ssh', 'ip ssh version 2', 'crypto key generate rsa'],
      answer: 'transport input ssh',
      explanation: 'transport input ssh impede conexões Telnet nas linhas virtuais.',
    },
  ],
  details: {
    objectives: [
      'Explicar por que o SSH substituiu o Telnet.',
      'Descrever as fases de uma conexão SSH e o papel do known_hosts.',
      'Configurar autenticação por chave pública.',
      'Criar túneis e transferir arquivos com SCP/SFTP.',
      'Habilitar SSH em equipamentos Cisco e aplicar hardening.',
    ],
    keyPoints: [
      'SSH: porta 22/TCP, sessão totalmente cifrada.',
      'known_hosts protege contra servidores falsos.',
      'Chave privada fica com você; pública vai para authorized_keys.',
      '-L local, -R remoto, -D SOCKS.',
      'Desative root e senha; prefira chaves e restrinja o acesso.',
    ],
    commands: [
      { title: 'Conectar e executar comandos', platform: 'Multiplataforma', code: 'ssh usuario@192.168.1.50\nssh -p 2222 usuario@servidor          # porta alternativa\nssh usuario@servidor "uptime"         # executa e sai', note: 'O Windows 10/11 já inclui o cliente OpenSSH.' },
      { title: 'Configuração de cliente (~/.ssh/config)', platform: 'Linux/macOS', code: 'Host web1\n  HostName 203.0.113.10\n  User ubuntu\n  IdentityFile ~/.ssh/id_ed25519\n# depois basta: ssh web1' },
      { title: 'Verificar SSH no equipamento', platform: 'Cisco IOS', code: 'show ip ssh\nshow ssh' },
    ],
    pitfalls: [
      { problem: 'Permissões abertas demais na chave privada ("UNPROTECTED PRIVATE KEY FILE").', solution: 'chmod 600 ~/.ssh/id_ed25519 e chmod 700 ~/.ssh.' },
      { problem: 'Desativar a senha antes de testar a chave e ficar trancado para fora.', solution: 'Teste o login por chave em outra sessão antes de reiniciar o sshd.' },
      { problem: 'Ignorar o aviso de mudança de chave de host.', solution: 'Confirme a fingerprint com o administrador antes de remover a entrada antiga.' },
    ],
    security: [
      'Proteja a chave privada com passphrase e use ssh-agent.',
      'Nunca compartilhe chaves privadas entre pessoas; uma chave por pessoa e por dispositivo.',
      'Exponha o SSH apenas via VPN ou bastion host, quando possível.',
      'Revise periodicamente o authorized_keys e remova chaves de ex-colaboradores.',
    ],
    lab: {
      title: 'Acesso seguro a um servidor Linux',
      goal: 'Configurar SSH com chave e aplicar hardening básico.',
      tools: 'Uma VM Linux (VirtualBox, WSL ou nuvem) e um cliente SSH.',
      steps: [
        'Instale o servidor: sudo apt install openssh-server.',
        'Gere uma chave ed25519 no cliente e copie com ssh-copy-id.',
        'No sshd_config, defina PermitRootLogin no e PasswordAuthentication no.',
        'Reinicie o serviço (sudo systemctl restart ssh) e teste o login por chave em nova sessão.',
        'Crie um túnel local para um serviço web da VM e acesse-o pelo navegador.',
      ],
      expected: 'Login sem senha funcionando, login por senha recusado e o túnel exibindo o serviço em localhost.',
    },
    references: ['RFC 4251 — The Secure Shell (SSH) Protocol Architecture', 'Manual do OpenSSH (man ssh, man sshd_config)', 'Cisco — Configuring Secure Shell'],
  },
};
