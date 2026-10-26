/**
 * Una página por bloque del temario. El `topic` tiene que coincidir con el de
 * `EXERCISES` (hay un test que lo comprueba): así el listado de ejercicios de
 * cada bloque se genera solo y no hay dos listas que se puedan desfasar.
 *
 * Estas páginas existen para buscar cosas como «abatimientos ejercicios
 * resueltos PAU», no para repetir la lista de ejercicios. Por eso cada una
 * explica el bloque y enlaza a la práctica.
 */

export interface TopicPage {
    /** Nombre del tema, idéntico a `exercise.topic`. */
    topic: string;
    /** Ruta: /temario/<slug>. */
    slug: string;
    /** <title> (≤ 65 caracteres). */
    title: string;
    /** H1 de la página. */
    heading: string;
    /** Meta description (80-160 caracteres). */
    description: string;
    intro: string;
    /** Lo que hay que saber hacer al terminar el bloque. */
    learn: string[];
    /** Método de resolución, en orden. */
    steps: string[];
    /** Cómo suele aparecer en la PAU/EBAU. */
    exam: string;
}

export const TOPIC_PAGES: TopicPage[] = [
    {
        topic: 'La recta',
        slug: 'la-recta',
        title: 'La recta en diédrico: trazas y proyecciones',
        heading: 'La recta en sistema diédrico',
        description:
            'Trazas, proyecciones y posiciones de una recta en diédrico: cómo dibujarla por dos puntos, leer sus trazas y distinguir rectas de perfil.',
        intro:
            'Una recta queda definida en diédrico por sus dos proyecciones. Sus trazas son los puntos en los que atraviesa los planos de proyección: la traza horizontal H, donde corta al plano horizontal, y la vertical V, donde corta al vertical. Con esas dos trazas la recta está determinada, y a partir de ellas se resuelven casi todos los ejercicios del bloque.',
        learn: [
            'Dibujar una recta por dos puntos dados y nombrar sus proyecciones r′ y r″.',
            'Hallar las trazas H y V y colocarlas en su sitio: sobre la línea de tierra y con la otra proyección en ella.',
            'Distinguir recta horizontal, frontal, de perfil, paralela a la línea de tierra y recta que pasa por ella.',
            'Reconocer por qué cuadrantes pasa una recta según dónde caigan sus trazas.',
        ],
        steps: [
            'Proyecta los dos puntos: cada uno con su cota (alzado) y su alejamiento (planta).',
            'Une las proyecciones homónimas: r′ con r′ y r″ con r″.',
            'Donde una proyección corta la línea de tierra está la traza de ese plano; súbela o bájala a la otra proyección.',
            'Comprueba el resultado: la traza horizontal tiene cota 0 y la vertical, alejamiento 0.',
        ],
        exam:
            'Suele aparecer como punto de partida de otro ejercicio: «dada la recta r definida por los puntos A y B...». Si la recta es de perfil, no basta con las dos proyecciones habituales: hay que llevar los puntos a la tercera proyección para fijarla.',
    },
    {
        topic: 'Intersecciones',
        slug: 'intersecciones',
        title: 'Intersecciones en diédrico: recta-plano y plano-plano',
        heading: 'Intersecciones: recta con plano y plano con plano',
        description:
            'Cómo hallar la intersección de una recta con un plano y de dos planos en sistema diédrico, con el plano proyectante auxiliar y las trazas homónimas.',
        intro:
            'Hay dos intersecciones que se repiten en todos los ejercicios: recta con plano y plano con plano. La primera se resuelve metiendo la recta en un plano proyectante auxiliar; la segunda, con los puntos en que se cortan las trazas homónimas de los dos planos. El resto del bloque son variantes: planos paralelos a la línea de tierra, planos de perfil y planos que no se cortan dentro del papel.',
        learn: [
            'Hallar el punto donde una recta atraviesa un plano, con plano proyectante auxiliar.',
            'Trazar la recta intersección de dos planos dados por sus trazas.',
            'Resolver el caso en que las trazas son paralelas y el corte queda fuera del dibujo.',
            'Comprobar si el punto hallado pertenece de verdad a los dos elementos.',
        ],
        steps: [
            'Recta y plano: contiene la recta en un plano proyectante (por ejemplo, uno vertical que la proyecte de canto).',
            'Halla la recta intersección de ese plano auxiliar con el dado: donde se cortan sus trazas homónimas.',
            'Esa recta y la recta inicial se cortan en el punto buscado. Comprueba que está en las dos proyecciones.',
            'Plano con plano: une el corte de las trazas horizontales con el de las verticales; esa es la recta intersección.',
        ],
        exam:
            'Es la base de las distancias y de los ángulos: casi ningún ejercicio de la PAU se resuelve sin una intersección previa. Cuando las trazas no se cortan dentro del dibujo, se alarga la línea de tierra o se usa un plano auxiliar; no se inventa el punto.',
    },
    {
        topic: 'Distancias',
        slug: 'distancias',
        title: 'Distancias en diédrico: punto, recta y plano',
        heading: 'Distancias en sistema diédrico',
        description:
            'Distancia de un punto a un plano, a una recta y entre rectas que se cruzan en diédrico, con perpendicular, pie y verdadera magnitud.',
        intro:
            'Medir una distancia en diédrico es siempre el mismo esquema: buscar la perpendicular, encontrar el pie y medir el segmento en verdadera magnitud. Lo que cambia es sobre qué se traza la perpendicular y cómo se abate después el segmento para verlo a tamaño real.',
        learn: [
            'Distancia de un punto a un plano: perpendicular por el punto, pie y verdadera magnitud.',
            'Distancia de un punto a una recta: plano perpendicular a la recta por el punto.',
            'Distancia entre dos rectas que se cruzan: plano paralelo a una que contenga a la otra.',
            'Distancia entre planos paralelos: se mide sobre una perpendicular común.',
        ],
        steps: [
            'Traza por el punto la perpendicular al elemento de referencia (recta o plano).',
            'Halla la intersección de esa perpendicular con el elemento: ese es el pie.',
            'Abate el segmento punto-pie o llévalo a verdadera magnitud con un cambio de plano.',
            'Mide sobre la verdadera magnitud, nunca sobre una proyección.',
        ],
        exam:
            '«Halla la distancia del punto P al plano α» es un clásico. También aparece como distancia de un punto a una recta y, menos, entre rectas que se cruzan. El error típico es medir el segmento en el alzado o en la planta tal cual: ahí no está en verdadera magnitud.',
    },
    {
        topic: 'Paralelismo',
        slug: 'paralelismo',
        title: 'Paralelismo en diédrico: rectas y planos',
        heading: 'Paralelismo entre rectas y planos',
        description:
            'Cuándo son paralelas dos rectas, una recta y un plano, o dos planos en diédrico, y cómo trazar el plano paralelo a otro por un punto.',
        intro:
            'El paralelismo en diédrico se apoya en una idea sencilla: si dos elementos son paralelos en el espacio, sus proyecciones homónimas también lo son. La excepción son las rectas de perfil, que necesitan la tercera proyección porque dos rectas de perfil pueden tener las proyecciones paralelas y no serlo en el espacio.',
        learn: [
            'Reconocer dos rectas paralelas por sus proyecciones homónimas.',
            'Trazar por un punto una recta paralela a otra dada.',
            'Comprobar si una recta es paralela a un plano.',
            'Dibujar el plano paralelo a uno dado que pasa por un punto exterior.',
        ],
        steps: [
            'Recta paralela a un plano: basta con que sea paralela a una recta contenida en el plano.',
            'Plano paralelo a otro por un punto: por el punto se traza una recta paralela a una del plano y se completa el plano con una segunda dirección.',
            'Dos planos por trazas son paralelos si sus trazas homónimas son paralelas.',
            'Si hay rectas de perfil, comprueba en la tercera proyección antes de afirmar que son paralelas.',
        ],
        exam:
            'Aparece como «traza el plano paralelo a α que pasa por P» y como paso intermedio en ángulos y distancias. Ojo con las rectas de perfil: es el caso que se cuela en los exámenes y el que más se falla.',
    },
    {
        topic: 'Abatimientos',
        slug: 'abatimientos',
        title: 'Abatimientos en diédrico: cómo abatir un plano',
        heading: 'Abatimientos: ver el plano en verdadera magnitud',
        description:
            'Qué es abatir un plano en diédrico, cómo se elige la charnela y cómo se abate un punto para ver distancias y figuras en verdadera magnitud.',
        intro:
            'Abatir un plano es girarlo alrededor de una de sus trazas hasta hacerlo coincidir con un plano de proyección. Al abatirlo, todo lo que contiene aparece en verdadera magnitud: distancias, ángulos y figuras planas dejan de estar escorzadas. La traza sobre la que se gira se llama charnela.',
        learn: [
            'Elegir la charnela: la traza horizontal para abatir sobre el plano horizontal, la vertical para el vertical.',
            'Abatir un punto: perpendicular a la charnela y llevar la cota (o el alejamiento) desde ella.',
            'Abatir una recta a partir de sus trazas.',
            'Usar el abatimiento para medir un segmento, un ángulo o dibujar una figura contenida en el plano.',
        ],
        steps: [
            'Elige la charnela y marca la traza del plano sobre la que vas a girar.',
            'Por la proyección del punto traza la perpendicular a la charnela.',
            'Sobre esa perpendicular lleva la cota (si abates sobre el horizontal) o el alejamiento (si abates sobre el vertical).',
            'Une los puntos abatidos para obtener la figura en verdadera magnitud.',
        ],
        exam:
            'Es la herramienta para «verdadera magnitud de la sección» y para dibujar polígonos contenidos en un plano. También se usa para medir ángulos. El error habitual es llevar la distancia equivocada (cota en vez de alejamiento) o no trazar la perpendicular a la charnela.',
    },
    {
        topic: 'Ángulos',
        slug: 'angulos',
        title: 'Ángulos en diédrico: rectas y planos',
        heading: 'Ángulos entre rectas y planos',
        description:
            'Cómo medir el ángulo entre dos rectas, entre una recta y un plano y entre dos planos en diédrico, sin medir sobre proyecciones escorzadas.',
        intro:
            'Un ángulo solo se puede medir en verdadera magnitud. En diédrico eso significa abatir, girar o cambiar de plano hasta que los dos elementos que forman el ángulo estén paralelos al plano de proyección. Nunca se mide sobre una proyección escorzada: el número que sale no es el del enunciado.',
        learn: [
            'Ángulo entre dos rectas que se cortan: abatir el plano que las contiene.',
            'Ángulo entre dos rectas que se cruzan: trasladar una paralela hasta que corte a la otra.',
            'Ángulo entre recta y plano: ángulo entre la recta y su proyección sobre el plano.',
            'Ángulo entre dos planos: ángulo entre sus rectas de máxima pendiente, o entre sus normales.',
        ],
        steps: [
            'Identifica los dos elementos y busca un plano que los contenga o que sea paralelo a los dos.',
            'Abate ese plano o cámbialo de plano hasta verlo en verdadera magnitud.',
            'Mide el ángulo sobre el abatimiento, no sobre las proyecciones originales.',
            'Comprueba el orden de magnitud: un ángulo entre planos nunca pasa de 90°.',
        ],
        exam:
            '«Ángulo que forma la recta r con el plano α» y «ángulo entre dos planos» son los dos enunciados típicos. En el segundo, el atajo es usar las normales: el ángulo entre planos es el mismo que el que forman sus perpendiculares.',
    },
    {
        topic: 'Perpendicularidad',
        slug: 'perpendicularidad',
        title: 'Perpendicularidad en diédrico: recta y plano',
        heading: 'Perpendicularidad entre rectas y planos',
        description:
            'Recta perpendicular a un plano y plano perpendicular a una recta en diédrico: cómo son sus proyecciones y cómo comprobarlo con las tres perpendiculares.',
        intro:
            'La perpendicularidad entre recta y plano tiene una regla muy concreta en diédrico: las proyecciones de la recta son perpendiculares a las trazas homónimas del plano. Es decir, r′ es perpendicular a α₁ y r″ lo es a α₂. Con esa regla se resuelven tanto la perpendicular por un punto como el plano perpendicular a una recta.',
        learn: [
            'Trazar la recta perpendicular a un plano por un punto dado.',
            'Dibujar el plano perpendicular a una recta por un punto.',
            'Reconocer cuándo dos rectas son perpendiculares aunque no se vean a 90° en ninguna proyección.',
            'Usar el teorema de las tres perpendiculares en los casos de rectas que se cruzan.',
        ],
        steps: [
            'Recta perpendicular a un plano: por el punto traza r′ perpendicular a α₁ y r″ perpendicular a α₂.',
            'Plano perpendicular a una recta: haz que sus trazas sean perpendiculares a las proyecciones de la recta.',
            'Si el plano es proyectante, la perpendicular es una recta de punta o de pie: compruébalo en la proyección que corresponda.',
            'Para dos rectas que se cortan, abate el plano que las contiene y comprueba allí el ángulo de 90°.',
        ],
        exam:
            'Se pide «recta perpendicular al plano α que pasa por P» y, al revés, «plano perpendicular a r por P». También aparece como paso previo de las distancias: la perpendicular es la que permite encontrar el pie.',
    },
    {
        topic: 'Verdaderas magnitudes',
        slug: 'verdaderas-magnitudes',
        title: 'Verdaderas magnitudes: cambios de plano y giros',
        heading: 'Verdaderas magnitudes en diédrico',
        description:
            'Cómo ver un segmento, un ángulo o una figura en verdadera magnitud con cambios de plano y giros, y cuándo conviene cada método.',
        intro:
            'Una proyección escorzada no sirve para medir. Para ver un segmento a tamaño real hay dos caminos: cambiar de plano de proyección hasta ponerlo paralelo, o girarlo hasta dejarlo paralelo. Los dos llegan al mismo sitio; el cambio de plano suele ser más rápido y el giro, más fácil de explicar cuando hay muchos elementos.',
        learn: [
            'Elegir entre cambio de plano y giro según el ejercicio.',
            'Cambiar el plano horizontal o el vertical sin perder las cotas ni los alejamientos.',
            'Girar un punto alrededor de un eje perpendicular a un plano de proyección.',
            'Ver un plano de canto y, después, en verdadera forma.',
        ],
        steps: [
            'Cambio de plano: elige la nueva línea de tierra paralela o perpendicular a lo que quieres ver.',
            'Lleva las cotas (o los alejamientos) perpendiculares a la nueva línea de tierra, manteniendo la distancia.',
            'Giro: coloca el eje perpendicular a un plano de proyección y gira hasta que el elemento quede paralelo.',
            'Comprueba que la magnitud no cambia: solo cambia cómo se ve.',
        ],
        exam:
            'Aparece como «verdadera magnitud del segmento AB» y como paso final de distancias y ángulos. Con dos cambios de plano seguidos se ve un plano oblicuo en verdadera forma: primero de canto, después paralelo.',
    },
    {
        topic: 'Giros',
        slug: 'giros',
        title: 'Giros en diédrico: girar puntos, rectas y planos',
        heading: 'Giros en sistema diédrico',
        description:
            'Cómo girar un punto, una recta o un plano en diédrico alrededor de un eje perpendicular a un plano de proyección, paso a paso.',
        intro:
            'Girar es mover un elemento alrededor de un eje hasta dejarlo en una posición cómoda: paralelo a un plano de proyección, de canto o simplemente en otro sitio. En diédrico el eje se coloca perpendicular al horizontal o al vertical, porque así el movimiento de cada punto se ve como una circunferencia en una proyección y como una recta en la otra.',
        learn: [
            'Girar un punto con eje vertical y con eje de punta.',
            'Girar una recta girando dos de sus puntos.',
            'Girar un plano hasta ponerlo de canto o paralelo.',
            'Elegir el eje y el ángulo para que el resultado quede donde interesa.',
        ],
        steps: [
            'Fija el eje: perpendicular al horizontal (vertical) o al vertical (de punta).',
            'Con eje vertical, el punto conserva la cota y se mueve en una circunferencia en la planta.',
            'Con eje de punta, conserva el alejamiento y se mueve en una circunferencia en el alzado.',
            'Gira los puntos necesarios y vuelve a unirlos para reconstruir la recta o el plano.',
        ],
        exam:
            'Se pide girar una recta hasta ponerla paralela a un plano de proyección (para verla en verdadera magnitud) o girar un plano hasta dejarlo proyectante. El error típico es girar la proyección en vez del punto: la cota o el alejamiento que no toca el eje no cambia.',
    },
];

export const TOPIC_BY_SLUG: Record<string, TopicPage> = Object.fromEntries(
    TOPIC_PAGES.map((t) => [t.slug, t])
);
