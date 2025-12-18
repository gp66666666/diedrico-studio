import { useState, useRef } from 'react';
import { useGeometryStore } from '../../../store/geometryStore';
import { PointElement, LineElement, PlaneElement } from '../../../types';

const SCALE = 40;

interface ViewboxProps {
    title: string;
    children: React.ReactNode;
    isDark: boolean;
    onMouseDown?: (e: React.MouseEvent) => void;
    onMouseMove?: (e: React.MouseEvent) => void;
    onMouseUp?: (e: React.MouseEvent) => void;
}

function Viewbox({ title, children, isDark, onMouseDown, onMouseMove, onMouseUp }: ViewboxProps) {
    return (
        <div
            className={`flex-1 flex flex-col border border-white/5 bg-black/10 rounded-lg overflow-hidden`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
        >
            <div className={`px-2 py-1 border-b border-white/5 bg-white/5 flex justify-between items-center`}>
                <span className="text-[9px] uppercase tracking-tighter font-bold text-white/40">{title}</span>
            </div>
            <div className="flex-1 relative">
                <svg className="w-full h-full" viewBox="-200 -200 400 400">
                    {/* Grid Lines */}
                    <g opacity="0.05">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <line key={`h-${i}`} x1="-200" y1={(i - 4) * 50} x2="200" y2={(i - 4) * 50} stroke="white" strokeWidth="1" />
                        ))}
                        {Array.from({ length: 9 }).map((_, i) => (
                            <line key={`v-${i}`} x1={(i - 4) * 50} y1="-200" x2={(i - 4) * 50} y2="200" stroke="white" strokeWidth="1" />
                        ))}
                    </g>
                    {/* Axes */}
                    <line x1="-200" y1="0" x2="200" y2="0" stroke="white" strokeWidth="1" opacity="0.2" />
                    <line x1="0" y1="-200" x2="0" y2="200" stroke="white" strokeWidth="1" opacity="0.2" />

                    <g transform="scale(1, 1)">
                        {children}
                    </g>
                </svg>
            </div>
        </div>
    );
}

