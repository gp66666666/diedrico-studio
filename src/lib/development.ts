/**
 * Desarrollos (redes) de los sólidos.
 *
 * Cada sólido se despliega en el plano con sus dimensiones reales: las caras
 * laterales seguidas y las bases donde corresponda. Las medidas salen de la
 * misma `size` con la que se construye la malla (lib/solidGeometry), así que
 * el desarrollo coincide con el sólido que se dibuja.
 *
 * Todas las piezas van en unidades del sólido; el panel las escala.
 */

import { unfoldPolyhedron } from './unfold';

export interface DevPoint {
    x: number;
    y: number;
}

export interface DevPiece {
    kind: 'lateral' | 'base' | 'section';
    points: DevPoint[];
    label?: string;
}

export interface Development {
    pieces: DevPiece[];
    area: number;
    notes: string[];
}

const regularPolygon = (sides: number, radius: number, center: DevPoint, rotation = 0): DevPoint[] =>
    Array.from({ length: sides }, (_, i) => {
        const a = rotation + (i * 2 * Math.PI) / sides;
        return { x: center.x + radius * Math.cos(a), y: center.y + radius * Math.sin(a) };
    });

const polygonArea = (points: DevPoint[]) => {
    let s = 0;
    for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        s += a.x * b.y - b.x * a.y;
    }
    return Math.abs(s) / 2;
};

const circle = (radius: number, center: DevPoint, segments = 48): DevPoint[] =>
    Array.from({ length: segments }, (_, i) => {
        const a = (i * 2 * Math.PI) / segments;
        return { x: center.x + radius * Math.cos(a), y: center.y + radius * Math.sin(a) };
    });

const sumArea = (pieces: DevPiece[]) => pieces.reduce((acc, p) => acc + polygonArea(p.points), 0);

/** Prisma recto (cubo, prisma hexagonal) o cilindro: tira lateral + dos bases. */
function prismDevelopment(sides: number, radius: number, height: number, exact: boolean): Development {
    const edge = 2 * radius * Math.sin(Math.PI / sides);
    const apothem = radius * Math.cos(Math.PI / sides);
    // El cilindro se desarrolla como rectángulo exacto (2πr), no como polígono
    const width = exact ? 2 * Math.PI * radius : sides * edge;

    const pieces: DevPiece[] = [
        {
            kind: 'lateral',
            points: [
                { x: 0, y: 0 },
                { x: width, y: 0 },
                { x: width, y: height },
                { x: 0, y: height },
            ],
            label: 'lateral',
        },
    ];

    if (exact) {
        pieces.push({ kind: 'base', points: circle(radius, { x: radius, y: -radius - 0.4 }), label: 'base' });
        pieces.push({ kind: 'base', points: circle(radius, { x: width - radius, y: height + radius + 0.4 }), label: 'tapa' });
    } else {
        pieces.push({
            kind: 'base',
            points: regularPolygon(sides, radius, { x: edge / 2, y: -apothem }),
            label: 'base',
        });
        pieces.push({
            kind: 'base',
            points: regularPolygon(sides, radius, { x: edge / 2, y: height + apothem }),
            label: 'tapa',
        });
    }

    return {
        pieces,
        area: sumArea(pieces),
        notes: [
            `lado de la base: ${edge.toFixed(2)} u`,
            `altura: ${height.toFixed(2)} u`,
            exact ? `lateral desplegado: ${width.toFixed(2)} u (2πr)` : `perímetro de la base: ${width.toFixed(2)} u`,
        ],
    };
}

