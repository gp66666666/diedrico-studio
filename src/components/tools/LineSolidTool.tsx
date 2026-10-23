import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGeometryStore } from '../../store/geometryStore';
import { solidMesh } from '../../lib/solidGeometry';
import { intersectLineSolid } from '../../lib/lineSolid';
import type { LineElement, SegmentElement, SolidElement, Vector3 } from '../../types';
import { toast } from '../../lib/toast';
import { Crosshair, X } from 'lucide-react';

interface Result {
    solidName: string;
    lineName: string;
    entry: Vector3 | null;
    exit: Vector3 | null;
    chord: number;
    tangent: boolean;
}

const fmt = (p: Vector3) => `(${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`;

/**
 * Puntos de penetración de una recta (o un segmento) en un sólido.
 *
 * Se elige la recta y el sólido; se marcan en el dibujo el punto de entrada y
 * el de salida, que son los que pide el ejercicio.
 */
export default function LineSolidTool() {
    const {
        activeTool,
        setActiveTool,
        elements,
        addElement,
        selectedForDistance,
        clearDistanceSelection,
    } = useGeometryStore();

    const [result, setResult] = useState<Result | null>(null);
    const isActive = activeTool === 'line-solid';

    useEffect(() => {
        if (isActive) setResult(null);
    }, [isActive]);

    useEffect(() => {
        if (!isActive || selectedForDistance.length !== 2) return;

        const picked = selectedForDistance.map((id) => elements.find((e) => e.id === id));
        const solid = picked.find((e) => e?.type === 'solid') as SolidElement | undefined;
        const line = picked.find((e) => e?.type === 'line' || e?.type === 'segment') as
            | LineElement
            | SegmentElement
            | undefined;

        if (!solid || !line) {
            toast('Elige una recta (o un segmento) y un sólido.');
            clearDistanceSelection();
            return;
        }

        const isSegment = line.type === 'segment';
        const seg = line as SegmentElement;
        const ray = isSegment
            ? { point: seg.p1, direction: { x: seg.p2.x - seg.p1.x, y: seg.p2.y - seg.p1.y, z: seg.p2.z - seg.p1.z } }
            : { point: (line as LineElement).point, direction: (line as LineElement).direction };

        const found = intersectLineSolid(
            solidMesh(solid),
            solid.position,
            solid.rotation,
            ray,
            isSegment ? [0, 1] : [-Infinity, Infinity]
        );

        if (!found) {
            toast('La recta no corta al sólido.');
            clearDistanceSelection();
            setResult(null);
            return;
        }

        if (found.entry) {
            addElement({
                type: 'point',
                name: `Entrada ${solid.name}`,
                color: '#ef4444',
                coords: found.entry,
            } as never);
        }
        if (found.exit) {
            addElement({
                type: 'point',
                name: `Salida ${solid.name}`,
                color: '#ef4444',
                coords: found.exit,
            } as never);
        }

        const chord =
            found.entry && found.exit
                ? Math.hypot(
                      found.exit.x - found.entry.x,
                      found.exit.y - found.entry.y,
                      found.exit.z - found.entry.z
                  )
                : 0;

        setResult({
            solidName: solid.name,
            lineName: line.name,
            entry: found.entry,
            exit: found.exit,
            chord,
            tangent: !found.exit,
        });

        toast(
            found.exit
                ? 'Puntos de entrada y salida añadidos al dibujo.'
                : 'La recta es tangente: hay un solo punto de contacto.'
        );
        clearDistanceSelection();
    }, [isActive, selectedForDistance, elements, addElement, clearDistanceSelection]);

    if (!isActive && !(result && activeTool === 'none')) return null;

    const close = () => {
        setResult(null);
        setActiveTool('none');
        clearDistanceSelection();
    };

    const panel = (
        <div className="fixed bottom-4 right-4 z-[120] w-[19rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-slate-900/90 p-4 text-white shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <Crosshair size={16} className="text-rose-400" />
                    <h3 className="text-xs font-black uppercase tracking-[0.15em]">Recta y sólido</h3>
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
                        Clic en la <b className="text-white">recta</b> (o segmento)
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                            {selectedForDistance.length >= 2 ? '✓' : '2'}
                        </span>
                        Clic en el <b className="text-white">sólido</b>
                    </p>
                    <p className="pt-1 text-[11px] text-slate-400">
                        Calcula dónde entra y dónde sale la recta del sólido y deja los dos puntos marcados
                        en planta y alzado.
                    </p>
                </div>
            ) : (
                <div className="space-y-3 text-xs">
                    <p className="text-slate-300">
                        <b className="text-white">{result.lineName}</b> ∩ <b className="text-white">{result.solidName}</b>
                    </p>

                    <div className="space-y-1 rounded-lg bg-white/5 p-2 font-mono text-[11px]">
                        <p>
                            <span className="text-slate-400">Entrada </span>
                            <span className="text-rose-300">{result.entry ? fmt(result.entry) : '—'}</span>
                        </p>
                        <p>
                            <span className="text-slate-400">Salida&nbsp;&nbsp;</span>
                            <span className="text-rose-300">{result.exit ? fmt(result.exit) : '—'}</span>
                        </p>
                        {result.chord > 0 && (
                            <p>
                                <span className="text-slate-400">Cuerda&nbsp;&nbsp;</span>
                                <span className="text-white">{result.chord.toFixed(2)} u</span>
                            </p>
                        )}
                    </div>

                    <p className="text-[11px] text-slate-400">
                        {result.tangent
                            ? 'La recta es tangente al sólido: lo toca en un único punto.'
                            : 'Los dos puntos están en la superficie del sólido: son los de penetración.'}
                    </p>
                </div>
            )}
        </div>
    );

    return createPortal(panel, document.body);
}
