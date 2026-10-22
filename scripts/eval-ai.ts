/**
 * Evaluación del asistente contra la API real de DeepSeek.
 *
 * Usa el MISMO prompt de sistema y las MISMAS definiciones de funciones que la
 * app, y comprueba con el parser real si los pasos son ejecutables.
 *
 *   DEEPSEEK_API_KEY=... node /tmp/eval-ai.mjs
 */
import { SYSTEM_PROMPT, FUNCTION_DEFINITIONS } from '../src/features/ai-assistant/services/prompts';
import { extractStepsFromText } from '../src/features/ai-assistant/services/parseSteps';
import { EXERCISES } from '../src/data/exercises';

const KEY = process.env.DEEPSEEK_API_KEY || '';
const URL = 'https://api.deepseek.com/chat/completions';
const MODEL = process.env.EVAL_MODEL || 'deepseek-flash';

// Precios oficiales (hora punta, $/M): flash
const P_IN_MISS = 0.3;
const P_IN_HIT = 0.006;
const P_OUT = 1.2;
const FX = 0.92;

const SYSTEM = SYSTEM_PROMPT + '\n\nDEFINICIONES DE FUNCIONES DISPONIBLES (ÚSALAS):\n' + JSON.stringify(FUNCTION_DEFINITIONS);

const byName = new Map(FUNCTION_DEFINITIONS.map((d: any) => [d.name, d]));
const KNOWN = new Set(byName.keys());
const STANDARD = new Set(['H', 'V', 'LT', 'PH', 'PV', 'H′', 'V′']);

interface Outcome {
    slug: string;
    ok: boolean;
    steps: number;
    json: boolean;
    unknown: string[];
    missing: string[];
    dangling: string[];
    ms: number;
    tokensIn: number;
    tokensOut: number;
    cost: number;
    text: string;
}

async function ask(system: string, prompt: string, thinking: 'enabled' | 'disabled') {
    const body: any = {
        model: MODEL,
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        stream: false,
    };
    if (thinking === 'disabled') {
        body.thinking = { type: 'disabled' };
        body.temperature = 0.1;
    } else {
        body.thinking = { type: 'enabled' };
        body.reasoning_effort = 'low';
    }

    const t0 = Date.now();
    const res = await fetch(URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const ms = Date.now() - t0;
    if (!res.ok) {
        return { error: `${res.status} ${(await res.text()).slice(0, 200)}`, ms, text: '', usage: null as any };
    }
    const data: any = await res.json();
    return { error: null, ms, text: data.choices[0].message.content as string, usage: data.usage, reasoning: data.choices[0].message.reasoning_content };
}

function validate(slug: string, text: string, usage: any, ms: number): Outcome {
    const raw = extractStepsFromText(text);
    const unknown: string[] = [];
    const missing: string[] = [];
    const dangling: string[] = [];
    const created = new Set<string>(STANDARD);

    for (const step of raw) {
        const def: any = byName.get(step.name);
        if (!def) {
            unknown.push(step.name);
            continue;
        }
        const required: string[] = def.parameters?.required || [];
        for (const key of required) {
            if (step.params[key] === undefined || step.params[key] === '') missing.push(`${step.name}.${key}`);
        }

        // Referencias a elementos anteriores (el ejecutor resuelve por nombre)
        for (const key of ['point_name', 'reference_line_name', 'plane_name', 'line_name', 'point1', 'point2']) {
            const value = step.params[key];
            if (typeof value === 'string' && !created.has(value)) dangling.push(`${step.name}.${key}=${value}`);
        }
        if (typeof step.params.name === 'string') created.add(step.params.name);
    }

    const tokensIn = usage?.prompt_tokens ?? 0;
    const tokensOut = usage?.completion_tokens ?? 0;
    const hit = usage?.prompt_cache_hit_tokens ?? 0;
    const miss = usage?.prompt_cache_miss_tokens ?? Math.max(0, tokensIn - hit);
    const cost = (miss * P_IN_MISS + hit * P_IN_HIT + tokensOut * P_OUT) / 1e6;

    return {
        slug,
        ok: raw.length > 0 && unknown.length === 0 && missing.length === 0,
        steps: raw.length,
        json: raw.length > 0,
        unknown,
        missing,
        dangling,
        ms,
        tokensIn,
        tokensOut,
        cost: cost * FX,
        text,
    };
}

async function run(label: string, thinking: 'enabled' | 'disabled', limit: number) {
    const list = EXERCISES.slice(0, limit);
    console.log(`\n=== ${label} (${MODEL}, thinking ${thinking}) ===`);
    const results: Outcome[] = [];

    for (const ex of list) {
        const r = await ask(SYSTEM, ex.statement, thinking);
        if (r.error) {
            console.log(`  ✗ ${ex.slug}: ${r.error}`);
            continue;
        }
        const v = validate(ex.slug, r.text, r.usage, r.ms);
        results.push(v);
        const flags = [
            v.ok ? '✓' : '✗',
            `${v.steps} pasos`,
            `${(v.ms / 1000).toFixed(1)}s`,
            `${v.tokensOut} out`,
            `${(v.cost * 100).toFixed(2)} cént`,
        ];
        if (v.unknown.length) flags.push(`desconocida: ${v.unknown.join(',')}`);
        if (v.missing.length) flags.push(`faltan: ${v.missing.join(',')}`);
        if (v.dangling.length) flags.push(`refs: ${v.dangling.join(',')}`);
        console.log(`  ${flags.join(' | ')}  ${ex.slug}`);
        if (!v.ok) console.log('    ' + v.text.replace(/\s+/g, ' ').slice(0, 300));
    }

    const ok = results.filter((r) => r.ok).length;
    const total = results.length;
    const cost = results.reduce((a, r) => a + r.cost, 0);
    const avgMs = results.reduce((a, r) => a + r.ms, 0) / Math.max(1, total);
    const avgOut = results.reduce((a, r) => a + r.tokensOut, 0) / Math.max(1, total);
    console.log(`  → ${ok}/${total} válidos · ${(avgMs / 1000).toFixed(1)}s de media · ${avgOut.toFixed(0)} tokens salida · ${(cost * 100).toFixed(2)} céntimos en total`);
    return results;
}

const main = async () => {
    if (!KEY) {
        console.error('Falta DEEPSEEK_API_KEY');
        process.exit(1);
    }
    const limit = Number(process.env.EVAL_LIMIT || 12);
    const only = process.env.EVAL_ONLY;
    const first = only === 'on' ? [] : await run('Sin razonamiento', 'disabled', limit);
    const second = only === 'off' ? [] : await run('Con razonamiento (low)', 'enabled', limit);
    const a = first.filter((r) => r.ok).length;
    const b = second.filter((r) => r.ok).length;
    console.log(`\nResumen: sin razonamiento ${a}/${first.length} · con razonamiento ${b}/${second.length}`);
};

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
