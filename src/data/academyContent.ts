import { GeometryElement } from "../types";

export interface AcademyExercise {
    id: string;
    title: string;
    level: 'Fácil' | 'Medio' | 'Difícil';
    statement: string;
    setup: Partial<GeometryElement>[]; // Elements to load
    solutionHint?: string;
}

export interface AcademyTopic {
    id: string;
    title: string;
    description: string;
    category: 'Teoría' | 'Aplicación' | 'Exámenes';
    theoryContent: string; // Markdown-like or HTML
    exercises: AcademyExercise[];
}

export const ACADEMY_CONTENT: AcademyTopic[] = [
    // BLOQUE 1: TEORÍA
    {
        id: 'theory-1-point',
        title: '1. Introducción: El Punto',
        description: 'Fundamentos del Sistema Diédrico. Planos de proyección, coordenadas y alfabeto del punto.',
        category: 'Teoría',
        theoryContent: `
            <div class="space-y-6 text-gray-300">
                <p class="lead text-xl text-white">
                    El <strong>Sistema Diédrico</strong> es un método de representación geométrica que utiliza dos planos de proyección principales, perpendiculares entre sí, para describir objetos tridimensionales en una superficie bidimensional (el papel).
                </p>

                <div class="bg-gray-800 p-6 rounded-xl border border-blue-900/30">
                    <h3 class="text-xl font-bold text-blue-400 mb-4">Los Elementos Fundamentales</h3>
                    <ul class="list-disc pl-5 space-y-2">
                        <li><strong>Plano Vertical (PV):</strong> Imagina una pared frente a ti. Aquí se proyecta la "vista frontal" o <em>Alzados</em>.</li>
                        <li><strong>Plano Horizontal (PH):</strong> Imagina el suelo. Aquí se proyecta la "vista superior" o <em>Plantas</em>.</li>
                        <li><strong>Línea de Tierra (LT):</strong> Es la recta de intersección entre el PV y el PH. Es el eje de referencia principal.</li>
                    </ul>
                </div>

                <h3 class="text-xl font-bold text-white mt-8">Coordenadas del Punto (X, Y, Z)</h3>
                <p>
                    Todo punto en el espacio queda definido por tres valores que determinan su posición exacta:
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                    <div class="p-4 bg-gray-800 rounded-lg">
                        <strong class="text-red-400 block mb-2">X: Lateralidad</strong>
                        <p class="text-sm">Posición a lo largo de la Línea de Tierra (izquierda o derecha).</p>
                    </div>
                    <div class="p-4 bg-gray-800 rounded-lg">
                        <strong class="text-green-400 block mb-2">Y: Alejamiento</strong>
                        <p class="text-sm">Distancia al Plano Vertical (cuánto se acerca a ti desde la pared).</p>
                    </div>
                    <div class="p-4 bg-gray-800 rounded-lg">
                        <strong class="text-blue-400 block mb-2">Z: Cota</strong>
                        <p class="text-sm">Altura respecto al Plano Horizontal (cuánto sube desde el suelo).</p>
                    </div>
                </div>

                <h3 class="text-xl font-bold text-white mt-8">Los Cuadrantes</h3>
                <p>
                    Los dos planos delimitan cuatro espacios o <em>Cuadrantes</em>:
                </p>
                <ul class="list-disc pl-5 space-y-2">
                    <li><strong>I Cuadrante:</strong> Cota (+) y Alejamiento (+). (Arriba y Adelante). Es el más común.</li>
                    <li><strong>II Cuadrante:</strong> Cota (+) y Alejamiento (-). (Arriba y Atrás).</li>
                    <li><strong>III Cuadrante:</strong> Cota (-) y Alejamiento (-). (Abajo y Atrás).</li>
                    <li><strong>IV Cuadrante:</strong> Cota (-) y Alejamiento (+). (Abajo y Adelante).</li>
                </ul>
            </div>
        `,
        exercises: [
            {
                id: 'ex-point-1',
                title: 'Situar Puntos en Cuadrantes',
                level: 'Fácil',
                statement: 'Representa tres puntos: A en el I Cuadrante, B en el II Cuadrante y C en el plano Horizontal posterior.',
                setup: [
                    // No setup, user draws
                ],
                solutionHint: 'A(+,+), B(+,-), C(0,-). Usa la herramienta "Punto 3D" e introduce las coordenadas manualmente.'
            }
        ]
    },
    {
        id: 'theory-2-line',
        title: '2. La Recta',
        description: 'Definición, trazas y clasificación de rectas. Rectas horizontales, frontales y de perfil.',
        category: 'Teoría',
        theoryContent: `
             <div class="space-y-6 text-gray-300">
                <p>
                    Una recta queda definida por dos puntos. En diédrico, sus proyecciones son también líneas rectas.
                </p>
                <h3 class="text-xl font-bold text-white">Trazas de la Recta</h3>
                <p>
                    Son los puntos donde la recta perfora a los planos de proyección:
                </p>
                <ul class="list-disc pl-5 space-y-2">
                    <li><strong>Traza Vertical (Pv):</strong> Punto donde la recta corta al PV. Su alejamiento es 0.</li>
                    <li><strong>Traza Horizontal (Ph):</strong> Punto donde la recta corta al PH. Su cota es 0.</li>
                </ul>

                <h3 class="text-xl font-bold text-white mt-8">Alfabeto de la Recta</h3>
                <div class="grid gap-4 mt-4">
                    <div class="border-l-4 border-yellow-500 pl-4 py-2 bg-gray-800/50">
                        <strong class="text-white">Recta Horizontal</strong>
                        <p class="text-sm text-gray-400">Paralela al PH. Su proyección vertical es paralela a LT.</p>
                    </div>
                <h3 class="text-xl font-bold text-white mt-8">Resumen: Tipos de Rectas</h3>
                <div class="overflow-x-auto mt-4">
                    <table class="w-full text-sm text-left text-gray-300 border border-gray-700">
                        <thead class="text-xs uppercase bg-gray-800 text-gray-200">
                            <tr>
                                <th class="px-4 py-3 border-b border-gray-700">Tipo de Recta</th>
                                <th class="px-4 py-3 border-b border-gray-700">Proyección Vertical (r'')</th>
                                <th class="px-4 py-3 border-b border-gray-700">Proyección Horizontal (r')</th>
                                <th class="px-4 py-3 border-b border-gray-700">Propiedad Clave</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-gray-900 border-b border-gray-800">
                                <td class="px-4 py-3 font-medium text-white">Horizontal</td>
                                <td class="px-4 py-3">Paralela a LT</td>
                                <td class="px-4 py-3">Oblicua a LT</td>
                                <td class="px-4 py-3 text-blue-400">Cota constante</td>
                            </tr>
                            <tr class="bg-gray-900 border-b border-gray-800">
                                <td class="px-4 py-3 font-medium text-white">Frontal</td>
                                <td class="px-4 py-3">Oblicua a LT</td>
                                <td class="px-4 py-3">Paralela a LT</td>
                                <td class="px-4 py-3 text-blue-400">Alejamiento constante</td>
                            </tr>
                            <tr class="bg-gray-900 border-b border-gray-800">
                                <td class="px-4 py-3 font-medium text-white">De Perfil</td>
                                <td class="px-4 py-3">Perpendicular a LT</td>
                                <td class="px-4 py-3">Perpendicular a LT</td>
                                <td class="px-4 py-3 text-blue-400">Necesita Tercera Proyección</td>
                            </tr>
                            <tr class="bg-gray-900 border-b border-gray-800">
                                <td class="px-4 py-3 font-medium text-white">Vertical</td>
                                <td class="px-4 py-3">Perpendicular a LT</td>
                                <td class="px-4 py-3">Punto</td>
                                <td class="px-4 py-3 text-blue-400">Perpendicular al PH</td>
                            </tr>
                            <tr class="bg-gray-900">
                                <td class="px-4 py-3 font-medium text-white">De Punta</td>
                                <td class="px-4 py-3">Punto</td>
                                <td class="px-4 py-3">Perpendicular a LT</td>
                                <td class="px-4 py-3 text-blue-400">Perpendicular al PV</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `,
        exercises: [
            {
                id: 'ex-line-horiz',
                title: 'Recta Horizontal',
                level: 'Fácil',
                statement: 'Dados los puntos A(10, 20, 30) y B(50, 40, 30), únelos y verifica que es una recta horizontal.',
                setup: [
                    { type: 'point', name: 'A', coords: { x: 10, y: 20, z: 30 }, visible: true, color: '#3b82f6' },
                    { type: 'point', name: 'B', coords: { x: 50, y: 40, z: 30 }, visible: true, color: '#3b82f6' }
                ],
                solutionHint: 'Observa que ambos tienen cota Z=30. Al unirlos, la proyección vertical será paralela a la Línea de Tierra.'
            }
        ]
    },
    {
        id: 'theory-3-plane',
        title: '3. El Plano',
        description: 'Definición mediante trazas. Planos proyectantes, oblicuos y paralelos a LT.',
        category: 'Teoría',
        theoryContent: `
             <div class="space-y-6 text-gray-300">
                <p>
                    Un plano se define por sus trazas (intersecciones con los planos de proyección).
                </p>
                <h3 class="text-xl font-bold text-white">Clasificación de Planos</h3>
                <div class="overflow-x-auto mt-4">
                    <table class="w-full text-sm text-left text-gray-300 border border-gray-700">
                        <thead class="text-xs uppercase bg-gray-800 text-gray-200">
                            <tr>
                                <th class="px-4 py-3 border-b border-gray-700">Tipo de Plano</th>
                                <th class="px-4 py-3 border-b border-gray-700">Traza Vertical (Alpha_2)</th>
                                <th class="px-4 py-3 border-b border-gray-700">Traza Horizontal (Alpha_1)</th>
                                <th class="px-4 py-3 border-b border-gray-700">Característica</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-gray-900 border-b border-gray-800">
                                <td class="px-4 py-3 font-medium text-white">Proyectante Horizontal</td>
                                <td class="px-4 py-3">Perpendicular a LT</td>
                                <td class="px-4 py-3">Oblicua</td>
                                <td class="px-4 py-3 text-green-400">Todo lo contenido se ve en planta</td>
                            </tr>
                            <tr class="bg-gray-900 border-b border-gray-800">
                                <td class="px-4 py-3 font-medium text-white">Proyectante Vertical</td>
                                <td class="px-4 py-3">Oblicua</td>
                                <td class="px-4 py-3">Perpendicular a LT</td>
                                <td class="px-4 py-3 text-green-400">Todo lo contenido se ve en alzado</td>
                            </tr>
                            <tr class="bg-gray-900 border-b border-gray-800">
                                <td class="px-4 py-3 font-medium text-white">Horizontal</td>
                                <td class="px-4 py-3">Paralela a LT</td>
                                <td class="px-4 py-3 text-gray-500">-(Impropia)</td>
                                <td class="px-4 py-3 text-green-400">Paralelo al PH</td>
                            </tr>
                            <tr class="bg-gray-900">
                                <td class="px-4 py-3 font-medium text-white">Frontal</td>
                                <td class="px-4 py-3 text-gray-500">-(Impropia)</td>
                                <td class="px-4 py-3">Paralela a LT</td>
                                <td class="px-4 py-3 text-green-400">Paralelo al PV</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `,
        exercises: [
            {
                id: 'ex-plane-proj',
                title: 'Plano Proyectante',
                level: 'Medio',
                statement: 'Dibuja un plano Proyectante Vertical que pase por el punto A(20, 20, 20) y forme 45 grados con el PH.',
                setup: [
                    { type: 'point', name: 'A', coords: { x: 20, y: 20, z: 20 }, visible: true, color: '#3b82f6' }
                ],
                solutionHint: 'Su traza horizontal debe ser perpendicular a LT. Su traza vertical pasará por A\'\' y formará 45º con LT.'
            }
        ]
    },
    // BLOQUE 2: APLICACIÓN
    {
        id: 'app-1-hex',
        title: 'Pirámide Hexagonal',
        description: 'Construcción paso a paso de una pirámide regular con base hexagonal.',
        category: 'Aplicación',
        theoryContent: '<p>Ejercicio práctico de construcción.</p>',
        exercises: [
            {
                id: 'ex-pyr-hex',
                title: 'Base Hexagonal',
                level: 'Medio',
                statement: 'Dibuja un hexágono regular de radio 30 apoyado en el Plano Horizontal, con centro en (50, 40, 0). Luego eleva una pirámide de altura 60.',
                setup: [],
                solutionHint: 'Usa "Polígono" en modo Boceto o construye punto a punto.'
            }
        ]
    },
    // BLOQUE 3: EXÁMENES
    {
        id: 'pau-madrid-2014',
        title: 'PAU Madrid 2014',
        description: 'Resolución del examen de Junio 2014.',
        category: 'Exámenes',
        theoryContent: '<p>Análisis de los problemas de examen.</p>',
        exercises: [
            {
                id: 'pau-2014-a2',
                title: 'Ejercicio A2: Distancias',
                level: 'Difícil',
                statement: 'Determinar la distancia real entre las rectas r y s dadas.',
                setup: [
                    { type: 'line', name: 'r', point: { x: 0, y: 20, z: 10 }, direction: { x: 1, y: 1, z: 0 }, isInfinite: true, visible: true, color: '#ef4444' },
                    { type: 'line', name: 's', point: { x: 0, y: 50, z: 60 }, direction: { x: 1, y: -1, z: 0 }, isInfinite: true, visible: true, color: '#3b82f6' }
                ],
                solutionHint: 'Son rectas que se cruzan. Usa la herramienta "Distancia Recta-Recta" o constrúyelo mediante plano paralelo.'
            }
        ]
    }
];
