import { useEffect } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { PointElement } from '../../types';
import { toast } from '../../lib/toast';
import { planeFromThreePoints } from '../../lib/planeMath';

export default function PlaneCreatorTool() {
    const { activeTool, elements, addElement, setActiveTool, selectedForDistance, clearDistanceTool } = useGeometryStore();

    useEffect(() => {
        if (activeTool !== 'plane-3-points') return;

        if (selectedForDistance.length === 3) {
            const pts = selectedForDistance.map(id => elements.find(e => e.id === id)).filter(e => e?.type === 'point') as PointElement[];

            if (pts.length === 3) {
                const equation = planeFromThreePoints(pts[0].coords, pts[1].coords, pts[2].coords);

                if (!equation) {
                    toast('Los puntos son colineales. No definen un plano.');
                    setActiveTool('none');
                    clearDistanceTool();
                    return;
                }

                addElement({
                    type: 'plane',
                    name: `Plano (${pts[0].name}, ${pts[1].name}, ${pts[2].name})`,
                    normal: equation.normal,
                    constant: equation.constant,
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
