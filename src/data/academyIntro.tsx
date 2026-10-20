import React from 'react';
import type { AcademyExercise } from '../types';
import { StepByStepVisualizer } from '../components/Academy/StepByStepVisualizer';
import { DihSvg, DPoint, DLine, VLine, VText, proj, LT_Y } from '../components/Academy/Dih';

/**
 * Pasos interactivos para los temas 1-3, que seguían siendo solo texto.
 * Se añaden DEBAJO del contenido original (no se sustituye).
 */

const p = (name: string, x: number, y: number, z: number, color = '#f87171'): Partial<any> => ({
    type: 'point', name, coords: { x, y, z }, color,
});

const l = (name: string, point: [number, number, number], dir: [number, number, number], color = '#60a5fa'): Partial<any> => ({
    type: 'line', name, point: { x: point[0], y: point[1], z: point[2] }, direction: { x: dir[0], y: dir[1], z: dir[2] }, isInfinite: true, color,
});

export const ACADEMY_INTRO_STEPS: Record<string, React.ReactNode> = {
    'theory-1-point': (
        <div className="mt-10">
            <StepByStepVisualizer
                title="El punto y sus dos proyecciones"
                steps={[
                    {
                        title: 'Un punto en el espacio',
                        description: 'A tiene tres coordenadas: x (a lo largo de la LT), y (alejamiento) y z (cota). Aquí A(0, 4, 6).',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 4, 6]} label="A" />
                                <VText x={250} y={40} color="#64748b" size={9}>A(0, 4, 6)</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Planta y alzado',
                        description: 'A′ (planta) se obtiene llevando el alejamiento hacia abajo desde la LT. A″ (alzado), la cota hacia arriba. La vertical que los une es la misma x.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 4, 6]} label="A" />
                                <VLine a={proj([0, 4, 0]).h} b={proj([0, 4, 0]).h} color="#94a3b8" />
                                <VText x={proj([0, 4, 0]).h[0] - 70} y={proj([0, 4, 0]).h[1] + 4} color="#94a3b8" size={9}>alejamiento ↓</VText>
                                <VText x={proj([0, 4, 0]).h[0] + 10} y={LT_Y - 70} color="#94a3b8" size={9}>↑ cota</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Simétrico respecto del PH',
                        description: 'Cambiar el signo de la cota da el punto simétrico respecto del plano horizontal: A₁(0, 4, −6). Su alzado pasa al otro lado de la LT.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 4, 6]} label="A" />
                                <DPoint p={[0, 4, -6]} label="A₁" color="#a78bfa" />
                            </DihSvg>
                        ),
                    },
                ]}
            />
        </div>
    ),

    'theory-2-line': (
        <div className="mt-10">
            <StepByStepVisualizer
                title="La recta: de dos puntos a sus trazas"
                steps={[
                    {
                        title: 'Recta por dos puntos',
                        description: 'Dos puntos determinan una recta. Se unen sus alzados (r″) y sus plantas (r′).',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 6, 5]} label="A" />
                                <DPoint p={[10, 2, -3]} label="B" color="#a78bfa" />
                                <DLine a={[0, 6, 5]} b={[10, 2, -3]} color="#3b82f6" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Traza horizontal H',
                        description: 'H es el punto donde la recta corta al PH (z = 0). Se ve donde r″ cruza la LT: se baja la perpendicular hasta r′ y ahí está H′ = H″.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[0, 6, 5]} b={[10, 2, -3]} color="#3b82f6" faded />
                                <DPoint p={[6.25, 3.5, 0]} label="H" color="#f59e0b" />
                                <VText x={proj([6.25, 3.5, 0]).v[0] + 8} y={LT_Y - 8} color="#f59e0b" size={9}>z = 0</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Traza vertical V',
                        description: 'V es el corte con el PV (y = 0). Donde r′ cruza la LT se sube la perpendicular hasta r″. Una recta tiene como máximo dos trazas.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[0, 6, 5]} b={[10, 2, -3]} color="#3b82f6" faded />
                                <DPoint p={[6.25, 3.5, 0]} label="H" color="#f59e0b" />
                                <DPoint p={[8.5, 0, -1.7]} label="V" color="#10b981" />
                            </DihSvg>
                        ),
                    },
                ]}
            />
        </div>
    ),

    'theory-3-plane': (
        <div className="mt-10">
            <StepByStepVisualizer
                title="El plano: cómo se determina y cómo se ve"
                steps={[
                    {
                        title: 'Tres puntos no alineados',
                        description: 'Tres puntos que no están en línea determinan un plano. Uniendo A-B y A-C aparecen dos rectas del plano.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 2, 2]} label="A" />
                                <DPoint p={[8, 2, 4]} label="B" color="#a78bfa" />
                                <DPoint p={[2, 8, 6]} label="C" color="#f59e0b" />
                                <DLine a={[0, 2, 2]} b={[8, 2, 4]} color="#3b82f6" />
                                <DLine a={[0, 2, 2]} b={[2, 8, 6]} color="#3b82f6" dashed />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Las trazas del plano',
                        description: 'La traza horizontal α₁ es donde el plano corta al PH; la vertical α₂, donde corta al PV. Se obtienen uniendo las trazas de las rectas del plano.',
                        diagram: (
                            <DihSvg>
                                <VLine a={[50, LT_Y + 60]} b={[320, LT_Y + 10]} color="#10b981" width={2} />
                                <VText x={290} y={LT_Y + 24} color="#10b981" bold>α₁</VText>
                                <VLine a={[120, LT_Y - 70]} b={[300, LT_Y - 10]} color="#10b981" width={2} dashed />
                                <VText x={270} y={LT_Y - 60} color="#10b981" bold>α₂</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Plano proyectante',
                        description: 'Si el plano es perpendicular a uno de proyección, se ve de canto: todo él se proyecta sobre una recta. Es el caso más útil para cortar.',
                        diagram: (
                            <DihSvg>
                                <VLine a={[240, LT_Y - 70]} b={[240, LT_Y + 100]} color="#a78bfa" width={3} />
                                <VText x={246} y={LT_Y - 60} color="#a78bfa" size={9}>se ve de canto</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />
        </div>
    ),
};

/** Un ejercicio más para los temas nuevos (tenían solo uno). */
export const ACADEMY_MORE_EXERCISES: Record<string, AcademyExercise[]> = {
    'theory-15-max-slope': [
        {
            id: 'ex-max-inclination',
            title: 'Recta de máxima inclinación',
            level: 'Difícil',
            statement: 'Dibuja la recta de máxima inclinación del plano α: 2x + z = 8 y explica con qué traza es perpendicular.',
            setup: [p('P', 3, 4, 2, '#a78bfa')],
            solutionHint: 'Es perpendicular a la traza vertical α₂ y sirve para medir el ángulo del plano con el PV.',
        },
    ],
    'theory-16-angles-planes': [
        {
            id: 'ex-angle-vertical',
            title: 'Ángulo con el plano vertical',
            level: 'Medio',
            statement: 'La recta r pasa por A(2, 0, 6) y B(8, 6, 2). Halla su ángulo con el plano vertical.',
            setup: [p('A', 2, 0, 6), p('B', 8, 6, 2), l('r', [2, 0, 6], [6, 6, -4])],
            solutionHint: 'Se compara con su proyección vertical r″; el ángulo se mide abatiendo el plano proyectante que las contiene.',
        },
    ],
    'theory-17-positions': [
        {
            id: 'ex-tetrahedron-face',
            title: 'Tetraedro apoyado en una cara',
            level: 'Difícil',
            statement: 'Dibuja un tetraedro de arista 6 apoyado en el PH por una cara, con una arista de la base paralela a la LT.',
            setup: [p('O', 0, 4, 0), { type: 'solid', name: 'Tetraedro', subtype: 'tetrahedron', position: { x: 0, y: 4, z: 3 }, size: { x: 3.46, y: 6, z: 3.46 }, rotation: { x: 0, y: 0, z: 0 }, color: '#ef4444', opacity: 0.85 } as Partial<any>],
            solutionHint: 'La altura del tetraedro es arista·√(2/3) ≈ 4,9. La base es un triángulo equilátero en VM en la planta.',
        },
    ],
    'theory-18-oblique': [
        {
            id: 'ex-oblique-cone',
            title: 'Cono oblicuo',
            level: 'Difícil',
            statement: 'Dibuja un cono oblicuo de base circular y vértice desplazado del centro de la base.',
            setup: [p('O', 0, 4, 0), p('V', 3, 4, 7, '#f59e0b')],
            solutionHint: 'El contorno del alzado son las tangentes desde V″ a la elipse de la base; no pasa por el centro.',
        },
    ],
    'theory-19-sphere': [
        {
            id: 'ex-sphere-tangent',
            title: 'Recta tangente a la esfera',
            level: 'Difícil',
            statement: 'La esfera tiene centro O(0, 4, 4) y radio 3. Comprueba si la recta horizontal y = 7, z = 4 es tangente, secante o exterior.',
            setup: [p('O', 0, 4, 4), l('r', [-6, 7, 4], [1, 0, 0])],
            solutionHint: 'La distancia del centro a la recta es 3 (|7 − 4|), igual al radio: es tangente, con un solo punto de contacto.',
        },
    ],
};
