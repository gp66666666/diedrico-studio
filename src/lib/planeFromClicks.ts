/**
 * Plano dibujado con tres clics sobre el papel.
 *
 * En diédrico, un punto del papel es un punto de uno de los dos planos de
 * proyección: debajo de la línea de tierra, del horizontal (alejamiento);
 * encima, del vertical (cota). Tres clics así (dos para la traza horizontal
 * α₁ y uno para la vertical α₂) definen el plano sin escribir coordenadas.
 */

import type { Vector3 } from '../types';

export interface PaperPoint {
    x: number;
    y: number;
}

export interface PlaneEquation {
    normal: Vector3;
    constant: number;
}

/** Punto del papel (px, LT en y = 0) → punto del espacio. */
export function paperToPoint(p: PaperPoint, scale: number): Vector3 {
    return p.y >= 0
        ? { x: p.x / scale, y: p.y / scale, z: 0 }
        : { x: p.x / scale, y: 0, z: -p.y / scale };
}

/**
 * Plano que pasa por tres clics. Devuelve `null` si están alineados.
 */
export function planeFromThreeClicks(clicks: PaperPoint[], scale: number): PlaneEquation | null {
    if (clicks.length !== 3) return null;

    const [a, b, c] = clicks.map((p) => paperToPoint(p, scale));

    const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    const v = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };

    const normal = {
        x: u.y * v.z - u.z * v.y,
        y: u.z * v.x - u.x * v.z,
        z: u.x * v.y - u.y * v.x,
    };

    if (Math.hypot(normal.x, normal.y, normal.z) < 1e-6) return null;

    return {
        normal,
        constant: -(normal.x * a.x + normal.y * a.y + normal.z * a.z),
    };
}
