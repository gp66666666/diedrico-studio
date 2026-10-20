import { useEffect, useRef, useState } from 'react';
import { Cloud, CloudOff, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';

/**
 * Sincroniza las láminas con Supabase.
 *
 * Las láminas viven dentro de un iframe (`public/Laminas_automaticas.html`) que
 * guarda su estado en `localStorage['diedricoProject']`. Como el iframe es del
 * mismo origen, el padre puede leerlo y escucharlo sin tocar su código:
 *
 *  - `storage` avisa cuando el iframe guarda (autoguardado de la propia página).
 *  - Al entrar, si la nube tiene un documento y este navegador no ha tocado el
 *    suyo desde la última sincronización, se carga el de la nube.
 *
 * Coste: una fila jsonb por usuario. No usa Storage ni PDFs.
 */

type SyncState = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

const LOCAL_KEY = 'diedricoProject';
const MARKER_KEY = 'laminasLastSynced'; // huella del último JSON sincronizado
const DEBOUNCE_MS = 1500;

const hash = (text: string): string => {
    // Hash barato y suficiente para comparar documentos
    let h = 0;
    for (let i = 0; i < text.length; i++) {
        h = (h << 5) - h + text.charCodeAt(i);
        h |= 0;
    }
    return `${text.length}:${h}`;
};

/** ¿El documento tiene algo del usuario o es la hoja vacía que crea el iframe al abrir? */
const isMeaningful = (json: string | null): boolean => {
    if (!json) return false;
    try {
        const doc = JSON.parse(json);
        const sheets = Array.isArray(doc?.sheets) ? doc.sheets : [];
        return sheets.some((sheet: any) =>
            (sheet?.text && String(sheet.text).trim() !== '') ||
            (Array.isArray(sheet?.points) && sheet.points.length > 0) ||
            (Array.isArray(sheet?.lines) && sheet.lines.length > 0) ||
            (Array.isArray(sheet?.planes) && sheet.planes.length > 0) ||
            (Array.isArray(sheet?.guides) && sheet.guides.length > 0) ||
            (Array.isArray(sheet?.steps) && sheet.steps.length > 0)
        );
    } catch {
        return false;
    }
};

const readIframe = (frame: HTMLIFrameElement | null): string | null => {
    try {
        return frame?.contentWindow?.localStorage.getItem(LOCAL_KEY) ?? null;
    } catch {
        return null;
    }
};

export default function LaminasCloudSync({ iframeRef }: { iframeRef: React.RefObject<HTMLIFrameElement> }) {
    const user = useUserStore((s) => s.user);
    const [state, setState] = useState<SyncState>('idle');
    const timer = useRef<number | null>(null);
    const lastSaved = useRef<string | null>(null);
    // Hasta terminar la primera lectura no se sube nada: el iframe escribe una
    // hoja vacía al abrir y no debe machacar lo que hay en la nube.
    const ready = useRef(false);

    // Cargar desde la nube al entrar (solo una vez por usuario)
    useEffect(() => {
        if (!user?.id) {
            setState('offline');
            return;
        }
        // Ojo: en StrictMode el efecto se monta dos veces. Antes había un
        // `startedFor` que bloqueaba el segundo montaje y dejaba la lectura a
        // medias (nunca se cargaba la nube en desarrollo).
        let cancelled = false;

        const pull = async () => {
            ready.current = false;
            try {
                const { data, error } = await supabase
                    .from('laminas_docs')
                    .select('data, updated_at')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (cancelled) return;
                if (error) {
                    console.warn('No se pudieron cargar las láminas de la nube', error);
                    setState('error');
                    return;
                }

                const local = readIframe(iframeRef.current);
                const marker = localStorage.getItem(MARKER_KEY);
                const localHasWork = isMeaningful(local);
                // Cambios locales sin subir: hay contenido y no coincide con lo último sincronizado
                const localTouched = localHasWork && hash(local!) !== marker;

                if (!data) {
                    // Primera vez: subimos lo que haya en este navegador
                    if (localHasWork) await push(local!);
                    else setState('idle');
                    return;
                }

                const remote = JSON.stringify(data.data);

                if (!localTouched) {
                    // La nube manda (otro equipo, o este no ha tocado nada)
                    if (local !== remote) {
                        try {
                            iframeRef.current?.contentWindow?.localStorage.setItem(LOCAL_KEY, remote);
                            localStorage.setItem(MARKER_KEY, hash(remote));
                            lastSaved.current = hash(remote);
                            iframeRef.current?.contentWindow?.location.reload();
                        } catch (e) {
                            console.warn('No se pudo escribir en las láminas', e);
                        }
                    }
                    setState('saved');
                } else {
                    // Hay trabajo local sin subir: se conserva y se sube
                    await push(local!);
                }
            } finally {
                ready.current = true;
            }
        };

        void pull();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const push = async (json: string) => {
        if (!user?.id) return;
        try {
            const parsed = JSON.parse(json);
            setState('saving');
            const { error } = await supabase.from('laminas_docs').upsert(
                { user_id: user.id, data: parsed, updated_at: new Date().toISOString() },
                { onConflict: 'user_id' }
            );
            if (error) throw error;
            localStorage.setItem(MARKER_KEY, hash(json));
            lastSaved.current = json;
            setState('saved');
        } catch (e) {
            console.error('No se pudieron guardar las láminas', e);
            setState('error');
        }
    };

    // El aviso de "guardadas" se apaga solo a los pocos segundos
    useEffect(() => {
        if (state !== 'saved') return;
        const t = window.setTimeout(() => setState('idle'), 2500);
        return () => window.clearTimeout(t);
    }, [state]);

    // Autoguardado: el iframe escribe en localStorage y el navegador avisa aquí
    useEffect(() => {
        if (!user?.id) return;

        const onStorage = (event: StorageEvent) => {
            if (event.key !== LOCAL_KEY) return;
            if (!ready.current) return; // aún leyendo la nube
            const json = readIframe(iframeRef.current) ?? event.newValue;
            if (!json) return;
            if (hash(json) === lastSaved.current || hash(json) === localStorage.getItem(MARKER_KEY)) return;

            if (timer.current) window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => void push(json), DEBOUNCE_MS);
        };

        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('storage', onStorage);
            if (timer.current) window.clearTimeout(timer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    if (!user) {
        return (
            <div className="absolute bottom-14 right-3 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur">
                <CloudOff size={13} /> Inicia sesión para guardar tus láminas en la nube
            </div>
        );
    }

    const label =
        state === 'saving' ? 'Guardando láminas…'
            : state === 'error' ? 'No se pudieron guardar'
                : state === 'saved' ? 'Láminas guardadas'
                    : 'Láminas en la nube';

    return (
        <div
            className={`absolute bottom-14 right-3 z-40 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] backdrop-blur transition-opacity ${state === 'error'
                ? 'border-red-500/30 bg-red-950/70 text-red-200'
                : 'border-white/10 bg-black/55 text-white/75'
                }`}
        >
            {state === 'saving' ? <Loader2 size={13} className="animate-spin" />
                : state === 'saved' ? <Check size={13} className="text-emerald-400" />
                    : state === 'error' ? <CloudOff size={13} />
                        : <Cloud size={13} />}
            {label}
        </div>
    );
}
