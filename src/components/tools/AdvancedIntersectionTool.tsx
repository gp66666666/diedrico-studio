import { useEffect } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import {
    intersectThreePlanes,
    intersectThreeLines,
    intersectTwoPlanesOneLine,
    intersectTwoLinesOnePlane
} from '../../utils/mathUtils';
import type { LineElement, PlaneElement } from '../../types';

export default function AdvancedIntersectionTool() {
    const activeTool = useGeometryStore(state => state.activeTool);
    const elements = useGeometryStore(state => state.elements);
    const selectedForDistance = useGeometryStore(state => state.selectedForDistance);
    const addElement = useGeometryStore(state => state.addElement);
    const setActiveTool = useGeometryStore(state => state.setActiveTool);
    const clearDistanceTool = useGeometryStore(state => state.clearDistanceTool);

    console.log('[AdvancedIntersectionTool] RENDER - activeTool:', activeTool, 'selected:', selectedForDistance.length);

    useEffect(() => {
        console.log('[AdvancedIntersectionTool] useEffect START');
        console.log('[AdvancedIntersectionTool] activeTool:', activeTool);
        console.log('[AdvancedIntersectionTool] selectedForDistance:', selectedForDistance);

        if (!activeTool || !activeTool.startsWith('advanced-intersection')) {
            console.log('[AdvancedIntersectionTool] Not an advanced intersection tool');
            return;
        }

        if (selectedForDistance.length !== 3) {
            console.log('[AdvancedIntersectionTool] Need 3 elements, have:', selectedForDistance.length);
            return;
        }

        console.log('[AdvancedIntersectionTool] PROCEEDING WITH CALCULATION');

        const el1 = elements.find(e => e.id === selectedForDistance[0]);
        const el2 = elements.find(e => e.id === selectedForDistance[1]);
        const el3 = elements.find(e => e.id === selectedForDistance[2]);

        console.log('[AdvancedIntersectionTool] el1:', el1);
        console.log('[AdvancedIntersectionTool] el2:', el2);
        console.log('[AdvancedIntersectionTool] el3:', el3);

        if (!el1 || !el2 || !el3) {
            console.error('[AdvancedIntersectionTool] Elements not found!');
            return;
        }

        try {
            console.log('[AdvancedIntersectionTool] Switch on:', activeTool);

            if (activeTool === 'advanced-intersection-3-planes') {
                console.log('[AdvancedIntersectionTool] 3 PLANES case');

                if (el1.type === 'plane' && el2.type === 'plane' && el3.type === 'plane') {
                    const plane1 = el1 as PlaneElement;
                    const plane2 = el2 as PlaneElement;
                    const plane3 = el3 as PlaneElement;

                    const result = intersectThreePlanes(
                        plane1.normal, plane1.constant,
                        plane2.normal, plane2.constant,
                        plane3.normal, plane3.constant
                    );

                    console.log('[AdvancedIntersectionTool] Result:', result);

                    if (result.type === 'point') {
                        addElement({
                            type: 'point',
                            name: `Intersección ${el1.name}∩${el2.name}∩${el3.name}`,
                            coords: result.point,
                            color: '#ff0000'
                        } as any);
                        console.log('[AdvancedIntersectionTool] ✅ SUCCESS - Point created');
                        clearDistanceTool();
                        setActiveTool('none');
                    } else if (result.type === 'line') {
                        // Infinite solutions - create one point on the line
                        addElement({
                            type: 'point',
                            name: `${el1.name}∩${el2.name}∩${el3.name} (una solución)`,
                            coords: result.point,
                            color: '#ff9900'
                        } as any);
                        alert('⚠️ Mostrando una de las infinitas posibles soluciones');
                        console.log('[AdvancedIntersectionTool] ⚠️ INFINITE solutions - showing one');
                        clearDistanceTool();
                        setActiveTool('none');
                    } else {
                        alert('Los 3 planos no se intersectan en un punto común');
                        clearDistanceTool();
                        setActiveTool('none');
                    }
                } else {
                    alert('Selecciona 3 planos');
                    clearDistanceTool();
                    setActiveTool('none');
                }
            }
            else if (activeTool === 'advanced-intersection-3-lines') {
                console.log('[AdvancedIntersectionTool] 3 LINES case');

                if (el1.type === 'line' && el2.type === 'line' && el3.type === 'line') {
                    const line1 = el1 as LineElement;
                    const line2 = el2 as LineElement;
                    const line3 = el3 as LineElement;

                    const point = intersectThreeLines(
                        line1.point, line1.direction,
                        line2.point, line2.direction,
                        line3.point, line3.direction
                    );

                    console.log('[AdvancedIntersectionTool] Result:', point);

                    if (point) {
                        addElement({
                            type: 'point',
                            name: `Intersección ${el1.name}∩${el2.name}∩${el3.name}`,
                            coords: point,
                            color: '#ff0000'
                        } as any);
                        console.log('[AdvancedIntersectionTool] ✅ SUCCESS - Point created');
                        clearDistanceTool();
                        setActiveTool('none');
                    } else {
                        alert('Las 3 rectas no se intersectan en un punto común');
                        clearDistanceTool();
                        setActiveTool('none');
                    }
                } else {
                    alert('Selecciona 3 rectas');
                    clearDistanceTool();
                    setActiveTool('none');
                }
            }
            else if (activeTool === 'advanced-intersection-2planes-1line') {
                console.log('[AdvancedIntersectionTool] 2 PLANES + 1 LINE case');

                const planes = [el1, el2, el3].filter(e => e.type === 'plane') as PlaneElement[];
                const lines = [el1, el2, el3].filter(e => e.type === 'line') as LineElement[];

                if (planes.length === 2 && lines.length === 1) {
                    const point = intersectTwoPlanesOneLine(
                        planes[0].normal, planes[0].constant,
                        planes[1].normal, planes[1].constant,
                        lines[0].point, lines[0].direction
                    );

                    console.log('[AdvancedIntersectionTool] Result:', point);

                    if (point) {
                        addElement({
                            type: 'point',
                            name: `Intersección ${planes[0].name}∩${planes[1].name}∩${lines[0].name}`,
                            coords: point,
                            color: '#ff0000'
                        } as any);
                        console.log('[AdvancedIntersectionTool] ✅ SUCCESS - Point created');
                        clearDistanceTool();
                        setActiveTool('none');
                    } else {
                        alert('No hay intersección común');
                        clearDistanceTool();
                        setActiveTool('none');
                    }
                } else {
                    alert('Selecciona 2 planos y 1 recta');
                    clearDistanceTool();
                    setActiveTool('none');
                }
            }
            else if (activeTool === 'advanced-intersection-2lines-1plane') {
                console.log('[AdvancedIntersectionTool] 2 LINES + 1 PLANE case');

                const lines = [el1, el2, el3].filter(e => e.type === 'line') as LineElement[];
                const planes = [el1, el2, el3].filter(e => e.type === 'plane') as PlaneElement[];

                if (lines.length === 2 && planes.length === 1) {
                    const result = intersectTwoLinesOnePlane(
                        lines[0].point, lines[0].direction,
                        lines[1].point, lines[1].direction,
                        planes[0].normal, planes[0].constant
                    );

                    console.log('[AdvancedIntersectionTool] Result:', result);

                    let createdCount = 0;

                    if (result.point1) {
                        addElement({
                            type: 'point',
                            name: `${lines[0].name}∩${planes[0].name}`,
                            coords: result.point1,
                            color: '#ff0000'
                        } as any);
                        createdCount++;
                    }

                    if (result.point2) {
                        addElement({
                            type: 'point',
                            name: `${lines[1].name}∩${planes[0].name}`,
                            coords: result.point2,
                            color: '#ff0000'
                        } as any);
                        createdCount++;
                    }

                    if (createdCount > 0) {
                        console.log(`[AdvancedIntersectionTool] ✅ SUCCESS - Created ${createdCount} point(s)`);
                        clearDistanceTool();
                        setActiveTool('none');
                    } else {
                        alert('Ninguna recta intersecta el plano');
                        clearDistanceTool();
                        setActiveTool('none');
                    }
                } else {
                    alert('Selecciona 2 rectas y 1 plano');
                    clearDistanceTool();
                    setActiveTool('none');
                }
            }
        } catch (error) {
            console.error('[AdvancedIntersectionTool] ❌ ERROR:', error);
            alert('Error al calcular la intersección: ' + error);
            clearDistanceTool();
            setActiveTool('none');
        }
    }, [selectedForDistance.length, activeTool]);

    return null;
}
