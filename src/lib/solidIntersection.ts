/**
 * Intersección de dos sólidos convexos.
 *
 * Todos los sólidos de la app son convexos, así que A ∩ B es la parte de A que
 * queda dentro de cada uno de los planos de las caras de B. Se recorta A plano
 * a plano (Sutherland-Hodgman en 3D) y se tapa cada corte con su polígono.
 *
 * Cada cara resultante se etiqueta con el sólido del que procede: así se puede
 * extraer la LÍNEA DE INTERSECCIÓN (las aristas que separan una cara de A de
 * una cara de B), que es lo que se pide dibujar en la PAU.
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

export type FaceSource = 'a' | 'b';

export interface PolyMesh {
    vertices: Vector3[];
    faces: number[][];
    /** Sólido del que procede cada cara. */
    sources: FaceSource[];
}

const scaleOf = (vertices: Vector3[]) => {
    let m = 1;
    vertices.forEach((v) => {
        m = Math.max(m, Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
    });
    return m;
};

/** Malla del sólido en coordenadas del store. */
function worldMesh(mesh: SolidMesh, position: Vector3, rotation?: Vector3): Vector3[] {
    return mesh.vertices.map((v) => transformVertex(v, position, rotation));
}

const centroid = (vertices: Vector3[]): Vector3 => {
    const c = vertices.reduce(
        (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y, z: acc.z + v.z }),
        { x: 0, y: 0, z: 0 }
    );
    return { x: c.x / vertices.length, y: c.y / vertices.length, z: c.z / vertices.length };
};

/** Planos exteriores de una malla (normal unitaria hacia fuera). */
function outwardPlanes(vertices: Vector3[], faces: number[][]) {
    const center = centroid(vertices);
    return faces.map((face) => {
        const a = vertices[face[0]];
        const b = vertices[face[1]];
        const c = vertices[face[2]];
        let n = cross(sub(b, a), sub(c, a));
        const len = norm(n) || 1;
        n = { x: n.x / len, y: n.y / len, z: n.z / len };

        // La normal tiene que apuntar hacia fuera del sólido
        if (dot(n, sub(a, center)) < 0) n = { x: -n.x, y: -n.y, z: -n.z };

        return { n, d: -dot(n, a) };
    });
}

/**
 * Recorta una malla convexa por el semiplano n·p + d ≤ 0.
 *
 * Devuelve `null` si no queda nada. Las caras nuevas (la tapa del corte) se
 * etiquetan con `capSource`.
 */
export function clipPolyMesh(mesh: PolyMesh, n: Vector3, d: number, capSource: FaceSource): PolyMesh | null {
    const eps = EPS * scaleOf(mesh.vertices);
    const s = mesh.vertices.map((v) => dot(n, v) + d);

    // Todo dentro: no corta
    if (s.every((v) => v <= eps)) return mesh;
    // Todo fuera: se queda vacío
    if (s.every((v) => v >= -eps)) return null;

    const vertices = [...mesh.vertices];
    const keyOf = (p: Vector3) =>
        `${Math.round(p.x / eps)},${Math.round(p.y / eps)},${Math.round(p.z / eps)}`;

    const indexOf = new Map<string, number>();
    vertices.forEach((v, i) => indexOf.set(keyOf(v), i));

    const addPoint = (p: Vector3) => {
        const key = keyOf(p);
        const found = indexOf.get(key);
        if (found !== undefined) return found;
        vertices.push(p);
        indexOf.set(key, vertices.length - 1);
        return vertices.length - 1;
    };

    const faces: number[][] = [];
    const sources: FaceSource[] = [];
    const cutPoints: number[] = [];

    mesh.faces.forEach((face, fi) => {
        const out: number[] = [];

        for (let i = 0; i < face.length; i++) {
            const ia = face[i];
            const ib = face[(i + 1) % face.length];
            const da = s[ia];
            const db = s[ib];

            if (da <= eps) out.push(ia);

            // Cruce de la arista con el plano
            if ((da < -eps && db > eps) || (da > eps && db < -eps)) {
                const t = da / (da - db);
                const a = mesh.vertices[ia];
                const b = mesh.vertices[ib];
                const p = {
                    x: a.x + (b.x - a.x) * t,
                    y: a.y + (b.y - a.y) * t,
                    z: a.z + (b.z - a.z) * t,
                };
                const idx = addPoint(p);
                out.push(idx);
                cutPoints.push(idx);
            }
        }

        const clean = out.filter((v, i) => out.indexOf(v) === i);
        if (clean.length >= 3) {
            faces.push(clean);
            sources.push(mesh.sources[fi]);
        }
    });

    // Tapa del corte: se ordenan los puntos alrededor de su centro
    const uniqueCut = cutPoints.filter((v, i) => cutPoints.indexOf(v) === i);
    if (uniqueCut.length >= 3) {
        const pts = uniqueCut.map((i) => vertices[i]);
        const center = centroid(pts);

        const u = sub(pts[0], center);
        const uLen = norm(u) || 1;
        const U = { x: u.x / uLen, y: u.y / uLen, z: u.z / uLen };
        const V = cross(n, U);

        const ordered = [...uniqueCut].sort((p, q) => {
            const pv = sub(vertices[p], center);
            const qv = sub(vertices[q], center);
            return Math.atan2(dot(pv, V), dot(pv, U)) - Math.atan2(dot(qv, V), dot(qv, U));
        });

        faces.push(ordered);
        sources.push(capSource);
    }

    if (faces.length === 0) return null;
    return { vertices, faces, sources };
}

