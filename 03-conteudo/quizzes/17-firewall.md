<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->

# Quiz — Módulo 17 — Firewall

## 1. Em que ordem as regras de um firewall/ACL são avaliadas?

- Da mais restritiva para a mais permissiva automaticamente
- **De cima para baixo; a primeira que corresponder vence** ✅
- Todas são avaliadas e vence a última
- Aleatoriamente

**Explicação:** Por isso a ordem das regras é tão importante.

## 2. O que acontece com um pacote que não corresponde a nenhuma linha de uma ACL Cisco?

- É permitido
- **É negado pelo deny implícito** ✅
- É enviado ao administrador
- É fragmentado

**Explicação:** Toda ACL termina com um deny any implícito.

## 3. Qual tipo de firewall acompanha o estado das conexões?

- Stateless
- **Stateful** ✅
- Hub
- Bridge

**Explicação:** O stateful mantém uma tabela de conexões e permite as respostas automaticamente.

## 4. A DMZ é usada para:

- Guardar backups
- **Isolar servidores acessíveis da Internet** ✅
- Conectar impressoras
- Hospedar o DHCP

**Explicação:** Se um servidor da DMZ for comprometido, a LAN interna continua protegida.

## 5. Qual a diferença entre IDS e IPS?

- IDS bloqueia, IPS só alerta
- **IDS só alerta, IPS bloqueia em tempo real** ✅
- São a mesma coisa
- IPS só funciona com UDP

**Explicação:** O IPS fica no caminho do tráfego (inline) e pode descartar pacotes maliciosos.

## 6. Uma ACL estendida deve ser aplicada preferencialmente:

- Perto do destino
- **Perto da origem** ✅
- Em qualquer interface
- Só na interface de gerência

**Explicação:** Assim o tráfego indesejado é descartado antes de consumir banda na rede.
