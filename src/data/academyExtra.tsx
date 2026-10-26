import React from 'react';
import type { AcademyExercise } from '../types';
import { StepByStepVisualizer } from '../components/Academy/StepByStepVisualizer';
import {
    DihSvg, DPoint, DLine, DSegment, VLine, VArc, VText, TraceLabel, proj, LT_Y, CX, SCALE,
} from '../components/Academy/Dih';

/**
 * Contenido ampliado de la Academia.
 *
 * Temas 6-14 con pasos interactivos (igual que los temas 4 y 5): cada paso
 * dibuja la construcción acumulada sobre la línea de tierra.
 * Los ejercicios van aparte, con los datos ya montados en el lienzo.
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

/** Sólido en el store. `height` es la altura real (size.y); el resto, el radio. */
const solid = (
    name: string,
    subtype: string,
    position: [number, number, number],
    size: number,
    color = '#3b82f6',
    height?: number
): Partial<any> => ({
    type: 'solid', name, subtype,
    position: { x: position[0], y: position[1], z: position[2] },
    size: { x: size, y: height ?? size, z: size },
    rotation: { x: 0, y: 0, z: 0 },
    color, opacity: 0.85,
});

/** Coloca un sólido apoyado en el PH: centro a media altura. */
const solidOnFloor = (
    name: string,
    subtype: string,
    x: number,
    y: number,
    radius: number,
    height: number,
    color?: string
): Partial<any> => solid(name, subtype, [x, y, height / 2], radius, color, height);

/* ------------------------------------------------------------------ */
/* Utilidades de dibujo                                                */
/* ------------------------------------------------------------------ */

/** Línea horizontal de cota constante (traza de un plano horizontal). */
const CotaLine = ({ z, x1 = 40, x2 = 320, color = '#10b981', label }: { z: number; x1?: number; x2?: number; color?: string; label?: string }) => {
    const y = LT_Y - z * SCALE;
    return (
        <g>
            <VLine a={[x1, y]} b={[x2, y]} color={color} width={2} />
            {label && <TraceLabel x={x2 - 4} y={y - 5} text={label} color={color} />}
        </g>
    );
};

/** Línea vertical de alejamiento constante (traza de un plano vertical). */
const AlejamientoLine = ({ y, y1 = 20, y2 = 270, color = '#10b981', label }: { y: number; y1?: number; y2?: number; color?: string; label?: string }) => {
    const x = CX + y * SCALE;
    return (
        <g>
            <VLine a={[x, y1]} b={[x, y2]} color={color} width={2} />
            {label && <TraceLabel x={x + 5} y={y1 + 12} text={label} color={color} />}
        </g>
    );
};

/* ------------------------------------------------------------------ */
/* Teoría interactiva (temas 6-14)                                     */
/* ------------------------------------------------------------------ */

const caja = (titulo: string, texto: string) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border-l-4 border-blue-500">
        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2">{titulo}</h3>
        <p className="text-blue-800 dark:text-blue-100">{texto}</p>
    </div>
);

const cajaLista = (titulo: string, intro: string, items: string[]) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border-l-4 border-blue-500">
        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2">{titulo}</h3>
        {intro ? <p className="text-blue-800 dark:text-blue-100">{intro}</p> : null}
        <ul className="mt-2 list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-100">
            {items.map((i) => <li key={i}>{i}</li>)}
        </ul>
    </div>
);

