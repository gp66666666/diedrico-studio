import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FUNCTION_DEFINITIONS } from '../prompts';
import { extractStepsFromText } from '../parseSteps';

const SERVICES = resolve(process.cwd(), 'src/features/ai-assistant/services');

/** Nombres de parámetros que aparecen en el prompt y no son herramientas. */
const PARAMS = new Set([
    'step_description',
    'normal_x',
    'normal_y',
    'normal_z',
    'x_intercept',
    'y_intercept',
    'z_intercept',
    'center_x',
    'center_y',
    'center_z',
    'start_angle',
    'end_angle',
    'point1_name',
    'point2_name',
    'point1',
    'point2',
    'p1_x',
    'p2_x',
]);

const declared = new Set(FUNCTION_DEFINITIONS.map((d: any) => d.name));

describe('catálogo de herramientas de la IA', () => {
    it('toda herramienta que menciona el prompt existe de verdad', () => {
        const prompt = readFileSync(resolve(SERVICES, 'prompts.ts'), 'utf8');
        const system = prompt.slice(prompt.indexOf('SYSTEM_PROMPT'), prompt.indexOf('EXERCISE_GENERATOR_PROMPT'));
        const mentioned = new Set([...system.matchAll(/\b([a-z][a-z0-9]*_[a-z0-9_]+)\b/g)].map((m) => m[1]));
        const unknown = [...mentioned].filter((name) => !declared.has(name) && !PARAMS.has(name));

        // Una herramienta inventada en el prompt se la inventa el modelo y el paso no se aplica.
        expect(unknown).toEqual([]);
    });

    it('toda herramienta declarada está implementada', () => {
        const executor = readFileSync(resolve(SERVICES, 'executor.ts'), 'utf8');
        const advanced = readFileSync(resolve(SERVICES, 'aiAdvancedTools.ts'), 'utf8');
        const implemented = new Set([
            ...[...executor.matchAll(/case '([a-z0-9_]+)'/g)].map((m) => m[1]),
            ...[...advanced.matchAll(/case ['"]([a-z0-9_]+)['"]/g)].map((m) => m[1]),
        ]);
        const missing = [...declared].filter((name) => !implemented.has(name));

        // Declarar una herramienta que nadie ejecuta deja al alumno con un paso muerto.
        expect(missing).toEqual([]);
    });
});

describe('extractStepsFromText', () => {
    it('lee el bloque ```json que pide el prompt', () => {
        const text = `Vamos a ello.\n\`\`\`json\n[
  { "function": "add_point", "arguments": { "name": "A", "x": 0, "y": 5, "z": 5 } }
]\n\`\`\``;
        expect(extractStepsFromText(text)).toEqual([
            { name: 'add_point', params: { name: 'A', x: 0, y: 5, z: 5 } },
        ]);
    });

    it('acepta `parameters`, `args` y coordenadas en texto', () => {
        const text = '```json\n[{"function":"add_point","parameters":{"name":"B","x":"12","y":"2","z":"-3"}}]\n```';
        const [step] = extractStepsFromText(text);
        expect(step.name).toBe('add_point');
        expect(step.params).toEqual({ name: 'B', x: 12, y: 2, z: -3 });
    });

    it('lee un JSON suelto sin bloque de código', () => {
        const text = 'Ahí van los pasos: [{"name":"add_line_by_points","params":{"name":"r","point1_name":"A","point2_name":"B"}}]';
        expect(extractStepsFromText(text)[0].name).toBe('add_line_by_points');
    });

    it('devuelve [] si solo hay texto', () => {
        expect(extractStepsFromText('Te lo explico en palabras y no dibujo nada.')).toEqual([]);
    });
});
