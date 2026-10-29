/**
 * Plano dibujado con tres clics sobre el papel.
 *
 * En diédrico, un punto del papel es un punto de uno de los dos planos de
 * proyección: debajo de la línea de tierra, del horizontal (alejamiento);
 * encima, del vertical (cota). Tres clics así (dos para la traza horizontal
 * α₁ y uno para la vertical α₂) definen el plano sin escribir coordenadas.
 */

import type { Vector3 } from '../types';
import { planeFromThreePoints, type PlaneEquation } from './planeMath';

export interface PaperPoint {
    x: number;
    y: number;
}

export type { PlaneEquation };

/** Punto del papel (px, LT en y = 0) → punto del espacio. */
export function paperToPoint(p: PaperPoint, scale: number): Vector3 {
    return p.y >= 0
        ? { x: p.x / scale, y: p.y / scale, z: 0 }
        : { x: p.x / scale, y: 0, z: -p.y / scale };
}

/**
 * Plano que pasa por tres clics. Devuelve `null` si están alineados.
 *
 * Los dos primeros clics (bajo la LT) son puntos de z = 0, o sea de la traza
 * horizontal α₁; el tercero (sobre la LT) tiene y = 0 y pertenece a α₂.
 */
export function planeFromThreeClicks(clicks: PaperPoint[], scale: number): PlaneEquation | null {
    if (clicks.length !== 3) return null;

    const [a, b, c] = clicks.map((p) => paperToPoint(p, scale));
    return planeFromThreePoints(a, b, c);
}

/**
 * Recta a partir de dos clics en el papel.
 *
 * Devuelve los dos puntos en el espacio y la dirección (sin normalizar, como el
 * resto de rectas del store: `direction = B − A`). `null` si los clics coinciden.
 */
export function lineFromTwoClicks(
    clicks: PaperPoint[],
    scale: number
): { point: Vector3; point2: Vector3; direction: Vector3 } | null {
    if (clicks.length !== 2) return null;

    const point = paperToPoint(clicks[0], scale);
    const point2 = paperToPoint(clicks[1], scale);

    const direction = {
        x: point2.x - point.x,
        y: point2.y - point.y,
        z: point2.z - point.z,
    };

    if (Math.hypot(direction.x, direction.y, direction.z) < 1e-9) return null;

    return { point, point2, direction };
}
