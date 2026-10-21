import { describe, expect, it } from 'vitest';
import { buildDevelopment, developmentBounds } from '../development';

const size = { x: 2, y: 5, z: 2 };
const r = 2;
const h = 5;

describe('desarrollos de sólidos', () => {
    it('cubo: seis cuadrados del lado del cubo', () => {
        const dev = buildDevelopment('cube', size)!;
        const side = 1.5 * r;
        // Una tira lateral (los cuatro laterales seguidos) + base + tapa
        expect(dev.pieces).toHaveLength(3);
        expect(dev.area).toBeCloseTo(6 * side * side, 6);
    });

    it('prisma hexagonal: seis rectángulos y dos bases', () => {
        const dev = buildDevelopment('prism', size)!;
        const edge = r; // hexágono: lado = radio
        const base = (3 * Math.sqrt(3) / 2) * r * r;
        expect(dev.pieces).toHaveLength(3);
        expect(dev.area).toBeCloseTo(6 * edge * h + 2 * base, 6);
    });

    it('cilindro: rectángulo de 2πr por h y dos círculos', () => {
        const dev = buildDevelopment('cylinder', size)!;
        expect(dev.pieces).toHaveLength(3);
        expect(dev.area).toBeGreaterThan(2 * Math.PI * r * r + 2 * Math.PI * r * h - 0.2);
        expect(dev.area).toBeLessThanOrEqual(2 * Math.PI * r * r + 2 * Math.PI * r * h + 1e-9);
    });

    it('pirámide cuadrada: base y cuatro triángulos', () => {
        const dev = buildDevelopment('pyramid', size)!;
        expect(dev.pieces).toHaveLength(5);

        const edge = r * Math.SQRT2;
        const slant = Math.hypot(h, r / Math.SQRT2);
        expect(dev.area).toBeCloseTo(edge * edge + 2 * edge * slant, 6);
    });

    it('tetraedro: base triangular y tres caras', () => {
        const dev = buildDevelopment('tetrahedron', size)!;
        expect(dev.pieces).toHaveLength(4);

        const edge = r * Math.sqrt(3);
        const slant = Math.hypot(h, r / 2);
        expect(dev.area).toBeCloseTo((Math.sqrt(3) / 4) * edge * edge + 1.5 * edge * slant, 6);
    });

    it('cono: sector circular y base', () => {
        const dev = buildDevelopment('cone', size)!;
        const g = Math.hypot(r, h);
        expect(dev.pieces).toHaveLength(2);
        expect(dev.area).toBeGreaterThan(Math.PI * r * r + Math.PI * r * g - 0.1);
        expect(dev.area).toBeLessThanOrEqual(Math.PI * r * r + Math.PI * r * g + 1e-9);
    });

    it('la esfera no es desarrollable', () => {
        expect(buildDevelopment('sphere', size)).toBeNull();
    });

    it('las piezas no se salen de su caja (cada desarrollo está acotado)', () => {
        ['cube', 'prism', 'pyramid', 'tetrahedron', 'cylinder', 'cone'].forEach((subtype) => {
            const dev = buildDevelopment(subtype, size)!;
            const b = developmentBounds(dev.pieces);
            expect(Number.isFinite(b.minX)).toBe(true);
            expect(b.maxX).toBeGreaterThan(b.minX);
            expect(b.maxY).toBeGreaterThan(b.minY);
        });
    });

    it('la base del prisma encaja con el primer rectángulo', () => {
        const dev = buildDevelopment('prism', size)!;
        const base = dev.pieces[1];
        const edge = r;
        const ys = base.points.map((p) => p.y);
        expect(Math.max(...ys)).toBeCloseTo(0, 6);

        // Los dos vértices de la arista superior caen en x = 0 y x = lado
        const top = base.points.filter((p) => Math.abs(p.y) < 1e-6).map((p) => p.x).sort((a, b) => a - b);
        expect(top).toHaveLength(2);
        expect(top[0]).toBeCloseTo(0, 6);
        expect(top[1]).toBeCloseTo(edge, 6);
    });
});
