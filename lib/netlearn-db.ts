import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export type Module = {
  id: number;
  slug: string;
  title: string;
  stage: string;
  description: string;
  accent: string;
  order_index: number;
  objective: string;
  summary: string;
  lessons: Lesson[];
  quizQuestions: QuizQuestion[];
};

export type Lesson = {
  id: number;
  module_id: number;
  slug: string;
  title: string;
  introduction: string;
  why_it_matters: string;
  real_world: string;
  explanation: string;
  exercise: string;
  challenge: string;
  keywords: string[];
  sections: Array<{ title: string; content?: string; example?: string; items?: string[]; steps?: string[] }>;
  sort_order: number;
};

export type QuizQuestion = {
  id: number;
  module_id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  sort_order: number;
};

export type GlossaryTerm = {
  id: number;
  term: string;
  definition: string;
  technical_definition: string;
  example: string;
  related: string;
};

const DB_DIR = path.join(process.cwd(), 'db');
const DB_PATH = path.join(DB_DIR, 'netlearn.db');

function createSeedModules() {
  return [
    {
      slug: 'introducao-redes',
      title: 'Módulo 1 — Introdução às Redes',
      stage: 'Básico',
      description: 'Fundamentos de redes, Internet, LAN, WAN, clientes, servidores e topologias.',
      accent: 'from-blue-500 to-cyan-400',
      order_index: 1,
      objective: 'Compreender o papel das redes na comunicação digital e a relação entre dispositivos, protocolos e Internet.',
      summary: 'A base do aprendizado começa com a ideia de que redes conectam computadores e permitem sua comunicação.',
      lessons: [
        {
          slug: 'fundamentos-de-redes',
          title: 'Fundamentos de redes',
          introduction: 'Uma rede é um conjunto de dispositivos conectados para trocar informações. Ela pode ser doméstica, corporativa ou global, como a própria Internet.',
          why_it_matters: 'Sem redes, computadores não conseguiriam compartilhar arquivos, navegar na web, enviar mensagens ou acessar serviços em nuvem.',
          real_world: 'Ao abrir um site, o navegador envia uma requisição ao servidor, que responde com a página. Esse processo depende de vários equipamentos interconectados.',
          explanation: 'Imagine uma casa onde cada aparelho quer falar com outro. O roteador funciona como um ponto de conexão; os cabos ou ondas sem fio permitem a troca de dados. A rede facilita comunicação, compartilhamento e acesso a serviços.',
          exercise: 'Qual é a diferença entre uma rede local e a Internet?',
          challenge: 'Descreva como um computador em uma LAN consegue acessar um site na Internet.',
          keywords: ['rede', 'Internet', 'LAN', 'WAN', 'cliente', 'servidor'],
          sections: [
            { title: 'O que é uma rede?', content: 'Rede é a interconexão de dispositivos para compartilhar recursos e trocar informações.' },
            { title: 'Cliente e servidor', content: 'Cliente solicita dados e servidor responde com o conteúdo solicitado.', example: 'Navegador acessando um site' },
            { title: 'LAN, WAN e WLAN', content: 'LAN é local, WAN é ampla e WLAN usa redes sem fio.', example: 'Wi-Fi em casa e Internet global' },
          ],
        },
        {
          slug: 'topologias-e-comunicacao',
          title: 'Topologias e comunicação',
          introduction: 'As redes podem ser organizadas em topologias como estrela, barramento, anel e malha, cada uma com vantagens e limitações.',
          why_it_matters: 'A topologia define como os dispositivos se conectam, o que influencia desempenho, redundância e facilidade de manutenção.',
          real_world: 'Uma empresa com vários departamentos geralmente usa topologia em estrela, onde cada área conecta-se ao switch central.',
          explanation: 'Na topologia em estrela, todos os dispositivos se conectam ao mesmo ponto central. Isso facilita a identificação de falhas e melhora a escalabilidade, mas depende de um componente central funcionando corretamente.',
          exercise: 'Qual topologia é mais comum em redes corporativas modernas?',
          challenge: 'Compare uma rede em estrela com uma em barramento em termos de resiliência e manutenção.',
          keywords: ['topologia', 'estrelas', 'barramento', 'malha', 'escalabilidade'],
          sections: [
            { title: 'Topologia em estrela', content: 'Todos os hosts se conectam a um ponto central, geralmente um switch.' },
            { title: 'Topologia em malha', content: 'Há múltiplos caminhos entre dispositivos, o que melhora redundância.', example: 'Redes de backbone' },
            { title: 'Impacto prático', content: 'A escolha da topologia afeta custo, estabilidade e complexidade da operação.', example: 'LAN corporativa' },
          ],
        },
      ],
      quizQuestions: [
        {
          question: 'Qual dispositivo normalmente conecta computadores em uma mesma rede local?',
          options: ['Switch', 'Servidor', 'DNS', 'Firewall'],
          answer: 'Switch',
          explanation: 'O switch encaminha quadros dentro da rede local e ajuda a conectar computadores entre si.',
        },
        {
          question: 'Qual topologia oferece maior redundância entre caminhos de comunicação?',
          options: ['Barramento', 'Estrela', 'Malha', 'Anel'],
          answer: 'Malha',
          explanation: 'Em uma malha, há múltiplos caminhos entre nós, o que reduz a dependência de um único ponto de falha.',
        },
      ],
    },
    {
      slug: 'modelo-osi',
      title: 'Módulo 2 — Modelo OSI',
      stage: 'Básico',
      description: 'As sete camadas, protocolos e a lógica por trás do envio de dados.',
      accent: 'from-sky-500 to-blue-500',
      order_index: 2,
      objective: 'Entender cada camada do modelo OSI e como um pacote percorre a pilha de protocolos.',
      summary: 'O modelo OSI organiza a rede em camadas para facilitar a compreensão e troubleshooting.',
      lessons: [
        {
          slug: 'camadas-osi',
          title: 'As sete camadas do OSI',
          introduction: 'O modelo OSI divide tarefas de comunicação em sete camadas para simplificar o entendimento.',
          why_it_matters: 'Ele ajuda a separar responsabilidades da rede e a diagnosticar falhas de forma organizada.',
          real_world: 'Ao analisar uma conexão de rede, você pode verificar se o problema está em camada física, transporte ou aplicação.',
          explanation: 'Cada camada tem uma função específica. A camada 7 cuida de serviços de aplicação; a camada 3 define roteamento; a camada 2 trabalha com quadros e endereços MAC; a camada 1 cuida do meio físico.',
          exercise: 'Em qual camada o IP opera?',
          challenge: 'Relacione TCP com camada 4, MAC com camada 2 e HTTP com camada 7.',
          keywords: ['camada', 'OSI', 'IP', 'TCP', 'MAC', 'HTTP'],
          sections: [
            { title: '7. Aplicação', content: 'Interage diretamente com o usuário e com serviços como navegação e e-mail.' },
            { title: '4. Transporte', content: 'Garante entrega confiável ou, em alguns protocolos, entrega mais rápida.', example: 'TCP e UDP' },
            { title: '3. Rede', content: 'Define roteamento e endereçamento lógico, como IP.', example: 'IPv4 e IPv6' },
            { title: '2. Enlace', content: 'Responsável pelo acesso ao meio e pelo uso de endereços físicos.', example: 'MAC e Ethernet' },
          ],
        },
        {
          slug: 'diagnostico-por-camada',
          title: 'Diagnóstico por camada',
          introduction: 'Em redes, o problema pode ocorrer em qualquer camada. Saber qual camada está afetada resume muito do trabalho de troubleshooting.',
          why_it_matters: 'Um problema de conectividade pode ter causas distintas: cabo defeituoso, endereço IP inválido, rota quebrada ou serviço indisponível.',
          real_world: 'Quando o site não carrega, uma análise por camadas ajuda a verificar se o problema é de cabo, roteador, DNS, firewall ou aplicação.',
          explanation: 'O profissional de redes usa a abordagem por camadas para reduzir a incerteza: começa pela camada física, depois enlace, rede, transporte e aplicação.',
          exercise: 'Se o sinal de rede não aparece, em que camada você começaria a investigar?',
          challenge: 'Explique como distinguir um problema de físico de um problema de aplicação sem testar tudo ao mesmo tempo.',
          keywords: ['diagnóstico', 'camada física', 'roteamento', 'aplicação', 'troubleshooting'],
          sections: [
            { title: 'Física', content: 'Cabo, fibra, rádio e sinal elétrico podem parar a comunicação.' },
            { title: 'Enlace', content: 'Problemas de MAC, frames e colisão afetam a transmissão local.' },
            { title: 'Aplicação', content: 'O serviço pode estar fora do ar mesmo com a rede funcionando corretamente.', example: 'Servidor web inacessível' },
          ],
        },
      ],
      quizQuestions: [
        {
          question: 'Em qual camada o IP opera?',
          options: ['Camada 2', 'Camada 3', 'Camada 5', 'Camada 7'],
          answer: 'Camada 3',
          explanation: 'O IP é um protocolo de endereçamento e roteamento da camada de rede, a camada 3 do OSI.',
        },
        {
          question: 'Qual camada é normalmente responsável por serviços como HTTP e SMTP?',
          options: ['Camada 1', 'Camada 3', 'Camada 5', 'Camada 7'],
          answer: 'Camada 7',
          explanation: 'A camada de aplicação é a interface direta com serviços e protocolos de software, como HTTP, SMTP e DNS.',
        },
      ],
    },
    {
      slug: 'tcp-ip',
      title: 'Módulo 3 — TCP/IP',
      stage: 'Intermediário',
      description: 'Comparação entre OSI e TCP/IP, encapsulamento e como dados viram pacotes.',
      accent: 'from-violet-500 to-blue-500',
      order_index: 3,
      objective: 'Entender a pilha real utilizada na Internet e a sequência de empacotamento dos dados.',
      summary: 'O modelo TCP/IP é a implementação prática usada pela Internet e pela maioria das redes.',
      lessons: [
        {
          slug: 'encapsulamento',
          title: 'Encapsulamento e desencapsulamento',
          introduction: 'Quando uma mensagem sai do computador, ela vai sendo encapsulada em camadas até virar bits na rede.',
          why_it_matters: 'Esse processo permite que cada camada adicione informações necessárias para transporte, roteamento e entrega.',
          real_world: 'Uma requisição web vira dados, depois segmento TCP, pacote IP, quadro Ethernet e, por fim, bits transmitidos.',
          explanation: 'Dados passam por etapas: aplicação, transporte, internet, acesso ao meio. Em cada etapa, são acrescentados cabeçalhos essenciais para o correto encaminhamento.',
          exercise: 'Qual ordem correta dos pacotes ao sair do computador?',
          challenge: 'Explique por que o encapsulamento é importante para que a mensagem chegue corretamente ao destino.',
          keywords: ['encapsulamento', 'segmento', 'pacote', 'quadro', 'bits'],
          sections: [
            { title: 'Dados', content: 'A aplicação gera a informação que precisa ser transmitida.' },
            { title: 'Segmento', content: 'TCP ou UDP adicionam cabeçalhos de transporte.', example: 'TCP: confiável | UDP: rápido' },
            { title: 'Pacote', content: 'O IP identifica origem e destino entre redes.', example: 'Roteamento' },
            { title: 'Quadro', content: 'No enlace, são adicionados endereços MAC e controle do meio.', example: 'Ethernet' },
          ],
        },
        {
          slug: 'comparacao-osi-e-tcpip',
          title: 'Comparando OSI e TCP/IP',
          introduction: 'O modelo OSI é didático; o TCP/IP é o modelo real usado pela Internet.',
          why_it_matters: 'Conhecer a diferença entre os dois ajuda a interpretar documentação técnica, diagnósticos e protocolos.',
          real_world: 'Ao ler uma especificação de roteamento, você verá camadas de transporte e rede discutidas em termos de TCP/IP, mesmo que o OSI seja usado na aula.',
          explanation: 'O modelo OSI separa as funções em sete camadas para estudo. O TCP/IP agrupa essas funções em uma pilha prática composta por camadas de aplicação, transporte, internet e acesso à rede.',
          exercise: 'Qual modelo é mais usado na prática na Internet?',
          challenge: 'Descreva a correspondência entre a camada 3 do OSI e a camada de Internet do TCP/IP.',
          keywords: ['OSI', 'TCP/IP', 'comparação', 'camadas', 'documentação'],
          sections: [
            { title: 'Aplicação', content: 'HTTP, DNS e FTP são exemplos de protocolos da camada de aplicação.' },
            { title: 'Transporte', content: 'TCP e UDP atuam no transporte de dados entre aplicações.' },
            { title: 'Internet', content: 'IP e roteamento formam a base de encaminhamento de pacotes entre redes.' },
          ],
        },
      ],
      quizQuestions: [
        {
          question: 'Qual termo descreve a criação de cabeçalhos e encapsulamento ao longo das camadas?',
          options: ['Multiplexação', 'Encapsulamento', 'Segmentação', 'NAT'],
          answer: 'Encapsulamento',
          explanation: 'O encapsulamento é o processo de adicionar cabeçalhos em cada camada do modelo para que o pacote possa ser transportado corretamente.',
        },
        {
          question: 'Qual modelo é usado de forma prática na Internet?',
          options: ['Modelo de referência da ISO', 'TCP/IP', 'Modelo de VLAN', 'Modelo de cabos'],
          answer: 'TCP/IP',
          explanation: 'A Internet e a maioria das redes do mundo usam a arquitetura TCP/IP como base real de comunicação.',
        },
      ],
    },
    {
      slug: 'ipv4',
      title: 'Módulo 4 — IPv4',
      stage: 'Intermediário',
      description: 'Endereçamento IPv4, octetos, redes privadas e públicas, gateway e máscara.',
      accent: 'from-cyan-500 to-teal-400',
      order_index: 4,
      objective: 'Aprender como identificar rede, host, gateway e sub-redes em endereços IPv4.',
      summary: 'IPv4 é o endereço lógico que identifica hosts na Internet e em redes locais.',
      lessons: [
        {
          slug: 'enderecos-ipv4',
          title: 'Endereços IPv4',
          introduction: 'IPv4 usa 32 bits e é representado por quatro octetos separados por pontos, por exemplo 192.168.10.130.',
          why_it_matters: 'Sem endereços IP, computadores não conseguiriam identificar uns aos outros e enviar dados com destino correto.',
          real_world: 'Cada dispositivo em uma rede recebe um IP que serve como identidade lógica.',
          explanation: 'Um endereço IPv4 é dividido em partes que ajudam a localizar a rede e o host. A máscara define quantos bits pertencem à rede e quantos pertencem ao host.',
          exercise: 'Quantos bits possui um IPv4?',
          challenge: 'Explique a diferença entre IP público e IP privado.',
          keywords: ['IPv4', 'octeto', 'gateway', 'mascara', 'host', 'rede'],
          sections: [
            { title: 'IPv4', content: 'Endereço de 32 bits em formato decimal com quatro octetos.' },
            { title: 'IP privado x público', content: 'Privados são usados em redes locais; públicos são usados na Internet.' },
            { title: 'Gateway', content: 'Ponto de saída para outras redes e Internet.', example: '192.168.1.1' },
          ],
        },
        {
          slug: 'subrede-e-mascara',
          title: 'Máscara e segmentação',
          introduction: 'A máscara define quão grande é a rede e quantos endereços estão disponíveis para os dispositivos.',
          why_it_matters: 'Quando a rede cresce, é necessário segmentá-la para reduzir conflitos e facilitar a gestão.',
          real_world: 'Um departamento de TI pode separar salas, servidores e equipamentos de produção em diferentes faixas de IP.',
          explanation: 'O cálculo de máscara e rede permite separar a parte da rede da parte do host. Isso é essencial para o roteamento e para o uso eficiente do espaço de endereçamento.',
          exercise: 'Como você identifica a parte da rede em um endereço IPv4?',
          challenge: 'Qual é a diferença entre um endereço de rede e um endereço de host?',
          keywords: ['máscara', 'rede', 'host', 'segmentação', 'faixa de IP'],
          sections: [
            { title: 'Máscara', content: 'A máscara indica quantos bits são usados para representar a rede.' },
            { title: 'Rede', content: 'A rede é a faixa lógica onde os dispositivos se comunicam.' },
            { title: 'Host', content: 'O host é o equipamento individual dentro daquela rede.', example: 'PC, impressora, servidor' },
          ],
        },
      ],
      quizQuestions: [
        {
          question: 'Qual é a quantidade de bits de um endereço IPv4?',
          options: ['16 bits', '24 bits', '32 bits', '64 bits'],
          answer: '32 bits',
          explanation: 'O IPv4 é um endereço de 32 bits, representado em quatro octetos.',
        },
        {
          question: 'Qual dos itens abaixo normalmente representa o endereço de saída da rede local?',
          options: ['DNS', 'Gateway', 'Broadcast', 'Mascara'],
          answer: 'Gateway',
          explanation: 'O gateway é o ponto de saída para outras redes e para a Internet, sendo essencial para comunicação externa.',
        },
      ],
    },
    {
      slug: 'subnetting',
      title: 'Módulo 5 — Subnetting',
      stage: 'Intermediário',
      description: 'Divisão de redes, máscara, network address, broadcast e cálculo de hosts.',
      accent: 'from-emerald-500 to-cyan-500',
      order_index: 5,
      objective: 'Aprender a calcular uma sub-rede, identificar faixa de hosts e entender o uso prático da segmentação.',
      summary: 'Subnetting é a divisão de uma rede em sub-redes menores para organização e eficiência.',
      lessons: [
        {
          slug: 'subnetting-pratico',
          title: 'Subnetting prático',
          introduction: 'Quando uma rede cresce demais, ela pode ser dividida em sub-redes menores para melhorar organização, segurança e gerenciamento.',
          why_it_matters: 'A segmentação reduz conflitos, melhora tráfego e evita que uma falha afete a rede inteira.',
          real_world: 'Uma empresa pode separar redes de administração, clientes e produção em sub-redes diferentes.',
          explanation: 'A máscara define quantos bits são usados para rede e quantos restam para hosts. Isso influencia a quantidade de sub-redes e de endereços disponíveis.',
          exercise: 'Calcule a rede para o IP 192.168.10.130/26.',
          challenge: 'Qual seria a faixa de host dessa sub-rede e qual o endereço de broadcast?',
          keywords: ['subnetting', 'broadcast', 'network', 'host', 'máscara'],
          sections: [
            { title: 'Mask /26', content: 'A máscara /26 usa 26 bits para rede e 6 bits para hosts.' },
            { title: 'Network', content: 'O endereço de rede define o início da faixa da sub-rede.' },
            { title: 'Broadcast', content: 'O último endereço da sub-rede é usado para comunicação para todos os hosts.' },
          ],
        },
        {
          slug: 'dimensionamento-de-rede',
          title: 'Dimensionamento de rede',
          introduction: 'Ao planejar uma rede, o administrador precisa estimar quantos hosts serão necessários e em quanto espaço cada sub-rede deve crescer.',
          why_it_matters: 'Dimensionar corretamente evita escassez de endereços e reduces custos com reestruturação.',
          real_world: 'Uma escola pode criar várias sub-redes para laboratório, administração, fibra e Wi-Fi sem que uma área compete por IPs com outra.',
          explanation: 'A partir do número de hosts esperados, o administrador decide a máscara e o tamanho da sub-rede. Essa decisão precisa pensar em crescimento futuro e segurança.',
          exercise: 'Quando um ambiente exige mais sub-redes do que hosts, qual fator você ajusta primeiro?',
          challenge: 'Explique por que redes pequenas demais costumam gerar problemas de crescimento e manutenção.',
          keywords: ['dimensionamento', 'capacidade', 'host', 'rede', 'margem de expansão'],
          sections: [
            { title: 'Capacidade prevista', content: 'O número de dispositivos atuais deve ser estimado de forma realista.' },
            { title: 'Reserva de crescimento', content: 'Uma rede precisa ter um buffer para novos equipamentos e expansão.' },
            { title: 'Segmentação lógica', content: 'Separar áreas e serviços reduz problemas de colisão e movimento de tráfego.', example: 'LAN administrativa vs Wi-Fi' },
          ],
        },
      ],
      quizQuestions: [
        {
          question: 'O que representa o endereço de broadcast em uma sub-rede?',
          options: ['Primeiro endereço da rede', 'Último endereço da rede', 'Gateway padrão', 'DNS primário'],
          answer: 'Último endereço da rede',
          explanation: 'O broadcast é o último endereço da faixa e serve para enviar uma mensagem para todos os dispositivos da sub-rede.',
        },
        {
          question: 'Qual benefício principal do subnetting?',
          options: ['Aumentar a velocidade da Internet', 'Dividir a rede em segmentos menores', 'Trocar o switch por roteador', 'Remover o DNS'],
          answer: 'Dividir a rede em segmentos menores',
          explanation: 'O subnetting separa a rede em sub-redes menores para organização, segurança e gerenciamento mais eficiente.',
        },
      ],
    },
    {
      slug: 'mac-e-arp',
      title: 'Módulo 6 — MAC e ARP',
      stage: 'Intermediário',
      description: 'Endereço MAC, resolução ARP e a relação com o IP na rede local.',
      accent: 'from-indigo-500 to-cyan-400',
      order_index: 6,
      objective: 'Entender como computadores descobrem o endereço MAC de um destino usando ARP.',
      summary: 'ARP resolve endereços IP em endereços MAC de dispositivos na mesma rede local.',
      lessons: [
        {
          slug: 'arp-e-mac',
          title: 'MAC e ARP',
          introduction: 'IP e MAC têm papéis diferentes: um identifica a rede lógica e o outro identifica o equipamento físico na rede local.',
          why_it_matters: 'Quando um computador precisa enviar dados para outro dentro da mesma rede, ele precisa conhecer a MAC de destino.',
          real_world: 'Um PC com IP 192.168.1.20 envia um ARP Request para descobrir a MAC correspondente.',
          explanation: 'O ARP faz um pedido de broadcast: “Quem possui este IP?” A máquina correta responde com o endereço MAC. Depois disso, a comunicação local pode ocorrer.',
          exercise: 'Qual informação o ARP normalmente resolve?',
          challenge: 'Explique por que o ARP não é usado para comunicação entre redes diferentes.',
          keywords: ['MAC', 'ARP', 'broadcast', 'gateway', 'rede local'],
          sections: [
            { title: 'IP vs MAC', content: 'IP é lógico e MAC é físico; ambos são importantes para comunicação local e global.' },
            { title: 'ARP Request', content: 'Pedido de quem possui um determinado IP dentro da rede.' },
            { title: 'ARP Reply', content: 'Resposta com o endereço MAC encontrado.', example: 'AA:BB:CC:DD:EE:FF' },
          ],
        },
        {
          slug: 'camadas-de-enlace',
          title: 'Camada de enlace e switch',
          introduction: 'A camada de enlace cuida do acesso ao meio e da entrega local, sendo a base da comunicação entre dispositivos na mesma rede.',
          why_it_matters: 'Sem a camada de enlace, o roteamento não saberia como entregar um quadro para o próximo salto da rede.',
          real_world: 'Quando um computador envia dados para outro da mesma LAN, o switch usa o endereço MAC para decidir para qual porta entregar o quadro.',
          explanation: 'O switch mantém uma tabela que mapeia endereços MAC às portas do equipamento. Isso reduz a necessidade de transmitir para todos os dispositivos da rede.',
          exercise: 'Qual informação o switch usa para encaminhar um quadro localmente?',
          challenge: 'Explique a diferença entre um endereço MAC e um endereço IP no contexto de switch e roteador.',
          keywords: ['switch', 'MAC', 'porta', 'enlace', 'tabela CAM'],
          sections: [
            { title: 'Switch', content: 'O switch encaminha quadros com base em endereços MAC conhecidos.' },
            { title: 'Tabela CAM', content: 'O switch aprende qual porta pertence a cada MAC e otimiza a entrega local.' },
            { title: 'Roteador', content: 'O roteador trabalha com IP e encaminha pacotes entre redes diferentes.', example: 'gateway da casa' },
          ],
        },
      ],
      quizQuestions: [
        {
          question: 'Qual informação o ARP normalmente resolve?',
          options: ['DNS para IP', 'IP para MAC', 'MAC para porta', 'IP para gateway'],
          answer: 'IP para MAC',
          explanation: 'O ARP mapeia endereços IP para endereços MAC da mesma rede local.',
        },
        {
          question: 'Qual equipamento usa a tabela de MAC para encaminhar quadros dentro da LAN?',
          options: ['Servidor DNS', 'Switch', 'Roteador', 'Firewall'],
          answer: 'Switch',
          explanation: 'O switch aprende endereços MAC das portas e encaminha quadros localmente com base nessa tabela.',
        },
      ],
    },
    {
      slug: 'tcp-udp',
      title: 'Módulo 7 — TCP e UDP',
      stage: 'Intermediário',
      description: 'Diferenças entre transporte confiável e transporte rápido.',
      accent: 'from-blue-600 to-cyan-500',
      order_index: 7,
      objective: 'Definir quando usar TCP ou UDP e entender os impactos de confiabilidade e velocidade.',
      summary: 'TCP é orientado à conexão e confiável; UDP é leve e rápido, com menor overhead.',
      lessons: [
        {
          slug: 'tcp-vs-udp',
          title: 'TCP vs UDP',
          introduction: 'TCP e UDP são protocolos da camada de transporte. Cada um atende a cenários diferentes.',
          why_it_matters: 'Escolher o protocolo certo impacta desempenho, confiabilidade e uso de recursos.',
          real_world: 'HTTPS usa TCP porque exige confiabilidade, enquanto DNS e streaming costumam usar UDP quando velocidade é prioritária.',
          explanation: 'TCP estabelece conexão, confirma recebimento e reconecta se necessário. UDP envia dados sem confirmação, o que reduz atraso e overhead.',
          exercise: 'Para que tipo de serviço você usaria UDP?',
          challenge: 'Compare HTTPS, SSH, DNS e VoIP em termos de confiabilidade e velocidade.',
          keywords: ['TCP', 'UDP', 'confiabilidade', 'overhead', 'velocidade'],
          sections: [
            { title: 'TCP', content: 'Confiável, orientado a conexão e com confirmação de entrega.', example: 'HTTPS, SSH, FTP' },
            { title: 'UDP', content: 'Mais rápido e leve, sem garantia de entrega de cada pacote.', example: 'DNS, VoIP, streaming' },
          ],
        },
        {
          slug: 'controle-de-fluxo-e-portas',
          title: 'Portas e controle de fluxo',
          introduction: 'Além do protocolo, a camada de transporte usa portas para distinguir aplicações e fluxos de comunicação.',
          why_it_matters: 'Sem portas, o sistema não saberia separar tráfego de web, e-mail, SSH ou videoconferência.',
          real_world: 'Um servidor web pode receber múltiplas conexões ao mesmo tempo em portas 80 e 443, enquanto o e-mail usa 25, 110 ou 993.',
          explanation: 'As portas são identificadores lógicos de serviços dentro de um host. TCP e UDP utilizam esse mecanismo para entregar os dados ao aplicativo correto.',
          exercise: 'Por que as portas são importantes na camada de transporte?',
          challenge: 'Explique como um servidor pode atender vários clientes ao mesmo tempo usando diferentes portas e conexões.',
          keywords: ['portas', 'fluxo', 'TCP', 'UDP', 'aplicação'],
          sections: [
            { title: 'Portas', content: 'Identificam o serviço ou processo receptor em um host.', example: '443 para HTTPS' },
            { title: 'Fluxos', content: 'Múltiplas conexões podem coexistir em um mesmo host sem mistura de dados.' },
            { title: 'Overhead', content: 'TCP paga custo extra por confiabilidade; UDP reduz esse custo em troca de garantia.', example: 'VoIP' },
          ],
        },
      ],
      quizQuestions: [
        {
          question: 'Qual protocolo é mais adequado para uma aplicação que exige entrega confiável, como HTTPS?',
          options: ['UDP', 'TCP', 'ARP', 'ICMP'],
          answer: 'TCP',
          explanation: 'TCP oferece controle de conexão, confirmação e retransmissão, adequando-se bem a aplicações que não podem perder dados.',
        },
        {
          question: 'Qual recurso permite que o computador distinga serviços diferentes em um mesmo host?',
          options: ['Gateway', 'Porta', 'Broadast', 'VLAN'],
          answer: 'Porta',
          explanation: 'Portas diferenciam serviços e aplicações no mesmo endereço IP, permitindo a multidão de conexões simultâneas.',
        },
      ],
    },
    {
      slug: 'dns',
      title: 'Módulo 8 — DNS',
      stage: 'Intermediário',
      description: 'Resolução de nomes, servidores e registros DNS.',
      accent: 'from-purple-500 to-blue-500',
      order_index: 8,
      objective: 'Entender como um nome de domínio é convertido em IP e por que o DNS é essencial para a web.',
      summary: 'DNS traduz nomes amigáveis em endereços IP para que o computador encontre o serviço correto.',
      lessons: [
        {
          slug: 'resolucao-dns',
          title: 'Resolução de nomes',
          introduction: 'Você digita um nome como exemplo.com, mas a máquina precisa descobrir o IP desse site.',
          why_it_matters: 'Sem DNS, seria impossível navegar com nomes fáceis de lembrar.',
          real_world: 'O navegador consulta vários servidores DNS até encontrar o endereço correto do domínio.',
          explanation: 'O fluxo começa no resolver local, passa por servidores raiz, TLD e autoritativos, e finalmente obtém o IP do domínio solicitado.',
          exercise: 'Qual a função do DNS?',
          challenge: 'Explique o papel dos servidores root, TLD e autoritativos no processo de resolução.',
          keywords: ['DNS', 'resolver', 'TLD', 'registro', 'A', 'AAAA'],
          sections: [
            { title: 'Fluxo de resolução', content: 'Computador → Resolver → Root → TLD → Autoritativo → IP' },
            { title: 'Registros comuns', content: 'A, AAAA, MX, CNAME, TXT e NS.', example: 'A = IPv4' },
          ],
        },
        {
          slug: 'cache-e-recursos-dns',
          title: 'Cache e disponibilidade',
          introduction: 'O DNS usa cache para acelerar consultas repetidas e evitar que o sistema consulte os servidores raiz toda vez.',
          why_it_matters: 'Cache eficiente melhora a velocidade da navegação e reduz a carga sobre os servidores de nomes.',
          real_world: 'Ao acessar sites frequentes, o sistema reaproveita respostas anteriores e reduz a latência.',
          explanation: 'Os clientes, roteadores e resolvers armazenam resultados temporários. Quando o TTL expira, a consulta é renovada.',
          exercise: 'Qual é a vantagem de manter um cache DNS?',
          challenge: 'Como a expiração do TTL influencia a atualização de registros e a disponibilidade do serviço?',
          keywords: ['cache', 'TTL', 'resolver', 'latência', 'disponibilidade'],
          sections: [
            { title: 'TTL', content: 'Tempo de vida do registro em cache antes de nova consulta.' },
            { title: 'Cache local', content: 'Os clientes e dispositivos armazenam respostas frequentes para reduzir tempo de resolução.' },
            { title: 'DNS e segurança', content: 'Registros mal configurados podem afetar a disponibilidade e o roteamento de tráfego.', example: 'CNAME errado' },
          ],
        },
      ],
      quizQuestions: [
        {
          question: 'Qual é a função principal do DNS?',
          options: ['Conectar switches', 'Traduzir nome para IP', 'Bloquear portas', 'Gerenciar VLANs'],
          answer: 'Traduzir nome para IP',
          explanation: 'O DNS converte nomes de domínio em endereços IP para que os dados sejam enviados ao destino correto.',
        },
        {
          question: 'O que significa TTL em um registro DNS?',
          options: ['Tempo de transição do provedor', 'Tempo de vida do registro em cache', 'Tempo de entrega do roteador', 'Tempo total de login'],
          answer: 'Tempo de vida do registro em cache',
          explanation: 'TTL define por quanto tempo uma resposta DNS pode permanecer armazenada em cache antes de ser atualizada.',
        },
      ],
    },
    {
      slug: 'dhcp',
      title: 'Módulo 9 — DHCP',
      stage: 'Intermediário',
      description: 'Negociação automática de IP, máscara, gateway e DNS.',
      accent: 'from-cyan-500 to-green-400',
      order_index: 9,
      objective: 'Entender o processo DORA e a automação da configuração de rede.',
      summary: 'DHCP entrega automaticamente as configurações básicas para hosts conectarem-se à rede.',
      lessons: [
        {
          slug: 'dora',
          title: 'DORA e entrega de endereços',
          introduction: 'Quando um dispositivo entra na rede, ele envia uma solicitação para receber configuração automaticamente.',
          why_it_matters: 'Sem DHCP, cada computador precisaria ser configurado manualmente.',
          real_world: 'Smartphones, laptops e impressoras recebem IP, máscara, gateway e DNS sem intervenção do usuário.',
          explanation: 'O processo DORA é: Discover, Offer, Request e Acknowledge. O servidor responde com endereço e parâmetros de rede.',
          exercise: 'Qual o papel do DHCP?',
          challenge: 'Descreva como o DHCP entrega IP, máscara, gateway e DNS a um dispositivo recém-conectado.',
          keywords: ['DHCP', 'DORA', 'DISCOVER', 'OFFER', 'ACK'],
          sections: [
            { title: 'DISCOVER', content: 'Host envia mensagem para localizar um servidor DHCP.' },
            { title: 'OFFER', content: 'Servidor oferece um endereço e parâmetros de rede.' },
            { title: 'REQUEST', content: 'Host solicita a oferta recebida.' },
            { title: 'ACK', content: 'Servidor confirma e entrega a configuração.', example: 'IP, máscara, gateway, DNS' },
          ],
        },
        {
          slug: 'alocacao-e-renovacao',
          title: 'Alocação e renovação de leases',
          introduction: 'Cada endereço atribuído pelo DHCP tem um tempo de validade, conhecido como lease. Quando o tempo termina, o cliente precisa renovar a concessão.',
          why_it_matters: 'Isso evita address conflicts e garante que a rede mantenha controle eficiente do espaço de endereçamento.',
          real_world: 'Em ambientes com notebooks e celulares móveis, clientes entram e saem da rede com frequência e o DHCP faz a gestão automática.',
          explanation: 'O servidor atribui um lease temporário. Caso o cliente permaneça na rede, ele renova automaticamente. Se o lease expira e o equipamento não se comunica mais, o endereço volta ao pool.',
          exercise: 'Qual é a função do lease DHCP?',
          challenge: 'Explique o que acontece quando um dispositivo se conecta, fica offline e depois volta à mesma rede.',
          keywords: ['lease', 'renovação', 'pool', 'endereço', 'disponibilidade'],
          sections: [
            { title: 'Lease', content: 'O endereço é concedido por tempo limitado para controle do pool.' },
            { title: 'Renovação', content: 'O cliente solicita que o lease seja prolongado antes do vencimento.' },
            { title: 'Recuperação', content: 'Se o endereço expira, o servidor pode reutilizá-lo para outros dispositivos.', example: 'Móveis e laptops' },
          ],
        },
      ],
      quizQuestions: [
        {
          question: 'Qual etapa do processo DORA corresponde à confirmação final do endereço?',
          options: ['DISCOVER', 'OFFER', 'REQUEST', 'ACK'],
          answer: 'ACK',
          explanation: 'A etapa ACK confirma ao cliente que a configuração foi aceita e atribuída.',
        },
        {
          question: 'Qual é a finalidade do lease DHCP?',
          options: ['Bloquear o acesso à Internet', 'Definir validade do endereço fornecido', 'Trocar a porta do switch', 'Substituir o roteador'],
          answer: 'Definir validade do endereço fornecido',
          explanation: 'O lease define quanto tempo o IP ficará disponível para o cliente antes de precisar renovação ou retorno ao pool.',
        },
      ],
    },
  ];
}

function ensureDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      stage TEXT NOT NULL,
      description TEXT NOT NULL,
      accent TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      objective TEXT NOT NULL,
      summary TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      introduction TEXT NOT NULL,
      why_it_matters TEXT NOT NULL,
      real_world TEXT NOT NULL,
      explanation TEXT NOT NULL,
      exercise TEXT NOT NULL,
      challenge TEXT NOT NULL,
      keywords TEXT NOT NULL,
      sections TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (module_id) REFERENCES modules(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (module_id) REFERENCES modules(id)
    );

    CREATE TABLE IF NOT EXISTS glossary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT UNIQUE NOT NULL,
      definition TEXT NOT NULL,
      technical_definition TEXT NOT NULL,
      example TEXT NOT NULL,
      related TEXT NOT NULL
    );
  `);

  const moduleCount = db.prepare('SELECT COUNT(*) as count FROM modules').get() as { count: number };
  const lessonCount = db.prepare('SELECT COUNT(*) as count FROM lessons').get() as { count: number };
  const questionCount = db.prepare('SELECT COUNT(*) as count FROM quiz_questions').get() as { count: number };
  const needsSeed = moduleCount.count === 0 || lessonCount.count < moduleCount.count * 2 || questionCount.count < moduleCount.count * 2;

  if (needsSeed) {
    db.exec(`
      DELETE FROM quiz_questions;
      DELETE FROM lessons;
      DELETE FROM modules;
      DELETE FROM glossary;
    `);

    const modules = createSeedModules();
    const saveModule = db.prepare(`INSERT INTO modules (slug, title, stage, description, accent, order_index, objective, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    const saveLesson = db.prepare(`INSERT INTO lessons (module_id, slug, title, introduction, why_it_matters, real_world, explanation, exercise, challenge, keywords, sections, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const saveQuiz = db.prepare(`INSERT INTO quiz_questions (module_id, question, options, answer, explanation, sort_order) VALUES (?, ?, ?, ?, ?, ?)`);
    const saveTerm = db.prepare(`INSERT INTO glossary (term, definition, technical_definition, example, related) VALUES (?, ?, ?, ?, ?)`);

    for (const module of modules) {
      const moduleResult = saveModule.run(
        module.slug,
        module.title,
        module.stage,
        module.description,
        module.accent,
        module.order_index,
        module.objective,
        module.summary,
      ) as { lastInsertRowid: number };

      for (const [index, lesson] of module.lessons.entries()) {
        saveLesson.run(
          moduleResult.lastInsertRowid,
          lesson.slug,
          lesson.title,
          lesson.introduction,
          lesson.why_it_matters,
          lesson.real_world,
          lesson.explanation,
          lesson.exercise,
          lesson.challenge,
          JSON.stringify(lesson.keywords),
          JSON.stringify(lesson.sections),
          index + 1,
        );
      }

      for (const [index, question] of module.quizQuestions.entries()) {
        saveQuiz.run(moduleResult.lastInsertRowid, question.question, JSON.stringify(question.options), question.answer, question.explanation, index + 1);
      }
    }

    for (const term of getSeedGlossary()) {
      saveTerm.run(term.term, term.definition, term.technical_definition, term.example, term.related);
    }
  }

  return db;
}

function getSeedGlossary() {
  return [
    { term: 'ARP', definition: 'Protocolo usado para descobrir o endereço MAC associado a um IP local.', technical_definition: 'Address Resolution Protocol', example: 'PC pergunta quem possui 192.168.1.10', related: 'MAC, TCP/IP, redes locais' },
    { term: 'DNS', definition: 'Sistema que converte nomes em endereços IP.', technical_definition: 'Domain Name System', example: 'google.com → 142.250.219.14', related: 'Internet, aplicação, resolução de nomes' },
    { term: 'Gateway', definition: 'Ponto que conecta a rede local com outras redes.', technical_definition: 'Default gateway', example: '192.168.1.1', related: 'roteador, rede local, Internet' },
    { term: 'IP', definition: 'Identificador lógico de um dispositivo na rede.', technical_definition: 'Internet Protocol', example: '192.168.10.130', related: 'IPv4, IPv6, roteamento' },
    { term: 'Router', definition: 'Dispositivo que encaminha pacotes entre redes diferentes.', technical_definition: 'Roteador', example: 'Conecta rede doméstica à Internet', related: 'gateway, NAT, roteamento' },
    { term: 'Switch', definition: 'Dispositivo que conecta computadores na mesma rede local.', technical_definition: 'Comutador Ethernet', example: 'Conecta PCs de um escritório', related: 'MAC, VLAN, LAN' },
    { term: 'TCP', definition: 'Protocolo confiável e orientado a conexão.', technical_definition: 'Transmission Control Protocol', example: 'HTTPS e FTP', related: 'UDP, transporte, confiabilidade' },
    { term: 'UDP', definition: 'Protocolo leve, rápido e sem confirmação de entrega.', technical_definition: 'User Datagram Protocol', example: 'DNS e VoIP', related: 'TCP, transmissão, streaming' },
    { term: 'VLAN', definition: 'Rede lógica separada dentro de um mesmo switch físico.', technical_definition: 'Virtual Local Area Network', example: 'VLAN 10 para administração', related: 'switch, isolamento, segurança' },
    { term: 'WAN', definition: 'Rede de grande alcance que liga redes locais e geograficamente separadas.', technical_definition: 'Wide Area Network', example: 'Internet', related: 'LAN, Internet, ISP' },
  ];
}

export function getDatabase() {
  return ensureDatabase();
}

export function getModules() {
  const db = getDatabase();
  const rows = db.prepare(`SELECT * FROM modules ORDER BY order_index ASC`).all() as any[];

  return rows.map((module) => ({
    ...module,
    lessons: db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order ASC').all(module.id).map((lesson) => ({
      ...lesson,
      keywords: JSON.parse(lesson.keywords || '[]'),
      sections: JSON.parse(lesson.sections || '[]'),
    })),
    quizQuestions: db.prepare('SELECT * FROM quiz_questions WHERE module_id = ? ORDER BY sort_order ASC').all(module.id).map((question) => ({
      ...question,
      options: JSON.parse(question.options || '[]'),
    })),
  }));
}

export function getModuleBySlug(slug: string) {
  const db = getDatabase();
  const module = db.prepare('SELECT * FROM modules WHERE slug = ?').get(slug) as any;
  if (!module) return null;

  const lessons = db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order ASC').all(module.id).map((lesson) => ({
    ...lesson,
    keywords: JSON.parse(lesson.keywords || '[]'),
    sections: JSON.parse(lesson.sections || '[]'),
  }));

  const quizQuestions = db.prepare('SELECT * FROM quiz_questions WHERE module_id = ? ORDER BY sort_order ASC').all(module.id).map((question) => ({
    ...question,
    options: JSON.parse(question.options || '[]'),
  }));

  return { ...module, lessons, quizQuestions };
}

export function getGlossaryTerms() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM glossary ORDER BY term ASC').all() as GlossaryTerm[];
  return rows;
}
