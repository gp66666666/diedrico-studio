/**
 * Prueba de punta a punta del proxy de IA desplegado.
 *
 * Crea un usuario QA, pide un ejercicio real y comprueba:
 *  - que responde DeepSeek (modelo y tokens reales),
 *  - que los pasos los entiende el parser de la app,
 *  - el orden prueba → créditos, el 402 sin saldo y el 413 sin cobrar.
 *
 *   ANON_KEY=... SERVICE_KEY=... node /tmp/e2e-ai.mjs
 */
import { SYSTEM_PROMPT, FUNCTION_DEFINITIONS } from '../src/features/ai-assistant/services/prompts';
import { extractStepsFromText } from '../src/features/ai-assistant/services/parseSteps';
import { EXERCISES } from '../src/data/exercises';

const BASE = 'https://zrfmltqfunizhudkekdc.supabase.co';
const ANON = process.env.ANON_KEY || '';
const SERVICE = process.env.SERVICE_KEY || '';
const FN = `${BASE}/functions/v1/ai-proxy`;

const SYSTEM = SYSTEM_PROMPT + '\n\nDEFINICIONES DE FUNCIONES DISPONIBLES (ÚSALAS):\n' + JSON.stringify(FUNCTION_DEFINITIONS);

const byName = new Map(FUNCTION_DEFINITIONS.map((d: any) => [d.name, d]));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function admin(path: string, init: RequestInit = {}) {
    const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
            apikey: SERVICE,
            Authorization: `Bearer ${SERVICE}`,
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function callAI(token: string, statement: string, opts: { maxTokens?: number; big?: boolean } = {}) {
    const content = opts.big ? statement + ' '.repeat(30000) + 'relleno' : statement;
    const t0 = Date.now();
    const res = await fetch(FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${token}` },
        body: JSON.stringify({
            model: 'deepseek-flash',
            messages: [
                { role: 'system', content: SYSTEM },
                { role: 'user', content },
            ],
            temperature: 0.1,
            max_tokens: opts.maxTokens ?? 2000,
        }),
    });
    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { /* no json */ }
    return {
        status: res.status,
        ms: Date.now() - t0,
        trialLeft: res.headers.get('x-ai-trial-left'),
        credits: res.headers.get('x-ai-credits'),
        data,
        text,
    };
}

function describe(step: any) {
    const p = step.params || {};
    const bits = Object.entries(p)
        .filter(([k]) => !['color', 'step_description'].includes(k))
        .map(([k, v]) => `${k}=${v}`)
        .join(' ');
    return `${step.name}(${bits})`;
}

const main = async () => {
    const email = `qa-ai-${Date.now()}@diedrico.test`;
    const password = 'QaTest2026!';

    const created = await admin('/auth/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, email_confirm: true }),
    });
    if (created.status >= 300) throw new Error('crear usuario: ' + JSON.stringify(created.body));
    const userId = created.body.id;
    console.log('usuario QA:', userId);

    const login = await admin('/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ email, password }),
    });
    if (login.status >= 300) throw new Error('login: ' + JSON.stringify(login.body));
    const token = login.body.access_token;
    console.log('login OK\n');

    const ex = EXERCISES[1]; // intersección recta-plano
    console.log(`--- Mensaje 1 (prueba gratuita) — ${ex.slug} ---`);
    const r1 = await callAI(token, ex.statement);
    const steps = r1.data?.choices?.[0]?.message?.content
        ? extractStepsFromText(r1.data.choices[0].message.content)
        : [];
    const unknown = steps.filter((s) => !byName.has(s.name));
    const missing = steps.flatMap((s: any) => {
        const req: string[] = (byName.get(s.name) as any)?.parameters?.required ?? [];
        return req.filter((k) => s.params[k] === undefined || s.params[k] === '').map((k) => `${s.name}.${k}`);
    });
    console.log(`  HTTP ${r1.status} · ${(r1.ms / 1000).toFixed(1)}s · modelo ${r1.data?.model} · prueba restante ${r1.trialLeft}`);
    console.log(`  tokens: ${JSON.stringify(r1.data?.usage ?? null)}`);
    console.log(`  pasos: ${steps.length} · desconocidos: ${unknown.length} · sin parámetros: ${missing.length}`);
    steps.forEach((s, i) => console.log(`    ${i + 1}. ${describe(s)}`));
    if (unknown.length) console.log('    ✗ herramientas desconocidas:', unknown.map((s) => s.name).join(', '));
    if (missing.length) console.log('    ✗ faltan:', missing.join(', '));

    console.log('\n--- Mensaje 2 (mismo prompt: caché) ---');
    const r2 = await callAI(token, ex.statement);
    console.log(`  HTTP ${r2.status} · ${(r2.ms / 1000).toFixed(1)}s · prueba restante ${r2.trialLeft} · cached ${r2.data?.usage?.prompt_cache_hit_tokens ?? '?'}`);

    console.log('\n--- Mensaje 3 (última prueba) ---');
    const r3 = await callAI(token, ex.statement);
    console.log(`  HTTP ${r3.status} · prueba restante ${r3.trialLeft} · créditos ${r3.credits}`);

    console.log('\n--- Mensaje 4 (prueba agotada, sin saldo) ---');
    const r4 = await callAI(token, ex.statement);
    console.log(`  HTTP ${r4.status} · ${r4.data?.error?.code ?? ''} ${r4.data?.error?.message ?? ''}`);

    console.log('\n--- Recarga 2 créditos y mensaje 5 ---');
    const add = await admin('/rest/v1/rpc/add_credits', {
        method: 'POST',
        body: JSON.stringify({ p_user: userId, p_amount: 2, p_reason: 'qa_test', p_ref: null }),
    });
    console.log('  add_credits →', add.status, JSON.stringify(add.body));
    const r5 = await callAI(token, ex.statement);
    console.log(`  HTTP ${r5.status} · créditos tras el mensaje ${r5.credits} · pasos ${r5.data?.choices?.[0]?.message?.content ? extractStepsFromText(r5.data.choices[0].message.content).length : 0}`);

    console.log('\n--- Mensaje 6 (30.000 caracteres: 413 y devolución) ---');
    const r6 = await callAI(token, ex.statement, { big: true });
    console.log(`  HTTP ${r6.status} · ${r6.data?.error?.message ?? ''} · créditos ${r6.credits}`);

    // Limpieza: el perfil primero (la FK no tiene cascade) y luego el usuario.
    await sleep(300);
    await admin(`/rest/v1/profiles?id=eq.${userId}`, { method: 'DELETE' });
    const del = await admin(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' });
    console.log('\nlimpieza:', del.status);
};

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
