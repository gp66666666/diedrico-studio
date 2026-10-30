import { describe, expect, it } from 'vitest';
import {
    buildSolidMesh,
    getFaceNormals,
    getProjectedEdges,
    rotateStorePoint,
    meshVolume,
    type SolidMesh,
    type Vec3,
} from '../solidGeometry';
import {
    restSolidOnPlane,
    restOnHorizontalPlane,
    restOnVerticalPlane,
} from '../solidPlacement';
import { solidFromEdge } from '../solidFromEdge';
import { sectionPolygons } from '../section';
import { intersectSolids } from '../solidIntersection';
import { intersectLineSolid } from '../lineSolid';
import { unfoldPolyhedron } from '../unfold';
import type { PlaneElement, SolidElement } from '../../types';

/**
 * Auditoría de GENERACIÓN de la geometría.
 *
 * No compara cada función con su propia fórmula: comprueba el resultado contra
 * invariantes independientes (cerrada, plana, convexa, volumen, dentro/fuera,
 * distancias a planos, oclusión por rayos…). Miles de casos aleatorios con
 * semilla fija, así que es reproducible.
 *
 * Si algo falla, el mensaje dice el sólido, el tamaño y el giro exactos.
 */

const rng = (() => {
    let s = 0x9e3779b9;
    return () => {
        s ^= s << 13;
        s ^= s >>> 17;
        s ^= s << 5;
        return ((s >>> 0) % 1_000_000) / 1_000_000;
    };
})();
const rand = (a: number, b: number) => a + (b - a) * rng();
const randRot = (): Vec3 => ({ x: rand(-Math.PI, Math.PI), y: rand(-Math.PI, Math.PI), z: rand(-Math.PI, Math.PI) });

const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const norm = (a: Vec3) => Math.hypot(a.x, a.y, a.z);
const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const cross = (a: Vec3, b: Vec3): Vec3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});

const SUBTYPES: SolidElement['subtype'][] = [
    'cube', 'tetrahedron', 'octahedron', 'dodecahedron', 'icosahedron',
    'prism', 'pyramid', 'cylinder', 'cone', 'sphere',
];
const POLYHEDRA: SolidElement['subtype'][] = [
    'cube', 'tetrahedron', 'octahedron', 'dodecahedron', 'icosahedron', 'prism', 'pyramid',
];

/** Aristas (pares de índices) de la malla. */
function meshEdges(mesh: SolidMesh): Map<string, number> {
    const count = new Map<string, number>();
    mesh.faces.forEach((face) => {
        face.forEach((a, i) => {
            const b = face[(i + 1) % face.length];
            const key = a < b ? `${a}-${b}` : `${b}-${a}`;
            count.set(key, (count.get(key) ?? 0) + 1);
        });
    });
    return count;
}

function facePlane(mesh: SolidMesh, face: number[]) {
    const p0 = mesh.vertices[face[0]];
    let nx = 0;
    let ny = 0;
    let nz = 0;
    for (let i = 0; i < face.length; i++) {
        const a = mesh.vertices[face[i]];
        const b = mesh.vertices[face[(i + 1) % face.length]];
        nx += (a.y - b.y) * (a.z + b.z);
        ny += (a.z - b.z) * (a.x + b.x);
        nz += (a.x - b.x) * (a.y + b.y);
    }
    const len = Math.hypot(nx, ny, nz) || 1;
    return { n: { x: nx / len, y: ny / len, z: nz / len }, p0 };
}

function faceArea(mesh: SolidMesh, face: number[]): number {
    const p0 = mesh.vertices[face[0]];
    let area = 0;
    for (let i = 1; i < face.length - 1; i++) {
        const c = cross(sub(mesh.vertices[face[i]], p0), sub(mesh.vertices[face[i + 1]], p0));
        area += norm(c) / 2;
    }
    return area;
}

