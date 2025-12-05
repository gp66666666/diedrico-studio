import React, { useState } from 'react';
import {
    MousePointer2, Dot, Minus, ArrowUpRight, ArrowLeftRight,
    Circle as CircleIcon, Spline, Hexagon, Orbit, TrendingUp, Infinity as InfinityIcon,
    GitCommitVertical, FoldVertical, Slash, Type, RotateCw, Scaling, Eraser,
    ChevronDown, ChevronRight, Palette, Pencil, Construction, Move3d, Ruler
} from 'lucide-react';
import { SketchTool } from '../types';

interface SketchToolbarProps {
    activeTool: SketchTool;
    setActiveTool: (tool: SketchTool) => void;
    selectedColor: string;
    setSelectedColor: (color: string) => void;
    isDark: boolean;
    isHidden?: boolean;
}

const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#ffffff'];

type ToolGroup = {
    id: string;
    name: string;
    icon: React.ReactNode;
    tools: {
        id: SketchTool;
        icon: React.ReactNode;
        label: string;
    }[];
};

const TOOL_GROUPS: ToolGroup[] = [
    {
        id: 'basic',
        name: 'Básicos',
        icon: <MousePointer2 size={18} />,
        tools: [
            { id: 'select', icon: <MousePointer2 size={18} />, label: 'Seleccionar' },
            { id: 'eraser', icon: <Eraser size={18} />, label: 'Borrar' },
            { id: 'text', icon: <Type size={18} />, label: 'Texto' },
        ]
    },
    {
        id: 'draw',
        name: 'Dibujo',
        icon: <Pencil size={18} />,
        tools: [
            { id: 'point', icon: <Dot size={18} />, label: 'Punto' },
            { id: 'segment', icon: <Minus size={18} />, label: 'Segmento' },
            { id: 'ray', icon: <ArrowUpRight size={18} />, label: 'Semirrecta' },
            { id: 'line', icon: <ArrowLeftRight size={18} />, label: 'Recta' },
            { id: 'polygon', icon: <Hexagon size={18} />, label: 'Polígono' },
        ]
    },
    {
        id: 'shapes',
        name: 'Curvas',
        icon: <CircleIcon size={18} />,
        tools: [
            { id: 'circle', icon: <CircleIcon size={18} />, label: 'Círculo' },
            { id: 'arc', icon: <Spline size={18} />, label: 'Arco' },
            { id: 'ellipse', icon: <Orbit size={18} />, label: 'Elipse' },
            { id: 'parabola', icon: <TrendingUp size={18} />, label: 'Parábola' },
            { id: 'hyperbola', icon: <InfinityIcon size={18} />, label: 'Hipérbola' },
        ]
    },
    {
        id: 'construct',
        name: 'Construcción',
        icon: <Construction size={18} />,
        tools: [
            { id: 'mediatriz', icon: <GitCommitVertical size={18} />, label: 'Mediatriz' },
            { id: 'bisectriz', icon: <FoldVertical size={18} />, label: 'Bisectriz' },
            { id: 'tangent', icon: <Slash size={18} />, label: 'Tangentes' },
        ]
    },
    {
        id: 'modify',
        name: 'Modificar',
        icon: <Move3d size={18} />,
        tools: [
            { id: 'rotate', icon: <RotateCw size={18} />, label: 'Rotar' },
            { id: 'scale', icon: <Scaling size={18} />, label: 'Escalar' },
        ]
    },
    }
];

export default function SketchToolbar({ activeTool, setActiveTool, selectedColor, setSelectedColor, isDark, isHidden }: SketchToolbarProps) {
    const [expandedGroup, setExpandedGroup] = useState<string | null>('basic');

    const bgClass = isDark ? 'bg-gray-800/90 backdrop-blur-md border-gray-700 text-gray-200' : 'bg-white/90 backdrop-blur-md border-gray-200 text-gray-700';
    const hoverClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
    const activeClass = isDark ? 'bg-blue-900/50 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-200';

    const toggleGroup = (id: string) => {
        setExpandedGroup(expandedGroup === id ? null : id);
    };

    return (
        <>
            {/* Desktop Toolbar (Left Side) */}
            <div className={`hidden md:flex flex-col gap-2 p-2 rounded-xl border shadow-lg w-16 hover:w-64 transition-all duration-300 group absolute left-4 top-20 z-30 max-h-[80vh] overflow-y-auto overflow-x-hidden ${bgClass}`}>
                {TOOL_GROUPS.map(group => {
                    const activeToolInGroup = group.tools.find(t => t.id === activeTool);
                    const groupIcon = activeToolInGroup ? activeToolInGroup.icon : group.icon;
                    const isGroupActive = !!activeToolInGroup;

                    return (
                        <div key={group.id} className="flex flex-col">
                            <button
                                onClick={() => toggleGroup(group.id)}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors w-full ${hoverClass} ${expandedGroup === group.id ? 'bg-opacity-50' : ''} ${isGroupActive && expandedGroup !== group.id ? activeClass : ''}`}
                                title={group.name}
                            >
                                <div className="min-w-[24px] flex justify-center">{groupIcon}</div>
                                <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-1 text-left">
                                    {group.name}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {expandedGroup === group.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                            </button>

                            {expandedGroup === group.id && (
                                <div className="flex flex-col gap-1 mt-1 transition-all duration-200 group-hover:ml-2 group-hover:pl-2 group-hover:border-l border-gray-200/20">
                                    {group.tools.map(tool => (
                                        <button
                                            key={tool.id}
                                            onClick={() => setActiveTool(tool.id)}
                                            className={`flex items-center gap-3 p-2 rounded-lg text-xs transition-all w-full border border-transparent ${activeTool === tool.id ? activeClass : hoverClass}`}
                                            title={tool.label}
                                        >
                                            <div className="min-w-[20px] flex justify-center">{tool.icon}</div>
                                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">{tool.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className={`h-px my-1 w-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

                {/* Color Picker (Desktop) */}
                <div className="flex flex-col gap-2 p-1">
                    <div className="flex items-center gap-3 p-1">
                        <Palette size={18} />
                        <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">Color</span>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center group-hover:justify-start">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => setSelectedColor(c)}
                                className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 ${selectedColor === c ? 'border-white ring-1 ring-black scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Toolbar (Bottom) */}
            {!isHidden && (
                <div className={`md:hidden absolute bottom-0 left-0 right-0 border-t z-40 pb-4 ${bgClass}`}>
                    <div className="flex overflow-x-auto p-2 gap-2 no-scrollbar">
                        {TOOL_GROUPS.flatMap(g => g.tools).map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] gap-1 border border-transparent ${activeTool === tool.id ? activeClass : hoverClass}`}
                            >
                                {tool.icon}
                                <span className="text-[10px] whitespace-nowrap">{tool.label}</span>
                            </button>
                        ))}
                    </div>
                    {/* Mobile Color Picker Bar */}
                    <div className={`flex items-center gap-2 p-2 border-t overflow-x-auto ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Palette size={16} className="min-w-[16px]" />
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => setSelectedColor(c)}
                                className={`w-6 h-6 rounded-full border flex-shrink-0 ${selectedColor === c ? 'border-white ring-1 ring-black' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
