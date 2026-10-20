import { useEffect, useState } from 'react';
import { RotateCw, X, Info } from 'lucide-react';
import { useGeometryStore } from '../../store/geometryStore';
import { LineElement, PointElement, SolidElement, SegmentElement } from '../../types';
import { axisAngleToMatrix, multiplyMat3, storeEulerToMatrix, matrixToStoreEuler } from '../../lib/solidGeometry';

const QUICK_ANGLES = [30, 45, 60, 90, 180];

export default function RotationTool() {
    const {
        activeTool, setActiveTool, elements, addElement,
        selectedForDistance, clearDistanceTool, theme,
    } = useGeometryStore();

    const [angle, setAngle] = useState('90');
    const [pending, setPending] = useState<{ objectId: string; axisId: string } | null>(null);

    const isActive = !!activeTool && activeTool.startsWith('rotation-');
    const isDark = theme === 'dark';

    useEffect(() => {
        if (!isActive) {
            setPending(null);
            return;
        }

        // "Paralela a la LT" calcula el ángulo solo: no necesita panel
        if (activeTool === 'rotation-parallel-lt') {
            if (selectedForDistance.length === 2) performParallelLTRotation();
            return;
        }

        if (selectedForDistance.length !== 2) {
            setPending(null);
            return;
        }

        const [id1, id2] = selectedForDistance;
        const el1 = elements.find((e) => e.id === id1);
        const el2 = elements.find((e) => e.id === id2);
        if (!el1 || !el2) return;

        // La recta es el eje; el otro elemento es lo que gira
        if (el1.type === 'line' && el2.type !== 'line') setPending({ objectId: id2, axisId: id1 });
        else if (el2.type === 'line' && el1.type !== 'line') setPending({ objectId: id1, axisId: id2 });
        else setPending({ objectId: id1, axisId: id2 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedForDistance, activeTool, elements]);

    const close = () => {
        setPending(null);
        setActiveTool('none');
        clearDistanceTool();
    };

    const applyRotation = () => {
        const deg = parseFloat(angle);
        if (!Number.isFinite(deg) || deg === 0) return;
        const ok = performGeneralRotation(deg);
        if (ok) close();
    };

    const performGeneralRotation = (angleDeg: number): boolean => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find((e) => e.id === id1);
        const el2 = elements.find((e) => e.id === id2);
        if (!el1 || !el2) return false;

        let objectToRotate: any;
        let axis: LineElement | undefined;

        if (el1.type === 'line' && el2.type !== 'line') {
            axis = el1 as LineElement;
            objectToRotate = el2;
        } else if (el2.type === 'line' && el1.type !== 'line') {
            axis = el2 as LineElement;
            objectToRotate = el1;
        } else if (el1.type === 'line' && el2.type === 'line') {
            objectToRotate = el1;
            axis = el2 as LineElement;
        }

        if (!axis) {
            alert('Uno de los elementos debe ser una RECTA (eje de giro).');
            return false;
        }

        const angleRad = (angleDeg * Math.PI) / 180;

        if (objectToRotate.type === 'point') rotatePoint(objectToRotate as PointElement, axis, angleRad);
        else if (objectToRotate.type === 'line') rotateLine(objectToRotate as LineElement, axis, angleRad);
        else if (objectToRotate.type === 'plane') rotatePlane(objectToRotate as any, axis, angleRad);
        else if (objectToRotate.type === 'segment') rotateSegment(objectToRotate as SegmentElement, axis, angleRad);
        else if (objectToRotate.type === 'solid') rotateSolid(objectToRotate as SolidElement, axis, angleRad);
        else {
            alert('Este elemento no se puede girar todavía.');
            return false;
        }

        return true;
    };

    const performParallelLTRotation = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find((e) => e.id === id1);
        const el2 = elements.find((e) => e.id === id2);

        let line: LineElement | undefined;
        let axis: LineElement | undefined;

        if (el1?.type === 'line' && el2?.type === 'line') {
            line = el1 as LineElement;
            axis = el2 as LineElement;
        } else {
            alert('Selecciona: 1. Recta a girar, 2. Eje de giro.');
            return;
        }

        const u = axis.direction;
        const isVertical = Math.abs(u.z) > Math.abs(u.y) && Math.abs(u.z) > Math.abs(u.x);
        const targetComponent: 'y' | 'z' = isVertical ? 'y' : 'z';
        const rotation = solveRotationAngleForZeroComponent(line.direction, axis.direction, targetComponent);

        if (rotation === null) {
            alert(`No es posible hacer la recta paralela al plano ${targetComponent === 'y' ? 'Vertical' : 'Horizontal'} con este eje.`);
            return;
        }

        rotateLine(line, axis, rotation);
        alert(`Girada ${((rotation * 180) / Math.PI).toFixed(1)}° para dejarla paralela a la ${targetComponent === 'y' ? 'PV' : 'PH'}.`);

        setActiveTool('none');
        clearDistanceTool();
    };

    // --- Helpers geométricos ---

    const calculateRotatedPoint = (P: { x: number; y: number; z: number }, axis: LineElement, angleRad: number) => {
        const A0 = axis.point;
        const u = axis.direction;
        const uMag = Math.sqrt(u.x ** 2 + u.y ** 2 + u.z ** 2) || 1;
        const ux = u.x / uMag;
        const uy = u.y / uMag;
        const uz = u.z / uMag;

        const v = { x: P.x - A0.x, y: P.y - A0.y, z: P.z - A0.z };
        const dotUV = ux * v.x + uy * v.y + uz * v.z;
        const crossUV = {
            x: uy * v.z - uz * v.y,
            y: uz * v.x - ux * v.z,
            z: ux * v.y - uy * v.x,
        };
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const k = (1 - cos) * dotUV;

        return {
            x: A0.x + v.x * cos + crossUV.x * sin + ux * k,
            y: A0.y + v.y * cos + crossUV.y * sin + uy * k,
            z: A0.z + v.z * cos + crossUV.z * sin + uz * k,
        };
    };

    const solveRotationAngleForZeroComponent = (v: { x: number; y: number; z: number }, u: { x: number; y: number; z: number }, component: 'y' | 'z'): number | null => {
        const mag = Math.sqrt(u.x * u.x + u.y * u.y + u.z * u.z) || 1;
        const ux = u.x / mag, uy = u.y / mag, uz = u.z / mag;

        const dot = ux * v.x + uy * v.y + uz * v.z;
        const kx = ux * dot, ky = uy * dot, kz = uz * dot;

        const cx = uy * v.z - uz * v.y;
        const cy = uz * v.x - ux * v.z;
        const cz = ux * v.y - uy * v.x;

        let A, B, C;
        if (component === 'y') { A = v.y - ky; B = cy; C = ky; }
        else { A = v.z - kz; B = cz; C = kz; }

        const R = Math.sqrt(A * A + B * B);
        if (R < 0.000001) return null;

        const rhs = -C / R;
        if (Math.abs(rhs) > 1.000001) return null;
        const safeRhs = Math.max(-1, Math.min(1, rhs));
        const angleOffset = Math.acos(safeRhs);
        const alpha = Math.atan2(B, A);

        return alpha + angleOffset;
    };

    // --- Copias giradas (subíndice ₁ para no confundir con P' = planta) ---

    const rotatePoint = (point: PointElement, axis: LineElement, angleRad: number) => {
        addElement({
            type: 'point',
            name: `${point.name}₁`,
            coords: calculateRotatedPoint(point.coords, axis, angleRad),
            color: '#FFA500',
            visible: true,
        } as any);
    };

    const rotateLine = (line: LineElement, axis: LineElement, angleRad: number) => {
        const newP1 = calculateRotatedPoint(line.point, axis, angleRad);
        const p2 = {
            x: line.point.x + line.direction.x,
            y: line.point.y + line.direction.y,
            z: line.point.z + line.direction.z,
        };
        const newP2 = calculateRotatedPoint(p2, axis, angleRad);

        addElement({
            type: 'line',
            name: `${line.name}₁`,
            point: newP1,
            direction: { x: newP2.x - newP1.x, y: newP2.y - newP1.y, z: newP2.z - newP1.z },
            isInfinite: true,
            color: '#FFA500',
            visible: true,
        } as any);
    };

    const rotatePlane = (plane: any, axis: LineElement, angleRad: number) => {
        const n = plane.normal;
        const mag = Math.sqrt(n.x ** 2 + n.y ** 2 + n.z ** 2) || 1;
        const nx = n.x / mag, ny = n.y / mag, nz = n.z / mag;

        const pointOnPlane = { x: -plane.constant * nx, y: -plane.constant * ny, z: -plane.constant * nz };
        const rotatedPoint = calculateRotatedPoint(pointOnPlane, axis, angleRad);
        const newNormal = calculateRotatedPoint(n, { ...axis, point: { x: 0, y: 0, z: 0 } }, angleRad);
        const newD = -(newNormal.x * rotatedPoint.x + newNormal.y * rotatedPoint.y + newNormal.z * rotatedPoint.z);

        addElement({
            type: 'plane',
            name: `${plane.name}₁`,
            normal: newNormal,
            constant: newD,
            color: '#FFA500',
            visible: true,
        } as any);
    };

    const rotateSegment = (segment: SegmentElement, axis: LineElement, angleRad: number) => {
        addElement({
            type: 'segment',
            name: `${segment.name}₁`,
            p1: calculateRotatedPoint(segment.p1, axis, angleRad),
            p2: calculateRotatedPoint(segment.p2, axis, angleRad),
            color: '#FFA500',
            visible: true,
        } as any);
    };

    /**
     * Giro de un sólido: se traslada su centro y se compone la rotación del eje
     * con la que ya tenía. La malla compartida usa la misma convención, así que
     * 3D y 2D siguen coincidiendo.
     */
    const rotateSolid = (solid: SolidElement, axis: LineElement, angleRad: number) => {
        const newPosition = calculateRotatedPoint(solid.position, axis, angleRad);
        const current = storeEulerToMatrix(solid.rotation || { x: 0, y: 0, z: 0 });
        const applied = axisAngleToMatrix(axis.direction, angleRad);
        const newRotation = matrixToStoreEuler(multiplyMat3(applied, current));

        addElement({
            type: 'solid',
            name: `${solid.name}₁`,
            subtype: solid.subtype,
            position: newPosition,
            size: solid.size,
            rotation: newRotation,
            color: '#FFA500',
            opacity: solid.opacity ?? 0.8,
            visible: true,
        } as any);
    };

    if (!isActive) return null;

    const object = pending ? elements.find((e) => e.id === pending.objectId) : null;
    const axis = pending ? elements.find((e) => e.id === pending.axisId) : null;
    const axisIsLine = axis?.type === 'line';

    return (
        <div
            className={`fixed bottom-20 left-1/2 z-50 flex min-w-[320px] -translate-x-1/2 flex-col gap-3 rounded-2xl border border-white/20 p-4 shadow-2xl backdrop-blur-xl ${isDark ? 'bg-gray-900/90 text-white' : 'bg-white/90 text-gray-900'
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-blue-500/20 p-2">
                        <RotateCw size={20} className="text-blue-500" />
                    </div>
                    <h3 className="text-sm font-bold">Giro</h3>
                </div>
                <button onClick={close} className="rounded-full p-1 transition-colors hover:bg-white/10" aria-label="Cancelar giro">
                    <X size={18} />
                </button>
            </div>

            {!pending || !object || !axisIsLine ? (
                <div className={`flex gap-3 rounded-xl border p-3 ${isDark ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-200 bg-blue-50'}`}>
                    <Info size={18} className="shrink-0 text-blue-500" />
                    <p className="text-xs leading-relaxed">
                        Selecciona <b>el objeto</b> que quieres girar y después <b>la recta</b> que hace de eje.
                        {pending && !axisIsLine ? ' Uno de los dos tiene que ser una recta.' : ''}
                    </p>
                </div>
            ) : (
                <>
                    <div className={`rounded-xl border p-3 text-xs ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                        <b>{object.name}</b> alrededor de <b>{axis.name}</b>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {QUICK_ANGLES.map((a) => (
                            <button
                                key={a}
                                onClick={() => setAngle(String(a))}
                                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${angle === String(a)
                                    ? 'bg-blue-600 text-white'
                                    : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {a}°
                            </button>
                        ))}
                    </div>

                    <label className="flex items-center gap-2 text-xs">
                        Ángulo
                        <input
                            type="number"
                            value={angle}
                            onChange={(e) => setAngle(e.target.value)}
                            className={`w-24 rounded-lg border px-2 py-1.5 text-sm ${isDark ? 'border-white/10 bg-black/30 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                        />
                        <span className="opacity-60">grados</span>
                    </label>

                    <div className="mt-1 flex gap-2">
                        <button
                            onClick={applyRotation}
                            className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                        >
                            Girar y crear copia
                        </button>
                        <button
                            onClick={close}
                            className={`rounded-xl px-4 py-2 text-sm ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            Cancelar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