describe('generación de mallas', () => {
    it('todas las mallas son cerradas, planas, convexas y con volumen', () => {
        const problems: string[] = [];
        for (const subtype of SUBTYPES) {
            for (let k = 0; k < 6; k++) {
                const size = { x: rand(2, 6), y: rand(2, 6), z: rand(2, 6) };
                const mesh = buildSolidMesh(subtype, size);
                const tag = `${subtype} ${JSON.stringify(size)}`;
                const scale = Math.max(size.x, size.y, size.z);
                const V = mesh.vertices.length;
                const F = mesh.faces.length;
                if (!V || !F) { problems.push(`${tag}: malla vacía`); continue; }

                // aristas: cada una en exactamente 2 caras
                const edges = meshEdges(mesh);
                const E = edges.size;
                for (const [e, n] of edges) if (n !== 2) problems.push(`${tag}: arista ${e} en ${n} caras`);

                // Euler
                if (V - E + F !== 2) problems.push(`${tag}: Euler ${V}-${E}+${F} != 2`);

                // caras planas, no degeneradas, normales hacia fuera
                mesh.faces.forEach((face, fi) => {
                    if (face.length < 3) problems.push(`${tag}: cara ${fi} con ${face.length} vértices`);
                    const { n, p0 } = facePlane(mesh, face);
                    face.forEach((vi) => {
                        const d = dot(n, sub(mesh.vertices[vi], p0));
                        if (Math.abs(d) > 1e-6 * scale) problems.push(`${tag}: cara ${fi} no plana (${d})`);
                    });
                    const area = faceArea(mesh, face);
                    if (area < 1e-9 * scale * scale) problems.push(`${tag}: cara ${fi} área ${area}`);
                    const c = face.reduce<Vec3>((a, vi) => ({
                        x: a.x + mesh.vertices[vi].x / face.length,
                        y: a.y + mesh.vertices[vi].y / face.length,
                        z: a.z + mesh.vertices[vi].z / face.length,
                    }), { x: 0, y: 0, z: 0 });
                    if (dot(n, c) <= 0) problems.push(`${tag}: normal de cara ${fi} hacia dentro`);
                });

                // volumen > 0 y vértices distintos
                if (!(meshVolume(mesh) > 0)) problems.push(`${tag}: volumen ${meshVolume(mesh)}`);
                for (let i = 0; i < V; i++) {
                    for (let j = i + 1; j < V; j++) {
                        if (norm(sub(mesh.vertices[i], mesh.vertices[j])) < 1e-9) {
                            problems.push(`${tag}: vértices ${i} y ${j} coinciden`);
                        }
                    }
                }
            }
        }
        expect(problems).toEqual([]);
    });

    it('el cubo mide de arista 1,5 × size.x y es un cubo', () => {
        const problems: string[] = [];
        for (let k = 0; k < 10; k++) {
            const a = rand(1, 8);
            const mesh = buildSolidMesh('cube', { x: a, y: 5, z: 5 });
            const xs = mesh.vertices.map((v) => v.x);
            const ys = mesh.vertices.map((v) => v.y);
            const zs = mesh.vertices.map((v) => v.z);
            const w = Math.max(...xs) - Math.min(...xs);
            const h = Math.max(...ys) - Math.min(...ys);
            const d = Math.max(...zs) - Math.min(...zs);
            if (Math.abs(w - 1.5 * a) > 1e-9) problems.push(`arista X ${w} != ${1.5 * a}`);
            if (Math.abs(h - 1.5 * a) > 1e-9 || Math.abs(d - 1.5 * a) > 1e-9) problems.push(`cubo no regular (${w},${h},${d})`);
            if (Math.abs(meshVolume(mesh) - w * h * d) > 1e-6) problems.push(`volumen ${meshVolume(mesh)} != ${w * h * d}`);
        }
        expect(problems).toEqual([]);
    });
});

/** ¿Está p dentro del sólido convexo con caras orientadas hacia fuera? */
function inside(p: Vec3, mesh: SolidMesh, faces: { normal: Vec3; indices: number[] }[], eps: number): boolean {
    return faces.every((f) => dot(f.normal, sub(p, mesh.vertices[f.indices[0]])) <= eps);
}

