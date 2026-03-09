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
const project = (p: { x: number, y: number, z: number }) => {
    return {
        h: { x: p.x * SCALE, y: p.y * SCALE },
        v: { x: p.x * SCALE, y: -p.z * SCALE }
    };
};

// Helper: Rotate point around local center and then translate
// This MUST match the rotation logic in SolidObject.tsx (Three.js)
// SolidObject.tsx uses: rotation={[element.rotation.x, element.rotation.z, element.rotation.y]}
// Three.js default order is XYZ.
// So in Store terms, it's: 1. Rotate around X, 2. Rotate around Z, 3. Rotate around Y.
const transform = (p: { x: number, y: number, z: number }, pos: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number }) => {
    let { x, y, z } = p;
    if (rotation) {
        // 1. Rotate X (Store X)
        if (rotation.x) {
            const cos = Math.cos(rotation.x);
            const sin = Math.sin(rotation.x);
            const y1 = y * cos - z * sin;
            const z1 = y * sin + z * cos;
            y = y1; z = z1;
        }
        // 2. Rotate Z (Store Z - mapped to Three Y / Vertical)
        if (rotation.z) {
            const cos = Math.cos(rotation.z);
            const sin = Math.sin(rotation.z);
            const x1 = x * cos + y * sin;
            const y1 = -x * sin + y * cos;
            x = x1; y = y1;
        }
        // 3. Rotate Y (Store Y - mapped to Three Z / Depth)
        if (rotation.y) {
            const cos = Math.cos(rotation.y);
            const sin = Math.sin(rotation.y);
            const x1 = x * cos - z * sin;
            const z1 = x * sin + z * cos;
            x = x1; z = z1;
        }
    }
    return { x: pos.x + x, y: pos.y + y, z: pos.z + z };
};

// Helper: Get face normal from 3 vertices (outward)
const getNormal = (v1: { x: number, y: number, z: number }, v2: { x: number, y: number, z: number }, v3: { x: number, y: number, z: number }) => {
    const e1 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
    const e2 = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };
    return {
        x: e1.y * e2.z - e1.z * e2.y,
        y: e1.z * e2.x - e1.x * e2.z,
        z: e1.x * e2.y - e1.y * e2.x
    };
};

