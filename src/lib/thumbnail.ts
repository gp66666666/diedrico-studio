/**
 * Miniatura del proyecto a partir del canvas 3D.
 *
 * Se guarda como dataURL pequeño (~10-15 KB) en `projects.thumbnail_url`, así
 * la lista de proyectos deja de ser una lista de títulos y no hace falta
 * contratar Storage.
 */
export function captureThumbnail(): string | null {
    try {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
        if (!canvas || canvas.width === 0) return null;

        const width = 320;
        const height = Math.round((canvas.height / canvas.width) * width);

        const out = document.createElement('canvas');
        out.width = width;
        out.height = height;

        const ctx = out.getContext('2d');
        if (!ctx) return null;

        ctx.fillStyle = '#0b1120';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(canvas, 0, 0, width, height);

        return out.toDataURL('image/jpeg', 0.6);
    } catch {
        // WebGL sin preserveDrawingBuffer o canvas vacío: sin miniatura
        return null;
    }
}
