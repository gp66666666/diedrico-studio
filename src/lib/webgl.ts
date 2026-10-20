/**
 * ¿Puede este navegador crear un contexto WebGL?
 *
 * En equipos sin aceleración gráfica (o con la GPU bloqueada) `three` lanza
 * "Error creating WebGL context" y se lleva por delante toda la aplicación.
 * Con esta comprobación se muestra un aviso y se ofrece la vista diédrica,
 * que es SVG y funciona sin WebGL.
 */

let cached: boolean | null = null;

export function hasWebGL(): boolean {
    if (cached !== null) return cached;

    try {
        const canvas = document.createElement('canvas');
        const gl =
            canvas.getContext('webgl2') ||
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl');

        cached = !!gl;

        // Liberar el contexto de prueba
        if (gl && 'getExtension' in gl) {
            const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
            lose?.loseContext?.();
        }
    } catch {
        cached = false;
    }

    return cached;
}
