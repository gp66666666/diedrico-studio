// Cliente del proxy de IA (Edge Function de Supabase).
// La API key del proveedor (Groq) NO está en el navegador: vive como secreto
// en la función `ai-proxy`. Aquí solo se usa la anon key, que es pública.

const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/ai-proxy`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface AIProxyPayload {
    model?: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: unknown }>;
    temperature?: number;
    max_tokens?: number;
}

/**
 * Llama al proxy de IA y devuelve la `Response` en bruto (mismo formato que Groq),
 * para que los servicios que ya parsean `data.choices[0].message.content` no cambien.
 */
export async function callAIProxy(payload: AIProxyPayload): Promise<Response> {
    return fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: ANON_KEY,
            Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify(payload),
    });
}

export const AI_PROXY_MODEL = 'openai/gpt-oss-120b';
