import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGeometryStore } from '../../store/geometryStore';
import { buildSolidMesh } from '../../lib/solidGeometry';
import { lightFromElement } from '../../lib/shadows';
import { shadowOfSolidOnPlane, shadowOnSolid, projectPointOnPlane } from '../../lib/castShadow';
import type { PlaneElement, PointElement, SegmentElement, SolidElement } from '../../types';
import { toast } from '../../lib/toast';
import { SunDim, X } from 'lucide-react';

interface Result {
    objectName: string;
    receptorName: string;
    lightKind: 'propio' | 'impropio';
    area: number | null;
    note: string;
}

const SHADOW_COLOR = '#334155';

/**
 * Sombra arrojada: la de un cuerpo sobre un plano cualquiera o sobre otro
 * cuerpo.
 *
 * Se eligen tres cosas, en este orden: el objeto que hace sombra, la luz y el
 * receptor (un plano o un sólido).
 */
export default function CastShadowTool() {
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
    const isActive = activeTool === 'cast-shadow';

    useEffect(() => {
        if (isActive) {
            setResult(null);
            setMessage(null);
        }
    }, [isActive]);

    useEffect(() => {
        if (!isActive || selectedForDistance.length !== 3) return;

        const [idObj, idLight, idReceptor] = selectedForDistance;
        const obj = elements.find((e) => e.id === idObj);
        const lightEl = elements.find((e) => e.id === idLight);
        const receptor = elements.find((e) => e.id === idReceptor);

        if (!obj || !lightEl || !receptor) {
            clearDistanceSelection();
            return;
        }

        const light = lightFromElement(lightEl as never);
        if (!light) {
            setMessage('La luz tiene que ser un punto o una recta.');
            clearDistanceSelection();
            return;
        }
        const lightKind = light.kind === 'point' ? 'propio' : 'impropio';

        // --- Receptor: plano ---
        if (receptor.type === 'plane') {
            const plane = receptor as PlaneElement;
            const planeRef = { normal: plane.normal, constant: plane.constant };

            if (obj.type === 'solid') {
                const solid = obj as SolidElement;
                const poly = shadowOfSolidOnPlane(
                    buildSolidMesh(solid.subtype, solid.size),
                    solid.position,
                    solid.rotation,
                    light,
                    planeRef
                );
                if (!poly) {
                    setMessage('La sombra no llega a ese plano con esa luz.');
                    clearDistanceSelection();
                    return;
                }
                addElement({
                    type: 'polygon',
                    name: `Sombra de ${solid.name} en ${plane.name}`,
                    color: SHADOW_COLOR,
                    points: poly,
                    opacity: 0.45,
                } as never);
                setResult({
                    objectName: solid.name,
                    receptorName: plane.name,
                    lightKind,
                    area: polygonArea(poly),
                    note: 'Contorno de la sombra sobre el plano, en su posición real del espacio.',
                });
                toast('Sombra arrojada añadida.');
                clearDistanceSelection();
                return;
            }

            if (obj.type === 'point') {
                const p = projectPointOnPlane((obj as PointElement).coords, light, planeRef);
                if (!p) {
                    setMessage('La sombra de ese punto no llega al plano.');
                    clearDistanceSelection();
                    return;
                }
                addElement({
                    type: 'point',
                    name: `Sombra de ${obj.name} en ${plane.name}`,
                    color: SHADOW_COLOR,
                    coords: p,
                } as never);
                setResult({
                    objectName: obj.name,
                    receptorName: plane.name,
                    lightKind,
                    area: null,
                    note: 'La sombra de un punto es un punto.',
                });
                clearDistanceSelection();
                return;
            }

            if (obj.type === 'segment') {
                const seg = obj as SegmentElement;
                const a = projectPointOnPlane(seg.p1, light, planeRef);
                const b = projectPointOnPlane(seg.p2, light, planeRef);
                if (!a || !b) {
                    setMessage('La sombra del segmento no llega entera al plano.');
                    clearDistanceSelection();
                    return;
                }
                addElement({
                    type: 'segment',
                    name: `Sombra de ${obj.name} en ${plane.name}`,
                    color: SHADOW_COLOR,
                    p1: a,
                    p2: b,
                } as never);
                setResult({
                    objectName: obj.name,
                    receptorName: plane.name,
                    lightKind,
                    area: null,
                    note: 'La sombra de un segmento es otro segmento.',
                });
                clearDistanceSelection();
                return;
            }

            setMessage('Ese objeto no se puede proyectar.');
            clearDistanceSelection();
            return;
        }

        // --- Receptor: sólido ---
        if (receptor.type === 'solid') {
            if (obj.type !== 'solid') {
                setMessage('Sobre otro sólido solo se puede proyectar un sólido.');
                clearDistanceSelection();
                return;
            }
            const a = obj as SolidElement;
            const b = receptor as SolidElement;
            const found = shadowOnSolid(
                buildSolidMesh(a.subtype, a.size),
                a.position,
                a.rotation,
                light,
                buildSolidMesh(b.subtype, b.size),
                b.position,
                b.rotation
            );
            if (!found) {
                setMessage('La sombra de uno no cae sobre el otro: muévelos o cambia la luz.');
                clearDistanceSelection();
                return;
            }

            addElement({
                type: 'mesh',
                name: `Sombra de ${a.name} en ${b.name}`,
                color: SHADOW_COLOR,
                vertices: found.mesh.vertices,
                faces: found.mesh.faces,
                sources: found.mesh.faces.map(() => 'a'),
                seam: found.mesh.outline,
                opacity: 0.45,
            } as never);

            setResult({
                objectName: a.name,
                receptorName: b.name,
                lightKind,
                area: found.area,
                note: 'Se recorta cara a cara: el contorno es la silueta de la sombra sobre el cuerpo.',
            });
            toast('Sombra arrojada sobre el sólido añadida.');
            clearDistanceSelection();
            return;
        }

        setMessage('El receptor tiene que ser un plano o un sólido.');
        clearDistanceSelection();
    }, [isActive, selectedForDistance, elements, addElement, clearDistanceSelection]);

    if (!isActive && !(result && activeTool === 'none')) return null;

    const close = () => {
        setResult(null);
        setMessage(null);
        setActiveTool('none');
        clearDistanceSelection();
    };

    const step = (n: number, done: boolean, text: React.ReactNode) => (
        <p className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                {done ? '✓' : n}
            </span>
            {text}
        </p>
    );

    const panel = (
        <div className="fixed bottom-4 right-4 z-[120] w-[19rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-slate-900/90 p-4 text-white shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <SunDim size={16} className="text-slate-300" />
                    <h3 className="text-xs font-black uppercase tracking-[0.15em]">Sombra arrojada</h3>
                </div>
                <button onClick={close} className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white" title="Cerrar">
                    <X size={16} />
                </button>
            </div>

            {!result ? (
                <div className="space-y-2 text-xs text-slate-300">
                    {step(1, selectedForDistance.length >= 1, <>Clic en el <b className="text-white">objeto</b></>)}
                    {step(
                        2,
                        selectedForDistance.length >= 2,
                        <>Clic en la <b className="text-white">luz</b> (punto o recta)</>
                    )}
                    {step(
                        3,
                        selectedForDistance.length >= 3,
                        <>Clic en el <b className="text-white">receptor</b>: un plano o un sólido</>
                    )}
                    <p className="pt-1 text-[11px] text-slate-400">
                        La sombra se recorta sobre el receptor: sirve para la sombra sobre un plano inclinado o
                        sobre otro cuerpo.
                    </p>
                    {message && <p className="rounded-lg bg-amber-500/15 p-2 text-[11px] text-amber-200">{message}</p>}
                </div>
            ) : (
                <div className="space-y-3 text-xs">
                    <p className="text-slate-300">
                        Sombra de <b className="text-white">{result.objectName}</b> en{' '}
                        <b className="text-white">{result.receptorName}</b> ({result.lightKind})
                    </p>
                    {result.area !== null && (
                        <div className="rounded-lg bg-white/5 p-2 text-center">
                            <p className="text-[11px] text-slate-400">Superficie en sombra</p>
                            <p className="font-mono text-sm font-bold text-slate-200">{result.area.toFixed(2)} u²</p>
                        </div>
                    )}
                    <p className="text-[11px] text-slate-400">{result.note}</p>
                </div>
            )}
        </div>
    );

    return createPortal(panel, document.body);
}

/** Área de un polígono 3D plano. */
function polygonArea(points: { x: number; y: number; z: number }[]): number {
    if (points.length < 3) return 0;
    let total = { x: 0, y: 0, z: 0 };
    for (let i = 1; i < points.length - 1; i++) {
        const a = {
            x: points[i].x - points[0].x,
            y: points[i].y - points[0].y,
            z: points[i].z - points[0].z,
        };
        const b = {
            x: points[i + 1].x - points[0].x,
            y: points[i + 1].y - points[0].y,
            z: points[i + 1].z - points[0].z,
        };
        total = {
            x: total.x + (a.y * b.z - a.z * b.y),
            y: total.y + (a.z * b.x - a.x * b.z),
            z: total.z + (a.x * b.y - a.y * b.x),
        };
    }
    return Math.hypot(total.x, total.y, total.z) / 2;
}
