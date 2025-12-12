import { useEffect } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { LineElement, PlaneElement, PointElement } from '../../types';

export default function DistanceTool() {
    const { activeTool, elements, addMeasurement, setActiveTool, selectedForDistance } = useGeometryStore();

    useEffect(() => {
        // Handle element selection via selectedForDistance
        if (!activeTool || !activeTool.startsWith('distance-')) return;

        // Determine required count based on tool
        let requiredCount = 2;

        console.log(`[DistanceTool] activeTool=${activeTool}, selected=${selectedForDistance.length}/${requiredCount}`);

        // Check if we have enough elements
        if (selectedForDistance.length === requiredCount) {
            console.log(`[DistanceTool] Triggering calculation...`);
            calculateDistance();
        }
    }, [selectedForDistance, activeTool]);

    const calculateDistance = () => {
        try {
            switch (activeTool) {
                case 'distance-point-point':
                    calculatePointPointDistance();
                    break;
                case 'distance-point-line':
                    calculatePointLineDistance();
                    break;
                case 'distance-point-plane':
                    calculatePointPlaneDistance();
                    break;
                case 'distance-line-line':
                    calculateLineLineDistance();
                    break;
                case 'distance-line-plane':
                    calculateLinePlaneDistance();
                    break;
                case 'distance-plane-plane':
                    calculatePlanePlaneDistance();
                    break;
            }
        } catch (error) {
            console.error('Distance calculation error:', error);
            alert('Error al calcular la distancia.');
        }

        setActiveTool('none');
    };

    const calculatePointPointDistance = () => {
        const [id1, id2] = selectedForDistance;
        const p1 = elements.find(e => e.id === id1) as PointElement;
        const p2 = elements.find(e => e.id === id2) as PointElement;

        if (!p1 || !p2 || p1.type !== 'point' || p2.type !== 'point') {
            alert('Selecciona dos puntos.');
            return;
        }

        const c1 = p1.coords;
        const c2 = p2.coords;

        const dist = Math.sqrt(
            Math.pow(c2.x - c1.x, 2) +
            Math.pow(c2.y - c1.y, 2) +
            Math.pow(c2.z - c1.z, 2)
        );

        addMeasurement({
            type: 'distance',
            value: dist,
            label: `D(${p1.name}-${p2.name})`,
            elementIds: [id1, id2],
            visualLine: {
                p1: { x: c1.x, y: c1.y, z: c1.z },
                p2: { x: c2.x, y: c2.y, z: c2.z }
            }
        });
    };

    const calculatePointLineDistance = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        let point: PointElement | undefined;
        let line: LineElement | undefined;

        if (el1?.type === 'point' && el2?.type === 'line') {
            point = el1 as PointElement;
            line = el2 as LineElement;
        } else if (el1?.type === 'line' && el2?.type === 'point') {
            line = el1 as LineElement;
            point = el2 as PointElement;
        } else {
            alert('Selecciona un punto y una recta.');
            return;
        }

        const P = point.coords;
        const L0 = line.point;
        const d = line.direction;

        // Project P onto Line to find Q
        // Q = L0 + t * d
        // vector v = P - L0
        // t = (v . d) / (d . d)

        const vx = P.x - L0.x;
        const vy = P.y - L0.y;
        const vz = P.z - L0.z;

        const dotVD = vx * d.x + vy * d.y + vz * d.z;
        const dotDD = d.x * d.x + d.y * d.y + d.z * d.z;

        const t = dotVD / dotDD;

        const Q = {
            x: L0.x + t * d.x,
            y: L0.y + t * d.y,
            z: L0.z + t * d.z
        };

        const dist = Math.sqrt(
            Math.pow(P.x - Q.x, 2) +
            Math.pow(P.y - Q.y, 2) +
            Math.pow(P.z - Q.z, 2)
        );

        addMeasurement({
            type: 'distance',
            value: dist,
            label: `D(${point.name}-${line.name})`,
            elementIds: [point.id, line.id],
            visualLine: {
                p1: { x: P.x, y: P.y, z: P.z },
                p2: { x: Q.x, y: Q.y, z: Q.z }
            }
        });
    };

    const calculatePointPlaneDistance = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        let point: PointElement | undefined;
        let plane: PlaneElement | undefined;

        if (el1?.type === 'point' && el2?.type === 'plane') {
            point = el1 as PointElement;
            plane = el2 as PlaneElement;
        } else if (el1?.type === 'plane' && el2?.type === 'point') {
            plane = el1 as PlaneElement;
            point = el2 as PointElement;
        } else {
            alert('Selecciona un punto y un plano.');
            return;
        }

        const P = point.coords;
        const n = plane.normal;
        const D = plane.constant;

        // Distance = |Ax + By + Cz + D| / sqrt(A^2 + B^2 + C^2)
        const numerator = n.x * P.x + n.y * P.y + n.z * P.z + D;
        const denSq = n.x ** 2 + n.y ** 2 + n.z ** 2;
        const den = Math.sqrt(denSq);

        const dist = Math.abs(numerator) / den;

        // Find nearest point Q on plane
        // P = Q + k * n  => Q = P - k * n
        // P is at distance 'dist' from plane. k = signedDistance / |n| ?
        // Actually: Q = P - ( (Ax+By+Cz+D) / (A^2+B^2+C^2) ) * n

        const factor = numerator / denSq;
        const Q = {
            x: P.x - factor * n.x,
            y: P.y - factor * n.y,
            z: P.z - factor * n.z
        };

        addMeasurement({
            type: 'distance',
            value: dist,
            label: `D(${point.name}-${plane.name})`,
            elementIds: [point.id, plane.id],
            visualLine: {
                p1: { x: P.x, y: P.y, z: P.z },
                p2: { x: Q.x, y: Q.y, z: Q.z }
            }
        });
    };

    const calculateLineLineDistance = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1) as LineElement;
        const el2 = elements.find(e => e.id === id2) as LineElement;

        if (el1?.type !== 'line' || el2?.type !== 'line') {
            alert('Selecciona dos rectas.');
            return;
        }

        // Logic
        const P1 = el1.point;
        const u = el1.direction;
        const P2 = el2.point;
        const v = el2.direction;

        // Check parallel: u x v ~ 0
        const cross = {
            x: u.y * v.z - u.z * v.y,
            y: u.z * v.x - u.x * v.z,
            z: u.x * v.y - u.y * v.x
        };
        const crossMag = Math.sqrt(cross.x ** 2 + cross.y ** 2 + cross.z ** 2);

        let dist = 0;
        let Q1: { x: number, y: number, z: number };
        let Q2: { x: number, y: number, z: number };

        if (crossMag < 1e-6) {
            // Parallel: Project P1 onto Line 2 to get Q2. Visual line P1-Q2
            // Same as Point-Line distance from P1 to L2
            const vx = P1.x - P2.x;
            const vy = P1.y - P2.y;
            const vz = P1.z - P2.z;
            const dotVD = vx * v.x + vy * v.y + vz * v.z;
            const dotDD = v.x * v.x + v.y * v.y + v.z * v.z;
            const t = dotVD / dotDD;

            Q2 = {
                x: P2.x + t * v.x,
                y: P2.y + t * v.y,
                z: P2.z + t * v.z
            };
            Q1 = P1;

            dist = Math.sqrt((Q1.x - Q2.x) ** 2 + (Q1.y - Q2.y) ** 2 + (Q1.z - Q2.z) ** 2);
        } else {
            // Skew Lines - Find Closest Points
            // Solving system for s and t
            // w0 = P1 - P2
            const w0 = { x: P1.x - P2.x, y: P1.y - P2.y, z: P1.z - P2.z };
            const a = u.x * u.x + u.y * u.y + u.z * u.z;
            const b = u.x * v.x + u.y * v.y + u.z * v.z;
            const c = v.x * v.x + v.y * v.y + v.z * v.z;
            const d = u.x * w0.x + u.y * w0.y + u.z * w0.z;
            const e = v.x * w0.x + v.y * w0.y + v.z * w0.z;

            const det = a * c - b * b;
            // det != 0 because not parallel

            const s = (b * e - c * d) / det;
            const t = (a * e - b * d) / det;

            Q1 = {
                x: P1.x + s * u.x,
                y: P1.y + s * u.y,
                z: P1.z + s * u.z
            };

            Q2 = {
                x: P2.x + t * v.x,
                y: P2.y + t * v.y,
                z: P2.z + t * v.z
            };

            dist = Math.sqrt((Q1.x - Q2.x) ** 2 + (Q1.y - Q2.y) ** 2 + (Q1.z - Q2.z) ** 2);
        }

        addMeasurement({
            type: 'distance',
            value: dist,
            label: `D(${el1.name}-${el2.name})`,
            elementIds: [el1.id, el2.id],
            visualLine: {
                p1: Q1,
                p2: Q2
            }
        });
    };

    const calculateLinePlaneDistance = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        let line: LineElement | undefined;
        let plane: PlaneElement | undefined;

        if (el1?.type === 'line' && el2?.type === 'plane') { line = el1 as LineElement; plane = el2 as PlaneElement; }
        else if (el1?.type === 'plane' && el2?.type === 'line') { plane = el1 as PlaneElement; line = el2 as LineElement; }
        else { alert('Selecciona recta y plano.'); return; }

        // Check if parallel: Line dir . Plane normal = 0
        const dot = line.direction.x * plane.normal.x + line.direction.y * plane.normal.y + line.direction.z * plane.normal.z;

        if (Math.abs(dot) > 1e-6) {
            alert('La recta y el plano se cortan (Distancia = 0).');
            return;
        }

        // Parallel: Distance from Point on Line to Plane
        const P = line.point;
        const n = plane.normal;
        const D = plane.constant;

        const numerator = n.x * P.x + n.y * P.y + n.z * P.z + D;
        const denSq = n.x ** 2 + n.y ** 2 + n.z ** 2;
        const den = Math.sqrt(denSq);

        const dist = Math.abs(numerator) / den;

        // Closest point Q on plane
        const factor = numerator / denSq;
        const Q = {
            x: P.x - factor * n.x,
            y: P.y - factor * n.y,
            z: P.z - factor * n.z
        };

        addMeasurement({
            type: 'distance',
            value: dist,
            label: `D(${line.name}-${plane.name})`,
            elementIds: [line.id, plane.id],
            visualLine: {
                p1: P,
                p2: Q
            }
        });
    };

    const calculatePlanePlaneDistance = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1) as PlaneElement;
        const el2 = elements.find(e => e.id === id2) as PlaneElement;

        if (el1?.type !== 'plane' || el2?.type !== 'plane') { alert('Selecciona dos planos.'); return; }

        // Check parallel: n1 x n2 = 0
        const n1 = el1.normal;
        const n2 = el2.normal;

        const cross = {
            x: n1.y * n2.z - n1.z * n2.y,
            y: n1.z * n2.x - n1.x * n2.z,
            z: n1.x * n2.y - n1.y * n2.x
        };
        const crossMag = Math.sqrt(cross.x ** 2 + cross.y ** 2 + cross.z ** 2);

        if (crossMag > 1e-5) {
            alert('Los planos se cortan (Distancia = 0).');
            return;
        }

        // Parallel: Pick point P on Plane 1
        let P = { x: 0, y: 0, z: 0 };
        // Find a safe point on P1
        if (Math.abs(n1.x) > 1e-3) P = { x: -el1.constant / n1.x, y: 0, z: 0 };
        else if (Math.abs(n1.y) > 1e-3) P = { x: 0, y: -el1.constant / n1.y, z: 0 };
        else P = { x: 0, y: 0, z: -el1.constant / n1.z };

        // Dist to P2: |A2x + B2y + C2z + D2| / |n2|
        const numerator = n2.x * P.x + n2.y * P.y + n2.z * P.z + el2.constant;
        const denSq = n2.x ** 2 + n2.y ** 2 + n2.z ** 2;
        const den = Math.sqrt(denSq);
        const dist = Math.abs(numerator) / den;

        // Closest point Q on Plane 2
        const factor = numerator / denSq;
        const Q = {
            x: P.x - factor * n2.x,
            y: P.y - factor * n2.y,
            z: P.z - factor * n2.z
        };

        addMeasurement({
            type: 'distance',
            value: dist,
            label: `D(${el1.name}-${el2.name})`,
            elementIds: [el1.id, el2.id],
            visualLine: {
                p1: P,
                p2: Q
            }
        });
    };

    return null;
}
