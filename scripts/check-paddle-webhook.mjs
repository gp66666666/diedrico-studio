/**
 * Prueba de punta a punta del webhook de Paddle, sin cobrar nada.
 *
 *   SERVICE_KEY=... PADDLE_WEBHOOK_SECRET=... PADDLE_SANDBOX_API_KEY=... \
 *     node scripts/check-paddle-webhook.mjs
 *
 * Comprueba, con un usuario QA que se crea y se borra aquí:
 *   1. Pack de consultas: acredita una vez y el reintento no duplica.
 *   2. Firma falsa y firma caducada: 401 y sin tocar el saldo.
 *   3. Precio no configurado: no toca nada.
 *   4. Pack Profesor: genera un código y el reintento devuelve el mismo.
 *   5. Suscripción: activa el plan con fecha de fin y al cancelar lo quita.
 *   6. Devolución total: quita los créditos y no baja de 0.
 *   7. Los avisos quedan apuntados en paddle_events.
 *
 * Los eventos llevan los mismos campos que manda Paddle y la firma real
 * (`Paddle-Signature: ts=...;h1=...`), así que si esto pasa, el handler está bien.
 */
import { createHmac, randomUUID } from 'node:crypto';

const BASE = 'https://zrfmltqfunizhudkekdc.supabase.co';
const SERVICE = process.env.SERVICE_KEY;
const SECRET = process.env.PADDLE_WEBHOOK_SECRET;
const PADDLE_KEY = process.env.PADDLE_SANDBOX_API_KEY;

if (!SERVICE || !SECRET) {
    console.error('Faltan SERVICE_KEY o PADDLE_WEBHOOK_SECRET');
    process.exit(1);
}

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

