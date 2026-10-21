import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGeometryStore } from '../../store/geometryStore';
import { buildDevelopment, developmentSvg, type Development } from '../../lib/development';
import type { SolidElement } from '../../types';
import { FileDown, Ruler, X } from 'lucide-react';

/**
 * Desarrollo (red) de un sólido.
 *
 * Se elige el sólido en el lienzo y se dibuja su red a escala con las medidas
 * reales, para poder resolver los ejercicios de desarrollos de la PAU.
 */
export default function DevelopmentTool() {
    const {
        activeTool,
        setActiveTool,
        elements,
        selectedForDistance,
        clearDistanceSelection,
    } = useGeometryStore();

    const [solid, setSolid] = useState<SolidElement | null>(null);
    const [dev, setDev] = useState<Development | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const isActive = activeTool === 'solid-development';

    useEffect(() => {
        if (isActive) {
            setSolid(null);
            setDev(null);
            setMessage(null);
        }
    }, [isActive]);

    useEffect(() => {
        if (!isActive || selectedForDistance.length !== 1) return;

        const picked = elements.find((e) => e.id === selectedForDistance[0]);
        if (!picked || picked.type !== 'solid') {
            setMessage('Elige un sólido en el lienzo.');
            clearDistanceSelection();
            return;
        }

        const element = picked as SolidElement;
        const development = buildDevelopment(element.subtype, element.size);

        setSolid(element);
        setDev(development);
        setMessage(
            development
                ? null
                : element.subtype === 'sphere'
                    ? 'La esfera no tiene desarrollo plano: no es una superficie desarrollable.'
                    : 'Desarrollo no disponible para este poliedro (octaedro, dodecaedro o icosaedro).'
        );
        clearDistanceSelection();
    }, [isActive, selectedForDistance, elements, clearDistanceSelection]);

    if (!isActive && !(solid && activeTool === 'none')) return null;

    const close = () => {
        setSolid(null);
        setDev(null);
        setMessage(null);
        setActiveTool('none');
        clearDistanceSelection();
    };

    const svg = dev ? developmentSvg(dev, 300, 260) : null;

    return createPortal(
        <div className="fixed bottom-4 right-4 z-[120] w-[20rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-slate-900/90 p-4 text-white shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <Ruler size={16} className="text-sky-400" />
                    <h3 className="text-xs font-black uppercase tracking-[0.15em]">Desarrollo</h3>
                </div>
                <button onClick={close} className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white" title="Cerrar">
                    <X size={16} />
                </button>
            </div>

            {!solid && (
                <p className="text-xs text-slate-300">
                    Haz clic en un <b className="text-white">sólido</b> del lienzo para ver su desarrollo a escala.
                </p>
            )}

            {solid && message && <p className="text-xs text-amber-300">{message}</p>}

            {solid && dev && svg && (
                <div className="space-y-3">
                    <p className="text-xs text-slate-300">
                        <b className="text-white">{solid.name}</b> · superficie total{' '}
                        <b className="text-white">{dev.area.toFixed(2)} u²</b>
                    </p>

                    <div
                        className="rounded-lg bg-white/5 p-1 [&>svg]:h-auto [&>svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />

                    <ul className="space-y-1 text-[11px] text-slate-400">
                        {dev.notes.map((n) => (
                            <li key={n}>· {n}</li>
                        ))}
                    </ul>

                    <button
                        onClick={() => downloadSvg(svg, solid.name)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
                    >
                        <FileDown size={13} /> Descargar el desarrollo en SVG
                    </button>

                    <p className="text-[11px] text-slate-400">
                        La red está a escala: cada medida del dibujo es la real del sólido.
                    </p>
                </div>
            )}
        </div>,
        document.body
    );
}

function downloadSvg(svg: string, name: string) {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `desarrollo-${name.replace(/\s+/g, '-').toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
}
