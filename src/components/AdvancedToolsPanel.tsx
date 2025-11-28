import { useState } from 'react';
import {
    ChevronDown, ChevronRight, Ruler, RotateCw,
    GitBranch, Box, Maximize2
} from 'lucide-react';
import { useGeometryStore } from '../store/geometryStore';

interface AdvancedToolsPanelProps {
    isDark: boolean;
}

export default function AdvancedToolsPanel({ isDark }: AdvancedToolsPanelProps) {
    const { setActiveTool, activeTool } = useGeometryStore();

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        distances: true,  // Open by default
        abatimientos: false,
        giros: false,
        cambiosPlano: false,
        solidos: false
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const sectionClass = `w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${isDark ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-gray-100 text-gray-800'
        }`;

    const contentClass = `ml-4 mt-2 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
    const getButtonClass = (tool: string) => `w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${activeTool === tool
            ? 'bg-blue-500/20 text-blue-600 border border-blue-500/50 font-semibold'
            : isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-600'
        }`;

    return (
        <div className="space-y-2">
            {/* DISTANCIAS */}
            <div>
                <button
                    onClick={() => toggleSection('distances')}
                    className={sectionClass}
                >
                    <span className="flex items-center gap-2">
                        <Ruler size={16} />
                        Distancias
                    </span>
                    {expandedSections.distances ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedSections.distances && (
                    <div className={contentClass}>
                        <button
                            className={getButtonClass('distance-point-point')}
                            onClick={() => setActiveTool(activeTool === 'distance-point-point' ? 'none' : 'distance-point-point')}
                        >
                            📏 Punto - Punto
                            {activeTool === 'distance-point-point' && (
                                <span className="ml-2 text-xs opacity-70">(activo)</span>
                            )}
                        </button>
                        <button
                            className={getButtonClass('distance-point-line')}
                            onClick={() => setActiveTool(activeTool === 'distance-point-line' ? 'none' : 'distance-point-line')}
                            disabled
                            title="Próximamente"
                        >
                            📐 Punto - Recta
                            <span className="ml-2 text-xs opacity-50">(pronto)</span>
                        </button>
                        <button
                            className={getButtonClass('distance-point-plane')}
                            onClick={() => setActiveTool(activeTool === 'distance-point-plane' ? 'none' : 'distance-point-plane')}
                            disabled
                            title="Próximamente"
                        >
                            📋 Punto - Plano
                            <span className="ml-2 text-xs opacity-50">(pronto)</span>
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            ↔️ Recta - Recta
                            <span className="ml-2 text-xs opacity-50">(pronto)</span>
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            ⬌ Recta - Plano
                            <span className="ml-2 text-xs opacity-50">(pronto)</span>
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            ▭ Plano - Plano
                            <span className="ml-2 text-xs opacity-50">(pronto)</span>
                        </button>
                    </div>
                )}
            </div>

            {/* ABATIMIENTOS */}
            <div>
                <button
                    onClick={() => toggleSection('abatimientos')}
                    className={sectionClass}
                >
                    <span className="flex items-center gap-2">
                        <GitBranch size={16} className="rotate-90" />
                        Abatimientos
                    </span>
                    {expandedSections.abatimientos ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedSections.abatimientos && (
                    <div className={contentClass}>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            ⬇️ Abatir sobre PH
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            ➡️ Abatir sobre PV
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🔄 Abatir sobre Traza
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            ↩️ Desabatir
                        </button>
                        <div className={`px-3 py-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Ver verdaderas magnitudes
                        </div>
                    </div>
                )}
            </div>

            {/* GIROS */}
            <div>
                <button
                    onClick={() => toggleSection('giros')}
                    className={sectionClass}
                >
                    <span className="flex items-center gap-2">
                        <RotateCw size={16} />
                        Giros
                    </span>
                    {expandedSections.giros ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedSections.giros && (
                    <div className={contentClass}>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🔄 Giro Vertical
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🔁 Giro de Punta
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            ↔️ Giro Paralelo a LT
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🌀 Giro Eje Cualquiera
                        </button>
                    </div>
                )}
            </div>

            {/* CAMBIOS DE PLANO */}
            <div>
                <button
                    onClick={() => toggleSection('cambiosPlano')}
                    className={sectionClass}
                >
                    <span className="flex items-center gap-2">
                        <Maximize2 size={16} />
                        Cambios de Plano
                    </span>
                    {expandedSections.cambiosPlano ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedSections.cambiosPlano && (
                    <div className={contentClass}>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            📐 Cambiar Plano Vertical
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            📏 Cambiar Plano Horizontal
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🔄 Doble Cambio de Plano
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            📋 Gestionar Sistemas
                        </button>
                    </div>
                )}
            </div>

            {/* SÓLIDOS */}
            <div>
                <button
                    onClick={() => toggleSection('solidos')}
                    className={sectionClass}
                >
                    <span className="flex items-center gap-2">
                        <Box size={16} />
                        Sólidos
                    </span>
                    {expandedSections.solidos ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedSections.solidos && (
                    <div className={contentClass}>
                        {/* Poliedros */}
                        <div className={`px-3 py-1 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                            Poliedros
                        </div>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🔺 Tetraedro
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🟦 Cubo/Hexaedro
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🔶 Octaedro
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            ⬟ Dodecaedro
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🔷 Icosaedro
                        </button>

                        {/* Prismáticos */}
                        <div className={`px-3 py-1 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase mt-2`}>
                            Prismáticos
                        </div>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            ▭ Prisma
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🔺 Pirámide
                        </button>

                        {/* Revolución */}
                        <div className={`px-3 py-1 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase mt-2`}>
                            Revolución
                        </div>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🥫 Cilindro
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🍦 Cono
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            ⚫ Esfera
                        </button>

                        {/* Operaciones */}
                        <div className={`px-3 py-1 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase mt-2`}>
                            Operaciones
                        </div>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            ✂️ Sección Plana
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            🔗 Intersecciones
                        </button>
                        <button className={`${getButtonClass('')} opacity-50 cursor-not-allowed`} disabled>
                            📄 Desarrollos
                        </button>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className={`mt-4 p-3 rounded-lg text-xs ${isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                <p className="font-semibold mb-1">💡 Instrucciones</p>
                {activeTool === 'distance-point-point' ? (
                    <p className="opacity-80">
                        <strong>Distancia Punto-Punto:</strong><br />
                        Haz click en dos puntos en la lista para calcular su distancia.
                    </p>
                ) : (
                    <p className="opacity-80">
                        Estas herramientas se irán habilitando progresivamente.
                        Comenzamos con <strong>Punto-Punto</strong>.
                    </p>
                )}
            </div>
        </div>
    );
}
