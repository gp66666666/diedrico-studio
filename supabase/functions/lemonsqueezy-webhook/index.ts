// Edge Function: lemonsqueezy-webhook
//
// Lemon Squeezy actúa como vendedor (merchant of record): cobra el IVA europeo y
// emite la factura. Aquí solo se recibe el aviso y se acredita lo comprado:
//
//   · Packs de consultas (pago único)  → add_credits, idempotente por pedido.
//   · Pack Profesor (pago único)       → crea un código de clase para el profesor.
//   · Plan mensual (suscripción)       → activa is_premium hasta la próxima
//                                        renovación (premium_until = renews_at).
//
// Seguridad:
//  - Firma HMAC-SHA256 de `X-Signature` con `LEMON_SQUEEZY_SIGNING_SECRET`.
//  - Idempotente: add_credits con `ref = ls:<order_id>` (ignora repeticiones) y
//    `class_codes.order_ref` único (un pedido, un código).
//
// Secretos:
//   LEMON_SQUEEZY_SIGNING_SECRET   secreto de firma del webhook
//   LEMON_VARIANT_CREDITS          {"<variant_id>": 100, ...}       packs
//   LEMON_CLASS_VARIANTS           {"<variant_id>": {"perStudent":150,"maxUses":40,"months":6}}
//   LEMON_SUBSCRIPTION_VARIANTS    ["<variant_id>", ...]             plan mensual
//
// Se despliega con --no-verify-jwt: Lemon Squeezy no manda JWT de Supabase.

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

function readJson<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(Deno.env.get(name) ?? "") as T;
  } catch {
    return fallback;
  }
}

/** Código legible sin caracteres que se confunden al dictarlo (0/O, 1/I). */
function newClassCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "PROFE-" + [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
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
  if (!safeEqual(signature, await hmacHex(secret, raw))) {
    return json({ error: "firma incorrecta" }, 401);
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const eventName: string = payload?.meta?.event_name ?? "";
  const attributes = payload?.data?.attributes ?? {};
  const orderId = String(payload?.data?.id ?? "");
  const variantId = String(
    attributes?.first_order_item?.variant_id ?? attributes?.variant_id ?? "",
  );

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  /** Cuenta del comprador: 1) custom_data (lo manda la web), 2) email. */
  const findProfile = async () => {
    const customId = payload?.meta?.custom_data?.user_id ?? null;
    const email = String(attributes?.user_email ?? "").trim().toLowerCase();

    const query = async (q: string) => {
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?${q}&select=id,email&limit=1`, {
        headers,
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    };

    if (customId) {
      const byId = await query(`id=eq.${encodeURIComponent(customId)}`);
      if (byId) return byId;
    }
    return email ? await query(`email=eq.${encodeURIComponent(email)}`) : null;
  };

  // ---------------------------------------------------------------- pagos
  if (eventName === "order_created") {
    if (!orderId) return json({ error: "pedido sin id" }, 400);
    const profile = await findProfile();
    if (!profile) {
      console.error("pedido sin cuenta asociada", orderId, attributes?.user_email);
      return json({ ok: false, reason: "sin cuenta" });
    }

    // --- Pack Profesor: genera un código de clase ---
    const classVariants = readJson<Record<string, { perStudent?: number; maxUses?: number; months?: number }>>(
      "LEMON_CLASS_VARIANTS",
      {},
    );
    const classCfg = classVariants[variantId];
    if (classCfg) {
      const perStudent = Number(classCfg.perStudent ?? 150);
      const maxUses = Number(classCfg.maxUses ?? 40);
      const months = Number(classCfg.months ?? 12);
      const expires = new Date();
      expires.setMonth(expires.getMonth() + months);

      // Idempotencia: si el pedido ya tiene código, se devuelve el mismo.
      const existing = await fetch(
        `${supabaseUrl}/rest/v1/class_codes?order_ref=eq.${encodeURIComponent(`ls:${orderId}`)}&select=code`,
        { headers },
      );
      const existingRows = existing.ok ? await existing.json() : [];
      if (Array.isArray(existingRows) && existingRows.length > 0) {
        return json({ ok: true, code: existingRows[0].code, reused: true });
      }

      const code = newClassCode();
      const res = await fetch(`${supabaseUrl}/rest/v1/class_codes`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify({
          code,
          owner_id: profile.id,
          credits_per_student: perStudent,
          max_uses: maxUses,
          expires_at: expires.toISOString(),
          order_ref: `ls:${orderId}`,
        }),
      });
      if (!res.ok) {
        console.error("crear código", res.status, await res.text());
        return json({ error: "no se pudo crear el código" }, 500);
      }
      return json({ ok: true, code, perStudent, maxUses, months });
    }

    // --- Packs de consultas ---
    const packs = readJson<Record<string, number>>("LEMON_VARIANT_CREDITS", {});
    const credits = Number(packs[variantId] ?? 0);
    if (!Number.isFinite(credits) || credits <= 0) {
      console.error("variante sin nada asignado", variantId);
      // 200 para que Lemon Squeezy no reintente eternamente: se arregla a mano.
      return json({ ok: false, reason: `variante ${variantId} sin configurar` });
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/add_credits`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        p_user: profile.id,
        p_amount: credits,
        p_reason: `lemon:${orderId}`,
        p_ref: `ls:${orderId}`,
      }),
    });
    if (!res.ok) {
      console.error("add_credits", res.status, await res.text());
      return json({ error: "no se pudo acreditar" }, 500); // 500 = reintenta
    }
    return json({ ok: true, userId: profile.id, credits, balance: await res.json() });
  }

  // ---------------------------------------------------------- suscripciones
  const subscriptionEvents = [
    "subscription_created",
    "subscription_updated",
    "subscription_payment_success",
    "subscription_resumed",
    "subscription_unpaused",
  ];

  if (subscriptionEvents.includes(eventName) || eventName === "subscription_expired") {
    const subscriptionVariants = readJson<string[]>("LEMON_SUBSCRIPTION_VARIANTS", []);
    const isOurPlan = subscriptionVariants.length === 0 || subscriptionVariants.includes(variantId);

    if (!isOurPlan) return json({ ok: true, ignored: `suscripción de la variante ${variantId}` });

    const profile = await findProfile();
    if (!profile) {
      console.error("suscripción sin cuenta asociada", payload?.data?.id, attributes?.user_email);
      return json({ ok: false, reason: "sin cuenta" });
    }

    // Al expirar o cancelar se deja el acceso hasta la fecha ya pagada: solo se
    // quita el plan cuando Lemon Squeezy dice que ya no hay periodo activo.
    const expired = eventName === "subscription_expired" ||
      attributes?.status === "expired";
    const renewsAt = attributes?.renews_at
      ? new Date(attributes.renews_at)
      : new Date(Date.now() + 31 * 86400 * 1000);

    const patch: Record<string, unknown> = expired
      ? { is_premium: false, premium_until: null }
      : { is_premium: true, premium_until: renewsAt.toISOString() };

    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${profile.id}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      console.error("activar plan", res.status, await res.text());
      return json({ error: "no se pudo activar el plan" }, 500);
    }
    return json({ ok: true, userId: profile.id, event: eventName, ...patch });
  }

  return json({ ok: true, ignored: eventName || "sin evento" });
});
