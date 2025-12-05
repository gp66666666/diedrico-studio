import { useEffect } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { intersectLineLine, intersectLinePlane, intersectPlanePlane } from '../../utils/mathUtils';
import type { LineElement, PlaneElement } from '../../types';

export default function IntersectionTool() {
    const activeTool = useGeometryStore(state => state.activeTool);
    const elements = useGeometryStore(state => state.elements);
    const selectedForDistance = useGeometryStore(state => state.selectedForDistance);
    const addElement = useGeometryStore(state => state.addElement);
    const setActiveTool = useGeometryStore(state => state.setActiveTool);
    const clearDistanceTool = useGeometryStore(state => state.clearDistanceTool);

    console.log('[IntersectionTool] RENDER - activeTool:', activeTool, 'selected:', selectedForDistance.length);

    useEffect(() => {
        console.log('[IntersectionTool] useEffect START');
        console.log('[IntersectionTool] activeTool:', activeTool);
        console.log('[IntersectionTool] selectedForDistance:', selectedForDistance);

        if (!activeTool || !activeTool.startsWith('intersection')) {
            console.log('[IntersectionTool] Not an intersection tool, returning');
            return;
        }

        if (selectedForDistance.length !== 2) {
            console.log('[IntersectionTool] Need 2 elements, have:', selectedForDistance.length);
            return;
        }

        console.log('[IntersectionTool] PROCEEDING WITH CALCULATION');

        const el1 = elements.find(e => e.id === selectedForDistance[0]);
        const el2 = elements.find(e => e.id === selectedForDistance[1]);

        console.log('[IntersectionTool] el1:', el1);
        console.log('[IntersectionTool] el2:', el2);

        if (!el1 || !el2) {
            console.error('[IntersectionTool] Elements not found!');
            return;
        }

        try {
            console.log('[IntersectionTool] Switch on:', activeTool);

            if (activeTool === 'intersection-line-line') {
                console.log('[IntersectionTool] LINE-LINE case');
                if (el1.type === 'line' && el2.type === 'line') {
                    const line1 = el1 as LineElement;
                    const line2 = el2 as LineElement;

                    const point = intersectLineLine(
                        line1.point,
                        line1.direction,
                        line2.point,
                        line2.direction
                    );

                    console.log('[IntersectionTool] Result:', point);

                    if (point) {
                        addElement({
                            type: 'point',
                            name: `Intersección de ${el1.name} con ${el2.name}`,
                            coords: point,
                            color: '#ff0000'
                        } as any);
                        console.log('[IntersectionTool] ✅ SUCCESS - Element added');
                        clearDistanceTool();
                        setActiveTool('none');
                    } else {
                        alert('Las rectas no se intersectan');
                        clearDistanceTool();
                        setActiveTool('none');
                    }
                }
            } else if (activeTool === 'intersection-line-plane') {
                console.log('[IntersectionTool] LINE-PLANE case');
                const line = el1.type === 'line' ? el1 : el2;
                const plane = el1.type === 'plane' ? el1 : el2;

                if (line.type === 'line' && plane.type === 'plane') {
                    const lineEl = line as LineElement;
                    const planeEl = plane as PlaneElement;

                    const point = intersectLinePlane(
                        lineEl.point,
                        lineEl.direction,
                        planeEl.normal,
                        planeEl.constant
                    );

                    console.log('[IntersectionTool] Result:', point);

                    if (point) {
                        addElement({
                            type: 'point',
                            name: `Intersección de ${line.name} con ${plane.name}`,
                            coords: point,
                            color: '#ff0000'
                        } as any);
                        console.log('[IntersectionTool] ✅ SUCCESS - Element added');
                        clearDistanceTool();
                        setActiveTool('none');
                    } else {
                        alert('La recta es paralela al plano');
                        clearDistanceTool();
                        setActiveTool('none');
                    }
                }
            } else if (activeTool === 'intersection-plane-plane') {
                console.log('[IntersectionTool] PLANE-PLANE case');
                if (el1.type === 'plane' && el2.type === 'plane') {
                    const plane1 = el1 as PlaneElement;
                    const plane2 = el2 as PlaneElement;

                    const intersection = intersectPlanePlane(
                        plane1.normal,
                        plane1.constant,
                        plane2.normal,
                        plane2.constant
                    );

                    console.log('[IntersectionTool] Result:', intersection);

                    if (intersection) {
                        const p2 = {
                            x: intersection.point.x + intersection.direction.x,
                            y: intersection.point.y + intersection.direction.y,
                            z: intersection.point.z + intersection.direction.z
                        };

                        addElement({
                            type: 'line',
                            name: `Intersección de ${el1.name} con ${el2.name}`,
                            point: intersection.point,
                            p2: p2,
                            direction: intersection.direction,
                            color: '#9b59b6'
                        } as any);
                        console.log('[IntersectionTool] ✅ SUCCESS - Line added');
                        clearDistanceTool();
                        setActiveTool('none');
                    } else {
                        alert('Los planos son paralelos');
                        clearDistanceTool();
                        setActiveTool('none');
                    }
                }
            }
        } catch (error) {
            console.error('[IntersectionTool] ❌ ERROR:', error);
            alert('Error: ' + error);
            clearDistanceTool();
            setActiveTool('none');
        }
    }, [selectedForDistance.length, activeTool]); // Simplified dependencies

    return null;
}
