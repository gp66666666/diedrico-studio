import { useGeometryStore } from '../store/geometryStore';

/**
 * Modo «color por proyección».
 *
 * Sirve para leer un diédrico con muchas figuras: la planta (') va de un color
 * y el alzado ('') de otro, así que de un vistazo sabes qué proyección estás
 * mirando. Y donde las dos se pisan, el color resultante lo delata: eso es
 * justo lo que hace falta cuando dos elementos se solapan en un punto o en una
 * recta.
 *
 * El verde no se pinta: sale solo al mezclar el amarillo y el cian con
 * `mix-blend-mode: darken` (se queda con el mínimo de cada canal, que es lo que
 * hace la mezcla sustractiva de toda la vida). Con azul puro saldría negro, por
 * eso el alzado es cian y no azul.
 *
 * Se usa `darken` y no `multiply` porque `darken` es idempotente: dos trazos del
 * MISMO color no se oscurecen al pisarse (con multiply, tres plantas encimadas
 * acababan casi negras).
 */
export const PROJ_H_COLOR = '#facc15'; // planta (')  → amarillo
export const PROJ_V_COLOR = '#22d3ee'; // alzado ('') → cian
export const PROJ_MIX_COLOR = '#22c55e'; // solape      → verde

/**
 * En tema claro el amarillo y el cian puros no se leen sobre blanco: se usan
 * sus versiones oscuras. Al multiplicarse siguen dando un verde oscuro.
 */
export function projectionPalette(dark: boolean) {
    return dark
        ? { h: PROJ_H_COLOR, v: PROJ_V_COLOR }
        : { h: '#a16207', v: '#0e7490' };
}

export function useProjectionColors(base: string) {
    const on = useGeometryStore((s) => s.projectionColors);
    const { h: hc, v: vc } = projectionPalette(useGeometryStore((s) => s.theme) === 'dark');
    return {
        on,
        /** Color de la planta. */
        h: on ? hc : base,
        /** Color del alzado. */
        v: on ? vc : base,
        /**
         * Se aplica a los dos trazos: dibujados sobre fondo transparente
         * conservan su color, y donde se cruzan se mezclan (verde).
         */
        blend: on ? ({ mixBlendMode: 'darken' as const }) : undefined,
    };
}

/** Igual que `useProjectionColors` pero para textos sueltos: ' o ''. */
export function projectionTextColor(base: string, part: 'h' | 'v', on: boolean) {
    if (!on) return base;
    return part === 'h' ? PROJ_H_COLOR : PROJ_V_COLOR;
}
