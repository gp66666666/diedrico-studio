import { useEffect, useRef } from 'react';
import { useGeometryStore } from '../../store/geometryStore';

export default function AbatimientoTool() {
    const { activeTool, elements, addElement, setActiveTool } = useGeometryStore();
    const hasExecuted = useRef(false);

    useEffect(() => {
        if (!activeTool || !activeTool.startsWith('abatir')) return;
        if (hasExecuted.current) return;

        hasExecuted.current = true;

        // Execute Flatten All Logic
        executeFlattenAll();

    }, [activeTool]);

    const executeFlattenAll = () => {
        const planes = elements.filter(el => el.type === 'plane');

        if (planes.length === 0) {
            alert('No hay planos definidos para realizar abatimientos.');
            setActiveTool('none');
            return;
        }

        const mode = activeTool === 'abatir-ph' ? 'ph' : 'pv';
        let totalCount = 0;

        // Helper to flatten a single point
        const flattenPoint = (p: { x: number, y: number, z: number }, plane: any, mode: 'ph' | 'pv') => {
            let traceLine = null;

            // Ensure intercepts are numbers
            const x_int = Number(plane.x_intercept);
            const y_int = Number(plane.y_intercept);
            const z_int = Number(plane.z_intercept);

            if (mode === 'ph') {
                // Horizontal trace (z=0)
                if (!x_int || !y_int) return null;
                traceLine = {
                    A: y_int,
                    B: x_int,
                    C: -1 * x_int * y_int
                };
            } else {
                // Vertical trace (assume PV is XZ plane, y=0)
                if (!x_int || !z_int) return null;
                traceLine = {
                    A: z_int, // Coeff for X
                    B: x_int, // Coeff for Z
                    C: -1 * x_int * z_int
                };
            }

            const u = mode === 'ph' ? p.x : p.x;
            const v = mode === 'ph' ? p.y : p.z;
            const height = mode === 'ph' ? p.z : p.y;

            // Distance from projected point (u, v) to trace
            const dist = Math.abs(traceLine.A * u + traceLine.B * v + traceLine.C) / Math.sqrt(traceLine.A ** 2 + traceLine.B ** 2);

            // Radius R
            const R = Math.sqrt(dist ** 2 + height ** 2);

            // Foot of perpendicular (O)
            const t = -1 * (traceLine.A * u + traceLine.B * v + traceLine.C) / (traceLine.A ** 2 + traceLine.B ** 2);
            const Ou = u + t * traceLine.A;
            const Ov = v + t * traceLine.B;

            // Flattened point coords (u', v')
            // We assume flattening "outwards" (away from trace relative to projection?)
            // Or just R distance.
            // My previous logic: Ou + (u - Ou) * ratio
            // This places (P) on the same ray as P1 from O.
            // This is correct if P1 is "inside" and we flatten "out".

            const ratio = dist > 0.001 ? R / dist : 1;
            const flat_u = Ou + (u - Ou) * ratio;
            const flat_v = Ov + (v - Ov) * ratio;

            const flatPoint = mode === 'ph'
                ? { x: flat_u, y: flat_v, z: 0 }
                : { x: flat_u, y: 0, z: flat_v };

            const OPoint = mode === 'ph'
                ? { x: Ou, y: Ov, z: 0 }
                : { x: Ou, y: 0, z: Ov };

            const P1Point = mode === 'ph'
                ? { x: u, y: v, z: 0 }
                : { x: u, y: 0, z: v };

            return { flatPoint, OPoint, P1Point };
        };

        // Iterate ALL planes
        planes.forEach(plane => {
            // Iterate ALL elements for this plane
            elements.forEach(el => {
                // Skip the plane itself and already flattened elements
                if (el.id === plane.id || el.name.startsWith('(') || el.name.startsWith('proc_')) return;

                if (el.type === 'point') {
                    const p = { x: Number((el as any).x) || 0, y: Number((el as any).y) || 0, z: Number((el as any).z) || 0 };
                    const result = flattenPoint(p, plane, mode);

                    if (result) {
                        const { flatPoint, OPoint, P1Point } = result;

                        // Add flattened point
                        addElement({
                            type: 'point',
                            name: `(${el.name})`, // Name relative to plane? Maybe (${el.name})_P1? For now simple.
                            x: flatPoint.x,
                            y: flatPoint.y,
                            z: flatPoint.z,
                            color: '#666666',
                            visible: true
                        } as any);

                        // Construction lines
                        addElement({
                            type: 'line',
                            name: `proc_${el.name}_1`,
                            color: '#cccccc',
                            point: P1Point,
                            p2: OPoint,
                            direction: { x: OPoint.x - P1Point.x, y: OPoint.y - P1Point.y, z: OPoint.z - P1Point.z },
                            visible: true
                        } as any);

                        addElement({
                            type: 'line',
                            name: `proc_${el.name}_2`,
                            color: '#cccccc',
                            point: OPoint,
                            p2: flatPoint,
                            direction: { x: flatPoint.x - OPoint.x, y: flatPoint.y - OPoint.y, z: flatPoint.z - OPoint.z },
                            visible: true
                        } as any);

                        totalCount++;
                    }
                } else if (el.type === 'line') {
                    const p1 = (el as any).point;
                    const p2 = (el as any).p2;

                    if (p1 && p2) {
                        const res1 = flattenPoint(p1, plane, mode);
                        const res2 = flattenPoint(p2, plane, mode);

                        if (res1 && res2) {
                            const dir = {
                                x: res2.flatPoint.x - res1.flatPoint.x,
                                y: res2.flatPoint.y - res1.flatPoint.y,
                                z: res2.flatPoint.z - res1.flatPoint.z
                            };

                            addElement({
                                type: 'line',
                                name: `(${el.name})`,
                                color: '#666666',
                                point: res1.flatPoint,
                                p2: res2.flatPoint,
                                direction: dir,
                                visible: true
                            } as any);

                            // Add construction lines for endpoints
                            [res1, res2].forEach((res, idx) => {
                                const suffix = idx === 0 ? 'A' : 'B';
                                addElement({
                                    type: 'line',
                                    name: `proc_${el.name}_${suffix}1`,
                                    color: '#cccccc',
                                    point: res.P1Point,
                                    p2: res.OPoint,
                                    direction: { x: res.OPoint.x - res.P1Point.x, y: res.OPoint.y - res.P1Point.y, z: res.OPoint.z - res.P1Point.z },
                                    visible: true
                                } as any);
                                addElement({
                                    type: 'line',
                                    name: `proc_${el.name}_${suffix}2`,
                                    color: '#cccccc',
                                    point: res.OPoint,
                                    p2: res.flatPoint,
                                    direction: { x: res.flatPoint.x - res.OPoint.x, y: res.flatPoint.y - res.OPoint.y, z: res.flatPoint.z - res.OPoint.z },
                                    visible: true
                                } as any);
                            });

                            totalCount++;
                        }
                    }
                }
            });
        });

        if (totalCount > 0) {
            // Optional: alert or toast
            // alert(`Abatimiento completado: ${totalCount} elementos generados.`);
        } else {
            alert('No se pudieron abatir elementos. Verifica que existan planos con trazas y puntos/rectas.');
        }

        // Reset tool immediately
        setActiveTool('none');
    };

    // Render nothing or a loading state
    return null;
}
