import { convexHull } from './convexHull';
import type { Vec3 } from './solidGeometry';

/**
 * Poliedro libre a partir de los puntos que escribe el alumno.
 *
 * Se calcula el casco convexo y se guarda en coordenadas LOCALES (centro del
 * cuerpo en el origen), igual que el resto de sólidos: así se puede mover,
 * girar, apoyar en el PH y usar en las herramientas sin casos especiales.
 *
 * Los puntos de dentro del cuerpo no forman cara y se descartan; se cuentan en
 * `dropped` para poder avisar (nada de ignorarlos en silencio).
 */
export interface FreePolyhedron {
    /** Centro del cuerpo (media de sus vértices), en coordenadas del store. */
    position: Vec3;
    /** Radio envolvente; el resto de sólidos también usan `size`. */
    size: Vec3;
    /** Vértices locales (centro en el origen). */
    vertices: Vec3[];
    faces: number[][];
    volume: number;
    /** Puntos distintos que han quedado fuera del casco (interiores). */
    dropped: number;
}

export function polyhedronFromPoints(points: Vec3[]): FreePolyhedron | null {
    // Puntos repetidos: cuentan una vez y no son «un punto que sobra».
    const unique: Vec3[] = [];
    const seen = new Set<string>();
    for (const p of points) {
        const key = `${Math.round(p.x * 1e6)},${Math.round(p.y * 1e6)},${Math.round(p.z * 1e6)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(p);
    }
    if (unique.length < 4) return null;

    const hull = convexHull(unique);
    if (!hull) return null;

    const remap = new Map<number, number>();
    hull.used.forEach((original, i) => remap.set(original, i));
    const faces = hull.faces.map((face) => face.map((index) => remap.get(index)!));
    const world = hull.used.map((index) => unique[index]);

    const centroid = world.reduce<Vec3>(
        (acc, v) => ({ x: acc.x + v.x / world.length, y: acc.y + v.y / world.length, z: acc.z + v.z / world.length }),
        { x: 0, y: 0, z: 0 }
    );
    const vertices = world.map((v) => ({ x: v.x - centroid.x, y: v.y - centroid.y, z: v.z - centroid.z }));

    const radius = Math.max(
        ...vertices.map((v) => Math.hypot(v.x, v.y, v.z)),
        0.01
    );

    return {
        position: centroid,
        size: { x: radius, y: radius, z: radius },
        vertices,
        faces,
        volume: hull.volume,
        dropped: unique.length - hull.used.length,
    };
}

/**
 * Número de aristas distintas de un cuerpo.
 *
 * Cada arista la comparten dos caras, así que se cuentan las parejas de
 * vértices sin repetir. Es el número que el alumno espera: un cubo tiene 12.
 */
export function countEdges(faces: number[][]): number {
    const edges = new Set<string>();
    for (const face of faces) {
        for (let i = 0; i < face.length; i++) {
            const a = face[i];
            const b = face[(i + 1) % face.length];
            edges.add(a < b ? `${a}-${b}` : `${b}-${a}`);
        }
    }
    return edges.size;
}
