import { buildSolidMesh, rotateStorePoint, type Vec3 } from './solidGeometry';
import type { SolidElement } from '../types';

/**
 * Colocación de sólidos sobre el plano horizontal.
 *
 * En el store el centro del sólido es `position` y la malla está centrada en el
 * origen, así que un cubo de arista 7,5 tiene la cara inferior en z = -3,75.
 * Para que «apoye en el PH» hay que subir el centro justo eso: si no, medio
 * sólido queda por debajo del papel, que es el error clásico al colocarlo a
 * mano.
 *
 * La cuenta se hace con los vértices reales y la rotación real, no con la
 * altura nominal: un cubo girado 45° apoya sobre una arista y su centro sube
 * más (media diagonal), no la mitad del lado.
 */

/** Cota del vértice más bajo de la malla, con el centro en el origen. */
export function lowestLocalZ(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation?: Vec3
): number {
    const mesh = buildSolidMesh(subtype, size);
    let min = Infinity;
    for (const vertex of mesh.vertices) {
        const p = rotateStorePoint(vertex, rotation);
        if (p.z < min) min = p.z;
    }
    return Number.isFinite(min) ? min : 0;
}

/** Alejamiento del vértice más cercano al plano vertical, con el centro en el origen. */
export function lowestLocalY(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation?: Vec3
): number {
    const mesh = buildSolidMesh(subtype, size);
    let min = Infinity;
    for (const vertex of mesh.vertices) {
        const p = rotateStorePoint(vertex, rotation);
        if (p.y < min) min = p.y;
    }
    return Number.isFinite(min) ? min : 0;
}

/** Alejamiento del centro para que el sólido toque el plano vertical (y = 0). */
export function restingCenterY(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation?: Vec3
): number {
    return -lowestLocalY(subtype, size, rotation);
}

/** Cota que debe tener el centro para que el punto más bajo quede en z = 0. */
export function restingCenterZ(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation?: Vec3
): number {
    return -lowestLocalZ(subtype, size, rotation);
}

/**
 * Apoyar en el plano vertical: la parte de atrás toca el PV (y = 0) y el
 * sólido queda por delante, en el primer cuadrante. Solo cambia el alejamiento.
 */
export function restOnVerticalPlane(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation: Vec3 | undefined,
    position: Vec3
): Vec3 {
    return { ...position, y: restingCenterY(subtype, size, rotation) };
}

/** Devuelve la posición con la cota corregida para apoyar en el PH. */
export function restOnHorizontalPlane(
    subtype: SolidElement['subtype'],
    size: Vec3,
    rotation: Vec3 | undefined,
    position: Vec3
): Vec3 {
    return { ...position, z: restingCenterZ(subtype, size, rotation) };
}
