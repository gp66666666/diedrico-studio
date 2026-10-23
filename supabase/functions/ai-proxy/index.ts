// Edge Function: ai-proxy
// Oculta las API keys de los proveedores: el navegador llama aquí y esta función
// (servidor) llama a DeepSeek (principal) o Groq (respaldo). Las claves viven en
// los secretos DEEPSEEK_API_KEY y GROQ_API_KEY del proyecto, nunca en el bundle.
//
// Seguridad:
//  - Exige JWT. Quien puede gastar:
//      1. Premium activo (cuentas antiguas) → sin límite de mensajes.
//      2. Consultas gratuitas: 5 cada 24 h por cuenta (FREE_*). No se vende nada,
//         así que este es el límite normal de todo el mundo.
//      3. Saldo de créditos (profiles.credits): regalos a profesores, etc.
//    El orden es gratis → saldo, para que el usuario gaste primero lo gratis.
//    El bloqueo del navegador es solo interfaz: esto es lo que corta de verdad.
//  - Tope GLOBAL diario: si un día entra mucha gente, el asistente se cierra
//    antes de que la factura de DeepSeek se descontrole.
//  - Rate limit por IP (tabla public.ai_rate_limits + rpc check_ai_rate_limit).
//  - Tope diario por cuenta (protege el margen de un Premium).
//  - Lista blanca de modelos y límite de tokens para que no se use como API gratis.
//  - Si la llamada al proveedor falla, se devuelve el crédito y la consulta de prueba.
//  - Interruptor: AI_ENABLED=false deja el asistente en pausa para todos.
//  - Se despliega con --no-verify-jwt porque la verificación se hace aquí,
//    para poder devolver un mensaje claro (401 sin sesión, 402 sin plan ni saldo).

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

type Provider = "deepseek" | "groq";

// Qué proveedor sirve cada modelo. El cliente pide `AI_PROXY_MODEL` (aiProxy.ts).
const MODELS: Record<string, { provider: Provider }> = {
  "deepseek-flash": { provider: "deepseek" },
  "deepseek-v4-pro": { provider: "deepseek" },
  "openai/gpt-oss-120b": { provider: "groq" },
  "openai/gpt-oss-20b": { provider: "groq" },
  "qwen/qwen3.8-27b": { provider: "groq" },
};
const DEFAULT_MODEL = "deepseek-flash";
// Si DeepSeek no responde (caída, 5xx, 429), se reintenta aquí antes de rendirse.
const FALLBACK_MODEL = "openai/gpt-oss-120b";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  // El panel lee el saldo de estas cabeceras después de cada mensaje.
  "Access-Control-Expose-Headers": "x-ai-credits, x-ai-trial-left",
};

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

