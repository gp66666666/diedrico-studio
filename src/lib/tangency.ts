/**
 * Planos tangentes a una esfera.
 *
 * Tres ejercicios clásicos:
 *  - tangente en un punto de la esfera,
 *  - tangentes que contienen una recta exterior (dos soluciones, una si la
 *    recta es tangente),
 *  - tangentes paralelos a un plano dado (dos soluciones).
 */

import type { Vector3 } from '../types';

export interface TangentPlane {
    normal: Vector3;
    /** Plano n·x + d = 0 */
    constant: number;
    /** Punto de tangencia con la esfera. */
    touch: Vector3;
}

const sub = (a: Vector3, b: Vector3): Vector3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const add = (a: Vector3, b: Vector3): Vector3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const mul = (a: Vector3, k: number): Vector3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const dot = (a: Vector3, b: Vector3) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: Vector3, b: Vector3): Vector3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});
const norm = (a: Vector3) => Math.hypot(a.x, a.y, a.z);
const unit = (a: Vector3): Vector3 => {
    const n = norm(a) || 1;
    return { x: a.x / n, y: a.y / n, z: a.z / n };
};

const planeThrough = (normal: Vector3, point: Vector3): TangentPlane => {
    const n = unit(normal);
    return { normal: n, constant: -dot(n, point), touch: point };
};

/** Plano tangente a la esfera en un punto de su superficie. */
export function tangentAtPoint(center: Vector3, radius: number, point: Vector3): TangentPlane | null {
    const v = sub(point, center);
    const len = norm(v);
    if (len < 1e-9) return null;
    // El punto debe estar sobre la esfera (tolerancia relativa)
    if (Math.abs(len - radius) > 1e-4 * Math.max(1, radius)) return null;

    const n = unit(v);
    return { normal: n, constant: -dot(n, point), touch: point };
}

/** Planos tangentes a la esfera que contienen una recta exterior. */
export function tangentPlanesThroughLine(
    center: Vector3,
    radius: number,
    line: { point: Vector3; direction: Vector3 }
): TangentPlane[] {
    const u = unit(line.direction);
    const w = sub(center, line.point);
    const along = dot(w, u);
    const perp = sub(w, mul(u, along)); // vector del punto de la recta al centro
    const D = norm(perp);

    if (D < 1e-9) return []; // la recta pasa por el centro
    if (D < radius - 1e-9) return []; // la recta corta la esfera

    const wUnit = unit(perp);
    const v = unit(cross(u, wUnit));

    const alpha = Math.min(1, radius / D);
    const beta = Math.sqrt(Math.max(0, 1 - alpha * alpha));

    const normals = beta < 1e-9
        ? [wUnit]
        : [add(mul(wUnit, alpha), mul(v, beta)), add(mul(wUnit, alpha), mul(v, -beta))];

    return normals.map((n) => {
        const normal = unit(n);
        return {
            normal,
            constant: -dot(normal, line.point),
            // Punto de tangencia: el pie de la perpendicular desde el centro
            touch: sub(center, mul(normal, radius)),
        };
    });
}

/** Planos tangentes a la esfera paralelos a un plano (dos soluciones). */
export function tangentPlanesParallel(center: Vector3, radius: number, normal: Vector3): TangentPlane[] {
    const n = unit(normal);
    return [1, -1].map((sign) => {
        const touch = add(center, mul(n, sign * radius));
        return { normal: n, constant: -dot(n, touch), touch };
    });
}

/** Distancia de un punto a un plano n·x + d = 0. */
export const distancePointPlane = (p: Vector3, normal: Vector3, constant: number) =>
    Math.abs(dot(normal, p) + constant) / (norm(normal) || 1);
