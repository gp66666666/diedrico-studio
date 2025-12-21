import { useEffect, useState, useRef } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { Box, Maximize2 } from 'lucide-react';
import type { SolidElement } from '../../types';

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
    const [size, setSize] = useState({ width: 380, height: 450 });

    const dragStart = useRef({ x: 0, y: 0 });
    const sizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });

    const uniqueId = "solids-tool-ultimate-v6";

    const isSolidTool = activeTool?.startsWith('poliedro-') ||
        activeTool?.startsWith('solid-') ||
        activeTool?.startsWith('revolucion-');

    // Solid Creation Logic
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
        let name = 'Sólido';
        let color = '#3b82f6';
        let subtype: SolidElement['subtype'] = 'cube';
        let s = { x: 5, y: 5, z: 5 };

        if (!activeTool) return;
        if (activeTool.includes('tetraedro')) { subtype = 'tetrahedron'; name = 'Tetraedro'; color = '#ef4444'; }
        else if (activeTool.includes('cubo')) { subtype = 'cube'; name = 'Cubo'; color = '#3b82f6'; }
        else if (activeTool.includes('octaedro')) { subtype = 'octahedron'; name = 'Octaedro'; color = '#10b981'; }
        else if (activeTool.includes('dodecaedro')) { subtype = 'dodecahedron'; name = 'Dodecaedro'; color = '#f59e0b'; }
        else if (activeTool.includes('icosaedro')) { subtype = 'icosahedron'; name = 'Icosaedro'; color = '#8b5cf6'; }
        else if (activeTool.includes('prisma')) { subtype = 'prism'; name = 'Prisma'; s = { x: 4, y: 8, z: 4 }; }
        else if (activeTool.includes('piramide')) { subtype = 'pyramid'; name = 'Pirámide'; s = { x: 4, y: 8, z: 4 }; }
        else if (activeTool.includes('cilindro')) { subtype = 'cylinder'; name = 'Cilindro'; s = { x: 3, y: 8, z: 3 }; }
        else if (activeTool.includes('cono')) { subtype = 'cone'; name = 'Cono'; s = { x: 3, y: 8, z: 3 }; }
        else if (activeTool.includes('esfera')) { subtype = 'sphere'; name = 'Esfera'; s = { x: 4, y: 4, z: 4 }; }

        const newSolid = {
            type: 'solid',
            id: Math.random().toString(36).substr(2, 9),
            name: `${name} ${elements.filter(e => e.type === 'solid').length + 1}`,
            subtype,
            position: center,
            size: s,
            rotation: { x: 0, y: 0, z: 0 },
            color,
            visible: true,
            opacity: 0.8
        } as SolidElement;

        addElement(newSolid);
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
    const isEditingSolid = selectedElement && selectedElement.type === 'solid';

    if (!isSolidTool && !isEditingSolid) return null;

    // Aggressive CSS for visibility and glass effect
    const panelStyle = `
        #${uniqueId} {
            color: white !important;
            background-color: rgba(15, 23, 42, 0.8) !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5) !important;
            transform: translate(calc(-50% + ${pos.x}px), ${pos.y}px) !important;
            width: ${size.width}px !important;
            height: ${isEditingSolid ? size.height + 'px' : 'auto'} !important;
            display: flex;
            flex-direction: column;
            pointer-events: auto !important;
        }
        #${uniqueId} * {
            color: white !important;
        }
        #${uniqueId} .magnitude-value {
            color: #60a5fa !important;
            font-weight: 800 !important;
            font-family: monospace !important;
        }
        #${uniqueId} .label-text {
            color: #cbd5e1 !important;
            font-size: 10px !important;
            text-transform: uppercase !important;
            font-weight: 700 !important;
        }
        #${uniqueId} input[type="range"] {
            accent-color: #3b82f6 !important;
        }
    `;

    return (
        <>
            <style>{panelStyle}</style>
            <div
                id={uniqueId}
                className="fixed bottom-24 left-1/2 z-[100] p-6 rounded-3xl animate-fade-in"
            >
                {/* Header / Drag Area */}
                <div
                    onMouseDown={onMouseDownDrag}
                    className="flex items-center justify-between border-b border-white/10 pb-4 mb-4"
                    style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
                >
                    <div className="flex items-center gap-3">
                        <Box size={20} style={{ color: '#60a5fa !important' }} />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] m-0">
                            {isEditingSolid ? `Editar ${(selectedElement as SolidElement).name}` : `Crear ${activeTool?.split('-')[1] || ''}`}
                        </h3>
                    </div>
                    {isEditingSolid && (
                        <button
                            onClick={() => selectElement(null)}
                            className="hover:scale-125 transition-transform p-1"
                        >
                            <span className="text-2xl leading-none">✕</span>
                        </button>
                    )}
                </div>

                {isEditingSolid ? (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        {/* Size Slider */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="label-text">Tamaño Principal</span>
                                <span className="magnitude-value">{(selectedElement as SolidElement).size.x.toFixed(1)} u</span>
                            </div>
                            <input
                                type="range" min="0.5" max="20" step="0.1"
                                value={(selectedElement as SolidElement).size.x}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    updateElement(selectedElementId!, { size: { x: val, y: (selectedElement as SolidElement).size.y, z: val } });
                                }}
                                className="w-full"
                            />
                        </div>

                        {/* Rotation Axis */}
                        {['x', 'y', 'z'].map((axis) => {
                            const solid = selectedElement as SolidElement;
                            const rot = solid.rotation || { x: 0, y: 0, z: 0 };
                            return (
                                <div key={axis} className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="label-text">Rotación {axis.toUpperCase()}</span>
                                        <span className="magnitude-value">{Math.round((rot[axis as keyof typeof rot] * 180 / Math.PI) % 360)}°</span>
                                    </div>
                                    <input
                                        type="range" min="0" max={Math.PI * 2} step="0.01"
                                        value={rot[axis as keyof typeof rot]}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            updateElement(selectedElementId!, { rotation: { ...rot, [axis]: val } });
                                        }}
                                        className="w-full"
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-xs">Selecciona un <b>punto</b> para colocar el centro.</p>
                        <p className="text-[10px] opacity-60 italic">Podrás editarlo después haciendo clic sobre él.</p>
                    </div>
                )}

                {/* Resize Handle */}
                {isEditingSolid && (
                    <div
                        onMouseDown={onMouseDownResize}
                        className="absolute bottom-2 right-2 cursor-nwse-resize p-1 opacity-40 hover:opacity-100 transition-opacity"
                    >
                        <Maximize2 size={16} className="rotate-90" />
                    </div>
                )}
            </div>
        </>
    );
}
