import { describe, expect, it } from 'vitest';
import { restSolidOnPlane, restSolidOnLine } from '../solidPlacement';
import { buildSolidMesh, rotateStorePoint } from '../solidGeometry';
import type { PlaneElement, SolidElement } from '../../types';

const cube = (): SolidElement => ({
    id: 's1',
    name: 'Cubo',
    type: 'solid',
    subtype: 'cube',
    position: { x: 3, y: 3, z: 3 },
    size: { x: 4, y: 4, z: 4 }, // lado = 1,5 · 4 = 6
    rotation: { x: 0, y: 0, z: 0 },
    color: '#3b82f6',
    visible: true,
});

const plane = (n: [number, number, number], c: number): PlaneElement => ({
    id: 'p1',
    name: 'Plano 1',
    type: 'plane',
    normal: { x: n[0], y: n[1], z: n[2] },
    constant: c,
    color: '#10b981',
    visible: true,
});

const mundo = (solid: SolidElement, res: { position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number } }) => {
    const mesh = buildSolidMesh(solid.subtype, solid.size);
    return mesh.vertices.map((v) => {
        const r = rotateStorePoint(v, res.rotation);
        return { x: r.x + res.position.x, y: r.y + res.position.y, z: r.z + res.position.z };
    });
};

describe('apoyar un cubo en un plano oblicuo', () => {
    it('la cara inferior queda en el plano y una arista en α₁', () => {
        const s = cube();
        const p = plane([1, 1, 1], -6); // x + y + z = 6
        const res = restSolidOnPlane(s, p, 'edge');
        expect(res).not.toBeNull();

        const pts = mundo(s, res!);
        const n = { x: 1 / Math.sqrt(3), y: 1 / Math.sqrt(3), z: 1 / Math.sqrt(3) };
        const dist = (q: { x: number; y: number; z: number }) => n.x * q.x + n.y * q.y + n.z * q.z - 6 / Math.sqrt(3);

        const enPlano = pts.filter((q) => Math.abs(dist(q)) < 1e-6);
        expect(enPlano).toHaveLength(4);
        // Dos de los cuatro (la arista de apoyo) están además en z = 0.
        expect(enPlano.filter((q) => Math.abs(q.z) < 1e-6)).toHaveLength(2);
        // El resto del cubo queda por encima del plano.
        expect(pts.filter((q) => dist(q) > 1e-6)).toHaveLength(4);
        expect(pts.filter((q) => dist(q) < -1e-6)).toHaveLength(0);
    });

    it('la arista de apoyo mide el lado del cubo', () => {
        const s = cube();
        const p = plane([1, 2, 3], -7);
        const res = restSolidOnPlane(s, p, 'edge')!;
        const pts = mundo(s, res);
        const n = { x: 1 / Math.sqrt(14), y: 2 / Math.sqrt(14), z: 3 / Math.sqrt(14) };
        const enPlano = pts.filter((q) => Math.abs(n.x * q.x + n.y * q.y + n.z * q.z - 7 / Math.sqrt(14)) < 1e-6);
        const enTraza = enPlano.filter((q) => Math.abs(q.z) < 1e-6);
        expect(enTraza).toHaveLength(2);
        const d = Math.hypot(enTraza[1].x - enTraza[0].x, enTraza[1].y - enTraza[0].y);
        expect(d).toBeCloseTo(6, 6);
    });

    it('rechaza planos horizontales y verticales', () => {
        expect(restSolidOnPlane(cube(), plane([0, 0, 1], -4), 'edge')).toBeNull();
        // Un plano vertical sí admite apoyo por cara (el cubo queda pegado).
        expect(restSolidOnPlane(cube(), plane([0, 1, 0], -4), 'face')).not.toBeNull();
    });
});

