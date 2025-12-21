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

        // Trace Eq: Ax + By + D = 0 (mode ph) or Ax + Cz + D = 0 (mode pv)
        // We use A, B, C for the trace line eq in the 2D plane (x, y/z)
        const traceLine = mode === 'ph' ? { A, B, C: D } : { A, B: C_plane, C: D };

        const flattenPoint = (p: { x: number, y: number, z: number }) => {
            const u = p.x;
            const v = mode === 'ph' ? p.y : p.z;
            const height = mode === 'ph' ? p.z : p.y;

            const denom = Math.sqrt(traceLine.A ** 2 + traceLine.B ** 2);
            if (denom < 1e-6) return null;

            // distance d' from P to trace
            const val = traceLine.A * u + traceLine.B * v + traceLine.C;
            const dist = Math.abs(val) / denom;
            const R = Math.sqrt(dist ** 2 + height ** 2);

            const normSq = traceLine.A ** 2 + traceLine.B ** 2;
            const Ou = u - traceLine.A * val / normSq;
            const Ov = v - traceLine.B * val / normSq;

            let dirU = u - Ou;
            let dirV = v - Ov;

            if (dist < 1e-6) {
                dirU = traceLine.A;
                dirV = traceLine.B;
            }

            const len = Math.sqrt(dirU ** 2 + dirV ** 2);
            if (len > 1e-6) {
                dirU /= len;
                dirV /= len;
            }

            const flat_u = Ou + dirU * R;
            const flat_v = Ov + dirV * R;

            return mode === 'ph'
                ? { x: flat_u, y: flat_v, z: 0 }
                : { x: flat_u, y: 0, z: flat_v };
        };

        // 1. Flatten all points that belong to this plane (or just all points for now as helper)
        elements.forEach(el => {
            if (el.type === 'point') {
                const pt = el as import('../../types').PointElement;
                const flatName = `(${el.name})`;
                if (elements.some(e => e.name === flatName)) return;

                const flat = flattenPoint(pt.coords);
                if (flat) {
                    addElement({
                        type: 'point',
                        name: flatName,
                        coords: flat,
                        color: plane.color,
                        visible: true
                    } as any);
                }
            }
        });

        // 2. Flatten the OTHER trace
        // If abatir over PH (hinge = horizontal trace), we rotate the vertical trace.
        // Vertical trace is Ax + Cz + D = 0 in PV (y=0).
        // Let's take two points on the vertical trace:
        // L = intersection with LT: (-D/A, 0, 0)
        // V = some high point: say x=xL - 10, then z = (-D - A*x)/C
        if (Math.abs(A) > 1e-6 && (mode === 'ph' ? Math.abs(C_plane) > 1e-6 : Math.abs(B) > 1e-6)) {
            const xL = -D / A;
            const L = { x: xL, y: 0, z: 0 };

            // Second point on the vertical/horizontal trace
            let P_trace;
            if (mode === 'ph') {
                const xP = xL - 5;
                const zP = (-D - A * xP) / C_plane;
                P_trace = { x: xP, y: 0, z: zP };
            } else {
                const xP = xL - 5;
                const yP = (-D - A * xP) / B;
                P_trace = { x: xP, y: yP, z: 0 };
            }

            const flatP = flattenPoint(P_trace);
            if (flatP) {
                const traceName = mode === 'ph' ? `(v_${plane.name.toLowerCase()})` : `(h_${plane.name.toLowerCase()})`;
                addElement({
                    type: 'line',
                    name: traceName,
                    point: L,
                    direction: { x: flatP.x - L.x, y: flatP.y - L.y, z: flatP.z - L.z },
                    color: plane.color,
                    visible: true,
                    isInfinite: true
                } as any);
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
