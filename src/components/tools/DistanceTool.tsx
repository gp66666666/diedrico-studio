import { useEffect, useRef } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { LineElement, PlaneElement, PointElement } from '../../types';

export default function DistanceTool() {
    const { activeTool, elements, addMeasurement, setActiveTool, selectForDistance, selectedForDistance } = useGeometryStore();

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

    return null;
}
