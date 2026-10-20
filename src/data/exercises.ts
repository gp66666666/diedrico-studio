import type { GeometryElement } from '../types';

/**
 * Biblioteca de ejercicios.
 *
 * Cada ejercicio lleva el enunciado, los pasos y los elementos ya montados,
 * así que se puede abrir en el editor con un clic (se comparte igual que un
 * dibujo: los datos viajan en el enlace).
 *
 * Contenido alineado con el temario de Dibujo Técnico (Bachillerato / PAU).
 * Añadir uno nuevo = añadir un objeto aquí y su entrada en public/sitemap.xml.
 */

export type ExerciseLevel = 'Básico' | 'Medio' | 'Avanzado';

export interface Exercise {
    slug: string;
    title: string;
    topic: string;
    level: ExerciseLevel;
    statement: string;
    steps: string[];
    result?: string;
    tip?: string;
    elements: GeometryElement[];
}

const point = (id: string, name: string, x: number, y: number, z: number, color = '#f87171'): GeometryElement => ({
    id, type: 'point', name, coords: { x, y, z }, color, visible: true,
});

const line = (id: string, name: string, p: [number, number, number], d: [number, number, number], color = '#60a5fa'): GeometryElement => ({
    id, type: 'line', name, point: { x: p[0], y: p[1], z: p[2] }, direction: { x: d[0], y: d[1], z: d[2] },
    isInfinite: true, color, visible: true,
});

const plane = (id: string, name: string, n: [number, number, number], c: number, color = '#10b981'): GeometryElement => ({
    id, type: 'plane', name, normal: { x: n[0], y: n[1], z: n[2] }, constant: c, color, visible: true,
});

