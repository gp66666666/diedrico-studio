// Edge Function: paddle-checkout
//
// Crea la transacción en Paddle desde el servidor y devuelve la URL de pago.
//
// Por qué en el servidor y no en el navegador:
//  - El precio sale de `PADDLE_CATALOG`, no de lo que mande la página. Si el
//    navegador pudiera elegir el price_id, podría pagar un pack de 4,99 € y
//    pedir los créditos del de 11,99 €.
//  - `custom_data.user_id` se pone aquí, con el usuario del JWT ya verificado.
//    Es lo que el webhook usará para saber a quién acreditar.
//
// Se llama con el JWT del usuario (la puerta de Supabase ya lo exige), así que
// no se despliega con --no-verify-jwt.

import { apiBase, cors, json, readCatalog } from '../_shared/paddle.ts';

/** Origen al que vuelve el alumno después de pagar (y al cancelar). */
const APP_URL = Deno.env.get('APP_URL') ?? 'https://diedricostudio.com';

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: cors(req) });
    }
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, req);

    const apiKey = Deno.env.get('PADDLE_API_KEY') ?? '';
    if (!apiKey) return json({ error: 'pagos sin configurar' }, 503, req);

    // --- Quién compra: lo dice el JWT, no el cuerpo de la petición ---------
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'falta la sesión' }, 401, req);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) return json({ error: 'sesión no válida' }, 401, req);
    const user = await userRes.json();
    if (!user?.id) return json({ error: 'sesión no válida' }, 401, req);

    // --- Qué compra: la clave del pack, validada contra el catálogo ---------
    const body = await req.json().catch(() => null);
    const pack = String(body?.pack ?? '');
    let byPack;
    try {
        byPack = readCatalog().byPack;
    } catch (err) {
        console.error('catálogo mal configurado', err);
        return json({ error: 'catálogo sin configurar' }, 503, req);
    }
    const entry = byPack[pack];
    if (!entry) return json({ error: `pack desconocido: ${pack}` }, 400, req);

    // --- Cliente de Paddle ya vinculado (si lo hay) -------------------------
    const profileRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=paddle_customer_id`,
        {
            headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
            },
        }
    );
    const profiles = profileRes.ok ? await profileRes.json() : [];
    const customerId = profiles?.[0]?.paddle_customer_id ?? null;

    const transaction: Record<string, unknown> = {
        items: [{ price_id: entry.price_id, quantity: 1 }],
        collection_mode: 'automatic',
        custom_data: { user_id: user.id, pack },
        checkout: {
            settings: {
                success_url: `${APP_URL}/?pago=ok`,
            },
        },
    };
    if (customerId) {
        transaction.customer_id = customerId;
    } else if (user.email) {
        transaction.customer = { email: user.email };
    }

    const res = await fetch(`${apiBase()}/transactions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
    });
    const text = await res.text();
    let created: any = null;
    try {
        created = text ? JSON.parse(text) : null;
    } catch {
        created = { raw: text };
    }

    if (!res.ok) {
        console.error('Paddle rechazó la transacción', res.status, text);
        return json(
            {
                error: 'Paddle no ha podido crear el pago',
                status: res.status,
                detail: created?.error?.detail ?? created,
            },
            502,
            req
        );
    }

    return json(
        {
            transactionId: created?.data?.id ?? null,
            checkoutUrl: created?.data?.checkout?.url ?? null,
            pack,
        },
        200,
        req
    );
});
