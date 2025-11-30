import type { PointElement } from '../../types';

const SCALE = 40;

export default function Point2D({ element }: { element: PointElement }) {
    const px = element.coords.x * SCALE;
    const py_h = element.coords.y * SCALE; // Horizontal projection (y)
    const py_v = -element.coords.z * SCALE; // Vertical projection (z) - negative because SVG y increases downwards

    return (
        <>
            {/* Geometry (rendered first) */}
            <g className="point-geometry">
                {/* Vertical Projection (z) */}
                <circle cx={px} cy={py_v} r="4" fill={element.color} />

                {/* Horizontal Projection (y) */}
                <circle cx={px} cy={py_h} r="4" fill="white" stroke={element.color} strokeWidth="2" />

                {/* Connection Line */}
                <line x1={px} y1={py_v} x2={px} y2={py_h} stroke={element.color} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            </g>

            {/* Text labels (hidden - rendered in merged layer in DiedricoView) */}
            <g className="text-labels" data-element-id={element.id} style={{ display: 'none' }}>
                <text x={px + 5} y={py_v - 5} fontSize="12" fill={element.color}>{element.name}''</text>
                <text x={px + 5} y={py_h + 15} fontSize="12" fill={element.color}>{element.name}'</text>
            </g>
        </>
    );
}
