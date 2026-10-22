/**
 * Comprueba el límite gratuito del asistente (5 cada 24 h) y el aviso final.
 *
 *   ANON_KEY=... SERVICE_KEY=... node /tmp/check-limit.mjs
 *
 * Crea un usuario QA nuevo (nadie más se ve afectado), manda 6 mensajes cortos y
 * comprueba que el 6.º devuelve 429 con código `daily_limit`. Borra el usuario.
 */
const BASE = 'https://zrfmltqfunizhudkekdc.supabase.co';
const ANON = process.env.ANON_KEY;
const SERVICE = process.env.SERVICE_KEY;

const admin = async (path, init = {}) => {
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
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    return { status: res.status, body, headers: res.headers };
};

const main = async () => {
    const email = `qa-limit-${Date.now()}@diedrico.test`;
    const password = `Qa-${crypto.randomUUID()}Aa1!`;
    const created = await admin('/auth/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, email_confirm: true }),
    });
    if (created.status >= 300) throw new Error('crear usuario: ' + JSON.stringify(created.body));
    const userId = created.body.id;

    const login = await admin('/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ email, password }),
    });
    const token = login.body.access_token;

    const ask = async (n) => {
        const res = await fetch(`${BASE}/functions/v1/ai-proxy`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                apikey: ANON,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek-flash',
                messages: [{ role: 'user', content: 'Responde solo: ok' }],
                max_tokens: 5,
            }),
        });
        const text = await res.text();
        return {
            n,
            status: res.status,
            trialLeft: res.headers.get('x-ai-trial-left'),
            code: (() => { try { return JSON.parse(text).error?.code; } catch { return undefined; } })(),
            message: (() => { try { return JSON.parse(text).error?.message; } catch { return undefined; } })(),
        };
    };

    const results = [];
    for (let i = 1; i <= 6; i++) results.push(await ask(i));
    console.table(results.map(({ n, status, trialLeft, code }) => ({ n, status, trialLeft, code })));
    console.log('\nMensaje del 6.º:', results[5].message);

    await admin(`/rest/v1/profiles?id=eq.${userId}`, { method: 'DELETE' });
    await admin(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' });

    const ok =
        results.slice(0, 5).every((r) => r.status === 200) &&
        results[5].status === 429 &&
        results[5].code === 'daily_limit';
    console.log(ok ? '\n✅ LÍMITE CORRECTO (5 gratis y el 6.º bloqueado)' : '\n❌ REVISAR');
    process.exit(ok ? 0 : 1);
};

main().catch((e) => { console.error(e); process.exit(1); });
