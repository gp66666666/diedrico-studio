/**
 * Geometría única de los sólidos.
 *
 * 3D (Three.js) y 2D (diédrico) construyen la MISMA malla desde aquí.
 * Si cambias un vértice, cambia en las dos vistas a la vez: no puede
 * haber incoherencias entre lo que se ve en 3D y su proyección.
 *
 * Ejes del store: x = anchura (paralela a LT), y = alejamiento (profundidad),
 * z = cota (altura). En Three.js el eje vertical es Y, así que un punto
 * (x, y, z) del store se dibuja en Three como (x, z, y).
 */

export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export interface SolidMesh {
    /** Vértices en coordenadas locales (centro del sólido en el origen). */
    vertices: Vec3[];
    /** Caras como listas de índices ordenados alrededor de la cara. */
    faces: number[][];
}

/** Malla propia de un poliedro libre (vértices y caras ya calculados). */
export interface CustomMesh {
    vertices: Vec3[];
    faces: number[][];
}

const PHI = (1 + Math.sqrt(5)) / 2;

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const cross = (a: Vec3, b: Vec3): Vec3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});
const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;
const norm = (a: Vec3): number => Math.sqrt(dot(a, a));
const normalize = (a: Vec3): Vec3 => {
    const n = norm(a) || 1;
    return { x: a.x / n, y: a.y / n, z: a.z / n };
};

/** Escala un conjunto de vértices a radio (circunradio) dado. */
const scaleToRadius = (vertices: Vec3[], radius: number): Vec3[] =>
    vertices.map((v) => {
        const n = norm(v) || 1;
        return { x: (v.x / n) * radius, y: (v.y / n) * radius, z: (v.z / n) * radius };
    });

/**
 * Caras del casco convexo de un conjunto de vértices.
 * Sirve para todos los poliedros convexos (incluidos dodecaedro e icosaedro)
 * sin duplicar listas de caras a mano.
 */
function hullFaces(vertices: Vec3[]): number[][] {
    const n = vertices.length;
    const faces: number[][] = [];
    const seen = new Set<string>();
    let maxCoord = 1;
    vertices.forEach((v) => {
        maxCoord = Math.max(maxCoord, Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
    });
    const eps = 1e-6 * maxCoord;

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            for (let k = j + 1; k < n; k++) {
                const ab = sub(vertices[j], vertices[i]);
                const ac = sub(vertices[k], vertices[i]);
                const rawNormal = cross(ab, ac);
                if (norm(rawNormal) < eps) continue; // colineales
                const normal = normalize(rawNormal);
                const d = dot(normal, vertices[i]);

                let above = 0;
                let below = 0;
                const coplanar: number[] = [];
                for (let m = 0; m < n; m++) {
                    const t = dot(normal, vertices[m]) - d;
                    if (t > eps) above++;
                    else if (t < -eps) below++;
                    else coplanar.push(m);
                }
                if (above > 0 && below > 0) continue; // plano corta el sólido
                if (coplanar.length < 3) continue;

                const key = [...coplanar].sort((a, b) => a - b).join(',');
                if (seen.has(key)) continue;
                seen.add(key);

                // Ordenar los vértices de la cara alrededor de su centro
                const center = coplanar.reduce<Vec3>(
                    (acc, idx) => ({ x: acc.x + vertices[idx].x, y: acc.y + vertices[idx].y, z: acc.z + vertices[idx].z }),
                    { x: 0, y: 0, z: 0 }
                );
                center.x /= coplanar.length;
                center.y /= coplanar.length;
                center.z /= coplanar.length;

                const u = normalize(sub(vertices[coplanar[0]], center));
                const w = normalize(cross(normal, u));
                const ordered = [...coplanar].sort((p, q) => {
                    const pv = sub(vertices[p], center);
                    const qv = sub(vertices[q], center);
                    return Math.atan2(dot(pv, w), dot(pv, u)) - Math.atan2(dot(qv, w), dot(qv, u));
                });

                faces.push(ordered);
            }
        }
    }

    return faces;
}

/** Prisma regular de `sides` lados, radio r, altura h, centrado en z. */
function prismMesh(sides: number, r: number, h: number, phase = 0): SolidMesh {
    const vertices: Vec3[] = [];
    for (let i = 0; i < sides; i++) {
        const ang = phase + (i * 2 * Math.PI) / sides;
        vertices.push({ x: r * Math.cos(ang), y: r * Math.sin(ang), z: -h / 2 });
    }
    for (let i = 0; i < sides; i++) {
        const ang = phase + (i * 2 * Math.PI) / sides;
        vertices.push({ x: r * Math.cos(ang), y: r * Math.sin(ang), z: h / 2 });
    }
    const faces: number[][] = [];
    faces.push(Array.from({ length: sides }, (_, i) => sides - 1 - i)); // base
    faces.push(Array.from({ length: sides }, (_, i) => sides + i)); // tapa
    for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        faces.push([i, next, sides + next, sides + i]);
    }
    return { vertices, faces };
}

