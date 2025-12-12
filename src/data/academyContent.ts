import { AcademyTopic } from '../types';

export const ACADEMY_CONTENT: AcademyTopic[] = [
    // 1. EL PUNTO
    {
        id: 'theory-1-point',
        title: '1. Introducción: El Punto',
        description: 'Fundamentos, planos de proyección, coordenadas (X, Y, Z) y alfabeto del punto visual.',
        category: 'Teoría',
        theoryContent: `
            <div class="space-y-10 text-gray-300">
                <!-- INTRODUCCION -->
                <section class="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-2xl border border-blue-500/30">
                    <h3 class="text-3xl font-bold text-white mb-4">Que es el Sistema Diedrico?</h3>
                    <p class="text-lg leading-relaxed mb-4">
                        El <strong class="text-blue-400">Sistema Diedrico</strong> es un metodo de representacion grafica que nos permite 
                        representar objetos tridimensionales (3D) sobre un plano bidimensional (2D), como una hoja de papel o una pantalla.
                    </p>
                    <p class="text-lg leading-relaxed mb-4">
                        Fue desarrollado por el matematico frances <strong class="text-yellow-400">Gaspard Monge</strong> en el siglo XVIII 
                        y es la base de la <em>Geometria Descriptiva</em>, esencial en ingenieria, arquitectura y diseno industrial.
                    </p>
                    <div class="bg-gray-800/50 p-4 rounded-xl mt-4">
                        <p class="text-sm text-gray-400">
                            <strong class="text-white">Aplicaciones:</strong> Planos arquitectonicos, diseno de piezas mecanicas, 
                            trazado de instalaciones, cartografia, y cualquier representacion tecnica precisa.
                        </p>
                    </div>
                </section>

                <!-- PLANOS DE PROYECCION -->
                <section>
                    <h3 class="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                        Los Planos de Proyeccion
                    </h3>
                    <p class="mb-6 text-lg">
                        El sistema diedrico utiliza <strong class="text-white">dos planos perpendiculares entre si</strong> que dividen 
                        el espacio en cuatro regiones llamadas <em>cuadrantes</em>:
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div class="space-y-4">
                            <div class="bg-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
                                <h4 class="font-bold text-blue-400 text-lg mb-2">Plano Vertical (PV) - Alzado</h4>
                                <p class="text-gray-300">
                                    Es el plano <strong>frontal</strong>, como una pared que esta frente a nosotros. 
                                    Sobre el se proyecta la <strong class="text-blue-300">proyeccion vertical</strong> de los objetos, 
                                    que nos muestra la <em>cota</em> (altura Z) y la posicion horizontal (X).
                                </p>
                                <p class="text-sm text-gray-400 mt-2">
                                    La proyeccion vertical de un punto P se denota como <strong>P''</strong> (P con dos primas).
                                </p>
                            </div>
                            
                            <div class="bg-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
                                <h4 class="font-bold text-green-400 text-lg mb-2">Plano Horizontal (PH) - Planta</h4>
                                <p class="text-gray-300">
                                    Es el plano del <strong>suelo</strong>, horizontal como una mesa. 
                                    Sobre el se proyecta la <strong class="text-green-300">proyeccion horizontal</strong>, 
                                    que nos muestra el <em>alejamiento</em> (profundidad Y) y la posicion horizontal (X).
                                </p>
                                <p class="text-sm text-gray-400 mt-2">
                                    La proyeccion horizontal de un punto P se denota como <strong>P'</strong> (P con una prima).
                                </p>
                            </div>
                            
                            <div class="bg-gray-800 p-5 rounded-xl border-l-4 border-white">
                                <h4 class="font-bold text-white text-lg mb-2">Linea de Tierra (LT)</h4>
                                <p class="text-gray-300">
                                    Es la <strong>interseccion</strong> de los dos planos. Se representa como una linea horizontal 
                                    con dos pequenos trazos perpendiculares en los extremos. Corresponde al <strong>eje X</strong>.
                                </p>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-2xl shadow-xl cursor-zoom-in hover:scale-105 transition-transform">
                            <svg width="100%" height="280" viewBox="0 0 300 280">
                                <defs>
                                    <linearGradient id="pvGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.3" />
                                        <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:0.5" />
                                    </linearGradient>
                                    <linearGradient id="phGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#22c55e;stop-opacity:0.3" />
                                        <stop offset="100%" style="stop-color:#16a34a;stop-opacity:0.5" />
                                    </linearGradient>
                                </defs>
                                
                                <!-- Plano Vertical (PV) -->
                                <path d="M80 30 L80 140 L220 140 L220 30 Z" fill="url(#pvGrad)" stroke="#3b82f6" stroke-width="2"/>
                                <text x="90" y="50" font-size="14" fill="#1d4ed8" font-weight="bold">PV (Alzado)</text>
                                
                                <!-- Plano Horizontal (PH) en perspectiva -->
                                <path d="M40 200 L80 140 L220 140 L180 200 Z" fill="url(#phGrad)" stroke="#22c55e" stroke-width="2"/>
                                <text x="70" y="185" font-size="14" fill="#166534" font-weight="bold">PH (Planta)</text>
                                
                                <!-- Linea de Tierra (LT) -->
                                <line x1="80" y1="140" x2="220" y2="140" stroke="#000" stroke-width="3"/>
                                <line x1="90" y1="145" x2="110" y2="145" stroke="#000" stroke-width="2"/>
                                <line x1="190" y1="145" x2="210" y2="145" stroke="#000" stroke-width="2"/>
                                <text x="230" y="145" font-size="14" font-weight="bold" fill="#000">LT</text>
                                
                                <!-- Punto P en el espacio -->
                                <circle cx="150" cy="80" r="6" fill="#ef4444"/>
                                <text x="160" y="78" font-size="14" fill="#ef4444" font-weight="bold">P</text>
                                
                                <!-- Lineas de proyeccion -->
                                <line x1="150" y1="80" x2="150" y2="140" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"/>
                                <line x1="150" y1="140" x2="130" y2="170" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"/>
                                
                                <!-- Proyecciones -->
                                <circle cx="150" cy="140" r="4" fill="#3b82f6"/>
                                <text x="155" y="135" font-size="12" fill="#3b82f6" font-weight="bold">P''</text>
                                
                                <circle cx="130" cy="170" r="4" fill="#22c55e"/>
                                <text x="135" y="175" font-size="12" fill="#22c55e" font-weight="bold">P'</text>
                                
                                <!-- Leyenda -->
                                <text x="50" y="230" font-size="10" fill="#666">P = Punto en el espacio 3D</text>
                                <text x="50" y="245" font-size="10" fill="#3b82f6">P'' = Proyeccion vertical</text>
                                <text x="50" y="260" font-size="10" fill="#22c55e">P' = Proyeccion horizontal</text>
                            </svg>
                        </div>
                    </div>
                </section>

                <!-- COORDENADAS DEL PUNTO -->
                <section>
                    <h3 class="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                        Coordenadas del Punto: X, Y, Z
                    </h3>
                    <p class="mb-6 text-lg">
                        Todo punto en el espacio se define por <strong class="text-white">tres coordenadas</strong>:
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div class="bg-red-900/30 p-5 rounded-xl border border-red-500/50 text-center">
                            <span class="text-4xl font-bold text-red-400">X</span>
                            <p class="text-white font-bold mt-2">Abscisa</p>
                            <p class="text-sm text-gray-400">Posicion a lo largo de la LT (izquierda/derecha)</p>
                        </div>
                        <div class="bg-green-900/30 p-5 rounded-xl border border-green-500/50 text-center">
                            <span class="text-4xl font-bold text-green-400">Y</span>
                            <p class="text-white font-bold mt-2">Alejamiento</p>
                            <p class="text-sm text-gray-400">Distancia al PV (profundidad hacia nosotros)</p>
                        </div>
                        <div class="bg-blue-900/30 p-5 rounded-xl border border-blue-500/50 text-center">
                            <span class="text-4xl font-bold text-blue-400">Z</span>
                            <p class="text-white font-bold mt-2">Cota</p>
                            <p class="text-sm text-gray-400">Altura sobre el PH (arriba/abajo)</p>
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 p-6 rounded-xl">
                        <h4 class="font-bold text-white mb-4">Notacion de un Punto</h4>
                        <p class="text-lg mb-4">
                            Un punto se escribe como: <strong class="text-yellow-400 text-xl">P(X, Y, Z)</strong>
                        </p>
                        <p class="text-gray-300">
                            Por ejemplo, <strong class="text-white">A(30, 20, 40)</strong> significa:
                        </p>
                        <ul class="list-disc pl-6 mt-2 space-y-1">
                            <li>Esta a <strong>30 unidades</strong> a lo largo de la LT desde el origen</li>
                            <li>Tiene un <strong>alejamiento de 20</strong> (distancia al PV)</li>
                            <li>Tiene una <strong>cota de 40</strong> (altura sobre el PH)</li>
                        </ul>
                    </div>
                </section>

                <!-- COMO REPRESENTAR UN PUNTO - PASO A PASO -->
                <section>
                    <h3 class="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                        Como Representar un Punto - Paso a Paso
                    </h3>
                    <p class="mb-6 text-lg">
                        Vamos a representar el punto <strong class="text-yellow-400">A(40, 25, 35)</strong> siguiendo estos pasos:
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Pasos -->
                        <div class="space-y-4">
                            <div class="flex gap-4 items-start bg-gray-800/50 p-4 rounded-xl border-l-4 border-red-500">
                                <span class="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                                <div>
                                    <p class="font-bold text-white">Dibuja la Linea de Tierra (LT)</p>
                                    <p class="text-sm text-gray-400">Traza una linea horizontal con los simbolos caracteristicos en los extremos.</p>
                                </div>
                            </div>
                            
                            <div class="flex gap-4 items-start bg-gray-800/50 p-4 rounded-xl border-l-4 border-orange-500">
                                <span class="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                                <div>
                                    <p class="font-bold text-white">Marca la posicion X en la LT</p>
                                    <p class="text-sm text-gray-400">Mide 40 unidades desde el origen a lo largo de la LT.</p>
                                </div>
                            </div>
                            
                            <div class="flex gap-4 items-start bg-gray-800/50 p-4 rounded-xl border-l-4 border-yellow-500">
                                <span class="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                                <div>
                                    <p class="font-bold text-white">Traza la linea de referencia vertical</p>
                                    <p class="text-sm text-gray-400">Desde el punto X, dibuja una perpendicular a la LT.</p>
                                </div>
                            </div>
                            
                            <div class="flex gap-4 items-start bg-gray-800/50 p-4 rounded-xl border-l-4 border-green-500">
                                <span class="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">4</span>
                                <div>
                                    <p class="font-bold text-white">Situa la proyeccion horizontal A'</p>
                                    <p class="text-sm text-gray-400">Baja 25 unidades (alejamiento Y) desde la LT. Marca A'</p>
                                </div>
                            </div>
                            
                            <div class="flex gap-4 items-start bg-gray-800/50 p-4 rounded-xl border-l-4 border-blue-500">
                                <span class="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">5</span>
                                <div>
                                    <p class="font-bold text-white">Situa la proyeccion vertical A''</p>
                                    <p class="text-sm text-gray-400">Sube 35 unidades (cota Z) desde la LT. Marca A''</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- SVG con los pasos -->
                        <div class="bg-white p-6 rounded-2xl shadow-xl">
                            <svg width="100%" height="350" viewBox="0 0 280 350">
                                <!-- Paso 1: LT -->
                                <line x1="20" y1="150" x2="260" y2="150" stroke="#000" stroke-width="3"/>
                                <line x1="30" y1="155" x2="50" y2="155" stroke="#000" stroke-width="2"/>
                                <line x1="230" y1="155" x2="250" y2="155" stroke="#000" stroke-width="2"/>
                                <text x="265" y="155" font-size="14" font-weight="bold">LT</text>
                                
                                <!-- Paso 2: Marca X=40 -->
                                <circle cx="120" cy="150" r="3" fill="#f97316"/>
                                <text x="115" y="170" font-size="10" fill="#f97316">X=40</text>
                                
                                <!-- Paso 3: Linea de referencia -->
                                <line x1="120" y1="50" x2="120" y2="280" stroke="#9ca3af" stroke-width="1" stroke-dasharray="4,2"/>
                                
                                <!-- Paso 4: A' (alejamiento Y=25 hacia abajo) -->
                                <circle cx="120" cy="200" r="6" fill="#22c55e"/>
                                <text x="130" y="205" font-size="14" fill="#22c55e" font-weight="bold">A'</text>
                                <text x="75" y="180" font-size="9" fill="#22c55e">Y=25</text>
                                <line x1="115" y1="150" x2="115" y2="200" stroke="#22c55e" stroke-width="1"/>
                                <polygon points="115,195 112,185 118,185" fill="#22c55e"/>
                                
                                <!-- Paso 5: A'' (cota Z=35 hacia arriba) -->
                                <circle cx="120" cy="80" r="6" fill="#3b82f6"/>
                                <text x="130" y="85" font-size="14" fill="#3b82f6" font-weight="bold">A''</text>
                                <text x="75" y="115" font-size="9" fill="#3b82f6">Z=35</text>
                                <line x1="115" y1="150" x2="115" y2="80" stroke="#3b82f6" stroke-width="1"/>
                                <polygon points="115,85 112,95 118,95" fill="#3b82f6"/>
                                
                                <!-- Leyenda de pasos -->
                                <rect x="20" y="290" width="240" height="55" fill="#f8fafc" rx="5"/>
                                <circle cx="35" cy="305" r="6" fill="#ef4444"/><text x="45" y="309" font-size="9">1. Dibuja LT</text>
                                <circle cx="35" cy="320" r="6" fill="#f97316"/><text x="45" y="324" font-size="9">2. Marca X</text>
                                <circle cx="35" cy="335" r="6" fill="#eab308"/><text x="45" y="339" font-size="9">3. Linea vertical</text>
                                <circle cx="145" cy="305" r="6" fill="#22c55e"/><text x="155" y="309" font-size="9">4. A' (alejam.)</text>
                                <circle cx="145" cy="320" r="6" fill="#3b82f6"/><text x="155" y="324" font-size="9">5. A'' (cota)</text>
                            </svg>
                        </div>
                    </div>
                </section>

                <!-- LOS CUATRO CUADRANTES -->
                <section>
                    <h3 class="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                        Los Cuatro Cuadrantes
                    </h3>
                    <p class="mb-6 text-lg">
                        Los planos PV y PH dividen el espacio en <strong class="text-white">cuatro cuadrantes</strong>. 
                        La posicion del punto determina en que cuadrante se encuentra segun los signos de su alejamiento (Y) y cota (Z):
                    </p>
                    
                    <div class="overflow-x-auto mb-6">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-800">
                                <tr>
                                    <th class="p-3 text-left">Cuadrante</th>
                                    <th class="p-3 text-center">Alejamiento (Y)</th>
                                    <th class="p-3 text-center">Cota (Z)</th>
                                    <th class="p-3 text-left">Posicion de proyecciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-gray-700">
                                    <td class="p-3 font-bold text-purple-400">I Cuadrante</td>
                                    <td class="p-3 text-center text-green-400">+ (positivo)</td>
                                    <td class="p-3 text-center text-green-400">+ (positivo)</td>
                                    <td class="p-3">A'' arriba de LT, A' abajo de LT</td>
                                </tr>
                                <tr class="border-b border-gray-700 bg-gray-800/30">
                                    <td class="p-3 font-bold text-pink-400">II Cuadrante</td>
                                    <td class="p-3 text-center text-red-400">- (negativo)</td>
                                    <td class="p-3 text-center text-green-400">+ (positivo)</td>
                                    <td class="p-3">Ambas arriba de LT (se cruzan)</td>
                                </tr>
                                <tr class="border-b border-gray-700">
                                    <td class="p-3 font-bold text-cyan-400">III Cuadrante</td>
                                    <td class="p-3 text-center text-red-400">- (negativo)</td>
                                    <td class="p-3 text-center text-red-400">- (negativo)</td>
                                    <td class="p-3">A'' abajo de LT, A' arriba de LT</td>
                                </tr>
                                <tr class="bg-gray-800/30">
                                    <td class="p-3 font-bold text-amber-400">IV Cuadrante</td>
                                    <td class="p-3 text-center text-green-400">+ (positivo)</td>
                                    <td class="p-3 text-center text-red-400">- (negativo)</td>
                                    <td class="p-3">Ambas abajo de LT (se cruzan)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Diagramas de los 4 cuadrantes -->
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <!-- I Cuadrante -->
                        <div class="bg-gray-800 p-4 rounded-xl border border-purple-500/50">
                            <h4 class="text-center font-bold text-purple-400 mb-3">I Cuadrante</h4>
                            <div class="bg-white rounded-lg p-2 cursor-zoom-in">
                                <svg width="100%" height="120" viewBox="0 0 100 120">
                                    <line x1="10" y1="60" x2="90" y2="60" stroke="#000" stroke-width="2"/>
                                    <line x1="15" y1="65" x2="25" y2="65" stroke="#000" stroke-width="2"/>
                                    <line x1="75" y1="65" x2="85" y2="65" stroke="#000" stroke-width="2"/>
                                    <line x1="50" y1="20" x2="50" y2="100" stroke="#9ca3af" stroke-dasharray="3,2"/>
                                    <circle cx="50" cy="30" r="5" fill="#3b82f6"/>
                                    <text x="58" y="34" font-size="10" fill="#3b82f6" font-weight="bold">A''</text>
                                    <circle cx="50" cy="90" r="5" fill="#22c55e"/>
                                    <text x="58" y="94" font-size="10" fill="#22c55e" font-weight="bold">A'</text>
                                </svg>
                            </div>
                            <p class="text-xs text-center text-gray-400 mt-2">Y+ Z+ - Normal</p>
                        </div>
                        
                        <!-- II Cuadrante -->
                        <div class="bg-gray-800 p-4 rounded-xl border border-pink-500/50">
                            <h4 class="text-center font-bold text-pink-400 mb-3">II Cuadrante</h4>
                            <div class="bg-white rounded-lg p-2 cursor-zoom-in">
                                <svg width="100%" height="120" viewBox="0 0 100 120">
                                    <line x1="10" y1="60" x2="90" y2="60" stroke="#000" stroke-width="2"/>
                                    <line x1="15" y1="65" x2="25" y2="65" stroke="#000" stroke-width="2"/>
                                    <line x1="75" y1="65" x2="85" y2="65" stroke="#000" stroke-width="2"/>
                                    <line x1="50" y1="20" x2="50" y2="55" stroke="#9ca3af" stroke-dasharray="3,2"/>
                                    <circle cx="50" cy="25" r="5" fill="#22c55e"/>
                                    <text x="58" y="29" font-size="10" fill="#22c55e" font-weight="bold">A'</text>
                                    <circle cx="50" cy="45" r="5" fill="#3b82f6"/>
                                    <text x="58" y="49" font-size="10" fill="#3b82f6" font-weight="bold">A''</text>
                                </svg>
                            </div>
                            <p class="text-xs text-center text-gray-400 mt-2">Y- Z+ - Arriba</p>
                        </div>
                        
                        <!-- III Cuadrante -->
                        <div class="bg-gray-800 p-4 rounded-xl border border-cyan-500/50">
                            <h4 class="text-center font-bold text-cyan-400 mb-3">III Cuadrante</h4>
                            <div class="bg-white rounded-lg p-2 cursor-zoom-in">
                                <svg width="100%" height="120" viewBox="0 0 100 120">
                                    <line x1="10" y1="60" x2="90" y2="60" stroke="#000" stroke-width="2"/>
                                    <line x1="15" y1="65" x2="25" y2="65" stroke="#000" stroke-width="2"/>
                                    <line x1="75" y1="65" x2="85" y2="65" stroke="#000" stroke-width="2"/>
                                    <line x1="50" y1="20" x2="50" y2="100" stroke="#9ca3af" stroke-dasharray="3,2"/>
                                    <circle cx="50" cy="30" r="5" fill="#22c55e"/>
                                    <text x="58" y="34" font-size="10" fill="#22c55e" font-weight="bold">A'</text>
                                    <circle cx="50" cy="90" r="5" fill="#3b82f6"/>
                                    <text x="58" y="94" font-size="10" fill="#3b82f6" font-weight="bold">A''</text>
                                </svg>
                            </div>
                            <p class="text-xs text-center text-gray-400 mt-2">Y- Z- - Invertido</p>
                        </div>
                        
                        <!-- IV Cuadrante -->
                        <div class="bg-gray-800 p-4 rounded-xl border border-amber-500/50">
                            <h4 class="text-center font-bold text-amber-400 mb-3">IV Cuadrante</h4>
                            <div class="bg-white rounded-lg p-2 cursor-zoom-in">
                                <svg width="100%" height="120" viewBox="0 0 100 120">
                                    <line x1="10" y1="60" x2="90" y2="60" stroke="#000" stroke-width="2"/>
                                    <line x1="15" y1="65" x2="25" y2="65" stroke="#000" stroke-width="2"/>
                                    <line x1="75" y1="65" x2="85" y2="65" stroke="#000" stroke-width="2"/>
                                    <line x1="50" y1="65" x2="50" y2="100" stroke="#9ca3af" stroke-dasharray="3,2"/>
                                    <circle cx="50" cy="75" r="5" fill="#3b82f6"/>
                                    <text x="58" y="79" font-size="10" fill="#3b82f6" font-weight="bold">A''</text>
                                    <circle cx="50" cy="95" r="5" fill="#22c55e"/>
                                    <text x="58" y="99" font-size="10" fill="#22c55e" font-weight="bold">A'</text>
                                </svg>
                            </div>
                            <p class="text-xs text-center text-gray-400 mt-2">Y+ Z- - Abajo</p>
                        </div>
                    </div>
                </section>

                <!-- RESUMEN FINAL -->
                <section class="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-2xl border border-purple-500/30">
                    <h3 class="text-2xl font-bold text-white mb-4">Resumen - Lo que debes recordar</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="font-bold text-purple-400 mb-2">Conceptos clave:</h4>
                            <ul class="list-disc pl-5 space-y-1 text-sm">
                                <li>PV = Plano Vertical (alzado)</li>
                                <li>PH = Plano Horizontal (planta)</li>
                                <li>LT = Linea de Tierra (interseccion)</li>
                                <li>P'' = proyeccion vertical (cota Z)</li>
                                <li>P' = proyeccion horizontal (alejamiento Y)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="font-bold text-blue-400 mb-2">Reglas importantes:</h4>
                            <ul class="list-disc pl-5 space-y-1 text-sm">
                                <li>P' y P'' siempre en la misma vertical</li>
                                <li>Cota positiva = A'' arriba de LT</li>
                                <li>Alejamiento positivo = A' abajo de LT</li>
                                <li>En I cuadrante: A'' arriba, A' abajo</li>
                            </ul>
                        </div>
                    </div>
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
                            <!-- LT Marks -->
                            <line x1="20" y1="80" x2="35" y2="80" stroke="black" stroke-width="2" />
                            <line x1="165" y1="80" x2="180" y2="80" stroke="black" stroke-width="2" />
                            
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

                <h3 class="text-2xl font-bold text-white mt-8 mb-4">2. Trazas de la Recta - Paso a Paso</h3>
                <p class="mb-4">Las trazas son los puntos donde la recta "perfora" los planos de proyeccion. Son fundamentales para entender la visibilidad.</p>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div class="space-y-4">
                        <div class="bg-orange-900/30 p-5 rounded-xl border border-orange-500/50">
                            <h4 class="font-bold text-orange-400 text-lg mb-3">Traza Vertical (Vr)</h4>
                            <p class="text-gray-300 mb-2">Es el punto donde la recta corta al <strong>PV</strong> (alejamiento Y=0).</p>
                            <ol class="list-decimal pl-5 text-sm space-y-1">
                                <li>Prolonga r' hasta que corte la LT</li>
                                <li>Desde ese punto, sube una perpendicular</li>
                                <li>Donde corte a r'' esta <strong>Vr</strong></li>
                            </ol>
                        </div>
                        
                        <div class="bg-cyan-900/30 p-5 rounded-xl border border-cyan-500/50">
                            <h4 class="font-bold text-cyan-400 text-lg mb-3">Traza Horizontal (Hr)</h4>
                            <p class="text-gray-300 mb-2">Es el punto donde la recta corta al <strong>PH</strong> (cota Z=0).</p>
                            <ol class="list-decimal pl-5 text-sm space-y-1">
                                <li>Prolonga r'' hasta que corte la LT</li>
                                <li>Desde ese punto, baja una perpendicular</li>
                                <li>Donde corte a r' esta <strong>Hr</strong></li>
                            </ol>
                        </div>
                    </div>
                    
                    <div class="bg-white p-4 rounded-2xl shadow-xl">
                        <svg width="100%" height="280" viewBox="0 0 280 280">
                            <!-- LT -->
                            <line x1="20" y1="140" x2="260" y2="140" stroke="#000" stroke-width="3"/>
                            <line x1="30" y1="145" x2="50" y2="145" stroke="#000" stroke-width="2"/>
                            <line x1="230" y1="145" x2="250" y2="145" stroke="#000" stroke-width="2"/>
                            <text x="265" y="145" font-size="12" font-weight="bold">LT</text>
                            
                            <!-- r'' proyeccion vertical -->
                            <line x1="40" y1="100" x2="220" y2="40" stroke="#3b82f6" stroke-width="2"/>
                            <text x="225" y="45" font-size="12" fill="#3b82f6" font-weight="bold">r''</text>
                            
                            <!-- r' proyeccion horizontal -->
                            <line x1="60" y1="180" x2="240" y2="220" stroke="#22c55e" stroke-width="2"/>
                            <text x="245" y="225" font-size="12" fill="#22c55e" font-weight="bold">r'</text>
                            
                            <!-- Procedimiento Vr -->
                            <line x1="60" y1="180" x2="20" y2="140" stroke="#22c55e" stroke-width="1" stroke-dasharray="4"/>
                            <circle cx="20" cy="140" r="3" fill="#f97316"/>
                            <line x1="20" y1="140" x2="20" y2="110" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3"/>
                            <circle cx="20" cy="110" r="5" fill="#f97316"/>
                            <text x="25" y="108" font-size="11" fill="#f97316" font-weight="bold">Vr</text>
                            
                            <!-- Procedimiento Hr -->
                            <line x1="220" y1="40" x2="180" y2="140" stroke="#3b82f6" stroke-width="1" stroke-dasharray="4"/>
                            <circle cx="180" cy="140" r="3" fill="#06b6d4"/>
                            <line x1="180" y1="140" x2="180" y2="200" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3"/>
                            <circle cx="180" cy="200" r="5" fill="#06b6d4"/>
                            <text x="185" y="203" font-size="11" fill="#06b6d4" font-weight="bold">Hr</text>
                            
                            <!-- Leyenda -->
                            <rect x="30" y="240" width="220" height="35" fill="#f8fafc" rx="5"/>
                            <circle cx="50" cy="255" r="5" fill="#f97316"/><text x="60" y="259" font-size="9">Vr: r' corta LT, sube a r''</text>
                            <circle cx="165" cy="255" r="5" fill="#06b6d4"/><text x="175" y="259" font-size="9">Hr: r'' corta LT, baja a r'</text>
                        </svg>
                    </div>
                </div>

                <h3 class="text-2xl font-bold text-white mt-8 mb-4">3. Clasificacion Completa - 7 Tipos de Rectas</h3>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <!-- Oblicua -->
                    <div class="bg-gray-800 border-l-4 border-purple-500 p-4 rounded break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-white">1. Recta Oblicua (Generica)</h4>
                            <span class="text-xs bg-gray-700 px-2 py-1 rounded">Mas comun</span>
                        </div>
                        <p class="text-sm text-gray-400 my-2">Corta a los dos planos. Sus proyecciones son oblicuas a LT.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                 <!-- LT Marks -->
                                <line x1="20" y1="55" x2="35" y2="55" stroke="black" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" stroke="black" stroke-width="2" />
                                
                                <line x1="40" y1="80" x2="160" y2="20" stroke="green" stroke-width="2" /> <text x="165" y="25" font-size="10" fill="green">r'</text>
                                <line x1="40" y1="20" x2="160" y2="80" stroke="blue" stroke-width="2" /> <text x="165" y="85" font-size="10" fill="blue">r''</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Horizontal -->
                    <div class="bg-gray-800 border-l-4 border-yellow-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">2. Recta Horizontal</h4>
                        <p class="text-sm text-gray-400 my-2">Paralela al PH. Cota constante. r'' paralela a LT.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                 <!-- LT Marks -->
                                <line x1="20" y1="55" x2="35" y2="55" stroke="black" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" stroke="black" stroke-width="2" />

                                <line x1="40" y1="20" x2="160" y2="20" stroke="blue" stroke-width="2" /> <text x="165" y="25" font-size="10" fill="blue">r'' // LT</text>
                                <line x1="40" y1="80" x2="160" y2="60" stroke="green" stroke-width="2" /> <text x="165" y="65" font-size="10" fill="green">r'</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Frontal -->
                    <div class="bg-gray-800 border-l-4 border-yellow-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">3. Recta Frontal</h4>
                        <p class="text-sm text-gray-400 my-2">Paralela al PV. Alejamiento constante. r' paralela a LT.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                 <!-- LT Marks -->
                                <line x1="20" y1="55" x2="35" y2="55" stroke="black" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" stroke="black" stroke-width="2" />

                                <line x1="40" y1="20" x2="160" y2="40" stroke="blue" stroke-width="2" /> <text x="165" y="45" font-size="10" fill="blue">r''</text>
                                <line x1="40" y1="80" x2="160" y2="80" stroke="green" stroke-width="2" /> <text x="165" y="85" font-size="10" fill="green">r' // LT</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Paralela a LT -->
                    <div class="bg-gray-800 border-l-4 border-red-500 p-4 rounded break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-white">4. Paralela a LT</h4>
                            <span class="text-xs bg-red-900 text-red-100 px-2 py-1 rounded">Sin trazas</span>
                        </div>
                        <p class="text-sm text-gray-400 my-2">Paralela a ambos planos (H + F). No corta ninguno.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                 <!-- LT Marks -->
                                <line x1="20" y1="55" x2="35" y2="55" stroke="black" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" stroke="black" stroke-width="2" />

                                <line x1="40" y1="20" x2="160" y2="20" stroke="blue" stroke-width="2" /> <text x="165" y="25" font-size="10" fill="blue">r'' // LT</text>
                                <line x1="40" y1="80" x2="160" y2="80" stroke="green" stroke-width="2" /> <text x="165" y="85" font-size="10" fill="green">r' // LT</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Vertical / De Punta -->
                    <div class="bg-gray-800 border-l-4 border-pink-500 p-4 rounded break-inside-avoid">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-white">5. Vertical (De Punta)</h4>
                            <span class="text-xs bg-pink-900 text-pink-100 px-2 py-1 rounded">Especial</span>
                        </div>
                        <p class="text-sm text-gray-400 my-2">Perpendicular al PH. r' es un punto. Solo tiene Hr.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                <line x1="20" y1="55" x2="35" y2="55" stroke="black" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" stroke="black" stroke-width="2" />

                                <line x1="100" y1="15" x2="100" y2="50" stroke="blue" stroke-width="2" />
                                <text x="108" y="30" font-size="10" fill="blue">r''</text>
                                <circle cx="100" cy="70" r="5" fill="green" />
                                <text x="108" y="75" font-size="10" fill="green">r' (punto)</text>
                            </svg>
                        </div>
                    </div>

                    <!-- De Perfil -->
                    <div class="bg-gray-800 border-l-4 border-orange-500 p-4 rounded break-inside-avoid">
                        <h4 class="font-bold text-white">6. De Perfil</h4>
                        <p class="text-sm text-gray-400 my-2">Proyecciones perpendiculares a LT. Requiere 3a vista.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                            <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                 <!-- LT Marks -->
                                <line x1="20" y1="55" x2="35" y2="55" stroke="black" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" stroke="black" stroke-width="2" />

                                <line x1="100" y1="10" x2="100" y2="90" stroke="purple" stroke-width="2" />
                                <text x="105" y="20" font-size="10" fill="blue">r''</text>
                                <text x="105" y="80" font-size="10" fill="green">r'</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Corta a LT -->
                    <div class="bg-gray-800 border-l-4 border-red-500 p-4 rounded break-inside-avoid md:col-span-2 lg:col-span-1">
                        <h4 class="font-bold text-white">7. Corta a la Linea de Tierra</h4>
                        <p class="text-sm text-gray-400 my-2">Sus trazas Vr y Hr coinciden en un punto de la LT.</p>
                        <div class="bg-white rounded h-32 flex items-center justify-center cursor-zoom-in">
                             <svg width="200" height="100" viewBox="0 0 200 100">
                                <line x1="10" y1="50" x2="190" y2="50" stroke="black" stroke-width="2" />
                                 <!-- LT Marks -->
                                <line x1="20" y1="55" x2="35" y2="55" stroke="black" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" stroke="black" stroke-width="2" />

                                <line x1="100" y1="50" x2="160" y2="10" stroke="blue" stroke-width="2" />
                                <line x1="100" y1="50" x2="160" y2="80" stroke="green" stroke-width="2" />
                                <circle cx="100" cy="50" r="4" fill="red" />
                                <text x="85" y="45" font-size="9" fill="red">Vr=Hr</text>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <!-- Tabla Resumen -->
                <div class="mt-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-2xl border border-blue-500/30">
                    <h4 class="font-bold text-white text-lg mb-4">Tabla Resumen de Tipos de Rectas</h4>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-800">
                                <tr>
                                    <th class="p-2 text-left">Tipo</th>
                                    <th class="p-2 text-center">r''</th>
                                    <th class="p-2 text-center">r'</th>
                                    <th class="p-2 text-left">Trazas</th>
                                </tr>
                            </thead>
                            <tbody class="text-xs">
                                <tr class="border-b border-gray-700"><td class="p-2 text-purple-400">Oblicua</td><td class="p-2 text-center">Oblicua</td><td class="p-2 text-center">Oblicua</td><td class="p-2">Vr y Hr</td></tr>
                                <tr class="border-b border-gray-700 bg-gray-800/30"><td class="p-2 text-yellow-400">Horizontal</td><td class="p-2 text-center">// LT</td><td class="p-2 text-center">Oblicua</td><td class="p-2">Solo Vr</td></tr>
                                <tr class="border-b border-gray-700"><td class="p-2 text-yellow-400">Frontal</td><td class="p-2 text-center">Oblicua</td><td class="p-2 text-center">// LT</td><td class="p-2">Solo Hr</td></tr>
                                <tr class="border-b border-gray-700 bg-gray-800/30"><td class="p-2 text-red-400">Paralela LT</td><td class="p-2 text-center">// LT</td><td class="p-2 text-center">// LT</td><td class="p-2">Ninguna</td></tr>
                                <tr class="border-b border-gray-700"><td class="p-2 text-pink-400">Vertical</td><td class="p-2 text-center">Perpendicular</td><td class="p-2 text-center">Punto</td><td class="p-2">Solo Hr</td></tr>
                                <tr class="border-b border-gray-700 bg-gray-800/30"><td class="p-2 text-orange-400">De Perfil</td><td class="p-2 text-center">Perpendicular</td><td class="p-2 text-center">Perpendicular</td><td class="p-2">Vr y Hr en LT</td></tr>
                                <tr><td class="p-2 text-red-400">Corta LT</td><td class="p-2 text-center">Pasa por LT</td><td class="p-2 text-center">Pasa por LT</td><td class="p-2">Vr=Hr en LT</td></tr>
                            </tbody>
                        </table>
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
                    { type: 'point', name: 'A', coords: { x: 20, y: 10, z: 30 }, color: '#3b82f6' },
                    { type: 'point', name: 'B', coords: { x: 60, y: 40, z: 10 }, color: '#3b82f6' }
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
                                 <!-- LT Marks -->
                                <line x1="20" y1="55" x2="35" y2="55" stroke="black" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" stroke="black" stroke-width="2" />

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
                                 <!-- LT Marks -->
                                <line x1="10" y1="45" x2="20" y2="45" stroke="black" stroke-width="2" />
                                <line x1="80" y1="45" x2="90" y2="45" stroke="black" stroke-width="2" />

                                <line x1="50" y1="10" x2="50" y2="40" stroke="orange" stroke-width="2" />
                                <line x1="50" y1="40" x2="20" y2="70" stroke="orange" stroke-width="2" />
                                <text x="10" y="20" font-size="8">Proj. H</text>
                            </svg>
                            <!-- Proj Vert -->
                            <svg width="90" height="80" viewBox="0 0 100 80">
                                <line x1="0" y1="40" x2="100" y2="40" stroke="black" />
                                 <!-- LT Marks -->
                                <line x1="10" y1="45" x2="20" y2="45" stroke="black" stroke-width="2" />
                                <line x1="80" y1="45" x2="90" y2="45" stroke="black" stroke-width="2" />

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
                                 <!-- LT Marks -->
                                <line x1="20" y1="55" x2="35" y2="55" stroke="black" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" stroke="black" stroke-width="2" />

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
                                 <!-- LT Marks -->
                                <line x1="20" y1="55" x2="35" y2="55" stroke="black" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" stroke="black" stroke-width="2" />

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
                                 <!-- LT Marks -->
                                <line x1="20" y1="55" x2="35" y2="55" stroke="black" stroke-width="2" />
                                <line x1="165" y1="55" x2="180" y2="55" stroke="black" stroke-width="2" />

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
