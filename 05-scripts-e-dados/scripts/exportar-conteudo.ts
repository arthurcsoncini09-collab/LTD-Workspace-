/**
 * Gera a documentação em Markdown (03-conteudo) e o JSON de seed (05-scripts-e-dados)
 * a partir do conteúdo real do site em lib/content.
 *
 * Uso: npm run docs:conteudo
 */
import fs from 'fs';
import path from 'path';
import { CONTENT_VERSION, glossary, modules } from '../../lib/content';
import type { LessonSection, ModuleSeed, SectionTable } from '../../lib/content/types';

const ROOT = path.join(__dirname, '..', '..');
const CONTEUDO = path.join(ROOT, '03-conteudo');
const AVISO = '<!-- Arquivo gerado por `npm run docs:conteudo` a partir de lib/content. Edite o conteúdo lá, não aqui. -->';

const fileName = (mod: ModuleSeed, index: number) => `${String(index + 1).padStart(2, '0')}-${mod.slug}.md`;
const shortTitle = (title: string) => title.replace(/^Módulo \d+\s*—\s*/, '');
const cell = (text: string) => text.replace(/\|/g, '\\|');

function table({ headers, rows }: SectionTable) {
  return [
    `| ${headers.map(cell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(cell).join(' | ')} |`),
  ].join('\n');
}

function section(s: LessonSection) {
  const out = [`#### ${s.title}${s.collapsed ? ' (conteúdo oculto no site)' : ''}`];
  if (s.content) out.push(s.content);
  if (s.items) out.push(s.items.map((item) => `- ${item}`).join('\n'));
  if (s.steps) out.push(s.steps.map((step, i) => `${i + 1}. ${step}`).join('\n'));
  if (s.table) out.push(table(s.table));
  if (s.code) out.push('```\n' + s.code + '\n```');
  if (s.example) out.push(`**Exemplo:** ${s.example}`);
  return out.join('\n\n');
}

function moduleMarkdown(mod: ModuleSeed, index: number) {
  const d = mod.details;
  const parts = [
    AVISO,
    `# ${mod.title}`,
    `**Nível:** ${mod.stage} · **Aulas:** ${mod.lessons.length} · **Questões:** ${mod.quizQuestions.length} · **No site:** \`/aulas/${mod.slug}\``,
    `> ${mod.description}`,
    `**Objetivo:** ${mod.objective}`,
    mod.summary,
    '## Objetivos de aprendizagem',
    d.objectives.map((o) => `- ${o}`).join('\n'),
  ];

  mod.lessons.forEach((lesson, i) => {
    parts.push(
      `## Aula ${i + 1} — ${lesson.title}`,
      `**Palavras-chave:** ${lesson.keywords.join(', ')}`,
      `### Introdução\n\n${lesson.introduction}`,
      `### Por que isso importa\n\n${lesson.why_it_matters}`,
      `### Explicação\n\n${lesson.explanation}`,
      '### Conteúdo',
      ...lesson.sections.map(section),
      `### Contexto real\n\n${lesson.real_world}`,
      `### Exercício\n\n${lesson.exercise}\n\n<details><summary>Resposta</summary>\n\n${lesson.exercise_answer}\n\n</details>`,
      `### Desafio\n\n${lesson.challenge}`,
    );
  });

  parts.push(
    '## Comandos úteis',
    ...d.commands.map((c) => `**${c.title}** (${c.platform})\n\n\`\`\`\n${c.code}\n\`\`\`${c.note ? `\n\n${c.note}` : ''}`),
    '## Erros comuns e troubleshooting',
    table({ headers: ['Problema', 'Solução'], rows: d.pitfalls.map((p) => [p.problem, p.solution]) }),
    '## Segurança',
    d.security.map((s) => `- ${s}`).join('\n'),
    '## Pontos-chave',
    d.keyPoints.map((k) => `- ${k}`).join('\n'),
    `## Laboratório: ${d.lab.title}`,
    `**Objetivo:** ${d.lab.goal}\n\n**Ferramentas:** ${d.lab.tools}`,
    d.lab.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    `**Resultado esperado:** ${d.lab.expected}`,
    `## ${mod.slug === 'desafio-final' ? 'Prova final' : 'Quiz'}`,
    `Gabarito em [../quizzes/${fileName(mod, index)}](../quizzes/${fileName(mod, index)}).`,
    '## Leituras recomendadas',
    d.references.map((r) => `- ${r}`).join('\n'),
  );

  return parts.join('\n\n') + '\n';
}

