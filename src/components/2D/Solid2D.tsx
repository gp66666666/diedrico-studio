import { useMemo } from 'react';
import type { SolidElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';

interface Solid2DProps {
    element: SolidElement;
    isDark: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

const SCALE = 40;

// Helper to project 3D point to 2D View Coords
// Horizontal: (x, y)
// Vertical: (x, z) -> drawn at y = -z
const project = (p: { x: number, y: number, z: number }) => {
    return {
        h: { x: p.x * SCALE, y: p.y * SCALE },
        v: { x: p.x * SCALE, y: -p.z * SCALE }
    };
};

// Helper: Rotate point around local center and then translate
const transform = (p: { x: number, y: number, z: number }, pos: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number }) => {
    let { x, y, z } = p;

    // Apply rotation if present
    if (rotation) {
        // Rotate X
        if (rotation.x) {
            const cosX = Math.cos(rotation.x);
            const sinX = Math.sin(rotation.x);
            const y1 = y * cosX - z * sinX;
            const z1 = y * sinX + z * cosX;
            y = y1; z = z1;
        }
        // Rotate Y (vertical axis in store/diedrico)
        if (rotation.y) {
            const cosY = Math.cos(rotation.y);
            const sinY = Math.sin(rotation.y);
            const x1 = x * cosY - z * sinY;
            const z1 = x * sinY + z * cosY;
            x = x1; z = z1;
        }
        // Rotate Z (depth/alejamiento in store? verify)
        // Actually Y logic above is for horizontal rotation.
        // Let's assume standard Euler X, Y, Z for solid rotation.
        if (rotation.z) {
            const cosZ = Math.cos(rotation.z);
            const sinZ = Math.sin(rotation.z);
            const x1 = x * cosZ - y * sinZ;
            const y1 = x * sinZ + y * cosZ;
            x = x1; y = y1;
        }
    }

    return {
        x: pos.x + x,
        y: pos.y + y,
        z: pos.z + z
    };
};

export default function Solid2D({ element, isDark, onClick }: Solid2DProps) {
    const { selectedElementId } = useGeometryStore();
    const { id, subtype, position, size, color } = element;
    const isSelected = selectedElementId === id;
    const strokeColor = isSelected ? '#3b82f6' : (color || (isDark ? '#e2e8f0' : '#1e293b'));
    const strokeWidth = isSelected ? 3 : 1.5;

    // Generate edges based on solid type
    // An edge is [p1, p2] in local coords
    const edges = useMemo(() => {
        const localEdges: { p1: { x: number, y: number, z: number }, p2: { x: number, y: number, z: number } }[] = [];
        const r = size.x;
        const h = size.y;

        if (subtype === 'cube') {
            const s = r * 1.5 / 2; // Half side
            // Vertices
            const v = [
                { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s }, { x: s, y: s, z: -s }, { x: -s, y: s, z: -s }, // Bottom
                { x: -s, y: -s, z: s }, { x: s, y: -s, z: s }, { x: s, y: s, z: s }, { x: -s, y: s, z: s }   // Top
            ];
            // Edges
            // Bottom face
            localEdges.push({ p1: v[0], p2: v[1] }, { p1: v[1], p2: v[2] }, { p1: v[2], p2: v[3] }, { p1: v[3], p2: v[0] });
            // Top face
            localEdges.push({ p1: v[4], p2: v[5] }, { p1: v[5], p2: v[6] }, { p1: v[6], p2: v[7] }, { p1: v[7], p2: v[4] });
            // Vertical pillars
            localEdges.push({ p1: v[0], p2: v[4] }, { p1: v[1], p2: v[5] }, { p1: v[2], p2: v[6] }, { p1: v[3], p2: v[7] });
        }
        else if (subtype === 'tetrahedron') {
            // Simplified Tetrahedron vertices
            const v = [
                { x: r * 0.94, y: 0, z: -r * 0.33 },
                { x: -r * 0.47, y: r * 0.81, z: -r * 0.33 },
                { x: -r * 0.47, y: -r * 0.81, z: -r * 0.33 },
                { x: 0, y: 0, z: r } // Top
            ];
            // Connect all
            localEdges.push(
                { p1: v[0], p2: v[1] }, { p1: v[1], p2: v[2] }, { p1: v[2], p2: v[0] }, // Base
                { p1: v[0], p2: v[3] }, { p1: v[1], p2: v[3] }, { p1: v[2], p2: v[3] }  // Sides
            );
        }
        else if (subtype === 'pyramid') {
            // Square Base Pyramid
            const s = r;
            const hh = h / 2;
            const v = [
                { x: -s, y: -s, z: -hh }, { x: s, y: -s, z: -hh }, { x: s, y: s, z: -hh }, { x: -s, y: s, z: -hh }, // Base
                { x: 0, y: 0, z: hh } // Top
            ];
            localEdges.push(
                { p1: v[0], p2: v[1] }, { p1: v[1], p2: v[2] }, { p1: v[2], p2: v[3] }, { p1: v[3], p2: v[0] }, // Base
                { p1: v[0], p2: v[4] }, { p1: v[1], p2: v[4] }, { p1: v[2], p2: v[4] }, { p1: v[3], p2: v[4] }  // Sides
            );
        }
        else if (subtype === 'cylinder') {
            const hh = h / 2;
            const segments = 12; // More segments for "round" look
            for (let i = 0; i < segments; i++) {
                const ang1 = (i * 2 * Math.PI) / segments;
                const ang2 = ((i + 1) * 2 * Math.PI) / segments;
                const p1b = { x: r * Math.cos(ang1), y: r * Math.sin(ang1), z: -hh };
                const p2b = { x: r * Math.cos(ang2), y: r * Math.sin(ang2), z: -hh };
                const p1t = { x: r * Math.cos(ang1), y: r * Math.sin(ang1), z: hh };
                const p2t = { x: r * Math.cos(ang2), y: r * Math.sin(ang2), z: hh };

                localEdges.push({ p1: p1b, p2: p2b }); // Bottom rim
                localEdges.push({ p1: p1t, p2: p2t }); // Top rim
                if (i % 3 === 0) localEdges.push({ p1: p1b, p2: p1t }); // Vertical lines every 90 deg approx
            }
        }
        else if (subtype === 'cone') {
            const hh = h / 2;
            const segments = 12;
            const apex = { x: 0, y: 0, z: hh };
            for (let i = 0; i < segments; i++) {
                const ang1 = (i * 2 * Math.PI) / segments;
                const ang2 = ((i + 1) * 2 * Math.PI) / segments;
                const p1b = { x: r * Math.cos(ang1), y: r * Math.sin(ang1), z: -hh };
                const p2b = { x: r * Math.cos(ang2), y: r * Math.sin(ang2), z: -hh };

                localEdges.push({ p1: p1b, p2: p2b }); // Base rim
                if (i % 3 === 0) localEdges.push({ p1: p1b, p2: apex }); // Side lines
            }
        }
        else if (subtype === 'sphere') {
            // Sphere as 3 orthogonal circles
            const segments = 16;
            for (let i = 0; i < segments; i++) {
                const ang1 = (i * 2 * Math.PI) / segments;
                const ang2 = ((i + 1) * 2 * Math.PI) / segments;

                // XY Circle
                localEdges.push({
                    p1: { x: r * Math.cos(ang1), y: r * Math.sin(ang1), z: 0 },
                    p2: { x: r * Math.cos(ang2), y: r * Math.sin(ang2), z: 0 }
                });
                // XZ Circle
                localEdges.push({
                    p1: { x: r * Math.cos(ang1), y: 0, z: r * Math.sin(ang1) },
                    p2: { x: r * Math.cos(ang2), y: 0, z: r * Math.sin(ang2) }
                });
                // YZ Circle
                localEdges.push({
                    p1: { x: 0, y: r * Math.cos(ang1), z: r * Math.sin(ang1) },
                    p2: { x: 0, y: r * Math.cos(ang2), z: r * Math.sin(ang2) }
                });
            }
        }
        else if (subtype === 'prism') {
            // Hexagonal Prism
            const hh = h / 2;
            for (let i = 0; i < 6; i++) {
                const ang1 = i * Math.PI / 3;
                const ang2 = ((i + 1) % 6) * Math.PI / 3;
                const p1b = { x: r * Math.cos(ang1), y: r * Math.sin(ang1), z: -hh };
                const p2b = { x: r * Math.cos(ang2), y: r * Math.sin(ang2), z: -hh };
                const p1t = { x: r * Math.cos(ang1), y: r * Math.sin(ang1), z: hh };
                const p2t = { x: r * Math.cos(ang2), y: r * Math.sin(ang2), z: hh };

                localEdges.push({ p1: p1b, p2: p2b }); // Bottom rim
                localEdges.push({ p1: p1t, p2: p2t }); // Top rim
                localEdges.push({ p1: p1b, p2: p1t }); // Pillar
            }
        }

        return localEdges;
    }, [subtype, size]);

    // Render Logic
    const renderedEdges = edges.map((e, i) => {
        // Transform local to world with rotation
        const p1 = transform(e.p1, position, element.rotation);
        const p2 = transform(e.p2, position, element.rotation);

        // Project to View
        const proj1 = project(p1);
        const proj2 = project(p2);

        return (
            <g key={i}>
                {/* Horizontal */}
                <line x1={proj1.h.x} y1={proj1.h.y} x2={proj2.h.x} y2={proj2.h.y} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
                {/* Vertical */}
                <line x1={proj1.v.x} y1={proj1.v.y} x2={proj2.v.x} y2={proj2.v.y} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            </g>
        );
    });

    // special labels and connection lines...
    const pc = project(position);

    return (
        <g onClick={onClick} className="cursor-pointer hover:opacity-80">
            {renderedEdges}
            <text x={pc.h.x + 15} y={pc.h.y} fontSize="10" fill={strokeColor} className="select-none font-bold">{element.name}'</text>
            <text x={pc.v.x + 15} y={pc.v.y} fontSize="10" fill={strokeColor} className="select-none font-bold">{element.name}''</text>
            <line x1={pc.h.x} y1={pc.h.y} x2={pc.v.x} y2={pc.v.y} stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
        </g>
    );
}