/** Pirámide regular de `sides` lados (base en -h/2, ápice en +h/2). */
function pyramidMesh(sides: number, r: number, h: number, phase = 0): SolidMesh {
    const vertices: Vec3[] = [];
    for (let i = 0; i < sides; i++) {
        const ang = phase + (i * 2 * Math.PI) / sides;
        vertices.push({ x: r * Math.cos(ang), y: r * Math.sin(ang), z: -h / 2 });
    }
    vertices.push({ x: 0, y: 0, z: h / 2 });
    const apex = sides;
    const faces: number[][] = [Array.from({ length: sides }, (_, i) => sides - 1 - i)];
    for (let i = 0; i < sides; i++) {
        faces.push([i, (i + 1) % sides, apex]);
    }
    return { vertices, faces };
}

/** Esfera teselada (paralelos/meridianos). */
function sphereMesh(r: number, segments = 36, rings = 18): SolidMesh {
    const vertices: Vec3[] = [];
    // Polos
    const north = vertices.push({ x: 0, y: 0, z: r }) - 1;
    const south = vertices.push({ x: 0, y: 0, z: -r }) - 1;

    const ringStart: number[] = [];
    for (let ring = 1; ring < rings; ring++) {
        const phi = (ring * Math.PI) / rings; // 0..PI
        const z = r * Math.cos(phi);
        const radius = r * Math.sin(phi);
        ringStart.push(vertices.length);
        for (let seg = 0; seg < segments; seg++) {
            const theta = (seg * 2 * Math.PI) / segments;
            vertices.push({ x: radius * Math.cos(theta), y: radius * Math.sin(theta), z });
        }
    }

    const faces: number[][] = [];
    // Casquetes
    for (let seg = 0; seg < segments; seg++) {
        const next = (seg + 1) % segments;
        faces.push([north, ringStart[0] + seg, ringStart[0] + next]);
        const lastRing = ringStart[ringStart.length - 1];
        faces.push([south, lastRing + next, lastRing + seg]);
    }
    // Bandas
    for (let ring = 0; ring < ringStart.length - 1; ring++) {
        const a = ringStart[ring];
        const b = ringStart[ring + 1];
        for (let seg = 0; seg < segments; seg++) {
            const next = (seg + 1) % segments;
            faces.push([a + seg, b + seg, b + next, a + next]);
        }
    }

    return { vertices, faces };
}

/**
 * Malla local del sólido.
 *
 * Los tamaños replican lo que ya hacía la app (y lo que guardan los proyectos):
 * size.x = radio / lado, size.y = altura.
 */
