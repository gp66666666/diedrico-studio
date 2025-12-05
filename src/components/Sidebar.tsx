import { useState } from 'react';
import {
    Box, Layers, Eye, EyeOff, Plus, Trash2,
    Sun, Moon, Undo, Redo, ToggleLeft, ToggleRight, ArrowDownToLine, HelpCircle, Settings, Download, ChevronUp, ChevronDown, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGeometryStore } from '../store/geometryStore';
import type { GeometryElement, PointElement, LineElement, PlaneElement } from '../types';
import AdvancedToolsPanel from './AdvancedToolsPanel';
import { calculatePlaneFromTwoLines } from '../utils/mathUtils';
import UserMenu from './Auth/UserMenu';
import PremiumModal from './Auth/PremiumModal';
import { useUserStore } from '../store/userStore';
import SaveProjectModal from './Cloud/SaveProjectModal';
import LoadProjectModal from './Cloud/LoadProjectModal';
import LineCreator from './LineCreator';
import AbatimientoTool from './tools/AbatimientoTool';
import IntersectionTool from './tools/IntersectionTool';
import AdvancedIntersectionTool from './tools/AdvancedIntersectionTool';
import TrueMagnitudeTool from './tools/TrueMagnitudeTool';
import ParallelismTool from './tools/ParallelismTool';
import DistanceTool from './tools/DistanceTool';
import RotationTool from './tools/RotationTool';
import HelpGuide from './HelpGuide';
import ExerciseOverlay from './Academy/ExerciseOverlay';

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
        showBisectors,
        toggleBisectors,
        isFlattened,
        toggleFlattening,
        history,
        undo,
        redo,
        theme,
        toggleTheme,
        showHelp,
        toggleHelp,
        clearAll,
        measurements,
        removeMeasurement,
        clearAllMeasurements,
        activeTool,
        selectForDistance,
        selectedForDistance,
        viewMode,
        setViewMode,
        setActiveTool
    } = useGeometryStore();

    const isDark = theme === 'dark';

    const [activeTab, setActiveTab] = useState<'add' | 'list' | 'tools'>('add');
    const [geometryType, setGeometryType] = useState<'point' | 'line' | 'plane'>('point');
    const navigate = useNavigate();
    const [editingElementId, setEditingElementId] = useState<string | null>(null);
    const [elementColor, setElementColor] = useState('#22c55e');
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [showViewControls, setShowViewControls] = useState(false);
    const [showCloudOptions, setShowCloudOptions] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);

    const { profile } = useUserStore();

    // Point state
    const [pointName, setPointName] = useState('');
    const [pointCoords, setPointCoords] = useState({ x: '0', y: '0', z: '0' });

    // Line state
    const [lineName, setLineName] = useState('');
    const [lineMode, setLineMode] = useState<'2points' | 'pointDir'>('2points');
    const [lineType, setLineType] = useState<'generic' | 'vertical' | 'point' | 'parallel_lt' | 'profile'>('generic');

    // String states for Line inputs
    const [lineP1Str, setLineP1Str] = useState({ x: '0', y: '0', z: '0' });
    const [lineP2Str, setLineP2Str] = useState({ x: '1', y: '1', z: '1' });
    const [lineDirStr, setLineDirStr] = useState({ x: '1', y: '1', z: '1' });
    const [lineP1NonGenericStr, setLineP1NonGenericStr] = useState({ x: '0', y: '0', z: '0' });

    // Plane state
    const [planeName, setPlaneName] = useState('');
    const [planeType, setPlaneType] = useState<'generic' | 'horizontal' | 'frontal' | 'parallel_lt' | 'vertical' | 'canto' | 'through_lt' | 'profile'>('generic');
    const [planeMode, setPlaneMode] = useState<'simple' | '3points' | 'normal' | 'equation' | 'intercepts' | '2lines'>('simple');

    // String states for Plane inputs
    const [planeP1Str, setPlaneP1Str] = useState({ x: '0', y: '0', z: '0' });
    const [planeP2Str, setPlaneP2Str] = useState({ x: '1', y: '0', z: '0' });
    const [planeP3Str, setPlaneP3Str] = useState({ x: '0', y: '1', z: '0' });
    const [planeNormalStr, setPlaneNormalStr] = useState({ x: '0', y: '0', z: '1' });
    const [planeEqStr, setPlaneEqStr] = useState({ a: '0', b: '0', c: '1', d: '0' });
    const [simpleValueStr, setSimpleValueStr] = useState('0');
    const [planeInterceptsStr, setPlaneInterceptsStr] = useState({ x: '0', y: '0', z: '0' });

    // Helper to parse string coords to numbers
    const parseCoords = (coords: { x: string, y: string, z: string }) => ({
        x: coords.x.trim() === '' ? Infinity : (parseFloat(coords.x) || 0),
        y: coords.y.trim() === '' ? Infinity : (parseFloat(coords.y) || 0),
        z: coords.z.trim() === '' ? Infinity : (parseFloat(coords.z) || 0)
    });

    const handleAddPoint = () => {
        const coords = parseCoords(pointCoords);

        const data = {
            type: 'point',
            name: pointName || `Punto ${elements.filter(e => e.type === 'point').length + 1}`,
            coords,
            color: editingElementId ? elementColor : '#ef4444',
            visible: true
        };

        if (editingElementId) {
            updateElement(editingElementId, data as PointElement);
            setEditingElementId(null);
        } else {
            const id = Math.random().toString(36).substr(2, 9);
            addElement({ id, ...data } as PointElement);
        }
        setPointName('');
    };

    const handleAddLine = () => {
        let p1 = { x: 0, y: 0, z: 0 };
        let p2 = { x: 0, y: 0, z: 0 };
        let isInfinite = false;

        if (lineType === 'generic') {
            p1 = parseCoords(lineP1Str);

            if (lineMode === '2points') {
                p2 = parseCoords(lineP2Str);
            } else {
                const dir = parseCoords(lineDirStr);
                p2 = { x: p1.x + dir.x, y: p1.y + dir.y, z: p1.z + dir.z };
                isInfinite = true; // Treated as infinite for rendering purposes if needed
            }
        } else {
            const pStart = parseCoords(lineP1NonGenericStr);
            p1 = pStart;

            if (lineType === 'vertical') {
                p2 = { x: pStart.x, y: pStart.y, z: pStart.z + 10 };
            } else if (lineType === 'point') {
                p2 = { x: pStart.x, y: pStart.y + 10, z: pStart.z };
            } else if (lineType === 'parallel_lt') {
                p2 = { x: pStart.x + 10, y: pStart.y, z: pStart.z };
            } else if (lineType === 'profile') {
                // Profile line needs a slope/direction in YZ plane
                const dir = parseCoords(lineDirStr);
                // If dir is not set (0,0,0), default to 45 degrees
                const dy = dir.y || 1;
                const dz = dir.z || 1;
                p2 = { x: pStart.x, y: pStart.y + dy, z: pStart.z + dz };
            }
        }

        // Calculate direction vector
        const direction = {
            x: p2.x - p1.x,
            y: p2.y - p1.y,
            z: p2.z - p1.z
        };

        const data = {
            type: 'line',
            name: lineName || `Recta ${elements.filter(e => e.type === 'line').length + 1}`,
            point: p1,
            p2: p2, // Store p2 for all lines now
            direction, // Add required direction property
            color: editingElementId ? elementColor : '#3b82f6',
            visible: true,
            lineType // Store the type for future reference/editing
        };

        if (editingElementId) {
            updateElement(editingElementId, { ...data, id: editingElementId } as LineElement);
            setEditingElementId(null);
        } else {
            const id = Math.random().toString(36).substr(2, 9);
            addElement({ id, ...data } as LineElement);
        }
        setLineName('');
    };

    const handleAddPlane = () => {
        let normal = { x: 0, y: 0, z: 1 };
        let constant = 0;
        const name = planeName || `Plano ${elements.filter(e => e.type === 'plane').length + 1}`;

        if (planeType === 'generic') {
            if (planeMode === 'simple') {
                // Simple plane defined by Z value (Horizontal) or similar? 
                // Actually 'simple' usually means just a constant Z or something. 
                // Let's assume it's a horizontal plane at height 'simpleValue' for now, 
                // or maybe the user meant something else. 
                // Based on previous code, it seemed to be just a value.
                // Let's implement as Horizontal plane at Z = value
                normal = { x: 0, y: 0, z: 1 };
                constant = parseFloat(simpleValueStr) || 0;
            } else if (planeMode === '3points') {
                const p1 = parseCoords(planeP1Str);
                const p2 = parseCoords(planeP2Str);
                const p3 = parseCoords(planeP3Str);

                const v1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
                const v2 = { x: p3.x - p1.x, y: p3.y - p1.y, z: p3.z - p1.z };

                normal = {
                    x: v1.y * v2.z - v1.z * v2.y,
                    y: v1.z * v2.x - v1.x * v2.z,
                    z: v1.x * v2.y - v1.y * v2.x
                };
                constant = normal.x * p1.x + normal.y * p1.y + normal.z * p1.z;
            } else if (planeMode === 'normal') {
                const p1 = parseCoords(planeP1Str);
                normal = parseCoords(planeNormalStr);
                constant = normal.x * p1.x + normal.y * p1.y + normal.z * p1.z;
            } else if (planeMode === 'equation') {
                normal = {
                    x: parseFloat(planeEqStr.a) || 0,
                    y: parseFloat(planeEqStr.b) || 0,
                    z: parseFloat(planeEqStr.c) || 0
                };
                constant = -(parseFloat(planeEqStr.d) || 0); // Ax + By + Cz + D = 0 => Ax + By + Cz = -D
            } else if (planeMode === 'intercepts') {
                const x = parseFloat(planeInterceptsStr.x);
                const y = parseFloat(planeInterceptsStr.y);
                const z = parseFloat(planeInterceptsStr.z);

                if (x && y && z) {
                    // Plane equation: x/a + y/b + z/c = 1
                    // x(1/a) + y(1/b) + z(1/c) = 1
                    normal = { x: 1 / x, y: 1 / y, z: 1 / z };
                    constant = 1;
                }
            } else if (planeMode === '2lines') {
                // This requires selecting 2 lines from the scene, which is complex in this UI.
                // For now, we'll skip or implement if we have line selection state.
                // The previous code had a snippet for this.
                // We'll leave it as a placeholder or remove if not fully implemented.
                alert("Modo 2 Rectas no implementado completamente en este formulario.");
                return;
            }
        } else {
            // Special plane types
            const p1 = parseCoords(planeP1Str);

            if (planeType === 'horizontal') {
                normal = { x: 0, y: 0, z: 1 };
                constant = p1.z;
            } else if (planeType === 'frontal') {
                normal = { x: 0, y: 1, z: 0 };
                constant = p1.y;
            } else if (planeType === 'parallel_lt') {
                // Parallel to LT (X-axis), so Normal.x = 0
                const n = parseCoords(planeNormalStr);
                normal = { x: 0, y: n.y, z: n.z };
                constant = normal.y * p1.y + normal.z * p1.z;
            } else if (planeType === 'vertical') {
                // Projecting Horizontal (Vertical plane) -> Perpendicular to PH -> Normal.z = 0
                const n = parseCoords(planeNormalStr);
                normal = { x: n.x, y: n.y, z: 0 };
                constant = normal.x * p1.x + normal.y * p1.y;
            } else if (planeType === 'canto') {
                // Projecting Vertical (De Canto) -> Perpendicular to PV -> Normal.y = 0
                const n = parseCoords(planeNormalStr);
                normal = { x: n.x, y: 0, z: n.z };
                constant = normal.x * p1.x + normal.z * p1.z;
            } else if (planeType === 'through_lt') {
                // Passes through LT -> Constant = 0, and contains (0,0,0)
                // Normal is perpendicular to the plane.
                const n = parseCoords(planeNormalStr);
                normal = n;
                constant = 0;
            } else if (planeType === 'profile') {
                // Profile plane -> Perpendicular to LT -> Normal = (1, 0, 0)
                normal = { x: 1, y: 0, z: 0 };
                constant = p1.x;
            }
        }

        const data = {
            type: 'plane',
            name,
            color: editingElementId ? elementColor : '#22c55e',
            visible: true,
            normal,
            constant
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
        setElementColor(el.color);

        if (el.type === 'point') {
            const p = el as PointElement;
            setPointName(p.name);
            setPointCoords({ x: p.coords.x.toString(), y: p.coords.y.toString(), z: p.coords.z.toString() });
        } else if (el.type === 'line') {
            const l = el as LineElement;
            setLineName(l.name);
            // Try to determine type/mode from data if possible, or default to generic
            setLineType('generic');
            setLineP1Str({ x: l.point.x.toString(), y: l.point.y.toString(), z: l.point.z.toString() });

            if (l.p2) {
                setLineP2Str({ x: l.p2.x.toString(), y: l.p2.y.toString(), z: l.p2.z.toString() });
                setLineMode('2points');
            }
            // Also populate non-generic just in case
            setLineP1NonGenericStr({ x: l.point.x.toString(), y: l.point.y.toString(), z: l.point.z.toString() });
        } else if (el.type === 'plane') {
            const p = el as PlaneElement;
            setPlaneName(p.name);
            setPlaneType('generic'); // Default to generic for editing unless we stored the type
            setPlaneMode('equation'); // Easiest to edit as equation/normal
            setPlaneEqStr({
                a: p.normal.x.toString(),
                b: p.normal.y.toString(),
                c: p.normal.z.toString(),
                d: (-p.constant).toString()
            });
        }
    };

    const cancelEditing = () => {
        setEditingElementId(null);
        setPointName('');
        setLineName('');
        setPlaneName('');

        // Reset string states to defaults
        setPointCoords({ x: '0', y: '0', z: '0' });
        setLineP1Str({ x: '0', y: '0', z: '0' });
        setLineP2Str({ x: '1', y: '1', z: '1' });
        setLineDirStr({ x: '1', y: '1', z: '1' });
        setLineP1NonGenericStr({ x: '0', y: '0', z: '0' });

        setPlaneP1Str({ x: '0', y: '0', z: '0' });
        setPlaneP2Str({ x: '1', y: '0', z: '0' });
        setPlaneP3Str({ x: '0', y: '1', z: '0' });
        setPlaneNormalStr({ x: '0', y: '0', z: '1' });
        setPlaneEqStr({ a: '0', b: '0', c: '1', d: '0' });
        setSimpleValueStr('0');
        setPlaneInterceptsStr({ x: '0', y: '0', z: '0' });
    };

    const handleExportCurrentView = () => {
        if (viewMode === '3d') {
            // 3D Export (Canvas)
            const canvas = document.querySelector('canvas');
            if (!canvas) {
                alert('No se encontró la vista 3D para exportar');
                return;
            }

            // Create a temporary link to download the image
            const link = document.createElement('a');
            link.download = `diedrico-3d-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else {
            // 2D/Sketch Export (SVG)
            const svg = document.getElementById('main-drawing-svg') as unknown as SVGSVGElement;
            if (!svg) {
                alert('No se encontró ninguna vista para exportar');
                return;
            }

            const serializer = new XMLSerializer();
            const source = serializer.serializeToString(svg);
            const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = svg.clientWidth || 800;
                canvas.height = svg.clientHeight || 600;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    // Fill background
                    ctx.fillStyle = isDark ? '#111827' : '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const link = document.createElement('a');
                            link.download = `diedrico-vista-${Date.now()}.jpg`;
                            link.href = URL.createObjectURL(blob);
                            link.click();
                            URL.revokeObjectURL(link.href);
                        }
                    }, 'image/jpeg', 0.95);
                }
                URL.revokeObjectURL(url);
            };
            img.src = url;
        }
    };

    const handleExportAllViews = async () => {
        try {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            const originalViewMode = viewMode;

            // Helper function to wait for render completion
            const waitForRender = () => new Promise(resolve => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setTimeout(resolve, 100);
                    });
                });
            });

            // Helper function to capture current view
            const captureView = async (mode: '3d' | '2d' | 'sketch', filename: string) => {
                setViewMode(mode);
                await waitForRender();

                if (mode === '3d') {
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                        const dataUrl = canvas.toDataURL('image/png');
                        const base64Data = dataUrl.split(',')[1];
                        zip.file(filename, base64Data, { base64: true });
                    }
                } else {
                    const svg = document.getElementById('main-drawing-svg') as unknown as SVGSVGElement;
                    if (svg) {
                        const serializer = new XMLSerializer();
                        const source = serializer.serializeToString(svg);
                        const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(blob);

                        await new Promise<void>((resolve) => {
                            const img = new Image();
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                canvas.width = svg.clientWidth || 800;
                                canvas.height = svg.clientHeight || 600;
                                const ctx = canvas.getContext('2d');

                                if (ctx) {
                                    ctx.fillStyle = isDark ? '#111827' : '#ffffff';
                                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                                    ctx.drawImage(img, 0, 0);

                                    canvas.toBlob((blob) => {
                                        if (blob) {
                                            blob.arrayBuffer().then(buffer => {
                                                zip.file(filename, buffer);
                                                resolve();
                                            });
                                        } else {
                                            resolve();
                                        }
                                    }, 'image/jpeg', 0.95);
                                } else {
                                    resolve();
                                }
                                URL.revokeObjectURL(url);
                            };
                            img.onerror = () => {
                                URL.revokeObjectURL(url);
                                resolve();
                            };
                            img.src = url;
                        });
                    }
                }
            };

            // Capture all views
            await captureView('3d', 'vista-3d.png');
            await captureView('2d', 'vista-diedrico-2d.jpg');
            await captureView('sketch', 'vista-boceto.jpg');

            // Restore original view
            setViewMode(originalViewMode);

            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.download = `diedrico-todas-vistas-${Date.now()}.zip`;
            link.href = URL.createObjectURL(zipBlob);
            link.click();
            URL.revokeObjectURL(link.href);

        } catch (error) {
            console.error('Error exporting all views:', error);
            alert('Error al exportar las vistas. Por favor, inténtalo de nuevo.');
        }
    };

    const headerBorder = isDark ? 'border-white/10' : 'border-gray-200/50';
    const inputClass = isDark ? 'bg-black/20 border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:bg-black/30' : 'bg-white/50 border-gray-200/50 text-gray-900 placeholder-gray-400 focus:border-blue-500/50 focus:bg-white/80';
    const labelClass = isDark ? 'text-gray-300' : 'text-gray-700';
    const buttonClass = isDark ? 'hover:bg-white/10 active:bg-white/20' : 'hover:bg-white/60 hover:shadow-sm active:bg-white/80';

    return (
        <div className={`h-full w-80 max-w-[85vw] flex flex-col border-r pb-14 relative backdrop-blur-2xl transition-colors duration-300 ${headerBorder} ${isDark ? 'bg-gray-900/60 text-white border-white/20 shadow-2xl shadow-black/20' : 'bg-white/60 text-gray-900 border-white/60 shadow-xl'}`}>
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
                        <button
                            onClick={() => navigate('/academy')}
                            className={`p-2 rounded-lg transition-colors ${buttonClass} group`}
                            title="Academia (Premium)"
                        >
                            <BookOpen size={18} className="text-purple-500 group-hover:scale-110 transition-transform" />
                        </button>
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

            {/* View Controls - Collapsible */}
            <div className={`p-2 border-b ${headerBorder}`}>
                <button
                    onClick={() => setShowViewControls(!showViewControls)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${buttonClass} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                >
                    <span className="flex items-center gap-2">
                        <Settings size={16} /> Controles de Vista
                    </span>
                    {showViewControls ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showViewControls && (
                    <div className="mt-2 space-y-2">
                        <button
                            onClick={toggleIntersections}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${showIntersections
                                ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/50'
                                : `${buttonClass} ${isDark ? 'text-gray-300' : 'text-gray-600'}`
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Layers size={16} /> Ver Intersecciones
                            </span>
                            {showIntersections ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
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
                )
                }
            </div >

            {/* Cloud Save/Load (Premium) - Collapsible */}
            < div className={`p-2 border-b ${headerBorder}`}>
                <button
                    onClick={() => setShowCloudOptions(!showCloudOptions)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${buttonClass} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                >
                    <span className="flex items-center gap-2">
                        <Download size={16} /> Proyectos {!profile?.is_premium && '🔒'}
                    </span>
                    {showCloudOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {
                    showCloudOptions && (
                        <div className="flex gap-2 px-2 mt-2">
                            <button
                                onClick={() => profile?.is_premium ? setShowSaveModal(true) : setShowPremiumModal(true)}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${buttonClass} ${isDark ? 'text-gray-300' : 'text-gray-600'} ${!profile?.is_premium ? 'opacity-60' : ''}`}
                            >
                                <Download size={16} /> Guardar
                                {!profile?.is_premium && <span className="text-xs">🔒</span>}
                            </button>
                            <button
                                onClick={() => profile?.is_premium ? setShowLoadModal(true) : setShowPremiumModal(true)}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${buttonClass} ${isDark ? 'text-gray-300' : 'text-gray-600'} ${!profile?.is_premium ? 'opacity-60' : ''}`}
                            >
                                <ArrowDownToLine size={16} /> Cargar
                                {!profile?.is_premium && <span className="text-xs">🔒</span>}
                            </button>
                        </div>
                    )
                }
            </div >

            {/* Export Options - Collapsible */}
            < div className={`p-2 border-b ${headerBorder}`}>
                <button
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${buttonClass} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                >
                    <span className="flex items-center gap-2">
                        <Download size={16} /> Exportar {!profile?.is_premium && '🔒'}
                    </span>
                    {showExportOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {
                    showExportOptions && (
                        <div className="px-2 space-y-2 mt-2">
                            <button
                                onClick={() => profile?.is_premium ? handleExportCurrentView() : setShowPremiumModal(true)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${buttonClass} ${isDark ? 'text-gray-300' : 'text-gray-600'} ${!profile?.is_premium ? 'opacity-60' : ''}`}
                            >
                                <span className="flex items-center gap-2">
                                    <Download size={16} /> Vista Actual
                                </span>
                                {!profile?.is_premium && <span className="text-xs">🔒</span>}
                            </button>
                            <button
                                onClick={() => profile?.is_premium ? handleExportAllViews() : setShowPremiumModal(true)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${buttonClass} ${isDark ? 'text-gray-300' : 'text-gray-600'} ${!profile?.is_premium ? 'opacity-60' : ''}`}
                            >
                                <span className="flex items-center gap-2">
                                    <Download size={16} /> Todas las Vistas
                                </span>
                                {!profile?.is_premium && <span className="text-xs">🔒</span>}
                            </button>
                        </div>
                    )
                }
            </div >

            {/* Premium Modal */}
            < PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />

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
            <div className="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar">
                {activeTab === 'add' ? (
                    <div className="space-y-4">
                        {/* Type selector */}
                        {!editingElementId && (
                            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                                <button
                                    onClick={() => setGeometryType('point')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${geometryType === 'point' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    Punto
                                </button>
                                <button
                                    onClick={() => setGeometryType('line')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${geometryType === 'line' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    Recta
                                </button>
                                <button
                                    onClick={() => setGeometryType('plane')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${geometryType === 'plane' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    Plano
                                </button>
                            </div>
                        )}

                        {editingElementId && (
                            <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg mb-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-yellow-700">Editando: {elements.find(e => e.id === editingElementId)?.name}</span>
                                <button onClick={cancelEditing} className="text-xs text-red-600 hover:underline">Cancelar</button>
                            </div>
                        )}
                        {geometryType === 'point' && (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nombre (opcional)"
                                        value={pointName}
                                        onChange={(e) => setPointName(e.target.value)}
                                        className={`flex-1 px-3 py-2 border rounded-lg text-sm ${inputClass}`}
                                    />
                                    {editingElementId && (
                                        <input
                                            type="color"
                                            value={elementColor}
                                            onChange={(e) => setElementColor(e.target.value)}
                                            className="w-10 h-10 p-1 rounded border cursor-pointer"
                                            title="Color del elemento"
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Coordenadas</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="number" placeholder="X" value={pointCoords.x} onChange={(e) => setPointCoords({ ...pointCoords, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                        <input type="number" placeholder="Y" value={pointCoords.y} onChange={(e) => setPointCoords({ ...pointCoords, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                        <input type="number" placeholder="Z" value={pointCoords.z} onChange={(e) => setPointCoords({ ...pointCoords, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
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
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nombre (opcional)"
                                        value={lineName}
                                        onChange={(e) => setLineName(e.target.value)}
                                        className={`flex-1 px-3 py-2 border rounded-lg text-sm ${inputClass}`}
                                    />
                                    {editingElementId && (
                                        <input
                                            type="color"
                                            value={elementColor}
                                            onChange={(e) => setElementColor(e.target.value)}
                                            className="w-10 h-10 p-1 rounded border cursor-pointer"
                                            title="Color del elemento"
                                        />
                                    )}
                                </div>

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
                                                    <input type="number" placeholder="X" value={lineP2Str.x} onChange={(e) => setLineP2Str({ ...lineP2Str, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Y" value={lineP2Str.y} onChange={(e) => setLineP2Str({ ...lineP2Str, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Z" value={lineP2Str.z} onChange={(e) => setLineP2Str({ ...lineP2Str, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Vector Dirección</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input type="number" placeholder="X" value={lineDirStr.x} onChange={(e) => setLineDirStr({ ...lineDirStr, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Y" value={lineDirStr.y} onChange={(e) => setLineDirStr({ ...lineDirStr, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Z" value={lineDirStr.z} onChange={(e) => setLineDirStr({ ...lineDirStr, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div>
                                        <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Punto de paso</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <input type="number" placeholder="X" value={lineP1NonGenericStr.x} onChange={(e) => setLineP1NonGenericStr({ ...lineP1NonGenericStr, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                            <input type="number" placeholder="Y" value={lineP1NonGenericStr.y} onChange={(e) => setLineP1NonGenericStr({ ...lineP1NonGenericStr, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                            <input type="number" placeholder="Z" value={lineP1NonGenericStr.z} onChange={(e) => setLineP1NonGenericStr({ ...lineP1NonGenericStr, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                        </div>
                                        {lineType === 'profile' && (
                                            <div className="mt-2">
                                                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Pendiente (Dirección Y/Z)</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="number" placeholder="Dir Y" value={lineDirStr.y} onChange={(e) => setLineDirStr({ ...lineDirStr, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Dir Z" value={lineDirStr.z} onChange={(e) => setLineDirStr({ ...lineDirStr, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button onClick={handleAddLine} className={`w-full py-2.5 ${editingElementId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}>
                                    {editingElementId ? <Settings size={18} /> : <Plus size={18} />} {editingElementId ? 'Actualizar Recta' : 'Añadir Recta'}
                                </button>

                                {/* Alternativa: Crear recta desde puntos existentes */}
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">O selecciona puntos existentes:</p>
                                    <LineCreator />
                                </div>
                            </div>
                        )}

                        {/* Plane Form  */}
                        {geometryType === 'plane' && (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nombre (opcional)"
                                        value={planeName}
                                        onChange={(e) => setPlaneName(e.target.value)}
                                        className={`flex-1 px-3 py-2 border rounded-lg text-sm ${inputClass}`}
                                    />
                                    {editingElementId && (
                                        <input
                                            type="color"
                                            value={elementColor}
                                            onChange={(e) => setElementColor(e.target.value)}
                                            className="w-10 h-10 p-1 rounded border cursor-pointer"
                                            title="Color del elemento"
                                        />
                                    )}
                                </div>

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
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            <button onClick={() => setPlaneMode('equation')} className={`py-1.5 text-xs rounded border ${planeMode === 'equation' ? 'bg-blue-50 border-blue-300 text-blue-700' : `${isDark ? 'border-white/20 text-gray-300' : 'border-gray-300 text-gray-600'}`}`}>Ecuación</button>
                                            <button onClick={() => setPlaneMode('intercepts')} className={`py-1.5 text-xs rounded border ${planeMode === 'intercepts' ? 'bg-blue-50 border-blue-300 text-blue-700' : `${isDark ? 'border-white/20 text-gray-300' : 'border-gray-300 text-gray-600'}`}`}>Trazas</button>
                                            <button onClick={() => setPlaneMode('2lines')} className={`py-1.5 text-xs rounded border ${planeMode === '2lines' ? 'bg-blue-50 border-blue-300 text-blue-700' : `${isDark ? 'border-white/20 text-gray-300' : 'border-gray-300 text-gray-600'}`}`}>2 Rectas</button>
                                        </div>

                                        <div className="mt-3">
                                            {planeMode === 'simple' && (
                                                <div>
                                                    <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Altura (Z)</label>
                                                    <input type="number" value={simpleValueStr} onChange={(e) => setSimpleValueStr(e.target.value)} className={`w-full px-3 py-2 border rounded text-sm ${inputClass}`} />
                                                </div>
                                            )}

                                            {planeMode === '3points' && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className={`block text-xs font-medium mb-1 ${labelClass}`}>Punto 1</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <input type="number" placeholder="X" value={planeP1Str.x} onChange={(e) => setPlaneP1Str({ ...planeP1Str, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                            <input type="number" placeholder="Y" value={planeP1Str.y} onChange={(e) => setPlaneP1Str({ ...planeP1Str, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                            <input type="number" placeholder="Z" value={planeP1Str.z} onChange={(e) => setPlaneP1Str({ ...planeP1Str, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className={`block text-xs font-medium mb-1 ${labelClass}`}>Punto 2</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <input type="number" placeholder="X" value={planeP2Str.x} onChange={(e) => setPlaneP2Str({ ...planeP2Str, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                            <input type="number" placeholder="Y" value={planeP2Str.y} onChange={(e) => setPlaneP2Str({ ...planeP2Str, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                            <input type="number" placeholder="Z" value={planeP2Str.z} onChange={(e) => setPlaneP2Str({ ...planeP2Str, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className={`block text-xs font-medium mb-1 ${labelClass}`}>Punto 3</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <input type="number" placeholder="X" value={planeP3Str.x} onChange={(e) => setPlaneP3Str({ ...planeP3Str, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                            <input type="number" placeholder="Y" value={planeP3Str.y} onChange={(e) => setPlaneP3Str({ ...planeP3Str, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                            <input type="number" placeholder="Z" value={planeP3Str.z} onChange={(e) => setPlaneP3Str({ ...planeP3Str, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {planeMode === 'normal' && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className={`block text-xs font-medium mb-1 ${labelClass}`}>Punto de paso</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <input type="number" placeholder="X" value={planeP1Str.x} onChange={(e) => setPlaneP1Str({ ...planeP1Str, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                            <input type="number" placeholder="Y" value={planeP1Str.y} onChange={(e) => setPlaneP1Str({ ...planeP1Str, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                            <input type="number" placeholder="Z" value={planeP1Str.z} onChange={(e) => setPlaneP1Str({ ...planeP1Str, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className={`block text-xs font-medium mb-1 ${labelClass}`}>Vector Normal</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <input type="number" placeholder="X" value={planeNormalStr.x} onChange={(e) => setPlaneNormalStr({ ...planeNormalStr, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                            <input type="number" placeholder="Y" value={planeNormalStr.y} onChange={(e) => setPlaneNormalStr({ ...planeNormalStr, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                            <input type="number" placeholder="Z" value={planeNormalStr.z} onChange={(e) => setPlaneNormalStr({ ...planeNormalStr, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {planeMode === 'equation' && (
                                                <div>
                                                    <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Ecuación General (Ax + By + Cz + D = 0)</label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-500 mb-1">A</span>
                                                            <input type="number" value={planeEqStr.a} onChange={(e) => setPlaneEqStr({ ...planeEqStr, a: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-500 mb-1">B</span>
                                                            <input type="number" value={planeEqStr.b} onChange={(e) => setPlaneEqStr({ ...planeEqStr, b: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-500 mb-1">C</span>
                                                            <input type="number" value={planeEqStr.c} onChange={(e) => setPlaneEqStr({ ...planeEqStr, c: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-500 mb-1">D</span>
                                                            <input type="number" value={planeEqStr.d} onChange={(e) => setPlaneEqStr({ ...planeEqStr, d: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {planeMode === 'intercepts' && (
                                                <div className="space-y-3">
                                                    <label className={`block text-xs font-medium ${labelClass}`}>Trazas (Cortes con Ejes)</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-500 mb-1">X (Vértice)</span>
                                                            <input type="number" value={planeInterceptsStr.x} onChange={(e) => setPlaneInterceptsStr({ ...planeInterceptsStr, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-500 mb-1">Y (Alejamiento)</span>
                                                            <input type="number" value={planeInterceptsStr.y} onChange={(e) => setPlaneInterceptsStr({ ...planeInterceptsStr, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-500 mb-1">Z (Cota)</span>
                                                            <input type="number" value={planeInterceptsStr.z} onChange={(e) => setPlaneInterceptsStr({ ...planeInterceptsStr, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        {(planeType !== 'through_lt') && (
                                            <div>
                                                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Punto de paso</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input type="number" placeholder="X" value={planeP1Str.x} onChange={(e) => setPlaneP1Str({ ...planeP1Str, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Y" value={planeP1Str.y} onChange={(e) => setPlaneP1Str({ ...planeP1Str, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    <input type="number" placeholder="Z" value={planeP1Str.z} onChange={(e) => setPlaneP1Str({ ...planeP1Str, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                </div>
                                            </div>
                                        )}

                                        {['parallel_lt', 'vertical', 'canto', 'through_lt'].includes(planeType) && (
                                            <div>
                                                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Orientación (Vector Normal)</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {['vertical', 'canto'].includes(planeType) && (
                                                        <input type="number" placeholder="X" value={planeNormalStr.x} onChange={(e) => setPlaneNormalStr({ ...planeNormalStr, x: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    )}
                                                    {['parallel_lt', 'vertical', 'through_lt'].includes(planeType) && (
                                                        <input type="number" placeholder="Y" value={planeNormalStr.y} onChange={(e) => setPlaneNormalStr({ ...planeNormalStr, y: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
                                                    )}
                                                    {['parallel_lt', 'canto', 'through_lt'].includes(planeType) && (
                                                        <input type="number" placeholder="Z" value={planeNormalStr.z} onChange={(e) => setPlaneNormalStr({ ...planeNormalStr, z: e.target.value })} className={`px-2 py-2 border rounded text-sm ${inputClass}`} />
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

                        {/* Herramienta para crear rectas por puntos - MOVIDO A LA SECCIÓN DE RECTAS */}
                    </div>
                ) : activeTab === 'tools' ? (
                    <>
                        <AbatimientoTool />
                        <TrueMagnitudeTool />
                        <ParallelismTool />
                        <RotationTool />



                        <AdvancedToolsPanel isDark={isDark} />

                        {/* Measurements Panel */}
                        {measurements.length > 0 && (
                            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold">Mediciones</h3>
                                    <button
                                        onClick={clearAllMeasurements}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        Limpiar Todo
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {measurements.map(m => (
                                        <div key={m.id} className={`flex items-center justify-between text-xs p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                                            <span className="font-medium">{m.label}:</span>
                                            <span className={m.type === 'length' ? 'text-blue-400' : 'text-green-400'}>
                                                {m.type === 'length' ? `${m.value.toFixed(2)} u` : `${m.value.toFixed(1)}°`}
                                            </span>
                                            <button
                                                onClick={() => removeMeasurement(m.id)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-2">
                        {elements.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p>No hay elementos creados.</p>
                            </div>
                        ) : (
                            elements
                                .filter(el => !el.name.startsWith('proc_'))
                                .map((el: GeometryElement) => (
                                    <div
                                        key={el.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${selectedElementId === el.id || (selectedForDistance && selectedForDistance.includes(el.id))
                                            ? 'bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-400'
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
            {/* User Menu - Absolutely positioned at bottom */}
            <div className={`absolute bottom-0 left-0 right-0 p-2 border-t ${headerBorder} ${isDark ? 'bg-gray-900' : 'bg-white'} z-10`}>
                <UserMenu />
            </div>


            {/* Tools that need to be always active - outside tabs */}
            <IntersectionTool />
            <ParallelismTool />
            <DistanceTool />
            <AdvancedIntersectionTool />
            <RotationTool />
            <AbatimientoTool />
            <TrueMagnitudeTool />
            {/* Modals */}
            <ExerciseOverlay />
            <HelpGuide isOpen={showHelp} onClose={toggleHelp} isDark={isDark} />
            <SaveProjectModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} />
            <LoadProjectModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} />
        </div >
    );
}