export const ACADEMY_THEORY: Record<string, React.ReactNode> = {
    /* ------------------------------ 6. DISTANCIAS ------------------------------ */
    'theory-6-distances': (
        <div className="space-y-10 text-slate-700 dark:text-slate-300">
            {caja('La idea', 'La distancia entre dos elementos es la verdadera magnitud del segmento más corto que los une. En diédrico: primero se construye el segmento y después se pone en VM.')}

            <StepByStepVisualizer
                title="Punto a plano"
                steps={[
                    {
                        title: 'Planteamiento',
                        description: 'Tenemos el punto P y el plano horizontal α a cota 2. Buscamos la distancia más corta: la perpendicular desde P hasta el plano.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 4, 7]} label="P" />
                                <CotaLine z={2} label="α₂" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Perpendicular por P',
                        description: 'La perpendicular a un plano horizontal es una recta vertical. En el alzado se ve como una recta; en la planta, como un punto (P′).',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 4, 7]} label="P" />
                                <CotaLine z={2} label="α₂" />
                                <VLine a={proj([0, 4, 7]).v} b={proj([0, 4, 2]).v} color="#3b82f6" width={2} />
                                <VText x={proj([0, 4, 7]).v[0] + 8} y={(proj([0, 4, 7]).v[1] + proj([0, 4, 2]).v[1]) / 2} color="#3b82f6">⊥</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Punto de corte y medida',
                        description: 'Donde la perpendicular corta al plano está I. El segmento PI es la distancia: aquí, 7 − 2 = 5 unidades, en verdadera magnitud.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 4, 7]} label="P" />
                                <DPoint p={[0, 4, 2]} label="I" color="#3b82f6" />
                                <CotaLine z={2} label="α₂" />
                                <VLine a={proj([0, 4, 7]).v} b={proj([0, 4, 2]).v} color="#f59e0b" width={3} />
                                <VText x={proj([0, 4, 7]).v[0] + 10} y={(proj([0, 4, 7]).v[1] + proj([0, 4, 2]).v[1]) / 2} color="#f59e0b" bold>d = 5</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />

            <StepByStepVisualizer
                title="Punto a recta"
                steps={[
                    {
                        title: 'Recta y punto',
                        description: 'La recta r es horizontal (cota constante): se ve en VM en la planta. El punto P está fuera de ella.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-8, 6, 4]} b={[8, 6, 4]} color="#3b82f6" />
                                <DPoint p={[0, 2, 4]} label="P" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Perpendicular en planta',
                        description: 'Como r es horizontal, la distancia se ve directamente en la planta: desde P′ se traza la perpendicular a r′.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-8, 6, 4]} b={[8, 6, 4]} color="#3b82f6" />
                                <DPoint p={[0, 2, 4]} label="P" />
                                <VLine a={proj([0, 2, 4]).h} b={proj([0, 6, 4]).h} color="#f59e0b" width={2} dashed />
                                <DPoint p={[0, 6, 4]} label="I" color="#f59e0b" showProjections={false} />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Verdadera magnitud',
                        description: 'El segmento P′I′ es la distancia en VM: 4 unidades. Si la recta no fuera horizontal, habría que abatir o cambiar de plano.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-8, 6, 4]} b={[8, 6, 4]} color="#3b82f6" />
                                <DPoint p={[0, 2, 4]} label="P" />
                                <VLine a={proj([0, 2, 4]).h} b={proj([0, 6, 4]).h} color="#f59e0b" width={3} />
                                <VText x={proj([0, 2, 4]).h[0] - 30} y={(proj([0, 2, 4]).h[1] + proj([0, 6, 4]).h[1]) / 2} color="#f59e0b" bold>d = 4</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />

            <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-slate-700 dark:text-slate-200"><strong>Truco:</strong> si el plano o la recta son proyectantes, la distancia se ve directamente en la vista donde se ven de canto. Solo hay que construir cuando no lo son.</p>
            </div>
            {cajaLista("Los casos que faltan", "Además del punto a plano y del punto a recta, la EBAU pide:", [
                "Recta a plano (paralelos): se toma un punto cualquiera de la recta y se mide su distancia al plano.",
                "Entre dos planos paralelos: se traza una perpendicular común y se mide el segmento entre los dos planos.",
                "Entre dos rectas que se cruzan: se traza el plano que contiene a una y es paralelo a la otra; la distancia es la de un punto de la segunda a ese plano.",
                "Punto a recta (caso general): por el punto se traza el plano perpendicular a la recta, se halla el pie I y se mide PI en verdadera magnitud.",
            ])}

            {caja("Lo que no se ve directamente", "Si ni el plano ni la recta son proyectantes, la perpendicular no aparece en VM en ninguna vista: hay que medir el segmento con un abatimiento o un cambio de plano. Ese es el paso que más se olvida en los exámenes.")}
        </div>
    ),

    /* -------------------------------- 7. ÁNGULOS ------------------------------- */
    'theory-7-angles': (
        <div className="space-y-10 text-slate-700 dark:text-slate-300">
            {caja('La idea', 'Un ángulo solo se mide en verdadera magnitud. Si las dos rectas son horizontales o frontales, se ve directamente en una vista; si no, hay que abatir el plano que las contiene.')}

            <StepByStepVisualizer
                title="Ángulo entre dos rectas (caso directo)"
                steps={[
                    {
                        title: 'Dos rectas horizontales',
                        description: 'r y s tienen la misma cota (4). Sus proyecciones verticales son paralelas a la LT: eso significa que están en un plano horizontal.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-8, 4, 4]} b={[8, 4, 4]} color="#3b82f6" />
                                <DLine a={[-2, -3, 4]} b={[6, 9, 4]} color="#a78bfa" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'El ángulo se ve en planta',
                        description: 'Al estar las dos en un plano paralelo al horizontal, la planta las muestra sin deformar. No hace falta abatir nada.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-8, 4, 4]} b={[8, 4, 4]} color="#3b82f6" />
                                <DLine a={[-2, -3, 4]} b={[6, 9, 4]} color="#a78bfa" />
                                <VArc center={proj([0, 4, 4]).h} radius={30} from={0} to={-0.9} color="#f59e0b" />
                                <VText x={proj([0, 4, 4]).h[0] + 34} y={proj([0, 4, 4]).h[1] - 6} color="#f59e0b" bold>α</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Método general',
                        description: 'Si no son horizontales ni frontales: se llevan paralelas por un punto, se abate el plano que forman y se mide sobre el abatimiento.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-8, 4, 4]} b={[8, 4, 4]} color="#3b82f6" dashed />
                                <DLine a={[-2, -3, 4]} b={[6, 9, 4]} color="#a78bfa" dashed />
                                <VLine a={proj([0, 4, 4]).h} b={[proj([0, 4, 4]).h[0] + 45, proj([0, 4, 4]).h[1] - 28]} color="#f59e0b" width={2} />
                                <VText x={proj([0, 4, 4]).h[0] + 50} y={proj([0, 4, 4]).h[1] - 30} color="#f59e0b">α en VM</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />

            <StepByStepVisualizer
                title="Ángulo entre dos planos"
                steps={[
                    {
                        title: 'El ángulo diedro',
                        description: 'Es el que forman dos rectas del plano perpendicular a la intersección, una en cada plano.',
                        diagram: (
                            <DihSvg>
                                <CotaLine z={3} label="P₂" />
                                <AlejamientoLine y={5} label="Q₁" color="#a78bfa" />
                                <VText x={250} y={40} color="#64748b">i ∥ LT</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Plano perpendicular a la intersección',
                        description: 'Si los planos son proyectantes, en la vista donde ambos se ven de canto el ángulo aparece en VM.',
                        diagram: (
                            <DihSvg>
                                <CotaLine z={3} label="P₂" />
                                <AlejamientoLine y={5} label="Q₁" color="#a78bfa" />
                                <VLine a={[proj([0, 5, 3]).v[0], 40]} b={[proj([0, 5, 3]).v[0], 240]} color="#f59e0b" dashed />
                                <VArc center={proj([0, 5, 3]).v} radius={36} from={-Math.PI / 2} to={0} color="#f59e0b" />
                                <VText x={proj([0, 5, 3]).v[0] + 40} y={proj([0, 5, 3]).v[1] - 10} color="#f59e0b" bold>α</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Regla práctica',
                        description: 'Ángulo entre planos = ángulo entre sus normales. Si el producto escalar es cero, son perpendiculares (90°).',
                        diagram: (
                            <DihSvg>
                                <CotaLine z={3} label="P₂" />
                                <AlejamientoLine y={5} label="Q₁" color="#a78bfa" />
                                <VText x={120} y={250} color="#f59e0b">cos α = |n₁·n₂| / (|n₁|·|n₂|)</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />
            {cajaLista("El caso que falta: recta y plano", "El ángulo entre una recta y un plano es el que forma con su proyección sobre ese plano:", [
                "Si el plano es proyectante, la recta y su proyección se ven en VM en la vista donde el plano se ve de canto.",
                "Si no lo es: por un punto de la recta se traza la perpendicular al plano; el plano formado por la recta y esa perpendicular corta al plano dado según la proyección de la recta. Se abate ese plano y se mide el ángulo.",
                "Atajo: el ángulo entre recta y plano es el complementario del ángulo entre la recta y la normal al plano.",
            ])}
        </div>
    ),

    /* ----------------------------- 8. ABATIMIENTOS ----------------------------- */
    'theory-8-abatements': (
        <div className="space-y-10 text-slate-700 dark:text-slate-300">
            {caja('Abatir', 'Es girar un plano alrededor de una de sus trazas (la charnela) hasta dejarlo sobre un plano de proyección. Lo que hay en él aparece en verdadera magnitud.')}

            <StepByStepVisualizer
                title="Abatir un punto sobre el horizontal"
                steps={[
                    {
                        title: 'Plano, charnela y punto',
                        description: 'El plano α corta al horizontal según su traza α₁: esa recta es la charnela (no se mueve). El punto A está dentro del plano, con su cota por encima del PH.',
                        diagram: (
                            <DihSvg>
                                <line x1="70" y1="250" x2="320" y2="120" stroke="#10b981" strokeWidth="2" />
                                <text x="285" y="115" fill="#10b981" fontSize="10" fontWeight="bold">α₁ (charnela)</text>
                                <circle cx="250" cy="200" r="3.5" fill="#fff" stroke="#ef4444" strokeWidth="1.8" />
                                <text x="256" y="212" fill="#ef4444" fontSize="10" fontWeight="bold">A′</text>
                                <circle cx="250" cy="80" r="3.5" fill="#ef4444" />
                                <text x="256" y="76" fill="#ef4444" fontSize="10" fontWeight="bold">A″</text>
                                <line x1="250" y1="80" x2="250" y2="200" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Distancia a la charnela y cota',
                        description: 'Desde A′ se traza la perpendicular a la charnela. La distancia d (en la planta) y la cota forman un triángulo rectángulo: la hipotenusa es el radio de giro real.',
                        diagram: (
                            <DihSvg>
                                <line x1="70" y1="250" x2="320" y2="120" stroke="#10b981" strokeWidth="2" opacity="0.6" />
                                <circle cx="250" cy="200" r="3.5" fill="#fff" stroke="#ef4444" strokeWidth="1.8" />
                                <text x="256" y="212" fill="#ef4444" fontSize="10" fontWeight="bold">A′</text>
                                <circle cx="250" cy="80" r="3.5" fill="#ef4444" />
                                <text x="256" y="76" fill="#ef4444" fontSize="10" fontWeight="bold">A″</text>
                                <line x1="250" y1="80" x2="250" y2="200" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
                                <line x1="250" y1="200" x2="232" y2="166" stroke="#f59e0b" strokeWidth="2" />
                                <text x="238" y="190" fill="#f59e0b" fontSize="11" fontWeight="bold">d</text>
                                <circle cx="232" cy="166" r="3" fill="#f59e0b" />
                                <text x="205" y="162" fill="#f59e0b" fontSize="9">pie</text>
                                <text x="258" y="145" fill="#f59e0b" fontSize="11" fontWeight="bold">cota</text>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Punto abatido (A)',
                        description: 'Con el compás, desde el pie se lleva la hipotenusa sobre la perpendicular. Ahí cae (A): está en el PH y en verdadera magnitud.',
                        diagram: (
                            <DihSvg>
                                <line x1="70" y1="250" x2="320" y2="120" stroke="#10b981" strokeWidth="2" opacity="0.5" />
                                <circle cx="232" cy="166" r="3" fill="#f59e0b" />
                                <circle cx="291" cy="277" r="4" fill="#f59e0b" />
                                <text x="296" y="272" fill="#f59e0b" fontSize="10" fontWeight="bold">(A)</text>
                                <line x1="232" y1="166" x2="291" y2="277" stroke="#f59e0b" strokeWidth="2" />
                                <text x="244" y="238" fill="#f59e0b" fontSize="10">radio real</text>
                                <circle cx="250" cy="200" r="3" fill="none" stroke="#ef4444" strokeWidth="1.2" opacity="0.6" />
                                <text x="256" y="212" fill="#ef4444" fontSize="9" opacity="0.7">A′</text>
                            </DihSvg>
                        ),
                    },
                ]}
            />

            <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-slate-700 dark:text-slate-200"><strong>Para qué sirve:</strong> para medir distancias y ángulos en VM, y para dibujar la forma real de una sección. Todo lo que se abate se escribe entre paréntesis: (A), (r), (α).</p>
            </div>
            {cajaLista("Qué se abate en cada caso", "El abatimiento siempre se hace sobre una charnela, que es una traza del plano:", [
                "Un punto: perpendicular a la charnela, pie, y radio igual a la hipotenusa de la distancia al pie y la cota.",
                "Una recta: se abaten dos de sus puntos y se unen. Si la recta corta a la charnela, basta abatir un punto y unirlo con el punto de corte, que no se mueve.",
                "Un plano: se abate una recta de máxima pendiente; el ángulo que forma con la charnela es el ángulo del plano con el PH.",
            ])}
        </div>
    ),

    /* --------------------------------- 9. GIROS -------------------------------- */
    'theory-9-rotations': (
        <div className="space-y-10 text-slate-700 dark:text-slate-300">
            {caja('Girar', 'Es hacer rotar un elemento alrededor de un eje hasta colocarlo en una posición cómoda. El elemento no cambia: cambia su posición.')}

            <StepByStepVisualizer
                title="Giro de un punto alrededor de un eje vertical"
                steps={[
                    {
                        title: 'Eje y punto',
                        description: 'El eje es vertical y pasa por O. En la planta se ve como un punto; en el alzado, como una recta vertical. A gira en un plano horizontal: su cota no cambia.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 0, 0]} label="O" color="#94a3b8" />
                                <VLine a={proj([0, 0, 0]).h} b={[proj([0, 0, 0]).h[0], 20]} color="#94a3b8" dashed />
                                <DPoint p={[6, 4, 2]} label="A" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Radio y giro',
                        description: 'Se une O′ con A′ (radio en VM, porque el eje es vertical) y se gira el ángulo pedido con el compás. Aquí, 90°.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 0, 0]} label="O" color="#94a3b8" />
                                <DPoint p={[6, 4, 2]} label="A" />
                                <VLine a={proj([0, 0, 0]).h} b={proj([6, 4, 2]).h} color="#94a3b8" dashed />
                                <VArc center={proj([0, 0, 0]).h} radius={Math.hypot(6, 4) * SCALE} from={Math.atan2(4, 6)} to={Math.atan2(4, 6) - Math.PI / 2} color="#f59e0b" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Nueva posición A₁',
                        description: 'La nueva planta está a la misma distancia del eje y la cota se mantiene. Subiendo A₁′ a cota 2 se obtiene A₁″.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 0, 0]} label="O" color="#94a3b8" />
                                <DPoint p={[6, 4, 2]} label="A" faded />
                                <DPoint p={[-4, 6, 2]} label="A₁" color="#f59e0b" />
                                <VLine a={proj([0, 0, 0]).h} b={proj([-4, 6, 2]).h} color="#f59e0b" dashed />
                                <VText x={proj([-4, 6, 2]).h[0] - 52} y={proj([-4, 6, 2]).h[1] + 26} color="#f59e0b" bold>90°</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />

            <StepByStepVisualizer
                title="Giro de una recta"
                steps={[
                    {
                        title: 'Girar dos puntos',
                        description: 'Una recta queda definida por dos puntos: se giran ambos con el mismo eje y el mismo ángulo y se unen.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 3, 5]} label="A" />
                                <DPoint p={[7, 6, 5]} label="B" />
                                <DLine a={[0, 3, 5]} b={[7, 6, 5]} color="#3b82f6" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Ponerla paralela a un plano',
                        description: 'Si se gira hasta que su proyección horizontal quede paralela a la LT, la recta pasa a ser paralela al plano vertical y se ve en VM en el alzado.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 3, 5]} label="A" faded />
                                <DPoint p={[7, 6, 5]} label="B" faded />
                                <DLine a={[0, 3, 5]} b={[7, 6, 5]} color="#3b82f6" dashed />
                                <DLine a={[0, 3, 5]} b={[7, 3, 5]} color="#f59e0b" />
                                <VText x={240} y={LT_Y + 12} color="#f59e0b">r₁′ ∥ LT</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Resultado',
                        description: 'Con la recta paralela al PV, el alzado muestra su verdadera magnitud: ya se puede medir sobre el papel.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[0, 3, 5]} b={[7, 3, 5]} color="#f59e0b" width={3} />
                                <VText x={proj([3.5, 3, 5]).v[0] - 20} y={proj([3.5, 3, 5]).v[1] - 10} color="#f59e0b" bold>VM</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />
            {cajaLista("Los otros ejes", "El eje vertical es el más frecuente, pero también aparecen:", [
                "Eje de punta (perpendicular al PV): el punto conserva su alejamiento. Gira en un plano paralelo al PV: en el alzado describe una circunferencia y en la planta se desplaza sobre una paralela a la LT.",
                "Eje paralelo a la LT: el punto gira en un plano de perfil, perpendicular a la LT. Hay que resolverlo en la tercera proyección o con un cambio de plano.",
                "Eje oblicuo: se evita; se sustituye por un cambio de plano que lo deje vertical o de punta.",
            ])}
        </div>
    ),

    /* ----------------------------- 10. CAMBIOS DE PLANO ------------------------ */
    'theory-10-change-plane': (
        <div className="space-y-10 text-slate-700 dark:text-slate-300">
            {caja('Cambiar de plano', 'Es sustituir uno de los planos de proyección por otro perpendicular al que se queda. El objeto no se mueve: cambia el punto de vista.')}

            <StepByStepVisualizer
                title="Verdadera magnitud de un segmento"
                steps={[
                    {
                        title: 'Segmento y proyecciones',
                        description: 'AB es oblicua: en ninguna de las dos vistas aparece en VM. Hay que buscar un plano desde el que se vea de frente.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 2, 2]} label="A" />
                                <DPoint p={[6, 2, 6]} label="B" />
                                <DSegment a={[0, 2, 2]} b={[6, 2, 6]} />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Nueva línea de tierra',
                        description: 'Se traza una nueva LT paralela a la proyección horizontal A′B′ (aquí, horizontal). Al cambiar el plano vertical, la nueva LT puede ir donde convenga.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 2, 2]} label="A" />
                                <DPoint p={[6, 2, 6]} label="B" />
                                <DSegment a={[0, 2, 2]} b={[6, 2, 6]} />
                                <VLine a={[40, 214]} b={[330, 214]} color="#f59e0b" width={2} />
                                <TraceLabel x={44} y={208} text="LT₁" color="#f59e0b" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Llevar las cotas',
                        description: 'Desde cada punto se baja una perpendicular a la nueva LT con la misma cota. La nueva proyección A₁B₁ está en VM.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[0, 2, 2]} label="A" faded />
                                <DPoint p={[6, 2, 6]} label="B" faded />
                                <VLine a={[40, 214]} b={[330, 214]} color="#f59e0b" width={2} />
                                <VLine a={[proj([0, 2, 0]).h[0], 214]} b={[proj([0, 2, 0]).h[0], 214 - 2 * SCALE]} color="#94a3b8" dashed />
                                <VLine a={[proj([6, 2, 0]).h[0], 214]} b={[proj([6, 2, 0]).h[0], 214 - 6 * SCALE]} color="#94a3b8" dashed />
                                <VLine a={[proj([0, 2, 0]).h[0], 214 - 2 * SCALE]} b={[proj([6, 2, 0]).h[0], 214 - 6 * SCALE]} color="#f59e0b" width={3} />
                                <VText x={proj([3, 2, 0]).h[0] - 16} y={214 - 4 * SCALE - 12} color="#f59e0b" bold>VM</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />

            <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-slate-700 dark:text-slate-200"><strong>Regla de oro:</strong> la coordenada del plano que se queda se conserva; la del plano que se sustituye se cambia por la nueva. Por eso se llevan perpendiculares a la nueva LT.</p>
            </div>
            {cajaLista("Cuándo hace falta cambiar de plano", "Reglas prácticas:", [
                "Para ver una recta en VM: un solo cambio, con la nueva LT paralela a una de sus proyecciones.",
                "Para ver un plano de canto: un cambio, con la nueva LT perpendicular a su traza horizontal (o a la vertical).",
                "Para ver un plano en VM: dos cambios consecutivos; el primero lo deja de canto.",
                "La coordenada que se conserva es siempre la del plano que no se sustituye.",
            ])}
        </div>
    ),

    /* ------------------------------- 11. POLIEDROS ----------------------------- */
    'theory-11-polyhedra': (
        <div className="space-y-10 text-slate-700 dark:text-slate-300">
            {caja('Poliedros', 'Sólidos limitados por caras planas. Se representan por sus aristas: visibles con línea continua, ocultas con discontinua.')}

            <StepByStepVisualizer
                title="Cubo apoyado en el plano horizontal"
                steps={[
                    {
                        title: 'La base',
                        description: 'Apoyado en el PH, la base es un cuadrado que se ve en VM en la planta. En el alzado, la base se proyecta sobre la LT.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-4, -4, 0]} b={[4, -4, 0]} color="#3b82f6" />
                                <DLine a={[4, -4, 0]} b={[4, 4, 0]} color="#3b82f6" />
                                <DLine a={[4, 4, 0]} b={[-4, 4, 0]} color="#3b82f6" />
                                <DLine a={[-4, 4, 0]} b={[-4, -4, 0]} color="#3b82f6" />
                                <VText x={190} y={LT_Y + 50} color="#3b82f6">base en VM</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Las caras laterales',
                        description: 'Cada vértice de la base sube una arista vertical hasta la cota de la altura del cubo.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-4, -4, 0]} b={[4, -4, 0]} color="#3b82f6" />
                                <DLine a={[4, -4, 0]} b={[4, 4, 0]} color="#3b82f6" />
                                <DLine a={[4, 4, 0]} b={[-4, 4, 0]} color="#3b82f6" />
                                <DLine a={[-4, 4, 0]} b={[-4, -4, 0]} color="#3b82f6" />
                                <DLine a={[-4, -4, 0]} b={[-4, -4, 6]} color="#3b82f6" />
                                <DLine a={[4, -4, 0]} b={[4, -4, 6]} color="#3b82f6" />
                                <DLine a={[4, 4, 0]} b={[4, 4, 6]} color="#3b82f6" />
                                <DLine a={[-4, 4, 0]} b={[-4, 4, 6]} color="#3b82f6" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Tapa y aristas ocultas',
                        description: 'Se cierra la tapa y se decide qué aristas no se ven: la arista trasera y la vertical oculta van discontinuas.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-4, -4, 0]} b={[4, -4, 0]} color="#3b82f6" />
                                <DLine a={[4, -4, 0]} b={[4, 4, 0]} color="#3b82f6" />
                                <DLine a={[4, 4, 0]} b={[-4, 4, 0]} color="#3b82f6" faded />
                                <DLine a={[-4, 4, 0]} b={[-4, -4, 0]} color="#3b82f6" faded />
                                <DLine a={[-4, -4, 0]} b={[-4, -4, 6]} color="#3b82f6" />
                                <DLine a={[4, -4, 0]} b={[4, -4, 6]} color="#3b82f6" />
                                <DLine a={[4, 4, 0]} b={[4, 4, 6]} color="#3b82f6" faded />
                                <DLine a={[-4, 4, 0]} b={[-4, 4, 6]} color="#3b82f6" faded />
                                <DLine a={[-4, -4, 6]} b={[4, -4, 6]} color="#3b82f6" />
                                <DLine a={[4, -4, 6]} b={[4, 4, 6]} color="#3b82f6" />
                                <DLine a={[4, 4, 6]} b={[-4, 4, 6]} color="#3b82f6" />
                                <DLine a={[-4, 4, 6]} b={[-4, -4, 6]} color="#3b82f6" />
                            </DihSvg>
                        ),
                    },
                ]}
            />

            <StepByStepVisualizer
                title="Intersección de una recta con un sólido"
                steps={[
                    {
                        title: 'Recta que atraviesa el sólido',
                        description: 'La recta r entra y sale del prisma en dos puntos. Lo que buscamos son esos dos puntos de penetración.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-5, -3, 0]} b={[5, -3, 0]} color="#3b82f6" />
                                <DLine a={[5, -3, 0]} b={[5, 3, 0]} color="#3b82f6" />
                                <DLine a={[5, 3, 0]} b={[-5, 3, 0]} color="#3b82f6" />
                                <DLine a={[-5, 3, 0]} b={[-5, -3, 0]} color="#3b82f6" />
                                <DLine a={[-5, -3, 0]} b={[-5, -3, 6]} color="#3b82f6" />
                                <DLine a={[5, -3, 0]} b={[5, -3, 6]} color="#3b82f6" />
                                <DLine a={[5, 3, 0]} b={[5, 3, 6]} color="#3b82f6" />
                                <DLine a={[-5, 3, 0]} b={[-5, 3, 6]} color="#3b82f6" />
                                <DLine a={[-5, -3, 6]} b={[5, -3, 6]} color="#3b82f6" />
                                <DLine a={[5, -3, 6]} b={[5, 3, 6]} color="#3b82f6" />
                                <DLine a={[5, 3, 6]} b={[-5, 3, 6]} color="#3b82f6" />
                                <DLine a={[-5, 3, 6]} b={[-5, -3, 6]} color="#3b82f6" />
                                <DLine a={[-7, 0, 1]} b={[7, 0, 5]} color="#ef4444" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Plano proyectante que contiene a r',
                        description: 'Se contiene la recta en un plano proyectante (aquí vertical). Ese plano corta al sólido en un polígono: la sección.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-5, -3, 0]} b={[5, -3, 0]} color="#3b82f6" faded />
                                <DLine a={[5, -3, 0]} b={[5, 3, 0]} color="#3b82f6" faded />
                                <DLine a={[5, 3, 0]} b={[-5, 3, 0]} color="#3b82f6" faded />
                                <DLine a={[-5, 3, 0]} b={[-5, -3, 0]} color="#3b82f6" faded />
                                <DLine a={[-5, -3, 0]} b={[-5, -3, 6]} color="#3b82f6" faded />
                                <DLine a={[5, -3, 0]} b={[5, -3, 6]} color="#3b82f6" faded />
                                <DLine a={[5, 3, 0]} b={[5, 3, 6]} color="#3b82f6" faded />
                                <DLine a={[-5, 3, 0]} b={[-5, 3, 6]} color="#3b82f6" faded />
                                <DLine a={[-7, 0, 1]} b={[7, 0, 5]} color="#ef4444" />
                                <VLine a={[proj([-7, 0, 1]).v[0], 30]} b={[proj([-7, 0, 1]).v[0], 250]} color="#a78bfa" dashed />
                                <VText x={proj([-7, 0, 1]).v[0] + 6} y={40} color="#a78bfa" size={9}>plano proyectante</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Puntos de entrada y salida',
                        description: 'Donde la recta corta al polígono de la sección están los dos puntos de penetración. Se ven directamente porque el plano es proyectante.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-7, 0, 1]} b={[7, 0, 5]} color="#ef4444" />
                                <DPoint p={[-3, 0, 2]} label="1" color="#f59e0b" showProjections={false} />
                                <DPoint p={[3, 0, 4]} label="2" color="#f59e0b" showProjections={false} />
                                <VText x={60} y={250} color="#f59e0b">entrada y salida</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />

            <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-slate-700 dark:text-slate-200"><strong>Los cinco regulares:</strong> tetraedro (4 triángulos), cubo (6 cuadrados), octaedro (8 triángulos), dodecaedro (12 pentágonos) e icosaedro (20 triángulos).</p>
            </div>
            {cajaLista("Los cinco regulares, en números", "Conviene memorizar caras, aristas y vértices (cumplen V - A + C = 2):", [
                "Tetraedro: 4 caras triangulares, 6 aristas, 4 vértices. Altura = a·√(2/3) ≈ 0,8165·a.",
                "Cubo: 6 caras cuadradas, 12 aristas, 8 vértices. Diagonal = a·√3.",
                "Octaedro: 8 caras triangulares, 12 aristas, 6 vértices.",
                "Dodecaedro: 12 caras pentagonales, 30 aristas, 20 vértices.",
                "Icosaedro: 20 caras triangulares, 30 aristas, 12 vértices.",
            ])}
        </div>
    ),

    /* ------------------------------- 12. SUPERFICIES --------------------------- */
    'theory-12-surfaces': (
        <div className="space-y-10 text-slate-700 dark:text-slate-300">
            {caja('Superficies curvas', 'Cilindro, cono y esfera no tienen aristas: se dibujan por su contorno aparente y, si hace falta, por generatrices o paralelos auxiliares.')}

            <StepByStepVisualizer
                title="Cilindro y cono"
                steps={[
                    {
                        title: 'Cilindro: base y contorno',
                        description: 'En la planta es una circunferencia; en el alzado, un rectángulo cuya altura es la del cilindro. Las generatrices extremas son el contorno.',
                        diagram: (
                            <DihSvg>
                                <ellipse cx={CX} cy={LT_Y + 3 * SCALE} rx={3 * SCALE} ry={3 * SCALE} fill="none" stroke="#3b82f6" strokeWidth="2" />
                                <rect x={CX - 3 * SCALE} y={LT_Y - 6 * SCALE} width={6 * SCALE} height={6 * SCALE} fill="none" stroke="#3b82f6" strokeWidth="2" />
                                <VText x={CX + 3 * SCALE + 6} y={LT_Y - 5 * SCALE} color="#3b82f6">h</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Cono',
                        description: 'La base es la misma circunferencia y el alzado es un triángulo: el vértice se proyecta en el centro de la base.',
                        diagram: (
                            <DihSvg>
                                <ellipse cx={CX} cy={LT_Y + 3 * SCALE} rx={3 * SCALE} ry={3 * SCALE} fill="none" stroke="#f59e0b" strokeWidth="2" />
                                <line x1={CX - 3 * SCALE} y1={LT_Y} x2={CX} y2={LT_Y - 6 * SCALE} stroke="#f59e0b" strokeWidth="2" />
                                <line x1={CX + 3 * SCALE} y1={LT_Y} x2={CX} y2={LT_Y - 6 * SCALE} stroke="#f59e0b" strokeWidth="2" />
                                <line x1={CX - 3 * SCALE} y1={LT_Y} x2={CX + 3 * SCALE} y2={LT_Y} stroke="#f59e0b" strokeWidth="2" />
                                <VText x={CX + 4} y={LT_Y - 6 * SCALE - 6} color="#f59e0b">V″</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Esfera',
                        description: 'Se proyecta como una circunferencia del radio de la esfera en las dos vistas. El centro está en la misma x.',
                        diagram: (
                            <DihSvg>
                                <circle cx={CX} cy={LT_Y + 3 * SCALE} r={3 * SCALE} fill="none" stroke="#10b981" strokeWidth="2" />
                                <circle cx={CX} cy={LT_Y - 3 * SCALE} r={3 * SCALE} fill="none" stroke="#10b981" strokeWidth="2" />
                                <VText x={CX + 3 * SCALE + 6} y={LT_Y - 3 * SCALE} color="#10b981">R</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />
            {cajaLista("Cono y esfera", "Los otros dos cuerpos de revolución:", [
                "Cono recto: en la planta es una circunferencia y en el alzado un triángulo isósceles. El vértice se proyecta en el centro de la base; las generatrices extremas son el contorno.",
                "Esfera: se proyecta como dos circunferencias del mismo radio, con los centros en la misma vertical. El contorno aparente es el ecuador en la planta y el meridiano paralelo al PV en el alzado.",
                "En los tres cuerpos, el contorno aparente va con línea continua; las generatrices interiores, con línea fina.",
            ])}
        </div>
    ),

    /* -------------------------------- 13. SECCIONES ---------------------------- */
    'theory-13-sections': (
        <div className="space-y-10 text-slate-700 dark:text-slate-300">
            {caja('Sección', 'Es la figura que resulta de cortar un sólido por un plano. Se obtiene hallando la intersección del plano con cada cara.')}

            <StepByStepVisualizer
                title="Sección de un cubo por un plano horizontal"
                steps={[
                    {
                        title: 'Sólido y plano de corte',
                        description: 'El plano de corte es horizontal, a media altura. En el alzado se ve como una recta; en la planta, no se ve (es paralelo a ella).',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-4, -4, 0]} b={[4, -4, 0]} color="#3b82f6" />
                                <DLine a={[4, -4, 0]} b={[4, 4, 0]} color="#3b82f6" />
                                <DLine a={[4, 4, 0]} b={[-4, 4, 0]} color="#3b82f6" />
                                <DLine a={[-4, 4, 0]} b={[-4, -4, 0]} color="#3b82f6" />
                                <DLine a={[-4, -4, 0]} b={[-4, -4, 6]} color="#3b82f6" />
                                <DLine a={[4, -4, 0]} b={[4, -4, 6]} color="#3b82f6" />
                                <DLine a={[4, 4, 0]} b={[4, 4, 6]} color="#3b82f6" />
                                <DLine a={[-4, 4, 0]} b={[-4, 4, 6]} color="#3b82f6" />
                                <CotaLine z={3} label="corte" color="#f59e0b" x1={60} x2={300} />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Puntos en las aristas',
                        description: 'Donde el plano corta a cada arista vertical aparece un punto de la sección. Aquí son cuatro, a cota 3.',
                        diagram: (
                            <DihSvg>
                                <DPoint p={[-4, -4, 3]} label="1" color="#f59e0b" showProjections={false} />
                                <DPoint p={[4, -4, 3]} label="2" color="#f59e0b" showProjections={false} />
                                <DPoint p={[4, 4, 3]} label="3" color="#f59e0b" showProjections={false} />
                                <DPoint p={[-4, 4, 3]} label="4" color="#f59e0b" showProjections={false} />
                                <CotaLine z={3} color="#f59e0b" />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Unir la sección',
                        description: 'Se unen los puntos en orden alrededor del sólido. Como el plano es paralelo a la base, la sección es un cuadrado en VM en la planta.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-4, -4, 3]} b={[4, -4, 3]} color="#f59e0b" width={3} />
                                <DLine a={[4, -4, 3]} b={[4, 4, 3]} color="#f59e0b" width={3} />
                                <DLine a={[4, 4, 3]} b={[-4, 4, 3]} color="#f59e0b" width={3} />
                                <DLine a={[-4, 4, 3]} b={[-4, -4, 3]} color="#f59e0b" width={3} />
                                <DLine a={[-4, -4, 0]} b={[4, -4, 0]} color="#3b82f6" faded />
                                <DLine a={[4, -4, 0]} b={[4, 4, 0]} color="#3b82f6" faded />
                                <DLine a={[4, 4, 0]} b={[-4, 4, 0]} color="#3b82f6" faded />
                                <DLine a={[-4, 4, 0]} b={[-4, -4, 0]} color="#3b82f6" faded />
                            </DihSvg>
                        ),
                    },
                ]}
            />
            <StepByStepVisualizer
                title="Verdadera magnitud de la sección"
                steps={[
                    {
                        title: 'La sección, en proyección',
                        description: 'Cuando el plano de corte es oblicuo, la sección se ve deformada en las dos vistas. Hay que abatir el plano para verla como es.',
                        diagram: (
                            <DihSvg>
                                <DLine a={[-5, -3, 0]} b={[5, -3, 0]} color="#3b82f6" faded />
                                <DLine a={[5, -3, 0]} b={[5, 3, 0]} color="#3b82f6" faded />
                                <DLine a={[-5, 3, 0]} b={[-5, -3, 0]} color="#3b82f6" faded />
                                <DLine a={[-5, -3, 0]} b={[-5, -3, 6]} color="#3b82f6" faded />
                                <DLine a={[5, -3, 0]} b={[5, -3, 6]} color="#3b82f6" faded />
                                <DLine a={[5, 3, 0]} b={[5, 3, 6]} color="#3b82f6" faded />
                                <DLine a={[-5, 3, 0]} b={[-5, 3, 6]} color="#3b82f6" faded />
                                <DPoint p={[-5, -3, 2]} label="1" color="#f59e0b" showProjections={false} />
                                <DPoint p={[5, -3, 4]} label="2" color="#f59e0b" showProjections={false} />
                                <DPoint p={[5, 3, 6]} label="3" color="#f59e0b" showProjections={false} />
                                <DPoint p={[-5, 3, 4]} label="4" color="#f59e0b" showProjections={false} />
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Charnela del plano de corte',
                        description: 'Se toma como charnela la traza horizontal del plano de corte y se abate el plano, igual que en el tema de abatimientos.',
                        diagram: (
                            <DihSvg>
                                <VLine a={[60, 210]} b={[320, 210]} color="#10b981" width={2} />
                                <VText x={66} y={204} color="#10b981" size={9}>charnela (traza del corte)</VText>
                                <VLine a={[60, 210]} b={[200, 90]} color="#f59e0b" dashed />
                                <VText x={150} y={150} color="#f59e0b" size={9}>abatir</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Sección en VM',
                        description: 'Sobre el abatimiento, la sección aparece con sus lados reales: ya se puede medir y comparar con la figura que pide el enunciado.',
                        diagram: (
                            <DihSvg>
                                <VLine a={[60, 210]} b={[320, 210]} color="#10b981" width={2} />
                                <polygon points="120,190 210,150 260,190 170,230" fill="none" stroke="#f59e0b" strokeWidth="3" />
                                <VText x={190} y={245} color="#f59e0b" bold>sección en VM</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />
            {cajaLista("Método general de secciones", "Cuando el plano de corte no es proyectante:", [
                "Se cambia el plano de proyección para ver el plano de corte de canto: la nueva LT es perpendicular a su traza.",
                "En esa vista la sección se ve como un segmento: se marcan los puntos donde corta a las aristas del sólido.",
                "Se llevan los puntos a las otras vistas con las líneas de referencia y se unen en orden.",
                "Para ver la sección en VM se abate el plano de corte, o se hace un segundo cambio de plano paralelo a él.",
            ])}
        </div>
    ),

    /* -------------------------------- 14. DESARROLLOS -------------------------- */
    'theory-14-developments': (
        <div className="space-y-10 text-slate-700 dark:text-slate-300">
            {caja('Desarrollo', 'Es desplegar las caras del sólido sobre un plano. Cada cara aparece en verdadera magnitud y unida a la siguiente por una arista.')}

            <StepByStepVisualizer
                title="Desarrollo de un prisma recto"
                steps={[
                    {
                        title: 'Caras laterales en fila',
                        description: 'Se dibujan tantos rectángulos como caras tiene el prisma, uno al lado de otro. La base de cada uno es el lado del polígono y la altura, la del prisma.',
                        diagram: (
                            <DihSvg>
                                {[0, 1, 2, 3].map((i) => (
                                    <rect key={i} x={70 + i * 55} y={80} width={55} height={110} fill="none" stroke="#3b82f6" strokeWidth="2" />
                                ))}
                                <VText x={70} y={70} color="#3b82f6">lado</VText>
                                <VText x={300} y={150} color="#3b82f6">h</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Las dos bases',
                        description: 'Cada base (el polígono en VM) se añade colgando de una arista, arriba y abajo del desarrollo.',
                        diagram: (
                            <DihSvg>
                                {[0, 1, 2, 3].map((i) => (
                                    <rect key={i} x={70 + i * 55} y={80} width={55} height={110} fill="none" stroke="#3b82f6" strokeWidth="2" />
                                ))}
                                <polygon points="70,80 125,80 125,25 70,25" fill="none" stroke="#f59e0b" strokeWidth="2" />
                                <polygon points="70,190 125,190 125,245 70,245" fill="none" stroke="#f59e0b" strokeWidth="2" />
                                <VText x={130} y={56} color="#f59e0b">base</VText>
                            </DihSvg>
                        ),
                    },
                    {
                        title: 'Cilindro: 2πr',
                        description: 'El desarrollo lateral de un cilindro es un rectángulo de base 2πr y altura h, más dos círculos. Si r = 3, la base mide ≈18,85.',
                        diagram: (
                            <DihSvg>
                                <rect x={55} y={95} width={250} height={90} fill="none" stroke="#10b981" strokeWidth="2" />
                                <circle cx={80} cy={95} r={22} fill="none" stroke="#10b981" strokeWidth="2" />
                                <circle cx={280} cy={185} r={22} fill="none" stroke="#10b981" strokeWidth="2" />
                                <VText x={140} y={88} color="#10b981">2πr ≈ 18,85</VText>
                                <VText x={310} y={145} color="#10b981">h</VText>
                            </DihSvg>
                        ),
                    },
                ]}
            />

            <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-slate-700 dark:text-slate-200"><strong>Comprobación:</strong> el ancho del desarrollo lateral debe coincidir con el perímetro de la base. Si no cuadra, has redondeado mal o te falta una cara.</p>
            </div>
            {cajaLista("Desarrollos que caen", "Además del prisma recto:", [
                "Pirámide recta: un polígono central (la base) y tantos triángulos isósceles como caras laterales, con la apotema de la pirámide en VM.",
                "Cono recto: un sector circular de radio igual a la generatriz g. El arco mide 2·π·r, así que el ángulo del sector es 360°·r/g.",
                "Cilindro recto: un rectángulo de base 2·π·r y altura h, más dos círculos.",
            ])}
        </div>
    ),
};

/** Descripciones para la lista lateral (los temas 6-14 eran de una línea). */
export const ACADEMY_DESCRIPTIONS: Record<string, string> = {
    'theory-6-distances': 'Punto-plano, punto-recta y recta-plano: construir la perpendicular y medir en VM.',
    'theory-7-angles': 'Entre rectas, recta-plano y plano-plano: cuándo se ve directo y cuándo hay que abatir.',
    'theory-8-abatements': 'Charnela, radio de giro y puntos abatidos: el método para ver en VM.',
    'theory-9-rotations': 'Ejes verticales y paralelos a la LT, y cómo dejar una recta en posición cómoda.',
    'theory-10-change-plane': 'Cambiar el punto de vista para ver rectas en VM y planos de canto.',
    'theory-11-polyhedra': 'Cubo, tetraedro y los cinco regulares: aristas visibles y ocultas.',
    'theory-12-surfaces': 'Cilindro, cono y esfera: contorno aparente y generatrices.',
    'theory-13-sections': 'Cortar un sólido por un plano y dibujar la sección resultante.',
    'theory-14-developments': 'Desplegar las caras en VM para construir el sólido sobre el papel.',
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
            solutionHint: 'El simétrico respecto del PH cambia el signo de la cota: A* (4, 3, −5). No lo llames A′, que es la proyección horizontal.',
        },
        {
            id: 'ex-point-quadrants',
            title: 'Los cuatro cuadrantes',
            level: 'Medio',
            statement: 'Dibuja un punto en cada uno de los cuatro cuadrantes y explica qué signo tiene su cota y su alejamiento.',
            setup: [p('A', 2, 3, 4), p('B', 8, -3, 4, '#a78bfa'), p('C', 12, -3, -4, '#f59e0b'), p('D', 5, 3, -4, '#34d399')],
            solutionHint: 'I: cota +, alejamiento +. II: cota +, alejamiento −. III: cota −, alejamiento −. IV: cota −, alejamiento +.',
        },
    ],
    'theory-2-line': [
        {
            id: 'ex-line-traces',
            title: 'Hallar las trazas de una recta',
            level: 'Medio',
            statement: 'La recta r pasa por A(0, 6, 5) y B(12, 2, −3). Halla sus trazas H y V.',
            setup: [p('A', 0, 6, 5), p('B', 12, 2, -3), l('r', [0, 6, 5], [12, -4, -8])],
            solutionHint: 'Traza H donde r″ corta a la LT y sube la perpendicular hasta r′: H(7,5, 3,5, 0). Traza V donde r′ corta a la LT y baja hasta r″: V(18, 0, −7).',
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
            statement: 'La recta r pasa por A(0, 4, 2) y B(10, 4, 6). Dibuja un plano proyectante vertical que la contenga y explica por qué se ve de canto en el alzado.',
            setup: [p('A', 0, 4, 2), p('B', 10, 4, 6), l('r', [0, 4, 2], [10, 0, 4])],
            solutionHint: 'Un plano proyectante vertical es perpendicular al PV: su traza vertical es una recta y todo el plano se proyecta sobre ella.',
        },
    ],
    'theory-4-intersections': [
        {
            id: 'ex-intersection-oblique',
            title: 'Corte con un plano oblicuo',
            level: 'Difícil',
            statement: 'Halla el punto donde la recta r (por A(0, 0, 3) y B(6, 6, 3)) corta al plano P: x + y + z = 6.',
            setup: [p('A', 0, 0, 3), p('B', 6, 6, 3), l('r', [0, 0, 3], [6, 6, 0]), pl('P', [1, 1, 1], -6)],
            solutionHint: 'A mitad de camino en la planta: I(1,5; 1,5; 3), que cumple x + y + z = 6.',
        },
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
            solutionHint: 'El plano es proyectante: el corte se ve directamente en el alzado.',
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
            statement: 'Por P(2, 4, 6) traza la recta perpendicular al plano α: y = 4.',
            setup: [p('P', 2, 4, 6, '#a78bfa'), pl('α', [0, 1, 0], -4)],
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
            statement: 'Halla la distancia del punto P(4, 10, 2) a la recta r, que pasa por A(0, 6, 2) y B(8, 6, 2).',
            setup: [p('A', 0, 6, 2), p('B', 8, 6, 2), p('P', 4, 10, 2, '#a78bfa'), l('r', [0, 6, 2], [8, 0, 0])],
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
    'theory-8-abatements': [
        {
            id: 'ex-flatten-vertical',
            title: 'Abatir un punto de un plano vertical',
            level: 'Difícil',
            statement: 'El punto A(2, 3, 4) pertenece al plano y = 3. Abátelo sobre el horizontal.',
            setup: [p('A', 2, 3, 4), pl('α', [0, 1, 0], -3)],
            solutionHint: 'La charnela es y = 3. Como A′ cae en ella, el radio es la cota (4): (A) queda a alejamiento 7, misma x.',
        },
        {
            id: 'ex-flatten-point',
            title: 'Abatir un punto',
            level: 'Difícil',
            statement: 'El punto A(3, 4, 5) pertenece al plano y = 4. Abátelo sobre el horizontal.',
            setup: [p('A', 3, 4, 5), pl('α', [0, 1, 0], -4)],
            solutionHint: 'Charnela: la recta y = 4, z = 0. Como A′ cae sobre la charnela, el radio de giro es la cota: 5. Llévalo perpendicular a la charnela.',
        },
        {
            id: 'ex-flatten-vm',
            title: 'Verdadera magnitud por abatimiento',
            level: 'Difícil',
            statement: 'Abate el plano proyectante que contiene al segmento AB y mide su verdadera magnitud. A(0, 2, 2), B(6, 5, 6).',
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
    'theory-10-change-plane': [
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
            setup: [p('A', 0, 2, 4), p('B', 8, 6, 4), p('P', 4, 4, 8, '#a78bfa'), l('r', [0, 2, 4], [8, 4, 0]), pl('α', [1, -2, 0], 4)],
            solutionHint: 'Traza una recta horizontal del plano y pon la nueva LT perpendicular a su proyección horizontal.',
        },
    ],
    'theory-11-polyhedra': [
        {
            id: 'ex-octahedron',
            title: 'Octaedro apoyado en un vértice',
            level: 'Difícil',
            statement: 'Dibuja un octaedro regular de radio 4 y explica qué se ve en planta al apoyarlo en un vértice.',
            setup: [solid('Octaedro', 'octahedron', [0, 6, 4], 4)],
            solutionHint: 'En planta es un cuadrado con sus diagonales; en alzado, un rombo. Las aristas ocultas van discontinuas.',
        },
        {
            id: 'ex-cube-draw',
            title: 'Cubo apoyado en el PH',
            level: 'Medio',
            statement: 'Dibuja un cubo de 6 unidades de arista apoyado en el plano horizontal, con una cara paralela al PV.',
            setup: [p('O', 4, 4, 0), solidOnFloor('Cubo', 'cube', 4, 4, 4, 6)],
            solutionHint: 'En planta, un cuadrado en VM; en alzado, otro cuadrado a la altura de la arista. Las aristas ocultas van discontinuas.',
        },
        {
            id: 'ex-tetrahedron',
            title: 'Tetraedro',
            level: 'Difícil',
            statement: 'Dibuja un tetraedro regular y localiza sus aristas ocultas en alzado y planta.',
            setup: [p('O', 6, 6, 0), solidOnFloor('Tetraedro', 'tetrahedron', 6, 6, 4, 7, '#ef4444')],
            solutionHint: 'La base es un triángulo equilátero; el vértice superior se proyecta en el centro de la base.',
        },
    ],
    'theory-12-surfaces': [
        {
            id: 'ex-cylinder',
            title: 'Cilindro recto',
            level: 'Fácil',
            statement: 'Dibuja un cilindro de radio 3 y altura 8 apoyado en el PH y señala su contorno aparente.',
            setup: [p('O', 5, 5, 0), solidOnFloor('Cilindro', 'cylinder', 5, 5, 3, 8)],
            solutionHint: 'Planta: circunferencia de radio 3. Alzado: rectángulo de 6 × 8. El contorno son las dos generatrices extremas.',
        },
        {
            id: 'ex-cone',
            title: 'Cono recto',
            level: 'Medio',
            statement: 'Dibuja un cono de radio 4 y altura 7 y explica por qué en planta se ve una circunferencia.',
            setup: [p('O', 6, 6, 0), solidOnFloor('Cono', 'cone', 6, 6, 4, 7, '#f59e0b')],
            solutionHint: 'Todas las generatrices van del vértice a la base; en planta se superponen y solo se ve la circunferencia.',
        },
    ],
    'theory-13-sections': [
        {
            id: 'ex-section-cylinder',
            title: 'Sección de un cilindro',
            level: 'Medio',
            statement: 'El cilindro tiene radio 3 y altura 8. Dibuja la sección que produce un plano horizontal a media altura.',
            setup: [solidOnFloor('Cilindro', 'cylinder', 0, 6, 3, 8), pl('Corte', [0, 0, 1], -4, '#f59e0b')],
            solutionHint: 'La sección es una circunferencia de radio 3, en VM en la planta y como un segmento en el alzado.',
        },
        {
            id: 'ex-section-cube',
            title: 'Sección de un cubo por un plano horizontal',
            level: 'Difícil',
            statement: 'El cubo está apoyado en el PH. Dibuja la sección que produce un plano horizontal a media altura.',
            setup: [p('O', 5, 5, 0), solidOnFloor('Cubo', 'cube', 5, 5, 4, 6), pl('Corte', [0, 0, 1], -3, '#f59e0b')],
            solutionHint: 'La sección es un cuadrado paralelo a la base, del mismo tamaño. En planta se ve en VM.',
        },
        {
            id: 'ex-section-prism',
            title: 'Sección por un plano proyectante',
            level: 'Difícil',
            statement: 'Dibuja la sección de un prisma por un plano proyectante vertical y explica dónde se ve directamente.',
            setup: [p('O', 5, 5, 0), solidOnFloor('Prisma', 'prism', 5, 5, 3, 8), pl('Corte', [0, 1, 0.2], -5, '#f59e0b')],
            solutionHint: 'En la vista donde el plano se ve de canto (alzado), la sección aparece como un segmento: sus extremos son los puntos de corte con las aristas.',
        },
    ],
    'theory-14-developments': [
        {
            id: 'ex-development-prism',
            title: 'Desarrollo de un prisma',
            level: 'Medio',
            statement: 'Dibuja el desarrollo de un prisma hexagonal de radio 3 y altura 8.',
            setup: [p('O', 6, 6, 0), solidOnFloor('Prisma', 'prism', 6, 6, 3, 8)],
            solutionHint: 'Seis rectángulos de base el lado del hexágono (igual al radio en un hexágono regular) y altura 8, más las dos bases.',
        },
        {
            id: 'ex-development-cylinder',
            title: 'Desarrollo de un cilindro',
            level: 'Fácil',
            statement: 'Calcula las dimensiones del desarrollo lateral de un cilindro de radio 3 y altura 8.',
            setup: [p('O', 6, 6, 0), solidOnFloor('Cilindro', 'cylinder', 6, 6, 3, 8)],
            solutionHint: 'Rectángulo de base 2πr ≈ 18,85 y altura 8, más dos círculos de radio 3.',
        },
    ],
};
