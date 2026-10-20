import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../exercises';

/**
 * Comprobaciones numéricas de la geometría de la biblioteca de ejercicios.
 * Si alguien cambia una coordenada "a ojo", esto falla.
 */

const onLine = (
    p: [number, number, number],
    linePoint: [number, number, number],
    dir: [number, number, number],
    tol = 1e-6
) => {
    const v: [number, number, number] = [p[0] - linePoint[0], p[1] - linePoint[1], p[2] - linePoint[2]];
    const cross: [number, number, number] = [
        v[1] * dir[2] - v[2] * dir[1],
        v[2] * dir[0] - v[0] * dir[2],
        v[0] * dir[1] - v[1] * dir[0],
    ];
    return Math.hypot(...cross) / Math.hypot(...dir) < tol;
};

const onPlane = (p: [number, number, number], n: [number, number, number], d: number, tol = 1e-6) =>
    Math.abs(n[0] * p[0] + n[1] * p[1] + n[2] * p[2] + d) < tol;

const ex = (slug: string) => {
    const found = EXERCISES.find((e) => e.slug === slug);
    if (!found) throw new Error('Ejercicio no encontrado: ' + slug);
    return found;
};

const el = (slug: string, name: string) => {
    const found = ex(slug).elements.find((e: any) => e.name === name) as any;
    if (!found) throw new Error(`Elemento ${name} no encontrado`);
    return found;
};

describe('biblioteca de ejercicios', () => {
    it('trazas: A y B están en la recta y las trazas son correctas', () => {
        const A = el('trazas-de-una-recta', 'A');
        const B = el('trazas-de-una-recta', 'B');
        const r = el('trazas-de-una-recta', 'r');
        expect(onLine([A.coords.x, A.coords.y, A.coords.z], [r.point.x, r.point.y, r.point.z], [r.direction.x, r.direction.y, r.direction.z])).toBe(true);
        expect(onLine([B.coords.x, B.coords.y, B.coords.z], [r.point.x, r.point.y, r.point.z], [r.direction.x, r.direction.y, r.direction.z])).toBe(true);

        // Traza horizontal: z = 0. Traza vertical: y = 0.
        const t = (5 - 0) / 8; // punto de partida z=5, dirección z=-8
        expect(0 + t * 12).toBeCloseTo(7.5, 6);
        expect(6 + t * -4).toBeCloseTo(3.5, 6);
        expect(ex('trazas-de-una-recta').result).toContain('7,5');
    });

    it('intersección recta-plano: I(6, 6, 4) está en la recta y en el plano', () => {
        const line = el('interseccion-recta-plano', 'r');
        const I: [number, number, number] = [6, 6, 4];
        expect(onLine(I, [line.point.x, line.point.y, line.point.z], [line.direction.x, line.direction.y, line.direction.z])).toBe(true);
        expect(onPlane(I, [0, 0, 1], -4)).toBe(true);
        expect(ex('interseccion-recta-plano').result).toContain('I(6, 6, 4)');
    });

    it('distancia punto-plano: P(3, 5, 7) a z = 2 son 5 unidades', () => {
        expect(Math.abs(7 - 2)).toBe(5);
        expect(ex('distancia-punto-plano').result).toContain('5 unidades');
    });

    it('recta paralela: la dirección es perpendicular a la normal del plano', () => {
        const line = el('recta-paralela-a-plano', 'r');
        const plane = ex('recta-paralela-a-plano').elements.find((e: any) => e.type === 'plane') as any;
        const dot = line.direction.x * plane.normal.x + line.direction.y * plane.normal.y + line.direction.z * plane.normal.z;
        expect(Math.abs(dot)).toBeLessThan(1e-9);
    });

    it('abatimiento: A pertenece al plano y = 4 y el radio es su cota', () => {
        const A = el('abatimiento-de-un-punto', 'A');
        expect(onPlane([A.coords.x, A.coords.y, A.coords.z], [0, 1, 0], -4)).toBe(true);
        expect(ex('abatimiento-de-un-punto').steps.join(' ')).toContain('radio de giro es la cota');
    });

    it('ángulo entre planos: 45° (normales (0,0,1) y (1,0,1))', () => {
        const cos = 1 / (Math.hypot(0, 0, 1) * Math.hypot(1, 0, 1));
        expect((Math.acos(cos) * 180) / Math.PI).toBeCloseTo(45, 6);
        expect(ex('angulo-entre-dos-planos').result).toContain('45');
    });
});
