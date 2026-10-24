import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Copy, Check, KeyRound, Users, CalendarClock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';
import { toast } from '../lib/toast';
import SEO from '../components/SEO';
import { PAGE_META, pageSeo } from '../data/site';

interface ClassCode {
    code: string;
    credits_per_student: number;
    max_uses: number;
    uses: number;
    expires_at: string;
}

/**
 * Códigos de clase.
 *
 * - El alumno canjea el código del profesor y recibe consultas en su cuenta.
 * - El profesor ve los códigos que ha comprado, cuántos alumnos los han usado
 *   y hasta cuándo valen.
 *
 * Todo pasa por la función `redeem_class_code` (security definer): el navegador
 * nunca escribe en las tablas.
 */
export default function ClassPage() {
    const { user } = useUserStore();
    const [codes, setCodes] = useState<ClassCode[]>([]);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        void (async () => {
            const { data, error } = await supabase
                .from('class_codes')
                .select('code,credits_per_student,max_uses,uses,expires_at')
                .order('created_at', { ascending: false });
            if (!error && data) setCodes(data as ClassCode[]);
        })();
    }, [user]);

    const redeem = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = input.trim().toUpperCase();
        if (!code || busy) return;
        setBusy(true);
        const { data, error } = await supabase.rpc('redeem_class_code', { p_code: code });
        setBusy(false);

        if (error) {
            toast.error('No se pudo comprobar el código. Inténtalo otra vez.');
            return;
        }

        const res = data as { ok: boolean; reason?: string; credits?: number; balance?: number };
        if (!res?.ok) {
            const messages: Record<string, string> = {
                not_found: 'Ese código no existe. Revisa las letras con tu profesor.',
                expired: 'El código ha caducado.',
                full: 'Ese código ya ha llegado a su límite de alumnos.',
                already_used: 'Ya has usado este código.',
                login_required: 'Inicia sesión para canjear el código.',
            };
            toast.error(messages[res?.reason ?? ''] ?? 'No se pudo canjear el código.');
            return;
        }

        toast.success(`¡Hecho! Tienes ${res.credits} consultas más.`);
        useUserStore.getState().setCredits(res.balance ?? 0);
        setInput('');
    };

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(text);
            setTimeout(() => setCopied(null), 1500);
        } catch {
            toast.error('No se pudo copiar. Selecciona el código a mano.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 p-6 text-white md:p-8">
            <SEO {...pageSeo(PAGE_META.classroom)} />
            <div className="mx-auto max-w-3xl">
                <Link to="/" className="mb-8 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
                    <ArrowLeft size={20} /> Volver a la aplicación
                </Link>

                <div className="mb-6 flex items-center gap-3">
                    <GraduationCap className="text-emerald-400" size={32} />
                    <h1 className="text-3xl font-bold md:text-4xl">Mi clase</h1>
                </div>

                {!user ? (
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
                        <p className="text-white/80">
                            Para canjear el código de tu profesor necesitas una cuenta: es donde se
                            apuntan las consultas.
                        </p>
                        <button
                            onClick={() => void useUserStore.getState().signInWithGoogle()}
                            className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                        >
                            Entrar con Google
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* --- Canjear --- */}
                        <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
                            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
                                <KeyRound size={18} className="text-emerald-400" /> Canjear un código
                            </h2>
                            <p className="mb-4 text-sm text-white/70">
                                Te lo da tu profesor. Cada código se puede usar una vez por alumno.
                            </p>
                            <form onSubmit={redeem} className="flex flex-col gap-2 sm:flex-row">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                                    placeholder="PROFE-XXXXXX"
                                    autoComplete="off"
                                    spellCheck={false}
                                    className="flex-1 rounded-xl border border-white/20 bg-black/30 px-4 py-2.5 font-mono tracking-widest text-white placeholder-gray-500 focus:border-emerald-400/60 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || busy}
                                    className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-40"
                                >
                                    {busy ? 'Comprobando…' : 'Canjear'}
                                </button>
                            </form>
                        </div>

                        {/* --- Mis códigos (profesor) --- */}
                        {codes.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-lg font-semibold">Tus códigos de clase</h2>
                                {codes.map((c) => {
                                    const caducado = new Date(c.expires_at) < new Date();
                                    return (
                                        <div key={c.code} className="rounded-2xl border border-white/20 bg-white/10 p-5">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <span className="font-mono text-xl font-bold tracking-widest text-emerald-300">
                                                    {c.code}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => copy(c.code)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
                                                    >
                                                        {copied === c.code ? <Check size={14} /> : <Copy size={14} />}
                                                        {copied === c.code ? 'Copiado' : 'Copiar'}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            copy(
                                                                `Usa mi código de Diédrico Studio: ${c.code} en https://diedrico-studio.vercel.app/clase. Te da ${c.credits_per_student} consultas para el asistente.`,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
                                                    >
                                                        Copiar mensaje para la clase
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/70">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <GraduationCap size={14} /> {c.credits_per_student} consultas por alumno
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Users size={14} /> {c.uses} de {c.max_uses} alumnos
                                                </span>
                                                <span className={`inline-flex items-center gap-1.5 ${caducado ? 'text-red-300' : ''}`}>
                                                    <CalendarClock size={14} />
                                                    {caducado
                                                        ? 'Caducado'
                                                        : `Vale hasta ${new Date(c.expires_at).toLocaleDateString('es-ES')}`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <p className="mt-8 text-xs leading-relaxed text-white/50">
                    El código lo genera tu compra en Lemon Squeezy y se activa solo en unos segundos.
                    Si no aparece, escríbeme a diedrico.studio25@gmail.com.
                </p>
            </div>
        </div>
    );
}
