/**
 * Extracción de pasos a partir de la respuesta del modelo.
 *
 * Vive aparte de `groq.ts` para poder probarla con respuestas reales de los
 * modelos (ver `__tests__/parseSteps.test.ts`) sin arrastrar el store ni el
 * gestor de colores.
 */

export interface RawStep {
    name: string;
    params: Record<string, any>;
}

const NUMERIC_KEYS = new Set([
    'x', 'y', 'z', 'radius', 'angle', 'distance', 'length', 'scale',
    'a', 'b', 'c', 'd', 'n1', 'n2', 'n3',
]);

/** Los modelos a veces mandan "1" en vez de 1; el store necesita números. */
export function coerceNumericParams(params: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = { ...params };

    for (const [key, value] of Object.entries(out)) {
        if (NUMERIC_KEYS.has(key) && typeof value === 'string' && value.trim() !== '') {
            const num = Number(value);
            if (!Number.isNaN(num)) out[key] = num;
        }
    }
    return out;
}

/**
 * El prompt describe las funciones con `parameters` (esquema tipo OpenAI), pero
 * el resto del código trabaja con `params`. Los modelos devuelven fielmente
 * `parameters`, así que sin esto no se reconocía ni un paso.
 */
export function normalizeStepItem(item: any): RawStep | null {
    if (!item || typeof item !== 'object') return null;

    const name = item.name ?? item.action ?? item.tool ?? item.function;
    const params = item.params ?? item.parameters ?? item.args ?? item.arguments;

    if (typeof name !== 'string' || !name || !params || typeof params !== 'object') return null;

    return { name, params: coerceNumericParams(params) };
}

function collectFromParsed(parsed: any, out: RawStep[]) {
    const items = Array.isArray(parsed) ? parsed : (parsed?.steps || parsed?.actions || [parsed]);
    if (!Array.isArray(items)) return;

    for (const item of items) {
        const normalized = normalizeStepItem(item);
        if (normalized) out.push(normalized);
    }
}

/**
 * Saca los pasos de la respuesta: primero bloques ```json```, después un JSON
 * suelto. Devuelve [] si no hay nada utilizable (el llamador decide el plan B).
 */
export function extractStepsFromText(text: string): RawStep[] {
    const steps: RawStep[] = [];

    // 1. Bloques de código (lo que pide el prompt)
    const codeBlockRegex = /```(?:json|JSON)?\s*([\s\S]*?)\s*```/g;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        const rawContent = match[1].trim();
        if (!rawContent.startsWith('{') && !rawContent.startsWith('[')) continue;
        try {
            collectFromParsed(JSON.parse(rawContent), steps);
        } catch {
            // bloque incompleto: se ignora y se prueba con el resto
        }
    }

    if (steps.length > 0) return steps;

    // 2. JSON suelto: desde el primer corchete hasta el último cierre
    const firstBracket = text.indexOf('[');
    const firstBrace = text.indexOf('{');
    let start = -1;
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) start = firstBracket;
    else if (firstBrace !== -1) start = firstBrace;

    if (start !== -1) {
        const end = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
        if (end > start) {
            try {
                collectFromParsed(JSON.parse(text.substring(start, end + 1)), steps);
            } catch {
                // nada utilizable
            }
        }
    }

    return steps;
}