export const EXERCISES: Exercise[] = [
    {
        slug: 'trazas-de-una-recta',
        title: 'Trazas de una recta',
        topic: 'La recta',
        level: 'Básico',
        statement:
            'La recta r pasa por los puntos A(0, 6, 5) y B(12, 2, −3). Halla sus trazas con el plano horizontal (H) y con el plano vertical (V).',
        steps: [
            'Dibuja A y B con sus dos proyecciones: A′–A″ y B′–B″.',
            'Une A′ con B′ para obtener la proyección horizontal r′ y A″ con B″ para la vertical r″.',
            'Traza la traza H: donde r″ corta a la línea de tierra baja una perpendicular hasta r′. Ese punto es H′ = H″.',
            'Traza la traza V: donde r′ corta a la línea de tierra sube una perpendicular hasta r″. Ese punto es V′ = V″.',
        ],
        result: 'H(8, 0, 0) y V(6, 0, 0).',
        tip: 'Una recta tiene dos trazas como máximo: si es paralela a un plano de proyección, solo corta al otro.',
        elements: [
            point('ex1-a', 'A', 0, 6, 5),
            point('ex1-b', 'B', 12, 2, -3),
            line('ex1-r', 'r', [0, 6, 5], [12, -4, -8]),
        ],
    },
    {
        slug: 'interseccion-recta-plano',
        title: 'Intersección de una recta y un plano',
        topic: 'Intersecciones',
        level: 'Medio',
        statement:
            'La recta r pasa por A(0, 6, 10) y B(12, 6, −2). El plano P es horizontal y está a cota 4 (z = 4). Halla el punto de intersección I.',
        steps: [
            'Al ser P un plano horizontal, su proyección vertical P″ es una recta horizontal a cota 4.',
            'Donde r″ corte a P″ tienes la proyección vertical I″ del punto de corte.',
            'Baja una perpendicular desde I″ hasta r′ para situar I′.',
            'Comprueba que I pertenece a la recta: sus coordenadas deben cumplir la ecuación de r.',
        ],
        result: 'I(6, 6, 4).',
        tip: 'Con un plano proyectante el corte se ve directamente en la proyección donde el plano se ve como una recta.',
        elements: [
            point('ex2-a', 'A', 0, 6, 10),
            point('ex2-b', 'B', 12, 6, -2),
            line('ex2-r', 'r', [0, 6, 10], [12, 0, -12]),
            plane('ex2-p', 'P', [0, 0, 1], -4),
        ],
    },
    {
        slug: 'distancia-punto-plano',
        title: 'Distancia de un punto a un plano',
        topic: 'Distancias',
        level: 'Medio',
        statement:
            'Calcula la distancia del punto P(3, 5, 7) al plano horizontal z = 2.',
        steps: [
            'La distancia de un punto a un plano horizontal es la diferencia de cotas: no hace falta construir nada.',
            'Si el plano no fuera proyectante, se trazaría la perpendicular por P, se hallaría su intersección con el plano y se mediría el segmento en verdadera magnitud.',
        ],
        result: 'd = 5 unidades.',
        tip: 'Con planos paralelos a los de proyección, la distancia se ve en verdadera magnitud directamente.',
        elements: [
            point('ex3-p', 'P', 3, 5, 7, '#a78bfa'),
            plane('ex3-pl', 'Q', [0, 0, 1], -2),
        ],
    },
    {
        slug: 'recta-paralela-a-plano',
        title: 'Recta paralela a un plano por un punto',
        topic: 'Paralelismo',
        level: 'Medio',
        statement:
            'Por el punto P(2, 6, 6) traza una recta horizontal paralela al plano P: x + y + z = 6.',
        steps: [
            'Una recta es paralela a un plano si su dirección es perpendicular a la normal del plano.',
            'Para que además sea horizontal, su dirección tiene que tener componente z = 0.',
            'Con esas dos condiciones, la dirección es d = n × (0, 0, 1) = (1, −1, 0).',
            'Dibuja la recta que pasa por P con esa dirección. Sus dos proyecciones son paralelas a la línea de tierra.',
        ],
        result: 'r pasa por P(2, 6, 6) con dirección (1, −1, 0).',
        tip: 'Las rectas horizontales de un plano son las que se usan para abatirlo y para medir verdaderas magnitudes.',
        elements: [
            point('ex4-p', 'P', 2, 6, 6, '#a78bfa'),
            plane('ex4-pl', 'P', [1, 1, 1], -6),
            line('ex4-r', 'r', [2, 6, 6], [1, -1, 0]),
        ],
    },
    {
        slug: 'abatimiento-de-un-punto',
        title: 'Abatimiento sobre el plano horizontal',
        topic: 'Abatimientos',
        level: 'Avanzado',
        statement:
            'El punto A(3, 4, 5) pertenece al plano P: y = 4. Abate el plano sobre el horizontal y halla la posición abatida (A).',
        steps: [
            'La charnela es la traza horizontal del plano: la recta y = 4, z = 0, que es paralela a la línea de tierra.',
            'La distancia de A a la charnela, medida en proyección horizontal, es de 4 unidades (su cota).',
            'Al abatir, esa distancia se coloca perpendicular a la charnela: el punto gira hasta el plano horizontal.',
            'El resultado (A) queda en el plano z = 0, con la misma x que A.',
        ],
        result: '(A) se obtiene girando A alrededor de la traza y = 4 hasta dejarlo sobre el horizontal.',
        tip: 'Abatir es girar el plano hasta ponerlo sobre uno de proyección. Sirve para medir distancias y ángulos en verdadera magnitud.',
        elements: [
            point('ex5-a', 'A', 3, 4, 5),
            plane('ex5-p', 'P', [0, 1, 0], -4),
        ],
    },
    {
        slug: 'angulo-entre-dos-planos',
        title: 'Ángulo entre dos planos',
        topic: 'Ángulos',
        level: 'Avanzado',
        statement:
            'Calcula el ángulo que forman el plano horizontal z = 0 y el plano Q: x + z = 0.',
        steps: [
            'El ángulo entre dos planos es el que forman sus normales.',
            'Normal del horizontal: n₁ = (0, 0, 1). Normal de Q: n₂ = (1, 0, 1).',
            'cos α = |n₁ · n₂| / (|n₁| · |n₂|) = 1 / √2.',
            'α = 45°.',
        ],
        result: '45°.',
        tip: 'Si los planos son perpendiculares, el producto escalar de sus normales es cero.',
        elements: [
            plane('ex6-p', 'P', [0, 0, 1], 0),
            plane('ex6-q', 'Q', [1, 0, 1], 0, '#a78bfa'),
        ],
    },
    {
        slug: 'pertenencia-de-un-punto-a-una-recta',
        title: '¿Pertenece el punto a la recta?',
        topic: 'La recta',
        level: 'Básico',
        statement:
            'La recta r pasa por A(0, 3, 0) y B(8, 3, 4). Comprueba si el punto P(4, 3, 2) pertenece a r.',
        steps: [
            'Dibuja A y B con sus dos proyecciones y únelas: r′ pasa por A′ y B′, y r″ por A″ y B″.',
            'Sitúa P′ y P″.',
            'Un punto pertenece a la recta si sus DOS proyecciones caen sobre las homónimas de la recta.',
            'P′ cae sobre r′ y P″ sobre r″, así que P sí pertenece a r. Además es el punto medio del segmento AB.',
        ],
        result: 'Sí pertenece: P está sobre r (es el punto medio de AB).',
        tip: 'Basta con que falle una de las dos proyecciones para que el punto no pertenezca a la recta.',
        elements: [
            point('ex7-a', 'A', 0, 3, 0),
            point('ex7-b', 'B', 8, 3, 4),
            point('ex7-p', 'P', 4, 3, 2, '#a78bfa'),
            line('ex7-r', 'r', [0, 3, 0], [8, 0, 4]),
        ],
    },
    {
        slug: 'perpendicular-a-un-plano',
        title: 'Recta perpendicular a un plano',
        topic: 'Perpendicularidad',
        level: 'Medio',
        statement:
            'Por el punto P(2, 4, 6) traza la recta perpendicular al plano P: y = 4.',
        steps: [
            'El plano P es paralelo al plano vertical, así que se ve de canto en la planta: su traza es la recta y = 4.',
            'Una recta perpendicular a un plano lo es a todas sus rectas, y su dirección es la normal del plano.',
            'La normal de y = 4 es (0, 1, 0): una recta de punta, perpendicular a la traza en la planta.',
            'Dibújala por P: en el alzado se ve como un punto (P″) y en la planta como una perpendicular a la traza.',
        ],
        result: 'Recta por P(2, 4, 6) con dirección (0, 1, 0).',
        tip: 'En un plano proyectante, la perpendicular se ve directamente en la vista donde el plano se ve de canto.',
        elements: [
            point('ex8-p', 'P', 2, 4, 6, '#a78bfa'),
            plane('ex8-pl', 'P', [0, 1, 0], -4),
            line('ex8-r', 'r', [2, 4, 6], [0, 1, 0]),
        ],
    },
    {
        slug: 'interseccion-de-dos-planos',
        title: 'Intersección de dos planos',
        topic: 'Intersecciones',
        level: 'Avanzado',
        statement:
            'Halla la recta intersección de los planos P: z = 2 y Q: y = 3.',
        steps: [
            'Los dos planos son proyectantes: P se ve de canto en el alzado y Q en la planta.',
            'La intersección es el conjunto de puntos que cumplen las dos condiciones a la vez: y = 3 y z = 2.',
            'Esa recta es paralela a la línea de tierra: en el alzado se ve como una recta horizontal a cota 2, y en la planta como una recta horizontal a alejamiento 3.',
            'Marca dos puntos cualesquiera de esa recta para dibujarla.',
        ],
        result: 'Recta i: y = 3, z = 2 (paralela a la LT).',
        tip: 'Si los dos planos son paralelos a la LT, su intersección también lo es (o son paralelos entre sí).',
        elements: [
            plane('ex9-p', 'P', [0, 0, 1], -2),
            plane('ex9-q', 'Q', [0, 1, 0], -3, '#a78bfa'),
            line('ex9-i', 'i', [0, 3, 2], [1, 0, 0], '#f59e0b'),
        ],
    },
    {
        slug: 'verdadera-magnitud-cambio-de-plano',
        title: 'Verdadera magnitud por cambio de plano',
        topic: 'Verdaderas magnitudes',
        level: 'Avanzado',
        statement:
            'El segmento AB tiene A(0, 2, 2) y B(6, 5, 6). Halla su verdadera magnitud mediante un cambio de plano.',
        steps: [
            'Dibuja A y B con sus proyecciones y une A′B′ y A″B″.',
            'Traza una nueva línea de tierra paralela a la proyección horizontal A′B′.',
            'Lleva las cotas de A y B perpendiculares a la nueva LT, manteniendo la distancia.',
            'La nueva proyección vertical A″₁B″₁ está en verdadera magnitud: mídela sobre el papel.',
        ],
        result: 'VM = √(6² + 3² + 4²) = √61 ≈ 7,81 unidades.',
        tip: 'El cambio de plano no cambia el objeto: cambia el plano desde el que se mira. Por eso aparece la VM.',
        elements: [
            point('ex10-a', 'A', 0, 2, 2),
            point('ex10-b', 'B', 6, 5, 6),
            { id: 'ex10-s', type: 'segment', name: 'AB', p1: { x: 0, y: 2, z: 2 }, p2: { x: 6, y: 5, z: 6 }, color: '#f59e0b', visible: true },
        ],
    },
    {
        slug: 'giro-de-un-punto',
        title: 'Giro de un punto alrededor de un eje vertical',
        topic: 'Giros',
        level: 'Medio',
        statement:
            'Gira el punto A(6, 4, 2) un ángulo de 90° alrededor del eje vertical que pasa por el origen de coordenadas.',
        steps: [
            'El eje es una recta perpendicular al plano horizontal, así que en la planta se ve como un punto (el origen).',
            'La cota no cambia: el punto gira en un plano horizontal, así que A sigue a cota 2.',
            'Dibuja en la planta el radio OA y gíralo 90° con el compás, en sentido antihorario.',
            'Sube la nueva posición a la cota 2 para obtener A₁ y A₁″.',
        ],
        result: 'A₁(−4, 6, 2).',
        tip: 'En un giro alrededor de un eje vertical, la proyección horizontal gira y la cota se mantiene.',
        elements: [
            point('ex11-a', 'A', 6, 4, 2),
            line('ex11-eje', 'eje', [0, 0, 0], [0, 0, 1], '#94a3b8'),
        ],
    },
];

export const EXERCISE_TOPICS = Array.from(new Set(EXERCISES.map((e) => e.topic)));

export const findExercise = (slug: string): Exercise | undefined =>
    EXERCISES.find((e) => e.slug === slug);
