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
    // 1. EL PUNTO (Profundizado)
    {
        id: 'theory-1-point',
        title: '1. Introducción al Sistema Diédrico: El Punto',
        description: 'Fundamentos, planos de proyección, coordenadas (X, Y, Z) y alfabeto del punto en los 4 cuadrantes.',
        category: 'Teoría',
        theoryContent: `
            <div class="space-y-8 text-gray-300">
                <p class="lead text-xl text-white">
                    Para dominar el dibujo técnico, primero debemos entender el espacio. El <strong>Sistema Diédrico</strong> divide el espacio mediante dos planos infinitos perpendiculares:
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <ul class="list-disc pl-5 space-y-3">
                            <li><strong class="text-blue-400">Plano Vertical (PV):</strong> Lo que tenemos "enfrente". Proyecta el <em>Alzado</em> (cota).</li>
                            <li><strong class="text-green-400">Plano Horizontal (PH):</strong> Lo que tenemos "debajo". Proyecta la <em>Planta</em> (alejamiento).</li>
                            <li><strong class="text-white">Línea de Tierra (LT):</strong> La intersección de ambos. Eje X.</li>
                        </ul>
                    </div>
                    <!-- SVG Diagram: The Dihedral System 3D representation sketch -->
                    <div class="bg-white p-4 rounded-xl flex justify-center items-center">
                         <svg width="200" height="200" viewBox="0 0 200 200">
                            <!-- PV -->
                            <path d="M50 20 L50 100 L150 100 L150 20 Z" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
                            <text x="60" y="40" font-size="12" fill="#1e40af">PV (Alzado)</text>
                            <!-- PH -->
                            <path d="M20 130 L50 100 L150 100 L120 130 Z" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
                            <text x="40" y="125" font-size="12" fill="#166534">PH (Planta)</text>
                            <!-- LT -->
                            <line x1="50" y1="100" x2="150" y2="100" stroke="black" stroke-width="3" />
                            <text x="160" y="105" font-size="12" font-weight="bold">LT</text>
                        </svg>
                    </div>
                </div>

                <h3 class="text-2xl font-bold text-white mt-8 border-b border-gray-700 pb-2">Alfabeto del Punto (Visual)</h3>
                <p>La posición de las proyecciones (p' y p'') respecto a la Línea de Tierra nos indica en qué cuadrante está el punto.</p>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <!-- I Cuadrante -->
                    <div class="bg-gray-800 p-4 rounded-lg flex flex-col items-center border border-gray-700">
                        <strong class="text-white mb-2">I Cuadrante</strong>
                        <span class="text-xs text-gray-400 mb-2">Cota (+) / Alej. (+)</span>
                        <svg width="100" height="100" viewBox="0 0 100 100" class="bg-white rounded">
                            <line x1="10" y1="50" x2="90" y2="50" stroke="black" stroke-width="2" /> <!-- LT -->
                            <line x1="50" y1="20" x2="50" y2="80" stroke="#9ca3af" stroke-dasharray="4" /> <!-- Ref -->
                            <circle cx="50" cy="20" r="3" fill="blue" /> <text x="55" y="25" font-size="10" fill="blue">a''</text>
                            <circle cx="50" cy="80" r="3" fill="green" /> <text x="55" y="85" font-size="10" fill="green">a'</text>
                        </svg>
                        <p class="text-xs text-center mt-2 text-gray-300">a'' arriba<br>a' abajo</p>
                    </div>

                    <!-- II Cuadrante -->
                    <div class="bg-gray-800 p-4 rounded-lg flex flex-col items-center border border-gray-700">
                        <strong class="text-white mb-2">II Cuadrante</strong>
                        <span class="text-xs text-gray-400 mb-2">Cota (+) / Alej. (-)</span>
                        <svg width="100" height="100" viewBox="0 0 100 100" class="bg-white rounded">
                            <line x1="10" y1="50" x2="90" y2="50" stroke="black" stroke-width="2" />
                            <line x1="50" y1="10" x2="50" y2="35" stroke="#9ca3af" stroke-dasharray="4" />
                            <circle cx="50" cy="10" r="3" fill="green" /> <text x="55" y="15" font-size="10" fill="green">b'</text>
                            <circle cx="50" cy="35" r="3" fill="blue" /> <text x="55" y="40" font-size="10" fill="blue">b''</text>
                        </svg>
                        <p class="text-xs text-center mt-2 text-gray-300">Ambas arriba</p>
                    </div>

                    <!-- III Cuadrante -->
                    <div class="bg-gray-800 p-4 rounded-lg flex flex-col items-center border border-gray-700">
                        <strong class="text-white mb-2">III Cuadrante</strong>
                        <span class="text-xs text-gray-400 mb-2">Cota (-) / Alej. (-)</span>
                        <svg width="100" height="100" viewBox="0 0 100 100" class="bg-white rounded">
                            <line x1="10" y1="50" x2="90" y2="50" stroke="black" stroke-width="2" />
                            <line x1="50" y1="20" x2="50" y2="80" stroke="#9ca3af" stroke-dasharray="4" />
                            <circle cx="50" cy="20" r="3" fill="green" /> <text x="55" y="25" font-size="10" fill="green">c'</text>
                            <circle cx="50" cy="80" r="3" fill="blue" /> <text x="55" y="85" font-size="10" fill="blue">c''</text>
                        </svg>
                        <p class="text-xs text-center mt-2 text-gray-300">c' arriba<br>c'' abajo</p>
                    </div>

                    <!-- IV Cuadrante -->
                    <div class="bg-gray-800 p-4 rounded-lg flex flex-col items-center border border-gray-700">
                        <strong class="text-white mb-2">IV Cuadrante</strong>
                        <span class="text-xs text-gray-400 mb-2">Cota (-) / Alej. (+)</span>
                        <svg width="100" height="100" viewBox="0 0 100 100" class="bg-white rounded">
                            <line x1="10" y1="50" x2="90" y2="50" stroke="black" stroke-width="2" />
                            <line x1="50" y1="60" x2="50" y2="90" stroke="#9ca3af" stroke-dasharray="4" />
                            <circle cx="50" cy="60" r="3" fill="blue" /> <text x="55" y="65" font-size="10" fill="blue">d''</text>
                            <circle cx="50" cy="90" r="3" fill="green" /> <text x="55" y="95" font-size="10" fill="green">d'</text>
                        </svg>
                        <p class="text-xs text-center mt-2 text-gray-300">Ambas abajo</p>
                    </div>
                </div>
            </div>
        `,
        exercises: [
            {
                id: 'ex-point-1',
                title: 'Puntos en el Espacio',
                level: 'Fácil',
                statement: 'Representa cuatro puntos, uno en cada cuadrante: A(I), B(II), C(III), D(IV). Observa sus cotas y alejamientos.',
                setup: [],
                solutionHint: 'Recuerda: I(+,+), II(+,-), III(-,-), IV(-,+).'
            }
        ]
    },

    // 2. LA RECTA (Profundizado con Tablas Visuales)
    {
        id: 'theory-2-line',
        title: '2. La Recta',
        description: 'Tipología completa de rectas, sus trazas y cómo identificarlas visualmente en proyecciones.',
        category: 'Teoría',
        theoryContent: `
             <div class="space-y-6 text-gray-300">
                <p>
                    La recta se define por sus dos proyecciones (r' y r''). La inclinación de estas nos dice todo sobre su posición en el espacio.
                </p>

                <h3 class="text-xl font-bold text-white mt-8 mb-4">Clasificación Visual de Rectas</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-gray-300 border border-gray-700">
                        <thead class="text-xs uppercase bg-gray-800 text-gray-200">
                            <tr>
                                <th class="px-4 py-3 border-b border-gray-700 w-1/4">Tipo</th>
                                <th class="px-4 py-3 border-b border-gray-700 w-1/4">Visualización</th>
                                <th class="px-4 py-3 border-b border-gray-700 w-1/2">Propiedades</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-800">
                            <!-- Horizontal -->
                            <tr class="bg-gray-900/50 hover:bg-gray-800 transition-colors">
                                <td class="px-4 py-4 font-bold text-white">Horizontal</td>
                                <td class="px-4 py-4">
                                    <svg width="100" height="60" viewBox="0 0 100 60" class="bg-white rounded border border-gray-300">
                                        <line x1="0" y1="30" x2="100" y2="30" stroke="black" stroke-width="1" /> <!-- LT -->
                                        <line x1="10" y1="10" x2="90" y2="10" stroke="blue" stroke-width="2" /> <!-- r'' -->
                                        <line x1="10" y1="50" x2="90" y2="40" stroke="green" stroke-width="2" /> <!-- r' -->
                                        <text x="92" y="12" font-size="8" fill="blue">r''</text>
                                        <text x="92" y="42" font-size="8" fill="green">r'</text>
                                    </svg>
                                </td>
                                <td class="px-4 py-4">Paralela al Plano Horizontal.<br><span class="text-blue-400">r'' Paralela a LT</span>. <br>Tiene cota constante.</td>
                            </tr>
                            
                            <!-- Frontal -->
                            <tr class="bg-gray-900/50 hover:bg-gray-800 transition-colors">
                                <td class="px-4 py-4 font-bold text-white">Frontal</td>
                                <td class="px-4 py-4">
                                    <svg width="100" height="60" viewBox="0 0 100 60" class="bg-white rounded border border-gray-300">
                                        <line x1="0" y1="30" x2="100" y2="30" stroke="black" stroke-width="1" /> <!-- LT -->
                                        <line x1="10" y1="20" x2="90" y2="5" stroke="blue" stroke-width="2" /> <!-- r'' -->
                                        <line x1="10" y1="50" x2="90" y2="50" stroke="green" stroke-width="2" /> <!-- r' -->
                                        <text x="92" y="8" font-size="8" fill="blue">r''</text>
                                        <text x="92" y="52" font-size="8" fill="green">r'</text>
                                    </svg>
                                </td>
                                <td class="px-4 py-4">Paralela al Plano Vertical.<br><span class="text-green-400">r' Paralela a LT</span>. <br>Tiene alejamiento constante.</td>
                            </tr>

                            <!-- Vertical -->
                            <tr class="bg-gray-900/50 hover:bg-gray-800 transition-colors">
                                <td class="px-4 py-4 font-bold text-white">Vertical</td>
                                <td class="px-4 py-4">
                                     <svg width="100" height="60" viewBox="0 0 100 60" class="bg-white rounded border border-gray-300">
                                        <line x1="0" y1="30" x2="100" y2="30" stroke="black" stroke-width="1" /> <!-- LT -->
                                        <line x1="50" y1="5" x2="50" y2="55" stroke="blue" stroke-width="2" /> <!-- r'' -->
                                        <circle cx="50" cy="45" r="2" fill="green" /> <!-- r' point -->
                                        <text x="52" y="8" font-size="8" fill="blue">r''</text>
                                        <text x="52" y="45" font-size="8" fill="green">r'</text>
                                    </svg>
                                </td>
                                <td class="px-4 py-4">Perpendicular al Plano Horizontal.<br><span class="text-green-400">r' es un punto</span>.<br>r'' Perpendicular a LT.</td>
                            </tr>

                            <!-- De Punta -->
                            <tr class="bg-gray-900/50 hover:bg-gray-800 transition-colors">
                                <td class="px-4 py-4 font-bold text-white">De Punta</td>
                                <td class="px-4 py-4">
                                     <svg width="100" height="60" viewBox="0 0 100 60" class="bg-white rounded border border-gray-300">
                                        <line x1="0" y1="30" x2="100" y2="30" stroke="black" stroke-width="1" /> <!-- LT -->
                                        <circle cx="50" cy="15" r="2" fill="blue" /> <!-- r'' point -->
                                        <line x1="50" y1="5" x2="50" y2="55" stroke="green" stroke-width="2" /> <!-- r' -->
                                        <text x="52" y="15" font-size="8" fill="blue">r''</text>
                                        <text x="52" y="52" font-size="8" fill="green">r'</text>
                                    </svg>
                                </td>
                                <td class="px-4 py-4">Perpendicular al Plano Vertical.<br><span class="text-blue-400">r'' es un punto</span>.<br>r' Perpendicular a LT.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `,
        exercises: [
            {
                id: 'ex-line-types',
                title: 'Identificación de Rectas',
                level: 'Fácil',
                statement: 'Dibuja una recta Horizontal y una recta Frontal que se corten en un punto P. Verifica sus proyecciones.',
                setup: [],
                solutionHint: 'La horizontal debe tener r\'\' paralela a LT. La frontal debe tener s\' paralela a LT.'
            }
        ]
    },

    // 3. EL PLANO (Profundizado)
    {
        id: 'theory-3-plane',
        title: '3. El Plano',
        description: 'Trazas del plano (Alpha), planos proyectantes, paralelos y oblicuos. Representación visual.',
        category: 'Teoría',
        theoryContent: `
             <div class="space-y-6 text-gray-300">
                <p>
                    Un plano es infinito, pero en Diédrico lo representamos por sus <strong>Trazas</strong>: las líneas donde el plano corta al PV (Alpha_2) y al PH (Alpha_1).
                </p>

                <h3 class="text-xl font-bold text-white mt-8 mb-4">Catálogo de Planos</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-gray-300 border border-gray-700">
                        <thead class="text-xs uppercase bg-gray-800 text-gray-200">
                            <tr>
                                <th class="px-4 py-3 border-b border-gray-700 w-1/4">Tipo</th>
                                <th class="px-4 py-3 border-b border-gray-700 w-1/4">Visualización</th>
                                <th class="px-4 py-3 border-b border-gray-700 w-1/2">Propiedades</th>
                            </tr>
                        </thead>
                       <tbody class="divide-y divide-gray-800">
                            <!-- Oblicuo -->
                             <tr class="bg-gray-900/50 hover:bg-gray-800 transition-colors">
                                <td class="px-4 py-4 font-bold text-white">Oblicuo (Cualquiera)</td>
                                <td class="px-4 py-4">
                                     <svg width="100" height="60" viewBox="0 0 100 60" class="bg-white rounded border border-gray-300">
                                        <line x1="0" y1="30" x2="100" y2="30" stroke="black" stroke-width="1" /> <!-- LT -->
                                        <line x1="20" y1="5" x2="40" y2="30" stroke="orange" stroke-width="2" /> <!-- a2 -->
                                        <line x1="40" y1="30" x2="20" y2="55" stroke="orange" stroke-width="2" /> <!-- a1 -->
                                        <text x="25" y="10" font-size="8" fill="orange">a2</text>
                                        <text x="25" y="55" font-size="8" fill="orange">a1</text>
                                    </svg>
                                </td>
                                <td class="px-4 py-4">Corta oblicuamente a PV y PH. Las trazas se cruzan en la LT.</td>
                            </tr>

                            <!-- Proyectante Horizontal -->
                            <tr class="bg-gray-900/50 hover:bg-gray-800 transition-colors">
                                <td class="px-4 py-4 font-bold text-white">Proyectante Horizontal (Vertical)</td>
                                <td class="px-4 py-4">
                                     <svg width="100" height="60" viewBox="0 0 100 60" class="bg-white rounded border border-gray-300">
                                        <line x1="0" y1="30" x2="100" y2="30" stroke="black" stroke-width="1" /> <!-- LT -->
                                        <line x1="40" y1="5" x2="40" y2="30" stroke="orange" stroke-width="2" /> <!-- a2 -->
                                        <line x1="40" y1="30" x2="20" y2="55" stroke="orange" stroke-width="2" /> <!-- a1 -->
                                        <rect x="35" y="25" width="5" height="5" fill="none" stroke="black" stroke-width="0.5" /> <!-- 90deg symbol -->
                                        <text x="42" y="10" font-size="8" fill="orange">a2</text>
                                        <text x="25" y="55" font-size="8" fill="orange">a1</text>
                                    </svg>
                                </td>
                                <td class="px-4 py-4">Perpendicular al PH.<br><span class="text-orange-400">Traza Vert. (a2) Perpendicular a LT</span>.<br>Contiene la "altura" de las figuras.</td>
                            </tr>

                             <!-- Proyectante Vertical -->
                            <tr class="bg-gray-900/50 hover:bg-gray-800 transition-colors">
                                <td class="px-4 py-4 font-bold text-white">Proyectante Vertical (De Canto)</td>
                                <td class="px-4 py-4">
                                     <svg width="100" height="60" viewBox="0 0 100 60" class="bg-white rounded border border-gray-300">
                                        <line x1="0" y1="30" x2="100" y2="30" stroke="black" stroke-width="1" /> <!-- LT -->
                                        <line x1="20" y1="5" x2="40" y2="30" stroke="orange" stroke-width="2" /> <!-- a2 -->
                                        <line x1="40" y1="30" x2="40" y2="55" stroke="orange" stroke-width="2" /> <!-- a1 -->
                                        <rect x="35" y="30" width="5" height="5" fill="none" stroke="black" stroke-width="0.5" /> <!-- 90deg symbol -->
                                        <text x="25" y="10" font-size="8" fill="orange">a2</text>
                                        <text x="42" y="50" font-size="8" fill="orange">a1</text>
                                    </svg>
                                </td>
                                <td class="px-4 py-4">Perpendicular al PV.<br><span class="text-orange-400">Traza Horiz. (a1) Perpendicular a LT</span>.</td>
                            </tr>

                            <!-- Horizontal -->
                            <tr class="bg-gray-900/50 hover:bg-gray-800 transition-colors">
                                <td class="px-4 py-4 font-bold text-white">Horizontal</td>
                                <td class="px-4 py-4">
                                     <svg width="100" height="60" viewBox="0 0 100 60" class="bg-white rounded border border-gray-300">
                                        <line x1="0" y1="40" x2="100" y2="40" stroke="black" stroke-width="1" /> <!-- LT lower -->
                                        <line x1="10" y1="20" x2="90" y2="20" stroke="orange" stroke-width="2" /> <!-- a2 -->
                                        <text x="92" y="24" font-size="8" fill="orange">a2</text>
                                        <text x="50" y="55" font-size="8" fill="gray">(a1 infinito)</text>
                                    </svg>
                                </td>
                                <td class="px-4 py-4">Paralelo al PH.<br>Solo tiene Traza Vertical (a2) paralela a LT.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `,
        exercises: [
            {
                id: 'ex-plane-creation',
                title: 'Creación de Planos',
                level: 'Fácil',
                statement: 'Crea un plano definido por tres puntos A(10,10,10), B(50,10,20) y C(30,50,30). Observa las trazas resultantes.',
                setup: [
                    { type: 'point', name: 'A', coords: { x: 10, y: 10, z: 10 }, visible: true, color: '#3b82f6' },
                    { type: 'point', name: 'B', coords: { x: 50, y: 10, z: 20 }, visible: true, color: '#3b82f6' },
                    { type: 'point', name: 'C', coords: { x: 30, y: 50, z: 30 }, visible: true, color: '#3b82f6' }
                ],
                solutionHint: 'Al unir 3 puntos no alineados, se forma un plano único. Diédrico Studio calculará automáticamente las trazas.'
            }
        ]
    },

    // 4. ABATIMIENTOS (Intro)
    {
        id: 'theory-4-abatimientos',
        title: '4. Abatimientos',
        description: 'Técnica para ver la Verdadera Magnitud de figuras planas situándolas sobre el plano de proyección.',
        category: 'Teoría',
        theoryContent: '<div class="text-gray-300"><p>Contenido detallado próximamente...</p></div>',
        exercises: []
    }
];
