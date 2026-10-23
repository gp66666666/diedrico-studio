/**
 * Utilidades compartidas por las Edge Functions de Paddle.
 *
 * El catálogo se configura UNA vez en la variable `PADDLE_CATALOG` y lo leen
 * las dos funciones: el checkout para saber el precio de cada pack y el webhook
 * para saber qué dar cuando Paddle avisa de un pago. Si se configurara por
 * separado, un día el precio y los créditos dejarían de coincidir.
 *
 *   PADDLE_CATALOG='{
 *     "pack100": {"price_id": "pri_...", "credits": 100},
 *     "pack300": {"price_id": "pri_...", "credits": 300},
 *     "monthly": {"price_id": "pri_...", "subscription": true},
 *     "profe-semestre": {"price_id": "pri_...", "class": {"perStudent":150,"maxUses":40,"months":6}},
 *     "profe-curso": {"price_id": "pri_...", "class": {"perStudent":300,"maxUses":40,"months":12}}
 *   }'
 */

export interface ClassPack {
    perStudent: number;
    maxUses: number;
    months: number;
}

export interface CatalogEntry {
    price_id: string;
    credits?: number;
    subscription?: boolean;
    class?: ClassPack;
}

export type Catalog = Record<string, CatalogEntry>;

export interface CatalogIndex {
    byPack: Catalog;
    /** Índice inverso: lo que llega en el webhook es el price_id. */
    byPrice: Map<string, CatalogEntry & { pack: string }>;
}

/** Lee `PADDLE_CATALOG`. Lanza si está mal: mejor fallar que acreditar de menos. */
export function readCatalog(): CatalogIndex {
    const raw = Deno.env.get('PADDLE_CATALOG') ?? '';
    let parsed: Catalog;
    try {
        parsed = JSON.parse(raw) as Catalog;
    } catch {
        throw new Error('PADDLE_CATALOG no es JSON válido');
    }
    const byPrice = new Map<string, CatalogEntry & { pack: string }>();
    for (const [pack, entry] of Object.entries(parsed)) {
        if (!entry?.price_id) throw new Error(`PADDLE_CATALOG.${pack} sin price_id`);
        byPrice.set(entry.price_id, { ...entry, pack });
    }
    return { byPack: parsed, byPrice };
}

/** Sandbox o live, según `PADDLE_ENV` (por defecto sandbox: nunca cobrar sin querer). */
export function apiBase(): string {
    return (Deno.env.get('PADDLE_ENV') ?? 'sandbox') === 'live'
        ? 'https://api.paddle.com'
        : 'https://sandbox-api.paddle.com';
}

export function json(body: unknown, status = 200, req?: Request): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...cors(req) },
    });
}

export function cors(req?: Request): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': req?.headers.get('origin') ?? '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        Vary: 'origin',
    };
}

export async function hmacHex(secret: string, payload: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Comparación en tiempo constante (no filtra la firma byte a byte). */
export function safeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

/** `Paddle-Signature: ts=1699999999;h1=abcdef...` */
export function parseSignatureHeader(header: string): { ts: string; h1: string } {
    const parts: Record<string, string> = {};
    for (const chunk of header.split(';')) {
        const [key, value] = chunk.split('=');
        if (key && value) parts[key.trim()] = value.trim();
    }
    return { ts: parts.ts ?? '', h1: (parts.h1 ?? '').toLowerCase() };
}

/** Cliente REST de Paddle (solo lo usa el webhook para consultar la transacción). */
export async function paddleGet(path: string): Promise<any> {
    const key = Deno.env.get('PADDLE_API_KEY') ?? '';
    if (!key) throw new Error('falta PADDLE_API_KEY');
    const res = await fetch(`${apiBase()}${path}`, {
        headers: { Authorization: `Bearer ${key}` },
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Paddle GET ${path} → ${res.status}: ${text}`);
    return text ? JSON.parse(text) : null;
}
