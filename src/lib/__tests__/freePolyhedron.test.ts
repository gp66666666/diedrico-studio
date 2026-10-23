import { describe, it, expect } from 'vitest';
import { parseVertexInput } from '../parseVertices';
import { countEdges, polyhedronFromPoints } from '../freePolyhedron';
import { buildSolidMesh, getProjectedEdges, meshVolume, solidMesh, transformVertex } from '../solidGeometry';
import { restOnHorizontalPlane, lowestLocalZ } from '../solidPlacement';

const points = [
    { name: 'A', coords: { x: 1, y: 2, z: 3 } },
    { name: 'B', coords: { x: 5, y: 2, z: 3 } },
];

describe('parseVertexInput', () => {
    it('lee coordenadas con espacios, comas, punto y coma y paréntesis', () => {
        const out = parseVertexInput('0 0 0\n4, 0, 0\n(0; 6; 0)\n0.5 0 1,5');
        expect(out.errors).toEqual([]);
        expect(out.vertices).toEqual([
            { x: 0, y: 0, z: 0 },
            { x: 4, y: 0, z: 0 },
            { x: 0, y: 6, z: 0 },
            { x: 0.5, y: 0, z: 1.5 },
        ]);
    });

    it('acepta nombres de puntos del dibujo y etiquetas propias', () => {
        const out = parseVertexInput('A\nb\nV1 0 0 9', points);
        expect(out.errors).toEqual([]);
        expect(out.vertices).toEqual([
            { x: 1, y: 2, z: 3 },
            { x: 5, y: 2, z: 3 },
            { x: 0, y: 0, z: 9 },
        ]);
        expect(out.labels).toEqual(['A', 'B', 'V1']);
    });

    it('señala la línea que no entiende y sigue con las demás', () => {
        const out = parseVertexInput('0 0 0\nesto no vale\nX 0 0\n0 0 0 0 0', points);
        expect(out.vertices).toHaveLength(1);
        expect(out.errors).toHaveLength(3);
        expect(out.errors[0]).toContain('Línea 2');
        expect(out.errors[1]).toContain('Línea 3');
        expect(out.errors[2]).toContain('Línea 4');
    });

    it('una etiqueta propia necesita las tres coordenadas', () => {
        const out = parseVertexInput('V1 1 2 3', points);
        expect(out.errors).toEqual([]);
        expect(out.vertices).toEqual([{ x: 1, y: 2, z: 3 }]);
        expect(out.labels).toEqual(['V1']);
    });

    it('ignora comentarios y líneas vacías', () => {
        const out = parseVertexInput('# tetraedro\n\n0 0 0\n\n');
        expect(out.errors).toEqual([]);
        expect(out.vertices).toHaveLength(1);
    });
});