export default function Solid2D({ element, isDark, onClick }: Solid2DProps) {
    const { selectedElementId } = useGeometryStore();
    const { id, subtype, position, size, color, rotation } = element;
    const isSelected = selectedElementId === id;
    const strokeColor = isSelected ? '#3b82f6' : (color || (isDark ? '#e2e8f0' : '#1e293b'));
    const strokeWidth = isSelected ? 3 : 1.5;

    // Generate geometry based on solid type
    const geometry = useMemo(() => {
        let vertices: { x: number, y: number, z: number }[] = [];
        let faces: number[][] = [];
        const r = size.x;
        const h = size.y;

        if (subtype === 'cube') {
            const s = r * 1.5 / 2;
            vertices = [
                { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s }, { x: s, y: s, z: -s }, { x: -s, y: s, z: -s },
                { x: -s, y: -s, z: s }, { x: s, y: -s, z: s }, { x: s, y: s, z: s }, { x: -s, y: s, z: s }
            ];
            faces = [
                [3, 2, 1, 0], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]
            ];
        }
        else if (subtype === 'tetrahedron') {
            const hh = h / 2;
            // Radius R at base (triangular)
            vertices = [
                { x: r, y: 0, z: -hh },
                { x: -r * 0.5, y: r * 0.866, z: -hh },
                { x: -r * 0.5, y: -r * 0.866, z: -hh },
                { x: 0, y: 0, z: hh } // Tip at Height
            ];
            faces = [[0, 2, 1], [0, 1, 3], [1, 2, 3], [2, 0, 3]];
        }
        else if (subtype === 'octahedron') {
            const hh = h / 2;
            vertices = [
                { x: r, y: 0, z: 0 }, { x: -r, y: 0, z: 0 }, { x: 0, y: r, z: 0 },
                { x: 0, y: -r, z: 0 }, { x: 0, y: 0, z: hh }, { x: 0, y: 0, z: -hh }
            ];
            faces = [
                [4, 0, 2], [4, 2, 1], [4, 1, 3], [4, 3, 0],
                [5, 2, 0], [5, 1, 2], [5, 3, 1], [5, 0, 3]
            ];
        }
        else if (subtype === 'pyramid') {
            const s = r;
            const hh = h / 2;
            vertices = [
                { x: -s, y: -s, z: -hh }, { x: s, y: -s, z: -hh }, { x: s, y: s, z: -hh }, { x: -s, y: s, z: -hh },
                { x: 0, y: 0, z: hh }
            ];
            faces = [[3, 2, 1, 0], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]];
        }
        else if (subtype === 'prism') {
            const hh = h / 2;
            for (let i = 0; i < 6; i++) {
                const ang = i * Math.PI / 3;
                vertices.push({ x: r * Math.cos(ang), y: r * Math.sin(ang), z: -hh });
            }
            for (let i = 0; i < 6; i++) {
                const ang = i * Math.PI / 3;
                vertices.push({ x: r * Math.cos(ang), y: r * Math.sin(ang), z: hh });
            }
            faces.push([5, 4, 3, 2, 1, 0]);
            faces.push([6, 7, 8, 9, 10, 11]);
            for (let i = 0; i < 6; i++) {
                faces.push([i, (i + 1) % 6, ((i + 1) % 6) + 6, i + 6]);
            }
        }

        const edges: { v1: { x: number, y: number, z: number }, v2: { x: number, y: number, z: number }, facesIdx: number[] }[] = [];

        if (faces.length > 0) {
            const edgeMap = new Map<string, number[]>();
            faces.forEach((f, fIdx) => {
                for (let i = 0; i < f.length; i++) {
                    const i1 = f[i];
                    const i2 = f[(i + 1) % f.length];
                    const key = [i1, i2].sort((a, b) => a - b).join('-');
                    if (!edgeMap.has(key)) edgeMap.set(key, []);
                    edgeMap.get(key)!.push(fIdx);
                }
            });
            edgeMap.forEach((adjFaces, key) => {
                const [i1, i2] = key.split('-').map(Number);
                edges.push({ v1: vertices[i1], v2: vertices[i2], facesIdx: adjFaces });
            });
        } else {
            // Fallback for curved solids
            if (subtype === 'cylinder') {
                const hh = h / 2;
                const segments = 12;
                for (let i = 0; i < segments; i++) {
                    const ang1 = (i * 2 * Math.PI) / segments;
                    const ang2 = ((i + 1) * 2 * Math.PI) / segments;
                    const p1b = { x: r * Math.cos(ang1), y: r * Math.sin(ang1), z: -hh };
                    const p2b = { x: r * Math.cos(ang2), y: r * Math.sin(ang2), z: -hh };
                    const p1t = { x: r * Math.cos(ang1), y: r * Math.sin(ang1), z: hh };
                    const p2t = { x: r * Math.cos(ang2), y: r * Math.sin(ang2), z: hh };
                    edges.push({ v1: p1b, v2: p2b, facesIdx: [] });
                    edges.push({ v1: p1t, v2: p2t, facesIdx: [] });
                    if (i % 3 === 0) edges.push({ v1: p1b, v2: p1t, facesIdx: [] });
                }
            } else if (subtype === 'cone') {
                const hh = h / 2;
                const segments = 12;
                const apex = { x: 0, y: 0, z: hh };
                for (let i = 0; i < segments; i++) {
                    const ang1 = (i * 2 * Math.PI) / segments;
                    const ang2 = ((i + 1) * 2 * Math.PI) / segments;
                    const p1b = { x: r * Math.cos(ang1), y: r * Math.sin(ang1), z: -hh };
                    const p2b = { x: r * Math.cos(ang2), y: r * Math.sin(ang2), z: -hh };
                    edges.push({ v1: p1b, v2: p2b, facesIdx: [] });
                    if (i % 3 === 0) edges.push({ v1: p1b, v2: apex, facesIdx: [] });
                }
            } else if (subtype === 'sphere') {
                const segments = 16;
                for (let i = 0; i < segments; i++) {
                    const ang1 = (i * 2 * Math.PI) / segments;
                    const ang2 = ((i + 1) * 2 * Math.PI) / segments;
                    edges.push({ v1: { x: r * Math.cos(ang1), y: r * Math.sin(ang1), z: 0 }, v2: { x: r * Math.cos(ang2), y: r * Math.sin(ang2), z: 0 }, facesIdx: [] });
                    edges.push({ v1: { x: r * Math.cos(ang1), y: 0, z: r * Math.sin(ang1) }, v2: { x: r * Math.cos(ang2), y: 0, z: r * Math.sin(ang2) }, facesIdx: [] });
                    edges.push({ v1: { x: 0, y: r * Math.cos(ang1), z: r * Math.sin(ang1) }, v2: { x: 0, y: r * Math.cos(ang2), z: r * Math.sin(ang2) }, facesIdx: [] });
                }
            }
        }
        return { vertices, faces, edges };
    }, [subtype, size]);

    // Calculate face visibility after rotation
    const faceVisibility = useMemo(() => {
        return geometry.faces.map(f => {
            const v1 = transform(geometry.vertices[f[0]], { x: 0, y: 0, z: 0 }, rotation);
            const v2 = transform(geometry.vertices[f[1]], { x: 0, y: 0, z: 0 }, rotation);
            const v3 = transform(geometry.vertices[f[2]], { x: 0, y: 0, z: 0 }, rotation);
            const n = getNormal(v1, v2, v3);
            return {
                ph: n.z > 0.001,
                pv: n.y < -0.001
            };
        });
    }, [geometry, rotation]);

    const pc = project(position);

    return (
        <g onClick={onClick} className="cursor-pointer hover:opacity-80">
            {geometry.edges.map((e, idx) => {
                const p1 = transform(e.v1, position, rotation);
                const p2 = transform(e.v2, position, rotation);
                const proj1 = project(p1);
                const proj2 = project(p2);
                let isVisiblePH = true;
                let isVisiblePV = true;
                if (e.facesIdx.length > 0) {
                    isVisiblePH = e.facesIdx.some(fIdx => faceVisibility[fIdx]?.ph);
                    isVisiblePV = e.facesIdx.some(fIdx => faceVisibility[fIdx]?.pv);
                }
                return (
                    <g key={idx}>
                        <line
                            x1={proj1.h.x} y1={proj1.h.y} x2={proj2.h.x} y2={proj2.h.y}
                            stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round"
                            strokeDasharray={isVisiblePH ? "none" : "3 3"}
                            opacity={isVisiblePH ? 1 : 0.6}
                        />
                        <line
                            x1={proj1.v.x} y1={proj1.v.y} x2={proj2.v.x} y2={proj2.v.y}
                            stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round"
                            strokeDasharray={isVisiblePV ? "none" : "3 3"}
                            opacity={isVisiblePV ? 1 : 0.6}
                        />
                    </g>
                );
            })}
            <text x={pc.h.x + 15} y={pc.h.y} fontSize="10" fill={strokeColor} className="select-none font-bold italic">{element.name}'</text>
            <text x={pc.v.x + 15} y={pc.v.y} fontSize="10" fill={strokeColor} className="select-none font-bold italic">{element.name}''</text>
            <line x1={pc.h.x} y1={pc.h.y} x2={pc.v.x} y2={pc.v.y} stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
        </g>
    );
}
