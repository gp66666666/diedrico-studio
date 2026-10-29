import { describe, expect, it } from 'vitest';
import { isParallelismTool } from '../parallelismTools';

describe('ParallelismTool: solo sus herramientas', () => {
    it('reconoce las de paralelismo y perpendicularidad', () => {
        expect(isParallelismTool('parallel-line-line')).toBe(true);
        expect(isParallelismTool('plane-parallel-plane')).toBe(true);
        expect(isParallelismTool('perp-plane-line')).toBe(true);
        expect(isParallelismTool('line-parallel-2-planes')).toBe(true);
        expect(isParallelismTool('plane-parallel-2-lines')).toBe(true);
    });

    it('NO captura herramientas que comparten prefijo pero no son suyas', () => {
        // Este fue el bug real: con 'plane-3-points' se reseteaba al 2.º clic
        // y el plano por 3 puntos nunca se creaba.
        expect(isParallelismTool('plane-3-points')).toBe(false);
        expect(isParallelismTool('plane-click')).toBe(false);
        expect(isParallelismTool('line-solid')).toBe(false);
        expect(isParallelismTool('plane-perp-2-planes')).toBe(true);
        expect(isParallelismTool('none')).toBe(false);
        expect(isParallelismTool(null)).toBe(false);
    });
});
