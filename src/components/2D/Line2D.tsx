import type { LineElement } from '../../types';
import { calculateLineTraces } from '../../utils/mathUtils';

const SCALE = 40;

export default function Line2D({ element, onClick, isDark = false }: { element: LineElement, onClick?: (e: React.MouseEvent) => void, isDark?: boolean }) {
    // Calculate two points on the line to draw it
    const t1 = -15;
    const t2 = 15;

    const p1 = {
        x: element.point.x + element.direction.x * t1,
        y: element.point.y + element.direction.y * t1,
        z: element.point.z + element.direction.z * t1
    };

    const p2 = {
        x: element.point.x + element.direction.x * t2,
        y: element.point.y + element.direction.y * t2,
        z: element.point.z + element.direction.z * t2
    };

    // Calculate traces
    const traces = calculateLineTraces(element.point, element.direction);

    // Calculate split points (traces) to determine visibility
    const splitPointsH = [t1, t2]; // For horizontal projection
    const splitPointsV = [t1, t2]; // For vertical projection

    // Horizontal Trace (z=0) affects both projections
    if (Math.abs(element.direction.z) > 1e-6) {
        const t = -element.point.z / element.direction.z;
        if (t > t1 && t < t2) {
            splitPointsH.push(t);
            splitPointsV.push(t);
        }
    }

    // Vertical Trace (y=0) affects both projections
    if (Math.abs(element.direction.y) > 1e-6) {
        const t = -element.point.y / element.direction.y;
        if (t > t1 && t < t2) {
            splitPointsH.push(t);
            splitPointsV.push(t);
        }
    }

    // Deduplicate and sort split points
    const uniqueSplitPointsH = [...new Set(splitPointsH)].sort((a, b) => a - b);
    const uniqueSplitPointsV = [...new Set(splitPointsV)].sort((a, b) => a - b);

    // Build segments for Horizontal Projection (r')
    const segmentsH = [];
    for (let i = 0; i < uniqueSplitPointsH.length - 1; i++) {
        const ta = uniqueSplitPointsH[i];
        const tb = uniqueSplitPointsH[i + 1];
        const tmid = (ta + tb) / 2;
        const midY = element.point.y + element.direction.y * tmid;
        // Horizontal projection: visible if y > 0 (in front of VP)
        const isVisible = midY > -1e-4;
        segmentsH.push({ ta, tb, isVisible });
    }

    // Build segments for Vertical Projection (r'')
    const segmentsV = [];
    for (let i = 0; i < uniqueSplitPointsV.length - 1; i++) {
        const ta = uniqueSplitPointsV[i];
        const tb = uniqueSplitPointsV[i + 1];
        const tmid = (ta + tb) / 2;
        const midZ = element.point.z + element.direction.z * tmid;
        // Vertical projection: visible if z > 0 (above HP)
        const isVisible = midZ > -1e-4;
        segmentsV.push({ ta, tb, isVisible });
    }

    const renderLineSegment = (ta: number, tb: number, isVisible: boolean, projection: 'h' | 'v', index: number) => {
        const pA = {
            x: element.point.x + element.direction.x * ta,
            y: element.point.y + element.direction.y * ta,
            z: element.point.z + element.direction.z * ta
        };
        const pB = {
            x: element.point.x + element.direction.x * tb,
            y: element.point.y + element.direction.y * tb,
            z: element.point.z + element.direction.z * tb
        };

        const x1 = pA.x * SCALE;
        const x2 = pB.x * SCALE;
        let y1, y2;

        if (projection === 'v') { // r'' (x, -z)
            y1 = -pA.z * SCALE;
            y2 = -pB.z * SCALE;
        } else { // r' (x, y)
            y1 = pA.y * SCALE;
            y2 = pB.y * SCALE;
        }

        return (
            <line
                key={`${projection}-${index}-${ta.toFixed(4)}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={element.color}
                strokeWidth="2"
                strokeDasharray={isVisible ? undefined : "5 5"}
            />
        );
    };

    // Use theme-aware fill color for text labels
    const textFill = isDark ? '#ffffff' : '#000000';

    return (
        <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            {/* Vertical Projection (r'') */}
            {Math.hypot(p1.x - p2.x, p1.z - p2.z) < 1e-4 ? (
                <g>
                    {/* Connection to LT */}
                    <line
                        x1={p1.x * SCALE} y1={-p1.z * SCALE}
                        x2={p1.x * SCALE} y2={0}
                        stroke={element.color}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                    <circle cx={p1.x * SCALE} cy={-p1.z * SCALE} r="4" fill={element.color} />
                </g>
            ) : (
                <g>
                    {segmentsV.map((seg, i) => renderLineSegment(seg.ta, seg.tb, seg.isVisible, 'v', i))}
                </g>
            )}

            {/* Horizontal Projection (r') */}
            {Math.hypot(p1.x - p2.x, p1.y - p2.y) < 1e-4 ? (
                <g>
                    {/* Connection to LT */}
                    <line
                        x1={p1.x * SCALE} y1={p1.y * SCALE}
                        x2={p1.x * SCALE} y2={0}
                        stroke={element.color}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                    <circle cx={p1.x * SCALE} cy={p1.y * SCALE} r="4" fill={element.color} />
                </g>
            ) : (
                <g>
                    {segmentsH.map((seg, i) => renderLineSegment(seg.ta, seg.tb, seg.isVisible, 'h', i))}
                </g>
            )}

            {/* Traces */}
            {traces.hTrace && (
                <g>
                    {/* h' (Horizontal Projection of Trace) - X marker */}
                    <g>
                        <line x1={traces.hTrace.x * SCALE - 4} y1={traces.hTrace.y * SCALE - 4} x2={traces.hTrace.x * SCALE + 4} y2={traces.hTrace.y * SCALE + 4} stroke={element.color} strokeWidth="2" />
                        <line x1={traces.hTrace.x * SCALE - 4} y1={traces.hTrace.y * SCALE + 4} x2={traces.hTrace.x * SCALE + 4} y2={traces.hTrace.y * SCALE - 4} stroke={element.color} strokeWidth="2" />
                    </g>

                    {/* h'' (Vertical Projection of Trace on LT) */}
                    <line
                        x1={traces.hTrace.x * SCALE} y1={traces.hTrace.y * SCALE}
                        x2={traces.hTrace.x * SCALE} y2={0}
                        stroke={element.color} strokeWidth="1" strokeDasharray="2 2"
                    />
                    {/* h'' marker on LT - X */}
                    <g>
                        <line x1={traces.hTrace.x * SCALE - 3} y1={-3} x2={traces.hTrace.x * SCALE + 3} y2={3} stroke={element.color} strokeWidth="2" />
                        <line x1={traces.hTrace.x * SCALE - 3} y1={3} x2={traces.hTrace.x * SCALE + 3} y2={-3} stroke={element.color} strokeWidth="2" />
                    </g>
                </g>
            )}
            {traces.vTrace && (
                <g>
                    {/* v'' (Vertical Projection of Trace) - X marker */}
                    <g>
                        <line x1={traces.vTrace.x * SCALE - 4} y1={-traces.vTrace.z * SCALE - 4} x2={traces.vTrace.x * SCALE + 4} y2={-traces.vTrace.z * SCALE + 4} stroke={element.color} strokeWidth="2" />
                        <line x1={traces.vTrace.x * SCALE - 4} y1={-traces.vTrace.z * SCALE + 4} x2={traces.vTrace.x * SCALE + 4} y2={-traces.vTrace.z * SCALE - 4} stroke={element.color} strokeWidth="2" />
                    </g>

                    {/* v' (Horizontal Projection of Trace on LT) */}
                    <line
                        x1={traces.vTrace.x * SCALE} y1={-traces.vTrace.z * SCALE}
                        x2={traces.vTrace.x * SCALE} y2={0}
                        stroke={element.color} strokeWidth="1" strokeDasharray="2 2"
                    />
                    {/* v' marker on LT - X */}
                    <g>
                        <line x1={traces.vTrace.x * SCALE - 3} y1={-3} x2={traces.vTrace.x * SCALE + 3} y2={3} stroke={element.color} strokeWidth="2" />
                        <line x1={traces.vTrace.x * SCALE - 3} y1={3} x2={traces.vTrace.x * SCALE + 3} y2={-3} stroke={element.color} strokeWidth="2" />
                    </g>
                </g>
            )}

            {/* Defining Points (if created by 2 points) */}
            {element.p2 && (
                <g>
                    {/* Point 1 */}
                    <circle cx={element.point.x * SCALE} cy={-element.point.z * SCALE} r="2.5" fill={element.color} />
                    <text
                        x={element.point.x * SCALE}
                        y={-element.point.z * SCALE}
                        fontSize="4"
                        fill={textFill}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontWeight: 'bold', pointerEvents: 'none' }}
                    >
                        a''
                    </text>

                    <circle cx={element.point.x * SCALE} cy={element.point.y * SCALE} r="2.5" fill={element.color} />
                    <text
                        x={element.point.x * SCALE}
                        y={element.point.y * SCALE}
                        fontSize="4"
                        fill={textFill}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontWeight: 'bold', pointerEvents: 'none' }}
                    >
                        a'
                    </text>
                    <line
                        x1={element.point.x * SCALE} y1={-element.point.z * SCALE}
                        x2={element.point.x * SCALE} y2={element.point.y * SCALE}
                        stroke={element.color} strokeWidth="0.5" strokeDasharray="2 2" opacity={0.5}
                    />

                    {/* Point 2 */}
                    <circle cx={element.p2.x * SCALE} cy={-element.p2.z * SCALE} r="2.5" fill={element.color} />
                    <text
                        x={element.p2.x * SCALE}
                        y={-element.p2.z * SCALE}
                        fontSize="4"
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontWeight: 'bold', pointerEvents: 'none' }}
                    >
                        b''
                    </text>

                    <circle cx={element.p2.x * SCALE} cy={element.p2.y * SCALE} r="2.5" fill={element.color} />
                    <text
                        x={element.p2.x * SCALE}
                        y={element.p2.y * SCALE}
                        fontSize="4"
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontWeight: 'bold', pointerEvents: 'none' }}
                    >
                        b'
                    </text>
                    <line
                        x1={element.p2.x * SCALE} y1={-element.p2.z * SCALE}
                        x2={element.p2.x * SCALE} y2={element.p2.y * SCALE}
                        stroke={element.color} strokeWidth="0.5" strokeDasharray="2 2" opacity={0.5}
                    />
                </g>
            )}
        </g>
    );
}
