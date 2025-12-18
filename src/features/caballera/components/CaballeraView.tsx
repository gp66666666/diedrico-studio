import { useState } from 'react';
import { useGeometryStore } from '../../../store/geometryStore';
import Cavalier3DView from './Cavalier3DView';
import Normative2DViews from './Normative2DViews';
import { Settings, Sliders, Hash, Plus, LineChart as LineIcon, Trash2, Box, Info } from 'lucide-react';

/**
 * Perspectiva Caballera View Component
 */
export default function CaballeraView() {
    const {
        theme, addElement, elements, clearAll,
        caballeraState, setCaballeraStep, updateCaballeraPreview
    } = useGeometryStore();
    const isDark = theme === 'dark';
    const [splitPos, setSplitPos] = useState(50);
    const [angle, setAngle] = useState(135); // Degrees (Cavalier standard)
    const [reduction, setReduction] = useState(0.5); // k factor

    const handleAddPoint = () => {
        addElement({
            type: 'point',
            name: `Punto ${elements.filter(e => e.type === 'point').length + 1}`,
            coords: { x: 2, y: 2, z: 2 },
            color: '#3b82f6'
        } as any);
    };

    const handleAddLine = () => {
        addElement({
            type: 'line',
            name: `Recta ${elements.filter(e => e.type === 'line').length + 1}`,
            point: { x: 0, y: 0, z: 0 },
            direction: { x: 1, y: 1, z: 1 },
            color: '#ef4444',
            lineType: 'any'
        } as any);
    };

    const handleAddBlock = () => {
        setCaballeraStep('waiting-alzado');
        updateCaballeraPreview({ x: 0, y: 0, z: 0 });
    };

    const handleClear = () => {
        if (confirm('¿Limpiar todo el espacio de trabajo?')) {
            clearAll();
        }
    };

    return (
        <div className={`w-full h-full flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Split View Container */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* 3D Cavalier Panel */}
                <div
                    style={{ width: `${splitPos}%` }}
                    className="h-full border-r border-white/10 relative group"
                >
                    <Cavalier3DView angle={angle} reduction={reduction} />
                    <div className="absolute top-4 left-4 z-10">
                        <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] uppercase tracking-widest font-bold text-white/70 border border-white/10">
                            Perspectiva Caballera (3D)
                        </span>
                    </div>
                </div>

                {/* Split Resizer (Simplistic for now) */}
                <div
                    className="absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-20"
                    style={{ left: `calc(${splitPos}% - 0.5px)` }}
                />

                {/* 2D Normative Panel */}
                <div
                    style={{ width: `${100 - splitPos}%` }}
                    className="h-full relative overflow-hidden"
                >
                    <Normative2DViews />
                    <div className="absolute top-4 left-4 z-10">
                        <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] uppercase tracking-widest font-bold text-white/70 border border-white/10">
                            Vistas Normalizadas (2D)
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Toolbar */}
            <div className={`h-14 border-t flex items-center px-6 gap-8 ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Sliders size={14} className="text-blue-500" />
                        <span className="text-[10px] uppercase font-bold text-white/40">Ángulo</span>
                        <input
                            type="range" min="0" max="180" value={angle}
                            onChange={(e) => setAngle(parseInt(e.target.value))}
                            className="w-24 accent-blue-600"
                        />
                        <span className="text-xs font-mono text-white/60 w-8">{angle}°</span>
                    </div>

                    <div className="w-px h-4 bg-white/10" />

                    <div className="flex items-center gap-2">
                        <Hash size={14} className="text-purple-500" />
                        <span className="text-[10px] uppercase font-bold text-white/40">Reducción (k)</span>
                        <input
                            type="range" min="0" max="100" value={reduction * 100}
                            onChange={(e) => setReduction(parseInt(e.target.value) / 100)}
                            className="w-24 accent-purple-600"
                        />
                        <span className="text-xs font-mono text-white/60 w-8">{reduction.toFixed(2)}</span>
                    </div>
                </div>

                <div className="w-px h-8 bg-white/10 mx-2" />

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAddPoint}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-md border border-blue-500/30 transition-colors text-xs font-bold"
                    >
                        <Plus size={14} /> PUNTO
                    </button>
                    <button
                        onClick={handleAddLine}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-md border border-red-500/30 transition-colors text-xs font-bold"
                    >
                        <LineIcon size={14} /> RECTA
                    </button>
                    <button
                        onClick={handleAddBlock}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors text-xs font-bold ${caballeraState.step !== 'idle'
                                ? 'bg-orange-600/20 text-orange-400 border-orange-500/30'
                                : 'bg-orange-600/10 hover:bg-orange-600/20 text-orange-400/80 border-orange-500/20'
                            }`}
                    >
                        <Box size={14} /> BLOQUE
                    </button>
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 rounded-md border border-white/10 transition-colors text-xs font-bold"
                    >
                        <Trash2 size={14} /> LIMPIAR
                    </button>
                </div>

                <div className="flex-1 flex justify-center">
                    {caballeraState.step !== 'idle' && (
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                            <Info size={14} className="text-orange-400 animate-pulse" />
                            <span className="text-[10px] uppercase font-bold tracking-wider text-white/70">
                                {caballeraState.step === 'waiting-alzado' ? 'Paso 1: Define Alzado (Ancho y Alto)' : 'Paso 2: Define Planta (Profundidad)'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                    Sistema Axonométrico • Caballera
                </div>
            </div>
        </div>
    );
}
