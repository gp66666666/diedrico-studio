import { useState, useRef, useEffect, memo } from 'react';
import { useGeometryStore } from '../store/geometryStore';
import { intersectLinePlane, intersectPlanePlane, intersectLineLine, calculateLineTraces } from '../utils/mathUtils';
import {
    ZoomIn, ZoomOut, Move, Eye, EyeOff,
    Magnet, PanelRight
} from 'lucide-react';
import type { GeometryElement, LineElement, PlaneElement, SketchElement, PointElement, SketchTool } from '../types';
import Point2D from './2D/Point2D';
import Line2D from './2D/Line2D';
import Plane2D from './2D/Plane2D';
import HelpGuide from './HelpGuide';
import SketchToolbar from './SketchToolbar';

const SCALE = 40; // 40 pixels per unit

// --- Types for Sketch Mode ---




// Custom Cursor for Compass
const compassCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>') 16 16, crosshair`;

interface DiedricoViewProps {
    mode?: '2d' | 'sketch';
    isSidebarOpen?: boolean;
}

// --- Math Helpers ---
function distToSegment(p: { x: number, y: number }, v: { x: number, y: number }, w: { x: number, y: number }) {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

function distToLine(p: { x: number, y: number }, v: { x: number, y: number }, w: { x: number, y: number }) {
    const num = Math.abs((w.y - v.y) * p.x - (w.x - v.x) * p.y + w.x * v.y - w.y * v.x);
    const den = Math.hypot(w.y - v.y, w.x - v.x);
    return num / den;
}

function rotatePoint(p: { x: number, y: number }, center: { x: number, y: number }, angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    return {
        x: center.x + (dx * cos - dy * sin),
        y: center.y + (dx * sin + dy * cos)
    };
}

function scalePoint(p: { x: number, y: number }, center: { x: number, y: number }, factor: number) {
    return {
        x: center.x + (p.x - center.x) * factor,
        y: center.y + (p.y - center.y) * factor
    };
}

// --- Tangent Helpers ---
function getTangentsPointCircle(p: { x: number, y: number }, c: { x: number, y: number }, r: number) {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist <= r) return []; // Point inside or on circle

    // Angle of vector CP
    const angleCP = Math.atan2(dy, dx);

    // Angle offset for tangent points
    // cos(alpha) = r / dist
    const alpha = Math.acos(r / dist);

    // Tangent angles
    const t1Angle = angleCP + alpha;
    const t2Angle = angleCP - alpha;

    return [
        {
            x: c.x + r * Math.cos(t1Angle),
            y: c.y + r * Math.sin(t1Angle)
        },
        {
            x: c.x + r * Math.cos(t2Angle),
            y: c.y + r * Math.sin(t2Angle)
        }
    ];
}

function getTangentsCircleCircle(c1: { x: number, y: number }, r1: number, c2: { x: number, y: number }, r2: number) {
    const lines: { p1: { x: number, y: number }, p2: { x: number, y: number } }[] = [];
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return [];

    const angle = Math.atan2(dy, dx);

    // Outer Tangents
    if (dist >= Math.abs(r1 - r2)) {
        const offset = Math.acos((r1 - r2) / dist);
        // T1
        lines.push({
            p1: { x: c1.x + r1 * Math.cos(angle + offset), y: c1.y + r1 * Math.sin(angle + offset) },
            p2: { x: c2.x + r2 * Math.cos(angle + offset), y: c2.y + r2 * Math.sin(angle + offset) }
        });
        // T2
        lines.push({
            p1: { x: c1.x + r1 * Math.cos(angle - offset), y: c1.y + r1 * Math.sin(angle - offset) },
            p2: { x: c2.x + r2 * Math.cos(angle - offset), y: c2.y + r2 * Math.sin(angle - offset) }
        });
    }

    // Inner Tangents
    if (dist >= r1 + r2) {
        const offset = Math.acos((r1 + r2) / dist);
        // T3
        lines.push({
            p1: { x: c1.x + r1 * Math.cos(angle + offset), y: c1.y + r1 * Math.sin(angle + offset) },
            p2: { x: c2.x + r2 * Math.cos(angle + offset + Math.PI), y: c2.y + r2 * Math.sin(angle + offset + Math.PI) }
        });
        // T4
        lines.push({
            p1: { x: c1.x + r1 * Math.cos(angle - offset), y: c1.y + r1 * Math.sin(angle - offset) },
            p2: { x: c2.x + r2 * Math.cos(angle - offset + Math.PI), y: c2.y + r2 * Math.sin(angle - offset + Math.PI) }
        });
    }

    return lines;
}

const LTAxis = memo(({ show, axisColor, isDark, scale }: { show: boolean, axisColor: string, isDark: boolean, scale: number }) => {
    if (!show) return null;
    return (
        <g className="lt-axis">
            {/* Main LT line - Reduced range for safety */}
            <line x1="-3000" y1="0" x2="3000" y2="0" stroke={axisColor} strokeWidth="2" />

            {/* Left parallel mark (below LT) */}
            <line x1="-410" y1="8" x2="-370" y2="8" stroke={axisColor} strokeWidth="1.5" />

            {/* Right parallel mark (below LT) */}
            <line x1="370" y1="8" x2="410" y2="8" stroke={axisColor} strokeWidth="1.5" />

            <text x="-380" y="-10" className={`text-sm font-bold select-none ${isDark ? 'fill-white' : 'fill-black'}`} fontSize="16">L.T.</text>

            {/* Ruler Ticks */}
            {Array.from({ length: 21 }).map((_, i) => {
                const val = i - 10;
                const x = val * scale;
                return (
                    <g key={val}>
                        <line x1={x} y1={-5} x2={x} y2={5} stroke={axisColor} strokeWidth="1" />
                        {val !== 0 && <text x={x} y={20} textAnchor="middle" fontSize="10" fill={axisColor} className="select-none">{val}</text>}
                    </g>
                );
            })}
            {/* Origin */}
            <circle cx={0} cy={0} r="3" fill={axisColor} />
        </g>
    );
});

