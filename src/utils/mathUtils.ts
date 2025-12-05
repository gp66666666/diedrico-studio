import { Vector3 } from '../types';

// --- Vector Operations ---

export const vectorAdd = (v1: Vector3, v2: Vector3): Vector3 => ({
    x: v1.x + v2.x,
    y: v1.y + v2.y,
    z: v1.z + v2.z,
});

export const vectorSub = (v1: Vector3, v2: Vector3): Vector3 => ({
    x: v1.x - v2.x,
    y: v1.y - v2.y,
    z: v1.z - v2.z,
});

export const vectorScale = (v: Vector3, s: number): Vector3 => ({
    x: v.x * s,
    y: v.y * s,
    z: v.z * s,
});

export const vectorDot = (v1: Vector3, v2: Vector3): number =>
    v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

export const vectorCross = (v1: Vector3, v2: Vector3): Vector3 => ({
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
});

export const vectorLength = (v: Vector3): number =>
    Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

export const vectorNormalize = (v: Vector3): Vector3 => {
    const len = vectorLength(v);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return vectorScale(v, 1 / len);
};

// --- Geometry Calculations ---

export const calculateLineTraces = (point: Vector3, direction: Vector3) => {
    let hTrace: Vector3 | null = null;
    let vTrace: Vector3 | null = null;

    // Horizontal Trace (z = 0)
    if (Math.abs(direction.z) > 1e-6) {
        const t = -point.z / direction.z;
        hTrace = vectorAdd(point, vectorScale(direction, t));
    }

    // Vertical Trace (y = 0)
    if (Math.abs(direction.y) > 1e-6) {
        const t = -point.y / direction.y;
        vTrace = vectorAdd(point, vectorScale(direction, t));
    }

    return { hTrace, vTrace };
};

// --- Intersections ---

export const intersectLinePlane = (
    linePoint: Vector3,
    lineDir: Vector3,
    planeNormal: Vector3,
    planeConstant: number
): Vector3 | null => {
    const denom = vectorDot(planeNormal, lineDir);

    if (Math.abs(denom) < 1e-6) {
        return null; // Parallel
    }

    const t = -(vectorDot(planeNormal, linePoint) + planeConstant) / denom;
    return vectorAdd(linePoint, vectorScale(lineDir, t));
};

export const intersectPlanePlane = (
    n1: Vector3,
    c1: number,
    n2: Vector3,
    c2: number
): { point: Vector3; direction: Vector3 } | null => {
    const direction = vectorCross(n1, n2);

    if (vectorLength(direction) < 1e-6) {
        return null; // Parallel
    }

    let point: Vector3;

    if (Math.abs(direction.z) > 1e-6) {
        const det = n1.x * n2.y - n1.y * n2.x;
        const x = ((-c1) * n2.y - n1.y * (-c2)) / det;
        const y = (n1.x * (-c2) - (-c1) * n2.x) / det;
        point = { x, y, z: 0 };
    } else if (Math.abs(direction.y) > 1e-6) {
        const det = n1.x * n2.z - n1.z * n2.x;
        const x = ((-c1) * n2.z - n1.z * (-c2)) / det;
        const z = (n1.x * (-c2) - (-c1) * n2.x) / det;
        point = { x, y: 0, z };
    } else {
        const det = n1.y * n2.z - n1.z * n2.y;
        const y = ((-c1) * n2.z - n1.z * (-c2)) / det;
        const z = (n1.y * (-c2) - (-c1) * n2.y) / det;
        point = { x: 0, y, z };
    }

    return { point, direction: vectorNormalize(direction) };
};

export const intersectLineLine = (
    p1: Vector3,
    d1: Vector3,
    p2: Vector3,
    d2: Vector3
): Vector3 | null => {
    const w0 = vectorSub(p1, p2);
    const a = vectorDot(d1, d1);
    const b = vectorDot(d1, d2);
    const c = vectorDot(d2, d2);
    const d = vectorDot(d1, w0);
    const e = vectorDot(d2, w0);

    const denom = a * c - b * b;

    if (Math.abs(denom) < 1e-6) {
        return null; // Parallel
    }

    const sc = (b * e - c * d) / denom;
    const tc = (a * e - b * d) / denom;

    const P1 = vectorAdd(p1, vectorScale(d1, sc));
    const P2 = vectorAdd(p2, vectorScale(d2, tc));

    const dist = vectorLength(vectorSub(P1, P2));

    if (dist < 1e-4) {
        return P1;
    }

    return null; // Skew lines
};

// --- Advanced Intersections (3 elements) ---

/**
 * Intersect 3 planes
 * Returns: point (unique), line (infinite solutions), or none
 */
