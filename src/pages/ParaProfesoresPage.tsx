import { ArrowLeft, GraduationCap, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { PAGE_META, pageSeo } from '../data/site';

export default function ParaProfesoresPage() {
    return (
        <>
            <SEO {...pageSeo(PAGE_META.profesores)} />
            <div className="min-h-screen bg-[#070d18] text-slate-200">
                <header className="border-b border-white/10 bg-gradient-to-br from-blue-950/60 via-[#070d18] to-indigo-950/40">
                    <div className="mx-auto max-w-4xl px-5 py-10">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ArrowLeft size={18} /> Volver a la aplicación
                        </Link>
                        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Para profesores</h1>
                        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
                            Esta herramienta es gratuita y está hecha para que cualquier profesor de dibujo técnico pueda usarla con sus alumnos sin instalar nada. Cada ejercicio se abre en 3D y los pasos resueltos se ven con el dibujo montado.
                        </p>
                    </div>
                </header>
                <main className="mx-auto max-w-4xl px-5 py-10 space-y-10">
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen size={22} className="text-blue-400" />
                            <h2 className="text-xl font-bold text-white">Qué cubre</h2>
                        </div>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
                            <li>Temario de Bachillerato (PAU / EBAU): rectas, intersecciones, distancias, paralelismo, abatimientos, ángulos, giros.</li>
                            <li>Ejercicios resueltos paso a paso con dibujo montado en el editor.</li>
                            <li>Academia con teoría ordenada por tema.</li>
                            <li>Visualización 3D en tiempo real: los alumnos pueden girar el sólido mientras tú explicas.</li>
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-4">
                            <Users size={22} className="text-emerald-400" />
                            <h2 className="text-xl font-bold text-white">Cómo usarlo con tu grupo</h2>
                        </div>
                        <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-300">
                            <li>Abre <Link to="/clase" className="text-blue-400 hover:text-blue-300 underline">Mi clase</Link> y crea un código.</li>
                            <li>Comparte el código con tus alumnos.</li>
                            <li>Abre cualquier ejercicio (por ejemplo: <Link to="/ejercicios/trazas-de-una-recta" className="text-blue-400 hover:text-blue-300 underline">Trazas de una recta</Link>) y proyecta el paso a paso.</li>
                            <li>Los alumnos pueden girar el sólido desde sus propios móviles.</li>
                        </ol>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-4">
                            <GraduationCap size={22} className="text-amber-400" />
                            <h2 className="text-xl font-bold text-white">Sin instalación</h2>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Todo funciona en el navegador. No hace falta instalar programas ni usar ordenadores de la sala de informática. Si hay wifi, funciona desde cualquier dispositivo: portátil, móvil o tablet.
                        </p>
                        <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                            Si un alumno no tiene cuenta, puede ver los ejercicios y la teoría igual; solo necesita cuenta para guardar sus propios dibujos o canjear un código de profesor.
                        </p>
                    </section>

                    <div className="flex gap-3 flex-wrap">
                        <Link to="/clase" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">Crear código de clase</Link>
                        <Link to="/guia" className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10">Ver la guía</Link>
                        <Link to="/ejercicios" className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10">Ejercicios resueltos</Link>
                    </div>
                </main>
            </div>
        </>
    );
}
