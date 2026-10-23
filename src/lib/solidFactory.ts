import type { SolidElement } from '../types';
import type { Vec3 } from './solidGeometry';

/**
 * Creación de sólidos desde una herramienta.
 *
 * Vive aquí (y no dentro del panel) porque hay dos formas de colocarlos: con un
 * clic en el suelo de la vista 3D o seleccionando un punto. Las dos tienen que
 * crear exactamente el mismo sólido.
 */

const DEFAULTS: Record<
    string,
    { subtype: SolidElement['subtype']; name: string; color: string; size: Vec3 }
> = {
    tetraedro: { subtype: 'tetrahedron', name: 'Tetraedro', color: '#ef4444', size: { x: 5, y: 5, z: 5 } },
    cubo: { subtype: 'cube', name: 'Cubo', color: '#3b82f6', size: { x: 5, y: 5, z: 5 } },
    octaedro: { subtype: 'octahedron', name: 'Octaedro', color: '#10b981', size: { x: 5, y: 5, z: 5 } },
    dodecaedro: { subtype: 'dodecahedron', name: 'Dodecaedro', color: '#f59e0b', size: { x: 5, y: 5, z: 5 } },
    icosaedro: { subtype: 'icosahedron', name: 'Icosaedro', color: '#8b5cf6', size: { x: 5, y: 5, z: 5 } },
    prisma: { subtype: 'prism', name: 'Prisma', color: '#3b82f6', size: { x: 4, y: 8, z: 4 } },
    piramide: { subtype: 'pyramid', name: 'Pirámide', color: '#3b82f6', size: { x: 4, y: 8, z: 4 } },
    cilindro: { subtype: 'cylinder', name: 'Cilindro', color: '#3b82f6', size: { x: 3, y: 8, z: 3 } },
    cono: { subtype: 'cone', name: 'Cono', color: '#3b82f6', size: { x: 3, y: 8, z: 3 } },
    esfera: { subtype: 'sphere', name: 'Esfera', color: '#3b82f6', size: { x: 4, y: 4, z: 4 } },
};

/** Herramientas que son sólidos de verdad (las operaciones van aparte). */
const NOT_CREATION_TOOLS = new Set([
    'solid-section',
    'solid-intersection',
    'solid-development',
    'line-solid',
    'sphere-tangent',
    'shadows',
    'cast-shadow',
]);

export function isSolidCreationTool(tool: string | null | undefined): boolean {
    if (!tool || tool === 'none' || NOT_CREATION_TOOLS.has(tool)) return false;
    return (
        tool.startsWith('poliedro-') ||
        tool.startsWith('solid-') ||
        tool.startsWith('revolucion-')
    );
}

/** 'poliedro-cubo' → 'cubo'; null si la herramienta no crea sólidos. */
export function solidKeyFromTool(tool: string | null | undefined): string | null {
    if (!isSolidCreationTool(tool)) return null;
    const key = tool!.split('-')[1];
    return key && DEFAULTS[key] ? key : null;
}

export function makeSolid(
    tool: string,
    center: Vec3,
    solidCount: number
): SolidElement | null {
    const key = solidKeyFromTool(tool);
    if (!key) return null;
    const preset = DEFAULTS[key];

    return {
        type: 'solid',
        id: Math.random().toString(36).substr(2, 9),
        name: `${preset.name} ${solidCount + 1}`,
        subtype: preset.subtype,
        position: { ...center },
        size: { ...preset.size },
        rotation: { x: 0, y: 0, z: 0 },
        color: preset.color,
        visible: true,
        opacity: 0.8,
    } as SolidElement;
}

/**
 * Poliedro libre: el alumno ha escrito sus vértices y el casco convexo ya viene
 * calculado (lib/freePolyhedron). Las caras y los vértices se guardan en el
 * propio elemento, así el 3D, el 2D y las herramientas usan la misma geometría.
 */
export function makePolyhedron(
    poly: { position: Vec3; size: Vec3; vertices: Vec3[]; faces: number[][] },
    solidCount: number
): SolidElement {
    return {
        type: 'solid',
        id: Math.random().toString(36).substr(2, 9),
        name: `Poliedro ${solidCount + 1}`,
        subtype: 'polyhedron',
        position: { ...poly.position },
        size: { ...poly.size },
        rotation: { x: 0, y: 0, z: 0 },
        color: '#14b8a6',
        visible: true,
        opacity: 0.8,
        custom: {
            vertices: poly.vertices.map((v) => ({ ...v })),
            faces: poly.faces.map((f) => [...f]),
        },
    } as SolidElement;
}