export default function DiedricoView({ mode = '2d', isSidebarOpen = false }: DiedricoViewProps) {
    const { elements, showIntersections, theme, sketchElements, addSketchElement, removeSketchElement, updateSketchElement, showHelp, toggleHelp, showProfile, toggleProfile, distanceResult, selectedForDistance, clearDistanceTool } = useGeometryStore();

    // Viewport State
    const [offset, setOffset] = useState({ x: 400, y: 300 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lastTouchDist, setLastTouchDist] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Touch Helpers
    const getTouchDist = (t1: React.Touch, t2: React.Touch) => {
        return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    };

    const getTouchCenter = (t1: React.Touch, t2: React.Touch) => {
        return {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2
        };
    };

    // Sketch State
    const [activeTool, setActiveTool] = useState<SketchTool>('select');
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [drawingStep, setDrawingStep] = useState(0);
    const [p1, setP1] = useState<{ x: number, y: number } | null>(null);
    const [p2, setP2] = useState<{ x: number, y: number } | null>(null);
    const [currentMousePos, setCurrentMousePos] = useState<{ x: number, y: number } | null>(null);

    // Modification State (Move, Rotate, Scale)
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [modificationCenter, setModificationCenter] = useState<{ x: number, y: number } | null>(null);
    const [initialElementPos, setInitialElementPos] = useState<{ p1: { x: number, y: number }, p2: { x: number, y: number }, p3?: { x: number, y: number } } | null>(null);
    const [startAngle, setStartAngle] = useState(0);
    const [startScaleDist, setStartScaleDist] = useState(0);

    // LT Visibility - Always show on mobile, toggleable on desktop
    const [showLT, setShowLT] = useState(() => {
        if (typeof window !== 'undefined') {
            const isMobile = window.innerWidth < 768;
            return isMobile || mode === '2d';
        }
        return mode === '2d';
    });

    // Magnetism & Help
    const [magnetismEnabled, setMagnetismEnabled] = useState(true);


    // Snapping Guides
    const [snapGuide, setSnapGuide] = useState<{ type: 'perp' | 'horz' | 'vert', x: number, y: number } | null>(null);

    // Theme
    const isDark = theme === 'dark';
    const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
    const gridColor = isDark ? '#ffffff' : '#000000';
    const axisColor = isDark ? '#ffffff' : '#000000';
    const toolbarBg = isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200';
    const iconColor = isDark ? 'text-gray-300' : 'text-gray-600';
    const iconHover = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';


    useEffect(() => {
        setDrawingStep(0);
        setP1(null);
        setP2(null);
        setCurrentMousePos(null);
        setModificationCenter(null);
        if (!['rotate', 'scale', 'select'].includes(activeTool)) {
            setSelectedElementId(null);
        }
    }, [activeTool]);

    // --- Hit Test Logic ---
    const hitTest = (x: number, y: number): string | null => {
        const threshold = 10 / zoom;
        const p = { x, y };

        for (const el of sketchElements) {
            if (el.type === 'point' || el.type === 'text') {
                if (Math.hypot(el.p1.x - x, el.p1.y - y) < threshold * 2) return el.id;
            }
        }

        for (const el of sketchElements) {
            if (el.type === 'segment') {
                if (distToSegment(p, el.p1, el.p2) < threshold) return el.id;
            } else if (el.type === 'line' || el.type === 'ray') {
                if (distToLine(p, el.p1, el.p2) < threshold) return el.id;
            } else if (el.type === 'circle') {
                const r = Math.hypot(el.p2.x - el.p1.x, el.p2.y - el.p1.y);
                const d = Math.hypot(p.x - el.p1.x, p.y - el.p1.y);
                if (Math.abs(d - r) < threshold) return el.id;
            } else if (el.type === 'arc' && el.p3) {
                const r = Math.hypot(el.p2.x - el.p1.x, el.p2.y - el.p1.y);
                const d = Math.hypot(p.x - el.p1.x, p.y - el.p1.y);
                if (Math.abs(d - r) < threshold) return el.id;
            } else if (el.type === 'polygon') {
                const sides = el.extra || 5;
                const rPoly = Math.hypot(el.p2.x - el.p1.x, el.p2.y - el.p1.y);
                const angleStep = (Math.PI * 2) / sides;
                const startAng = Math.atan2(el.p2.y - el.p1.y, el.p2.x - el.p1.x);
                for (let i = 0; i < sides; i++) {
                    const ang1 = startAng + i * angleStep;
                    const ang2 = startAng + (i + 1) * angleStep;
                    const pA = { x: el.p1.x + rPoly * Math.cos(ang1), y: el.p1.y + rPoly * Math.sin(ang1) };
                    const pB = { x: el.p1.x + rPoly * Math.cos(ang2), y: el.p1.y + rPoly * Math.sin(ang2) };
                    if (distToSegment(p, pA, pB) < threshold) return el.id;
                }
            }
        }
        return null;
    };

    // --- Snapping Logic ---
    const getSnapPoint = (clientX: number, clientY: number, origin?: { x: number, y: number }) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        const rawX = (clientX - rect.left - offset.x) / zoom;
        const rawY = (clientY - rect.top - offset.y) / zoom;

        if (!magnetismEnabled) {
            setSnapGuide(null);
            return { x: rawX, y: rawY };
        }

        let finalX = rawX;
        let finalY = rawY;
        let guide = null;

        const threshold = 10 / zoom;
        let minDist = threshold;

        // 1. Snap to Sketch Elements
        sketchElements.forEach(el => {
            const d1 = Math.hypot(el.p1.x - rawX, el.p1.y - rawY);
            if (d1 < minDist) { minDist = d1; finalX = el.p1.x; finalY = el.p1.y; }
            const d2 = Math.hypot(el.p2.x - rawX, el.p2.y - rawY);
            if (d2 < minDist) { minDist = d2; finalX = el.p2.x; finalY = el.p2.y; }
            // Snap to Center for Circles
            if (el.type === 'circle') {
                const dC = Math.hypot(el.p1.x - rawX, el.p1.y - rawY);
                if (dC < minDist) { minDist = dC; finalX = el.p1.x; finalY = el.p1.y; }
            }
        });

        // 2. Snap to 3D Elements (Projections)
        elements.forEach(el => {
            if (!el.visible) return;
            if (el.type === 'point') {
                const pt = el as PointElement;
                // Horizontal Projection (x, y)
                const pxH = pt.coords.x * SCALE;
                const pyH = pt.coords.y * SCALE;
                const dH = Math.hypot(pxH - rawX, pyH - rawY);
                if (dH < minDist) { minDist = dH; finalX = pxH; finalY = pyH; }

                // Vertical Projection (x, -z)
                const pxV = pt.coords.x * SCALE;
                const pyV = -pt.coords.z * SCALE;
                const dV = Math.hypot(pxV - rawX, pyV - rawY);
                if (dV < minDist) { minDist = dV; finalX = pxV; finalY = pyV; }
            }
        });

        // 3. Directional Snapping (Perpendiculars, Horz, Vert)
        if (origin && !['select', 'rotate', 'scale', 'mediatriz', 'bisectriz', 'tangent'].includes(activeTool)) {
            const dx = rawX - origin.x;
            const dy = rawY - origin.y;
            const angle = Math.atan2(dy, dx);
            const dist = Math.hypot(dx, dy);

            if (Math.abs(dy) < threshold) {
                finalY = origin.y;
                guide = { type: 'horz', x: finalX, y: finalY };
            } else if (Math.abs(dx) < threshold) {
                finalX = origin.x;
                guide = { type: 'vert', x: finalX, y: finalY };
            } else {
                // Check Sketch Lines
                for (const el of sketchElements) {
                    if (el.type === 'segment' || el.type === 'line' || el.type === 'ray') {
                        const elAngle = Math.atan2(el.p2.y - el.p1.y, el.p2.x - el.p1.x);
                        const diff = Math.abs(angle - elAngle);
                        const isPerp = Math.abs(diff - Math.PI / 2) < 0.1 || Math.abs(diff - 3 * Math.PI / 2) < 0.1;
                        if (isPerp) {
                            const targetAngle = elAngle + Math.PI / 2;
                            finalX = origin.x + dist * Math.cos(targetAngle);
                            finalY = origin.y + dist * Math.sin(targetAngle);
                            guide = { type: 'perp', x: finalX, y: finalY };
                            break;
                        }
                    }
                }

                // Check 3D Lines (Projections)
                if (!guide) {
                    for (const el of elements) {
                        if (el.type === 'line' && el.visible) {
                            const l = el as LineElement;
                            // Horizontal Projection Angle
                            const angleH = Math.atan2(l.direction.y, l.direction.x);
                            const diffH = Math.abs(angle - angleH);
                            const isPerpH = Math.abs(diffH - Math.PI / 2) < 0.1 || Math.abs(diffH - 3 * Math.PI / 2) < 0.1;

                            if (isPerpH) {
                                const targetAngle = angleH + Math.PI / 2;
                                finalX = origin.x + dist * Math.cos(targetAngle);
                                finalY = origin.y + dist * Math.sin(targetAngle);
                                guide = { type: 'perp', x: finalX, y: finalY };
                                break;
                            }

                            // Vertical Projection Angle (y is -z)
                            const angleV = Math.atan2(-l.direction.z, l.direction.x);
                            const diffV = Math.abs(angle - angleV);
                            const isPerpV = Math.abs(diffV - Math.PI / 2) < 0.1 || Math.abs(diffV - 3 * Math.PI / 2) < 0.1;

                            if (isPerpV) {
                                const targetAngle = angleV + Math.PI / 2;
                                finalX = origin.x + dist * Math.cos(targetAngle);
                                finalY = origin.y + dist * Math.sin(targetAngle);
                                guide = { type: 'perp', x: finalX, y: finalY };
                                break;
                            }
                        }
                    }
                }
            }
        }
        setSnapGuide(guide as any);
        return { x: finalX, y: finalY };
    };

    // --- Mouse Handlers ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        const snapPos = getSnapPoint(e.clientX, e.clientY, p1 || undefined);

        if (activeTool === 'select') {
            const hitId = hitTest(snapPos.x, snapPos.y);
            if (hitId) {
                const el = sketchElements.find(e => e.id === hitId);
                if (el) {
                    setSelectedElementId(hitId);
                    setInitialElementPos({ p1: { ...el.p1 }, p2: { ...el.p2 }, p3: el.p3 ? { ...el.p3 } : undefined });
                    setDragStart({ x: snapPos.x, y: snapPos.y });
                    setIsDragging(true);
                    return;
                }
            }
            setIsDragging(true);
            setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
            return;
        }

        if (activeTool === 'rotate') {
            if (!selectedElementId) {
                const hitId = hitTest(snapPos.x, snapPos.y);
                if (hitId) setSelectedElementId(hitId);
                return;
            }
            if (drawingStep === 0) {
                setModificationCenter(snapPos);
                setDrawingStep(1);
            } else if (drawingStep === 1) {
                if (modificationCenter) {
                    const angle = Math.atan2(snapPos.y - modificationCenter.y, snapPos.x - modificationCenter.x);
                    setStartAngle(angle);
                    const el = sketchElements.find(e => e.id === selectedElementId);
                    if (el) setInitialElementPos({ p1: { ...el.p1 }, p2: { ...el.p2 }, p3: el.p3 ? { ...el.p3 } : undefined });
                    setDrawingStep(2);
                }
            }
            return;
        }

        if (activeTool === 'scale') {
            if (!selectedElementId) {
                const hitId = hitTest(snapPos.x, snapPos.y);
                if (hitId) setSelectedElementId(hitId);
                return;
            }
            if (drawingStep === 0) {
                setModificationCenter(snapPos);
                setDrawingStep(1);
            } else if (drawingStep === 1) {
                if (modificationCenter) {
                    const dist = Math.hypot(snapPos.x - modificationCenter.x, snapPos.y - modificationCenter.y);
                    setStartScaleDist(dist);
                    const el = sketchElements.find(e => e.id === selectedElementId);
                    if (el) setInitialElementPos({ p1: { ...el.p1 }, p2: { ...el.p2 }, p3: el.p3 ? { ...el.p3 } : undefined });
                    setIsDragging(true);
                }
            }
            return;
        }

        // --- New Construction Tools ---
        if (activeTool === 'mediatriz') {
            if (drawingStep === 0) {
                setP1(snapPos);
                setDrawingStep(1);
            } else {
                if (p1) {
                    // Calculate Midpoint
                    const midX = (p1.x + snapPos.x) / 2;
                    const midY = (p1.y + snapPos.y) / 2;
                    // Calculate Perpendicular Direction
                    const dx = snapPos.x - p1.x;
                    const dy = snapPos.y - p1.y;
                    // Perpendicular vector (-dy, dx)
                    const p2X = midX - dy;
                    const p2Y = midY + dx;

                    addSketchElement({
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'line',
                        p1: { x: midX, y: midY },
                        p2: { x: p2X, y: p2Y },
                        color: selectedColor
                    });
                    setDrawingStep(0); setP1(null);
                }
            }
            return;
        }

        if (activeTool === 'bisectriz') {
            if (drawingStep === 0) {
                setP1(snapPos); // Point A
                setDrawingStep(1);
            } else if (drawingStep === 1) {
                setP2(snapPos); // Vertex V
                setDrawingStep(2);
            } else {
                if (p1 && p2) {
                    // Point C is snapPos
                    // Vector VA
                    const vaX = p1.x - p2.x;
                    const vaY = p1.y - p2.y;
                    const lenA = Math.hypot(vaX, vaY);
                    // Vector VC
                    const vcX = snapPos.x - p2.x;
                    const vcY = snapPos.y - p2.y;
                    const lenC = Math.hypot(vcX, vcY);

                    // Normalized sum for bisector direction
                    const dirX = (vaX / lenA) + (vcX / lenC);
                    const dirY = (vaY / lenA) + (vcY / lenC);

                    addSketchElement({
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'ray',
                        p1: p2, // Starts at Vertex
                        p2: { x: p2.x + dirX, y: p2.y + dirY },
                        color: selectedColor
                    });
                    setDrawingStep(0); setP1(null); setP2(null);
                }
            }
            return;
        }

        if (activeTool === 'tangent') {
            const hitId = hitTest(snapPos.x, snapPos.y);
            if (!hitId) return; // Must click on an object

            if (drawingStep === 0) {
                setSelectedElementId(hitId);
                setDrawingStep(1);
            } else {
                const el1 = sketchElements.find(e => e.id === selectedElementId);
                const el2 = sketchElements.find(e => e.id === hitId);

                if (el1 && el2) {
                    let newLines: { p1: { x: number, y: number }, p2: { x: number, y: number } }[] = [];

                    // Case 1: Point to Circle
                    if (el1.type === 'point' && el2.type === 'circle') {
                        const r = Math.hypot(el2.p2.x - el2.p1.x, el2.p2.y - el2.p1.y);
                        const pts = getTangentsPointCircle(el1.p1, el2.p1, r);
                        pts.forEach(pt => newLines.push({ p1: el1.p1, p2: pt }));
                    }
                    // Case 2: Circle to Point
                    else if (el1.type === 'circle' && el2.type === 'point') {
                        const r = Math.hypot(el1.p2.x - el1.p1.x, el1.p2.y - el1.p1.y);
                        const pts = getTangentsPointCircle(el2.p1, el1.p1, r);
                        pts.forEach(pt => newLines.push({ p1: el2.p1, p2: pt }));
                    }
                    // Case 3: Circle to Circle
                    else if (el1.type === 'circle' && el2.type === 'circle') {
                        const r1 = Math.hypot(el1.p2.x - el1.p1.x, el1.p2.y - el1.p1.y);
                        const r2 = Math.hypot(el2.p2.x - el2.p1.x, el2.p2.y - el2.p1.y);
                        newLines = getTangentsCircleCircle(el1.p1, r1, el2.p1, r2);
                    }

                    newLines.forEach(l => {
                        addSketchElement({
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'line',
                            p1: l.p1,
                            p2: l.p2,
                            color: selectedColor
                        });
                    });
                }
                setDrawingStep(0); setSelectedElementId(null);
            }
            return;
        }

        // --- Conic Sections ---
        if (activeTool === 'ellipse') {
            if (drawingStep === 0) { setP1(snapPos); setDrawingStep(1); } // Center
            else if (drawingStep === 1) { setP2(snapPos); setDrawingStep(2); } // Axis 1 End
            else {
                if (p1 && p2) {
                    addSketchElement({
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'ellipse',
                        p1: p1, p2: p2, p3: snapPos,
                        color: selectedColor
                    });
                    setDrawingStep(0); setP1(null); setP2(null);
                }
            }
            return;
        }
        if (activeTool === 'parabola') {
            if (drawingStep === 0) { setP1(snapPos); setDrawingStep(1); } // Vertex
            else {
                if (p1) {
                    addSketchElement({
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'parabola',
                        p1: p1, p2: snapPos,
                        color: selectedColor
                    });
                    setDrawingStep(0); setP1(null);
                }
            }
            return;
        }
        if (activeTool === 'hyperbola') {
            if (drawingStep === 0) { setP1(snapPos); setDrawingStep(1); } // Center
            else if (drawingStep === 1) { setP2(snapPos); setDrawingStep(2); } // Vertex
            else {
                if (p1 && p2) {
                    addSketchElement({
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'hyperbola',
                        p1: p1, p2: p2, p3: snapPos,
                        color: selectedColor
                    });
                    setDrawingStep(0); setP1(null); setP2(null);
                }
            }
            return;
        }

        // --- Existing Drawing Tools ---
        if (activeTool === 'text') {
            const text = prompt("Introduce el texto:");
            if (text) {
                addSketchElement({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'text',
                    p1: snapPos, p2: snapPos, text: text, color: selectedColor
                });
            }
            return;
        }
        if (activeTool === 'point') {
            addSketchElement({ id: Math.random().toString(36).substr(2, 9), type: 'point', p1: snapPos, p2: snapPos, color: selectedColor });
        } else if (activeTool === 'arc') {
            if (drawingStep === 0) { setP1(snapPos); setDrawingStep(1); }
            else if (drawingStep === 1) { setP2(snapPos); setDrawingStep(2); }
            else {
                if (p1 && p2) {
                    addSketchElement({ id: Math.random().toString(36).substr(2, 9), type: 'arc', p1: p1, p2: p2, p3: snapPos, color: selectedColor });
                    setDrawingStep(0); setP1(null); setP2(null);
                }
            }
        } else if (activeTool === 'polygon') {
            if (drawingStep === 0) { setP1(snapPos); setDrawingStep(1); }
            else {
                if (p1) {
                    const sides = parseInt(prompt("Número de lados:", "5") || "5");
                    addSketchElement({ id: Math.random().toString(36).substr(2, 9), type: 'polygon', p1: p1, p2: snapPos, extra: sides, color: selectedColor });
                    setDrawingStep(0); setP1(null);
                }
            }
        } else {
            setP1(snapPos);
            setCurrentMousePos(snapPos);
            setIsDragging(true);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const snapPos = getSnapPoint(e.clientX, e.clientY, p1 || undefined);
        setCurrentMousePos(snapPos);

        if (activeTool === 'select' && isDragging) {
            if (selectedElementId && initialElementPos) {
                const dx = snapPos.x - dragStart.x;
                const dy = snapPos.y - dragStart.y;
                updateSketchElement(selectedElementId, {
                    p1: { x: initialElementPos.p1.x + dx, y: initialElementPos.p1.y + dy },
                    p2: { x: initialElementPos.p2.x + dx, y: initialElementPos.p2.y + dy },
                    p3: initialElementPos.p3 ? { x: initialElementPos.p3.x + dx, y: initialElementPos.p3.y + dy } : undefined
                });
            } else {
                setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            }
        }

        else if (activeTool === 'rotate' && drawingStep === 2 && modificationCenter && initialElementPos && selectedElementId) {
            const currentAngle = Math.atan2(snapPos.y - modificationCenter.y, snapPos.x - modificationCenter.x);
            const deltaAngle = currentAngle - startAngle;

            const newP1 = rotatePoint(initialElementPos.p1, modificationCenter, deltaAngle);
            const newP2 = rotatePoint(initialElementPos.p2, modificationCenter, deltaAngle);
            const newP3 = initialElementPos.p3 ? rotatePoint(initialElementPos.p3, modificationCenter, deltaAngle) : undefined;

            updateSketchElement(selectedElementId, { p1: newP1, p2: newP2, p3: newP3 });
        }

        else if (activeTool === 'scale' && isDragging && modificationCenter && initialElementPos && selectedElementId) {
            const currentDist = Math.hypot(snapPos.x - modificationCenter.x, snapPos.y - modificationCenter.y);
            const scaleFactor = startScaleDist > 0 ? currentDist / startScaleDist : 1;

            const newP1 = scalePoint(initialElementPos.p1, modificationCenter, scaleFactor);
            const newP2 = scalePoint(initialElementPos.p2, modificationCenter, scaleFactor);
            const newP3 = initialElementPos.p3 ? scalePoint(initialElementPos.p3, modificationCenter, scaleFactor) : undefined;

            updateSketchElement(selectedElementId, { p1: newP1, p2: newP2, p3: newP3 });
        }
    };

    const handleMouseUp = () => {
        if (activeTool === 'select') {
            setIsDragging(false);
            setSelectedElementId(null);
            setInitialElementPos(null);
        }
        else if (activeTool === 'rotate') {
            if (drawingStep === 2) {
                setDrawingStep(0);
                setModificationCenter(null);
                setInitialElementPos(null);
            }
        }
        else if (activeTool === 'scale') {
            if (isDragging) {
                setIsDragging(false);
                setDrawingStep(0);
                setModificationCenter(null);
                setInitialElementPos(null);
            }
        }
        else if (isDragging && p1 && !['arc', 'polygon', 'point', 'text', 'mediatriz', 'bisectriz', 'tangent', 'ellipse', 'parabola', 'hyperbola'].includes(activeTool)) {
            setIsDragging(false);
            if (currentMousePos && Math.hypot(p1.x - currentMousePos.x, p1.y - currentMousePos.y) > 0.1) {
                addSketchElement({
                    id: Math.random().toString(36).substr(2, 9),
                    type: activeTool as any,
                    p1: p1, p2: currentMousePos, color: selectedColor
                });
            }
            setP1(null);
            setCurrentMousePos(null);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        const scaleFactor = 1.1;
        if (e.deltaY < 0) setZoom(z => Math.min(z * scaleFactor, 5));
        else setZoom(z => Math.max(z / scaleFactor, 0.2));
    };

    const handleSketchClick = (e: React.MouseEvent, el: SketchElement) => {
        e.stopPropagation();
        if (activeTool === 'eraser') removeSketchElement(el.id);
        else if (activeTool === 'select' || activeTool === 'rotate' || activeTool === 'scale') {
            setSelectedElementId(el.id);
        }
    };

    // Render Preview
    const renderPreview = () => {
        if (activeTool === 'rotate' && modificationCenter) {
            return (
                <g>
                    <circle cx={modificationCenter.x} cy={modificationCenter.y} r="4" fill="red" />
                    {drawingStep === 2 && currentMousePos && (
                        <line x1={modificationCenter.x} y1={modificationCenter.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke="red" strokeDasharray="4 4" />
                    )}
                </g>
            );
        }
        if (activeTool === 'scale' && modificationCenter) {
            return (
                <g>
                    <circle cx={modificationCenter.x} cy={modificationCenter.y} r="4" fill="purple" />
                    {currentMousePos && (
                        <line x1={modificationCenter.x} y1={modificationCenter.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke="purple" strokeDasharray="4 4" />
                    )}
                </g>
            );
        }

        if (!p1 || !currentMousePos) return null;
        const color = selectedColor;

        if (activeTool === 'arc' && drawingStep === 2 && p2) {
            const r = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            const startAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const endAngle = Math.atan2(currentMousePos.y - p1.y, currentMousePos.x - p1.x);
            const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
            const sweep = endAngle > startAngle ? 1 : 0;
            const ex = p1.x + r * Math.cos(endAngle);
            const ey = p1.y + r * Math.sin(endAngle);
            return <path d={`M ${p2.x} ${p2.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${ex} ${ey}`} fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 4" />;
        }

        switch (activeTool) {
            case 'segment': return <line x1={p1.x} y1={p1.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke={color} strokeWidth="2" strokeDasharray="4 4" />;
            case 'ray': // Simplified preview
            case 'line': return <line x1={p1.x} y1={p1.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke={color} strokeWidth="2" strokeDasharray="4 4" />;
            case 'circle':
                const r = Math.hypot(currentMousePos.x - p1.x, currentMousePos.y - p1.y);
                return (
                    <g>
                        <circle cx={p1.x} cy={p1.y} r={r} fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 4" />
                        <line x1={p1.x} y1={p1.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                    </g>
                );
            case 'polygon':
                const rPoly = Math.hypot(currentMousePos.x - p1.x, currentMousePos.y - p1.y);
                return <circle cx={p1.x} cy={p1.y} r={rPoly} fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 2" />;
            case 'mediatriz':
                return <line x1={p1.x} y1={p1.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke={color} strokeWidth="2" strokeDasharray="4 4" />;
            case 'bisectriz':
                if (drawingStep === 1) return <line x1={p1.x} y1={p1.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke={color} strokeWidth="2" strokeDasharray="4 4" />;
                if (drawingStep === 2 && p2) {
                    return (
                        <g>
                            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                            <line x1={p2.x} y1={p2.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke={color} strokeWidth="2" strokeDasharray="4 4" />
                        </g>
                    );
                }
                return null;
            case 'tangent':
                return null;
            case 'ellipse':
                if (drawingStep === 1) return <line x1={p1.x} y1={p1.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke={color} strokeWidth="1" strokeDasharray="2 2" />;
                if (drawingStep === 2 && p2) {
                    const rx = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                    const ry = Math.hypot(currentMousePos.x - p1.x, currentMousePos.y - p1.y);
                    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
                    return <ellipse cx={p1.x} cy={p1.y} rx={rx} ry={ry} transform={`rotate(${angle} ${p1.x} ${p1.y})`} fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 4" />;
                }
                return null;
            case 'parabola':
                if (drawingStep === 1) return <line x1={p1.x} y1={p1.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke={color} strokeWidth="1" strokeDasharray="2 2" />;
                return null;
            case 'hyperbola':
                if (drawingStep === 1) return <line x1={p1.x} y1={p1.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke={color} strokeWidth="1" strokeDasharray="2 2" />;
                if (drawingStep === 2 && p2) return <line x1={p1.x} y1={p1.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke={color} strokeWidth="1" strokeDasharray="2 2" />;
                return null;
            default: return null;
        }
    };

    return (
        <div
            ref={containerRef}
            className={`diedrico-canvas w-full h-full overflow-hidden relative transition-colors duration-300 ${bgColor}`}
            style={{ cursor: activeTool === 'circle' ? compassCursor : (activeTool === 'select' ? 'default' : 'crosshair') }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={(e) => {
                if (e.touches.length === 2) {
                    const dist = getTouchDist(e.touches[0], e.touches[1]);
                    setLastTouchDist(dist);
                } else if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    handleMouseDown({ ...e, clientX: touch.clientX, clientY: touch.clientY, button: 0, target: e.target } as any);
                }
            }}
            onTouchMove={(e) => {
                if (e.touches.length === 2 && lastTouchDist) {
                    const dist = getTouchDist(e.touches[0], e.touches[1]);
                    const scale = dist / lastTouchDist;
                    setZoom(z => Math.max(0.2, Math.min(5, z * scale)));
                    setLastTouchDist(dist);

                    // Optional: Pan with two fingers center? 
                    // For now just zoom to keep it simple and avoid conflict
                } else if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    handleMouseMove({ ...e, clientX: touch.clientX, clientY: touch.clientY } as any);
                }
            }}
            onTouchEnd={() => {
                setLastTouchDist(null);
                handleMouseUp();
            }}
        >
            {/* Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
            />

            {mode === 'sketch' && (
                <SketchToolbar
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    isDark={isDark}
                    isHidden={isSidebarOpen}
                />
            )}

            {/* View Controls */}
            <div className={`absolute ${mode === 'sketch' ? 'bottom-24 md:bottom-4' : 'bottom-4'} right-4 hidden md:flex flex-col gap-2 p-2 rounded-lg shadow-lg border z-10 transition-colors ${toolbarBg}`}>
                <button onClick={() => setZoom(z => Math.min(z * 1.2, 5))} className={`p-2 rounded ${iconHover} ${iconColor}`} title="Zoom In"><ZoomIn size={20} /></button>
                <button onClick={() => setZoom(1)} className={`p-2 rounded ${iconHover} ${iconColor}`} title="Reset View"><Move size={20} /></button>
                <button onClick={() => setZoom(z => Math.max(z / 1.2, 0.2))} className={`p-2 rounded ${iconHover} ${iconColor}`} title="Zoom Out"><ZoomOut size={20} /></button>
            </div>

            {/* LT Toggle & Magnetism (Sketch Mode Only) */}
            {mode === 'sketch' && (
                <div className={`absolute bottom-32 md:bottom-4 left-4 flex gap-2 p-2 rounded-lg shadow-lg border z-10 transition-colors ${toolbarBg}`}>
                    {/* Only show LT button on desktop */}
                    {(elements.length > 0 || sketchElements.length > 0) && (
                        <>
                            <button onClick={() => setShowLT(!showLT)} className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium ${showLT ? 'bg-blue-500 text-white' : `${iconColor} hover:bg-gray-100`}`}>
                                {showLT ? <Eye size={14} /> : <EyeOff size={14} />} Línea de Tierra
                            </button>
                            <div className={`hidden md:block w-px my-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        </>
                    )}
                    <button onClick={() => setMagnetismEnabled(!magnetismEnabled)} className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium ${magnetismEnabled ? 'bg-amber-500 text-white' : `${iconColor} hover:bg-gray-100`}`} title="Activar/Desactivar Magnetismo">
                        <Magnet size={14} /> {magnetismEnabled ? 'Magnetismo ON' : 'Magnetismo OFF'}
                    </button>
                </div>
            )}

            {/* Profile View Toggle (2D Mode) */}
            {mode === '2d' && (
                <div className={`absolute bottom-4 left-4 flex gap-2 p-2 rounded-lg shadow-lg border z-10 transition-colors ${toolbarBg}`}>
                    <button onClick={toggleProfile} className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium ${showProfile ? 'bg-purple-500 text-white' : `${iconColor} hover:bg-gray-100`}`}>
                        <PanelRight size={14} /> {showProfile ? 'Ocultar Perfil' : 'Vista de Perfil'}
                    </button>
                </div>
            )}

            {/* Distance Result Display */}
            {distanceResult && (
                <div className={`absolute top-4 right-4 p-4 rounded-lg shadow-lg border z-20 transition-colors ${toolbarBg}`}>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            📏 Distancia Calculada
                        </h3>
                        <button
                            onClick={clearDistanceTool}
                            className={`text-xs px-2 py-1 rounded ${iconHover} ${iconColor}`}
                            title="Cerrar"
                        >
                            ✕
                        </button>
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {distanceResult.value.toFixed(3)} unidades
                    </div>
                    {selectedForDistance && selectedForDistance.length === 2 && (
                        <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Entre: {elements.find(e => e.id === selectedForDistance[0])?.name || 'P1'} y {elements.find(e => e.id === selectedForDistance[1])?.name || 'P2'}
                        </div>
                    )}
                </div>
            )}
            {/* Help Guide Modal */}
            {showHelp && <HelpGuide isOpen={showHelp} onClose={toggleHelp} isDark={isDark} />}

            {/* SVG Canvas */}
            <svg id="main-drawing-svg" className="w-full h-full" style={{ touchAction: 'none' }}>
                <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
                    {/* Axes and Grid Lines */}
                    <g className="grid-lines opacity-10 pointer-events-none">
                        <line x1="0" y1="-2000" x2="0" y2="2000" stroke={axisColor} strokeWidth="1" />
                        <line x1="-2000" y1="0" x2="2000" y2="0" stroke={axisColor} strokeWidth="1" />
                    </g>

                    <LTAxis show={showLT} axisColor={axisColor || '#000000'} isDark={isDark} scale={SCALE} />

                    {/* Profile View (3rd Projection) */}
                    {showProfile && (
                        <g className="profile-view">
                            {/* Profile Plane Axis */}
                            <line x1={12 * SCALE} y1="-2000" x2={12 * SCALE} y2="2000" stroke={axisColor} strokeWidth="1" strokeDasharray="4 4" />
                            <text x={12 * SCALE + 10} y="-10" fontSize="12" fill={axisColor}>P.P.</text>

                            {elements.map(el => {
                                if (!el.visible) return null;
                                const profColor = '#9333ea'; // Purple

                                if (el.type === 'point') {
                                    const pt = el as PointElement;
                                    const ppX = 12 * SCALE;
                                    const p3X = ppX + pt.coords.y * SCALE; // Y (Alejamiento) goes to right
                                    const p3Y = -pt.coords.z * SCALE; // Z (Cota) goes up (negative SVG Y)

                                    return (
                                        <g key={`prof-${el.id}`}>
                                            {/* Projection Lines */}
                                            <line x1={pt.coords.x * SCALE} y1={p3Y} x2={p3X} y2={p3Y} stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
                                            <line x1={pt.coords.x * SCALE} y1={pt.coords.y * SCALE} x2={ppX} y2={pt.coords.y * SCALE} stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
                                            <path
                                                d={`M ${ppX} ${pt.coords.y * SCALE} A ${Math.abs(pt.coords.y * SCALE)} ${Math.abs(pt.coords.y * SCALE)} 0 0 ${pt.coords.y > 0 ? 0 : 1} ${p3X} 0`}
                                                fill="none" stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5"
                                            />
                                            <line x1={p3X} y1={0} x2={p3X} y2={p3Y} stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
                                            <circle cx={p3X} cy={p3Y} r="3" fill={profColor} />
                                            <text x={p3X + 5} y={p3Y - 5} fontSize="10" fill={profColor}>{el.name}'''</text>
                                        </g>
                                    );
                                } else if (el.type === 'line') {
                                    const l = el as LineElement;
                                    const t1 = -10; const t2 = 10;
                                    const pt1 = { x: l.point.x + l.direction.x * t1, y: l.point.y + l.direction.y * t1, z: l.point.z + l.direction.z * t1 };
                                    const pt2 = { x: l.point.x + l.direction.x * t2, y: l.point.y + l.direction.y * t2, z: l.point.z + l.direction.z * t2 };

                                    const ppX = 12 * SCALE;
                                    const p1_3X = ppX + pt1.y * SCALE;
                                    const p1_3Y = -pt1.z * SCALE;
                                    const p2_3X = ppX + pt2.y * SCALE;
                                    const p2_3Y = -pt2.z * SCALE;

                                    return (
                                        <g key={`prof-${el.id}`}>
                                            {/* Projection Lines for Start Point */}
                                            <line x1={pt1.x * SCALE} y1={p1_3Y} x2={p1_3X} y2={p1_3Y} stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
                                            <line x1={pt1.x * SCALE} y1={pt1.y * SCALE} x2={ppX} y2={pt1.y * SCALE} stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
                                            <path d={`M ${ppX} ${pt1.y * SCALE} A ${Math.abs(pt1.y * SCALE)} ${Math.abs(pt1.y * SCALE)} 0 0 ${pt1.y > 0 ? 0 : 1} ${p1_3X} 0`} fill="none" stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
                                            <line x1={p1_3X} y1={0} x2={p1_3X} y2={p1_3Y} stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />

                                            {/* Projection Lines for End Point */}
                                            <line x1={pt2.x * SCALE} y1={p2_3Y} x2={p2_3X} y2={p2_3Y} stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
                                            <line x1={pt2.x * SCALE} y1={pt2.y * SCALE} x2={ppX} y2={pt2.y * SCALE} stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
                                            <path d={`M ${ppX} ${pt2.y * SCALE} A ${Math.abs(pt2.y * SCALE)} ${Math.abs(pt2.y * SCALE)} 0 0 ${pt2.y > 0 ? 0 : 1} ${p2_3X} 0`} fill="none" stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
                                            <line x1={p2_3X} y1={0} x2={p2_3X} y2={p2_3Y} stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />

                                            {/* The Profile Line */}
                                            <line x1={p1_3X} y1={p1_3Y} x2={p2_3X} y2={p2_3Y} stroke={profColor} strokeWidth="2" />
                                            <text x={p2_3X} y={p2_3Y - 5} fontSize="10" fill={profColor}>{el.name}'''</text>
                                        </g>
                                    );
                                } else if (el.type === 'plane') {
                                    const p = el as PlaneElement;
                                    const ppX = 12 * SCALE;
                                    let pA: { x: number, y: number } | null = null;
                                    if (Math.abs(p.normal.y) > 1e-6) {
                                        const y = -(p.constant + p.normal.x * 12) / p.normal.y;
                                        pA = { x: ppX + y * SCALE, y: 0 };
                                    }
                                    let pB: { x: number, y: number } | null = null;
                                    if (Math.abs(p.normal.z) > 1e-6) {
                                        const z = -(p.constant + p.normal.x * 12) / p.normal.z;
                                        pB = { x: ppX, y: -z * SCALE };
                                    }

                                    if (pA && pB) {
                                        return (
                                            <g key={`prof-${el.id}`}>
                                                {/* Projection for pA (from Horizontal Trace) */}
                                                <line x1={ppX} y1={0} x2={pA.x} y2={0} stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
                                                <path d={`M ${ppX} 0 A ${Math.abs(pA.x - ppX)} ${Math.abs(pA.x - ppX)} 0 0 ${pA.x > ppX ? 0 : 1} ${pA.x} 0`} fill="none" stroke={profColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />

                                                {/* Projection for pB (from Vertical Trace) - usually direct on Z axis */}

                                                {/* The Profile Trace */}
                                                <line x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y} stroke={profColor} strokeWidth="2" />
                                                <text x={pB.x + 5} y={pB.y - 5} fontSize="10" fill={profColor}>{el.name}'''</text>
                                            </g>
                                        );
                                    } else if (pA && !pB) {
                                        return (
                                            <g key={`prof-${el.id}`}>
                                                <line x1={pA.x} y1={-2000} x2={pA.x} y2={2000} stroke={profColor} strokeWidth="2" />
                                                <text x={pA.x + 5} y={-100} fontSize="10" fill={profColor}>{el.name}'''</text>
                                            </g>
                                        );
                                    } else if (!pA && pB) {
                                        return (
                                            <g key={`prof-${el.id}`}>
                                                <line x1={ppX - 2000} y1={pB.y} x2={ppX + 2000} y2={pB.y} stroke={profColor} strokeWidth="2" />
                                                <text x={ppX + 50} y={pB.y - 5} fontSize="10" fill={profColor}>{el.name}'''</text>
                                            </g>
                                        );
                                    }
                                }
                                return null;
                            })}
                        </g>
                    )}

                    {/* 3D Elements Projections (Always Visible) */}
                    {elements.map((el) => {
                        if (!el.visible) return null;
                        switch (el.type) {
                            case 'point': return <Point2D key={el.id} element={el as any} />;
                            case 'line': return <Line2D key={el.id} element={el as any} />;
                            case 'plane': return <Plane2D key={el.id} element={el as any} />;
                            default: return null;
                        }
                    })}

                    {/* Intersections (Always Visible) */}
                    <Intersections2D elements={elements} showIntersections={showIntersections} />

                    {/* Distance Visualization */}
                    {distanceResult && distanceResult.auxiliaryPoints && distanceResult.auxiliaryPoints.length === 2 && (
                        <g className="distance-visualization">
                            {(() => {
                                const p1 = distanceResult.auxiliaryPoints[0];
                                const p2 = distanceResult.auxiliaryPoints[1];
                                const SCALE = 40;

                                // Horizontal projection
                                const x1_h = p1.x * SCALE;
                                const y1_h = -p1.y * SCALE;
                                const x2_h = p2.x * SCALE;
                                const y2_h = -p2.y * SCALE;

                                // Vertical projection
                                const x1_v = p1.x * SCALE;
                                const y1_v = p1.z * SCALE;
                                const x2_v = p2.x * SCALE;
                                const y2_v = p2.z * SCALE;

                                return (
                                    <>
                                        {/* Horizontal projection line */}
                                        <line x1={x1_h} y1={y1_h} x2={x2_h} y2={y2_h} stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" opacity="0.7" />
                                        {/* Vertical projection line */}
                                        <line x1={x1_v} y1={y1_v} x2={x2_v} y2={y2_v} stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" opacity="0.7" />
                                    </>
                                );
                            })()}
                        </g>
                    )}

                    {/* Merged Text Labels Layer (rendered on top) */}
                    <g className="merged-text-layer">
                        {(() => {
                            // Collect all text labels from ALL elements
                            const allLabels: Array<{ x: number, y: number, text: any, color: string, elementId: string, fontSize?: number }> = [];
                            const SCALE = 40;

                            elements.forEach(el => {
                                if (!el.visible) return;

                                if (el.type === 'point') {
                                    const px = (el as any).coords.x * SCALE;
                                    const py_h = (el as any).coords.y * SCALE;
                                    const py_v = -(el as any).coords.z * SCALE;
                                    allLabels.push({ x: px + 5, y: py_v - 5, text: `${el.name}''`, color: el.color, fontSize: 12, elementId: el.id });
                                    allLabels.push({ x: px + 5, y: py_h + 15, text: `${el.name}'`, color: el.color, fontSize: 12, elementId: el.id });
                                } else if (el.type === 'line') {
                                    const line = el as any;
                                    const p2 = { x: line.point.x + line.direction.x * 15, y: line.point.y + line.direction.y * 15, z: line.point.z + line.direction.z * 15 };
                                    allLabels.push({ x: p2.x * SCALE, y: -p2.z * SCALE - 5, text: `${el.name}''`, color: el.color, fontSize: 12, elementId: `${el.id}-v` });
                                    allLabels.push({ x: p2.x * SCALE, y: p2.y * SCALE + 15, text: `${el.name}'`, color: el.color, fontSize: 12, elementId: `${el.id}-h` });

                                    const traces = calculateLineTraces(line.point, line.direction);
                                    if (traces.hTrace) {
                                        allLabels.push({ x: traces.hTrace.x * SCALE + 5, y: traces.hTrace.y * SCALE + 5, text: (<>h'<tspan fontSize="7" baselineShift="sub">{el.name}</tspan></>), color: el.color, fontSize: 10, elementId: `${el.id}-ht` });
                                        allLabels.push({ x: traces.hTrace.x * SCALE + 5, y: -5, text: (<>h''<tspan fontSize="7" baselineShift="sub">{el.name}</tspan></>), color: el.color, fontSize: 10, elementId: `${el.id}-ht2` });
                                    }
                                    if (traces.vTrace) {
                                        allLabels.push({ x: traces.vTrace.x * SCALE + 5, y: -traces.vTrace.z * SCALE - 5, text: (<>v''<tspan fontSize="7" baselineShift="sub">{el.name}</tspan></>), color: el.color, fontSize: 10, elementId: `${el.id}-vt` });
                                        allLabels.push({ x: traces.vTrace.x * SCALE + 5, y: 15, text: (<>v'<tspan fontSize="7" baselineShift="sub">{el.name}</tspan></>), color: el.color, fontSize: 10, elementId: `${el.id}-vt2` });
                                    }
                                } else if (el.type === 'plane') {
                                    const p = el as any;
                                    const xR = 15 * SCALE;
                                    if (Math.abs(p.normal.z) > 1e-6) {
                                        const y = -(-p.constant - p.normal.x * 15) / p.normal.z * SCALE - 5;
                                        allLabels.push({ x: xR, y, text: (<>{el.name}''<tspan fontSize="9" baselineShift="sub">{el.name}</tspan></>), color: el.color, fontSize: 12, elementId: `${el.id}-pv` });
                                    }
                                    if (Math.abs(p.normal.y) > 1e-6) {
                                        const y = (-p.constant - p.normal.x * 15) / p.normal.y * SCALE + 15;
                                        allLabels.push({ x: xR, y, text: (<>{el.name}'<tspan fontSize="9" baselineShift="sub">{el.name}</tspan></>), color: el.color, fontSize: 12, elementId: `${el.id}-ph` });
                                    }
                                }
                            });

                            // Merge coincident labels (only string labels)
                            const PROXIMITY_THRESHOLD = 15;
                            const stringLabels = allLabels.filter(l => typeof l.text === 'string');
                            const jsxLabels = allLabels.filter(l => typeof l.text !== 'string');

                            const merged: typeof stringLabels = [];
                            const processed = new Set<number>();

                            for (let i = 0; i < stringLabels.length; i++) {
                                if (processed.has(i)) continue;

                                const current = stringLabels[i];
                                const coincident = [current];

                                for (let j = i + 1; j < stringLabels.length; j++) {
                                    if (processed.has(j)) continue;
                                    const other = stringLabels[j];
                                    const distance = Math.sqrt(
                                        Math.pow(current.x - other.x, 2) + Math.pow(current.y - other.y, 2)
                                    );

                                    if (distance < PROXIMITY_THRESHOLD) {
                                        coincident.push(other);
                                        processed.add(j);
                                    }
                                }

                                processed.add(i);

                                if (coincident.length > 1) {
                                    coincident.sort((a, b) => {
                                        const aPrimes = ((a.text as string).match(/'/g) || []).length;
                                        const bPrimes = ((b.text as string).match(/'/g) || []).length;
                                        return aPrimes - bPrimes;
                                    });

                                    merged.push({
                                        ...current,
                                        text: coincident.map(l => l.text).join('-'),
                                        elementId: coincident.map(l => l.elementId).join(',')
                                    });
                                } else {
                                    merged.push(current);
                                }
                            }

                            return [...merged, ...jsxLabels].map((label, idx) => (
                                <text
                                    key={`merged-${label.elementId}-${idx}`}
                                    x={label.x}
                                    y={label.y}
                                    fontSize={label.fontSize || 12}
                                    fill={label.color}
                                    className="merged-label"
                                >
                                    {label.text}
                                </text>
                            ));
                        })()}
                    </g>

                    {/* Sketch Elements (Only in Sketch Mode) */}
                    {mode === 'sketch' && sketchElements.map(el => (
                        <SketchElementRenderer key={el.id} element={el} isDark={isDark} onClick={(e) => handleSketchClick(e, el)} selected={selectedElementId === el.id} />
                    ))}

                    {/* Drawing Preview */}
                    {mode === 'sketch' && renderPreview()}

                    {/* Snap Guide Visual */}
                    {snapGuide && (
                        <g>
                            <circle cx={snapGuide.x} cy={snapGuide.y} r="4" fill="none" stroke="#f59e0b" strokeWidth="2" />
                            {snapGuide.type === 'perp' && <text x={snapGuide.x + 10} y={snapGuide.y} fill="#f59e0b" fontSize="10">⊥</text>}
                        </g>
                    )}
                </g>
            </svg >
        </div >
    );
}

// --- Helper Components ---



function SketchElementRenderer({ element, isDark, onClick, selected }: { element: SketchElement, isDark: boolean, onClick: (e: React.MouseEvent) => void, selected: boolean }) {
    const stroke = selected ? '#3b82f6' : (element.color || (isDark ? '#9ca3af' : '#4b5563'));
    const strokeWidth = selected ? 3 : 2;
    const commonProps = { stroke, strokeWidth, className: "hover:stroke-blue-500 cursor-pointer transition-colors", onClick };

    switch (element.type) {
        case 'point': return <circle cx={element.p1.x} cy={element.p1.y} r="4" fill={stroke} {...commonProps} />;
        case 'text': return <text x={element.p1.x} y={element.p1.y} fill={stroke} fontSize="14" className="select-none cursor-move" onClick={onClick}>{element.text}</text>;
        case 'segment': return <line x1={element.p1.x} y1={element.p1.y} x2={element.p2.x} y2={element.p2.y} fill="none" {...commonProps} />;
        case 'ray':
            const dx = element.p2.x - element.p1.x;
            const dy = element.p2.y - element.p1.y;
            const len = Math.hypot(dx, dy);
            const ex = element.p1.x + (dx / len) * 5000;
            const ey = element.p1.y + (dy / len) * 5000;
            return <line x1={element.p1.x} y1={element.p1.y} x2={ex} y2={ey} fill="none" {...commonProps} />;
        case 'line':
            const dx2 = element.p2.x - element.p1.x;
            const dy2 = element.p2.y - element.p1.y;
            const len2 = Math.hypot(dx2, dy2);
            const ex1 = element.p1.x - (dx2 / len2) * 5000;
            const ey1 = element.p1.y - (dy2 / len2) * 5000;
            const ex2 = element.p1.x + (dx2 / len2) * 5000;
            const ey2 = element.p1.y + (dy2 / len2) * 5000;
            return <line x1={ex1} y1={ey1} x2={ex2} y2={ey2} fill="none" {...commonProps} />;
        case 'circle':
            const r = Math.hypot(element.p2.x - element.p1.x, element.p2.y - element.p1.y);
            return <circle cx={element.p1.x} cy={element.p1.y} r={r} fill="none" {...commonProps} />;
        case 'arc':
            if (!element.p3) return null;
            const rArc = Math.hypot(element.p2.x - element.p1.x, element.p2.y - element.p1.y);
            const startAngle = Math.atan2(element.p2.y - element.p1.y, element.p2.x - element.p1.x);
            const endAngle = Math.atan2(element.p3.y - element.p1.y, element.p3.x - element.p1.x);
            const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
            const sweep = endAngle > startAngle ? 1 : 0;
            const exArc = element.p1.x + rArc * Math.cos(endAngle);
            const eyArc = element.p1.y + rArc * Math.sin(endAngle);
            return <path d={`M ${element.p2.x} ${element.p2.y} A ${rArc} ${rArc} 0 ${largeArc} ${sweep} ${exArc} ${eyArc}`} fill="none" {...commonProps} />;
        case 'polygon':
            const sides = element.extra || 5;
            const rPoly = Math.hypot(element.p2.x - element.p1.x, element.p2.y - element.p1.y);
            const angleStep = (Math.PI * 2) / sides;
            const startAng = Math.atan2(element.p2.y - element.p1.y, element.p2.x - element.p1.x);
            let points = "";
            for (let i = 0; i < sides; i++) {
                const ang = startAng + i * angleStep;
                points += `${element.p1.x + rPoly * Math.cos(ang)},${element.p1.y + rPoly * Math.sin(ang)} `;
            }
            return <polygon points={points} fill="none" {...commonProps} />;
        case 'ellipse':
            if (!element.p3) return null;
            const rx = Math.hypot(element.p2.x - element.p1.x, element.p2.y - element.p1.y);
            const ry = Math.hypot(element.p3.x - element.p1.x, element.p3.y - element.p1.y);
            const rot = Math.atan2(element.p2.y - element.p1.y, element.p2.x - element.p1.x) * (180 / Math.PI);
            return <ellipse cx={element.p1.x} cy={element.p1.y} rx={rx} ry={ry} transform={`rotate(${rot} ${element.p1.x} ${element.p1.y})`} fill="none" {...commonProps} />;
        case 'parabola':
            const a = Math.hypot(element.p2.x - element.p1.x, element.p2.y - element.p1.y);
            const angP = Math.atan2(element.p2.y - element.p1.y, element.p2.x - element.p1.x);
            let dPath = "";
            for (let t = -200; t <= 200; t += 5) {
                const x = t;
                const y = (x * x) / (4 * a);
                const xr = x * Math.cos(angP - Math.PI / 2) - y * Math.sin(angP - Math.PI / 2) + element.p1.x;
                const yr = x * Math.sin(angP - Math.PI / 2) + y * Math.cos(angP - Math.PI / 2) + element.p1.y;
                dPath += (t === -200 ? "M" : "L") + `${xr} ${yr} `;
            }
            return <path d={dPath} fill="none" {...commonProps} />;
        case 'hyperbola':
            if (!element.p3) return null;
            const aH = Math.hypot(element.p2.x - element.p1.x, element.p2.y - element.p1.y);
            const angH = Math.atan2(element.p2.y - element.p1.y, element.p2.x - element.p1.x);
            const dx3 = element.p3.x - element.p1.x;
            const dy3 = element.p3.y - element.p1.y;
            const localX3 = dx3 * Math.cos(-angH) - dy3 * Math.sin(-angH);
            const localY3 = dx3 * Math.sin(-angH) + dy3 * Math.cos(-angH);
            let bH = 10;
            if (Math.abs(localX3) > aH) {
                bH = Math.abs(localY3) / Math.sqrt((localX3 * localX3) / (aH * aH) - 1);
            }
            let hPath = "";
            for (let t = -200; t <= 200; t += 5) {
                const y = t;
                const x = aH * Math.sqrt(1 + (y * y) / (bH * bH));
                const xr = x * Math.cos(angH) - y * Math.sin(angH) + element.p1.x;
                const yr = x * Math.sin(angH) + y * Math.cos(angH) + element.p1.y;
                hPath += (t === -200 ? "M" : "L") + `${xr} ${yr} `;
            }
            for (let t = -200; t <= 200; t += 5) {
                const y = t;
                const x = -aH * Math.sqrt(1 + (y * y) / (bH * bH));
                const xr = x * Math.cos(angH) - y * Math.sin(angH) + element.p1.x;
                const yr = x * Math.sin(angH) + y * Math.cos(angH) + element.p1.y;
                hPath += (t === -200 ? "M" : "L") + `${xr} ${yr} `;
            }
            return <path d={hPath} fill="none" {...commonProps} />;
        default: return null;
    }
}

function Intersections2D({ elements, showIntersections }: { elements: GeometryElement[], showIntersections: boolean }) {
    if (!showIntersections) return null;
    const results: JSX.Element[] = [];
    let key = 0;
    for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
            const el1 = elements[i];
            const el2 = elements[j];
            if (!el1.visible || !el2.visible) continue;
            if ((el1.type === 'line' && el2.type === 'plane') || (el1.type === 'plane' && el2.type === 'line')) {
                const line = (el1.type === 'line' ? el1 : el2) as LineElement;
                const plane = (el1.type === 'plane' ? el1 : el2) as PlaneElement;
                const intersection = intersectLinePlane(line.point, line.direction, plane.normal, plane.constant);
                if (intersection) {
                    const px = intersection.x * SCALE;
                    const py_h = intersection.y * SCALE;
                    const py_v = -intersection.z * SCALE;
                    results.push(
                        <g key={`int-${key++}`}>
                            <circle cx={px} cy={py_v} r="3" fill="#fbbf24" stroke="black" strokeWidth="0.5" />
                            <circle cx={px} cy={py_h} r="3" fill="#fbbf24" stroke="black" strokeWidth="0.5" />
                            <line x1={px} y1={py_v} x2={px} y2={py_h} stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="2 2" />
                        </g>
                    );
                }
            }
            if (el1.type === 'plane' && el2.type === 'plane') {
                const p1 = el1 as PlaneElement;
                const p2 = el2 as PlaneElement;
                const intersection = intersectPlanePlane(p1.normal, p1.constant, p2.normal, p2.constant);
                if (intersection) {
                    const t1 = -100; const t2 = 100;
                    const pt1 = { x: intersection.point.x + intersection.direction.x * t1, y: intersection.point.y + intersection.direction.y * t1, z: intersection.point.z + intersection.direction.z * t1 };
                    const pt2 = { x: intersection.point.x + intersection.direction.x * t2, y: intersection.point.y + intersection.direction.y * t2, z: intersection.point.z + intersection.direction.z * t2 };
                    results.push(
                        <g key={`int-${key++}`}>
                            <line x1={pt1.x * SCALE} y1={-pt1.z * SCALE} x2={pt2.x * SCALE} y2={-pt2.z * SCALE} stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />
                            <line x1={pt1.x * SCALE} y1={pt1.y * SCALE} x2={pt2.x * SCALE} y2={pt2.y * SCALE} stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />
                        </g>
                    );
                }
            }
            if (el1.type === 'line' && el2.type === 'line') {
                const l1 = el1 as LineElement;
                const l2 = el2 as LineElement;
                const intersection = intersectLineLine(l1.point, l1.direction, l2.point, l2.direction);
                if (intersection) {
                    const px = intersection.x * SCALE;
                    const py_h = intersection.y * SCALE;
                    const py_v = -intersection.z * SCALE;
                    results.push(
                        <g key={`int-${key++}`}>
                            <circle cx={px} cy={py_v} r="3" fill="#ef4444" stroke="black" strokeWidth="0.5" />
                            <circle cx={px} cy={py_h} r="3" fill="#ef4444" stroke="black" strokeWidth="0.5" />
                            <line x1={px} y1={py_v} x2={px} y2={py_h} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
                        </g>
                    );
                }
            }
        }
    }
    return <>{results}</>;
}
