import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { EXERCISES, EXERCISE_TOPICS } from '../data/exercises';
import { PAGE_META, pageSeo } from '../data/site';
import { TOPIC_PAGES } from '../data/topics';

export default function TemarioPage() {
    const byTopic = EXERCISE_TOPICS.map((t) => ({
        topic: t,
        page: TOPIC_PAGES.find((p) => p.topic === t),
        exercises: EXERCISES.filter((e) => e.topic === t),
    }));

    return (
        <>
            <SEO {...pageSeo(PAGE_META.temario)} />
            <div className="min-h-screen bg-[#070d18] text-slate-200">
                <header className="border-b border-white/10 bg-gradient-to-br from-blue-950/60 via-[#070d18] to-indigo-950/40">
                    <div className="mx-auto max-w-5xl px-5 py-10">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ArrowLeft size={18} /> Volver a la aplicación
                        </Link>
                        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Temario de dibujo técnico</h1>
                        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
                            Todo lo que cubre esta herramienta, ordenado como aparece en el temario de Dibujo Técnico de Bachillerato (PAU / EBAU). Cada tema enlaza a los ejercicios resueltos.
                        </p>
                    </div>
                </header>
                <main className="mx-auto max-w-5xl px-5 py-10">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {byTopic.map(({ topic, page }) => (
                            <section key={topic} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                <h2 className="text-lg font-bold text-white">{topic}</h2>
                                <ul className="mt-4 space-y-2">
                                    {EXERCISES.filter((e) => e.topic === topic).map((e) => (
                                        <li key={e.slug}>
                                            <Link
                                                to={`/ejercicios/${e.slug}`}
                                                className="block rounded-lg px-2 py-1.5 text-sm text-blue-300 transition-colors hover:bg-white/5 hover:text-blue-200"
                                            >
                                                <span className="font-medium">{e.title}</span>
                                                <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                    · {e.level}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                {page && (
                                    <Link
                                        to={`/temario/${page.slug}`}
                                        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-blue-200"
                                    >
                                        Ver el bloque completo →
                                    </Link>
                                )}
                            </section>
                        ))}
                    </div>
                    <div className="mt-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                        <h3 className="text-base font-bold text-emerald-200">Para profesores</h3>
                        <p className="mt-2 text-sm text-emerald-100/90">
                            Cada tema enlaza a ejercicios que puedes abrir en el editor 3D para girar con tus alumnos. Si creas un código de clase en{" "}
                            <Link to="/clase" className="underline text-emerald-200 hover:text-white">Mi clase</Link>, puedes compartir consultas con todo el grupo desde un solo sitio.
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}
