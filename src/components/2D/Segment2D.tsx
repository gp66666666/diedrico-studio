import type { SegmentElement } from '../../types';

const SCALE = 40;

export default function Segment2D({ element, onClick, isDark = false }: { element: SegmentElement, onClick?: (e: React.MouseEvent) => void, isDark?: boolean }) {
    const { p1, p2, color } = element;

    const renderSegment = (proj: 'h' | 'v') => {
        const x1 = p1.x * SCALE;
        const x2 = p2.x * SCALE;
        let y1, y2;

        if (proj === 'v') {
            y1 = -p1.z * SCALE;
            y2 = -p2.z * SCALE;
        } else {
            y1 = p1.y * SCALE;
            y2 = p2.y * SCALE;
        }

        // Determine visibility (simplified for segments: dashed if any point is in negative region)
        // In a more complex model, we'd split at traces.
        // For now, let's just draw the segment.
        const isVisible = proj === 'v' ? (p1.z > -1e-4 && p2.z > -1e-4) : (p1.y > -1e-4 && p2.y > -1e-4);

        return (
            <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color}
                strokeWidth="2.5"
                strokeDasharray={isVisible ? undefined : "5 5"}
            />
        );
    };

    const textFill = isDark ? '#ffffff' : '#000000';

    if (element.role === 'abated') {
        const x1 = p1.x * SCALE;
        const x2 = p2.x * SCALE;
        const y1 = p1.y * SCALE;
        const y2 = p2.y * SCALE;
        return (
            <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
                <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={color}
                    strokeWidth="3"
                />
                <text
                    x={(x1 + x2) / 2 + 5}
                    y={(y1 + y2) / 2 - 5}
                    fontSize="12"
                    fontWeight="bold"
                    fill={color}
                    className="select-none"
                    style={{ fontStyle: 'italic' }}
                >
                    {element.name}
                </text>
            </g>
        );
    }

    return (
        <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            {/* Projections */}
            {renderSegment('v')}
            {renderSegment('h')}

            {/* Endpoints Labels - Point 1 */}
            <g>
                <circle cx={p1.x * SCALE} cy={-p1.z * SCALE} r="2.5" fill={color} />
                <text x={p1.x * SCALE + 5} y={-p1.z * SCALE - 5} fontSize="10" fill={textFill} className="select-none font-bold">1''</text>

                <circle cx={p1.x * SCALE} cy={p1.y * SCALE} r="2.5" fill={color} />
                <text x={p1.x * SCALE + 5} y={p1.y * SCALE + 12} fontSize="10" fill={textFill} className="select-none font-bold">1'</text>

                <line x1={p1.x * SCALE} y1={-p1.z * SCALE} x2={p1.x * SCALE} y2={p1.y * SCALE} stroke={color} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
            </g>

            {/* Endpoints Labels - Point 2 */}
            <g>
                <circle cx={p2.x * SCALE} cy={-p2.z * SCALE} r="2.5" fill={color} />
                <text x={p2.x * SCALE + 5} y={-p2.z * SCALE - 5} fontSize="10" fill={textFill} className="select-none font-bold">2''</text>

                <circle cx={p2.x * SCALE} cy={p2.y * SCALE} r="2.5" fill={color} />
                <text x={p2.x * SCALE + 5} y={p2.y * SCALE + 12} fontSize="10" fill={textFill} className="select-none font-bold">2'</text>

                <line x1={p2.x * SCALE} y1={-p2.z * SCALE} x2={p2.x * SCALE} y2={p2.y * SCALE} stroke={color} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
            </g>
        </g>
    );
}
