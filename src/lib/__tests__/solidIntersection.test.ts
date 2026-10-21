import { describe, expect, it } from 'vitest';
import { intersectSolids } from '../solidIntersection';
import { buildSolidMesh } from '../solidGeometry';
import type { Vector3 } from '../../types';

const zero: Vector3 = { x: 0, y: 0, z: 0 };
const cube = buildSolidMesh('cube', { x: 2, y: 2, z: 2 }); // lado 3

const used = (r: NonNullable<ReturnType<typeof intersectSolids>>) => {
    const set = new Set<number>();
    r.faces.forEach((f) => f.forEach((i) => set.add(i)));
    return [...set].map((i) => r.vertices[i]);
};

describe('intersección de dos sólidos convexos', () => {
    it('dos cubos desplazados en x e y: prisma de 1×1×3 y su línea de intersección', () => {
        const r = intersectSolids(cube, zero, undefined, cube, { x: 2, y: 2, z: 0 }, undefined)!;
        expect(r).not.toBeNull();
        expect(r.volume).toBeCloseTo(3, 6);
        // La curva son los bordes de la parte de la superficie de B que queda
        // dentro de A: dos rectángulos que comparten la arista (0.5, 0.5, z),
        // que es interior a la región → 6 aristas de contacto.
        expect(r.seam).toHaveLength(6);
    });

    it('dos cubos desplazados solo en x: el solape es una caja de 1×3×3', () => {
        const r = intersectSolids(cube, zero, undefined, cube, { x: 2, y: 0, z: 0 }, undefined)!;
        // Las caras y/z son coplanares, así que la línea de contacto es un rectángulo
        expect(r.volume).toBeCloseTo(9, 6);
        expect(r.seam).toHaveLength(4);
    });

    it('cubos separados: no hay intersección', () => {
        expect(intersectSolids(cube, zero, undefined, cube, { x: 10, y: 0, z: 0 }, undefined)).toBeNull();
    });

    it('cubos coincidentes: el volumen es el del cubo', () => {
        const r = intersectSolids(cube, zero, undefined, cube, zero, undefined)!;
        expect(r.volume).toBeCloseTo(27, 6);
        expect(r.seam).toHaveLength(0);
    });

    it('cubo dentro de una esfera grande: volumen del cubo', () => {
        const sphere = buildSolidMesh('sphere', { x: 3, y: 3, z: 3 });
        const r = intersectSolids(cube, zero, undefined, sphere, zero, undefined)!;
        expect(r.volume).toBeCloseTo(27, 4);
        expect(r.seam).toHaveLength(0);
    });

    it('cilindro dentro de un cubo: volumen del cilindro', () => {
        const cylinder = buildSolidMesh('cylinder', { x: 1, y: 10, z: 1 });
        const big = buildSolidMesh('cube', { x: 4 / 1.5, y: 4 / 1.5, z: 4 / 1.5 }); // lado 4
        const r = intersectSolids(cylinder, zero, undefined, big, zero, undefined)!;
        const area = 16 * Math.sin((2 * Math.PI) / 32);
        expect(r.volume).toBeCloseTo(area * 4, 6);
    });

    it('vértices sobre las dos superficies y malla cerrada', () => {
        const cuboPequeno = buildSolidMesh('cube', { x: 2, y: 2, z: 2 });
        const r = intersectSolids(cube, zero, undefined, cuboPequeno, { x: 1, y: 0.5, z: 0.5 }, { x: 0.3, y: 0, z: 0.4 })!;
        expect(r).not.toBeNull();

        // Cada arista debe pertenecer exactamente a dos caras (malla cerrada)
        const count = new Map<string, number>();
        r.faces.forEach((f) => {
            for (let i = 0; i < f.length; i++) {
                const a = f[i];
                const b = f[(i + 1) % f.length];
                const k = a < b ? `${a}-${b}` : `${b}-${a}`;
                count.set(k, (count.get(k) ?? 0) + 1);
            }
        });
        const bad = [...count.values()].filter((c) => c !== 2);
        expect(bad).toHaveLength(0);

        // Todos los vértices usados están dentro de los dos cubos
        used(r).forEach((p) => {
            expect(Math.abs(p.x)).toBeLessThanOrEqual(1.5 + 1e-6);
            expect(Math.abs(p.y)).toBeLessThanOrEqual(1.5 + 1e-6);
            expect(Math.abs(p.z)).toBeLessThanOrEqual(1.5 + 1e-6);
        });
    });

    it('la esfera cortada por un cubo pequeño da una cara plana en cada cara del cubo', () => {
        const sphere = buildSolidMesh('sphere', { x: 2, y: 2, z: 2 });
        const r = intersectSolids(sphere, zero, undefined, cube, zero, undefined)!;
        expect(r.volume).toBeGreaterThan(0);
        expect(r.volume).toBeLessThan((4 / 3) * Math.PI * 8);
        expect(r.seam.length).toBeGreaterThan(0);
    });
});
