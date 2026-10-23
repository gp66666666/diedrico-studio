import type { PolygonElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';
import { useProjectionColors } from '../../lib/projectionColors';

const SCALE = 40;

/**
 * Polígono en diédrico (sección de un sólido).
 * Se dibuja en las dos proyecciones: planta (x, y) y alzado (x, z).
 */
export default function Polygon2D({
    element,
    isDark,
    onClick,
}: {
    element: PolygonElement;
    isDark: boolean;
    onClick?: (e: React.MouseEvent) => void;
}) {
    const { selectedElementId } = useGeometryStore();
    const isSelected = selectedElementId === element.id;
    const base = isSelected ? '#3b82f6' : element.color || (isDark ? '#e2e8f0' : '#1e293b');
    const { on, h, v, blend } = useProjectionColors(base);
    const stroke = on ? h : base;

    const horizontal = element.points.map((p) => `${p.x * SCALE},${p.y * SCALE}`).join(' ');
    const vertical = element.points.map((p) => `${p.x * SCALE},${-p.z * SCALE}`).join(' ');

    return (
        <g onClick={onClick} className="cursor-pointer">
            {element.role !== 'shadow-v' && (
                <polygon
                    points={horizontal}
                    fill={stroke}
                    fillOpacity={element.role === 'shadow-h' ? 0.35 : 0.22}
                    stroke={stroke}
                    strokeWidth={isSelected ? 2.5 : 1.8}
                    strokeLinejoin="round"
                    style={blend}
                />
            )}
            {element.role !== 'shadow-h' && (
                <polygon
                    points={vertical}
                    fill={on ? v : stroke}
                    fillOpacity={element.role === 'shadow-v' ? 0.35 : 0.22}
                    stroke={on ? v : stroke}
                    strokeWidth={isSelected ? 2.5 : 1.8}
                    strokeLinejoin="round"
                    style={blend}
                />
            )}
            {element.points.map((p, i) => (
                <g key={i}>
                    {element.role !== 'shadow-v' && <circle cx={p.x * SCALE} cy={p.y * SCALE} r={2.5} fill={stroke} style={blend} />}
                    {element.role !== 'shadow-h' && <circle cx={p.x * SCALE} cy={-p.z * SCALE} r={2.5} fill={on ? v : stroke} style={blend} />}
                </g>
            ))}
        </g>
    );
}
