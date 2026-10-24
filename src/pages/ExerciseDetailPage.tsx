import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Play, Share2 } from 'lucide-react';
import SEO from '../components/SEO';
import { EXERCISES, findExercise } from '../data/exercises';
import { buildShareUrl, encodeScene } from '../lib/shareScene';
import { toast } from '../lib/toast';
import { SITE_URL, exerciseDescription } from '../data/site';

const LEVEL_STYLE: Record<string, string> = {
    Básico: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Medio: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Avanzado: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function ExerciseDetailPage() {
    const { slug = '' } = useParams();
    const exercise = findExercise(slug);
    const [opening, setOpening] = useState(false);

    if (!exercise) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#070d18] px-6 text-center text-slate-200">
                <SEO
                    title="Ejercicio no encontrado · Diédrico Studio"
                    description="Ese ejercicio no existe o ha cambiado de nombre. Mira la lista completa de ejercicios resueltos de sistema diédrico."
                    canonicalUrl={`${SITE_URL}/ejercicios/${slug}`}
                    noindex
                />
                <h1 className="text-2xl font-bold text-white">Ejercicio no encontrado</h1>
                <Link to="/ejercicios" className="mt-4 text-sm text-blue-400 hover:text-blue-300">
                    Ver todos los ejercicios
                </Link>
            </div>
        );
    }

    const index = EXERCISES.findIndex((e) => e.slug === exercise.slug);
    const next = EXERCISES[(index + 1) % EXERCISES.length];
    const related = EXERCISES.filter((e) => e.topic === exercise.topic && e.slug !== exercise.slug).slice(0, 4);

    const openInEditor = async () => {
        setOpening(true);
        try {
            const payload = await encodeScene(exercise.elements, exercise.title);
            window.location.assign(buildShareUrl(payload));
        } catch {
            toast.error('No se pudo abrir el ejercicio');
            setOpening(false);
        }
    };

    const share = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: exercise.title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            toast.success('Enlace copiado');
        } catch {
            // cancelado por el usuario
        }
    };

    return (
        <>
            <SEO
                title={`${exercise.title} · ejercicio resuelto de diédrico`}
                description={exerciseDescription(exercise.statement)}
                keywords={`${exercise.title}, ${exercise.topic}, sistema diédrico, ejercicio resuelto, dibujo técnico`}
                canonicalUrl={`${SITE_URL}/ejercicios/${exercise.slug}`}
                type="article"
            />

            <div className="min-h-screen bg-[#070d18] text-slate-200">
                <header className="border-b border-white/10 bg-gradient-to-br from-blue-950/60 via-[#070d18] to-indigo-950/40">
                    <div className="mx-auto max-w-3xl px-5 py-10">
                        <Link to="/ejercicios" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ArrowLeft size={18} /> Todos los ejercicios
                        </Link>

                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${LEVEL_STYLE[exercise.level]}`}>
                                {exercise.level}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-400">
                                {exercise.topic}
                            </span>
                        </div>

                        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{exercise.title}</h1>
                        <p className="mt-3 text-base leading-relaxed text-slate-300">{exercise.statement}</p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <button
                                onClick={() => void openInEditor()}
                                disabled={opening}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
                            >
                                <Play size={17} /> {opening ? 'Abriendo…' : 'Abrir en el editor'}
                            </button>
                            <button
                                onClick={() => void share()}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                            >
                                <Share2 size={16} /> Compartir
                            </button>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-3xl px-5 py-10">
                    <h2 className="text-xl font-bold text-white">Resolución paso a paso</h2>
                    <ol className="mt-4 space-y-4">
                        {exercise.steps.map((step, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-300">
                                    {i + 1}
                                </span>
                                <p className="text-sm leading-relaxed text-slate-300">{step}</p>
                            </li>
                        ))}
                    </ol>

                    {exercise.result && (
                        <div className="mt-6 flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                            <p className="text-sm text-slate-200"><b className="text-white">Resultado:</b> {exercise.result}</p>
                        </div>
                    )}

                    {exercise.tip && (
                        <div className="mt-3 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                            <Lightbulb size={18} className="mt-0.5 shrink-0 text-amber-400" />
                            <p className="text-sm text-slate-300">{exercise.tip}</p>
                        </div>
                    )}

                    {related.length > 0 && (
                        <section className="mt-10">
                            <h2 className="text-lg font-bold text-white">Más de {exercise.topic.toLowerCase()}</h2>
                            <ul className="mt-3 space-y-2">
                                {related.map((e) => (
                                    <li key={e.slug}>
                                        <Link
                                            to={`/ejercicios/${e.slug}`}
                                            className="text-sm text-blue-400 hover:text-blue-300"
                                        >
                                            {e.title}
                                        </Link>
                                        <span className="ml-2 text-xs text-slate-500">{e.level}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <p className="mt-8 text-xs text-slate-500">
                        ¿Es la primera vez que abres el editor?{' '}
                        <Link to="/guia" className="text-blue-400 hover:text-blue-300">
                            Mira la guía
                        </Link>{' '}
                        o practica con la{' '}
                        <Link to="/academy" className="text-blue-400 hover:text-blue-300">
                            teoría de la Academia
                        </Link>
                        .
                    </p>

                    <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
                        <Link to="/ejercicios" className="text-sm text-slate-400 hover:text-white">
                            Todos los ejercicios
                        </Link>
                        <Link to={`/ejercicios/${next.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300">
                            {next.title} <ArrowRight size={15} />
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
}
