import { AlertTriangle, Layers, RefreshCw } from 'lucide-react';
import { hardReload } from '../lib/hardReload';

interface Props {
    onGo2D?: () => void;
    compact?: boolean;
}

/**
 * Sustituto de la vista 3D cuando el navegador no puede crear un contexto
 * WebGL. La aplicación sigue siendo utilizable: la vista diédrica es SVG.
 */
export default function WebGLFallback({ onGo2D, compact = false }: Props) {
    if (compact) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-[#0b1120] p-6 text-center">
                <div>
                    <AlertTriangle className="mx-auto mb-2 text-amber-400" size={22} />
                    <p className="text-xs text-slate-300">El mini 3D necesita WebGL y tu navegador no lo permite.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center bg-[#0b1120] p-6">
            <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <AlertTriangle size={24} />
                </span>

                <h2 className="mt-4 text-lg font-semibold text-white">Tu navegador no puede mostrar la vista 3D</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Es un problema de <strong>WebGL</strong> (aceleración gráfica), no de tus datos.
                    Puedes seguir trabajando en la vista diédrica, que funciona sin tarjeta gráfica.
                </p>

                {onGo2D && (
                    <button
                        onClick={onGo2D}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                    >
                        <Layers size={17} /> Ir a la vista diédrica (2D)
                    </button>
                )}

                <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3 text-left text-[11px] leading-relaxed text-slate-400">
                    <p className="font-semibold text-slate-300">Si quieres recuperar el 3D:</p>
                    <ul className="mt-1 list-inside list-disc space-y-1">
                        <li>Activa la <b>aceleración por hardware</b> en los ajustes del navegador.</li>
                        <li>En Chrome: Ajustes → Sistema → «Usar aceleración gráfica cuando esté disponible».</li>
                        <li>Actualiza los drivers de la tarjeta gráfica.</li>
                        <li>Prueba en otro navegador (Firefox o Edge).</li>
                    </ul>
                    <button
                        onClick={() => void hardReload()}
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                    >
                        <RefreshCw size={12} /> Ya lo he activado: recargar
                    </button>
                </div>
            </div>
        </div>
    );
}
