import { useMemo } from 'react';
import type { SolidElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';
import { buildSolidMesh, getProjectedEdges } from '../../lib/solidGeometry';

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
    const strokeColor = isSelected ? '#3b82f6' : (color || (isDark ? '#e2e8f0' : '#1e293b'));
    const strokeWidth = isSelected ? 3 : 1.5;

    // Misma malla que el 3D (lib/solidGeometry): proyección coherente por construcción
    const edges = useMemo(() => {
        const mesh = buildSolidMesh(subtype, size);
        return getProjectedEdges(mesh, rotation);
    }, [subtype, size.x, size.y, size.z, rotation?.x, rotation?.y, rotation?.z]);

    const project = (p: { x: number; y: number; z: number }) => ({
        h: { x: (position.x + p.x) * SCALE, y: (position.y + p.y) * SCALE },
        v: { x: (position.x + p.x) * SCALE, y: -(position.z + p.z) * SCALE },
    });

    const center = project({ x: 0, y: 0, z: 0 });

    return (
        <g onClick={onClick} className="cursor-pointer hover:opacity-80">
            {edges.map((edge, idx) => {
                const p1 = project(edge.a);
                const p2 = project(edge.b);

                return (
                    <g key={idx}>
                        <line
                            x1={p1.h.x} y1={p1.h.y} x2={p2.h.x} y2={p2.h.y}
                            stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round"
                            strokeDasharray={edge.hiddenH ? '3 3' : 'none'}
                            opacity={edge.hiddenH ? 0.6 : 1}
                        />
                        <line
                            x1={p1.v.x} y1={p1.v.y} x2={p2.v.x} y2={p2.v.y}
                            stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round"
                            strokeDasharray={edge.hiddenV ? '3 3' : 'none'}
                            opacity={edge.hiddenV ? 0.6 : 1}
                        />
                    </g>
                );
            })}
            <text x={center.h.x + 15} y={center.h.y} fontSize="10" fill={strokeColor} className="select-none font-bold italic">{name}'</text>
            <text x={center.v.x + 15} y={center.v.y} fontSize="10" fill={strokeColor} className="select-none font-bold italic">{name}''</text>
            <line x1={center.h.x} y1={center.h.y} x2={center.v.x} y2={center.v.y} stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
        </g>
    );
}