/** Pirámide regular: base central y una cara por lado, abatidas hacia fuera. */
function pyramidDevelopment(sides: number, radius: number, height: number): Development {
    const edge = 2 * radius * Math.sin(Math.PI / sides);
    const apothem = radius * Math.cos(Math.PI / sides);
    const slant = Math.sqrt(height * height + apothem * apothem);

    const base = regularPolygon(sides, radius, { x: 0, y: 0 });
    const pieces: DevPiece[] = [{ kind: 'base', points: base, label: 'base' }];

    for (let i = 0; i < sides; i++) {
        const p = base[i];
        const q = base[(i + 1) % sides];
        const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
        // Normal exterior de la arista
        const nx = q.y - p.y;
        const ny = -(q.x - p.x);
        const len = Math.hypot(nx, ny) || 1;
        const apex = { x: mid.x + (nx / len) * slant, y: mid.y + (ny / len) * slant };

        pieces.push({ kind: 'lateral', points: [p, q, apex], label: 'cara' });
    }

    return {
        pieces,
        area: sumArea(pieces),
        notes: [
            `lado de la base: ${edge.toFixed(2)} u`,
            `altura: ${height.toFixed(2)} u`,
            `altura de las caras: ${slant.toFixed(2)} u`,
        ],
    };
}

/** Cono recto: sector circular de radio la generatriz + base. */
function coneDevelopment(radius: number, height: number): Development {
    const g = Math.hypot(radius, height);
    const angle = (2 * Math.PI * radius) / g;
    const segments = 64;
    const start = Math.PI / 2 - angle / 2;

    const sector: DevPoint[] = [{ x: 0, y: 0 }];
    for (let i = 0; i <= segments; i++) {
        const a = start + (angle * i) / segments;
        sector.push({ x: g * Math.cos(a), y: g * Math.sin(a) });
    }

    const pieces: DevPiece[] = [
        { kind: 'lateral', points: sector, label: 'lateral' },
        { kind: 'base', points: circle(radius, { x: 0, y: -radius - 0.5 }), label: 'base' },
    ];

    return {
        pieces,
        area: sumArea(pieces),
        notes: [
            `radio de la base: ${radius.toFixed(2)} u`,
            `generatriz: ${g.toFixed(2)} u`,
            `ángulo del sector: ${((angle * 180) / Math.PI).toFixed(1)}°`,
        ],
    };
}

/**
 * Desarrollo del sólido completo.
 *
 * Devuelve `null` para la esfera (no es desarrollable) y para octaedro,
 * dodecaedro e icosaedro (redes no contempladas).
 */
export function buildDevelopment(
    subtype: string | undefined,
    size: { x: number; y: number; z: number },
    custom?: CustomMesh
): Development | null {
    const r = Math.max(size.x, 0.01);
    const h = Math.max(size.y || size.x, 0.01);

    switch (subtype) {
        case 'cube': {
            const side = r * 1.5;
            return prismDevelopment(4, side / Math.SQRT2, side, false);
        }
        case 'prism':
            return prismDevelopment(6, r, h, false);
        case 'cylinder':
            return prismDevelopment(32, r, h, true);
        case 'pyramid':
            return pyramidDevelopment(4, r, h);
        case 'tetrahedron':
            return pyramidDevelopment(3, r, h);
        case 'cone':
            return coneDevelopment(r, h);
        case 'octahedron':
        case 'dodecahedron':
        case 'icosahedron':
        case 'polyhedron':
            // Se despliegan abatiendo la malla cara a cara (lib/unfold)
            return unfoldPolyhedron(subtype, size, custom);
        default:
            return null;
    }
}

export function developmentBounds(pieces: DevPiece[]) {
    const xs = pieces.flatMap((p) => p.points.map((q) => q.x));
    const ys = pieces.flatMap((p) => p.points.map((q) => q.y));
    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
    };
}

/* ------------------------------------------------------------------ *
 * Desarrollo del cuerpo truncado (prisma recto / cilindro)
 * ------------------------------------------------------------------ */

import { buildSolidMesh, transformVertex, type CustomMesh } from './solidGeometry';
import { sectionPolygons, trueShape } from './section';
import type { Vector3 } from '../types';

/**
 * Desarrollo del cuerpo que queda al cortar un prisma recto (cubo, prisma
 * hexagonal o cilindro) con un plano.
 *
 * Las caras laterales son verticales: cada una se despliega como un
 * rectángulo cuya altura es la que deja el plano en esa arista. Se añaden la
 * base inferior y la tapa (la sección en verdadera magnitud).
 *
 * Devuelve `null` si el sólido no es un prisma recto o si el plano no corta
 * todas las aristas laterales (en ese caso el cuerpo no queda truncado).
 */
