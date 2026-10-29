import { describe, expect, it } from 'vitest';
import {
    planeFromThreePoints,
    evaluatePlane,
    distanceToPlane,
} from '../planeMath';

/** Dos normales son equivalentes si son proporcionales (misma dirección). */
function sameDirection(
    a: { x: number; y: number; z: number },
    b: { x: number; y: number; z: number }
) {
    const cross = {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    };
    return Math.hypot(cross.x, cross.y, cross.z) < 1e-9;
}

describe('plano por tres puntos (matemática)', () => {
    it('plano z = 0 con tres puntos del horizontal', () => {
        const plane = planeFromThreePoints(
            { x: 0, y: 0, z: 0 },
            { x: 6, y: 0, z: 0 },
            { x: 0, y: 6, z: 0 }
        )!;
        expect(plane).not.toBeNull();
        expect(sameDirection(plane.normal, { x: 0, y: 0, z: 1 })).toBe(true);
        expect(plane.constant).toBeCloseTo(0, 12);
    });

    it('plano x + y + z = 1', () => {
        const plane = planeFromThreePoints(
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 },
            { x: 0, y: 0, z: 1 }
        )!;
        expect(sameDirection(plane.normal, { x: 1, y: 1, z: 1 })).toBe(true);
        // n·p + D = 0 para los tres: D = -1 con esa normal
        expect(plane.constant / plane.normal.x).toBeCloseTo(-1, 12);
    });

    it('los tres puntos cumplen la ecuación y un cuarto punto fuera no', () => {
        const a = { x: 2, y: 2, z: 2 };
        const b = { x: 8, y: 3, z: 2 };
        const c = { x: 3, y: 8, z: 4 };
        const plane = planeFromThreePoints(a, b, c)!;

        for (const p of [a, b, c]) expect(Math.abs(evaluatePlane(plane, p))).toBeLessThan(1e-9);
        expect(distanceToPlane(plane, { x: 0, y: 0, z: 0 })).toBeGreaterThan(1);
    });

    it('la distancia es la euclídea aunque la normal no esté normalizada', () => {
        const plane = planeFromThreePoints(
            { x: 0, y: 0, z: 0 },
            { x: 6, y: 0, z: 0 },
            { x: 0, y: 6, z: 0 }
        )!;
        // Plano z = 0: la distancia de (0,0,5) es 5
        expect(distanceToPlane(plane, { x: 0, y: 0, z: 5 })).toBeCloseTo(5, 12);
        // y de (0,0,-3) es 3
        expect(distanceToPlane(plane, { x: 0, y: 0, z: -3 })).toBeCloseTo(3, 12);
    });

    it('puntos alineados o repetidos devuelven null', () => {
        expect(
            planeFromThreePoints({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 2, y: 2, z: 2 })
        ).toBeNull();
        expect(
            planeFromThreePoints({ x: 3, y: 3, z: 3 }, { x: 3, y: 3, z: 3 }, { x: 5, y: 1, z: 0 })
        ).toBeNull();
    });

    it('el umbral de alineación no depende de la escala', () => {
        const tiny = planeFromThreePoints(
            { x: 0, y: 0, z: 0 },
            { x: 1e-6, y: 0, z: 0 },
            { x: 0, y: 1e-6, z: 0 }
        );
        expect(tiny).not.toBeNull(); // es un plano diminuto pero válido

        const huge = planeFromThreePoints(
            { x: 0, y: 0, z: 0 },
            { x: 1e6, y: 0, z: 0 },
            { x: 2e6, y: 0, z: 0 }
        );
        expect(huge).toBeNull(); // alineados, aunque sean enormes
    });
});
