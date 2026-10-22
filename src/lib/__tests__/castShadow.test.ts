import { describe, expect, it } from 'vitest';
import { shadowOfSolidOnPlane, shadowOnSolid, projectPointOnPlane } from '../castShadow';
import { buildSolidMesh } from '../solidGeometry';
import type { Light } from '../shadows';

const cube = buildSolidMesh('cube', { x: 2, y: 2, z: 2 }); // lado 3
const up: Light = { kind: 'point', position: { x: 0, y: 0, z: 10 } };

const area3 = (pts: { x: number; y: number; z: number }[]) => {
    if (pts.length < 3) return 0;
    let s = 0;
    for (let i = 1; i < pts.length - 1; i++) {
        const a = { x: pts[i].x - pts[0].x, y: pts[i].y - pts[0].y, z: pts[i].z - pts[0].z };
        const b = { x: pts[i + 1].x - pts[0].x, y: pts[i + 1].y - pts[0].y, z: pts[i + 1].z - pts[0].z };
        const c = {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x,
        };
        s += Math.hypot(c.x, c.y, c.z) / 2;
    }
    return s;
};

describe('sombra sobre un plano cualquiera', () => {
    it('luz paralela vertical sobre el plano z = 2: la planta del cubo, 9 u²', () => {
        const poly = shadowOfSolidOnPlane(
            cube,
            { x: 0, y: 0, z: 1.5 },
            undefined,
            { kind: 'direction', direction: { x: 0, y: 0, z: -1 } },
            { normal: { x: 0, y: 0, z: 1 }, constant: -2 }
        )!;
        expect(poly).not.toBeNull();
        expect(area3(poly)).toBeCloseTo(9, 6);
        poly.forEach((p) => expect(p.z).toBeCloseTo(2, 9));
    });

    it('con foco, el plano z = 2 corta el cubo y la sombra se amplía', () => {
        // El foco está en (0,0,10): la cara superior (z = 3) se proyecta con t = 8/7
        const poly = shadowOfSolidOnPlane(cube, { x: 0, y: 0, z: 1.5 }, undefined, up, {
            normal: { x: 0, y: 0, z: 1 },
            constant: -2,
        })!;
        const lado = 3 * (8 / 7);
        expect(area3(poly)).toBeCloseTo(lado * lado, 6);
    });

    it('luz a 45°: la sombra se alarga igual que en el suelo', () => {
        const light: Light = { kind: 'direction', direction: { x: Math.SQRT1_2, y: 0, z: -Math.SQRT1_2 } };
        const poly = shadowOfSolidOnPlane(cube, { x: 0, y: 0, z: 1.5 }, undefined, light, {
            normal: { x: 0, y: 0, z: 1 },
            constant: 0,
        })!;
        const xs = poly.map((p) => p.x);
        expect(Math.min(...xs)).toBeCloseTo(-1.5, 6);
        expect(Math.max(...xs)).toBeCloseTo(4.5, 6);
        expect(area3(poly)).toBeCloseTo(18, 6);
    });

    it('plano vertical: la sombra queda en el plano', () => {
        const light: Light = { kind: 'point', position: { x: 0, y: 8, z: 4 } };
        const poly = shadowOfSolidOnPlane(cube, { x: 0, y: 2, z: 1.5 }, undefined, light, {
            normal: { x: 0, y: 1, z: 0 },
            constant: -0.5,
        })!;
        poly.forEach((p) => expect(p.y).toBeCloseTo(0.5, 9));
    });

    it('si la luz no llega, no hay sombra', () => {
        // Sólido por encima del plano y foco por debajo: no proyecta
        expect(
            shadowOfSolidOnPlane(cube, { x: 0, y: 0, z: 5 }, undefined, { kind: 'point', position: { x: 0, y: 0, z: -5 } }, {
                normal: { x: 0, y: 0, z: 1 },
                constant: 0,
            })
        ).toBeNull();
    });
});

describe('sombra arrojada sobre otro sólido', () => {
    it('el cubo A proyecta sobre la cara superior del cubo B', () => {
        // A flotando encima de B, foco justo arriba: la sombra cubre la tapa de B
        const res = shadowOnSolid(
            cube,
            { x: 0, y: 0, z: 5 },
            undefined,
            { kind: 'point', position: { x: 0, y: 0, z: 20 } },
            cube,
            { x: 0, y: 0, z: 1.5 },
            undefined
        )!;
        expect(res).not.toBeNull();
        // La sombra de A (3,78 de lado) tapa la cara superior de B (3 × 3), así que
        // el recorte deja justo la tapa: 9 u²
        expect(res.area).toBeCloseTo(9, 6);
        res.mesh.vertices.forEach((v) => expect(v.z).toBeCloseTo(3, 9));
        // Contorno cerrado de 4 aristas
        expect(res.mesh.outline).toHaveLength(4);
    });

    it('sin solape no hay sombra arrojada', () => {
        expect(
            shadowOnSolid(cube, { x: 0, y: 0, z: 1.5 }, undefined, up, cube, { x: 40, y: 0, z: 1.5 }, undefined)
        ).toBeNull();
    });

    it('luz paralela vertical: la sombra cae en la tapa', () => {
        const res = shadowOnSolid(
            cube,
            { x: 0, y: 0, z: 5 },
            undefined,
            { kind: 'direction', direction: { x: 0, y: 0, z: -1 } },
            cube,
            { x: 0, y: 0, z: 1.5 },
            undefined
        )!;
        expect(res.area).toBeCloseTo(9, 6);
    });
});

describe('proyección sobre un plano', () => {
    it('un punto por debajo de la luz cae en su vertical, ampliado', () => {
        const p = projectPointOnPlane({ x: 2, y: 1, z: 2 }, up, { normal: { x: 0, y: 0, z: 1 }, constant: 0 })!;
        expect(p.x).toBeCloseTo(2.5, 9);
        expect(p.y).toBeCloseTo(1.25, 9);
        expect(p.z).toBeCloseTo(0, 9);
    });
});
