import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    flattenProgress,
    startFlattenAnimation,
    resetFlattenAnimation,
} from '../flattenAnimation';

/**
 * El abatimiento es una animación: si se rompe, el alumno ve el dibujo a medias
 * y no hay ningún error en pantalla. Estas pruebas fijan el contrato mínimo:
 * empieza en 0, llega a 1, no retrocede y se puede invertir a mitad sin saltos.
 */
describe('flattenAnimation', () => {
    let now = 0;

    beforeEach(() => {
        now = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => now);
        resetFlattenAnimation();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('parte de 0, pasa por el medio y llega a 1', () => {
        startFlattenAnimation(true);
        expect(flattenProgress()).toBe(0);

        now = 500; // algo menos de la mitad de los 1150 ms
        const mid = flattenProgress();
        expect(mid).toBeGreaterThan(0.1);
        expect(mid).toBeLessThan(0.9);

        now = 2000; // pasado el final
        expect(flattenProgress()).toBe(1);
    });

    it('va siempre hacia delante y con frenada (curva en S)', () => {
        startFlattenAnimation(true);
        let prev = 0;
        for (now = 0; now <= 1200; now += 25) {
            const p = flattenProgress();
            expect(p).toBeGreaterThanOrEqual(prev - 1e-9);
            prev = p;
        }
        expect(prev).toBe(1);

        // Con frenada: al principio avanza menos que en el centro del recorrido.
        vi.restoreAllMocks();
        now = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => now);
        resetFlattenAnimation();
        startFlattenAnimation(true);
        now = 100;
        const early = flattenProgress();
        now = 575;
        const centre = flattenProgress();
        expect(centre).toBeGreaterThan(early * 2);
    });

    it('al invertir a mitad arranca desde donde está, sin saltos', () => {
        startFlattenAnimation(true);
        now = 600;
        const mid = flattenProgress();
        expect(mid).toBeGreaterThan(0.1);

        startFlattenAnimation(false);
        expect(flattenProgress()).toBeCloseTo(mid, 5);

        now = 3000;
        expect(flattenProgress()).toBe(0);
    });

    it('si ya está en el destino no anima', () => {
        startFlattenAnimation(false);
        expect(flattenProgress()).toBe(0);
        now = 10;
        expect(flattenProgress()).toBe(0);
    });
});
