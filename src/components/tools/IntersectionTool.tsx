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

    useEffect(() => {
        console.log('[IntersectionTool] useEffect triggered');
        console.log('[IntersectionTool] activeTool:', activeTool);
        console.log('[IntersectionTool] selectedForDistance:', selectedForDistance);
        console.log('[IntersectionTool] selectedForDistance.length:', selectedForDistance.length);

        if (!activeTool || !activeTool.startsWith('intersection')) {
            console.log('[IntersectionTool] No intersection tool active');
            return;
        }

        if (selectedForDistance.length !== 2) {
            console.log('[IntersectionTool] Need 2 elements, have:', selectedForDistance.length);
            return;
        }

        const el1 = elements.find(e => e.id === selectedForDistance[0]);
        const el2 = elements.find(e => e.id === selectedForDistance[1]);

        console.log('[IntersectionTool] Element 1:', el1);
        console.log('[IntersectionTool] Element 2:', el2);

        if (!el1 || !el2) {
            console.log('[IntersectionTool] Could not find one or both elements');
            return;
        }

        console.log('[IntersectionTool] Processing:', activeTool);

        try {
            switch (activeTool) {
                case 'intersection-line-line':
                    console.log('[IntersectionTool] Line-line case');
                    if (el1.type === 'line' && el2.type === 'line') {
                        const line1 = el1 as LineElement;
                        const line2 = el2 as LineElement;

                        const point = intersectLineLine(
                            line1.point,
                            line1.direction,
                            line2.point,
                            line2.direction
                        );

                        console.log('[IntersectionTool] Intersection point:', point);

                        if (point) {
                            const newElement = {
                                type: 'point',
                                name: `Intersección de ${el1.name} con ${el2.name}`,
                                x: point.x,
                                y: point.y,
                                z: point.z,
                                color: '#ff0000'
                            };
                            console.log('[IntersectionTool] Creating element:', newElement);
                            addElement(newElement as any);
                            clearDistanceTool();
                            setActiveTool('none');
                            console.log('[IntersectionTool] SUCCESS: Element created');
                        } else {
                            console.log('[IntersectionTool] No intersection found');
                            alert('Las rectas no se intersectan (son paralelas o se cruzan)');
                            clearDistanceTool();
                            setActiveTool('none');
                        }
                    } else {
                        alert('Selecciona dos rectas');
                        clearDistanceTool();
                        setActiveTool('none');
                    }
                    break;

                case 'intersection-line-plane':
                    console.log('[IntersectionTool] Line-plane case');
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

                        console.log('[IntersectionTool] Intersection point:', point);

                        if (point) {
                            const newElement = {
                                type: 'point',
                                name: `Intersección de ${line.name} con ${plane.name}`,
                                x: point.x,
                                y: point.y,
                                z: point.z,
                                color: '#ff0000'
                            };
                            console.log('[IntersectionTool] Creating element:', newElement);
                            addElement(newElement as any);
                            clearDistanceTool();
                            setActiveTool('none');
                            console.log('[IntersectionTool] SUCCESS: Element created');
                        } else {
                            console.log('[IntersectionTool] No intersection found');
                            alert('La recta es paralela al plano');
                            clearDistanceTool();
                            setActiveTool('none');
                        }
                    } else {
                        alert('Selecciona una recta y un plano');
                        clearDistanceTool();
                        setActiveTool('none');
                    }
                    break;

                case 'intersection-plane-plane':
                    console.log('[IntersectionTool] Plane-plane case');
                    if (el1.type === 'plane' && el2.type === 'plane') {
                        const plane1 = el1 as PlaneElement;
                        const plane2 = el2 as PlaneElement;

                        const intersection = intersectPlanePlane(
                            plane1.normal,
                            plane1.constant,
                            plane2.normal,
                            plane2.constant
                        );

                        console.log('[IntersectionTool] Intersection result:', intersection);

                        if (intersection) {
                            const p2 = {
                                x: intersection.point.x + intersection.direction.x,
                                y: intersection.point.y + intersection.direction.y,
                                z: intersection.point.z + intersection.direction.z
                            };

                            const newElement = {
                                type: 'line',
                                name: `Intersección de ${el1.name} con ${el2.name}`,
                                point: intersection.point,
                                p2: p2,
                                direction: intersection.direction,
                                color: '#9b59b6'
                            };
                            console.log('[IntersectionTool] Creating line element:', newElement);
                            addElement(newElement as any);
                            clearDistanceTool();
                            setActiveTool('none');
                            console.log('[IntersectionTool] SUCCESS: Element created');
                        } else {
                            console.log('[IntersectionTool] No intersection found');
                            alert('Los planos son paralelos');
                            clearDistanceTool();
                            setActiveTool('none');
                        }
                    } else {
                        alert('Selecciona dos planos');
                        clearDistanceTool();
                        setActiveTool('none');
                    }
                    break;
            }
        } catch (error) {
            console.error('[IntersectionTool] Error:', error);
            alert('Error al calcular la intersección: ' + error);
            clearDistanceTool();
            setActiveTool('none');
        }
    }, [selectedForDistance, activeTool]);

    return null;
}
