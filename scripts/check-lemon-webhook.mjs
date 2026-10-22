/**
 * Prueba de punta a punta del webhook de Lemon Squeezy, sin tienda real.
 *
 *   SERVICE_KEY=... ANON_KEY=... LEMON_SECRET=... node scripts/check-lemon-webhook.mjs
 *
 * Comprueba, con un usuario QA:
 *   1. Pack de consultas: acredita una vez y el reintento no duplica.
 *   2. Firma falsa: 401 y sin tocar el saldo.
 *   3. Variante desconocida: no toca nada.
 *   4. Pack Profesor: genera un código y el reintento devuelve el mismo.
 *   5. Suscripción: activa el plan, y al expirar lo quita.
 *
 * Requiere las variantes de prueba configuradas en la función:
 *   LEMON_VARIANT_CREDITS={"111":100}
 *   LEMON_CLASS_VARIANTS={"333":{"perStudent":150,"maxUses":40,"months":6}}
 *   LEMON_SUBSCRIPTION_VARIANTS=["444"]
 */
import { createHmac, randomUUID } from 'node:crypto';

const BASE = 'https://zrfmltqfunizhudkekdc.supabase.co';
const SERVICE = process.env.SERVICE_KEY;
const ANON = process.env.ANON_KEY;
const SECRET = process.env.LEMON_SECRET;

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

const profileOf = async (userId) => {
    const res = await admin(`/rest/v1/profiles?id=eq.${userId}&select=credits,is_premium,premium_until`);
    return res.body?.[0] ?? null;
};

const order = (userId, variantId, orderId) => ({
    meta: { event_name: 'order_created', custom_data: { user_id: userId } },
    data: {
        id: orderId,
        attributes: {
            user_email: `qa-lemon-${userId.slice(0, 8)}@diedrico.test`,
            total: 499,
            first_order_item: { variant_id: variantId, product_id: 1 },
        },
    },
});

const subscription = (userId, variantId, eventName, renewsAt = null) => ({
    meta: { event_name: eventName, custom_data: { user_id: userId } },
    data: {
        id: `sub-${variantId}`,
        attributes: {
            variant_id: variantId,
            status: eventName === 'subscription_expired' ? 'expired' : 'active',
            user_email: `qa-lemon-${userId.slice(0, 8)}@diedrico.test`,
            renews_at: renewsAt,
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

    // 1-3. Packs de consultas
    const orderId = `test-${Date.now()}`;
    const packPayload = order(userId, '111', orderId);
    const first = await send(packPayload);
    const afterFirst = (await profileOf(userId))?.credits;
    await send(packPayload);
    const afterRetry = (await profileOf(userId))?.credits;
    const forged = await send(packPayload, { badSignature: true });
    const afterForged = (await profileOf(userId))?.credits;
    await send(order(userId, '999', `test-${Date.now()}-x`));
    const afterUnknown = (await profileOf(userId))?.credits;

    // 4. Pack Profesor → código de clase
    const classOrderId = `test-class-${Date.now()}`;
    const classPayload = order(userId, '333', classOrderId);
    const classFirst = await send(classPayload);
    const classRetry = await send(classPayload);
    const codeRows = await admin(`/rest/v1/class_codes?owner_id=eq.${userId}&select=code,credits_per_student,uses`);

    // 5. Suscripción → plan activo y, al expirar, fuera
    const renews = new Date(Date.now() + 30 * 86400 * 1000).toISOString();
    const subOn = await send(subscription(userId, '444', 'subscription_created', renews));
    const afterSub = await profileOf(userId);
    const subOff = await send(subscription(userId, '444', 'subscription_expired'));
    const afterExpire = await profileOf(userId);

    console.table([
        { paso: '1º pack', http: first.status, saldo: afterFirst },
        { paso: 'reintento', http: 200, saldo: afterRetry },
        { paso: 'firma falsa', http: forged.status, saldo: afterForged },
        { paso: 'variante rara', http: 200, saldo: afterUnknown },
        { paso: 'pack profe', http: classFirst.status, saldo: `código ${classFirst.body?.code ?? '—'}` },
        { paso: 'profe repetido', http: classRetry.status, saldo: classRetry.body?.code === classFirst.body?.code ? 'mismo código' : 'DISTINTO' },
        { paso: 'suscripción', http: subOn.status, saldo: `premium ${afterSub?.is_premium}` },
        { paso: 'suscripción expira', http: subOff.status, saldo: `premium ${afterExpire?.is_premium}` },
    ]);

    await admin(`/rest/v1/class_codes?owner_id=eq.${userId}`, { method: 'DELETE' });
    await admin(`/rest/v1/profiles?id=eq.${userId}`, { method: 'DELETE' });
    await admin(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' });

    const ok =
        afterFirst === 100 && afterRetry === 100 && afterForged === 100 && afterUnknown === 100 &&
        forged.status === 401 &&
        typeof classFirst.body?.code === 'string' && classFirst.body.code.startsWith('PROFE-') &&
        classRetry.body?.code === classFirst.body?.code &&
        codeRows.body?.[0]?.credits_per_student === 150 &&
        afterSub?.is_premium === true &&
        afterExpire?.is_premium === false;
    console.log(ok ? '\n✅ WEBHOOK CORRECTO (packs, códigos y suscripción)' : '\n❌ REVISAR');
    process.exit(ok ? 0 : 1);
};

main().catch((e) => { console.error(e); process.exit(1); });