export function buildSolidMesh(
    subtype: string | undefined,
    size: { x: number; y: number; z: number },
    custom?: CustomMesh
): SolidMesh {
    if (subtype === 'polyhedron') {
        // Poliedro libre: los vértices son los que ha escrito el alumno. Se
        // copian para que nadie modifique la malla del elemento por accidente.
        if (!custom) return { vertices: [], faces: [] };
        return {
            vertices: custom.vertices.map((v) => ({ x: v.x, y: v.y, z: v.z })),
            faces: custom.faces.map((f) => [...f]),
        };
    }

    const r = Math.max(size.x, 0.01);
    const h = Math.max(size.y || size.x, 0.01);

    switch (subtype) {
        case 'tetrahedron': {
            // Pirámide de base triangular: radio r, altura h
            return pyramidMesh(3, r, h);
        }
        case 'cube': {
            // Lado = 1.5 * r (comportamiento histórico)
            const s = (r * 1.5) / 2;
            const vertices: Vec3[] = [
                { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s }, { x: s, y: s, z: -s }, { x: -s, y: s, z: -s },
                { x: -s, y: -s, z: s }, { x: s, y: -s, z: s }, { x: s, y: s, z: s }, { x: -s, y: s, z: s },
            ];
            return { vertices, faces: hullFaces(vertices) };
        }
        case 'octahedron': {
            const vertices: Vec3[] = [
                { x: r, y: 0, z: 0 }, { x: -r, y: 0, z: 0 },
                { x: 0, y: r, z: 0 }, { x: 0, y: -r, z: 0 },
                { x: 0, y: 0, z: r }, { x: 0, y: 0, z: -r },
            ];
            return { vertices, faces: hullFaces(vertices) };
        }
        case 'dodecahedron': {
            const inv = 1 / PHI;
            const raw: Vec3[] = [];
            [-1, 1].forEach((a) => [-1, 1].forEach((b) => [-1, 1].forEach((c) => {
                raw.push({ x: a, y: b, z: c });
            })));
            [-1, 1].forEach((a) => [-1, 1].forEach((b) => {
                raw.push({ x: 0, y: a * inv, z: b * PHI });
                raw.push({ x: a * inv, y: b * PHI, z: 0 });
                raw.push({ x: a * PHI, y: 0, z: b * inv });
            }));
            const vertices = scaleToRadius(raw, r);
            return { vertices, faces: hullFaces(vertices) };
        }
        case 'icosahedron': {
            const raw: Vec3[] = [];
            [-1, 1].forEach((a) => [-1, 1].forEach((b) => {
                raw.push({ x: 0, y: a, z: b * PHI });
                raw.push({ x: a, y: b * PHI, z: 0 });
                raw.push({ x: a * PHI, y: 0, z: b });
            }));
            const vertices = scaleToRadius(raw, r);
            return { vertices, faces: hullFaces(vertices) };
        }
        case 'prism':
            // Prisma hexagonal (como el cilindro de 6 caras de Three)
            return prismMesh(6, r, h);
        case 'pyramid':
            // Pirámide cuadrada, base con circunradio r y vértices en 0/90/180/270
            return pyramidMesh(4, r, h);
        case 'cylinder':
            return prismMesh(32, r, h);
        case 'cone': {
            const mesh = pyramidMesh(32, r, h);
            return mesh;
        }
        case 'sphere':
            return sphereMesh(r);
        default: {
            const s = (r * 1.5) / 2;
            const vertices: Vec3[] = [
                { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s }, { x: s, y: s, z: -s }, { x: -s, y: s, z: -s },
                { x: -s, y: -s, z: s }, { x: s, y: -s, z: s }, { x: s, y: s, z: s }, { x: -s, y: s, z: s },
            ];
            return { vertices, faces: hullFaces(vertices) };
        }
    }
}

/**
 * Malla local de un elemento sólido.
 *
 * Es el único punto que hay que usar en 3D, en 2D y en las herramientas: así el
 * poliedro libre (que trae sus propios vértices) se comporta igual que el resto
 * y no hay dos geometrías distintas para el mismo elemento.
 */
export function solidMesh(solid: {
    subtype?: string;
    size: { x: number; y: number; z: number };
    custom?: CustomMesh;
}): SolidMesh {
    return buildSolidMesh(solid.subtype, solid.size, solid.custom);
}

/**
 * Rotación del store (rx, ry, rz) con el MISMO orden que usa Three.js.
 *
 * En 3D el grupo se monta con `rotation={[rx, rz, ry]}` y orden Euler XYZ,
 * cuya matriz es Rx · Ry · Rz (en ejes de Three). Traducido a ejes del store
 * (Three Y = store z, Three Z = store y) queda: Rx · Rz · Ry.
 * Al aplicarla a un vector, primero se gira en Y, luego en Z y luego en X.
 */
export function rotateStorePoint(p: Vec3, rotation?: Vec3): Vec3 {
    if (!rotation) return { ...p };
    let { x, y, z } = p;

    // OJO: al pasar de ejes de Three a ejes del store se intercambian Y y Z,
    // y ese cambio de orientación invierte el sentido de los ángulos.
    // Por eso aquí se giran los ángulos en negativo (lo comprueba
    // solidGeometry.test.ts contra la matriz real de Three).

    // 1. Giro alrededor del alejamiento (Y del store)
    if (rotation.y) {
        const c = Math.cos(-rotation.y);
        const s = Math.sin(-rotation.y);
        const x1 = x * c + z * s;
        const z1 = -x * s + z * c;
        x = x1;
        z = z1;
    }
    // 2. Giro alrededor de la vertical (Z del store)
    if (rotation.z) {
        const c = Math.cos(-rotation.z);
        const s = Math.sin(-rotation.z);
        const x1 = x * c - y * s;
        const y1 = x * s + y * c;
        x = x1;
        y = y1;
    }
    // 3. Giro alrededor de la línea de tierra (X del store)
    if (rotation.x) {
        const c = Math.cos(-rotation.x);
        const s = Math.sin(-rotation.x);
        const y1 = y * c - z * s;
        const z1 = y * s + z * c;
        y = y1;
        z = z1;
    }

    return { x, y, z };
}

