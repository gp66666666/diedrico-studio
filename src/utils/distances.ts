import type { Vec3 } from '../types';

/**
 * Calculate the Euclidean distance between two points in 3D space
 */
export function distancePointToPoint(p1: Vec3, p2: Vec3): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate distances for the "characteristic triangle" (triángulo característico)
 * Returns the differences in each axis and the total distance
 */
export function calculateCharacteristicTriangle(p1: Vec3, p2: Vec3) {
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    const dz = Math.abs(p2.z - p1.z);
    const distance = distancePointToPoint(p1, p2);

    // Hypotenuse in XY plane (projection on horizontal plane)
    const dxy = Math.sqrt(dx * dx + dy * dy);

    // Hypotenuse in XZ plane (projection on vertical plane)
    const dxz = Math.sqrt(dx * dx + dz * dz);

    return {
        dx,           // Apartamiento (difference in X)
        dy,           // Alejamiento (difference in Y)
        dz,           // Cota (difference in Z)
        dxy,          // Distance in horizontal plane
        dxz,          // Distance in vertical plane
        distance      // Total 3D distance
    };
}

/**
 * Calculate the distance from a point to a line defined by a point and direction
 */
export function distancePointToLine(point: Vec3, linePoint: Vec3, lineDirection: Vec3): {
    distance: number;
    closestPoint: Vec3;
    perpendicular: Vec3;
} {
    // Vector from line point to the point
    const w = {
        x: point.x - linePoint.x,
        y: point.y - linePoint.y,
        z: point.z - linePoint.z
    };

    // Normalize line direction
    const dirLength = Math.sqrt(
        lineDirection.x * lineDirection.x +
        lineDirection.y * lineDirection.y +
        lineDirection.z * lineDirection.z
    );

    const dir = {
        x: lineDirection.x / dirLength,
        y: lineDirection.y / dirLength,
        z: lineDirection.z / dirLength
    };

    // Project w onto the line direction
    const t = w.x * dir.x + w.y * dir.y + w.z * dir.z;

    // Closest point on the line
    const closestPoint = {
        x: linePoint.x + t * dir.x,
        y: linePoint.y + t * dir.y,
        z: linePoint.z + t * dir.z
    };

    // Perpendicular vector from line to point
    const perpendicular = {
        x: point.x - closestPoint.x,
        y: point.y - closestPoint.y,
        z: point.z - closestPoint.z
    };

    // Distance is the length of the perpendicular
    const distance = Math.sqrt(
        perpendicular.x * perpendicular.x +
        perpendicular.y * perpendicular.y +
        perpendicular.z * perpendicular.z
    );

    return { distance, closestPoint, perpendicular };
}

/**
 * Calculate the distance from a point to a plane defined by normal and constant
 * Plane equation: nx*x + ny*y + nz*z + d = 0
 */
export function distancePointToPlane(point: Vec3, normal: Vec3, constant: number): {
    distance: number;
    closestPoint: Vec3;
    perpendicular: Vec3;
} {
    // Normalize the normal vector
    const normalLength = Math.sqrt(
        normal.x * normal.x +
        normal.y * normal.y +
        normal.z * normal.z
    );

    const n = {
        x: normal.x / normalLength,
        y: normal.y / normalLength,
        z: normal.z / normalLength
    };

    // Adjusted constant
    const d = constant / normalLength;

    // Distance formula: |n·p + d|
    const signedDistance = n.x * point.x + n.y * point.y + n.z * point.z + d;
    const distance = Math.abs(signedDistance);

    // Closest point is point - signedDistance * normal
    const closestPoint = {
        x: point.x - signedDistance * n.x,
        y: point.y - signedDistance * n.y,
        z: point.z - signedDistance * n.z
    };

    // Perpendicular is from closestPoint to point
    const perpendicular = {
        x: point.x - closestPoint.x,
        y: point.y - closestPoint.y,
        z: point.z - closestPoint.z
    };

    return { distance, closestPoint, perpendicular };
}

/**
 * Calculate distance between two parallel lines
 */
export function distanceBetweenParallelLines(
    line1Point: Vec3,
    line2Point: Vec3,
    direction: Vec3
): number {
    // Distance between parallel lines is the distance from a point on one line
    // to the other line
    return distancePointToLine(line2Point, line1Point, direction).distance;
}

/**
 * Calculate distance between two skew lines (that don't intersect)
 */
export function distanceBetweenSkewLines(
    line1Point: Vec3,
    line1Direction: Vec3,
    line2Point: Vec3,
    line2Direction: Vec3
): {
    distance: number;
    point1: Vec3;
    point2: Vec3;
} | null {
    // Check if lines are parallel
    const cross = {
        x: line1Direction.y * line2Direction.z - line1Direction.z * line2Direction.y,
        y: line1Direction.z * line2Direction.x - line1Direction.x * line2Direction.z,
        z: line1Direction.x * line2Direction.y - line1Direction.y * line2Direction.x
    };

    const crossLength = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);

    if (crossLength < 1e-6) {
        // Lines are parallel
        return null;
    }

    // Vector between the two line points
    const w = {
        x: line2Point.x - line1Point.x,
        y: line2Point.y - line1Point.y,
        z: line2Point.z - line1Point.z
    };

    // Distance = |w · (d1 × d2)| / |d1 × d2|
    const distance = Math.abs(
        (w.x * cross.x + w.y * cross.y + w.z * cross.z) / crossLength
    );

    // For finding the actual closest points, we'd need to solve a system
    // For now, return approximate points (can be improved later)
    return {
        distance,
        point1: line1Point,
        point2: line2Point
    };
}

/**
 * Format distance for display (round to 2 decimal places)
 */
export function formatDistance(distance: number): string {
    return distance.toFixed(2);
}
