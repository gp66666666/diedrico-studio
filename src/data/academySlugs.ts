/**
 * Una URL por tema de la Academia.
 *
 * El id es el que usa `ACADEMY_CONTENT`; el slug es la URL pública. Se define a
 * mano para que sea legible y estable: si se generara del título, cambiar una
 * tilde rompería los enlaces ya indexados.
 */
export const ACADEMY_SLUGS: Record<string, string> = {
    'theory-1-point': 'introduccion-el-punto',
    'theory-2-line': 'la-recta',
    'theory-3-plane': 'el-plano',
    'theory-4-intersections': 'intersecciones',
    'theory-5-parallelism': 'paralelismo-y-perpendicularidad',
    'theory-6-distances': 'distancias',
    'theory-7-angles': 'angulos',
    'theory-8-abatements': 'abatimientos',
    'theory-9-rotations': 'giros',
    'theory-10-change-plane': 'cambios-de-plano',
    'theory-11-polyhedra': 'poliedros',
    'theory-12-surfaces': 'superficies',
    'theory-13-sections': 'secciones',
    'theory-14-developments': 'desarrollos',
    'theory-15-max-slope': 'maxima-pendiente-e-inclinacion',
    'theory-16-angles-planes': 'angulos-con-los-planos-de-proyeccion',
    'theory-17-positions': 'posiciones-caracteristicas',
    'theory-18-oblique': 'cuerpos-de-revolucion-oblicuos',
    'theory-19-sphere': 'la-esfera',
    'theory-20-map': 'mapa-del-temario',
};

export const slugForTopic = (id: string): string | undefined => ACADEMY_SLUGS[id];
export const topicForSlug = (slug: string): string | undefined =>
    Object.entries(ACADEMY_SLUGS).find(([, s]) => s === slug)?.[0];
