import type { Vec3 } from './solidGeometry';

/**
 * Casco convexo de un conjunto de puntos.
 *
 * Sirve para crear poliedros libres: el alumno da los vértices y las caras y
 * las aristas salen solas. Pedir «las aristas» sería pedir lo mismo dos veces
 * (una arista es la unión de dos vértices ya dados) y con más oportunidades de
 * equivocarse.
 *
 * Es un método directo (probar los planos de cada terna y quedarse con los que
 * dejan todos los puntos a un lado). Para 4–30 puntos va sobrado y no hay que
 * arrastrar una librería de geometría al bundle.
 */

export interface ConvexHull {
    /** Caras como índices del array original, ordenadas y con normal hacia fuera. */
    faces: number[][];
    /** Volumen del cuerpo (unidades cúbicas). */
    volume: number;
    /** Índices de los puntos que acaban siendo vértice (los de dentro no). */
    used: number[];
}

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: Vec3, b: Vec3): Vec3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});
const norm = (a: Vec3): number => Math.sqrt(dot(a, a));
const unit = (a: Vec3): Vec3 => {
    const n = norm(a) || 1;
    return { x: a.x / n, y: a.y / n, z: a.z / n };
};

/** Normal del polígono (Newell): sirve aunque la cara no sea un triángulo. */
function polygonNormal(points: Vec3[], loop: number[]): Vec3 {
    let nx = 0;
    let ny = 0;
    let nz = 0;
    for (let i = 0; i < loop.length; i++) {
        const a = points[loop[i]];
        const b = points[loop[(i + 1) % loop.length]];
        nx += (a.y - b.y) * (a.z + b.z);
        ny += (a.z - b.z) * (a.x + b.x);
        nz += (a.x - b.x) * (a.y + b.y);
    }
    return { x: nx, y: ny, z: nz };
}

/**
 * Devuelve `null` si los puntos no forman un cuerpo con volumen (menos de 4,
 * todos coplanarios, todos alineados…).
 */
export function convexHull(points: Vec3[]): ConvexHull | null {
    if (points.length < 4) return null;

    let maxCoord = 1;
    for (const p of points) {
        maxCoord = Math.max(maxCoord, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
    }
    const eps = 1e-6 * maxCoord;

    // Puntos repetidos: se quedan una sola vez (con su índice original).
    const unique: number[] = [];
    const seenPoint = new Set<string>();
    points.forEach((p, i) => {
        const key = `${Math.round(p.x / eps)},${Math.round(p.y / eps)},${Math.round(p.z / eps)}`;
        if (seenPoint.has(key)) return;
        seenPoint.add(key);
        unique.push(i);
    });
    if (unique.length < 4) return null;

    const faces: number[][] = [];
    const seenFace = new Set<string>();
    const used = new Set<number>();

    for (let i = 0; i < unique.length; i++) {
        for (let j = i + 1; j < unique.length; j++) {
            for (let k = j + 1; k < unique.length; k++) {
                const a = points[unique[i]];
                const b = points[unique[j]];
                const c = points[unique[k]];
                const raw = cross(sub(b, a), sub(c, a));
                if (norm(raw) < eps) continue; // los tres puntos están alineados

                const normal = unit(raw);
                const d = dot(normal, a);

                let above = 0;
                let below = 0;
                const coplanar: number[] = [];
                unique.forEach((index, u) => {
                    const t = dot(normal, points[index]) - d;
                    if (t > eps) above++;
                    else if (t < -eps) below++;
                    else coplanar.push(u);
                });

                if (above > 0 && below > 0) continue; // el plano atraviesa el cuerpo
                if (coplanar.length < 3) continue;

                const key = [...coplanar].sort((x, y) => x - y).join(',');
                if (seenFace.has(key)) continue;
                seenFace.add(key);

                // Orden alrededor del centro de la cara.
                const loop = [...coplanar].sort((x, y) => x - y);
                const center = loop.reduce<Vec3>(
                    (acc, u) => ({
                        x: acc.x + points[unique[u]].x,
                        y: acc.y + points[unique[u]].y,
                        z: acc.z + points[unique[u]].z,
                    }),
                    { x: 0, y: 0, z: 0 }
                );
                center.x /= loop.length;
                center.y /= loop.length;
                center.z /= loop.length;

                const first = unit(sub(points[unique[loop[0]]], center));
                const second = cross(normal, first);
                const ordered = loop
                    .map((u) => ({
                        u,
                        angle: Math.atan2(
                            dot(sub(points[unique[u]], center), second),
                            dot(sub(points[unique[u]], center), first)
                        ),
                    }))
                    .sort((p, q) => p.angle - q.angle)
                    .map((p) => p.u);

                // La normal tiene que salir del cuerpo: si apunta hacia dentro
                // (el resto de puntos están del lado positivo), se da la vuelta.
                const outward = above > 0 ? -1 : 1;
                const loopPoints = ordered.map((u) => points[unique[u]]);
                const winding = polygonNormal(loopPoints, loopPoints.map((_, idx) => idx));
                if (dot(winding, normal) * outward < 0) ordered.reverse();

                ordered.forEach((u) => used.add(unique[u]));
                faces.push(ordered.map((u) => unique[u]));
            }
        }
    }

    if (faces.length < 4) return null;

    // Volumen: suma de tetraedros desde el origen, con las caras ya orientadas.
    let volume = 0;
    for (const face of faces) {
        const p0 = points[face[0]];
        for (let i = 1; i < face.length - 1; i++) {
            volume += dot(p0, cross(points[face[i]], points[face[i + 1]])) / 6;
        }
    }
    volume = Math.abs(volume);
    if (volume < 1e-9 * maxCoord ** 3) return null;

    return { faces, volume, used: [...used].sort((a, b) => a - b) };
}
