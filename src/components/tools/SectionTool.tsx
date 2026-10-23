import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGeometryStore } from '../../store/geometryStore';
import { solidMesh } from '../../lib/solidGeometry';
import { sectionPolygons, trueShape, type TrueShape } from '../../lib/section';
import { buildTruncatedDevelopment, developmentSvg, type Development } from '../../lib/development';
import type { PlaneElement, SolidElement, Vector3 } from '../../types';
import { toast } from '../../lib/toast';
import { Scissors, X } from 'lucide-react';

interface SectionResult {
    solidId: string;
    solidName: string;
    planeName: string;
    vertices: number;
    shape: TrueShape | null;
    /** Desarrollo del cuerpo truncado (solo prismas rectos y cilindros). */
    truncated: Development | null;
}

/**
 * Sección de un sólido por un plano.
 *
 * 1. Clic en el sólido.
 * 2. Clic en el plano.
 *
 * La sección se añade al dibujo (planta y alzado) y aquí se muestra su
 * verdadera magnitud: el contorno abatido sobre el plano de corte.
 */
export default function SectionTool() {
    const {
        activeTool,
        setActiveTool,
        elements,
        addElement,
        selectedForDistance,
        clearDistanceSelection,
        toggleVisibility,
    } = useGeometryStore();

    const [result, setResult] = useState<SectionResult | null>(null);
    const isActive = activeTool === 'solid-section';

    // Al entrar en la herramienta se limpia el resultado anterior
    useEffect(() => {
        if (isActive) setResult(null);
    }, [isActive]);

    useEffect(() => {
        if (!isActive || selectedForDistance.length !== 2) return;

        const picked = selectedForDistance
            .map((id) => elements.find((e) => e.id === id))
            .filter(Boolean) as (SolidElement | PlaneElement)[];

        const solid = picked.find((e) => e.type === 'solid') as SolidElement | undefined;
        const plane = picked.find((e) => e.type === 'plane') as PlaneElement | undefined;

        if (!solid || !plane) {
            toast('Elige un sólido y un plano, en ese orden o al revés.');
            clearDistanceSelection();
            return;
        }

        const mesh = solidMesh(solid);
        const loops = sectionPolygons(mesh, solid.position, solid.rotation, plane.normal, plane.constant);

        if (loops.length === 0) {
            toast('Ese plano no corta al sólido. Mueve el plano y vuelve a intentarlo.');
            clearDistanceSelection();
            return;
        }

        const color = '#f59e0b';
        const baseName = `Sección ${solid.name}`;

        loops.forEach((points: Vector3[], i) => {
            addElement({
                type: 'polygon',
                name: loops.length > 1 ? `${baseName} ${i + 1}` : baseName,
                color,
                points,
                opacity: 0.45,
            } as never);
        });

        const shape = trueShape(loops[0], plane.normal);

        setResult({
            solidId: solid.id,
            solidName: solid.name,
            planeName: plane.name,
            vertices: loops[0].length,
            shape,
            truncated: buildTruncatedDevelopment(
                solid.subtype,
                solid.size,
                solid.position,
                solid.rotation,
                plane.normal,
                plane.constant,
                solid.custom
            ),
        });

        clearDistanceSelection();
        toast('Sección creada. Se ha añadido al dibujo como un elemento más.');
    }, [isActive, selectedForDistance, elements, addElement, clearDistanceSelection]);

    // El panel solo se muestra mientras la herramienta está activa (o al cerrarla
    // con "none" para poder consultar el resultado).
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
                    <Scissors size={16} className="text-amber-400" />
                    <h3 className="text-xs font-black uppercase tracking-[0.15em]">Sección plana</h3>
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
                        Clic en el <b className="text-white">sólido</b>
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                            {selectedForDistance.length >= 2 ? '✓' : '2'}
                        </span>
                        Clic en el <b className="text-white">plano</b> que lo corta
                    </p>
                    <p className="pt-1 text-[11px] text-slate-400">
                        La sección se dibuja en planta y alzado, y aquí verás su verdadera magnitud.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs text-slate-300">
                        <b className="text-white">{result.planeName}</b> corta a{' '}
                        <b className="text-white">{result.solidName}</b>: polígono de{' '}
                        <b className="text-white">{result.vertices} vértices</b>.
                    </p>

                    {result.shape && (
                        <>
                            <svg viewBox="0 0 280 200" className="w-full rounded-lg bg-white/5">
                                <polygon
                                    points={svgPoints(result.shape)}
                                    fill="#f59e0b"
                                    fillOpacity={0.25}
                                    stroke="#fbbf24"
                                    strokeWidth={2}
                                    strokeLinejoin="round"
                                />
                                {result.shape.points.length <= 12 && result.shape.points.map((p, i) => {
                                    const { x, y } = toSvg(p, result.shape!);
                                    return (
                                        <g key={i}>
                                            <circle cx={x} cy={y} r={2.5} fill="#fbbf24" />
                                            <text x={x + 5} y={y - 4} fontSize={9} fill="#fde68a">
                                                {String.fromCharCode(65 + (i % 26))}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>

                            <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                                <div className="rounded-lg bg-white/5 p-2">
                                    <p className="text-slate-400">Área (VM)</p>
                                    <p className="font-mono text-sm font-bold text-amber-300">
                                        {result.shape.area.toFixed(2)} u²
                                    </p>
                                </div>
                                <div className="rounded-lg bg-white/5 p-2">
                                    <p className="text-slate-400">Perímetro</p>
                                    <p className="font-mono text-sm font-bold text-amber-300">
                                        {result.shape.perimeter.toFixed(2)} u
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleVisibility(result.solidId)}
                                className="w-full rounded-lg border border-white/15 bg-white/5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
                            >
                                {elements.find((e) => e.id === result.solidId)?.visible === false
                                    ? 'Volver a mostrar el sólido'
                                    : 'Ocultar el sólido para ver la sección'}
                            </button>

                            <p className="text-[11px] text-slate-400">
                                El contorno está abatido sobre el plano de corte: eso es la sección en verdadera
                                magnitud (su desarrollo).
                            </p>

                            {result.truncated && (
                                <details className="rounded-lg border border-white/10 bg-white/5 p-2">
                                    <summary className="cursor-pointer text-[11px] font-semibold text-amber-200">
                                        Desarrollo del cuerpo truncado
                                    </summary>
                                    <div
                                        className="mt-2 [&>svg]:h-auto [&>svg]:w-full"
                                        dangerouslySetInnerHTML={{
                                            __html: developmentSvg(result.truncated, 300, 220),
                                        }}
                                    />
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Superficie total: <b className="text-white">{result.truncated.area.toFixed(2)} u²</b>
                                    </p>
                                    <ul className="mt-1 space-y-0.5 text-[11px] text-slate-400">
                                        {result.truncated.notes.map((n) => (
                                            <li key={n}>· {n}</li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() =>
                                            downloadSvg(
                                                developmentSvg(result.truncated!, 300, 220),
                                                `desarrollo-${result.solidName}`
                                            )
                                        }
                                        className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
                                    >
                                        Descargar SVG
                                    </button>
                                </details>
                            )}

                            {!result.truncated && (
                                <p className="text-[11px] text-slate-500">
                                    El desarrollo del cuerpo truncado se calcula en prismas rectos y cilindros.
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );

    // Portal: así el panel flota sobre el lienzo y no tapa ni bloquea el panel de herramientas
    return createPortal(panel, document.body);
}

function downloadSvg(svg: string, name: string) {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
}

const PAD = 20;
const W = 240;
const H = 160;

function bounds(shape: TrueShape) {
    const xs = shape.points.map((p) => p.x);
    const ys = shape.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const k = Math.min(W / spanX, H / spanY);
    return { minX, minY, k };
}

function toSvg(p: { x: number; y: number }, shape: TrueShape) {
    const { minX, minY, k } = bounds(shape);
    return {
        x: PAD + (p.x - minX) * k,
        y: 190 - PAD - (p.y - minY) * k,
    };
}

function svgPoints(shape: TrueShape) {
    return shape.points.map((p) => {
        const s = toSvg(p, shape);
        return `${s.x},${s.y}`;
    }).join(' ');
}
