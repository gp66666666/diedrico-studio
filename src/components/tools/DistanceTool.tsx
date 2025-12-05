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
            label: `Distancia ${p1.name}-${p2.name}`,
            elementIds: [id1, id2]
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

        // Vector from L0 to P
        const w = { x: P.x - L0.x, y: P.y - L0.y, z: P.z - L0.z };

        // Cross product w x d
        const cross = {
            x: w.y * d.z - w.z * d.y,
            y: w.z * d.x - w.x * d.z,
            z: w.x * d.y - w.y * d.x
        };

        const crossMag = Math.sqrt(cross.x ** 2 + cross.y ** 2 + cross.z ** 2);
        const dMag = Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2);

        const dist = crossMag / dMag;

        addMeasurement({
            type: 'distance',
            value: dist,
            label: `Distancia ${point.name}-${line.name}`,
            elementIds: [point.id, line.id]
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
        const numerator = Math.abs(n.x * P.x + n.y * P.y + n.z * P.z + D);
        const denominator = Math.sqrt(n.x ** 2 + n.y ** 2 + n.z ** 2);

        const dist = numerator / denominator;

        addMeasurement({
            type: 'distance',
            value: dist,
            label: `Distancia ${point.name}-${plane.name}`,
            elementIds: [point.id, plane.id]
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

        // Check if parallel: u x v ~ 0
        const cross = {
            x: u.y * v.z - u.z * v.y,
            y: u.z * v.x - u.x * v.z,
            z: u.x * v.y - u.y * v.x
        };
        const crossMag = Math.sqrt(cross.x ** 2 + cross.y ** 2 + cross.z ** 2);

        let dist = 0;
        if (crossMag < 1e-6) {
            // Parallel: Distance from P1 to Line 2
            // d = |(P1-P2) x v| / |v|
            const w = { x: P1.x - P2.x, y: P1.y - P2.y, z: P1.z - P2.z };
            const wxv = {
                x: w.y * v.z - w.z * v.y,
                y: w.z * v.x - w.x * v.z,
                z: w.x * v.y - w.y * v.x
            };
            const wxvMag = Math.sqrt(wxv.x ** 2 + wxv.y ** 2 + wxv.z ** 2);
            const vMag = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
            dist = wxvMag / vMag;
        } else {
            // Skew: |(P2-P1) . (u x v)| / |u x v|
            const w = { x: P2.x - P1.x, y: P2.y - P1.y, z: P2.z - P1.z };
            const dot = w.x * cross.x + w.y * cross.y + w.z * cross.z;
            dist = Math.abs(dot) / crossMag;
        }

        addMeasurement({
            type: 'distance',
            value: dist,
            label: `Distancia ${el1.name}-${el2.name}`,
            elementIds: [el1.id, el2.id]
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

        const num = Math.abs(n.x * P.x + n.y * P.y + n.z * P.z + D);
        const den = Math.sqrt(n.x ** 2 + n.y ** 2 + n.z ** 2);
        const dist = num / den;

        addMeasurement({
            type: 'distance',
            value: dist,
            label: `Distancia ${line.name}-${plane.name}`,
            elementIds: [line.id, plane.id]
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

        // Parallel: Pick point on P1, dist to P2
        let P = { x: 0, y: 0, z: 0 };
        if (Math.abs(n1.x) > 1e-6) P = { x: -el1.constant / n1.x, y: 0, z: 0 };
        else if (Math.abs(n1.y) > 1e-6) P = { x: 0, y: -el1.constant / n1.y, z: 0 };
        else P = { x: 0, y: 0, z: -el1.constant / n1.z };

        // Dist to P2: |A2x + B2y + C2z + D2| / |n2|
        const num = Math.abs(n2.x * P.x + n2.y * P.y + n2.z * P.z + el2.constant);
        const den = Math.sqrt(n2.x ** 2 + n2.y ** 2 + n2.z ** 2);
        const dist = num / den;

        addMeasurement({
            type: 'distance',
            value: dist,
            label: `Distancia ${el1.name}-${el2.name}`,
            elementIds: [el1.id, el2.id]
        });
    };

    return null;
}
