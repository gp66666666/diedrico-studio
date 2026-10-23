import { describe, it, expect } from 'vitest';
import { convexHull } from '../convexHull';
import type { Vec3 } from '../solidGeometry';

const P = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

describe('convexHull', () => {
    it('tetraedro irregular: 4 caras y volumen exacto', () => {
        // V = |det| / 6 = (4 · 6 · 3) / 6 = 12
        const hull = convexHull([P(0, 0, 0), P(4, 0, 0), P(0, 6, 0), P(0, 0, 3)]);
        expect(hull).not.toBeNull();
        if (!hull) return;
        expect(hull.faces).toHaveLength(4);
        hull.faces.forEach((f) => expect(f).toHaveLength(3));
        expect(hull.volume).toBeCloseTo(12, 9);
        expect(hull.used).toEqual([0, 1, 2, 3]);
    });

    it('cubo: 6 caras de 4 vértices y volumen a³', () => {
        const pts: Vec3[] = [];
        for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) pts.push(P(x, y, z));
        const hull = convexHull(pts);
        expect(hull).not.toBeNull();
        if (!hull) return;
        expect(hull.faces).toHaveLength(6);
        hull.faces.forEach((f) => expect(f).toHaveLength(4));
        expect(hull.volume).toBeCloseTo(8, 9);
    });

    it('prisma recto de base irregular: volumen = área · altura', () => {
        // Base (0,0),(4,0),(5,3),(1,3) → área 12 (Gauss); altura 5 → 60
        const base = [[0, 0], [4, 0], [5, 3], [1, 3]];
        const pts: Vec3[] = [];
        for (const z of [0, 5]) for (const [x, y] of base) pts.push(P(x, y, z));
        const hull = convexHull(pts);
        expect(hull).not.toBeNull();
        if (!hull) return;
        expect(hull.faces).toHaveLength(6);
        expect(hull.volume).toBeCloseTo(60, 9);
    });

    it('un punto de dentro no es vértice y no cambia el volumen', () => {
        const pts = [
            P(0, 0, 0), P(4, 0, 0), P(0, 6, 0), P(0, 0, 3),
            P(0.2, 0.2, 0.2),
        ];
        const hull = convexHull(pts);
        expect(hull).not.toBeNull();
        if (!hull) return;
        expect(hull.used).toEqual([0, 1, 2, 3]);
        expect(hull.volume).toBeCloseTo(12, 9);
    });

    it('puntos repetidos cuentan una vez', () => {
        const hull = convexHull([
            P(0, 0, 0), P(4, 0, 0), P(0, 6, 0), P(0, 0, 3),
            P(4, 0, 0),
        ]);
        expect(hull).not.toBeNull();
        if (!hull) return;
        expect(hull.faces).toHaveLength(4);
        expect(hull.volume).toBeCloseTo(12, 9);
    });

    it('las caras miran hacia fuera', () => {
        const hull = convexHull([
            P(0, 0, 0), P(4, 0, 0), P(0, 6, 0), P(0, 0, 3), P(2, 3, 1),
        ]);
        expect(hull).not.toBeNull();
        if (!hull) return;
        const pts = [P(0, 0, 0), P(4, 0, 0), P(0, 6, 0), P(0, 0, 3), P(2, 3, 1)];
        const center = { x: 4 / 5, y: 6 / 5, z: 3 / 5 };
        for (const face of hull.faces) {
            const a = pts[face[0]];
            const b = pts[face[1]];
            const c = pts[face[2]];
            const n = {
                x: (b.y - a.y) * (c.z - a.z) - (b.z - a.z) * (c.y - a.y),
                y: (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z),
                z: (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x),
            };
            const faceCenter = face.reduce(
                (acc, i) => ({ x: acc.x + pts[i].x / face.length, y: acc.y + pts[i].y / face.length, z: acc.z + pts[i].z / face.length }),
                { x: 0, y: 0, z: 0 }
            );
            const outward =
                n.x * (faceCenter.x - center.x) + n.y * (faceCenter.y - center.y) + n.z * (faceCenter.z - center.z);
            expect(outward).toBeGreaterThan(0);
        }
    });

    it('rechaza lo que no tiene volumen', () => {
        expect(convexHull([P(0, 0, 0), P(1, 0, 0), P(0, 1, 0)])).toBeNull();
        expect(convexHull([P(0, 0, 0), P(1, 0, 0), P(2, 0, 0), P(3, 0, 0)])).toBeNull(); // alineados
        expect(convexHull([P(0, 0, 0), P(1, 0, 0), P(0, 1, 0), P(1, 1, 0)])).toBeNull(); // coplanarios
    });
});
