import { Component, type ErrorInfo, type ReactNode } from 'react';
import WebGLFallback from './WebGLFallback';

interface Props {
    children: ReactNode;
    onGo2D?: () => void;
    compact?: boolean;
}

interface State {
    failed: boolean;
}

/**
 * Aísla los fallos de WebGL/three para que no tumben toda la aplicación:
 * si el contexto 3D revienta, se muestra el aviso y el resto sigue vivo
 * (la vista diédrica, la lista, los proyectos…).
 */
export default class SceneBoundary extends Component<Props, State> {
    state: State = { failed: false };

    static getDerivedStateFromError(): State {
        return { failed: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Fallo en la escena 3D:', error, info.componentStack);
    }

    render() {
        if (this.state.failed) {
            return (
                <WebGLFallback
                    onGo2D={this.props.onGo2D ? () => this.props.onGo2D!() : undefined}
                    compact={this.props.compact}
                />
            );
        }
        return this.props.children;
    }
}