describe('proyección diédrica', () => {
    it('ocultas y visibles coinciden con la oclusión real (miles de giros)', () => {
        const problems: string[] = [];
        let checked = 0;

        for (const subtype of POLYHEDRA) {
            for (let k = 0; k < 40; k++) {
                const size = { x: rand(2, 6), y: rand(2, 6), z: rand(2, 6) };
                if (subtype === 'prism' || subtype === 'pyramid') size.y = rand(3, 8);
                const mesh = buildSolidMesh(subtype, size);
                const rot = randRot();
                const faces = getFaceNormals(mesh, rot);
                const verts = mesh.vertices.map((v) => rotateStorePoint(v, rot));
                const scale = Math.max(1.5 * size.x, size.y, size.z);
                const eps = scale * 1e-4;
                const local: SolidMesh = { vertices: verts, faces: mesh.faces };

                // Test exacto e independiente: intervalo del rayo dentro del
                // sólido convexo. Si hay un tramo con t > 0 dentro, la arista
                // está tapada para ese observador.
                const rayInside = (p: Vec3, dir: Vec3) => {
                    let lo = -Infinity;
                    let hi = Infinity;
                    for (const f of faces) {
                        const nf = f.normal;
                        const d = dot(nf, local.vertices[f.indices[0]]);
                        const den = dot(nf, dir);
                        const num = d - dot(nf, p);
                        if (Math.abs(den) < 1e-12) {
                            if (num < -eps) return 0;
                            continue;
                        }
                        const t = num / den;
                        if (den > 0) hi = Math.min(hi, t);
                        else lo = Math.max(lo, t);
                    }
                    return hi - Math.max(lo, 0);
                };
                const DECIDE = 1e-3 * scale;

                for (const e of getProjectedEdges(mesh, rot)) {
                    const at = (t: number) => ({
                        x: e.a.x + (e.b.x - e.a.x) * t,
                        y: e.a.y + (e.b.y - e.a.y) * t,
                        z: e.a.z + (e.b.z - e.a.z) * t,
                    });
                    // Aristas de contorno: el rayo pasa pegado y el tramo interior
                    // mide ~0. Ahí las dos respuestas son defendibles; no se
                    // comparan.
                    // H (planta) mira por z; V (alzado) mira por y.
                    const spansH = [0.3, 0.5, 0.7].map((t) => rayInside(at(t), { x: 0, y: 0, z: 1 }));
                    const spansV = [0.3, 0.5, 0.7].map((t) => rayInside(at(t), { x: 0, y: 1, z: 0 }));
                    const clearV = spansV.every((span) => Math.abs(span) > DECIDE);
                    const clearH = spansH.every((span) => Math.abs(span) > DECIDE);
                    const pv = spansV.every((span) => span > 0);
                    const ph = spansH.every((span) => span > 0);
                    checked++;
                    if (clearV && pv !== e.hiddenV) {
                        problems.push(`${subtype} ${JSON.stringify(size)} rot=${JSON.stringify(rot)}: alzado app=${e.hiddenV} real=${pv}`);
                    }
                    if (clearH && ph !== e.hiddenH) {
                        problems.push(`${subtype} ${JSON.stringify(size)} rot=${JSON.stringify(rot)}: planta app=${e.hiddenH} real=${ph}`);
                    }
                }
            }
        }

        expect(checked).toBeGreaterThan(3000);
        expect(problems.slice(0, 5)).toEqual([]);
    });
});

