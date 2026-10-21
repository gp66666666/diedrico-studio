import { describe, expect, it } from 'vitest';
import { shadowOfSolid, shadowOfPoint, clipToQuarter, polygonArea3D, directionLight, type Light } from '../shadows';
import { buildSolidMesh } from '../solidGeometry';
import type { Vector3 } from '../../types';

const cube = buildSolidMesh('cube', { x: 2, y: 2, z: 2 }); // lado 3

describe('sombras', () => {
    it('luz paralela vertical: la sombra es la planta del cubo', () => {
        // Cubo apoyado en el suelo: centro a z = 1.5
        const s = shadowOfSolid(cube, { x: 0, y: 0, z: 1.5 }, undefined, directionLight({ x: 0, y: 0, z: -1 }), 'h')!;
        expect(s).not.toBeNull();
        expect(polygonArea3D(s)).toBeCloseTo(9, 6);
        s.forEach((p) => expect(p.z).toBeCloseTo(0, 9));
    });

    it('luz paralela a 45°: cada vértice cae donde toca', () => {
        const light: Light = { kind: 'direction', direction: { x: Math.SQRT1_2, y: 0, z: -Math.SQRT1_2 } };
        const s = shadowOfSolid(cube, { x: 0, y: 0, z: 1.5 }, undefined, light, 'h')!;
        // El vértice superior (1.5, y, 3) cae en x = 1.5 + 3 = 4.5
        const maxX = Math.max(...s.map((p) => p.x));
        expect(maxX).toBeCloseTo(4.5, 6);
        const minX = Math.min(...s.map((p) => p.x));
        expect(minX).toBeCloseTo(-1.5, 6);
    });

    it('foco propio encima del cubo: la sombra se agranda a 6×6', () => {
        const s = shadowOfSolid(cube, { x: 0, y: 0, z: 1.5 }, undefined, { kind: 'point', position: { x: 0, y: 0, z: 6 } }, 'h')!;
        expect(polygonArea3D(s)).toBeCloseTo(36, 6);
    });

    it('sombra sobre el plano vertical con luz frontal', () => {
        const s = shadowOfSolid(cube, { x: 0, y: 1.5, z: 3 }, undefined, { kind: 'point', position: { x: 0, y: 6, z: 3 } }, 'v')!;
        expect(s).not.toBeNull();
        s.forEach((p) => expect(p.y).toBeCloseTo(0, 9));
    });

    it('punto: la sombra de un punto es un punto', () => {
        const s = shadowOfPoint({ x: 2, y: 1, z: 4 }, { kind: 'point', position: { x: 0, y: 0, z: 8 } }, 'h')!;
        // t = -8/(4-8) = 2 → (4, 2, 0)
        expect(s.x).toBeCloseTo(4, 6);
        expect(s.y).toBeCloseTo(2, 6);
        expect(s.z).toBeCloseTo(0, 6);
    });

    it('sin sombra si la luz está por debajo del sólido', () => {
        expect(
            shadowOfSolid(cube, { x: 0, y: 0, z: 1.5 }, undefined, { kind: 'point', position: { x: 0, y: 0, z: -5 } }, 'h')
        ).toBeNull();
    });

    it('recorte: la parte de sombra detrás del plano vertical se elimina', () => {
        const poly: Vector3[] = [
            { x: 0, y: 2, z: 0 },
            { x: 2, y: 2, z: 0 },
            { x: 2, y: -1, z: 0 },
            { x: 0, y: -1, z: 0 },
        ];
        const clipped = clipToQuarter(poly, 'h');
        expect(clipped.every((p) => p.y >= -1e-9)).toBe(true);
        expect(polygonArea3D(clipped)).toBeCloseTo(4, 6); // 2 de ancho × 2 de fondo
    });
});