export function buildTruncatedDevelopment(
    subtype: string | undefined,
    size: { x: number; y: number; z: number },
    position: Vector3,
    rotation: Vector3 | undefined,
    normal: Vector3,
    constant: number,
    custom?: CustomMesh
): Development | null {
    if (!subtype) return null;
    if (['pyramid', 'tetrahedron', 'cone'].includes(subtype)) {
        return buildTruncatedPyramidDevelopment(subtype, size, position, rotation, normal, constant);
    }
    if (!['cube', 'prism', 'cylinder'].includes(subtype)) return null;

    const r = Math.max(size.x, 0.01);
    const h = Math.max(size.y || size.x, 0.01);

    let sides: number;
    let radius: number;
    let height: number;
    let rotation0: number;

    if (subtype === 'cube') {
        const s = r * 1.5;
        sides = 4;
        radius = s / Math.SQRT2;
        height = s;
        rotation0 = Math.PI / 4;
    } else if (subtype === 'prism') {
        sides = 6;
        radius = r;
        height = h;
        rotation0 = 0;
    } else {
        sides = 32;
        radius = r;
        height = h;
        rotation0 = 0;
    }

    const ring = Array.from({ length: sides }, (_, i) => {
        const a = rotation0 + (i * 2 * Math.PI) / sides;
        return { x: radius * Math.cos(a), y: radius * Math.sin(a) };
    });

    const bottom = ring.map((p) => transformVertex({ x: p.x, y: p.y, z: -height / 2 }, position, rotation));
    const top = ring.map((p) => transformVertex({ x: p.x, y: p.y, z: height / 2 }, position, rotation));

    const len = Math.hypot(normal.x, normal.y, normal.z);
    if (len < 1e-9) return null;
    const n = { x: normal.x / len, y: normal.y / len, z: normal.z / len };
    const d = constant / len;
    const dist = (p: Vector3) => n.x * p.x + n.y * p.y + n.z * p.z + d;

    const heights: number[] = [];
    for (let i = 0; i < sides; i++) {
        const da = dist(bottom[i]);
        const db = dist(top[i]);
        if (Math.abs(db - da) < 1e-9) return null;
        const t = -da / (db - da);
        // El plano tiene que cortar la arista, no pasar por encima ni por debajo
        if (t <= 1e-4 || t >= 1 - 1e-4) return null;
        heights.push(t * height);
    }

    // Comprobación: todas las alturas tienen que ser positivas
    if (heights.some((x) => !Number.isFinite(x) || x <= 0)) return null;

    const edge = 2 * radius * Math.sin(Math.PI / sides);
    const apothem = radius * Math.cos(Math.PI / sides);
    const x = (i: number) => i * edge;

    const pieces: DevPiece[] = [];

    for (let i = 0; i < sides; i++) {
        const j = (i + 1) % sides;
        pieces.push({
            kind: 'lateral',
            points: [
                { x: x(i), y: 0 },
                { x: x(i + 1), y: 0 },
                { x: x(i + 1), y: heights[j] },
                { x: x(i), y: heights[i] },
            ],
        });
    }

    // Base inferior, colgando del primer rectángulo
    pieces.push({
        kind: 'base',
        points: regularPolygon(sides, radius, { x: edge / 2, y: -apothem }, rotation0),
        label: 'base',
    });

    // Tapa: la sección en verdadera magnitud, colocada a la derecha
    const mesh = buildSolidMesh(subtype, size, custom);
    const loops = sectionPolygons(mesh, position, rotation, normal, constant);
    const shape = loops.length ? trueShape(loops[0], n) : null;

    if (shape && shape.points.length >= 3) {
        const xs = shape.points.map((p) => p.x);
        const ys = shape.points.map((p) => p.y);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
        const gap = 1.2;
        const offsetX = sides * edge + gap + (Math.max(...xs) - Math.min(...xs)) / 2;

        pieces.push({
            kind: 'section',
            points: shape.points.map((p) => ({ x: p.x - cx + offsetX, y: p.y - cy + height / 2 })),
            label: 'sección',
        });
    }

    const full = sumArea(pieces);

    return {
        pieces,
        area: full,
        notes: [
            `lado de la base: ${edge.toFixed(2)} u`,
            `altura del cuerpo (máxima): ${Math.max(...heights).toFixed(2)} u`,
            shape ? `sección (tapa): ${shape.area.toFixed(2)} u²` : 'la sección no se ha podido cerrar',
        ],
    };
}