// Consultas gratuitas: 3 cada 24 h por cuenta (ventana deslizante).
// Coste máximo por usuario y día: 3 × 0,0018 € ≈ 0,5 céntimos. Con 100 personas
// usándolas todas, ~9 €/mes: es el precio de tener la web abierta y gratis.
// Pon FREE_REQUESTS = 0 para cerrar el asistente sin tocar nada más.
const FREE_REQUESTS = 3;
const FREE_WINDOW_S = 86400;
// Sin cuenta: 1 consulta de prueba, contada por IP y sin caducidad práctica
// (30 días). Al terminarla se ofrece crear cuenta, que da 3 al día.
// Ojo: en un centro educativo todos salen por la misma IP; si alguien se queja,
// subir ANON_REQUESTS o bajar ANON_WINDOW_S es cambiar una línea.
const ANON_REQUESTS = 1;
const ANON_WINDOW_S = 30 * 86400;
// Tope global de gasto: 2.000 consultas/día ≈ 3,6 € en el peor caso. Si algún
// día se hace viral, el asistente dice "vuelve mañana" en vez de arruinarte.
// Súbelo cuando haya ingresos que lo paguen.
const GLOBAL_DAILY_REQUESTS = 2000;
// Plan mensual: "ilimitado" con uso razonable. 1.500 al mes (unas 50 al día) es
// más de lo que usa nadie y pone techo al coste: 1.500 × 0,002 € = 3 €/mes como
// máximo, frente a los 14,99 € que cuesta. Sin este tope, un abusón con el
// límite diario (120) se come el margen.
const PREMIUM_MONTHLY_LIMIT = 1500;
const PREMIUM_MONTHLY_WINDOW_S = 31 * 86400;

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

  // Interruptor del asistente. `AI_ENABLED=false` lo deja en pausa para todos
  // (también por API): el aviso del navegador es solo interfaz, esto es lo que
  // corta de verdad mientras se termina de configurar la tienda.
  if ((Deno.env.get("AI_ENABLED") ?? "true") === "false") {
    return json(
      {
        error: {
          code: "assistant_paused",
          message: "El asistente está en pausa mientras terminamos de configurar los pagos. Volverá en cuanto esté cerrado.",
        },
      },
      503,
    );
  }

  // Claves de proveedor (secretos de la Edge Function). DeepSeek es el principal;
  // Groq queda como respaldo si algún día falla.
  const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY") ?? "";
  const groqKey = Deno.env.get("GROQ_API_KEY") ?? "";
  if (!deepseekKey && !groqKey) {
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

  // ---- IP (no se guarda en claro: solo su hash) ----
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") || "unknown";

  // ---- JWT ----
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  // Sin sesión válida la petición es anónima: no es un error, es el modo prueba.
  // (El cliente manda la anon key como bearer cuando no hay usuario; también
  // puede llegar un token caducado. Todo lo que no resuelva a un usuario real
  // entra por la cuota anónima, que es una sola consulta por IP.)
  let isAnon = false;

  let userId: string | null = null;
  if (token) {
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
  }
  isAnon = !userId;

  // ---- Tope global de gasto del día ----
  // Protege la tarjeta: si un día entra mucha gente, el asistente descansa.
  try {
    const day = new Date().toISOString().slice(0, 10);
    const rlGlobal = await rpc("check_ai_rate_limit", {
      p_key: await sha256Hex(`global:${day}`),
      p_limit: GLOBAL_DAILY_REQUESTS,
      p_window_seconds: 86400,
    });
    if (rlGlobal.ok) {
      const usedToday = Number(rlGlobal.value);
      if (Number.isFinite(usedToday) && usedToday > GLOBAL_DAILY_REQUESTS) {
        return json(
          {
            error: {
              code: "busy",
              message:
                "El asistente ha llegado a su límite de hoy. Mañana vuelve a estar disponible.",
            },
          },
          429,
          { "Retry-After": "3600" },
        );
      }
    }
  } catch (e) {
    console.error("global cap", e);
  }

  // ---- Anónimo: 1 consulta de prueba, sin cuenta ----
  let anonQuotaKey: string | null = null;
  if (isAnon) {
    const key = await sha256Hex(`anon:${ip}`);
    const quota = await rpc("check_ai_rate_limit", {
      p_key: key,
      p_limit: ANON_REQUESTS,
      p_window_seconds: ANON_WINDOW_S,
    });
    if (quota.ok) {
      const used = Number(quota.value);
      if (Number.isFinite(used) && used > ANON_REQUESTS) {
        return json(
          {
            error: {
              code: "anon_limit",
              message:
                "Ya has usado tu consulta de prueba. Crea una cuenta gratis (30 segundos) " +
                "y tendrás 3 consultas al día.",
            },
          },
          401,
        );
      }
      anonQuotaKey = key;
    }
  }

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
    if (isAnon) throw new Error("anonymous: sin perfil");
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
      // 1) Consultas gratuitas del día
      let allowedByFree = false;
      if (FREE_REQUESTS > 0) {
        trialkey = await sha256Hex(`free:${userId}`);
        const free = await rpc("check_ai_rate_limit", {
          p_key: trialkey,
          p_limit: FREE_REQUESTS,
          p_window_seconds: FREE_WINDOW_S,
        });
        if (free.ok) {
          const used = Number(free.value);
          allowedByFree = !Number.isFinite(used) || used <= FREE_REQUESTS;
          trialLeft = allowedByFree ? Math.max(0, FREE_REQUESTS - used) : 0;
        } else {
          // Si el contador falla, no se bloquea por eso (igual que el rate limit de IP)
          allowedByFree = true;
          trialkey = null;
        }
      }

      // 2) Saldo de créditos (regalos: profesores, colaboradores)
      if (!allowedByFree) {
        // Las gratuitas ya están gastadas: si el mensaje falla, NO se devuelven
        // (si no, se podrían recuperar enviando peticiones que el proveedor rechace).
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
                code: "daily_limit",
                message:
                  `Has usado tus ${FREE_REQUESTS} consultas gratis de hoy. ` +
                  `Mañana tienes ${FREE_REQUESTS} más. ` +
                  "El resto de la web (3D, 2D, láminas, academia) sigue abierto y sin límite.",
              },
            },
            429,
            gateHeaders(),
          );
        }
        paidWithCredit = true;
        creditsLeft = Number(spent.value);
        trialLeft = 0;
      }
    }

    if (premium) {
      trialLeft = null;
      const monthly = await rpc("check_ai_rate_limit", {
        p_key: await sha256Hex(`monthly:${userId}`),
        p_limit: PREMIUM_MONTHLY_LIMIT,
        p_window_seconds: PREMIUM_MONTHLY_WINDOW_S,
      });
      if (monthly.ok) {
        const usedMonth = Number(monthly.value);
        if (Number.isFinite(usedMonth) && usedMonth > PREMIUM_MONTHLY_LIMIT) {
          return json(
            {
              error: {
                code: "monthly_limit",
                message:
                  `Has llegado al uso razonable del plan mensual (${PREMIUM_MONTHLY_LIMIT} consultas). ` +
                  "Se renueva solo el mes que viene; si necesitas más ahora, escribe y lo miramos.",
              },
            },
            429,
            { "Retry-After": "3600" },
          );
        }
      }
    }
  } catch (e) {
    if (!isAnon) {
      console.error("plan check", e);
      return json({ error: { message: "No se pudo comprobar tu plan. Inténtalo de nuevo." } }, 500);
    }
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
      if (trialLeft !== null) trialLeft = Math.min(FREE_REQUESTS, trialLeft + 1);
      trialkey = null;
    }
    if (anonQuotaKey) {
      await rpc("release_ai_quota", { p_key: anonQuotaKey });
      anonQuotaKey = null;
    }
  }

  // ---- Tope diario por cuenta (protege el margen) ----
  try {
    if (isAnon) throw new Error("anonymous: sin tope por cuenta");
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
    if (!isAnon) console.error("user rate limit error", e);
  }

  // ---- Rate limit por IP (la IP no se guarda en claro: solo su hash) ----
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

  const requested = typeof body?.model === "string" ? body.model : DEFAULT_MODEL;
  const model = MODELS[requested] ? requested : DEFAULT_MODEL;
  const provider = MODELS[model].provider;
  const temperature = Math.min(Math.max(Number(body?.temperature ?? 0.1), 0), 1);
  // Sin Premium (prueba o créditos) la respuesta tiene un techo más bajo: es lo que
  // mantiene el coste por mensaje en céntimos.
  const tokenCeiling = isPremium ? MAX_TOKENS_PREMIUM : MAX_TOKENS_FREE;
  const maxTokens = Math.min(Math.max(Number(body?.max_tokens ?? 2000), 1), tokenCeiling);

  // ---- Llamada al proveedor ----
  const keyFor = (p: Provider) => (p === "deepseek" ? deepseekKey : groqKey);

  const callProvider = (p: Provider, modelName: string) =>
    fetch(p === "deepseek" ? DEEPSEEK_URL : GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keyFor(p)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
        // DeepSeek factura el razonamiento como salida y se come `max_tokens`
        // (con el modo activado la respuesta llegaba vacía): va apagado.
        // En gpt-oss (Groq) el equivalente es el esfuerzo bajo.
        ...(p === "deepseek"
          ? { thinking: { type: "disabled" } }
          : { reasoning_effort: "low" }),
      }),
    });

  if (!keyFor(provider)) {
    await refund();
    return json(
      { error: { message: `El modelo ${model} no está disponible ahora mismo.` } },
      503,
      gateHeaders(),
    );
  }

  try {
    let upstream = await callProvider(provider, model);
    let text = await upstream.text();

    // Respaldo: si el fallo es del proveedor (5xx o 429) y hay clave de Groq,
    // se reintenta con gpt-oss para no dejar al alumno sin respuesta.
    if (!upstream.ok && (upstream.status >= 500 || upstream.status === 429) &&
      provider === "deepseek" && groqKey) {
      console.warn(`deepseek ${upstream.status}: reintento con ${FALLBACK_MODEL}`);
      try {
        const retry = await callProvider("groq", FALLBACK_MODEL);
        const retryText = await retry.text();
        if (retry.ok) {
          upstream = retry;
          text = retryText;
        } else {
          console.error("groq fallback", retry.status, retryText.slice(0, 500));
        }
      } catch (e) {
        console.error("groq fallback", e);
      }
    }

    // Traza de coste en los logs de la función (modelo y tokens de cada mensaje).
    try {
      const parsed = JSON.parse(text);
      const u = parsed?.usage;
      if (u) {
        console.log("ai_usage", JSON.stringify({
          user: userId,
          model: parsed?.model ?? model,
          in: u.prompt_tokens,
          cached: u.prompt_cache_hit_tokens ?? u.prompt_tokens_details?.cached_tokens ?? 0,
          out: u.completion_tokens,
        }));
      }
    } catch { /* respuesta no JSON (error del proveedor) */ }

    // Si el proveedor falla, el mensaje no se cobra.
    if (!upstream.ok) await refund();

    return new Response(text, {
      status: upstream.status,
      headers: { ...CORS, "Content-Type": "application/json", ...gateHeaders() },
    });
  } catch (e) {
    console.error("provider error", e);
    await refund();
    return json({ error: { message: "No se pudo contactar con el proveedor de IA." } }, 502, gateHeaders());
  }
});
