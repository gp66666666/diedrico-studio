import { describe, expect, it } from 'vitest';
import { paperToPoint, planeFromThreeClicks } from '../planeFromClicks';

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
});