function quizMarkdown(mod: ModuleSeed) {
  return (
    [
      AVISO,
      `# Quiz — ${mod.title}`,
      ...mod.quizQuestions.map((q, i) =>
        [
          `## ${i + 1}. ${q.question}`,
          q.options.map((o) => `- ${o === q.answer ? `**${o}** ✅` : o}`).join('\n'),
          `**Explicação:** ${q.explanation}`,
        ].join('\n\n'),
      ),
    ].join('\n\n') + '\n'
  );
}

function write(relative: string, content: string) {
  const target = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function clearGenerated(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) if (/^\d{2}-.+\.md$/.test(file)) fs.unlinkSync(path.join(dir, file));
}

clearGenerated(path.join(CONTEUDO, 'modulos'));
clearGenerated(path.join(CONTEUDO, 'quizzes'));

const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
const totalQuestions = modules.reduce((n, m) => n + m.quizQuestions.length, 0);

modules.forEach((mod, i) => {
  write(`03-conteudo/modulos/${fileName(mod, i)}`, moduleMarkdown(mod, i));
  write(`03-conteudo/quizzes/${fileName(mod, i)}`, quizMarkdown(mod));
});

write(
  '03-conteudo/modulos/index.md',
  [
    AVISO,
    '# Módulos',
    `${modules.length} módulos · ${totalLessons} aulas · ${totalQuestions} questões · versão do conteúdo ${CONTENT_VERSION}.`,
    'O conteúdo-fonte fica em `lib/content/modules/` (um arquivo por módulo). Ao alterá-lo, incremente `CONTENT_VERSION` em `lib/content/index.ts` (o banco é recriado automaticamente) e rode `npm run docs:conteudo` para atualizar esta pasta.',
    table({
      headers: ['#', 'Módulo', 'Nível', 'Aulas', 'Questões', 'Documento'],
      rows: modules.map((m, i) => [String(i + 1), shortTitle(m.title), m.stage, String(m.lessons.length), String(m.quizQuestions.length), `[${fileName(m, i)}](${fileName(m, i)})`]),
    }),
  ].join('\n\n') + '\n',
);

write(
  '03-conteudo/aulas/index.md',
  [
    AVISO,
    '# Aulas',
    `Todas as ${totalLessons} aulas, agrupadas por módulo. O texto completo de cada aula está no documento do módulo.`,
    ...modules.map((m, i) =>
      [`## ${m.title}`, m.lessons.map((l, j) => `${j + 1}. [${l.title}](../modulos/${fileName(m, i)}) — site: \`/aulas/${m.slug}#${l.slug}\``).join('\n')].join('\n\n'),
    ),
  ].join('\n\n') + '\n',
);

write(
  '03-conteudo/quizzes/lista.md',
  [
    AVISO,
    '# Quizzes',
    `${totalQuestions} questões com explicação. Cada módulo tem seu quiz no fim da aula e na página \`/quizzes\`; o Desafio Final traz a prova final. A melhor nota de cada módulo fica salva no navegador do aluno.`,
    'A resposta (`answer`) de cada questão precisa ser exatamente igual a uma das opções (`options`).',
    table({
      headers: ['#', 'Módulo', 'Questões', 'Gabarito'],
      rows: modules.map((m, i) => [String(i + 1), shortTitle(m.title), String(m.quizQuestions.length), `[${fileName(m, i)}](${fileName(m, i)})`]),
    }),
  ].join('\n\n') + '\n',
);

write(
  '03-conteudo/glossario/termos.md',
  [
    AVISO,
    '# Glossário',
    `${glossary.length} termos, também disponíveis com busca em \`/glossario\`.`,
    table({
      headers: ['Termo', 'Definição', 'Nome técnico', 'Exemplo', 'Relacionado'],
      rows: [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'pt-BR')).map((t) => [t.term, t.definition, t.technical_definition, t.example, t.related]),
    }),
  ].join('\n\n') + '\n',
);

write(
  '05-scripts-e-dados/seed-data/modulos-base.json',
  JSON.stringify({ versao: CONTENT_VERSION, modulos: modules.map((m) => shortTitle(m.title)) }, null, 2) + '\n',
);
write('05-scripts-e-dados/seed-data/conteudo-completo.json', JSON.stringify({ versao: CONTENT_VERSION, modulos: modules, glossario: glossary }, null, 2) + '\n');

console.log(`Gerados: ${modules.length} módulos, ${modules.length} quizzes, ${glossary.length} termos.`);
