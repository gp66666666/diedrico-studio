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
        distances: false,
        abatimientos: false,
        intersecciones: false,
        verdaderaMagnitud: false,
        paralelismo: false,
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
                        >
                            📐 Punto - Recta
                        </button>
                        <button
                            className={getButtonClass('distance-point-plane')}
                            onClick={() => setActiveTool(activeTool === 'distance-point-plane' ? 'none' : 'distance-point-plane')}
                        >
                            📋 Punto - Plano
                        </button>
                        <button
                            className={getButtonClass('distance-line-line')}
                            onClick={() => setActiveTool(activeTool === 'distance-line-line' ? 'none' : 'distance-line-line')}
                        >
                            ↔️ Recta - Recta
                        </button>
                        <button
                            className={getButtonClass('distance-line-plane')}
                            onClick={() => setActiveTool(activeTool === 'distance-line-plane' ? 'none' : 'distance-line-plane')}
                        >
                            ⬌ Recta - Plano
                        </button>
                        <button
                            className={getButtonClass('distance-plane-plane')}
                            onClick={() => setActiveTool(activeTool === 'distance-plane-plane' ? 'none' : 'distance-plane-plane')}
                        >
                            ▭ Plano - Plano
                        </button>
                    </div>
                )}
            </div>

            {/* ABATIMIENTOS (DISABLED)
             <div>
                 <button
@@ -136,5 +136,5 @@
 
                     </div>
                 )}
-            </div>
+            </div> */}

            {/* INTERSECCIONES */}
            <div>
                <button
                    onClick={() => toggleSection('intersecciones')}
                    className={sectionClass}
                >
                    <span className="flex items-center gap-2">
                        <GitBranch size={16} className="rotate-0" />
                        Intersecciones
                    </span>
                    {expandedSections.intersecciones ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedSections.intersecciones && (
                    <div className={contentClass}>
                        <div className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Básicos (2 Elementos)</div>
                        <button
                            className={getButtonClass('intersection-line-line')}
                            onClick={() => setActiveTool(activeTool === 'intersection-line-line' ? 'none' : 'intersection-line-line')}
                        >
                            ✖️ Recta ∩ Recta
                        </button>
                        <button
                            className={getButtonClass('intersection-line-plane')}
                            onClick={() => setActiveTool(activeTool === 'intersection-line-plane' ? 'none' : 'intersection-line-plane')}
                        >
                            ⊕ Recta ∩ Plano
                        </button>
                        <button
                            className={getButtonClass('intersection-plane-plane')}
                            onClick={() => setActiveTool(activeTool === 'intersection-plane-plane' ? 'none' : 'intersection-plane-plane')}
                        >
                            ⊞ Plano ∩ Plano
                        </button>


                        <div className="mt-3 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Avanzados (3 Elementos)</div>
                        <button
                            className={getButtonClass('advanced-intersection-3-planes')}
                            onClick={() => setActiveTool(activeTool === 'advanced-intersection-3-planes' ? 'none' : 'advanced-intersection-3-planes')}
                        >
                            3 Planos ∩
                        </button>
                        <button
                            className={getButtonClass('advanced-intersection-3-lines')}
                            onClick={() => setActiveTool(activeTool === 'advanced-intersection-3-lines' ? 'none' : 'advanced-intersection-3-lines')}
                        >
                            3 Rectas ∩
                        </button>
                        <button
                            className={getButtonClass('advanced-intersection-2planes-1line')}
                            onClick={() => setActiveTool(activeTool === 'advanced-intersection-2planes-1line' ? 'none' : 'advanced-intersection-2planes-1line')}
                        >
                            2 Planos + Recta ∩
                        </button>
                        <button
                            className={getButtonClass('advanced-intersection-2lines-1plane')}
                            onClick={() => setActiveTool(activeTool === 'advanced-intersection-2lines-1plane' ? 'none' : 'advanced-intersection-2lines-1plane')}
                        >
                            2 Rectas + Plano ∩
                        </button>

                        <div className={`px-3 py-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Selecciona los elementos en la Lista
                        </div>
                    </div>
                )}
            </div>




            {/* VERDADERA MAGNITUD */}
            <div>
                <button
                    onClick={() => toggleSection('verdaderaMagnitud')}
                    className={sectionClass}
                >
                    <span className="flex items-center gap-2">
                        <Ruler size={16} />
                        Verdadera Magnitud
                    </span>
                    {expandedSections.verdaderaMagnitud ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedSections.verdaderaMagnitud && (
                    <div className={contentClass}>
                        <button
                            className={getButtonClass('true-length')}
                            onClick={() => setActiveTool(activeTool === 'true-length' ? 'none' : 'true-length')}
                        >
                            📏 Longitud de Recta
                        </button>
                        <button
                            className={getButtonClass('angle-line-line')}
                            onClick={() => setActiveTool(activeTool === 'angle-line-line' ? 'none' : 'angle-line-line')}
                        >
                            📐 Ángulo Recta-Recta
                        </button>
                        <button
                            className={getButtonClass('angle-line-plane')}
                            onClick={() => setActiveTool(activeTool === 'angle-line-plane' ? 'none' : 'angle-line-plane')}
                        >
                            📐 Ángulo Recta-Plano
                        </button>
                        <button
                            className={getButtonClass('angle-plane-plane')}
                            onClick={() => setActiveTool(activeTool === 'angle-plane-plane' ? 'none' : 'angle-plane-plane')}
                        >
                            📐 Ángulo Plano-Plano
                        </button>
                        <div className={`px-3 py-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Calcula dimensiones reales
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <button
                                onClick={() => setActiveTool(activeTool === 'reconstruct-vm' ? 'none' : 'reconstruct-vm')}
                                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTool === 'reconstruct-vm'
                                    ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                                    : 'bg-purple-600/10 text-purple-400 border border-purple-500/30 hover:bg-purple-600/20'
                                    }`}
                            >
                                <Maximize2 size={16} /> RECONSTRUIR EN VM
                            </button>
                            <p className="text-[10px] text-gray-500 mt-2 text-center">
                                Selecciona elementos y un plano para ver su VM
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* PARALELISMO Y PERPENDICULARIDAD */}
            <div>
                <button
                    onClick={() => toggleSection('paralelismo')}
                    className={sectionClass}
                >
                    <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M3 12h18M3 18h18" />
                        </svg>
                        Paralelismo / Perpendicularidad
                    </span>
                    {expandedSections.paralelismo ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedSections.paralelismo && (
                    <div className={contentClass}>
                        <div className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Básicos (1 Referencia)</div>
                        <button
                            className={getButtonClass('parallel-line-line')}
                            onClick={() => setActiveTool(activeTool === 'parallel-line-line' ? 'none' : 'parallel-line-line')}
                        >
                            ∥ Recta Paralela a Recta
                        </button>
                        <button
                            className={getButtonClass('plane-parallel-plane')}
                            onClick={() => setActiveTool(activeTool === 'plane-parallel-plane' ? 'none' : 'plane-parallel-plane')}
                        >
                            ∥ Plano Paralelo a Plano
                        </button>
                        <button
                            className={getButtonClass('parallel-line-plane')}
                            onClick={() => setActiveTool(activeTool === 'parallel-line-plane' ? 'none' : 'parallel-line-plane')}
                        >
                            ∥ Recta Paralela a Plano
                        </button>
                        <button
                            className={getButtonClass('plane-parallel-line')}
                            onClick={() => setActiveTool(activeTool === 'plane-parallel-line' ? 'none' : 'plane-parallel-line')}
                        >
                            ∥ Plano Paralelo a Recta
                        </button>
                        <button
                            className={getButtonClass('perp-line-plane')}
                            onClick={() => setActiveTool(activeTool === 'perp-line-plane' ? 'none' : 'perp-line-plane')}
                        >
                            ⊥ Recta Perpendicular a Plano
                        </button>
                        <button
                            className={getButtonClass('perp-plane-line')}
                            onClick={() => setActiveTool(activeTool === 'perp-plane-line' ? 'none' : 'perp-plane-line')}
                        >
                            ⊥ Plano Perpendicular a Recta
                        </button>
                        <button
                            className={getButtonClass('perp-line-line')}
                            onClick={() => setActiveTool(activeTool === 'perp-line-line' ? 'none' : 'perp-line-line')}
                        >
                            ⊥ Recta Perpendicular a Recta
                        </button>

                        <div className="mt-3 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Avanzados (2 Referencias)</div>
                        <button
                            className={getButtonClass('plane-perp-2-planes')}
                            onClick={() => setActiveTool(activeTool === 'plane-perp-2-planes' ? 'none' : 'plane-perp-2-planes')}
                        >
                            ⊥ Plano Perpendicular a 2 Planos
                        </button>
                        <button
                            className={getButtonClass('line-parallel-2-planes')}
                            onClick={() => setActiveTool(activeTool === 'line-parallel-2-planes' ? 'none' : 'line-parallel-2-planes')}
                        >
                            ∥ Recta Paralela a 2 Planos
                        </button>
                        <button
                            className={getButtonClass('plane-parallel-2-lines')}
                            onClick={() => setActiveTool(activeTool === 'plane-parallel-2-lines' ? 'none' : 'plane-parallel-2-lines')}
                        >
                            ∥ Plano Paralelo a 2 Rectas
                        </button>

                        <div className={`mt-2 px-3 py-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Selecciona Punto + Referencias
                        </div>
                    </div>
                )}
            </div>


            {/* GIROS (DISABLED)
             <div>
                 <button
@@ -382,5 +382,5 @@
                         </div>
                     </div>
                 )}
-            </div>
+            </div> */}

            {/* CAMBIOS DE PLANO (DISABLED)
             <div>
                 <button
@@ -414,5 +414,5 @@
 
                     </div>
                 )}
-            </div>
+            </div> */}

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
                        <button
                            className={getButtonClass('poliedro-tetraedro')}
                            onClick={() => setActiveTool(activeTool === 'poliedro-tetraedro' ? 'none' : 'poliedro-tetraedro')}
                        >
                            🔺 Tetraedro
                        </button>
                        <button
                            className={getButtonClass('poliedro-cubo')}
                            onClick={() => setActiveTool(activeTool === 'poliedro-cubo' ? 'none' : 'poliedro-cubo')}
                        >
                            🟦 Cubo/Hexaedro
                        </button>
                        <button
                            className={getButtonClass('poliedro-octaedro')}
                            onClick={() => setActiveTool(activeTool === 'poliedro-octaedro' ? 'none' : 'poliedro-octaedro')}
                        >
                            🔶 Octaedro
                        </button>
                        <button
                            className={getButtonClass('poliedro-dodecaedro')}
                            onClick={() => setActiveTool(activeTool === 'poliedro-dodecaedro' ? 'none' : 'poliedro-dodecaedro')}
                        >
                            ⬟ Dodecaedro
                        </button>
                        <button
                            className={getButtonClass('poliedro-icosaedro')}
                            onClick={() => setActiveTool(activeTool === 'poliedro-icosaedro' ? 'none' : 'poliedro-icosaedro')}
                        >
                            🔷 Icosaedro
                        </button>

                        {/* Prismáticos */}
                        <div className={`px-3 py-1 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase mt-2`}>
                            Prismáticos
                        </div>
                        <button
                            className={getButtonClass('solid-prisma')}
                            onClick={() => setActiveTool(activeTool === 'solid-prisma' ? 'none' : 'solid-prisma')}
                        >
                            ▭ Prisma
                        </button>
                        <button
                            className={getButtonClass('solid-piramide')}
                            onClick={() => setActiveTool(activeTool === 'solid-piramide' ? 'none' : 'solid-piramide')}
                        >
                            🔺 Pirámide
                        </button>

                        {/* Revolución */}
                        <div className={`px-3 py-1 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase mt-2`}>
                            Revolución
                        </div>
                        <button
                            className={getButtonClass('revolucion-cilindro')}
                            onClick={() => setActiveTool(activeTool === 'revolucion-cilindro' ? 'none' : 'revolucion-cilindro')}
                        >
                            🥫 Cilindro
                        </button>
                        <button
                            className={getButtonClass('revolucion-cono')}
                            onClick={() => setActiveTool(activeTool === 'revolucion-cono' ? 'none' : 'revolucion-cono')}
                        >
                            🍦 Cono
                        </button>
                        <button
                            className={getButtonClass('revolucion-esfera')}
                            onClick={() => setActiveTool(activeTool === 'revolucion-esfera' ? 'none' : 'revolucion-esfera')}
                        >
                            ⚫ Esfera
                        </button>

                        {/* Operaciones */}
                        <div className={`px-3 py-1 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase mt-2`}>
                            Operaciones (Próximamente)
                        </div>
                        <button className={`${getButtonClass('solid-section')} opacity-50 cursor-not-allowed`} disabled>
                            ✂️ Sección Plana
                        </button>
                        <button className={`${getButtonClass('solid-intersection')} opacity-50 cursor-not-allowed`} disabled>
                            🔗 Intersecciones
                        </button>
                        <button className={`${getButtonClass('solid-development')} opacity-50 cursor-not-allowed`} disabled>
                            📄 Desarrollos
                        </button>

                    </div>
                )}
            </div>


        </div >
    );
}
