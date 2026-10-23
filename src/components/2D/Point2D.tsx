import type { PointElement } from '../../types';
import { useProjectionColors } from '../../lib/projectionColors';

const SCALE = 40;

export default function Point2D({ element, onClick, isDark = false }: { element: PointElement, onClick?: (e: React.MouseEvent) => void, isDark?: boolean }) {
    const px = element.coords.x * SCALE;
    const py_h = element.coords.y * SCALE; // Horizontal projection (y)
    const py_v = -element.coords.z * SCALE; // Vertical projection (z) - negative because SVG y increases downwards

    // Use theme-aware fill color for horizontal projection
    const horizontalFill = isDark ? '#1f2937' : '#ffffff';
    const { on, h: hColor, v: vColor, blend } = useProjectionColors(element.color);

    if (element.role === 'shadow-h' || element.role === 'shadow-v') {
        const onlyH = element.role === 'shadow-h';
        return (
            <g className="point-geometry" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
                <circle
                    cx={px}
                    cy={onlyH ? py_h : py_v}
                    r="3"
                    fill={element.color}
                />
            </g>
        );
    }

    if (element.role === 'abated') {
        return (
            <g className="point-geometry" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
                <circle cx={px} cy={py_h} r="4" fill={element.color} stroke={isDark ? 'white' : 'black'} strokeWidth="1" />
            </g>
        );
    }

    return (
        <>
            {/* Geometry (rendered first) */}
            <g className="point-geometry" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
                {/* Vertical Projection (z) */}
                <circle cx={px} cy={py_v} r="4" fill={vColor} style={blend} />

                {/* Horizontal Projection (y) */}
                <circle
                    cx={px}
                    cy={py_h}
                    r="4"
                    fill={on ? 'none' : horizontalFill}
                    stroke={hColor}
                    strokeWidth="2"
                    style={blend}
                />

                {/* Connection Line */}
                <line x1={px} y1={py_v} x2={px} y2={py_h} stroke={on ? '#94a3b8' : element.color} strokeWidth="1" strokeDasharray="4 4" opacity={on ? 0.35 : 0.5} />
            </g>

            {/* Text labels (hidden - rendered in merged layer in DiedricoView) */}
            <g className="text-labels" data-element-id={element.id} style={{ display: 'none' }}>
                <text x={px + 5} y={py_v - 5} fontSize="12" fill={element.color}>{element.name}''</text>
                <text x={px + 5} y={py_h + 15} fontSize="12" fill={element.color}>{element.name}'</text>
            </g>
        </>
    );
}
