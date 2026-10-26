import { describe, expect, it } from 'vitest';
import { EXERCISE_TOPICS } from '../exercises';
import { TOPIC_PAGES } from '../topics';

/**
 * Las páginas de bloque se generan desde `TOPIC_PAGES`, pero los ejercicios
 * mandan: si se añade un tema nuevo a la biblioteca y no tiene página, o al
 * revés, aquí salta antes de desplegar.
 */
describe('páginas de bloque del temario', () => {
    it('hay una página por cada tema de los ejercicios', () => {
        expect(TOPIC_PAGES.map((t) => t.topic).sort()).toEqual([...EXERCISE_TOPICS].sort());
    });

    it('los slugs son únicos y seguros para una URL', () => {
        const slugs = TOPIC_PAGES.map((t) => t.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
        for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });

    it('títulos y descripciones caben en Google', () => {
        for (const topic of TOPIC_PAGES) {
            expect(topic.title.length, `${topic.slug}: "${topic.title}"`).toBeLessThanOrEqual(65);
            expect(topic.description.length, topic.slug).toBeGreaterThanOrEqual(80);
            expect(topic.description.length, topic.slug).toBeLessThanOrEqual(160);
        }
    });

    it('cada bloque tiene método y objetivos, no solo relleno', () => {
        for (const topic of TOPIC_PAGES) {
            expect(topic.learn.length, topic.slug).toBeGreaterThanOrEqual(3);
            expect(topic.steps.length, topic.slug).toBeGreaterThanOrEqual(3);
            expect(topic.intro.length, topic.slug).toBeGreaterThanOrEqual(120);
            expect(topic.exam.length, topic.slug).toBeGreaterThanOrEqual(60);
        }
    });
});
