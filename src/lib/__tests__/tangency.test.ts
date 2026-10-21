import { describe, expect, it } from 'vitest';
import { tangentAtPoint, tangentPlanesThroughLine, tangentPlanesParallel, distancePointPlane } from '../tangency';

const C = { x: 0, y: 0, z: 0 };
const r = 2;

describe('planos tangentes a la esfera', () => {
    it('tangente en un punto de la esfera', () => {
        const p = tangentAtPoint(C, r, { x: 2, y: 0, z: 0 })!;
        expect(p).not.toBeNull();
        expect(p.normal.x).toBeCloseTo(1, 9);
        expect(distancePointPlane(C, p.normal, p.constant)).toBeCloseTo(r, 9);
        // El plano pasa por el punto de tangencia
        expect(Math.abs(p.normal.x * 2 + p.constant)).toBeLessThan(1e-9);
    });

    it('un punto que no está en la esfera no da tangente', () => {
        expect(tangentAtPoint(C, r, { x: 3, y: 0, z: 0 })).toBeNull();
    });

    it('dos planos tangentes que contienen una recta exterior', () => {
        const line = { point: { x: 0, y: 0, z: 5 }, direction: { x: 1, y: 0, z: 0 } };
        const planes = tangentPlanesThroughLine(C, r, line);
        expect(planes).toHaveLength(2);

        planes.forEach((p) => {
            // Distancia del centro al plano = radio
            expect(distancePointPlane(C, p.normal, p.constant)).toBeCloseTo(r, 9);
            // La recta entera está contenida en el plano
            expect(Math.abs(p.normal.x * 0 + p.normal.y * 0 + p.normal.z * 5 + p.constant)).toBeLessThan(1e-9);
            expect(Math.abs(p.normal.x * 1 + p.normal.y * 0 + p.normal.z * 0)).toBeLessThan(1e-9);
            // El punto de tangencia está en la esfera
            expect(Math.hypot(p.touch.x, p.touch.y, p.touch.z)).toBeCloseTo(r, 9);
        });

        // Las dos soluciones son planos distintos
        expect(Math.abs(planes[0].normal.y - planes[1].normal.y)).toBeGreaterThan(0.1);
    });

    it('una recta que corta la esfera no tiene planos tangentes', () => {
        expect(tangentPlanesThroughLine(C, r, { point: { x: -5, y: 0, z: 0 }, direction: { x: 1, y: 0, z: 0 } })).toHaveLength(0);
    });

    it('recta tangente: una sola solución', () => {
        const planes = tangentPlanesThroughLine(C, r, { point: { x: -5, y: 2, z: 0 }, direction: { x: 1, y: 0, z: 0 } });
        expect(planes).toHaveLength(1);
        expect(distancePointPlane(C, planes[0].normal, planes[0].constant)).toBeCloseTo(r, 9);
    });

    it('planos tangentes paralelos a un plano', () => {
        const planes = tangentPlanesParallel(C, r, { x: 0, y: 0, z: 1 });
        expect(planes).toHaveLength(2);
        planes.forEach((p) => expect(distancePointPlane(C, p.normal, p.constant)).toBeCloseTo(r, 9));
        expect(planes[0].constant).toBeCloseTo(-2, 9);
        expect(planes[1].constant).toBeCloseTo(2, 9);
    });

    it('esfera desplazada: los planos siguen a distancia r del centro', () => {
        const center = { x: 3, y: -1, z: 2 };
        const planes = tangentPlanesParallel(center, 1.5, { x: 0.6, y: 0.8, z: 0 });
        planes.forEach((p) => expect(distancePointPlane(center, p.normal, p.constant)).toBeCloseTo(1.5, 9));
    });
});
