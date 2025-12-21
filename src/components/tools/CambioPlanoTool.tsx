import { useEffect, useState } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { MousePointer2, Info, X } from 'lucide-react';

export default function CambioPlanoTool() {
    const { activeTool, setActiveTool, addAuxSystem, theme, elements, selectedForDistance, clearDistanceTool } = useGeometryStore();

    // This tool is "active" when activeTool is cambio-plano-h or cambio-plano-v
    const isActive = activeTool === 'cambio-plano-h' || activeTool === 'cambio-plano-v';

    const type = activeTool === 'cambio-plano-h' ? 'horizontal' : 'vertical';
    const isDark = theme === 'dark';

    // Monitor selection to trigger completion
    useEffect(() => {
        if (!isActive) return;

        if (selectedForDistance.length === 2) {
            const p1 = elements.find(e => e.id === selectedForDistance[0]);
            const p2 = elements.find(e => e.id === selectedForDistance[1]);

            if (p1?.type === 'point' && p2?.type === 'point') {
                const pt1 = p1 as import('../../types').PointElement;
                const pt2 = p2 as import('../../types').PointElement;

                // Logical mapping:
                // Cambio PV (Horizontal system): Direction comes from horizontal projections (coords.x, coords.y)
                // Cambio PH (Vertical system): Direction comes from vertical projections (coords.x, -coords.z)

                let base1, base2;
                if (type === 'horizontal') {
                    base1 = { x: pt1.coords.x, y: pt1.coords.y };
                    base2 = { x: pt2.coords.x, y: pt2.coords.y };
                } else {
                    base1 = { x: pt1.coords.x, y: -pt1.coords.z };
                    base2 = { x: pt2.coords.x, y: -pt2.coords.z };
                }

                const dx = base2.x - base1.x;
                const dy = base2.y - base1.y;
                const len = Math.sqrt(dx * dx + dy * dy);

                if (len > 0.001) {
                    addAuxSystem({
                        type,
                        point: { x: base1.x, y: base1.y, z: 0 },
                        direction: { x: dx / len, y: dy / len, z: 0 },
                        label: type === 'horizontal' ? "LT'" : "LT''"
                    });
                    setActiveTool('none');
                    clearDistanceTool();
                }
            }
        }
    }, [selectedForDistance, isActive, type, elements, addAuxSystem, setActiveTool, clearDistanceTool]);

    if (!isActive) return null;

    return (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 flex flex-col gap-3 min-w-[320px] ${isDark ? 'bg-gray-900/90 text-white' : 'bg-white/90 text-gray-900'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <MousePointer2 size={20} className="text-blue-500" />
                    </div>
                    <h3 className="font-bold text-sm">Cambio de Plano {type === 'horizontal' ? 'Vertical (LT\')' : 'Horizontal (LT\'\')'}</h3>
                </div>
                <button
                    onClick={() => {
                        setActiveTool('none');
                        clearDistanceTool();
                    }}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'} flex gap-3`}>
                <Info size={18} className="text-blue-500 shrink-0" />
                <p className="text-xs leading-relaxed">
                    Selecciona <b>2 puntos</b> de la pantalla para definir la nueva Línea de Tierra y ver las nuevas proyecciones.
                </p>
            </div>

            <div className="flex justify-center py-2">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${selectedForDistance.length >= 1 ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400 text-gray-400'}`}>1</div>
                        <span className="text-[10px]">Punto 1</span>
                    </div>
                    <div className={`h-0.5 w-12 ${selectedForDistance.length >= 2 ? 'bg-blue-500' : 'bg-gray-400'}`} />
                    <div className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${selectedForDistance.length >= 2 ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400 text-gray-400'}`}>2</div>
                        <span className="text-[10px]">Punto 2</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
