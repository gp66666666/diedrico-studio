// Edge Function: paddle-webhook
//
// Paddle es el vendedor (merchant of record): cobra el IVA y emite la factura.
// Aquí solo se recibe el aviso firmado y se acredita lo comprado:
//
//   · Packs de consultas (pago único) → add_credits, idempotente por transacción.
//   · Pack Profesor (pago único)      → código de clase (una vez por pedido).
//   · Plan mensual (suscripción)      → is_premium + premium_until (fin del periodo).
//   · Devoluciones (adjustments)      → refund_credits, sin bajar de 0.
//
// Seguridad:
//  - Firma `Paddle-Signature: ts=...;h1=...` = HMAC-SHA256 de "ts:cuerpo" con
//    PADDLE_WEBHOOK_SECRET. Se rechaza si el `ts` tiene más de 5 minutos.
//  - Idempotente: add_credits con `ref = paddle:<txn>`, class_codes.order_ref
//    único y refund_credits con `ref = paddle-refund:<adjustment>`.
//  - El catálogo (precio → créditos) vive en `PADDLE_CATALOG`, en el servidor.
//    Nunca se fía nada del importe que diga el navegador.
//
// Secretos: PADDLE_WEBHOOK_SECRET, PADDLE_API_KEY, PADDLE_ENV, PADDLE_CATALOG.
// Se despliega con --no-verify-jwt: Paddle no manda JWT de Supabase.

import {
    hmacHex,
    json,
    paddleGet,
    parseSignatureHeader,
    readCatalog,
    safeEqual,
    type CatalogEntry,
} from '../_shared/paddle.ts';

const MAX_SKEW_SECONDS = 5 * 60;

interface Profile {
    id: string;
    email: string | null;
    credits?: number;
    paddle_customer_id?: string | null;
}

function supabase() {
    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const headers = {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
    };

    const call = async (path: string, init: RequestInit = {}) => {
        const res = await fetch(`${url}${path}`, {
            ...init,
            headers: { ...headers, ...(init.headers ?? {}) },
        });
        const text = await res.text();
        let body: any = null;
        try {
            body = text ? JSON.parse(text) : null;
        } catch {
            body = text;
        }
        return { ok: res.ok, status: res.status, body };
    };

    return {
        headers,
        get: (path: string) => call(path),
        post: (path: string, body: unknown, prefer = 'return=representation') =>
            call(path, {
                method: 'POST',
                headers: { Prefer: prefer },
                body: JSON.stringify(body),
            }),
        patch: (path: string, body: unknown) =>
            call(path, {
                method: 'PATCH',
                headers: { Prefer: 'return=minimal' },
                body: JSON.stringify(body),
            }),
        rpc: (fn: string, args: unknown) =>
            call(`/rest/v1/rpc/${fn}`, { method: 'POST', body: JSON.stringify(args) }),
    };
}

/**
 * Cuenta del comprador, por orden de fiabilidad:
 *  1. `custom_data.user_id` (lo pone nuestro checkout, firmado por el servidor)
 *  2. `customer_id` de Paddle, ya vinculado antes
 *  3. email de facturación (suscripciones creadas a mano)
 */
async function findProfile(
    db: ReturnType<typeof supabase>,
    data: any
): Promise<Profile | null> {
    const customId = data?.custom_data?.user_id ?? null;
    const customerId = data?.customer_id ?? null;
    const email = String(
        data?.billing_details?.email ?? data?.customer?.email ?? ''
    )
        .trim()
        .toLowerCase();

    const query = async (filter: string) => {
        const res = await db.get(
            `/rest/v1/profiles?${filter}&select=id,email,credits,paddle_customer_id&limit=1`
        );
        const rows = Array.isArray(res.body) ? res.body : [];
        return rows[0] ?? null;
    };

    if (customId) {
        const byId = await query(`id=eq.${encodeURIComponent(customId)}`);
        if (byId) return byId;
    }
    if (customerId) {
        const byCustomer = await query(
            `paddle_customer_id=eq.${encodeURIComponent(customerId)}`
        );
        if (byCustomer) return byCustomer;
    }
    if (email) {
        const byEmail = await query(`email=eq.${encodeURIComponent(email)}`);
        if (byEmail) return byEmail;
    }
    return null;
}

/** Guarda el cliente de Paddle en el perfil (una vez) para casar avisos futuros. */
async function linkCustomer(
    db: ReturnType<typeof supabase>,
    profile: Profile,
    customerId: string | null
) {
    if (!customerId || profile.paddle_customer_id === customerId) return;
    await db.patch(`/rest/v1/profiles?id=eq.${profile.id}`, {
        paddle_customer_id: customerId,
    });
}

function newClassCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    return 'PROFE-' + [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
}

/** Pago único: créditos o código de clase. */
async function onTransactionCompleted(
    db: ReturnType<typeof supabase>,
    data: any,
    entry: CatalogEntry
): Promise<unknown> {
    const items = Array.isArray(data?.items) ? data.items : [];
    if (items.length !== 1) {
        return { ignored: `la transacción trae ${items.length} líneas` };
    }
    if (entry.subscription) {
        // El alta y la renovación llegan como subscription.*; aquí no se toca.
        return { ignored: 'suscripción: se gestiona con sus eventos' };
    }

    const txnId = String(data?.id ?? '');
    if (!txnId) return { ignored: 'transacción sin id' };

    const profile = await findProfile(db, data);
    if (!profile) {
        console.error('pago sin cuenta asociada', txnId, data?.customer_id);
        return { ignored: 'sin cuenta' };
    }
    await linkCustomer(db, profile, data?.customer_id ?? null);

    if (entry.class) {
        const orderRef = `paddle:${txnId}`;
        const existing = await db.get(
            `/rest/v1/class_codes?order_ref=eq.${encodeURIComponent(orderRef)}&select=code`
        );
        const rows = Array.isArray(existing.body) ? existing.body : [];
        if (rows.length > 0) return { code: rows[0].code, reused: true };

        const expires = new Date();
        expires.setMonth(expires.getMonth() + entry.class.months);
        const code = newClassCode();
        const created = await db.post(
            '/rest/v1/class_codes',
            {
                code,
                owner_id: profile.id,
                credits_per_student: entry.class.perStudent,
                max_uses: entry.class.maxUses,
                expires_at: expires.toISOString(),
                order_ref: orderRef,
            },
            'return=representation'
        );
        if (!created.ok) {
            throw new Error(`crear código: ${created.status} ${JSON.stringify(created.body)}`);
        }
        return {
            code,
            perStudent: entry.class.perStudent,
            maxUses: entry.class.maxUses,
            months: entry.class.months,
        };
    }

    const credits = Number(entry.credits ?? 0);
    if (!Number.isFinite(credits) || credits <= 0) {
        return { ignored: 'precio sin créditos configurados' };
    }

    const res = await db.rpc('add_credits', {
        p_user: profile.id,
        p_amount: credits,
        p_reason: `paddle:${txnId}`,
        p_ref: `paddle:${txnId}`,
    });
    if (!res.ok) {
        throw new Error(`add_credits: ${res.status} ${JSON.stringify(res.body)}`);
    }
    return { userId: profile.id, credits, balance: res.body };
}

/** Devolución: se quitan los créditos del pago, nunca por debajo de 0. */
async function onAdjustment(
    db: ReturnType<typeof supabase>,
    data: any
): Promise<unknown> {
    const action = String(data?.action ?? '');
    if (action !== 'refund') return { ignored: `acción ${action}` };
    if (String(data?.status ?? '') !== 'approved') {
        return { ignored: `estado ${data?.status}` };
    }

    const txnId = String(data?.transaction_id ?? '');
    const adjustmentId = String(data?.id ?? '');
    if (!txnId || !adjustmentId) return { ignored: 'ajuste incompleto' };

    // Qué se compró con esa transacción (y a quién).
    const movement = await db.get(
        `/rest/v1/credit_movements?ref=eq.${encodeURIComponent(`paddle:${txnId}`)}&select=user_id,delta&limit=1`
    );
    const rows = Array.isArray(movement.body) ? movement.body : [];
    if (rows.length === 0) {
        return { ignored: 'ese pago no acreditó consultas' };
    }
    const { user_id: userId, delta } = rows[0] as { user_id: string; delta: number };

    // Devolución parcial: no se tocan créditos, se deja anotado para revisar.
    const adjTotal = Number(data?.totals?.total ?? 0);
    const txn = await paddleGet(`/transactions/${txnId}`);
    const txnTotal = Number(
        txn?.data?.details?.totals?.total ?? txn?.data?.totals?.total ?? 0
    );
    if (!txnTotal || adjTotal < txnTotal) {
        console.warn('devolución parcial, sin tocar créditos', {
            adjustmentId,
            txnId,
            adjTotal,
            txnTotal,
        });
        return { ignored: 'devolución parcial: revisar a mano', adjTotal, txnTotal };
    }

    const res = await db.rpc('refund_credits', {
        p_user: userId,
        p_amount: Math.abs(Number(delta ?? 0)),
        p_reason: `paddle-refund:${adjustmentId}`,
        p_ref: `paddle-refund:${adjustmentId}`,
    });
    if (!res.ok) {
        throw new Error(`refund_credits: ${res.status} ${JSON.stringify(res.body)}`);
    }
    return { userId, refunded: Math.abs(Number(delta ?? 0)), balance: res.body };
}

