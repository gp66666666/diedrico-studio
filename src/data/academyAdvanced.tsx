import React from 'react';
import type { AcademyTopic } from '../types';
import { StepByStepVisualizer } from '../components/Academy/StepByStepVisualizer';
import { DihSvg, DPoint, DLine, VLine, VArc, VText, proj, LT_Y, CX, SCALE } from '../components/Academy/Dih';

/**
 * Temas que faltaban del currículo de Dibujo Técnico II (RD 243/2022):
 * máxima pendiente, ángulos con los planos, posiciones características de los
 * poliedros, cuerpos de revolución oblicuos y esfera (secciones y recta).
 */

const p = (name: string, x: number, y: number, z: number, color = '#f87171'): Partial<any> => ({
    type: 'point', name, coords: { x, y, z }, color,
});

const l = (name: string, point: [number, number, number], dir: [number, number, number], color = '#60a5fa'): Partial<any> => ({
    type: 'line', name, point: { x: point[0], y: point[1], z: point[2] }, direction: { x: dir[0], y: dir[1], z: dir[2] }, isInfinite: true, color,
});

const pl = (name: string, n: [number, number, number], c: number, color = '#10b981'): Partial<any> => ({
    type: 'plane', name, normal: { x: n[0], y: n[1], z: n[2] }, constant: c, color,
});

const solid = (name: string, subtype: string, x: number, y: number, r: number, h: number, color?: string, rotation = { x: 0, y: 0, z: 0 }): Partial<any> => ({
    type: 'solid', name, subtype,
    position: { x, y, z: h / 2 },
    size: { x: r, y: h, z: r },
    rotation, color, opacity: 0.85,
});

const caja = (titulo: string, texto: string) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border-l-4 border-blue-500">
        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2">{titulo}</h3>
        <p className="text-blue-800 dark:text-blue-100">{texto}</p>
    </div>
);

const tip = (texto: string) => (
    <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border border-amber-200 dark:border-amber-800">
        <p className="text-slate-700 dark:text-slate-200">{texto}</p>
    </div>
);

const traza = (y: number, color = '#10b981') => (
    <VLine a={[CX + y * SCALE, LT_Y - 70]} b={[CX + y * SCALE, LT_Y + 70]} color={color} width={2} />
);

