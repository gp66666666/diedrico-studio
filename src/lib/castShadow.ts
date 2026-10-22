/**
 * Sombra arrojada sobre un plano cualquiera o sobre otro sólido.
 *
 * - Sobre un plano: se proyectan los vértices del objeto y se toma su contorno
 *   convexo (la proyección de un convexo es convexa).
 * - Sobre otro sólido: se proyecta el objeto sobre el plano de cada cara del
 *   receptor que mira a la luz, y se recorta con la cara. Cada trozo es
 *   exacto; juntando todos, el contorno del conjunto es la silueta de la
 *   sombra (las aristas que aparecen una sola vez).
 */

import { transformVertex, type SolidMesh } from './solidGeometry';
import { convexHull2D, type Light } from './shadows';
import type { Vector3 } from '../types';

const EPS = 1e-9;

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

export interface PlaneRef {
    normal: Vector3;
    constant: number;
}

/** Base ortonormal del plano (u, v) a partir de la normal. */
function planeBasis(n: Vector3) {
    const u = Math.abs(n.z) < 0.9 ? unit(cross(n, { x: 0, y: 0, z: 1 })) : unit(cross(n, { x: 1, y: 0, z: 0 }));
    const v = cross(n, u);
    return { u, v };
}

/** Punto donde la recta luz-punto corta el plano (null si no llega). */
export function projectPointOnPlane(p: Vector3, light: Light, plane: PlaneRef): Vector3 | null {
    const n = plane.normal;
    if (light.kind === 'point') {
        const L = light.position;
        const den = dot(n, sub(p, L));
        if (Math.abs(den) < 1e-9) return null;
        const t = -(dot(n, L) + plane.constant) / den;
        // El punto tiene que quedar entre la luz y el plano
        if (t < 1 - 1e-9) return null;
        return add(L, mul(sub(p, L), t));
    }

    const d = light.direction;
    const den = dot(n, d);
    if (Math.abs(den) < 1e-9) return null;
    const t = -(dot(n, p) + plane.constant) / den;
    if (t < -1e-9) return null;
    return add(p, mul(d, t));
}

/** Aristas únicas de la malla. */
function meshEdges(mesh: SolidMesh): [number, number][] {
    const seen = new Set<string>();
    const edges: [number, number][] = [];
    mesh.faces.forEach((face) => {
        for (let i = 0; i < face.length; i++) {
            const a = face[i];
            const b = face[(i + 1) % face.length];
            const k = a < b ? `${a}-${b}` : `${b}-${a}`;
            if (seen.has(k)) continue;
            seen.add(k);
            edges.push([a, b]);
        }
    });
    return edges;
}

/**
 * Puntos que definen la sombra de un sólido sobre un plano.
 *
 * Se proyectan los vértices que quedan del lado de la luz y, si el plano
 * corta al sólido, también los puntos en que sus aristas atraviesan el plano
 * (esos puntos son su propia sombra). Así funciona aunque el plano corte el
 * cuerpo.
 */
export function projectMeshOnPlane(
    mesh: SolidMesh,
    position: Vector3,
    rotation: Vector3 | undefined,
    light: Light,
    plane: PlaneRef
): Vector3[] {
    const n = unit(plane.normal);
    const flat: PlaneRef = { normal: n, constant: plane.constant / (norm(plane.normal) || 1) };
    const world = mesh.vertices.map((v) => transformVertex(v, position, rotation));

    const points: Vector3[] = [];
    world.forEach((p) => {
        const hit = projectPointOnPlane(p, light, flat);
        if (hit) points.push(hit);
    });

    meshEdges(mesh).forEach(([i, j]) => {
        const a = world[i];
        const b = world[j];
        const da = dot(flat.normal, a) + flat.constant;
        const db = dot(flat.normal, b) + flat.constant;
        if ((da > 0 && db < 0) || (da < 0 && db > 0)) {
            const t = da / (da - db);
            points.push(add(a, mul(sub(b, a), t)));
        }
    });

    return points;
}

/**
 * Sombra de un sólido sobre un plano: contorno convexo de la sombra de sus
 * vértices (y de los cortes del plano con sus aristas).
 */
export function shadowOfSolidOnPlane(
    mesh: SolidMesh,
    position: Vector3,
    rotation: Vector3 | undefined,
    light: Light,
    plane: PlaneRef
): Vector3[] | null {
    const n = unit(plane.normal);
    const flat: PlaneRef = { normal: n, constant: plane.constant / (norm(plane.normal) || 1) };
    const points = projectMeshOnPlane(mesh, position, rotation, light, flat);
    if (points.length < 3) return null;

    const { u, v } = planeBasis(n);
    const origin = mul(n, -flat.constant);
    const flat2d = points.map((p) => ({ x: dot(sub(p, origin), u), y: dot(sub(p, origin), v) }));
    const hull = convexHull2D(flat2d);
    if (hull.length < 3) return null;

    return hull.map((q) => add(origin, add(mul(u, q.x), mul(v, q.y))));
}

