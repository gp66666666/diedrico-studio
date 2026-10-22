/**
 * Prueba de punta a punta del webhook de Lemon Squeezy, sin tienda real.
 *
 *   SERVICE_KEY=... LEMON_SECRET=... node scripts/check-lemon-webhook.mjs
 *
 * 1. Crea un usuario QA.
 * 2. Manda un `order_created` firmado → debe acreditar 100 consultas.
 * 3. Lo repite (reintento del webhook) → no debe sumar otras 100.
 * 4. Manda una firma falsa → 401 y saldo intacto.
 * 5. Variante desconocida → 200 ok:false, sin tocar el saldo.
 * 6. Borra el usuario.
 */
import { createHmac, randomUUID } from 'node:crypto';

const BASE = 'https://zrfmltqfunizhudkekdc.supabase.co';
const SERVICE = process.env.SERVICE_KEY;
const SECRET = process.env.LEMON_SECRET;
const ANON = process.env.ANON_KEY;

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
    return { status: res.status, body };
};

const send = async (payload, { badSignature = false } = {}) => {
    const raw = JSON.stringify(payload);
    const signature = badSignature
        ? 'deadbeef'.repeat(8)
        : createHmac('sha256', SECRET).update(raw).digest('hex');
    const res = await fetch(`${BASE}/functions/v1/lemonsqueezy-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Signature': signature },
        body: raw,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
};

const creditsOf = async (userId) => {
    const res = await admin(`/rest/v1/profiles?id=eq.${userId}&select=credits`);
    return res.body?.[0]?.credits ?? null;
};

const order = (userId, variantId, orderId) => ({
    meta: {
        event_name: 'order_created',
        custom_data: { user_id: userId },
    },
    data: {
        id: orderId,
        attributes: {
            user_email: `qa-lemon-${userId.slice(0, 8)}@diedrico.test`,
            total: 499,
            first_order_item: { variant_id: variantId, product_id: 1 },
        },
    },
});

const main = async () => {
    const email = `qa-lemon-${Date.now()}@diedrico.test`;
    const password = `Qa-${randomUUID()}Aa1!`;
    const created = await admin('/auth/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, email_confirm: true }),
    });
    if (created.status >= 300) throw new Error(JSON.stringify(created.body));
    const userId = created.body.id;

    const orderId = `test-${Date.now()}`;
    const payload = order(userId, '111', orderId);

    const first = await send(payload);
    const afterFirst = await creditsOf(userId);
    const retry = await send(payload);
    const afterRetry = await creditsOf(userId);
    const forged = await send(payload, { badSignature: true });
    const afterForged = await creditsOf(userId);
    const unknown = await send(order(userId, '999', `test-${Date.now()}-x`));
    const afterUnknown = await creditsOf(userId);

    console.table([
        { paso: '1º pedido', http: first.status, saldo: afterFirst },
        { paso: 'reintento', http: retry.status, saldo: afterRetry },
        { paso: 'firma falsa', http: forged.status, saldo: afterForged },
        { paso: 'variante desconocida', http: unknown.status, saldo: afterUnknown },
    ]);

    await admin(`/rest/v1/profiles?id=eq.${userId}`, { method: 'DELETE' });
    await admin(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' });

    const ok =
        afterFirst === 100 &&
        afterRetry === 100 &&
        afterForged === 100 &&
        afterUnknown === 100 &&
        forged.status === 401;
    console.log(ok ? '\n✅ WEBHOOK CORRECTO (acredita una vez, firma verificada)' : '\n❌ REVISAR');
    process.exit(ok ? 0 : 1);
};

main().catch((e) => { console.error(e); process.exit(1); });
