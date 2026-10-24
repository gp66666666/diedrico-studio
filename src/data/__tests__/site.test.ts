import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../exercises';
import { PAGE_META, SITE_URL, exerciseDescription, exercisePageTitle, pageSeo } from '../site';

/**
 * El HTML estático (scripts/seo.mjs) se genera desde estos datos. Si algo se
 * sale de madre (un título larguísimo, una ruta repetida, un canonical mal
 * montado), se ve en Google y en los enlaces compartidos, no en los tests de
 * geometría. Esto lo caza antes de desplegar.
 */

const PAGES = Object.values(PAGE_META);

describe('metadatos de las páginas', () => {
    it('cada ruta es única y empieza por barra', () => {
        const paths = PAGES.map((p) => p.path);
        expect(new Set(paths).size).toBe(paths.length);
        for (const path of paths) expect(path.startsWith('/')).toBe(true);
    });

    it('los títulos caben en una pestaña (≤ 65 caracteres)', () => {
        for (const page of PAGES) {
            expect(page.title.length, `${page.path}: "${page.title}"`).toBeLessThanOrEqual(65);
        }
    });

    it('las descripciones tienen entre 80 y 160 caracteres', () => {
        for (const page of PAGES) {
            expect(page.description.length, `${page.path}: "${page.description}"`).toBeGreaterThanOrEqual(80);
            expect(page.description.length, `${page.path}: "${page.description}"`).toBeLessThanOrEqual(160);
        }
    });

    it('el canonical se construye desde la ruta, sin duplicar barras', () => {
        for (const page of PAGES) {
            const seo = pageSeo(page);
            expect(seo.canonicalUrl).toBe(`${SITE_URL}${page.path}`);
            expect(seo.canonicalUrl.replace('https://', '')).not.toContain('//');
        }
    });

    it('solo las páginas privadas llevan noindex', () => {
        expect(PAGES.filter((p) => p.noindex).map((p) => p.path)).toEqual(['/clase']);
    });
});

describe('descripciones de los ejercicios', () => {
    const exercisePages = EXERCISES.map((e) => ({
        slug: e.slug,
        title: exercisePageTitle(e.title),
        description: exerciseDescription(e.statement),
    }));

    it('ninguna descripción se queda a medias ni pasa de 160 caracteres', () => {
        for (const page of exercisePages) {
            expect(page.description.length, page.slug).toBeLessThanOrEqual(160);
            expect(page.description.length, page.slug).toBeGreaterThanOrEqual(40);
            expect(page.description.endsWith(' '), page.slug).toBe(false);
        }
    });

    it('los títulos de ejercicio caben en una pestaña (≤ 65 caracteres)', () => {
        for (const page of exercisePages) {
            expect(page.title.length, `${page.slug}: "${page.title}"`).toBeLessThanOrEqual(65);
        }
    });

    it('los títulos de ejercicio son únicos', () => {
        const titles = exercisePages.map((p) => p.title);
        expect(new Set(titles).size).toBe(titles.length);
    });
});
