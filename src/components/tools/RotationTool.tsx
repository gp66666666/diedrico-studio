import { useEffect } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { LineElement, PointElement } from '../../types';

export default function RotationTool() {
    const { activeTool, elements, addElement, setActiveTool, selectElement, selectedForDistance, clearDistanceTool } = useGeometryStore();

    useEffect(() => {
        if (!activeTool || (!activeTool.startsWith('rotation-'))) {
            return;
        }

        // Check if we have enough elements selected
        if (selectedForDistance.length === 2) {
            performRotation();
        }
    }, [activeTool, selectedForDistance]); // Run when tool activates or selection changes

    const performRotation = () => {
        try {
            switch (activeTool) {
                case 'rotation-point-axis':
                case 'rotation-any':
                    performGeneralRotation();
                    break;
                case 'rotation-parallel-lt':
                    performParallelLTRotation();
                    break;
            }
        } catch (error) {
            console.error('Rotation error:', error);
            alert('Error al realizar el giro.');
        }

        setActiveTool('none');
        clearDistanceTool(); // Clear the store selection
    };

    const performGeneralRotation = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        if (!el1 || !el2) return;

        let objectToRotate: any;
        let axis: LineElement | undefined;

        // Logic: Find the Line acting as Axis.
        // User convention: Select Object -> Select Axis. 
        // Or heuristic: Line is likely Axis if other is Point/Plane.
        if (el1.type === 'line' && el2.type !== 'line') {
            axis = el1 as LineElement;
            objectToRotate = el2;
        } else if (el2.type === 'line' && el1.type !== 'line') {
            axis = el2 as LineElement;
            objectToRotate = el1;
        } else if (el1.type === 'line' && el2.type === 'line') {
            // Both lines. Assume second selection is Axis.
            objectToRotate = el1;
            axis = el2 as LineElement;
        }

        if (!axis || axis.type !== 'line') {
            alert('Uno de los elementos debe ser una RECTA (Eje de giro).');
            return;
        }

        const angleStr = prompt('Ángulo de giro (grados):', '90');
        if (!angleStr) return;
        const angleDeg = parseFloat(angleStr);
        if (isNaN(angleDeg)) return;
        const angleRad = (angleDeg * Math.PI) / 180;

        if (objectToRotate.type === 'point') rotatePoint(objectToRotate as PointElement, axis, angleRad, angleDeg);
        else if (objectToRotate.type === 'line') rotateLine(objectToRotate as LineElement, axis, angleRad, angleDeg);
        else if (objectToRotate.type === 'plane') rotatePlane(objectToRotate as any, axis, angleRad, angleDeg);
    };

    const performParallelLTRotation = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        let line: LineElement | undefined;
        let axis: LineElement | undefined;

        if (el1?.type === 'line' && el2?.type === 'line') {
            // Assume order: Object, Axis
            line = el1 as LineElement;
            axis = el2 as LineElement;
        } else {
            alert('Selecciona: 1. Recta a girar, 2. Eje de giro.');
            return;
        }

        // Detect if Axis is vertical-ish (mostly Z)
        const u = axis.direction;
        const isVertical = Math.abs(u.z) > Math.abs(u.y) && Math.abs(u.z) > Math.abs(u.x);

        // Target: If Vertical Axis -> Target Y constant (Frontal line). If Axis is Y-oriented -> Target Z constant (Horizontal).
        let targetComponent: 'y' | 'z' = isVertical ? 'y' : 'z';

        const angle = solveRotationAngleForZeroComponent(line.direction, axis.direction, targetComponent);

        if (angle === null) {
            alert(`No es posible hacer la recta paralela al plano ${targetComponent === 'y' ? 'Vertical' : 'Horizontal'} con este eje.`);
            return;
        }

        // Perform rotation
        rotateLine(line, axis, angle, (angle * 180) / Math.PI);
        alert(`Girado ${(angle * 180 / Math.PI).toFixed(1)}° para ser paralela a ${targetComponent === 'y' ? 'PV' : 'PH'}.`);
    };

    // --- Helpers ---

    const calculateRotatedPoint = (P: { x: number, y: number, z: number }, axis: LineElement, angleRad: number) => {
        const A0 = axis.point;
        const u = axis.direction;

        const uMag = Math.sqrt(u.x ** 2 + u.y ** 2 + u.z ** 2);
        const ux = u.x / uMag;
        const uy = u.y / uMag;
        const uz = u.z / uMag;

        // Rodrigues' Formula: v = P - A0
        // v_rot = v*cos + (u x v)*sin + u*(u.v)*(1-cos)
        const v = { x: P.x - A0.x, y: P.y - A0.y, z: P.z - A0.z };

        const dotUV = ux * v.x + uy * v.y + uz * v.z;

        const crossUV = {
            x: uy * v.z - uz * v.y,
            y: uz * v.x - ux * v.z,
            z: ux * v.y - uy * v.x
        };

        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const k = (1 - cos) * dotUV;

        const vRot = {
            x: v.x * cos + crossUV.x * sin + ux * k,
            y: v.y * cos + crossUV.y * sin + uy * k,
            z: v.z * cos + crossUV.z * sin + uz * k
        };

        return {
            x: A0.x + vRot.x,
            y: A0.y + vRot.y,
            z: A0.z + vRot.z
        };
    };

    const solveRotationAngleForZeroComponent = (v: { x: number, y: number, z: number }, u: { x: number, y: number, z: number }, component: 'y' | 'z'): number | null => {
        // Normalize u
        const mag = Math.sqrt(u.x * u.x + u.y * u.y + u.z * u.z);
        const ux = u.x / mag; const uy = u.y / mag; const uz = u.z / mag;

        const dot = ux * v.x + uy * v.y + uz * v.z;
        const kx = ux * dot; const ky = uy * dot; const kz = uz * dot;

        // cross = u x v
        const cx = uy * v.z - uz * v.y;
        const cy = uz * v.x - ux * v.z;
        const cz = ux * v.y - uy * v.x;

        // Equation: A cos + B sin = -C
        let A, B, C;
        if (component === 'y') {
            A = v.y - ky; B = cy; C = ky;
        } else { // z
            A = v.z - kz; B = cz; C = kz;
        }

        const R = Math.sqrt(A * A + B * B);
        if (R < 0.000001) return null;

        const rhs = -C / R;
        if (Math.abs(rhs) > 1.000001) return null; // clamp if barely > 1 due to float error?
        const safeRhs = Math.max(-1, Math.min(1, rhs));

        const angleOffset = Math.acos(safeRhs);
        const alpha = Math.atan2(B, A);

        return alpha + angleOffset;
    };

    const rotatePoint = (point: PointElement, axis: LineElement, angleRad: number, angleDeg: number) => {
        const newCoords = calculateRotatedPoint(point.coords, axis, angleRad);
        addElement({
            type: 'point',
            name: `${point.name}'`,
            coords: newCoords,
            color: '#FFA500',
            visible: true
        } as any);
        console.log(`Rotated Point ${point.name}`);
    };

    const rotateLine = (line: LineElement, axis: LineElement, angleRad: number, angleDeg: number) => {
        const newP1 = calculateRotatedPoint(line.point, axis, angleRad);

        // Rotate a second point to get direction
        const p2 = {
            x: line.point.x + line.direction.x,
            y: line.point.y + line.direction.y,
            z: line.point.z + line.direction.z
        };
        const newP2 = calculateRotatedPoint(p2, axis, angleRad);

        const newDir = {
            x: newP2.x - newP1.x,
            y: newP2.y - newP1.y,
            z: newP2.z - newP1.z
        };

        addElement({
            type: 'line',
            name: `${line.name}'`,
            point: newP1,
            direction: newDir,
            isInfinite: true,
            color: '#FFA500',
            visible: true
        } as any);
    };

    const rotatePlane = (plane: any, axis: LineElement, angleRad: number, angleDeg: number) => {
        const n = plane.normal;
        const mag = Math.sqrt(n.x ** 2 + n.y ** 2 + n.z ** 2);
        const nx = n.x / mag; const ny = n.y / mag; const nz = n.z / mag;

        // Closest point to origin P
        const P_on_plane = {
            x: -plane.constant * nx,
            y: -plane.constant * ny,
            z: -plane.constant * nz
        };
        const P_rotated = calculateRotatedPoint(P_on_plane, axis, angleRad);

        // Rotate Normal (as vector from origin)
        const originAxis = { ...axis, point: { x: 0, y: 0, z: 0 } };
        const newNormalTip = calculateRotatedPoint(n, originAxis, angleRad);

        const newD = -(newNormalTip.x * P_rotated.x + newNormalTip.y * P_rotated.y + newNormalTip.z * P_rotated.z);

        addElement({
            type: 'plane',
            name: `${plane.name}'`,
            normal: newNormalTip,
            constant: newD,
            color: '#FFA500',
            visible: true
        } as any);
    };

    return null;
}
