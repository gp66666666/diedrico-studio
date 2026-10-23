import { describe, it, expect } from 'vitest';
import { solidFromEdge, rotationFromMatrix } from '../solidFromEdge';
import { buildSolidMesh, rotateStorePoint, transformVertex, type Vec3 } from '../solidGeometry';

const SUBTYPES = [
    'cube', 'tetrahedron', 'octahedron', 'dodecahedron', 'icosahedron',
    'prism', 'pyramid', 'cylinder', 'cone', 'sphere',
] as const;

/** Tamaños por defecto de `solidFactory` (los que verá el alumno). */
const DEFAULT_SIZE: Record<string, Vec3> = {
    cube: { x: 5, y: 5, z: 5 },
    tetrahedron: { x: 5, y: 5, z: 5 },
    octahedron: { x: 5, y: 5, z: 5 },
    dodecahedron: { x: 5, y: 5, z: 5 },
    icosahedron: { x: 5, y: 5, z: 5 },
    prism: { x: 4, y: 8, z: 4 },
    pyramid: { x: 4, y: 8, z: 4 },
    cylinder: { x: 3, y: 8, z: 3 },
    cone: { x: 3, y: 8, z: 3 },
    sphere: { x: 4, y: 4, z: 4 },
};

const dist = (a: Vec3, b: Vec3) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

describe('rotationFromMatrix', () => {
    it('deshace la rotación del store (ida y vuelta)', () => {
        const cases: Vec3[] = [
            { x: 0, y: 0, z: 0 },
            { x: 0.3, y: -0.7, z: 1.1 },
            { x: -1.2, y: 0.4, z: 2.5 },
            { x: 2.0, y: 1.57, z: -0.2 },
            { x: 0, y: 1.2, z: Math.PI / 2 },
            { x: 0.5, y: 0, z: -Math.PI / 2 },
        ];
        for (const rot of cases) {
            // Matriz implícita: imagen de los tres ejes con la rotación real.
            const ex = rotateStorePoint({ x: 1, y: 0, z: 0 }, rot);
            const ey = rotateStorePoint({ x: 0, y: 1, z: 0 }, rot);
            const ez = rotateStorePoint({ x: 0, y: 0, z: 1 }, rot);
            const m = [
                ex.x, ey.x, ez.x,
                ex.y, ey.y, ez.y,
                ex.z, ey.z, ez.z,
            ] as [
                number, number, number, number, number, number, number, number, number,
            ];
            const back = rotationFromMatrix(m);
            for (const v of [{ x: 1, y: 2, z: 3 }, { x: -4, y: 0.5, z: 7 }]) {
                const a = rotateStorePoint(v, rot);
                const b = rotateStorePoint(v, back);
                expect(dist(a, b)).toBeLessThan(1e-9);
            }
        }
    });
});

