import { describe, expect, it } from 'vitest';
import {
    lowestLocalZ,
    restingCenterZ,
    restingCenterY,
    restOnHorizontalPlane,
    restOnVerticalPlane,
} from '../solidPlacement';
import { buildSolidMesh, transformVertex } from '../solidGeometry';

const size = { x: 4, y: 8, z: 4 };

describe('apoyar un sólido en el plano horizontal', () => {
    it('el cubo de tamaño x apoya a media arista (lado = 1,5·x)', () => {
        // Lado = 1,5 · 4 = 6 → el centro queda a 3
        expect(restingCenterZ('cube', { x: 4, y: 4, z: 4 })).toBeCloseTo(3, 10);
    });

    it('pirámide, prisma, cono y cilindro apoyan a media altura', () => {
        for (const subtype of ['pyramid', 'prism', 'cone', 'cylinder'] as const) {
            expect(restingCenterZ(subtype, size)).toBeCloseTo(4, 10);
        }
    });

    it('la esfera y el octaedro apoyan a radio', () => {
        expect(restingCenterZ('sphere', { x: 5, y: 5, z: 5 })).toBeCloseTo(5, 10);
        expect(restingCenterZ('octahedron', { x: 5, y: 5, z: 5 })).toBeCloseTo(5, 10);
    });

    it('un cubo girado 45° en X apoya sobre una arista (media diagonal)', () => {
        const rotation = { x: Math.PI / 4, y: 0, z: 0 };
        const half = (4 * 1.5) / 2;
        expect(restingCenterZ('cube', { x: 4, y: 4, z: 4 }, rotation)).toBeCloseTo(
            half * Math.SQRT2,
            10
        );
    });

    it('tras apoyarlo, ningún vértice queda por debajo de z = 0', () => {
        const rotations = [
            undefined,
            { x: Math.PI / 4, y: 0, z: 0 },
            { x: 0.3, y: 1.1, z: -0.7 },
        ];
        for (const subtype of ['cube', 'tetrahedron', 'octahedron', 'pyramid', 'cone', 'cylinder', 'sphere'] as const) {
            for (const rotation of rotations) {
                const position = restOnHorizontalPlane(subtype, size, rotation, { x: 2, y: -3, z: 99 });
                const mesh = buildSolidMesh(subtype, size);
                const minZ = Math.min(
                    ...mesh.vertices.map((v) => transformVertex(v, position, rotation).z)
                );
                expect(minZ).toBeGreaterThan(-1e-9);
                expect(minZ).toBeLessThan(1e-9);
            }
        }
    });

    it('no toca la lateralidad ni el alejamiento', () => {
        const position = restOnHorizontalPlane('cube', size, undefined, { x: 7, y: 2, z: 40 });
        expect(position.x).toBe(7);
        expect(position.y).toBe(2);
    });

    it('lowestLocalZ devuelve la mitad negativa de la altura', () => {
        expect(lowestLocalZ('cylinder', size)).toBeCloseTo(-4, 10);
    });
});

describe('apoyar un sólido en el plano vertical', () => {
    it('el cubo de tamaño x toca el PV a media arista', () => {
        expect(restOnVerticalPlane('cube', { x: 4, y: 4, z: 4 }, undefined, { x: 1, y: 9, z: 2 }).y).toBeCloseTo(3, 10);
    });

    it('cilindro y esfera tocan el PV a radio', () => {
        expect(restingCenterY('cylinder', { x: 3, y: 8, z: 3 })).toBeCloseTo(3, 10);
        expect(restingCenterY('sphere', { x: 4, y: 4, z: 4 })).toBeCloseTo(4, 10);
    });

    it('un cubo girado 45° en Z toca con una arista (media diagonal)', () => {
        const rotation = { x: 0, y: 0, z: Math.PI / 4 };
        expect(restingCenterY('cube', { x: 4, y: 4, z: 4 }, rotation)).toBeCloseTo(3 * Math.SQRT2, 10);
    });

    it('la pirámide toca con un vértice de la base, no con una cara', () => {
        expect(restingCenterY('pyramid', { x: 4, y: 8, z: 4 })).toBeCloseTo(4, 10);
    });

    it('ningún vértice queda por detrás del PV (y >= 0)', () => {
        const rotations = [undefined, { x: Math.PI / 4, y: 0, z: 0 }, { x: 0.3, y: 1.1, z: -0.7 }];
        for (const subtype of ['cube', 'tetrahedron', 'octahedron', 'pyramid', 'cone', 'cylinder', 'sphere'] as const) {
            for (const rotation of rotations) {
                const position = restOnVerticalPlane(subtype, { x: 4, y: 8, z: 4 }, rotation, { x: 5, y: 99, z: 1 });
                const mesh = buildSolidMesh(subtype, { x: 4, y: 8, z: 4 });
                const minY = Math.min(...mesh.vertices.map((v) => transformVertex(v, position, rotation).y));
                expect(minY).toBeGreaterThan(-1e-9);
                expect(minY).toBeLessThan(1e-9);
            }
        }
    });

    it('no toca la cota', () => {
        expect(restOnVerticalPlane('cube', { x: 4, y: 4, z: 4 }, undefined, { x: 1, y: 9, z: 7 }).z).toBe(7);
    });
});
