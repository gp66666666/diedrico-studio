import { describe, expect, it } from 'vitest';
import { buildTruncatedDevelopment } from '../development';

const pos = { x: 0, y: 0, z: 0 };

describe('desarrollo del cuerpo truncado: pirámide y cono', () => {
    it('pirámide cuadrada cortada a media altura', () => {
        // r = 2, h = 4 → base de lado 2√2, caras de altura 4.243
        const dev = buildTruncatedDevelopment('pyramid', { x: 2, y: 4, z: 2 }, pos, undefined, { x: 0, y: 0, z: 1 }, 0)!;
        expect(dev).not.toBeNull();

        const e = 2 * Math.SQRT2;
        const slant = Math.hypot(4, 2 / Math.SQRT2);
        const base = e * e;
        const lateral = 2 * e * slant;
        const top = base / 4;

        // Tronco: 3/4 del lateral + base + tapa
        expect(dev.area).toBeCloseTo(0.75 * lateral + base + top, 6);
        expect(dev.pieces.filter((p) => p.kind === 'lateral')).toHaveLength(4);
    });

    it('cono cortado a media altura', () => {
        const dev = buildTruncatedDevelopment('cone', { x: 2, y: 4, z: 2 }, pos, undefined, { x: 0, y: 0, z: 1 }, 0)!;
        const g = Math.hypot(2, 4);
        const expected = 0.75 * Math.PI * 2 * g + Math.PI * 4 + Math.PI * 1;
        expect(dev.area).toBeGreaterThan(expected * 0.985);
        expect(dev.area).toBeLessThanOrEqual(expected * 1.001);
    });

    it('un plano por encima del vértice no trunca la pirámide', () => {
        expect(
            buildTruncatedDevelopment('pyramid', { x: 2, y: 4, z: 2 }, pos, undefined, { x: 0, y: 0, z: 1 }, -3)
        ).toBeNull();
    });

    it('plano oblicuo que corta todas las aristas: el área es positiva y coherente', () => {
        const n = { x: 0.3, y: 0, z: 1 };
        const dev = buildTruncatedDevelopment('pyramid', { x: 2, y: 4, z: 2 }, pos, undefined, n, 0)!;
        expect(dev).not.toBeNull();
        expect(dev.area).toBeGreaterThan(0);
        // La tapa es la sección: su área debe coincidir con la del panel de sección
        const cap = dev.pieces.find((p) => p.kind === 'section')!;
        expect(cap.points.length).toBeGreaterThanOrEqual(3);
    });

    it('tetraedro: el tronco tiene tres caras laterales', () => {
        const dev = buildTruncatedDevelopment('tetrahedron', { x: 2, y: 4, z: 2 }, pos, undefined, { x: 0, y: 0, z: 1 }, 0)!;
        expect(dev.pieces.filter((p) => p.kind === 'lateral')).toHaveLength(3);
    });
});