export const intersectThreePlanes = (
    n1: Vector3, c1: number,
    n2: Vector3, c2: number,
    n3: Vector3, c3: number
): { type: 'point', point: Vector3 }
    | { type: 'line', point: Vector3, direction: Vector3 }
    | { type: 'none' } => {

    // System of equations: n1·p + c1 = 0, n2·p + c2 = 0, n3·p + c3 = 0
    // Matrix form: [n1; n2; n3] * p = -[c1; c2; c3]

    // Calculate determinant using triple scalar product
    const det = vectorDot(n1, vectorCross(n2, n3));

    if (Math.abs(det) > 1e-6) {
        // Unique solution - planes intersect at a point
        // Using Cramer's rule
        const detX = vectorDot(vectorCross(n2, n3), vectorScale({ x: -c1, y: -c2, z: -c3 }, 1));
        const detY = vectorDot(vectorCross(n3, n1), vectorScale({ x: -c1, y: -c2, z: -c3 }, 1));
        const detZ = vectorDot(vectorCross(n1, n2), vectorScale({ x: -c1, y: -c2, z: -c3 }, 1));

        // Simpler approach using matrix inversion
        const pt1 = vectorScale(vectorCross(n2, n3), -c1);
        const pt2 = vectorScale(vectorCross(n3, n1), -c2);
        const pt3 = vectorScale(vectorCross(n1, n2), -c3);

        const point = vectorScale(vectorAdd(vectorAdd(pt1, pt2), pt3), 1 / det);

        return { type: 'point', point };
    }

    // det = 0, planes don't have a unique intersection point
    // Check if first two planes intersect in a line
    const line12 = intersectPlanePlane(n1, c1, n2, c2);

    if (!line12) {
        return { type: 'none' }; // Planes 1 and 2 are parallel
    }

    // Check if this line lies on plane 3
    const pointOnLine = line12.point;
    const distToPlane3 = Math.abs(vectorDot(n3, pointOnLine) + c3);

    if (distToPlane3 < 1e-4) {
        // Line lies on plane 3 - infinite intersection
        return { type: 'line', point: line12.point, direction: line12.direction };
    }

    return { type: 'none' }; // No common intersection
};

/**
 * Intersect 3 lines
 * Returns: point if all 3 lines are concurrent, null otherwise
 */
export const intersectThreeLines = (
    p1: Vector3, d1: Vector3,
    p2: Vector3, d2: Vector3,
    p3: Vector3, d3: Vector3
): Vector3 | null => {
    // Find intersection of first two lines
    const int12 = intersectLineLine(p1, d1, p2, d2);

    if (!int12) {
        return null; // Lines 1 and 2 don't intersect
    }

    // Check if third line passes through this point
    // Line 3: p3 + t*d3
    // We need to find  if there exists t such that p3 + t*d3 = int12

    // t*d3 = int12 - p3
    const diff = vectorSub(int12, p3);

    // Check if diff is parallel to d3
    const cross = vectorCross(diff, d3);

    if (vectorLength(cross) < 1e-4) {
        // Line 3 passes through the intersection point
        return int12;
    }

    return null; // Not concurrent
};

/**
 * Intersect 2 planes and 1 line
 * Returns: point where line intersects the intersection of the two planes
 */
export const intersectTwoPlanesOneLine = (
    n1: Vector3, c1: number,
    n2: Vector3, c2: number,
    linePoint: Vector3, lineDir: Vector3
): Vector3 | null => {
    // First, find the line of intersection of the two planes
    const planeLine = intersectPlanePlane(n1, c1, n2, c2);

    if (!planeLine) {
        return null; // Planes are parallel
    }

    // Now find where the given line intersects the plane line
    // This is the intersection of two lines
    return intersectLineLine(
        planeLine.point, planeLine.direction,
        linePoint, lineDir
    );
};

/**
 * Intersect 2 lines and 1 plane
 * Returns: object with point1 and point2 (each can be null)
 */
export const intersectTwoLinesOnePlane = (
    p1: Vector3, d1: Vector3,
    p2: Vector3, d2: Vector3,
    planeNormal: Vector3, planeConstant: number
): { point1: Vector3 | null, point2: Vector3 | null } => {
    const point1 = intersectLinePlane(p1, d1, planeNormal, planeConstant);
    const point2 = intersectLinePlane(p2, d2, planeNormal, planeConstant);

    return { point1, point2 };
};

// --- Plane Helpers ---

export const calculatePlaneFromTwoLines = (
    l1: { point: Vector3; direction: Vector3 },
    l2: { point: Vector3; direction: Vector3 }
): { normal: Vector3; constant: number } | null => {
    const crossDir = vectorCross(l1.direction, l2.direction);
    const isParallel = vectorLength(crossDir) < 1e-6;

    let normal: Vector3;

    if (isParallel) {
        const vConnect = vectorSub(l2.point, l1.point);
        normal = vectorNormalize(vectorCross(l1.direction, vConnect));

        if (vectorLength(normal) < 1e-6) return null;
    } else {
        normal = vectorNormalize(crossDir);
    }

    const constant = -(normal.x * l1.point.x + normal.y * l1.point.y + normal.z * l1.point.z);

    return { normal, constant };
};

export const calculatePlaneFromIntercepts = (x: number, y: number, z: number): { normal: Vector3; constant: number } | null => {
    const p1 = { x, y: 0, z: 0 };
    const p2 = { x: 0, y, z: 0 };
    const p3 = { x: 0, y: 0, z };

    const v1 = vectorSub(p2, p1);
    const v2 = vectorSub(p3, p1);

    const normal = vectorNormalize(vectorCross(v1, v2));
    const constant = -(normal.x * p1.x + normal.y * p1.y + normal.z * p1.z);

    return { normal, constant };
};

export const calculatePlaneTraces = (normal: Vector3, constant: number) => {
    const hTrace = !(Math.abs(normal.x) < 1e-6 && Math.abs(normal.y) < 1e-6);
    const vTrace = !(Math.abs(normal.x) < 1e-6 && Math.abs(normal.z) < 1e-6);

    return { hTrace, vTrace };
};
