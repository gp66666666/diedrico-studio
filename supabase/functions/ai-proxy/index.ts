// Edge Function: ai-proxy
// Oculta la API key de Groq: el navegador llama aquí y esta función (servidor) llama a Groq.
// La clave vive en el secreto GROQ_API_KEY del proyecto, nunca en el bundle.
//
// Seguridad:
//  - Exige JWT. Quien puede gastar:
//      1. Premium activo (is_premium y premium_until) → sin límite de mensajes.
//      2. Prueba gratuita: 3 mensajes por cuenta y mes (TRIAL_*).
//      3. Saldo de créditos prepagados (profiles.credits) → 1 crédito por mensaje.
//    El orden es prueba → saldo, para que el usuario gaste primero lo gratis.
//    El bloqueo del navegador es solo interfaz: esto es lo que corta de verdad.
//  - Rate limit por IP (tabla public.ai_rate_limits + rpc check_ai_rate_limit).
//  - Tope diario por cuenta (protege el margen de un Premium).
//  - Lista blanca de modelos y límite de tokens para que no se use como API gratis.
//  - Si la llamada al proveedor falla, se devuelve el crédito y la consulta de prueba.
//  - Se despliega con --no-verify-jwt porque la verificación se hace aquí,
//    para poder devolver un mensaje claro (401 sin sesión, 402 sin plan ni saldo).

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  // El panel lee el saldo de estas cabeceras después de cada mensaje.
  "Access-Control-Expose-Headers": "x-ai-credits, x-ai-trial-left",
};

// Modelos disponibles en la cuenta de Groq (2026-10). Los Llama 3.x fueron retirados.
const ALLOWED_MODELS = new Set([
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
]);
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const LIMIT_REQUESTS = 60;      // peticiones
const LIMIT_WINDOW_S = 3600;    // por hora y por IP
// Tope por cuenta y día: evita que un solo suscriptor queme el margen.
// 120 llamadas/día cubren de sobra un uso de estudio (y limitan el caso peor).
const USER_LIMIT_REQUESTS = 120;
const USER_LIMIT_WINDOW_S = 86400;

// ---- Techo de gasto por mensaje ----
// El coste de un mensaje es (tokens de entrada × precio_in) + (tokens de salida × precio_out).
// La salida cuesta ~4 veces más que la entrada, así que el tope de `max_tokens` es la
// palanca que de verdad manda. Con estos dos límites, el mensaje más caro posible cuesta
// ~0,0033 $ con deepseek-flash en hora punta y sin caché:
//   24.000 caracteres ≈ 6.860 tokens × 0,30 $/M  = 0,00206 $
//   salida 1.000 tokens × 1,20 $/M               = 0,00120 $
//   total                                        = 0,00326 $ ≈ 0,30 céntimos
// Los 3 mensajes de prueba nunca pasan de ~0,9 céntimos, aunque nadie repita prompt.
// En uso normal (caché de contexto + respuestas cortas) son ~0,2-0,5 céntimos.
const MAX_INPUT_CHARS = 24000;
const MAX_TOKENS_FREE = 1000;    // prueba y créditos
const MAX_TOKENS_PREMIUM = 2500; // el cliente pide 2.000 como mucho

