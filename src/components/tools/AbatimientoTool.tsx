import { useEffect, useRef } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { PlaneElement } from '../../types';

export default function AbatimientoTool() {
    const { activeTool, elements, addElement, setActiveTool } = useGeometryStore();
    const hasExecuted = useRef(false);

    useEffect(() => {
        // Reset execution flag if tool is not active
        if (!activeTool || !activeTool.startsWith('abatir') && activeTool !== 'desabatir') {
            hasExecuted.current = false;
            return;
        }

        // Prevent double execution
        if (hasExecuted.current) {
            return;
        }

        console.log('AbatimientoTool: Activating...', activeTool);
        hasExecuted.current = true;

        // Execute appropriate logic
        setTimeout(() => {
            if (activeTool === 'desabatir') {
                executeDesabatir();
            } else {
                executeFlattenAll();
            }
        }, 100);

    }, [activeTool]);


    const executeDesabatir = () => {
        const { removeElement } = useGeometryStore.getState();

        // Get all elements to check
        const elementsToRemove = elements.filter(el => {
            // Remove flattened elements (names starting with parentheses)
            if (el.name.startsWith('(')) return true;
            // Remove Charnela lines
            if (el.name.startsWith('Charnela')) return true;
            // Remove any remaining construction lines
            if (el.name.startsWith('proc_')) return true;

            return false;
        });

        console.log(`Desabatir: Removing ${elementsToRemove.length} flattened elements.`);

        // Remove each element
        elementsToRemove.forEach(el => {
            removeElement(el.id);
        });

        if (elementsToRemove.length === 0) {
            alert('No hay elementos abatidos para desabatir.');
        }

        setActiveTool('none');
    };

    const executeFlattenAll = () => {
        const planes = elements.filter(el => el.type === 'plane') as PlaneElement[];

        if (planes.length === 0) {
            alert('No hay planos definidos para realizar abatimientos.');
            setActiveTool('none');
            return;
        }

        const mode = activeTool === 'abatir-ph' ? 'ph' : 'pv';
        let totalCount = 0;

        // Helper to flatten a single point
        const flattenPoint = (p: { x: number, y: number, z: number }, plane: PlaneElement, mode: 'ph' | 'pv') => {
            let traceLine = null;

            // Plane equation: Ax + By + Cz + D = 0
            const A = plane.normal.x;
            const B = plane.normal.y;
            const C_plane = plane.normal.z;
            const D = plane.constant;

            if (mode === 'ph') {
                // Horizontal trace (z=0): Ax + By + D = 0
                if (Math.abs(A) < 1e-6 && Math.abs(B) < 1e-6) {
                    console.warn(`AbatimientoTool: Plane ${plane.name} is parallel to PH. Cannot flatten on PH.`);
                    return null;
                }
                traceLine = { A: A, B: B, C: D };
            } else {
                // Vertical trace (y=0): Ax + Cz + D = 0
                if (Math.abs(A) < 1e-6 && Math.abs(C_plane) < 1e-6) {
                    console.warn(`AbatimientoTool: Plane ${plane.name} is parallel to PV. Cannot flatten on PV.`);
                    return null;
                }
                traceLine = { A: A, B: C_plane, C: D };
            }

            const u = mode === 'ph' ? p.x : p.x;
            const v = mode === 'ph' ? p.y : p.z;
            const height = mode === 'ph' ? p.z : p.y;

            // Distance from projected point (u, v) to trace
            const denom = Math.sqrt(traceLine.A ** 2 + traceLine.B ** 2);
            const dist = Math.abs(traceLine.A * u + traceLine.B * v + traceLine.C) / denom;

            // Radius R
            const R = Math.sqrt(dist ** 2 + height ** 2);

            // Foot of perpendicular (O)
            const val = traceLine.A * u + traceLine.B * v + traceLine.C;
            const normSq = traceLine.A ** 2 + traceLine.B ** 2;
            const Ou = u - traceLine.A * val / normSq;
            const Ov = v - traceLine.B * val / normSq;

            // Flattened point coords
            let dirU = u - Ou;
            let dirV = v - Ov;

            if (dist < 1e-6) {
                if (Math.abs(height) < 1e-6) {
                    dirU = 0;
                    dirV = 0;
                } else {
                    dirU = traceLine.A;
                    dirV = traceLine.B;
                }
            }

            const len = Math.sqrt(dirU ** 2 + dirV ** 2);
            let ndirU = 0, ndirV = 0;
            if (len > 1e-6) {
                ndirU = dirU / len;
                ndirV = dirV / len;
            }

            const flat_u = Ou + ndirU * R;
            const flat_v = Ov + ndirV * R;

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

        const flattenedPointsMap = new Map<string, { flat: { x: number, y: number, z: number }, O: { x: number, y: number, z: number }, P1: { x: number, y: number, z: number } }>();
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];
        let colorIndex = 0;

        planes.forEach(plane => {
            // 1. Create Charnela (Hinge)
            const A = plane.normal.x;
            const B = plane.normal.y;
            const C_plane = plane.normal.z;
            const D = plane.constant;

            let charnelaStart, charnelaEnd;
            let charnelaName = "Charnela";

            if (mode === 'ph') {
                charnelaName = "Charnela (Traza H)";
                if (Math.abs(B) > 1e-6) {
                    charnelaStart = { x: -10, y: (-D - A * -10) / B, z: 0 };
                    charnelaEnd = { x: 10, y: (-D - A * 10) / B, z: 0 };
                } else if (Math.abs(A) > 1e-6) {
                    charnelaStart = { x: -D / A, y: -10, z: 0 };
                    charnelaEnd = { x: -D / A, y: 10, z: 0 };
                }
            } else {
                charnelaName = "Charnela (Traza V)";
                if (Math.abs(C_plane) > 1e-6) {
                    charnelaStart = { x: -10, y: 0, z: (-D - A * -10) / C_plane };
                    charnelaEnd = { x: 10, y: 0, z: (-D - A * 10) / C_plane };
                } else if (Math.abs(A) > 1e-6) {
                    charnelaStart = { x: -D / A, y: 0, z: -10 };
                    charnelaEnd = { x: -D / A, y: 0, z: 10 };
                }
            }

            if (charnelaStart && charnelaEnd) {
                addElement({
                    type: 'line',
                    name: charnelaName,
                    color: '#FFA500',
                    point: charnelaStart,
                    p2: charnelaEnd,
                    direction: { x: charnelaEnd.x - charnelaStart.x, y: charnelaEnd.y - charnelaStart.y, z: charnelaEnd.z - charnelaStart.z },
                    visible: true,
                    dashed: true
                } as any);
            }

            // 2. Flattened Trace (Abatimiento del Plano)
            let flattenedTraceStart, flattenedTraceEnd;
            let flattenedTraceName = mode === 'ph' ? "(Traza V)" : "(Traza H)";

            // Vertex V (intersection of traces on LT)
            let V = null;
            if (Math.abs(A) > 1e-6) {
                V = { x: -D / A, y: 0, z: 0 };
            }

            // Pick a point M on the moving trace
            let M = null;
            if (mode === 'ph') {
                // Moving trace is Vertical Trace (y=0). Equation: Ax + Cz + D = 0.
                if (Math.abs(A) > 1e-6) {
                    // Pick z=10, calculate x
                    const zM = 10;
                    const xM = (-D - C_plane * zM) / A;
                    M = { x: xM, y: 0, z: zM };
                } else if (Math.abs(C_plane) > 1e-6) {
                    // A=0. z = -D/C. Horizontal line on PV.
                    M = { x: 0, y: 0, z: -D / C_plane };
                }
            } else {
                // Moving trace is Horizontal Trace (z=0). Equation: Ax + By + D = 0.
                if (Math.abs(A) > 1e-6) {
                    // Pick y=10, calculate x
                    const yM = 10;
                    const xM = (-D - B * yM) / A;
                    M = { x: xM, y: yM, z: 0 };
                } else if (Math.abs(B) > 1e-6) {
                    // A=0. y = -D/B. Horizontal line on PH.
                    M = { x: 0, y: -D / B, z: 0 };
                }
            }

            if (M) {
                const resM = flattenPoint(M, plane, mode);
                if (resM) {
                    const M_flat = resM.flatPoint;

                    if (V) {
                        // Line passing through V and M_flat
                        const dir = { x: M_flat.x - V.x, y: M_flat.y - V.y, z: M_flat.z - V.z };
                        const len = Math.sqrt(dir.x ** 2 + dir.y ** 2 + dir.z ** 2);
                        const ndir = { x: dir.x / len, y: dir.y / len, z: dir.z / len };

                        flattenedTraceStart = { x: V.x, y: V.y, z: V.z };
                        flattenedTraceEnd = { x: V.x + ndir.x * 20, y: V.y + ndir.y * 20, z: V.z + ndir.z * 20 };
                    } else {
                        // Parallel to LT
                        flattenedTraceStart = { x: M_flat.x - 10, y: M_flat.y, z: M_flat.z };
                        flattenedTraceEnd = { x: M_flat.x + 10, y: M_flat.y, z: M_flat.z };
                    }

                    addElement({
                        type: 'line',
                        name: flattenedTraceName,
                        color: '#FFA500',
                        point: flattenedTraceStart,
                        p2: flattenedTraceEnd,
                        direction: { x: flattenedTraceEnd.x - flattenedTraceStart.x, y: flattenedTraceEnd.y - flattenedTraceStart.y, z: flattenedTraceEnd.z - flattenedTraceStart.z },
                        visible: true,
                        dashed: false
                    } as any);
                }
            }

            elements.forEach(el => {
                if (el.id === plane.id || el.name.startsWith('(') || el.name.startsWith('proc_') || el.name.startsWith('Charnela')) return;

                const elementColor = colors[colorIndex % colors.length];
                colorIndex++;

                if (el.type === 'point') {
                    const p = { x: Number((el as any).coords?.x || (el as any).x) || 0, y: Number((el as any).coords?.y || (el as any).y) || 0, z: Number((el as any).coords?.z || (el as any).z) || 0 };
                    const result = flattenPoint(p, plane, mode);

                    if (result) {
                        const { flatPoint, OPoint, P1Point } = result;

                        flattenedPointsMap.set(el.id, { flat: flatPoint, O: OPoint, P1: P1Point });

                        addElement({
                            type: 'point',
                            name: `(${el.name})`,
                            coords: flatPoint,
                            x: flatPoint.x,
                            y: flatPoint.y,
                            z: flatPoint.z,
                            color: elementColor,
                            visible: true
                        } as any);

                        // Construction lines removed as per user request to reduce clutter
                        // Only the flattened point is shown.

                        /*
                        addElement({
                            type: 'line',
                            name: `proc_${el.name}_1`,
                            color: elementColor,
                            point: P1Point,
                            p2: OPoint,
                            direction: { x: OPoint.x - P1Point.x, y: OPoint.y - P1Point.y, z: OPoint.z - P1Point.z },
                            visible: true,
                            dashed: true
                        } as any);

                        addElement({
                            type: 'line',
                            name: `proc_${el.name}_2`,
                            color: elementColor,
                            point: OPoint,
                            p2: flatPoint,
                            direction: { x: flatPoint.x - OPoint.x, y: flatPoint.y - OPoint.y, z: flatPoint.z - OPoint.z },
                            visible: true,
                            dashed: true
                        } as any);
                        */

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
                                color: elementColor,
                                point: res1.flatPoint,
                                p2: res2.flatPoint,
                                direction: dir,
                                visible: true
                            } as any);

                            totalCount++;
                        }
                    }
                }
            });
        });

        console.log(`AbatimientoTool: Finished. Created ${totalCount} elements.`);
        if (totalCount === 0) {
            alert('No se pudieron abatir elementos. Verifica que los planos no sean paralelos al plano de proyección.');
        }

        setActiveTool('none');
    };

    return null;
}
