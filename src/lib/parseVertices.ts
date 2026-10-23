import type { Vec3 } from './solidGeometry';

/**
 * Lectura de la lista de vértices del poliedro libre.
 *
 * Una línea por vértice. Vale cualquiera de estas formas:
 *
 *   0 0 0            coordenadas
 *   0, 0, 0          con comas
 *   (0; 0; 0)        con puntos y coma
 *   A                el nombre de un punto que ya está en el dibujo
 *   V1 4 0 0         con etiqueta propia
 *
 * Los decimales se escriben con coma o con punto (1,5 y 1.5 valen igual).
 * Las líneas vacías y las que empiezan por # se ignoran.
 */
export interface NamedPoint {
    name: string;
    coords: Vec3;
}

export interface ParsedVertexInput {
    vertices: Vec3[];
    labels: string[];
    errors: string[];
}

const NUMBER = /^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/;

function toNumber(raw: string): number | null {
    const clean = raw.replace(/[()]/g, '').trim();
    if (!NUMBER.test(clean)) return null;
    const value = parseFloat(clean.replace(',', '.'));
    return Number.isFinite(value) ? value : null;
}

function splitLine(line: string): string[] {
    const clean = line.trim();
    if (!clean) return [];
    if (/\s/.test(clean)) return clean.split(/[\s;]+/).filter(Boolean);
    // Sin espacios: «(0,0,0)» o «0,0,0». Con coma decimal no se puede partir,
    // pero solo se llega aquí cuando la línea entera no tiene espacios.
    return clean.replace(/[()]/g, '').split(',').map((s) => s.trim()).filter(Boolean);
}

export function parseVertexInput(text: string, points: NamedPoint[] = []): ParsedVertexInput {
    const vertices: Vec3[] = [];
    const labels: string[] = [];
    const errors: string[] = [];
    const byName = new Map(points.map((p) => [p.name.trim().toUpperCase(), p.coords]));

    text.split(/\r?\n/).forEach((rawLine, index) => {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) return;

        const tokens = splitLine(line);
        if (tokens.length === 0) return;
        const lineNumber = index + 1;

        // Un solo token: tiene que ser el nombre de un punto del dibujo.
        if (tokens.length === 1) {
            const found = byName.get(tokens[0].toUpperCase());
            if (!found) {
                errors.push(`Línea ${lineNumber}: «${tokens[0]}» no es un punto del dibujo.`);
                return;
            }
            vertices.push({ ...found });
            labels.push(tokens[0].toUpperCase());
            return;
        }

        if (tokens.length === 2 || tokens.length > 4) {
            errors.push(`Línea ${lineNumber}: escribe «x y z» (o el nombre de un punto).`);
            return;
        }

        const numbers = tokens.length === 4 ? tokens.slice(1) : tokens;
        const values = numbers.map(toNumber);
        if (values.some((v) => v === null)) {
            errors.push(`Línea ${lineNumber}: «${numbers.join(' ')}» no son tres números.`);
            return;
        }
        vertices.push({ x: values[0]!, y: values[1]!, z: values[2]! });
        labels.push(tokens.length === 4 ? tokens[0] : `${vertices.length}`);
    });

    return { vertices, labels, errors };
}
