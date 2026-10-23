import { useMemo } from 'react';
import type { SolidElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';
import { buildSolidMesh, getProjectedEdges } from '../../lib/solidGeometry';
import { useProjectionColors } from '../../lib/projectionColors';

interface Solid2DProps {
    element: SolidElement;
    isDark: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

const SCALE = 40;

export default function Solid2D({ element, isDark, onClick }: Solid2DProps) {
    const { selectedElementId } = useGeometryStore();
    const { id, subtype, position, size, color, rotation, name } = element;
    const isSelected = selectedElementId === id;
    const baseColor = isSelected ? '#3b82f6' : (color || (isDark ? '#e2e8f0' : '#1e293b'));
    const { on, h: hColor, v: vColor, blend } = useProjectionColors(baseColor);
    const strokeWidth = isSelected ? 3 : 1.5;

    // Misma malla que el 3D (lib/solidGeometry): proyección coherente por construcción
    const edges = useMemo(() => {
        const mesh = buildSolidMesh(subtype, size, element.custom);
        return getProjectedEdges(mesh, rotation);
    }, [subtype, size.x, size.y, size.z, element.custom, rotation?.x, rotation?.y, rotation?.z]);

    const project = (p: { x: number; y: number; z: number }) => ({
        h: { x: (position.x + p.x) * SCALE, y: (position.y + p.y) * SCALE },
        v: { x: (position.x + p.x) * SCALE, y: -(position.z + p.z) * SCALE },
    });

    const center = project({ x: 0, y: 0, z: 0 });

    return (
        <g onClick={onClick} data-solid-id={id} className="cursor-move hover:opacity-80">
            <title>{name}: arrastra para mover (planta: X/Y · alzado: X/Z)</title>
            {edges.map((edge, idx) => {
                const p1 = project(edge.a);
                const p2 = project(edge.b);

                return (
                    <g key={idx}>
                        <line
                            x1={p1.h.x} y1={p1.h.y} x2={p2.h.x} y2={p2.h.y}
                            stroke={hColor} strokeWidth={strokeWidth} strokeLinecap="round"
                            strokeDasharray={edge.hiddenH ? '3 3' : 'none'}
                            opacity={edge.hiddenH ? 0.6 : 1}
                            style={blend}
                        />
                        <line
                            x1={p1.v.x} y1={p1.v.y} x2={p2.v.x} y2={p2.v.y}
                            stroke={vColor} strokeWidth={strokeWidth} strokeLinecap="round"
                            strokeDasharray={edge.hiddenV ? '3 3' : 'none'}
                            opacity={edge.hiddenV ? 0.6 : 1}
                            style={blend}
                        />
                    </g>
                );
            })}
            <text x={center.h.x + 15} y={center.h.y} fontSize="10" fill={hColor} className="select-none font-bold italic">{name}'</text>
            <text x={center.v.x + 15} y={center.v.y} fontSize="10" fill={vColor} className="select-none font-bold italic">{name}''</text>
            <line x1={center.h.x} y1={center.h.y} x2={center.v.x} y2={center.v.y} stroke={on ? '#94a3b8' : baseColor} strokeWidth="0.5" strokeDasharray="2 2" opacity={on ? 0.25 : 0.3} />
        </g>
    );
}