describe('apoyos', () => {
    it('apoyar en el PH deja la cota mínima en 0', () => {
        const problems: string[] = [];
        for (const subtype of SUBTYPES) {
            for (let k = 0; k < 8; k++) {
                const size = { x: rand(2, 6), y: rand(2, 6), z: rand(2, 6) };
                const solid = {
                    subtype, size, rotation: randRot(),
                    position: { x: rand(-5, 5), y: rand(-5, 5), z: rand(-5, 5) },
                } as unknown as SolidElement;
                const r = restOnHorizontalPlane(subtype, size, solid.rotation, solid.position);
                const mesh = buildSolidMesh(subtype, size);
                const zs = mesh.vertices.map((v) => rotateStorePoint(v, solid.rotation).z + r.z);
                const minZ = Math.min(...zs);
                if (Math.abs(minZ) > 1e-6) problems.push(`${subtype}: cota mínima ${minZ}`);
            }
        }
        expect(problems).toEqual([]);
    });

    it('apoyar en el PV deja el alejamiento mínimo en 0', () => {
        const problems: string[] = [];
        for (const subtype of SUBTYPES) {
            for (let k = 0; k < 8; k++) {
                const size = { x: rand(2, 6), y: rand(2, 6), z: rand(2, 6) };
                const solid = {
                    subtype, size, rotation: randRot(),
                    position: { x: rand(-5, 5), y: rand(-5, 5), z: rand(-5, 5) },
                } as unknown as SolidElement;
                const r = restOnVerticalPlane(subtype, size, solid.rotation, solid.position);
                const mesh = buildSolidMesh(subtype, size);
                const ys = mesh.vertices.map((v) => rotateStorePoint(v, solid.rotation).y + r.y);
                const minY = Math.min(...ys);
                if (Math.abs(minY) > 1e-6) problems.push(`${subtype}: alejamiento mínimo ${minY}`);
            }
        }
        expect(problems).toEqual([]);
    });

    it('apoyar en un plano oblicuo (cara / arista / vértice)', () => {
        const problems: string[] = [];
        const nullEdge: string[] = [];
        for (const subtype of SUBTYPES) {
            for (let k = 0; k < 10; k++) {
                const size = { x: rand(2, 6), y: rand(2, 6), z: rand(2, 6) };
                const rot = randRot();
                const pos = { x: rand(-4, 4), y: rand(-4, 4), z: rand(-4, 4) };
                // Plano oblicuo: normal con componente vertical y constante que lo aleja del origen
                const n = { x: rand(-1, 1), y: rand(-1, 1), z: rand(0.3, 1) };
                const nl = norm(n);
                const plane = {
                    type: 'plane', id: 'p', name: 'p', visible: true, color: '#fff',
                    normal: n,
                    constant: -dot({ x: n.x / nl, y: n.y / nl, z: n.z / nl }, { x: rand(-3, 3), y: rand(-3, 3), z: rand(-3, 3) }),
                } as unknown as PlaneElement;
                const solid = { type: 'solid', id: 's', name: 's', subtype, size, rotation: rot, position: pos } as unknown as SolidElement;
                const mesh = buildSolidMesh(subtype, size);
                const unit = { x: n.x / nl, y: n.y / nl, z: n.z / nl };
                const c = plane.constant / nl;

                for (const mode of ['vertex', 'face', 'edge'] as const) {
                    const r = restSolidOnPlane(solid, plane, mode);
                    if (!r) {
                        // Solo es aceptable en el modo arista: significa que no
                        // hay colocación sin meter el cuerpo bajo el PH.
                        if (mode !== 'edge') problems.push(`${subtype} ${mode}: null`);
                        else nullEdge.push(subtype);
                        continue;
                    }
                    const ds = mesh.vertices.map((v) => {
                        const p = rotateStorePoint(v, r.rotation);
                        return dot(unit, { x: p.x + r.position.x, y: p.y + r.position.y, z: p.z + r.position.z }) + c;
                    });
                    const minD = Math.min(...ds);
                    if (minD < -1e-5) problems.push(`${subtype} ${mode}: ${minD.toFixed(6)} al otro lado del plano`);
                    if (Math.abs(minD) > 1e-5) problems.push(`${subtype} ${mode}: no toca (${minD.toFixed(6)})`);

                    if (mode === 'edge') {
                        const zs = mesh.vertices.map((v) => {
                            const p = rotateStorePoint(v, r.rotation);
                            return p.z + r.position.z;
                        });
                        const dip = Math.min(...zs);
                        if (dip < -1e-5) problems.push(`${subtype} edge: se hunde en el PH (${dip.toFixed(3)})`);
                        const onTrace = mesh.vertices.filter((v, i) => Math.abs(zs[i]) < 1e-5 && Math.abs(ds[i]) < 1e-5).length;
                        if (onTrace < 2) problems.push(`${subtype} edge: solo ${onTrace} vértices en la traza`);
                    }
                }
            }
        }
        // El cubo, la pirámide y el prisma siempre tienen colocación válida.
        const nuncaNulo = ['cube', 'tetrahedron', 'prism', 'pyramid', 'cylinder', 'cone'];
        nullEdge.forEach((s) => {
            if (nuncaNulo.includes(s)) problems.push(`${s} edge: null inesperado`);
        });
        // Sin colocación válida (el cuerpo quedaría bajo el PH) es una
        // respuesta legítima en cuerpos redondos y planos muy inclinados.
        expect(problems.slice(0, 6)).toEqual([]);
    });
});

