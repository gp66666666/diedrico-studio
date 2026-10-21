import type { PolygonElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';

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
    const stroke = isSelected ? '#3b82f6' : element.color || (isDark ? '#e2e8f0' : '#1e293b');

    const horizontal = element.points.map((p) => `${p.x * SCALE},${p.y * SCALE}`).join(' ');
    const vertical = element.points.map((p) => `${p.x * SCALE},${-p.z * SCALE}`).join(' ');

    return (
        <g onClick={onClick} className="cursor-pointer">
            <polygon
                points={horizontal}
                fill={stroke}
                fillOpacity={0.22}
                stroke={stroke}
                strokeWidth={isSelected ? 2.5 : 1.8}
                strokeLinejoin="round"
            />
            <polygon
                points={vertical}
                fill={stroke}
                fillOpacity={0.22}
                stroke={stroke}
                strokeWidth={isSelected ? 2.5 : 1.8}
                strokeLinejoin="round"
            />
            {element.points.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x * SCALE} cy={p.y * SCALE} r={2.5} fill={stroke} />
                    <circle cx={p.x * SCALE} cy={-p.z * SCALE} r={2.5} fill={stroke} />
                </g>
            ))}
        </g>
    );
}
