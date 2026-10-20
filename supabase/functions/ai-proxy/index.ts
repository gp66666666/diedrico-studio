// Edge Function: ai-proxy
// Oculta la API key de Groq: el navegador llama aquí y esta función (servidor) llama a Groq.
// La clave vive en el secreto GROQ_API_KEY del proyecto, nunca en el bundle.
//
// Seguridad:
//  - Exige JWT de una cuenta con Premium activo (is_premium y premium_until).
//    El bloqueo del navegador es solo interfaz: esto es lo que corta de verdad.
//  - Rate limit por IP (tabla public.ai_rate_limits + rpc check_ai_rate_limit).
//  - Lista blanca de modelos y límite de tokens para que no se use como API gratis.
//  - Se despliega con --no-verify-jwt porque la verificación se hace aquí,
//    para poder devolver un mensaje claro (401 sin sesión, 402 sin Premium).

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  // ---- Solo cuentas con Premium activo ----
  // El bloqueo del navegador es solo interfaz: cualquiera puede llamar a esta
  // URL. Aquí se comprueba el JWT del usuario y su plan antes de gastar tokens.
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";

  const loginError = json(
    { error: { code: "premium_required", message: "Inicia sesión con tu cuenta Premium para usar el asistente." } },
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

  try {
    const profRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=is_premium,premium_until`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    );
    const rows = profRes.ok ? await profRes.json() : [];
    const profile = Array.isArray(rows) ? rows[0] : null;
    const active =
      !!profile?.is_premium &&
      (!profile.premium_until || new Date(profile.premium_until) > new Date());

    if (!active) {
      return json(
        { error: { code: "premium_required", message: "El asistente IA es una función Premium. Actívala desde tu cuenta." } },
        402,
      );
    }
  } catch (e) {
    console.error("premium check", e);
    return json({ error: { message: "No se pudo comprobar tu plan. Inténtalo de nuevo." } }, 500);
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
        return json(
          { error: { message: "Demasiadas peticiones al asistente. Inténtalo más tarde." } },
          429,
          { "Retry-After": "900" },
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
    return json({ error: { message: "JSON inválido" } }, 400);
  }

  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: { message: "Faltan 'messages'" } }, 400);
  }

  // La cuenta actual no tiene modelos de visión: mejor un error claro que uno del proveedor.
  if (JSON.stringify(messages).includes("image_url")) {
    return json({
      error: { message: "El escaneo de imágenes no está disponible con el proveedor actual." },
    }, 400);
  }

  const model = ALLOWED_MODELS.has(body?.model) ? body.model : DEFAULT_MODEL;
  const temperature = Math.min(Math.max(Number(body?.temperature ?? 0.1), 0), 1);
  const maxTokens = Math.min(Math.max(Number(body?.max_tokens ?? 2000), 1), 4096);

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
    return new Response(text, {
      status: upstream.status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("groq error", e);
    return json({ error: { message: "No se pudo contactar con el proveedor de IA." } }, 502);
  }
});
