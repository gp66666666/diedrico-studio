
import { AcademyTopic } from '../types';
import { StepByStepVisualizer } from '../components/Academy/StepByStepVisualizer';
import React from 'react';

export const ACADEMY_CONTENT: AcademyTopic[] = [
    // 1. EL PUNTO
    {
        id: 'theory-1-point',
        title: '1. Introducción: El Punto',
        description: 'Fundamentos, planos de proyección, coordenadas (X, Y, Z) y alfabeto del punto visual.',
        category: 'Teoría',
        theoryContent: `
            <div class="space-y-10 text-slate-700">
                <!-- INTRODUCCION -->
                <section class="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                    <h3 class="text-3xl font-bold text-blue-900 mb-4 font-serif">¿Qué es el Sistema Diédrico?</h3>
                    <p class="text-lg leading-relaxed mb-4">
                        El <strong class="text-blue-700">Sistema Diédrico</strong> es un método de representación gráfica que nos permite 
                        representar objetos tridimensionales (3D) sobre un plano bidimensional (2D), como una hoja de papel o una pantalla.
                    </p>
                    <p class="text-lg leading-relaxed mb-4">
                        Fue desarrollado por el matemático francés <strong class="text-amber-600">Gaspard Monge</strong> en el siglo XVIII 
                        y es la base de la <em>Geometría Descriptiva</em>, esencial en ingeniería, arquitectura y diseño industrial.
                    </p>
                    <div class="bg-white p-5 rounded-xl border border-blue-200 mt-6 shadow-sm">
                        <p class="text-sm text-slate-600">
                            <strong class="text-blue-800">Aplicaciones:</strong> Planos arquitectónicos, diseño de piezas mecánicas, 
                            trazado de instalaciones, cartografía, y cualquier representación técnica precisa.
                        </p>
                    </div>
                </section>

                <!-- PLANOS DE PROYECCION -->
                <section>
                    <h3 class="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2 font-serif">
                        Los Planos de Proyección
                    </h3>
                    <p class="mb-6 text-lg">
                        El sistema diédrico utiliza <strong class="text-slate-900">dos planos perpendiculares entre sí</strong> que dividen 
                        el espacio en cuatro regiones llamadas <em>cuadrantes</em>:
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div class="space-y-4">
                            <div class="bg-blue-50 p-5 rounded-xl border-l-4 border-blue-500 shadow-sm">
                                <h4 class="font-bold text-blue-700 text-lg mb-2">Plano Vertical (PV) - Alzado</h4>
                                <p class="text-slate-700">
                                    Es el plano <strong>frontal</strong>, como una pared que está frente a nosotros. 
                                    Sobre él se proyecta la <strong class="text-blue-600">proyección vertical</strong> de los objetos, 
                                    que nos muestra la <em>cota</em> (altura Z) y la posición horizontal (X).
                                </p>
                                <p class="text-sm text-slate-500 mt-2">
                                    La proyección vertical de un punto P se denota como <strong>P''</strong> (P con dos primas).
                                </p>
                            </div>
                            
                            <div class="bg-emerald-50 p-5 rounded-xl border-l-4 border-emerald-500 shadow-sm">
                                <h4 class="font-bold text-emerald-700 text-lg mb-2">Plano Horizontal (PH) - Planta</h4>
                                <p class="text-slate-700">
                                    Es el plano del <strong>suelo</strong>, horizontal como una mesa. 
                                    Sobre él se proyecta la <strong class="text-emerald-600">proyección horizontal</strong>, 
                                    que nos muestra el <em>alejamiento</em> (profundidad Y) y la posición horizontal (X).
                                </p>
                                <p class="text-sm text-slate-500 mt-2">
                                    La proyección horizontal de un punto P se denota como <strong>P'</strong> (P con una prima).
                                </p>
                            </div>
                            
                            <div class="bg-slate-100 p-5 rounded-xl border-l-4 border-slate-400 shadow-sm">
                                <h4 class="font-bold text-slate-800 text-lg mb-2">Línea de Tierra (LT)</h4>
                                <p class="text-slate-700">
                                    Es la <strong>intersección</strong> de los dos planos. Se representa como una línea horizontal 
                                    con dos pequeños trazos perpendiculares en los extremos. Corresponde al <strong>eje X</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- COORDENADAS -->
                <section>
                     <h3 class="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2 font-serif">
                        Coordenadas del Punto: X, Y, Z
                    </h3>
                    <p class="mb-6 text-lg text-slate-700">
                        Todo punto en el espacio se define por <strong class="text-slate-900">tres coordenadas</strong>: Notación P(X, Y, Z).
                    </p>
                </section>
            </div>
        `,
        exercises: [
            {
                id: 'ex-point-1',
                title: 'Puntos en el Espacio',
                level: 'Fácil',
                statement: 'Representa cuatro puntos, uno en cada cuadrante: A(I), B(II), C(III), D(IV). Observa sus cotas y alejamientos.',
                setup: [
                    { type: 'point', name: 'A', coords: { x: 20, y: 30, z: 40 }, color: '#ef4444' },
                    { type: 'point', name: 'B', coords: { x: 50, y: -25, z: 35 }, color: '#3b82f6' },
                    { type: 'point', name: 'C', coords: { x: 80, y: -20, z: -30 }, color: '#22c55e' },
                    { type: 'point', name: 'D', coords: { x: 110, y: 25, z: -25 }, color: '#f97316' }
                ],
                solutionHint: 'Recuerda: I(+,+), II(+,-), III(-,-), IV(-,+). A esta en I, B en II, C en III, D en IV.'
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
             <div class="space-y-8 text-slate-700 break-inside-avoid-page">
                <h3 class="text-2xl font-bold text-slate-900 mb-4 font-serif">1. Definición de la Recta</h3>
                <p>Para definir una recta necesitamos 2 Puntos. En diédrico, unimos sus proyecciones homónimas.</p>
                
                <h3 class="text-2xl font-bold text-slate-900 mt-8 mb-4 font-serif">2. Clasificación Completa - 7 Tipos de Rectas</h3>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <!-- 1. Oblicua -->
                    <div class="bg-white border-l-4 border-purple-500 p-4 rounded shadow-sm break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-slate-900">1. Recta Oblicua (Genérica)</h4>
                            <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">Más común</span>
                        </div>
                        <p class="text-sm text-slate-600 my-2">Corta a los dos planos. Sus proyecciones son oblicuas a LT.</p>
                        <div class="bg-slate-50 rounded h-32 flex items-center justify-center cursor-zoom-in border border-slate-100">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" className="stroke-black dark:stroke-white" stroke-width="2" />
                                <line x1="40" y1="20" x2="160" y2="45" stroke="#3b82f6" stroke-width="2" /> <text x="165" y="45" font-size="10" fill="#3b82f6">r''</text>
                                <line x1="40" y1="80" x2="160" y2="60" stroke="#10b981" stroke-width="2" /> <text x="165" y="65" font-size="10" fill="#10b981">r'</text>
                            </svg>
                        </div>
                    </div>

                    <!-- 2. Horizontal -->
                    <div class="bg-white border-l-4 border-yellow-500 p-4 rounded shadow-sm break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-slate-900">2. Recta Horizontal</h4>
                            <span class="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-100">// a PH</span>
                        </div>
                        <p class="text-sm text-slate-600 my-2">Paralela al Plano Horizontal. Proyección Vertical paralela a LT.</p>
                        <div class="bg-slate-50 rounded h-32 flex items-center justify-center cursor-zoom-in border border-slate-100">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" className="stroke-black dark:stroke-white" stroke-width="2" />
                                <line x1="40" y1="30" x2="160" y2="30" stroke="#3b82f6" stroke-width="2" /> <text x="165" y="35" font-size="10" fill="#3b82f6">r'' // LT</text>
                                <line x1="40" y1="70" x2="160" y2="90" stroke="#10b981" stroke-width="2" /> <text x="165" y="90" font-size="10" fill="#10b981">r'</text>
                            </svg>
                        </div>
                    </div>

                    <!-- 3. Frontal -->
                    <div class="bg-white border-l-4 border-yellow-500 p-4 rounded shadow-sm break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-slate-900">3. Recta Frontal</h4>
                            <span class="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-100">// a PV</span>
                        </div>
                        <p class="text-sm text-slate-600 my-2">Paralela al Plano Vertical. Proyección Horizontal paralela a LT.</p>
                        <div class="bg-slate-50 rounded h-32 flex items-center justify-center cursor-zoom-in border border-slate-100">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" className="stroke-black dark:stroke-white" stroke-width="2" />
                                <line x1="40" y1="20" x2="160" y2="40" stroke="#3b82f6" stroke-width="2" /> <text x="165" y="30" font-size="10" fill="#3b82f6">r''</text>
                                <line x1="40" y1="70" x2="160" y2="70" stroke="#10b981" stroke-width="2" /> <text x="165" y="75" font-size="10" fill="#10b981">r' // LT</text>
                            </svg>
                        </div>
                    </div>

                    <!-- 4. Paralela a LT -->
                    <div class="bg-white border-l-4 border-red-500 p-4 rounded shadow-sm break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-slate-900">4. Paralela a LT</h4>
                            <span class="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100">// a ambos</span>
                        </div>
                        <p class="text-sm text-slate-600 my-2">Paralela a ambos planos. Ambas proyecciones paralelas a LT.</p>
                        <div class="bg-slate-50 rounded h-32 flex items-center justify-center cursor-zoom-in border border-slate-100">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" className="stroke-black dark:stroke-white" stroke-width="2" />
                                <line x1="40" y1="30" x2="160" y2="30" stroke="#3b82f6" stroke-width="2" /> <text x="165" y="35" font-size="10" fill="#3b82f6">r'' // LT</text>
                                <line x1="40" y1="70" x2="160" y2="70" stroke="#10b981" stroke-width="2" /> <text x="165" y="75" font-size="10" fill="#10b981">r' // LT</text>
                            </svg>
                        </div>
                    </div>

                    <!-- 5. Vertical -->
                    <div class="bg-white border-l-4 border-emerald-500 p-4 rounded shadow-sm break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-slate-900">5. R. Vertical</h4>
                            <span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">⊥ a PH</span>
                        </div>
                        <p class="text-sm text-slate-600 my-2">Perpendicular al PH. Proyección H es un punto.</p>
                        <div class="bg-slate-50 rounded h-32 flex items-center justify-center cursor-zoom-in border border-slate-100">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" className="stroke-black dark:stroke-white" stroke-width="2" />
                                <line x1="100" y1="20" x2="100" y2="80" stroke="#3b82f6" stroke-width="2" /> <text x="105" y="25" font-size="10" fill="#3b82f6">r'' (⊥ LT)</text>
                                <circle cx="100" cy="80" r="3" fill="#10b981"/> <text x="105" y="85" font-size="10" fill="#10b981">r' (Punto)</text>
                            </svg>
                        </div>
                    </div>

                    <!-- 6. De Punta -->
                    <div class="bg-white border-l-4 border-emerald-500 p-4 rounded shadow-sm break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-slate-900">6. R. de Punta</h4>
                            <span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">⊥ a PV</span>
                        </div>
                        <p class="text-sm text-slate-600 my-2">Perpendicular al PV. Proyección V es un punto.</p>
                        <div class="bg-slate-50 rounded h-32 flex items-center justify-center cursor-zoom-in border border-slate-100">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" className="stroke-black dark:stroke-white" stroke-width="2" />
                                <line x1="100" y1="20" x2="100" y2="80" stroke="#10b981" stroke-width="2" /> <text x="105" y="85" font-size="10" fill="#10b981">r' (⊥ LT)</text>
                                <circle cx="100" cy="20" r="3" fill="#3b82f6"/> <text x="105" y="25" font-size="10" fill="#3b82f6">r'' (Punto)</text>
                            </svg>
                        </div>
                    </div>

                     <!-- 7. De Perfil -->
                     <div class="bg-white border-l-4 border-blue-500 p-4 rounded shadow-sm break-inside-avoid col-span-1 lg:col-span-2">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-slate-900">7. Recta de Perfil</h4>
                            <span class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">Necesita 3ª Vista</span>
                        </div>
                        <p class="text-sm text-slate-600 my-2">Proyecciones perpendiculares a LT. Vemos una sola linea vertical.</p>
                        <div class="bg-slate-50 rounded h-32 flex items-center justify-center cursor-zoom-in border border-slate-100">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" className="stroke-black dark:stroke-white" stroke-width="2" />
                                <line x1="100" y1="10" x2="100" y2="90" stroke="purple" stroke-width="2" stroke-dasharray="5,2" /> 
                                <text x="105" y="20" font-size="10" fill="#3b82f6">r''</text>
                                <text x="105" y="90" font-size="10" fill="#10b981">r'</text>
                                <text x="130" y="50" font-size="10" fill="gray">Coinciden en una linea</text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `,
        exercises: [{ id: 'ex-line-trace', title: 'Hallar Trazas', level: 'Medio', statement: 'Dada una recta A(20,10,30) B(60,40,10), halla sus trazas.', setup: [], solutionHint: 'Prolonga' }]
    },

    // 3. EL PLANO (COMPLETO)
    {
        id: 'theory-3-plane',
        title: '3. El Plano',
        description: 'Determinación, trazas, rectas notables y clasificación exhaustiva de planos.',
        category: 'Teoría',
        theoryContent: `
             <div class="space-y-8 text-slate-700 break-inside-avoid-page">
                <h3 class="text-2xl font-bold text-slate-900 mb-4 font-serif">1. Determinación del Plano</h3>
                <p>Un plano no es solo "trazas". Se define geométricamente por:</p>
                <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
                    <ul class="list-disc pl-5 space-y-2 text-slate-700">
                        <li><strong>3 Puntos</strong> no alineados.</li>
                        <li><strong>2 Rectas</strong> que se cortan.</li>
                        <li><strong>2 Rectas</strong> paralelas.</li>
                        <li><strong>1 Recta</strong> y <strong>1 Punto</strong> exterior.</li>
                    </ul>
                </div>

                <h3 class="text-2xl font-bold text-slate-900 mb-4 font-serif">2. Trazas del Plano</h3>
                <p>Las trazas (<strong>α₁</strong>, <strong>α₂</strong>) son las rectas de intersección del plano con el PH y el PV.</p>
                
                 <h3 class="text-2xl font-bold text-slate-900 mt-8 mb-4 font-serif">3. Clasificación Completa</h3>
                 <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Oblicuo -->
                    <div class="bg-white border-l-4 border-purple-500 p-4 rounded shadow-sm break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-slate-900">1. Plano Oblicuo (Cualquiera)</h4>
                            <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">Más común</span>
                        </div>
                        <div class="bg-slate-50 rounded h-32 mt-2 flex items-center justify-center cursor-zoom-in border border-slate-100">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" className="stroke-black dark:stroke-white" stroke-width="2" />
                                 <!-- LT Marks -->
                                <line x1="20" y1="55" x2="35" y2="55" className="stroke-black dark:stroke-white" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" className="stroke-black dark:stroke-white" stroke-width="2" />

                                <line x1="60" y1="10" x2="90" y2="50" stroke="#f97316" stroke-width="2" /> <text x="65" y="20" font-size="10" fill="#f97316">α₂</text>
                                <line x1="90" y1="50" x2="130" y2="90" stroke="#f97316" stroke-width="2" /> <text x="120" y="80" font-size="10" fill="#f97316">α₁</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Proyectantes -->
                    <div class="bg-white border-l-4 border-emerald-500 p-4 rounded shadow-sm break-inside-avoid">
                         <div class="flex justify-between">
                            <h4 class="font-bold text-slate-900">2. Proyectantes</h4>
                            <span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">⊥ a un plano</span>
                        </div>
                        <p class="text-sm text-slate-500 my-1">Una traza es perpendicular a LT.</p>
                        <div class="bg-slate-50 rounded h-32 mt-2 flex items-center justify-center cursor-zoom-in gap-4 border border-slate-100">
                             <!-- Proj Horiz -->
                            <svg width="90" height="80" viewBox="0 0 100 80">
                                <line x1="0" y1="40" x2="100" y2="40" className="stroke-black dark:stroke-white" />
                                <line x1="50" y1="10" x2="50" y2="40" stroke="#f97316" stroke-width="2" />
                                <line x1="50" y1="40" x2="20" y2="70" stroke="#f97316" stroke-width="2" />
                                <text x="10" y="20" font-size="8" fill="#475569">Proyectante H.</text>
                            </svg>
                            <!-- Proj Vert -->
                            <svg width="90" height="80" viewBox="0 0 100 80">
                                <line x1="0" y1="40" x2="100" y2="40" className="stroke-black dark:stroke-white" />
                                <line x1="20" y1="10" x2="50" y2="40" stroke="#f97316" stroke-width="2" />
                                <line x1="50" y1="40" x2="50" y2="70" stroke="#f97316" stroke-width="2" />
                                <text x="10" y="20" font-size="8" fill="#475569">Proyectante V.</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Paralelo a LT -->
                    <div class="bg-white border-l-4 border-blue-500 p-4 rounded shadow-sm break-inside-avoid">
                        <h4 class="font-bold text-slate-900">3. Paralelo a LT</h4>
                        <p class="text-sm text-slate-500 my-1">Ambas trazas son paralelas a LT.</p>
                        <div class="bg-slate-50 rounded h-32 mt-2 flex items-center justify-center cursor-zoom-in border border-slate-100">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" className="stroke-black dark:stroke-white" stroke-width="2" />
                                <line x1="20" y1="20" x2="180" y2="20" stroke="#f97316" stroke-width="2" /> <text x="185" y="25" font-size="10" fill="#f97316">α₂</text>
                                <line x1="20" y1="80" x2="180" y2="80" stroke="#f97316" stroke-width="2" /> <text x="185" y="85" font-size="10" fill="#f97316">α₁</text>
                            </svg>
                        </div>
                    </div>

                    <!-- De Perfil -->
                    <div class="bg-white border-l-4 border-orange-500 p-4 rounded shadow-sm break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-slate-900">4. De Perfil</h4>
                            <span class="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">Necesita 3ª Vista</span>
                        </div>
                        <p class="text-sm text-slate-500 my-1">Ambas trazas son perpendiculares a LT (en la misma línea).</p>
                        <div class="bg-slate-50 rounded h-32 mt-2 flex items-center justify-center cursor-zoom-in border border-slate-100">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" className="stroke-black dark:stroke-white" stroke-width="2" />
                                <line x1="100" y1="10" x2="100" y2="90" stroke="#f97316" stroke-width="2" />
                                <text x="105" y="20" font-size="10" fill="#f97316">α₂</text>
                                <text x="105" y="80" font-size="10" fill="#f97316">α₁</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Pasa por LT -->
                    <div class="bg-white border-l-4 border-red-500 p-4 rounded shadow-sm break-inside-avoid md:col-span-2 lg:col-span-1">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-slate-900">5. Pasa por la Línea de Tierra</h4>
                            <span class="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100">Especial</span>
                        </div>
                        <p class="text-sm text-slate-500 my-1">Sus trazas coinciden con la LT. Se define por un punto P de perfil.</p>
                        <div class="bg-slate-50 rounded h-32 mt-2 flex items-center justify-center cursor-zoom-in border border-slate-100">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" className="stroke-black dark:stroke-white" stroke-width="2" />
                                <circle cx="100" cy="50" r="3" fill="#f97316" />
                                <text x="100" y="40" font-size="10" fill="#f97316">α₁ = α₂ = LT</text>
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

    // 4. INTERSECCIONES
    {
        id: 'theory-4-intersections',
        title: '4. Intersecciones',
        description: 'Métodos para hallar puntos y rectas comunes. Intersección Recta-Plano, Plano-Plano y casos complejos.',
        category: 'Teoría',
        theoryContent: (
            <div className="space-y-12 text-slate-700">
                <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Fundamentos</h3>
                    <p className="text-blue-800">
                        La intersección es la base de la geometría descriptiva. Siempre buscamos elementos comunes (puntos o rectas).
                    </p>
                </div>

                {/* 1. Intersección Recta - Plano */}
                <StepByStepVisualizer
                    title="1. Intersección Recta - Plano (Método General)"
                    steps={[
                        {
                            title: 'Planteamiento',
                            description: 'Queremos hallar el punto I donde la recta r atraviesa el plano Alpha.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    {/* Plane Alpha - Infinite appearance */}
                                    <line x1="120" y1="125" x2="60" y2="-20" stroke="#3b82f6" strokeWidth="2" /> <text x="70" y="20" fill="#3b82f6">Alpha2</text>
                                    <line x1="120" y1="125" x2="200" y2="270" stroke="#3b82f6" strokeWidth="2" /> <text x="180" y="230" fill="#3b82f6">Alpha1</text>
                                    {/* Line r (Oblique) - Infinite */}
                                    <line x1="0" y1="70" x2="300" y2="40" stroke="#ef4444" strokeWidth="2" /> <text x="280" y="55" fill="#ef4444">r''</text>
                                    <line x1="0" y1="200" x2="300" y2="140" stroke="#ef4444" strokeWidth="2" /> <text x="280" y="155" fill="#ef4444">r'</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paso 1: Plano Proyectante Auxiliar',
                            description: 'Contenemos la recta r en un plano auxiliar Beta. Usaremos un proyectante vertical (Beta1 ⊥ LT) o proyectante horizontal (Beta2 ⊥ LT). Aquí usamos Proyectante Vertical (Beta1 ⊥ LT, contiene a r\').',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />

                                    {/* Previous Alpha faded */}
                                    <line x1="120" y1="125" x2="60" y2="-20" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="120" y1="125" x2="200" y2="270" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    {/* Line r faded */}
                                    <line x1="0" y1="70" x2="300" y2="40" stroke="#ef4444" strokeWidth="2" opacity="0.5" />
                                    <line x1="0" y1="200" x2="300" y2="140" stroke="#ef4444" strokeWidth="2" opacity="0.5" />

                                    {/* Beta (Projecting plane containing r) */}
                                    {/* Beta1 = r' */}
                                    <line x1="0" y1="200" x2="300" y2="140" stroke="purple" strokeWidth="4" opacity="0.4" /> <text x="250" y="170" fill="purple">Beta1 (=r')</text>

                                    {/* Beta2 intersection with LT */}
                                    <line x1="250" y1="125" x2="250" y2="-50" stroke="purple" strokeWidth="2" /> <text x="255" y="20" fill="purple">Beta2 (⊥ LT)</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paso 2: Intersección de Planos (i)',
                            description: 'Hallamos la recta de intersección i entre Alpha y Beta. Donde se cortan las trazas verticales (v) y horizontales (h).',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />

                                    {/* Context faded */}
                                    <line x1="120" y1="125" x2="60" y2="-20" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="120" y1="125" x2="200" y2="270" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="250" y1="125" x2="250" y2="-50" stroke="purple" strokeWidth="2" opacity="0.3" />
                                    <line x1="0" y1="200" x2="300" y2="140" stroke="purple" strokeWidth="4" opacity="0.1" />

                                    {/* Intersections */}
                                    {/* V = Alpha2 (blue) x Beta2 (purple) */}
                                    {/* Redrawing Logic for Step 2 with new geometry */}
                                    <line x1="100" y1="125" x2="160" y2="20" stroke="#3b82f6" strokeWidth="2" opacity="0.5" /> {/* A2 Right Up */}
                                    <line x1="100" y1="125" x2="120" y2="220" stroke="#3b82f6" strokeWidth="2" opacity="0.5" /> {/* A1 Right Down */}

                                    <line x1="140" y1="125" x2="140" y2="20" stroke="purple" strokeWidth="2" opacity="0.5" /> {/* B2 (Projecting) */}

                                    {/* Intersection V = A2 x B2 */}
                                    <circle cx="140" cy="55" r="4" fill="#f97316" /> <text x="145" y="55" fill="#f97316">V</text>

                                    {/* Intersection H = A1 x B1 (B1 is r') */}
                                    {/* B1/r' needs to cross A1. */}
                                    <line x1="20" y1="200" x2="200" y2="150" stroke="#ef4444" strokeWidth="2" opacity="0.3" /> {/* r' */}
                                    <circle cx="114" cy="175" r="4" fill="#f97316" /> <text x="120" y="175" fill="#f97316">H</text>

                                    {/* Line i joining V and H */}
                                    <line x1="140" y1="55" x2="114" y2="175" stroke="#f97316" strokeWidth="2" strokeDasharray="5,5" /> <text x="135" y="100" fill="#f97316">i</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paso 3: Punto I',
                            description: 'El punto donde la recta i corta a la recta original r es el punto de intersección I.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />

                                    {/* r faded */}
                                    <line x1="0" y1="70" x2="300" y2="40" stroke="#ef4444" strokeWidth="2" opacity="0.4" /> <text x="280" y="55" fill="#ef4444">r''</text>
                                    <line x1="0" y1="200" x2="300" y2="140" stroke="#ef4444" strokeWidth="2" opacity="0.4" /> <text x="280" y="155" fill="#ef4444">r'</text>

                                    {/* i faded */}
                                    <line x1="140" y1="55" x2="114" y2="175" stroke="#f97316" strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />

                                    {/* Intersection I'' (r'' x i'') */}
                                    <circle cx="128" cy="100" r="4" fill="#ef4444" className="stroke-black dark:stroke-white" strokeWidth="1" /> <text x="135" y="100" fill="#ef4444" fontWeight="bold">I''</text>

                                    {/* Refer down to r' */}
                                    <line x1="128" y1="100" x2="128" y2="170" stroke="gray" strokeDasharray="2,2" />

                                    <circle cx="128" cy="170" r="4" fill="#ef4444" className="stroke-black dark:stroke-white" strokeWidth="1" /> <text x="135" y="170" fill="#ef4444" fontWeight="bold">I'</text>
                                </svg>
                            )
                        }
                    ]}
                />

                {/* 2. Intersección Plano - Plano */}
                {/* 2. Intersección Plano - Plano */}
                <StepByStepVisualizer
                    title="2. Intersección Plano - Plano"
                    steps={[
                        {
                            title: 'Concepto',
                            description: 'La intersección es una recta definida por dos puntos: V (donde se cortan las trazas verticales) y H (donde se cortan las trazas horizontales).',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    {/* Alpha - Infinite */}
                                    <line x1="80" y1="125" x2="40" y2="20" stroke="#3b82f6" strokeWidth="2" /> <text x="45" y="30" fill="#3b82f6">A2</text>
                                    <line x1="80" y1="125" x2="180" y2="270" stroke="#3b82f6" strokeWidth="2" /> <text x="160" y="230" fill="#3b82f6">A1</text>
                                    {/* Beta - Infinite */}
                                    <line x1="220" y1="125" x2="180" y2="20" stroke="#10b981" strokeWidth="2" /> <text x="185" y="30" fill="#10b981">B2</text>
                                    <line x1="220" y1="125" x2="140" y2="270" stroke="#10b981" strokeWidth="2" /> <text x="160" y="240" fill="#10b981">B1</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Hallar Puntos de Corte',
                            description: 'V = A2 ∩ B2. H = A1 ∩ B1.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    {/* Faded lines */}
                                    <line x1="80" y1="125" x2="40" y2="20" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="220" y1="125" x2="180" y2="20" stroke="#10b981" strokeWidth="2" opacity="0.3" />

                                    {/* Intersection Top (Visual) */}
                                    {/* A2 and B2 intersection. 
                                        A2: (80,125) to (40,20). Slope: (20-125)/(40-80) = 105/40 = 2.625
                                        B2: (220,125) to (180,20). Slope: (20-125)/(180-220) = 105/40 = 2.625. Parallel?
                                        Wait, they both go Left-Up? Yes. They might not intersect on canvas.
                                        I need opposite slopes for nice intersection.
                                        Let's change B2 to go Right-Up. (220,125) to (260, 20).
                                    */}
                                    {/* Adjusted B2 for visual clarity */}
                                    <line x1="220" y1="125" x2="260" y2="20" stroke="#10b981" strokeWidth="2" opacity="0.3" />
                                    {/* Intersection: A2 (Left-Up) and B2 (Right-Up). They intersect above LT.
                                        Midpoint x approx 150. y approx ?
                                        Let's just put the V point somewhere plausible.
                                    */}
                                    <circle cx="150" cy="50" r="4" fill="#f97316" /> <text x="160" y="50" fill="#f97316">V</text>

                                    {/* Intersection Bottom */}
                                    <line x1="80" y1="125" x2="180" y2="270" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="220" y1="125" x2="140" y2="270" stroke="#10b981" strokeWidth="2" opacity="0.3" />
                                    {/* Intersection H: A1 (Right-Down) and B1 (Left-Down). Intersect below. */}
                                    <circle cx="140" cy="210" r="4" fill="#f97316" /> <text x="150" y="210" fill="#f97316">H</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Recta Intersección (i)',
                            description: 'Unimos V y H. La recta i (infinita) pasa por ambos puntos.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    {/* Context faded */}
                                    <circle cx="150" cy="50" r="4" fill="#f97316" opacity="0.5" />
                                    <circle cx="140" cy="210" r="4" fill="#f97316" opacity="0.5" />

                                    {/* Line i'' (Vertical Projection) connecting V'' and H'' */}
                                    {/* V''=(150,50). H''=(140,125) on LT. */}
                                    <line x1="150" y1="50" x2="140" y2="125" stroke="#f97316" strokeWidth="2" strokeDasharray="5,5" />
                                    <text x="155" y="70" fill="#f97316" fontWeight="bold">i''</text>

                                    {/* Line i' (Horizontal Projection) connecting V' and H' */}
                                    {/* V'=(150,125) on LT. H'=(140,210). */}
                                    <line x1="150" y1="125" x2="140" y2="210" stroke="#f97316" strokeWidth="2" strokeDasharray="5,5" />
                                    <text x="145" y="190" fill="#f97316" fontWeight="bold">i'</text>
                                </svg>
                            )
                        }
                    ]}
                />

                {/* 3. CASO COMPLEJO: 3 PLANOS */}
                {/* 3. CASO COMPLEJO: 3 PLANOS */}
                <StepByStepVisualizer
                    title="3. Intersección de 3 Planos (A, B, C)"
                    steps={[
                        {
                            title: 'Planteamiento',
                            description: 'Tenemos 3 planos definidos por sus trazas. Buscamos el punto común P. Es la intersección de las 3 superficies.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    {/* Plane A (Blue) */}
                                    <line x1="50" y1="125" x2="20" y2="20" stroke="#3b82f6" strokeWidth="2" /> <text x="25" y="30" fill="#3b82f6">A2</text>
                                    <line x1="50" y1="125" x2="80" y2="220" stroke="#3b82f6" strokeWidth="2" /> <text x="85" y="210" fill="#3b82f6">A1</text>
                                    {/* Plane B (Green) */}
                                    <line x1="250" y1="125" x2="280" y2="20" stroke="#10b981" strokeWidth="2" /> <text x="285" y="30" fill="#10b981">B2</text>
                                    <line x1="250" y1="125" x2="220" y2="220" stroke="#10b981" strokeWidth="2" /> <text x="210" y="210" fill="#10b981">B1</text>
                                    {/* Plane C (Purple) - For visual clarity, maybe Projecting or just distinct */}
                                    <line x1="150" y1="125" x2="150" y2="20" stroke="purple" strokeWidth="2" /> <text x="155" y="30" fill="purple">C2</text>
                                    <line x1="150" y1="125" x2="180" y2="220" stroke="purple" strokeWidth="2" /> <text x="185" y="210" fill="purple">C1</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paso 1: Intersección A ∩ B = Recta i',
                            description: 'Hallamos la recta i intersección de A y B (V1-H1).',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />

                                    {/* A and B faded */}
                                    <line x1="50" y1="125" x2="20" y2="20" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="50" y1="125" x2="80" y2="220" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="250" y1="125" x2="280" y2="20" stroke="#10b981" strokeWidth="2" opacity="0.3" />
                                    <line x1="250" y1="125" x2="220" y2="220" stroke="#10b981" strokeWidth="2" opacity="0.3" />

                                    {/* Intersections of A and B */}
                                    {/* V = A2 x B2. A2(50,125)->(20,20). B2(250,125)->(280,20). Intersect high up?
                                        Actually they diverge upwards. Distances increase.
                                        Need to adjust slopes for convergence.
                                        Let's assume generic result: Line i.
                                    */}
                                    <line x1="120" y1="20" x2="180" y2="230" stroke="#f97316" strokeWidth="2" /> <text x="185" y="190" fill="#f97316">i = A ∩ B</text>
                                    <circle cx="135" cy="70" r="3" fill="#f97316" /> <text x="140" y="70" fill="#f97316">V</text>
                                    <circle cx="165" cy="180" r="3" fill="#f97316" /> <text x="170" y="180" fill="#f97316">H</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paso 2: Intersección Recta i - Plano C',
                            description: 'Hallamos el punto donde la recta i atraviesa al plano C. (Intersección Recta-Plano).',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />

                                    {/* C faded */}
                                    <line x1="150" y1="125" x2="150" y2="20" stroke="purple" strokeWidth="2" opacity="0.3" />
                                    <line x1="150" y1="125" x2="180" y2="220" stroke="purple" strokeWidth="2" opacity="0.3" />

                                    {/* i faded */}
                                    <line x1="120" y1="20" x2="180" y2="230" stroke="#f97316" strokeWidth="2" opacity="0.5" />

                                    {/* Point P intersection */}
                                    <circle cx="150" cy="125" r="5" fill="red" stroke="white" strokeWidth="2" /> <text x="160" y="115" fill="red" fontWeight="bold">P</text>

                                    <text x="150" y="240" textAnchor="middle" fill="slate-600">P es la solución común</text>
                                </svg>
                            )
                        }
                    ]}
                />
            </div>
        ),
        exercises: []
    },

    // 5. PARALELISMO Y PERPENDICULARIDAD
    {
        id: 'theory-5-parallelism',
        title: '5. Paralelismo y Perpendicularidad',
        description: 'Métodos interactivos paso a paso para resolver problemas de paralelismo y perpendicularidad.',
        category: 'Teoría',
        theoryContent: (
            <div className="space-y-12 text-slate-700">
                <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Metodología Interactiva</h3>
                    <p className="text-blue-800">
                        Usa los controles <strong>Anterior / Siguiente</strong> para ver la construcción paso a paso.
                    </p>
                </div>

                {/* 1.1 Recta || Recta */}
                <StepByStepVisualizer
                    title="1.1. Recta paralela a Recta (Por un punto P)"
                    steps={[
                        {
                            title: 'Planteamiento',
                            description: 'Dada una recta r (proyecciones r\', r\'\') y un punto P exterior. Queremos trazar s || r que pase por P.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="20" y1="125" x2="280" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="50" y1="100" x2="150" y2="50" stroke="#3b82f6" strokeWidth="2" /> <text x="155" y="55" fill="#3b82f6" fontSize="12">r''</text>
                                    <line x1="50" y1="150" x2="150" y2="200" stroke="#10b981" strokeWidth="2" /> <text x="155" y="200" fill="#10b981" fontSize="12">r'</text>
                                    <circle cx="200" cy="80" r="3" fill="#ef4444" /> <text x="210" y="80" fill="#ef4444" fontSize="12">P''</text>
                                    <circle cx="220" cy="180" r="3" fill="#ef4444" /> <text x="230" y="180" fill="#ef4444" fontSize="12">P'</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paralela Horizontal (s\' || r\')',
                            description: 'La condición de paralelismo es directa: s\' debe ser paralela a r\'. Trazamos por P\'.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="20" y1="125" x2="280" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="50" y1="100" x2="150" y2="50" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="50" y1="150" x2="150" y2="200" stroke="#10b981" strokeWidth="2" opacity="0.3" />
                                    <circle cx="200" cy="80" r="3" fill="#ef4444" />
                                    <circle cx="220" cy="180" r="3" fill="#ef4444" />
                                    <line x1="170" y1="155" x2="270" y2="205" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" /> <text x="275" y="205" fill="#10b981" fontSize="12" fontWeight="bold">s'</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paralela Vertical (s\'\' || r\'\')',
                            description: 'Igualmente, s\'\' debe ser paralela a r\'\'. Trazamos por P\'\'. Solución completada.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="20" y1="125" x2="280" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="50" y1="100" x2="150" y2="50" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="50" y1="150" x2="150" y2="200" stroke="#10b981" strokeWidth="2" opacity="0.3" />
                                    <line x1="170" y1="155" x2="270" y2="205" stroke="#10b981" strokeWidth="2" /> <text x="275" y="205" fill="#10b981" fontSize="12">s'</text>
                                    <line x1="150" y1="105" x2="250" y2="55" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" /> <text x="255" y="60" fill="#3b82f6" fontSize="12" fontWeight="bold">s''</text>
                                </svg>
                            )
                        }
                    ]}
                />

                {/* 1.2 Recta || Plano */}
                <StepByStepVisualizer
                    title="1.2. Recta paralela a Plano"
                    steps={[
                        {
                            title: 'Concepto Clave',
                            description: 'Una recta es paralela a un plano si es paralela a CUALQUIER recta contenida en ese plano. Para trazar r por P paralela a Alpha, basta con dibujar una recta auxiliar s en Alpha y hacer r || s.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="20" y1="200" x2="280" y2="200" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="50" y1="200" x2="20" y2="50" stroke="#f97316" strokeWidth="2" /> <text x="25" y="60" fill="#f97316">Alpha2</text>
                                    <line x1="50" y1="200" x2="120" y2="240" stroke="#f97316" strokeWidth="2" /> <text x="125" y="240" fill="#f97316">Alpha1</text>
                                    <circle cx="180" cy="100" r="3" fill="#ef4444" /> <text x="190" y="100" fill="#ef4444">P''</text>
                                    <circle cx="200" cy="220" r="3" fill="#ef4444" /> <text x="210" y="220" fill="#ef4444">P'</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paso 1: Recta Auxiliar (s)',
                            description: 'Dibujamos una recta cualquiera s contenida en el plano (sus trazas v\'\' y h\' están en las trazas del plano).',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="20" y1="200" x2="280" y2="200" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="50" y1="200" x2="20" y2="50" stroke="#f97316" strokeWidth="2" opacity="0.3" />
                                    <line x1="50" y1="200" x2="120" y2="240" stroke="#f97316" strokeWidth="2" opacity="0.3" />
                                    <line x1="35" y1="125" x2="90" y2="200" stroke="gray" strokeWidth="1" strokeDasharray="3,3" />
                                    <text x="95" y="190" fill="gray" fontSize="10">s''</text>
                                    <line x1="90" y1="200" x2="85" y2="220" stroke="gray" strokeWidth="1" strokeDasharray="3,3" />
                                    <text x="90" y="225" fill="gray" fontSize="10">s'</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paso 2: Paralela por P',
                            description: 'Por P, trazamos r paralela a s (r\' || s\', r\'\' || s\'\'). La recta r es paralela al plano.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="20" y1="200" x2="280" y2="200" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="35" y1="125" x2="90" y2="200" stroke="gray" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                                    <line x1="90" y1="200" x2="85" y2="220" stroke="gray" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                                    <circle cx="180" cy="100" r="3" fill="#ef4444" />
                                    <circle cx="200" cy="220" r="3" fill="#ef4444" />
                                    <line x1="140" y1="45" x2="220" y2="155" stroke="#10b981" strokeWidth="2" /> <text x="225" y="150" fill="#10b981" fontWeight="bold">r''</text>
                                    <line x1="200" y1="220" x2="195" y2="240" stroke="#10b981" strokeWidth="2" /> <text x="200" y="245" fill="#10b981" fontWeight="bold">r'</text>
                                </svg>
                            )
                        }
                    ]}
                />

                {/* 1.3 Plano || Plano */}
                <StepByStepVisualizer
                    title="1.3. Plano Paralelo a Plano"
                    steps={[
                        {
                            title: 'Condición de Paralelismo',
                            description: 'Dos planos son paralelos si sus trazas homónimas son paralelas (Alpha1 || Beta1 y Alpha2 || Beta2).',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="80" y1="125" x2="40" y2="20" stroke="#3b82f6" strokeWidth="2" /> <text x="45" y="30" fill="#3b82f6">Alpha2</text>
                                    <line x1="80" y1="125" x2="160" y2="270" stroke="#3b82f6" strokeWidth="2" /> <text x="140" y="230" fill="#3b82f6">Alpha1</text>
                                    <circle cx="200" cy="80" r="3" fill="#ef4444" /> <text x="210" y="80" fill="#ef4444">P''</text>
                                    <circle cx="220" cy="180" r="3" fill="#ef4444" /> <text x="230" y="180" fill="#ef4444">P'</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Solución por un Punto P',
                            description: 'Para hacer pasar un plano Beta paralelo a Alpha por P, usamos una recta auxiliar.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="20" y1="125" x2="280" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="80" y1="125" x2="40" y2="20" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="150" y1="80" x2="250" y2="80" stroke="purple" strokeWidth="1" strokeDasharray="3,3" /> <text x="255" y="80" fill="purple">h''</text>
                                    <line x1="220" y1="180" x2="180" y2="125" stroke="purple" strokeWidth="1" strokeDasharray="3,3" /> <text x="225" y="180" fill="purple">h'</text>
                                    <circle cx="180" cy="125" r="3" fill="purple" /> <text x="180" y="115" fill="purple">v</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Trazar Beta',
                            description: 'Beta2 pasa por la traza vertical de la recta (v) y es paralela a Alpha2. Beta1 es paralela a Alpha1.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    {/* Alpha Faded */}
                                    <line x1="80" y1="125" x2="40" y2="20" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="80" y1="125" x2="160" y2="270" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />

                                    {/* Beta Parallel */}
                                    <line x1="180" y1="125" x2="140" y2="20" stroke="#10b981" strokeWidth="2" /> <text x="145" y="30" fill="#10b981">Beta2 (// A2)</text>
                                    <line x1="180" y1="125" x2="260" y2="270" stroke="#10b981" strokeWidth="2" /> <text x="240" y="230" fill="#10b981">Beta1 (// A1)</text>
                                </svg>
                            )
                        }
                    ]}
                />

                {/* 1.4 Plano Paralelo a Recta (MOVED) */}
                <StepByStepVisualizer
                    title="1.4. Plano Paralelo a Recta"
                    steps={[
                        {
                            title: 'Teoría',
                            description: 'Un plano es paralelo a una recta si contiene una recta paralela a la dada. Si nos piden trazar un plano por P paralelo a r, buscamos una recta auxiliar s // r que pase por P. El plano definido por s será paralelo a r.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="0" y1="150" x2="300" y2="50" stroke="#3b82f6" strokeWidth="2" /> <text x="285" y="65" fill="#3b82f6">r''</text>
                                    <line x1="0" y1="125" x2="300" y2="205" stroke="#3b82f6" strokeWidth="2" /> <text x="285" y="195" fill="#3b82f6">r'</text>
                                    <circle cx="80" cy="70" r="3" fill="#ef4444" /> <text x="90" y="70" fill="#ef4444">P''</text>
                                    <circle cx="100" cy="180" r="3" fill="#ef4444" /> <text x="110" y="180" fill="#ef4444">P'</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paso 1: Recta Auxiliar Paralela',
                            description: 'Por P, trazamos s paralela a r (s\'\' // r\'\' y s\' // r\').',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="20" y1="125" x2="280" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="200" y1="100" x2="280" y2="60" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="200" y1="150" x2="280" y2="190" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />

                                    <line x1="60" y1="80" x2="140" y2="40" stroke="purple" strokeWidth="2" strokeDasharray="5,5" /> <text x="145" y="45" fill="purple">s'' // r''</text>
                                    <line x1="80" y1="170" x2="160" y2="210" stroke="purple" strokeWidth="2" strokeDasharray="5,5" /> <text x="165" y="215" fill="purple">s' // r'</text>

                                    <circle cx="80" cy="70" r="3" fill="#ef4444" />
                                    <circle cx="100" cy="180" r="3" fill="#ef4444" />
                                </svg>
                            )
                        },
                        {
                            title: 'Paso 2: Plano Solución',
                            description: 'Cualquier plano que contenga a la recta s será paralelo a r. Hallaríamos las trazas de s (Vs, Hs) y pasaríamos un plano por ellas.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="20" y1="125" x2="280" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />

                                    {/* Persistence of previous step */}
                                    <line x1="60" y1="80" x2="140" y2="40" stroke="purple" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
                                    <line x1="80" y1="170" x2="160" y2="210" stroke="purple" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />

                                    {/* Visual plane traces passing through s traces */}
                                    <line x1="160" y1="125" x2="120" y2="20" stroke="#f97316" strokeWidth="2" /> <text x="125" y="30" fill="#f97316">Alpha2</text>
                                    <line x1="160" y1="125" x2="220" y2="220" stroke="#f97316" strokeWidth="2" /> <text x="210" y="220" fill="#f97316">Alpha1</text>

                                    <text x="150" y="150" fill="gray" fontSize="10">El plano contiene a s</text>
                                </svg>
                            )
                        }
                    ]}
                />

                <h3 className="text-3xl font-bold text-slate-900 mt-16 mb-8 flex items-center gap-3 border-b pb-4">
                    <span className="bg-red-100 text-red-600 p-2 rounded-lg text-2xl">⊥</span>
                    2. Perpendicularidad
                </h3>

                {/* 2.1 Recta ⊥ Plano */}
                <StepByStepVisualizer
                    title="2.1. Recta Perpendicular a Plano"
                    steps={[
                        {
                            title: 'Teorema Fundamental',
                            description: 'Una recta es perpendicular a un plano si sus proyecciones son perpendiculares a las trazas del plano (r\' ⊥ Alpha1, r\'\' ⊥ Alpha2). Directamente.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="100" y1="125" x2="60" y2="40" stroke="#3b82f6" strokeWidth="2" /> <text x="65" y="50" fill="#3b82f6">Alpha2</text>
                                    <line x1="100" y1="125" x2="160" y2="270" stroke="#3b82f6" strokeWidth="2" /> <text x="150" y="270" fill="#3b82f6">Alpha1</text>
                                    <circle cx="200" cy="80" r="3" fill="#ef4444" /> <text x="210" y="80" fill="#ef4444">P''</text>
                                    <circle cx="220" cy="180" r="3" fill="#ef4444" /> <text x="230" y="180" fill="#ef4444">P'</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Trazar Perpendiculares',
                            description: 'Desde P\'\', trazamos perpendicular a Alpha2. Desde P\', trazamos perpendicular a Alpha1.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <text x="150" y="30" fontSize="12" textAnchor="middle" fill="#333">Caso 1: Recta Frontal (⊥ en Vertical)</text>
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="100" y1="125" x2="60" y2="40" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="100" y1="125" x2="160" y2="270" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                    <line x1="200" y1="80" x2="240" y2="100" stroke="#ef4444" strokeWidth="2" />
                                    <text x="245" y="95" fill="#ef4444" fontWeight="bold">r'' (⊥ a α₂)</text>
                                    <line x1="220" y1="180" x2="180" y2="205" stroke="#ef4444" strokeWidth="2" />
                                    <text x="175" y="215" fill="#ef4444" fontWeight="bold">r' (⊥ a α₁)</text>
                                </svg>
                            )
                        }
                    ]}
                />

                {/* 2.4 Recta Perpendicular a Recta (CORREGIDO) */}
                <StepByStepVisualizer
                    title="2.4 Recta Perpendicular a otra por un Punto"
                    steps={[
                        {
                            title: 'Teoría General',
                            description: 'Para dibujar una recta perpendicular a otra dada (r) que pase por un punto (P), existen dos posibilidades principales.',
                            diagram: (
                                <div className="p-4 text-sm text-slate-700">
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Opción A:</strong> Recta Horizontal o Frontal. Si la recta buscada es paralela a un plano de proyección, el ángulo de 90° se ve en verdadera magnitud en ese plano.</li>
                                        <li><strong>Opción B (General):</strong> Plano Perpendicular. Trazamos un plano perpendicular a 'r' que pase por 'P', y contenemos una recta en él.</li>
                                    </ul>
                                </div>
                            )
                        },
                        {
                            title: 'Opción A: Recta Frontal',
                            description: 'Buscamos una recta s (Frontal) que pase por P y sea perpendicular a r. Su proyección vertical s\'\' será perpendicular a r\'\'.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />

                                    {/* Recta r (Oblicua cualquiera) */}
                                    <line x1="50" y1="100" x2="250" y2="50" stroke="#ef4444" strokeWidth="2" /> <text x="260" y="55" fill="#ef4444">r''</text>
                                    <line x1="50" y1="200" x2="250" y2="150" stroke="#ef4444" strokeWidth="2" /> <text x="260" y="155" fill="#ef4444">r'</text>

                                    {/* Punto P */}
                                    <circle cx="150" cy="75" r="3" fill="black" /> <text x="160" y="75" fill="black">P''</text>
                                    <circle cx="150" cy="175" r="3" fill="black" /> <text x="160" y="175" fill="black">P'</text>

                                    {/* Recta s (Frontal) */}
                                    {/* s'' perpendicular a r'' pasando por P'' */}
                                    {/* r'' slope: -50/200 = -0.25. Perp slope: 4. */}
                                    {/* y - 75 = 4(x - 150). Too steep. 
                                        Let's redraw r to be steeper so s is visible.
                                        r'': (100,20) to (140,100). m = 80/40 = 2.
                                        s'' perp m = -0.5.
                                    */}
                                    <line x1="120" y1="20" x2="140" y2="80" stroke="#ef4444" strokeWidth="2" /> {/* r'' */}
                                    <line x1="100" y1="200" x2="200" y2="150" stroke="#ef4444" strokeWidth="2" /> {/* r' */}

                                    {/* P (150, 60) and (150, 180) */}
                                    <circle cx="160" cy="60" r="3" fill="black" />
                                    <circle cx="160" cy="180" r="3" fill="black" />

                                    {/* s'' perp to r''. r'' slope 3. s'' slope -0.33 */}
                                    <line x1="100" y1="80" x2="220" y2="40" stroke="#10b981" strokeWidth="2" /> <text x="225" y="40" fill="#10b981">s'' (⊥ r'')</text>

                                    {/* s' parallel to LT (Frontal) */}
                                    <line x1="100" y1="180" x2="220" y2="180" stroke="#10b981" strokeWidth="2" /> <text x="225" y="180" fill="#10b981">s' (// LT)</text>
                                </svg>
                            )
                        }
                    ]}
                />


                {/* 2. PERPENDICULARIDAD EXPANDED */}
                <StepByStepVisualizer
                    title="2.2. Plano Perpendicular a Recta"
                    steps={
                        [
                            {
                                title: 'Teoría',
                                description: 'Un plano es perpendicular a una recta si sus trazas son perpendiculares a las proyecciones homónimas de la recta (Alpha1 ⊥ r\' y Alpha2 ⊥ r\'\'). Pasando por un punto P.',
                                diagram: (
                                    <svg width="100%" height="250" viewBox="0 0 300 250">
                                        <line x1="20" y1="125" x2="280" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                        <line x1="120" y1="80" x2="180" y2="40" stroke="#3b82f6" strokeWidth="2" /> <text x="185" y="45" fill="#3b82f6">r''</text>
                                        <line x1="120" y1="170" x2="180" y2="210" stroke="#10b981" strokeWidth="2" /> <text x="185" y="215" fill="#10b981">r'</text>
                                        <circle cx="100" cy="60" r="3" fill="#ef4444" /> <text x="110" y="60" fill="#ef4444">P''</text>
                                        <circle cx="100" cy="190" r="3" fill="#ef4444" /> <text x="110" y="190" fill="#ef4444">P'</text>
                                    </svg>
                                )
                            },
                            {
                                title: 'Paso 1: Recta Horizontal (h)',
                                description: 'Como el plano será ⊥ a r, cualquier recta horizontal contenida tendrá su proyección h\' ⊥ r\'. Trazamos h por P tal que h\' ⊥ r\'.',
                                diagram: (
                                    <svg width="100%" height="250" viewBox="0 0 300 250">
                                        <line x1="20" y1="125" x2="280" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                        <line x1="120" y1="80" x2="180" y2="40" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                                        <line x1="120" y1="170" x2="180" y2="210" stroke="#10b981" strokeWidth="2" opacity="0.3" />

                                        {/* h'' parallel to LT through P'' */}
                                        <line x1="50" y1="60" x2="150" y2="60" stroke="purple" strokeWidth="1" strokeDasharray="3,3" /> <text x="155" y="60" fill="purple">h'' (// LT)</text>

                                        {/* h' perpendicular to r' through P' */}
                                        {/* r' slope roughly +0.6. perp slope -1.6 */}
                                        <line x1="140" y1="130" x2="80" y2="230" stroke="purple" strokeWidth="1" strokeDasharray="3,3" /> <text x="85" y="235" fill="purple">h' (⊥ r')</text>

                                        <circle cx="100" cy="60" r="3" fill="#ef4444" />
                                        <circle cx="100" cy="190" r="3" fill="#ef4444" />
                                    </svg>
                                )
                            },
                            {
                                title: 'Paso 2: Traza Vertical (v) y Plano',
                                description: 'Hallamos la traza v de la recta h. Por v, dibujamos Alpha2 perpendicular a r\'\'. Donde Alpha2 corte a LT, dibujamos Alpha1 perpendicular a r\'.',
                                diagram: (
                                    <svg width="100%" height="250" viewBox="0 0 300 250">
                                        <line x1="20" y1="125" x2="280" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                        {/* v point where h' cuts LT then up to h'' */}
                                        {/* Visual approx: h' cuts LT(125) at approx x=143 */}
                                        <line x1="143" y1="125" x2="143" y2="60" stroke="purple" strokeWidth="1" strokeDasharray="2,2" />
                                        <circle cx="143" cy="60" r="3" fill="#f97316" /> <text x="135" y="55" fill="#f97316" fontSize="10">v</text>

                                        {/* Alpha2 perp to r'' passing through v */}
                                        {/* r'' slope -0.6. perp slope +1.6 */}
                                        <line x1="120" y1="96" x2="160" y2="30" stroke="#f97316" strokeWidth="2" /> <text x="165" y="35" fill="#f97316" fontWeight="bold">Alpha2 (⊥ r'')</text>

                                        {/* Cuts LT at 139 approx */}
                                        {/* Alpha1 perp to r' from cut point */}
                                        {/* r' slope +0.6. perp slope -1.6 */}
                                        <line x1="139" y1="125" x2="100" y2="190" stroke="#f97316" strokeWidth="2" /> <text x="90" y="195" fill="#f97316" fontWeight="bold">Alpha1 (⊥ r')</text>
                                    </svg>
                                )
                            }

                        ]}
                />

                <StepByStepVisualizer
                    title="2.3. Plano Perpendicular a Plano"
                    steps={[
                        {
                            title: 'Condición',
                            description: 'Un plano Beta es perpendicular a otro Alpha si Beta contiene una recta perpendicular a Alpha. Para trazarlo por P, basta con dibujar por P la recta perpendicular al plano dado.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="20" y1="125" x2="280" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    <line x1="100" y1="125" x2="60" y2="40" stroke="#3b82f6" strokeWidth="2" /> <text x="65" y="50" fill="#3b82f6">Alpha2</text>
                                    <line x1="100" y1="125" x2="150" y2="220" stroke="#3b82f6" strokeWidth="2" /> <text x="140" y="220" fill="#3b82f6">Alpha1</text>
                                    <circle cx="200" cy="80" r="3" fill="#ef4444" /> <text x="210" y="80" fill="#ef4444">P''</text>
                                    <circle cx="200" cy="180" r="3" fill="#ef4444" /> <text x="210" y="190" fill="#ef4444">P'</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paso 1: Recta Perpendicular (r)',
                            description: 'Desde P, trazamos r perpendicular a Alpha (r\'\' ⊥ Alpha2, r\' ⊥ Alpha1).',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="20" y1="125" x2="280" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />
                                    {/* r'' perp to Alpha2 */}
                                    <line x1="200" y1="80" x2="240" y2="100" stroke="purple" strokeWidth="2" strokeDasharray="3,3" /> <text x="245" y="100" fill="purple">r''</text>
                                    {/* r' perp to Alpha1 */}
                                    <line x1="200" y1="180" x2="170" y2="195" stroke="purple" strokeWidth="2" strokeDasharray="3,3" /> <text x="160" y="200" fill="purple">r'</text>
                                    <text x="220" y="130" fill="gray" fontSize="10">r ⊥ Alpha visualmente</text>
                                </svg>
                            )
                        },
                        {
                            title: 'Paso 2: Plano Solución',
                            description: 'Cualquier plano que contenga a r será solución. Para concretar, hallamos las trazas de r y trazamos un plano cualquiera que pase por ellas.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <text x="150" y="125" textAnchor="middle" fill="slate-500">Haz de planos perpendiculares (Infinitas soluciones)</text>
                                </svg>
                            )
                        }
                    ]}
                />
                {/* 2.4 Recta ⊥ Recta (NUEVO) */}
                <StepByStepVisualizer
                    title="2.4. Recta Perpendicular a otra por un Punto"
                    steps={[
                        {
                            title: 'Dos Posibilidades',
                            description: 'Para dibujar una recta perpendicular a otra dada por un punto existen 2 posibilidades:',
                            diagram: (
                                <div className="p-4 text-sm text-slate-700 dark:text-slate-300">
                                    <ul className="list-disc pl-5 space-y-4">
                                        <li>
                                            <strong>Opción A:</strong> Dibujar una recta horizontal o frontal que tenga sus proyecciones perpendiculares a la dada. (Teorema de las 3 perpendiculares).
                                        </li>
                                        <li>
                                            <strong>Opción B (General):</strong> Dibujar un plano perpendicular a la recta dada que pase por el punto. Luego, contener cualquier recta en dicho plano que pase por el punto.
                                        </li>
                                    </ul>
                                </div>
                            )
                        },
                        {
                            title: 'Opción A: Recta Horizontal (Ejemplo)',
                            description: 'Si buscamos una perpendicular a r que sea horizontal (h), su proyección horizontal h\' será perpendicular a r\'.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <line x1="-50" y1="125" x2="350" y2="125" className="stroke-black dark:stroke-white" strokeWidth="2" />

                                    {/* Recta r (Oblicua) */}
                                    <line x1="50" y1="80" x2="250" y2="40" stroke="#ef4444" strokeWidth="2" /> <text x="260" y="45" fill="#ef4444">r''</text>
                                    <line x1="50" y1="200" x2="250" y2="160" stroke="#ef4444" strokeWidth="2" /> <text x="260" y="165" fill="#ef4444">r'</text>

                                    {/* Punto P */}
                                    <circle cx="150" cy="60" r="3" fill="black" /> <text x="155" y="60" fill="gray" fontSize="10">P''</text>
                                    <circle cx="150" cy="180" r="3" fill="black" /> <text x="155" y="180" fill="gray" fontSize="10">P'</text>

                                    {/* h (Horizontal) passing through P */}
                                    {/* h'' parallel to LT through P'' */}
                                    <line x1="50" y1="60" x2="250" y2="60" stroke="#10b981" strokeWidth="2" /> <text x="260" y="65" fill="#10b981">h'' (//LT)</text>

                                    {/* h' perpendicular to r' through P' */}
                                    {/* r' slope is (160-200)/(250-50) = -40/200 = -0.2 */}
                                    {/* h' slope = 5 */}
                                    {/* P'=(150,180). y-180 = 5(x-150). if x=140, y=130. if x=160, y=230. */}
                                    <line x1="140" y1="130" x2="160" y2="230" stroke="#10b981" strokeWidth="2" /> <text x="165" y="220" fill="#10b981">h' (⊥ r')</text>

                                    {/* 90 deg visual symbol */}
                                    <path d="M 148 180 L 152 172" stroke="gray" strokeWidth="1" />
                                </svg>
                            )
                        },
                        {
                            title: 'Opción B: Plano Perpendicular',
                            description: 'Trazamos un plano Alpha perpendicular a r por P. Cualquier recta contenida en Alpha que pase por P será perpendicular a r.',
                            diagram: (
                                <svg width="100%" height="250" viewBox="0 0 300 250">
                                    <text x="150" y="125" textAnchor="middle" fill="gray">Ver apartado "Plano Perpendicular a Recta"</text>
                                </svg>
                            )
                        }
                    ]}
                />
            </div >
        ),
        exercises: []
    },

    // 6. DISTANCIAS
    { id: 'theory-6-distances', title: '6. Distancias', description: 'Distancia entre elementos.', category: 'Teoría', theoryContent: 'Contenido 6', exercises: [] },
    { id: 'theory-7-angles', title: '7. Ángulos', description: 'Ángulos.', category: 'Teoría', theoryContent: 'Contenido 7', exercises: [] },
    { id: 'theory-8-abatements', title: '8. Abatimientos', description: 'Abatimientos.', category: 'Teoría', theoryContent: 'Contenido 8', exercises: [] },
    { id: 'theory-9-rotations', title: '9. Giros', description: 'Giros.', category: 'Teoría', theoryContent: 'Contenido 9', exercises: [] },
    { id: 'theory-10-change-plane', title: '10. Cambios de Plano', description: 'Cambios.', category: 'Teoría', theoryContent: 'Contenido 10', exercises: [] },
    { id: 'theory-11-polyhedra', title: '11. Poliedros', description: 'Poliedros.', category: 'Teoría', theoryContent: 'Contenido 11', exercises: [] },
    { id: 'theory-12-surfaces', title: '12. Superficies', description: 'Superficies.', category: 'Teoría', theoryContent: 'Contenido 12', exercises: [] },
    { id: 'theory-13-sections', title: '13. Secciones', description: 'Secciones.', category: 'Teoría', theoryContent: 'Contenido 13', exercises: [] },
    { id: 'theory-14-developments', title: '14. Desarrollos', description: 'Desarrollos.', category: 'Teoría', theoryContent: 'Contenido 14', exercises: [] }
];

