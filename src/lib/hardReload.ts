/**
 * Recarga "de verdad": desregistra el service worker y borra las cachés antes
 * de recargar.
 *
 * La PWA cachea el núcleo de la app. Si una versión concreta sale rota (por
 * ejemplo, un fallo de WebGL), un `location.reload()` puede volver a servir el
 * mismo bundle malo. Esto garantiza que se descarga el nuevo.
 */
export async function hardReload(): Promise<void> {
    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((r) => r.unregister()));
        }
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
        }
    } catch {
        // si algo falla, al menos se intenta la recarga normal
    }

    window.location.reload();
}
