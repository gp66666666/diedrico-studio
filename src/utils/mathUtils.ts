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
    // P + t*D = (x, y, 0) => P.z + t*D.z = 0 => t = -P.z / D.z
    if (Math.abs(direction.z) > 1e-6) {
        const t = -point.z / direction.z;
        hTrace = vectorAdd(point, vectorScale(direction, t));
    }

    // Vertical Trace (y = 0)
    // P + t*D = (x, 0, z) => P.y + t*D.y = 0 => t = -P.y / D.y
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
    // Line: P + t*D
    // Plane: N.X + C = 0
    // N.(P + t*D) + C = 0
    // N.P + t*(N.D) + C = 0
    // t = -(N.P + C) / (N.D)

    const denom = vectorDot(planeNormal, lineDir);

    if (Math.abs(denom) < 1e-6) {
        // Line is parallel to plane
        return null;
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
    // Direction of intersection line is cross product of normals
    const direction = vectorCross(n1, n2);

    // If direction is zero, planes are parallel
    if (vectorLength(direction) < 1e-6) {
        return null;
    }

    // To find a point on the line, we can set one coordinate to 0 and solve for the others
    // Or use the formula: P = (c1 * (n2 x n12) + c2 * (n12 x n1)) / |n1 x n2|^2 ?? No, simpler:
    // Solve system:
    // n1.x*x + n1.y*y + n1.z*z = -c1
    // n2.x*x + n2.y*y + n2.z*z = -c2

    // Let's try setting z=0, if that fails y=0, then x=0
    // Determinant for x,y part: n1.x*n2.y - n1.y*n2.x = direction.z

    let point: Vector3;

    if (Math.abs(direction.z) > 1e-6) {
        // Set z = 0
        // n1.x*x + n1.y*y = -c1
        // n2.x*x + n2.y*y = -c2
        const det = n1.x * n2.y - n1.y * n2.x;
        const x = ((-c1) * n2.y - n1.y * (-c2)) / det;
        const y = (n1.x * (-c2) - (-c1) * n2.x) / det;
        point = { x, y, z: 0 };
    } else if (Math.abs(direction.y) > 1e-6) {
        // Set y = 0
        // n1.x*x + n1.z*z = -c1
        // n2.x*x + n2.z*z = -c2
        const det = n1.x * n2.z - n1.z * n2.x; // -direction.y
        const x = ((-c1) * n2.z - n1.z * (-c2)) / det;
        const z = (n1.x * (-c2) - (-c1) * n2.x) / det;
        point = { x, y: 0, z };
    } else {
        // Set x = 0
        // n1.y*y + n1.z*z = -c1
        // n2.y*y + n2.z*z = -c2
        const det = n1.y * n2.z - n1.z * n2.y; // direction.x
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
    // Check if lines are coplanar and not parallel
    // We can find the closest points. If distance is 0, they intersect.

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

    // Point on line 1
    const P1 = vectorAdd(p1, vectorScale(d1, sc));
    // Point on line 2
    const P2 = vectorAdd(p2, vectorScale(d2, tc));

    const dist = vectorLength(vectorSub(P1, P2));

    if (dist < 1e-4) {
        return P1;
    }

    return null; // Skew lines
};

// --- Plane Helpers ---

export const calculatePlaneFromTwoLines = (
    l1: { point: Vector3; direction: Vector3 },
    l2: { point: Vector3; direction: Vector3 }
): { normal: Vector3; constant: number } | null => {
    // Check if lines are parallel (cross product is zero)
    const crossDir = vectorCross(l1.direction, l2.direction);
    const isParallel = vectorLength(crossDir) < 1e-6;

    let normal: Vector3;

    if (isParallel) {
        // If parallel, we need a vector connecting the two lines to form the plane
        const vConnect = vectorSub(l2.point, l1.point);
        // Normal is cross product of line direction and connection vector
        normal = vectorNormalize(vectorCross(l1.direction, vConnect));

        // If lines are collinear (connection vector parallel to direction), we can't define a unique plane
        if (vectorLength(normal) < 1e-6) return null;
    } else {
        // If intersecting/skew (we assume they define a plane, usually intersecting)
        // Normal is cross product of the two directions
        normal = vectorNormalize(crossDir);
    }

    // Plane equation: Ax + By + Cz + D = 0
    // D = -(Ax + By + Cz) using any point on the plane (e.g., l1.point)
    const constant = -(normal.x * l1.point.x + normal.y * l1.point.y + normal.z * l1.point.z);

    return { normal, constant };
};

export const calculatePlaneFromIntercepts = (x: number, y: number, z: number): { normal: Vector3; constant: number } | null => {
    // Plane passing through (x,0,0), (0,y,0), (0,0,z)

    // Handle infinity/zero cases (planes parallel to axes)
    // If any value is 0, it passes through origin, which is ambiguous with this method unless specified differently.
    // We'll assume non-zero for standard intercepts.

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
    // Plane: Ax + By + Cz + D = 0
    // Horizontal Trace (z=0): Ax + By + D = 0. Exists unless plane is parallel to XY (Normal is 0,0,1 => A=0, B=0)
    // Vertical Trace (y=0): Ax + Cz + D = 0. Exists unless plane is parallel to XZ (Normal is 0,1,0 => A=0, C=0)

    const hTrace = !(Math.abs(normal.x) < 1e-6 && Math.abs(normal.y) < 1e-6);
    const vTrace = !(Math.abs(normal.x) < 1e-6 && Math.abs(normal.z) < 1e-6);

    return { hTrace, vTrace };
};