describe('polyhedronFromPoints', () => {
    it('centra el cuerpo en su centroide y guarda vértices locales', () => {
        const poly = polyhedronFromPoints([
            { x: 0, y: 0, z: 0 },
            { x: 4, y: 0, z: 0 },
            { x: 0, y: 6, z: 0 },
            { x: 0, y: 0, z: 3 },
        ]);
        expect(poly).not.toBeNull();
        if (!poly) return;
        expect(poly.position.x).toBeCloseTo(1, 10);
        expect(poly.position.y).toBeCloseTo(1.5, 10);
        expect(poly.position.z).toBeCloseTo(0.75, 10);
        expect(poly.faces).toHaveLength(4);
        expect(poly.volume).toBeCloseTo(12, 9);
        // El centroide de los vértices locales es el origen.
        const sum = poly.vertices.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y, z: acc.z + v.z }), { x: 0, y: 0, z: 0 });
        expect(sum.x).toBeCloseTo(0, 10);
        expect(sum.y).toBeCloseTo(0, 10);
        expect(sum.z).toBeCloseTo(0, 10);
    });

    it('el sólido resultante da la misma malla en 3D y en 2D', () => {
        const poly = polyhedronFromPoints([
            { x: 0, y: 0, z: 0 },
            { x: 4, y: 0, z: 0 },
            { x: 0, y: 6, z: 0 },
            { x: 0, y: 0, z: 3 },
        ]);
        expect(poly).not.toBeNull();
        if (!poly) return;
        const solid = { subtype: 'polyhedron' as const, size: poly.size, custom: { vertices: poly.vertices, faces: poly.faces } };
        const fromCustom = solidMesh(solid);
        expect(fromCustom.vertices).toEqual(poly.vertices);
        // buildSolidMesh sin la malla propia no inventa geometría.
        expect(buildSolidMesh('polyhedron', poly.size).vertices).toEqual([]);
    });

    it('los vértices locales, recolocados, devuelven los puntos de partida', () => {
        const pts = [
            { x: -2, y: 1, z: 0 },
            { x: 3, y: 1, z: 0 },
            { x: -2, y: 5, z: 0 },
            { x: -2, y: 1, z: 4 },
        ];
        const poly = polyhedronFromPoints(pts);
        expect(poly).not.toBeNull();
        if (!poly) return;
        const world = poly.vertices.map((v) => transformVertex(v, poly.position, undefined));
        pts.forEach((p) => {
            const found = world.some((w) => Math.hypot(w.x - p.x, w.y - p.y, w.z - p.z) < 1e-9);
            expect(found, JSON.stringify(p)).toBe(true);
        });
    });

    it('descarta los puntos interiores y los cuenta', () => {
        const poly = polyhedronFromPoints([
            { x: 0, y: 0, z: 0 },
            { x: 4, y: 0, z: 0 },
            { x: 0, y: 6, z: 0 },
            { x: 0, y: 0, z: 3 },
            { x: 1, y: 1, z: 1 },
        ]);
        expect(poly).not.toBeNull();
        if (!poly) return;
        expect(poly.dropped).toBe(1);
        expect(poly.vertices).toHaveLength(4);
    });

    it('rechaza puntos coplanarios', () => {
        expect(
            polyhedronFromPoints([
                { x: 0, y: 0, z: 0 },
                { x: 4, y: 0, z: 0 },
                { x: 0, y: 6, z: 0 },
                { x: 4, y: 6, z: 0 },
            ])
        ).toBeNull();
    });

    it('el volumen de la malla coincide con el del casco', () => {
        const poly = polyhedronFromPoints([
            { x: 0, y: 0, z: 0 },
            { x: 6, y: 0, z: 0 },
            { x: 1, y: 5, z: 0 },
            { x: 2, y: 2, z: 5 },
        ]);
        expect(poly).not.toBeNull();
        if (!poly) return;
        const mesh = buildSolidMesh('polyhedron', poly.size, { vertices: poly.vertices, faces: poly.faces });
        expect(meshVolume(mesh)).toBeCloseTo(25, 9);
    });

    it('en diédrico se dibuja lo que saldría de esos vértices (planta y alzado)', () => {
        // A(0,0,0) B(6,0,0) C(1,5,0) D(2,2,5):
        // planta = (x, y); alzado = (x, z)
        const pts = [
            { x: 0, y: 0, z: 0 },
            { x: 6, y: 0, z: 0 },
            { x: 1, y: 5, z: 0 },
            { x: 2, y: 2, z: 5 },
        ];
        const poly = polyhedronFromPoints(pts);
        expect(poly).not.toBeNull();
        if (!poly) return;
        const mesh = buildSolidMesh('polyhedron', poly.size, { vertices: poly.vertices, faces: poly.faces });
        const edges = getProjectedEdges(mesh);
        expect(edges.length).toBeGreaterThanOrEqual(6);

        const world = (v: { x: number; y: number; z: number }) => ({
            x: v.x + poly.position.x,
            y: v.y + poly.position.y,
            z: v.z + poly.position.z,
        });
        const ph = new Set<string>();
        const pv = new Set<string>();
        edges.forEach((e) => {
            [e.a, e.b].forEach((v) => {
                const w = world(v);
                ph.add(`${w.x.toFixed(6)},${w.y.toFixed(6)}`);
                pv.add(`${w.x.toFixed(6)},${w.z.toFixed(6)}`);
            });
        });
        const expectedPh = pts.map((p) => `${p.x.toFixed(6)},${p.y.toFixed(6)}`);
        const expectedPv = pts.map((p) => `${p.x.toFixed(6)},${p.z.toFixed(6)}`);
        expectedPh.forEach((k) => expect(ph.has(k), `planta ${k}`).toBe(true));
        expectedPv.forEach((k) => expect(pv.has(k), `alzado ${k}`).toBe(true));
    });

    it('«Apoyar en el PH» deja el vértice más bajo en cota 0', () => {
        const poly = polyhedronFromPoints([
            { x: 0, y: 0, z: 2 },
            { x: 6, y: 0, z: 2 },
            { x: 1, y: 5, z: 2 },
            { x: 2, y: 2, z: 7 },
        ]);
        expect(poly).not.toBeNull();
        if (!poly) return;
        const custom = { vertices: poly.vertices, faces: poly.faces };
        const position = restOnHorizontalPlane('polyhedron', poly.size, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, custom);
        expect(position.z + lowestLocalZ('polyhedron', poly.size, { x: 0, y: 0, z: 0 }, custom)).toBeCloseTo(0, 9);
        // El centro queda a la altura del vértice más bajo dentro del cuerpo (1,25 sobre el PH).
        expect(position.z).toBeCloseTo(1.25, 9);
    });

    it('un cubo escrito por sus 8 vértices sale con 12 aristas y 6 caras', () => {
        const pts: { x: number; y: number; z: number }[] = [];
        for (const x of [0, 4]) for (const y of [0, 4]) for (const z of [0, 4]) pts.push({ x, y, z });
        const poly = polyhedronFromPoints(pts);
        expect(poly).not.toBeNull();
        if (!poly) return;
        expect(poly.vertices).toHaveLength(8);
        expect(poly.faces).toHaveLength(6);
        expect(countEdges(poly.faces)).toBe(12);
        expect(poly.volume).toBeCloseTo(64, 9);
    });

    it('recuento de aristas: tetraedro 6, prisma cuadrangular 12', () => {
        const tetra = polyhedronFromPoints([
            { x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, { x: 0, y: 6, z: 0 }, { x: 0, y: 0, z: 3 },
        ]);
        expect(tetra && countEdges(tetra.faces)).toBe(6);

        const base = [[0, 0], [5, 0], [6, 4], [1, 4]];
        const prismPts: { x: number; y: number; z: number }[] = [];
        for (const z of [0, 6]) for (const [x, y] of base) prismPts.push({ x, y, z });
        const prism = polyhedronFromPoints(prismPts);
        expect(prism && countEdges(prism.faces)).toBe(12);
        expect(prism && prism.volume).toBeCloseTo(120, 9);
    });
});