/** Vértice local → coordenadas del store (rotado y trasladado). */
export function transformVertex(vertex: Vec3, position: Vec3, rotation?: Vec3): Vec3 {
    const r = rotateStorePoint(vertex, rotation);
    return { x: position.x + r.x, y: position.y + r.y, z: position.z + r.z };
}

export interface SolidFaceInfo {
    indices: number[];
    normal: Vec3;
}

/**
 * Volumen de una malla cerrada con caras convexas y orientadas hacia fuera.
 *
 * Se usa para enseñar el volumen del poliedro libre en su panel: si el alumno
 * ha escrito bien los vértices, el número cuadra con lo que ve dibujado.
 */
export function meshVolume(mesh: SolidMesh): number {
    let total = 0;
    for (const face of mesh.faces) {
        const a = mesh.vertices[face[0]];
        if (!a) continue;
        for (let i = 1; i < face.length - 1; i++) {
            const b = mesh.vertices[face[i]];
            const c = mesh.vertices[face[i + 1]];
            if (!b || !c) continue;
            total +=
                (a.x * (b.y * c.z - b.z * c.y) -
                    a.y * (b.x * c.z - b.z * c.x) +
                    a.z * (b.x * c.y - b.y * c.x)) /
                6;
        }
    }
    return Math.abs(total);
}

/** Caras con normal orientada hacia fuera (centro del sólido en el origen). */
export function getFaceNormals(mesh: SolidMesh, rotation?: Vec3): SolidFaceInfo[] {
    return mesh.faces.map((indices) => {
        const p0 = rotateStorePoint(mesh.vertices[indices[0]], rotation);
        const p1 = rotateStorePoint(mesh.vertices[indices[1]], rotation);
        const p2 = rotateStorePoint(mesh.vertices[indices[2]], rotation);
        let normal = normalize(cross(sub(p1, p0), sub(p2, p0)));

        // Centro de la cara para orientar la normal hacia fuera
        const center = indices.reduce<Vec3>(
            (acc, idx) => {
                const v = rotateStorePoint(mesh.vertices[idx], rotation);
                return { x: acc.x + v.x, y: acc.y + v.y, z: acc.z + v.z };
            },
            { x: 0, y: 0, z: 0 }
        );
        center.x /= indices.length;
        center.y /= indices.length;
        center.z /= indices.length;

        if (dot(normal, center) < 0) normal = { x: -normal.x, y: -normal.y, z: -normal.z };
        return { indices, normal };
    });
}

export interface ProjectedEdge {    a: Vec3;
    b: Vec3;
    /** Arista oculta en la proyección horizontal (planta). */
    hiddenH: boolean;
    /** Arista oculta en la proyección vertical (alzado). */
    hiddenV: boolean;
}

const FEATURE_ANGLE = Math.cos((20 * Math.PI) / 180);

/**
 * Aristas que merece la pena dibujar en diédrico: contorno aparente,
 * aristas vivas (entre caras con ángulo > 20°) y aristas de borde.
 * Evita el wireframe ilegible de un cilindro o una esfera teselados.
 */
export function getProjectedEdges(mesh: SolidMesh, rotation?: Vec3): ProjectedEdge[] {
    const faces = getFaceNormals(mesh, rotation);
    const edges = new Map<string, { a: number; b: number; faces: number[] }>();

    faces.forEach((face, faceIndex) => {
        const idx = face.indices;
        for (let i = 0; i < idx.length; i++) {
            const a = idx[i];
            const b = idx[(i + 1) % idx.length];
            const key = a < b ? `${a}-${b}` : `${b}-${a}`;
            const existing = edges.get(key);
            if (existing) existing.faces.push(faceIndex);
            else edges.set(key, { a, b, faces: [faceIndex] });
        }
    });

    const result: ProjectedEdge[] = [];

    edges.forEach((edge) => {
        // El observador de la planta está arriba (mira en −z) y el del alzado
        // está delante (mira en −y): en los dos casos ve las caras cuya normal
        // apunta HACIA él, es decir, con componente positiva (+z y +y).
        // OJO: en el alzado estaba con el signo cambiado y se dibujaban ocultas
        // las aristas del vértice más cercano (el de mayor alejamiento) y
        // visibles las del más lejano. Solo se notaba en sólidos girados: en un
        // cubo recto las caras de delante y de atrás se superponen.
        const visibleH = edge.faces.map((fi) => faces[fi].normal.z > 1e-6);
        const visibleV = edge.faces.map((fi) => faces[fi].normal.y > 1e-6);

        let isFeature = edge.faces.length === 1; // borde libre
        if (!isFeature && edge.faces.length === 2) {
            const n1 = faces[edge.faces[0]].normal;
            const n2 = faces[edge.faces[1]].normal;
            isFeature = dot(n1, n2) < FEATURE_ANGLE;
        }

        const hiddenH = !visibleH.some(Boolean);
        const hiddenV = !visibleV.some(Boolean);
        const isSilhouetteH = visibleH.some(Boolean) && visibleH.some((v) => !v);
        const isSilhouetteV = visibleV.some(Boolean) && visibleV.some((v) => !v);

        if (!isFeature && !isSilhouetteH && !isSilhouetteV) return;

        result.push({
            a: rotateStorePoint(mesh.vertices[edge.a], rotation),
            b: rotateStorePoint(mesh.vertices[edge.b], rotation),
            hiddenH,
            hiddenV,
        });
    });

    return result;
}

