import type { SolidElement } from '../types';
import { buildSolidMesh, rotateStorePoint, type SolidMesh, type Vec3 } from './solidGeometry';

/**
 * Sólido definido por dos puntos (una arista, o un diámetro si el cuerpo es
 * redondo).
 *
 * La idea es la del enunciado de clase: «cubo de arista AB», «esfera de
 * diámetro AB». Se busca en la malla local una arista de referencia y se coloca
 * el sólido de forma que esa arista caiga EXACTAMENTE sobre los dos puntos:
 *
 *     posición + R · A = P
 *     posición + R · B = Q
 *
 * Consecuencias que conviene tener claras (y que la interfaz avisa):
 * - La arista elegida es una de la base (la primera que se encuentra), así que
 *   el sólido sale «de pie» sobre esa arista, no tumbado.
 * - El giro queda determinado salvo el alabeo alrededor de la arista. Se toma
 *   el que deja el cuerpo lo más vertical posible (eje z local pegado a la
 *   vertical), que es lo que uno espera al dibujar y luego se puede retocar en
 *   el panel de edición.
 * - El tetraedro se crea REGULAR (altura = √2 · radio): si el alumno da la
 *   arista, es que quiere el tetraedro regular.
 */

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const mul = (a: Vec3, k: number): Vec3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: Vec3, b: Vec3): Vec3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});
const norm = (a: Vec3): number => Math.sqrt(dot(a, a));
const unit = (a: Vec3): Vec3 => {
    const n = norm(a) || 1;
    return mul(a, 1 / n);
};

type Mat3 = [number, number, number, number, number, number, number, number, number];
/** Fila i, columna j. */
const at = (m: Mat3, i: number, j: number) => m[i * 3 + j];

/** Producto de matrices 3x3 (filas). */
const matMul = (a: Mat3, b: Mat3): Mat3 => {
    const out = Array(9).fill(0) as Mat3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let s = 0;
            for (let k = 0; k < 3; k++) s += at(a, i, k) * at(b, k, j);
            out[i * 3 + j] = s;
        }
    }
    return out;
};

/** Traspuesta (la inversa de una rotación). */
const transpose = (m: Mat3): Mat3 => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];

/**
 * Marco ortonormal con `dir` como eje X y el eje Z lo más cerca posible de la
 * vertical. Si `dir` es vertical, se elige cualquier perpendicular estable.
 */
function frame(dir: Vec3, hint: Vec3 = { x: 0, y: 0, z: 1 }): Mat3 {
    const x = unit(dir);
    let z = sub(hint, mul(x, dot(hint, x)));
    if (norm(z) < 1e-9) {
        // dir vertical: perpendicular arbitraria pero determinista
        const alt = Math.abs(x.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
        z = sub(alt, mul(x, dot(alt, x)));
    }
    z = unit(z);
    const y = cross(z, x);
    // Columnas: imagen de e_x, e_y, e_z
    return [x.x, y.x, z.x, x.y, y.y, z.y, x.z, y.z, z.z];
}

/**
 * Ángulos del store (radianes) de una matriz de rotación local→mundo.
 *
 * La convención del store (ver `rotateStorePoint`) es Rx(-rx)·Rz(-rz)·Ry(-ry);
 * de ahí salen las extracciones de abajo (probadas en `solidFromEdge.test.ts`
 * contra la propia función de rotación).
 */
/** Matriz que produce la rotación del store (para comparar representaciones). */
function matrixOf(rotation: Vec3): Mat3 {
    const ex = rotateStorePoint({ x: 1, y: 0, z: 0 }, rotation);
    const ey = rotateStorePoint({ x: 0, y: 1, z: 0 }, rotation);
    const ez = rotateStorePoint({ x: 0, y: 0, z: 1 }, rotation);
    return [ex.x, ey.x, ez.x, ex.y, ey.y, ez.y, ex.z, ey.z, ez.z];
}

function sameRotation(a: Mat3, b: Mat3): boolean {
    for (let i = 0; i < 9; i++) if (Math.abs(a[i] - b[i]) > 1e-9) return false;
    return true;
}

const biggest = (v: Vec3) => Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));

