import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Aviso de versión nueva.
 *
 * El service worker (vite-plugin-pwa) sirve el núcleo cacheado para que la app
 * funcione con wifi malo, pero eso hacía que, tras un despliegue, quien volvía
 * siguiera viendo la versión anterior hasta cerrar todas las pestañas dos veces.
 * Aquí escuchamos la actualización y avisamos: el usuario recarga cuando quiere
 * (hay borrador autosave, así que no se pierde nada).
 */
export default function PwaUpdatePrompt() {
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(_swUrl, registration) {
            // Comprobar si hay versión nueva cada hora y al volver a la pestaña.
            if (!registration) return;
            const check = () => void registration.update().catch(() => undefined);
            const interval = window.setInterval(check, 60 * 60 * 1000);
            const onVisible = () => {
                if (document.visibilityState === 'visible') check();
            };
            document.addEventListener('visibilitychange', onVisible);
            window.addEventListener('online', check);
            // Limpieza si el componente se desmonta (no ocurre en la práctica).
            void interval;
        },
    });

    useEffect(() => {
        if (!needRefresh) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter') void updateServiceWorker(true);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [needRefresh, updateServiceWorker]);

    if (!needRefresh) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 left-1/2 z-[120] w-[min(92vw,28rem)] -translate-x-1/2 rounded-xl border border-blue-500/40 bg-[#0b1526] p-3 text-sm text-slate-100 shadow-2xl"
        >
            <p className="font-semibold">Hay una versión nueva de Diédrico Studio</p>
            <p className="mt-1 text-xs text-slate-300">
                Recarga para ver los últimos cambios. Tu dibujo se conserva.
            </p>
            <div className="mt-3 flex gap-2">
                <button
                    type="button"
                    onClick={() => void updateServiceWorker(true)}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                >
                    Recargar ahora
                </button>
                <button
                    type="button"
                    onClick={() => void updateServiceWorker(false)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/5"
                >
                    Más tarde
                </button>
            </div>
        </div>
    );
}
