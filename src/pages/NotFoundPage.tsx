import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Compass, GraduationCap } from 'lucide-react';
import SEO from '../components/SEO';
import { SITE_URL } from '../data/site';

export default function NotFoundPage() {
    return (
        <>
            <SEO
                title="Página no encontrada · Diédrico Studio"
                description="La página que buscas no existe. Vuelve a Diédrico Studio para seguir practicando sistema diédrico."
                canonicalUrl={`${SITE_URL}/`}
                noindex
            />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#070d18] px-6 text-center text-slate-200">
                <p className="text-6xl font-black text-blue-500/30">404</p>
                <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Esta página no existe</h1>
                <p className="mt-2 max-w-md text-sm text-slate-400">
                    Puede que el enlace esté mal escrito o que la página haya cambiado de sitio.
                    Desde aquí puedes volver a lo importante:
                </p>

                <div className="mt-8 flex w-full max-w-md flex-col gap-2">
                    <Link to="/" className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500">
                        <Compass size={18} /> Ir a la aplicación
                    </Link>
                    <Link to="/guia" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition-colors hover:bg-white/10">
                        <BookOpen size={18} /> Guía de uso
                    </Link>
                    <Link to="/academy" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition-colors hover:bg-white/10">
                        <GraduationCap size={18} /> Academia
                    </Link>
                </div>

                <Link to="/" className="mt-8 inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300">
                    <ArrowLeft size={14} /> Volver al inicio
                </Link>
            </div>
        </>
    );
}
