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
    // 1. EL PUNTO
    {
        id: 'theory-1-point',
        title: '1. Introducción: El Punto',
        description: 'Fundamentos, planos de proyección, coordenadas (X, Y, Z) y alfabeto del punto visual.',
        category: 'Teoría',
        theoryContent: `
             <div class="space-y-8 text-gray-300 break-inside-avoid-page">
                <p class="lead text-xl text-white">
                    El <strong>Sistema Diédrico</strong> proyecta el espacio 3D sobre dos planos infinitos y perpendiculares: Vertical (PV) y Horizontal (PH).
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center break-inside-avoid shadow-lg p-4 rounded-xl bg-gray-800/50">
                    <div>
                        <ul class="list-disc pl-5 space-y-3">
                            <li><strong class="text-blue-400">PV (Alzado):</strong> Pared frontal. Proyecta la cota (Z).</li>
                            <li><strong class="text-green-400">PH (Planta):</strong> Suelo. Proyecta el alejamiento (Y).</li>
                            <li><strong class="text-white">Línea de Tierra (LT):</strong> Intersección. Eje X.</li>
                        </ul>
                    </div>
                    <div class="bg-white p-4 rounded-xl flex justify-center items-center cursor-zoom-in hover:scale-105 transition-transform">
                         <svg width="250" height="200" viewBox="0 0 200 200">
                            <!-- 3D Dihedral Representation -->
                             <defs>
                                <linearGradient id="gradPV" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:#dbeafe;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#bfdbfe;stop-opacity:1" />
                                </linearGradient>
                                <linearGradient id="gradPH" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#dcfce7;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#bbf7d0;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M50 20 L50 100 L150 100 L150 20 Z" fill="url(#gradPV)" stroke="#2563eb" />
                            <text x="60" y="40" font-size="12" fill="#1e40af" font-weight="bold">PV</text>
                            
                            <path d="M20 130 L50 100 L150 100 L120 130 Z" fill="url(#gradPH)" stroke="#16a34a" />
                            <text x="40" y="125" font-size="12" fill="#166534" font-weight="bold">PH</text>
                            
                            <line x1="50" y1="100" x2="150" y2="100" stroke="black" stroke-width="3" />
                            <text x="160" y="105" font-size="12" font-weight="bold">LT</text>
                            
                            <!-- Point P in space -->
                            <circle cx="100" cy="70" r="3" fill="red" />
                            <text x="105" y="70" font-size="10" fill="red">P</text>
                            <!-- Projections -->
                            <line x1="100" y1="70" x2="100" y2="100" stroke="red" stroke-dasharray="2" />
                            <line x1="100" y1="70" x2="80" y2="120" stroke="red" stroke-dasharray="2" />
                        </svg>
                    </div>
                </div>

                <h3 class="text-2xl font-bold text-white mt-8 border-b border-gray-700 pb-2">Alfabeto del Punto</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <!-- I Cuadrante -->
                    <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 break-inside-avoid">
                        <strong class="text-white block text-center mb-2">I Cuadrante</strong>
                        <svg width="100%" height="120" viewBox="0 0 100 120" class="bg-white rounded cursor-zoom-in">
                            <line x1="10" y1="60" x2="90" y2="60" stroke="black" stroke-width="2" />
                            <line x1="50" y1="30" x2="50" y2="90" stroke="#9ca3af" stroke-dasharray="4" />
                            <circle cx="50" cy="30" r="4" fill="blue" /> <text x="58" y="35" font-size="12" fill="blue">a''</text>
                            <circle cx="50" cy="90" r="4" fill="green" /> <text x="58" y="95" font-size="12" fill="green">a'</text>
                        </svg>
                    </div>
                    <!-- II Cuadrante -->
                    <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 break-inside-avoid">
                        <strong class="text-white block text-center mb-2">II Cuadrante</strong>
                        <svg width="100%" height="120" viewBox="0 0 100 120" class="bg-white rounded cursor-zoom-in">
                            <line x1="10" y1="60" x2="90" y2="60" stroke="black" stroke-width="2" />
                            <line x1="50" y1="20" x2="50" y2="45" stroke="#9ca3af" stroke-dasharray="4" />
                            <circle cx="50" cy="20" r="4" fill="green" /> <text x="58" y="25" font-size="12" fill="green">b'</text>
                            <circle cx="50" cy="45" r="4" fill="blue" /> <text x="58" y="50" font-size="12" fill="blue">b''</text>
                        </svg>
                    </div>
                     <!-- III Cuadrante -->
                    <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 break-inside-avoid">
                        <strong class="text-white block text-center mb-2">III Cuadrante</strong>
                        <svg width="100%" height="120" viewBox="0 0 100 120" class="bg-white rounded cursor-zoom-in">
                            <line x1="10" y1="60" x2="90" y2="60" stroke="black" stroke-width="2" />
                            <line x1="50" y1="30" x2="50" y2="90" stroke="#9ca3af" stroke-dasharray="4" />
                            <circle cx="50" cy="30" r="4" fill="green" /> <text x="58" y="35" font-size="12" fill="green">c'</text>
                            <circle cx="50" cy="90" r="4" fill="blue" /> <text x="58" y="95" font-size="12" fill="blue">c''</text>
                        </svg>
                    </div>
                     <!-- IV Cuadrante -->
                     <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 break-inside-avoid">
                        <strong class="text-white block text-center mb-2">IV Cuadrante</strong>
                        <svg width="100%" height="120" viewBox="0 0 100 120" class="bg-white rounded cursor-zoom-in">
                            <line x1="10" y1="60" x2="90" y2="60" stroke="black" stroke-width="2" />
                            <line x1="50" y1="75" x2="50" y2="100" stroke="#9ca3af" stroke-dasharray="4" />
                            <circle cx="50" cy="75" r="4" fill="blue" /> <text x="58" y="80" font-size="12" fill="blue">d''</text>
                            <circle cx="50" cy="100" r="4" fill="green" /> <text x="58" y="105" font-size="12" fill="green">d'</text>
                        </svg>
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

    // 2. LA RECTA (COMPLETO)
    {
        id: 'theory-2-line',
        title: '2. La Recta',
        description: 'Definición, obtención de trazas, y clasificación exhaustiva de los 7 tipos de rectas.',
        category: 'Teoría',
        theoryContent: `
             <div class="space-y-8 text-gray-300 break-inside-avoid-page">
                <h3 class="text-2xl font-bold text-white mb-4">1. Definición de la Recta</h3>
                <p>Para definir una recta necesitamos <strong>2 Puntos</strong>. En diédrico, unimos sus proyecciones homónimas:</p>
                <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 break-inside-avoid flex items-center justify-around">
                    <div>
                        <ul class="list-disc pl-5">
                            <li>Unimos <strong>a'</strong> con <strong>b'</strong> para obtener <strong>r'</strong>.</li>
                            <li>Unimos <strong>a''</strong> con <strong>b''</strong> para obtener <strong>r''</strong>.</li>
                        </ul>
                    </div>
                    <div class="bg-white p-2 rounded cursor-zoom-in">
                        <svg width="200" height="150" viewBox="0 0 200 150">
                            <line x1="10" y1="75" x2="190" y2="75" stroke="black" stroke-width="2" /> <!-- LT -->
                            
                            <!-- Points A and B -->
                            <circle cx="50" cy="40" r="2" fill="blue" /> <text x="50" y="35" font-size="10" fill="blue">a''</text>
                            <circle cx="50" cy="110" r="2" fill="green" /> <text x="50" y="125" font-size="10" fill="green">a'</text>
                            
                            <circle cx="150" cy="20" r="2" fill="blue" /> <text x="150" y="15" font-size="10" fill="blue">b''</text>
                            <circle cx="150" cy="130" r="2" fill="green" /> <text x="150" y="145" font-size="10" fill="green">b'</text>

                            <!-- Lines -->
                            <line x1="30" y1="44" x2="170" y2="16" stroke="blue" stroke-width="2" /> <text x="175" y="20" font-size="12" fill="blue">r''</text>
                            <line x1="30" y1="106" x2="170" y2="134" stroke="green" stroke-width="2" /> <text x="175" y="140" font-size="12" fill="green">r'</text>
                        </svg>
                    </div>
                </div>

                <h3 class="text-2xl font-bold text-white mt-8 mb-4">2. Trazas de la Recta</h3>
                <p>Son los puntos donde la recta "perfora" los planos. Son fundamentales para entender su visibilidad.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 break-inside-avoid">
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <strong class="text-orange-400">Traza Vertical (Vr)</strong>
                        <p class="text-sm mt-2">Donde la proyección horizontal <strong>r' corta a la LT</strong>. Subimos una perpendicular hasta cortar a r''.</p>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <strong class="text-orange-400">Traza Horizontal (Hr)</strong>
                        <p class="text-sm mt-2">Donde la proyección vertical <strong>r'' corta a la LT</strong>. Bajamos una perpendicular hasta cortar a r'.</p>
                    </div>
                </div>

                <h3 class="text-2xl font-bold text-white mt-8 mb-4">3. Clasificación Completa</h3>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <!-- Oblicua -->
                    <div class="bg-gray-800 border-l-4 border-purple-500 p-4 rounded break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-white">1. Recta Oblicua (Genérica)</h4>
                            <span class="text-xs bg-gray-700 px-2 py-1 rounded">Más común</span>
                        </div>
                        <p class="text-sm text-gray-400 my-2">Corta a los dos planos. Sus proyecciones son oblicuas a LT.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                <line x1="40" y1="80" x2="160" y2="20" stroke="green" stroke-width="2" /> <text x="165" y="25" font-size="10" fill="green">r'</text>
                                <line x1="40" y1="20" x2="160" y2="80" stroke="blue" stroke-width="2" /> <text x="165" y="85" font-size="10" fill="blue">r''</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Horizontal -->
                    <div class="bg-gray-800 border-l-4 border-yellow-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">2. Recta Horizontal</h4>
                        <p class="text-sm text-gray-400 my-2">Paralela al PH. Cota constante.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                <line x1="40" y1="20" x2="160" y2="20" stroke="blue" stroke-width="2" /> <text x="165" y="25" font-size="10" fill="blue">r'' // LT</text>
                                <line x1="40" y1="80" x2="160" y2="60" stroke="green" stroke-width="2" /> <text x="165" y="65" font-size="10" fill="green">r'</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Frontal -->
                    <div class="bg-gray-800 border-l-4 border-yellow-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">3. Recta Frontal</h4>
                        <p class="text-sm text-gray-400 my-2">Paralela al PV. Alejamiento constante.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                <line x1="40" y1="20" x2="160" y2="40" stroke="blue" stroke-width="2" /> <text x="165" y="45" font-size="10" fill="blue">r''</text>
                                <line x1="40" y1="80" x2="160" y2="80" stroke="green" stroke-width="2" /> <text x="165" y="85" font-size="10" fill="green">r' // LT</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Paralela a LT -->
                    <div class="bg-gray-800 border-l-4 border-red-500 p-4 rounded break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-white">4. Paralela a la Línea de Tierra</h4>
                            <span class="text-xs bg-red-900 text-red-100 px-2 py-1 rounded">Especial</span>
                        </div>
                        <p class="text-sm text-gray-400 my-2">Paralela a ambos planos. No tiene trazas.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                <line x1="40" y1="20" x2="160" y2="20" stroke="blue" stroke-width="2" /> <text x="165" y="25" font-size="10" fill="blue">r'' // LT</text>
                                <line x1="40" y1="80" x2="160" y2="80" stroke="green" stroke-width="2" /> <text x="165" y="85" font-size="10" fill="green">r' // LT</text>
                            </svg>
                        </div>
                    </div>

                    <!-- De Perfil -->
                    <div class="bg-gray-800 border-l-4 border-orange-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">5. De Perfil</h4>
                        <p class="text-sm text-gray-400 my-2">Proyecciones perpendiculares a LT. Requiere 3ª vista.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                <line x1="100" y1="10" x2="100" y2="90" stroke="purple" stroke-width="2" />
                                <text x="105" y="20" font-size="10" fill="blue">r''</text>
                                <text x="105" y="80" font-size="10" fill="green">r'</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Corta a LT -->
                    <div class="bg-gray-800 border-l-4 border-red-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">6. Corta a la Línea de Tierra</h4>
                        <p class="text-sm text-gray-400 my-2">Sus trazas coinciden en un punto de la LT. Pasa por el origen.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                             <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                <line x1="100" y1="50" x2="160" y2="10" stroke="blue" stroke-width="2" />
                                <line x1="100" y1="50" x2="160" y2="80" stroke="green" stroke-width="2" />
                                <circle cx="100" cy="50" r="3" fill="red" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `,
        exercises: [
            {
                id: 'ex-line-trace',
                title: 'Hallar Trazas',
                level: 'Medio',
                statement: 'Dada una recta definida por A(20,10,30) y B(60,40,10), encuentra sus trazas Horizontal (H) y Vertical (V).',
                setup: [
                    { type: 'point', name: 'A', coords: { x: 20, y: 10, z: 30 }, visible: true, color: 'blue' },
                    { type: 'point', name: 'B', coords: { x: 60, y: 40, z: 10 }, visible: true, color: 'blue' }
                ],
                solutionHint: 'Prolonga r\' hasta cortar LT -> Sube V. Prolonga r\'\' hasta cortar LT -> Baja H.'
            }
        ]
    },

    // 3. EL PLANO (COMPLETO)
    {
        id: 'theory-3-plane',
        title: '3. El Plano',
        description: 'Determinación, trazas, rectas notables y clasificación exhaustiva de planos.',
        category: 'Teoría',
        theoryContent: `
             <div class="space-y-8 text-gray-300 break-inside-avoid-page">
                <h3 class="text-2xl font-bold text-white mb-4">1. Determinación del Plano</h3>
                <p>Un plano no es solo "trazas". Se define geométricamente por:</p>
                <ul class="list-disc pl-5 space-y-2 mb-6">
                    <li>3 Puntos no alineados.</li>
                    <li>2 Rectas que se cortan.</li>
                    <li>2 Rectas paralelas.</li>
                    <li>1 Recta y 1 Punto exterior.</li>
                </ul>

                <h3 class="text-2xl font-bold text-white mb-4">2. Trazas del Plano</h3>
                <p>Las trazas (Alpha1, Alpha2) son las rectas de intersección del plano con el PH y el PV.</p>
                
                 <h3 class="text-2xl font-bold text-white mt-8 mb-4">3. Clasificación Completa</h3>
                 <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Oblicuo -->
                    <div class="bg-gray-800 border-l-4 border-purple-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">1. Plano Oblicuo (Cualquiera)</h4>
                        <div class="bg-white rounded h-32 mt-2 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                <line x1="60" y1="10" x2="90" y2="50" stroke="orange" stroke-width="2" /> <text x="65" y="20" font-size="10" fill="orange">a2</text>
                                <line x1="90" y1="50" x2="130" y2="90" stroke="orange" stroke-width="2" /> <text x="120" y="80" font-size="10" fill="orange">a1</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Proyectantes -->
                    <div class="bg-gray-800 border-l-4 border-green-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">2. Proyectantes (Vert/Horiz)</h4>
                        <p class="text-sm opacity-70">Una traza es perpendicular a LT.</p>
                        <div class="bg-white rounded h-32 mt-2 flex items-center justify-center cursor-zoom-in gap-4">
                             <!-- Proj Horiz -->
                            <svg width="90" height="80" viewBox="0 0 100 80">
                                <line x1="0" y1="40" x2="100" y2="40" stroke="black" />
                                <line x1="50" y1="10" x2="50" y2="40" stroke="orange" stroke-width="2" />
                                <line x1="50" y1="40" x2="20" y2="70" stroke="orange" stroke-width="2" />
                                <text x="10" y="20" font-size="8">Proj. H</text>
                            </svg>
                            <!-- Proj Vert -->
                            <svg width="90" height="80" viewBox="0 0 100 80">
                                <line x1="0" y1="40" x2="100" y2="40" stroke="black" />
                                <line x1="20" y1="10" x2="50" y2="40" stroke="orange" stroke-width="2" />
                                <line x1="50" y1="40" x2="50" y2="70" stroke="orange" stroke-width="2" />
                                <text x="10" y="20" font-size="8">Proj. V</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Paralelo a LT -->
                    <div class="bg-gray-800 border-l-4 border-blue-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">3. Paralelo a LT</h4>
                        <p class="text-sm opacity-70">Ambas trazas son paralelas a LT.</p>
                        <div class="bg-white rounded h-32 mt-2 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                <line x1="20" y1="20" x2="180" y2="20" stroke="orange" stroke-width="2" /> <text x="185" y="25" font-size="10" fill="orange">a2</text>
                                <line x1="20" y1="80" x2="180" y2="80" stroke="orange" stroke-width="2" /> <text x="185" y="85" font-size="10" fill="orange">a1</text>
                            </svg>
                        </div>
                    </div>

                    <!-- De Perfil -->
                    <div class="bg-gray-800 border-l-4 border-orange-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">4. De Perfil</h4>
                        <p class="text-sm opacity-70">Ambas trazas son perpendiculares a LT (en la misma línea).</p>
                        <div class="bg-white rounded h-32 mt-2 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                <line x1="100" y1="10" x2="100" y2="90" stroke="orange" stroke-width="2" />
                                <text x="105" y="20" font-size="10" fill="orange">a2</text>
                                <text x="105" y="80" font-size="10" fill="orange">a1</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Pasa por LT -->
                    <div class="bg-gray-800 border-l-4 border-red-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">5. Pasa por la Línea de Tierra</h4>
                        <p class="text-sm opacity-70">Sus trazas coinciden con la LT. Se define por un punto P de perfil.</p>
                        <div class="bg-white rounded h-32 mt-2 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                <circle cx="100" cy="50" r="3" fill="orange" />
                                <text x="100" y="40" font-size="10" fill="orange">a1 = a2 = LT</text>
                                <circle cx="140" cy="30" r="2" fill="blue" /> <text x="145" y="30" font-size="8">P''</text>
                                <circle cx="140" cy="70" r="2" fill="green" /> <text x="145" y="70" font-size="8">P'</text>
                            </svg>
                        </div>
                    </div>
                 </div>
            </div>
        `,
        exercises: [
            {
                id: 'ex-plane-types',
                title: 'Tipos de Planos',
                level: 'Difícil',
                statement: 'Representa un Plano Paralelo a la LT que pase por A(20, 30, 40) y B(60, 30, 40).',
                setup: [
                    { type: 'point', name: 'A', coords: { x: 20, y: 30, z: 40 }, visible: true, color: 'blue' },
                    { type: 'point', name: 'B', coords: { x: 60, y: 30, z: 40 }, visible: true, color: 'blue' }
                ],
                solutionHint: 'Al tener misma cota y alejamiento, es un plano paralelo a LT. Dibuja las trazas paralelas a LT.'
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
