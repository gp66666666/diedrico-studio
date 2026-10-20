import type { AcademyExercise } from '../types';

/**
 * Contenido ampliado de la Academia.
 *
 * Vive aparte de `academyContent.tsx` para no tocar las secciones que ya
 * estaban escritas. Se inyecta al final de ese archivo:
 *   - `ACADEMY_THEORY` completa las secciones que eran un esbozo.
 *   - `ACADEMY_EXERCISES` da ejercicios a todos los temas.
 */

const p = (name: string, x: number, y: number, z: number, color = '#f87171'): Partial<any> => ({
    type: 'point', name, coords: { x, y, z }, color,
});

const l = (
    name: string,
    point: [number, number, number],
    direction: [number, number, number],
    color = '#60a5fa'
): Partial<any> => ({
    type: 'line', name,
    point: { x: point[0], y: point[1], z: point[2] },
    direction: { x: direction[0], y: direction[1], z: direction[2] },
    isInfinite: true, color,
});

const pl = (
    name: string,
    normal: [number, number, number],
    constant: number,
    color = '#10b981'
): Partial<any> => ({
    type: 'plane', name, normal: { x: normal[0], y: normal[1], z: normal[2] }, constant, color,
});

const solid = (
    name: string,
    subtype: string,
    position: [number, number, number],
    size: number,
    color = '#3b82f6'
): Partial<any> => ({
    type: 'solid', name, subtype,
    position: { x: position[0], y: position[1], z: position[2] },
    size: { x: size, y: size, z: size },
    rotation: { x: 0, y: 0, z: 0 },
    color, opacity: 0.85,
});

/* ------------------------------------------------------------------ */
/* Teoría que faltaba (temas 6 a 14)                                   */
/* ------------------------------------------------------------------ */

const section = (title: string, body: string) => `
    <section class="mb-8">
        <h3 class="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2 font-serif">${title}</h3>
        ${body}
    </section>`;

const steps = (items: string[]) => `
    <ol class="list-decimal list-inside space-y-2 text-slate-700 text-lg leading-relaxed">
        ${items.map((i) => `<li>${i}</li>`).join('')}
    </ol>`;

const tip = (text: string) => `
    <div class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-slate-700">
        <strong class="text-amber-700">Truco de clase:</strong> ${text}
    </div>`;

