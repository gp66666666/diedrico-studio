/**
 * Desarrollo genérico de un poliedro convexo.
 *
 * Se despliega la malla cara a cara: se coloca una cara en el plano y cada
 * vecina se abate alrededor de la arista común, al otro lado. Como cada cara
 * es rígida, el trozo del plano es su verdadera magnitud.
 *
 * Sirve para octaedro, dodecaedro e icosaedro (los que no tienen una red
 * analítica cerrada).
 */

import { buildSolidMesh, type SolidMesh } from './solidGeometry';
import { convexHull2D } from './shadows';
import type { Vector3 } from '../types';
import type { DevPiece, Development } from './development';

const sub = (a: Vector3, b: Vector3): Vector3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
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

const centroid3 = (points: Vector3[]): Vector3 => {
    const c = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }), { x: 0, y: 0, z: 0 });
    return { x: c.x / points.length, y: c.y / points.length, z: c.z / points.length };
};

function faceNormal(points: Vector3[]): Vector3 {
    // Newell: vale para polígonos de cualquier número de lados
    let nx = 0;
    let ny = 0;
    let nz = 0;
    for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        nx += (a.y - b.y) * (a.z + b.z);
        ny += (a.z - b.z) * (a.x + b.x);
        nz += (a.x - b.x) * (a.y + b.y);
    }
    return unit({ x: nx, y: ny, z: nz });
}

interface Placed {
    face: number;
    /** Coordenadas 2D de cada vértice de la cara. */
    coords: { x: number; y: number }[];
}

/** Área de un polígono 2D. */
const area2D = (pts: { x: number; y: number }[]) => {
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        s += a.x * b.y - b.x * a.y;
    }
    return Math.abs(s) / 2;
};

/** Separación de ejes: ¿se solapan dos polígonos convexos con área > 0? */
function overlaps(a: { x: number; y: number }[], b: { x: number; y: number }[]) {
    const axes: { x: number; y: number }[] = [];
    [a, b].forEach((poly) => {
        for (let i = 0; i < poly.length; i++) {
            const p = poly[i];
            const q = poly[(i + 1) % poly.length];
            const edge = { x: q.x - p.x, y: q.y - p.y };
            const len = Math.hypot(edge.x, edge.y) || 1;
            axes.push({ x: -edge.y / len, y: edge.x / len });
        }
    });

    for (const ax of axes) {
        const proj = (poly: { x: number; y: number }[]) => {
            const vals = poly.map((p) => p.x * ax.x + p.y * ax.y);
            return [Math.min(...vals), Math.max(...vals)];
        };
        const [a0, a1] = proj(a);
        const [b0, b1] = proj(b);
        const overlap = Math.min(a1, b1) - Math.max(a0, b0);
        if (overlap < 1e-6) return false;
    }
    return true;
}

/**
 * Despliega un poliedro completo. Devuelve `null` si no encuentra una red sin
 * solapes.
 */
