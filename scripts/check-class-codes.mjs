/**
 * Prueba del sistema de códigos de clase (Pack Profesor), sin tienda real.
 *
 *   ANON_KEY=... SERVICE_KEY=... node scripts/check-class-codes.mjs
 *
 * Crea un profesor y un alumno QA, inserta un código como lo haría el webhook,
 * y comprueba: canje correcto, canje repetido rechazado, código inexistente,
 * contador de usos y saldo. Borra todo al terminar.
 */
import { randomUUID } from 'node:crypto';

const BASE = 'https://zrfmltqfunizhudkekdc.supabase.co';
const ANON = process.env.ANON_KEY;
const SERVICE = process.env.SERVICE_KEY;

/** Con la service key: para administración y escrituras directas. */
const call = async (path, init = {}) => {
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
    return { status: res.status, body };
};

/** Como un usuario normal (JWT de sesión + anon key): así se prueba RLS y la RPC. */
const asUser = async (token, path, init = {}) => {
    const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
            apikey: ANON,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
    });
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    return { status: res.status, body };
};

const createUser = async (prefix) => {
    const email = `${prefix}-${Date.now()}@diedrico.test`;
    const password = `Qa-${randomUUID()}Aa1!`;
    const created = await call('/auth/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, email_confirm: true }),
    });
    if (created.status >= 300) throw new Error(JSON.stringify(created.body));
    const login = await asUser(ANON, '/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    return { id: created.body.id, token: login.body.access_token, email };
};

const main = async () => {
    const teacher = await createUser('qa-profe');
    const student = await createUser('qa-alumno');

    const code = 'PROFE-TEST' + Math.floor(Math.random() * 9000 + 1000);
    const expires = new Date(Date.now() + 180 * 86400 * 1000).toISOString();
    const inserted = await call('/rest/v1/class_codes', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
            code,
            owner_id: teacher.id,
            credits_per_student: 150,
            max_uses: 40,
            expires_at: expires,
            order_ref: `test:${Date.now()}`,
        }),
    });
    if (inserted.status >= 300) throw new Error(JSON.stringify(inserted.body));

    const redeem = (token, p_code) =>
        asUser(token, '/rest/v1/rpc/redeem_class_code', {
            method: 'POST',
            body: JSON.stringify({ p_code }),
        });

    const first = await redeem(student.token, code);
    const again = await redeem(student.token, code);
    const missing = await redeem(student.token, 'PROFE-NOEXISTE');
    const ownCode = await redeem(student.token, code.toLowerCase()); // ya usado, pero en minúsculas
    const credits = await call(`/rest/v1/profiles?id=eq.${student.id}&select=credits`);
    const used = await call(`/rest/v1/class_codes?code=eq.${code}&select=uses`);

    console.table([
        { paso: 'canje', http: first.status, ok: first.body?.ok, consultas: first.body?.credits },
        { paso: 'repetido', http: again.status, ok: again.body?.ok, motivo: again.body?.reason },
        { paso: 'inexistente', http: missing.status, ok: missing.body?.ok, motivo: missing.body?.reason },
        { paso: 'minúsculas', http: ownCode.status, ok: ownCode.body?.ok, motivo: ownCode.body?.reason },
    ]);
    console.log('saldo del alumno:', credits.body?.[0]?.credits, '| usos del código:', used.body?.[0]?.uses);

    await call(`/rest/v1/class_codes?owner_id=eq.${teacher.id}`, { method: 'DELETE' });
    await call(`/rest/v1/class_codes?owner_id=eq.${student.id}`, { method: 'DELETE' });
    for (const u of [teacher.id, student.id]) {
        await call(`/rest/v1/profiles?id=eq.${u}`, { method: 'DELETE' });
        await call(`/auth/v1/admin/users/${u}`, { method: 'DELETE' });
    }

    const ok =
        first.body?.ok === true &&
        first.body?.credits === 150 &&
        credits.body?.[0]?.credits === 150 &&
        again.body?.ok === false && again.body?.reason === 'already_used' &&
        missing.body?.ok === false && missing.body?.reason === 'not_found' &&
        used.body?.[0]?.uses === 1;
    console.log(ok ? '\n✅ CÓDIGOS DE CLASE CORRECTOS' : '\n❌ REVISAR');
    process.exit(ok ? 0 : 1);
};

main().catch((e) => { console.error(e); process.exit(1); });
