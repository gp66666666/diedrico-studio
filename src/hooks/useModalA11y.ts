import { useEffect, useRef } from 'react';

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accesibilidad mínima para modales:
 *  - Escape cierra
 *  - el foco entra en el modal al abrir
 *  - Tab no se escapa a la página de detrás
 *  - al cerrar, el foco vuelve donde estaba
 *
 * Uso: const panelRef = useModalA11y(isOpen, onClose);
 *      <div ref={panelRef} role="dialog" aria-modal="true" aria-label="...">
 */
export function useModalA11y(isOpen: boolean, onClose: () => void) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const panel = panelRef.current;

        const list = () =>
            Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
                (el) => el.offsetParent !== null
            );

        // Enfocar el primer elemento útil (o el propio panel)
        const first = list()[0];
        (first ?? panel)?.focus();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
                return;
            }

            if (e.key !== 'Tab') return;

            const items = list();
            if (items.length === 0) {
                e.preventDefault();
                return;
            }

            const current = document.activeElement;
            const index = items.indexOf(current as HTMLElement);

            if (e.shiftKey && (index <= 0 || current === panel)) {
                e.preventDefault();
                items[items.length - 1].focus();
            } else if (!e.shiftKey && index === items.length - 1) {
                e.preventDefault();
                items[0].focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            previouslyFocused?.focus?.();
        };
    }, [isOpen, onClose]);

    return panelRef;
}
