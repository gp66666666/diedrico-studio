import { useState } from 'react';
import {
    ChevronDown, ChevronRight, Ruler, RotateCw,
    GitBranch, Box, Layers
} from 'lucide-react';
import { useGeometryStore } from '../store/geometryStore';

interface AdvancedToolsPanelProps {
    isDark: boolean;
}

type Tool = { id: string; label: string };
type Group = { id: string; label?: string; tools: Tool[] };
type Section = { id: string; label: string; icon: typeof Ruler; groups: Group[] };

/**
 * Panel de herramientas agrupado por VERBO, no por nombre de concepto:
 * medir, intersecar, construir, transformar y operar con sólidos.
 *
 * Las creaciones (punto, recta, plano, sólido) viven solo en «Añadir»: aquí no
 * se repiten. Cada herramienta aparece una sola vez.
 */
const SECTIONS: Section[] = [
    {
        id: 'medir',
        label: 'Medir',
        icon: Ruler,
        groups: [
            {
                id: 'distancias',
                tools: [
                    { id: 'distance-point-point', label: '📏 Punto - Punto' },
                    { id: 'distance-point-line', label: '📐 Punto - Recta' },
                    { id: 'distance-point-plane', label: '📋 Punto - Plano' },
                    { id: 'distance-line-line', label: '↔️ Recta - Recta' },
                    { id: 'distance-line-plane', label: '⬌ Recta - Plano' },
                    { id: 'distance-plane-plane', label: '▭ Plano - Plano' },
                    { id: 'true-length', label: '📏 Longitud de una recta' },
                    { id: 'angle-line-line', label: '📐 Ángulo recta - recta' },
                    { id: 'angle-line-plane', label: '📐 Ángulo recta - plano' },
                    { id: 'angle-plane-plane', label: '📐 Ángulo plano - plano' },
                ],
            },
        ],
    },
    {
        id: 'intersecar',
        label: 'Intersecar',
        icon: GitBranch,
        groups: [
            {
                id: 'basicas',
                label: 'Básicas',
                tools: [
                    { id: 'intersection-line-line', label: '✖️ Recta ∩ Recta' },
                    { id: 'intersection-line-plane', label: '⊕ Recta ∩ Plano' },
                    { id: 'intersection-plane-plane', label: '⊞ Plano ∩ Plano' },
                ],
            },
            {
                id: 'avanzadas',
                label: 'Más casos',
                tools: [
                    { id: 'advanced-intersection-3-planes', label: '⊞ 3 planos' },
                    { id: 'advanced-intersection-3-lines', label: '✖️ 3 rectas' },
                    { id: 'advanced-intersection-2planes-1line', label: '2 planos + recta' },
                    { id: 'advanced-intersection-2lines-1plane', label: '2 rectas + plano' },
                ],
            },
        ],
    },
    {
        id: 'construir',
        label: 'Construir',
        icon: Layers,
        groups: [
            {
                id: 'paralelas',
                label: 'Paralelas',
                tools: [
                    { id: 'parallel-line-line', label: '∥ Recta paralela a recta' },
                    { id: 'plane-parallel-plane', label: '∥ Plano paralelo a plano' },
                    { id: 'parallel-line-plane', label: '∥ Recta paralela a plano' },
                    { id: 'plane-parallel-line', label: '∥ Plano paralelo a recta' },
                    { id: 'line-parallel-2-planes', label: '∥ Recta paralela a 2 planos' },
                    { id: 'plane-parallel-2-lines', label: '∥ Plano paralelo a 2 rectas' },
                ],
            },
            {
                id: 'perpendiculares',
                label: 'Perpendiculares',
                tools: [
                    { id: 'perp-line-plane', label: '⊥ Recta perpendicular a plano' },
                    { id: 'perp-plane-line', label: '⊥ Plano perpendicular a recta' },
                    { id: 'perp-line-line', label: '⊥ Recta perpendicular a recta' },
                    { id: 'plane-perp-2-planes', label: '⊥ Plano perpendicular a 2 planos' },
                ],
            },
        ],
    },
    {
        id: 'transformar',
        label: 'Transformar',
        icon: RotateCw,
        groups: [
            {
                id: 'giros',
                label: 'Giros',
                tools: [
                    { id: 'rotation-point-axis', label: '🔄 Girar un punto' },
                    { id: 'rotation-any', label: '🔄 Girar recta, plano o sólido' },
                    { id: 'rotation-parallel-lt', label: '↔️ Poner una recta paralela a la LT' },
                ],
            },
            {
                id: 'cambios',
                label: 'Cambios de plano',
                tools: [
                    { id: 'cambio-plano-h', label: '🔼 Cambio de plano horizontal' },
                    { id: 'cambio-plano-v', label: '🔽 Cambio de plano vertical' },
                ],
            },
            {
                id: 'abatir',
                label: 'Abatir',
                tools: [
                    { id: 'abatir-ph', label: 'Abatir sobre el PH' },
                    { id: 'abatir-pv', label: 'Abatir sobre el PV' },
                    { id: 'abatir-traza', label: 'Abatir sobre una traza' },
                    { id: 'desabatir', label: 'Desabatir' },
                ],
            },
        ],
    },
    {
        id: 'solidos',
        label: 'Sólidos',
        icon: Box,
        groups: [
            {
                id: 'operaciones',
                label: 'Operaciones',
                tools: [
                    { id: 'solid-section', label: '✂️ Sección plana' },
                    { id: 'solid-intersection', label: '🔗 Intersección de dos sólidos' },
                    { id: 'line-solid', label: '📍 Recta y sólido (penetración)' },
                    { id: 'sphere-tangent', label: '⭕ Plano tangente (esfera, cono, cilindro)' },
                    { id: 'shadows', label: '☀️ Sombras sobre los planos' },
                    { id: 'cast-shadow', label: '🌗 Sombra arrojada' },
                    { id: 'solid-development', label: '📄 Desarrollo del sólido' },
                ],
            },
        ],
    },
];

export default function AdvancedToolsPanel({ isDark }: AdvancedToolsPanelProps) {
    const { setActiveTool, activeTool } = useGeometryStore();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    const sectionClass = `w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
        isDark ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-gray-100 text-gray-800'
    }`;

    const toolClass = (tool: string) => `w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
        activeTool === tool
            ? 'bg-blue-500/20 text-blue-600 border border-blue-500/50 font-semibold'
            : isDark
                ? 'hover:bg-white/5 text-gray-400'
                : 'hover:bg-gray-50 text-gray-600'
    }`;

    return (
        <div className="space-y-1">
            {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isOpen = !!expanded[section.id];
                return (
                    <div key={section.id}>
                        <button onClick={() => toggle(section.id)} className={sectionClass}>
                            <span className="flex items-center gap-2">
                                <Icon size={16} />
                                {section.label}
                            </span>
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {isOpen && (
                            <div className="ml-4 mt-1 space-y-2">
                                {section.groups.map((group) => (
                                    <div key={group.id}>
                                        {group.label && (
                                            <p className={`px-3 pt-1 text-[10px] font-bold uppercase tracking-wider ${
                                                isDark ? 'text-gray-500' : 'text-gray-500'
                                            }`}>
                                                {group.label}
                                            </p>
                                        )}
                                        <div className="space-y-1">
                                            {group.tools.map((tool) => (
                                                <button
                                                    key={tool.id}
                                                    className={toolClass(tool.id)}
                                                    onClick={() =>
                                                        setActiveTool(activeTool === tool.id ? 'none' : (tool.id as never))
                                                    }
                                                >
                                                    {tool.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
