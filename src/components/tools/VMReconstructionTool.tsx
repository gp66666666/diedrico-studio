import { useGeometryStore } from '../../store/geometryStore';
import { Check, X } from 'lucide-react';
import { calculateAbatimiento, calculatePlaneAbatimientoTraces } from '../../utils/mathUtils';
import { PointElement, SegmentElement, PlaneElement } from '../../types';

export default function VMReconstructionTool() {
    const { activeTool, selectedForDistance, setActiveTool, clearDistanceTool, elements, theme, addElement } = useGeometryStore();

    if (activeTool !== 'reconstruct-vm') return null;

    const planeSelection = selectedForDistance.filter(id => elements.find(e => e.id === id)?.type === 'plane');
    const elementSelection = selectedForDistance.filter(id => {
        const el = elements.find(e => e.id === id);
        return el?.type !== 'plane'; // Include points, lines, segments, groups, solids
    });

    const handleConfirm = () => {
        if (planeSelection.length === 0) {
            alert('Debes seleccionar un PLANO como referencia para la reconstrucción.');
            return;
        }
        if (elementSelection.length === 0) {
            alert('Selecciona al menos un elemento para reconstruir.');
            return;
        }

        const planeId = planeSelection[planeSelection.length - 1];
        const plane = elements.find(e => e.id === planeId) as PlaneElement;

        // Recursive helper to process all elements including groups
        const processElement = (elId: string) => {
            const el = elements.find(e => e.id === elId);
            if (!el || !el.visible) return;

            if (el.type === 'point') {
                const p = el as PointElement;
                const abatedCoords = calculateAbatimiento(p.coords, plane);
                addElement({
                    type: 'point',
                    name: `(${p.name})`,
                    color: p.color,
                    role: 'abated',
                    parentPlaneId: planeId,
                    sourceElementId: p.id,
                    coords: abatedCoords
                } as any);
            } else if (el.type === 'segment') {
                const s = el as SegmentElement;
                const abatedP1 = calculateAbatimiento(s.p1, plane);
                const abatedP2 = calculateAbatimiento(s.p2, plane);
                addElement({
                    type: 'segment',
                    name: `(${s.name})`,
                    color: s.color,
                    role: 'abated',
                    parentPlaneId: planeId,
                    sourceElementId: s.id,
                    p1: abatedP1,
                    p2: abatedP2
                } as any);
            } else if (el.type === 'group') {
                const g = el as any; // GroupElement
                if (g.elements && Array.isArray(g.elements)) {
                    g.elements.forEach((childId: string) => processElement(childId));
                }
            }
        };

        // 1. Add persistent abated trace (P')
        const { O, abatedTraceV } = calculatePlaneAbatimientoTraces(plane);
        if (abatedTraceV) {
            addElement({
                type: 'line',
                name: `(${plane.name}')`,
                color: '#92400e',
                role: 'abated',
                parentPlaneId: planeId,
                point: O || abatedTraceV.p1,
                direction: {
                    x: abatedTraceV.p2.x - abatedTraceV.p1.x,
                    y: abatedTraceV.p2.y - abatedTraceV.p1.y,
                    z: 0
                },
                isInfinite: true
            } as any);
        }

        // 2. Add persistent abated elements recursively
        elementSelection.forEach(id => processElement(id));

        setActiveTool('none');
        clearDistanceTool();
    };

    const isDark = theme === 'dark';

    return (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all ${isDark ? 'bg-gray-900/90 border-purple-500/50 text-white' : 'bg-white/90 border-purple-200 text-gray-900'}`}>
            <div className="flex flex-col gap-3 min-w-[280px]">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        📏 Reconstruir VM
                    </h3>
                    <div className="flex gap-1">
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-mono">
                            {elementSelection.length} elem.
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${planeSelection.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {planeSelection.length > 0 ? 'Plano OK' : 'Falta Plano'}
                        </span>
                    </div>
                </div>

                <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Selecciona los elementos y el plano de charnela.
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={() => { setActiveTool('none'); clearDistanceTool(); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                        <X size={14} /> Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-[1.5] flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all"
                    >
                        <Check size={14} /> Reconstruir
                    </button>
                </div>
            </div>
        </div>
    );
}
