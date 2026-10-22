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

/* ------------------------------------------------------------------ *
 * Tangentes a cono y cilindro (y esfera) usando el sólido del store
 * ------------------------------------------------------------------ */

import { inverseRotateStorePoint, rotateStorePoint, transformVertex } from './solidGeometry';

export interface SolidRef {
    subtype: string;
    position: Vector3;
    size: Vector3;
    rotation?: Vector3;
}

export interface TangentResult {
    planes: TangentPlane[];
    note: string;
}

const toLocalDir = (v: Vector3, s: SolidRef) => inverseRotateStorePoint(v, s.rotation);
const toLocalPoint = (v: Vector3, s: SolidRef) => inverseRotateStorePoint(sub(v, s.position), s.rotation);
const toGlobal = (p: Vector3, s: SolidRef) => transformVertex(p, s.position, s.rotation);

/** Plano local (normal, punto) → plano en coordenadas del store. */
function liftPlane(normalLocal: Vector3, pointLocal: Vector3, s: SolidRef): TangentPlane {
    const n = unit(rotateStorePoint(normalLocal, s.rotation));
    const q = toGlobal(pointLocal, s);
    return { normal: n, constant: -dot(n, q), touch: q };
}

const cylinderParams = (s: SolidRef) => ({
    r: Math.max(s.size.x, 1e-6),
    h: Math.max(s.size.y || s.size.x, 1e-6),
});

const coneParams = (s: SolidRef) => {
    const r = Math.max(s.size.x, 1e-6);
    const h = Math.max(s.size.y || s.size.x, 1e-6);
    return { r, h, tan: r / h, apex: { x: 0, y: 0, z: h / 2 }, base: { x: 0, y: 0, z: -h / 2 } };
};

/**
 * Plano tangente en un punto de la superficie (esfera, cono o cilindro).
 */
export function solidTangentAtPoint(s: SolidRef, point: Vector3): TangentResult {
    const r = Math.max(s.size.x, 1e-6);
    if (s.subtype === 'sphere') {
        const plane = tangentAtPoint(s.position, r, point);
        return {
            planes: plane ? [plane] : [],
            note: plane
                ? 'El radio hasta el punto de tangencia es perpendicular al plano.'
                : 'Ese punto no está sobre la esfera.',
        };
    }

    const p = toLocalPoint(point, s);
    const rho = Math.hypot(p.x, p.y);
    const tol = 1e-3 * Math.max(1, r);

    if (s.subtype === 'cylinder') {
        const { h } = cylinderParams(s);
        const onSurface = Math.abs(rho - r) <= tol && Math.abs(p.z) <= h / 2 + tol;
        if (!onSurface) {
            return { planes: [], note: 'Ese punto no está sobre la superficie lateral del cilindro.' };
        }
        if (rho < 1e-9) return { planes: [], note: 'El punto está en el eje del cilindro.' };
        const plane = liftPlane({ x: p.x / rho, y: p.y / rho, z: 0 }, p, s);
        return {
            planes: [plane],
            note: 'El plano contiene la generatriz que pasa por el punto y es perpendicular al radio.',
        };
    }

    if (s.subtype === 'cone') {
        const { r: rc, h, tan, apex } = coneParams(s);
        const expected = rc * (apex.z - p.z) / h;
        const onSurface = Math.abs(rho - expected) <= tol * 1.5 && p.z <= apex.z + tol && p.z >= -h / 2 - tol;
        if (!onSurface) {
            return { planes: [], note: 'Ese punto no está sobre la superficie lateral del cono.' };
        }
        if (rho < 1e-9) return { planes: [], note: 'El punto está en el vértice o en el eje del cono.' };
        // Contiene la generatriz (vértice → punto) y la tangente a la base
        const g = { x: apex.x - p.x, y: apex.y - p.y, z: apex.z - p.z };
        const t = { x: -p.y / rho, y: p.x / rho, z: 0 };
        let n = unit(cross(g, t));
        // Hacia fuera (el eje queda del otro lado)
        if (dot(n, { x: p.x, y: p.y, z: 0 }) < 0) n = { x: -n.x, y: -n.y, z: -n.z };
        void tan;
        return {
            planes: [liftPlane(n, p, s)],
            note: 'El plano contiene la generatriz que pasa por el punto y la tangente a la base en su pie.',
        };
    }

    return { planes: [], note: 'Los planos tangentes solo están para esfera, cono y cilindro.' };
}

/**
 * Los dos planos de apoyo perpendiculares a una dirección (tangentes paralelos
 * a un plano dado, que es el de normal `normal`).
 */
