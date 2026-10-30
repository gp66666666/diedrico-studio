import { describe, expect, it } from 'vitest';
import {
    buildSolidMesh,
    getFaceNormals,
    getProjectedEdges,
    rotateStorePoint,
    type Vec3,
} from '../solidGeometry';

/**
 * Visibilidad de aristas en diédrico.
 *
 * El criterio de `getProjectedEdges` (una arista es visible si alguna de sus
 * dos caras mira al observador) se comprueba aquí de forma independiente:
 * desde un punto de la arista se avanza hacia el observador y se mira si se
 * entra DENTRO del sólido. Si se entra, la arista está tapada.
 *
 * Esto es lo que fallaba en el alzado: el signo estaba invertido y se
 * dibujaban ocultas las aristas del vértice más cercano. En un cubo recto no
 * se notaba porque las caras de delante y de atrás se superponen; en un cubo
 * girado (apoyado en un plano oblicuo, por ejemplo) el diédrico salía mal.
 */

const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;

interface OcclusionCase {
    name: string;
    size: Vec3;
    rotation: Vec3;
    position: Vec3;
}

/** ¿Está `p` dentro del sólido (caras orientadas hacia fuera)? */
function insideSolid(p: Vec3, vertices: Vec3[], faces: { indices: number[]; normal: Vec3 }[]): boolean {
    const eps = 1e-6;
    return faces.every((face) => {
        const v0 = vertices[face.indices[0]];
        const signed = dot(face.normal, { x: p.x - v0.x, y: p.y - v0.y, z: p.z - v0.z });
        return signed <= eps;
    });
}

/** Oculta en alzado: al avanzar hacia el observador (+y) se entra en el sólido. */
function hiddenInAlzado(a: Vec3, b: Vec3, vertices: Vec3[], faces: { indices: number[]; normal: Vec3 }[], scale: number): boolean {
    const step = Math.max(scale, 1) * 1e-4;
    const samples = [0.3, 0.5, 0.7];
    return samples.every((t) => {
        const p = {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t + step,
            z: a.z + (b.z - a.z) * t,
        };
        return insideSolid(p, vertices, faces);
    });
}

/** Oculta en planta: al subir (+z) se entra en el sólido. */
function hiddenInPlanta(a: Vec3, b: Vec3, vertices: Vec3[], faces: { indices: number[]; normal: Vec3 }[], scale: number): boolean {
    const step = Math.max(scale, 1) * 1e-4;
    const samples = [0.3, 0.5, 0.7];
    return samples.every((t) => {
        const p = {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            z: a.z + (b.z - a.z) * t + step,
        };
        return insideSolid(p, vertices, faces);
    });
}

function check(c: OcclusionCase) {
    const mesh = buildSolidMesh('cube', c.size, undefined);
    const faces = getFaceNormals(mesh, c.rotation);
    const vertices = mesh.vertices.map((v) => {
        const r = rotateStorePoint(v, c.rotation);
        return { x: r.x + c.position.x, y: r.y + c.position.y, z: r.z + c.position.z };
    });
    const scale = Math.max(c.size.x, c.size.y, c.size.z);
    const edges = getProjectedEdges(mesh, c.rotation);

    const mismatches: string[] = [];
    edges.forEach((e) => {
        const a = {
            x: e.a.x + c.position.x,
            y: e.a.y + c.position.y,
            z: e.a.z + c.position.z,
        };
        const b = {
            x: e.b.x + c.position.x,
            y: e.b.y + c.position.y,
            z: e.b.z + c.position.z,
        };
        const expectedV = hiddenInAlzado(a, b, vertices, faces, scale);
        const expectedH = hiddenInPlanta(a, b, vertices, faces, scale);
        if (expectedV !== e.hiddenV || expectedH !== e.hiddenH) {
            mismatches.push(
                `(${a.x.toFixed(1)},${a.y.toFixed(1)},${a.z.toFixed(1)})→(${b.x.toFixed(1)},${b.y.toFixed(1)},${b.z.toFixed(1)}) ` +
                `alzado=${e.hiddenV ? 'oculta' : 'visible'} (debería ${expectedV ? 'oculta' : 'visible'}), ` +
                `planta=${e.hiddenH ? 'oculta' : 'visible'} (debería ${expectedH ? 'oculta' : 'visible'})`
            );
        }
    });
    return mismatches;
}

describe('visibilidad de aristas en diédrico', () => {
    it('cubo recto: la cara de delante se ve y la de detrás no', () => {
        const mismatches = check({
            name: 'recto',
            size: { x: 5, y: 5, z: 5 },
            rotation: { x: 0, y: 0, z: 0 },
            position: { x: 0, y: 5, z: 3.75 },
        });
        expect(mismatches).toEqual([]);
    });

    it('cubo girado en Z (vista en planta y alzado distintas)', () => {
        const mismatches = check({
            name: 'girado z',
            size: { x: 5, y: 5, z: 5 },
            rotation: { x: 0, y: 0, z: Math.PI / 6 },
            position: { x: 2, y: 6, z: 3.75 },
        });
        expect(mismatches).toEqual([]);
    });

    it('cubo inclinado como el del ejercicio (apoyado en plano oblicuo)', () => {
        const mismatches = check({
            name: 'inclinado',
            size: { x: 4.5, y: 5, z: 5 },
            rotation: {
                x: -0.691711431557394,
                y: 1.3111570631911889,
                z: -0.32650156498575456,
            },
            position: { x: 9.95, y: 8.150073997300266, z: 4.728834894884536 },
        });
        expect(mismatches).toEqual([]);
    });

    it('cubo girado en X y en Y', () => {
        const mismatches = check({
            name: 'girado x/y',
            size: { x: 5, y: 5, z: 5 },
            rotation: { x: Math.PI / 5, y: Math.PI / 7, z: 0 },
            position: { x: -3, y: 7, z: 6 },
        });
        expect(mismatches).toEqual([]);
    });

    it('el vértice oculto es el más lejano (menor alejamiento)', () => {
        // Cubo girado 45° en Z: el vértice de menor Y queda detrás.
        const mesh = buildSolidMesh('cube', { x: 5, y: 5, z: 5 });
        const rotation = { x: 0, y: 0, z: Math.PI / 4 };
        const edges = getProjectedEdges(mesh, rotation);
        const hiddenVertexEdges = edges.filter((e) => e.hiddenV);
        // Las aristas ocultas concurren en un único vértice: el de menor Y.
        const points = new Map<string, number>();
        hiddenVertexEdges.forEach((e) => {
            [e.a, e.b].forEach((p) => {
                const key = `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}`;
                points.set(key, (points.get(key) ?? 0) + 1);
            });
        });
        const hiddenVertex = [...points.entries()].find(([, n]) => n === 3)?.[0];
        expect(hiddenVertex).toBeDefined();
        const y = Number(hiddenVertex!.split(',')[1]);
        expect(y).toBeLessThan(0);
    });
});
