import { useState } from 'react';
import {
    Box, Layers, Eye, EyeOff, Plus, Trash2,
    Sun, Moon, Undo, Redo, ToggleLeft, ToggleRight, ArrowDownToLine, HelpCircle, Settings
} from 'lucide-react';
import { useGeometryStore } from '../store/geometryStore';
import type { GeometryElement, PointElement, LineElement, PlaneElement } from '../types';
import AdvancedToolsPanel from './AdvancedToolsPanel';
import { calculatePlaneFromTwoLines } from '../utils/mathUtils';

export default function Sidebar() {
    const {
        elements,
        addElement,
        removeElement,
        updateElement,
        toggleVisibility,
        selectedElementId,
        selectElement,
        showIntersections,
        toggleIntersections,
        showSystemPlanes,
        toggleSystemPlanes,
        isFlattened,
        toggleFlattening,
        history,
        undo,
        redo,
        theme,
        toggleTheme,
        toggleHelp,
        activeTool,
        selectForDistance
    } = useGeometryStore();

    const isDark = theme === 'dark';

    const [activeTab, setActiveTab] = useState<'add' | 'list' | 'tools'>('add');
    const [geometryType, setGeometryType] = useState<'point' | 'line' | 'plane'>('point');
    const [editingElementId, setEditingElementId] = useState<string | null>(null);

    // Point state
    const [pointName, setPointName] = useState('');
    const [pointCoords, setPointCoords] = useState({ x: 0, y: 0, z: 0 });

    // Line state
    const [lineName, setLineName] = useState('');
    const [lineMode, setLineMode] = useState<'2points' | 'pointDir'>('2points');
    const [lineType, setLineType] = useState<'generic' | 'vertical' | 'point' | 'parallel_lt' | 'profile'>('generic');
    const [lineP1Str, setLineP1Str] = useState({ x: '0', y: '0', z: '0' });
    const [lineP1, setLineP1] = useState({ x: 0, y: 0, z: 0 });
    const [lineP2, setLineP2] = useState({ x: 1, y: 1, z: 1 });
    const [lineDir, setLineDir] = useState({ x: 1, y: 1, z: 1 });

    // Plane state
    const [planeName, setPlaneName] = useState('');
    const [planeMode, setPlaneMode] = useState<'simple' | '3points' | 'normal' | 'equation' | '2lines' | 'intercepts'>('simple');
    const [planeType, setPlaneType] = useState<'generic' | 'horizontal' | 'frontal' | 'parallel_lt' | 'vertical' | 'canto' | 'through_lt' | 'profile'>('generic');
    const [planeP1, setPlaneP1] = useState({ x: 0, y: 0, z: 0 });
    const [planeP2, setPlaneP2] = useState({ x: 1, y: 0, z: 0 });
    const [planeP3, setPlaneP3] = useState({ x: 0, y: 1, z: 0 });
    const [planeNormal, setPlaneNormal] = useState({ x: 0, y: 0, z: 1 });
    const [planePoint, setPlanePoint] = useState({ x: 0, y: 0, z: 0 });
    const [planeEq, setPlaneEq] = useState({ a: 0, b: 0, c: 1, d: 0 });

    // Simple plane
    const [simpleAxis, setSimpleAxis] = useState<'x' | 'y' | 'z'>('z');
    const [simpleValue, setSimpleValue] = useState(0);

    // 2 lines mode
    const [selectedLine1Id, setSelectedLine1Id] = useState('');
    const [selectedLine2Id, setSelectedLine2Id] = useState('');
    const [planeIntercepts, setPlaneIntercepts] = useState({ x: 0, y: 0, z: 0 });

    const handleAddPoint = () => {
        const name = pointName.trim() || `Punto ${elements.filter(e => e.type === 'point').length + 1}`;
        const data = {
            type: 'point', name, color: '#ef4444', visible: true,
            coords: { ...pointCoords }
        };

        if (editingElementId) {
            updateElement(editingElementId, data as PointElement);
            setEditingElementId(null);
        } else {
            const id = Math.random().toString(36).substr(2, 9);
            addElement({ id, ...data } as PointElement);
        }
        setPointName('');
        setPointCoords({ x: 0, y: 0, z: 0 });
    };

    const handleAddLine = () => {
        const id = Math.random().toString(36).substr(2, 9);
        const name = lineName.trim() || `Recta ${elements.filter(e => e.type === 'line').length + 1}`;

        let direction = { ...lineDir };
        let p2 = undefined;
        let finalP1 = { ...lineP1 };

        // Smart Input Detection for Generic Mode
        if (lineType === 'generic') {
            const xEmpty = lineP1Str.x === '';
            const yEmpty = lineP1Str.y === '';
            const zEmpty = lineP1Str.z === '';

            // Parse existing values
            finalP1 = {
                x: parseFloat(lineP1Str.x) || 0,
                y: parseFloat(lineP1Str.y) || 0,
                z: parseFloat(lineP1Str.z) || 0
            };

            if (!xEmpty && !yEmpty && zEmpty) {
                // Vertical Line (Z is infinite/free)
                direction = { x: 0, y: 0, z: 1 };
            } else if (!xEmpty && yEmpty && !zEmpty) {
                // Point Line (Y is infinite/free) -> Perpendicular to VP
                direction = { x: 0, y: 1, z: 0 };
            } else if (xEmpty && !yEmpty && !zEmpty) {
                // Parallel to LT (X is infinite/free)
                direction = { x: 1, y: 0, z: 0 };
            } else if (lineMode === '2points') {
                direction = {
                    x: lineP2.x - finalP1.x,
                    y: lineP2.y - finalP1.y,
                    z: lineP2.z - finalP1.z
                };
                p2 = { ...lineP2 };
            }
        } else {
            // Explicit Type Selection
            if (lineType === 'vertical') direction = { x: 0, y: 0, z: 1 };
            else if (lineType === 'point') direction = { x: 0, y: 1, z: 0 };
            else if (lineType === 'parallel_lt') direction = { x: 1, y: 0, z: 0 };
            else if (lineType === 'profile') direction = { x: 0, y: lineDir.y, z: lineDir.z };
        }

        const data = {
            type: 'line', name, color: '#3b82f6', visible: true,
            point: finalP1, direction, p2
        };

        if (editingElementId) {
            updateElement(editingElementId, data as LineElement);
            setEditingElementId(null);
        } else {
            const id = Math.random().toString(36).substr(2, 9);
            addElement({ id, ...data } as LineElement);
        }
        setLineName('');
    };

    const handleAddPlane = () => {
        const id = Math.random().toString(36).substr(2, 9);
        const name = planeName.trim() || `Plano ${elements.filter(e => e.type === 'plane').length + 1}`;

        let normal = { x: 0, y: 0, z: 1 };
        let constant = 0;

        if (planeType !== 'generic') {
            if (planeType === 'horizontal') { normal = { x: 0, y: 0, z: 1 }; constant = -planeP1.z; }
            else if (planeType === 'frontal') { normal = { x: 0, y: 1, z: 0 }; constant = -planeP1.y; }
            else if (planeType === 'profile') { normal = { x: 1, y: 0, z: 0 }; constant = -planeP1.x; }
            else if (planeType === 'parallel_lt') { normal = { x: 0, y: planeNormal.y, z: planeNormal.z }; constant = -(normal.y * planeP1.y + normal.z * planeP1.z); }
            else if (planeType === 'vertical') { normal = { x: planeNormal.x, y: planeNormal.y, z: 0 }; constant = -(normal.x * planeP1.x + normal.y * planeP1.y); }
            else if (planeType === 'canto') { normal = { x: planeNormal.x, y: 0, z: planeNormal.z }; constant = -(normal.x * planeP1.x + normal.z * planeP1.z); }
            else if (planeType === 'through_lt') { normal = { x: 0, y: planeNormal.y, z: planeNormal.z }; constant = 0; }
        } else {
            if (planeMode === 'simple') {
                if (simpleAxis === 'x') { normal = { x: 1, y: 0, z: 0 }; constant = -simpleValue; }
                else if (simpleAxis === 'y') { normal = { x: 0, y: 1, z: 0 }; constant = -simpleValue; }
                else { normal = { x: 0, y: 0, z: 1 }; constant = -simpleValue; }
            } else if (planeMode === '3points') {
                const v1 = { x: planeP2.x - planeP1.x, y: planeP2.y - planeP1.y, z: planeP2.z - planeP1.z };
                const v2 = { x: planeP3.x - planeP1.x, y: planeP3.y - planeP1.y, z: planeP3.z - planeP1.z };
                normal = {
                    x: v1.y * v2.z - v1.z * v2.y,
                    y: v1.z * v2.x - v1.x * v2.z,
                    z: v1.x * v2.y - v1.y * v2.x
                };
                constant = -(normal.x * planeP1.x + normal.y * planeP1.y + normal.z * planeP1.z);
            } else if (planeMode === 'normal') {
                normal = { ...planeNormal };
                constant = -(normal.x * planePoint.x + normal.y * planePoint.y + normal.z * planePoint.z);
            } else if (planeMode === 'equation') {
                normal = { x: planeEq.a, y: planeEq.b, z: planeEq.c };
                constant = planeEq.d;
            } else if (planeMode === 'intercepts') {
                if (planeIntercepts.x !== 0 && planeIntercepts.y !== 0 && planeIntercepts.z !== 0) {
                    normal = { x: 1 / planeIntercepts.x, y: 1 / planeIntercepts.y, z: 1 / planeIntercepts.z };
                    constant = -1;
                }
            } else if (planeMode === '2lines') {
                const l1 = elements.find(e => e.id === selectedLine1Id) as LineElement;
                const l2 = elements.find(e => e.id === selectedLine2Id) as LineElement;

                if (l1 && l2) {
                    const result = calculatePlaneFromTwoLines(
                        { point: l1.point, direction: l1.direction },
                        { point: l2.point, direction: l2.direction }
                    );

                    if (result) {
                        normal = result.normal;
                        constant = result.constant;
                    } else {
                        alert("Las rectas no definen un plano válido (son colineales o se cruzan sin cortarse).");
                        return;
                    }
                } else {
                    alert("Selecciona dos rectas válidas.");
                    return;
                }
            }
        }

        const data = {
            type: 'plane', name, color: '#22c55e', visible: true,
            normal, constant
        };

        if (editingElementId) {
            updateElement(editingElementId, data as PlaneElement);
            setEditingElementId(null);
        } else {
            const id = Math.random().toString(36).substr(2, 9);
            addElement({ id, ...data } as PlaneElement);
        }
        setPlaneName('');
    };

    const startEditing = (el: GeometryElement) => {
        setEditingElementId(el.id);
        setActiveTab('add');
        setGeometryType(el.type);

        if (el.type === 'point') {
            const p = el as PointElement;
            setPointName(p.name);
            setPointCoords({ ...p.coords });
        } else if (el.type === 'line') {
            const l = el as LineElement;
            setLineName(l.name);
            setLineType('generic');
            setLineMode('pointDir');
            setLineP1({ ...l.point });
            setLineDir({ ...l.direction });
            setLineP1Str({ x: l.point.x.toString(), y: l.point.y.toString(), z: l.point.z.toString() });
        } else if (el.type === 'plane') {
            const p = el as PlaneElement;
            setPlaneName(p.name);
            setPlaneType('generic');
            setPlaneMode('equation');
            setPlaneEq({ a: p.normal.x, b: p.normal.y, c: p.normal.z, d: p.constant });
        }
    };

    const cancelEditing = () => {
        setEditingElementId(null);
        setPointName('');
        setLineName('');
        setPlaneName('');
    };

    const lines = elements.filter(e => e.type === 'line');

    const headerBorder = isDark ? 'border-gray-700' : 'border-gray-200';
    const inputClass = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900';
    const labelClass = isDark ? 'text-gray-300' : 'text-gray-700';
    const buttonClass = isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100';

    return (
        <div className={`h-full w-80 flex flex-col border-r ${headerBorder} ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Header */}
            <div className={`p-4 border-b ${headerBorder}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1" />
                        <div>
                            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Diédrico Studio
                            </h1>
                            <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Professional CAD</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={toggleHelp} className={`p-2 rounded-lg transition-colors ${buttonClass}`} title="Ayuda">
                            <HelpCircle size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                        </button>
                        <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${buttonClass}`}>
                            {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Toolbar (Undo/Redo) */}
            <div className={`p-2 border-b ${headerBorder} flex gap-2`}>
                <button
                    onClick={undo}
                    disabled={history.past.length === 0}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-xs font-medium transition-all ${history.past.length === 0 ? 'opacity-30 cursor-not-allowed' : ''} ${buttonClass}`}
                >
                    <Undo size={14} /> Deshacer
                </button>
                <button
                    onClick={redo}
                    disabled={history.future.length === 0}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-xs font-medium transition-all ${history.future.length === 0 ? 'opacity-30 cursor-not-allowed' : ''} ${buttonClass}`}
                >
                    <Redo size={14} /> Rehacer
                </button>
            </div>

            {/* View Controls */}
            <div className={`p-4 border-b ${headerBorder} space-y-2`}>
                <button
                    onClick={toggleIntersections}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${showIntersections
                        ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/50'
                        : `${buttonClass} ${isDark ? 'text-gray-300' : 'text-gray-600'}`
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <Layers size={16} /> Intersecciones
                    </span>
                    {showIntersections ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>

                <button
                    onClick={toggleSystemPlanes}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${showSystemPlanes
                        ? 'bg-purple-500/20 text-purple-600 border border-purple-500/50'
                        : `${buttonClass} ${isDark ? 'text-gray-300' : 'text-gray-600'}`
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <Box size={16} /> Cuadrantes / Bisectores
                    </span>
                    {showSystemPlanes ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>

                <button
                    onClick={toggleFlattening}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${isFlattened
                        ? 'bg-green-500/20 text-green-600 border border-green-500/50'
                        : `${buttonClass} ${isDark ? 'text-gray-300' : 'text-gray-600'}`
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <ArrowDownToLine size={16} /> Abatir Plano Horizontal
                    </span>
                    {isFlattened ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2">
                <button
                    onClick={() => setActiveTab('add')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'add' ? 'bg-blue-600 text-white shadow-lg' : `${isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}`}
                >
                    Añadir
                </button>
                <button
                    onClick={() => setActiveTab('tools')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'tools' ? 'bg-blue-600 text-white shadow-lg' : `${isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}`}
                >
                    Herramientas
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-lg' : `${isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}`}
                >
                    Lista ({elements.length})
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'add' ? (
                    <div className="space-y-4">
                        {/* Type selector */}
                        {editingElementId && (
                            <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg mb-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-yellow-700">Editando: {elements.find(e => e.id === editingElementId)?.name}</span>
                                <button onClick={cancelEditing} className="text-xs text-red-600 hover:underline">Cancelar</button>
                            </div>
                        )}
                        <div className={`flex gap-2 p-1 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                            {(['point', 'line', 'plane'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setGeometryType(type)}
                                    className={`flex-1 py-2 text-xs font-medium rounded-md capitalize transition-all ${geometryType === type
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                                        }`}
                                >
                                    {type === 'point' ? '🔴 Punto' : type === 'line' ? '📏 Recta' : '📐 Plano'}
                                </button>
                            ))}
                        </div>

                        {/* Point Form */}
                        {geometryType === 'point' && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nombre (opcional)"
                                    value={pointName}
                                    onChange={(e) => setPointName(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm ${inputClass}`}
                                />
                                <div>
                                    <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Coordenadas</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="number" placeholder="X" value={pointCoords.x} onChange={(e) => setPointCoords({ ...pointCoords, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                        <input type="number" placeholder="Y" value={pointCoords.y} onChange={(e) => setPointCoords({ ...pointCoords, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                        <input type="number" placeholder="Z" value={pointCoords.z} onChange={(e) => setPointCoords({ ...pointCoords, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                    </div>
                                </div>
                                <button onClick={handleAddPoint} className={`w-full py-2.5 ${editingElementId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}>
                                    {editingElementId ? <Settings size={18} /> : <Plus size={18} />} {editingElementId ? 'Actualizar Punto' : 'Añadir Punto'}
                                </button>
                            </div>
                        )}

                        {/* Line Form */}
                        {geometryType === 'line' && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nombre (opcional)"
                                    value={lineName}
                                    onChange={(e) => setLineName(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm ${inputClass}`}
                                />

                                <div className="space-y-2">
                                    <label className={`block text-xs font-medium ${labelClass}`}>Tipo de Recta</label>
                                    <select
                                        value={lineType}
                                        onChange={(e) => setLineType(e.target.value as any)}
                                        className={`w-full px-3 py-2 border rounded text-sm ${inputClass}`}
                                    >
                                        <option value="generic">Genérica (2 Puntos / Vector)</option>
                                        <option value="vertical">Vertical (Perpendicular al PH)</option>
                                        <option value="point">De Punta (Perpendicular al PV)</option>
                                        <option value="parallel_lt">Paralela a la Línea de Tierra</option>
                                        <option value="profile">De Perfil</option>
                                    </select>
                                </div>

                                {lineType === 'generic' ? (
                                    <>
                                        <div className="flex gap-2">
                                            <button onClick={() => setLineMode('2points')} className={`flex-1 py-1.5 text-xs rounded border ${lineMode === '2points' ? 'bg-blue-50 border-blue-300 text-blue-700' : `${isDark ? 'border-white/20 text-gray-300' : 'border-gray-300 text-gray-600'}`}`}>2 Puntos</button>
                                            <button onClick={() => setLineMode('pointDir')} className={`flex-1 py-1.5 text-xs rounded border ${lineMode === 'pointDir' ? 'bg-blue-50 border-blue-300 text-blue-700' : `${isDark ? 'border-white/20 text-gray-300' : 'border-gray-300 text-gray-600'}`}`}>Punto + Dir</button>
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Punto A (Deja vacío para infinito)</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <input type="number" placeholder="X" value={lineP1Str.x} onChange={(e) => setLineP1Str({ ...lineP1Str, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                <input type="number" placeholder="Y" value={lineP1Str.y} onChange={(e) => setLineP1Str({ ...lineP1Str, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                <input type="number" placeholder="Z" value={lineP1Str.z} onChange={(e) => setLineP1Str({ ...lineP1Str, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                            </div>
                                        </div>

                                        {lineMode === '2points' ? (
                                            <div>
                                                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Punto B</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input type="number" placeholder="X" value={lineP2.x} onChange={(e) => setLineP2({ ...lineP2, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Y" value={lineP2.y} onChange={(e) => setLineP2({ ...lineP2, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Z" value={lineP2.z} onChange={(e) => setLineP2({ ...lineP2, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Vector Dirección</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input type="number" placeholder="X" value={lineDir.x} onChange={(e) => setLineDir({ ...lineDir, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Y" value={lineDir.y} onChange={(e) => setLineDir({ ...lineDir, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Z" value={lineDir.z} onChange={(e) => setLineDir({ ...lineDir, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div>
                                        <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Punto de paso</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <input type="number" placeholder="X" value={lineP1.x} onChange={(e) => setLineP1({ ...lineP1, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                            <input type="number" placeholder="Y" value={lineP1.y} onChange={(e) => setLineP1({ ...lineP1, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                            <input type="number" placeholder="Z" value={lineP1.z} onChange={(e) => setLineP1({ ...lineP1, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                        </div>
                                        {lineType === 'profile' && (
                                            <div className="mt-2">
                                                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Pendiente (Dirección Y/Z)</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="number" placeholder="Dir Y" value={lineDir.y} onChange={(e) => setLineDir({ ...lineDir, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Dir Z" value={lineDir.z} onChange={(e) => setLineDir({ ...lineDir, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button onClick={handleAddLine} className={`w-full py-2.5 ${editingElementId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}>
                                    {editingElementId ? <Settings size={18} /> : <Plus size={18} />} {editingElementId ? 'Actualizar Recta' : 'Añadir Recta'}
                                </button>
                            </div>
                        )}

                        {/* Plane Form  */}
                        {geometryType === 'plane' && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nombre (opcional)"
                                    value={planeName}
                                    onChange={(e) => setPlaneName(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm ${inputClass}`}
                                />

                                <div className="space-y-2">
                                    <label className={`block text-xs font-medium ${labelClass}`}>Tipo de Plano</label>
                                    <select
                                        value={planeType}
                                        onChange={(e) => setPlaneType(e.target.value as any)}
                                        className={`w-full px-3 py-2 border rounded text-sm ${inputClass}`}
                                    >
                                        <option value="generic">Genérico (3 Puntos / Normal / Ecuación)</option>
                                        <option value="horizontal">Horizontal (Paralelo al PH)</option>
                                        <option value="frontal">Frontal (Paralelo al PV)</option>
                                        <option value="parallel_lt">Paralelo a la Línea de Tierra</option>
                                        <option value="vertical">Proyectante Horizontal (Vertical)</option>
                                        <option value="canto">Proyectante Vertical (De Canto)</option>
                                        <option value="through_lt">Pasa por Línea de Tierra</option>
                                        <option value="profile">De Perfil</option>
                                    </select>
                                </div>

                                {planeType === 'generic' ? (
                                    <>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button onClick={() => setPlaneMode('simple')} className={`py-1.5 text-xs rounded border ${planeMode === 'simple' ? 'bg-green-50 border-green-300 text-green-700 font-bold' : `${isDark ? 'border-white/20 text-gray-300' : 'border-gray-300 text-gray-600'}`}`}>⚡ Simple</button>
                                            <button onClick={() => setPlaneMode('3points')} className={`py-1.5 text-xs rounded border ${planeMode === '3points' ? 'bg-blue-50 border-blue-300 text-blue-700' : `${isDark ? 'border-white/20 text-gray-300' : 'border-gray-300 text-gray-600'}`}`}>3 Puntos</button>
                                            <button onClick={() => setPlaneMode('normal')} className={`py-1.5 text-xs rounded border ${planeMode === 'normal' ? 'bg-blue-50 border-blue-300 text-blue-700' : `${isDark ? 'border-white/20 text-gray-300' : 'border-gray-300 text-gray-600'}`}`}>Normal</button>
                                            <button onClick={() => setPlaneMode('equation')} className={`py-1.5 text-xs rounded border ${planeMode === 'equation' ? 'bg-blue-50 border-blue-300 text-blue-700' : `${isDark ? 'border-white/20 text-gray-300' : 'border-gray-300 text-gray-600'}`}`}>Ecuación</button>
                                            <button onClick={() => setPlaneMode('2lines')} className={`py-1.5 text-xs rounded border ${planeMode === '2lines' ? 'bg-blue-50 border-blue-300 text-blue-700' : `${isDark ? 'border-white/20 text-gray-300' : 'border-gray-300 text-gray-600'}`}`}>2 Rectas</button>
                                            <button onClick={() => setPlaneMode('intercepts')} className={`py-1.5 text-xs rounded border ${planeMode === 'intercepts' ? 'bg-blue-50 border-blue-300 text-blue-700' : `${isDark ? 'border-white/20 text-gray-300' : 'border-gray-300 text-gray-600'}`}`}>Trazas</button>
                                        </div>

                                        {planeMode === 'simple' && (
                                            <div className="space-y-2 bg-green-50 p-3 rounded-lg">
                                                <label className="block text-xs font-medium text-green-800">Plano Simple</label>
                                                <div className="flex gap-2">
                                                    <select value={simpleAxis} onChange={(e) => setSimpleAxis(e.target.value as 'x' | 'y' | 'z')} className="px-3 py-2 border rounded text-sm bg-white text-gray-800">
                                                        <option value="x">X =</option>
                                                        <option value="y">Y =</option>
                                                        <option value="z">Z =</option>
                                                    </select>
                                                    <input type="number" value={simpleValue} onChange={(e) => setSimpleValue(parseFloat(e.target.value) || 0)} className="flex-1 px-3 py-2 border rounded text-sm bg-white text-gray-800" />
                                                </div>
                                                <p className="text-xs text-green-600 italic">Ejemplo: Z=5 crea un plano horizontal</p>
                                            </div>
                                        )}

                                        {planeMode === '3points' && (
                                            <>
                                                <div>
                                                    <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Punto 1</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input type="number" placeholder="X" value={planeP1.x} onChange={(e) => setPlaneP1({ ...planeP1, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        <input type="number" placeholder="Y" value={planeP1.y} onChange={(e) => setPlaneP1({ ...planeP1, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        <input type="number" placeholder="Z" value={planeP1.z} onChange={(e) => setPlaneP1({ ...planeP1, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Punto 2</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input type="number" placeholder="X" value={planeP2.x} onChange={(e) => setPlaneP2({ ...planeP2, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        <input type="number" placeholder="Y" value={planeP2.y} onChange={(e) => setPlaneP2({ ...planeP2, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        <input type="number" placeholder="Z" value={planeP2.z} onChange={(e) => setPlaneP2({ ...planeP2, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Punto 3</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input type="number" placeholder="X" value={planeP3.x} onChange={(e) => setPlaneP3({ ...planeP3, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        <input type="number" placeholder="Y" value={planeP3.y} onChange={(e) => setPlaneP3({ ...planeP3, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        <input type="number" placeholder="Z" value={planeP3.z} onChange={(e) => setPlaneP3({ ...planeP3, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {planeMode === 'normal' && (
                                            <>
                                                <div>
                                                    <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Vector Normal</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input type="number" placeholder="X" value={planeNormal.x} onChange={(e) => setPlaneNormal({ ...planeNormal, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        <input type="number" placeholder="Y" value={planeNormal.y} onChange={(e) => setPlaneNormal({ ...planeNormal, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        <input type="number" placeholder="Z" value={planeNormal.z} onChange={(e) => setPlaneNormal({ ...planeNormal, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Punto en el Plano</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input type="number" placeholder="X" value={planePoint.x} onChange={(e) => setPlanePoint({ ...planePoint, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        <input type="number" placeholder="Y" value={planePoint.y} onChange={(e) => setPlanePoint({ ...planePoint, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        <input type="number" placeholder="Z" value={planePoint.z} onChange={(e) => setPlanePoint({ ...planePoint, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {planeMode === 'equation' && (
                                            <div>
                                                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Ax + By + Cz + D = 0</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    <input type="number" placeholder="A" value={planeEq.a} onChange={(e) => setPlaneEq({ ...planeEq, a: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="B" value={planeEq.b} onChange={(e) => setPlaneEq({ ...planeEq, b: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="C" value={planeEq.c} onChange={(e) => setPlaneEq({ ...planeEq, c: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="D" value={planeEq.d} onChange={(e) => setPlaneEq({ ...planeEq, d: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                </div>
                                            </div>
                                        )}

                                        {planeMode === '2lines' && (
                                            <div className="space-y-3">
                                                <label className={`block text-xs font-medium ${labelClass}`}>Selecciona 2 Rectas</label>
                                                <select
                                                    value={selectedLine1Id}
                                                    onChange={(e) => setSelectedLine1Id(e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded text-sm ${inputClass}`}
                                                >
                                                    <option value="">-- Recta 1 --</option>
                                                    {lines.map((l: LineElement) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                </select>
                                                <select
                                                    value={selectedLine2Id}
                                                    onChange={(e) => setSelectedLine2Id(e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded text-sm ${inputClass}`}
                                                >
                                                    <option value="">-- Recta 2 --</option>
                                                    {lines.map((l: LineElement) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        {planeMode === 'intercepts' && (
                                            <div className="space-y-3">
                                                <label className={`block text-xs font-medium ${labelClass}`}>Trazas (Cortes con Ejes)</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-500 mb-1">X (Vértice)</span>
                                                        <input type="number" value={planeIntercepts.x} onChange={(e) => setPlaneIntercepts({ ...planeIntercepts, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-500 mb-1">Y (Alejamiento)</span>
                                                        <input type="number" value={planeIntercepts.y} onChange={(e) => setPlaneIntercepts({ ...planeIntercepts, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-500 mb-1">Z (Cota)</span>
                                                        <input type="number" value={planeIntercepts.z} onChange={(e) => setPlaneIntercepts({ ...planeIntercepts, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        {(planeType !== 'through_lt') && (
                                            <div>
                                                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Punto de paso</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input type="number" placeholder="X" value={planeP1.x} onChange={(e) => setPlaneP1({ ...planeP1, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Y" value={planeP1.y} onChange={(e) => setPlaneP1({ ...planeP1, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Z" value={planeP1.z} onChange={(e) => setPlaneP1({ ...planeP1, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                </div>
                                            </div>
                                        )}

                                        {['parallel_lt', 'vertical', 'canto', 'through_lt'].includes(planeType) && (
                                            <div>
                                                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Orientación (Vector Normal)</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {['vertical', 'canto'].includes(planeType) && (
                                                        <input type="number" placeholder="X" value={planeNormal.x} onChange={(e) => setPlaneNormal({ ...planeNormal, x: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    )}
                                                    {['parallel_lt', 'vertical', 'through_lt'].includes(planeType) && (
                                                        <input type="number" placeholder="Y" value={planeNormal.y} onChange={(e) => setPlaneNormal({ ...planeNormal, y: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    )}
                                                    {['parallel_lt', 'canto', 'through_lt'].includes(planeType) && (
                                                        <input type="number" placeholder="Z" value={planeNormal.z} onChange={(e) => setPlaneNormal({ ...planeNormal, z: parseFloat(e.target.value) || 0 })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button onClick={handleAddPlane} className={`w-full py-2.5 ${editingElementId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}>
                                    {editingElementId ? <Settings size={18} /> : <Plus size={18} />} {editingElementId ? 'Actualizar Plano' : 'Añadir Plano'}
                                </button>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'tools' ? (
                    <AdvancedToolsPanel isDark={isDark} />
                ) : (
                    <div className="space-y-2">
                        {elements.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p>No hay elementos creados.</p>
                            </div>
                        ) : (
                            elements.map((el: GeometryElement) => (
                                <div
                                    key={el.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${selectedElementId === el.id
                                        ? 'bg-blue-50 border-blue-400 shadow-sm'
                                        : `${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'}`
                                        }`}
                                >
                                    <div
                                        className="flex items-center gap-3 flex-1 cursor-pointer"
                                        onClick={() => {
                                            if (activeTool !== 'none') {
                                                selectForDistance(el.id);
                                            } else {
                                                selectElement(el.id);
                                            }
                                        }}
                                    >
                                        <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: el.color }} />
                                        <div>
                                            <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                                {el.name}
                                            </p>
                                            <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                {el.type === 'point' && `(${el.coords.x}, ${el.coords.y}, ${el.coords.z})`}
                                                {el.type === 'line' && 'Recta'}
                                                {el.type === 'plane' && 'Plano'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleVisibility(el.id);
                                            }}
                                            className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                                            title={el.visible ? "Ocultar" : "Mostrar"}
                                        >
                                            {el.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEditing(el);
                                            }}
                                            className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                                            title="Editar"
                                        >
                                            <Settings size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeElement(el.id);
                                            }}
                                            className={`p-1.5 rounded-md transition-colors hover:bg-red-100 hover:text-red-600 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