export function solidTangentParallel(s: SolidRef, normal: Vector3): TangentResult {
    const n = unit(normal);
    const r = Math.max(s.size.x, 1e-6);

    if (s.subtype === 'sphere') {
        const planes = tangentPlanesParallel(s.position, r, n);
        return { planes, note: 'Los dos planos son paralelos al dado y están a distancia r del centro.' };
    }

    if (s.subtype === 'cylinder') {
        const { h } = cylinderParams(s);
        const a = unit(rotateStorePoint({ x: 0, y: 0, z: 1 }, s.rotation));
        const C = s.position;
        const nk = dot(n, a);
        const perp = sub(n, mul(a, nk));
        const m = norm(perp);

        if (m < 1e-9) {
            // Normal paralela al eje: los planos de las bases
            const basePlanes: TangentPlane[] = [];
            [1, -1].forEach((sign) => {
                const q = add(C, mul(a, (sign * h) / 2));
                basePlanes.push({ normal: n, constant: -dot(n, q), touch: q });
            });
            return { planes: basePlanes, note: 'El plano es perpendicular al eje: los tangentes son los de las bases.' };
        }

        const u = unit(perp);
        const sgn = nk >= 0 ? 1 : -1;
        const cHi = dot(n, C) + r * m + (h / 2) * Math.abs(nk);
        const cLo = dot(n, C) - r * m - (h / 2) * Math.abs(nk);
        const planes: TangentPlane[] = [
            {
                normal: n,
                constant: -cHi,
                touch: add(add(C, mul(u, r)), mul(a, (sgn * h) / 2)),
            },
            {
                normal: n,
                constant: -cLo,
                touch: add(sub(C, mul(u, r)), mul(a, (-sgn * h) / 2)),
            },
        ];
        return {
            planes,
            note: 'Cada plano toca al cilindro en un punto del borde de una base.',
        };
    }

    if (s.subtype === 'cone') {
        const { r: rc, h, apex, base } = coneParams(s);
        const V = toGlobal(apex, s);
        const B = toGlobal(base, s);
        const nk = dot(n, unit(rotateStorePoint({ x: 0, y: 0, z: 1 }, s.rotation)));
        const perp = sub(n, mul(unit(rotateStorePoint({ x: 0, y: 0, z: 1 }, s.rotation)), nk));
        const m = norm(perp);
        const rimMax = dot(n, B) + rc * m;
        const rimMin = dot(n, B) - rc * m;
        const apexValue = dot(n, V);
        const u = m > 1e-9 ? unit(perp) : { x: 0, y: 0, z: 0 };

        const hi = apexValue >= rimMax;
        const lo = apexValue <= rimMin;
        const planes: TangentPlane[] = [
            {
                normal: n,
                constant: -(hi ? apexValue : rimMax),
                touch: hi ? V : add(B, mul(u, rc)),
            },
            {
                normal: n,
                constant: -(lo ? apexValue : rimMin),
                touch: lo ? V : sub(B, mul(u, rc)),
            },
        ];
        void h;
        return {
            planes,
            note:
                hi || lo
                    ? 'Uno de los planos solo toca al cono en el vértice.'
                    : 'Cada plano es tangente al cono a lo largo de una generatriz.',
        };
    }

    return { planes: [], note: 'Los planos tangentes solo están para esfera, cono y cilindro.' };
}

/**
 * Plano(s) tangente(s) que contienen una recta.
 *
 * - Esfera: hasta dos.
 * - Cilindro: el plano tiene que contener una generatriz (ser paralelo al eje).
 * - Cono: el plano tiene que contener el vértice.
 */
export function solidTangentThroughLine(s: SolidRef, line: { point: Vector3; direction: Vector3 }): TangentResult {
    const r = Math.max(s.size.x, 1e-6);

    if (s.subtype === 'sphere') {
        const planes = tangentPlanesThroughLine(s.position, r, line);
        return {
            planes,
            note:
                planes.length === 0
                    ? 'La recta corta a la esfera: no hay planos tangentes que la contengan.'
                    : planes.length === 1
                      ? 'La recta es tangente a la esfera: un solo plano.'
                      : 'Dos planos, uno por cada rama del cono tangente.',
        };
    }

    const d = line.direction;
    if (norm(d) < 1e-9) return { planes: [], note: 'La recta no tiene dirección.' };
    const u = unit(d);

    if (s.subtype === 'cylinder') {
        const { h } = cylinderParams(s);
        const a = unit(rotateStorePoint({ x: 0, y: 0, z: 1 }, s.rotation));
        const m = cross(u, a);
        if (norm(m) < 1e-9) {
            return {
                planes: [],
                note: 'La recta es paralela al eje del cilindro: no define un único plano tangente.',
            };
        }
        const n = unit(m);
        const dist = Math.abs(dot(n, sub(s.position, line.point)));
        if (Math.abs(dist - r) > 1e-3 * Math.max(1, r)) {
            return {
                planes: [],
                note: 'La recta no es tangente al cilindro: ningún plano que la contenga lo toca sin cortarlo.',
            };
        }
        void h;
        return {
            planes: [
                {
                    normal: n,
                    constant: -dot(n, line.point),
                    touch: add(s.position, mul(unit(cross(n, a)), r)),
                },
            ],
            note: 'El plano contiene una generatriz del cilindro.',
        };
    }

    if (s.subtype === 'cone') {
        const { r: rc, h, tan, apex } = coneParams(s);
        const V = toGlobal(apex, s);
        const toV = sub(V, line.point);
        const m = cross(toV, u);
        if (norm(m) < 1e-9) {
            return { planes: [], note: 'La recta pasa por el vértice: hay infinitos planos tangentes.' };
        }
        // Normal en el sistema local (el eje del cono es z)
        const nLocal = toLocalDir(unit(m), s);
        const ok = Math.abs(Math.abs(nLocal.z) - tan * Math.hypot(nLocal.x, nLocal.y)) < 1e-3;
        if (!ok) {
            return {
                planes: [],
                note: 'La recta no define un plano tangente al cono: el plano por el vértice la corta.',
            };
        }
        const n = unit(rotateStorePoint(nLocal, s.rotation));
        // Punto de tangencia: pie sobre la superficie en la generatriz de contacto
        const sign = nLocal.z >= 0 ? 1 : -1;
        const phi = Math.atan2(nLocal.y, nLocal.x);
        const contactBase = { x: rc * Math.cos(phi), y: rc * Math.sin(phi), z: -h / 2 };
        const touch = toGlobal(
            sign > 0 ? { x: contactBase.x, y: contactBase.y, z: contactBase.z } : contactBase,
            s
        );
        return {
            planes: [{ normal: n, constant: -dot(n, line.point), touch }],
            note: 'El plano contiene el vértice y es tangente a lo largo de una generatriz.',
        };
    }

    return { planes: [], note: 'Los planos tangentes solo están para esfera, cono y cilindro.' };
}
