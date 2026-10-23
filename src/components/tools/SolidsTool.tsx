import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGeometryStore } from '../../store/geometryStore';
import { Box, Maximize2, X, ArrowDownToLine, ArrowLeftToLine, Move3d, Hand, ChevronDown, ChevronUp, Crosshair, Ruler, Shapes } from 'lucide-react';
import type { SolidElement, PointElement } from '../../types';
import { makeSolid, isSolidCreationTool, makePolyhedron } from '../../lib/solidFactory';
import { parseVertexInput } from '../../lib/parseVertices';
import { countEdges, polyhedronFromPoints } from '../../lib/freePolyhedron';
import { meshVolume, solidMesh } from '../../lib/solidGeometry';
import { solidFromEdge } from '../../lib/solidFromEdge';
import { toast } from '../../lib/toast';
import { lowestLocalZ, lowestLocalY, restOnHorizontalPlane, restOnVerticalPlane } from '../../lib/solidPlacement';

type Pane = {
    px: string; py: string; pz: string;
    sx: string; sy: string;
    rx: string; ry: string; rz: string;
};

const fmt = (value: number) => String(Math.round(value * 100) / 100);

/** Tres campos X/Y/Z; los valores se guardan como texto para no comerse «1,5». */
function VecInput({
    value, onChange,
}: {
    value: { x: string; y: string; z: string };
    onChange: (next: { x: string; y: string; z: string }) => void;
}) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {(['x', 'y', 'z'] as const).map((axis) => (
                <label key={axis} className="block">
                    <span className="label-text mb-1 block">
                        {axis === 'x' ? 'X lateral' : axis === 'y' ? 'Y alej.' : 'Z cota'}
                    </span>
                    <input
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        value={value[axis]}
                        onChange={(e) => onChange({ ...value, [axis]: e.target.value })}
                        className="w-full rounded-lg px-2 py-1.5 text-sm"
                    />
                </label>
            ))}
        </div>
    );
}

