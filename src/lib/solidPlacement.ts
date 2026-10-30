import { buildSolidMesh, rotateStorePoint, type CustomMesh, type Vec3 } from './solidGeometry';
import { rotationFromMatrix } from './solidFromEdge';
import type { PlaneElement, SolidElement } from '../types';

/**
 * Colocación de sólidos sobre el plano horizontal.
 *
 * En el store el centro del sólido es `position` y la malla está centrada en el
 * origen, así que un cubo de arista 7,5 tiene la cara inferior en z = -3,75.
 * Para que «apoye en el PH» hay que subir el centro justo eso: si no, medio
 * sólido queda por debajo del papel, que es el error clásico al colocarlo a
 * mano.
 *
 * La cuenta se hace con los vértices reales y la rotación real, no con la
 * altura nominal: un cubo girado 45° apoya sobre una arista y su centro sube
 * más (media diagonal), no la mitad del lado.
 */

/** Cota del vértice más bajo de la malla, con el centro en el origen. */
export function lowestLocalZ(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation?: Vec3,
    custom?: CustomMesh
): number {
    const mesh = buildSolidMesh(subtype, size, custom);
    let min = Infinity;
    for (const vertex of mesh.vertices) {
        const p = rotateStorePoint(vertex, rotation);
        if (p.z < min) min = p.z;
    }
    return Number.isFinite(min) ? min : 0;
}

/** Alejamiento del vértice más cercano al plano vertical, con el centro en el origen. */
export function lowestLocalY(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation?: Vec3,
    custom?: CustomMesh
): number {
    const mesh = buildSolidMesh(subtype, size, custom);
    let min = Infinity;
    for (const vertex of mesh.vertices) {
        const p = rotateStorePoint(vertex, rotation);
        if (p.y < min) min = p.y;
    }
    return Number.isFinite(min) ? min : 0;
}

/** Alejamiento del centro para que el sólido toque el plano vertical (y = 0). */
export function restingCenterY(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation?: Vec3,
    custom?: CustomMesh
): number {
    return -lowestLocalY(subtype, size, rotation, custom);
}

/** Cota que debe tener el centro para que el punto más bajo quede en z = 0. */
export function restingCenterZ(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation?: Vec3,
    custom?: CustomMesh
): number {
    return -lowestLocalZ(subtype, size, rotation, custom);
}

/**
 * Apoyar en el plano vertical: la parte de atrás toca el PV (y = 0) y el
 * sólido queda por delante, en el primer cuadrante. Solo cambia el alejamiento.
 */
export function restOnVerticalPlane(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation: Vec3 | undefined,
    position: Vec3,
    custom?: CustomMesh
): Vec3 {
    return { ...position, y: restingCenterY(subtype, size, rotation, custom) };
}

/** Devuelve la posición con la cota corregida para apoyar en el PH. */
export function restOnHorizontalPlane(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation: Vec3 | undefined,
    position: Vec3,
    custom?: CustomMesh
): Vec3 {
    return { ...position, z: restingCenterZ(subtype, size, rotation, custom) };
}

/* ------------------------------------------------------------------ */
/* Apoyo sobre un plano cualquiera (cara, arista o vértice)            */
/* ------------------------------------------------------------------ */

export type RestMode = 'face' | 'edge' | 'vertex';

const vadd = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const vsub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const vmul = (a: Vec3, k: number): Vec3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const vdot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const vcross = (a: Vec3, b: Vec3): Vec3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});
const vnorm = (a: Vec3) => Math.sqrt(vdot(a, a));
const vunit = (a: Vec3): Vec3 => {
    const n = vnorm(a) || 1;
    return { x: a.x / n, y: a.y / n, z: a.z / n };
};

type Mat3 = [number, number, number, number, number, number, number, number, number];

const matMul = (a: Mat3, b: Mat3): Mat3 => {
    const out = Array(9).fill(0) as Mat3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let acc = 0;
            for (let k = 0; k < 3; k++) acc += a[i * 3 + k] * b[k * 3 + j];
            out[i * 3 + j] = acc;
        }
    }
    return out;
};

const matVec = (m: Mat3, v: Vec3): Vec3 => ({
    x: m[0] * v.x + m[1] * v.y + m[2] * v.z,
    y: m[3] * v.x + m[4] * v.y + m[5] * v.z,
    z: m[6] * v.x + m[7] * v.y + m[8] * v.z,
});

