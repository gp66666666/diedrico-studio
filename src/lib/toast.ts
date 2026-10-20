import { create } from 'zustand';

/**
 * Avisos no bloqueantes. Sustituyen a los `alert()` nativos, que cortan la
 * aplicación, no se pueden estilar y en móvil rompen el flujo.
 *
 *   import { toast } from '../lib/toast';
 *   toast('Punto añadido');
 *   toast.error('El punto no pertenece al plano');
 */

export type ToastKind = 'info' | 'success' | 'error';

export interface ToastItem {
    id: number;
    kind: ToastKind;
    message: string;
}

interface ToastState {
    toasts: ToastItem[];
    push: (message: string, kind?: ToastKind) => void;
    dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    push: (message, kind = 'info') => {
        const id = nextId++;
        set((state) => ({ toasts: [...state.toasts.slice(-3), { id, kind, message }] }));
        window.setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 4200);
    },
    dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

type ToastFn = ((message: string) => void) & {
    success: (message: string) => void;
    error: (message: string) => void;
};

const base = (message: string) => useToastStore.getState().push(message, 'info');

export const toast = base as ToastFn;
toast.success = (message: string) => useToastStore.getState().push(message, 'success');
toast.error = (message: string) => useToastStore.getState().push(message, 'error');
