// Edge Function: ai-proxy
// Oculta la API key de Groq: el navegador llama aquí y esta función (servidor) llama a Groq.
// La clave vive en el secreto GROQ_API_KEY del proyecto, nunca en el bundle.
//
// Seguridad:
//  - Rate limit por IP (tabla public.ai_rate_limits + rpc check_ai_rate_limit).
//  - Lista blanca de modelos y límite de tokens para que no se use como API gratis.
//  - No requiere JWT (los invitados también usan el asistente).

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

  // ---- Rate limit por IP (la IP no se guarda en claro: solo su hash) ----
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
