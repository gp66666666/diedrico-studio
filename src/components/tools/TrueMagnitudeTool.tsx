import { useEffect, useRef } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { LineElement, PlaneElement } from '../../types';

export default function TrueMagnitudeTool() {
    const { activeTool, elements, addMeasurement, setActiveTool, selectForDistance, selectedForDistance } = useGeometryStore();

    useEffect(() => {
        // Handle element selection via selectedForDistance
        if (!activeTool || (!activeTool.startsWith('true-') && !activeTool.startsWith('angle-'))) return;

        // Determine required count
        const requiredCount = activeTool === 'true-length' ? 1 : 2;

        console.log(`[TrueMagnitudeTool] activeTool=${activeTool}, selected=${selectedForDistance.length}/${requiredCount}`);

        // Check if we have enough elements
        if (selectedForDistance.length === requiredCount) {
            console.log(`[TrueMagnitudeTool] Triggering calculation...`);
            calculateMeasurement();
        }
    }, [selectedForDistance, activeTool]);

    const calculateMeasurement = () => {
        try {
            switch (activeTool) {
                case 'true-length':
                    calculateTrueLength();
                    break;
                case 'angle-line-line':
                    calculateAngleLineLine();
                    break;
                case 'angle-line-plane':
                    calculateAngleLinePlane();
                    break;
            }
        } catch (error) {
            console.error('Measurement error:', error);
            alert('Error al calcular la medición.');
        }

        setActiveTool('none');
    };

    const calculateTrueLength = () => {
        const [id] = selectedForDistance;
        const line = elements.find(e => e.id === id) as LineElement;

        if (!line || line.type !== 'line') {
            alert('Selecciona una recta para medir su longitud.');
            return;
        }

        let length: number;

        if (line.p2) {
            // Line defined by two points
            const dx = line.p2.x - line.point.x;
            const dy = line.p2.y - line.point.y;
            const dz = line.p2.z - line.point.z;
            length = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
        } else {
            // Line defined by direction - use arbitrary segment
            const segmentLength = 10;
            const dx = line.direction.x * segmentLength;
            const dy = line.direction.y * segmentLength;
            const dz = line.direction.z * segmentLength;
            length = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
        }

        addMeasurement({
            type: 'length',
            value: length,
            label: `VM(${line.name})`,
            elementIds: [id]
        });

        console.log(`True Length of ${line.name}: ${length.toFixed(2)}`);
    };

    const calculateAngleLineLine = () => {
        const [id1, id2] = selectedForDistance;
        const line1 = elements.find(e => e.id === id1) as LineElement;
        const line2 = elements.find(e => e.id === id2) as LineElement;

        if (!line1 || !line2 || line1.type !== 'line' || line2.type !== 'line') {
            alert('Selecciona dos rectas para medir el ángulo.');
            return;
        }

        const d1 = line1.direction;
        const d2 = line2.direction;

        // Normalize directions
        const mag1 = Math.sqrt(d1.x ** 2 + d1.y ** 2 + d1.z ** 2);
        const mag2 = Math.sqrt(d2.x ** 2 + d2.y ** 2 + d2.z ** 2);

        // Dot product
        const dot = d1.x * d2.x + d1.y * d2.y + d1.z * d2.z;

        // Calculate angle
        const cosTheta = dot / (mag1 * mag2);
        // Clamp to [-1, 1] to avoid NaN from floating point errors
        const clampedCos = Math.max(-1, Math.min(1, cosTheta));
        const angleRad = Math.acos(clampedCos);
        const angleDeg = (angleRad * 180) / Math.PI;

        addMeasurement({
            type: 'angle',
            value: angleDeg,
            label: `∠(${line1.name}, ${line2.name})`,
            elementIds: [id1, id2]
        });

        console.log(`Angle between ${line1.name} and ${line2.name}: ${angleDeg.toFixed(1)}°`);
    };

    const calculateAngleLinePlane = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        if (!el1 || !el2) return;

        let line: LineElement;
        let plane: PlaneElement;

        if (el1.type === 'line' && el2.type === 'plane') {
            line = el1 as LineElement;
            plane = el2 as PlaneElement;
        } else if (el1.type === 'plane' && el2.type === 'line') {
            line = el2 as LineElement;
            plane = el1 as PlaneElement;
        } else {
            alert('Selecciona una recta y un plano para medir el ángulo.');
            return;
        }

        const d = line.direction;
        const n = plane.normal;

        // Normalize
        const magD = Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2);
        const magN = Math.sqrt(n.x ** 2 + n.y ** 2 + n.z ** 2);

        // Dot product
        const dot = Math.abs(d.x * n.x + d.y * n.y + d.z * n.z);

        // Calculate angle (angle between line and plane is 90° - angle with normal)
        const sinTheta = dot / (magD * magN);
        const clampedSin = Math.max(0, Math.min(1, sinTheta));
        const angleRad = Math.asin(clampedSin);
        const angleDeg = (angleRad * 180) / Math.PI;

        addMeasurement({
            type: 'angle',
            value: angleDeg,
            label: `∠(${line.name}, ${plane.name})`,
            elementIds: [id1, id2]
        });

        console.log(`Angle between ${line.name} and ${plane.name}: ${angleDeg.toFixed(1)}°`);
    };

    return null;
}