/**
 * Suscripción: manda `premium_until` = fin del periodo pagado. La app ya
 * comprueba esa fecha, así que al acabar el mes el plan se cae solo aunque no
 * llegue otro aviso.
 */
async function onSubscription(
    db: ReturnType<typeof supabase>,
    data: any
): Promise<unknown> {
    const profile = await findProfile(db, data);
    if (!profile) {
        console.error('suscripción sin cuenta asociada', data?.id, data?.customer_id);
        return { ignored: 'sin cuenta' };
    }
    await linkCustomer(db, profile, data?.customer_id ?? null);

    const status = String(data?.status ?? '');
    const periodEnd = data?.current_billing_period?.ends_at ?? null;
    // past_due sigue teniendo acceso hasta que acabe el periodo ya pagado:
    // Paddle reintenta el cobro y no queremos cortar a quien está pagando.
    const active = ['active', 'trialing', 'past_due'].includes(status);

    const patch = active
        ? { is_premium: true, premium_until: periodEnd, paddle_subscription_id: data?.id ?? null }
        : { is_premium: false, premium_until: null, paddle_subscription_id: null };

    const res = await db.patch(`/rest/v1/profiles?id=eq.${profile.id}`, patch);
    if (!res.ok) {
        throw new Error(`activar plan: ${res.status} ${JSON.stringify(res.body)}`);
    }
    return { userId: profile.id, status, ...patch };
}

Deno.serve(async (req: Request) => {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const secret = Deno.env.get('PADDLE_WEBHOOK_SECRET') ?? '';
    if (!secret) return json({ error: 'webhook sin configurar' }, 503);

    const raw = await req.text();
    const { ts, h1 } = parseSignatureHeader(req.headers.get('paddle-signature') ?? '');
    if (!ts || !h1) return json({ error: 'falta la firma' }, 401);
    if (!safeEqual(h1, await hmacHex(secret, `${ts}:${raw}`))) {
        return json({ error: 'firma incorrecta' }, 401);
    }
    const skew = Math.abs(Date.now() / 1000 - Number(ts));
    if (!Number.isFinite(skew) || skew > MAX_SKEW_SECONDS) {
        return json({ error: 'firma caducada' }, 401);
    }

    let payload: any;
    try {
        payload = JSON.parse(raw);
    } catch {
        return json({ error: 'JSON inválido' }, 400);
    }

    const eventId = String(payload?.event_id ?? '');
    const eventType = String(payload?.event_type ?? '');
    const data = payload?.data ?? {};
    if (!eventId) return json({ error: 'evento sin id' }, 400);

    const db = supabase();

    try {
        // El catálogo se lee en cada aviso: si cambia un precio, no hay que
        // redesplegar y el aviso viejo sigue apuntando a su price_id.
        const { byPrice } = readCatalog();
        const priceId = String(data?.items?.[0]?.price?.id ?? '');
        const entry = priceId ? byPrice.get(priceId) : undefined;

        let result: unknown = { ignored: eventType };
        switch (eventType) {
            case 'transaction.completed':
                result = entry
                    ? await onTransactionCompleted(db, data, entry)
                    : { ignored: `precio ${priceId || '(sin precio)'} sin configurar` };
                break;
            case 'adjustment.created':
                result = await onAdjustment(db, data);
                break;
            case 'subscription.created':
            case 'subscription.updated':
            case 'subscription.activated':
            case 'subscription.trialing':
            case 'subscription.past_due':
            case 'subscription.paused':
            case 'subscription.resumed':
            case 'subscription.canceled':
                result = await onSubscription(db, data);
                break;
            default:
                break;
        }

        // Se apunta DESPUÉS de procesar: si algo falla, Paddle reintenta y el
        // aviso no queda marcado como hecho.
        await db.post(
            '/rest/v1/paddle_events',
            {
                id: eventId,
                event_type: eventType,
                occurred_at: payload?.occurred_at ?? null,
                payload,
            },
            'resolution=ignore-duplicates,return=minimal'
        );

        return json({ ok: true, type: eventType, result });
    } catch (err) {
        console.error('paddle-webhook', eventType, eventId, err);
        // 500 → Paddle reintenta (con su propio backoff).
        return json({ error: 'no se pudo procesar' }, 500);
    }
});