export function unfoldPolyhedron(subtype: string, size: { x: number; y: number; z: number }): Development | null {
    const mesh: SolidMesh = buildSolidMesh(subtype, size);
    const vertices = mesh.vertices;
    const faces = mesh.faces;

    // Aristas compartidas entre caras
    const edges = new Map<string, number[]>();
    faces.forEach((face, fi) => {
        for (let i = 0; i < face.length; i++) {
            const a = face[i];
            const b = face[(i + 1) % face.length];
            const key = a < b ? `${a}-${b}` : `${b}-${a}`;
            const list = edges.get(key) ?? [];
            list.push(fi);
            edges.set(key, list);
        }
    });

    const neighbors = (fi: number) => {
        const out: { face: number; a: number; b: number }[] = [];
        const face = faces[fi];
        for (let i = 0; i < face.length; i++) {
            const a = face[i];
            const b = face[(i + 1) % face.length];
            const key = a < b ? `${a}-${b}` : `${b}-${a}`;
            const list = edges.get(key) ?? [];
            const other = list.find((f) => f !== fi);
            if (other !== undefined) out.push({ face: other, a, b });
        }
        return out;
    };

    const facePoints = (fi: number) => faces[fi].map((i) => vertices[i]);

    // Intenta cada cara como raíz hasta dar con una red sin solapes
    for (let root = 0; root < faces.length; root++) {
        const placed: Placed[] = [];
        const placedFaces = new Set<number>();
        const queue: number[] = [root];

        // Cara raíz: su propio plano
        const rootPts = facePoints(root);
        const nRoot = faceNormal(rootPts);
        const X = unit(sub(rootPts[1], rootPts[0]));
        const Y = unit(cross(nRoot, X));
        placed.push({
            face: root,
            coords: rootPts.map((p) => ({ x: dot(sub(p, rootPts[0]), X), y: dot(sub(p, rootPts[0]), Y) })),
        });
        placedFaces.add(root);

        let ok = true;
        while (queue.length > 0 && ok) {
            const current = queue.shift()!;
            const currentPlaced = placed.find((p) => p.face === current)!;

            for (const nb of neighbors(current)) {
                if (placedFaces.has(nb.face)) continue;

                const pts = facePoints(nb.face);
                const nNb = faceNormal(pts);

                // Marco local de la cara vecina con origen en la arista (a, b).
                // El eje Y se orienta hacia dentro de la cara (no nos fiamos del
                // sentido de las caras de la malla).
                const pa = vertices[nb.a];
                const pb = vertices[nb.b];
                const ex = unit(sub(pb, pa));
                let ey = unit(cross(nNb, ex));
                const cNb = centroid3(pts);
                if (dot(sub(cNb, pa), ey) < 0) ey = { x: -ey.x, y: -ey.y, z: -ey.z };

                const local = pts.map((p) => {
                    const d = sub(p, pa);
                    return { x: dot(d, ex), y: dot(d, ey) };
                });


                // Colocar en el plano sobre la arista ya dibujada
                const ia = faces[nb.face].indexOf(nb.a);
                const ib = faces[nb.face].indexOf(nb.b);
                // Posiciones ya dibujadas de la arista (en la cara actual)
                const A2 = currentPlaced.coords[faces[current].indexOf(nb.a)];
                const B2 = currentPlaced.coords[faces[current].indexOf(nb.b)];

                const vx = unit({ x: B2.x - A2.x, y: B2.y - A2.y, z: 0 });
                const vy = { x: -vx.y, y: vx.x, z: 0 }; // giro de 90°

                // La cara vecina se abate al otro lado de la arista: miramos de
                // qué lado está ya dibujada la cara actual (en 2D) y ponemos la
                // nueva en el contrario.
                const cCur2 = currentPlaced.coords.reduce(
                    (acc, p) => ({ x: acc.x + p.x / currentPlaced.coords.length, y: acc.y + p.y / currentPlaced.coords.length }),
                    { x: 0, y: 0 }
                );
                const side = (cCur2.x - A2.x) * vy.x + (cCur2.y - A2.y) * vy.y;
                const sign = side > 0 ? -1 : 1;

                const coords = local.map((p) => ({
                    x: A2.x + p.x * vx.x + sign * p.y * vy.x,
                    y: A2.y + p.x * vx.y + sign * p.y * vy.y,
                }));

                // Comprobación: los vértices de la arista deben coincidir
                const dA = Math.hypot(coords[ia].x - A2.x, coords[ia].y - A2.y);
                const dB = Math.hypot(coords[ib].x - B2.x, coords[ib].y - B2.y);
                if (dA > 1e-6 || dB > 1e-6) {
                    ok = false;
                    break;
                }

                placed.push({ face: nb.face, coords });
                placedFaces.add(nb.face);
                queue.push(nb.face);
            }
        }

        if (!ok || placedFaces.size !== faces.length) continue;

        // Sin solapes
        let clash = false;
        for (let i = 0; i < placed.length && !clash; i++) {
            for (let j = i + 1; j < placed.length; j++) {
                if (overlaps(placed[i].coords, placed[j].coords)) {
                    clash = true;
                    break;
                }
            }
        }
        if (clash) continue;

        // Centrar la red
        const all = placed.flatMap((p) => p.coords);
        const hull = convexHull2D(all);
        const cx = (Math.min(...hull.map((p) => p.x)) + Math.max(...hull.map((p) => p.x))) / 2;
        const cy = (Math.min(...hull.map((p) => p.y)) + Math.max(...hull.map((p) => p.y))) / 2;

        const pieces: DevPiece[] = placed.map((p) => ({
            kind: 'lateral',
            points: p.coords.map((q) => ({ x: q.x - cx, y: q.y - cy })),
        }));

        const area = pieces.reduce((acc, p) => acc + area2D(p.points), 0);

        return {
            pieces,
            area,
            notes: [
                `${pieces.length} caras desplegadas`,
                'red sin solapes, cada cara en verdadera magnitud',
            ],
        };
    }

    return null;
}
