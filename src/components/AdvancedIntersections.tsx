import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useGeometryStore } from '../store/geometryStore';

interface AdvancedIntersectionsProps {
    isDark?: boolean;
}

export default function AdvancedIntersections({ isDark = true }: AdvancedIntersectionsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { activeTool, setActiveTool, selectedForDistance, clearDistanceTool } = useGeometryStore();

    const buttons = [
        {
            id: 'advanced-intersection-3-planes',
            label: '3 Planos ∩',
            description: 'Intersección de 3 planos → Punto',
        },
        {
            id: 'advanced-intersection-3-lines',
            label: '3 Rectas ∩',
            description: 'Intersección de 3 rectas → Punto',
        },
        {
            id: 'advanced-intersection-2planes-1line',
            label: '2 Planos + Recta ∩',
            description: '2 planos + 1 recta → Punto',
        },
        {
            id: 'advanced-intersection-2lines-1plane',
            label: '2 Rectas + Plano ∩',
            description: '2 rectas + 1 plano → 2 Puntos',
        },
    ];

    const handleButtonClick = (toolId: string) => {
        if (activeTool === toolId) {
            // Deactivate
            setActiveTool('none');
            clearDistanceTool();
        } else {
            // Activate
            setActiveTool(toolId as any);
            clearDistanceTool();
        }
    };

    const isAdvancedToolActive = activeTool?.startsWith('advanced-intersection');
    const selectionCount = isAdvancedToolActive ? selectedForDistance.length : 0;

    return (
        <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <div>
                    <h3 className="text-sm font-semibold">Intersecciones Avanzadas</h3>
                    <p className="text-xs text-gray-400">(3 elementos)</p>
                </div>
                <div className="flex items-center gap-2">
                    {isAdvancedToolActive && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white">
                            {selectionCount}/3
                        </span>
                    )}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="mt-3 space-y-2">
                    {buttons.map((button) => {
                        const isActive = activeTool === button.id;

                        return (
                            <button
                                key={button.id}
                                onClick={() => handleButtonClick(button.id)}
                                className={`w-full px-3 py-2 rounded text-xs font-medium transition-all text-left ${isActive
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : isDark
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                title={button.description}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{button.label}</span>
                                    {isActive && selectionCount > 0 && (
                                        <span className="text-xs opacity-75">
                                            {selectionCount}/3
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                    {button.description}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
