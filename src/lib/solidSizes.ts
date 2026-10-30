import type { SolidElement } from '../types';

/**
 * Medidas que se enseñan en el panel de un sólido.
 *
 * El cubo es el único con una conversión: en el modelo, `size.x` es el «radio»
 * y la arista mide 1,5 veces eso (comportamiento histórico, `buildSolidMesh`).
 * En el formulario, en cambio, se escribe y se lee la ARISTA: si el alumno
 * pone 5, el cubo tiene 5 de arista. Antes el campo se llamaba «Tamaño» y
 * valía 5, pero el cubo salía de 7,5 — justo el tipo de cosa que hace que un
 * diédrico no cuadre con el del cuaderno.
 *
 * No se toca el modelo: los proyectos y los enlaces ya guardados siguen
 * abriéndose con el mismo tamaño.
 */

/** Arista / size.x del cubo en el modelo. */
export const CUBE_EDGE_PER_SIZE_X = 1.5;

/** Valor que se muestra en el campo de medidas (la arista, en el cubo). */
export function displaySizeX(subtype: SolidElement['subtype'], sizeX: number): number {
    if (subtype !== 'cube') return sizeX;
    return sizeX * CUBE_EDGE_PER_SIZE_X;
}

/** Valor que se guarda en `size.x` a partir de lo escrito en el campo. */
export function sizeXFromDisplay(subtype: SolidElement['subtype'], shown: number): number {
    if (subtype !== 'cube') return shown;
    return shown / CUBE_EDGE_PER_SIZE_X;
}
