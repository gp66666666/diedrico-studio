import { useEffect, useRef } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { LineElement, PointElement } from '../../types';

export default function RotationTool() {
    const { activeTool, elements, addElement, setActiveTool, selectElement, selectedElementId } = useGeometryStore();
    const selectedElements = useRef<string[]>([]);

    useEffect(() => {
        if (!activeTool || !activeTool.startsWith('rotation-')) {
            selectedElements.current = [];
            return;
        }
    }, [activeTool]);

    useEffect(() => {
        if (!selectedElementId || !activeTool?.startsWith('rotation-')) return;

        const el = elements.find(e => e.id === selectedElementId);
        if (!el) return;

        if (selectedElements.current.includes(selectedElementId)) return;

        selectedElements.current.push(selectedElementId);

        // Need: Point to rotate + Axis (Line)
        let requiredCount = 2;

        if (selectedElements.current.length === requiredCount) {
            performRotation();
            selectedElements.current = [];
            selectElement(null);
        }
    }, [selectedElementId]);

    const performRotation = () => {
        try {
            switch (activeTool) {
                case 'rotation-point-axis':
                    rotatePointAroundAxis();
                    break;
            }
        } catch (error) {
            console.error('Rotation error:', error);
            alert('Error al realizar el giro.');
        }

        setActiveTool('none');
    };

    const rotatePointAroundAxis = () => {
        const [id1, id2] = selectedElements.current;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        let point: PointElement | undefined;
        let axis: LineElement | undefined;

        if (el1?.type === 'point' && el2?.type === 'line') {
            point = el1 as PointElement;
            axis = el2 as LineElement;
        } else if (el1?.type === 'line' && el2?.type === 'point') {
            axis = el1 as LineElement;
            point = el2 as PointElement;
        } else {
            alert('Selecciona un punto y un eje (recta).');
            return;
        }

        // Ask for angle
        const angleStr = prompt('Introduce el ángulo de giro en grados (positivo = antihorario):', '90');
        if (!angleStr) return;
        const angleDeg = parseFloat(angleStr);
        if (isNaN(angleDeg)) {
            alert('Ángulo inválido.');
            return;
        }

        const angleRad = (angleDeg * Math.PI) / 180;
        const P = point.coords;
        const A0 = axis.point;
        const u = axis.direction; // Axis direction unit vector (assumed normalized or we normalize it)

        // Normalize u
        const uMag = Math.sqrt(u.x ** 2 + u.y ** 2 + u.z ** 2);
        const ux = u.x / uMag;
        const uy = u.y / uMag;
        const uz = u.z / uMag;

        // Rodrigues' rotation formula
        // v_rot = v*cos(theta) + (u x v)*sin(theta) + u*(u.v)*(1-cos(theta))
        // where v = P - A0 (vector from axis point to P)

        const v = { x: P.x - A0.x, y: P.y - A0.y, z: P.z - A0.z };

        const dotUV = ux * v.x + uy * v.y + uz * v.z;

        const crossUV = {
            x: uy * v.z - uz * v.y,
            y: uz * v.x - ux * v.z,
            z: ux * v.y - uy * v.x
        };

        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const oneMinusCos = 1 - cos;

        const vRot = {
            x: v.x * cos + crossUV.x * sin + ux * dotUV * oneMinusCos,
            y: v.y * cos + crossUV.y * sin + uy * dotUV * oneMinusCos,
            z: v.z * cos + crossUV.z * sin + uz * dotUV * oneMinusCos
        };

        const P_new = {
            x: A0.x + vRot.x,
            y: A0.y + vRot.y,
            z: A0.z + vRot.z
        };

        addElement({
            type: 'point',
            name: `${point.name}'`,
            coords: P_new,
            color: '#FFA500', // Orange for rotated
            visible: true
        } as any);

        console.log(`Rotated point ${point.name} around ${axis.name} by ${angleDeg}°`);
    };

    return null;
}
