import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGeometryStore } from '../../store/geometryStore';
import { buildSolidMesh } from '../../lib/solidGeometry';
import {
    shadowOfSolid,
    shadowOfPoint,
    clipToQuarter,
    polygonArea3D,
    type Light,
    type ProjectionPlane,
} from '../../lib/shadows';
import type { LineElement, PointElement, SegmentElement, SolidElement } from '../../types';
import { toast } from '../../lib/toast';
import { Sun, X } from 'lucide-react';

interface Result {
    objectName: string;
    lightName: string;
    ownLight: boolean;
    shapes: { plane: ProjectionPlane; area: number }[];
}

const SHADOW_COLOR = '#475569';

/**
 * Sombras de un elemento sobre los planos de proyección.
 *
 * Foco propio: se elige un punto como luz. Foco impropio: se elige una recta,
 * cuya dirección marca la dirección de la luz (hacia abajo).
 */
export default function ShadowsTool() {
    const {
        activeTool,
        setActiveTool,
        elements,
        addElement,
        selectedForDistance,
        clearDistanceSelection,
    } = useGeometryStore();

    const [result, setResult] = useState<Result | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const isActive = activeTool === 'shadows';

    useEffect(() => {
        if (isActive) {
            setResult(null);
            setMessage(null);
        }
    }, [isActive]);

    useEffect(() => {
        if (!isActive || selectedForDistance.length !== 2) return;

        const picked = selectedForDistance.map((id) => elements.find((e) => e.id === id)).filter(Boolean) as (
            | SolidElement
            | PointElement
            | LineElement
            | SegmentElement
        )[];

        if (picked.length !== 2) {
            clearDistanceSelection();
            return;
        }

        const solid = picked.find((e) => e.type === 'solid') as SolidElement | undefined;
        const lightEl = picked.find(
            (e) => e.id !== solid?.id && (e.type === 'point' || e.type === 'line' || e.type === 'segment')
        ) as PointElement | LineElement | SegmentElement | undefined;
        const objectEl = picked.find((e) => e.id !== lightEl?.id) as
            | SolidElement
            | PointElement
            | SegmentElement
            | undefined;

        if (!lightEl || !objectEl || objectEl.id === lightEl.id) {
            setMessage('Elige el objeto y la luz (un punto o una recta).');
            clearDistanceSelection();
            return;
        }

        const ownLight = lightEl.type === 'point';
        let light: Light;
        if (ownLight) {
            light = { kind: 'point', position: (lightEl as PointElement).coords };
        } else {
            const raw =
                lightEl.type === 'line'
                    ? (lightEl as LineElement).direction
                    : {
                          x: (lightEl as SegmentElement).p2.x - (lightEl as SegmentElement).p1.x,
                          y: (lightEl as SegmentElement).p2.y - (lightEl as SegmentElement).p1.y,
                          z: (lightEl as SegmentElement).p2.z - (lightEl as SegmentElement).p1.z,
                      };
            const len = Math.hypot(raw.x, raw.y, raw.z) || 1;
            // La luz baja: si la recta apunta hacia arriba, se toma la contraria
            const sign = raw.z > 0 ? -1 : 1;
            light = {
                kind: 'direction',
                direction: { x: (sign * raw.x) / len, y: (sign * raw.y) / len, z: (sign * raw.z) / len },
            };
        }

        const shapes: { plane: ProjectionPlane; area: number }[] = [];
        let added = 0;

        (['h', 'v'] as ProjectionPlane[]).forEach((plane) => {
            const label = plane === 'h' ? 'PH' : 'PV';

            if (objectEl.type === 'solid') {
                const outline = shadowOfSolid(
                    buildSolidMesh(objectEl.subtype, objectEl.size),
                    objectEl.position,
                    objectEl.rotation,
                    light,
                    plane
                );
                if (!outline) return;
                const clipped = clipToQuarter(outline, plane);
                const area = polygonArea3D(clipped);
                if (area < 1e-6 || clipped.length < 3) return;

                addElement({
                    type: 'polygon',
                    name: `Sombra ${label} de ${objectEl.name}`,
                    color: SHADOW_COLOR,
                    points: clipped,
                    opacity: 0.45,
                    role: plane === 'h' ? 'shadow-h' : 'shadow-v',
                } as never);
                shapes.push({ plane, area });
                added++;
                return;
            }

            if (objectEl.type === 'point') {
                const s = shadowOfPoint((objectEl as PointElement).coords, light, plane);
                if (!s) return;
                // Solo si la sombra cae dentro del plano (delante de la LT)
                if (plane === 'h' ? s.y < -1e-9 : s.z < -1e-9) return;
                addElement({
                    type: 'point',
                    name: `Sombra ${label} de ${objectEl.name}`,
                    color: SHADOW_COLOR,
                    coords: s,
                    role: plane === 'h' ? 'shadow-h' : 'shadow-v',
                } as never);
                added++;
                return;
            }

            // Segmento
            const seg = objectEl as SegmentElement;
            const a = shadowOfPoint(seg.p1, light, plane);
            const b = shadowOfPoint(seg.p2, light, plane);
            if (!a || !b) return;
            addElement({
                type: 'segment',
                name: `Sombra ${label} de ${objectEl.name}`,
                color: SHADOW_COLOR,
                p1: a,
                p2: b,
                role: plane === 'h' ? 'shadow-h' : 'shadow-v',
            } as never);
            added++;
        });

        if (added === 0) {
            setMessage(
                'La luz no llega a los planos: coloca el foco por delante (y > 0) o por encima (z > 0) del objeto.'
            );
            clearDistanceSelection();
            return;
        }

        setResult({
            objectName: objectEl.name,
            lightName: lightEl.name,
            ownLight,
            shapes,
        });
        toast(added > 1 ? `Sombras añadidas (${added}).` : 'Sombra añadida.');
        clearDistanceSelection();
    }, [isActive, selectedForDistance, elements, addElement, clearDistanceSelection]);

    if (!isActive && !(result && activeTool === 'none')) return null;

    const close = () => {
        setResult(null);
        setMessage(null);
        setActiveTool('none');
        clearDistanceSelection();
    };

    const panel = (
        <div className="fixed bottom-4 right-4 z-[120] w-[19rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-slate-900/90 p-4 text-white shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <Sun size={16} className="text-amber-400" />
                    <h3 className="text-xs font-black uppercase tracking-[0.15em]">Sombras</h3>
                </div>
                <button onClick={close} className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white" title="Cerrar">
                    <X size={16} />
                </button>
            </div>

            {!result ? (
                <div className="space-y-2 text-xs text-slate-300">
                    <p className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                            {selectedForDistance.length >= 1 ? '✓' : '1'}
                        </span>
                        Clic en el <b className="text-white">objeto</b> (sólido, punto o segmento)
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                            {selectedForDistance.length >= 2 ? '✓' : '2'}
                        </span>
                        Clic en la <b className="text-white">luz</b>: un punto (foco propio) o una recta (foco impropio)
                    </p>
                    <p className="pt-1 text-[11px] text-slate-400">
                        La sombra se calcula sobre el horizontal y sobre el vertical. Con una recta como luz se
                        toma su dirección hacia abajo.
                    </p>
                    {message && <p className="rounded-lg bg-amber-500/15 p-2 text-[11px] text-amber-200">{message}</p>}
                </div>
            ) : (
                <div className="space-y-3 text-xs">
                    <p className="text-slate-300">
                        Sombra de <b className="text-white">{result.objectName}</b>
                        {' · '}
                        {result.ownLight ? 'foco propio' : 'foco impropio'} ({result.lightName})
                    </p>

                    <div className="space-y-1 rounded-lg bg-white/5 p-2 text-[11px]">
                        {result.shapes.map((s) => (
                            <p key={s.plane} className="flex justify-between">
                                <span className="text-slate-400">Sobre el {s.plane === 'h' ? 'horizontal' : 'vertical'}</span>
                                <span className="font-mono text-slate-200">{s.area.toFixed(2)} u²</span>
                            </p>
                        ))}
                    </div>

                    <p className="text-[11px] text-slate-400">
                        La sombra de un sólido convexo es el contorno de las sombras de sus vértices; solo se
                        dibuja la parte que cae dentro de cada plano.
                    </p>
                </div>
            )}
        </div>
    );

    return createPortal(panel, document.body);
}
