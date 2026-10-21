/**
 * Intersección de una recta (o un segmento) con un sólido convexo.
 *
 * Se recorre el intervalo de parámetro t en el que la recta está dentro de
 * todos los semiplanos de las caras. Ese intervalo, cortado con el dominio de
 * la recta, da los puntos de entrada y salida (0, 1 o 2).
 */

import { transformVertex, type SolidMesh } from './solidGeometry';
import type { Vector3 } from '../types';

const EPS = 1e-7;

const dot = (a: Vector3, b: Vector3) => a.x * b.x + a.y * b.y + a.z * b.z;
const sub = (a: Vector3, b: Vector3): Vector3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const cross = (a: Vector3, b: Vector3): Vector3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});
const norm = (a: Vector3) => Math.hypot(a.x, a.y, a.z);

export interface LineSolidResult {
    /** Punto de entrada (o el único punto si la recta es tangente). */
    entry: Vector3 | null;
    /** Punto de salida. */
    exit: Vector3 | null;
    /** Parámetros en la recta. */
    tEntry: number;
    tExit: number;
}

/**
 * Planos exteriores de la malla transformada al store.
 */
function facePlanes(mesh: SolidMesh, position: Vector3, rotation?: Vector3) {
    const vertices = mesh.vertices.map((v) => transformVertex(v, position, rotation));
    const center = vertices.reduce(
        (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y, z: acc.z + v.z }),
        { x: 0, y: 0, z: 0 }
    );
    center.x /= vertices.length;
    center.y /= vertices.length;
    center.z /= vertices.length;

    return mesh.faces.map((face) => {
        const a = vertices[face[0]];
        const b = vertices[face[1]];
        const c = vertices[face[2]];
        let n = cross(sub(b, a), sub(c, a));
        const len = norm(n) || 1;
        n = { x: n.x / len, y: n.y / len, z: n.z / len };
        if (dot(n, sub(a, center)) < 0) n = { x: -n.x, y: -n.y, z: -n.z };
        return { n, d: -dot(n, a) };
    });
}

/**
 * Puntos de entrada y salida de una recta en un sólido convexo.
 *
 * @param line punto y dirección (no hace falta que sea unitaria)
 * @param domain [t0, t1] para segmentos; por defecto toda la recta
 */
export function intersectLineSolid(
    mesh: SolidMesh,
    position: Vector3,
    rotation: Vector3 | undefined,
    line: { point: Vector3; direction: Vector3 },
    domain: [number, number] = [-Infinity, Infinity]
): LineSolidResult | null {
    const dirLen = norm(line.direction);
    if (dirLen < EPS) return null;
    const dir = {
        x: line.direction.x / dirLen,
        y: line.direction.y / dirLen,
        z: line.direction.z / dirLen,
    };

    let tMin = domain[0];
    let tMax = domain[1];

    for (const { n, d } of facePlanes(mesh, position, rotation)) {
        const den = dot(n, dir);
        const num = dot(n, line.point) + d;

        if (Math.abs(den) < EPS) {
            // Recta paralela al plano: o está dentro o no lo toca
            if (num > EPS) return null;
            continue;
        }

        const t = -num / den;
        if (den > 0) tMax = Math.min(tMax, t);
        else tMin = Math.max(tMin, t);
    }

    if (!Number.isFinite(tMin) || !Number.isFinite(tMax)) return null;
    if (tMax < tMin - EPS) return null;

    const at = (t: number): Vector3 => ({
        x: line.point.x + dir.x * t,
        y: line.point.y + dir.y * t,
        z: line.point.z + dir.z * t,
    });

    // Si el extremo coincide con el principio o el final del segmento, ahí no
    // hay un punto de penetración: el segmento ya estaba dentro.
    const startsAtDomain = Number.isFinite(domain[0]) && Math.abs(tMin - domain[0]) < 1e-9;
    const endsAtDomain = Number.isFinite(domain[1]) && Math.abs(tMax - domain[1]) < 1e-9;

    if (Math.abs(tMax - tMin) < EPS) {
        return {
            entry: startsAtDomain ? null : at(tMin),
            exit: null,
            tEntry: tMin,
            tExit: tMin,
        };
    }

    const entry = startsAtDomain ? null : at(tMin);
    const exit = endsAtDomain ? null : at(tMax);

    if (!entry && !exit) return null;

    return { entry, exit, tEntry: tMin, tExit: tMax };
}