/** Polígono 2D convexo: recorte de `subject` por el convexo `clip`. */
function clipConvex(
    subject: { x: number; y: number }[],
    clip: { x: number; y: number }[]
): { x: number; y: number }[] {
    // Hay que conocer el sentido de giro del clip
    let area = 0;
    for (let i = 0; i < clip.length; i++) {
        const a = clip[i];
        const b = clip[(i + 1) % clip.length];
        area += a.x * b.y - b.x * a.y;
    }
    const sign = area >= 0 ? 1 : -1;

    let output = subject;
    for (let i = 0; i < clip.length; i++) {
        const a = clip[i];
        const b = clip[(i + 1) % clip.length];
        const inside = (p: { x: number; y: number }) =>
            sign * ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) >= -1e-9;

        const input = output;
        output = [];
        for (let j = 0; j < input.length; j++) {
            const p = input[j];
            const q = input[(j + 1) % input.length];
            const pin = inside(p);
            const qin = inside(q);
            if (pin) output.push(p);
            if (pin !== qin) {
                const dx = q.x - p.x;
                const dy = q.y - p.y;
                const ex = b.x - a.x;
                const ey = b.y - a.y;
                const den = dx * ey - dy * ex;
                if (Math.abs(den) > 1e-12) {
                    const t = ((a.x - p.x) * ey - (a.y - p.y) * ex) / den;
                    output.push({ x: p.x + dx * t, y: p.y + dy * t });
                }
            }
        }
        if (output.length === 0) return [];
    }
    return output;
}

export interface CastShadowMesh {
    vertices: Vector3[];
    faces: number[][];
    outline: [number, number][];
}

/** Área de un polígono 3D plano. */
const polygonArea3D = (points: Vector3[]) => {
    if (points.length < 3) return 0;
    const o = points[0];
    let total: Vector3 = { x: 0, y: 0, z: 0 };
    for (let i = 1; i < points.length - 1; i++) {
        const a = sub(points[i], o);
        const b = sub(points[i + 1], o);
        total = add(total, cross(a, b));
    }
    return norm(total) / 2;
};

/**
 * Sombra del sólido A sobre el sólido B.
 *
 * Devuelve los trozos de superficie de B en sombra (caras de la malla) y el
 * contorno de la región, para poder dibujarla como una sola figura.
 */
export function shadowOnSolid(
    meshA: SolidMesh,
    posA: Vector3,
    rotA: Vector3 | undefined,
    light: Light,
    meshB: SolidMesh,
    posB: Vector3,
    rotB: Vector3 | undefined
): { mesh: CastShadowMesh; area: number } | null {
    const worldB = meshB.vertices.map((v) => transformVertex(v, posB, rotB));

    const pieces: Vector3[][] = [];
    let area = 0;

    for (const face of meshB.faces) {
        const pts = face.map((i) => worldB[i]);
        if (pts.length < 3) continue;

        // Plano de la cara, con la normal hacia fuera
        const centroid = mul(
            pts.reduce((acc, p) => add(acc, p), { x: 0, y: 0, z: 0 }),
            1 / pts.length
        );
        let n = unit(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
        const solidCenter = mul(
            worldB.reduce((acc, p) => add(acc, p), { x: 0, y: 0, z: 0 }),
            1 / worldB.length
        );
        if (dot(n, sub(pts[0], solidCenter)) < 0) n = mul(n, -1);

        // ¿La cara mira a la luz?
        if (light.kind === 'point') {
            if (dot(n, sub(light.position, centroid)) <= 1e-9) continue;
        } else if (dot(n, light.direction) >= -1e-9) {
            continue;
        }

        const plane: PlaneRef = { normal: n, constant: -dot(n, pts[0]) };

        // Sombra de A sobre el plano de la cara
        const projected = projectMeshOnPlane(meshA, posA, rotA, light, plane);
        if (projected.length < 3) continue;

        const { u, v } = planeBasis(n);
        const origin = pts[0];
        const to2d = (p: Vector3) => ({ x: dot(sub(p, origin), u), y: dot(sub(p, origin), v) });
        const hull = convexHull2D(projected.map(to2d));
        if (hull.length < 3) continue;

        const clipped = clipConvex(hull, pts.map(to2d));
        if (clipped.length < 3) continue;

        const piece = clipped.map((q) => add(origin, add(mul(u, q.x), mul(v, q.y))));
        const a = polygonArea3D(piece);
        if (a < 1e-6) continue;
        pieces.push(piece);
        area += a;
    }

    if (pieces.length === 0) return null;

    // Vértices únicos (cuantizados) y contorno: aristas que salen una sola vez
    const vertices: Vector3[] = [];
    const index = new Map<string, number>();
    const key = (p: Vector3) => `${Math.round(p.x * 1e6)},${Math.round(p.y * 1e6)},${Math.round(p.z * 1e6)}`;
    const addVertex = (p: Vector3) => {
        const k = key(p);
        const found = index.get(k);
        if (found !== undefined) return found;
        vertices.push(p);
        index.set(k, vertices.length - 1);
        return vertices.length - 1;
    };

    const faces: number[][] = [];
    const edgeCount = new Map<string, { a: number; b: number; count: number }>();

    pieces.forEach((piece) => {
        const idx = piece.map(addVertex);
        faces.push(idx);
        for (let i = 0; i < idx.length; i++) {
            const a = idx[i];
            const b = idx[(i + 1) % idx.length];
            const k = a < b ? `${a}-${b}` : `${b}-${a}`;
            const found = edgeCount.get(k);
            if (found) found.count++;
            else edgeCount.set(k, { a, b, count: 1 });
        }
    });

    const outline: [number, number][] = [];
    edgeCount.forEach((e) => {
        if (e.count === 1) outline.push([e.a, e.b]);
    });

    return { mesh: { vertices, faces, outline }, area };
}
