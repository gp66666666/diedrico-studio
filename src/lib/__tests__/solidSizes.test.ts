import { describe, expect, it } from 'vitest';
import { buildSolidMesh } from '../solidGeometry';
import { displaySizeX, sizeXFromDisplay } from '../solidSizes';

/**
 * El campo «Medidas» del cubo es la ARISTA, no el size.x interno.
 *
 * Si alguien vuelve a cambiar la conversión, este test avisa: lo que se escribe
 * en el panel tiene que ser lo que mide la arista de verdad (lo que sale en el
 * diédrico y en el 3D).
 */
describe('medidas del cubo en el panel', () => {
    const edgeOf = (sizeX: number) => {
        const mesh = buildSolidMesh('cube', { x: sizeX, y: sizeX, z: sizeX });
        const xs = mesh.vertices.map((v) => v.x);
        return Math.max(...xs) - Math.min(...xs);
    };

    it('lo que se escribe es la arista', () => {
        expect(edgeOf(sizeXFromDisplay('cube', 5))).toBeCloseTo(5, 10);
        expect(edgeOf(sizeXFromDisplay('cube', 4.5))).toBeCloseTo(4.5, 10);
    });

    it('ida y vuelta sin perder el valor', () => {
        expect(displaySizeX('cube', sizeXFromDisplay('cube', 7.25))).toBeCloseTo(7.25, 10);
    });

    it('los demás sólidos no cambian', () => {
        expect(displaySizeX('octahedron', 5)).toBe(5);
        expect(sizeXFromDisplay('octahedron', 5)).toBe(5);
        expect(displaySizeX('sphere', 4)).toBe(4);
        expect(sizeXFromDisplay('sphere', 4)).toBe(4);
    });

    it('un cubo guardado antes (size.x = 5 → arista 7,5) se sigue viendo igual', () => {
        // El modelo no se toca: el mismo size.x produce la misma malla.
        expect(edgeOf(5)).toBeCloseTo(7.5, 10);
        // Y el panel ahora enseña 7,5 en vez de 5.
        expect(displaySizeX('cube', 5)).toBeCloseTo(7.5, 10);
    });
});
