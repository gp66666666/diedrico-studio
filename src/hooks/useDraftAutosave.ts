import { useEffect, useRef } from 'react';
import { useGeometryStore } from '../store/geometryStore';
import { toast } from '../lib/toast';

const KEY = 'diedricoDraft';
const DEBOUNCE_MS = 1200;

/**
 * Borrador local del lienzo.
 *
 * Sin esto, cerrar la pestaña sin pulsar "Guardar" perdía el ejercicio entero.
 * Guarda en localStorage (con retardo) y lo recupera al volver, solo si el
 * lienzo está vacío. El proyecto en la nube sigue siendo la fuente buena.
 */
export function useDraftAutosave() {
    const ready = useRef(false);

    useEffect(() => {
        // Un ejercicio compartido por enlace manda sobre el borrador local
        const hasShared = new URLSearchParams(window.location.search).has('e');

        // 1. Recuperar el último borrador (salvo si viene un ejercicio por enlace)
        try {
            const raw = hasShared ? null : localStorage.getItem(KEY);
            if (raw) {
                const draft = JSON.parse(raw);
                const state = useGeometryStore.getState();
                if (Array.isArray(draft?.elements) && draft.elements.length > 0 && state.elements.length === 0) {
                    useGeometryStore.setState({
                        elements: draft.elements,
                        sketchElements: Array.isArray(draft.sketchElements) ? draft.sketchElements : [],
                        measurements: Array.isArray(draft.measurements) ? draft.measurements : [],
                        auxSystems: Array.isArray(draft.auxSystems) ? draft.auxSystems : [],
                        history: { past: [], future: [] },
                    });
                    toast('Hemos recuperado tu último trabajo sin guardar');
                }
            }
        } catch (e) {
            console.warn('No se pudo recuperar el borrador', e);
        }

        ready.current = true;

        // 2. Guardar cambios (con retardo para no escribir en cada arrastre)
        let timer: number | undefined;
        const unsubscribe = useGeometryStore.subscribe((state) => {
            if (!ready.current) return;
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                try {
                    localStorage.setItem(
                        KEY,
                        JSON.stringify({
                            elements: state.elements,
                            sketchElements: state.sketchElements,
                            measurements: state.measurements,
                            auxSystems: state.auxSystems,
                            savedAt: Date.now(),
                        })
                    );
                } catch {
                    // localStorage lleno o bloqueado: no es crítico
                }
            }, DEBOUNCE_MS);
        });

        return () => {
            unsubscribe();
            window.clearTimeout(timer);
        };
    }, []);
}
