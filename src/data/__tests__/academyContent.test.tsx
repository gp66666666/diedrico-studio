import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ACADEMY_CONTENT } from '../academyContent';

/**
 * La Academia es material didáctico: ningún tema puede quedarse sin teoría ni
 * con un texto de relleno, y los datos que se citan tienen que estar.
 */

const texto = (topic: (typeof ACADEMY_CONTENT)[number]) =>
    renderToStaticMarkup(<>{topic.theoryContent}</>)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

describe('academia', () => {
    it('ningún tema se queda sin teoría', () => {
        expect(ACADEMY_CONTENT).toHaveLength(20);
        for (const topic of ACADEMY_CONTENT) {
            const txt = texto(topic);
            expect(txt.length, `tema vacío: ${topic.id}`).toBeGreaterThan(400);
            expect(txt, `tema con relleno: ${topic.id}`).not.toMatch(/Contenido \d+/);
        }
    });

    it('el alfabeto del punto tiene los cuatro cuadrantes correctos', () => {
        const topic = ACADEMY_CONTENT.find((t) => t.id === 'theory-1-point')!;
        const txt = texto(topic);
        // II: cota +, alejamiento −. IV: cota −, alejamiento +.
        expect(txt).toMatch(/II\s*\+\s*−/);
        expect(txt).toMatch(/IV\s*−\s*\+/);
        expect(txt).toContain('bisector');
    });

    it('las trazas del ejemplo del tema 2 están calculadas', () => {
        const topic = ACADEMY_CONTENT.find((t) => t.id === 'theory-2-line')!;
        const txt = texto(topic);
        expect(txt).toContain('H(80, 55, 0)');
        expect(txt).toContain('V(6,67; 0; 36,67)');
    });

    it('el tema 3 incluye los planos horizontal y frontal', () => {
        const topic = ACADEMY_CONTENT.find((t) => t.id === 'theory-3-plane')!;
        const txt = texto(topic);
        expect(txt).toMatch(/Plano horizontal/);
        expect(txt).toMatch(/Plano frontal/);
        expect(txt).toMatch(/Máxima pendiente/);
    });

    it('el mapa del temario no promete más de lo que hay', () => {
        const topic = ACADEMY_CONTENT.find((t) => t.id === 'theory-20-map')!;
        const txt = texto(topic);
        expect(txt).not.toContain('El bloque de diédrico está completo');
    });
});