describe('sólido por dos puntos (arista)', () => {
    it('la arista dada coincide con P y Q, y todas las aristas miden lo mismo', () => {
        const problems: string[] = [];
        for (const subtype of POLYHEDRA) {
            for (let k = 0; k < 8; k++) {
                const size = { x: rand(2, 6), y: rand(3, 8), z: rand(2, 6) };
                const p = { x: rand(-5, 5), y: rand(-5, 5), z: rand(-5, 5) };
                const q = { x: p.x + rand(-4, 4), y: p.y + rand(-4, 4), z: p.z + rand(-4, 4) };
                if (norm(sub(q, p)) < 0.5) continue;
                const r = solidFromEdge(subtype, size, p, q);
                if (!r) { problems.push(`${subtype}: null`); continue; }
                const mesh = buildSolidMesh(subtype, r.size);
                const world = mesh.vertices.map((v) => {
                    const x = rotateStorePoint(v, r.rotation);
                    return { x: x.x + r.position.x, y: x.y + r.position.y, z: x.z + r.position.z };
                });
                const bestP = Math.min(...world.map((v) => norm(sub(v, p))));
                const bestQ = Math.min(...world.map((v) => norm(sub(v, q))));
                if (bestP > 1e-6 || bestQ > 1e-6) {
                    problems.push(`${subtype}: P a ${bestP.toExponential(2)}, Q a ${bestQ.toExponential(2)}`);
                }
            }
        }
        expect(problems.slice(0, 5)).toEqual([]);
    });
});

describe('sección por un plano', () => {
    it('los vértices de la sección están en el plano y dentro del cubo', () => {
        const problems: string[] = [];
        let total = 0;
        for (let k = 0; k < 120; k++) {
            const a = rand(3, 7);
            const size = { x: a, y: a, z: a };
            const mesh = buildSolidMesh('cube', size);
            const rot = randRot();
            const pos = { x: rand(-2, 2), y: rand(-2, 2), z: rand(-2, 2) };
            // plano que pasa cerca del centro del cubo
            const n = { x: rand(-1, 1), y: rand(-1, 1), z: rand(-1, 1) };
            if (norm(n) < 0.2) continue;
            const nl = norm(n);
            const unit = { x: n.x / nl, y: n.y / nl, z: n.z / nl };
            const center = { x: pos.x + rand(-1, 1), y: pos.y + rand(-1, 1), z: pos.z + rand(-1, 1) };
            const constant = -dot(unit, center);

            const polys = sectionPolygons(mesh, pos, rot, n, constant * nl);
            if (polys.length !== 1) { problems.push(`sección ${polys.length} polígonos`); continue; }
            const poly = polys[0];
            total += poly.length;
            if (poly.length < 3) problems.push(`polígono de ${poly.length} puntos`);
            poly.forEach((pt) => {
                const d = dot(unit, pt) + constant;
                if (Math.abs(d) > 1e-6) problems.push(`punto fuera del plano (${d})`);
                // dentro del cubo: caras locales transformadas
                const faces = getFaceNormals(mesh, rot);
                const insideCube = faces.every((f) => {
                    // normal y punto de la cara en el mundo
                    const v0 = rotateStorePoint(mesh.vertices[f.indices[0]], rot);
                    const w0 = { x: v0.x + pos.x, y: v0.y + pos.y, z: v0.z + pos.z };
                    return dot(f.normal, sub(pt, w0)) <= 1e-5;
                });
                if (!insideCube) problems.push('punto fuera del cubo');
            });
        }
        expect(total).toBeGreaterThan(300);
        expect(problems.slice(0, 5)).toEqual([]);
    });
});

