import { describe, expect, it } from 'vitest';
import { selectionCountForTool } from '../selection';

describe('selección por herramienta', () => {
    it('las distancias piden 2 elementos, también recta-recta y plano-plano', () => {
        expect(selectionCountForTool('distance-point-point')).toBe(2);
        expect(selectionCountForTool('distance-line-line')).toBe(2);
        expect(selectionCountForTool('distance-line-plane')).toBe(2);
        expect(selectionCountForTool('distance-plane-plane')).toBe(2);
    });

    it('los giros piden objeto + eje', () => {
        expect(selectionCountForTool('rotation-any')).toBe(2);
        expect(selectionCountForTool('rotation-point-axis')).toBe(2);
        expect(selectionCountForTool('rotation-parallel-lt')).toBe(2);
    });

    it('abatimientos y cambios de plano piden 2', () => {
        expect(selectionCountForTool('abatir-ph')).toBe(2);
        expect(selectionCountForTool('desabatir-p-ph')).toBe(2);
        expect(selectionCountForTool('cambio-plano-h')).toBe(2);
    });

    it('las construcciones de 3 elementos piden 3', () => {
        expect(selectionCountForTool('plane-3-points')).toBe(3);
        expect(selectionCountForTool('plane-perp-2-planes')).toBe(3);
        expect(selectionCountForTool('line-parallel-2-planes')).toBe(3);
        expect(selectionCountForTool('plane-parallel-2-lines')).toBe(3);
        expect(selectionCountForTool('advanced-intersection-3-planes')).toBe(3);
    });

    it('los sólidos se colocan con un punto', () => {
        expect(selectionCountForTool('poliedro-cubo')).toBe(1);
        expect(selectionCountForTool('revolucion-esfera')).toBe(1);
    });

    it('intersecciones y ángulos piden 2', () => {
        expect(selectionCountForTool('intersection-line-plane')).toBe(2);
        expect(selectionCountForTool('angle-plane-plane')).toBe(2);
        expect(selectionCountForTool('true-length')).toBe(1);
    });

    it('sin herramienta no se selecciona nada', () => {
        expect(selectionCountForTool('none')).toBe(0);
    });
});
