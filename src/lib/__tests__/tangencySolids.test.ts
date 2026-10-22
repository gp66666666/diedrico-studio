import { describe, expect, it } from 'vitest';
import {
    solidTangentAtPoint,
    solidTangentParallel,
    solidTangentThroughLine,
    distancePointPlane,
    type SolidRef,
} from '../tangency';

const cylinder: SolidRef = { subtype: 'cylinder', position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 2, z: 1 } };
const cone: SolidRef = { subtype: 'cone', position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 2, z: 1 } };

describe('tangentes al cilindro', () => {
    it('plano tangente en un punto de la superficie', () => {
        const { planes } = solidTangentAtPoint(cylinder, { x: 1, y: 0, z: 0.4 });
        expect(planes).toHaveLength(1);
        expect(planes[0].normal.x).toBeCloseTo(1, 9);
        expect(planes[0].normal.z).toBeCloseTo(0, 9);
        expect(distancePointPlane({ x: 0, y: 0, z: 0.4 }, planes[0].normal, planes[0].constant)).toBeCloseTo(1, 9);
    });

    it('un punto que no está en la superficie no da tangente', () => {
        expect(solidTangentAtPoint(cylinder, { x: 0.5, y: 0, z: 0 }).planes).toHaveLength(0);
        expect(solidTangentAtPoint(cylinder, { x: 0, y: 0, z: 5 }).planes).toHaveLength(0);
    });

    it('tangentes paralelos a un plano vertical: x = ±1', () => {
        const { planes } = solidTangentParallel(cylinder, { x: 1, y: 0, z: 0 });
        expect(planes).toHaveLength(2);
        const constants = planes.map((p) => -p.constant).sort((a, b) => a - b);
        expect(constants[0]).toBeCloseTo(-1, 9);
        expect(constants[1]).toBeCloseTo(1, 9);
    });

    it('tangentes paralelos a un plano horizontal: las bases z = ±1', () => {
        const { planes } = solidTangentParallel(cylinder, { x: 0, y: 0, z: 1 });
        expect(planes).toHaveLength(2);
        const zs = planes.map((p) => -p.constant).sort((a, b) => a - b);
        expect(zs[0]).toBeCloseTo(-1, 9);
        expect(zs[1]).toBeCloseTo(1, 9);
    });

    it('plano tangente que contiene una recta exterior', () => {
        const { planes } = solidTangentThroughLine(cylinder, {
            point: { x: 1, y: -3, z: 0 },
            direction: { x: 0, y: 1, z: 0 },
        });
        expect(planes).toHaveLength(1);
        expect(planes[0].normal.x).toBeCloseTo(1, 9);
        // La recta está contenida
        expect(Math.abs(distancePointPlane({ x: 1, y: 0, z: 0 }, planes[0].normal, planes[0].constant))).toBeLessThan(1e-9);
    });

    it('una recta que corta al cilindro no da tangente', () => {
        expect(
            solidTangentThroughLine(cylinder, { point: { x: 0, y: -3, z: 0 }, direction: { x: 0, y: 1, z: 0 } }).planes
        ).toHaveLength(0);
    });
});

describe('tangentes al cono', () => {
    it('plano tangente en un punto de la superficie (contiene la generatriz)', () => {
        // Cono r = 1, h = 2: base z = -1, vértice z = 1. En z = 0 el radio es 0.5
        const p = { x: 0.5, y: 0, z: 0 };
        const { planes } = solidTangentAtPoint(cone, p);
        expect(planes).toHaveLength(1);
        const { normal, constant } = planes[0];
        // Contiene el punto y el vértice
        expect(Math.abs(normal.x * p.x + normal.y * p.y + normal.z * p.z + constant)).toBeLessThan(1e-9);
        const apex = { x: 0, y: 0, z: 1 };
        expect(Math.abs(normal.x * apex.x + normal.y * apex.y + normal.z * apex.z + constant)).toBeLessThan(1e-9);
        // Dirección esperada del gradiente: (1, 0, 0.5)
        expect(normal.x).toBeCloseTo(2 / Math.sqrt(5), 6);
        expect(normal.z).toBeCloseTo(1 / Math.sqrt(5), 6);
    });

    it('un punto fuera de la superficie no da tangente', () => {
        expect(solidTangentAtPoint(cone, { x: 0.9, y: 0, z: 0 }).planes).toHaveLength(0);
    });

    it('tangentes paralelos a un plano vertical: x = ±1, por la base', () => {
        const { planes } = solidTangentParallel(cone, { x: 1, y: 0, z: 0 });
        expect(planes).toHaveLength(2);
        const cs = planes.map((p) => -p.constant).sort((a, b) => a - b);
        expect(cs[0]).toBeCloseTo(-1, 9);
        expect(cs[1]).toBeCloseTo(1, 9);
        // El punto de tangencia está en el borde de la base (z = -1)
        planes.forEach((p) => expect(p.touch.z).toBeCloseTo(-1, 9));
    });

    it('tangente que contiene una recta de un plano tangente conocido', () => {
        // El plano tangente es 2x + z = 1 (contiene el vértice y la generatriz)
        const { planes } = solidTangentThroughLine(cone, {
            point: { x: 1, y: -2, z: -1 },
            direction: { x: 0, y: 1, z: 0 },
        });
        expect(planes).toHaveLength(1);
        expect(Math.abs(planes[0].normal.x)).toBeCloseTo(2 / Math.sqrt(5), 6);
        expect(Math.abs(planes[0].normal.z)).toBeCloseTo(1 / Math.sqrt(5), 6);
    });

    it('una recta que corta al cono no da tangente', () => {
        expect(
            solidTangentThroughLine(cone, { point: { x: 0, y: -3, z: 0 }, direction: { x: 0, y: 1, z: 0 } }).planes
        ).toHaveLength(0);
    });
});

describe('tangentes con el sólido girado', () => {
    it('cono girado 90° sobre X: el eje pasa a ser Y', () => {
        const rotated: SolidRef = { ...cone, rotation: { x: Math.PI / 2, y: 0, z: 0 } };
        const p = { x: 0.5, y: 0, z: 0 };
        const { planes } = solidTangentAtPoint(rotated, p);
        expect(planes).toHaveLength(1);
        expect(planes[0].normal.x).toBeCloseTo(2 / Math.sqrt(5), 6);
        expect(planes[0].normal.y).toBeCloseTo(1 / Math.sqrt(5), 6);
        // Sigue conteniendo el vértice girado (0, 1, 0)
        const n = planes[0].normal;
        expect(Math.abs(n.y + planes[0].constant)).toBeLessThan(1e-9);
    });
});
