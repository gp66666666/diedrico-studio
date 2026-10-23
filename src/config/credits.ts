/**
 * Packs de consultas. Se venden con Paddle, que actúa como vendedor (cobra el
 * IVA europeo y emite la factura). Nosotros solo acreditamos las consultas
 * cuando llega su webhook firmado.
 *
 * La tienda **no aparece** si `VITE_PAYMENTS_ENABLED` no vale "true": la web no
 * anuncia nada que no pueda cobrar.
 *
 * El precio no se envía al servidor: la función `paddle-checkout` lo resuelve
 * con su catálogo (`PADDLE_CATALOG`). Aquí solo viaja el identificador del pack.
 */
export interface CreditPack {
    /** Clave del catálogo del servidor (pack100, pack300…). */
    id: 'pack100' | 'pack300';
    credits: number;
    priceLabel: string;
}

export const CREDIT_PACKS: CreditPack[] = [
    { id: 'pack100', credits: 100, priceLabel: '4,99 €' },
    { id: 'pack300', credits: 300, priceLabel: '11,99 €' },
];

/** ¿Hay tienda configurada? Si no, no se pinta ningún botón de compra. */
export const creditsEnabled = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';

export interface CheckoutResult {
    checkoutUrl: string | null;
    transactionId: string | null;
}

/**
 * Pide al servidor la transacción (el precio lo pone él) y devuelve la URL de
 * pago de Paddle. Hay que estar con la sesión iniciada: el token va en la
 * cabecera y es lo que identifica al comprador.
 */
export async function startCheckout(
    pack: CreditPack,
    session: { accessToken: string },
): Promise<CheckoutResult> {
    const base = import.meta.env.VITE_SUPABASE_URL as string;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    const res = await fetch(`${base}/functions/v1/paddle-checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: anon,
            Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ pack: pack.id }),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
        const detail =
            typeof body?.detail === 'string'
                ? body.detail
                : body?.detail?.detail ?? body?.error ?? `HTTP ${res.status}`;
        throw new Error(String(detail));
    }
    if (!body?.checkoutUrl) throw new Error('Paddle no ha devuelto la página de pago');

    return { checkoutUrl: body.checkoutUrl, transactionId: body.transactionId ?? null };
}