/**
 * SVG de la red, escalado a un lienzo de `width` × `height`.
 * Se usa tanto en el panel de desarrollo como en el de la sección.
 */
export function developmentSvg(dev: Development, width = 300, height = 260, pad = 6): string {
    const b = developmentBounds(dev.pieces);
    const w = Math.max(b.maxX - b.minX, 1e-6);
    const h = Math.max(b.maxY - b.minY, 1e-6);
    const k = Math.min((width - 2 * pad) / w, (height - 2 * pad) / h);
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;

    const body = dev.pieces
        .map((piece) => {
            const points = piece.points
                .map((q) => `${(width / 2 + (q.x - cx) * k).toFixed(2)},${(height / 2 - (q.y - cy) * k).toFixed(2)}`)
                .join(' ');
            const fill = piece.kind === 'base' ? '#10b981' : piece.kind === 'section' ? '#f59e0b' : '#3b82f6';
            return `<polygon points="${points}" fill="${fill}" fill-opacity="0.22" stroke="${fill}" stroke-width="1.4" stroke-linejoin="round" />`;
        })
        .join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

/* ------------------------------------------------------------------ *
 * Desarrollo del cuerpo truncado (pirámide / cono)
 * ------------------------------------------------------------------ */

const dot3 = (a: Vector3, b: Vector3) => a.x * b.x + a.y * b.y + a.z * b.z;

/** Baricéntricas de p respecto al triángulo (a, b, c) — p está en su plano. */
function barycentric(p: Vector3, a: Vector3, b: Vector3, c: Vector3) {
    const v0 = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    const v1 = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };
    const v2 = { x: p.x - a.x, y: p.y - a.y, z: p.z - a.z };

    const d00 = dot3(v0, v0);
    const d01 = dot3(v0, v1);
    const d11 = dot3(v1, v1);
    const d20 = dot3(v2, v0);
    const d21 = dot3(v2, v1);
    const den = d00 * d11 - d01 * d01 || 1e-12;

    const beta = (d11 * d20 - d01 * d21) / den;
    const gamma = (d00 * d21 - d01 * d20) / den;
    return { alpha: 1 - beta - gamma, beta, gamma };
}

/**
 * Desarrollo del cuerpo que queda al cortar una pirámide regular (o un cono)
 * con un plano que corta todas sus aristas laterales.
 *
 * Cada cara lateral se despliega como su triángulo en verdadera magnitud y se
 * recorta por donde pasa el plano; se añaden la base y la sección (tapa).
 */