/* ------------------------------------------------------------------ *
 * Matrices de rotación (misma convención que la vista 3D)
 * ------------------------------------------------------------------ */

/** Matriz 3x3 en orden por filas. */
export type Mat3 = [number, number, number, number, number, number, number, number, number];

/** Matriz de una rotación del store: Rx(rx) · Rz(rz) · Ry(ry). */
export function storeEulerToMatrix(rot: Vec3): Mat3 {
    // M = Rx(-rx) · Rz(-rz) · Ry(-ry), igual que rotateStorePoint
    const ca = Math.cos(-rot.x), sa = Math.sin(-rot.x);
    const cb = Math.cos(-rot.z), sb = Math.sin(-rot.z);
    const cc = Math.cos(-rot.y), sc = Math.sin(-rot.y);

    return [
        cb * cc, -sb, cb * sc,
        ca * sb * cc + sa * sc, ca * cb, ca * sb * sc - sa * cc,
        sa * sb * cc - ca * sc, sa * cb, sa * sb * sc + ca * cc,
    ];
}

/** Inversa de `storeEulerToMatrix`. */
export function matrixToStoreEuler(m: Mat3): Vec3 {
    const sb = Math.max(-1, Math.min(1, -m[1]));
    const b = Math.asin(sb);
    const cb = Math.cos(b);

    if (Math.abs(cb) > 1e-6) {
        return {
            x: -Math.atan2(m[7], m[4]),
            y: -Math.atan2(m[2], m[0]),
            z: -b,
        };
    }

    // Caso singular (giro de 90°): se fija rx = 0
    const c = sb > 0 ? Math.atan2(m[5], m[3]) : Math.atan2(-m[5], -m[3]);
    return { x: 0, y: -c, z: -b };
}

export function multiplyMat3(a: Mat3, b: Mat3): Mat3 {
    const out: number[] = new Array(9).fill(0);
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            out[row * 3 + col] =
                a[row * 3] * b[col] +
                a[row * 3 + 1] * b[3 + col] +
                a[row * 3 + 2] * b[6 + col];
        }
    }
    return out as Mat3;
}

/** Matriz de giro de `angle` radianes alrededor del vector unitario `u` (Rodrigues). */
export function axisAngleToMatrix(u: Vec3, angle: number): Mat3 {
    const { x, y, z } = normalize(u);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;

    return [
        t * x * x + c, t * x * y - s * z, t * x * z + s * y,
        t * x * y + s * z, t * y * y + c, t * y * z - s * x,
        t * x * z - s * y, t * y * z + s * x, t * z * z + c,
    ];
}

/** Aplica una matriz a un vector. */
export function applyMat3(m: Mat3, v: Vec3): Vec3 {
    return {
        x: m[0] * v.x + m[1] * v.y + m[2] * v.z,
        y: m[3] * v.x + m[4] * v.y + m[5] * v.z,
        z: m[6] * v.x + m[7] * v.y + m[8] * v.z,
    };
}

/**
 * Coordenadas locales de un vector del store (inversa de `rotateStorePoint`).
 *
 * La matriz de giro es ortogonal, así que la inversa es su traspuesta: se
 * proyecta sobre las columnas (los ejes girados).
 */
export function inverseRotateStorePoint(v: Vec3, rotation?: Vec3): Vec3 {
    if (!rotation) return { ...v };
    const ex = rotateStorePoint({ x: 1, y: 0, z: 0 }, rotation);
    const ey = rotateStorePoint({ x: 0, y: 1, z: 0 }, rotation);
    const ez = rotateStorePoint({ x: 0, y: 0, z: 1 }, rotation);
    return {
        x: v.x * ex.x + v.y * ex.y + v.z * ex.z,
        y: v.x * ey.x + v.y * ey.y + v.z * ey.z,
        z: v.x * ez.x + v.y * ez.y + v.z * ez.z,
    };
}
