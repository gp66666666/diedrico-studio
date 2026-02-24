import { useEffect, useRef } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { PlaneElement, GeometryElement } from '../../types';

export default function AbatimientoTool() {
    const { activeTool, elements, addElement, setActiveTool, selectedForDistance, clearDistanceTool, removeElement } = useGeometryStore();
    const hasExecuted = useRef(false);

    useEffect(() => {
        // Reset execution flag if tool is not active
        if (!activeTool || (!activeTool.startsWith('abatir'))) {
            hasExecuted.current = false;
            return;
        }

        // Abatir sobre Traza (Interactive)
        if (activeTool === 'abatir-traza') {
            if (hasExecuted.current) return;

            if (selectedForDistance.length === 1) {
                const elId = selectedForDistance[0];
                const el = elements.find(e => e.id === elId);

                if (el && el.type === 'plane') {
                    hasExecuted.current = true;
                    const plane = el as PlaneElement;

                    // Standard: Abatir over PH
                    executeSpecificAbatimiento(plane, 'ph');
                    setActiveTool('none');
                    clearDistanceTool();
                }
            }
            return;
        }

    }, [activeTool, selectedForDistance, elements]);

    const executeSpecificAbatimiento = (plane: PlaneElement, mode: 'ph' | 'pv') => {
        const A = plane.normal.x;
        const B = plane.normal.y;
        const C_plane = plane.normal.z;
        const D = plane.constant;

        // Function to compute flattened point
        const flattenPoint = (p: { x: number, y: number, z: number }) => {
            if (mode === 'ph') {
                const normSq = A * A + B * B;
                if (normSq < 1e-6) return { x: p.x, y: p.y, z: 0 }; // Plane || PH

                const len = Math.sqrt(normSq);
                const dirHinge = { x: -B / len, y: A / len, z: 0 };
                const perpDir = { x: A / len, y: B / len, z: 0 };

                // Point on Hinge (Trace PH: Ax + By + D = 0, z=0)
                const P0 = Math.abs(A) > Math.abs(B) ? { x: -D / A, y: 0, z: 0 } : { x: 0, y: -D / B, z: 0 };

                const vec = { x: p.x - P0.x, y: p.y - P0.y, z: p.z - P0.z };
                const dotHinge = vec.x * dirHinge.x + vec.y * dirHinge.y + vec.z * dirHinge.z;
                const O = {
                    x: P0.x + dotHinge * dirHinge.x,
                    y: P0.y + dotHinge * dirHinge.y,
                    z: P0.z + dotHinge * dirHinge.z
                };

                const OP = { x: p.x - O.x, y: p.y - O.y, z: p.z - O.z };
                const R = Math.sqrt(OP.x ** 2 + OP.y ** 2 + OP.z ** 2);

                const dotPerp = OP.x * perpDir.x + OP.y * perpDir.y;
                const sign = dotPerp >= 0 ? 1 : -1;

                return {
                    x: O.x + sign * R * perpDir.x,
                    y: O.y + sign * R * perpDir.y,
                    z: 0
                };
            } else {
                const normSq = A * A + C_plane * C_plane;
                if (normSq < 1e-6) return { x: p.x, y: 0, z: p.z }; // Plane || PV

                const len = Math.sqrt(normSq);
                const dirHinge = { x: -C_plane / len, y: 0, z: A / len };
                const perpDir = { x: A / len, y: 0, z: C_plane / len };

                // Point on Hinge (Trace PV: Ax + Cz + D = 0, y=0)
                const P0 = Math.abs(A) > Math.abs(C_plane) ? { x: -D / A, y: 0, z: 0 } : { x: 0, y: 0, z: -D / C_plane };

                const vec = { x: p.x - P0.x, y: p.y - P0.y, z: p.z - P0.z };
                const dotHinge = vec.x * dirHinge.x + vec.y * dirHinge.y + vec.z * dirHinge.z;
                const O = {
                    x: P0.x + dotHinge * dirHinge.x,
                    y: P0.y + dotHinge * dirHinge.y,
                    z: P0.z + dotHinge * dirHinge.z
                };

                const OP = { x: p.x - O.x, y: p.y - O.y, z: p.z - O.z };
                const R = Math.sqrt(OP.x ** 2 + OP.y ** 2 + OP.z ** 2);

                const dotPerp = OP.x * perpDir.x + OP.z * perpDir.z;
                const sign = dotPerp >= 0 ? 1 : -1;

                return {
                    x: O.x + sign * R * perpDir.x,
                    y: 0,
                    z: O.z + sign * R * perpDir.z
                };
            }
        };

        const lenN = Math.sqrt(A * A + B * B + C_plane * C_plane);

        // 1. Flatten only points that belong to this plane
        elements.forEach(el => {
            if (el.type === 'point') {
                const flatName = `(${el.name})`;
                if (elements.some(e => e.name === flatName)) return;

                const pt = el as import('../../types').PointElement;
                const distToPlane = Math.abs(A * pt.coords.x + B * pt.coords.y + C_plane * pt.coords.z + D) / lenN;

                if (distToPlane < 0.1) {
                    const flat = flattenPoint(pt.coords);
                    if (flat) {
                        addElement({
                            type: 'point',
                            name: flatName,
                            coords: flat,
                            color: plane.color,
                            visible: true,
                            isDependent: true
                        } as any);
                    }
                }
            }
        });

        // 2. Flatten the OTHER trace to visualize the abated plane
        if (Math.abs(A) > 1e-6 && (mode === 'ph' ? Math.abs(C_plane) > 1e-6 : Math.abs(B) > 1e-6)) {
            const xL = -D / A;
            const L = { x: xL, y: 0, z: 0 };
            let P_trace;
            if (mode === 'ph') {
                const xP = xL - 10;
                const zP = (-D - A * xP) / C_plane;
                P_trace = { x: xP, y: 0, z: zP };
            } else {
                const xP = xL - 10;
                const yP = (-D - A * xP) / B;
                P_trace = { x: xP, y: yP, z: 0 };
            }

            const flatP = flattenPoint(P_trace);
            if (flatP) {
                const traceName = mode === 'ph' ? `(v_${plane.name.toLowerCase()})` : `(h_${plane.name.toLowerCase()})`;
                if (!elements.some(e => e.name === traceName)) {
                    addElement({
                        type: 'line',
                        name: traceName,
                        point: L,
                        direction: { x: flatP.x - L.x, y: flatP.y - L.y, z: flatP.z - L.z },
                        color: plane.color,
                        visible: true,
                        isInfinite: true,
                        isDependent: true
                    } as any);
                }
            }
        }
    };

    const executeFlattenAll = () => {
        const planes = elements.filter(el => el.type === 'plane') as PlaneElement[];

        if (planes.length === 0) {
            alert('No hay planos definidos para realizar abatimientos.');
            setActiveTool('none');
            return;
        }

        const mode = activeTool === 'abatir-ph' ? 'ph' : 'pv';
        // Clear state immediately
        setActiveTool('none');

        planes.forEach(plane => executeSpecificAbatimiento(plane, mode));
    };

    return null;
}
