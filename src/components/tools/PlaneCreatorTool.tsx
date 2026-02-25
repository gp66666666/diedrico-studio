import { useEffect } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { PointElement } from '../../types';

export default function PlaneCreatorTool() {
    const { activeTool, elements, addElement, setActiveTool, selectedForDistance, clearDistanceTool } = useGeometryStore();

    useEffect(() => {
        if (activeTool !== 'plane-3-points') return;

        if (selectedForDistance.length === 3) {
            const pts = selectedForDistance.map(id => elements.find(e => e.id === id)).filter(e => e?.type === 'point') as PointElement[];

            if (pts.length === 3) {
                const p1 = pts[0].coords;
                const p2 = pts[1].coords;
                const p3 = pts[2].coords;

                // Vectors
                const v1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
                const v2 = { x: p3.x - p1.x, y: p3.y - p1.y, z: p3.z - p1.z };

                // Cross product for normal
                const normal = {
                    x: v1.y * v2.z - v1.z * v2.y,
                    y: v1.z * v2.x - v1.x * v2.z,
                    z: v1.x * v2.y - v1.y * v2.x
                };

                // Check if pins are collinear
                const mag = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
                if (mag < 1e-6) {
                    alert('Los puntos son colineales. No definen un plano.');
                    setActiveTool('none');
                    clearDistanceTool();
                    return;
                }

                // Plane constant: Ax + By + Cz + D = 0 → D = -(n·p1)
                const constant = -(normal.x * p1.x + normal.y * p1.y + normal.z * p1.z);

                addElement({
                    type: 'plane',
                    name: `Plano (${pts[0].name}, ${pts[1].name}, ${pts[2].name})`,
                    normal,
                    constant,
                    color: '#22c55e',
                    visible: true
                } as any);

                setActiveTool('none');
                clearDistanceTool();
            }
        }
    }, [activeTool, selectedForDistance, elements, addElement, setActiveTool, clearDistanceTool]);

    return null;
}
