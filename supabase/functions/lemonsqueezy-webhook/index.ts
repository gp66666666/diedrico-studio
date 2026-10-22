// Edge Function: lemonsqueezy-webhook
//
// Lemon Squeezy actúa como vendedor (merchant of record): cobra el IVA europeo y
// emite la factura. Aquí solo se recibe el aviso del pago y se suman consultas.
//
// Seguridad:
//  - Se verifica la firma HMAC-SHA256 de la cabecera `X-Signature` con el secreto
//    `LEMON_SQUEEZY_SIGNING_SECRET`. Sin firma válida no se toca la base de datos.
//  - Idempotente: se llama a add_credits con `ref = ls:<order_id>`, y add_credits
//    ignora las repeticiones (los webhooks reintentan).
//  - Solo se atiende `order_created`; el resto se acepta y se ignora.
//
// Configuración (secretos del proyecto):
//   LEMON_SQUEEZY_SIGNING_SECRET  secreto de firma del webhook
//   LEMON_VARIANT_CREDITS         JSON {"<variant_id>": <consultas>, ...}
//
// Se despliega con --no-verify-jwt: Lemon Squeezy no manda JWT de Supabase, la
// autenticación es la firma.

const encoder = new TextEncoder();

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparación en tiempo constante (evita filtrar la firma byte a byte). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = Deno.env.get("LEMON_SQUEEZY_SIGNING_SECRET") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!secret) return json({ error: "webhook sin configurar" }, 503);

  const raw = await req.text();
  const signature = (req.headers.get("x-signature") ?? "").trim().toLowerCase();
  if (!signature) return json({ error: "falta la firma" }, 401);

  const expected = await hmacHex(secret, raw);
  if (!safeEqual(signature, expected)) return json({ error: "firma incorrecta" }, 401);

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const eventName = payload?.meta?.event_name;
  if (eventName !== "order_created") {
    return json({ ok: true, ignored: eventName ?? "sin evento" });
  }

  const attributes = payload?.data?.attributes ?? {};
  const orderId = String(payload?.data?.id ?? "");
  if (!orderId) return json({ error: "pedido sin id" }, 400);

  // Variante comprada → cuántas consultas da.
  let packs: Record<string, number> = {};
  try {
    packs = JSON.parse(Deno.env.get("LEMON_VARIANT_CREDITS") ?? "{}");
  } catch {
    console.error("LEMON_VARIANT_CREDITS no es JSON válido");
    return json({ error: "configuración inválida" }, 500);
  }

  const variantId = String(attributes?.first_order_item?.variant_id ?? "");
  const credits = Number(packs[variantId] ?? 0);
  if (!Number.isFinite(credits) || credits <= 0) {
    console.error("variante sin consultas asignadas", variantId);
    // 200 para que Lemon Squeezy no reintente eternamente: hay que arreglarlo a mano.
    return json({ ok: false, reason: `variante ${variantId} sin pack` });
  }

  // ¿De quién es el pedido? 1) custom_data (lo manda la web), 2) email.
  const userId = payload?.meta?.custom_data?.user_id ?? null;
  const email = String(attributes?.user_email ?? "").trim().toLowerCase();

  const findProfile = async (query: string) => {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?${query}&select=id,email&limit=1`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  };

  let profile = userId ? await findProfile(`id=eq.${encodeURIComponent(userId)}`) : null;
  if (!profile && email) {
    profile = await findProfile(`email=eq.${encodeURIComponent(email)}`);
  }
  if (!profile) {
    console.error("pedido sin cuenta asociada", orderId, email);
    return json({ ok: false, reason: "sin cuenta" });
  }

  // Idempotente por pedido: si ya se aplicó, add_credits devuelve el saldo.
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/add_credits`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_user: profile.id,
      p_amount: credits,
      p_reason: `lemon:${orderId}`,
      p_ref: `ls:${orderId}`,
    }),
  });

  if (!res.ok) {
    console.error("add_credits", res.status, await res.text());
    // 500 para que Lemon Squeezy reintente.
    return json({ error: "no se pudo acreditar" }, 500);
  }

  const balance = await res.json();
  return json({ ok: true, userId: profile.id, credits, balance });
});