export function buildTruncatedPyramidDevelopment(
    subtype: string | undefined,
    size: { x: number; y: number; z: number },
    position: Vector3,
    rotation: Vector3 | undefined,
    normal: Vector3,
    constant: number
): Development | null {
    if (!subtype || !['pyramid', 'tetrahedron', 'cone'].includes(subtype)) return null;

    const r = Math.max(size.x, 0.01);
    const h = Math.max(size.y || size.x, 0.01);

    const sides = subtype === 'pyramid' ? 4 : subtype === 'tetrahedron' ? 3 : 32;
    const radius = r;
    const height = h;

    const len = Math.hypot(normal.x, normal.y, normal.z);
    if (len < 1e-9) return null;
    const n = { x: normal.x / len, y: normal.y / len, z: normal.z / len };
    const d = constant / len;
    const dist = (p: Vector3) => n.x * p.x + n.y * p.y + n.z * p.z + d;

    const base3 = Array.from({ length: sides }, (_, i) => {
        const a = (i * 2 * Math.PI) / sides;
        return transformVertex({ x: radius * Math.cos(a), y: radius * Math.sin(a), z: -height / 2 }, position, rotation);
    });
    const apex3 = transformVertex({ x: 0, y: 0, z: height / 2 }, position, rotation);

    // Todas las aristas laterales tienen que quedar cortadas
    for (const b of base3) {
        const da = dist(b);
        const dc = dist(apex3);
        if (Math.abs(dc - da) < 1e-9) return null;
        const t = -da / (dc - da);
        if (t <= 1e-4 || t >= 1 - 1e-4) return null;
    }

    const edge = 2 * radius * Math.sin(Math.PI / sides);
    const apothem = radius * Math.cos(Math.PI / sides);
    const slant = Math.sqrt(height * height + apothem * apothem);

    // Red: base central + una cara por lado
    const base2 = regularPolygon(sides, radius, { x: 0, y: 0 });
    const pieces: DevPiece[] = [{ kind: 'base', points: base2, label: 'base' }];

    const keepBelow = (p: Vector3) => dist(p) <= 0;

    for (let i = 0; i < sides; i++) {
        const j = (i + 1) % sides;
        const p = base2[i];
        const q = base2[j];
        const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
        const nx = q.y - p.y;
        const ny = -(q.x - p.x);
        const l = Math.hypot(nx, ny) || 1;
        const apex2 = { x: mid.x + (nx / l) * slant, y: mid.y + (ny / l) * slant };

        const A3 = base3[i];
        const B3 = base3[j];
        const C3 = apex3;

        // Recorte del triángulo por el plano (se queda lo que hay bajo el plano)
        const tri3: Vector3[] = [A3, B3, C3];
        const out3: Vector3[] = [];
        for (let k = 0; k < 3; k++) {
            const a = tri3[k];
            const b = tri3[(k + 1) % 3];
            const da = dist(a);
            const db = dist(b);
            if (da <= 0) out3.push(a);
            if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
                const t = -da / (db - da);
                out3.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t });
            }
        }

        if (out3.length < 3) return null;
        // La cara tiene que quedar cortada (si no, el plano no trunca el cuerpo)
        if (out3.length === 3 && keepBelow(A3) && keepBelow(B3) && keepBelow(C3)) return null;

        const tri2 = out3.map((X) => {
            const { alpha, beta, gamma } = barycentric(X, A3, B3, C3);
            return {
                x: alpha * p.x + beta * q.x + gamma * apex2.x,
                y: alpha * p.y + beta * q.y + gamma * apex2.y,
            };
        });

        // Sin vértices repetidos
        const clean = tri2.filter(
            (pt, idx) => tri2.findIndex((o) => Math.hypot(o.x - pt.x, o.y - pt.y) < 1e-7) === idx
        );
        if (clean.length < 3) return null;

        pieces.push({ kind: 'lateral', points: clean });
    }

    // Tapa: la sección en verdadera magnitud
    const mesh = buildSolidMesh(subtype, size);
    const loops = sectionPolygons(mesh, position, rotation, normal, constant);
    const shape = loops.length ? trueShape(loops[0], n) : null;

    if (shape && shape.points.length >= 3) {
        const xs = shape.points.map((p) => p.x);
        const ys = shape.points.map((p) => p.y);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
        const b = developmentBounds(pieces);
        const offsetX = b.maxX + 1.2 + (Math.max(...xs) - Math.min(...xs)) / 2;

        pieces.push({
            kind: 'section',
            points: shape.points.map((p) => ({ x: p.x - cx + offsetX, y: p.y - cy })),
            label: 'sección',
        });
    }

    return {
        pieces,
        area: sumArea(pieces),
        notes: [
            `lado de la base: ${edge.toFixed(2)} u`,
            `altura: ${height.toFixed(2)} u`,
            shape ? `sección (tapa): ${shape.area.toFixed(2)} u²` : 'sección no cerrada',
        ],
    };
}