export interface SolidIntersection {
    vertices: Vector3[];
    faces: number[][];
    sources: FaceSource[];
    /** Aristas de la línea de intersección (pares de índices). */
    seam: [number, number][];
    volume: number;
}

/**
 * Intersección de dos sólidos convexos en coordenadas del store.
 * Devuelve `null` si no se tocan.
 */
export function intersectSolids(
    meshA: SolidMesh,
    positionA: Vector3,
    rotationA: Vector3 | undefined,
    meshB: SolidMesh,
    positionB: Vector3,
    rotationB: Vector3 | undefined
): SolidIntersection | null {
    const verticesA = worldMesh(meshA, positionA, rotationA);
    const verticesB = worldMesh(meshB, positionB, rotationB);
    const planesB = outwardPlanes(verticesB, meshB.faces);

    let poly: PolyMesh = {
        vertices: verticesA,
        faces: meshA.faces,
        sources: meshA.faces.map(() => 'a' as FaceSource),
    };

    const eps = EPS * Math.max(scaleOf(verticesA), scaleOf(verticesB));

    for (const { n, d } of planesB) {
        const side = poly.vertices.map((v) => dot(n, v) + d);
        // Si ningún vértice queda fuera, el plano no recorta
        if (side.every((v) => v <= eps)) continue;
        if (side.every((v) => v >= -eps)) return null;

        const clipped = clipPolyMesh(poly, n, d, 'b');
        if (!clipped) return null;
        poly = clipped;
    }

    if (poly.faces.length < 4) return null;

    // Orientar las caras hacia fuera (la divergencia y el 3D lo necesitan)
    const usedIdx = new Set<number>();
    poly.faces.forEach((f) => f.forEach((i) => usedIdx.add(i)));
    const bodyCenter = centroid([...usedIdx].map((i) => poly.vertices[i]));

    const oriented = poly.faces.map((face) => {
        let nx = 0;
        let ny = 0;
        let nz = 0;
        for (let i = 0; i < face.length; i++) {
            const a = poly.vertices[face[i]];
            const b = poly.vertices[face[(i + 1) % face.length]];
            nx += (a.y - b.y) * (a.z + b.z);
            ny += (a.z - b.z) * (a.x + b.x);
            nz += (a.x - b.x) * (a.y + b.y);
        }
        const c = centroid(face.map((i) => poly.vertices[i]));
        const outward = nx * (c.x - bodyCenter.x) + ny * (c.y - bodyCenter.y) + nz * (c.z - bodyCenter.z);
        return outward < 0 ? [...face].reverse() : face;
    });
    poly = { ...poly, faces: oriented };

    // Aristas compartidas por una cara de A y una de B: línea de intersección
    const edgeMap = new Map<string, { ia: number; ib: number; sources: Set<FaceSource> }>();
    poly.faces.forEach((face, fi) => {
        for (let i = 0; i < face.length; i++) {
            const ia = face[i];
            const ib = face[(i + 1) % face.length];
            const key = ia < ib ? `${ia}-${ib}` : `${ib}-${ia}`;
            const entry = edgeMap.get(key) ?? { ia: Math.min(ia, ib), ib: Math.max(ia, ib), sources: new Set<FaceSource>() };
            entry.sources.add(poly.sources[fi]);
            edgeMap.set(key, entry);
        }
    });

    const seam: [number, number][] = [];
    edgeMap.forEach((e) => {
        if (e.sources.has('a') && e.sources.has('b')) seam.push([e.ia, e.ib]);
    });

    // Volumen por el teorema de la divergencia
    let volume = 0;
    poly.faces.forEach((face) => {
        const a = poly.vertices[face[0]];
        for (let i = 1; i < face.length - 1; i++) {
            const b = poly.vertices[face[i]];
            const c = poly.vertices[face[i + 1]];
            volume += dot(a, cross(b, c)) / 6;
        }
    });

    return {
        vertices: poly.vertices,
        faces: poly.faces,
        sources: poly.sources,
        seam,
        volume: Math.abs(volume),
    };
}
