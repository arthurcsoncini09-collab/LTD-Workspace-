import { getModules } from '@/lib/netlearn-db';
import { QuizPicker } from '@/components/quiz-picker';

export default function QuizzesPage() {
  const modules = getModules().map(({ slug, title, quizQuestions }) => ({
    slug,
    title,
    questions: quizQuestions.map(({ question, options, answer, explanation }) => ({ question, options, answer, explanation })),
  }));
  const total = modules.reduce((sum, mod) => sum + mod.questions.length, 0);

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Quizzes</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Teste seu conhecimento em tempo real</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          {total} questões com correção imediata e explicação. Sua melhor nota em cada módulo fica salva no seu progresso.
        </p>
      </section>

      <QuizPicker modules={modules} />
    </div>
  );
}