export const ACADEMY_THEORY: Record<string, string> = {
    'theory-6-distances': `
    <div class="academy-content space-y-6 text-slate-700">
        ${section('Idea general', `<p class="text-lg leading-relaxed">La distancia entre dos elementos es siempre la <strong>verdadera magnitud</strong> del segmento que los une por el camino más corto. En diédrico eso significa: primero se construye el segmento, después se pone en VM (abatimiento, giro o cambio de plano).</p>`)}
        ${section('Punto a plano', steps([
            'Traza por el punto P la recta perpendicular al plano.',
            'Halla la intersección I de esa perpendicular con el plano.',
            'El segmento PI es la distancia; mide su verdadera magnitud.',
        ]) + tip('Si el plano es proyectante, la perpendicular se ve directamente en la vista donde el plano se ve de canto: casi no hay que construir nada.'))}
        ${section('Punto a recta', steps([
            'Contiene el punto en un plano perpendicular a la recta.',
            'Halla el corte de ese plano con la recta: es el pie de la perpendicular.',
            'La distancia es el segmento entre el punto y ese pie, en VM.',
        ]))}
        ${section('Recta a plano (paralelos) y plano a plano', `<p class="text-lg">Se toma un punto cualquiera de la recta (o del primer plano) y se mide su distancia al otro elemento: es la misma en todos los puntos.</p>`)}
        ${section('Rectas que se cruzan', `<p class="text-lg">Se contiene una de ellas en un plano paralelo a la otra y se mide la distancia de la segunda recta a ese plano. Es la distancia mínima entre las dos.</p>`)}
    </div>`,

    'theory-7-angles': `
    <div class="academy-content space-y-6 text-slate-700">
        ${section('Idea general', `<p class="text-lg leading-relaxed">Un ángulo solo se mide en <strong>verdadera magnitud</strong>. Como en las distancias, primero se construye y después se abate o se gira hasta verlo en VM.</p>`)}
        ${section('Ángulo entre dos rectas', steps([
            'Se cortan las dos rectas con un plano cualquiera (o se llevan a un punto común paralelas a ellas).',
            'Se abate el plano que las contiene.',
            'El ángulo se mide sobre el abatimiento.',
        ]))}
        ${section('Ángulo entre recta y plano', steps([
            'Por un punto de la recta se traza la perpendicular al plano.',
            'El ángulo entre la recta y esa perpendicular es el complementario del que buscas: α = 90° − β.',
        ]) + tip('Es más fácil medir el ángulo con la perpendicular que con el plano: acuérdate del complementario.'))}
        ${section('Ángulo entre dos planos', steps([
            'Se traza un plano perpendicular a la recta intersección de los dos.',
            'Ese plano corta a cada uno en una recta; el ángulo entre esas dos rectas es el ángulo diedro.',
        ]) + tip('Si los planos son proyectantes, el ángulo se ve directamente en la vista donde ambos se ven de canto.'))}
    </div>`,

    'theory-8-abatimientos': `
    <div class="academy-content space-y-6 text-slate-700">
        ${section('Qué es abatir', `<p class="text-lg leading-relaxed">Abatir un plano es <strong>girarlo alrededor de una de sus trazas</strong> hasta dejarlo sobre un plano de proyección. Así todo lo que contiene aparece en verdadera magnitud, como si lo pusiéramos sobre el papel.</p>`)}
        ${section('Elementos', `<ul class="list-disc list-inside text-lg space-y-2">
            <li><strong>Charnela</strong>: la traza sobre la que gira (no se mueve).</li>
            <li><strong>Punto abatido</strong>: la posición final del punto, se escribe (A).</li>
            <li><strong>Radio de giro</strong>: distancia del punto a la charnela, medida en verdadera magnitud.</li>
        </ul>`)}
        ${section('Abatir un punto sobre el horizontal', steps([
            'Toma como charnela la traza horizontal del plano.',
            'Mide la distancia del punto a la charnela en la planta (proyección horizontal).',
            'Esa distancia es un cateto; la cota del punto es el otro. La hipotenusa es el radio de giro real.',
            'Con el compás, lleva ese radio desde la charnela, perpendicular a ella, y obtienes (A).',
        ]))}
        ${section('Para qué se usa', `<p class="text-lg">Para medir distancias y ángulos en VM, para dibujar la verdadera forma de una sección plana y para construir figuras contenidas en un plano.</p>`)}
    </div>`,

    'theory-9-giros': `
    <div class="academy-content space-y-6 text-slate-700">
        ${section('Qué es girar', `<p class="text-lg leading-relaxed">Girar es <strong>hacer rotar un elemento alrededor de un eje</strong> hasta colocarlo en una posición cómoda (paralelo a un plano de proyección, por ejemplo). El elemento no cambia: cambia su posición.</p>`)}
        ${section('Reglas', `<ul class="list-disc list-inside text-lg space-y-2">
            <li>Todo punto gira en un plano perpendicular al eje.</li>
            <li>Si el eje es vertical, la <strong>cota no cambia</strong> y el giro se ve en la planta.</li>
            <li>Si el eje es perpendicular al vertical, el <strong>alejamiento no cambia</strong> y el giro se ve en el alzado.</li>
            <li>El radio de giro es la distancia real al eje, no la de la proyección.</li>
        </ul>`)}
        ${section('Giro de un punto (eje vertical)', steps([
            'Dibuja el eje en planta como un punto.',
            'Une ese punto con A′: es el radio en planta (verdadera magnitud si el eje es vertical).',
            'Gira ese radio el ángulo pedido con el compás.',
            'Sube la nueva posición a la cota de A para obtener A₁″.',
        ]))}
        ${section('Giro de una recta', `<p class="text-lg">Se giran dos puntos de la recta y se unen. Si se busca ponerla paralela a un plano de proyección, se gira hasta que una de sus proyecciones quede paralela a la línea de tierra.</p>`)}
    </div>`,

    'theory-10-plane-changes': `
    <div class="academy-content space-y-6 text-slate-700">
        ${section('Qué es un cambio de plano', `<p class="text-lg leading-relaxed">Es <strong>cambiar uno de los planos de proyección</strong> por otro perpendicular al que se queda. El objeto no se mueve: cambia el punto de vista. La línea de tierra cambia de posición y orientación.</p>`)}
        ${section('Cómo se hace', steps([
            'Traza la nueva línea de tierra, paralela o perpendicular a la dirección que te interese.',
            'Desde cada punto, lleva la coordenada que se conserva perpendicular a la nueva LT, con la misma medida que tenía.',
            'La coordenada que se pierde es la del plano que has sustituido.',
        ]))}
        ${section('Cuándo usarlo', `<ul class="list-disc list-inside text-lg space-y-2">
            <li>Para ver una recta en verdadera magnitud: nueva LT paralela a su proyección.</li>
            <li>Para ver un plano de canto: nueva LT perpendicular a una recta horizontal del plano.</li>
            <li>Para ver un plano en VM: dos cambios consecutivos.</li>
        </ul>`)}
        ${tip('El cambio de plano es el método más rápido para secciones y verdaderas magnitudes: si algo no se ve, cambia el plano hasta que se vea.')}
    </div>`,

    'theory-11-polyhedra': `
    <div class="academy-content space-y-6 text-slate-700">
        ${section('Qué son', `<p class="text-lg leading-relaxed">Sólidos limitados por caras planas. En diédrico se representan por sus <strong>aristas</strong>: las visibles con línea continua y las ocultas con discontinua.</p>`)}
        ${section('Los cinco regulares', `<ul class="list-disc list-inside text-lg space-y-2">
            <li><strong>Tetraedro</strong>: 4 caras triangulares.</li>
            <li><strong>Cubo</strong>: 6 caras cuadradas.</li>
            <li><strong>Octaedro</strong>: 8 caras triangulares.</li>
            <li><strong>Dodecaedro</strong>: 12 caras pentagonales.</li>
            <li><strong>Icosaedro</strong>: 20 caras triangulares.</li>
        </ul>`)}
        ${section('Cómo se dibuja un cubo apoyado en el PH', steps([
            'Dibuja la base (un cuadrado) en la planta, en VM si está apoyada.',
            'Sube cada vértice a la cota de la altura.',
            'Une las dos bases y las aristas verticales.',
            'Decide qué aristas quedan ocultas mirando desde el alzado y la planta.',
        ]))}
        ${tip('En la app puedes crear el sólido y girarlo con los deslizadores: la vista diédrica se actualiza sola y sirve para comprobar el dibujo.')}
    </div>`,

    'theory-12-surfaces': `
    <div class="academy-content space-y-6 text-slate-700">
        ${section('Superficies curvas', `<p class="text-lg leading-relaxed">Cilindro, cono y esfera no tienen aristas: se representan por su <strong>contorno aparente</strong> y por las generatrices o paralelos que ayudan a leerlos.</p>`)}
        ${section('Cilindro vertical', `<p class="text-lg">En planta es una circunferencia; en alzado, un rectángulo cuya altura es la del cilindro. Las generatrices extremas son el contorno.</p>`)}
        ${section('Cono', `<p class="text-lg">En planta, una circunferencia; en alzado, un triángulo. El vértice se proyecta en el centro de la base.</p>`)}
        ${section('Esfera', `<p class="text-lg">Se proyecta como una circunferencia del radio de la esfera en las dos vistas. Los paralelos y meridianos se añaden solo si ayudan.</p>`)}
        ${tip('En diédrico, el contorno de una superficie curva es lo que se dibuja con línea gruesa; lo de dentro son generatrices auxiliares.')}
    </div>`,

    'theory-13-sections': `
    <div class="academy-content space-y-6 text-slate-700">
        ${section('Qué es una sección', `<p class="text-lg leading-relaxed">Es la figura que resulta de <strong>cortar un sólido por un plano</strong>. Se obtiene hallando la intersección del plano con cada cara.</p>`)}
        ${section('Método general', steps([
            'Halla la intersección del plano de corte con el plano de cada cara.',
            'Dentro de cada cara, esa recta corta a las aristas en dos puntos.',
            'Une los puntos en orden alrededor del sólido: esa es la sección.',
            'Si el plano es proyectante, la sección se ve directamente en la vista donde se ve de canto.',
        ]))}
        ${section('Verdadera magnitud', `<p class="text-lg">La sección se ve deformada salvo que el plano sea paralelo a un plano de proyección. Para dibujarla en VM se abate el plano de corte o se hace un cambio de plano.</p>`)}
        ${tip('Empieza siempre por las caras que se ven de canto: allí la intersección es inmediata.')}
    </div>`,

    'theory-14-developments': `
    <div class="academy-content space-y-6 text-slate-700">
        ${section('Qué es un desarrollo', `<p class="text-lg leading-relaxed">Es <strong>desplegar las caras de un sólido sobre un plano</strong> para construir la figura en cartulina o chapa. Cada cara aparece en verdadera magnitud y unida a la siguiente por una arista.</p>`)}
        ${section('Prisma recto', steps([
            'Dibuja la base en VM (ya lo está si es paralela al PH).',
            'Despliega las caras laterales en fila: tantos rectángulos como caras, con la altura del prisma.',
            'Añade la otra base al final, apoyada en una arista.',
        ]))}
        ${section('Pirámide y cono', `<p class="text-lg">Se abaten las caras laterales alrededor del vértice: cada triángulo (o sector) se dibuja en VM usando la verdadera magnitud de las aristas laterales.</p>`)}
        ${section('Cilindro y cono', `<p class="text-lg">El desarrollo lateral es un rectángulo de base 2πr y altura h (cilindro), o un sector circular de radio la generatriz (cono).</p>`)}
        ${tip('Comprueba siempre que el perímetro del desarrollo coincide con el de la base: si no, has redondeado mal.')}
    </div>`,
};