describe('intersección de sólidos', () => {
    it('el volumen común nunca supera a ninguno de los dos y coincide consigo mismo', () => {
        const problems: string[] = [];
        for (let k = 0; k < 40; k++) {
            const a = rand(3, 6);
            const mesh = buildSolidMesh('cube', { x: a, y: a, z: a });
            const vol = meshVolume(mesh);
            const rot = randRot();
            const posA = { x: rand(-2, 2), y: rand(-2, 2), z: rand(-2, 2) };
            const posB = { x: posA.x + rand(-2, 2), y: posA.y + rand(-2, 2), z: posA.z + rand(-2, 2) };

            const inter = intersectSolids(mesh, posA, rot, mesh, posB, rot);
            if (inter) {
                if (inter.volume < -1e-6) problems.push(`volumen negativo ${inter.volume}`);
                if (inter.volume > vol + 1e-5) problems.push(`volumen ${inter.volume} > cubo ${vol}`);
            }
            // consigo mismo, misma posición
            const self = intersectSolids(mesh, posA, rot, mesh, posA, rot);
            if (!self) problems.push('intersección consigo mismo = null');
            else if (Math.abs(self.volume - vol) > 1e-4 * vol) problems.push(`consigo mismo ${self.volume} != ${vol}`);
        }
        expect(problems.slice(0, 5)).toEqual([]);
    });
});

describe('recta contra sólido', () => {
    it('entrada y salida están en la superficie y el segmento es interior', () => {
        const problems: string[] = [];
        for (let k = 0; k < 40; k++) {
            const a = rand(3, 6);
            const mesh = buildSolidMesh('cube', { x: a, y: a, z: a });
            const rot = randRot();
            const pos = { x: rand(-2, 2), y: rand(-2, 2), z: rand(-2, 2) };
            const res = intersectLineSolid(mesh, pos, rot, { point: pos, direction: { x: rand(-1, 1), y: rand(-1, 1), z: rand(-1, 1) } });
            if (!res || !res.entry || !res.exit) { problems.push('sin entrada/salida'); continue; }
            const faces = getFaceNormals(mesh, rot);
            const surface = (p: Vec3) => Math.min(...faces.map((f) => {
                const v0 = rotateStorePoint(mesh.vertices[f.indices[0]], rot);
                return Math.abs(dot(f.normal, sub(p, { x: v0.x + pos.x, y: v0.y + pos.y, z: v0.z + pos.z })));
            }));
            if (surface(res.entry) > 1e-5) problems.push(`entrada a ${surface(res.entry)} de la superficie`);
            if (surface(res.exit) > 1e-5) problems.push(`salida a ${surface(res.exit)} de la superficie`);
            if (!(res.tExit > res.tEntry)) problems.push('salida antes que entrada');
        }
        expect(problems.slice(0, 5)).toEqual([]);
    });
});

describe('desarrollo', () => {
    it('el cubo se despliega en 6 caras sin solapes y con su superficie', () => {
        const problems: string[] = [];
        for (let k = 0; k < 20; k++) {
            const a = rand(1.5, 5);
            const dev = unfoldPolyhedron('cube', { x: a, y: a, z: a });
            if (!dev) { problems.push('null'); continue; }
            const side = 1.5 * a;
            if (dev.pieces.length !== 6) problems.push(`${dev.pieces.length} piezas`);
            const area = dev.pieces.reduce((s, piece) => {
                let sum = 0;
                for (let i = 0; i < piece.points.length; i++) {
                    const p = piece.points[i];
                    const q = piece.points[(i + 1) % piece.points.length];
                    sum += p.x * q.y - q.x * p.y;
                }
                return s + Math.abs(sum) / 2;
            }, 0);
            if (Math.abs(area - 6 * side * side) > 1e-6 * 6 * side * side) {
                problems.push(`área ${area} != ${6 * side * side}`);
            }
        }
        expect(problems.slice(0, 5)).toEqual([]);
    });
});
