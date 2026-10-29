import { describe, expect, it } from 'vitest';
import { paperToPoint, planeFromThreeClicks, lineFromTwoClicks } from '../planeFromClicks';

const SCALE = 40;

describe('plano dibujado con tres clics', () => {
    it('debajo de la LT son puntos del horizontal y encima del vertical', () => {
        expect(paperToPoint({ x: 80, y: 120 }, SCALE)).toEqual({ x: 2, y: 3, z: 0 });
        expect(paperToPoint({ x: 140, y: -120 }, SCALE)).toEqual({ x: 3.5, y: 0, z: 3 });
    });

    it('los dos clics de la planta marcan la traza horizontal', () => {
        // A(2,3) y B(5,4) en la planta, C(3,5; 3) en el alzado
        const plane = planeFromThreeClicks(
            [{ x: 80, y: 120 }, { x: 200, y: 160 }, { x: 140, y: -120 }],
            SCALE
        );

        expect(plane).not.toBeNull();
        const { normal, constant } = plane!;

        // La traza horizontal pasa por A y B: z = 0 en la ecuación
        const onTrace = (p: { x: number; y: number }) =>
            Math.abs(normal.x * p.x + normal.y * p.y + constant) < 1e-9;
        expect(onTrace({ x: 2, y: 3 })).toBe(true);
        expect(onTrace({ x: 5, y: 4 })).toBe(true);

        // El tercer clic pertenece al plano
        const d = normal.x * 3.5 + normal.y * 0 + normal.z * 3 + constant;
        expect(Math.abs(d)).toBeLessThan(1e-9);
    });

    it('tres puntos alineados no definen plano', () => {
        expect(
            planeFromThreeClicks(
                [{ x: 80, y: 120 }, { x: 160, y: 120 }, { x: 240, y: 120 }],
                SCALE
            )
        ).toBeNull();
    });

    it('reproduce un plano conocido por sus dos trazas', () => {        // Plano 2x + 3y + 6z − 12 = 0  →  trazas:
        //   α₁ (z=0): 2x + 3y = 12  → pasa por (3, 2) y (0, 4)
        //   α₂ (y=0): 2x + 6z = 12  → pasa por (0, 2)
        const plane = planeFromThreeClicks(
            [{ x: 3 * SCALE, y: 2 * SCALE }, { x: 0, y: 4 * SCALE }, { x: 0, y: -2 * SCALE }],
            SCALE
        )!;

        expect(plane).not.toBeNull();

        // Misma normal salvo escala: (2, 3, 6)
        const k = plane.normal.x / 2;
        expect(plane.normal.y).toBeCloseTo(3 * k, 9);
        expect(plane.normal.z).toBeCloseTo(6 * k, 9);
        // Mismo término independiente salvo la misma escala: −12
        expect(plane.constant).toBeCloseTo(-12 * k, 9);

        // Ceros exactos en las trazas
        for (const p of [{ x: 3, y: 2, z: 0 }, { x: 0, y: 4, z: 0 }, { x: 0, y: 0, z: 2 }]) {
            expect(Math.abs(plane.normal.x * p.x + plane.normal.y * p.y + plane.normal.z * p.z + plane.constant)).toBeLessThan(1e-9);
        }
    });
});

describe('recta a partir de dos clics', () => {
    it('dos clics en la planta dan una recta del horizontal (z = 0)', () => {
        const line = lineFromTwoClicks(
            [{ x: 2 * SCALE, y: 3 * SCALE }, { x: 5 * SCALE, y: 4 * SCALE }],
            SCALE
        )!;

        expect(line).not.toBeNull();
        expect(line.point).toEqual({ x: 2, y: 3, z: 0 });
        expect(line.point2).toEqual({ x: 5, y: 4, z: 0 });
        expect(line.direction).toEqual({ x: 3, y: 1, z: 0 });
    });

    it('un clic en la planta y otro en el alzado dan una recta oblicua', () => {
        const line = lineFromTwoClicks(
            [{ x: 2 * SCALE, y: 3 * SCALE }, { x: 5 * SCALE, y: -4 * SCALE }],
            SCALE
        )!;

        expect(line.point).toEqual({ x: 2, y: 3, z: 0 });
        expect(line.point2).toEqual({ x: 5, y: 0, z: 4 });
        expect(line.direction).toEqual({ x: 3, y: -3, z: 4 });
    });

    it('dos clics en el mismo punto no definen recta', () => {
        expect(
            lineFromTwoClicks([{ x: 200, y: 200 }, { x: 200, y: 200 }], SCALE)
        ).toBeNull();
    });
});
