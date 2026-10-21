/**
 * Sección de un sólido por un plano.
 *
 * Trabaja sobre la MISMA malla que el 3D y el diédrico (lib/solidGeometry),
 * así que la sección que se dibuja coincide con el sólido que se ve.
 *
 * El plano es n·p + d = 0, en coordenadas del store.
 */

import { transformVertex, type SolidMesh } from './solidGeometry';
import type { Vector3 } from '../types';

const EPS = 1e-6;

const dot = (a: Vector3, b: Vector3) => a.x * b.x + a.y * b.y + a.z * b.z;
const sub = (a: Vector3, b: Vector3): Vector3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const cross = (a: Vector3, b: Vector3): Vector3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});
const norm = (a: Vector3) => Math.sqrt(dot(a, a)) || 1;
const normalize = (a: Vector3): Vector3 => {
    const n = norm(a);
    return { x: a.x / n, y: a.y / n, z: a.z / n };
};
const lerp = (a: Vector3, b: Vector3, t: number): Vector3 => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
});

const keyOf = (p: Vector3) => `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}`;

/**
 * Corta la malla con el plano y devuelve el contorno de la sección.
 *
 * Los sólidos de la app son convexos, así que la sección es un único polígono
 * convexo: basta reunir los puntos en los que el plano corta las aristas y
 * ordenarlos por ángulo alrededor del centro. Así funcionan también los casos
 * límite (plano que pasa por una cara, por una arista o por un vértice) y no
 * se cuelan los vértices que deja la triangulación.
 */
export function sectionPolygons(
    mesh: SolidMesh,
    position: Vector3,
    rotation: Vector3 | undefined,
    normal: Vector3,
    constant: number
): Vector3[][] {
    const len = norm(normal);
    if (len < EPS) return [];
    const n = normalize(normal);
    const d = constant / len;

    const verts = mesh.vertices.map((p) => transformVertex(p, position, rotation));
    const points: Vector3[] = [];

    const add = (p: Vector3) => {
        if (!points.some((q) => Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z) < 1e-6)) points.push(p);
    };

    const seen = new Set<string>();

    mesh.faces.forEach((face) => {
        for (let i = 0; i < face.length; i++) {
            const ia = face[i];
            const ib = face[(i + 1) % face.length];
            const key = ia < ib ? `${ia}-${ib}` : `${ib}-${ia}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const a = verts[ia];
            const b = verts[ib];
            if (!a || !b) continue;

            const da = dot(n, a) + d;
            const db = dot(n, b) + d;

            // Vértice sobre el plano (caso de plano que pasa por una cara o arista)
            if (Math.abs(da) < 1e-7) add(a);
            if (Math.abs(db) < 1e-7) add(b);

            // Arista que cruza el plano
            if ((da > 1e-7 && db < -1e-7) || (da < -1e-7 && db > 1e-7)) {
                add(lerp(a, b, da / (da - db)));
            }
        }
    });

    if (points.length < 3) return [];

    const center = points.reduce(
        (acc, p) => ({ x: acc.x + p.x / points.length, y: acc.y + p.y / points.length, z: acc.z + p.z / points.length }),
        { x: 0, y: 0, z: 0 }
    );

    const ref = Math.abs(n.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
    const u = normalize(cross(ref, n));
    const v = cross(n, u);

    const ordered = points
        .map((p) => {
            const rel = sub(p, center);
            return { p, angle: Math.atan2(dot(rel, v), dot(rel, u)) };
        })
        .sort((a, b) => a.angle - b.angle)
        .map((o) => o.p);

    return [removeCollinear(ordered)];
}

function removeCollinear(points: Vector3[]): Vector3[] {
    if (points.length <= 3) return points;
    const out: Vector3[] = [];
    for (let i = 0; i < points.length; i++) {
        const prev = out.length > 0 ? out[out.length - 1] : points[points.length - 1];
        const cur = points[i];
        const next = points[(i + 1) % points.length];
        const ab = sub(cur, prev);
        const bc = sub(next, cur);
        const n = cross(ab, bc);
        const scale = Math.max(1, norm(ab) * norm(bc));
        if (Math.hypot(n.x, n.y, n.z) > 1e-6 * scale) out.push(cur);
    }
    return out.length >= 3 ? out : points;
}

export interface TrueShape {
    /** Polígono abatido sobre el plano (2D, en unidades reales). */
    points: { x: number; y: number }[];
    perimeter: number;
    area: number;
}

/**
 * Verdadera magnitud de la sección: se abate el polígono sobre su plano.
 * Es el "desarrollo" de la sección, lo que se ve al mirar el corte de frente.
 */
export function trueShape(points: Vector3[], normal: Vector3): TrueShape | null {
    if (points.length < 3) return null;
    const n = normalize(normal);
    const ref = Math.abs(n.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
    const u = normalize(cross(ref, n));
    const v = cross(n, u);

    const pts = points.map((p) => ({ x: dot(p, u), y: dot(p, v) }));

    let perimeter = 0;
    for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        perimeter += Math.hypot(b.x - a.x, b.y - a.y);
    }

    let twiceArea = 0;
    for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        twiceArea += a.x * b.y - b.x * a.y;
    }

    return { points: pts, perimeter, area: Math.abs(twiceArea) / 2 };
}
