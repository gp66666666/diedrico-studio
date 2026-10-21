import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGeometryStore } from '../../store/geometryStore';
import {
    tangentAtPoint,
    tangentPlanesThroughLine,
    tangentPlanesParallel,
    type TangentPlane,
} from '../../lib/tangency';
import type { LineElement, PlaneElement, PointElement, SegmentElement, SolidElement } from '../../types';
import { toast } from '../../lib/toast';
import { Circle, X } from 'lucide-react';

interface Result {
    title: string;
    planes: TangentPlane[];
    note: string;
}

/**
 * Planos tangentes a una esfera.
 *
 * Tres casos de la PAU: tangente en un punto de la superficie, tangentes que
 * contienen una recta exterior y tangentes paralelos a un plano.
 */
export default function SphereTangentTool() {
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
    const isActive = activeTool === 'sphere-tangent';

    useEffect(() => {
        if (isActive) {
            setResult(null);
            setMessage(null);
        }
    }, [isActive]);

    useEffect(() => {
        if (!isActive || selectedForDistance.length !== 2) return;

        const picked = selectedForDistance.map((id) => elements.find((e) => e.id === id));
        const sphere = picked.find((e) => e?.type === 'solid' && (e as SolidElement).subtype === 'sphere') as
            | SolidElement
            | undefined;
        const other = picked.find((e) => e && e.id !== sphere?.id);

        if (!sphere || !other) {
            setMessage('Elige la esfera y, además, un punto, una recta o un plano.');
            clearDistanceSelection();
            return;
        }

        const center = sphere.position;
        const radius = sphere.size.x;
        let planes: TangentPlane[] = [];
        let note = '';
        let title = '';

        if (other.type === 'point') {
            const p = (other as PointElement).coords;
            const plane = tangentAtPoint(center, radius, p);
            if (!plane) {
                setMessage(
                    'Ese punto no está sobre la esfera. Desde un punto exterior hay infinitos planos tangentes (forman un cono): usa una recta que pase por él o un plano director.'
                );
                clearDistanceSelection();
                return;
            }
            planes = [plane];
            title = `Tangente en ${other.name}`;
            note = 'El radio hasta el punto de tangencia es perpendicular al plano.';
        } else if (other.type === 'line' || other.type === 'segment') {
            const isSegment = other.type === 'segment';
            const seg = other as SegmentElement;
            const line = isSegment
                ? {
                      point: seg.p1,
                      direction: { x: seg.p2.x - seg.p1.x, y: seg.p2.y - seg.p1.y, z: seg.p2.z - seg.p1.z },
                  }
                : { point: (other as LineElement).point, direction: (other as LineElement).direction };

            planes = tangentPlanesThroughLine(center, radius, line);
            title = `Tangentes por ${other.name}`;
            if (planes.length === 0) {
                setMessage('La recta corta a la esfera: no hay planos tangentes que la contengan.');
                clearDistanceSelection();
                return;
            }
            note =
                planes.length === 1
                    ? 'La recta es tangente a la esfera: un solo plano.'
                    : 'Dos planos, uno por cada rama del cono tangente.';
        } else if (other.type === 'plane') {
            const p = other as PlaneElement;
            planes = tangentPlanesParallel(center, radius, p.normal);
            title = `Tangentes paralelos a ${other.name}`;
            note = 'Los dos planos son paralelos al dado y están a distancia r del centro.';
        } else {
            setMessage('Elige un punto, una recta o un plano junto con la esfera.');
            clearDistanceSelection();
            return;
        }

        planes.forEach((plane, i) => {
            addElement({
                type: 'plane',
                name: planes.length > 1 ? `${title} (${i + 1})` : title,
                color: '#22d3ee',
                normal: plane.normal,
                constant: plane.constant,
            } as never);
        });

        setResult({ title, planes, note });
        toast(planes.length > 1 ? `${planes.length} planos tangentes añadidos.` : 'Plano tangente añadido.');
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
                    <Circle size={16} className="text-cyan-400" />
                    <h3 className="text-xs font-black uppercase tracking-[0.15em]">Tangente a la esfera</h3>
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
                        Clic en la <b className="text-white">esfera</b>
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                            {selectedForDistance.length >= 2 ? '✓' : '2'}
                        </span>
                        Clic en un <b className="text-white">punto</b>, <b className="text-white">recta</b> o{' '}
                        <b className="text-white">plano</b>
                    </p>
                    <p className="pt-1 text-[11px] text-slate-400">
                        Punto sobre la esfera → plano tangente en él. Recta exterior → los dos planos que la
                        contienen. Plano → los dos tangentes paralelos.
                    </p>
                    {message && <p className="rounded-lg bg-amber-500/15 p-2 text-[11px] text-amber-200">{message}</p>}
                </div>
            ) : (
                <div className="space-y-3 text-xs">
                    <p className="text-slate-300">
                        <b className="text-white">{result.title}</b>
                    </p>
                    <div className="space-y-1 rounded-lg bg-white/5 p-2 font-mono text-[11px]">
                        {result.planes.map((p, i) => (
                            <p key={i} className="text-cyan-300">
                                {`n${result.planes.length > 1 ? i + 1 : ''} = (${p.normal.x.toFixed(2)}, ${p.normal.y.toFixed(2)}, ${p.normal.z.toFixed(2)})`}
                            </p>
                        ))}
                    </div>
                    <div className="space-y-1 rounded-lg bg-white/5 p-2 font-mono text-[11px]">
                        {result.planes.map((p, i) => (
                            <p key={i}>
                                <span className="text-slate-400">T{result.planes.length > 1 ? i + 1 : ''} </span>
                                <span className="text-white">
                                    ({p.touch.x.toFixed(2)}, {p.touch.y.toFixed(2)}, {p.touch.z.toFixed(2)})
                                </span>
                            </p>
                        ))}
                    </div>
                    <p className="text-[11px] text-slate-400">{result.note}</p>
                </div>
            )}
        </div>
    );

    return createPortal(panel, document.body);
}
