import { describe, expect, it } from 'vitest';
import { unfoldPolyhedron } from '../unfold';
import { buildSolidMesh } from '../solidGeometry';
import type { Vector3 } from '../../types';

const area2D = (pts: { x: number; y: number }[]) => {
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        s += a.x * b.y - b.x * a.y;
    }
    return Math.abs(s) / 2;
};

const surfaceArea = (subtype: string, size: { x: number; y: number; z: number }) => {
    const mesh = buildSolidMesh(subtype, size);
    let total = 0;
    for (const face of mesh.faces) {
        const pts = face.map((i) => mesh.vertices[i]);
        // Newell
        let n: Vector3 = { x: 0, y: 0, z: 0 };
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i];
            const b = pts[(i + 1) % pts.length];
            n = {
                x: n.x + (a.y - b.y) * (a.z + b.z),
                y: n.y + (a.z - b.z) * (a.x + b.x),
                z: n.z + (a.x - b.x) * (a.y + b.y),
            };
        }
        total += Math.hypot(n.x, n.y, n.z) / 2;
    }
    return total;
};

const size = { x: 2, y: 4, z: 2 };

describe.each([
    ['octahedron', 8],
    ['dodecahedron', 12],
    ['icosahedron', 20],
])('desarrollo del %s', (subtype, faceCount) => {
    const dev = unfoldPolyhedron(subtype, size);

    it('sale una red con todas las caras', () => {
        expect(dev).not.toBeNull();
        expect(dev!.pieces).toHaveLength(faceCount);
    });

    it('el área de la red es la superficie del sólido', () => {
        const expected = surfaceArea(subtype, size);
        expect(dev!.area).toBeCloseTo(expected, 6);
        const sum = dev!.pieces.reduce((acc, p) => acc + area2D(p.points), 0);
        expect(sum).toBeCloseTo(expected, 6);
    });

    it('las caras no se solapan y son del tamaño correcto', () => {
        const polys = dev!.pieces.map((p) => p.points);
        const centro = (pts: { x: number; y: number }[]) => ({
            x: pts.reduce((a, p) => a + p.x, 0) / pts.length,
            y: pts.reduce((a, p) => a + p.y, 0) / pts.length,
        });
        // Cada cara tiene el área de una cara del sólido
        const perFace = surfaceArea(subtype, size) / faceCount;
        polys.forEach((p) => expect(area2D(p)).toBeCloseTo(perFace, 6));

        // Distancias entre centros: no puede haber dos caras iguales encima
        const centers = polys.map(centro);
        for (let i = 0; i < centers.length; i++) {
            for (let j = i + 1; j < centers.length; j++) {
                const d = Math.hypot(centers[i].x - centers[j].x, centers[i].y - centers[j].y);
                expect(d).toBeGreaterThan(1e-6);
            }
        }
    });
});
