import type { MeshElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';

const SCALE = 40;

/**
 * Línea de intersección entre dos sólidos en diédrico.
 *
 * Se dibujan las aristas de contacto en planta (x, y) y en alzado (x, z).
 * Si un sólido está completamente dentro de otro no hay cruce de superficies y
 * se dibuja el contorno de la malla.
 */
export default function Mesh2D({
    element,
    isDark,
    onClick,
}: {
    element: MeshElement;
    isDark: boolean;
    onClick?: (e: React.MouseEvent) => void;
}) {
    const { selectedElementId } = useGeometryStore();
    const isSelected = selectedElementId === element.id;
    const stroke = isSelected ? '#3b82f6' : element.color || (isDark ? '#e2e8f0' : '#1e293b');

    const edges = element.seam.length
        ? element.seam
        : element.faces.flatMap((face) => face.map((v, i) => [v, face[(i + 1) % face.length]] as [number, number]));

    return (
        <g onClick={onClick} className="cursor-pointer">
            {edges.map(([i, j], k) => {
                const a = element.vertices[i];
                const b = element.vertices[j];
                if (!a || !b) return null;
                return (
                    <g key={k}>
                        <line
                            x1={a.x * SCALE}
                            y1={a.y * SCALE}
                            x2={b.x * SCALE}
                            y2={b.y * SCALE}
                            stroke={stroke}
                            strokeWidth={isSelected ? 3 : 2.2}
                            strokeLinecap="round"
                        />
                        <line
                            x1={a.x * SCALE}
                            y1={-a.z * SCALE}
                            x2={b.x * SCALE}
                            y2={-b.z * SCALE}
                            stroke={stroke}
                            strokeWidth={isSelected ? 3 : 2.2}
                            strokeLinecap="round"
                        />
                    </g>
                );
            })}
        </g>
    );
}
