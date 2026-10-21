/**
 * Sombras sobre los planos de proyección.
 *
 * - Foco propio: un punto de luz. La sombra de un punto es donde la recta
 *   luz-punto corta el plano.
 * - Foco impropio: luz paralela (una dirección). La sombra es la proyección
 *   cilíndrica sobre el plano.
 *
 * Los sólidos de la app son convexos, así que la sombra es el contorno convexo
 * de las sombras de sus vértices: no hay que calcular la silueta a mano.
 */

import { transformVertex, type SolidMesh } from './solidGeometry';
import type { Vector3 } from '../types';

export type Light =
    | { kind: 'point'; position: Vector3 }
    | { kind: 'direction'; direction: Vector3 };

export type ProjectionPlane = 'h' | 'v';

const dot = (a: Vector3, b: Vector3) => a.x * b.x + a.y * b.y + a.z * b.z;

/**
 * Sombra de un punto sobre el plano horizontal (z = 0) o vertical (y = 0).
 * Devuelve `null` si la luz no llega a ese plano (el punto está por encima de
 * la luz o detrás del plano).
 */
export function shadowOfPoint(p: Vector3, light: Light, plane: ProjectionPlane): Vector3 | null {
    if (light.kind === 'point') {
        const L = light.position;
        // Rayo L + t·(p − L) hasta z = 0 o y = 0
        const den = plane === 'h' ? p.z - L.z : p.y - L.y;
        const num = plane === 'h' ? -L.z : -L.y;
        if (Math.abs(den) < 1e-9) return null;
        const t = num / den;
        // El punto tiene que quedar ENTRE la luz y el plano (t ≥ 1): si no, el
        // plano está del lado de la luz y no hay sombra.
        if (!(t >= 1 - 1e-9)) return null;
        return {
            x: L.x + t * (p.x - L.x),
            y: L.y + t * (p.y - L.y),
            z: L.z + t * (p.z - L.z),
        };
    }

    const d = light.direction;
    const den = plane === 'h' ? d.z : d.y;
    const num = plane === 'h' ? -p.z : -p.y;
    if (Math.abs(den) < 1e-9) return null;
    const t = num / den;
    if (!(t >= -1e-9)) return null;
    return { x: p.x + t * d.x, y: p.y + t * d.y, z: p.z + t * d.z };
}

/** Contorno convexo (Andrew, cadena monótona) de puntos 2D. */
export function convexHull2D(points: { x: number; y: number }[]) {
    const pts = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
    if (pts.length < 3) return pts;

    const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
        (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

    const lower: { x: number; y: number }[] = [];
    for (const p of pts) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
    }
    const upper: { x: number; y: number }[] = [];
    for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
}

/**
 * Sombra de un sólido sobre un plano, como contorno cerrado.
 */
export function shadowOfSolid(
    mesh: SolidMesh,
    position: Vector3,
    rotation: Vector3 | undefined,
    light: Light,
    plane: ProjectionPlane
): Vector3[] | null {
    const vertices = mesh.vertices.map((v) => transformVertex(v, position, rotation));

    const shadows = vertices.map((v) => shadowOfPoint(v, light, plane));
    if (shadows.some((s) => s === null)) return null;

    const pts = shadows as Vector3[];
    const flat = pts.map((p) => ({ x: p.x, y: plane === 'h' ? p.y : p.z }));
    const hull = convexHull2D(flat);
    if (hull.length < 3) return null;

    // Volver a 3D sobre el plano
    return hull.map((p) => ({ x: p.x, y: plane === 'h' ? p.y : 0, z: plane === 'h' ? 0 : p.y }));
}

/**
 * Recorta un polígono (convexo) al semiplano que corresponde al plano de
 * proyección: y ≥ 0 para el horizontal y z ≥ 0 para el vertical.
 */
export function clipToQuarter(points: Vector3[], plane: ProjectionPlane): Vector3[] {
    const key = plane === 'h' ? 'y' : 'z';
    const inside = (p: Vector3) => p[key] >= -1e-9;

    const out: Vector3[] = [];
    for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        const da = a[key];
        const db = b[key];

        if (inside(a)) out.push(a);
        if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
            const t = da / (da - db);
            out.push({
                x: a.x + (b.x - a.x) * t,
                y: a.y + (b.y - a.y) * t,
                z: a.z + (b.z - a.z) * t,
            });
        }
    }
    return out;
}

/** Área de un polígono 3D plano (para comprobar la sombra). */
export function polygonArea3D(points: Vector3[]): number {
    if (points.length < 3) return 0;
    const o = points[0];
    let total: Vector3 = { x: 0, y: 0, z: 0 };
    for (let i = 1; i < points.length - 1; i++) {
        const a = { x: points[i].x - o.x, y: points[i].y - o.y, z: points[i].z - o.z };
        const b = { x: points[i + 1].x - o.x, y: points[i + 1].y - o.y, z: points[i + 1].z - o.z };
        total = {
            x: total.x + (a.y * b.z - a.z * b.y),
            y: total.y + (a.z * b.x - a.x * b.z),
            z: total.z + (a.x * b.y - a.y * b.x),
        };
    }
    return Math.hypot(total.x, total.y, total.z) / 2;
}

/** Dirección de la luz a partir de un punto y una dirección (la luz "baja"). */
export function directionLight(from: Vector3): Light {
    const len = Math.hypot(from.x, from.y, from.z) || 1;
    return { kind: 'direction', direction: { x: from.x / len, y: from.y / len, z: from.z / len } };
}

export const lightDot = dot;