export const ACADEMY_ADVANCED_TOPICS: AcademyTopic[] = [
    /* ------------------------- 15. MÁXIMA PENDIENTE ------------------------- */
    {
        id: 'theory-15-max-slope',
        title: '15. Máxima pendiente e inclinación',
        description: 'Las rectas que definen la pendiente de un plano y cómo medir su ángulo con el PH.',
        category: 'Teoría',
        theory: 'Rectas de máxima pendiente e inclinación.',
        theoryContent: (
            <div className="space-y-10 text-slate-700 dark:text-slate-300">
                {caja('Qué son', 'La recta de máxima pendiente de un plano es la que forma el mayor ángulo posible con el plano horizontal. Es perpendicular a la traza horizontal del plano y está contenida en él. La de máxima inclinación es la perpendicular a la traza vertical.')}

                <StepByStepVisualizer
                    title="Recta de máxima pendiente"
                    steps={[
                        {
                            title: 'Plano y su traza horizontal',
                            description: 'El plano α corta al PH según su traza α₁. Todas las rectas de máxima pendiente son perpendiculares a esa traza.',
                            diagram: (
                                <DihSvg>
                                    <VLine a={[70, 230]} b={[300, 90]} color="#10b981" width={2} />
                                    <VText x={250} y={100} color="#10b981" bold>α₁</VText>
                                </DihSvg>
                            ),
                        },
                        {
                            title: 'Perpendicular por un punto',
                            description: 'Se toma un punto P del plano y se traza, en la planta, la perpendicular a α₁. Esa es la dirección de la recta de máxima pendiente.',
                            diagram: (
                                <DihSvg>
                                    <VLine a={[70, 230]} b={[300, 90]} color="#10b981" width={2} />
                                    <DPoint p={[2, 3, 4]} label="P" />
                                    <VLine a={proj([2, 3, 4]).h} b={[proj([2, 3, 4]).h[0] + 26, proj([2, 3, 4]).h[1] + 62]} color="#f59e0b" width={2} />
                                    <VText x={proj([2, 3, 4]).h[0] + 30} y={proj([2, 3, 4]).h[1] + 60} color="#f59e0b" size={9}>máx. pendiente</VText>
                                </DihSvg>
                            ),
                        },
                        {
                            title: 'El ángulo del plano, en VM',
                            description: 'El ángulo que forma esa recta con el PH es el ángulo del plano. Se mide abatiendo el plano proyectante que contiene a la recta y a su proyección.',
                            diagram: (
                                <DihSvg>
                                    <VLine a={[70, 230]} b={[300, 90]} color="#10b981" width={2} faded />
                                    <DPoint p={[2, 3, 4]} label="P" />
                                    <VLine a={proj([2, 3, 4]).h} b={proj([2, 3, 4]).v} color="#f59e0b" width={2} />
                                    <VArc center={proj([2, 3, 4]).h} radius={36} from={-Math.PI / 2} to={-Math.PI / 4} color="#f59e0b" />
                                    <VText x={proj([2, 3, 4]).h[0] + 38} y={proj([2, 3, 4]).h[1] - 6} color="#f59e0b" bold>α</VText>
                                </DihSvg>
                            ),
                        },
                    ]}
                />
                {tip('En los exámenes sirve para todo: es la recta que se abate para medir la pendiente del plano y la que se usa para trazar planos con una inclinación dada.')}
            </div>
        ),
        exercises: [
            {
                id: 'ex-max-slope',
                title: 'Recta de máxima pendiente',
                level: 'Difícil',
                statement: 'Dibuja la recta de máxima pendiente del plano α: x + y + z = 6 que pasa por el punto P(2, 2, 2).',
                setup: [p('P', 2, 2, 2, '#a78bfa'), pl('α', [1, 1, 1], -6)],
                solutionHint: 'En la planta, traza por P′ la perpendicular a la traza horizontal α₁. Esa es la dirección.',
            },
        ],
    },

    /* --------------------- 16. ÁNGULOS CON LOS PLANOS ------------------------ */
    {
        id: 'theory-16-angles-planes',
        title: '16. Ángulos con los planos de proyección',
        description: 'Ángulo de una recta con el PH y con el PV, medido en verdadera magnitud.',
        category: 'Teoría',
        theory: 'Ángulos de rectas y planos con los planos de proyección.',
        theoryContent: (
            <div className="space-y-10 text-slate-700 dark:text-slate-300">
                {caja('La idea', 'El ángulo de una recta con el PH es el que forma con su propia proyección horizontal. Se ve en VM abatiendo el plano proyectante que contiene a la recta y a su proyección.')}

                <StepByStepVisualizer
                    title="Ángulo de una recta con el horizontal"
                    steps={[
                        {
                            title: 'Recta y su proyección',
                            description: 'La recta r y su proyección horizontal r′ están en un plano perpendicular al PH (proyectante horizontal): contiene a las verticales que unen cada punto con su proyección. El ángulo que buscamos está en ese plano.',
                            diagram: (
                                <DihSvg>
                                    <DLine a={[-4, 2, 6]} b={[6, 2, 1]} color="#ef4444" />
                                    <VLine a={proj([-4, 2, 6]).h} b={proj([6, 2, 1]).h} color="#3b82f6" width={2} />
                                    <VText x={300} y={LT_Y + 16} color="#3b82f6" size={9}>r′</VText>
                                </DihSvg>
                            ),
                        },
                        {
                            title: 'Abatir el plano proyectante',
                            description: 'Se abate ese plano sobre el horizontal: la recta aparece en VM y el ángulo con r′ ya se mide directamente.',
                            diagram: (
                                <DihSvg>
                                    <VLine a={proj([-4, 2, 6]).h} b={proj([6, 2, 1]).h} color="#3b82f6" width={2} />
                                    <VLine a={proj([-4, 2, 6]).h} b={[proj([-4, 2, 6]).h[0], proj([-4, 2, 6]).h[1] - 6 * SCALE]} color="#ef4444" width={2} />
                                    <VArc center={proj([-4, 2, 6]).h} radius={30} from={0} to={1.1} color="#f59e0b" />
                                    <VText x={proj([-4, 2, 6]).h[0] + 34} y={proj([-4, 2, 6]).h[1] + 16} color="#f59e0b" bold>α</VText>
                                </DihSvg>
                            ),
                        },
                    ]}
                />
                {tip('Con el plano vertical es igual: se compara la recta con su proyección vertical. El ángulo con un plano cualquiera se mide con la perpendicular, usando el complementario.')}
            </div>
        ),
        exercises: [
            {
                id: 'ex-angle-horizontal',
                title: 'Ángulo con el plano horizontal',
                level: 'Difícil',
                statement: 'Halla el ángulo que forma la recta r (por A(0, 3, 6) y B(8, 3, 0)) con el plano horizontal.',
                setup: [p('A', 0, 3, 6), p('B', 8, 3, 0), l('r', [0, 3, 6], [8, 0, -6])],
                solutionHint: 'Abate el plano proyectante que contiene a r y a r′: el ángulo con r′ es el pedido (36,87° en este caso: es un triángulo 6-8-10).',
            },
        ],
    },

    /* ------------------- 17. POSICIONES CARACTERÍSTICAS --------------------- */
    {
        id: 'theory-17-positions',
        title: '17. Posiciones características',
        description: 'Poliedros apoyados en una cara, en una arista o en un vértice.',
        category: 'Teoría',
        theory: 'Posiciones características de los poliedros regulares.',
        theoryContent: (
            <div className="space-y-10 text-slate-700 dark:text-slate-300">
                {caja('Por qué importa', 'El mismo poliedro cambia por completo según cómo se apoye. En PAU es habitual pedir el tetraedro o el cubo en una posición concreta: hay que saber deducir la planta antes de dibujar el alzado.')}

                <StepByStepVisualizer
                    title="Cubo en tres posiciones"
                    steps={[
                        {
                            title: 'Apoyado en una cara',
                            description: 'La posición más sencilla: la base es un cuadrado en VM en la planta y las aristas verticales suben a la altura del cubo.',
                            diagram: (
                                <DihSvg>
                                    <DLine a={[-3, -3, 0]} b={[3, -3, 0]} color="#3b82f6" />
                                    <DLine a={[3, -3, 0]} b={[3, 3, 0]} color="#3b82f6" />
                                    <DLine a={[3, 3, 0]} b={[-3, 3, 0]} color="#3b82f6" />
                                    <DLine a={[-3, 3, 0]} b={[-3, -3, 0]} color="#3b82f6" />
                                    <DLine a={[-3, -3, 0]} b={[-3, -3, 4]} color="#3b82f6" />
                                    <DLine a={[3, -3, 0]} b={[3, -3, 4]} color="#3b82f6" />
                                    <DLine a={[3, 3, 0]} b={[3, 3, 4]} color="#3b82f6" />
                                    <DLine a={[-3, 3, 0]} b={[-3, 3, 4]} color="#3b82f6" />
                                    <VText x={CX + 4} y={LT_Y + 40} color="#3b82f6" size={9}>base en VM</VText>
                                </DihSvg>
                            ),
                        },
                        {
                            title: 'Apoyado en una arista',
                            description: 'El cubo gira 45° sobre la arista de apoyo. La sección perpendicular a esa arista es un cuadrado girado 45° y su diagonal vertical mide a√2: esa es la altura. En la planta, la arista se ve en verdadera magnitud y el cubo se proyecta como un rectángulo de a × a√2 (girado si la arista no es paralela a la LT).',
                            diagram: (
                                <DihSvg>
                                    <polygon points={`${CX - 5.9},${LT_Y + 74.2} ${CX + 34.2},${LT_Y + 34.1} ${CX + 5.9},${LT_Y + 5.8} ${CX - 34.2},${LT_Y + 45.9}`} fill="none" stroke="#3b82f6" strokeWidth="2" />
                                    <VText x={CX + 40} y={LT_Y + 30} color="#3b82f6" size={9}>planta girada 45°</VText>
                                </DihSvg>
                            ),
                        },
                        {
                            title: 'Apoyado en un vértice',
                            description: 'La diagonal del cubo es vertical. En la planta se ve un hexágono regular; en el alzado, otro hexágono con un vértice arriba y otro abajo. La altura total es la diagonal del cubo: a√3. Es la posición más difícil de deducir.',
                            diagram: (
                                <DihSvg>
                                    <polygon
                                        points={`${CX + 42},${LT_Y + 14} ${CX + 21},${LT_Y + 50} ${CX - 21},${LT_Y + 50} ${CX - 42},${LT_Y + 14} ${CX - 21},${LT_Y - 22} ${CX + 21},${LT_Y - 22}`}
                                        fill="none" stroke="#3b82f6" strokeWidth="2"
                                    />
                                    <VText x={CX + 48} y={LT_Y + 20} color="#3b82f6" size={9}>planta hexagonal</VText>
                                </DihSvg>
                            ),
                        },
                    ]}
                />
                {tip('Regla práctica: la altura del poliedro en cada posición es una longitud conocida: la arista a (apoyado en una cara), la diagonal de una cara a√2 (apoyado en una arista) o la diagonal del cubo a√3 (apoyado en un vértice). Calcula esa altura antes de empezar.')}
            </div>
        ),
        exercises: [
            {
                id: 'ex-cube-edge',
                title: 'Cubo apoyado en una arista',
                level: 'Difícil',
                statement: 'Coloca un cubo de arista 4 apoyado en una arista sobre el PH, con la diagonal de la cara vertical.',
                setup: [solid('Cubo', 'cube', 0, 4, 4, 4), p('A', 0, 4, 0)],
                solutionHint: 'La altura total es la diagonal de la cara: 4√2 ≈ 5,66. La planta es un cuadrado girado 45°.',
            },
        ],
    },

    /* ---------------------- 18. CILINDROS Y CONOS OBLICUOS ------------------ */
    {
        id: 'theory-18-oblique',
        title: '18. Cuerpos de revolución oblicuos',
        description: 'Cilindro y cono oblicuos: contorno aparente y proyecciones.',
        category: 'Teoría',
        theory: 'Cilindros y conos oblicuos.',
        theoryContent: (
            <div className="space-y-10 text-slate-700 dark:text-slate-300">
                {caja('Qué cambia', 'En un cilindro recto las generatrices son perpendiculares a la base; en uno oblicuo, no. Las bases siguen siendo circunferencias, pero el contorno aparente ya no es un rectángulo.')}

                <StepByStepVisualizer
                    title="Cilindro oblicuo"
                    steps={[
                        {
                            title: 'Bases paralelas, generatrices inclinadas',
                            description: 'Las dos bases son circunferencias en planos horizontales. Las generatrices unen puntos correspondientes y ya no son verticales.',
                            diagram: (
                                <DihSvg>
                                    <ellipse cx={CX - 30} cy={LT_Y + 3 * SCALE} rx={2.5 * SCALE} ry={0.7 * SCALE} fill="none" stroke="#3b82f6" strokeWidth="2" />
                                    <ellipse cx={CX + 30} cy={LT_Y - 4 * SCALE} rx={2.5 * SCALE} ry={0.7 * SCALE} fill="none" stroke="#3b82f6" strokeWidth="2" />
                                    <line x1={CX - 30 - 2.5 * SCALE} y1={LT_Y + 3 * SCALE} x2={CX + 30 - 2.5 * SCALE} y2={LT_Y - 4 * SCALE} stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" />
                                    <line x1={CX - 30 + 2.5 * SCALE} y1={LT_Y + 3 * SCALE} x2={CX + 30 + 2.5 * SCALE} y2={LT_Y - 4 * SCALE} stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" />
                                </DihSvg>
                            ),
                        },
                        {
                            title: 'Contorno aparente',
                            description: 'Se dibuja tangente a las dos elipses, no por los extremos de los ejes. En el alzado, el contorno son dos rectas oblicuas que envuelven ambas bases.',
                            diagram: (
                                <DihSvg>
                                    <ellipse cx={CX - 30} cy={LT_Y + 3 * SCALE} rx={2.5 * SCALE} ry={0.7 * SCALE} fill="none" stroke="#3b82f6" strokeWidth="2" />
                                    <ellipse cx={CX + 30} cy={LT_Y - 4 * SCALE} rx={2.5 * SCALE} ry={0.7 * SCALE} fill="none" stroke="#3b82f6" strokeWidth="2" />
                                    <line x1={CX - 30 - 2.5 * SCALE} y1={LT_Y + 3 * SCALE} x2={CX + 30 - 2.5 * SCALE} y2={LT_Y - 4 * SCALE} stroke="#f59e0b" strokeWidth="2" />
                                    <line x1={CX - 30 + 2.5 * SCALE} y1={LT_Y + 3 * SCALE} x2={CX + 30 + 2.5 * SCALE} y2={LT_Y - 4 * SCALE} stroke="#f59e0b" strokeWidth="2" />
                                </DihSvg>
                            ),
                        },
                    ]}
                />
                {tip('El cono oblicuo se resuelve igual: su vértice no cae en el centro de la base, y el contorno se traza tangente a la base desde ese vértice.')}
            </div>
        ),
        exercises: [
            {
                id: 'ex-oblique-cylinder',
                title: 'Cilindro oblicuo',
                level: 'Difícil',
                statement: 'Dibuja un cilindro oblicuo de radio 3 y altura 8, con las bases horizontales y el eje inclinado.',
                setup: [solid('Cilindro', 'cylinder', 0, 4, 3, 8, '#3b82f6', { x: 0.5, y: 0, z: 0 }), p('O', 0, 4, 0)],
                solutionHint: 'Las bases son elipses en planta; el contorno del alzado son rectas tangentes a ambas, no verticales.',
            },
        ],
    },

    /* ------------------------------- 19. ESFERA ----------------------------- */
    {
        id: 'theory-19-sphere',
        title: '19. La esfera',
        description: 'Representación, secciones planas e intersección con una recta.',
        category: 'Teoría',
        theory: 'La esfera en diédrico.',
        theoryContent: (
            <div className="space-y-10 text-slate-700 dark:text-slate-300">
                {caja('La esfera', 'Se proyecta como una circunferencia del radio de la esfera en las dos vistas, con el centro en la misma vertical. Cualquier sección plana es una circunferencia.')}

                <StepByStepVisualizer
                    title="Sección e intersección con una recta"
                    steps={[
                        {
                            title: 'Sección por un plano horizontal',
                            description: 'Un plano horizontal corta a la esfera en una circunferencia. En la planta se ve como círculo (su radio real) y en el alzado como un segmento.',
                            diagram: (
                                <DihSvg>
                                    <circle cx={CX} cy={LT_Y + 3 * SCALE} r={3 * SCALE} fill="none" stroke="#10b981" strokeWidth="2" />
                                    <circle cx={CX} cy={LT_Y - 3 * SCALE} r={3 * SCALE} fill="none" stroke="#10b981" strokeWidth="2" />
                                    <VLine a={[CX - 2.2 * SCALE, LT_Y + 3 * SCALE]} b={[CX + 2.2 * SCALE, LT_Y + 3 * SCALE]} color="#3b82f6" width={3} />
                                    <VText x={CX + 3 * SCALE + 6} y={LT_Y + 3 * SCALE} color="#3b82f6" size={9}>sección</VText>
                                </DihSvg>
                            ),
                        },
                        {
                            title: 'Intersección con una recta',
                            description: 'Se contiene la recta en un plano proyectante; ese plano corta a la esfera en una circunferencia. Donde la recta corte a esa circunferencia están los dos puntos de entrada y salida.',
                            diagram: (
                                <DihSvg>
                                    <circle cx={CX} cy={LT_Y + 3 * SCALE} r={3 * SCALE} fill="none" stroke="#10b981" strokeWidth="2" />
                                    <DLine a={[-6, 4, 2]} b={[6, 4, 7]} color="#ef4444" />
                                    <DPoint p={[-2, 4, 4]} label="1" color="#f59e0b" showProjections={false} />
                                    <DPoint p={[3, 4, 6]} label="2" color="#f59e0b" showProjections={false} />
                                </DihSvg>
                            ),
                        },
                    ]}
                />
                {tip('Si la distancia del centro a la recta es mayor que el radio, no hay corte; si es igual, la recta es tangente (un solo punto).')}
            </div>
        ),
        exercises: [
            {
                id: 'ex-sphere-section',
                title: 'Sección de la esfera',
                level: 'Difícil',
                statement: 'La esfera tiene centro O(0, 4, 4) y radio 3. Dibuja la sección que produce un plano horizontal a cota 4.',
                setup: [p('O', 0, 4, 4), solid('Esfera', 'sphere', 0, 4, 3, 3)],
                solutionHint: 'El plano pasa por el centro: la sección es un círculo máximo, de radio 3, en VM en la planta.',
            },
        ],
    },

    /* ------------------------------ 20. MAPA DEL TEMARIO -------------------- */
    {
        id: 'theory-20-map',
        title: '20. Mapa del temario',
        description: 'Qué entra en la EBAU, qué cubre la Academia y en qué orden estudiarlo.',
        category: 'Guía',
        theory: 'Mapa del temario de diédrico.',
        theoryContent: (
            <div className="space-y-8 text-slate-700 dark:text-slate-300">
                {caja('Para qué sirve', 'Antes de estudiar conviene saber qué hay. Este mapa resume el bloque de diédrico de Dibujo Técnico II (RD 243/2022) y en qué tema de la Academia está cada cosa.')}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Bases</h3>
                        <ul className="text-sm space-y-1">
                            <li>1. El punto</li>
                            <li>2. La recta (trazas, tipos)</li>
                            <li>3. El plano (trazas, clasificación)</li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Operaciones</h3>
                        <ul className="text-sm space-y-1">
                            <li>4. Intersecciones</li>
                            <li>5. Paralelismo y perpendicularidad</li>
                            <li>6. Distancias</li>
                            <li>7. Ángulos</li>
                            <li>15. Máxima pendiente e inclinación</li>
                            <li>16. Ángulos con los planos de proyección</li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Métodos</h3>
                        <ul className="text-sm space-y-1">
                            <li>8. Abatimientos</li>
                            <li>9. Giros</li>
                            <li>10. Cambios de plano</li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Sólidos</h3>
                        <ul className="text-sm space-y-1">
                            <li>11. Poliedros (secciones, intersección con recta)</li>
                            <li>12. Superficies (cilindro, cono, esfera)</li>
                            <li>13. Secciones y su VM</li>
                            <li>14. Desarrollos</li>
                            <li>17. Posiciones características</li>
                            <li>18. Cilindros y conos oblicuos</li>
                            <li>19. La esfera</li>
                        </ul>
                    </div>
                </div>

                {tip('Orden recomendado: 1-3 (bases) → 4-7 (operaciones) → 8-10 (métodos) → 11-19 (sólidos). Las operaciones se usan dentro de los métodos, y los métodos dentro de los sólidos: si algo falla, casi siempre es una base.')}

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-5">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Fuera de esta Academia</h3>
                    <p className="text-sm">
                        El bloque de diédrico está completo. La asignatura incluye además sistema axonométrico,
                        planos acotados, perspectiva cónica y normalización (cortes, secciones, acotación):
                        no están en la app todavía.
                    </p>
                </div>
            </div>
        ),
        exercises: [],
    },
];
