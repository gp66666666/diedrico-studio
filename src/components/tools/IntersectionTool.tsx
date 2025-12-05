import { useEffect } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { intersectLineLine, intersectLinePlane, intersectPlanePlane } from '../../utils/mathUtils';
import type { LineElement, PlaneElement } from '../../types';

export default function IntersectionTool() {
    const { activeTool, elements, selectedForDistance, addElement, setActiveTool, clearDistanceTool } = useGeometryStore();

    useEffect(() => {
        if (!activeTool || !activeTool.startsWith('intersection')) return;

        // Need exactly 2 elements selected
        if (selectedForDistance.length !== 2) return;

        const el1 = elements.find(e => e.id === selectedForDistance[0]);
        const el2 = elements.find(e => e.id === selectedForDistance[1]);

        if (!el1 || !el2) return;

        try {
            switch (activeTool) {
                case 'intersection-line-line':
                    if (el1.type === 'line' && el2.type === 'line') {
                        const line1 = el1 as LineElement;
                        const line2 = el2 as LineElement;
                        const point = intersectLineLine(
                            line1.point,
                            line1.direction,
                            line2.point,
                            line2.direction
                        );

                        if (point) {
                            addElement({
                                type: 'point',
                                name: `Intersección de ${el1.name} con ${el2.name}`,
                                coords: point,
                                color: '#ff0000'
                            } as any);
                            clearDistanceTool();
                            setActiveTool('none');
                        } else {
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

                        if (point) {
                            addElement({
                                type: 'point',
                                name: `Intersección de ${line.name} con ${plane.name}`,
                                coords: point,
                                color: '#ff0000'
                            } as any);
                            clearDistanceTool();
                            setActiveTool('none');
                        } else {
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
                    if (el1.type === 'plane' && el2.type === 'plane') {
                        const plane1 = el1 as PlaneElement;
                        const plane2 = el2 as PlaneElement;
                        const intersection = intersectPlanePlane(
                            plane1.normal,
                            plane1.constant,
                            plane2.normal,
                            plane2.constant
                        );

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
                            clearDistanceTool();
                            setActiveTool('none');
                        } else {
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
            console.error('Error calculating intersection:', error);
            alert('Error al calcular la intersección');
            clearDistanceTool();
            setActiveTool('none');
        }
    }, [selectedForDistance, activeTool, elements, addElement, setActiveTool, clearDistanceTool]);

    return null;
}