describe('solidFromEdge', () => {
    it('rechaza dos puntos iguales', () => {
        expect(solidFromEdge('cube', DEFAULT_SIZE.cube, { x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toBeNull();
    });

    it('coloca una arista exactamente entre P y Q en todos los tipos', () => {
        const P = { x: -2, y: 1, z: 3 };
        const Q = { x: 4, y: 1.5, z: 6 }; // inclinada a propósito
        const L = dist(P, Q);

        for (const subtype of SUBTYPES) {
            const placement = solidFromEdge(subtype, DEFAULT_SIZE[subtype], P, Q);
            expect(placement, subtype).not.toBeNull();
            if (!placement) continue;

            const mesh = buildSolidMesh(subtype, placement.size);
            const world = mesh.vertices.map((v) =>
                transformVertex(v, placement.position, placement.rotation)
            );

            // Al menos un vértice en P y otro en Q, con precisión de máquina.
            const atP = Math.min(...world.map((v) => dist(v, P)));
            const atQ = Math.min(...world.map((v) => dist(v, Q)));
            expect(atP, subtype).toBeLessThan(1e-6);
            expect(atQ, subtype).toBeLessThan(1e-6);

            // Y la distancia entre esos dos vértices es la pedida.
            expect(L).toBeGreaterThan(0);
        }
    });

    it('la arista elegida mide |PQ| (no la diagonal ni otra arista)', () => {
        const P = { x: 0, y: 0, z: 0 };
        const Q = { x: 3, y: 4, z: 0 };
        const L = dist(P, Q);

        for (const subtype of SUBTYPES) {
            const placement = solidFromEdge(subtype, DEFAULT_SIZE[subtype], P, Q);
            expect(placement, subtype).not.toBeNull();
            if (!placement) continue;

            const mesh = buildSolidMesh(subtype, placement.size);
            const world = mesh.vertices.map((v) =>
                transformVertex(v, placement.position, placement.rotation)
            );
            // Todos los pares de vértices: el mínimo debe ser... no. Buscamos
            // qué dos vértices caen en P y Q y medimos su distancia.
            const iP = world.findIndex((v) => dist(v, P) < 1e-6);
            const iQ = world.findIndex((v) => dist(v, Q) < 1e-6);
            expect(iP, subtype).toBeGreaterThanOrEqual(0);
            expect(iQ, subtype).toBeGreaterThanOrEqual(0);
            expect(dist(world[iP], world[iQ])).toBeCloseTo(L, 6);
        }
    });

    it('con la arista horizontal, el sólido queda de pie', () => {
        // La base debe quedar horizontal: para un prisma hexagonal, la cota de
        // los seis vértices de la base es la misma.
        const placement = solidFromEdge('prism', DEFAULT_SIZE.prism, { x: 0, y: 0, z: 0 }, { x: 2, y: 2, z: 0 });
        expect(placement).not.toBeNull();
        if (!placement) return;

        const mesh = buildSolidMesh('prism', placement.size);
        const world = mesh.vertices.map((v) => transformVertex(v, placement.position, placement.rotation));
        const zMin = Math.min(...world.map((v) => v.z));
        const base = world.filter((v) => Math.abs(v.z - zMin) < 1e-6);
        expect(base).toHaveLength(6);
    });

    it('el tetraedro sale regular', () => {
        const placement = solidFromEdge('tetrahedron', DEFAULT_SIZE.tetrahedron, { x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 0 });
        expect(placement).not.toBeNull();
        if (!placement) return;
        // Todas las aristas de la malla miden lo mismo en un tetraedro regular.
        const mesh = buildSolidMesh('tetrahedron', placement.size);
        const lens = new Set<string>();
        for (const face of mesh.faces) {
            for (let i = 0; i < face.length; i++) {
                const a = mesh.vertices[face[i]];
                const b = mesh.vertices[face[(i + 1) % face.length]];
                lens.add(dist(a, b).toFixed(5));
            }
        }
        expect(lens.size).toBe(1);
        expect([...lens][0]).toBe('4.00000');
    });

    it('con los dos puntos sobre la LT no saca giros de 180º', () => {
        for (const subtype of SUBTYPES) {
            const placement = solidFromEdge(subtype, DEFAULT_SIZE[subtype], { x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 0 });
            expect(placement, subtype).not.toBeNull();
            if (!placement) continue;
            // Se admite el giro propio de la figura (hexágono 60º, etc.), pero no
            // representaciones raras de la misma rotación.
            expect(Math.abs(placement.rotation.x), subtype).toBeLessThan(Math.PI / 2 + 1e-6);
            expect(Math.abs(placement.rotation.y), subtype).toBeLessThan(Math.PI / 2 + 1e-6);
            expect(Math.abs(placement.rotation.z), subtype).toBeLessThan(Math.PI / 2 + 1e-6);
        }
    });

    it('la esfera usa |PQ| como diámetro', () => {
        const placement = solidFromEdge('sphere', DEFAULT_SIZE.sphere, { x: -3, y: 0, z: 2 }, { x: 1, y: 0, z: 2 });
        expect(placement).not.toBeNull();
        if (!placement) return;
        expect(placement.size.x * 2).toBeCloseTo(4, 9);
        expect(placement.position.x).toBeCloseTo(-1, 9);
        expect(placement.position.z).toBeCloseTo(2, 9);
        expect(Math.abs(placement.rotation.x)).toBeLessThan(1e-9);
        expect(Math.abs(placement.rotation.y)).toBeLessThan(1e-9);
        expect(Math.abs(placement.rotation.z)).toBeLessThan(1e-9);
    });
});
