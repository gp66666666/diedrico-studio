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
    theoryContent: string; // Markdown-like or HTML
    exercises: AcademyExercise[];
}

export const ACADEMY_CONTENT: AcademyTopic[] = [
    {
        id: 'topic-1',
        title: '1. El Punto y la Recta',
        description: 'Fundamentos del Sistema Diédrico. Coordenadas y tipos de rectas.',
        theoryContent: `
            <h3>El Punto</h3>
            <p>Un punto en el espacio se define por sus tres coordenadas (x, y, z):</p>
            <ul>
                <li><b>Cota (z):</b> Altura respecto al plano horizontal.</li>
                <li><b>Alejamiento (y):</b> Distancia al plano vertical.</li>
                <li><b>Lateralidad (x):</b> Posición en el eje de tierra.</li>
            </ul>
            
            <h3>La Recta</h3>
            <p>Una recta queda definida por dos puntos. Existen tipos particulares:</p>
            <ul>
                <li><b>Recta Horizontal:</b> Paralela al plano Horizontal (Cota constante).</li>
                <li><b>Recta Frontal:</b> Paralela al plano Vertical (Alejamiento constante).</li>
                <li><b>Recta de Perfil:</b> Perpendicular a la Línea de Tierra.</li>
            </ul>
        `,
        exercises: [
            {
                id: 'ex-1-1',
                title: 'Definir una Recta Horizontal',
                level: 'Fácil',
                statement: 'Dados dos puntos A(0, 10, 20) y B(50, 30, 20), observa que tienen la misma cota. Únelos para formar una recta.',
                setup: [
                    { type: 'point', name: 'A', coords: { x: 0, y: 10, z: 20 }, visible: true, color: '#3b82f6' },
                    { type: 'point', name: 'B', coords: { x: 50, y: 30, z: 20 }, visible: true, color: '#3b82f6' }
                ],
                solutionHint: 'Usa la herramienta "Recta / Plano" -> "Dos Puntos" y selecciona A y B.'
            },
            {
                id: 'ex-1-2',
                title: 'Recta de Perfil',
                level: 'Medio',
                statement: 'Tienes dos puntos en la misma perpendicular a LT. A(20, 10, 10) y B(20, 40, 50). Crea la recta y observa su traza.',
                setup: [
                    { type: 'point', name: 'A', coords: { x: 20, y: 10, z: 10 }, visible: true, color: '#ef4444' },
                    { type: 'point', name: 'B', coords: { x: 20, y: 40, z: 50 }, visible: true, color: '#ef4444' }
                ]
            }
        ]
    },
    {
        id: 'topic-2',
        title: '2. Intersecciones',
        description: 'Cortes entre rectas y planos.',
        theoryContent: `
            <h3>Intersección Recta-Plano</h3>
            <p>Para hallar el punto donde una recta r corta a un plano Alpha:</p>
            <ol>
                <li>Contener la recta r en un plano auxiliar Beta (proyectante).</li>
                <li>Hallar la intersección i (recta) entre Alpha y Beta.</li>
                <li>El punto donde i corta a r es la solución.</li>
            </ol>
            <p>¡O usa la herramienta automática de Diédrico Studio!</p>
        `,
        exercises: [
            {
                id: 'ex-2-1',
                title: 'Intersección Básica',
                level: 'Difícil',
                statement: 'Halla el punto de intersección entre la recta R dada y el plano Alpha.',
                setup: [
                    { type: 'point', name: 'P1', coords: { x: 0, y: 0, z: 0 }, visible: false }, // Hidden helper
                    { type: 'line', name: 'r', point: { x: 10, y: 10, z: 0 }, direction: { x: 1, y: 1, z: 2 }, visible: true, color: '#ffffff', isInfinite: true },
                    { type: 'plane', name: 'Alpha', normal: { x: 0, y: 1, z: 1 }, constant: 50, visible: true, color: '#10b981' }
                ],
                solutionHint: 'Selecciona "Intersección Recta-Plano", luego clica en la recta r y el plano Alpha.'
            }
        ]
    }
];
