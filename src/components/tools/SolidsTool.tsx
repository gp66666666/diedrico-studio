import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGeometryStore } from '../../store/geometryStore';
import { Box, Maximize2, X, ArrowDownToLine, ArrowLeftToLine, Move3d } from 'lucide-react';
import type { SolidElement } from '../../types';
import { makeSolid, isSolidCreationTool } from '../../lib/solidFactory';
import { lowestLocalZ, lowestLocalY, restOnHorizontalPlane, restOnVerticalPlane } from '../../lib/solidPlacement';

type Pane = {
    px: string; py: string; pz: string;
    sx: string; sy: string;
    rx: string; ry: string; rz: string;
};

const fmt = (value: number) => String(Math.round(value * 100) / 100);
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

const toPane = (solid: SolidElement): Pane => ({
    px: fmt(solid.position.x),
    py: fmt(solid.position.y),
    pz: fmt(solid.position.z),
    sx: fmt(solid.size.x),
    sy: fmt(solid.size.y),
    rx: fmt(toDeg(solid.rotation?.x ?? 0)),
    ry: fmt(toDeg(solid.rotation?.y ?? 0)),
    rz: fmt(toDeg(solid.rotation?.z ?? 0)),
});

/** Sólidos en los que la altura (size.y) cambia la forma. */
const HAS_HEIGHT: SolidElement['subtype'][] = [
    'tetrahedron', 'pyramid', 'prism', 'cylinder', 'cone',
];

