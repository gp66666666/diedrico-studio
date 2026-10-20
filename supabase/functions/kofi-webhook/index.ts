// Webhook de Ko-fi → activa Premium automáticamente.
//
// Configuración (una sola vez):
//   1. Ko-fi → Settings → Webhooks: pega la URL de esta función.
//   2. Copia el Verification Token y guárdalo con:
//        supabase secrets set KOFI_VERIFICATION_TOKEN=xxxx
//   3. (Opcional) Si vendes un artículo "de por vida" en la tienda de Ko-fi,
//      pon sus direct_link_code separados por comas en:
//        supabase secrets set KOFI_LIFETIME_CODES=abc123,def456
//
// Decisiones:
// - Ko-fi NO avisa de cancelaciones. Por eso el premium tiene fecha de fin
//   (`premium_until`) y cada pago mensual la extiende un mes.
// - El comprador debe usar en Ko-fi el mismo email con el que se registró.
//   Si no coincide, el pago se guarda como "unmatched" para revisarlo a mano.
// - Siempre devolvemos 200 salvo token inválido: si no, Ko-fi reintenta.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

/** Meses que suma este pago (0 = no toca el plan). */
function monthsForEvent(payload: Record<string, any>): number {
    const lifetimeCodes = (Deno.env.get('KOFI_LIFETIME_CODES') || '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

    if (lifetimeCodes.length > 0 && Array.isArray(payload.shop_items)) {
        const isLifetime = payload.shop_items.some(
            (item: any) => item?.direct_link_code && lifetimeCodes.includes(item.direct_link_code)
        );
        if (isLifetime) return 1200; // 100 años: "de por vida"
    }

    if (payload.is_subscription_payment === true || payload.type === 'Subscription') {
        return 1;
    }

    return 0;
}

Deno.serve(async (req) => {
    if (req.method !== 'POST') {
        return json({ error: 'method_not_allowed' }, 405);
    }

    // Ko-fi envía application/x-www-form-urlencoded con un campo `data` (JSON).
    let payload: Record<string, any>;
    try {
        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('form')) {
            const form = await req.formData();
            const raw = form.get('data');
            if (!raw) return json({ error: 'missing_data' }, 400);
            payload = JSON.parse(String(raw));
        } else {
            // Permite probar la función a mano con JSON
            payload = await req.json();
        }
    } catch {
        return json({ error: 'invalid_payload' }, 400);
    }

    const expectedToken = Deno.env.get('KOFI_VERIFICATION_TOKEN');
    if (!expectedToken) {
        return json({ error: 'webhook_not_configured' }, 503);
    }
    if (!payload?.verification_token || payload.verification_token !== expectedToken) {
        return json({ error: 'invalid_token' }, 403);
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const email = String(payload.email || '').trim().toLowerCase();
    const months = monthsForEvent(payload);

    // 1. Registrar el evento (message_id es único → idempotencia)
    const { data: eventRow, error: insertError } = await supabase
        .from('kofi_events')
        .insert({
            message_id: payload.message_id ?? payload.kofi_transaction_id ?? null,
            transaction_id: payload.kofi_transaction_id ?? null,
            event_type: payload.type ?? null,
            email: email || null,
            amount: payload.amount ?? null,
            currency: payload.currency ?? null,
            tier_name: payload.tier_name ?? null,
            months_added: months,
            payload,
        })
        .select('id')
        .single();

    if (insertError) {
        // 23505 = ya procesado (Ko-fi reintenta si no recibe 200)
        if ((insertError as any).code === '23505') {
            return json({ ok: true, duplicate: true });
        }
        console.error('kofi_events insert', insertError);
        return json({ error: 'db_error' }, 500);
    }

    // 2. Pagos que no dan premium (propinas, comisiones…)
    if (months === 0) {
        await supabase.from('kofi_events').update({ status: 'ignored' }).eq('id', eventRow.id);
        return json({ ok: true, ignored: true });
    }

    // 3. Buscar la cuenta por email
    if (!email) {
        await supabase.from('kofi_events').update({ status: 'unmatched' }).eq('id', eventRow.id);
        return json({ ok: true, unmatched: 'sin_email' });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, premium_until')
        .ilike('email', email)
        .maybeSingle();

    if (!profile) {
        await supabase.from('kofi_events').update({ status: 'unmatched' }).eq('id', eventRow.id);
        return json({ ok: true, unmatched: 'sin_cuenta' });
    }

    // 4. Extender desde la fecha de fin actual (o desde hoy si ya caducó)
    const now = new Date();
    const current = profile.premium_until ? new Date(profile.premium_until) : null;
    const base = current && current > now ? current : now;

    const until = new Date(base);
    until.setMonth(until.getMonth() + months);

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_premium: true, premium_until: until.toISOString() })
        .eq('id', profile.id);

    if (updateError) {
        console.error('profiles update', updateError);
        await supabase.from('kofi_events').update({ status: 'error' }).eq('id', eventRow.id);
        return json({ error: 'db_error' }, 500);
    }

    await supabase
        .from('kofi_events')
        .update({ status: 'applied', matched_profile: profile.id })
        .eq('id', eventRow.id);

    return json({ ok: true, applied: true, until: until.toISOString(), months });
});