export default function Normative2DViews() {
    const {
        elements, updateElement, theme, addElement,
        caballeraState, setCaballeraStep, updateCaballeraPreview
    } = useGeometryStore();
    const isDark = theme === 'dark';

    const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'alz' | 'pla' | 'per' | null>(null);
    const svgRefs = {
        alz: useRef<SVGSVGElement>(null),
        per: useRef<SVGSVGElement>(null),
        pla: useRef<SVGSVGElement>(null)
    };

    const getMouseCoords = (e: React.MouseEvent, view: 'alz' | 'pla' | 'per') => {
        const svg = svgRefs[view].current;
        if (!svg) return null;
        const CTM = svg.getScreenCTM();
        if (!CTM) return null;
        const xRaw = (e.clientX - CTM.e) / CTM.a;
        const yRaw = (e.clientY - CTM.f) / CTM.d;

        // Snapping logic: Snap to nearest 0.5 units (half grid)
        const u1 = Math.round((xRaw / SCALE) * 2) / 2;
        const u2 = Math.round((yRaw / SCALE) * 2) / 2;

        return { u1, u2 };
    };

    const handleMouseDown = (id: string, view: 'alz' | 'pla' | 'per') => {
        setDraggingPointId(id);
        setActiveView(view);
    };

    const handleMouseMove = (e: React.MouseEvent, view: 'alz' | 'pla' | 'per') => {
        // 1. Handle Construction Preview
        if (caballeraState.step !== 'idle') {
            const coords = getMouseCoords(e, view);
            if (!coords) return;

            if (caballeraState.step === 'waiting-alzado' && view === 'alz') {
                updateCaballeraPreview({ x: coords.u1, z: -coords.u2 });
            } else if (caballeraState.step === 'waiting-planta' && view === 'pla') {
                updateCaballeraPreview({ y: coords.u2 });
            }
            return;
        }

        // 2. Handle Dragging
        if (!draggingPointId || activeView !== view) return;
        const coords = getMouseCoords(e, view);
        if (!coords) return;

        const currentPoint = elements.find(el => el.id === draggingPointId) as PointElement;
        if (!currentPoint) return;

        const newCoords = { ...currentPoint.coords };

        if (view === 'alz') { // X, Z
            newCoords.x = coords.u1;
            newCoords.z = -coords.u2;
        } else if (view === 'pla') { // X, Y
            newCoords.x = coords.u1;
            newCoords.y = coords.u2;
        } else if (view === 'per') { // Y, Z
            newCoords.y = coords.u1;
            newCoords.z = -coords.u2;
        }

        updateElement(draggingPointId, { coords: newCoords });
    };

    const handleViewClick = (e: React.MouseEvent, view: 'alz' | 'pla' | 'per') => {
        if (caballeraState.step === 'idle') return;

        const coords = getMouseCoords(e, view);
        if (!coords) return;

        if (caballeraState.step === 'waiting-alzado' && view === 'alz') {
            updateCaballeraPreview({ x: coords.u1, z: -coords.u2 });
            setCaballeraStep('waiting-planta');
        } else if (caballeraState.step === 'waiting-planta' && view === 'pla') {
            const finalPos = { ...caballeraState.previewCoords, y: coords.u2 };
            addElement({
                type: 'solid',
                name: `Bloque ${elements.filter(e => e.type === 'solid').length + 1}`,
                position: finalPos,
                size: { x: 1, y: 1, z: 1 },
                color: '#f97316',
                visible: true
            } as any);
            setCaballeraStep('idle');
        }
    };

    const handleMouseUp = () => {
        setDraggingPointId(null);
        setActiveView(null);
    };

    return (
        <div className="w-full h-full p-4 relative" onMouseUp={handleMouseUp}>
            {/* Central Dividers */}
            <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-1/2 left-4 right-4 h-px bg-white/20" />
                <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white/20" />
            </div>

            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-8 relative z-0">
                {/* TOP-LEFT: PERFIL (Side) */}
                <Viewbox
                    title="Perfil Derecho (Y-Z)"
                    isDark={isDark}
                    onMouseMove={(e) => handleMouseMove(e, 'per')}
                    onMouseDown={(e) => handleViewClick(e, 'per')}
                >
                    <svg ref={svgRefs.per} className="w-full h-full" viewBox="-200 -200 400 400">
                        {caballeraState.step !== 'idle' && (
                            <g>
                                <line
                                    x1={caballeraState.previewCoords.y * SCALE} y1={-caballeraState.previewCoords.z * SCALE}
                                    x2={200} y2={-caballeraState.previewCoords.z * SCALE}
                                    stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" opacity="0.4"
                                />
                                <line
                                    x1={caballeraState.previewCoords.y * SCALE} y1={-200}
                                    x2={caballeraState.previewCoords.y * SCALE} y2={200}
                                    stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" opacity="0.4"
                                />
                            </g>
                        )}
                        {elements.filter(el => el.visible).map(el => {
                            if (el.type === 'solid') {
                                const s = el as any;
                                return (
                                    <rect
                                        key={`per-sol-${el.id}`}
                                        x={s.position.y * SCALE - (s.size.y * SCALE / 2)}
                                        y={-s.position.z * SCALE - (s.size.z * SCALE / 2)}
                                        width={s.size.y * SCALE}
                                        height={s.size.z * SCALE}
                                        fill={el.color}
                                        fillOpacity="0.2"
                                        stroke={el.color}
                                        strokeWidth="1"
                                    />
                                );
                            }
                            if (el.type === 'point') {
                                const p = el as PointElement;
                                return (
                                    <circle
                                        key={`per-pt-${el.id}`}
                                        cx={p.coords.y * SCALE}
                                        cy={-p.coords.z * SCALE}
                                        r="6"
                                        fill={el.color}
                                        className="cursor-move"
                                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(el.id, 'per'); }}
                                    />
                                );
                            }
                            if (el.type === 'line') {
                                const l = el as LineElement;
                                return <line key={`per-ln-${el.id}`} x1={(l.point.y - l.direction.y * 20) * SCALE} y1={-(l.point.z - l.direction.z * 20) * SCALE} x2={(l.point.y + l.direction.y * 20) * SCALE} y2={-(l.point.z + l.direction.z * 20) * SCALE} stroke={el.color} strokeWidth="2" />;
                            }
                            return null;
                        })}
                    </svg>
                </Viewbox>

                {/* TOP-RIGHT: ALZADO (Front) */}
                <Viewbox
                    title="Alzado (X-Z)"
                    isDark={isDark}
                    onMouseMove={(e) => handleMouseMove(e, 'alz')}
                    onMouseDown={(e) => handleViewClick(e, 'alz')}
                >
                    <svg ref={svgRefs.alz} className="w-full h-full" viewBox="-200 -200 400 400">
                        {caballeraState.step !== 'idle' && (
                            <g>
                                <line x1={caballeraState.previewCoords.x * SCALE} y1={-200} x2={caballeraState.previewCoords.x * SCALE} y2={200} stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                                <line x1="-200" y1={-caballeraState.previewCoords.z * SCALE} x2={200} y2={-caballeraState.previewCoords.z * SCALE} stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                                <circle cx={caballeraState.previewCoords.x * SCALE} cy={-caballeraState.previewCoords.z * SCALE} r="4" fill="#f97316" opacity="0.6" />
                            </g>
                        )}
                        {elements.filter(el => el.visible).map(el => {
                            if (el.type === 'solid') {
                                const s = el as any;
                                return (
                                    <rect
                                        key={`alz-sol-${el.id}`}
                                        x={s.position.x * SCALE - (s.size.x * SCALE / 2)}
                                        y={-s.position.z * SCALE - (s.size.z * SCALE / 2)}
                                        width={s.size.x * SCALE}
                                        height={s.size.z * SCALE}
                                        fill={el.color}
                                        fillOpacity="0.2"
                                        stroke={el.color}
                                        strokeWidth="1"
                                    />
                                );
                            }
                            if (el.type === 'point') {
                                const p = el as PointElement;
                                return (
                                    <circle
                                        key={`alz-pt-${el.id}`}
                                        cx={p.coords.x * SCALE}
                                        cy={-p.coords.z * SCALE}
                                        r="6"
                                        fill={el.color}
                                        className="cursor-move"
                                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(el.id, 'alz'); }}
                                    />
                                );
                            }
                            if (el.type === 'line') {
                                const l = el as LineElement;
                                return <line key={`alz-ln-${el.id}`} x1={(l.point.x - l.direction.x * 20) * SCALE} y1={-(l.point.z - l.direction.z * 20) * SCALE} x2={(l.point.x + l.direction.x * 20) * SCALE} y2={-(l.point.z + l.direction.z * 20) * SCALE} stroke={el.color} strokeWidth="2" />;
                            }
                            return null;
                        })}
                    </svg>
                </Viewbox>

                {/* BOTTOM-LEFT: Re-projection Area (Optional Visualization) */}
                <div className="flex-1 border border-dashed border-white/5 bg-black/5 rounded-lg flex items-center justify-center">
                    <p className="text-[10px] text-white/10 uppercase tracking-widest">Giro / Abatimiento</p>
                </div>

                {/* BOTTOM-RIGHT: PLANTA (Top) */}
                <Viewbox
                    title="Planta (X-Y)"
                    isDark={isDark}
                    onMouseMove={(e) => handleMouseMove(e, 'pla')}
                    onMouseDown={(e) => handleViewClick(e, 'pla')}
                >
                    <svg ref={svgRefs.pla} className="w-full h-full" viewBox="-200 -200 400 400">
                        {caballeraState.step !== 'idle' && (
                            <g>
                                <line x1={caballeraState.previewCoords.x * SCALE} y1={-200} x2={caballeraState.previewCoords.x * SCALE} y2={200} stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                                <line x1="-200" y1={caballeraState.previewCoords.y * SCALE} x2={200} y2={caballeraState.previewCoords.y * SCALE} stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                                <circle cx={caballeraState.previewCoords.x * SCALE} cy={caballeraState.previewCoords.y * SCALE} r="4" fill="#f97316" opacity="0.6" />
                            </g>
                        )}
                        {elements.filter(el => el.visible).map(el => {
                            if (el.type === 'solid') {
                                const s = el as any;
                                return (
                                    <rect
                                        key={`pla-sol-${el.id}`}
                                        x={s.position.x * SCALE - (s.size.x * SCALE / 2)}
                                        y={s.position.y * SCALE - (s.size.y * SCALE / 2)}
                                        width={s.size.x * SCALE}
                                        height={s.size.y * SCALE}
                                        fill={el.color}
                                        fillOpacity="0.2"
                                        stroke={el.color}
                                        strokeWidth="1"
                                    />
                                );
                            }
                            if (el.type === 'point') {
                                const p = el as PointElement;
                                return (
                                    <circle
                                        key={`pla-pt-${el.id}`}
                                        cx={p.coords.x * SCALE}
                                        cy={p.coords.y * SCALE}
                                        r="6"
                                        fill={el.color}
                                        className="cursor-move"
                                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(el.id, 'pla'); }}
                                    />
                                );
                            }
                            if (el.type === 'line') {
                                const l = el as LineElement;
                                return <line key={`pla-ln-${el.id}`} x1={(l.point.x - l.direction.x * 20) * SCALE} y1={(l.point.y - l.direction.y * 20) * SCALE} x2={(l.point.x + l.direction.x * 20) * SCALE} y2={(l.point.y + l.direction.y * 20) * SCALE} stroke={el.color} strokeWidth="2" />;
                            }
                            return null;
                        })}
                    </svg>
                </Viewbox>
            </div>
        </div>
    );
}