export default function SolidsTool() {
    const {
        activeTool, setActiveTool, addElement, elements,
        selectedElementId, selectElement, updateElement,
        selectedForDistance, clearDistanceSelection
    } = useGeometryStore();

    // Draggable / Resizable State
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 }); // Offset from initial position
    const [size, setSize] = useState({ width: 380, height: 560 });

    const dragStart = useRef({ x: 0, y: 0 });
    const sizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });

    const uniqueId = "solids-tool-ultimate-v6";

    const isSolidTool = isSolidCreationTool(activeTool);

    // Crear con un clic sobre un punto existente (la otra vía es el suelo del 3D)
    useEffect(() => {
        if (!isSolidTool) return;
        if (selectedForDistance.length === 1) {
            const pId = selectedForDistance[0];
            const p = elements.find(e => e.id === pId);
            if (p && p.type === 'point') {
                const pt = p as import('../../types').PointElement;
                createSolidAt(pt.coords);
                clearDistanceSelection();
                setActiveTool('none');
            }
        }
    }, [selectedForDistance, isSolidTool, elements, clearDistanceSelection, setActiveTool]);

    const createSolidAt = (center: { x: number, y: number, z: number }) => {
        if (!activeTool) return;
        const count = elements.filter(e => e.type === 'solid').length;
        const solid = makeSolid(activeTool, center, count);
        if (!solid) return;
        const newId = addElement(solid);
        selectElement(newId);
    };

    // Drag / Resize Handlers
    const onMouseDownDrag = (e: React.MouseEvent) => {
        setDragging(true);
        dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
    };

    const onMouseDownResize = (e: React.MouseEvent) => {
        e.stopPropagation();
        setResizing(true);
        sizeStart.current = { w: size.width, h: size.height, x: e.clientX, y: e.clientY };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'nwse-resize';
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (dragging) {
                setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
            } else if (resizing) {
                const dw = e.clientX - sizeStart.current.x;
                const dh = e.clientY - sizeStart.current.y;
                setSize({
                    width: Math.max(320, sizeStart.current.w + dw),
                    height: Math.max(150, sizeStart.current.h + dh)
                });
            }
        };
        const onMouseUp = () => {
            setDragging(false);
            setResizing(false);
            document.body.style.userSelect = 'auto';
            document.body.style.cursor = 'auto';
        };

        if (dragging || resizing) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging, resizing]);

    // UI Logic
    const selectedElement = elements.find(e => e.id === selectedElementId);
    const solid = selectedElement && selectedElement.type === 'solid'
        ? selectedElement as SolidElement
        : null;

    // Valores del formulario como texto: así se puede escribir «1,5» sin que el
    // campo se coma el decimal a medio escribir.
    const [pane, setPane] = useState<Pane | null>(null);

    /**
     * Vuelca el sólido en el formulario.
     *
     * Un campo que coincide con el valor real se deja tal cual (así se puede
     * escribir «1,» o «1.5» sin que el número se reescriba a media palabra);
     * uno que se ha quedado atrás (arrastre, Deshacer, botón) se actualiza.
     */
    const paneFromSolid = (prev: Pane | null, s: SolidElement): Pane => {
        const next = toPane(s);
        if (!prev) return next;
        const keep = (shown: string, real: number) => {
            const typed = parseFloat(shown.replace(',', '.'));
            return Number.isFinite(typed) && Math.abs(typed - real) < 1e-9 ? shown : fmt(real);
        };
        const rot = s.rotation ?? { x: 0, y: 0, z: 0 };
        return {
            px: keep(prev.px, s.position.x),
            py: keep(prev.py, s.position.y),
            pz: keep(prev.pz, s.position.z),
            sx: keep(prev.sx, s.size.x),
            sy: keep(prev.sy, s.size.y),
            rx: keep(prev.rx, toDeg(rot.x)),
            ry: keep(prev.ry, toDeg(rot.y)),
            rz: keep(prev.rz, toDeg(rot.z)),
        };
    };

    useEffect(() => {
        setPane((prev) => (solid ? paneFromSolid(prev, solid) : null));
        // `solid` cambia de identidad en cada arrastre y en cada undo
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [solid]);

    const setField = (key: keyof Pane, raw: string) => {
        setPane(prev => (prev ? { ...prev, [key]: raw } : prev));
        if (!solid) return;

        const value = parseFloat(raw.replace(',', '.'));
        if (!Number.isFinite(value)) return;

        const rotation = solid.rotation ?? { x: 0, y: 0, z: 0 };
        switch (key) {
            case 'px': updateElement(solid.id, { position: { ...solid.position, x: value } }); break;
            case 'py': updateElement(solid.id, { position: { ...solid.position, y: value } }); break;
            case 'pz': updateElement(solid.id, { position: { ...solid.position, z: value } }); break;
            case 'sx': updateElement(solid.id, { size: { ...solid.size, x: value } }); break;
            case 'sy': updateElement(solid.id, { size: { ...solid.size, y: value } }); break;
            case 'rx': updateElement(solid.id, { rotation: { ...rotation, x: toRad(value) } }); break;
            case 'ry': updateElement(solid.id, { rotation: { ...rotation, y: toRad(value) } }); break;
            case 'rz': updateElement(solid.id, { rotation: { ...rotation, z: toRad(value) } }); break;
        }
    };

    /** Baja o sube el sólido para que su punto más bajo toque el PH. */
    const restOnFloor = (toOrigin = false) => {
        if (!solid) return;
        const base = { x: toOrigin ? 0 : solid.position.x, y: toOrigin ? 0 : solid.position.y, z: 0 };
        const position = restOnHorizontalPlane(solid.subtype, solid.size, solid.rotation, base);
        updateElement(solid.id, { position });
        setPane(prev => (prev ? { ...prev, px: fmt(position.x), py: fmt(position.y), pz: fmt(position.z) } : prev));
    };

    /** Pega la parte de atrás del sólido al plano vertical (y = 0). */
    const restOnWall = () => {
        if (!solid) return;
        const position = restOnVerticalPlane(solid.subtype, solid.size, solid.rotation, solid.position);
        updateElement(solid.id, { position });
        setPane(prev => (prev ? { ...prev, py: fmt(position.y) } : prev));
    };

    const turn = (axis: 'x' | 'y' | 'z', degrees: number) => {
        if (!solid) return;
        const rotation = solid.rotation ?? { x: 0, y: 0, z: 0 };
        const next = { ...rotation, [axis]: rotation[axis] + toRad(degrees) };
        updateElement(solid.id, { rotation: next });
        setPane(prev => (prev ? { ...prev, [axis === 'x' ? 'rx' : axis === 'y' ? 'ry' : 'rz']: fmt(toDeg(next[axis])) } : prev));
    };

    if (!isSolidTool && !solid) return null;

    // Cota del punto más bajo: sirve para avisar si está enterrado o flotando
    const gap = solid
        ? solid.position.z + lowestLocalZ(solid.subtype, solid.size, solid.rotation)
        : 0;
    const resting = Math.abs(gap) < 0.005;

    // Distancia al plano vertical: 0 = pegado, positivo = separado hacia delante
    const wallGap = solid
        ? solid.position.y + lowestLocalY(solid.subtype, solid.size, solid.rotation)
        : 0;
    const againstWall = Math.abs(wallGap) < 0.005;

    // Aggressive CSS for visibility and glass effect
    const panelStyle = `
        #${uniqueId} {
            color: white !important;
            background: linear-gradient(180deg, #111827 0%, #0b1220 100%) !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5) !important;
            transform: translate(calc(-50% + ${pos.x}px), ${pos.y}px) !important;
            width: ${size.width}px !important;
            height: ${solid ? size.height + 'px' : 'auto'} !important;
            display: flex;
            flex-direction: column;
            pointer-events: auto !important;
        }
        #${uniqueId} * {
            color: white !important;
        }
        #${uniqueId} .label-text {
            color: #cbd5e1 !important;
            font-size: 10px !important;
            text-transform: uppercase !important;
            font-weight: 700 !important;
        }
        #${uniqueId} .status-ok { color: #34d399 !important; }
        #${uniqueId} .status-bad { color: #f87171 !important; }
        #${uniqueId} .status-mid { color: #fbbf24 !important; }
        #${uniqueId} input[type="number"] {
            background: rgba(255, 255, 255, 0.08) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
        }
        #${uniqueId} input[type="number"]:focus {
            outline: none !important;
            border-color: #60a5fa !important;
        }
    `;

    const solidName = solid?.name ?? 'sólido';

    // Portal al body: dentro de la barra lateral, `position: fixed` se resolvía
    // contra la barra (tiene backdrop-filter) y el panel se salía por abajo.
    return createPortal(
        <>
            <style>{panelStyle}</style>
            <div id={uniqueId} className="fixed bottom-24 left-[60%] z-[100] p-6 rounded-3xl animate-fade-in">
                <div
                    className="flex items-center justify-between gap-4 mb-4 cursor-grab active:cursor-grabbing border-b border-white/10 pb-2"
                    onMouseDown={onMouseDownDrag}
                >
                    <div className="flex items-center gap-2">
                        <Box className="text-blue-400" size={18} />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] m-0">
                            {solid ? `Editar ${solidName}` : `Crear ${activeTool?.split('-')[1] || ''}`}
                        </h3>
                    </div>
                    <button
                        onClick={() => {
                            setActiveTool('none');
                            selectElement(null);
                        }}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                        title="Cerrar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {solid ? (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
                        {/* Posición */}
                        <section className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="label-text">Posición</span>
                                <div className="flex flex-wrap justify-end gap-x-3 gap-y-0.5 text-[10px] font-semibold">
                                    <span className={resting ? 'status-ok' : gap < 0 ? 'status-bad' : 'status-mid'}>
                                        PH: {resting
                                            ? 'apoyado'
                                            : gap < 0
                                                ? `${Math.abs(gap).toFixed(2)} u por debajo`
                                                : `${gap.toFixed(2)} u por encima`}
                                    </span>
                                    <span className={againstWall ? 'status-ok' : wallGap < 0 ? 'status-bad' : 'status-mid'}>
                                        PV: {againstWall
                                            ? 'apoyado'
                                            : wallGap < 0
                                                ? `${Math.abs(wallGap).toFixed(2)} u por detrás`
                                                : `${wallGap.toFixed(2)} u por delante`}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <label className="block">
                                    <span className="label-text mb-1 block">X · lateral</span>
                                    <input type="number" step="0.1" inputMode="decimal" value={pane?.px ?? ''} onChange={(e) => setField('px', e.target.value)} className="w-full rounded-lg px-2 py-1.5 text-sm" />
                                </label>
                                <label className="block">
                                    <span className="label-text mb-1 block">Y · alej.</span>
                                    <input type="number" step="0.1" inputMode="decimal" value={pane?.py ?? ''} onChange={(e) => setField('py', e.target.value)} className="w-full rounded-lg px-2 py-1.5 text-sm" />
                                </label>
                                <label className="block">
                                    <span className="label-text mb-1 block">Z · cota</span>
                                    <input type="number" step="0.1" inputMode="decimal" value={pane?.pz ?? ''} onChange={(e) => setField('pz', e.target.value)} className="w-full rounded-lg px-2 py-1.5 text-sm" />
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => restOnFloor(false)}
                                    className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/90 px-2 py-1.5 text-xs font-semibold hover:bg-emerald-400"
                                    title="Coloca la cara inferior del sólido sobre el plano horizontal (cota 0)"
                                >
                                    <ArrowDownToLine size={14} /> Apoyar en el PH
                                </button>
                                <button
                                    onClick={() => restOnWall()}
                                    className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/90 px-2 py-1.5 text-xs font-semibold hover:bg-emerald-400"
                                    title="Pega la parte de atrás del sólido al plano vertical (alejamiento 0)"
                                >
                                    <ArrowLeftToLine size={14} /> Apoyar en el PV
                                </button>
                                <button
                                    onClick={() => restOnFloor(true)}
                                    className="flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2 py-1.5 text-xs font-medium hover:bg-white/20"
                                    title="Lleva el sólido a x = 0, y = 0 y lo apoya en el PH"
                                >
                                    <Move3d size={14} /> Al origen
                                </button>
                                <button
                                    onClick={() => setActiveTool(activeTool === 'solid-move' ? 'none' : 'solid-move')}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                                        activeTool === 'solid-move' ? 'bg-blue-500/80 text-white' : 'bg-white/10 hover:bg-white/20'
                                    }`}
                                    title="Haz clic en el suelo del 3D y el sólido se va ahí, conservando su cota"
                                >
                                    <Move3d size={14} />
                                    {activeTool === 'solid-move' ? 'Haz clic…' : 'Mover con el ratón'}
                                </button>
                            </div>
                        </section>

                        {/* Medidas */}
                        <section className="space-y-2">
                            <span className="label-text block">Medidas</span>
                            <div className={`grid gap-2 ${HAS_HEIGHT.includes(solid.subtype) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                <label className="block">
                                    <span className="label-text mb-1 block">
                                        {solid.subtype === 'cube'
                                            ? 'Tamaño'
                                            : ['prism', 'cylinder', 'cone', 'pyramid', 'tetrahedron'].includes(solid.subtype)
                                                ? 'Radio de la base'
                                                : 'Radio'}
                                    </span>
                                    <input type="number" min="0.1" step="0.1" inputMode="decimal" value={pane?.sx ?? ''} onChange={(e) => setField('sx', e.target.value)} className="w-full rounded-lg px-2 py-1.5 text-sm" />
                                    {solid.subtype === 'cube' && (
                                        <span className="mt-1 block text-[10px] text-white/50">
                                            Arista: {(solid.size.x * 1.5).toFixed(2)} u
                                        </span>
                                    )}
                                </label>
                                {HAS_HEIGHT.includes(solid.subtype) && (
                                    <label className="block">
                                        <span className="label-text mb-1 block">Altura</span>
                                        <input type="number" min="0.1" step="0.1" inputMode="decimal" value={pane?.sy ?? ''} onChange={(e) => setField('sy', e.target.value)} className="w-full rounded-lg px-2 py-1.5 text-sm" />
                                    </label>
                                )}
                            </div>
                        </section>

                        {/* Giro */}
                        <section className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="label-text">Giro (grados)</span>
                                <div className="flex gap-1">
                                    {(['x', 'y', 'z'] as const).map((axis) => (
                                        <button
                                            key={axis}
                                            onClick={() => turn(axis, 90)}
                                            className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold hover:bg-white/20"
                                            title={`Girar 90° en ${axis.toUpperCase()}`}
                                        >
                                            +90° {axis.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <label className="block">
                                    <span className="label-text mb-1 block">Giro X</span>
                                    <input type="number" step="5" inputMode="decimal" value={pane?.rx ?? ''} onChange={(e) => setField('rx', e.target.value)} className="w-full rounded-lg px-2 py-1.5 text-sm" />
                                </label>
                                <label className="block">
                                    <span className="label-text mb-1 block">Giro Y</span>
                                    <input type="number" step="5" inputMode="decimal" value={pane?.ry ?? ''} onChange={(e) => setField('ry', e.target.value)} className="w-full rounded-lg px-2 py-1.5 text-sm" />
                                </label>
                                <label className="block">
                                    <span className="label-text mb-1 block">Giro Z</span>
                                    <input type="number" step="5" inputMode="decimal" value={pane?.rz ?? ''} onChange={(e) => setField('rz', e.target.value)} className="w-full rounded-lg px-2 py-1.5 text-sm" />
                                </label>
                            </div>
                            <p className="text-[10px] leading-snug text-white/60">
                                Si lo giras, vuelve a pulsar «Apoyar en el PH»: al inclinarse, la cara
                                que toca el suelo cambia.
                            </p>
                        </section>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-xs">
                            <b>Haz clic en el suelo</b> del 3D y el sólido aparece apoyado en el PH, en ese punto.
                        </p>
                        <p className="text-[11px] text-white/70">
                            También puedes hacer clic sobre un punto: entonces queda centrado en él.
                        </p>
                        <p className="text-[10px] italic text-white/50">
                            Después puedes escribir su posición, medidas y giro a mano.
                        </p>
                    </div>
                )}

                {/* Resize Handle */}
                {solid && (
                    <div
                        onMouseDown={onMouseDownResize}
                        className="absolute bottom-2 right-2 cursor-nwse-resize p-1 opacity-40 hover:opacity-100 transition-opacity"
                    >
                        <Maximize2 size={16} className="rotate-90" />
                    </div>
                )}
            </div>
        </>,
        document.body
    );
}