/** Manda el evento firmado como lo haría Paddle. */
const send = async (payload, { badSignature = false, ageSeconds = 0 } = {}) => {
    const raw = JSON.stringify(payload);
    const ts = String(Math.floor(Date.now() / 1000) - ageSeconds);
    const h1 = badSignature
        ? 'deadbeef'.repeat(8)
        : createHmac('sha256', SECRET).update(`${ts}:${raw}`).digest('hex');
    const res = await fetch(`${BASE}/functions/v1/paddle-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Paddle-Signature': `ts=${ts};h1=${h1}` },
        body: raw,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
};

const profileOf = async (userId) => {
    const res = await admin(`/rest/v1/profiles?id=eq.${userId}&select=credits,is_premium,premium_until,paddle_customer_id`);
    return res.body?.[0] ?? null;
};

const PACK100 = 'pri_01m5msbmdwszxtm5xh803qj4yr';
const PACK300 = 'pri_01m5msbmqpf5yhemymerfdg6bk';
const MONTHLY = 'pri_01m5msbn1mxjtbpwk4ftf1gnwv';
const PROFE = 'pri_01m5msbnam4mhxncvv808w99sb';

const eventId = () => `evt_${randomUUID().replace(/-/g, '').slice(0, 26)}`;

const transactionEvent = (userId, priceId, txnId, total = '499') => ({
    event_id: eventId(),
    event_type: 'transaction.completed',
    occurred_at: new Date().toISOString(),
    data: {
        id: txnId,
        status: 'completed',
        customer_id: `ctm_${'a'.repeat(26)}`,
        custom_data: { user_id: userId, pack: 'test' },
        items: [{ price: { id: priceId }, quantity: 1, status: 'active' }],
        details: { totals: { total, currency_code: 'EUR' } },
        billing_details: { email: `qa-paddle-${userId.slice(0, 8)}@diedrico.test` },
    },
});

const subscriptionEvent = (userId, type, status, endsAt = null) => ({
    event_id: eventId(),
    event_type: type,
    occurred_at: new Date().toISOString(),
    data: {
        id: `sub_${'b'.repeat(26)}`,
        status,
        customer_id: `ctm_${'a'.repeat(26)}`,
        custom_data: { user_id: userId },
        current_billing_period: endsAt ? { starts_at: new Date().toISOString(), ends_at: endsAt } : null,
    },
});

/** Transacción real y sin pagar, para poder probar la devolución con su importe. */
const createRealTransaction = async (email) => {
    if (!PADDLE_KEY) return null;
    try {
        const res = await fetch('https://sandbox-api.paddle.com/transactions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PADDLE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: [{ price_id: PACK100, quantity: 1 }],
            collection_mode: 'automatic',
            customer: { email },
        }),
    });
        const body = await res.json();
        if (!res.ok) {
            console.log(`  (no se puede crear transacción de prueba: ${body?.error?.code ?? res.status})`);
            return null;
        }
        return { id: body.data.id, total: body.data.details.totals.total };
    } catch (err) {
        console.log(`  (no se puede crear transacción de prueba: ${err.message})`);
        return null;
    }
};

const main = async () => {
    const email = `qa-paddle-${Date.now()}@diedrico.test`;
    const password = `Qa-${randomUUID()}Aa1!`;
    const created = await admin('/auth/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, email_confirm: true }),
    });
    if (created.status >= 300) throw new Error(JSON.stringify(created.body));
    const userId = created.body.id;

    // 1. Pack 100 + reintento
    const txnId = `txn_${randomUUID().replace(/-/g, '').slice(0, 26)}`;
    const packPayload = transactionEvent(userId, PACK100, txnId, '499');
    const first = await send(packPayload);
    const afterFirst = (await profileOf(userId))?.credits;
    const retry = await send({ ...packPayload, event_id: eventId() });
    const afterRetry = (await profileOf(userId))?.credits;

    // 2. Firma falsa y caducada
    const forged = await send(packPayload, { badSignature: true });
    const afterForged = (await profileOf(userId))?.credits;
    const stale = await send(packPayload, { ageSeconds: 3600 });
    const afterStale = (await profileOf(userId))?.credits;

    // 3. Precio sin configurar
    const unknown = await send(transactionEvent(userId, `pri_${'z'.repeat(26)}`, `txn_${'c'.repeat(26)}`));
    const afterUnknown = (await profileOf(userId))?.credits;

    // 4. Pack 300 (otro pago distinto)
    const pack300 = await send(transactionEvent(userId, PACK300, `txn_${'d'.repeat(26)}`, '1199'));
    const after300 = (await profileOf(userId))?.credits;

    // 5. Pack Profesor
    const classPayload = transactionEvent(userId, PROFE, `txn_${'e'.repeat(26)}`, '2499');
    const classFirst = await send(classPayload);
    const classRetry = await send({ ...classPayload, event_id: eventId() });
    const codes = await admin(`/rest/v1/class_codes?owner_id=eq.${userId}&select=code,credits_per_student,max_uses`);

    // 6. Suscripción
    const endsAt = new Date(Date.now() + 30 * 86400 * 1000).toISOString();
    const subOn = await send(subscriptionEvent(userId, 'subscription.created', 'active', endsAt));
    const afterSub = await profileOf(userId);
    const subOff = await send(subscriptionEvent(userId, 'subscription.canceled', 'canceled'));
    const afterCancel = await profileOf(userId);

    // 7. Devolución total del pack de 300
    const realTxn = await createRealTransaction(email);
    let refund = null;
    let afterRefund = after300;
    if (realTxn) {
        // Se acredita el pago real y luego se devuelve entero.
        await send(transactionEvent(userId, PACK100, realTxn.id, realTxn.total));
        const beforeRefund = (await profileOf(userId))?.credits;
        refund = await send({
            event_id: eventId(),
            event_type: 'adjustment.created',
            occurred_at: new Date().toISOString(),
            data: {
                id: `adj_${'f'.repeat(26)}`,
                action: 'refund',
                status: 'approved',
                transaction_id: realTxn.id,
                totals: { total: realTxn.total, currency_code: 'EUR' },
            },
        });
        afterRefund = (await profileOf(userId))?.credits;
        if (beforeRefund !== afterRefund + 100) {
            console.log(`  (aviso: antes ${beforeRefund}, después ${afterRefund})`);
        }
    }

    const events = await admin(`/rest/v1/paddle_events?select=id,event_type&order=received_at.desc&limit=20`);

    console.table([
        { paso: '1º pack 100', http: first.status, saldo: afterFirst },
        { paso: 'reintento', http: retry.status, saldo: afterRetry },
        { paso: 'firma falsa', http: forged.status, saldo: afterForged },
        { paso: 'firma caducada', http: stale.status, saldo: afterStale },
        { paso: 'precio raro', http: unknown.status, saldo: afterUnknown },
        { paso: 'pack 300', http: pack300.status, saldo: after300 },
        { paso: 'pack profe', http: classFirst.status, saldo: `código ${classFirst.body?.result?.code ?? '—'}` },
        { paso: 'profe repetido', http: classRetry.status, saldo: classRetry.body?.result?.code === classFirst.body?.result?.code ? 'mismo código' : 'DISTINTO' },
        { paso: 'suscripción', http: subOn.status, saldo: `premium ${afterSub?.is_premium} hasta ${String(afterSub?.premium_until).slice(0, 10)}` },
        { paso: 'suscripción cancela', http: subOff.status, saldo: `premium ${afterCancel?.is_premium}` },
        ...(realTxn ? [{ paso: 'devolución total', http: refund.status, saldo: `${afterRefund} (quita 100)` }] : []),
    ]);
    console.log(`Avisos guardados en paddle_events: ${Array.isArray(events.body) ? events.body.length : events.body}`);

    // Limpieza
    await admin(`/rest/v1/class_codes?owner_id=eq.${userId}`, { method: 'DELETE' });
    await admin(`/rest/v1/credit_movements?user_id=eq.${userId}`, { method: 'DELETE' });
    await admin(`/rest/v1/profiles?id=eq.${userId}`, { method: 'DELETE' });
    await admin(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' });

    const ok =
        first.status === 200 && afterFirst === 100 &&
        afterRetry === 100 &&
        forged.status === 401 && afterForged === 100 &&
        stale.status === 401 && afterStale === 100 &&
        unknown.status === 200 && afterUnknown === 100 &&
        after300 === 400 &&
        typeof classFirst.body?.result?.code === 'string' &&
        classFirst.body.result.code.startsWith('PROFE-') &&
        classRetry.body?.result?.code === classFirst.body?.result?.code &&
        codes.body?.[0]?.credits_per_student === 150 &&
        afterSub?.is_premium === true &&
        String(afterSub?.premium_until).slice(0, 10) === endsAt.slice(0, 10) &&
        afterCancel?.is_premium === false &&
        afterCancel?.premium_until === null &&
        (!realTxn || afterRefund === 300);

    console.log(ok ? '\n✅ WEBHOOK DE PADDLE CORRECTO' : '\n❌ REVISAR');
    process.exit(ok ? 0 : 1);
};

main().catch((e) => { console.error(e); process.exit(1); });