// Prueba gratuita. Pon TRIAL_REQUESTS = 0 para desactivarla por completo.
// TRIAL_ONE_TIME = true → los 3 mensajes son para siempre (no se renuevan cada mes).
const TRIAL_REQUESTS = 3;
const TRIAL_ONE_TIME = false;
const TRIAL_WINDOW_S = TRIAL_ONE_TIME ? 3650 * 86400 : 30 * 86400;

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", ...extra },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: { message: "Method not allowed" } }, 405);

  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    return json({ error: { message: "El asistente IA no está configurado en el servidor." } }, 503);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  /** Llama a una función RPC con service_role. */
  async function rpc(name: string, params: Record<string, unknown>) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        console.error(`rpc ${name}`, res.status, await res.text());
        return { ok: false, value: null as unknown };
      }
      return { ok: true, value: (await res.json()) as unknown };
    } catch (e) {
      console.error(`rpc ${name}`, e);
      return { ok: false, value: null as unknown };
    }
  }

  // ---- JWT ----
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";

  const loginError = json(
    { error: { code: "login_required", message: "Inicia sesión para usar el asistente." } },
    401,
  );
  if (!token) return loginError;

  let userId: string | null = null;
  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${token}` },
    });
    if (userRes.ok) {
      const user = await userRes.json();
      userId = user?.id ?? null;
    }
  } catch (e) {
    console.error("auth check", e);
  }
  if (!userId) return loginError;

  // ---- Quién paga este mensaje ----
  let isPremium = false;
  let trialLeft: number | null = null;      // mensajes de prueba que le quedan
  let creditsLeft: number | null = null;    // saldo tras el mensaje (si aplica)
  let paidWithCredit = false;
  let trialkey: string | null = null;       // clave del contador de prueba, para devolverla

  const gateHeaders = (): Record<string, string> => {
    const h: Record<string, string> = {};
    if (trialLeft !== null) h["X-AI-Trial-Left"] = String(trialLeft);
    if (creditsLeft !== null) h["X-AI-Credits"] = String(creditsLeft);
    return h;
  };

  try {
    const profRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=is_premium,premium_until,credits`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    );
    const rows = profRes.ok ? await profRes.json() : [];
    const profile = Array.isArray(rows) ? rows[0] : null;
    const premium = isPremium =
      !!profile?.is_premium &&
      (!profile.premium_until || new Date(profile.premium_until) > new Date());

    const balance = Number(profile?.credits ?? 0);
    creditsLeft = Number.isFinite(balance) ? balance : 0;

    if (!premium) {
      // 1) Prueba gratuita
      let allowedByTrial = false;
      if (TRIAL_REQUESTS > 0) {
        trialkey = await sha256Hex(`trial:${userId}`);
        const trial = await rpc("check_ai_rate_limit", {
          p_key: trialkey,
          p_limit: TRIAL_REQUESTS,
          p_window_seconds: TRIAL_WINDOW_S,
        });
        if (trial.ok) {
          const used = Number(trial.value);
          allowedByTrial = !Number.isFinite(used) || used <= TRIAL_REQUESTS;
          trialLeft = allowedByTrial ? Math.max(0, TRIAL_REQUESTS - used) : 0;
        } else {
          // Si el contador falla, no se bloquea por eso (igual que el rate limit de IP)
          allowedByTrial = true;
          trialkey = null;
        }
      }

      // 2) Saldo de créditos
      if (!allowedByTrial) {
        // La prueba ya está agotada: si el mensaje falla, NO se devuelve la prueba
        // (si no, se podría recuperar enviando peticiones que el proveedor rechace).
        trialkey = null;
        const spent = await rpc("spend_credit", {
          p_user: userId,
          p_reason: "ai_message",
          p_ref: null,
        });
        if (!spent.ok) {
          return json(
            { error: { message: "No se pudo comprobar tu saldo. Inténtalo de nuevo." } },
            500,
            gateHeaders(),
          );
        }
        if (spent.value === null || spent.value === undefined) {
          return json(
            {
              error: {
                code: "no_credits",
                message:
                  "Has usado tus mensajes de prueba y no te queda saldo. Activa Premium para seguir usando el asistente.",
              },
            },
            402,
            gateHeaders(),
          );
        }
        paidWithCredit = true;
        creditsLeft = Number(spent.value);
        trialLeft = 0;
      }
    }

    if (premium) trialLeft = null;
  } catch (e) {
    console.error("plan check", e);
    return json({ error: { message: "No se pudo comprobar tu plan. Inténtalo de nuevo." } }, 500);
  }

  /** Devolver lo cobrado si el proveedor no responde como es debido. */
  async function refund() {
    if (!userId) return;
    if (paidWithCredit) {
      const left = await rpc("add_credits", {
        p_user: userId,
        p_amount: 1,
        p_reason: "refund",
        p_ref: null,
      });
      if (left.ok && Number.isFinite(Number(left.value))) creditsLeft = Number(left.value);
      paidWithCredit = false;
    }
    if (trialkey) {
      await rpc("release_ai_quota", { p_key: trialkey });
      if (trialLeft !== null) trialLeft = Math.min(TRIAL_REQUESTS, trialLeft + 1);
      trialkey = null;
    }
  }

  // ---- Tope diario por cuenta (protege el margen) ----
  try {
    const rlUser = await fetch(`${supabaseUrl}/rest/v1/rpc/check_ai_rate_limit`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_key: await sha256Hex(`user:${userId}`),
        p_limit: USER_LIMIT_REQUESTS,
        p_window_seconds: USER_LIMIT_WINDOW_S,
      }),
    });
    if (rlUser.ok) {
      const usedToday = Number(await rlUser.json());
      if (Number.isFinite(usedToday) && usedToday > USER_LIMIT_REQUESTS) {
        await refund();
        return json(
          { error: { message: "Has llegado al límite diario del asistente. Vuelve mañana." } },
          429,
          { ...gateHeaders(), "Retry-After": "3600" },
        );
      }
    }
  } catch (e) {
    console.error("user rate limit error", e);
  }

  // ---- Rate limit por IP (la IP no se guarda en claro: solo su hash) ----
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") || "unknown";

  try {
    const rl = await fetch(`${supabaseUrl}/rest/v1/rpc/check_ai_rate_limit`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_key: await sha256Hex(ip),
        p_limit: LIMIT_REQUESTS,
        p_window_seconds: LIMIT_WINDOW_S,
      }),
    });
    if (rl.ok) {
      const used = Number(await rl.json());
      if (Number.isFinite(used) && used > LIMIT_REQUESTS) {
        await refund();
        return json(
          { error: { message: "Demasiadas peticiones al asistente. Inténtalo más tarde." } },
          429,
          { ...gateHeaders(), "Retry-After": "900" },
        );
      }
    }
  } catch (e) {
    console.error("rate limit error", e); // no bloqueamos la petición por un fallo del contador
  }

  // ---- Validación del payload ----
  let body: any;
  try {
    body = await req.json();
  } catch {
    await refund();
    return json({ error: { message: "JSON inválido" } }, 400, gateHeaders());
  }

  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    await refund();
    return json({ error: { message: "Faltan 'messages'" } }, 400, gateHeaders());
  }

  // Nadie manda 200.000 tokens a tu costa: la consulta tiene un tope de tamaño.
  if (JSON.stringify(messages).length > MAX_INPUT_CHARS) {
    await refund();
    return json(
      {
        error: {
          message: "La consulta es demasiado larga. Resume el enunciado o borra elementos del lienzo.",
        },
      },
      413,
      gateHeaders(),
    );
  }

  // La cuenta actual no tiene modelos de visión: mejor un error claro que uno del proveedor.
  if (JSON.stringify(messages).includes("image_url")) {
    await refund();
    return json({
      error: { message: "El escaneo de imágenes no está disponible con el proveedor actual." },
    }, 400, gateHeaders());
  }

  const model = ALLOWED_MODELS.has(body?.model) ? body.model : DEFAULT_MODEL;
  const temperature = Math.min(Math.max(Number(body?.temperature ?? 0.1), 0), 1);
  // Sin Premium (prueba o créditos) la respuesta tiene un techo más bajo: es lo que
  // mantiene el coste por mensaje en céntimos.
  const tokenCeiling = isPremium ? MAX_TOKENS_PREMIUM : MAX_TOKENS_FREE;
  const maxTokens = Math.min(Math.max(Number(body?.max_tokens ?? 2000), 1), tokenCeiling);

  // ---- Llamada a Groq ----
  try {
    const upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        reasoning_effort: "low", // gpt-oss razona: en "low" responde antes y gasta menos tokens
      }),
    });

    const text = await upstream.text();

    // Si el proveedor falla, el mensaje no se cobra.
    if (!upstream.ok) await refund();

    return new Response(text, {
      status: upstream.status,
      headers: { ...CORS, "Content-Type": "application/json", ...gateHeaders() },
    });
  } catch (e) {
    console.error("groq error", e);
    await refund();
    return json({ error: { message: "No se pudo contactar con el proveedor de IA." } }, 502, gateHeaders());
  }
});
