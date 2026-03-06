import { useEffect, useRef } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { PointElement } from '../../types';

export default function SegmentTool() {
    const { activeTool, elements, addElement, setActiveTool, selectedForDistance, clearDistanceTool } = useGeometryStore();
    const hasExecuted = useRef(false);

    useEffect(() => {
        if (activeTool !== 'segment-2-points') {
            hasExecuted.current = false;
            return;
        }

        if (selectedForDistance.length === 2 && !hasExecuted.current) {
            const el1 = elements.find(e => e.id === selectedForDistance[0]);
            const el2 = elements.find(e => e.id === selectedForDistance[1]);

            if (el1?.type === 'point' && el2?.type === 'point') {
                hasExecuted.current = true;
                const p1 = (el1 as PointElement).coords;
                const p2 = (el2 as PointElement).coords;

                addElement({
                    type: 'segment',
                    name: `s(${el1.name}, ${el2.name})`,
                    p1,
                    p2,
                    color: '#10b981',
                    visible: true
                } as any);

                setActiveTool('none');
                clearDistanceTool();
            }
        }
    }, [activeTool, selectedForDistance, elements]);

    return null;
}
