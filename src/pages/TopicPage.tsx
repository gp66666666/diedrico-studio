import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, GraduationCap, ListOrdered } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { EXERCISES } from '../data/exercises';
import { SITE_URL, ogImageForPath } from '../data/site';
import { TOPIC_BY_SLUG, TOPIC_PAGES } from '../data/topics';
import NotFoundPage from './NotFoundPage';

export default function TopicPage() {
    const { slug } = useParams<{ slug: string }>();
    const topic = slug ? TOPIC_BY_SLUG[slug] : undefined;

    if (!topic) return <NotFoundPage />;

    const exercises = EXERCISES.filter((e) => e.topic === topic.topic);
    const related = TOPIC_PAGES.filter((t) => t.slug !== topic.slug).slice(0, 4);
    const url = `${SITE_URL}/temario/${topic.slug}`;

    return (
        <>
            <SEO
                title={topic.title}
                description={topic.description}
                keywords={`${topic.topic}, sistema diédrico, dibujo técnico, PAU, EBAU, ejercicios resueltos, ${topic.slug}`}
                canonicalUrl={url}
                ogImage={ogImageForPath(`/temario/${topic.slug}`)}
            />
            <div className="min-h-screen bg-[#070d18] text-slate-200">
                <header className="border-b border-white/10 bg-gradient-to-br from-blue-950/60 via-[#070d18] to-indigo-950/40">
                    <div className="mx-auto max-w-4xl px-5 py-10">
                        <Link to="/temario" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ArrowLeft size={18} /> Temario completo
                        </Link>
                        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Bloque del temario
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{topic.heading}</h1>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">{topic.intro}</p>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-5 py-10 space-y-8">
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <CheckCircle2 size={20} className="text-emerald-400" />
                            <h2 className="text-xl font-bold text-white">Qué tienes que saber hacer</h2>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-300">
                            {topic.learn.map((item) => (
                                <li key={item} className="flex gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <ListOrdered size={20} className="text-blue-400" />
                            <h2 className="text-xl font-bold text-white">Cómo se resuelve</h2>
                        </div>
                        <ol className="space-y-3 text-sm text-slate-300">
                            {topic.steps.map((step, index) => (
                                <li key={step} className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-300">
                                        {index + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                        <div className="mb-3 flex items-center gap-3">
                            <GraduationCap size={20} className="text-amber-300" />
                            <h2 className="text-xl font-bold text-amber-100">Cómo cae en la PAU/EBAU</h2>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-200">{topic.exam}</p>
                    </section>

                    <section>
                        <div className="mb-4 flex items-center gap-3">
                            <BookOpen size={20} className="text-blue-400" />
                            <h2 className="text-xl font-bold text-white">Ejercicios de este bloque</h2>
                        </div>
                        <ul className="space-y-3">
                            {exercises.map((exercise) => (
                                <li key={exercise.slug}>
                                    <Link
                                        to={`/ejercicios/${exercise.slug}`}
                                        className="group flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition-colors hover:border-blue-500/40 hover:bg-white/10"
                                    >
                                        <span>
                                            <span className="block font-semibold text-white">{exercise.title}</span>
                                            <span className="mt-1 block text-xs text-slate-400">
                                                {exercise.level} · {exercise.statement}
                                            </span>
                                        </span>
                                        <ArrowRight size={18} className="shrink-0 text-blue-400 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="border-t border-white/10 pt-8">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                            Otros bloques
                        </h2>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {related.map((t) => (
                                <li key={t.slug}>
                                    <Link
                                        to={`/temario/${t.slug}`}
                                        className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                                    >
                                        {t.topic}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 flex flex-wrap gap-2">
                            <Link to="/temario" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                                Ver todo el temario
                            </Link>
                            <Link to="/ejercicios" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
                                Todos los ejercicios
                            </Link>
                            <Link to="/academy" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
                                Teoría en la Academia
                            </Link>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
