import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore } from '../lib/toast';

const ICONS = {
    success: CheckCircle2,
    error: AlertTriangle,
    info: Info,
};

const COLORS = {
    success: 'border-emerald-500/30 bg-emerald-950/85 text-emerald-100',
    error: 'border-red-500/30 bg-red-950/85 text-red-100',
    info: 'border-white/15 bg-slate-900/90 text-slate-100',
};

export default function ToastHost() {
    const toasts = useToastStore((s) => s.toasts);
    const dismiss = useToastStore((s) => s.dismiss);

    if (toasts.length === 0) return null;

    return (
        <div
            className="pointer-events-none fixed bottom-6 left-1/2 z-[200] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2"
            role="status"
            aria-live="polite"
        >
            {toasts.map((t) => {
                const Icon = ICONS[t.kind];
                return (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${COLORS[t.kind]}`}
                    >
                        <Icon size={18} className="mt-0.5 shrink-0" />
                        <p className="flex-1 leading-snug">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
                            aria-label="Cerrar aviso"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