/**
 * Los mismos ángulos de giro se pueden escribir de dos maneras. Se devuelve la
 * de números más pequeños: un «giro 180 / −180» correcto pero incomprensible
 * para el alumno es peor que el «−60» equivalente.
 */
/** Lleva un ángulo a (−π, π]. */
const wrap = (a: number) => {
    const t = ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    return t - Math.PI;
};

const wrapAll = (v: Vec3): Vec3 => ({ x: wrap(v.x), y: wrap(v.y), z: wrap(v.z) });

function prettier(base: Vec3, m: Mat3): Vec3 {
    const clean = wrapAll(base);
    // Las dos formas de escribir el mismo giro.
    const alt = wrapAll({ x: clean.x - Math.PI, y: clean.y - Math.PI, z: -clean.z - Math.PI });
    if (biggest(alt) < biggest(clean) - 1e-9 && sameRotation(matrixOf(alt), m)) return alt;
    return clean;
}

export function rotationFromMatrix(m: Mat3): Vec3 {
    const m01 = at(m, 0, 1);
    const cosRz = Math.sqrt(Math.max(0, 1 - m01 * m01));

    if (cosRz < 1e-7) {
        // Gimbal (rz = ±90°): se fija ry = 0 y se saca rx de la tercera columna.
        const rz = m01 > 0 ? Math.PI / 2 : -Math.PI / 2;
        const rx = Math.atan2(at(m, 1, 2), at(m, 2, 2));
        return { x: rx, y: 0, z: rz };
    }

    const rz = Math.asin(Math.max(-1, Math.min(1, m01)));
    const ry = Math.atan2(-at(m, 0, 2) / cosRz, at(m, 0, 0) / cosRz);

    const sy = Math.sin(ry);
    const cy = Math.cos(ry);
    const sz = Math.sin(rz);
    const det = cy * cy + sy * sy * sz * sz || 1;
    const m12 = at(m, 1, 2);
    const m22 = at(m, 2, 2);
    const sinRx = (cy * m12 - sy * sz * m22) / det;
    const cosRx = (sy * sz * m12 + cy * m22) / det;
    const rx = Math.atan2(sinRx, cosRx);

    return prettier({ x: rx, y: ry, z: rz }, m);
}

export interface EdgePlacement {
    size: Vec3;
    position: Vec3;
    rotation: Vec3;
}

/** Pares de índices que forman aristas (sin repetir). */
function meshEdges(mesh: SolidMesh): Array<[number, number]> {
    const seen = new Set<string>();
    const edges: Array<[number, number]> = [];
    for (const face of mesh.faces) {
        for (let i = 0; i < face.length; i++) {
            const a = face[i];
            const b = face[(i + 1) % face.length];
            const key = a < b ? `${a}-${b}` : `${b}-${a}`;
            if (seen.has(key)) continue;
            seen.add(key);
            edges.push([a, b]);
        }
    }
    return edges;
}

/**
 * Arista de referencia: la primera de la base (la cara de cota mínima), que es
 * la que el alumno dibuja («la arista AB de la base»). En los poliedros que
 * apoyan en un vértice (octaedro) se toma la primera arista de la malla.
 */
