import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { CONTENT_VERSION, glossary as seedGlossary, modules as seedModules } from './content';
import type { LessonSection, ModuleDetails } from './content/types';

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
  exercise_answer: string;
  challenge: string;
  keywords: string[];
  sections: LessonSection[];
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

export type ModuleSummary = {
  id: number;
  slug: string;
  title: string;
  stage: string;
  description: string;
  accent: string;
  order_index: number;
  objective: string;
  summary: string;
  lessonCount: number;
  questionCount: number;
};

export type Module = Omit<ModuleSummary, 'lessonCount' | 'questionCount'> & {
  details: ModuleDetails;
  lessons: Lesson[];
  quizQuestions: QuizQuestion[];
};

export type GlossaryTerm = {
  id: number;
  term: string;
  definition: string;
  technical_definition: string;
  example: string;
  related: string;
};

export type SearchResult = {
  type: 'módulo' | 'aula' | 'glossário';
  title: string;
  excerpt: string;
  href: string;
};

type ModuleRow = Omit<Module, 'details' | 'lessons' | 'quizQuestions'> & { details: string };
type LessonRow = Omit<Lesson, 'keywords' | 'sections'> & { keywords: string; sections: string };
type QuizRow = Omit<QuizQuestion, 'options'> & { options: string };

// Na Vercel (e em outras plataformas serverless) só /tmp aceita escrita. O banco é gerado a
// partir de lib/content, então recriá-lo em /tmp a cada nova instância não perde nada.
const DB_DIR = process.env.VERCEL ? path.join('/tmp', 'netlearn') : path.join(process.cwd(), 'db');
const DB_PATH = path.join(DB_DIR, 'netlearn.db');

const SCHEMA = `
  CREATE TABLE modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    stage TEXT NOT NULL,
    description TEXT NOT NULL,
    accent TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    objective TEXT NOT NULL,
    summary TEXT NOT NULL,
    details TEXT NOT NULL
  );

  CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    introduction TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    real_world TEXT NOT NULL,
    explanation TEXT NOT NULL,
    exercise TEXT NOT NULL,
    exercise_answer TEXT NOT NULL,
    challenge TEXT NOT NULL,
    keywords TEXT NOT NULL,
    sections TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id)
  );

  CREATE TABLE quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id)
  );

  CREATE TABLE glossary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term TEXT UNIQUE NOT NULL,
    definition TEXT NOT NULL,
    technical_definition TEXT NOT NULL,
    example TEXT NOT NULL,
    related TEXT NOT NULL
  );
`;

function seed(db: Database.Database) {
  db.exec(`
    DROP TABLE IF EXISTS quiz_questions;
    DROP TABLE IF EXISTS lessons;
    DROP TABLE IF EXISTS modules;
    DROP TABLE IF EXISTS glossary;
  `);
  db.exec(SCHEMA);

  const saveModule = db.prepare(
    'INSERT INTO modules (slug, title, stage, description, accent, order_index, objective, summary, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const saveLesson = db.prepare(
    'INSERT INTO lessons (module_id, slug, title, introduction, why_it_matters, real_world, explanation, exercise, exercise_answer, challenge, keywords, sections, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const saveQuiz = db.prepare(
    'INSERT INTO quiz_questions (module_id, question, options, answer, explanation, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
  );
  const saveTerm = db.prepare('INSERT INTO glossary (term, definition, technical_definition, example, related) VALUES (?, ?, ?, ?, ?)');

  seedModules.forEach((mod, moduleIndex) => {
    const { lastInsertRowid: moduleId } = saveModule.run(
      mod.slug,
      mod.title,
      mod.stage,
      mod.description,
      mod.accent,
      moduleIndex + 1,
      mod.objective,
      mod.summary,
      JSON.stringify(mod.details),
    );

    mod.lessons.forEach((lesson, index) => {
      saveLesson.run(
        moduleId,
        lesson.slug,
        lesson.title,
        lesson.introduction,
        lesson.why_it_matters,
        lesson.real_world,
        lesson.explanation,
        lesson.exercise,
        lesson.exercise_answer,
        lesson.challenge,
        JSON.stringify(lesson.keywords),
        JSON.stringify(lesson.sections),
        index + 1,
      );
    });

    mod.quizQuestions.forEach((question, index) => {
      saveQuiz.run(moduleId, question.question, JSON.stringify(question.options), question.answer, question.explanation, index + 1);
    });
  });

  for (const term of seedGlossary) {
    saveTerm.run(term.term, term.definition, term.technical_definition, term.example, term.related);
  }

  db.pragma(`user_version = ${CONTENT_VERSION}`);
}

