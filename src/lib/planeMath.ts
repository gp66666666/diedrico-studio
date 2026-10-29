import type { Vector3 } from '../types';

export interface PlaneEquation {
    normal: Vector3;
    constant: number;
}

/**
 * Ecuación del plano que pasa por tres puntos:  n · p + D = 0.
 *
 * `n = (B − A) × (C − A)` y `D = −n · A`. El vector normal NO se normaliza:
 * la ecuación es válida igual y el render 2D ya divide por la componente que
 * toca, así que normalizar solo añadiría ruido numérico.
 *
 * Devuelve `null` si los tres puntos están alineados (no definen plano).
 * El umbral se mide como seno del ángulo: |u × v| ≤ 1e-9 · |u| · |v|, para que
 * no dependa de la escala (un plano de 1 mm y uno de 1 km se juzgan igual).
 */
export function planeFromThreePoints(a: Vector3, b: Vector3, c: Vector3): PlaneEquation | null {
    const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    const v = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };

    const normal = {
        x: u.y * v.z - u.z * v.y,
        y: u.z * v.x - u.x * v.z,
        z: u.x * v.y - u.y * v.x,
    };

    const nLen = Math.hypot(normal.x, normal.y, normal.z);
    const scale = Math.hypot(u.x, u.y, u.z) * Math.hypot(v.x, v.y, v.z);

    // Alineados (o algún punto repetido): el área del paralelogramo es nula.
    if (nLen === 0 || nLen <= 1e-9 * scale) return null;

    return {
        normal,
        constant: -(normal.x * a.x + normal.y * a.y + normal.z * a.z),
    };
}

/** Valor de la ecuación en un punto (0 si está en el plano). */
export function evaluatePlane(plane: PlaneEquation, p: Vector3): number {
    return plane.normal.x * p.x + plane.normal.y * p.y + plane.normal.z * p.z + plane.constant;
}

/** Distancia de un punto al plano (usa |n|, así que vale con n sin normalizar). */
export function distanceToPlane(plane: PlaneEquation, p: Vector3): number {
    const nLen = Math.hypot(plane.normal.x, plane.normal.y, plane.normal.z);
    if (nLen === 0) return Number.NaN;
    return Math.abs(evaluatePlane(plane, p)) / nLen;
}
