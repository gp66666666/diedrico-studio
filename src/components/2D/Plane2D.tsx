import type { PlaneElement } from '../../types';

const SCALE = 40;
const DRAW_RANGE = 15; // Draw lines long enough but keep labels visible

export default function Plane2D({ element, onClick, isDark = false }: { element: PlaneElement, onClick?: (e: React.MouseEvent) => void, isDark?: boolean }) {
    const { normal, constant, color, name } = element;
    const { x: A, y: B, z: C } = normal;
    const D = constant;

    // Helper to draw a split line based on visibility condition
    // condition(val) returns true if visible (continuous), false if hidden (dashed)
    // val is Z for vertical trace, Y for horizontal trace
    const renderSplitLine = (
        getVal: (x: number) => number,
        isVerticalTrace: boolean
    ) => {
        // Find intersection with LT (where val = 0)
        // val = (-D - A*x) / Coeff
        // 0 = -D - A*x => Ax = -D => x = -D/A

        let xCross = 0;
        let hasCrossing = false;

        if (Math.abs(A) > 1e-6) {
            xCross = -D / A;
            hasCrossing = true;
        }

        // Define range
        const xLeft = -DRAW_RANGE;
        const xRight = DRAW_RANGE;

        // Calculate values at ends
        const valLeft = getVal(xLeft);
        const valRight = getVal(xRight);

        // Determine visibility
        // Vertical Trace: Visible if Z > 0
        // Horizontal Trace: Visible if Y > 0
        const isVisible = (v: number) => v > 0;

        const lines = [];

        if (!hasCrossing) {
            // Parallel to LT
            // Entire line has same visibility
            const visible = isVisible(getVal(0));
            lines.push(
                <line
                    key="full"
                    x1={xLeft * SCALE} y1={isVerticalTrace ? -valLeft * SCALE : valLeft * SCALE}
                    x2={xRight * SCALE} y2={isVerticalTrace ? -valRight * SCALE : valRight * SCALE}
                    stroke={color}
                    strokeWidth={visible ? "2" : "1"}
                    strokeDasharray={visible ? "0" : "5 5"}
                />
            );
        } else {
            // Split at xCross
            // Segment 1: Left to Cross
            const visLeft = isVisible(valLeft);
            lines.push(
                <line
                    key="left"
                    x1={xLeft * SCALE} y1={isVerticalTrace ? -valLeft * SCALE : valLeft * SCALE}
                    x2={xCross * SCALE} y2={0}
                    stroke={color}
                    strokeWidth={visLeft ? "2" : "1"}
                    strokeDasharray={visLeft ? "0" : "5 5"}
                />
            );

            // Segment 2: Cross to Right
            const visRight = isVisible(valRight);
            lines.push(
                <line
                    key="right"
                    x1={xCross * SCALE} y1={0}
                    x2={xRight * SCALE} y2={isVerticalTrace ? -valRight * SCALE : valRight * SCALE}
                    stroke={color}
                    strokeWidth={visRight ? "2" : "1"}
                    strokeDasharray={visRight ? "0" : "5 5"}
                />
            );
        }

        return (
            <g>
                {lines}
            </g>
        );
    };

    // Vertical Trace (alpha'') -> Z
    // Ax + Cz + D = 0 => z = (-D - Ax) / C
    const getZ = (x: number) => {
        if (Math.abs(C) < 1e-6) return 0; // Vertical plane (wall), undefined Z function, handled separately?
        return (-D - A * x) / C;
    };

    // Horizontal Trace (alpha') -> Y
    // Ax + By + D = 0 => y = (-D - Ax) / B
    const getY = (x: number) => {
        if (Math.abs(B) < 1e-6) return 0;
        return (-D - A * x) / B;
    };

    return (
        <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            {/* Vertical Trace (alpha'') */}
            {Math.abs(C) > 1e-6 ? (
                renderSplitLine(getZ, true)
            ) : (
                // C=0: Vertical Plane (Wall). Vertical trace is a vertical line at x = -D/A?
                // Intersection with Y=0 plane (Vertical Projection Plane).
                // Ax + By + D = 0. If Y=0 => Ax + D = 0 => x = -D/A.
                // It's a vertical line perpendicular to LT.
                // Visible part? Usually visible above LT.
                Math.abs(A) > 1e-6 && (
                    <g>
                        <line
                            x1={(-D / A) * SCALE} y1={0}
                            x2={(-D / A) * SCALE} y2={-DRAW_RANGE * SCALE}
                            stroke={color} strokeWidth="2"
                        />
                        <line
                            x1={(-D / A) * SCALE} y1={0}
                            x2={(-D / A) * SCALE} y2={DRAW_RANGE * SCALE}
                            stroke={color} strokeWidth="1" strokeDasharray="5 5"
                        />
                    </g>
                )
            )}

            {/* Horizontal Trace (alpha') */}
            {Math.abs(B) > 1e-6 ? (
                renderSplitLine(getY, false)
            ) : (
                // B=0: Plane perpendicular to Vertical Plane (Proyectante Vertical / De Canto)
                // Horizontal trace is intersection with Z=0.
                // Ax + Cz + D = 0. If Z=0 => Ax + D = 0 => x = -D/A.
                // Vertical line in the drawing (perpendicular to LT).
                // Visible part? Usually visible below LT (Y>0).
                Math.abs(A) > 1e-6 && (
                    <g>
                        <line
                            x1={(-D / A) * SCALE} y1={0}
                            x2={(-D / A) * SCALE} y2={DRAW_RANGE * SCALE}
                            stroke={color} strokeWidth="2"
                        />
                        <line
                            x1={(-D / A) * SCALE} y1={0}
                            x2={(-D / A) * SCALE} y2={-DRAW_RANGE * SCALE}
                            stroke={color} strokeWidth="1" strokeDasharray="5 5"
                        />
                    </g>
                )
            )}
        </g>
    );
}