function openDatabase() {
  fs.mkdirSync(DB_DIR, { recursive: true });

  const db = new Database(DB_PATH);
  // Vários workers do `next build` abrem o banco ao mesmo tempo: espera em vez de falhar com SQLITE_BUSY.
  db.pragma('busy_timeout = 10000');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Refaz o seed sempre que o conteúdo em lib/content mudar de versão. A transação IMMEDIATE
  // garante que só um processo faça o seed; os demais revalidam a versão depois do lock.
  const isOutdated = () => db.pragma('user_version', { simple: true }) !== CONTENT_VERSION;
  if (isOutdated()) {
    db.transaction(() => {
      if (isOutdated()) seed(db);
    }).immediate();
  }

  return db;
}

const globalForDb = globalThis as unknown as { netlearnDb?: Database.Database };

export function getDatabase() {
  // Reaproveita a conexão entre requisições (e entre recarregamentos do `next dev`).
  globalForDb.netlearnDb ??= openDatabase();
  return globalForDb.netlearnDb;
}

function parseLesson(row: LessonRow): Lesson {
  return { ...row, keywords: JSON.parse(row.keywords), sections: JSON.parse(row.sections) };
}

function parseQuestion(row: QuizRow): QuizQuestion {
  return { ...row, options: JSON.parse(row.options) };
}

export function getModuleSummaries(): ModuleSummary[] {
  return getDatabase()
    .prepare(
      `SELECT m.id, m.slug, m.title, m.stage, m.description, m.accent, m.order_index, m.objective, m.summary,
        (SELECT COUNT(*) FROM lessons l WHERE l.module_id = m.id) AS lessonCount,
        (SELECT COUNT(*) FROM quiz_questions q WHERE q.module_id = m.id) AS questionCount
       FROM modules m ORDER BY m.order_index ASC`,
    )
    .all() as ModuleSummary[];
}

function hydrateModule(row: ModuleRow): Module {
  const db = getDatabase();
  const lessons = (db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order ASC').all(row.id) as LessonRow[]).map(parseLesson);
  const quizQuestions = (db.prepare('SELECT * FROM quiz_questions WHERE module_id = ? ORDER BY sort_order ASC').all(row.id) as QuizRow[]).map(
    parseQuestion,
  );
  return { ...row, details: JSON.parse(row.details), lessons, quizQuestions };
}

export function getModules(): Module[] {
  const rows = getDatabase().prepare('SELECT * FROM modules ORDER BY order_index ASC').all() as ModuleRow[];
  return rows.map(hydrateModule);
}

export function getModuleBySlug(slug: string): Module | null {
  const row = getDatabase().prepare('SELECT * FROM modules WHERE slug = ?').get(slug) as ModuleRow | undefined;
  return row ? hydrateModule(row) : null;
}

export function getGlossaryTerms(): GlossaryTerm[] {
  return getDatabase().prepare('SELECT * FROM glossary ORDER BY term COLLATE NOCASE ASC').all() as GlossaryTerm[];
}

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function excerpt(text: string, max = 160) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** Busca simples (sem acentos e sem diferenciar maiúsculas) em módulos, aulas e glossário. */
export function searchContent(query: string): SearchResult[] {
  const needle = normalize(query.trim());
  if (!needle) return [];

  const results: SearchResult[] = [];
  const matches = (...fields: string[]) => fields.some((field) => normalize(field).includes(needle));

  for (const mod of getModules()) {
    if (matches(mod.title, mod.description, mod.objective)) {
      results.push({ type: 'módulo', title: mod.title, excerpt: excerpt(mod.description), href: `/aulas/${mod.slug}` });
    }
    for (const lesson of mod.lessons) {
      const sectionText = lesson.sections.map((s) => [s.title, s.content ?? '', ...(s.items ?? []), ...(s.steps ?? [])].join(' '));
      if (matches(lesson.title, lesson.introduction, lesson.explanation, lesson.keywords.join(' '), ...sectionText)) {
        results.push({ type: 'aula', title: `${lesson.title} · ${mod.title}`, excerpt: excerpt(lesson.introduction), href: `/aulas/${mod.slug}#${lesson.slug}` });
      }
    }
  }

  for (const term of getGlossaryTerms()) {
    if (matches(term.term, term.definition, term.technical_definition)) {
      results.push({ type: 'glossário', title: term.term, excerpt: excerpt(term.definition), href: `/glossario?q=${encodeURIComponent(term.term)}` });
    }
  }

  return results;
}
