import { describe, expect, it } from 'vitest';
import { buildTruncatedDevelopment } from '../development';

const pos = { x: 0, y: 0, z: 0 };
const size2 = { x: 2, y: 2, z: 2 }; // cubo de lado 3

describe('desarrollo del cuerpo truncado', () => {
    it('cubo cortado por un plano horizontal: alturas iguales y área exacta', () => {
        const dev = buildTruncatedDevelopment('cube', size2, pos, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, -0.5)!;
        expect(dev).not.toBeNull();

        // 4 laterales (3 × 2) + base 9 + tapa 9
        expect(dev.pieces.filter((p) => p.kind === 'lateral')).toHaveLength(4);
        expect(dev.area).toBeCloseTo(24 + 9 + 9, 6);

        // Todas las aristas a 2 u del suelo
        dev.pieces.filter((p) => p.kind === 'lateral').forEach((p) => {
            const ys = p.points.map((q) => q.y);
            expect(Math.max(...ys)).toBeCloseTo(2, 6);
        });
    });

    it('cubo cortado por un plano oblicuo: cada arista a su altura', () => {
        const n = { x: 0.6, y: 0, z: 0.8 };
        const dev = buildTruncatedDevelopment('cube', size2, pos, { x: 0, y: 0, z: 0 }, n, 0)!;

        // altura = 1.5 − 0.75·x  (vértices a 45°, 135°, 225° y 315°)
        const expected = [1.5, -1.5, -1.5, 1.5].map((x) => 1.5 - 0.75 * x);
        const heights = dev.pieces
            .filter((p) => p.kind === 'lateral')
            .map((p) => p.points[3].y); // esquina superior izquierda de cada rectángulo
        heights.forEach((h, i) => expect(h).toBeCloseTo(expected[i], 6));

        expect(dev.area).toBeGreaterThan(0);
    });

    it('cilindro: alturas constantes con plano horizontal', () => {
        const dev = buildTruncatedDevelopment('cylinder', { x: 2, y: 4, z: 2 }, pos, undefined, { x: 0, y: 0, z: 1 }, -1)!;
        const heights = dev.pieces.filter((p) => p.kind === 'lateral').map((p) => p.points[3].y);
        heights.forEach((h) => expect(h).toBeCloseTo(3, 6));
        expect(dev.pieces.some((p) => p.kind === 'section')).toBe(true);
    });

    it('un plano que no corta todas las aristas no es un cuerpo truncado', () => {
        expect(buildTruncatedDevelopment('cube', size2, pos, undefined, { x: 0, y: 0, z: 1 }, -5)).toBeNull();
    });

    it('la pirámide sí se contempla (tronco de pirámide)', () => {
        const dev = buildTruncatedDevelopment('pyramid', size2, pos, undefined, { x: 0, y: 0, z: 1 }, 0);
        expect(dev).not.toBeNull();
        expect(dev!.pieces.filter((p) => p.kind === 'lateral')).toHaveLength(4);
    });

    it('el octaedro no tiene desarrollo de tronco', () => {
        expect(buildTruncatedDevelopment('octahedron', size2, pos, undefined, { x: 0, y: 0, z: 1 }, 0)).toBeNull();
    });

    it('girar el sólido alrededor de la vertical no cambia las alturas', () => {
        const a = buildTruncatedDevelopment('prism', size2, pos, { x: 0, y: 0, z: 0 }, { x: 0.3, y: 0, z: 1 }, 0)!;
        const b = buildTruncatedDevelopment('prism', size2, pos, { x: 0, y: 0, z: 1.2 }, { x: 0.3, y: 0, z: 1 }, 0)!;
        expect(b.area).toBeCloseTo(a.area, 6);
    });
});
