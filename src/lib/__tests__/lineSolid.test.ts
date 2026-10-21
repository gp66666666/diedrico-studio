import { describe, expect, it } from 'vitest';
import { intersectLineSolid } from '../lineSolid';
import { buildSolidMesh } from '../solidGeometry';
import type { Vector3 } from '../../types';

const zero: Vector3 = { x: 0, y: 0, z: 0 };
const cube = buildSolidMesh('cube', { x: 2, y: 2, z: 2 }); // lado 3

describe('intersección recta-sólido', () => {
    it('recta que atraviesa el cubo por su centro', () => {
        const r = intersectLineSolid(cube, zero, undefined, { point: { x: -5, y: 0, z: 0 }, direction: { x: 1, y: 0, z: 0 } })!;
        expect(r).not.toBeNull();
        expect(r.entry!.x).toBeCloseTo(-1.5, 6);
        expect(r.exit!.x).toBeCloseTo(1.5, 6);
        expect(r.entry!.y).toBeCloseTo(0, 6);
    });

    it('segmento que acaba dentro: solo hay entrada', () => {
        const r = intersectLineSolid(
            cube,
            zero,
            undefined,
            { point: { x: -5, y: 0, z: 0 }, direction: { x: 1, y: 0, z: 0 } },
            [0, 4] // acaba en x = -1 (dentro)
        )!;
        expect(r.entry!.x).toBeCloseTo(-1.5, 6);
        expect(r.exit).toBeNull();
    });

    it('recta contenida en una arista: la intersección es ese tramo', () => {
        const r = intersectLineSolid(cube, zero, undefined, {
            point: { x: -5, y: 1.5, z: 1.5 },
            direction: { x: 1, y: 0, z: 0 },
        })!;
        expect(r.entry!.x).toBeCloseTo(-1.5, 6);
        expect(r.exit!.x).toBeCloseTo(1.5, 6);
    });

    it('recta tangente en un vértice: un solo punto', () => {
        const r = intersectLineSolid(cube, zero, undefined, {
            point: { x: 1.5, y: 1.5, z: 1.5 },
            direction: { x: 1, y: -1, z: 0 },
        })!;
        expect(r).not.toBeNull();
        expect(r.exit).toBeNull();
        expect(r.entry!.x).toBeCloseTo(1.5, 6);
        expect(r.entry!.y).toBeCloseTo(1.5, 6);
    });

    it('recta que no toca el cubo', () => {
        expect(
            intersectLineSolid(cube, zero, undefined, { point: { x: -5, y: 2, z: 0 }, direction: { x: 1, y: 0, z: 0 } })
        ).toBeNull();
    });

    it('cubo girado: los puntos están en la superficie', () => {
        const rot = { x: 0.4, y: 0.7, z: 0.3 };
        const r = intersectLineSolid(cube, { x: 1, y: 2, z: 0 }, rot, {
            point: { x: 1, y: 2, z: -10 },
            direction: { x: 0, y: 0, z: 1 },
        })!;
        expect(r).not.toBeNull();

        // La distancia al centro del cubo (girado) no puede pasar del radio de la esfera
        // circunscrita (1.5·√3) y debe ser mayor que la inscrita (1.5)
        [r.entry!, r.exit!].forEach((p) => {
            const d = Math.hypot(p.x - 1, p.y - 2, p.z - 0);
            expect(d).toBeGreaterThan(1.5 - 1e-6);
            expect(d).toBeLessThan(1.5 * Math.sqrt(3) + 1e-6);
        });
    });

    it('esfera: la cuerda por el centro mide 2r', () => {
        const sphere = buildSolidMesh('sphere', { x: 2, y: 2, z: 2 });
        const r = intersectLineSolid(sphere, zero, undefined, { point: { x: -10, y: 0, z: 0 }, direction: { x: 1, y: 0, z: 0 } })!;
        const length = Math.hypot(r.exit!.x - r.entry!.x, r.exit!.y - r.entry!.y, r.exit!.z - r.entry!.z);
        expect(length).toBeGreaterThan(3.9);
        expect(length).toBeLessThanOrEqual(4 + 1e-9);
    });

    it('cilindro: recta vertical por el centro', () => {
        const cyl = buildSolidMesh('cylinder', { x: 1.5, y: 4, z: 1.5 });
        const r = intersectLineSolid(cyl, { x: 0, y: 3, z: 0 }, undefined, {
            point: { x: 0, y: 3, z: -10 },
            direction: { x: 0, y: 0, z: 1 },
        })!;
        expect(r.entry!.z).toBeCloseTo(-2, 6);
        expect(r.exit!.z).toBeCloseTo(2, 6);
    });
});
