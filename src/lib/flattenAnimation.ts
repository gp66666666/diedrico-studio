/**
 * Reloj del abatimiento: el giro del plano horizontal sobre la línea de tierra.
 *
 * Todos los objetos de la escena comparten este reloj. Antes cada uno hacía su
 * propia interpolación con `lerp(..., delta * 4)`, así que nunca llegaban a la
 * vez ni al mismo sitio: el alumno no veía una bisagra, veía temblor.
 *
 * El progreso vive fuera de React y fuera de zustand a propósito: se consulta en
 * cada fotograma (60 veces por segundo) y no debe provocar ni un render.
 */

/** Duración del giro en milisegundos. Ni tan rápido que no se entienda, ni tan
 *  lento que aburra: algo más de un segundo es lo que tarda una mano en girar
 *  una hoja de papel. */
const DURATION_MS = 1150;

/** En desarrollo se puede ralentizar para revisar la animación a ojo. */
const duration = () =>
    (import.meta.env.DEV &&
        typeof window !== 'undefined' &&
        (window as any).__flattenDuration) ||
    DURATION_MS;

const clock = {
    /** Progreso de donde arranca la animación (0 = 3D, 1 = abatido). */
    from: 0,
    /** Progreso al que se dirige. */
    to: 0,
    /** Momento de arranque; -1 = parado. */
    startedAt: -1,
};

/** Arranque y frenada suaves: la hoja no debe empezar ni terminar de golpe. */
const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Interpolación suave entre dos umbrales (0 antes de `a`, 1 después de `b`). */
export const smoothstep = (a: number, b: number, x: number) => {
    if (a === b) return x < a ? 0 : 1;
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};

/** Progreso actual del abatimiento: 0 = escena en 3D, 1 = plana sobre el vertical. */
export function flattenProgress(): number {
    if (clock.startedAt < 0) return clock.to;
    const k = Math.min(1, (performance.now() - clock.startedAt) / duration());
    if (k >= 1) {
        clock.startedAt = -1;
        clock.from = clock.to;
        return clock.to;
    }
    return clock.from + (clock.to - clock.from) * easeInOutCubic(k);
}

/**
 * Lanza el giro hacia `flat`. Si se pulsa a mitad de la animación, arranca desde
 * donde esté en ese momento: nunca da un salto.
 */
export function startFlattenAnimation(flat: boolean) {
    clock.from = flattenProgress();
    clock.to = flat ? 1 : 0;
    clock.startedAt = -1;
    // Si ya está en el destino no hay nada que animar.
    if (Math.abs(clock.from - clock.to) < 1e-4) {
        clock.from = clock.to;
        return;
    }
    clock.startedAt = performance.now();
}

/** ¿Hay una animación en curso? Lo usa el aviso de la interfaz. */
export const isFlattenAnimating = () => clock.startedAt >= 0;

/** Vuelve al estado plano sin animar (al cargar un proyecto o en las pruebas). */
export function resetFlattenAnimation() {
    clock.from = 0;
    clock.to = 0;
    clock.startedAt = -1;
}

// Sonda de desarrollo: permite comprobar el progreso desde la consola o desde
// una prueba automática (`window.__flattenProgress()`).
if (import.meta.env.DEV && typeof window !== 'undefined') {
    (window as any).__flattenProgress = flattenProgress;
    (window as any).__startFlattenAnimation = startFlattenAnimation;
    (window as any).__flattenDuration_ = duration;
}
