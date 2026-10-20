import { useEffect } from 'react';
import { useGeometryStore } from '../store/geometryStore';

const isTyping = (target: EventTarget | null): boolean => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable
    );
};

/**
 * Atajos globales:
 *   Ctrl/Cmd + Z          → deshacer
 *   Ctrl/Cmd + Shift + Z  → rehacer
 *   Ctrl/Cmd + Y          → rehacer
 *   Supr / Retroceso      → borrar el elemento seleccionado
 *   Escape                → cancelar la herramienta activa
 */
export function useKeyboardShortcuts() {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (isTyping(e.target)) return;

            const mod = e.ctrlKey || e.metaKey;
            const key = e.key.toLowerCase();

            if (mod && key === 'z') {
                e.preventDefault();
                if (e.shiftKey) useGeometryStore.getState().redo();
                else useGeometryStore.getState().undo();
                return;
            }

            if (mod && key === 'y') {
                e.preventDefault();
                useGeometryStore.getState().redo();
                return;
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                const { selectedElementId, removeElement } = useGeometryStore.getState();
                if (selectedElementId) {
                    e.preventDefault();
                    removeElement(selectedElementId);
                }
                return;
            }

            if (e.key === 'Escape') {
                const { activeTool, setActiveTool, selectedElementId, selectElement } = useGeometryStore.getState();
                if (activeTool !== 'none') {
                    setActiveTool('none');
                } else if (selectedElementId) {
                    selectElement(null);
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);
}