/** Matriz de la rotación del store (columnas = imágenes de los ejes). */
const matrixOf = (rotation?: Vec3): Mat3 => {
    const ex = rotateStorePoint({ x: 1, y: 0, z: 0 }, rotation);
    const ey = rotateStorePoint({ x: 0, y: 1, z: 0 }, rotation);
    const ez = rotateStorePoint({ x: 0, y: 0, z: 1 }, rotation);
    return [ex.x, ey.x, ez.x, ex.y, ey.y, ez.y, ex.z, ey.z, ez.z];
};

/** Giro de `angle` radianes alrededor de un eje unitario (Rodrigues). */
const rotationAxis = (axis: Vec3, angle: number): Mat3 => {
    const { x, y, z } = vunit(axis);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    return [
        t * x * x + c, t * x * y - s * z, t * x * z + s * y,
        t * x * y + s * z, t * y * y + c, t * y * z - s * x,
        t * x * z - s * y, t * y * z + s * x, t * z * z + c,
    ];
};

/** Giro mínimo que lleva el vector `a` al vector `b`. */
const rotationBetween = (a: Vec3, b: Vec3): Mat3 => {
    const ua = vunit(a);
    const ub = vunit(b);
    const c = vdot(ua, ub);
    const v = vcross(ua, ub);
    const s = vnorm(v);
    if (s < 1e-9) {
        if (c > 0) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
        // 180°: cualquier eje perpendicular
        const alt = Math.abs(ua.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
        return rotationAxis(vcross(ua, alt), Math.PI);
    }
    return rotationAxis(v, Math.atan2(s, c));
};

interface FaceInfo {
    indices: number[];
    normal: Vec3; // local, orientada hacia fuera
}

/** Caras con la normal orientada hacia fuera (desde el centroide). */
function orientedFaces(mesh: { vertices: Vec3[]; faces: number[][] }): FaceInfo[] {
    const vertices = mesh.vertices;
    if (!vertices.length) return [];
    const centroid = vertices.reduce((acc, v) => vadd(acc, v), { x: 0, y: 0, z: 0 });
    const center = vmul(centroid, 1 / vertices.length);

    const out: FaceInfo[] = [];
    for (const face of mesh.faces) {
        if (face.length < 3) continue;
        const v0 = vertices[face[0]];
        const v1 = vertices[face[1]];
        const v2 = vertices[face[2]];
        const raw = vcross(vsub(v1, v0), vsub(v2, v0));
        if (vnorm(raw) < 1e-12) continue;
        let normal = vunit(raw);
        const faceCenter = vmul(
            face.reduce((acc, i) => vadd(acc, vertices[i]), { x: 0, y: 0, z: 0 }),
            1 / face.length
        );
        if (vdot(normal, vsub(faceCenter, center)) < 0) normal = vmul(normal, -1);
        out.push({ indices: [...face], normal });
    }
    return out;
}

export interface RestResult {
    position: Vec3;
    rotation: Vec3;
}

/**
 * Apoya un sólido sobre un plano.
 *
 * - `face`: la cara que mira hacia abajo queda contenida en el plano.
 * - `edge`: además, una arista de esa cara se coloca sobre la traza horizontal
 *   α₁ (los dos vértices que «se apoyan en el papel»). Necesita que el plano no
 *   sea horizontal, porque entonces no hay α₁.
 * - `vertex`: el vértice más bajo toca el plano, sin girar el sólido.
 *
 * Funciona con cualquier sólido de la app y con planos horizontales, verticales
 * u oblicuos. La rotación es la mínima que hace falta: no se «endereza» el
 * sólido más de lo necesario.
 */
export function restSolidOnPlane(
    solid: SolidElement,
    plane: PlaneElement,
    mode: RestMode = 'face'
): RestResult | null {
    const nLen = vnorm(plane.normal);
    if (nLen < 1e-9) return null;

    let n: Vec3 = vmul(plane.normal, 1 / nLen);
    let c = plane.constant / nLen;
    if (n.z < 0) {
        n = vmul(n, -1);
        c = -c;
    }

    const mesh = buildSolidMesh(solid.subtype, solid.size, solid.custom);
    if (!mesh.vertices.length) return null;

    const R0 = matrixOf(solid.rotation);
    const basePosition = solid.position;

    const worldOf = (m: Mat3) => mesh.vertices.map((v) => vadd(basePosition, matVec(m, v)));

    // --- vértice: solo traslación ---
    if (mode === 'vertex' || mesh.faces.length === 0) {
        const verts = worldOf(R0);
        let min = Infinity;
        for (const v of verts) min = Math.min(min, vdot(n, v) + c);
        const position = vadd(basePosition, vmul(n, -min));
        return { position, rotation: solid.rotation ?? { x: 0, y: 0, z: 0 } };
    }

    // --- cara de apoyo: la que más mira hacia abajo ---
    const faces = orientedFaces(mesh);
    if (!faces.length) {
        const verts = worldOf(R0);
        let min = Infinity;
        for (const v of verts) min = Math.min(min, vdot(n, v) + c);
        return { position: vadd(basePosition, vmul(n, -min)), rotation: solid.rotation ?? { x: 0, y: 0, z: 0 } };
    }

    let support = faces[0];
    let best = -Infinity;
    for (const face of faces) {
        const normalWorld = matVec(R0, face.normal);
        const score = -vdot(normalWorld, n); // 1 = mira justo hacia abajo
        if (score > best) {
            best = score;
            support = face;
        }
    }

    // --- giro mínimo para dejar esa cara paralela al plano ---
    const normalWorld = matVec(R0, support.normal);
    const align = rotationBetween(normalWorld, vmul(n, -1));
    let R = matMul(align, R0);

    // --- arista sobre α₁ ---
    if (mode === 'edge') {
        const vertical: Vec3 = { x: 0, y: 0, z: 1 };
        const d0 = vcross(n, vertical);
        if (vnorm(d0) < 1e-6) return null; // plano horizontal: no hay α₁
        const d = vunit(d0);
        let u = vunit(vcross(n, d));
        if (u.z < 0) u = vmul(u, -1);

        // z del vértice más bajo para un giro dado (fila z de la matriz).
        const minZOf = (m: Mat3) => {
            let min = Infinity;
            for (const v of mesh.vertices) {
                const z = m[6] * v.x + m[7] * v.y + m[8] * v.z;
                if (z < min) min = z;
            }
            return min;
        };

        // No siempre vale la cara que más mira hacia abajo: en cuerpos
        // «redondos» (icosaedro, esfera) esa cara deja el resto del cuerpo por
        // debajo del PH. Se prueban todas las caras, sus aristas y los dos
        // sentidos de giro, y se prefiere la colocación que deja TODO el
        // sólido por encima del papel. Si no existe ninguna, no se apoya: es
        // preferible avisar a dibujar un cuerpo atravesando el suelo.
        const order = faces
            .map((face) => ({ face, score: -vdot(matVec(R0, face.normal), n) }))
            .filter((f) => f.score > 0) // las que miran hacia arriba no apoyan
            .sort((a, b) => b.score - a.score);

        for (const { face } of order) {
            const align = rotationBetween(matVec(R0, face.normal), vmul(n, -1));
            const Ra = matMul(align, R0);

            let localBest: { position: Vec3; rotation: Vec3; cost: number } | null = null;

            for (let e = 0; e < face.indices.length; e++) {
                const ia = face.indices[e];
                const ib = face.indices[(e + 1) % face.indices.length];
                const pa = matVec(Ra, mesh.vertices[ia]);
                const pb = matVec(Ra, mesh.vertices[ib]);
                const dir0 = vunit(vsub(pb, pa));
                const angle = Math.atan2(vdot(vcross(dir0, d), n), vdot(dir0, d));

                for (const turn of [angle, angle + Math.PI]) {
                    const R2 = matMul(rotationAxis(n, turn), Ra);
                    const qa = matVec(R2, mesh.vertices[ia]);
                    const qb = matVec(R2, mesh.vertices[ib]);
                    const mid = vadd(basePosition, vmul(vadd(qa, qb), 0.5));

                    // Trasladar para que esa arista caiga en α₁ (z = 0 y en el plano).
                    const onPlane = vadd(mid, vmul(n, -(vdot(n, mid) + c)));
                    const drop = Math.abs(u.z) > 1e-9 ? onPlane.z / u.z : 0;
                    const shift = vsub(vadd(onPlane, vmul(u, -drop)), mid);

                    const minZ = minZOf(R2) + basePosition.z + shift.z;
                    if (minZ < -1e-6) continue; // se hundiría en el PH

                    const cost = Math.abs(Math.atan2(Math.sin(turn), Math.cos(turn)));
                    if (!localBest || cost < localBest.cost) {
                        localBest = { position: vadd(basePosition, shift), rotation: rotationFromMatrix(R2), cost };
                    }
                }
            }

            // Primera cara (la que más mira abajo) que admite una colocación
            // válida: no hace falta seguir probando caras peores.
            if (localBest) return { position: localBest.position, rotation: localBest.rotation };
        }

        return null;
    }

    // --- cara: trasladar para que el punto más bajo toque el plano ---
    let min = Infinity;
    for (const v of worldOf(R)) min = Math.min(min, vdot(n, v) + c);
    return {
        position: vadd(basePosition, vmul(n, -min)),
        rotation: rotationFromMatrix(R),
    };
}


/**
 * Apoya una arista del sólido sobre una recta.
 *
 * El plano de apoyo es el que contiene a la recta y es lo más horizontal
 * posible: si la recta es horizontal, la cara inferior queda horizontal (el
 * sólido «descansa» sobre la recta); si es oblicua, la cara queda en el plano
 * más próximo al horizontal que contiene a la recta.
 *
 * Devuelve null si la recta es vertical (cualquier plano vertical la contiene y
 * el apoyo no estaría determinado).
 */
export function restSolidOnLine(
    solid: SolidElement,
    line: { point: Vec3; direction: Vec3 }
): RestResult | null {
    const dir = vunit(line.direction);
    if (vnorm(dir) < 1e-9) return null;

    const zAxis: Vec3 = { x: 0, y: 0, z: 1 };
    const nRaw = vsub(zAxis, vmul(dir, vdot(zAxis, dir)));
    if (vnorm(nRaw) < 1e-6) return null; // recta vertical
    const n = vunit(nRaw);

    const mesh = buildSolidMesh(solid.subtype, solid.size, solid.custom);
    if (!mesh.vertices.length) return null;

    const R0 = matrixOf(solid.rotation);
    const basePosition = solid.position;
    const worldOf = (m: Mat3) => mesh.vertices.map((v) => vadd(basePosition, matVec(m, v)));

    const faces = orientedFaces(mesh);
    if (!faces.length) return null;

    let support = faces[0];
    let best = -Infinity;
    for (const face of faces) {
        const score = -vdot(matVec(R0, face.normal), n);
        if (score > best) {
            best = score;
            support = face;
        }
    }

    // 1) Cara paralela al plano de apoyo.
    let R = matMul(rotationBetween(matVec(R0, support.normal), vmul(n, -1)), R0);

    // 2) Giro alrededor de n para que una arista quede paralela a la recta.
    const verts0 = worldOf(R);
    const [ia0, ib0] = [support.indices[0], support.indices[1]];
    const e0 = vunit(vsub(verts0[ib0], verts0[ia0]));
    const angle = Math.atan2(vdot(vcross(e0, dir), n), vdot(e0, dir));
    R = matMul(rotationAxis(n, angle), R);

    // 3) De las aristas ya paralelas, la más cercana a la recta.
    const verts = worldOf(R);
    let bestEdge: [number, number] | null = null;
    let bestDist = Infinity;
    for (let i = 0; i < support.indices.length; i++) {
        const a = support.indices[i];
        const b = support.indices[(i + 1) % support.indices.length];
        if (Math.abs(vdot(vunit(vsub(verts[b], verts[a])), dir)) < 0.999) continue;
        const mid = vmul(vadd(verts[a], verts[b]), 0.5);
        const t = vdot(vsub(mid, line.point), dir);
        const q = vadd(line.point, vmul(dir, t));
        const dist = vnorm(vsub(mid, q));
        if (dist < bestDist) {
            bestDist = dist;
            bestEdge = [a, b];
        }
    }
    if (!bestEdge) return null;

    // 4) Trasladar para que el punto medio de la arista caiga en la recta.
    const [ia, ib] = bestEdge;
    const mid = vmul(vadd(verts[ia], verts[ib]), 0.5);
    const t = vdot(vsub(mid, line.point), dir);
    const target = vadd(line.point, vmul(dir, t));

    return {
        position: vadd(basePosition, vsub(target, mid)),
        rotation: rotationFromMatrix(R),
    };
}
