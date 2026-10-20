import React from 'react';

/**
 * Piezas para dibujar construcciones diédricas en los pasos de la Academia.
 *
 * Coordenadas del store: x (paralela a LT), y (alejamiento), z (cota).
 * En el SVG: la planta va debajo de la LT (y positivo hacia abajo) y el
 * alzado encima (z positivo hacia arriba). Es la misma convención que la app.
 */

export const SCALE = 8;      // px por unidad
export const CX = 180;       // centro horizontal del viewBox (360 de ancho)
export const LT_Y = 140;     // altura de la línea de tierra

export interface Proj {
    h: [number, number]; // planta
    v: [number, number]; // alzado
}

export const proj = (p: [number, number, number]): Proj => ({
    h: [CX + p[0] * SCALE, LT_Y + p[1] * SCALE],
    v: [CX + p[0] * SCALE, LT_Y - p[2] * SCALE],
});

/** Lienzo con línea de tierra. */
export const DihSvg: React.FC<{ children: React.ReactNode; height?: number }> = ({ children, height = 280 }) => (
    <svg viewBox="0 0 360 280" width="100%" height={height} role="img" aria-label="Construcción diédrica">
        {/* Línea de tierra */}
        <line x1="10" y1={LT_Y} x2="350" y2={LT_Y} className="stroke-slate-800 dark:stroke-slate-200" strokeWidth="1.5" />
        <text x="12" y={LT_Y - 6} className="fill-slate-500" fontSize="9">LT</text>
        {children}
    </svg>
);

/** Punto con sus dos proyecciones y la vertical de unión. */
export const DPoint: React.FC<{
    p: [number, number, number];
    label: string;
    color?: string;
    showProjections?: boolean;
    faded?: boolean;
}> = ({ p, label, color = '#ef4444', showProjections = true, faded = false }) => {
    const { h, v } = proj(p);
    const opacity = faded ? 0.35 : 1;

    if (!showProjections) {
        return (
            <g opacity={opacity}>
                <circle cx={h[0]} cy={h[1]} r="3.5" fill={color} />
                <text x={h[0] + 6} y={h[1] + 4} fill={color} fontSize="10" fontWeight="bold">{label}</text>
            </g>
        );
    }

    return (
        <g opacity={opacity}>
            <line x1={v[0]} y1={v[1]} x2={h[0]} y2={h[1]} stroke={color} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.55" />
            <circle cx={v[0]} cy={v[1]} r="3.5" fill={color} />
            <text x={v[0] + 6} y={v[1] - 4} fill={color} fontSize="10" fontWeight="bold">{label}″</text>
            <circle cx={h[0]} cy={h[1]} r="3.5" fill="#fff" stroke={color} strokeWidth="1.8" />
            <text x={h[0] + 6} y={h[1] + 12} fill={color} fontSize="10" fontWeight="bold">{label}′</text>
        </g>
    );
};

/** Línea recta en las dos vistas (a partir de dos puntos del espacio). */
export const DLine: React.FC<{
    a: [number, number, number];
    b: [number, number, number];
    color?: string;
    dashed?: boolean;
    faded?: boolean;
    width?: number;
}> = ({ a, b, color = '#3b82f6', dashed = false, faded = false, width = 2 }) => {
    const pa = proj(a);
    const pb = proj(b);
    return (
        <g opacity={faded ? 0.35 : 1} stroke={color} strokeWidth={width} strokeDasharray={dashed ? '4 3' : undefined}>
            <line x1={pa.v[0]} y1={pa.v[1]} x2={pb.v[0]} y2={pb.v[1]} />
            <line x1={pa.h[0]} y1={pa.h[1]} x2={pb.h[0]} y2={pb.h[1]} />
        </g>
    );
};

/** Segmento (mismas proyecciones, pero con extremos marcados). */
export const DSegment: React.FC<{
    a: [number, number, number];
    b: [number, number, number];
    color?: string;
    width?: number;
}> = ({ a, b, color = '#f59e0b', width = 3 }) => <DLine a={a} b={b} color={color} width={width} />;

/** Línea en coordenadas de vista (para trazas, abatimientos y arcos). */
export const VLine: React.FC<{
    a: [number, number];
    b: [number, number];
    color?: string;
    dashed?: boolean;
    width?: number;
    faded?: boolean;
}> = ({ a, b, color = '#3b82f6', dashed = false, width = 2, faded = false }) => (
    <line
        x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
        stroke={color} strokeWidth={width} strokeDasharray={dashed ? '4 3' : undefined}
        opacity={faded ? 0.35 : 1}
    />
);

/** Arco de compás. */
export const VArc: React.FC<{
    center: [number, number];
    radius: number;
    from: number;
    to: number;
    color?: string;
}> = ({ center, radius, from, to, color = '#f59e0b' }) => {
    const p1 = [center[0] + radius * Math.cos(from), center[1] + radius * Math.sin(from)];
    const p2 = [center[0] + radius * Math.cos(to), center[1] + radius * Math.sin(to)];
    const largeArc = Math.abs(to - from) > Math.PI ? 1 : 0;
    const sweep = to > from ? 1 : 0;
    return (
        <path
            d={`M ${p1[0]} ${p1[1]} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${p2[0]} ${p2[1]}`}
            fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="4 3"
        />
    );
};

export const VText: React.FC<{ x: number; y: number; color?: string; size?: number; bold?: boolean; children: React.ReactNode }> = ({
    x, y, color = '#334155', size = 10, bold = false, children,
}) => (
    <text x={x} y={y} fill={color} fontSize={size} fontWeight={bold ? 'bold' : 'normal'}>{children}</text>
);

/** Etiqueta de traza de un plano (α₁ horizontal, α₂ vertical). */
export const TraceLabel: React.FC<{ x: number; y: number; text: string; color?: string }> = ({ x, y, text, color = '#10b981' }) => (
    <text x={x} y={y} fill={color} fontSize="10" fontWeight="bold">{text}</text>
);
