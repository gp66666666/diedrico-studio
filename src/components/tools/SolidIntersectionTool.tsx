import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGeometryStore } from '../../store/geometryStore';
import { solidMesh } from '../../lib/solidGeometry';
import { intersectSolids } from '../../lib/solidIntersection';
import type { SolidElement } from '../../types';
import { toast } from '../../lib/toast';
import { Link2, X } from 'lucide-react';

interface IntersectionResult {
    aId: string;
    bId: string;
    aName: string;
    bName: string;
    vertices: number;
    faces: number;
    seam: number;
    volume: number;
}

/**
 * Intersección de dos sólidos.
 *
 * Se eligen los dos sólidos y se calcula A ∩ B. El resultado se añade como una
 * malla con su línea de intersección, que es lo que se dibuja en la PAU.
 */
export default function SolidIntersectionTool() {
    const {
        activeTool,
        setActiveTool,
        elements,
        addElement,
        selectedForDistance,
        clearDistanceSelection,
        toggleVisibility,
    } = useGeometryStore();

    const [result, setResult] = useState<IntersectionResult | null>(null);
    const isActive = activeTool === 'solid-intersection';

    useEffect(() => {
        if (isActive) setResult(null);
    }, [isActive]);

    useEffect(() => {
        if (!isActive || selectedForDistance.length !== 2) return;

        const picked = selectedForDistance
            .map((id) => elements.find((e) => e.id === id))
            .filter(Boolean) as SolidElement[];

        if (picked.length !== 2 || picked.some((e) => e.type !== 'solid')) {
            toast('Elige dos sólidos.');
            clearDistanceSelection();
            return;
        }

        const [a, b] = picked;
        const found = intersectSolids(
            solidMesh(a),
            a.position,
            a.rotation,
            solidMesh(b),
            b.position,
            b.rotation
        );

        if (!found) {
            toast('Los dos sólidos no se cortan: no hay línea de intersección.');
            clearDistanceSelection();
            return;
        }

        const name = `Intersección ${a.name} ∩ ${b.name}`;
        const color = '#a855f7';

        addElement({
            type: 'mesh',
            name,
            color,
            vertices: found.vertices,
            faces: found.faces,
            sources: found.sources,
            seam: found.seam,
            opacity: 0.32,
        } as never);

        setResult({
            aId: a.id,
            bId: b.id,
            aName: a.name,
            bName: b.name,
            vertices: found.vertices.length,
            faces: found.faces.length,
            seam: found.seam.length,
            volume: found.volume,
        });
        clearDistanceSelection();
        toast('Intersección creada: la línea de contacto está marcada en el dibujo.');
    }, [isActive, selectedForDistance, elements, addElement, clearDistanceSelection]);

    if (!isActive && !(result && activeTool === 'none')) return null;

    const close = () => {
        setResult(null);
        setActiveTool('none');
        clearDistanceSelection();
    };

    const hidden = (id: string) => elements.find((e) => e.id === id)?.visible === false;

    const panel = (
        <div className="fixed bottom-4 right-4 z-[120] w-[19rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-slate-900/90 p-4 text-white shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <Link2 size={16} className="text-fuchsia-400" />
                    <h3 className="text-xs font-black uppercase tracking-[0.15em]">Intersección</h3>
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
                        Clic en el <b className="text-white">primer sólido</b>
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                            {selectedForDistance.length >= 2 ? '✓' : '2'}
                        </span>
                        Clic en el <b className="text-white">segundo sólido</b>
                    </p>
                    <p className="pt-1 text-[11px] text-slate-400">
                        Calcula la parte común a los dos sólidos y marca en el dibujo la línea de intersección
                        (en planta y en alzado).
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs text-slate-300">
                        <b className="text-white">{result.aName}</b> ∩ <b className="text-white">{result.bName}</b>
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                        <div className="rounded-lg bg-white/5 p-2">
                            <p className="text-slate-400">Volumen común</p>
                            <p className="font-mono text-sm font-bold text-fuchsia-300">{result.volume.toFixed(2)} u³</p>
                        </div>
                        <div className="rounded-lg bg-white/5 p-2">
                            <p className="text-slate-400">Caras / aristas</p>
                            <p className="font-mono text-sm font-bold text-fuchsia-300">
                                {result.faces} / {result.seam}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            toggleVisibility(result.aId);
                            toggleVisibility(result.bId);
                        }}
                        className="w-full rounded-lg border border-white/15 bg-white/5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
                    >
                        {hidden(result.aId) && hidden(result.bId)
                            ? 'Volver a mostrar los sólidos'
                            : 'Ocultar los sólidos para ver la intersección'}
                    </button>

                    <p className="text-[11px] text-slate-400">
                        La línea de intersección son las aristas que separan una cara de un sólido de una cara del
                        otro: es la curva que se dibuja en el ejercicio.
                    </p>
                </div>
            )}
        </div>
    );

    return createPortal(panel, document.body);
}