describe('apoyo general: cualquier sólido, cualquier plano', () => {
    const solid = (subtype: SolidElement['subtype'], size = { x: 4, y: 8, z: 4 }): SolidElement => ({
        ...cube(),
        subtype,
        size,
        position: { x: 5, y: 5, z: 5 },
    });

    const enPlano = (s: SolidElement, res: { position: any; rotation: any }, p: PlaneElement) => {
        const nLen = Math.hypot(p.normal.x, p.normal.y, p.normal.z);
        const n = { x: p.normal.x / nLen, y: p.normal.y / nLen, z: p.normal.z / nLen };
        const c = p.constant / nLen;
        return mundo(s, res).map((v) => n.x * v.x + n.y * v.y + n.z * v.z + c);
    };

    it('prisma recto: la base queda en el plano', () => {
        const s = solid('prism');
        const p = plane([1, 1, 1], -8);
        const res = restSolidOnPlane(s, p, 'face')!;
        const d = enPlano(s, res, p);
        expect(Math.min(...d)).toBeCloseTo(0, 6);
        expect(d.filter((x) => Math.abs(x) < 1e-6).length).toBeGreaterThanOrEqual(3);
    });

    it('tetraedro: el vértice más bajo toca el plano sin girar', () => {
        const s = solid('tetrahedron');
        const p = plane([1, 1, 0], -6);
        const res = restSolidOnPlane(s, p, 'vertex')!;
        expect(res.rotation).toEqual(s.rotation);
        const d = enPlano(s, res, p);
        expect(Math.min(...d)).toBeCloseTo(0, 6);
    });

    it('cubo sobre un plano horizontal: cuatro vértices a la cota del plano', () => {
        const s = cube();
        const p = plane([0, 0, 1], -4); // z = 4
        const res = restSolidOnPlane(s, p, 'face')!;
        const d = enPlano(s, res, p);
        expect(d.filter((x) => Math.abs(x) < 1e-6)).toHaveLength(4);
    });
});

describe('apoyar una arista en una recta', () => {
    it('recta horizontal: la cara queda horizontal y dos vértices en la recta', () => {
        const s = cube();
        const line = { point: { x: 0, y: 0, z: 4 }, direction: { x: 1, y: 0, z: 0 } };
        const res = restSolidOnLine(s, line)!;
        expect(res).not.toBeNull();
        const pts = mundo(s, res);
        // Dos vértices sobre la recta (y = 0, z = 4).
        const enRecta = pts.filter((q) => Math.abs(q.y) < 1e-6 && Math.abs(q.z - 4) < 1e-6);
        expect(enRecta).toHaveLength(2);
        // La cara inferior es horizontal: cuatro vértices a cota 4.
        expect(pts.filter((q) => Math.abs(q.z - 4) < 1e-6)).toHaveLength(4);
    });

    it('recta oblicua: dos vértices sobre ella', () => {
        const s = cube();
        const line = { point: { x: 0, y: 0, z: 3 }, direction: { x: 1, y: 1, z: 0 } };
        const res = restSolidOnLine(s, line)!;
        const d = { x: 1 / Math.SQRT2, y: 1 / Math.SQRT2, z: 0 };
        const p0 = { x: 0, y: 0, z: 3 };
        const distToLine = (q: { x: number; y: number; z: number }) => {
            const v = { x: q.x - p0.x, y: q.y - p0.y, z: q.z - p0.z };
            const t = v.x * d.x + v.y * d.y + v.z * d.z;
            const proj = { x: p0.x + t * d.x, y: p0.y + t * d.y, z: p0.z + t * d.z };
            return Math.hypot(q.x - proj.x, q.y - proj.y, q.z - proj.z);
        };
        const pts = mundo(s, res);
        expect(pts.filter((q) => distToLine(q) < 1e-6)).toHaveLength(2);
    });

    it('rechaza rectas verticales', () => {
        const s = cube();
        expect(restSolidOnLine(s, { point: { x: 1, y: 1, z: 0 }, direction: { x: 0, y: 0, z: 1 } })).toBeNull();
    });
});
