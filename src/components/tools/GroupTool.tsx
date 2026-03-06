import { useState } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { Check, X } from 'lucide-react';

export default function GroupTool() {
    const { activeTool, selectedForDistance, createGroup, setActiveTool, clearDistanceTool, elements, theme } = useGeometryStore();
    const [groupName, setGroupName] = useState('');

    if (activeTool !== 'create-group') return null;

    const handleConfirm = () => {
        if (selectedForDistance.length === 0) {
            alert('Selecciona al menos un elemento para crear un grupo.');
            return;
        }
        const name = groupName.trim() || `Grupo ${elements.filter(e => e.type === 'group').length + 1}`;
        createGroup(name, selectedForDistance);
        setActiveTool('none');
        clearDistanceTool();
        setGroupName('');
    };

    const isDark = theme === 'dark';

    return (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all ${isDark ? 'bg-gray-900/90 border-blue-500/50 text-white' : 'bg-white/90 border-blue-200 text-gray-900'}`}>
            <div className="flex flex-col gap-3 min-w-[240px]">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        Agrupar Elementos
                    </h3>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-mono">
                        {selectedForDistance.length} selecc.
                    </span>
                </div>

                <input
                    type="text"
                    placeholder="Nombre del grupo..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-gray-200'}`}
                />

                <div className="flex gap-2">
                    <button
                        onClick={() => { setActiveTool('none'); clearDistanceTool(); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                        <X size={14} /> Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-[1.5] flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all"
                    >
                        <Check size={14} /> Confirmar Grupo
                    </button>
                </div>
            </div>
        </div>
    );
}