/* ------------------------------------------------------------------ */
/* Ejercicios (2 por tema)                                             */
/* ------------------------------------------------------------------ */

export const ACADEMY_EXERCISES: Record<string, AcademyExercise[]> = {
    'theory-1-point': [
        {
            id: 'ex-point-coords',
            title: 'Situar un punto y su simétrico',
            level: 'Fácil',
            statement: 'Sitúa el punto A(4, 3, 5). Después dibuja su simétrico respecto del plano horizontal.',
            setup: [p('A', 4, 3, 5)],
            solutionHint: 'El simétrico respecto del PH cambia el signo de la cota: A′(4, 3, −5).',
        },
        {
            id: 'ex-point-quadrants',
            title: 'Los cuatro cuadrantes',
            level: 'Medio',
            statement: 'Dibuja un punto en cada uno de los cuatro cuadrantes y explica qué signo tiene su cota y su alejamiento.',
            setup: [p('A', 3, 2, 4), p('B', 9, 2, -4, '#a78bfa'), p('C', 15, -2, 4, '#f59e0b'), p('D', 21, -2, -4, '#34d399')],
            solutionHint: 'I: cota +, alejamiento +. II: cota −, alejamiento +. III: cota −, alejamiento −. IV: cota +, alejamiento −.',
        },
    ],

    'theory-2-line': [
        {
            id: 'ex-line-traces',
            title: 'Hallar las trazas de una recta',
            level: 'Medio',
            statement: 'La recta r pasa por A(0, 6, 5) y B(12, 2, −3). Halla sus trazas H y V.',
            setup: [p('A', 0, 6, 5), p('B', 12, 2, -3), l('r', [0, 6, 5], [12, -4, -8])],
            solutionHint: 'Prolonga r′ y r″ hasta la LT: por cada corte sube o baja una perpendicular hasta la otra proyección.',
        },
        {
            id: 'ex-line-horizontal',
            title: 'Recta horizontal',
            level: 'Fácil',
            statement: 'Dibuja una recta horizontal que pase por A(2, 4, 5) y comprueba que su alzado es paralelo a la línea de tierra.',
            setup: [p('A', 2, 4, 5), l('h', [2, 4, 5], [8, 3, 0])],
            solutionHint: 'Una recta horizontal tiene cota constante: su proyección vertical es paralela a la LT y no tiene traza vertical.',
        },
    ],

    'theory-3-plane': [
        {
            id: 'ex-plane-traces',
            title: 'Plano por dos rectas que se cortan',
            level: 'Medio',
            statement: 'Las rectas r y s se cortan en el punto P. Halla las trazas del plano que determinan.',
            setup: [
                p('P', 4, 4, 4),
                l('r', [4, 4, 4], [1, 0, 0.6]),
                l('s', [4, 4, 4], [0.4, 1, -0.2], '#a78bfa'),
            ],
            solutionHint: 'Halla la traza horizontal de cada recta y únelas: esa es la traza horizontal del plano. Igual con las verticales.',
        },
        {
            id: 'ex-plane-projecting',
            title: 'Plano proyectante vertical',
            level: 'Fácil',
            statement: 'Dibuja un plano proyectante vertical que contenga a la recta r y explica por qué se ve de canto en el alzado.',
            setup: [p('A', 0, 1, 2), p('B', 10, 5, 6), l('r', [0, 1, 2], [10, 4, 4])],
            solutionHint: 'Un plano proyectante vertical es perpendicular al PV: su traza vertical es una recta y todo el plano se proyecta sobre ella.',
        },
    ],

    'theory-4-intersections': [
        {
            id: 'ex-intersection-line-plane',
            title: 'Intersección recta-plano',
            level: 'Medio',
            statement: 'Halla el punto I donde la recta r corta al plano P (horizontal a cota 4).',
            setup: [
                p('A', 0, 6, 10), p('B', 12, 6, -2),
                l('r', [0, 6, 10], [12, 0, -12]),
                pl('P', [0, 0, 1], -4),
            ],
            solutionHint: 'La recta está contenida en el plano proyectante que la contiene; el corte se ve directamente en el alzado.',
        },
        {
            id: 'ex-intersection-plane-plane',
            title: 'Intersección plano-plano',
            level: 'Difícil',
            statement: 'Halla la recta intersección de los planos P: z = 2 y Q: y = 3.',
            setup: [pl('P', [0, 0, 1], -2), pl('Q', [0, 1, 0], -3, '#a78bfa')],
            solutionHint: 'Los puntos de la intersección cumplen las dos condiciones a la vez: la recta es paralela a la LT.',
        },
    ],

    'theory-5-parallelism': [
        {
            id: 'ex-parallel-line',
            title: 'Paralela a una recta por un punto',
            level: 'Fácil',
            statement: 'Traza por P(2, 6, 5) una recta paralela a r, que pasa por A(0, 2, 1) y B(8, 2, 5).',
            setup: [p('A', 0, 2, 1), p('B', 8, 2, 5), p('P', 2, 6, 5, '#a78bfa'), l('r', [0, 2, 1], [8, 0, 4])],
            solutionHint: 'Dos rectas son paralelas si sus proyecciones homónimas lo son: copia la dirección de r′ y r″ por P.',
        },
        {
            id: 'ex-perpendicular-plane',
            title: 'Recta perpendicular a un plano',
            level: 'Medio',
            statement: 'Por P(2, 4, 6) traza la recta perpendicular al plano y = 4.',
            setup: [p('P', 2, 4, 6, '#a78bfa'), pl('P', [0, 1, 0], -4)],
            solutionHint: 'La dirección de la perpendicular es la normal del plano: (0, 1, 0). En la planta se ve perpendicular a la traza.',
        },
    ],

    'theory-6-distances': [
        {
            id: 'ex-distance-point-plane',
            title: 'Distancia de un punto a un plano',
            level: 'Medio',
            statement: 'Calcula la distancia de P(3, 5, 7) al plano horizontal z = 2.',
            setup: [p('P', 3, 5, 7, '#a78bfa'), pl('Q', [0, 0, 1], -2)],
            solutionHint: 'La distancia es la diferencia de cotas: 7 − 2 = 5. Con un plano inclinado habría que trazar la perpendicular.',
        },
        {
            id: 'ex-distance-point-line',
            title: 'Distancia de un punto a una recta',
            level: 'Difícil',
            statement: 'Halla la distancia del punto P(4, 6, 2) a la recta r, que pasa por A(0, 6, 2) y B(8, 6, 2).',
            setup: [p('A', 0, 6, 2), p('B', 8, 6, 2), p('P', 4, 6, 2, '#a78bfa'), l('r', [0, 6, 2], [8, 0, 0])],
            solutionHint: 'La recta es paralela al PH (cota constante): la distancia se ve en planta, perpendicular a r′ desde P′.',
        },
    ],

    'theory-7-angles': [
        {
            id: 'ex-angle-lines',
            title: 'Ángulo entre dos rectas',
            level: 'Medio',
            statement: 'Calcula el ángulo que forman la recta r (dirección (1, 0, 0)) y la recta s (dirección (0, 1, 0)).',
            setup: [l('r', [0, 4, 4], [1, 0, 0]), l('s', [4, 0, 4], [0, 1, 0], '#a78bfa')],
            solutionHint: 'Se cortan en ángulo recto: 90°. Puedes comprobarlo abatiendo el plano que las contiene.',
        },
        {
            id: 'ex-angle-planes',
            title: 'Ángulo entre dos planos',
            level: 'Difícil',
            statement: 'Calcula el ángulo entre el plano horizontal z = 0 y el plano x + z = 0.',
            setup: [pl('P', [0, 0, 1], 0), pl('Q', [1, 0, 1], 0, '#a78bfa')],
            solutionHint: 'Es el ángulo entre sus normales: cos α = |n₁·n₂| / (|n₁||n₂|) = 1/√2 → 45°.',
        },
    ],

    'theory-8-flattening': [
        {
            id: 'ex-flatten-point',
            title: 'Abatir un punto',
            level: 'Difícil',
            statement: 'El punto A(3, 4, 5) pertenece al plano y = 4. Abátelo sobre el horizontal.',
            setup: [p('A', 3, 4, 5), pl('P', [0, 1, 0], -4)],
            solutionHint: 'Charnela: la recta y = 4, z = 0. Radio de giro: √(4² + 5²). Llévalo desde la charnela en la planta.',
        },
        {
            id: 'ex-flatten-vm',
            title: 'Verdadera magnitud por abatimiento',
            level: 'Difícil',
            statement: 'Abate el plano que contiene al segmento AB y mide su verdadera magnitud. A(0, 2, 2), B(6, 5, 6).',
            setup: [p('A', 0, 2, 2), p('B', 6, 5, 6), { type: 'segment', name: 'AB', p1: { x: 0, y: 2, z: 2 }, p2: { x: 6, y: 5, z: 6 }, color: '#f59e0b' } as Partial<any>],
            solutionHint: 'VM = √(6² + 3² + 4²) = √61 ≈ 7,81. Al abatir, el segmento se ve en su longitud real.',
        },
    ],

    'theory-9-rotations': [
        {
            id: 'ex-rotation-point',
            title: 'Girar un punto 90°',
            level: 'Medio',
            statement: 'Gira A(6, 4, 2) 90° alrededor del eje vertical que pasa por el origen.',
            setup: [p('A', 6, 4, 2), l('eje', [0, 0, 0], [0, 0, 1], '#94a3b8')],
            solutionHint: 'La cota no cambia. En planta, (6,4) gira a (−4,6).',
        },
        {
            id: 'ex-rotation-parallel',
            title: 'Recta paralela a la LT por giro',
            level: 'Difícil',
            statement: 'Gira la recta r alrededor del eje vertical hasta dejarla paralela a la línea de tierra.',
            setup: [p('A', 0, 3, 6), p('B', 8, 7, 6), l('r', [0, 3, 6], [8, 4, 0]), l('eje', [4, 4, 0], [0, 0, 1], '#94a3b8')],
            solutionHint: 'En planta, gira r′ hasta que quede paralela a la LT; las dos proyecciones quedarán paralelas a la LT.',
        },
    ],

    'theory-10-plane-changes': [
        {
            id: 'ex-change-plane-vm',
            title: 'Verdadera magnitud por cambio de plano',
            level: 'Difícil',
            statement: 'Halla la verdadera magnitud de AB mediante un cambio de plano. A(0, 2, 2), B(6, 5, 6).',
            setup: [p('A', 0, 2, 2), p('B', 6, 5, 6), { type: 'segment', name: 'AB', p1: { x: 0, y: 2, z: 2 }, p2: { x: 6, y: 5, z: 6 }, color: '#f59e0b' } as Partial<any>],
            solutionHint: 'Nueva LT paralela a A′B′; lleva las cotas perpendiculares. La nueva proyección está en VM.',
        },
        {
            id: 'ex-change-plane-canto',
            title: 'Ver un plano de canto',
            level: 'Difícil',
            statement: 'Haz un cambio de plano para ver de canto el plano que contiene a la recta r y al punto P.',
            setup: [p('A', 0, 2, 4), p('B', 8, 6, 4), p('P', 4, 4, 8, '#a78bfa'), l('r', [0, 2, 4], [8, 4, 0]), pl('α', [0, 4, -2], 0)],
            solutionHint: 'Traza una recta horizontal del plano y pon la nueva LT perpendicular a su proyección horizontal.',
        },
    ],

    'theory-11-polyhedra': [
        {
            id: 'ex-cube-draw',
            title: 'Cubo apoyado en el PH',
            level: 'Medio',
            statement: 'Dibuja un cubo de 6 unidades de arista apoyado en el plano horizontal, con una cara paralela al PV.',
            setup: [p('O', 4, 4, 0), solid('Cubo', 'cube', [4, 4, 4], 4)],
            solutionHint: 'En planta, un cuadrado en VM; en alzado, otro cuadrado a la altura de la arista. Las aristas ocultas van discontinuas.',
        },
        {
            id: 'ex-tetrahedron',
            title: 'Tetraedro',
            level: 'Difícil',
            statement: 'Dibuja un tetraedro regular y localiza sus aristas ocultas en alzado y planta.',
            setup: [p('O', 6, 6, 4), solid('Tetraedro', 'tetrahedron', [6, 6, 4], 4, '#ef4444')],
            solutionHint: 'La base es un triángulo equilátero; el vértice superior se proyecta en el centro de la base.',
        },
    ],

    'theory-12-surfaces': [
        {
            id: 'ex-cylinder',
            title: 'Cilindro recto',
            level: 'Fácil',
            statement: 'Dibuja un cilindro de radio 3 y altura 8 apoyado en el PH y señala su contorno aparente.',
            setup: [p('O', 5, 5, 0), solid('Cilindro', 'cylinder', [5, 5, 4], 3)],
            solutionHint: 'Planta: circunferencia de radio 3. Alzado: rectángulo de 6 × 8. El contorno son las dos generatrices extremas.',
        },
        {
            id: 'ex-cone',
            title: 'Cono recto',
            level: 'Medio',
            statement: 'Dibuja un cono de radio 4 y altura 7 y explica por qué en planta se ve una circunferencia.',
            setup: [p('O', 6, 6, 0), solid('Cono', 'cone', [6, 6, 3.5], 4, '#f59e0b')],
            solutionHint: 'Todas las generatrices van del vértice a la base; en planta se superponen y solo se ve la circunferencia.',
        },
    ],

    'theory-13-sections': [
        {
            id: 'ex-section-cube',
            title: 'Sección de un cubo por un plano horizontal',
            level: 'Difícil',
            statement: 'El cubo está apoyado en el PH. Dibuja la sección que produce un plano horizontal a media altura.',
            setup: [p('O', 5, 5, 0), solid('Cubo', 'cube', [5, 5, 4], 4), pl('Corte', [0, 0, 1], -4, '#f59e0b')],
            solutionHint: 'La sección es un cuadrado paralelo a la base, del mismo tamaño. En planta se ve en VM.',
        },
        {
            id: 'ex-section-prism',
            title: 'Sección por un plano proyectante',
            level: 'Difícil',
            statement: 'Dibuja la sección de un prisma por un plano proyectante vertical y explica dónde se ve directamente.',
            setup: [p('O', 5, 5, 0), solid('Prisma', 'prism', [5, 5, 4], 3), pl('Corte', [0, 1, 0.2], -5, '#f59e0b')],
            solutionHint: 'En la vista donde el plano se ve de canto (alzado), la sección aparece como un segmento: sus extremos son los puntos de corte con las aristas.',
        },
    ],

    'theory-14-developments': [
        {
            id: 'ex-development-prism',
            title: 'Desarrollo de un prisma',
            level: 'Medio',
            statement: 'Dibuja el desarrollo de un prisma hexagonal de radio 3 y altura 8.',
            setup: [p('O', 6, 6, 0), solid('Prisma', 'prism', [6, 6, 4], 3)],
            solutionHint: 'Seis rectángulos de base el lado del hexágono (igual al radio en un hexágono regular) y altura 8, más las dos bases.',
        },
        {
            id: 'ex-development-cylinder',
            title: 'Desarrollo de un cilindro',
            level: 'Fácil',
            statement: 'Calcula las dimensiones del desarrollo lateral de un cilindro de radio 3 y altura 8.',
            setup: [p('O', 6, 6, 0), solid('Cilindro', 'cylinder', [6, 6, 4], 3)],
            solutionHint: 'Rectángulo de base 2πr ≈ 18,85 y altura 8, más dos círculos de radio 3.',
        },
    ],
};
