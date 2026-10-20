import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { hardReload } from '../lib/hardReload';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    message: string;
}

/**
 * Red de seguridad: sin esto, cualquier excepción de render (three.js, un
 * proyecto con datos raros) deja la aplicación en blanco sin explicación.
 */
export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, message: '' };

    static getDerivedStateFromError(error: unknown): State {
        return {
            hasError: true,
            message: error instanceof Error ? error.message : String(error),
        };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Error de render:', error, info.componentStack);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#070d18] px-6 text-center text-slate-200">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
                    <AlertTriangle size={28} />
                </span>
                <h1 className="mt-4 text-2xl font-bold text-white">Algo se ha roto</h1>
                <p className="mt-2 max-w-md text-sm text-slate-400">
                    La aplicación ha fallado al dibujar esta pantalla. Tus proyectos guardados no se han tocado.
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <button
                        onClick={() => void hardReload()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                    >
                        <RefreshCw size={16} /> Recargar
                    </button>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                    >
                        Volver al inicio
                    </a>
                </div>
                {this.state.message && (
                    <p className="mt-6 max-w-lg break-words text-[11px] text-slate-600">{this.state.message}</p>
                )}
            </div>
        );
    }
}
