import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Filter } from 'lucide-react';
import SEO from '../components/SEO';
import { EXERCISES, EXERCISE_TOPICS, type ExerciseLevel } from '../data/exercises';
import { PAGE_META, pageSeo } from '../data/site';

const LEVELS: Array<ExerciseLevel | 'Todos'> = ['Todos', 'Básico', 'Medio', 'Avanzado'];

const LEVEL_STYLE: Record<ExerciseLevel, string> = {
    Básico: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Medio: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Avanzado: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function ExercisesPage() {
    const [level, setLevel] = useState<ExerciseLevel | 'Todos'>('Todos');
    const [topic, setTopic] = useState<string>('Todos');

    const list = useMemo(
        () =>
            EXERCISES.filter(
                (e) => (level === 'Todos' || e.level === level) && (topic === 'Todos' || e.topic === topic)
            ),
        [level, topic]
    );

    return (
        <>
            <SEO {...pageSeo(PAGE_META.exercises)} />

            <div className="min-h-screen bg-[#070d18] text-slate-200">
                <header className="border-b border-white/10 bg-gradient-to-br from-blue-950/60 via-[#070d18] to-indigo-950/40">
                    <div className="mx-auto max-w-5xl px-5 py-10">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ArrowLeft size={18} /> Volver a la aplicación
                        </Link>
                        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Ejercicios resueltos</h1>
                        <p className="mt-2 max-w-2xl text-slate-300">
                            Ejercicios del temario de Dibujo Técnico, con los pasos y el dibujo ya montado.
                            Ábrelos en el editor para girarlos, medirlos y comprobar la solución en 3D.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-sm">
                            <Link to="/temario" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200 hover:bg-white/10">
                                Ver el temario por bloques
                            </Link>
                            <Link to="/para-profesores" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200 hover:bg-white/10">
                                Soy profesor
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="mx-auto max-w-5xl px-5 py-8">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                            <Filter size={13} /> Nivel
                        </span>
                        {LEVELS.map((l) => (
                            <button
                                key={l}
                                onClick={() => setLevel(l)}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${level === l
                                    ? 'border-blue-500/50 bg-blue-500/20 text-blue-200'
                                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Tema</span>
                        {['Todos', ...EXERCISE_TOPICS].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTopic(t)}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${topic === t
                                    ? 'border-blue-500/50 bg-blue-500/20 text-blue-200'
                                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        {list.map((exercise) => (
                            <Link
                                key={exercise.slug}
                                to={`/ejercicios/${exercise.slug}`}
                                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-blue-500/40 hover:bg-white/[0.06]"
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${LEVEL_STYLE[exercise.level]}`}>
                                        {exercise.level}
                                    </span>
                                    <span className="text-[11px] text-slate-500">{exercise.topic}</span>
                                </div>
                                <h2 className="mt-2 text-lg font-semibold text-white">{exercise.title}</h2>
                                <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-400">{exercise.statement}</p>
                                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                                    Ver y abrir en el editor <ArrowRight size={14} />
                                </span>
                            </Link>
                        ))}
                    </div>

                    {list.length === 0 && (
                        <p className="mt-10 text-center text-sm text-slate-500">
                            No hay ejercicios con esos filtros.
                        </p>
                    )}

                    <div className="mt-10 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
                        <p className="text-lg font-semibold text-white">¿Prefieres que te lo explique un asistente?</p>
                        <p className="mt-1 text-sm text-slate-300">
                            Pega cualquier enunciado en el asistente y te lo resuelve paso a paso, dibujándolo.
                        </p>
                        <Link to="/" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500">
                            <BookOpen size={18} /> Abrir Diédrico Studio
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