function referenceEdge(mesh: SolidMesh): [number, number] {
    const zs = mesh.vertices.map((v) => v.z);
    const zMin = Math.min(...zs);
    const zMax = Math.max(...zs);
    const eps = 1e-9 * Math.max(1, Math.abs(zMax), Math.abs(zMin));
    const base = new Set<number>();
    if (zMax - zMin > eps) {
        mesh.vertices.forEach((v, i) => {
            if (Math.abs(v.z - zMin) <= eps) base.add(i);
        });
    }

    const edges = meshEdges(mesh);
    let candidates = edges;
    if (base.size >= 2) {
        const onBase = edges.filter(([a, b]) => base.has(a) && base.has(b));
        if (onBase.length) candidates = onBase;
    }

    // Entre las candidatas se elige la más paralela a la LT (eje X): así, con
    // dos puntos horizontales, el sólido sale sin giro raro en el panel.
    const parallel = (edge: [number, number]) => {
        const d = sub(mesh.vertices[edge[1]], mesh.vertices[edge[0]]);
        const n = norm(d) || 1;
        return Math.abs(d.x) / n;
    };
    const best = candidates.reduce((a, b) => (parallel(b) > parallel(a) ? b : a), candidates[0]);

    // Se ordena la arista hacia +X: así el giro que hay que darle para llevarla
    // a la LT es el menor posible (y no un «180º» que asusta en el panel).
    const dir = sub(mesh.vertices[best[1]], mesh.vertices[best[0]]);
    return dir.x < 0 ? [best[1], best[0]] : best;
}

/**
 * Coloca el sólido para que su arista de referencia vaya de `p` a `q`.
 * Devuelve `null` si los dos puntos coinciden o el tipo no tiene arista.
 */
export function solidFromEdge(
    subtype: SolidElement['subtype'],
    size: Vec3,
    p: Vec3,
    q: Vec3
): EdgePlacement | null {
    const length = norm(sub(q, p));
    if (length < 1e-6) return null;

    // Malla con el tamaño por defecto: su arista de referencia marca la escala.
    const mesh = buildSolidMesh(subtype, size);
    if (!mesh.vertices.length) return null;

    // Los cuerpos redondos no tienen aristas: ahí los dos puntos son un diámetro.
    const round = subtype === 'sphere' || subtype === 'cylinder' || subtype === 'cone';

    const [ia, ib] = referenceEdge(mesh);
    const a0 = mesh.vertices[ia];
    const b0 = mesh.vertices[ib];
    const localLength = norm(sub(b0, a0));

    // El tamaño escala en proporción al radio (size.x): la arista de referencia
    // mide `localLength` con el radio por defecto, que es `size.x`.
    const referenceLength = round ? size.x * 2 : localLength;
    if (localLength < 1e-9) return null;

    // El tamaño escala en proporción al radio (size.x).
    const radius = Math.max(0.05, (size.x * length) / referenceLength);
    const nextSize: Vec3 = {
        x: radius,
        y: subtype === 'tetrahedron' ? radius * Math.SQRT2 : size.y || radius,
        z: size.z || radius,
    };

    // Vértices de la arista ya escalados.
    const mesh2 = buildSolidMesh(subtype, nextSize);
    const a = mesh2.vertices[ia];
    const b = mesh2.vertices[ib];

    let from: Vec3;
    let to: Vec3;
    let localMid: Vec3;

    if (round) {
        // Diámetro. En la esfera es un diámetro cualquiera (pasa por el centro);
        // en cilindro y cono, un diámetro de la base.
        const sphere = subtype === 'sphere';
        const baseZ = sphere ? 0 : Math.min(...mesh2.vertices.map((v) => v.z));
        const center = { x: 0, y: 0, z: baseZ };
        const dir = { x: 1, y: 0, z: 0 };
        from = add(center, mul(dir, -radius));
        to = add(center, mul(dir, radius));
        localMid = center;
    } else {
        from = a;
        to = b;
        localMid = mul(add(a, b), 0.5);
    }

    const localDir = unit(sub(to, from));
    const targetDir = unit(sub(q, p));

    // R = marco(destino) · marco(origen)^T  →  R · localDir = targetDir
    const rotation = rotationFromMatrix(matMul(frame(targetDir), transpose(frame(localDir))));

    const rotatedMid = rotateStorePoint(localMid, rotation);
    const position = sub(mul(add(p, q), 0.5), rotatedMid);

    return { size: nextSize, position, rotation };
}
