import { describe, it, expect } from 'vitest';
import { isSolidCreationTool, makeSolid, solidKeyFromTool } from '../solidFactory';

describe('creación de sólidos desde una herramienta', () => {
    it('reconoce las herramientas de poliedros y de revolución', () => {
        for (const tool of ['poliedro-cubo', 'poliedro-piramide', 'revolucion-cilindro', 'revolucion-esfera']) {
            expect(isSolidCreationTool(tool)).toBe(true);
        }
    });

    it('no confunde las operaciones con la creación', () => {
        for (const tool of ['solid-section', 'solid-intersection', 'solid-development', 'line-solid', 'sphere-tangent', 'shadows', 'cast-shadow', 'none', '', null]) {
            expect(isSolidCreationTool(tool)).toBe(false);
            expect(solidKeyFromTool(tool)).toBeNull();
            expect(makeSolid(tool as string, { x: 0, y: 0, z: 0 }, 0)).toBeNull();
        }
    });

    it('traduce cada herramienta a su sólido', () => {
        expect(makeSolid('poliedro-cubo', { x: 1, y: 2, z: 3 }, 0)?.subtype).toBe('cube');
        expect(makeSolid('poliedro-tetraedro', { x: 0, y: 0, z: 0 }, 0)?.subtype).toBe('tetrahedron');
        expect(makeSolid('poliedro-piramide', { x: 0, y: 0, z: 0 }, 0)?.subtype).toBe('pyramid');
        expect(makeSolid('revolucion-cono', { x: 0, y: 0, z: 0 }, 0)?.subtype).toBe('cone');
        expect(makeSolid('revolucion-esfera', { x: 0, y: 0, z: 0 }, 0)?.subtype).toBe('sphere');
    });

    it('numera los sólidos y copia la posición sin compartirla', () => {
        const center = { x: 1, y: 2, z: 0 };
        const solid = makeSolid('poliedro-cubo', center, 2)!;
        expect(solid.name).toBe('Cubo 3');
        expect(solid.position).toEqual({ x: 1, y: 2, z: 0 });
        expect(solid.position).not.toBe(center);

        // El tamaño es un valor por sólido: cambiar uno no toca al siguiente
        const otro = makeSolid('poliedro-cubo', center, 0)!;
        solid.size.x = 99;
        expect(otro.size.x).toBe(5);
    });

    it('cada sólido nace con rotación cero y visible', () => {
        const solid = makeSolid('poliedro-octaedro', { x: 0, y: 0, z: 0 }, 0)!;
        expect(solid.rotation).toEqual({ x: 0, y: 0, z: 0 });
        expect(solid.visible).toBe(true);
        expect(solid.type).toBe('solid');
    });
});