/** Lista de puntos del dibujo para copiar sus coordenadas. */
function PointPicker({
    points, onPick,
}: {
    points: PointElement[];
    onPick: (id: string) => void;
}) {
    return (
        <select
            value=""
            onChange={(e) => {
                if (e.target.value) onPick(e.target.value);
            }}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[11px]"
            title="Copia las coordenadas de un punto que ya está en el dibujo"
        >
            <option value="">Usar un punto del dibujo…</option>
            {points.map((p) => (
                <option key={p.id} value={p.id}>
                    {p.name} ({fmt(p.coords.x)}, {fmt(p.coords.y)}, {fmt(p.coords.z)})
                </option>
            ))}
        </select>
    );
}
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
    // `poliedro-libre` no tiene medidas por defecto: solo el formulario de vértices.
    const isFreeTool = activeTool === 'poliedro-libre';
    const [mode, setMode] = useState<'center' | 'edge' | 'vertices'>('center');

    // Vértices del poliedro libre, tal cual los escribe el alumno.
    const [vertexText, setVertexText] = useState('');

    /** Un clic sobre un punto del dibujo añade su nombre a la lista. */
    const addVertexLine = (name: string) => {
        setVertexText((prev) => {
            const lines = prev.split('\n').map((l) => l.trim()).filter(Boolean);
            if (lines.some((l) => l.toUpperCase() === name.trim().toUpperCase())) return prev;
            return [...lines, name.trim()].join('\n');
        });
    };

    // Crear con un clic sobre un punto existente (la otra vía es el suelo del 3D)
    useEffect(() => {
        if (!isSolidTool) return;
        if (mode === 'edge' && !isFreeTool) return; // en modo arista manda el formulario
        if (selectedForDistance.length === 1) {
            const pId = selectedForDistance[0];
            const p = elements.find(e => e.id === pId);
            if (p && p.type === 'point') {
                const pt = p as import('../../types').PointElement;
                if (isFreeTool) {
                    addVertexLine(pt.name);
                    clearDistanceSelection();
                    return;
                }
                createSolidAt(pt.coords);
                clearDistanceSelection();
                setActiveTool('none');
            }
        }
    }, [selectedForDistance, isSolidTool, isFreeTool, mode, elements, clearDistanceSelection, setActiveTool]);

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
     * Cómo se coloca el sólido al crearlo:
     * - `center`: un punto es su centro.
     * - `edge`:   dos puntos son una arista (un diámetro si el cuerpo es redondo).
     * El modo «a mano» no tiene formulario: crea en el origen y abre el editor.
     */
    const [center, setCenter] = useState({ x: '0', y: '0', z: '0' });
    const [edgeP, setEdgeP] = useState({ x: '0', y: '0', z: '0' });
    const [edgeQ, setEdgeQ] = useState({ x: '4', y: '0', z: '0' });

    useEffect(() => {
        setMode(activeTool === 'poliedro-libre' ? 'vertices' : 'center');
    }, [activeTool]);

    const num = (raw: string): number | null => {
        const value = parseFloat(raw.replace(',', '.'));
        return Number.isFinite(value) ? value : null;
    };

    /** Añade el sólido, lo selecciona (se abre su editor) y apaga la herramienta. */
    const spawn = (element: SolidElement) => {
        const newId = addElement(element);
        if (!newId) {
            toast.error('No se ha podido crear el sólido');
            return;
        }
        selectElement(newId);
        setActiveTool('none');
        clearDistanceSelection();
    };

    const solidCount = () => elements.filter(e => e.type === 'solid').length;

    /** Botón 1: en el origen, apoyado en el PH y con las medidas por defecto. */
    const createManual = () => {
        if (!activeTool) return;
        const solid = makeSolid(activeTool, { x: 0, y: 0, z: 0 }, solidCount());
        if (!solid) return;
        solid.position = restOnHorizontalPlane(solid.subtype, solid.size, solid.rotation, { x: 0, y: 0, z: 0 }, solid.custom);
        spawn(solid);
    };

    /** Botón 2: el punto escrito es el centro del sólido. */
    const createAtCenter = () => {
        if (!activeTool) return;
        const x = num(center.x);
        const y = num(center.y);
        const z = num(center.z);
        if (x === null || y === null || z === null) {
            toast.error('Escribe las tres coordenadas del centro');
            return;
        }
        const solid = makeSolid(activeTool, { x, y, z }, solidCount());
        if (!solid) return;
        spawn(solid);
    };

    /** Botón 3: los dos puntos son una arista (diámetro en esfera, cilindro y cono). */
    const createFromEdge = () => {
        if (!activeTool) return;
        const p = { x: num(edgeP.x), y: num(edgeP.y), z: num(edgeP.z) };
        const q = { x: num(edgeQ.x), y: num(edgeQ.y), z: num(edgeQ.z) };
        if (p.x === null || p.y === null || p.z === null || q.x === null || q.y === null || q.z === null) {
            toast.error('Escribe las coordenadas de los dos puntos');
            return;
        }
        const P = { x: p.x, y: p.y, z: p.z };
        const Q = { x: q.x, y: q.y, z: q.z };
        if (Math.hypot(P.x - Q.x, P.y - Q.y, P.z - Q.z) < 1e-6) {
            toast.error('Los dos puntos no pueden ser el mismo');
            return;
        }
        const solid = makeSolid(activeTool, { x: 0, y: 0, z: 0 }, solidCount());
        if (!solid) return;
        const placement = solidFromEdge(solid.subtype, solid.size, P, Q);
        if (!placement) {
            toast.error('No se ha podido colocar el sólido con esa arista');
            return;
        }
        solid.size = placement.size;
        solid.position = placement.position;
        solid.rotation = placement.rotation;
        spawn(solid);
    };

    /** Rellena un trío de campos con un punto del dibujo. */
    const fillFromPoint = (id: string, set: (v: { x: string; y: string; z: string }) => void) => {
        const point = elements.find(e => e.id === id && e.type === 'point') as PointElement | undefined;
        if (!point) return;
        set({ x: String(point.coords.x), y: String(point.coords.y), z: String(point.coords.z) });
    };

    const points = elements.filter((e): e is PointElement => e.type === 'point');

    /**
     * Vértices escritos → cuerpo.
     *
     * Se calcula en cada tecla para poder avisar ANTES de crear: cuántas
     * aristas y caras salen, o qué falla. Así el alumno ve que las uniones las
     * resuelve el programa y no tiene que escribirlas.
     */
    const vertexCheck = useMemo(() => {
        const parsed = parseVertexInput(
            vertexText,
            points.map((p) => ({ name: p.name, coords: p.coords }))
        );
        const poly =
            parsed.errors.length === 0 && parsed.vertices.length >= 4
                ? polyhedronFromPoints(parsed.vertices)
                : null;
        return { parsed, poly };
    }, [vertexText, points]);

    const vertexPreview = useMemo(() => {
        const { parsed, poly } = vertexCheck;
        if (!vertexText.trim()) {
            return { text: 'Escribe un vértice por línea y aquí saldrá el recuento.', cls: 'text-white/50' };
        }
        if (parsed.errors.length > 0) {
            return { text: `✕ ${parsed.errors[0]}`, cls: 'status-bad' };
        }
        if (parsed.vertices.length < 4) {
            return {
                text: `${parsed.vertices.length} vértice(s): un cuerpo necesita al menos 4.`,
                cls: 'status-mid',
            };
        }
        if (!poly) {
            return {
                text: '✕ Esos puntos no cierran un cuerpo: están alineados o todos en el mismo plano.',
                cls: 'status-bad',
            };
        }
        const inside = poly.dropped > 0 ? ` · ${poly.dropped} por dentro` : '';
        return {
            text: `✓ ${poly.vertices.length} vértices · ${countEdges(poly.faces)} aristas · ${poly.faces.length} caras · ${poly.volume.toFixed(2)} u³${inside}`,
            cls: 'status-ok',
        };
    }, [vertexCheck, vertexText]);

    /** Botón 4: crea el cuerpo a partir de los vértices escritos. */
    const createPolyhedron = () => {
        const { parsed, poly } = vertexCheck;
        if (parsed.errors.length > 0) {
            toast.error(parsed.errors[0]);
            return;
        }
        if (parsed.vertices.length < 4) {
            toast.error('Hacen falta al menos 4 vértices: el cuerpo más pequeño es el tetraedro.');
            return;
        }
        if (!poly) {
            toast.error('Esos puntos no forman un cuerpo: mira que no estén alineados ni todos en el mismo plano.');
            return;
        }
        if (poly.dropped > 0) {
            toast(`Hay ${poly.dropped} punto(s) dentro del cuerpo: no forman cara y se descartan.`);
        }
        spawn(makePolyhedron(poly, solidCount()));
    };

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
        const position = restOnHorizontalPlane(solid.subtype, solid.size, solid.rotation, base, solid.custom);
        updateElement(solid.id, { position });
        setPane(prev => (prev ? { ...prev, px: fmt(position.x), py: fmt(position.y), pz: fmt(position.z) } : prev));
    };

    /** Pega la parte de atrás del sólido al plano vertical (y = 0). */
    const restOnWall = () => {
        if (!solid) return;
        const position = restOnVerticalPlane(solid.subtype, solid.size, solid.rotation, solid.position, solid.custom);
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
        ? solid.position.z + lowestLocalZ(solid.subtype, solid.size, solid.rotation, solid.custom)
        : 0;
    const resting = Math.abs(gap) < 0.005;

    // Distancia al plano vertical: 0 = pegado, positivo = separado hacia delante
    const wallGap = solid
        ? solid.position.y + lowestLocalY(solid.subtype, solid.size, solid.rotation, solid.custom)
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
        #${uniqueId} select option {
            background: #111827 !important;
            color: #ffffff !important;
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
                            {solid
                                ? `Editar ${solidName}`
                                : isFreeTool
                                    ? 'Poliedro libre (vértices)'
                                    : `Crear ${activeTool?.split('-')[1] || ''}`}
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
                        {solid.subtype === 'polyhedron' ? (
                            <section className="space-y-2">
                                <span className="label-text block">Geometría</span>
                                <div className="rounded-xl bg-white/5 p-2 text-[11px] leading-relaxed">
                                    <p>
                                        <b>{solid.custom?.vertices.length ?? 0} vértices</b> ·{' '}
                                        <b>{countEdges(solid.custom?.faces ?? [])} aristas</b> ·{' '}
                                        <b>{solid.custom?.faces.length ?? 0} caras</b> ·{' '}
                                        <b>{meshVolume(solidMesh(solid)).toFixed(2)} u³</b>
                                    </p>
                                    <p className="mt-1 text-white/60">
                                        Las caras se calcularon al crearlo. Para cambiar un vértice,
                                        deshaz y vuelve a escribir la lista.
                                    </p>
                                </div>
                            </section>
                        ) : (
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
                        )}

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
                    <div className="space-y-3">
                        <p className="text-[11px] leading-snug text-white/70">
                            {isFreeTool ? (
                                <>
                                    Escribe un vértice por línea y pulsa <b>Crear</b>: las caras se
                                    calculan solas. También vale ir haciendo clic en los puntos del
                                    dibujo y se añaden a la lista.
                                </>
                            ) : (
                                <>
                                    Elige cómo colocarlo. También puedes <b>hacer clic en el suelo</b> del 3D:
                                    aparece apoyado en el PH, en ese punto.
                                </>
                            )}
                        </p>

                        {!isFreeTool && (
                        <>
                        {/* 1 · a mano */}
                        <div className="space-y-1">
                            <button
                                onClick={createManual}
                                className="w-full flex items-center gap-2 rounded-xl bg-emerald-500/90 px-3 py-2 text-left text-xs font-bold hover:bg-emerald-400"
                            >
                                <Hand size={16} />
                                <span className="flex-1">1 · Crear y ajustar a mano</span>
                                <span className="text-[10px] font-normal opacity-80">origen</span>
                            </button>
                            <p className="text-[10px] leading-snug text-white/50">
                                Se crea en (0, 0, 0), apoyado en el PH y con sus medidas por defecto.
                                Después lo cambias todo en su panel.
                            </p>
                        </div>

                        {/* 2 · centro en un punto */}
                        <div className="space-y-1">
                            <button
                                onClick={() => setMode('center')}
                                className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors ${mode === 'center' ? 'bg-blue-500/80' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                <Crosshair size={16} />
                                <span className="flex-1">2 · Centro en un punto</span>
                                {mode === 'center' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {mode === 'center' && (
                                <div className="space-y-2 rounded-xl bg-white/5 p-2">
                                    <VecInput value={center} onChange={setCenter} />
                                    <button
                                        onClick={createAtCenter}
                                        className="w-full rounded-lg bg-blue-500 px-2 py-1.5 text-xs font-semibold hover:bg-blue-400"
                                    >
                                        Crear con el centro ahí
                                    </button>
                                    <p className="text-[10px] leading-snug text-white/50">
                                        O haz clic en un punto del dibujo y se crea centrado en él.
                                        Si el punto está a cota 0, quedará medio enterrado: usa
                                        «Apoyar en el PH» en su panel.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 3 · por dos puntos (arista / diámetro) */}
                        <div className="space-y-1">
                            <button
                                onClick={() => setMode('edge')}
                                className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors ${mode === 'edge' ? 'bg-blue-500/80' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                <Ruler size={16} />
                                <span className="flex-1">3 · Por dos puntos (arista)</span>
                                {mode === 'edge' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {mode === 'edge' && (
                                <div className="space-y-2 rounded-xl bg-white/5 p-2">
                                    <div className="space-y-1">
                                        <span className="label-text block">Punto P</span>
                                        <VecInput value={edgeP} onChange={setEdgeP} />
                                        {points.length > 0 && (
                                            <PointPicker points={points} onPick={(id) => fillFromPoint(id, setEdgeP)} />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <span className="label-text block">Punto Q</span>
                                        <VecInput value={edgeQ} onChange={setEdgeQ} />
                                        {points.length > 0 && (
                                            <PointPicker points={points} onPick={(id) => fillFromPoint(id, setEdgeQ)} />
                                        )}
                                    </div>
                                    <button
                                        onClick={createFromEdge}
                                        className="w-full rounded-lg bg-blue-500 px-2 py-1.5 text-xs font-semibold hover:bg-blue-400"
                                    >
                                        Crear con esa arista
                                    </button>
                                    <p className="text-[10px] leading-snug text-white/50">
                                        La arista elegida cae exactamente de P a Q. En la esfera, el
                                        cilindro y el cono los dos puntos son un diámetro. El tetraedro
                                        se crea regular.
                                    </p>
                                </div>
                            )}
                        </div>
                        </>
                        )}

                        {/* 4 · por sus vértices (poliedro libre) */}
                        <div className="space-y-1">
                            {!isFreeTool && (
                                <button
                                    onClick={() => setMode('vertices')}
                                    className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors ${mode === 'vertices' ? 'bg-teal-500/80' : 'bg-white/10 hover:bg-white/20'}`}
                                >
                                    <Shapes size={16} />
                                    <span className="flex-1">4 · Por sus vértices (poliedro libre)</span>
                                    {mode === 'vertices' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            )}
                            {(isFreeTool || mode === 'vertices') && (
                                <div className="space-y-2 rounded-xl bg-white/5 p-2">
                                    <div className="rounded-lg bg-teal-500/10 p-2 text-[10px] leading-snug text-white/80">
                                        <b className="text-teal-300">Solo los vértices.</b> El programa
                                        mira qué parejas comparten cara y dibuja esas aristas: en un
                                        cubo escribes sus 8 vértices y salen sus 12 aristas y 6 caras.
                                        No hay que decir «A va con B y no con C».
                                    </div>
                                    <span className="label-text block">Vértices (uno por línea)</span>
                                    <textarea
                                        value={vertexText}
                                        onChange={(e) => setVertexText(e.target.value)}
                                        rows={6}
                                        spellCheck={false}
                                        placeholder={'0 0 0\n4 0 0\n0 6 0\n0 0 3'}
                                        className="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 font-mono text-[11px] leading-relaxed"
                                    />
                                    <div className={`rounded-lg bg-black/20 px-2 py-1 text-[10px] font-semibold leading-snug ${vertexPreview.cls}`}>
                                        {vertexPreview.text}
                                    </div>
                                    <button
                                        onClick={createPolyhedron}
                                        className="w-full rounded-lg bg-teal-500 px-2 py-1.5 text-xs font-semibold hover:bg-teal-400"
                                    >
                                        Crear el cuerpo con esos vértices
                                    </button>
                                    <p className="text-[10px] leading-snug text-white/50">
                                        Vale para cuerpos convexos (tetraedro irregular, prisma
                                        oblicuo, tronco…). Cada línea es «x y z» o el nombre de un
                                        punto ya dibujado.
                                    </p>
                                </div>
                            )}
                        </div>
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
