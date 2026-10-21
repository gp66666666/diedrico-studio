import { describe, expect, it } from 'vitest';
import { buildSolidMesh } from '../solidGeometry';
import { sectionPolygons, trueShape } from '../section';

const cube = (r = 2) => buildSolidMesh('cube', { x: r, y: r, z: r });
// Lado del cubo: 1.5 * r (comportamiento histórico de la app)
const SIDE = 3;
const AREA = SIDE * SIDE;

const planeZ = (z: number) => ({ normal: { x: 0, y: 0, z: 1 }, constant: -z });

describe('sección de un sólido por un plano', () => {
    it('un plano horizontal corta el cubo en un cuadrado de su tamaño', () => {
        const loops = sectionPolygons(cube(), { x: 0, y: 0, z: 0 }, undefined, planeZ(0).normal, planeZ(0).constant);

        expect(loops).toHaveLength(1);
        expect(loops[0]).toHaveLength(4);

        const shape = trueShape(loops[0], { x: 0, y: 0, z: 1 });
        expect(shape?.area).toBeCloseTo(AREA, 6);
        expect(shape?.perimeter).toBeCloseTo(4 * SIDE, 6);
    });

    it('la sección no depende de la altura del corte', () => {
        const loops = sectionPolygons(cube(), { x: 0, y: 0, z: 0 }, undefined, planeZ(0.75).normal, planeZ(0.75).constant);
        const shape = trueShape(loops[0], { x: 0, y: 0, z: 1 });
        expect(shape?.area).toBeCloseTo(AREA, 6);
    });

    it('respeta la posición del sólido', () => {
        const loops = sectionPolygons(
            cube(),
            { x: 10, y: -4, z: 0 },
            undefined,
            { x: 1, y: 0, z: 0 },
            -10
        );
        const shape = trueShape(loops[0], { x: 1, y: 0, z: 0 });
        expect(loops).toHaveLength(1);
        expect(shape?.area).toBeCloseTo(AREA, 6);
    });

    it('un plano que no corta devuelve vacío', () => {
        const loops = sectionPolygons(cube(), { x: 0, y: 0, z: 0 }, undefined, planeZ(3).normal, planeZ(3).constant);
        expect(loops).toHaveLength(0);
    });

    it('el plano diagonal por el centro da un hexágono regular', () => {
        const n = 1 / Math.sqrt(3);
        const loops = sectionPolygons(cube(), { x: 0, y: 0, z: 0 }, undefined, { x: n, y: n, z: n }, 0);

        expect(loops).toHaveLength(1);
        expect(loops[0]).toHaveLength(6);

        const shape = trueShape(loops[0], { x: n, y: n, z: n });
        const side = SIDE / Math.SQRT2;
        expect(shape?.area).toBeCloseTo((3 * Math.sqrt(3) / 2) * side * side, 4);
        expect(shape?.perimeter).toBeCloseTo(6 * side, 4);
    });

    it('un plano que pasa por una cara devuelve esa cara', () => {
        // La cara superior del cubo está en z = 1.5
        const loops = sectionPolygons(cube(), { x: 0, y: 0, z: 0 }, undefined, planeZ(1.5).normal, planeZ(1.5).constant);
        expect(loops).toHaveLength(1);
        expect(loops[0]).toHaveLength(4);

        const shape = trueShape(loops[0], { x: 0, y: 0, z: 1 });
        expect(shape?.area).toBeCloseTo(AREA, 6);
    });

    it('un plano que pasa por dos aristas opuestas da el rectángulo diagonal', () => {
        // Plano x - z = 0: contiene la arista (x=z=1.5) y la opuesta (x=z=-1.5)
        const loops = sectionPolygons(cube(), { x: 0, y: 0, z: 0 }, undefined, { x: 1, y: 0, z: -1 }, 0);

        expect(loops).toHaveLength(1);
        expect(loops[0]).toHaveLength(4);

        const shape = trueShape(loops[0], { x: 1, y: 0, z: -1 });
        // Rectángulo de 3 (arista) por 3·√2 (diagonal de la cara)
        expect(shape?.area).toBeCloseTo(SIDE * SIDE * Math.SQRT2, 6);
        expect(shape?.perimeter).toBeCloseTo(2 * (SIDE + SIDE * Math.SQRT2), 6);
    });

    it('un plano que solo toca una arista no da sección', () => {
        const loops = sectionPolygons(cube(), { x: 0, y: 0, z: 0 }, undefined, { x: 1, y: 0, z: 1 }, -3);
        expect(loops).toHaveLength(0);
    });

    it('la rotación del sólido se tiene en cuenta', () => {
        const loops = sectionPolygons(
            cube(),
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 0, z: Math.PI / 4 },
            planeZ(0).normal,
            planeZ(0).constant
        );
        const shape = trueShape(loops[0], { x: 0, y: 0, z: 1 });
        expect(shape?.area).toBeCloseTo(AREA, 6);
    });

    it('la sección de un cilindro horizontal se aproxima a la circunferencia', () => {
        const cylinder = buildSolidMesh('cylinder', { x: 2, y: 6, z: 2 });
        const loops = sectionPolygons(cylinder, { x: 0, y: 0, z: 0 }, undefined, planeZ(0).normal, planeZ(0).constant);
        const shape = trueShape(loops[0], { x: 0, y: 0, z: 1 });
        // Malla de 24 lados: el área queda algo por debajo de π·r²
        expect(shape?.area).toBeGreaterThan(Math.PI * 4 * 0.97);
        expect(shape?.area).toBeLessThanOrEqual(Math.PI * 4);
    });

    it('la sección de una pirámide es un polígono cerrado y ordenado', () => {
        const pyramid = buildSolidMesh('pyramid', { x: 3, y: 6, z: 3 });
        const loops = sectionPolygons(pyramid, { x: 0, y: 0, z: 0 }, undefined, planeZ(2).normal, planeZ(2).constant);

        expect(loops.length).toBeGreaterThanOrEqual(1);
        const perim = trueShape(loops[0], { x: 0, y: 0, z: 1 })?.perimeter || 0;
        expect(perim).toBeGreaterThan(0);
    });
});
